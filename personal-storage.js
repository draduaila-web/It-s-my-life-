/* Personal production migration. No work runs on module load. No network, auth or push credentials are copied. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./scoped-reset.js'));else root.BerthaPersonalStorage=factory(root.BerthaScopedReset);})(typeof globalThis==='object'?globalThis:this,function(R){
'use strict';
const CONTRACT=Object.freeze({version:1,mode:'personal',productionBase:'https://draduaila-web.github.io/It-s-my-life-/',projectOrigin:'https://ouxellokvigbdeeyvvfv.supabase.co',networkId:'405f9c98-9e4d-4a41-98d3-8f3c1475c912',prefix:'bertha-personal-v1::',sourcePrefix:'bertha-hml::',resetSourcePrefix:'bertha-hml-reset-v1::',helpPrefix:'bertha-help::',publicEmpty:false,authKeys:Object.freeze({owner:'bertha.helper.hml.owner.auth.v1',adult:'bertha.helper.hml.adult.auth.v1',kids:'bertha.helper.hml.kids.auth.v1'})});
const MARKER='bertha.personal.migration.marker.v1',JOURNAL='bertha.personal.migration.journal.v1';
const RESET='bertha.scoped-reset.marker.v1.'+CONTRACT.networkId;
const assert=(c,m)=>{if(!c)throw Error(m);},own=(v,k)=>Object.prototype.hasOwnProperty.call(v,k);
const plain=v=>v!==null&&typeof v==='object'&&!Array.isArray(v)&&[null,Object.prototype].includes(Object.getPrototypeOf(v));
const freeze=v=>{if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const stringify=v=>JSON.stringify(v),parse=s=>{assert(R,'RESET_POLICY_NOT_LOADED');return R.parseStrictJSON(s);};
const same=(a,b)=>stringify(a)===stringify(b);
const uuid=s=>typeof s==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(s);
function exactKeys(value,keys){assert(plain(value)&&Object.keys(value).sort().join('|')===keys.slice().sort().join('|'),'UNEXPECTED_METADATA_FIELDS');}
function date(s){return typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s+'T12:00:00Z'))&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s;}
function resetValid(n){return Number.isSafeInteger(n.reset_generation)&&n.reset_generation>=0&&(n.reset_generation===0||(typeof n.reset_at==='string'&&Number.isFinite(Date.parse(n.reset_at))&&Date.parse(n.reset_at)<=Date.now()&&date(n.reset_floor)));}
function network(n,userId){assert(n&&n.id===CONTRACT.networkId&&uuid(userId)&&n.owner_id===userId&&resetValid(n),'NETWORK_OWNER_OR_GENERATION_MISMATCH');return {id:n.id,owner_id:userId,reset_generation:n.reset_generation,reset_at:n.reset_generation?n.reset_at:null,reset_floor:n.reset_generation?n.reset_floor:null};}
function destination(href){try{const u=new URL(href),b=new URL(CONTRACT.productionBase);return u.origin===b.origin&&!u.username&&!u.password&&['','index.html','migrate-personal.html','helper-owner.html','helper.html','kids.html'].some(p=>u.pathname===b.pathname+p);}catch{return false;}}
function storage(s){assert(s&&['getItem','setItem','removeItem','key'].every(k=>typeof s[k]==='function')&&Number.isSafeInteger(s.length)&&s.length>=0,'RAW_STORAGE_REQUIRED');}
function names(s,prefix){storage(s);const out=[];for(let i=0;i<s.length;i++){const k=s.key(i);assert(typeof k==='string','STORAGE_ENUMERATION_CHANGED');if(k.startsWith(prefix))out.push(k.slice(prefix.length));}assert(new Set(out).size===out.length,'STORAGE_ENUMERATION_CHANGED');return out.sort();}
function secret(k){return /(^|[.:_-])(auth|oauth|token|password|secret|credential|api[._:-]?key|session[._:-]?key|access[._:-]?token|refresh[._:-]?token)([.:_-]|$)/i.test(String(k).replace(/([a-z0-9])([A-Z])/g,'$1_$2'));}
function allowed(k){return /^(bertha\.|minha-vida\.)/.test(k)&&!secret(k)&&!/(^|[.])(?:push|scoped-reset|personal[.]migration|helper|hml[.]invite)(?:[.]|$)/i.test(k)&&!['__proto__','prototype','constructor'].includes(k);}
function inspect(v,depth=0){assert(depth<100,'DATA_TOO_DEEP');if(v&&typeof v==='object')for(const [k,child]of Object.entries(v)){assert(!secret(k)&&!['__proto__','constructor','prototype'].includes(k),'SECRET_OR_RESERVED_FIELD');inspect(child,depth+1);}}
function validateEntries(entries){assert(plain(entries),'INVALID_ENTRIES');let size=0;for(const k of Object.keys(entries)){const d=Object.getOwnPropertyDescriptor(entries,k);assert(allowed(k)&&d&&own(d,'value')&&typeof d.value==='string','SECRET_OR_INVALID_STORAGE_KEY');const value=d.value;if(/^\s*[\[{]/.test(value))inspect(parse(value));size+=k.length+value.length;assert(size<=16*1024*1024,'PAYLOAD_TOO_LARGE');}}
function capture(s,prefix){assert([CONTRACT.sourcePrefix,CONTRACT.resetSourcePrefix].includes(prefix),'SOURCE_PREFIX_NOT_ALLOWED');const result={};for(const k of names(s,prefix).filter(allowed)){const v=s.getItem(prefix+k);assert(typeof v==='string','SOURCE_CONCURRENT_CHANGE');result[k]=v;}validateEntries(result);return result;}
function sourceMarker(s,prefix){return prefix===CONTRACT.resetSourcePrefix?s.getItem(prefix+RESET):null;}
function validateSourceMarker(raw,n){const m=parse(raw||'null');assert(m&&m.version===1&&m.networkId===n.id&&m.epoch===n.reset_generation&&m.resetAt===n.reset_at&&m.resetFloor===n.reset_floor,'SOURCE_RESET_RECEIPT_MISMATCH');return m;}
function build(entries,meta){
 exactKeys(meta,['version','migrationId','mode','sourcePrefix','targetPrefix','network','sourceMarker']);
 assert(meta.version===1&&typeof meta.migrationId==='string'&&/^[A-Za-z0-9_-]{8,80}$/.test(meta.migrationId)&&meta.targetPrefix===CONTRACT.prefix,'INVALID_MIGRATION_META');
 assert(same(meta.network,network(meta.network,meta.network.owner_id)),'INVALID_NETWORK_META');validateEntries(entries);
 let candidate,report={changedKeys:[],reviews:[]};
 if(meta.mode==='sanitize-original'){
  assert(meta.sourcePrefix===CONTRACT.sourcePrefix&&meta.sourceMarker===null&&meta.network.reset_generation>0,'RESET_MUST_BE_COMMITTED');
  const transformed=R.transformEntries(entries,{networkId:meta.network.id,epoch:meta.network.reset_generation,resetAt:meta.network.reset_at,resetFloor:meta.network.reset_floor});
  assert(!transformed.reviews.some(r=>r.code.startsWith('BLOCKER_')),'RESET_POLICY_REVIEW_REQUIRED');candidate=transformed.candidate;report={changedKeys:transformed.changedKeys,reviews:transformed.reviews};
 }else if(meta.mode==='copy-current'){
  if(meta.network.reset_generation>0){assert(meta.sourcePrefix===CONTRACT.resetSourcePrefix,'OLD_USAGE_CANNOT_ADOPT_GENERATION');validateSourceMarker(meta.sourceMarker,meta.network);}
  else assert(meta.sourcePrefix===CONTRACT.sourcePrefix&&meta.sourceMarker===null,'INVALID_GENERATION_ZERO_SOURCE');
  candidate={...entries};
 }else throw Error('MODE_NOT_ALLOWED');
 candidate=Object.fromEntries(Object.keys(candidate).sort().map(k=>[k,candidate[k]]));
 if(meta.network.reset_generation>0)candidate[RESET]=stringify({version:1,networkId:meta.network.id,epoch:meta.network.reset_generation,resetId:'generation-'+meta.network.reset_generation,resetAt:meta.network.reset_at,resetFloor:meta.network.reset_floor});
 return freeze({format:'BERTHA_PERSONAL_MIGRATION',version:1,meta,sourceEntries:entries,candidate,report});
}
function prepare(s,{mode='sanitize-original',network:n,userId,migrationId}={}){const checked=network(n,userId),prefix=mode==='copy-current'&&checked.reset_generation>0?CONTRACT.resetSourcePrefix:CONTRACT.sourcePrefix;const meta={version:1,migrationId,mode,sourcePrefix:prefix,targetPrefix:CONTRACT.prefix,network:checked,sourceMarker:sourceMarker(s,prefix)};const entries=capture(s,prefix);assert(Object.keys(entries).length>0,'SOURCE_EMPTY_OR_UNAVAILABLE');return build(entries,meta);}
function validatePlan(plan){assert(plan?.format==='BERTHA_PERSONAL_MIGRATION'&&plan.version===1,'INVALID_PLAN');const expected=build(plan.sourceEntries,plan.meta);assert(same(plan,expected),'PLAN_CHANGED');return expected;}
function markerFor(plan){const n=plan.meta.network;return {version:1,mode:'personal',migrationId:plan.meta.migrationId,policy:plan.meta.mode,sourcePrefix:plan.meta.sourcePrefix,namespace:CONTRACT.prefix,networkId:n.id,ownerId:n.owner_id,epoch:n.reset_generation,resetAt:n.reset_at,resetFloor:n.reset_floor,sourcePreserved:true,usageSanitized:n.reset_generation>0};}
function marker(s){const raw=s.getItem(CONTRACT.prefix+MARKER);if(raw===null)return null;const m=parse(raw);exactKeys(m,['version','mode','migrationId','policy','sourcePrefix','namespace','networkId','ownerId','epoch','resetAt','resetFloor','sourcePreserved','usageSanitized']);assert(m.version===1&&m.mode==='personal'&&m.namespace===CONTRACT.prefix&&m.networkId===CONTRACT.networkId&&uuid(m.ownerId)&&m.sourcePreserved===true&&['sanitize-original','copy-current'].includes(m.policy)&&[CONTRACT.sourcePrefix,CONTRACT.resetSourcePrefix].includes(m.sourcePrefix)&&typeof m.migrationId==='string'&&/^[A-Za-z0-9_-]{8,80}$/.test(m.migrationId)&&resetValid({reset_generation:m.epoch,reset_at:m.resetAt,reset_floor:m.resetFloor})&&m.usageSanitized===(m.epoch>0)&&(m.policy!=='sanitize-original'||m.epoch>0),'INVALID_PERSONAL_MARKER');if(m.epoch>0)validateSourceMarker(s.getItem(CONTRACT.prefix+RESET),{id:m.networkId,reset_generation:m.epoch,reset_at:m.resetAt,reset_floor:m.resetFloor});return freeze(m);}
function assertSource(s,p){assert(same(capture(s,p.meta.sourcePrefix),p.sourceEntries)&&sourceMarker(s,p.meta.sourcePrefix)===p.meta.sourceMarker,'SOURCE_CONCURRENT_CHANGE');}
function targetSnapshot(s){return Object.fromEntries(names(s,CONTRACT.prefix).map(k=>[k,s.getItem(CONTRACT.prefix+k)]));}
function expectedTarget(p,journal,committed){return {...p.candidate,[JOURNAL]:journal,...(committed?{[MARKER]:stringify(markerFor(p))}:{})};}
function sameMap(a,b){return Object.keys(a).sort().join('|')===Object.keys(b).sort().join('|')&&Object.keys(a).every(k=>a[k]===b[k]);}
function guard(p,options,phase){assert(typeof options?.verifyContext==='function','VERIFIED_CONTEXT_REQUIRED');const c=options.verifyContext(phase);assert(c&&typeof c.then!=='function'&&destination(c.href)&&c.writersPaused===true&&c.lockHeld===true&&c.authVerified===true,'DESTINATION_AUTH_LOCK_OR_PAUSE_REQUIRED');assert(same(network(c.network,c.userId),p.meta.network),'GENERATION_OR_ACCOUNT_CHANGED');}
function ownRollback(s,written,journal,markerRaw){
 if(s.getItem(CONTRACT.prefix+JOURNAL)!==journal)return {restored:false,conflicts:[JOURNAL]};
 const current=s.getItem(CONTRACT.prefix+MARKER);if(current!==null&&current!==markerRaw)return {restored:false,conflicts:[MARKER]};
 // Invalidate our commit before recovering data, even if concurrent bytes prevent rollback.
 if(current===markerRaw){s.removeItem(CONTRACT.prefix+MARKER);if(s.getItem(CONTRACT.prefix+MARKER)!==null)return {restored:false,conflicts:[MARKER]};}
 const conflicts=written.filter(k=>s.getItem(CONTRACT.prefix+k.key)!==k.value&&s.getItem(CONTRACT.prefix+k.key)!==null).map(k=>k.key);
 if(conflicts.length)return {restored:false,conflicts};
 for(const k of [...written].reverse()){if(s.getItem(CONTRACT.prefix+k.key)===k.value)s.removeItem(CONTRACT.prefix+k.key);if(s.getItem(CONTRACT.prefix+k.key)!==null)return {restored:false,conflicts:[k.key]};}
 s.removeItem(CONTRACT.prefix+JOURNAL);return {restored:s.getItem(CONTRACT.prefix+JOURNAL)===null,conflicts:[]};
}
function apply(s,input,options){
 const p=validatePlan(input);storage(s);guard(p,options,'preflight');
 const markerRaw=stringify(markerFor(p)),journal=stringify({format:'BERTHA_PERSONAL_JOURNAL',version:1,plan:p});
 const existing=marker(s);if(existing){assert(same(existing,markerFor(p)),'TARGET_ALREADY_OWNED');assert(s.getItem(CONTRACT.prefix+JOURNAL)===journal,'JOURNAL_MISMATCH');return {applied:false,alreadyApplied:true,marker:existing};}
 assert(names(s,CONTRACT.prefix).length===0,'TARGET_NOT_EMPTY_OR_RECOVERY_REQUIRED');assertSource(s,p);
 const written=[];let journalAttempted=false;
 try{
  journalAttempted=true;s.setItem(CONTRACT.prefix+JOURNAL,journal);assert(s.getItem(CONTRACT.prefix+JOURNAL)===journal,'JOURNAL_NOT_PERSISTED');
  for(const [key,value]of Object.entries(p.candidate)){
   guard(p,options,'write');assertSource(s,p);assert(s.getItem(CONTRACT.prefix+JOURNAL)===journal&&s.getItem(CONTRACT.prefix+MARKER)===null&&s.getItem(CONTRACT.prefix+key)===null,'CONCURRENT_CHANGE');
   written.push({key,value});s.setItem(CONTRACT.prefix+key,value);assert(s.getItem(CONTRACT.prefix+key)===value,'WRITE_NOT_PERSISTED');
  }
  guard(p,options,'commit');assertSource(s,p);assert(sameMap(targetSnapshot(s),expectedTarget(p,journal,false)),'TARGET_CONCURRENT_CHANGE');
  s.setItem(CONTRACT.prefix+MARKER,markerRaw);assert(s.getItem(CONTRACT.prefix+MARKER)===markerRaw,'MARKER_NOT_PERSISTED');
  guard(p,options,'post-commit');assertSource(s,p);assert(sameMap(targetSnapshot(s),expectedTarget(p,journal,true)),'TARGET_CONCURRENT_CHANGE');
  return {applied:true,alreadyApplied:false,marker:marker(s),changedKeys:Object.keys(p.candidate)};
 }catch(e){
  let rollback={restored:false,conflicts:[JOURNAL]};
  try{if(s.getItem(CONTRACT.prefix+JOURNAL)===journal)rollback=ownRollback(s,written,journal,markerRaw);else if(journalAttempted&&s.getItem(CONTRACT.prefix+JOURNAL)===null&&written.length===0)rollback={restored:true,conflicts:[]};}catch{rollback={restored:false,conflicts:['STORAGE_FAILURE']};}
  const error=Error('APPLY_ABORTED: '+e.message);error.rollback=rollback;throw error;
 }
}
function readJournal(s){const raw=s.getItem(CONTRACT.prefix+JOURNAL);if(raw===null)return null;const j=parse(raw);exactKeys(j,['format','version','plan']);assert(j.format==='BERTHA_PERSONAL_JOURNAL'&&j.version===1,'INVALID_JOURNAL');return validatePlan(j.plan);}
function rollback(s,options){const p=readJournal(s);assert(p,'JOURNAL_REQUIRED');guard(p,options,'rollback');const raw=s.getItem(CONTRACT.prefix+JOURNAL),expected=expectedTarget(p,raw,true),actual=targetSnapshot(s);assert(Object.keys(actual).every(k=>own(expected,k)&&actual[k]===expected[k]),'TARGET_CHANGED_ROLLBACK_BLOCKED');if(actual[MARKER]!==undefined)assert(sameMap(actual,expected),'TARGET_CHANGED_ROLLBACK_BLOCKED');const writes=Object.entries(p.candidate).map(([key,value])=>({key,value}));return ownRollback(s,writes,raw,stringify(markerFor(p)));}
async function run(s,options){assert(options?.locks&&typeof options.locks.request==='function','WEB_LOCKS_REQUIRED');assert(typeof options.revalidate==='function','REMOTE_REVALIDATION_REQUIRED');return options.locks.request('bertha-personal-migration-v1',{mode:'exclusive'},async()=>{const before=await options.revalidate();const p=prepare(s,{mode:options.mode,network:before.network,userId:before.userId,migrationId:options.migrationId});const after=await options.revalidate();assert(same(network(before.network,before.userId),network(after.network,after.userId)),'GENERATION_OR_ACCOUNT_CHANGED');const verifyContext=()=>({...after,href:options.href,writersPaused:options.writersPaused===true,lockHeld:true,authVerified:after.authVerified===true});return apply(s,p,{verifyContext});});}
function exportSnapshot(s,{userId,createdAt=new Date().toISOString()}={}){const m=marker(s);assert(m&&m.ownerId===userId,'PERSONAL_OWNER_REQUIRED');assert(Number.isFinite(Date.parse(createdAt)),'INVALID_BACKUP_DATE');const entries={};for(const k of names(s,CONTRACT.prefix).filter(allowed))entries[k]=s.getItem(CONTRACT.prefix+k);validateEntries(entries);return freeze({format:'BERTHA_PERSONAL_BACKUP',version:1,createdAt,scope:{mode:'personal',namespace:CONTRACT.prefix,networkId:m.networkId,ownerId:m.ownerId,epoch:m.epoch,usageSanitized:m.usageSanitized},entries});}
function adapter(s,m,{assertAccess=()=>true,onChange=()=>{}}={}){
 assert(m?.namespace===CONTRACT.prefix,'PERSONAL_MARKER_REQUIRED');
 const checked=()=>{assert(assertAccess()===true,'PERSONAL_ACCESS_BLOCKED');const now=marker(s);assert(now&&same(now,m),'MARKER_CHANGED_RELOAD_REQUIRED');};
 const functional=()=>names(s,CONTRACT.prefix).filter(k=>k!==JOURNAL&&k!==MARKER&&k!==RESET);
 const keyCheck=k=>assert(typeof k==='string'&&allowed(k),'RESERVED_OR_SECRET_KEY');
 const notify=key=>{try{onChange({key});}catch{}};
 return {
  getItem(k){checked();keyCheck(k);return s.getItem(CONTRACT.prefix+k);},
  setItem(k,v){checked();keyCheck(k);const before=s.getItem(CONTRACT.prefix+k),after=String(v);s.setItem(CONTRACT.prefix+k,after);assert(s.getItem(CONTRACT.prefix+k)===after,'WRITE_NOT_PERSISTED');if(before!==after)notify(k);},
  removeItem(k){checked();keyCheck(k);const before=s.getItem(CONTRACT.prefix+k);s.removeItem(CONTRACT.prefix+k);assert(s.getItem(CONTRACT.prefix+k)===null,'DELETE_NOT_PERSISTED');if(before!==null)notify(k);},
  clear(){throw Error('BULK_CLEAR_DISABLED_PERSONAL');},key(i){checked();return functional()[i]??null;},get length(){checked();return functional().length;},entries(){checked();return Object.fromEntries(functional().map(k=>[k,s.getItem(CONTRACT.prefix+k)]));}
 };
}
return freeze({CONTRACT,MARKER,JOURNAL,RESET,network,destination,allowed,capture,prepare,validatePlan,markerFor,readMarker:marker,apply,rollback,readJournal,run,adapter,exportSnapshot});
});
