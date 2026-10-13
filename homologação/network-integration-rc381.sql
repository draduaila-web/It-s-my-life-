begin;
alter table public.bertha_hml_tasks add column if not exists withdrawn boolean not null default false;
create or replace function private.bertha_hml_task_reader(tid uuid) returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from public.bertha_hml_tasks t where t.id=tid and (private.bertha_hml_owner(t.network_id) or (not t.withdrawn and exists(select 1 from public.bertha_hml_members m where m.network_id=t.network_id and m.user_id=auth.uid() and m.active and m.kind='adult' and m.permissions->>'tasks'='true' and m.id=any(t.targets)))));
$$;
create or replace function private.bertha_hml_sync_tasks(arg jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare nid uuid:=(arg->>'network_id')::uuid; item jsonb; targets uuid[]; refs text[]:='{}';
begin
 if auth.uid() is null or not private.bertha_hml_owner(nid) then raise exception 'Somente o Owner pode compartilhar atividades.' using errcode='42501'; end if;
 if jsonb_typeof(arg->'tasks') is distinct from 'array' or jsonb_array_length(arg->'tasks')>1000 then raise exception 'Lista de atividades inválida.'; end if;
 for item in select value from jsonb_array_elements(arg->'tasks') loop
  select array_agg(distinct x::uuid) into targets from jsonb_array_elements_text(item->'targets') x;
  if coalesce(cardinality(targets),0)=0 or exists(select 1 from unnest(targets) x where not exists(select 1 from public.bertha_hml_members m where m.id=x and m.network_id=nid and m.active and m.kind='adult' and m.permissions->>'tasks'='true')) then raise exception 'Destinatários sem permissão.' using errcode='42501'; end if;
  if length(coalesce(item->>'source_ref','')) not between 1 and 400 or item->>'responsibility' not in ('help','delegated') then raise exception 'Atividade inválida.'; end if;
  refs:=array_append(refs,item->>'source_ref');
  insert into public.bertha_hml_tasks(network_id,source_ref,title,area,task_date,targets,responsibility,state,requires_validation)
  values(nid,item->>'source_ref',item->>'title',coalesce(item->>'area','Casa'),(item->>'task_date')::date,targets,item->>'responsibility',case when item->>'responsibility'='help' then 'available' else 'assigned' end,coalesce((item->>'requires_validation')::boolean,false))
  on conflict(network_id,source_ref) do update set title=excluded.title,area=excluded.area,targets=excluded.targets,responsibility=excluded.responsibility,requires_validation=excluded.requires_validation,withdrawn=false;
 end loop;
 update public.bertha_hml_tasks set withdrawn=true where network_id=nid and not(source_ref=any(refs)) and state in ('available','assigned','accepted','in_progress');
 return jsonb_build_object('shared',cardinality(refs));
end;$$;
revoke all on function private.bertha_hml_sync_tasks(jsonb) from public,anon;
grant execute on function private.bertha_hml_sync_tasks(jsonb) to authenticated;
create or replace function public.bertha_hml_sync_tasks(arg jsonb) returns jsonb language sql set search_path='' as $$select private.bertha_hml_sync_tasks(arg);$$;
revoke all on function public.bertha_hml_sync_tasks(jsonb) from public,anon;
grant execute on function public.bertha_hml_sync_tasks(jsonb) to authenticated;
create table if not exists public.bertha_hml_recognitions(
 id uuid primary key default gen_random_uuid(),network_id uuid not null references public.bertha_hml_networks(id),member_id uuid not null references public.bertha_hml_members(id),source_ref text not null check(length(source_ref) between 1 and 400),name text not null check(length(name) between 1 and 300),message text not null default '' check(length(message)<=2000),icon text not null default '',art_key text not null default 'thanks',palette text not null default 'rose' check(palette in ('rose','brisa')),sent_at timestamptz not null default now(),unique(network_id,source_ref)
);
alter table public.bertha_hml_recognitions enable row level security;
revoke all on public.bertha_hml_recognitions from anon,authenticated;
grant select,insert on public.bertha_hml_recognitions to authenticated;
drop policy if exists recognition_read on public.bertha_hml_recognitions;
create policy recognition_read on public.bertha_hml_recognitions for select to authenticated using(private.bertha_hml_owner(network_id) or exists(select 1 from public.bertha_hml_members m where m.id=member_id and m.network_id=bertha_hml_recognitions.network_id and m.user_id=auth.uid() and m.active and m.kind='adult'));
drop policy if exists recognition_send on public.bertha_hml_recognitions;
create policy recognition_send on public.bertha_hml_recognitions for insert to authenticated with check(private.bertha_hml_owner(network_id) and exists(select 1 from public.bertha_hml_members m where m.id=member_id and m.network_id=bertha_hml_recognitions.network_id and m.active and m.kind='adult'));
create or replace function public.bertha_hml_recognize(arg jsonb) returns jsonb language plpgsql set search_path='' as $$
declare r public.bertha_hml_recognitions;
begin
 insert into public.bertha_hml_recognitions(network_id,member_id,source_ref,name,message,icon,art_key,palette,sent_at) values((arg->>'network_id')::uuid,(arg->>'member_id')::uuid,arg->>'source_ref',arg->>'name',coalesce(arg->>'message',''),coalesce(arg->>'icon',''),coalesce(arg->>'art_key','thanks'),coalesce(arg->>'palette','rose'),coalesce((arg->>'sent_at')::timestamptz,now())) on conflict(network_id,source_ref) do nothing returning * into r;
 if r.id is null then select * into r from public.bertha_hml_recognitions where network_id=(arg->>'network_id')::uuid and source_ref=arg->>'source_ref'; end if;
 return to_jsonb(r);
end;$$;
revoke all on function public.bertha_hml_recognize(jsonb) from public,anon;
grant execute on function public.bertha_hml_recognize(jsonb) to authenticated;
commit;
