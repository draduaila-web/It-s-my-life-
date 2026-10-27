-- LOCAL disposable Supabase DB ONLY, after the existing HML schema and review SQL.
-- Never run in the existing project. All changes roll back. NOT EXECUTED on this Mac.
begin;
do $$
declare owner_a uuid:=gen_random_uuid();owner_b uuid:=gen_random_uuid();m jsonb;r jsonb;s jsonb;f jsonb;arg jsonb;blocked boolean;uid uuid;mid uuid;
begin
 if current_setting('bertha.test_only',true) is distinct from 'synthetic-local' then raise exception 'Set bertha.test_only=synthetic-local in the disposable local database only.';end if;
 insert into auth.users(id,email,email_confirmed_at) values(owner_a,owner_a||'@example.invalid',now()),(owner_b,owner_b||'@example.invalid',now());
 perform set_config('request.jwt.claims',jsonb_build_object('sub',owner_a,'role','authenticated')::text,true);
 m:=public.bertha_hml_invite_prepare(jsonb_build_object('local_id','fixture-idempotency','name','Fictitious','kind','kids'));mid:=(m->>'id')::uuid;
 arg:=jsonb_build_object('owner_id',owner_a,'member_id',mid,'kind','kids','key_id',repeat('a',64));
 blocked:=false;begin perform public.bertha_hml_code_service('reserve',arg);exception when insufficient_privilege then blocked:=true;end;if not blocked then raise exception 'FAIL authenticated reserve';end if;
 perform set_config('request.jwt.claims','{"role":"service_role"}',true);
 blocked:=false;begin perform public.bertha_hml_code_service('reserve',arg||jsonb_build_object('owner_id',owner_b));exception when insufficient_privilege then blocked:=true;end;if not blocked then raise exception 'FAIL foreign Owner';end if;
 r:=public.bertha_hml_code_service('reserve',arg);s:=public.bertha_hml_code_service('reserve',arg);if r<>s then raise exception 'FAIL reserve replay';end if;
 uid:=(r->>'user_id')::uuid;
 if exists(select 1 from auth.users where id=uid) then raise exception 'FAIL reserve creates account';end if;
 insert into auth.users(id,email,email_confirmed_at,raw_app_meta_data) values(uid,uid||'@example.invalid',now(),jsonb_build_object('bertha_code_member',mid));
 arg:=arg||jsonb_build_object('operation_id',r->>'id','user_id',uid,'code_hash',repeat('b',64));
 f:=public.bertha_hml_code_service('finish',arg);s:=public.bertha_hml_code_service('finish',arg);if f<>s or f->>'state'<>'ready' then raise exception 'FAIL finish replay';end if;
 if (select count(*) from private.bertha_hml_codes where member_id=mid)<>1 then raise exception 'FAIL duplicate code';end if;
 blocked:=false;begin perform public.bertha_hml_code_service('finish',arg||jsonb_build_object('code_hash',repeat('c',64)));exception when others then blocked:=true;end;if not blocked then raise exception 'FAIL divergent code';end if;
 blocked:=false;begin update public.bertha_hml_members set kind='adult' where id=mid;exception when others then blocked:=true;end;if not blocked then raise exception 'FAIL type mutation';end if;
 s:=public.bertha_hml_code_service('claim',jsonb_build_object('kind','adult','code_hash',repeat('b',64),'nonce_hash',repeat('c',64),'ip_hash',repeat('d',64)));if s is not null then raise exception 'FAIL wrong type claim';end if;
 s:=public.bertha_hml_code_service('claim',jsonb_build_object('kind','kids','code_hash',repeat('b',64),'nonce_hash',repeat('c',64),'ip_hash',repeat('d',64)));if s->>'user_id'<>uid::text then raise exception 'FAIL claim';end if;
 s:=public.bertha_hml_code_service('claim',jsonb_build_object('kind','kids','code_hash',repeat('b',64),'nonce_hash',repeat('e',64),'ip_hash',repeat('d',64)));if s is not null then raise exception 'FAIL used code different nonce';end if;
 s:=public.bertha_hml_code_service('finish',arg);if s->>'state'<>'used' then raise exception 'FAIL recovery resurrects used code';end if;
 arg:=arg||jsonb_build_object('previous_operation',r->>'id');s:=public.bertha_hml_code_service('reserve',arg);if s->>'id'=r->>'id' or s->>'user_id'<>uid::text then raise exception 'FAIL explicit replacement';end if;
 if public.bertha_hml_code_service('reserve',arg)<>s then raise exception 'FAIL replacement replay';end if;
 blocked:=false;begin perform public.bertha_hml_code_service('finish',arg);exception when others then blocked:=true;end;if not blocked then raise exception 'FAIL stale completion';end if;
 blocked:=false;begin perform public.bertha_hml_code_service('revoke',arg);exception when others then blocked:=true;end;if not blocked then raise exception 'FAIL stale revoke';end if;
 arg:=arg||jsonb_build_object('operation_id',s->>'id','code_hash',repeat('f',64));perform public.bertha_hml_code_service('finish',arg);
 update private.bertha_hml_codes set expires_at=now()-interval '1 second' where code_hash=repeat('f',64);
 if public.bertha_hml_code_service('finish',arg)->>'state'<>'expired' then raise exception 'FAIL expired recovery';end if;
 perform public.bertha_hml_code_service('revoke',arg);
 if public.bertha_hml_code_service('finish',arg)->>'state'<>'revoked' then raise exception 'FAIL revoked recovery';end if;
 if has_function_privilege('anon','public.bertha_hml_code_service(text,jsonb)','EXECUTE') or has_function_privilege('authenticated','public.bertha_hml_code_service(text,jsonb)','EXECUTE')
 or has_function_privilege('service_role','private.bertha_hml_code_service_rc369(text,jsonb)','EXECUTE') then raise exception 'FAIL exposed legacy path';end if;
 if has_table_privilege('authenticated','private.bertha_hml_invite_operations','SELECT') or has_table_privilege('anon','private.bertha_hml_invite_accounts','SELECT') then raise exception 'FAIL exposed ledger';end if;
 raise notice 'PASS local idempotency/authorization assertions';
end;$$;
rollback;
