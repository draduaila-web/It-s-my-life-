// HML only. No real email/SMS sent. Code hash is the authentication proof on claim.
const BASE=Deno.env.get('SUPABASE_URL')!,SERVICE=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ORIGIN='https://draduaila-web.github.io';
const headers={'Access-Control-Allow-Origin':ORIGIN,'Access-Control-Allow-Headers':'authorization, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json','Cache-Control':'no-store'};
function reply(body:unknown,status=200){return new Response(JSON.stringify(body),{status,headers});}
async function sha(s:string){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))].map(x=>x.toString(16).padStart(2,'0')).join('');}
async function api(path:string,body?:unknown,token=SERVICE){const r=await fetch(BASE+path,{method:body===undefined?'GET':'POST',headers:{apikey:SERVICE,Authorization:'Bearer '+token,'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});const d=await r.json();if(!r.ok){const error=new Error('Serviço de acesso indisponível.');Object.assign(error,{status:r.status});throw error;}return d;}
async function rpc(op:string,arg:unknown){return api('/rest/v1/rpc/bertha_hml_code_service',{op,arg});}
// Domain-separated HMAC: recover the same 60-bit code without persisting plaintext.
// Rotation fails closed for old operations; an explicit replacement is required.
async function operationCode(id:string){
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(SERVICE),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 const bytes=new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode('bertha-hml-invite-v1:'+id)));
 const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';return [...bytes.slice(0,12)].map(x=>alphabet[x&31]).join('');
}
async function account(id:string){try{return await api('/auth/v1/admin/users/'+id);}catch(e){if((e as {status?:number}).status===404)return null;throw e;}}
Deno.serve(async(req:Request)=>{
 if(req.headers.get('Origin')&&req.headers.get('Origin')!==ORIGIN)return reply({message:'Origem não autorizada.'},403);
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
 if(req.method!=='POST')return reply({message:'Use o aplicativo BERTH.A.'},405);
 try{
  const text=await req.text();if(text.length>6000)return reply({message:'Solicitação inválida.'},400);const input=JSON.parse(text);
  if(input.op==='claim'){
   const code=String(input.code||'').toUpperCase().replace(/[\s-]/g,''),nonce=String(input.nonce||'');
   if(!/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{12}$/.test(code)||!/^[-a-f0-9]{36}$/i.test(nonce)||!['adult','kids'].includes(input.kind))return reply({message:'Confira o código enviado pelo Owner.'},400);
   const grant=await rpc('claim',{code_hash:await sha(code),nonce_hash:await sha(nonce),kind:input.kind,ip_hash:await sha((req.headers.get('x-forwarded-for')||'unknown').split(',')[0].trim())});
   if(grant?.rate_limited)return reply({message:'Aguarde um pouco antes de tentar novamente.'},429);
   if(!grant?.user_id)return reply({message:'Código indisponível, expirado ou já utilizado. Peça um novo ao Owner.'},403);
   const link=await api('/auth/v1/admin/generate_link',{type:'magiclink',email:grant.email});
   const session=await api('/auth/v1/verify',{type:'email',token_hash:link.hashed_token});
   if(session.user?.id!==grant.user_id||!session.access_token||!session.refresh_token)throw new Error('Não foi possível confirmar este acesso.');
   return reply({session,member:grant.member});
  }
  if(!['issue','revoke'].includes(input.op))return reply({message:'Solicitação inválida.'},400);
  const token=req.headers.get('Authorization')?.replace(/^Bearer /i,'');if(!token||token===SERVICE)return reply({message:'Conecte a conta do Owner.'},401);
  const owner=await api('/auth/v1/user',undefined,token);
  if(!owner.email_confirmed_at||owner.app_metadata?.bertha_code_member)return reply({message:'Somente o Owner pode convidar.'},403);
  const member=await api('/rest/v1/rpc/bertha_hml_invite_prepare',{arg:input.member},token);
  if(input.op==='revoke')return reply(await rpc('revoke',{member_id:member.id,owner_id:owner.id,operation_id:input.previous_operation||null}));
  const previous=input.previous_operation;
  if(previous!==undefined&&!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(previous))return reply({message:'Confira o convite antes de substituir.'},400);
  const keyId=await sha('bertha-hml-invite-key-v1:'+SERVICE);
  const operation=await rpc('reserve',{member_id:member.id,owner_id:owner.id,kind:member.kind,key_id:keyId,previous_operation:previous||null});
  const identity={member_id:member.id,owner_id:owner.id,operation_id:operation.id};
  if(operation.key_id!==keyId)return reply({operation_id:operation.id,state:'key_changed',member_id:member.id});
  // A reserved UUID/email exists before Auth is called. A lost response remains recoverable.
  let existing=await account(operation.user_id);
  if(!existing){
   try{await api('/auth/v1/admin/users',{id:operation.user_id,email:'satellite-'+operation.user_id+'@bertha.example.invalid',password:crypto.randomUUID()+crypto.randomUUID(),email_confirm:true,app_metadata:{bertha_code_member:member.id},user_metadata:{name:member.name}});}
   catch(_){/* Could be a concurrent create or a lost response. Read exact reserved ID. */}
   existing=await account(operation.user_id);
  }
  if(existing?.id!==operation.user_id||existing.app_metadata?.bertha_code_member!==member.id)throw new Error('Conta reservada indisponível.');
  const code=await operationCode(operation.id);
  const result=await rpc('finish',{...identity,user_id:operation.user_id,code_hash:await sha(code),key_id:keyId});
  return reply({...result,operation_id:operation.id,member_id:member.id,...(result.state==='ready'?{code:code.match(/.{4}/g)!.join('-')}:{})});
 }catch(_){return reply({message:'Não foi possível concluir. Confira a conexão e tente novamente.'},400);}
});
