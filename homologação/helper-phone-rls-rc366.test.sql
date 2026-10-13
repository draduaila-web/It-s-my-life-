do $test$
declare o uuid:=gen_random_uuid();a uuid:=gen_random_uuid();b uuid:=gen_random_uuid();n uuid;ma uuid;mb uuid;tok uuid;emtoken uuid;unconfirmedtoken uuid;mc uuid;r jsonb;tid uuid;
begin
 insert into auth.users(id,email,email_confirmed_at,phone,phone_confirmed_at) values
 (o,'rc366-owner@example.invalid',now(),null,null),
 (a,null,null,'5511999999999',now()),
 (b,'rc366-b@example.invalid',now(),'5511988888888',null);
 perform set_config('request.jwt.claim.sub',o::text,true);perform set_config('role','authenticated',true);
 n:=(public.bertha_hml_action('network','{}')->>'id')::uuid;
 ma:=(public.bertha_hml_action('member',jsonb_build_object('network_id',n,'local_id','phone-a','name','QA phone A','permissions',jsonb_build_object('tasks',true)))->>'id')::uuid;
 mb:=(public.bertha_hml_action('member',jsonb_build_object('network_id',n,'local_id','phone-b','name','QA phone B','permissions',jsonb_build_object('tasks',true)))->>'id')::uuid;
 tok:=(public.bertha_hml_action('link',jsonb_build_object('network_id',n,'member_id',ma,'phone','+5511999999999'))->>'token')::uuid;
 emtoken:=(public.bertha_hml_action('link',jsonb_build_object('network_id',n,'member_id',mb,'email','rc366-b@example.invalid'))->>'token')::uuid;
 mc:=(public.bertha_hml_action('member',jsonb_build_object('network_id',n,'local_id','unconfirmed-c','name','QA unconfirmed','permissions',jsonb_build_object('tasks',true)))->>'id')::uuid;
 unconfirmedtoken:=(public.bertha_hml_action('link',jsonb_build_object('network_id',n,'member_id',mc,'phone','+5511988888888'))->>'token')::uuid;
 perform set_config('request.jwt.claim.sub',b::text,true);
 begin perform public.bertha_hml_action('link_accept',jsonb_build_object('token',unconfirmedtoken));raise exception 'FAIL matching but unconfirmed phone';exception when insufficient_privilege then null;end;
 begin perform public.bertha_hml_action('link_accept',jsonb_build_object('token',tok));raise exception 'FAIL wrong/unconfirmed phone';exception when insufficient_privilege then null;end;
 perform set_config('request.jwt.claim.sub',a::text,true);
 begin perform public.bertha_hml_action('link_accept',jsonb_build_object('token',emtoken));raise exception 'FAIL null email bypass';exception when insufficient_privilege then null;end;
 r:=public.bertha_hml_action('link_accept',jsonb_build_object('token',tok));
 if r->>'user_id'<>a::text or r->>'id'<>ma::text then raise exception 'FAIL stable member/user IDs';end if;
 r:=public.bertha_hml_action('link_accept',jsonb_build_object('token',tok));if r->>'id'<>ma::text then raise exception 'FAIL link retry';end if;
 perform set_config('request.jwt.claim.sub',b::text,true);
 r:=public.bertha_hml_action('link_accept',jsonb_build_object('token',emtoken));if r->>'user_id'<>b::text then raise exception 'FAIL legacy email';end if;
 perform set_config('request.jwt.claim.sub',o::text,true);
 tid:=(public.bertha_hml_action('share',jsonb_build_object('network_id',n,'source_ref','phone-qa','title','QA phone task','task_date',current_date,'targets',jsonb_build_array(ma),'responsibility','help'))->>'id')::uuid;
 perform set_config('request.jwt.claim.sub',a::text,true);
 perform public.bertha_hml_action('claim',jsonb_build_object('task_id',tid));
 perform public.bertha_hml_action('start',jsonb_build_object('task_id',tid));
 r:=public.bertha_hml_action('complete',jsonb_build_object('task_id',tid));if r->>'state'<>'validated' then raise exception 'FAIL phone account task';end if;
 perform set_config('request.jwt.claim.sub',o::text,true);
 perform public.bertha_hml_action('pause',jsonb_build_object('network_id',n,'member_id',ma));
 perform set_config('request.jwt.claim.sub',a::text,true);
 begin perform public.bertha_hml_action('link_accept',jsonb_build_object('token',tok));raise exception 'FAIL revoked phone link';exception when raise_exception then if SQLERRM like 'FAIL%' then raise;end if;end;
 perform set_config('role','postgres',true);
 raise notice 'PASS RC366: confirmed phone invitation, wrong/unconfirmed phone denied, no null-email bypass, stable IDs, legacy email, tasks and revoked link. Fixtures rolled back by enclosing transaction; does not prove OTP/SMS.';
end;
$test$;
