(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.BerthaResetTransport=factory();})(typeof window==='object'?window:globalThis,function(){
'use strict';
// Pure request-generation gate. Epoch is a stale-client guard, never auth.
const NETWORK='405f9c98-9e4d-4a41-98d3-8f3c1475c912';
const URL_HML='https://draduaila-web.github.io/It-s-my-life-/homologa%C3%A7%C3%A3o/';
function assert(v,m){if(!v)throw Error(m);}
function createGate({role='owner',isolationEvidence,namespace='bertha-hml-reset-v1::'}={}){
 assert(['bertha-hml-reset-v1::','bertha-personal-v1::'].includes(namespace),'Namespace not allowed');
 let context=null;
 return {
  adopt(network,receipt){
   assert(network&&network.id===NETWORK,'Unexpected reset network');
   assert(Number.isSafeInteger(network.reset_generation)&&network.reset_generation>0,'Invalid generation');
   assert(/^\d{4}-\d{2}-\d{2}$/.test(network.reset_floor||'')&&new Date(network.reset_floor+'T12:00:00Z').toISOString().slice(0,10)===network.reset_floor&&Number.isFinite(Date.parse(network.reset_at))&&Date.parse(network.reset_at)<=Date.now(),'Invalid reset cutoff');
   if(role==='owner'){
    assert(receipt?.applied===true&&receipt.networkId===network.id&&receipt.epoch===network.reset_generation,'Owner must sanitize local state before adoption');
    assert(receipt.namespace===namespace&&receipt.sourcePreserved===true,'Isolated source-preserving copy required');
    assert(isolationEvidence?.()===true,'Namespace not verified');
   } else assert(role==='satellite'&&receipt?.remoteRowsRefetched===true,'Satellite must refetch current rows');
   context=Object.freeze({...network});return context;
  },
  headers(path){
   // Do not send generation metadata to auth, edge functions or third parties.
   if(!path.startsWith('/rest/v1/')||!context)return {};
   return {'x-client-info':`bertha-reset/1;network=${context.id};generation=${context.reset_generation}`};
  },
  plan(rows){
   assert(context,'Reset not acknowledged');
   return rows.filter(r=>typeof r.task_date==='string'&&r.task_date>=context.reset_floor);
  },
  assertCurrent(network){
   assert(context&&context.id===network.id&&context.reset_generation===network.reset_generation,'Generation changed; stop writers and reconcile');
  },
  clear(){context=null;},
  current(){return context;}
 };
}
return {createGate,NETWORK,URL_HML};
});
