/* Runtime identity/generation guard. Reuses existing auth storage through the existing client; never exports credentials. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory;else root.BerthaPersonalRuntime=factory(root,root.BerthaPersonalStorage);})(typeof globalThis==='object'?globalThis:this,function(root,S){
'use strict';
const C=S.CONTRACT,contexts=new Map(),originals=new WeakMap(),authStores=new Map();
const assert=(v,m)=>{if(!v)throw Error(m);};
const roleFor=key=>Object.keys(C.authKeys).find(role=>C.authKeys[role]===key);
const membersQuery=id=>'select=*&network_id=eq.'+C.networkId+'&user_id=eq.'+id;
function here(){assert(S.destination(root.location.href),'PERSONAL_DESTINATION_REQUIRED');}
function currentId(key){
 const read=s=>{try{return {ok:true,raw:s?.getItem(key)||null};}catch{return {ok:false,raw:null};}};
 const chosen=authStores.get(key);if(chosen){const v=read(chosen);assert(v.ok,'SESSION_STORAGE_UNAVAILABLE');try{return JSON.parse(v.raw||'null')?.user?.id||null;}catch{return null;}}
 const a=read(root.localStorage),b=read(root.sessionStorage);assert(a.ok||b.ok,'SESSION_STORAGE_UNAVAILABLE');
 try{const aid=JSON.parse(a.raw||'null')?.user?.id||null,bid=JSON.parse(b.raw||'null')?.user?.id||null;assert(!aid||!bid||aid===bid,'AMBIGUOUS_OWNER_SESSIONS');return aid||bid;}catch(e){if(e.message==='AMBIGUOUS_OWNER_SESSIONS')throw e;return null;}
}
function ownerReceipt(id){const m=S.readMarker(root.localStorage);assert(m&&m.ownerId===id&&m.namespace===C.prefix,'PERSONAL_COPY_OR_OWNER_REQUIRED');return m;}
function assertReady(user,{role='owner'}={}){here();const id=typeof user==='string'?user:user?.id;assert(id&&C.authKeys[role],'ROLE_OR_USER_REQUIRED');const ctx=contexts.get(C.authKeys[role]);assert(ctx&&ctx.userId===id&&currentId(C.authKeys[role])===id,'SESSION_CHANGED_OR_NOT_VERIFIED');if(role==='owner'){const m=ownerReceipt(id);assert(m.migrationId===ctx.migrationId&&m.epoch===ctx.generation&&m.resetAt===ctx.resetAt&&m.resetFloor===ctx.resetFloor,'GENERATION_CHANGED_RECONCILE');}return true;}
function clear(key){contexts.delete(key);}
async function verifyClient(client,user,{role=client.personalRole||'owner'}={}){
 here();const base=originals.get(client)||client,key=C.authKeys[role];assert(key,'ROLE_NOT_ALLOWED');try{const start=currentId(key);assert(start&&(!user||user.id===start),'ACCOUNT_CHANGED');
 const checked=await base.user();assert(checked?.id===start&&currentId(key)===start,'ACCOUNT_CHANGED');
 const rows=await base.query('bertha_hml_networks','select=*&id=eq.'+C.networkId);assert(currentId(key)===start,'ACCOUNT_CHANGED');const n=rows.find(x=>x.id===C.networkId);assert(n&&Number.isSafeInteger(n.reset_generation)&&n.reset_generation>=0,'NETWORK_OR_GENERATION_UNAVAILABLE');
 let receipt=null;
 if(role==='owner'){
  const validated=S.network(n,start);receipt=ownerReceipt(start);
  assert(receipt.epoch===validated.reset_generation&&receipt.resetAt===validated.reset_at&&receipt.resetFloor===validated.reset_floor,'GENERATION_CHANGED_RECONCILE');
 }else{
  const members=await base.query('bertha_hml_members',membersQuery(start));assert(currentId(key)===start,'ACCOUNT_CHANGED');assert(members.some(m=>m.user_id===start&&m.network_id===C.networkId&&m.kind===role&&m.active===true),'ACTIVE_MEMBERSHIP_REQUIRED');
 }
 const ctx=Object.freeze({userId:start,role,networkId:C.networkId,generation:n.reset_generation,resetAt:n.reset_generation?n.reset_at:null,resetFloor:n.reset_generation?n.reset_floor:null,migrationId:receipt?.migrationId||null});
 contexts.set(key,ctx);if(role==='owner'&&n.reset_generation>0)base.acknowledgeReset(n,{applied:true,networkId:C.networkId,epoch:n.reset_generation,namespace:C.prefix,sourcePreserved:true,ownerId:start});
 assertReady(checked,{role});return ctx;
 }catch(e){clear(key);throw e;}
}
function assertRequest({path,method='GET',sessionKey,sessionUserId,anonymousClaim=false}){
 here();if(anonymousClaim){assert(path==='/functions/v1/bertha-code-access'&&method==='POST'&&roleFor(sessionKey)!=='owner','CLAIM_NOT_ALLOWED');return {anonymousClaim:true,sessionKey,userId:currentId(sessionKey)};}const role=roleFor(sessionKey);assert(role&&sessionUserId&&currentId(sessionKey)===sessionUserId,'ACCOUNT_CHANGED');
 const identityRead=method==='GET'&&(path.startsWith('/rest/v1/bertha_hml_networks?')||(role!=='owner'&&path==='/rest/v1/bertha_hml_members?'+membersQuery(sessionUserId)));
 if(!identityRead)assertReady({id:sessionUserId},{role});
 return {sessionKey,userId:sessionUserId,role,context:identityRead?null:contexts.get(sessionKey)};
}
function assertResponse(lease){assert(lease&&currentId(lease.sessionKey)===lease.userId,'ACCOUNT_CHANGED_DURING_REQUEST');if(lease.anonymousClaim)return;if(lease.context){assert(JSON.stringify(contexts.get(lease.sessionKey))===JSON.stringify(lease.context),'CONTEXT_CHANGED_DURING_REQUEST');assertReady({id:lease.userId},{role:lease.role});}}
function decorateClient(base,options){
 const role=roleFor(options.sessionKey);assert(role,'AUTH_STORAGE_KEY_NOT_ALLOWED');assert(options.base===C.projectOrigin,'BACKEND_NOT_ALLOWED');
 if(options.storage)authStores.set(options.sessionKey,options.storage);
 const client={...base,personalRole:role};originals.set(client,base);
 if(options.personalMigration===true){
  // Preparation is read-only, even if a future page accidentally calls a mutator.
  for(const [name,fn]of Object.entries(base))if(typeof fn==='function'&&!['session','user','query'].includes(name))client[name]=()=>{throw Error('MIGRATION_CLIENT_READ_ONLY');};
  client.query=(table,q)=>{assert(table==='bertha_hml_networks','MIGRATION_QUERY_NOT_ALLOWED');return base.query(table,q);};
  return client;
 }
 const auth=['session','signIn','signUp','signOut','verifyEmailOtp','verifyEmailLink','requestEmailLink','inspectEmailSession','acceptEmailSession','enterCode'];
 const sync=['acknowledgeReset','resetPlan'];
 for(const [name,fn]of Object.entries(base)){
  if(typeof fn!=='function')continue;
  if(auth.includes(name)){
   if(name==='session')continue;
   client[name]=function(...args){clear(options.sessionKey);return fn(...args);};continue;
  }
  if(sync.includes(name)){client[name]=function(...args){assertReady({id:currentId(options.sessionKey)},{role});return fn(...args);};continue;}
  client[name]=async function(...args){const checked=await verifyClient(client,null,{role});assertReady({id:checked.userId},{role});if(name==='query'){const field=args[0]==='bertha_hml_networks'?'id':'network_id';args[1]=String(args[1]||'select=*')+'&'+field+'=eq.'+C.networkId;}for(const arg of args)if(arg&&typeof arg==='object'&&Object.prototype.hasOwnProperty.call(arg,'network_id'))assert(arg.network_id===C.networkId,'OTHER_NETWORK_WRITE_BLOCKED');const value=await fn(...args);assertReady({id:checked.userId},{role});return value;};
 }
 return client;
}
function inspectLocalOwner(){here();const m=S.readMarker(root.localStorage);assert(m,'PERSONAL_COPY_REQUIRED');assert(currentId(C.authKeys.owner)===m.ownerId,'PERSONAL_OWNER_SESSION_REQUIRED');return m;}
return Object.freeze({roleFor,currentId,verifyClient,assertReady,assertRequest,assertResponse,decorateClient,inspectLocalOwner,clear});
});
