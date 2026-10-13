create table public.bertha_hml_guides(id uuid primary key default gen_random_uuid(),network_id uuid not null references public.bertha_hml_networks(id),source_ref text not null,title text not null check(length(title) between 1 and 180),body jsonb not null check(octet_length(body::text)<=30000),targets uuid[] not null,updated_at timestamptz not null default now(),unique(network_id,source_ref));
create index on public.bertha_hml_guides(network_id);
alter table public.bertha_hml_guides enable row level security;
revoke all on public.bertha_hml_guides from public,anon,authenticated;
grant select,insert,update on public.bertha_hml_guides to authenticated;
create policy guides_read on public.bertha_hml_guides for select to authenticated using(private.bertha_hml_owner(network_id) or exists(select 1 from public.bertha_hml_members m where m.network_id=bertha_hml_guides.network_id and m.id=any(targets) and m.user_id=(select auth.uid()) and m.active and m.permissions->>'tasks'='true'));
create policy guides_insert on public.bertha_hml_guides for insert to authenticated with check(private.bertha_hml_owner(network_id));
create policy guides_update on public.bertha_hml_guides for update to authenticated using(private.bertha_hml_owner(network_id)) with check(private.bertha_hml_owner(network_id));
create function public.bertha_hml_guide_share(arg jsonb) returns jsonb language plpgsql security invoker set search_path='' as $$
declare n uuid:=(arg->>'network_id')::uuid;ts uuid[];g public.bertha_hml_guides;
begin
 if not private.bertha_hml_owner(n) then raise exception 'Somente o Owner compartilha procedimentos.' using errcode='42501';end if;
 select array_agg(distinct value::uuid) into ts from jsonb_array_elements_text(arg->'targets');
 if ts is null then ts:='{}'::uuid[];end if;
 if exists(select 1 from unnest(ts) x where not exists(select 1 from public.bertha_hml_members m where m.id=x and m.network_id=n and m.active and m.permissions->>'tasks'='true')) then raise exception 'Destinatário sem acesso à Casa.' using errcode='42501';end if;
 insert into public.bertha_hml_guides(network_id,source_ref,title,body,targets) values(n,arg->>'source_ref',arg->>'title',arg->'body',ts) on conflict(network_id,source_ref) do update set title=excluded.title,body=excluded.body,targets=excluded.targets,updated_at=now() returning * into g;
 return to_jsonb(g);
end;$$;
revoke all on function public.bertha_hml_guide_share(jsonb) from public,anon;
grant execute on function public.bertha_hml_guide_share(jsonb) to authenticated;
