CREATE OR REPLACE FUNCTION private.bertha_hml_push_operation(op text, arg jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare j private.bertha_hml_push_jobs;c public.bertha_hml_conversations;i public.bertha_hml_invitations;r public.bertha_hml_recognitions;t public.bertha_hml_tasks;uid uuid;own uuid;mid uuid;url text;valid boolean:=false;
begin
 if coalesce(auth.jwt()->>'role','')<>'service_role' then raise exception 'Serviço privado.' using errcode='42501';end if;
 if op='bind' then
  uid:=(arg->>'user_id')::uuid;
  if not exists(select 1 from public.bertha_hml_networks where owner_id=uid) and not exists(select 1 from public.bertha_hml_members where user_id=uid and active and kind in ('adult','kids')) then raise exception 'Rede indisponível.';end if;
  insert into private.bertha_hml_push_devices(user_id,subscription_id,token_hash) values(uid,(arg->>'subscription_id')::uuid,arg->>'token_hash') on conflict(user_id,subscription_id) do update set token_hash=excluded.token_hash,enabled=true,updated_at=now();return '{"enabled":true}';
 elsif op='unbind' then
  update private.bertha_hml_push_devices set enabled=false where user_id=(arg->>'user_id')::uuid and subscription_id=(arg->>'subscription_id')::uuid;return '{"enabled":false}';
 elsif op='finish' then
  update private.bertha_hml_push_jobs set state=case when (arg->>'ok')::boolean then 'sent' else 'pending' end,lease_until=now()+interval '2 minutes' where id=(arg->>'id')::uuid and nonce=(arg->>'nonce')::uuid and state='processing';return '{}';
 elsif op='claim' then
  select * into j from private.bertha_hml_push_jobs where id=(arg->>'id')::uuid and nonce=(arg->>'nonce')::uuid for update;
  if j.id is null or j.state in ('sent','skipped') or j.attempts>=5 or j.created_at<now()-interval '24 hours' or j.lease_until>now() then return null;end if;
  if exists(select 1 from private.bertha_hml_push_devices where user_id=j.recipient and subscription_id=j.subscription_id and enabled) then
   if j.kind='message' then
    select * into c from public.bertha_hml_conversations where id=(select conversation_id from public.bertha_hml_messages where id=j.source_id);
    select owner_id into own from public.bertha_hml_networks where id=c.network_id;
    valid:=c.allowed and cardinality(c.blocked_by)=0 and j.recipient in(c.user_a,c.user_b) and (j.recipient=own or exists(select 1 from public.bertha_hml_members where network_id=c.network_id and user_id=j.recipient and active and kind in ('adult','kids')));
   elsif j.kind='recognition' then
    select * into r from public.bertha_hml_recognitions where id=j.source_id;select owner_id into own from public.bertha_hml_networks where id=r.network_id;
    valid:=exists(select 1 from public.bertha_hml_members where id=r.member_id and network_id=r.network_id and user_id=j.recipient and active and kind='adult');
   elsif j.kind='collaboration' then
    select * into t from public.bertha_hml_tasks where id=j.source_id;select owner_id into own from public.bertha_hml_networks where id=t.network_id;
    valid:=j.recipient=own and not t.withdrawn and t.state in ('completed','validated');
   elsif j.kind in ('task','validation','activity','reminder') then
    select * into t from public.bertha_hml_tasks where id=j.source_id;select owner_id into own from public.bertha_hml_networks where id=t.network_id;
    valid:=not t.withdrawn and case when j.kind='activity' then j.recipient=own and t.actor_id is not null when j.kind='validation' then t.state='validated' and exists(select 1 from public.bertha_hml_members where id=t.actor_id and user_id=j.recipient and active) else t.state in ('available','assigned','accepted','in_progress') and exists(select 1 from public.bertha_hml_members where network_id=t.network_id and id=any(t.targets) and user_id=j.recipient and active and permissions->>'tasks'='true') and (j.kind<>'reminder' or t.reminder_at between now()-interval '10 minutes' and now()) end;
   else
    select * into i from public.bertha_hml_invitations where id=j.source_id;select owner_id into own from public.bertha_hml_networks where id=i.network_id;
    valid:=case when j.kind='response' then j.recipient=own else exists(select 1 from public.bertha_hml_members where id=any(i.targets) and user_id=j.recipient and active and kind='adult' and permissions->>'invites'='true') end;
   end if;
  end if;
  if not coalesce(valid,false) then update private.bertha_hml_push_jobs set state='skipped' where id=j.id;return null;end if;
  update private.bertha_hml_push_jobs set state='processing',attempts=attempts+1,lease_until=now()+interval '2 minutes' where id=j.id;
  url:='https://draduaila-web.github.io/It-s-my-life-/homologa%C3%A7%C3%A3o/'||case when j.recipient=own then case when j.kind in ('message','response','invitation') then 'helper-owner.html' else 'index.html' end when exists(select 1 from public.bertha_hml_members where user_id=j.recipient and active and kind='kids') then 'kids.html' else 'helper.html' end||'?v=393#'||case when j.kind='message' then 'messages' when j.kind='recognition' then 'recognitions' when j.kind in ('collaboration','activity') then 'satelites' when j.kind in ('task','validation','reminder') then 'missions' else 'invitations' end;
  return jsonb_build_object('id',j.id,'subscription_id',j.subscription_id,'kind',j.kind,'url',url,'title',case when j.kind='reminder' then t.title else null end);
 end if;raise exception 'Operação inválida.';
end;$function$;

CREATE FUNCTION private.bertha_hml_mission_push() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $fn$
DECLARE u uuid;m public.bertha_hml_members;
BEGIN
 IF TG_OP='INSERT' THEN
  IF new.task_date>(now() AT TIME ZONE 'America/Sao_Paulo')::date AND NOT new.allow_early THEN RETURN new;END IF;
  FOR m IN SELECT * FROM public.bertha_hml_members WHERE id=ANY(new.targets) AND network_id=new.network_id AND active AND user_id IS NOT NULL AND permissions->>'tasks'='true' LOOP
   PERFORM private.bertha_hml_enqueue_push('task',new.id,'task:'||new.id,m.user_id);
  END LOOP;
 ELSIF new.state IS DISTINCT FROM old.state THEN
  IF new.state='validated' THEN
   SELECT user_id INTO u FROM public.bertha_hml_members WHERE id=new.actor_id AND network_id=new.network_id AND active;
   IF u IS NOT NULL THEN PERFORM private.bertha_hml_enqueue_push('validation',new.id,'validation:'||new.id,u);END IF;
  ELSIF new.state IN('accepted','in_progress') THEN
   SELECT owner_id INTO u FROM public.bertha_hml_networks WHERE id=new.network_id;
   PERFORM private.bertha_hml_enqueue_push('activity',new.id,'activity:'||new.id||':'||new.state,u);
  END IF;
 END IF;RETURN new;
END;$fn$;
REVOKE ALL ON FUNCTION private.bertha_hml_mission_push() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER bertha_hml_mission_push393 AFTER INSERT OR UPDATE OF state ON public.bertha_hml_tasks FOR EACH ROW EXECUTE FUNCTION private.bertha_hml_mission_push();
CREATE FUNCTION private.bertha_hml_mission_clock() RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $fn$
DECLARE nid uuid;t public.bertha_hml_tasks;m public.bertha_hml_members;
BEGIN
 FOR nid IN SELECT DISTINCT network_id FROM private.bertha_hml_task_schedules WHERE active LOOP
  PERFORM private.bertha_hml_generate_missions(nid);
 END LOOP;
 FOR t IN SELECT * FROM public.bertha_hml_tasks WHERE NOT withdrawn AND state IN('available','assigned','accepted','in_progress') AND (task_date=(now() AT TIME ZONE 'America/Sao_Paulo')::date OR reminder_at BETWEEN now()-interval '10 minutes' AND now()) LOOP
  FOR m IN SELECT * FROM public.bertha_hml_members WHERE network_id=t.network_id AND active AND id=ANY(t.targets) AND user_id IS NOT NULL AND permissions->>'tasks'='true' LOOP
   IF t.task_date=(now() AT TIME ZONE 'America/Sao_Paulo')::date THEN PERFORM private.bertha_hml_enqueue_push('task',t.id,'task:'||t.id,m.user_id);END IF;
   IF t.reminder_at BETWEEN now()-interval '10 minutes' AND now() AND (t.actor_id IS NULL OR t.actor_id=m.id) THEN PERFORM private.bertha_hml_enqueue_push('reminder',t.id,'reminder:'||t.id,m.user_id);END IF;
  END LOOP;
 END LOOP;
END;$fn$;
REVOKE ALL ON FUNCTION private.bertha_hml_mission_clock() FROM PUBLIC,anon,authenticated;
SELECT cron.schedule('bertha-hml-missions-clock','* * * * *','SELECT private.bertha_hml_mission_clock()');
