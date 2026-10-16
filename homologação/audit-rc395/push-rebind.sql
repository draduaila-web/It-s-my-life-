BEGIN;
DO $qa$
DECLARE a uuid:=gen_random_uuid();b uuid:=gen_random_uuid();d uuid:=gen_random_uuid();n int;denied boolean:=false;
BEGIN
 INSERT INTO auth.users(id,email,email_confirmed_at,is_anonymous) VALUES(a,'qa-395-a@example.invalid',now(),false),(b,'qa-395-b@example.invalid',now(),false);
 INSERT INTO public.bertha_hml_networks(owner_id,name) VALUES(a,'QA395 rollback A'),(b,'QA395 rollback B');
 PERFORM set_config('request.jwt.claims','{"role":"authenticated"}',true);
 BEGIN PERFORM public.bertha_hml_push('bind',jsonb_build_object('user_id',a,'subscription_id',d,'token_hash','qa-not-a-token'));EXCEPTION WHEN insufficient_privilege THEN denied:=true;END;
 IF NOT denied THEN RAISE EXCEPTION 'Unauthenticated service bind allowed';END IF;
 PERFORM set_config('request.jwt.claims','{"role":"service_role"}',true);
 PERFORM public.bertha_hml_push('bind',jsonb_build_object('user_id',a,'subscription_id',d,'token_hash','qa-not-a-token'));
 PERFORM public.bertha_hml_push('bind',jsonb_build_object('user_id',b,'subscription_id',d,'token_hash','qa-not-a-token'));
 SELECT count(*) INTO n FROM private.bertha_hml_push_devices WHERE subscription_id=d AND enabled;
 IF n<>1 OR NOT EXISTS(SELECT 1 FROM private.bertha_hml_push_devices WHERE user_id=b AND subscription_id=d AND enabled) THEN RAISE EXCEPTION 'Rebind failed';END IF;
 IF NOT EXISTS(SELECT 1 FROM private.bertha_hml_push_devices WHERE user_id=a AND subscription_id=d AND NOT enabled) THEN RAISE EXCEPTION 'Previous binding lost or still active';END IF;
 PERFORM public.bertha_hml_push('bind',jsonb_build_object('user_id',b,'subscription_id',d,'token_hash','qa-not-a-token'));
 SELECT count(*) INTO n FROM private.bertha_hml_push_devices WHERE subscription_id=d AND enabled;IF n<>1 THEN RAISE EXCEPTION 'Rebind not idempotent';END IF;
 PERFORM public.bertha_hml_push('unbind',jsonb_build_object('user_id',a,'subscription_id',d));
 IF NOT EXISTS(SELECT 1 FROM private.bertha_hml_push_devices WHERE user_id=b AND subscription_id=d AND enabled) THEN RAISE EXCEPTION 'Old logout disabled new account';END IF;
 PERFORM public.bertha_hml_push('unbind',jsonb_build_object('user_id',b,'subscription_id',d));
 IF EXISTS(SELECT 1 FROM private.bertha_hml_push_devices WHERE subscription_id=d AND enabled) THEN RAISE EXCEPTION 'Unbind failed';END IF;
END;$qa$;
SELECT 'push service authorization, exclusive rebind, prior record retained, idempotency, delayed logout, unbind: passed' AS verification;
ROLLBACK;
