-- One statement, one subtransaction. Fixtures always roll back, including Auth rows.
do $test$
declare o uuid:=gen_random_uuid(); a uuid:=gen_random_uuid(); b uuid:=gen_random_uuid(); c uuid:=gen_random_uuid();
 n uuid; ma uuid; mb uuid; tok uuid; tokb uuid; tid uuid; ta uuid; r jsonb; cnt int;
begin
 begin
  insert into auth.users(id,email,email_confirmed_at) values
  (o,'owner-rc363@example.invalid',now()),(a,'a-rc363@example.invalid',now()),(b,'b-rc363@example.invalid',now()),(c,'outside-rc363@example.invalid',now());
  perform set_config('request.jwt.claim.sub',o::text,true);
  perform set_config('role','authenticated',true);
  n:=(public.bertha_hml_action('network','{}')->>'id')::uuid;
  ma:=(public.bertha_hml_action('member',jsonb_build_object('network_id',n,'local_id','qa-a','name','QA A','permissions',jsonb_build_object('tasks',true),'requires_validation',true))->>'id')::uuid;
  mb:=(public.bertha_hml_action('member',jsonb_build_object('network_id',n,'local_id','qa-b','name','QA B','permissions',jsonb_build_object('tasks',true)))->>'id')::uuid;
  tok:=(public.bertha_hml_action('link',jsonb_build_object('network_id',n,'member_id',ma,'email','a-rc363@example.invalid'))->>'token')::uuid;
  tokb:=(public.bertha_hml_action('link',jsonb_build_object('network_id',n,'member_id',mb,'email','b-rc363@example.invalid'))->>'token')::uuid;
  tid:=(public.bertha_hml_action('share',jsonb_build_object('network_id',n,'source_ref','qa-task:2026-10-12','title','QA Task','task_date','2026-10-12','targets',jsonb_build_array(ma),'responsibility','help'))->>'id')::uuid;
  select count(*) into cnt from public.bertha_hml_tasks; if cnt<>1 then raise exception 'FAIL Owner scope';end if;
  perform set_config('request.jwt.claim.sub',b::text,true);
  begin
   perform public.bertha_hml_action('link_accept',jsonb_build_object('token',tok));
   raise exception 'FAIL wrong email';
  exception when insufficient_privilege then null;
  end;
  select count(*) into cnt from public.bertha_hml_tasks;if cnt<>0 then raise exception 'FAIL unlinked read';end if;
  perform public.bertha_hml_action('link_accept',jsonb_build_object('token',tokb));
  select count(*) into cnt from public.bertha_hml_tasks;if cnt<>0 then raise exception 'FAIL same network wrong target read';end if;
  perform set_config('request.jwt.claim.sub',a::text,true);
  r:=public.bertha_hml_action('link_accept',jsonb_build_object('token',tok));if r->>'local_id'<>'qa-a' then raise exception 'FAIL local ID';end if;
  r:=public.bertha_hml_action('link_accept',jsonb_build_object('token',tok));if r->>'local_id'<>'qa-a' then raise exception 'FAIL retry link';end if;
  select count(*) into cnt from public.bertha_hml_members;if cnt<>1 then raise exception 'FAIL membership read';end if;
  select count(*) into cnt from public.bertha_hml_links;if cnt<>0 then raise exception 'FAIL invitation read';end if;
  select count(*) into cnt from public.bertha_hml_tasks;if cnt<>1 then raise exception 'FAIL target read';end if;
  begin
   insert into public.bertha_hml_tasks(network_id,source_ref,title,task_date,targets,responsibility)values(n,'bad','bad',current_date,array[ma],'help');
   raise exception 'FAIL direct write';
  exception when insufficient_privilege then null;
  end;
  begin
   perform public.bertha_hml_action('complete',jsonb_build_object('task_id',tid));
   raise exception 'FAIL premature completion';
  exception when raise_exception then if SQLERRM like 'FAIL%' then raise;end if;
  end;
  r:=public.bertha_hml_action('claim',jsonb_build_object('task_id',tid));if r->>'state'<>'accepted' then raise exception 'FAIL claim';end if;
  perform public.bertha_hml_action('claim',jsonb_build_object('task_id',tid));
  r:=public.bertha_hml_action('start',jsonb_build_object('task_id',tid));if r->>'state'<>'in_progress' then raise exception 'FAIL start';end if;
  perform set_config('request.jwt.claim.sub',o::text,true);
  r:=public.bertha_hml_action('share',jsonb_build_object('network_id',n,'source_ref','qa-task:2026-10-12','title','QA Task','task_date','2026-10-12','targets',jsonb_build_array(mb),'responsibility','help'));
  if r->>'state'<>'in_progress' or r->>'id'<>tid::text or jsonb_array_length(r->'targets')<>2 then raise exception 'FAIL multi target/state preservation';end if;
  perform set_config('request.jwt.claim.sub',b::text,true);
  select count(*) into cnt from public.bertha_hml_tasks;if cnt<>1 then raise exception 'FAIL newly authorized target';end if;
  begin perform public.bertha_hml_action('claim',jsonb_build_object('task_id',tid));raise exception 'FAIL second claim';exception when raise_exception then if SQLERRM like 'FAIL%' then raise;end if;end;
  perform set_config('request.jwt.claim.sub',a::text,true);
  r:=public.bertha_hml_action('complete',jsonb_build_object('task_id',tid));if r->>'state'<>'completed' then raise exception 'FAIL validation rule';end if;
  perform public.bertha_hml_action('complete',jsonb_build_object('task_id',tid));
  select count(*) into cnt from public.bertha_hml_events;if cnt<>3 then raise exception 'FAIL duplicate events';end if;
  perform set_config('request.jwt.claim.sub',c::text,true);
  select count(*) into cnt from public.bertha_hml_tasks;if cnt<>0 then raise exception 'FAIL another account read';end if;
  select count(*) into cnt from public.bertha_hml_networks;if cnt<>0 then raise exception 'FAIL another account network';end if;
  perform set_config('request.jwt.claim.sub',o::text,true);
  r:=public.bertha_hml_action('validate',jsonb_build_object('network_id',n,'task_id',tid));if r->>'state'<>'validated' then raise exception 'FAIL Owner validate';end if;
  perform public.bertha_hml_action('validate',jsonb_build_object('network_id',n,'task_id',tid));
  select count(*) into cnt from public.bertha_hml_events;if cnt<>4 then raise exception 'FAIL validation duplicate';end if;
  ta:=tid;
  tid:=(public.bertha_hml_action('share',jsonb_build_object('network_id',n,'source_ref','qa-b-no-validation','title','QA B task','task_date','2026-10-12','targets',jsonb_build_array(mb),'responsibility','help'))->>'id')::uuid;
  perform set_config('request.jwt.claim.sub',b::text,true);
  perform public.bertha_hml_action('claim',jsonb_build_object('task_id',tid));
  perform public.bertha_hml_action('start',jsonb_build_object('task_id',tid));
  r:=public.bertha_hml_action('complete',jsonb_build_object('task_id',tid));if r->>'state'<>'validated' then raise exception 'FAIL individual optional validation';end if;
  perform set_config('request.jwt.claim.sub',o::text,true);
  perform public.bertha_hml_action('pause',jsonb_build_object('network_id',n,'member_id',ma));
  perform set_config('request.jwt.claim.sub',a::text,true);
  select count(*) into cnt from public.bertha_hml_tasks;if cnt<>0 then raise exception 'FAIL revoke read';end if;
  begin perform public.bertha_hml_action('claim',jsonb_build_object('task_id',ta));raise exception 'FAIL revoke write';exception when insufficient_privilege then null;end;
  perform set_config('request.jwt.claim.sub',o::text,true);
  perform public.bertha_hml_action('resume',jsonb_build_object('network_id',n,'member_id',ma));
  perform set_config('request.jwt.claim.sub',a::text,true);
  select count(*) into cnt from public.bertha_hml_tasks;if cnt<>1 then raise exception 'FAIL Owner authorized resume';end if;
  perform set_config('role','postgres',true);
  raise exception using errcode='PZ001',message='Tests passed; rollback fixtures';
 exception when sqlstate 'PZ001' then
  raise notice 'PASS: HML backend guarded lifecycle, RLS and revocation; fixtures rolled back.';
 end;
end;
$test$;
