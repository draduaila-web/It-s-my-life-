(function(root){
'use strict';
function dateValid(s){if(!/^\d{4}-\d{2}-\d{2}$/.test(s||''))return false;var d=new Date(s+'T12:00:00Z');return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===s;}
function localDay(d){d=d||new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function bucket(s,today){if(!dateValid(s)||!dateValid(today))return 'undated';if(s===today)return 'today';var y=new Date(today+'T12:00:00Z');y.setUTCDate(y.getUTCDate()-1);if(s===y.toISOString().slice(0,10))return 'yesterday';return s<today?'earlier':'upcoming';}
function escape(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function ownerSources(storage){
 function read(k){try{return JSON.parse(storage.getItem('bertha-hml::'+k)||'null');}catch(_){return null;}}
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
 var persistent=false,queueKey=key+'.pendingLogout.v1';
 try{var probe=key+'.probe';primary.setItem(probe,'1');primary.removeItem(probe);persistent=true;}catch(_){}
 if(!persistent||primary===fallback)return {storage:persistent?primary:fallback,persistent:persistent};
 function rows(store){var value=JSON.parse(store.getItem(queueKey)||'[]');if(!Array.isArray(value))throw new Error('Não foi possível conferir a saída pendente.');return value;}
 function merged(){var all=rows(primary);rows(fallback).forEach(function(row){if(!all.some(function(x){return x.id===row.id;}))all.push(row);});return all;}
 // Reads include both stores. Mutation/migration occurs only under the client's lock.
 var bridge={
  getItem:function(k){if(k===queueKey){var all=merged();return all.length?JSON.stringify(all):null;}return k===key?primary.getItem(k)||fallback.getItem(k):primary.getItem(k);},
  setItem:function(k,v){primary.setItem(k,v);},removeItem:function(k){primary.removeItem(k);},
  prepare:function(){
   var login=fallback.getItem(key),pending=fallback.getItem(queueKey);
   if(!login&&!pending)return;
   var all=merged(),encoded=all.length?JSON.stringify(all):null;
   if(encoded){primary.setItem(queueKey,encoded);if(primary.getItem(queueKey)!==encoded)throw new Error('Não foi possível preservar a saída pendente.');}
   if(login&&!primary.getItem(key)){
    var candidate=JSON.parse(login),blocked=all.some(function(row){return candidate&&(candidate.berthaAuthId?candidate.berthaAuthId===row.authId:candidate.refresh_token===row.refresh_token||candidate.access_token===row.access_token);});
    if(!blocked){primary.setItem(key,login);if(primary.getItem(key)!==login)throw new Error('Não foi possível preservar o acesso.');}
   }
   // Delete source login first. Never leave an unguarded login behind on interruption.
   fallback.removeItem(key);if(fallback.getItem(key))throw new Error('Não foi possível concluir a transferência do acesso.');
   fallback.removeItem(queueKey);if(fallback.getItem(queueKey))throw new Error('Não foi possível concluir a transferência da saída.');
  }
 };
 return {storage:bridge,persistent:true};
}
function createClient(options){
 var storage=options.storage,fetcher=options.fetch||root.fetch.bind(root),key=options.key,
 base=options.base,sessionKey=options.sessionKey,session=null,refreshing=null,authVersion=0,logoutKey=options.sessionKey+'.pendingLogout.v1';
 try{session=JSON.parse(storage.getItem(sessionKey)||'null');}catch(_){}
 function save(s){session=s;if(s)storage.setItem(sessionKey,JSON.stringify(s));else storage.removeItem(sessionKey);}
 async function raw(path,method,body,token){
  var controller=new AbortController(),timer=setTimeout(function(){controller.abort();},20000);
  try{
   var headers={'apikey':key,'Content-Type':'application/json'};
   if(token)headers.Authorization='Bearer '+token;
   var response=await fetcher(base+path,{method:method||'GET',headers:headers,body:body==null?undefined:JSON.stringify(body),signal:controller.signal,cache:'no-store'});
   var text=await response.text(),data;try{data=text?JSON.parse(text):null;}catch(_){throw new Error('Resposta inválida. Tente atualizar.');}
   if(!response.ok){var error=new Error(data&&data.message||data&&data.msg||data&&data.error_description||'Não foi possível completar a ação.');error.status=response.status;throw error;}
   return data;
  }catch(e){if(e.name==='AbortError')throw new Error('A conexão demorou. Confira antes de repetir a ação.');throw e;}
  finally{clearTimeout(timer);}
 }
 // Lock names and diagnostics never contain credentials. Web Locks release on tab closure.
 function coordinated(action){
  var locks=options.locks||(root.navigator&&root.navigator.locks);
  if(!locks||typeof locks.request!=='function')return Promise.reject(new Error('Este navegador não oferece a coordenação segura de acesso. Use um navegador atualizado.'));
  var controller=new AbortController(),timer=setTimeout(function(){controller.abort();},25000);
  return locks.request('bertha-auth:'+base+':'+sessionKey,{mode:'exclusive',signal:controller.signal},function(){clearTimeout(timer);if(storage.prepare)storage.prepare();return action();}).finally(function(){clearTimeout(timer);});
 }
 async function identity(s){
  if(!s)return null;if(s.berthaAuthId)return s.berthaAuthId;
  var digest=await root.crypto.subtle.digest('SHA-256',new TextEncoder().encode(s.refresh_token||''));
  return Array.from(new Uint8Array(digest),function(x){return x.toString(16).padStart(2,'0');}).join('');
 }
 function sameSession(a,b){return !!a&&!!b&&(a.berthaAuthId&&b.berthaAuthId?a.berthaAuthId===b.berthaAuthId:a.refresh_token===b.refresh_token);}
 function loginState(){return JSON.stringify([storage.getItem(sessionKey),storage.getItem(logoutKey)]);}
 function beginLogin(){return {version:++authVersion,state:loginState()};}
 function commitLogin(s,attempt){return coordinated(function(){if(attempt.version!==authVersion||attempt.state!==loginState())throw new Error('A conta mudou. Confira antes de entrar.');return storeSession(s);});}
 function storeSession(s,id){if(!s||!s.access_token||!s.refresh_token)throw new Error('Entre novamente na sua conta.');save(Object.assign({},s,{berthaAuthId:id||root.crypto.randomUUID(),expires_at:s.expires_at||Math.floor(Date.now()/1000)+(s.expires_in||3600)}));return session;}
 function queuedSession(s,row){return !!s&&(s.berthaAuthId?s.berthaAuthId===row.authId:s.refresh_token===row.refresh_token||s.access_token===row.access_token);}
 function syncSession(){try{session=JSON.parse(storage.getItem(sessionKey)||'null');if(pendingLogouts().some(function(row){return queuedSession(session,row);}))session=null;}catch(_){session=null;}return session;}
 function pendingLogouts(){var rows=JSON.parse(storage.getItem(logoutKey)||'[]');if(!Array.isArray(rows))throw new Error('Não foi possível conferir a saída pendente.');return rows;}
 function writeLogouts(rows){if(rows.length)storage.setItem(logoutKey,JSON.stringify(rows));else storage.removeItem(logoutKey);}
 async function drainLogouts(){
  var rows=pendingLogouts();
  for(var row of rows){
   try{
    // Expired access may need a rotated token solely to revoke this captured session.
    // Never install these credentials as the current login.
    try{await raw('/auth/v1/logout?scope=local','POST',{},row.access_token);}
    catch(e){
     if(e.status!==401)throw e;
     var renewed=await raw('/auth/v1/token?grant_type=refresh_token','POST',{refresh_token:row.refresh_token});
     if(!renewed?.access_token||!renewed.refresh_token||renewed.user?.id!==row.userId)throw new Error('Não foi possível confirmar a saída pendente.');
     row.access_token=renewed.access_token;row.refresh_token=renewed.refresh_token;
     writeLogouts(pendingLogouts().map(function(x){return x.id===row.id?row:x;}));
     await raw('/auth/v1/logout?scope=local','POST',{},row.access_token);
    }
    var stored=JSON.parse(storage.getItem(sessionKey)||'null');
    if(queuedSession(stored,row))storage.removeItem(sessionKey);
    writeLogouts(pendingLogouts().filter(function(x){return x.id!==row.id;}));
   }catch(_){/* Retain the captured operation, including on ambiguous/auth failures. */}
  }
  return {pending:pendingLogouts().length};
 }
 function resumeLogout(){return coordinated(drainLogouts);}
 async function token(){
  await coordinated(function(){});syncSession();if(!session)throw new Error('Entre na sua conta.');
  if(session.expires_at>Math.floor(Date.now()/1000)+60)return session.access_token;
  if(!refreshing){var version=authVersion;refreshing=coordinated(async function(){
   syncSession();if(version!==authVersion||!session)throw new Error('A conta mudou. Entre novamente.');
   if(session.expires_at>Math.floor(Date.now()/1000)+60)return session.access_token;
   var captured=session,refreshToken=captured.refresh_token,id=await identity(captured);
   try{
    var renewed=await raw('/auth/v1/token?grant_type=refresh_token','POST',{refresh_token:refreshToken});
    if(renewed?.user?.id!==captured.user?.id)throw new Error('Não foi possível confirmar a renovação desta conta.');
    var current=syncSession();
    if(version!==authVersion||!current||!sameSession(current,captured)||current.refresh_token!==refreshToken)throw new Error('A conta mudou. Entre novamente.');
    return storeSession(renewed,id).access_token;
   }catch(e){
    var current=syncSession();
    if(version===authVersion&&(e.status===400||e.status===401)&&current&&sameSession(current,captured)&&current.refresh_token===refreshToken)save(null);
    throw e;
   }
  }).finally(function(){refreshing=null;});}
  return await refreshing;
 }
 return {
  session:syncSession,
  resumeLogout:resumeLogout,
  logoutStatus:function(){return {pending:pendingLogouts().length};},
  refreshMissions:async function(nid){return raw('/rest/v1/rpc/bertha_hml_refresh_missions','POST',{nid:nid},await token());},
  syncTasks:async function(arg){return raw('/rest/v1/rpc/bertha_hml_sync_tasks','POST',{arg:arg},await token());},
  recognize:async function(arg){return raw('/rest/v1/rpc/bertha_hml_recognize','POST',{arg:arg},await token());},
  shareGuide:async function(arg){return raw('/rest/v1/rpc/bertha_hml_guide_share','POST',{arg:arg},await token());},
  push:async function(op,arg,expected){var t=await token();if(expected&&syncSession()?.user?.id!==expected)throw new Error('A conta mudou. Confira suas notificações.');return raw('/functions/v1/bertha-social-push','POST',Object.assign({op:op},arg),t);},
  social:async function(op,arg,expected){var t=await token();if(expected&&syncSession()?.user?.id!==expected)throw new Error('A conta mudou. Confira antes de enviar.');return raw('/rest/v1/rpc/bertha_hml_social','POST',{op:op,arg:arg},t);},
  invitation:async function(op,arg,expected){var t=await token();if(expected&&syncSession()?.user?.id!==expected)throw new Error('A conta mudou. Confira antes de responder.');return raw('/rest/v1/rpc/bertha_hml_invitation','POST',{op:op,arg:arg},t);},
  inviteCode:async function(member,op){return raw('/functions/v1/bertha-code-access','POST',{op:op||'issue',member:member},await token());},
  prepareInvite:async function(member){return raw('/rest/v1/rpc/bertha_hml_invite_prepare','POST',{arg:member},await token());},
  enterCode:async function(code,kind,nonce){var attempt=beginLogin(),version=attempt.version;code=String(code||'').toUpperCase().replace(/[\s-]/g,'');if(!/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{12}$/.test(code)||!['adult','kids'].includes(kind))throw new Error('Confira o código enviado pelo Owner.');var result=await raw('/functions/v1/bertha-code-access','POST',{op:'claim',code:code,kind:kind,nonce:nonce});if(!result?.session?.access_token||!result.session.refresh_token||result.member?.kind!==kind||result.session.user?.id!==result.member.user_id)throw new Error('Não foi possível confirmar este acesso.');var found=await raw('/auth/v1/user','GET',null,result.session.access_token);if(found?.id!==result.member.user_id||version!==authVersion)throw new Error('A conta mudou. Confira antes de entrar.');await commitLogin(Object.assign({},result.session,{user:found}),attempt);return result.member;},
  verifyEmailOtp:async function(email,code){var attempt=beginLogin(),version=attempt.version;email=String(email||'').trim().toLowerCase();code=String(code||'').trim();if(!/^[^\s@]+@[^\s@]+[.][^\s@]+$/.test(email)||!/^\d{6,10}$/.test(code))throw new Error('Confira o e-mail e digite o código completo recebido.');var data;try{data=await raw('/auth/v1/verify','POST',{email:email,token:code,type:'email'});}catch(e){if(e.status===400||e.status===403)throw new Error('Código inválido ou expirado. Confira o código completo do último e-mail.');throw e;}if(!data?.access_token||!data.refresh_token)throw new Error('Não foi possível confirmar este acesso.');var found=await raw('/auth/v1/user','GET',null,data.access_token);if(!found?.email_confirmed_at||found.email.toLowerCase()!==email||version!==authVersion)throw new Error('Este código não corresponde à conta informada.');return commitLogin(Object.assign({},data,{user:found}),attempt);},
  verifyEmailLink:async function(link,email){var attempt=beginLogin(),version=attempt.version,url;try{url=new URL(String(link||'').trim());}catch(_){throw new Error('Copie o link completo do e-mail.');}email=String(email||'').trim().toLowerCase();if(!/^[^\s@]+@[^\s@]+[.][^\s@]+$/.test(email))throw new Error('Informe o e-mail usado para pedir este acesso.');if(url.origin!==new URL(base).origin||url.pathname!=='/auth/v1/verify'||url.username||url.password||!['magiclink','signup','email'].includes(url.searchParams.get('type')))throw new Error('Use o link original de acesso recebido no e-mail da BERTH.A.');var hash=url.searchParams.get('token')||url.searchParams.get('token_hash');if(!hash||hash.length>512)throw new Error('O link não contém uma confirmação válida.');var data;try{data=await raw('/auth/v1/verify','POST',{token_hash:hash,type:'email'});}catch(e){if(e.status===400||e.status===403)throw new Error('Este link já foi usado ou expirou. Peça um novo e copie sem abrir no Safari.');throw e;}if(!data?.access_token||!data.refresh_token)throw new Error('Não foi possível confirmar este acesso.');var found=await raw('/auth/v1/user','GET',null,data.access_token);if(!found?.email_confirmed_at||found.email.toLowerCase()!==email||version!==authVersion)throw new Error('Este acesso não corresponde ao e-mail informado.');return commitLogin(Object.assign({},data,{user:found}),attempt);},
  requestEmailLink:async function(email,redirect){email=String(email||'').trim().toLowerCase();if(!/^[^\s@]+@[^\s@]+[.][^\s@]+$/.test(email))throw new Error('Confira seu e-mail.');var url=new URL(redirect);if(url.origin!=='https://draduaila-web.github.io'||!/^\/It-s-my-life-\/homologa(?:%C3%A7%C3%A3|çã)o\/helper(?:-owner)?[.]html$/i.test(url.pathname))throw new Error('Destino de acesso não autorizado.');url.hash='';await raw('/auth/v1/otp?redirect_to='+encodeURIComponent(url.href),'POST',{email:email,create_user:true});return {email:email};},
  inspectEmailSession:async function(input){if(!input||!input.access_token||!input.refresh_token)throw new Error('O link não trouxe um acesso válido. Solicite outro.');var version=authVersion,found=await raw('/auth/v1/user','GET',null,input.access_token);if(!found||!found.id||!found.email_confirmed_at)throw new Error('Confirme seu e-mail para entrar.');var renewed=await raw('/auth/v1/token?grant_type=refresh_token','POST',{refresh_token:input.refresh_token});if(version!==authVersion)throw new Error('A conta mudou. Entre novamente.');if(renewed?.user?.id!==found.id||!renewed.access_token||!renewed.refresh_token)throw new Error('O link não corresponde à mesma conta. Solicite outro.');return Object.assign({},renewed,{user:found});},
  acceptEmailSession:function(checked){if(!checked?.user?.id)throw new Error('Confira sua conta antes de entrar.');return commitLogin(checked,beginLogin());},
  signIn:async function(email,password){var attempt=beginLogin(),v=attempt.version,s=await raw('/auth/v1/token?grant_type=password','POST',{email:email,password:password});if(v!==authVersion)throw new Error('A conta mudou. Entre novamente.');return commitLogin(s,attempt);},
  signUp:async function(email,password){var attempt=beginLogin(),v=attempt.version,data=await raw('/auth/v1/signup','POST',{email:email,password:password});if(v!==authVersion)throw new Error('A conta mudou. Entre novamente.');if(data&&data.access_token)await commitLogin(data,attempt);return data;},
  signOut:async function(){
   var captured=syncSession();authVersion++;var id=await identity(captured);
   return coordinated(async function(){
    var current=syncSession();
    if(captured){
     var same=current&&sameSession(current,captured),revoked=same?current:captured,rows=pendingLogouts();
     if(!rows.some(function(x){return x.authId===id;}))rows.push({id:root.crypto.randomUUID(),authId:id,userId:revoked.user?.id,access_token:revoked.access_token,refresh_token:revoked.refresh_token});
     // Persist before removing the login. A storage failure must not silently lose revocation.
     writeLogouts(rows);if(same)save(null);
    }
    return drainLogouts();
   });
  },
  user:async function(){return raw('/auth/v1/user','GET',null,await token());},
  kidsProfile:async function(arg){return raw('/rest/v1/rpc/bertha_hml_kids_profile','POST',{arg:arg},await token());},
  kidsAction:async function(op,arg){return raw('/rest/v1/rpc/bertha_hml_kids_action','POST',{op:op,arg:arg},await token());},
  query:async function(table,query){if(!/^bertha_hml_(networks|members|kids_profiles|links|tasks|recognitions|events|conversations|messages|invitations|invitation_responses|guides)$/.test(table))throw new Error('Fonte não autorizada.');return raw('/rest/v1/'+table+'?'+query,'GET',null,await token());},
  action:async function(op,arg){return raw('/rest/v1/rpc/bertha_hml_action','POST',{op:op,arg:arg},await token());}
 };
}
function inviteCodeValue(value){var code=String(value||'').toUpperCase().replace(/[\s-]/g,'');return /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{12}$/.test(code)?code:null;}
function inviteToken(value){
 var text=String(value||'').trim(),uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
 if(uuid.test(text))return text;
 try{var url=new URL(text);if(url.origin!=='https://draduaila-web.github.io'||decodeURIComponent(url.pathname)!=='/It-s-my-life-/homologação/helper.html')return null;
 var token=url.searchParams.get('invite')||new URLSearchParams(url.hash.slice(1)).get('link');return uuid.test(token||'')?token:null;}catch(_){return null;}
}
var api={inviteCodeValue:inviteCodeValue,inviteToken:inviteToken,dateValid:dateValid,localDay:localDay,bucket:bucket,escape:escape,ownerSources:ownerSources,eligibleSource:eligibleSource,sessionStorageFor:sessionStorageFor,createClient:createClient};
if(typeof module==='object'&&module.exports)module.exports=api;else root.BerthaHelper=api;
})(typeof window==='object'?window:globalThis);




