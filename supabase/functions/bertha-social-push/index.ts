const BASE=Deno.env.get('SUPABASE_URL')!,SERVICE=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,KEY=(Deno.env.get('ONESIGNAL_REST_API_KEY')||'').replace(/\s+/g,''),APP='18d49ac6-cdad-4780-8437-cbdcd025a680',ORIGIN='https://draduaila-web.github.io';
const headers={'Access-Control-Allow-Origin':ORIGIN,'Access-Control-Allow-Headers':'authorization,apikey,content-type','Access-Control-Allow-Methods':'POST,OPTIONS','Content-Type':'application/json','Cache-Control':'no-store'};
const uuid=(v:unknown)=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
function reply(body:unknown,status=200){return new Response(JSON.stringify(body),{status,headers});}
async function api(path:string,body?:unknown,token=SERVICE){const r=await fetch(BASE+path,{method:body===undefined?'GET':'POST',headers:{apikey:SERVICE,Authorization:'Bearer '+token,'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(25000)});const d=await r.json();if(!r.ok)throw Error('Acesso indisponível.');return d;}
async function rpc(op:string,arg:unknown){return api('/rest/v1/rpc/bertha_hml_push',{op,arg});}
async function sha(s:string){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))].map(x=>x.toString(16).padStart(2,'0')).join('');}
Deno.serve(async(req:Request)=>{
 if(req.headers.get('Origin')&&req.headers.get('Origin')!==ORIGIN)return reply({message:'Origem não autorizada.'},403);
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers});if(req.method!=='POST')return reply({},405);
 try{
  const raw=await req.text();if(raw.length>8000)return reply({},400);const input=JSON.parse(raw);
  if(input.op==='deliver'){
   if(!uuid(input.id)||!uuid(input.nonce))return reply({message:'Evento indisponível.'},403);
   const job=await rpc('claim',{id:input.id,nonce:input.nonce});if(!job)return reply({skipped:true});
   let ok=false;
   try{if(KEY){const r=await fetch('https://api.onesignal.com/notifications',{method:'POST',headers:{Authorization:'Key '+KEY,'Content-Type':'application/json'},body:JSON.stringify({app_id:APP,include_subscription_ids:[job.subscription_id],idempotency_key:job.id,headings:{en:'BERTH.A'},contents:{en:job.kind==='message'?'Você tem uma nova mensagem na BERTH.A.':job.kind==='invitation'?'Você recebeu um convite na BERTH.A.':'Você recebeu uma resposta ao convite na BERTH.A.'},url:job.url}),signal:AbortSignal.timeout(25000)});const data=await r.json();ok=r.ok&&!!data.id;}}finally{await rpc('finish',{id:input.id,nonce:input.nonce,ok});}
   return reply({accepted:ok});
  }
  const token=req.headers.get('Authorization')?.replace(/^Bearer /i,'');if(!token||token===SERVICE)return reply({message:'Entre na sua conta.'},401);const user=await api('/auth/v1/user',undefined,token);
  if(input.op==='config'){if(!KEY)return reply({configured:false,verificationReady:false});const check=await fetch('https://api.onesignal.com/apps/'+APP+'/users/by/onesignal_id/'+crypto.randomUUID(),{headers:{Authorization:'Key '+KEY},signal:AbortSignal.timeout(15000)});return reply({configured:true,verificationReady:check.status!==401&&check.status!==403,verificationStatus:check.status});}
  if(!uuid(input.subscription_id))return reply({message:'A inscrição deste aparelho ainda não está pronta.'},400);
  if(input.op==='unbind')return reply(await rpc('unbind',{user_id:user.id,subscription_id:input.subscription_id}));
  if(input.op!=='bind'||!uuid(input.onesignal_id)||typeof input.token!=='string'||input.token.length<20||input.token.length>4096)return reply({message:'Inscrição inválida.'},400);
  if(!KEY)return reply({message:'O serviço de notificações não está configurado.'},503);
  const r=await fetch('https://api.onesignal.com/apps/'+APP+'/users/by/onesignal_id/'+input.onesignal_id,{headers:{Authorization:'Key '+KEY},signal:AbortSignal.timeout(25000)});if(!r.ok)return reply({message:'Não foi possível conferir a inscrição deste aparelho.'},400);const data=await r.json();const sub=data.subscriptions?.find((s:any)=>s.id===input.subscription_id&&s.app_id===APP&&s.token===input.token&&s.enabled===true&&['ChromePush','SafariPush','FirefoxPush','WebPush','SafariLegacyPush'].includes(s.type));
  if(!sub)return reply({message:'A inscrição não corresponde a este aparelho ou está desativada.'},403);
  return reply(await rpc('bind',{user_id:user.id,subscription_id:input.subscription_id,token_hash:await sha(input.token)}));
 }catch(_){return reply({message:'Não foi possível concluir. Confira a conexão e tente novamente.'},400);}
});
