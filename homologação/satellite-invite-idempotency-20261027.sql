-- REVIEW SOURCE ONLY. Requires satellite-code-rc369.sql. NOT applied by this PR.
-- Package through the deployment project's migration CLI only after local PostgreSQL QA.
begin;
create table private.bertha_hml_invite_accounts (
 member_id uuid primary key references public.bertha_hml_members(id),
 owner_id uuid not null references auth.users(id), kind text not null check(kind in ('adult','kids')),
 user_id uuid not null unique, -- Reservation deliberately precedes auth.users creation.
 latest_operation uuid
);
create table private.bertha_hml_invite_operations (
 id uuid primary key default gen_random_uuid(), member_id uuid not null references private.bertha_hml_invite_accounts(member_id),
 previous_operation uuid unique references private.bertha_hml_invite_operations(id),
 key_id text not null check(key_id ~ '^[0-9a-f]{64}$'), code_id uuid unique references private.bertha_hml_codes(id),
 cancelled boolean not null default false, created_at timestamptz not null default now()
);
alter table private.bertha_hml_invite_accounts add foreign key(latest_operation) references private.bertha_hml_invite_operations(id);
alter table private.bertha_hml_invite_accounts enable row level security;
alter table private.bertha_hml_invite_operations enable row level security;
revoke all on private.bertha_hml_invite_accounts,private.bertha_hml_invite_operations from public,anon,authenticated;
-- No client table policies: access only through checked SECURITY DEFINER service RPC.
create function private.bertha_hml_invite_identity_guard() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if exists(select 1 from private.bertha_hml_invite_accounts a where a.member_id=old.id)
 and (new.kind is distinct from old.kind or new.network_id is distinct from old.network_id or new.local_id is distinct from old.local_id) then
 raise exception 'Preserve a identidade do perfil reservado.';end if;
 return new;
end;$$;
revoke all on function private.bertha_hml_invite_identity_guard() from public,anon,authenticated;
create trigger bertha_invite_identity_guard before update on public.bertha_hml_members for each row execute function private.bertha_hml_invite_identity_guard();
alter function private.bertha_hml_code_service(text,jsonb) rename to bertha_hml_code_service_rc369;
revoke all on function private.bertha_hml_code_service_rc369(text,jsonb) from public,anon,authenticated,service_role;
create function private.bertha_hml_code_service(op text,arg jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare m public.bertha_hml_members;a private.bertha_hml_invite_accounts;o private.bertha_hml_invite_operations;
 c private.bertha_hml_codes;owner uuid;previous uuid;uid uuid;result jsonb;state text;
begin
 if coalesce(auth.jwt()->>'role','')<>'service_role' then raise exception 'Acesso indisponível.' using errcode='42501';end if;
 if op='claim' then return private.bertha_hml_code_service_rc369(op,arg);end if;
 -- Legacy issue is intentionally disabled; it must not bypass the durable reservation.
 if op is null or op not in ('reserve','finish','revoke') then raise exception 'Atualize o serviço de convites.';end if;
 owner:=(arg->>'owner_id')::uuid;
 select * into m from public.bertha_hml_members where id=(arg->>'member_id')::uuid for update;
 if m.id is null or not m.active or not exists(select 1 from public.bertha_hml_networks where id=m.network_id and owner_id=owner)
 or not exists(select 1 from auth.users where id=owner and email_confirmed_at is not null and not coalesce(is_anonymous,false) and not (coalesce(raw_app_meta_data,'{}'::jsonb) ? 'bertha_code_member'))
 or exists(select 1 from private.bertha_hml_code_accounts where user_id=owner) then raise exception 'Sem permissão para convidar.' using errcode='42501';end if;
 select * into a from private.bertha_hml_invite_accounts where member_id=m.id;
 if a.member_id is not null and (a.owner_id<>owner or a.kind<>m.kind or (m.user_id is not null and m.user_id<>a.user_id)) then raise exception 'A identidade do perfil mudou.';end if;
 if op='revoke' then
  if a.latest_operation is not null and a.latest_operation is distinct from (arg->>'operation_id')::uuid then raise exception 'O convite mudou. Reabra antes de cancelar.';end if;
  update private.bertha_hml_invite_operations set cancelled=true where member_id=m.id;
  return private.bertha_hml_code_service_rc369(op,arg);
 end if;
 if op='reserve' then
  if arg->>'kind' is distinct from m.kind or coalesce(arg->>'key_id','') !~ '^[0-9a-f]{64}$' then raise exception 'Identidade inválida.';end if;
  if a.member_id is null then
   if m.user_id is not null and not exists(select 1 from private.bertha_hml_code_accounts where user_id=m.user_id and member_id=m.id) then raise exception 'Preserve a conta por e-mail existente.';end if;
   insert into private.bertha_hml_invite_accounts(member_id,owner_id,kind,user_id) values(m.id,owner,m.kind,coalesce(m.user_id,gen_random_uuid())) returning * into a;
  end if;
  previous:=nullif(arg->>'previous_operation','')::uuid;
  select * into o from private.bertha_hml_invite_operations where id=a.latest_operation;
  if previous is not null and previous is distinct from o.id and previous is distinct from o.previous_operation then raise exception 'O convite mudou. Reabra antes de substituir.';end if;
  if o.id is null or previous=o.id then
   insert into private.bertha_hml_invite_operations(member_id,previous_operation,key_id) values(m.id,o.id,arg->>'key_id') returning * into o;
   update private.bertha_hml_invite_accounts set latest_operation=o.id where member_id=m.id;
  end if;
  return jsonb_build_object('id',o.id,'user_id',a.user_id,'key_id',o.key_id);
 end if;
 -- FINISH: account binding + code insertion + result become one transaction.
 if a.member_id is null then raise exception 'Reserva ausente.';end if;
 select * into o from private.bertha_hml_invite_operations where id=(arg->>'operation_id')::uuid and member_id=m.id;
 if o.id is null or o.id<>a.latest_operation or o.key_id is distinct from arg->>'key_id' then raise exception 'A operação mudou. Reabra o convite.';end if;
 uid:=(arg->>'user_id')::uuid;
 if uid is distinct from a.user_id or not exists(select 1 from auth.users where id=uid and raw_app_meta_data->>'bertha_code_member'=m.id::text) then raise exception 'Conta reservada inválida.';end if;
 insert into private.bertha_hml_code_accounts(user_id,member_id) values(uid,m.id) on conflict(member_id) do nothing;
 if not exists(select 1 from private.bertha_hml_code_accounts where user_id=uid and member_id=m.id) then raise exception 'Conta do perfil mudou.';end if;
 update public.bertha_hml_members set user_id=uid where id=m.id;
 if o.code_id is null and not o.cancelled then
  if coalesce(arg->>'code_hash','') !~ '^[0-9a-f]{64}$' then raise exception 'Código inválido.';end if;
  update private.bertha_hml_codes set revoked_at=now() where member_id=m.id and revoked_at is null;
  insert into private.bertha_hml_codes(member_id,code_hash) values(m.id,arg->>'code_hash') returning * into c;
  update private.bertha_hml_invite_operations set code_id=c.id where id=o.id;
 else select * into c from private.bertha_hml_codes where id=o.code_id;
 end if;
 if c.id is not null and c.code_hash is distinct from arg->>'code_hash' then raise exception 'Resultado divergente.';end if;
 state:=case when o.cancelled or c.revoked_at is not null then 'revoked' when c.claimed_at is not null then 'used' when c.expires_at<=now() then 'expired' else 'ready' end;
 return jsonb_build_object('id',c.id,'expires_at',c.expires_at,'name',m.name,'kind',m.kind,'state',state);
end;$$;
revoke all on function private.bertha_hml_code_service(text,jsonb) from public,anon,authenticated;
grant execute on function private.bertha_hml_code_service(text,jsonb) to service_role;
-- Rebind the SQL wrapper explicitly after the legacy function rename.
create or replace function public.bertha_hml_code_service(op text,arg jsonb) returns jsonb language sql security invoker set search_path='' as $$select private.bertha_hml_code_service(op,arg);$$;
revoke all on function public.bertha_hml_code_service(text,jsonb) from public,anon,authenticated;
grant execute on function public.bertha_hml_code_service(text,jsonb) to service_role;
commit;
