// HML only. No real email/SMS sent. Code hash is the authentication proof on claim.
const BASE=Deno.env.get('SUPABASE_URL')!,SERVICE=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ORIGIN='https://draduaila-web.github.io';
const headers={'Access-Control-Allow-Origin':ORIGIN,'Access-Control-Allow-Headers':'authorization, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json','Cache-Control':'no-store'};
function reply(body:unknown,status=200){return new Response(JSON.stringify(body),{status,headers});}
async function sha(s:string){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))].map(x=>x.toString(16).padStart(2,'0')).join('');}
async function api(path:string,body?:unknown,token=SERVICE){const r=await fetch(BASE+path,{method:body===undefined?'GET':'POST',headers:{apikey:SERVICE,Authorization:'Bearer '+token,'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});const d=await r.json();if(!r.ok)throw new Error(d.message||d.msg||'Serviço de acesso indisponível.');return d;}
async function rpc(op:string,arg:unknown){return api('/rest/v1/rpc/bertha_hml_code_service',{op,arg});}
function randomCode(){const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';const bytes=crypto.getRandomValues(new Uint8Array(12));return [...bytes].map(x=>alphabet[x&31]).join('');}
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
  if(input.op==='revoke')return reply(await rpc('revoke',{member_id:member.id,owner_id:owner.id}));
  let uid=member.user_id;
  if(uid){const existing=await api('/auth/v1/admin/users/'+uid);if(existing.app_metadata?.bertha_code_member!==member.id)return reply({message:'Este perfil já usa uma conta por e-mail. O acesso existente foi preservado.'},409);}
  else{
   const account=await api('/auth/v1/admin/users',{email:'satellite-'+crypto.randomUUID()+'@bertha.example.invalid',password:crypto.randomUUID()+crypto.randomUUID(),email_confirm:true,app_metadata:{bertha_code_member:member.id},user_metadata:{name:member.name}});uid=account.id;
  }
  const code=randomCode(),result=await rpc('issue',{member_id:member.id,owner_id:owner.id,user_id:uid,code_hash:await sha(code)});
  return reply({...result,code:code.match(/.{4}/g)!.join('-'),member_id:member.id});
 }catch(_){return reply({message:'Não foi possível concluir. Confira a conexão e tente novamente.'},400);}
});
