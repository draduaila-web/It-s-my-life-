// Real Edge handler; in-memory Auth and transactional RPC model. No network.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {stripTypeScriptTypes}=require('node:module'),{webcrypto:crypto}=require('node:crypto');
const source=stripTypeScriptTypes(fs.readFileSync(__dirname+'/../../supabase/functions/bertha-code-access/index.ts','utf8'),{mode:'strip'});
function environment(){let handler,secret='synthetic-service',owner='owner-A',fault=null,crashCreate=false,stopped=false,holdStage=null,releaseHold,signalHeld;let held=new Promise(r=>signalHeld=r);const members=new Map(),accounts=new Map(),operations=new Map(),reservations=new Map(),codes=[];
 const response=(d,s=200)=>new Response(JSON.stringify(d),{status:s,headers:{'Content-Type':'application/json'}});
 const once=(stage)=>{if(fault===stage){fault=null;throw Error('synthetic response loss');}};
 const rpc=(op,a)=>{if(op==='claim'){const o=codes.find(x=>x.code===a.code_hash),m=o&&[...members.values()].find(x=>x.id===o.member);if(!o||!m||m.kind!==a.kind||['expired','revoked'].includes(o.state)||(o.nonce&&o.nonce!==a.nonce_hash))return null;o.nonce=a.nonce_hash;o.state='used';return {user_id:m.user_id,email:'fixture@example.invalid',member:m};}const m=[...members.values()].find(m=>m.id===a.member_id);if(!m||m.owner!==a.owner_id)throw Error('Owner boundary');let r=reservations.get(m.id),o=r&&operations.get(r.latest);
  if(op==='reserve'){
   if(m.kind!==a.kind)throw Error('kind');
   if(!r){r={uid:m.user_id||crypto.randomUUID(),latest:null,kind:m.kind};reservations.set(m.id,r);}
   if(r.kind!==m.kind)throw Error('frozen kind');
   if(a.previous_operation&&a.previous_operation!==o?.id&&a.previous_operation!==o?.previous)throw Error('stale intent');
   if(!o||a.previous_operation===o.id){o={id:crypto.randomUUID(),previous:o?.id,key:a.key_id,member:m.id};operations.set(o.id,o);r.latest=o.id;}
   return {id:o.id,user_id:r.uid,key_id:o.key};
  }
  if(op==='revoke'){if(r?.latest!==a.operation_id)throw Error('stale cancel');o.state='revoked';return {revoked:true};}
  if(op!=='finish'||!o||a.operation_id!==r.latest||o.key!==a.key_id)throw Error('operation boundary');
  if(a.user_id!==r.uid||accounts.get(r.uid)?.app_metadata.bertha_code_member!==m.id)throw Error('account boundary');
  m.user_id=r.uid;
  if(!o.code&&!o.state){o.code=a.code_hash;o.expires_at='2030-01-01T00:00:00Z';codes.push(o);}
  if(o.code&&o.code!==a.code_hash)throw Error('result mismatch');
  return {id:o.id,expires_at:o.expires_at,state:o.state||'ready',kind:m.kind,name:m.name};
 };
 const ctx={Deno:{env:{get:k=>k==='SUPABASE_URL'?'https://example.invalid':secret},serve:h=>handler=h},crypto,TextEncoder,Response,Request,fetch:async(url,opt={})=>{
  if(stopped)throw Error('synthetic stopped worker');assert.equal(new URL(url).origin,'https://example.invalid');let b=opt.body?JSON.parse(opt.body):{};const stage=url.endsWith('/auth/v1/user')?'owner':url.includes('invite_prepare')?'prepare':url.includes('code_service')?b.op:url.endsWith('/admin/users')?'create':url.endsWith('/generate_link')?'link':url.endsWith('/verify')?'verify':'lookup';if(holdStage==='before-'+stage){holdStage=null;signalHeld();await new Promise(r=>releaseHold=r);}once('before-'+stage);let d;
  if(stage==='owner')d={id:owner,email_confirmed_at:'2026-01-01',app_metadata:{}};
  else if(stage==='prepare'){let k=owner+':'+b.arg.local_id,m=members.get(k);if(m&&m.kind!==b.arg.kind)throw Error('kind frozen');if(!m){m={...b.arg,id:crypto.randomUUID(),owner,user_id:null};members.set(k,m);}d={...m};}
  else if(stage==='link')d={hashed_token:'synthetic-only'};
  else if(stage==='verify')d={user:{id:[...accounts.keys()][0]},access_token:'synthetic-only',refresh_token:'synthetic-only'};
  else if(stage==='lookup'){d=accounts.get(url.split('/').pop());if(!d)return response({message:'absent'},404);}
  else if(stage==='create'){if(accounts.has(b.id))return response({message:'duplicate'},422);d={...b};accounts.set(b.id,d);if(crashCreate){stopped=true;throw Error('synthetic worker terminated after create');}}
  else d=rpc(b.op,b.arg);
  once('after-'+stage);return response(d);
 }};vm.runInNewContext(source,ctx);
 return {accounts,codes,members,reservations,operations,crashAfterCreate(){crashCreate=true;},restart(){stopped=false;crashCreate=false;vm.runInNewContext(source,{...ctx});},hold(stage){holdStage=stage;return held;},release(){releaseHold();},fail(s){fault=s;},owner(v){owner=v;},rotate(){ctx.Deno.env.get=k=>k==='SUPABASE_URL'?'https://example.invalid':'synthetic-rotated';vm.runInNewContext(source,{...ctx});},async issue(extra={}){const r=await handler(new Request('https://example.invalid/functions/v1/bertha-code-access',{method:'POST',headers:{Authorization:'Bearer synthetic-owner-access','Content-Type':'application/json'},body:JSON.stringify({op:'issue',member:{local_id:'fixture',kind:'kids',name:'Fictitious'},...extra})}));return {status:r.status,...await r.json()};}};
}
const results=[];async function test(name,f){await f();results.push({name,status:'passed'});}
(async()=>{
 for(const stage of ['owner','prepare','reserve','lookup','create','finish'])for(const side of ['before','after'])await test('lost response '+side+'-'+stage,async()=>{let e=environment();e.fail(side+'-'+stage);await e.issue();let r=await e.issue();assert.equal(r.status,200);assert.equal(r.state,'ready');assert.equal(e.accounts.size,1);assert.equal(e.codes.length,1);assert.equal([...e.members.values()][0].user_id,[...e.accounts.keys()][0]);});
 await test('lost final response and reopen',async()=>{let e=environment(),a=await e.issue(),b=await e.issue();assert.equal(a.code,b.code);assert.equal(a.operation_id,b.operation_id);assert.equal(e.codes.length,1);});
 await test('20 concurrent requests one account and code',async()=>{let e=environment(),all=await Promise.all(Array.from({length:20},()=>e.issue()));assert(all.every(r=>r.status===200&&r.code===all[0].code));assert.equal(e.accounts.size,1);assert.equal(e.codes.length,1);});
 await test('explicit replacement duplicate requests converges',async()=>{let e=environment(),a=await e.issue();let all=await Promise.all(Array.from({length:8},()=>e.issue({previous_operation:a.operation_id})));assert(all.every(r=>r.status===200&&r.code===all[0].code));assert.notEqual(a.code,all[0].code);assert.equal(e.accounts.size,1);assert.equal(e.codes.length,2);});
 await test('stale replacement rejected after next generation',async()=>{let e=environment(),a=await e.issue(),b=await e.issue({previous_operation:a.operation_id});await e.issue({previous_operation:b.operation_id});assert.equal((await e.issue({previous_operation:a.operation_id})).status,400);assert.equal(e.codes.length,3);});
 for(const state of ['expired','used','revoked'])await test(state+' does not silently issue new code',async()=>{let e=environment(),a=await e.issue();e.operations.get(a.operation_id).state=state;let b=await e.issue();assert.equal(b.state,state);assert.equal(b.code,undefined);assert.equal(e.codes.length,1);assert.equal((await e.issue({previous_operation:a.operation_id})).state,'ready');assert.equal(e.codes.length,2);});
 await test('Owner isolation',async()=>{let e=environment(),a=await e.issue();e.owner('owner-B');let b=await e.issue();assert.notEqual(a.operation_id,b.operation_id);assert.notEqual(a.code,b.code);assert.equal(e.accounts.size,2);assert.equal((await e.issue({previous_operation:a.operation_id})).status,400);});
 await test('type change cannot reuse reserved identity',async()=>{let e=environment();await e.issue();assert.equal((await e.issue({member:{local_id:'fixture',kind:'adult',name:'Other'}})).status,400);assert.equal(e.accounts.size,1);});
 await test('key rotation fails closed and explicit replacement recovers',async()=>{let e=environment(),a=await e.issue();e.rotate();let b=await e.issue();assert.equal(b.state,'key_changed');assert.equal(b.code,undefined);let c=await e.issue({previous_operation:a.operation_id});assert.equal(c.state,'ready');assert.notEqual(c.code,a.code);assert.equal(e.accounts.size,1);});
 await test('stale revoke cannot cancel replacement',async()=>{let e=environment(),a=await e.issue(),b=await e.issue({previous_operation:a.operation_id});assert.equal((await e.issue({op:'revoke',previous_operation:a.operation_id})).status,400);assert.equal((await e.issue()).code,b.code);});
 await test('unexpected Auth error does not create account',async()=>{let e=environment();e.fail('before-lookup');assert.equal((await e.issue()).status,400);assert.equal(e.accounts.size,0);assert.equal(e.reservations.size,1);});
 for(const stage of ['claim','link','verify'])for(const side of ['before','after'])await test('claim retry '+side+'-'+stage,async()=>{let e=environment(),a=await e.issue(),nonce=crypto.randomUUID(),req={op:'claim',code:a.code,nonce,kind:'kids'};e.fail(side+'-'+stage);await e.issue(req);let b=await e.issue(req);assert.equal(b.status,200);assert.equal(e.accounts.size,1);assert.equal(e.codes.length,1);assert.equal((await e.issue({...req,nonce:crypto.randomUUID()})).status,403);});
 await test('claim invalid format and wrong type',async()=>{let e=environment(),a=await e.issue(),nonce=crypto.randomUUID();assert.equal((await e.issue({op:'claim',code:'INVALID',kind:'kids',nonce})).status,400);assert.equal((await e.issue({op:'claim',code:a.code,kind:'adult',nonce})).status,403);});
 await test('worker termination after Auth creation and fresh handler recovery',async()=>{let e=environment();e.crashAfterCreate();assert.equal((await e.issue()).status,400);assert.equal(e.accounts.size,1);assert.equal(e.reservations.size,1);assert.equal([...e.members.values()][0].user_id,null);e.restart();assert.equal((await e.issue()).state,'ready');assert.equal(e.accounts.size,1);assert.equal(e.codes.length,1);});
 await test('late old completion cannot overwrite explicit replacement',async()=>{let e=environment(),held=e.hold('before-finish'),pending=e.issue();await held;const old=[...e.operations.keys()][0],next=await e.issue({previous_operation:old});e.release();assert.equal((await pending).status,400);assert.equal((await e.issue()).operation_id,next.operation_id);assert.equal(e.accounts.size,1);assert.equal(e.codes.length,1);});
 await test('foreign Auth metadata never binds reserved account',async()=>{let e=environment(),held=e.hold('before-finish'),pending=e.issue();await held;[...e.accounts.values()][0].app_metadata.bertha_code_member='other-member';e.release();assert.equal((await pending).status,400);assert.equal(e.codes.length,0);});
 const out={type:'Actual Edge source; synthetic Auth/RPC model, not executed SQL or remote RLS',passed:results.length,failed:0,results};fs.writeFileSync(__dirname+'/edge-results.json',JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
