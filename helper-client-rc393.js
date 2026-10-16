(function(root){
'use strict';
function dateValid(s){if(!/^\d{4}-\d{2}-\d{2}$/.test(s||''))return false;var d=new Date(s+'T12:00:00Z');return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===s;}
function localDay(d){d=d||new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function bucket(s,today){if(!dateValid(s)||!dateValid(today))return 'undated';if(s===today)return 'today';var y=new Date(today+'T12:00:00Z');y.setUTCDate(y.getUTCDate()-1);if(s===y.toISOString().slice(0,10))return 'yesterday';return s<today?'earlier':'upcoming';}
function escape(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function ownerSources(storage){
 function read(k){try{if(root.BerthaPersonalRuntime)root.BerthaPersonalRuntime.inspectLocalOwner();return JSON.parse(storage.getItem((root.BerthaPersonalStorage?root.BerthaPersonalStorage.CONTRACT.prefix:(root.BerthaResetStoragePrefix||'bertha-hml::'))+k)||'null');}catch(_){return null;}}
 var sat=read('bertha.satellites.v1')||{},casa=read('minha-vida.casa.v1')||{},tasks=[];
 (casa.areas||[]).forEach(function(a){(a.tasks||[]).forEach(function(t){tasks.push({task:t,area:a.title||'Casa',kind:'routine'});});});
 (casa.maintenance||[]).forEach(function(t){tasks.push({task:t,area:t.area||'Manutenção',kind:'maintenance'});});
 return {members:(sat.members||[]).filter(function(m){return m.role==='adult'&&m.status!=='removed'&&m.status!=='paused';}),
 tasks:tasks.filter(function(x){return ['help','delegated'].includes(x.task.responsibility)&&!x.task.done&&x.task.status!=='concluida'&&!['completed','validated'].includes(x.task.satelliteStatus);})};
}
function eligibleSource(x,m){
 if(!m||!m.permissions||(x.kind==='mission'?!(m.permissions.missions===true||m.permissions.casa===true):m.permissions.casa!==true))return false;
 var t=x.task,targets=Array.isArray(t.assigneeIds)&&t.assigneeIds.length?t.assigneeIds:(t.assigneeId?[t.assigneeId]:[]);
 if(t.claimedById&&String(t.claimedById)!==String(m.id))return false;
 return t.responsibility==='help'||targets.map(String).includes(String(m.id));
}
function sessionStorageFor(primary,fallback,key){
 var selected=fallback,persistent=false;
 try{var probe=key+'.probe';primary.setItem(probe,'1');primary.removeItem(probe);selected=primary;persistent=true;}catch(_){}
 if(persistent){try{if(!selected.getItem(key)&&fallback.getItem(key)){selected.setItem(key,fallback.getItem(key));fallback.removeItem(key);}}catch(_){}}
 return {storage:selected,persistent:persistent};
}
function createClient(options){
 var storage=options.storage,fetcher=options.fetch||root.fetch.bind(root),key=options.key,
 base=options.base,sessionKey=options.sessionKey,session=null,refreshing=null,authVersion=0,resetGate=root.BerthaResetTransport?root.BerthaResetTransport.createGate({role:options.resetRole||'owner',namespace:root.BerthaPersonalStorage?root.BerthaPersonalStorage.CONTRACT.prefix:'bertha-hml-reset-v1::',isolationEvidence:function(){return root.BerthaResetStoragePrefix===(root.BerthaPersonalStorage?root.BerthaPersonalStorage.CONTRACT.prefix:'bertha-hml-reset-v1::');}}):null;
 try{session=JSON.parse(storage.getItem(sessionKey)||'null');}catch(_){}
 function save(s){session=s;if(s)storage.setItem(sessionKey,JSON.stringify(s));else storage.removeItem(sessionKey);}
 async function raw(path,method,body,token){
  var controller=new AbortController(),timer=setTimeout(function(){controller.abort();},20000);
  try{
   var lease=null; if(root.BerthaPersonalRuntime&&(/^(?:\/rest\/v1\/|\/functions\/v1\/)/.test(path))){if(token!==syncSession()?.access_token&&!(path==='/functions/v1/bertha-code-access'&&!token&&body?.op==='claim'))throw Error('A conta mudou. Confira antes de continuar.');lease=root.BerthaPersonalRuntime.assertRequest({path:path,method:method||'GET',sessionKey:sessionKey,sessionUserId:syncSession()?.user?.id,anonymousClaim:path==='/functions/v1/bertha-code-access'&&!token&&body?.op==='claim'});}
   var headers={'apikey':key,'Content-Type':'application/json'};
   if(token)headers.Authorization='Bearer '+token;if(resetGate)Object.assign(headers,resetGate.headers(path));
   var response=await fetcher(base+path,{method:method||'GET',headers:headers,body:body==null?undefined:JSON.stringify(body),signal:controller.signal,cache:'no-store'});
   var text=await response.text(),data;try{data=text?JSON.parse(text):null;}catch(_){throw new Error('Resposta inválida. Tente atualizar.');}
   if(!response.ok){var error=new Error(data&&data.message||data&&data.msg||data&&data.error_description||'Não foi possível completar a ação.');error.status=response.status;throw error;}
   if(lease)root.BerthaPersonalRuntime.assertResponse(lease);
   return data;
  }catch(e){if(e.name==='AbortError')throw new Error('A conexão demorou. Confira antes de repetir a ação.');throw e;}
  finally{clearTimeout(timer);}
 }
 function storeSession(s){if(!s||!s.access_token||!s.refresh_token)throw new Error('Entre novamente na sua conta.');save(Object.assign({},s,{expires_at:s.expires_at||Math.floor(Date.now()/1000)+(s.expires_in||3600)}));return session;}
 function syncSession(){try{session=JSON.parse(storage.getItem(sessionKey)||'null');}catch(_){session=null;}return session;}
 async function token(){
  syncSession();var startUser=session?.user?.id;
  if(!session)throw new Error('Entre na sua conta.');
  if(session.expires_at>Math.floor(Date.now()/1000)+60)return session.access_token;
  if(!refreshing){var version=authVersion,refreshToken=session.refresh_token;refreshing=raw('/auth/v1/token?grant_type=refresh_token','POST',{refresh_token:session.refresh_token}).then(function(s){if(version!==authVersion||!syncSession()||session.refresh_token!==refreshToken)throw new Error('A conta mudou. Entre novamente.');return storeSession(s);}).catch(function(e){if(version===authVersion&&(e.status===400||e.status===401))save(null);throw e;}).finally(function(){refreshing=null;});}
  await refreshing;if(syncSession()?.user?.id!==startUser)throw Error('A conta mudou. Entre novamente.');return session.access_token;
 }
 var api={
  session:syncSession,
  acknowledgeReset:function(n,r){if(!resetGate)throw Error('Atualize o aplicativo para continuar.');return resetGate.adopt(n,r);},
  resetPlan:function(rows){return resetGate&&resetGate.current()?resetGate.plan(rows):rows;},
  refreshMissions:async function(nid){return raw('/rest/v1/rpc/bertha_hml_refresh_missions','POST',{nid:nid},await token());},
  syncTasks:async function(arg){return raw('/rest/v1/rpc/bertha_hml_sync_tasks','POST',{arg:arg},await token());},
  recognize:async function(arg){return raw('/rest/v1/rpc/bertha_hml_recognize','POST',{arg:arg},await token());},
  shareGuide:async function(arg){return raw('/rest/v1/rpc/bertha_hml_guide_share','POST',{arg:arg},await token());},
  push:async function(op,arg,expected){var t=await token();if(expected&&syncSession()?.user?.id!==expected)throw new Error('A conta mudou. Confira suas notificações.');return raw('/functions/v1/bertha-social-push','POST',Object.assign({op:op},arg),t);},
  personalReminders:async function(op,arg,expected){if(!['list','replace'].includes(op)||!expected)throw new Error('Confira a operação e a conta dos avisos pessoais.');var t=await token();if(syncSession()?.user?.id!==expected)throw new Error('A conta mudou. Confira seus avisos pessoais.');return raw('/rest/v1/rpc/bertha_personal_reminders','POST',{op:op,arg:arg},t);},
  social:async function(op,arg,expected){var t=await token();if(expected&&syncSession()?.user?.id!==expected)throw new Error('A conta mudou. Confira antes de enviar.');return raw('/rest/v1/rpc/bertha_hml_social','POST',{op:op,arg:arg},t);},
  invitation:async function(op,arg,expected){var t=await token();if(expected&&syncSession()?.user?.id!==expected)throw new Error('A conta mudou. Confira antes de responder.');return raw('/rest/v1/rpc/bertha_hml_invitation','POST',{op:op,arg:arg},t);},
  inviteCode:async function(member,op){return raw('/functions/v1/bertha-code-access','POST',{op:op||'issue',member:member},await token());},
  prepareInvite:async function(member){return raw('/rest/v1/rpc/bertha_hml_invite_prepare','POST',{arg:member},await token());},
  enterCode:async function(code,kind,nonce){var version=authVersion;code=String(code||'').toUpperCase().replace(/[\s-]/g,'');if(!/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{12}$/.test(code)||!['adult','kids'].includes(kind))throw new Error('Confira o código enviado pelo Owner.');var result=await raw('/functions/v1/bertha-code-access','POST',{op:'claim',code:code,kind:kind,nonce:nonce});if(!result?.session?.access_token||!result.session.refresh_token||result.member?.kind!==kind||result.session.user?.id!==result.member.user_id)throw new Error('Não foi possível confirmar este acesso.');var found=await raw('/auth/v1/user','GET',null,result.session.access_token);if(found?.id!==result.member.user_id||version!==authVersion)throw new Error('A conta mudou. Confira antes de entrar.');authVersion++;storeSession(Object.assign({},result.session,{user:found}));return result.member;},
  verifyEmailOtp:async function(email,code){var version=authVersion;email=String(email||'').trim().toLowerCase();code=String(code||'').trim();if(!/^[^\s@]+@[^\s@]+[.][^\s@]+$/.test(email)||!/^\d{6,10}$/.test(code))throw new Error('Confira o e-mail e digite o código completo recebido.');var data;try{data=await raw('/auth/v1/verify','POST',{email:email,token:code,type:'email'});}catch(e){if(e.status===400||e.status===403)throw new Error('Código inválido ou expirado. Confira o código completo do último e-mail.');throw e;}if(!data?.access_token||!data.refresh_token)throw new Error('Não foi possível confirmar este acesso.');var found=await raw('/auth/v1/user','GET',null,data.access_token);if(!found?.email_confirmed_at||found.email.toLowerCase()!==email||version!==authVersion)throw new Error('Este código não corresponde à conta informada.');authVersion++;return storeSession(Object.assign({},data,{user:found}));},
  verifyEmailLink:async function(link,email){var version=authVersion,url;try{url=new URL(String(link||'').trim());}catch(_){throw new Error('Copie o link completo do e-mail.');}email=String(email||'').trim().toLowerCase();if(!/^[^\s@]+@[^\s@]+[.][^\s@]+$/.test(email))throw new Error('Informe o e-mail usado para pedir este acesso.');if(url.origin!==new URL(base).origin||url.pathname!=='/auth/v1/verify'||url.username||url.password||!['magiclink','signup','email'].includes(url.searchParams.get('type')))throw new Error('Use o link original de acesso recebido no e-mail da BERTH.A.');var hash=url.searchParams.get('token')||url.searchParams.get('token_hash');if(!hash||hash.length>512)throw new Error('O link não contém uma confirmação válida.');var data;try{data=await raw('/auth/v1/verify','POST',{token_hash:hash,type:'email'});}catch(e){if(e.status===400||e.status===403)throw new Error('Este link já foi usado ou expirou. Peça um novo e copie sem abrir no Safari.');throw e;}if(!data?.access_token||!data.refresh_token)throw new Error('Não foi possível confirmar este acesso.');var found=await raw('/auth/v1/user','GET',null,data.access_token);if(!found?.email_confirmed_at||found.email.toLowerCase()!==email||version!==authVersion)throw new Error('Este acesso não corresponde ao e-mail informado.');authVersion++;return storeSession(Object.assign({},data,{user:found}));},
  requestEmailLink:async function(email,redirect){email=String(email||'').trim().toLowerCase();if(!/^[^\s@]+@[^\s@]+[.][^\s@]+$/.test(email))throw new Error('Confira seu e-mail.');var url=new URL(redirect);if(url.origin!=='https://draduaila-web.github.io'||!/^\/It-s-my-life-\/(?:homologa(?:%C3%A7%C3%A3|çã)o\/)?helper(?:-owner)?[.]html$/i.test(url.pathname)||url.username||url.password||Array.from(url.searchParams).some(function(entry){return entry[0]==='v'?!/^[0-9A-Za-z._-]{1,40}$/.test(entry[1]):entry[0]==='return'?entry[1]!=='main':entry[0]==='invite'?!/^[0-9a-f-]{36}$/i.test(entry[1]):true;}))throw new Error('Destino de acesso não autorizado.');url.hash='';await raw('/auth/v1/otp?redirect_to='+encodeURIComponent(url.href),'POST',{email:email,create_user:true});return {email:email};},
  inspectEmailSession:async function(input){if(!input||!input.access_token||!input.refresh_token)throw new Error('O link não trouxe um acesso válido. Solicite outro.');var version=authVersion,found=await raw('/auth/v1/user','GET',null,input.access_token);if(!found||!found.id||!found.email_confirmed_at)throw new Error('Confirme seu e-mail para entrar.');var renewed=await raw('/auth/v1/token?grant_type=refresh_token','POST',{refresh_token:input.refresh_token});if(version!==authVersion)throw new Error('A conta mudou. Entre novamente.');if(renewed?.user?.id!==found.id||!renewed.access_token||!renewed.refresh_token)throw new Error('O link não corresponde à mesma conta. Solicite outro.');return Object.assign({},renewed,{user:found});},
  acceptEmailSession:function(checked){if(!checked?.user?.id)throw new Error('Confira sua conta antes de entrar.');authVersion++;return storeSession(checked);},
  signIn:async function(email,password){var v=++authVersion,s=await raw('/auth/v1/token?grant_type=password','POST',{email:email,password:password});if(v!==authVersion)throw new Error('A conta mudou. Entre novamente.');return storeSession(s);},
  signUp:async function(email,password){var v=++authVersion,data=await raw('/auth/v1/signup','POST',{email:email,password:password});if(v!==authVersion)throw new Error('A conta mudou. Entre novamente.');if(data&&data.access_token)storeSession(data);return data;},
  signOut:async function(){var tokenAtLogout=session&&session.access_token;authVersion++;if(resetGate)resetGate.clear();save(null);if(tokenAtLogout)await raw('/auth/v1/logout?scope=local','POST',{},tokenAtLogout);},
  user:async function(){return raw('/auth/v1/user','GET',null,await token());},
  kidsProfile:async function(arg){return raw('/rest/v1/rpc/bertha_hml_kids_profile','POST',{arg:arg},await token());},
  kidsAction:async function(op,arg){return raw('/rest/v1/rpc/bertha_hml_kids_action','POST',{op:op,arg:arg},await token());},
  query:async function(table,query){if(!/^bertha_hml_(networks|members|kids_profiles|links|tasks|recognitions|events|conversations|messages|invitations|invitation_responses|guides)$/.test(table))throw new Error('Fonte não autorizada.');return raw('/rest/v1/'+table+'?'+query,'GET',null,await token());},
  action:async function(op,arg){return raw('/rest/v1/rpc/bertha_hml_action','POST',{op:op,arg:arg},await token());}
 };
 return root.BerthaPersonalRuntime?root.BerthaPersonalRuntime.decorateClient(api,options):api;
}
function inviteCodeValue(value){var code=String(value||'').toUpperCase().replace(/[\s-]/g,'');return /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{12}$/.test(code)?code:null;}
function inviteToken(value){
 var text=String(value||'').trim(),uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
 if(uuid.test(text))return text;
 try{var url=new URL(text);if(url.origin!=='https://draduaila-web.github.io'||!['/It-s-my-life-/helper.html','/It-s-my-life-/homologação/helper.html'].includes(decodeURIComponent(url.pathname))||url.username||url.password)return null;
 var token=url.searchParams.get('invite')||new URLSearchParams(url.hash.slice(1)).get('link');return uuid.test(token||'')?token:null;}catch(_){return null;}
}
var api={inviteCodeValue:inviteCodeValue,inviteToken:inviteToken,dateValid:dateValid,localDay:localDay,bucket:bucket,escape:escape,ownerSources:ownerSources,eligibleSource:eligibleSource,sessionStorageFor:sessionStorageFor,createClient:createClient};
if(typeof module==='object'&&module.exports)module.exports=api;else root.BerthaHelper=api;
})(typeof window==='object'?window:globalThis);




