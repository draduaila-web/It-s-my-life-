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
 if(!m||!m.permissions||m.permissions.casa!==true)return false;
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
 base=options.base,sessionKey=options.sessionKey,session=null,refreshing=null,authVersion=0;
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
 function storeSession(s){if(!s||!s.access_token||!s.refresh_token)throw new Error('Entre novamente na sua conta.');save(Object.assign({},s,{expires_at:s.expires_at||Math.floor(Date.now()/1000)+(s.expires_in||3600)}));return session;}
 function syncSession(){try{session=JSON.parse(storage.getItem(sessionKey)||'null');}catch(_){session=null;}return session;}
 async function token(){
  syncSession();
  if(!session)throw new Error('Entre na sua conta.');
  if(session.expires_at>Math.floor(Date.now()/1000)+60)return session.access_token;
  if(!refreshing){var version=authVersion,refreshToken=session.refresh_token;refreshing=raw('/auth/v1/token?grant_type=refresh_token','POST',{refresh_token:session.refresh_token}).then(function(s){if(version!==authVersion||!syncSession()||session.refresh_token!==refreshToken)throw new Error('A conta mudou. Entre novamente.');return storeSession(s);}).catch(function(e){if(version===authVersion&&(e.status===400||e.status===401))save(null);throw e;}).finally(function(){refreshing=null;});}
  await refreshing;return session.access_token;
 }
 return {
  session:syncSession,
  requestEmailLink:async function(email,redirect){email=String(email||'').trim().toLowerCase();if(!/^[^\s@]+@[^\s@]+[.][^\s@]+$/.test(email))throw new Error('Confira seu e-mail.');var url=new URL(redirect);if(url.origin!=='https://draduaila-web.github.io'||!/^\/It-s-my-life-\/homologa(?:%C3%A7%C3%A3|çã)o\/helper(?:-owner)?[.]html$/i.test(url.pathname))throw new Error('Destino de acesso não autorizado.');url.hash='';await raw('/auth/v1/otp?redirect_to='+encodeURIComponent(url.href),'POST',{email:email,create_user:true});return {email:email};},
  inspectEmailSession:async function(input){if(!input||!input.access_token||!input.refresh_token)throw new Error('O link não trouxe um acesso válido. Solicite outro.');var version=authVersion,found=await raw('/auth/v1/user','GET',null,input.access_token);if(!found||!found.id||!found.email_confirmed_at)throw new Error('Confirme seu e-mail para entrar.');var renewed=await raw('/auth/v1/token?grant_type=refresh_token','POST',{refresh_token:input.refresh_token});if(version!==authVersion)throw new Error('A conta mudou. Entre novamente.');if(renewed?.user?.id!==found.id||!renewed.access_token||!renewed.refresh_token)throw new Error('O link não corresponde à mesma conta. Solicite outro.');return Object.assign({},renewed,{user:found});},
  acceptEmailSession:function(checked){if(!checked?.user?.id)throw new Error('Confira sua conta antes de entrar.');authVersion++;return storeSession(checked);},
  signIn:async function(email,password){var v=++authVersion,s=await raw('/auth/v1/token?grant_type=password','POST',{email:email,password:password});if(v!==authVersion)throw new Error('A conta mudou. Entre novamente.');return storeSession(s);},
  signUp:async function(email,password){var v=++authVersion,data=await raw('/auth/v1/signup','POST',{email:email,password:password});if(v!==authVersion)throw new Error('A conta mudou. Entre novamente.');if(data&&data.access_token)storeSession(data);return data;},
  signOut:async function(){var tokenAtLogout=session&&session.access_token;authVersion++;save(null);if(tokenAtLogout)await raw('/auth/v1/logout?scope=local','POST',{},tokenAtLogout);},
  user:async function(){return raw('/auth/v1/user','GET',null,await token());},
  query:async function(table,query){if(!/^bertha_hml_(networks|members|links|tasks|events)$/.test(table))throw new Error('Fonte não autorizada.');return raw('/rest/v1/'+table+'?'+query,'GET',null,await token());},
  action:async function(op,arg){return raw('/rest/v1/rpc/bertha_hml_action','POST',{op:op,arg:arg},await token());}
 };
}
var api={dateValid:dateValid,localDay:localDay,bucket:bucket,escape:escape,ownerSources:ownerSources,eligibleSource:eligibleSource,sessionStorageFor:sessionStorageFor,createClient:createClient};
if(typeof module==='object'&&module.exports)module.exports=api;else root.BerthaHelper=api;
})(typeof window==='object'?window:globalThis);
