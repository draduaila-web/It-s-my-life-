-- BERTH.A Helper RC363. Additive HML-only transport. No legacy policies/data changed.
create table public.bertha_hml_networks (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null unique references auth.users(id),
 name text not null check(length(name) between 1 and 120), created_at timestamptz not null default now()
);
create table public.bertha_hml_members (
 id uuid primary key default gen_random_uuid(), network_id uuid not null references public.bertha_hml_networks(id),
 local_id text not null, user_id uuid references auth.users(id), name text not null check(length(name) between 1 and 120),
 kind text not null default 'adult' check(kind='adult'), avatar_key text,
 active boolean not null default true, permissions jsonb not null default '{}',
 requires_validation boolean not null default false,
 unique(network_id,local_id), unique(network_id,user_id)
);
create table public.bertha_hml_links (
 id uuid primary key default gen_random_uuid(), member_id uuid not null references public.bertha_hml_members(id),
 email text not null, token uuid not null unique default gen_random_uuid(),
 expires_at timestamptz not null default now()+interval '7 days',
 accepted_by uuid references auth.users(id), accepted_at timestamptz, revoked_at timestamptz
);
create table public.bertha_hml_tasks (
 id uuid primary key default gen_random_uuid(), network_id uuid not null references public.bertha_hml_networks(id),
 source_ref text not null, title text not null check(length(title) between 1 and 300),
 area text not null default 'Casa', task_date date not null, targets uuid[] not null,
 responsibility text not null check(responsibility in ('help','delegated')),
 state text not null default 'available' check(state in ('available','assigned','accepted','in_progress','completed','validated')),
 actor_id uuid references public.bertha_hml_members(id), requires_validation boolean not null default false,
 started_at timestamptz, completed_at timestamptz, validated_at timestamptz,
 updated_at timestamptz not null default now(), unique(network_id,source_ref),
 check(cardinality(targets)>0)
);
create table public.bertha_hml_events (
 id uuid primary key default gen_random_uuid(), task_id uuid not null references public.bertha_hml_tasks(id),
 actor_user_id uuid not null references auth.users(id), action text not null,
 at timestamptz not null default now()
);
create index bertha_hml_members_user on public.bertha_hml_members(user_id);
create index bertha_hml_tasks_network_date on public.bertha_hml_tasks(network_id,task_date);
create index bertha_hml_links_member on public.bertha_hml_links(member_id);
create index bertha_hml_events_task on public.bertha_hml_events(task_id);

-- Private lookup functions deliberately bypass recursive RLS; never trust client role claims.
create function private.bertha_hml_owner(nid uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from public.bertha_hml_networks n where n.id=nid and n.owner_id=auth.uid());
$$;
create function private.bertha_hml_network_reader(nid uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and (private.bertha_hml_owner(nid) or exists(
 select 1 from public.bertha_hml_members m where m.network_id=nid and m.user_id=auth.uid() and m.active));
$$;
create function private.bertha_hml_task_reader(tid uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from public.bertha_hml_tasks t
 where t.id=tid and (private.bertha_hml_owner(t.network_id) or exists(
 select 1 from public.bertha_hml_members m where m.network_id=t.network_id
 and m.user_id=auth.uid() and m.active and m.kind='adult' and m.permissions->>'tasks'='true'
 and m.id=any(t.targets))));
$$;
alter table public.bertha_hml_networks enable row level security;
alter table public.bertha_hml_members enable row level security;
alter table public.bertha_hml_links enable row level security;
alter table public.bertha_hml_tasks enable row level security;
alter table public.bertha_hml_events enable row level security;
revoke all on public.bertha_hml_networks,public.bertha_hml_members,public.bertha_hml_links,public.bertha_hml_tasks,public.bertha_hml_events from public,anon,authenticated;
grant select on public.bertha_hml_networks,public.bertha_hml_members,public.bertha_hml_links,public.bertha_hml_tasks,public.bertha_hml_events to authenticated;
create policy hml_network_read on public.bertha_hml_networks for select to authenticated using(private.bertha_hml_network_reader(id));
create policy hml_member_read on public.bertha_hml_members for select to authenticated using(private.bertha_hml_owner(network_id) or ((select auth.uid())=user_id and active));
create policy hml_link_read on public.bertha_hml_links for select to authenticated using(exists(select 1 from public.bertha_hml_members m where m.id=member_id and private.bertha_hml_owner(m.network_id)));
create policy hml_task_read on public.bertha_hml_tasks for select to authenticated using(private.bertha_hml_task_reader(id));
create policy hml_event_read on public.bertha_hml_events for select to authenticated using(private.bertha_hml_task_reader(task_id));

-- Every write is a guarded operation. Locks prevent two people claiming the same task.
create function private.bertha_hml_operation(op text,arg jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); n public.bertha_hml_networks; m public.bertha_hml_members;
 l public.bertha_hml_links; t public.bertha_hml_tasks; ts uuid[]; em text; next_state text; perm jsonb;
begin
 if u is null then raise exception 'Entre na sua conta.' using errcode='42501'; end if;
 if not exists(select 1 from auth.users where id=u and email_confirmed_at is not null and coalesce(is_anonymous,false)=false) then
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
  select lower(email) into em from auth.users where id=u;
  if not m.active or em<>lower(l.email) or private.bertha_hml_owner(m.network_id)
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
  em=lower(trim(coalesce(arg->>'email','')));
  if m.id is null or em !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'Escolha um adulto e informe o e-mail dele.'; end if;
  if m.user_id is not null then raise exception 'Este cadastro já está vinculado.'; end if;
  update public.bertha_hml_links set revoked_at=now() where member_id=m.id and accepted_at is null and revoked_at is null;
  insert into public.bertha_hml_links(member_id,email) values(m.id,em) returning * into l;
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
create function public.bertha_hml_action(op text,arg jsonb) returns jsonb
language sql security invoker set search_path='' as $$
 select private.bertha_hml_operation(op,arg);
$$;
revoke all on function private.bertha_hml_owner(uuid),private.bertha_hml_network_reader(uuid),private.bertha_hml_task_reader(uuid),private.bertha_hml_operation(text,jsonb),public.bertha_hml_action(text,jsonb) from public,anon;
grant usage on schema private to authenticated;
grant execute on function private.bertha_hml_owner(uuid),private.bertha_hml_network_reader(uuid),private.bertha_hml_task_reader(uuid),private.bertha_hml_operation(text,jsonb),public.bertha_hml_action(text,jsonb) to authenticated;
comment on table public.bertha_hml_tasks is 'RC363: transport only, isolated HML. No writes to legacy Owner engine or automatic awards.';
