begin;
do $$
declare own uuid:=gen_random_uuid();a uuid:=gen_random_uuid();n uuid;ma uuid;c jsonb;i jsonb;msg uuid:=gen_random_uuid();j private.bertha_hml_push_jobs;r jsonb;num int;
begin
 insert into auth.users(id,email,email_confirmed_at) values(own,'qa-push-owner@example.invalid',now()),(a,'qa-push-a@example.invalid',now());
 perform set_config('request.jwt.claims',jsonb_build_object('sub',own,'role','authenticated')::text,true);n:=(public.bertha_hml_action('network','{}')->>'id')::uuid;ma:=(public.bertha_hml_invite_prepare('{"local_id":"qa-push","name":"QA Push","kind":"adult","permissions":{"convites":true}}')->>'id')::uuid;update public.bertha_hml_members set user_id=a where id=ma;
 insert into private.bertha_hml_push_devices(user_id,subscription_id,token_hash) values(own,gen_random_uuid(),'qa-only-token-hash'),(a,gen_random_uuid(),'qa-only-token-hash');
 perform set_config('request.jwt.claims',jsonb_build_object('sub',a,'role','authenticated')::text,true);c:=public.bertha_hml_social('open',jsonb_build_object('network_id',n,'user_a',a,'user_b',own));perform public.bertha_hml_social('send',jsonb_build_object('conversation_id',c->>'id','client_id',msg,'body','QA'));perform public.bertha_hml_social('send',jsonb_build_object('conversation_id',c->>'id','client_id',msg,'body','QA'));
 select count(*) into num from private.bertha_hml_push_jobs where recipient in(own,a);if num<>1 then raise exception 'FAIL push duplicado';end if;
 select * into j from private.bertha_hml_push_jobs where recipient=own;
 perform set_config('request.jwt.claims','{"role":"service_role"}',true);r:=public.bertha_hml_push('claim',jsonb_build_object('id',j.id,'nonce',gen_random_uuid()));if r is not null then raise exception 'FAIL nonce externo';end if;
 r:=public.bertha_hml_push('claim',jsonb_build_object('id',j.id,'nonce',j.nonce));if r->>'kind'<>'message' or (r->>'subscription_id')::uuid<>j.subscription_id then raise exception 'FAIL destinatário';end if;
 r:=public.bertha_hml_push('claim',jsonb_build_object('id',j.id,'nonce',j.nonce));if r is not null then raise exception 'FAIL envio concorrente';end if;
 perform public.bertha_hml_push('finish',jsonb_build_object('id',j.id,'nonce',j.nonce,'ok',true));r:=public.bertha_hml_push('claim',jsonb_build_object('id',j.id,'nonce',j.nonce));if r is not null then raise exception 'FAIL reenvio de entregue';end if;
 perform set_config('request.jwt.claims',jsonb_build_object('sub',own,'role','authenticated')::text,true);i:=public.bertha_hml_invitation('share',jsonb_build_object('network_id',n,'source_ref','qa-push','title','QA','targets',jsonb_build_array(ma)));perform public.bertha_hml_invitation('share',jsonb_build_object('network_id',n,'source_ref','qa-push','title','QA','targets',jsonb_build_array(ma)));
 select count(*) into num from private.bertha_hml_push_jobs where recipient in(own,a);if num<>2 then raise exception 'FAIL convite repetido notifica';end if;
 perform set_config('request.jwt.claims',jsonb_build_object('sub',a,'role','authenticated')::text,true);perform public.bertha_hml_invitation('respond',jsonb_build_object('invitation_id',i->>'id','status','yes'));perform public.bertha_hml_invitation('respond',jsonb_build_object('invitation_id',i->>'id','status','yes'));
 select count(*) into num from private.bertha_hml_push_jobs where recipient in(own,a);if num<>3 then raise exception 'FAIL resposta repetida notifica';end if;
 update public.bertha_hml_members set permissions='{}' where id=ma;select * into j from private.bertha_hml_push_jobs where recipient=a;perform set_config('request.jwt.claims','{"role":"service_role"}',true);r:=public.bertha_hml_push('claim',jsonb_build_object('id',j.id,'nonce',j.nonce));if r is not null then raise exception 'FAIL notifica convite revogado';end if;
 if has_function_privilege('authenticated','public.bertha_hml_push(text,jsonb)','EXECUTE') or has_function_privilege('anon','public.bertha_hml_push(text,jsonb)','EXECUTE') then raise exception 'FAIL serviço exposto';end if;
 raise notice 'PASS jobs únicos, nonce privado, concorrência, alvo autorizado e revogação. Inscrições fictícias; transação revertida antes de qualquer envio de rede.';
end;$$;
rollback;
