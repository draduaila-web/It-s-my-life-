ALTER TABLE public.bertha_hml_tasks ADD COLUMN IF NOT EXISTS allow_early boolean NOT NULL DEFAULT false;
ALTER TABLE public.bertha_hml_tasks ADD COLUMN IF NOT EXISTS reminder_at timestamptz;
CREATE TABLE private.bertha_hml_task_schedules(
 network_id uuid NOT NULL REFERENCES public.bertha_hml_networks(id) ON DELETE CASCADE,
 source_key text NOT NULL, title text NOT NULL,area text NOT NULL,targets uuid[] NOT NULL,
 responsibility text NOT NULL CHECK(responsibility IN ('help','delegated')),
 repeat_days integer NOT NULL DEFAULT 0 CHECK(repeat_days BETWEEN 0 AND 366),
 repeat_months integer NOT NULL DEFAULT 0 CHECK(repeat_months BETWEEN 0 AND 12),
 weekdays integer[] NOT NULL DEFAULT '{}',due_time time,reminder_minutes integer, time_zone text NOT NULL DEFAULT 'America/Sao_Paulo',
 anchor_date date NOT NULL,allow_early boolean NOT NULL DEFAULT false,
 requires_validation boolean NOT NULL DEFAULT false,active boolean NOT NULL DEFAULT true,
 PRIMARY KEY(network_id,source_key),CHECK(repeat_days>0 OR repeat_months>0 OR cardinality(weekdays)>0)
);
ALTER TABLE private.bertha_hml_task_schedules ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON private.bertha_hml_task_schedules FROM PUBLIC,anon,authenticated;
CREATE POLICY schedule_no_client_access ON private.bertha_hml_task_schedules FOR ALL TO authenticated USING(false) WITH CHECK(false);
CREATE FUNCTION private.bertha_hml_generate_missions(nid uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $fn$
DECLARE s private.bertha_hml_task_schedules; d date; today date:=(now() AT TIME ZONE 'America/Sao_Paulo')::date; delta int; due boolean; valid_targets uuid[];
BEGIN

 FOR s IN SELECT * FROM private.bertha_hml_task_schedules WHERE network_id=nid AND active LOOP
  SELECT array_agg(id) INTO valid_targets FROM public.bertha_hml_members WHERE network_id=nid AND active AND id=ANY(s.targets) AND kind IN('adult','kids') AND permissions->>'tasks'='true';
  IF coalesce(cardinality(valid_targets),0)=0 THEN CONTINUE;END IF;
  FOR d IN SELECT generate_series(today,today+1,interval '1 day')::date LOOP
   IF d<s.anchor_date THEN CONTINUE;END IF;
   IF cardinality(s.weekdays)>0 THEN due:=extract(dow FROM d)::int=ANY(s.weekdays);
   ELSIF s.repeat_days>0 THEN due:=mod(d-s.anchor_date,s.repeat_days)=0;
   ELSE delta:=(extract(year FROM d)::int-extract(year FROM s.anchor_date)::int)*12+extract(month FROM d)::int-extract(month FROM s.anchor_date)::int;
    due:=mod(delta,s.repeat_months)=0 AND extract(day FROM d)=least(extract(day FROM s.anchor_date),extract(day FROM (date_trunc('month',d)+interval '1 month - 1 day')));END IF;
   IF NOT due THEN CONTINUE;END IF;
   INSERT INTO public.bertha_hml_tasks(network_id,source_ref,title,area,task_date,targets,responsibility,state,requires_validation,allow_early,reminder_at)
    VALUES(nid,s.source_key||'|'||d,s.title,s.area,d,valid_targets,s.responsibility,CASE WHEN s.responsibility='help' THEN 'available' ELSE 'assigned' END,s.requires_validation,s.allow_early,CASE WHEN s.due_time IS NOT NULL AND s.reminder_minutes IS NOT NULL THEN ((d+s.due_time) AT TIME ZONE s.time_zone)-make_interval(mins=>s.reminder_minutes) END)
    ON CONFLICT(network_id,source_ref) DO NOTHING;
  END LOOP;
 END LOOP;
 RETURN jsonb_build_object('ready',true);
END;$fn$;
REVOKE ALL ON FUNCTION private.bertha_hml_generate_missions(uuid) FROM PUBLIC,anon,authenticated;
CREATE FUNCTION private.bertha_hml_refresh_missions(nid uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $fn$
BEGIN
 IF auth.uid() IS NULL OR NOT(private.bertha_hml_owner(nid) OR EXISTS(SELECT 1 FROM public.bertha_hml_members WHERE network_id=nid AND user_id=auth.uid() AND active AND kind IN('adult','kids') AND permissions->>'tasks'='true')) THEN RAISE EXCEPTION 'Rede indisponível.' USING errcode='42501';END IF;
 RETURN private.bertha_hml_generate_missions(nid);
END;$fn$;
REVOKE ALL ON FUNCTION private.bertha_hml_refresh_missions(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION private.bertha_hml_refresh_missions(uuid) TO authenticated;
CREATE FUNCTION public.bertha_hml_refresh_missions(nid uuid) RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path='' AS $fn$ SELECT private.bertha_hml_refresh_missions(nid);$fn$;
REVOKE ALL ON FUNCTION public.bertha_hml_refresh_missions(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.bertha_hml_refresh_missions(uuid) TO authenticated;
CREATE OR REPLACE FUNCTION private.bertha_hml_sync_tasks(arg jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $fn$
DECLARE nid uuid:=(arg->>'network_id')::uuid;item jsonb;targets uuid[];refs text[]:='{}';keys text[]:='{}';sk text;rd int;rm int;wd integer[];
BEGIN
 IF auth.uid() IS NULL OR NOT private.bertha_hml_owner(nid) THEN RAISE EXCEPTION 'Somente o Owner pode compartilhar atividades.' USING errcode='42501';END IF;
 IF jsonb_typeof(arg->'tasks') IS DISTINCT FROM 'array' OR jsonb_array_length(arg->'tasks')>1000 THEN RAISE EXCEPTION 'Lista de atividades inválida.';END IF;
 FOR item IN SELECT value FROM jsonb_array_elements(arg->'tasks') LOOP
  SELECT array_agg(DISTINCT x::uuid) INTO targets FROM jsonb_array_elements_text(item->'targets')x;
  IF coalesce(cardinality(targets),0)=0 OR EXISTS(SELECT 1 FROM unnest(targets)x WHERE NOT EXISTS(SELECT 1 FROM public.bertha_hml_members m WHERE m.id=x AND m.network_id=nid AND m.active AND m.kind IN('adult','kids') AND m.permissions->>'tasks'='true')) THEN RAISE EXCEPTION 'Destinatários sem permissão.' USING errcode='42501';END IF;
  IF length(coalesce(item->>'source_ref','')) NOT BETWEEN 1 AND 400 OR item->>'responsibility' NOT IN('help','delegated') THEN RAISE EXCEPTION 'Atividade inválida.';END IF;
  refs:=array_append(refs,item->>'source_ref');
  INSERT INTO public.bertha_hml_tasks(network_id,source_ref,title,area,task_date,targets,responsibility,state,requires_validation,allow_early,reminder_at)
   VALUES(nid,item->>'source_ref',item->>'title',coalesce(item->>'area','Casa'),(item->>'task_date')::date,targets,item->>'responsibility',CASE WHEN item->>'responsibility'='help' THEN 'available' ELSE 'assigned' END,coalesce((item->>'requires_validation')::boolean,false),coalesce((item->>'allow_early')::boolean,false),CASE WHEN nullif(item->>'due_time','') IS NOT NULL AND nullif(item->>'reminder_minutes','') IS NOT NULL THEN (((item->>'task_date')::date+(item->>'due_time')::time) AT TIME ZONE coalesce(nullif(item->>'time_zone',''),'America/Sao_Paulo'))-make_interval(mins=>(item->>'reminder_minutes')::int) END)
   ON CONFLICT(network_id,source_ref) DO UPDATE SET title=excluded.title,area=excluded.area,targets=excluded.targets,responsibility=excluded.responsibility,requires_validation=excluded.requires_validation,allow_early=excluded.allow_early,reminder_at=excluded.reminder_at,withdrawn=false;
  rd:=coalesce((item->>'repeat_days')::int,0);rm:=coalesce((item->>'repeat_months')::int,0);
  SELECT coalesce(array_agg(x::int),'{}') INTO wd FROM jsonb_array_elements_text(coalesce(item->'weekdays','[]')) x;
  IF cardinality(wd)>7 OR EXISTS(SELECT 1 FROM unnest(wd)x WHERE x NOT BETWEEN 0 AND 6) THEN RAISE EXCEPTION 'Dias da semana inválidos.';END IF;
  IF rd>0 OR rm>0 OR cardinality(wd)>0 THEN
   sk:=split_part(item->>'source_ref','|',1)||'|'||split_part(item->>'source_ref','|',2);keys:=array_append(keys,sk);
   INSERT INTO private.bertha_hml_task_schedules(network_id,source_key,title,area,targets,responsibility,repeat_days,repeat_months,weekdays,due_time,reminder_minutes,time_zone,anchor_date,allow_early,requires_validation)
    VALUES(nid,sk,item->>'title',coalesce(item->>'area','Casa'),targets,item->>'responsibility',rd,rm,wd,nullif(item->>'due_time','')::time,nullif(item->>'reminder_minutes','')::int,coalesce(nullif(item->>'time_zone',''),'America/Sao_Paulo'),coalesce((item->>'anchor_date')::date,(item->>'task_date')::date),coalesce((item->>'allow_early')::boolean,false),coalesce((item->>'requires_validation')::boolean,false))
    ON CONFLICT(network_id,source_key) DO UPDATE SET title=excluded.title,area=excluded.area,targets=excluded.targets,responsibility=excluded.responsibility,repeat_days=excluded.repeat_days,repeat_months=excluded.repeat_months,anchor_date=excluded.anchor_date,weekdays=excluded.weekdays,due_time=excluded.due_time,reminder_minutes=excluded.reminder_minutes,time_zone=excluded.time_zone,allow_early=excluded.allow_early,requires_validation=excluded.requires_validation,active=true;
  END IF;
 END LOOP;
 UPDATE private.bertha_hml_task_schedules SET active=false WHERE network_id=nid AND NOT(source_key=ANY(keys));
 UPDATE public.bertha_hml_tasks t SET withdrawn=true WHERE network_id=nid AND NOT(source_ref=ANY(refs)) AND state IN('available','assigned','accepted','in_progress') AND NOT EXISTS(SELECT 1 FROM private.bertha_hml_task_schedules s WHERE s.network_id=nid AND s.active AND s.source_key=split_part(t.source_ref,'|',1)||'|'||split_part(t.source_ref,'|',2));
 -- Apply changed sharing/early-start choices to all open occurrences, including tomorrow.
 UPDATE public.bertha_hml_tasks t SET targets=s.targets,allow_early=s.allow_early,requires_validation=s.requires_validation,title=s.title,area=s.area,reminder_at=CASE WHEN s.due_time IS NOT NULL AND s.reminder_minutes IS NOT NULL THEN ((t.task_date+s.due_time) AT TIME ZONE s.time_zone)-make_interval(mins=>s.reminder_minutes) END,withdrawn=false FROM private.bertha_hml_task_schedules s WHERE s.network_id=nid AND t.network_id=nid AND s.active AND s.source_key=split_part(t.source_ref,'|',1)||'|'||split_part(t.source_ref,'|',2) AND t.state IN('available','assigned','accepted','in_progress');
 UPDATE public.bertha_hml_tasks t SET withdrawn=true FROM private.bertha_hml_task_schedules s WHERE s.network_id=nid AND t.network_id=nid AND s.active AND s.source_key=split_part(t.source_ref,'|',1)||'|'||split_part(t.source_ref,'|',2) AND t.state IN('available','assigned') AND t.task_date>(now() AT TIME ZONE 'America/Sao_Paulo')::date AND NOT(t.task_date>=s.anchor_date AND CASE WHEN cardinality(s.weekdays)>0 THEN extract(dow FROM t.task_date)::int=ANY(s.weekdays) WHEN s.repeat_days>0 THEN mod(t.task_date-s.anchor_date,s.repeat_days)=0 ELSE mod((extract(year FROM t.task_date)::int-extract(year FROM s.anchor_date)::int)*12+extract(month FROM t.task_date)::int-extract(month FROM s.anchor_date)::int,s.repeat_months)=0 AND extract(day FROM t.task_date)=least(extract(day FROM s.anchor_date),extract(day FROM (date_trunc('month',t.task_date)+interval '1 month - 1 day'))) END);
 PERFORM private.bertha_hml_refresh_missions(nid);
 RETURN jsonb_build_object('shared',cardinality(refs));
END;$fn$;
CREATE OR REPLACE FUNCTION private.bertha_hml_kids_action(op text, arg jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare m public.bertha_hml_members;t public.bertha_hml_tasks;s text;
begin
 if auth.uid() is null then raise exception 'Conecte seu espaço.' using errcode='42501';end if;
 select * into t from public.bertha_hml_tasks where id=(arg->>'task_id')::uuid for update;
 select * into m from public.bertha_hml_members where network_id=t.network_id and user_id=auth.uid() and active and kind='kids' and permissions->>'tasks'='true' and id=any(t.targets);
 if t.id is null or t.withdrawn or m.id is null then raise exception 'Missão indisponível.' using errcode='42501';end if;
 if op in ('claim','start','complete') and t.task_date>(now() at time zone 'America/Sao_Paulo')::date and (not t.allow_early or t.task_date>(now() at time zone 'America/Sao_Paulo')::date+1) then raise exception 'Esta missão fica disponível no dia marcado.';end if;
 if t.actor_id is not null and t.actor_id<>m.id then raise exception 'Outra pessoa já assumiu esta missão.';end if;
 if op='claim' then
  if t.actor_id=m.id and t.state in ('accepted','in_progress','completed','validated') then return to_jsonb(t);end if;
  if t.state not in ('available','assigned') then raise exception 'Missão indisponível.';end if;s:='accepted';
 elsif op='start' then
  if t.actor_id=m.id and t.state='in_progress' then return to_jsonb(t);end if;
  if t.actor_id is distinct from m.id or t.state<>'accepted' then raise exception 'Escolha a missão antes de começar.';end if;s:='in_progress';
 elsif op='complete' then
  if t.actor_id=m.id and t.state in ('completed','validated') then return to_jsonb(t);end if;
  if t.actor_id is distinct from m.id or t.state<>'in_progress' then raise exception 'Comece a missão antes de concluir.';end if;s:='completed';
 else raise exception 'Ação indisponível.';end if;
 update public.bertha_hml_tasks set state=s,actor_id=m.id,started_at=case when op='start' then now() else started_at end,completed_at=case when op='complete' then now() else completed_at end,updated_at=now() where id=t.id returning * into t;
 insert into public.bertha_hml_events(task_id,actor_user_id,action) values(t.id,auth.uid(),op);
 return to_jsonb(t);
end;$function$

