BEGIN;
DO $$
DECLARE owner_id uuid:=gen_random_uuid();m jsonb;r jsonb;denied boolean:=false;
BEGIN
 INSERT INTO auth.users(id,email,email_confirmed_at) VALUES(owner_id,owner_id||'@example.invalid',now());
 PERFORM set_config('request.jwt.claims',jsonb_build_object('role','authenticated','sub',owner_id)::text,true);
 m:=public.bertha_hml_invite_prepare(jsonb_build_object('local_id',owner_id::text,'name','Fictitious RC393','kind','kids','permissions',jsonb_build_object('casa',false,'missions',true,'convites',false)));
 IF m->'permissions'->>'tasks'<>'true' OR m->>'requires_validation'<>'true' THEN RAISE EXCEPTION 'missions independent or Kids Owner validation regressed';END IF;
 PERFORM set_config('request.jwt.claims','{"role":"service_role"}',true);
 r:=public.bertha_hml_code_service('reserve',jsonb_build_object('owner_id',owner_id,'member_id',m->>'id','kind','kids','key_id',repeat('a',64)));
 PERFORM set_config('request.jwt.claims',jsonb_build_object('role','authenticated','sub',owner_id)::text,true);
 m:=public.bertha_hml_invite_prepare(jsonb_build_object('local_id',owner_id::text,'name','Fictitious RC393 edited','kind','kids','permissions',jsonb_build_object('casa',false,'missions',false,'convites',true)));
 IF m->'permissions'->>'tasks'<>'false' OR m->'permissions'->>'invites'<>'true' THEN RAISE EXCEPTION 'permissions update regressed';END IF;
 UPDATE public.bertha_hml_members SET active=false WHERE id=(m->>'id')::uuid;
 BEGIN PERFORM public.bertha_hml_invite_prepare(jsonb_build_object('local_id',owner_id::text,'name','Fictitious paused','kind','kids'));EXCEPTION WHEN OTHERS THEN denied:=true;END;
 IF NOT denied THEN RAISE EXCEPTION 'paused profile accepted';END IF;
 PERFORM set_config('request.jwt.claims','{"role":"service_role"}',true);denied:=false;
 BEGIN PERFORM public.bertha_hml_code_service('reserve',jsonb_build_object('owner_id',owner_id,'member_id',m->>'id','kind','kids','key_id',repeat('a',64)));EXCEPTION WHEN insufficient_privilege THEN denied:=true;END;
 IF NOT denied THEN RAISE EXCEPTION 'paused reserve accepted';END IF;
 RAISE NOTICE 'PASS RC393 missions independent, Kids validation, permission edits, paused prepare and reserve';
END;$$;
ROLLBACK;
