-- Requires real PostgreSQL with base schemas and idempotency SQL loaded. Rolls back.
begin;
set local bertha.test_only='synthetic-local';
create temp table fixture_ids(owner_a uuid,owner_b uuid,member_a uuid,member_b uuid);
grant select on fixture_ids to authenticated,anon,service_role;
do $$
declare a uuid:=gen_random_uuid();b uuid:=gen_random_uuid();ma jsonb;mb jsonb;
begin
 insert into auth.users(id,email,email_confirmed_at) values(a,a||'@example.invalid',now()),(b,b||'@example.invalid',now());
 perform set_config('request.jwt.claims',jsonb_build_object('sub',a,'role','authenticated')::text,true);
 ma:=public.bertha_hml_invite_prepare('{"local_id":"isolation-A","name":"Fictitious A","kind":"kids"}');
 perform set_config('request.jwt.claims',jsonb_build_object('sub',b,'role','authenticated')::text,true);
 mb:=public.bertha_hml_invite_prepare('{"local_id":"isolation-B","name":"Fictitious B","kind":"adult"}');
 insert into fixture_ids values(a,b,(ma->>'id')::uuid,(mb->>'id')::uuid);
end;$$;
set local role authenticated;
do $$
declare a uuid;b uuid;ma uuid;blocked boolean;
begin
 select owner_a,owner_b,member_a into a,b,ma from fixture_ids;
 perform set_config('request.jwt.claims',jsonb_build_object('sub',a,'role','authenticated')::text,true);
 if (select count(*) from public.bertha_hml_members)<>1 then raise exception 'FAIL Owner A RLS isolation';end if;
 if exists(select 1 from public.bertha_hml_networks where owner_id=b) then raise exception 'FAIL foreign network visible';end if;
 blocked:=false;begin perform public.bertha_hml_code_service('reserve',jsonb_build_object('member_id',ma,'owner_id',a));exception when insufficient_privilege then blocked:=true;end;if not blocked then raise exception 'FAIL authenticated service RPC';end if;
 blocked:=false;begin perform 1 from private.bertha_hml_invite_operations;exception when insufficient_privilege then blocked:=true;end;if not blocked then raise exception 'FAIL authenticated ledger read';end if;
 blocked:=false;begin update public.bertha_hml_members set kind='adult' where id=ma;exception when insufficient_privilege then blocked:=true;end;if not blocked then raise exception 'FAIL direct member write';end if;
 -- A forged user_metadata object must not make another Owner's network visible.
 perform set_config('request.jwt.claims',jsonb_build_object('sub',b,'role','authenticated','user_metadata',jsonb_build_object('owner_id',a))::text,true);
 if exists(select 1 from public.bertha_hml_members where id=ma) then raise exception 'FAIL user metadata promoted access';end if;
end;$$;
reset role;
set local role anon;
do $$
declare blocked boolean;
begin
 blocked:=false;begin perform public.bertha_hml_invite_prepare('{}');exception when insufficient_privilege then blocked:=true;end;if not blocked then raise exception 'FAIL anonymous prepare';end if;
 blocked:=false;begin perform 1 from private.bertha_hml_invite_accounts;exception when insufficient_privilege then blocked:=true;end;if not blocked then raise exception 'FAIL anonymous ledger';end if;
end;$$;
reset role;
set local role service_role;
do $$
declare a uuid;b uuid;ma uuid;r jsonb;blocked boolean;
begin
 select owner_a,owner_b,member_a into a,b,ma from fixture_ids;
 perform set_config('request.jwt.claims','{"role":"service_role"}',true);
 blocked:=false;begin perform public.bertha_hml_code_service('reserve',jsonb_build_object('member_id',ma,'owner_id',b,'kind','kids','key_id',repeat('a',64)));exception when insufficient_privilege then blocked:=true;end;if not blocked then raise exception 'FAIL foreign Owner through service';end if;
 r:=public.bertha_hml_code_service('reserve',jsonb_build_object('member_id',ma,'owner_id',a,'kind','kids','key_id',repeat('a',64)));if r->>'id' is null then raise exception 'FAIL authorized service';end if;
 blocked:=false;begin perform private.bertha_hml_code_service_rc369('issue','{}');exception when insufficient_privilege then blocked:=true;end;if not blocked then raise exception 'FAIL legacy service bypass';end if;
end;$$;
reset role;
rollback;
