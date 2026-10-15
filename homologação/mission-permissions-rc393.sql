CREATE OR REPLACE FUNCTION private.bertha_hml_invite_prepare(arg jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
 values(n.id,arg->>'local_id',trim(arg->>'name'),k,arg->>'avatar_key',jsonb_build_object('tasks',(coalesce((arg->'permissions'->>'casa')::boolean,false) or coalesce((arg->'permissions'->>'missions')::boolean,false)),'invites',coalesce((arg->'permissions'->>'convites')::boolean,false)),k='kids' or coalesce((arg->>'requires_validation')::boolean,false))
 on conflict(network_id,local_id) do update set name=excluded.name,kind=excluded.kind,avatar_key=excluded.avatar_key,permissions=excluded.permissions,requires_validation=excluded.requires_validation returning * into m;
 return to_jsonb(m);
end;$function$;

