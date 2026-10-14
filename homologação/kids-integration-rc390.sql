CREATE OR REPLACE FUNCTION private.bertha_hml_participant(nid uuid, uid uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
 select auth.uid() is not null and uid is not null and exists(select 1 from public.bertha_hml_networks n where n.id=nid and
 (n.owner_id=uid or exists(select 1 from public.bertha_hml_members m where m.network_id=n.id and m.user_id=uid and m.active and m.kind in ('adult','kids'))));
$function$;

CREATE OR REPLACE FUNCTION private.bertha_hml_sync_tasks(arg jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare nid uuid:=(arg->>'network_id')::uuid; item jsonb; targets uuid[]; refs text[]:='{}';
begin
 if auth.uid() is null or not private.bertha_hml_owner(nid) then raise exception 'Somente o Owner pode compartilhar atividades.' using errcode='42501'; end if;
 if jsonb_typeof(arg->'tasks') is distinct from 'array' or jsonb_array_length(arg->'tasks')>1000 then raise exception 'Lista de atividades inválida.'; end if;
 for item in select value from jsonb_array_elements(arg->'tasks') loop
  select array_agg(distinct x::uuid) into targets from jsonb_array_elements_text(item->'targets') x;
  if coalesce(cardinality(targets),0)=0 or exists(select 1 from unnest(targets) x where not exists(select 1 from public.bertha_hml_members m where m.id=x and m.network_id=nid and m.active and m.kind in ('adult','kids') and m.permissions->>'tasks'='true')) then raise exception 'Destinatários sem permissão.' using errcode='42501'; end if;
  if length(coalesce(item->>'source_ref','')) not between 1 and 400 or item->>'responsibility' not in ('help','delegated') then raise exception 'Atividade inválida.'; end if;
  refs:=array_append(refs,item->>'source_ref');
  insert into public.bertha_hml_tasks(network_id,source_ref,title,area,task_date,targets,responsibility,state,requires_validation)
  values(nid,item->>'source_ref',item->>'title',coalesce(item->>'area','Casa'),(item->>'task_date')::date,targets,item->>'responsibility',case when item->>'responsibility'='help' then 'available' else 'assigned' end,coalesce((item->>'requires_validation')::boolean,false))
  on conflict(network_id,source_ref) do update set title=excluded.title,area=excluded.area,targets=excluded.targets,responsibility=excluded.responsibility,requires_validation=excluded.requires_validation,withdrawn=false;
 end loop;
 update public.bertha_hml_tasks set withdrawn=true where network_id=nid and not(source_ref=any(refs)) and state in ('available','assigned','accepted','in_progress');
 return jsonb_build_object('shared',cardinality(refs));
end;$function$;

CREATE OR REPLACE FUNCTION private.bertha_hml_task_reader(tid uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
 select auth.uid() is not null and exists(select 1 from public.bertha_hml_tasks t where t.id=tid and (private.bertha_hml_owner(t.network_id) or (not t.withdrawn and exists(select 1 from public.bertha_hml_members m where m.network_id=t.network_id and m.user_id=auth.uid() and m.active and m.kind in ('adult','kids') and m.permissions->>'tasks'='true' and m.id=any(t.targets)))));
$function$;

CREATE OR REPLACE FUNCTION private.bertha_hml_social_operation(op text, arg jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare u uuid:=auth.uid(); nid uuid:=(arg->>'network_id')::uuid; a uuid; b uuid; cid uuid;
 n public.bertha_hml_networks; c public.bertha_hml_conversations; msg public.bertha_hml_messages;
 s private.bertha_hml_locations; rs uuid[]; duration int; result jsonb;
begin
 if u is null or not exists(select 1 from auth.users where id=u and email_confirmed_at is not null and not coalesce(is_anonymous,false)) then
 raise exception 'Entre com sua conta confirmada.' using errcode='42501'; end if;
 if op in ('send','block') then
  select * into c from public.bertha_hml_conversations where id=(arg->>'conversation_id')::uuid for update;
  nid:=c.network_id;
 end if;
 if not private.bertha_hml_participant(nid,u) then raise exception 'Rede indisponível.' using errcode='42501'; end if;
 select * into n from public.bertha_hml_networks where id=nid;
 if op like 'location_%' and (exists(select 1 from public.bertha_hml_members where network_id=nid and user_id=u and kind='kids') or exists(select 1 from public.bertha_hml_members where network_id=nid and kind='kids' and user_id in ((arg->>'sharer_id')::uuid,(arg->>'viewer_id')::uuid))) then raise exception 'Localização Kids não está disponível nesta versão.' using errcode='42501'; end if;
 if op='directory' then
  -- Only names and endpoint IDs: no email, token or adult private message disclosure to Owner.
  select jsonb_agg(p) into result from (
   select n.owner_id user_id,'Owner'::text name,true is_owner
   union all select user_id,name,false from public.bertha_hml_members where network_id=nid and active and user_id is not null and (n.owner_id=u or user_id=u or (kind='adult' and not exists(select 1 from public.bertha_hml_members self where self.network_id=nid and self.user_id=u and self.kind='kids')) or exists(select 1 from public.bertha_hml_conversations cv where cv.network_id=nid and cv.allowed and u in(cv.user_a,cv.user_b) and user_id in(cv.user_a,cv.user_b)))
  ) p; return coalesce(result,'[]');
 end if;
 if op in ('open','communication') then
  a:=least((arg->>'user_a')::uuid,(arg->>'user_b')::uuid); b:=greatest((arg->>'user_a')::uuid,(arg->>'user_b')::uuid);
  if a is null or b is null or a=b or not private.bertha_hml_participant(nid,a) or not private.bertha_hml_participant(nid,b) then
   raise exception 'Participantes indisponíveis.' using errcode='42501'; end if;
  if op='communication' then
   if n.owner_id<>u or n.owner_id in(a,b) then raise exception 'Esta permissão é para duplas de satélites da sua rede.' using errcode='42501'; end if;
   insert into public.bertha_hml_conversations(network_id,user_a,user_b,allowed) values(nid,a,b,coalesce((arg->>'allowed')::boolean,false))
   on conflict(network_id,user_a,user_b) do update set allowed=excluded.allowed returning * into c;
   return jsonb_build_object('allowed',c.allowed); -- Owner gets no conversation content or ID.
  end if;
  if u not in(a,b) then raise exception 'Esta conversa é privada.' using errcode='42501'; end if;
  if n.owner_id in(a,b) then
   insert into public.bertha_hml_conversations(network_id,user_a,user_b,allowed) values(nid,a,b,true)
   on conflict(network_id,user_a,user_b) do nothing;
  end if;
  select * into c from public.bertha_hml_conversations where network_id=nid and user_a=a and user_b=b;
  if c.id is null then raise exception 'O Owner ainda não autorizou esta dupla.' using errcode='42501'; end if;
  return to_jsonb(c);
 end if;
 if op='permissions' then
  if n.owner_id<>u then raise exception 'Somente o Owner configura a rede.' using errcode='42501';end if;
  select jsonb_agg(jsonb_build_object('user_a',user_a,'user_b',user_b,'allowed',allowed)) into result
  from public.bertha_hml_conversations where network_id=nid and n.owner_id not in(user_a,user_b);
  return coalesce(result,'[]');
 end if;
 if op='block' then
  if not private.bertha_hml_conversation_reader(c.id) then raise exception 'Conversa indisponível.' using errcode='42501';end if;
  update public.bertha_hml_conversations set blocked_by=case when (arg->>'blocked')::boolean then
  array(select distinct x from unnest(blocked_by||array[u]) x) else array_remove(blocked_by,u) end where id=c.id returning * into c;
  return to_jsonb(c);
 end if;
 if op='send' then
  if not private.bertha_hml_conversation_reader(c.id) or not private.bertha_hml_participant(nid,c.user_a)
  or not private.bertha_hml_participant(nid,c.user_b) or not c.allowed or cardinality(c.blocked_by)>0 then
  raise exception 'Novos envios estão bloqueados. O histórico permanece disponível aos participantes ativos.' using errcode='42501'; end if;
  cid:=(arg->>'client_id')::uuid;
  select * into msg from public.bertha_hml_messages where sender_id=u and client_id=cid;
  if msg.id is not null then
   if msg.conversation_id<>c.id or msg.body<>trim(arg->>'body') then raise exception 'Identificador de envio já utilizado.';end if;
   return to_jsonb(msg);
  end if;
  insert into public.bertha_hml_messages(conversation_id,sender_id,client_id,body) values(c.id,u,cid,trim(arg->>'body'))
  on conflict(sender_id,client_id) do nothing returning * into msg;
  if msg.id is null then select * into msg from public.bertha_hml_messages where sender_id=u and client_id=cid;end if;
  if msg.conversation_id<>c.id or msg.body<>trim(arg->>'body') then raise exception 'Identificador de envio já utilizado.';end if;
  return to_jsonb(msg);
 end if;
 if op='location_grant' then
  if n.owner_id<>u then raise exception 'Somente o Owner autoriza destinatários.' using errcode='42501';end if;
  a:=(arg->>'sharer_id')::uuid;b:=(arg->>'viewer_id')::uuid;
  if a=b or not private.bertha_hml_participant(nid,a) or not private.bertha_hml_participant(nid,b) then raise exception 'Dupla indisponível.' using errcode='42501';end if;
  insert into public.bertha_hml_location_grants(network_id,sharer_id,viewer_id,allowed) values(nid,a,b,coalesce((arg->>'allowed')::boolean,false))
  on conflict(network_id,sharer_id,viewer_id) do update set allowed=excluded.allowed;
  -- Revocation also removes existing recipient consent. Regrant never resumes it silently.
  if not coalesce((arg->>'allowed')::boolean,false) then
   update private.bertha_hml_locations set recipients=array_remove(recipients,b) where network_id=nid and sharer_id=a;
   update private.bertha_hml_locations set stopped_at=now(),latitude=null,longitude=null,accuracy=null,updated_at=null
   where network_id=nid and sharer_id=a and cardinality(recipients)=0;
  end if;
  return jsonb_build_object('allowed',coalesce((arg->>'allowed')::boolean,false));
 end if;
 if op='location_start' then
  select coalesce(array_agg(distinct x::uuid),'{}'::uuid[]) into rs from jsonb_array_elements_text(arg->'recipients') x;
  duration:=(arg->>'minutes')::int;
  if duration is null or duration not in(15,30,60) or cardinality(rs)=0 or cardinality(rs)>30 or exists(
   select 1 from unnest(rs) r where not private.bertha_hml_participant(nid,r) or not exists(
   select 1 from public.bertha_hml_location_grants g where g.network_id=nid and g.sharer_id=u and g.viewer_id=r and g.allowed)) then
   raise exception 'Escolha destinatários autorizados e uma duração.' using errcode='42501';end if;
  insert into private.bertha_hml_locations(network_id,sharer_id,recipients,expires_at) values(nid,u,rs,now()+make_interval(mins=>duration))
  on conflict(network_id,sharer_id) do update set recipients=excluded.recipients,expires_at=excluded.expires_at,
  stopped_at=null,latitude=null,longitude=null,accuracy=null,updated_at=null returning * into s;
  return jsonb_build_object('expires_at',s.expires_at);
 end if;
 if op='location_stop' then
  update private.bertha_hml_locations set stopped_at=now(),latitude=null,longitude=null,accuracy=null,updated_at=null
  where network_id=nid and sharer_id=u;
  return jsonb_build_object('stopped',true);
 end if;
 if op='location_update' then
  select * into s from private.bertha_hml_locations where network_id=nid and sharer_id=u for update;
  if s.sharer_id is null or s.stopped_at is not null or s.expires_at<=now() then raise exception 'Compartilhamento encerrado.' using errcode='42501';end if;
  if not exists(select 1 from unnest(s.recipients) r where private.bertha_hml_participant(nid,r) and exists(
    select 1 from public.bertha_hml_location_grants g where g.network_id=nid and g.sharer_id=u and g.viewer_id=r and g.allowed)) then
   raise exception 'Não há destinatários autorizados.' using errcode='42501';end if;
  if s.updated_at>now()-interval '10 seconds' then return jsonb_build_object('updated_at',s.updated_at);end if;
  if arg->>'latitude' is null or arg->>'longitude' is null or arg->>'accuracy' is null then raise exception 'Posição indisponível.';end if;
  update private.bertha_hml_locations set latitude=(arg->>'latitude')::float8,longitude=(arg->>'longitude')::float8,
  accuracy=(arg->>'accuracy')::float8,updated_at=now() where network_id=nid and sharer_id=u returning * into s;
  return jsonb_build_object('updated_at',s.updated_at);
 end if;
 if op='location_read' then
  select coalesce(jsonb_agg(jsonb_build_object('sharer_id',loc.sharer_id,'expires_at',loc.expires_at,
   'state',case when loc.stopped_at is not null or loc.expires_at<=now() then 'ended'
   when loc.updated_at is null then 'unavailable' when loc.updated_at<now()-interval '60 seconds' then 'stale' else 'current' end,
   'updated_at',loc.updated_at,
   'latitude',case when loc.stopped_at is null and loc.expires_at>now() and loc.updated_at>now()-interval '2 minutes' then loc.latitude end,
   'longitude',case when loc.stopped_at is null and loc.expires_at>now() and loc.updated_at>now()-interval '2 minutes' then loc.longitude end,
   'accuracy',case when loc.stopped_at is null and loc.expires_at>now() and loc.updated_at>now()-interval '2 minutes' then loc.accuracy end)), '[]') into result
  from private.bertha_hml_locations loc where loc.network_id=nid and private.bertha_hml_participant(nid,loc.sharer_id)
  and (loc.sharer_id=u or (u=any(loc.recipients) and exists(select 1 from public.bertha_hml_location_grants g
  where g.network_id=nid and g.sharer_id=loc.sharer_id and g.viewer_id=u and g.allowed)));
  return result;
 end if;
 raise exception 'Operação inválida.';
end;
$function$;

create table public.bertha_hml_kids_profiles(
 member_id uuid primary key references public.bertha_hml_members(id) on delete cascade,
 network_id uuid not null references public.bertha_hml_networks(id) on delete cascade,
 snapshot jsonb not null default '{}'::jsonb check(jsonb_typeof(snapshot)='object' and octet_length(snapshot::text)<100000),
 updated_at timestamptz not null default now()
);
alter table public.bertha_hml_kids_profiles enable row level security;
create policy kids_profile_read on public.bertha_hml_kids_profiles for select to authenticated using(private.bertha_hml_owner(network_id) or exists(select 1 from public.bertha_hml_members m where m.id=member_id and m.network_id=bertha_hml_kids_profiles.network_id and m.user_id=(select auth.uid()) and m.kind='kids' and m.active));
create policy kids_profile_write on public.bertha_hml_kids_profiles for insert to authenticated with check(private.bertha_hml_owner(network_id) and exists(select 1 from public.bertha_hml_members m where m.id=member_id and m.network_id=bertha_hml_kids_profiles.network_id and m.kind='kids' and m.active));
create policy kids_profile_update on public.bertha_hml_kids_profiles for update to authenticated using(private.bertha_hml_owner(network_id)) with check(private.bertha_hml_owner(network_id) and exists(select 1 from public.bertha_hml_members m where m.id=member_id and m.network_id=bertha_hml_kids_profiles.network_id and m.kind='kids' and m.active));
grant select,insert,update on public.bertha_hml_kids_profiles to authenticated;
create index kids_profiles_network_idx on public.bertha_hml_kids_profiles(network_id);
create function public.bertha_hml_kids_profile(arg jsonb) returns jsonb language plpgsql set search_path='' as $fn$
declare r public.bertha_hml_kids_profiles;
begin
 insert into public.bertha_hml_kids_profiles(member_id,network_id,snapshot) values((arg->>'member_id')::uuid,(arg->>'network_id')::uuid,arg->'snapshot')
 on conflict(member_id) do update set snapshot=excluded.snapshot,updated_at=now() returning * into r;
 return to_jsonb(r);
end;$fn$;
revoke all on function public.bertha_hml_kids_profile(jsonb) from public,anon;
grant execute on function public.bertha_hml_kids_profile(jsonb) to authenticated;
create function private.bertha_hml_kids_action(op text,arg jsonb) returns jsonb language plpgsql security definer set search_path='' as $fn$
declare m public.bertha_hml_members;t public.bertha_hml_tasks;s text;
begin
 if auth.uid() is null then raise exception 'Conecte seu espaço.' using errcode='42501';end if;
 select * into t from public.bertha_hml_tasks where id=(arg->>'task_id')::uuid for update;
 select * into m from public.bertha_hml_members where network_id=t.network_id and user_id=auth.uid() and active and kind='kids' and permissions->>'tasks'='true' and id=any(t.targets);
 if t.id is null or t.withdrawn or m.id is null then raise exception 'Missão indisponível.' using errcode='42501';end if;
 if t.actor_id is not null and t.actor_id<>m.id then raise exception 'Outra pessoa já assumiu esta missão.';end if;
 if op='claim' then
  if t.actor_id=m.id and t.state in ('accepted','in_progress','completed','validated') then return to_jsonb(t);end if;
  if t.state not in ('available','assigned') then raise exception 'Missão indisponível.';end if;s:='accepted';
 elsif op='start' then
  if t.actor_id=m.id and t.state='in_progress' then return to_jsonb(t);end if;
  if t.actor_id is distinct from m.id or t.state<>'accepted' then raise exception 'Escolha a missão antes de começar.';end if;s:='in_progress';
 elsif op='complete' then
  if t.actor_id=m.id and t.state in ('completed','validated') then return to_jsonb(t);end if;
  if t.actor_id is distinct from m.id or t.state<>'in_progress' then raise exception 'Comece a missão antes de concluir.';end if;s:='completed';
 else raise exception 'Ação indisponível.';end if;
 update public.bertha_hml_tasks set state=s,actor_id=m.id,started_at=case when op='start' then now() else started_at end,completed_at=case when op='complete' then now() else completed_at end,updated_at=now() where id=t.id returning * into t;
 insert into public.bertha_hml_events(task_id,actor_user_id,action) values(t.id,auth.uid(),op);
 return to_jsonb(t);
end;$fn$;
revoke all on function private.bertha_hml_kids_action(text,jsonb) from public,anon,authenticated;
create function public.bertha_hml_kids_action(op text,arg jsonb) returns jsonb language sql set search_path='' as $fn$select private.bertha_hml_kids_action(op,arg);$fn$;
revoke all on function public.bertha_hml_kids_action(text,jsonb) from public,anon;
grant execute on function private.bertha_hml_kids_action(text,jsonb),public.bertha_hml_kids_action(text,jsonb) to authenticated;

