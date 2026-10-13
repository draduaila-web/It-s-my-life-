-- Additive HML-only invitation transport. Existing identities and email links remain valid.
alter table public.bertha_hml_members drop constraint bertha_hml_members_kind_check;
alter table public.bertha_hml_members add constraint bertha_hml_members_kind_check check(kind in ('adult','kids'));
create table private.bertha_hml_code_accounts (
 user_id uuid primary key references auth.users(id), member_id uuid not null unique references public.bertha_hml_members(id)
);
create table private.bertha_hml_codes (
 id uuid primary key default gen_random_uuid(),member_id uuid not null references public.bertha_hml_members(id),
 code_hash text not null unique check(code_hash ~ '^[0-9a-f]{64}$'),
 expires_at timestamptz not null default now()+interval '7 days',revoked_at timestamptz,
 claimed_at timestamptz,nonce_hash text,created_at timestamptz not null default now()
);
create index on private.bertha_hml_codes(member_id);
create table private.bertha_hml_code_limits (key text primary key,hits int not null,expires_at timestamptz not null);
alter table private.bertha_hml_code_accounts enable row level security;
alter table private.bertha_hml_codes enable row level security;
alter table private.bertha_hml_code_limits enable row level security;
revoke all on private.bertha_hml_code_accounts,private.bertha_hml_codes,private.bertha_hml_code_limits from public,anon,authenticated;
create policy code_accounts_deny on private.bertha_hml_code_accounts for all to anon,authenticated using(false) with check(false);
create policy codes_deny on private.bertha_hml_codes for all to anon,authenticated using(false) with check(false);
create policy code_limits_deny on private.bertha_hml_code_limits for all to anon,authenticated using(false) with check(false);
-- Code principals cannot promote themselves to an Owner, including via legacy writes.
alter function private.bertha_hml_operation(text,jsonb) rename to bertha_hml_operation_rc363;
revoke all on function private.bertha_hml_operation_rc363(text,jsonb) from public,anon,authenticated;
create function private.bertha_hml_operation(op text,arg jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb;
begin
 if op in ('network','member','link','share','validate','pause','resume') and exists(
 select 1 from private.bertha_hml_code_accounts where user_id=auth.uid()) then
 raise exception 'Somente o Owner pode organizar a rede.' using errcode='42501';end if;
 result:=private.bertha_hml_operation_rc363(op,arg);
 if op='pause' then update private.bertha_hml_codes set revoked_at=now() where member_id=(result->>'id')::uuid and revoked_at is null;end if;
 return result;
end;$$;
revoke all on function private.bertha_hml_operation(text,jsonb) from public,anon;
grant execute on function private.bertha_hml_operation(text,jsonb) to authenticated;
create function private.bertha_hml_invite_prepare(arg jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid();n public.bertha_hml_networks;m public.bertha_hml_members;k text:=arg->>'kind';
begin
 if u is null or not exists(select 1 from auth.users where id=u and email_confirmed_at is not null and not coalesce(is_anonymous,false))
 or exists(select 1 from private.bertha_hml_code_accounts where user_id=u) then raise exception 'Conecte a conta do Owner para convidar.' using errcode='42501';end if;
 if k not in ('adult','kids') or length(trim(coalesce(arg->>'local_id','')))=0 or length(trim(coalesce(arg->>'name','')))=0 or length(arg->>'name')>120 then raise exception 'Cadastro incompleto.';end if;
 insert into public.bertha_hml_networks(owner_id,name) values(u,'Minha rede BERTH.A') on conflict(owner_id) do nothing;
 select * into n from public.bertha_hml_networks where owner_id=u;
 select * into m from public.bertha_hml_members where network_id=n.id and local_id=arg->>'local_id' for update;
 if m.id is not null and m.kind<>k and m.user_id is not null then raise exception 'Este perfil já está conectado. Preserve seu tipo de acesso.';end if;
 if m.id is not null and not m.active then raise exception 'Este acesso está pausado. Retome-o antes de convidar.';end if;
 insert into public.bertha_hml_members(network_id,local_id,name,kind,avatar_key,permissions,requires_validation)
 values(n.id,arg->>'local_id',trim(arg->>'name'),k,arg->>'avatar_key',jsonb_build_object('tasks',coalesce((arg->'permissions'->>'casa')::boolean,false)),k='kids' or coalesce((arg->>'requires_validation')::boolean,false))
 on conflict(network_id,local_id) do update set name=excluded.name,kind=excluded.kind,avatar_key=excluded.avatar_key,permissions=excluded.permissions,requires_validation=excluded.requires_validation returning * into m;
 return to_jsonb(m);
end;$$;
revoke all on function private.bertha_hml_invite_prepare(jsonb) from public,anon;
grant execute on function private.bertha_hml_invite_prepare(jsonb) to authenticated;
create function public.bertha_hml_invite_prepare(arg jsonb) returns jsonb language sql security invoker set search_path='' as $$select private.bertha_hml_invite_prepare(arg);$$;
revoke all on function public.bertha_hml_invite_prepare(jsonb) from public,anon;
grant execute on function public.bertha_hml_invite_prepare(jsonb) to authenticated;
create function private.bertha_hml_code_service(op text,arg jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare m public.bertha_hml_members;c private.bertha_hml_codes;a private.bertha_hml_code_accounts;hits int;uid uuid;em text;lim text;
begin
 if coalesce(auth.jwt()->>'role','')<>'service_role' then raise exception 'Acesso indisponível.' using errcode='42501';end if;
 if op='issue' then
  select * into m from public.bertha_hml_members where id=(arg->>'member_id')::uuid and active for update;
  if m.id is null or not exists(select 1 from public.bertha_hml_networks where id=m.network_id and owner_id=(arg->>'owner_id')::uuid)
  or exists(select 1 from private.bertha_hml_code_accounts where user_id=(arg->>'owner_id')::uuid) then raise exception 'Sem permissão para convidar.' using errcode='42501';end if;
  uid:=(arg->>'user_id')::uuid;
  if m.user_id is not null and not exists(select 1 from private.bertha_hml_code_accounts where user_id=m.user_id and member_id=m.id) then
   raise exception 'Este perfil já usa uma conta por e-mail. Seu acesso foi preservado.';end if;
  if not exists(select 1 from auth.users where id=uid and raw_app_meta_data->>'bertha_code_member'=m.id::text) then raise exception 'Conta do convite inválida.';end if;
  if m.user_id is not null and m.user_id<>uid then raise exception 'A conta do perfil mudou.';end if;
  insert into private.bertha_hml_code_accounts(user_id,member_id) values(uid,m.id) on conflict(member_id) do nothing;
  update public.bertha_hml_members set user_id=uid where id=m.id;
  update private.bertha_hml_codes set revoked_at=now() where member_id=m.id and revoked_at is null;
  insert into private.bertha_hml_codes(member_id,code_hash) values(m.id,arg->>'code_hash') returning * into c;
  return jsonb_build_object('id',c.id,'expires_at',c.expires_at,'name',m.name,'kind',m.kind);
 elsif op='revoke' then
  select * into m from public.bertha_hml_members where id=(arg->>'member_id')::uuid for update;
  if not exists(select 1 from public.bertha_hml_networks where id=m.network_id and owner_id=(arg->>'owner_id')::uuid) then raise exception 'Sem permissão.' using errcode='42501';end if;
  update private.bertha_hml_codes set revoked_at=now() where member_id=m.id and revoked_at is null;
  return jsonb_build_object('revoked',true);
 elsif op='claim' then
  if arg->>'code_hash' !~ '^[0-9a-f]{64}$' or arg->>'nonce_hash' !~ '^[0-9a-f]{64}$' or arg->>'ip_hash' !~ '^[0-9a-f]{64}$' then return null;end if;
  delete from private.bertha_hml_code_limits where expires_at<now();
  foreach lim in array array[(arg->>'ip_hash')||to_char(now(),'YYYYMMDDHH24MI'),(arg->>'ip_hash')||to_char(now(),'YYYYMMDDHH24')] loop
   insert into private.bertha_hml_code_limits(key,hits,expires_at) values(lim,1,now()+interval '2 hours') on conflict(key) do update set hits=private.bertha_hml_code_limits.hits+1 returning private.bertha_hml_code_limits.hits into hits;
   if hits>(case when length(lim)=76 then 10 else 60 end) then return jsonb_build_object('rate_limited',true);end if;
  end loop;
  select * into c from private.bertha_hml_codes where code_hash=arg->>'code_hash' for update;
  if c.id is null or c.revoked_at is not null or c.expires_at<=now() then return null;end if;
  select * into m from public.bertha_hml_members where id=c.member_id and active for update;
  select * into a from private.bertha_hml_code_accounts where member_id=m.id and user_id=m.user_id;
  if m.id is null or a.user_id is null or m.kind<>arg->>'kind' then return null;end if;
  if c.claimed_at is not null and (c.nonce_hash is distinct from arg->>'nonce_hash' or c.claimed_at<now()-interval '5 minutes') then return null;end if;
  update private.bertha_hml_codes set claimed_at=coalesce(claimed_at,now()),nonce_hash=arg->>'nonce_hash' where id=c.id;
  select email into em from auth.users where id=a.user_id;
  return jsonb_build_object('user_id',a.user_id,'email',em,'member',to_jsonb(m));
 end if;
 raise exception 'Operação inválida.';
end;$$;
revoke all on function private.bertha_hml_code_service(text,jsonb) from public,anon,authenticated;
grant usage on schema private to service_role;
grant execute on function private.bertha_hml_code_service(text,jsonb) to service_role;
create function public.bertha_hml_code_service(op text,arg jsonb) returns jsonb language sql security invoker set search_path='' as $$select private.bertha_hml_code_service(op,arg);$$;
revoke all on function public.bertha_hml_code_service(text,jsonb) from public,anon,authenticated;
grant execute on function public.bertha_hml_code_service(text,jsonb) to service_role;
