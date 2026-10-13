create extension if not exists pg_net with schema extensions;
create table private.bertha_hml_push_devices(user_id uuid not null references auth.users(id),subscription_id uuid not null,token_hash text not null,enabled boolean not null default true,updated_at timestamptz not null default now(),primary key(user_id,subscription_id));
create table private.bertha_hml_push_jobs(id uuid primary key default gen_random_uuid(),event_key text not null,kind text not null,source_id uuid not null,recipient uuid not null references auth.users(id),subscription_id uuid not null,nonce uuid not null default gen_random_uuid(),state text not null default 'pending',attempts int not null default 0,lease_until timestamptz,requested_at timestamptz,created_at timestamptz not null default now(),unique(event_key,recipient,subscription_id));
create index on private.bertha_hml_push_jobs(state,lease_until);
alter table private.bertha_hml_push_devices enable row level security;
alter table private.bertha_hml_push_jobs enable row level security;
revoke all on private.bertha_hml_push_devices,private.bertha_hml_push_jobs from public,anon,authenticated;
create policy devices_deny on private.bertha_hml_push_devices for all to anon,authenticated using(false) with check(false);
create policy jobs_deny on private.bertha_hml_push_jobs for all to anon,authenticated using(false) with check(false);
create function private.bertha_hml_request_push(jid uuid) returns void language plpgsql security definer set search_path='' as $$
declare j private.bertha_hml_push_jobs;
begin
 select * into j from private.bertha_hml_push_jobs where id=jid;
 if j.id is null or j.state not in ('pending','processing') or j.attempts>=5 or j.created_at<now()-interval '24 hours' then return;end if;
 perform net.http_post(url:='https://ouxellokvigbdeeyvvfv.supabase.co/functions/v1/bertha-social-push',headers:='{"Content-Type":"application/json","apikey":"sb_publishable_2lmnQX4WD-s343sEZoFERA_B4URTnip"}'::jsonb,body:=jsonb_build_object('op','deliver','id',j.id,'nonce',j.nonce),timeout_milliseconds:=10000);
 update private.bertha_hml_push_jobs set requested_at=now() where id=jid;
end;$$;
create function private.bertha_hml_enqueue_push(kind text,source uuid,event text,target uuid) returns void language plpgsql security definer set search_path='' as $$
declare jid uuid;
begin
 for jid in insert into private.bertha_hml_push_jobs(event_key,kind,source_id,recipient,subscription_id) select event,kind,source,target,subscription_id from private.bertha_hml_push_devices where user_id=target and enabled on conflict(event_key,recipient,subscription_id) do nothing returning id loop perform private.bertha_hml_request_push(jid);end loop;
end;$$;
create function private.bertha_hml_push_event() returns trigger language plpgsql security definer set search_path='' as $$
declare c public.bertha_hml_conversations;i public.bertha_hml_invitations;m public.bertha_hml_members;u uuid;
begin
 if TG_TABLE_NAME='bertha_hml_messages' then
  select * into c from public.bertha_hml_conversations where id=new.conversation_id;u:=case when new.sender_id=c.user_a then c.user_b else c.user_a end;
  perform private.bertha_hml_enqueue_push('message',new.id,'message:'||new.id,u);
 elsif TG_TABLE_NAME='bertha_hml_invitations' then
  if TG_OP='UPDATE' and new.title=old.title and new.when_text=old.when_text and new.targets=old.targets then return new;end if;
  for m in select * from public.bertha_hml_members where id=any(new.targets) and active and kind='adult' and permissions->>'invites'='true' and user_id is not null loop perform private.bertha_hml_enqueue_push('invitation',new.id,'invitation:'||new.id||':'||new.updated_at,m.user_id);end loop;
 else
  if TG_OP='UPDATE' and new.status=old.status then return new;end if;
  select * into i from public.bertha_hml_invitations where id=new.invitation_id;select owner_id into u from public.bertha_hml_networks where id=i.network_id;
  perform private.bertha_hml_enqueue_push('response',new.invitation_id,'response:'||new.invitation_id||':'||new.member_id||':'||new.updated_at,u);
 end if;
 return new;
end;$$;
create trigger message_push after insert on public.bertha_hml_messages for each row execute function private.bertha_hml_push_event();
create trigger invitation_push after insert or update on public.bertha_hml_invitations for each row execute function private.bertha_hml_push_event();
create trigger response_push after insert or update on public.bertha_hml_invitation_responses for each row execute function private.bertha_hml_push_event();
create function private.bertha_hml_push_operation(op text,arg jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare j private.bertha_hml_push_jobs;c public.bertha_hml_conversations;i public.bertha_hml_invitations;uid uuid;own uuid;mid uuid;url text;valid boolean:=false;
begin
 if coalesce(auth.jwt()->>'role','')<>'service_role' then raise exception 'Serviço privado.' using errcode='42501';end if;
 if op='bind' then
  uid:=(arg->>'user_id')::uuid;
  if not exists(select 1 from public.bertha_hml_networks where owner_id=uid) and not exists(select 1 from public.bertha_hml_members where user_id=uid and active and kind='adult') then raise exception 'Rede indisponível.';end if;
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
    valid:=c.allowed and cardinality(c.blocked_by)=0 and j.recipient in(c.user_a,c.user_b) and (j.recipient=own or exists(select 1 from public.bertha_hml_members where network_id=c.network_id and user_id=j.recipient and active and kind='adult'));
   else
    select * into i from public.bertha_hml_invitations where id=j.source_id;select owner_id into own from public.bertha_hml_networks where id=i.network_id;
    valid:=case when j.kind='response' then j.recipient=own else exists(select 1 from public.bertha_hml_members where id=any(i.targets) and user_id=j.recipient and active and kind='adult' and permissions->>'invites'='true') end;
   end if;
  end if;
  if not coalesce(valid,false) then update private.bertha_hml_push_jobs set state='skipped' where id=j.id;return null;end if;
  update private.bertha_hml_push_jobs set state='processing',attempts=attempts+1,lease_until=now()+interval '2 minutes' where id=j.id;
  url:='https://draduaila-web.github.io/It-s-my-life-/homologa%C3%A7%C3%A3o/'||case when j.recipient=own then 'helper-owner.html' else 'helper.html' end||'?v=371#'||case when j.kind='message' then 'messages' else 'invitations' end;
  return jsonb_build_object('id',j.id,'subscription_id',j.subscription_id,'kind',j.kind,'url',url);
 end if;raise exception 'Operação inválida.';
end;$$;
create function public.bertha_hml_push(op text,arg jsonb) returns jsonb language sql security invoker set search_path='' as $$select private.bertha_hml_push_operation(op,arg);$$;
revoke all on function private.bertha_hml_request_push(uuid),private.bertha_hml_enqueue_push(text,uuid,text,uuid),private.bertha_hml_push_event(),private.bertha_hml_push_operation(text,jsonb),public.bertha_hml_push(text,jsonb) from public,anon,authenticated;
grant execute on function private.bertha_hml_push_operation(text,jsonb),public.bertha_hml_push(text,jsonb) to service_role;
create function private.bertha_hml_retry_push() returns void language plpgsql security definer set search_path='' as $$declare j uuid;begin
 for j in select id from private.bertha_hml_push_jobs where state in ('pending','processing') and coalesce(lease_until,'epoch')<=now() and attempts<5 and created_at>now()-interval '24 hours' and coalesce(requested_at,'epoch')<now()-interval '1 minute' limit 50 loop perform private.bertha_hml_request_push(j);end loop;
 delete from private.bertha_hml_push_jobs where created_at<now()-interval '2 days';
end;$$;
revoke all on function private.bertha_hml_retry_push() from public,anon,authenticated;
select cron.schedule('bertha-hml-social-push','* * * * *','select private.bertha_hml_retry_push()');
