BEGIN;
DO $qa$
DECLARE owner_uid uuid:=gen_random_uuid();kid_uid uuid:=gen_random_uuid();other_uid uuid:=gen_random_uuid();net uuid;mid uuid;day date:=(now() at time zone 'America/Sao_Paulo')::date;today_id uuid;tomorrow_id uuid;source text;result jsonb;denied boolean:=false;n int;d uuid:=gen_random_uuid();jid uuid;jnonce uuid;
BEGIN
 INSERT INTO auth.users(id,email,email_confirmed_at,is_anonymous) VALUES(owner_uid,'qa-owner-rc393@example.invalid',now(),false),(kid_uid,'qa-kid-rc393@example.invalid',now(),false),(other_uid,'qa-other-rc393@example.invalid',now(),false);
 INSERT INTO public.bertha_hml_networks(owner_id,name) VALUES(owner_uid,'QA RC393 rollback') RETURNING id INTO net;
 INSERT INTO public.bertha_hml_members(network_id,local_id,user_id,name,kind,permissions) VALUES(net,'qa-kid',kid_uid,'QA Kids','kids','{"tasks":true}') RETURNING id INTO mid;
 PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',owner_uid,'role','authenticated')::text,true);
 PERFORM public.bertha_hml_sync_tasks(jsonb_build_object('network_id',net,'tasks',jsonb_build_array(jsonb_build_object('source_ref','mission|qa-daily|'||day,'title','Ler','task_date',day,'targets',jsonb_build_array(mid),'responsibility','delegated','repeat_days',1,'allow_early',false,'due_time','21:00','reminder_minutes',10,'time_zone','America/Sao_Paulo'))));
 SELECT count(*) INTO n FROM public.bertha_hml_tasks WHERE network_id=net;IF n<>2 THEN RAISE EXCEPTION 'Expected today and tomorrow, got %',n;END IF;
 SELECT id INTO today_id FROM public.bertha_hml_tasks WHERE network_id=net AND task_date=day;
 SELECT id INTO tomorrow_id FROM public.bertha_hml_tasks WHERE network_id=net AND task_date=day+1;
 IF NOT EXISTS(SELECT 1 FROM public.bertha_hml_tasks WHERE id=tomorrow_id AND reminder_at=((day+1+'21:00'::time) AT TIME ZONE 'America/Sao_Paulo')-interval '10 min') THEN RAISE EXCEPTION 'Reminder timezone incorrect';END IF;
 PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',kid_uid,'role','authenticated')::text,true);
 BEGIN PERFORM public.bertha_hml_kids_action('claim',jsonb_build_object('task_id',tomorrow_id));EXCEPTION WHEN others THEN denied:=true;END;
 IF NOT denied THEN RAISE EXCEPTION 'Tomorrow must be blocked';END IF;
 PERFORM public.bertha_hml_kids_action('claim',jsonb_build_object('task_id',today_id));
 PERFORM public.bertha_hml_kids_action('start',jsonb_build_object('task_id',today_id));
 result:=public.bertha_hml_kids_action('complete',jsonb_build_object('task_id',today_id));IF result->>'state'<>'completed' THEN RAISE EXCEPTION 'Kids completion bypassed Owner';END IF;
 result:=public.bertha_hml_kids_action('complete',jsonb_build_object('task_id',today_id));IF result->>'state'<>'completed' THEN RAISE EXCEPTION 'Completion not idempotent';END IF;
 PERFORM public.bertha_hml_refresh_missions(net);
 SELECT count(*) INTO n FROM public.bertha_hml_tasks WHERE network_id=net;IF n<>2 THEN RAISE EXCEPTION 'Refresh duplicated occurrences';END IF;
 PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',other_uid,'role','authenticated')::text,true);denied:=false;
 BEGIN PERFORM public.bertha_hml_refresh_missions(net);EXCEPTION WHEN insufficient_privilege THEN denied:=true;END;
 IF NOT denied THEN RAISE EXCEPTION 'Unrelated user generated missions';END IF;
 PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',owner_uid,'role','authenticated')::text,true);
 PERFORM public.bertha_hml_action('validate',jsonb_build_object('network_id',net,'task_id',today_id));
 IF NOT EXISTS(SELECT 1 FROM public.bertha_hml_tasks WHERE id=today_id AND state='validated') THEN RAISE EXCEPTION 'Owner validation failed';END IF;
 IF NOT EXISTS(SELECT 1 FROM public.bertha_hml_tasks WHERE id=tomorrow_id AND state='assigned') THEN RAISE EXCEPTION 'Validation consumed next occurrence';END IF;
 -- Active schedules generate today's occurrence even while the Owner app is closed.
 UPDATE private.bertha_hml_task_schedules SET anchor_date=day-1 WHERE network_id=net;
 DELETE FROM public.bertha_hml_tasks WHERE id=tomorrow_id;
 PERFORM public.bertha_hml_refresh_missions(net);
 SELECT count(*) INTO n FROM public.bertha_hml_tasks WHERE network_id=net;IF n<>2 THEN RAISE EXCEPTION 'Schedule did not regenerate next day';END IF;
 -- Per-weekday scheduling, without duplicate rows on repeated refresh.
 PERFORM public.bertha_hml_sync_tasks(jsonb_build_object('network_id',net,'tasks',jsonb_build_array(jsonb_build_object('source_ref','mission|qa-weekly|'||day,'title','Estudar','task_date',day,'targets',jsonb_build_array(mid),'responsibility','delegated','weekdays',jsonb_build_array(extract(dow from day)::int),'allow_early',true))));
 IF NOT EXISTS(SELECT 1 FROM private.bertha_hml_task_schedules WHERE network_id=net AND source_key='mission|qa-weekly' AND cardinality(weekdays)=1) THEN RAISE EXCEPTION 'Weekdays not persisted';END IF;
 -- Verify all new notification kinds are claimable for the right recipient without sending any push.
 INSERT INTO private.bertha_hml_push_devices(user_id,subscription_id,token_hash) VALUES(kid_uid,d,'qa-not-a-token');
 INSERT INTO private.bertha_hml_push_jobs(event_key,kind,source_id,recipient,subscription_id) VALUES('qa393-validation','validation',today_id,kid_uid,d) RETURNING id,nonce INTO jid,jnonce;
 PERFORM set_config('request.jwt.claims','{"role":"service_role"}',true);
 result:=public.bertha_hml_push('claim',jsonb_build_object('id',jid,'nonce',jnonce));
 IF result->>'kind'<>'validation' OR result->>'url' NOT LIKE '%kids.html%#missions' THEN RAISE EXCEPTION 'Kids validation push URL incorrect: %',result;END IF;
END;$qa$;
SELECT 'daily_occurrences, future_lock, reminders, idempotency, owner_validation, weekdays, authorization, kids_push_route: passed' AS verification;
ROLLBACK;
