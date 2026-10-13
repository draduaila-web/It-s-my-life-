-- RC366 candidate. Existing IDs, invitations and role/content rules are preserved.
-- Does not enable Phone Auth or configure/pay for SMS. Activation needs a real provider.
alter table public.bertha_hml_links add column phone text;
alter table public.bertha_hml_links alter column email drop not null;
alter table public.bertha_hml_links add constraint hml_link_contact_one check (
 (email is not null and phone is null) or (email is null and phone is not null and phone ~ '^[+][1-9][0-9]{7,14}$'));
create or replace function private.bertha_hml_operation(op text,arg jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); n public.bertha_hml_networks; m public.bertha_hml_members;
 l public.bertha_hml_links; t public.bertha_hml_tasks; ts uuid[]; em text; next_state text; perm jsonb; ph text;
begin
 if u is null then raise exception 'Entre na sua conta.' using errcode='42501'; end if;
 if not exists(select 1 from auth.users where id=u and (email_confirmed_at is not null or phone_confirmed_at is not null) and coalesce(is_anonymous,false)=false) then
 raise exception 'Confirme seu e-mail antes de conectar.' using errcode='42501'; end if;
 if op='network' then
  insert into public.bertha_hml_networks(owner_id,name) values(u,'Minha rede BERTH.A')
  on conflict(owner_id) do nothing;
  select * into n from public.bertha_hml_networks where owner_id=u;
  return to_jsonb(n);
 end if;
 if op='link_accept' then
  select * into l from public.bertha_hml_links where token=(arg->>'token')::uuid for update;
  if l.id is null or l.revoked_at is not null or l.expires_at<=now() then raise exception 'Vínculo inválido ou expirado.'; end if;
  select * into m from public.bertha_hml_members where id=l.member_id for update;
  select lower(email),case when phone_confirmed_at is not null then '+'||ltrim(phone,'+') end into em,ph from auth.users where id=u;
  if not m.active or (case when l.phone is not null then ph is distinct from l.phone else em is distinct from lower(l.email) end) or private.bertha_hml_owner(m.network_id)
  or (m.user_id is not null and m.user_id<>u) or (l.accepted_by is not null and l.accepted_by<>u) then
   raise exception 'Este vínculo não está disponível para sua conta.' using errcode='42501';
  end if;
  update public.bertha_hml_members set user_id=u where id=m.id returning * into m;
  update public.bertha_hml_links set accepted_by=u,accepted_at=coalesce(accepted_at,now()) where id=l.id;
  return to_jsonb(m);
 end if;
 if op in ('member','link','share','validate','pause','resume') then
  select * into n from public.bertha_hml_networks where id=(arg->>'network_id')::uuid and owner_id=u;
  if n.id is null then raise exception 'Somente o Owner desta rede pode fazer isso.' using errcode='42501'; end if;
 end if;
 if op='pause' then
  update public.bertha_hml_members set active=false where id=(arg->>'member_id')::uuid and network_id=n.id returning * into m;
  if m.id is null then raise exception 'Cadastro indisponível.'; end if;
  update public.bertha_hml_links set revoked_at=now() where member_id=m.id and revoked_at is null;
  return to_jsonb(m);
 end if;
 if op='resume' then
  update public.bertha_hml_members set active=true where id=(arg->>'member_id')::uuid and network_id=n.id returning * into m;
  if m.id is null then raise exception 'Cadastro indisponível.'; end if;
  return to_jsonb(m);
 end if;
 if op='member' then
  if length(trim(coalesce(arg->>'local_id','')))=0 or length(trim(coalesce(arg->>'name','')))=0 then raise exception 'Cadastro incompleto.'; end if;
  perm=jsonb_build_object('tasks',arg->'permissions'->'tasks'='true'::jsonb);
  insert into public.bertha_hml_members(network_id,local_id,name,avatar_key,permissions,requires_validation)
  values(n.id,arg->>'local_id',trim(arg->>'name'),arg->>'avatar_key',perm,coalesce((arg->>'requires_validation')::boolean,false))
  on conflict(network_id,local_id) do update set name=excluded.name,avatar_key=excluded.avatar_key,
  permissions=excluded.permissions,requires_validation=excluded.requires_validation returning * into m;
  return to_jsonb(m);
 end if;
 if op='link' then
  select * into m from public.bertha_hml_members where id=(arg->>'member_id')::uuid and network_id=n.id and active for update;
  if m.id is null or m.user_id is not null then raise exception 'Cadastro indisponível para novo vínculo.';end if;
  ph=nullif(trim(arg->>'phone'),'');em=nullif(lower(trim(arg->>'email')),'');
  if ph is not null then
   if em is not null or ph !~ '^[+][1-9][0-9]{7,14}$' then raise exception 'Informe somente o celular com código do país.';end if;
  elsif em is null or em !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$' then
   raise exception 'Informe o contato para o vínculo.';
  end if;
  update public.bertha_hml_links set revoked_at=now() where member_id=m.id and accepted_at is null and revoked_at is null;
  insert into public.bertha_hml_links(member_id,email,phone) values(m.id,em,ph) returning * into l;
  return to_jsonb(l);
 end if;
 if op='share' then
  select coalesce(array_agg(distinct value::uuid),'{}'::uuid[]) into ts from jsonb_array_elements_text(arg->'targets');
  if cardinality(ts)=0 or exists(select 1 from unnest(ts) target where not exists(
    select 1 from public.bertha_hml_members where id=target and network_id=n.id and active and permissions->>'tasks'='true')) then
   raise exception 'Selecione destinatários com permissão para tarefas.' using errcode='42501'; end if;
  if arg->>'responsibility' not in ('help','delegated') or length(trim(coalesce(arg->>'source_ref','')))=0 then raise exception 'Atividade inválida.'; end if;
  insert into public.bertha_hml_tasks(network_id,source_ref,title,area,task_date,targets,responsibility,state,requires_validation)
  values(n.id,arg->>'source_ref',trim(arg->>'title'),coalesce(arg->>'area','Casa'),(arg->>'task_date')::date,ts,
   arg->>'responsibility',case when arg->>'responsibility'='help' then 'available' else 'assigned' end,
   coalesce((arg->>'requires_validation')::boolean,false))
  on conflict(network_id,source_ref) do update set
   targets=(select array_agg(distinct x) from unnest(public.bertha_hml_tasks.targets||excluded.targets) x),
   requires_validation=public.bertha_hml_tasks.requires_validation or excluded.requires_validation,
   updated_at=now() returning * into t;
  if t.id is null then select * into t from public.bertha_hml_tasks where network_id=n.id and source_ref=arg->>'source_ref'; end if;
  return to_jsonb(t);
 end if;
 if op in ('claim','start','complete','validate') then
  select * into t from public.bertha_hml_tasks where id=(arg->>'task_id')::uuid for update;
  if t.id is null or not private.bertha_hml_task_reader(t.id) then raise exception 'Atividade indisponível.' using errcode='42501'; end if;
  if op='validate' then
   if t.network_id<>n.id or t.state not in ('completed','validated') then raise exception 'Esta atividade ainda não aguarda validação.'; end if;
   if t.state='validated' then return to_jsonb(t); end if;
   next_state='validated';
  else
   select * into m from public.bertha_hml_members where network_id=t.network_id and user_id=u and active and kind='adult';
   if m.id is null or not(m.id=any(t.targets)) or m.permissions->>'tasks' is distinct from 'true' then raise exception 'Sem permissão.' using errcode='42501'; end if;
   if t.actor_id is not null and t.actor_id<>m.id then raise exception 'Outra pessoa já assumiu esta atividade.'; end if;
   if op='claim' then
    if t.actor_id=m.id and t.state in ('accepted','in_progress','completed','validated') then return to_jsonb(t); end if;
    if t.state not in ('available','assigned') then raise exception 'Atividade indisponível.'; end if;
    next_state='accepted';
   elsif op='start' then
    if t.actor_id=m.id and t.state='in_progress' then return to_jsonb(t); end if;
    if t.actor_id is distinct from m.id or t.state<>'accepted' then raise exception 'Assuma a atividade antes de iniciar.'; end if;
    next_state='in_progress';
   else
    if t.actor_id=m.id and t.state in ('completed','validated') then return to_jsonb(t); end if;
    if t.actor_id is distinct from m.id or t.state<>'in_progress' then raise exception 'Inicie a atividade antes de concluir.'; end if;
    next_state=case when t.requires_validation or m.requires_validation then 'completed' else 'validated' end;
   end if;
  end if;
  update public.bertha_hml_tasks set state=next_state,actor_id=coalesce(actor_id,m.id),
   started_at=case when op='start' then now() else started_at end,
   completed_at=case when op='complete' then now() else completed_at end,
   validated_at=case when next_state='validated' then now() else validated_at end,updated_at=now()
   where id=t.id returning * into t;
  insert into public.bertha_hml_events(task_id,actor_user_id,action) values(t.id,u,op);
  return to_jsonb(t);
 end if;
 raise exception 'Operação inválida.';
end;
$$;

-- Do not allow phone-only users to bypass the existing social API's confirmed-account guard.
do $upgrade$
declare definition text;
begin
 if to_regprocedure('private.bertha_hml_social_operation(text,jsonb)') is not null then
  select pg_get_functiondef(to_regprocedure('private.bertha_hml_social_operation(text,jsonb)')) into definition;
  if position('email_confirmed_at is not null and not coalesce(is_anonymous,false)' in definition)=0 then raise exception 'Unexpected social confirmation guard; inspect before changing.';end if;
  execute replace(definition,'email_confirmed_at is not null and not coalesce(is_anonymous,false)','(email_confirmed_at is not null or phone_confirmed_at is not null) and not coalesce(is_anonymous,false)');
 end if;
end;
$upgrade$;
create function public.bertha_hml_phone_ready() returns boolean language sql security invoker set search_path='' as $$select true;$$;
revoke all on function public.bertha_hml_phone_ready() from public;
grant execute on function public.bertha_hml_phone_ready() to anon,authenticated;
