// Execute the exact commit's Edge handler with in-memory HTTP/SQL/Auth doubles.
// SQL itself is NOT executed; remote authorization/deployment remains unproven.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {stripTypeScriptTypes}=require('node:module'),{webcrypto}=require('node:crypto');
const text=fs.readFileSync(__dirname+'/baseline-edge.ts','utf8');
const code=stripTypeScriptTypes(text,{mode:'strip'});
function environment(){let handler,serial=0,failAfterCreate=false;const accounts=[],codes=[],member={id:'synthetic-member',user_id:null,kind:'kids',name:'Synthetic child'};
 const reply=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json'}});
 const ctx={Deno:{env:{get:k=>k==='SUPABASE_URL'?'https://example.invalid':'synthetic-service'},serve:h=>handler=h},crypto:webcrypto,TextEncoder,Response,Request,fetch:async(url,o={})=>{
  assert.equal(new URL(url).origin,'https://example.invalid');const b=o.body?JSON.parse(o.body):{};
  if(url.endsWith('/auth/v1/user'))return reply({id:'synthetic-owner',email_confirmed_at:'2026-01-01',app_metadata:{}});
  if(url.includes('bertha_hml_invite_prepare'))return reply({...member});
  if(url.endsWith('/auth/v1/admin/users')){const a={id:'synthetic-account-'+(++serial),app_metadata:b.app_metadata};accounts.push(a);if(failAfterCreate){failAfterCreate=false;throw Error('response lost after creation');}return reply(a);}
  if(url.includes('/auth/v1/admin/users/'))return reply(accounts.find(a=>a.id===url.split('/').pop()));
  if(url.includes('bertha_hml_code_service')){
   if(b.op!=='issue')throw Error('unexpected mock op');
   // Mirrors the member lock/change guard and revoke+insert in repository SQL.
   if(member.user_id&&member.user_id!==b.arg.user_id)return reply({message:'member changed'},400);
   member.user_id=b.arg.user_id;codes.forEach(c=>c.revoked=true);codes.push({hash:b.arg.code_hash,revoked:false});return reply({id:'synthetic-code-'+codes.length,kind:'kids'});
  }
  throw Error('Unexpected request');
 }};
 vm.runInNewContext(code,ctx);
 return {accounts,codes,member,loseCreationResponse(){failAfterCreate=true;},async issue(){return handler(new Request('https://example.invalid/functions/v1/bertha-code-access',{method:'POST',headers:{Authorization:'Bearer synthetic-owner-access','Content-Type':'application/json'},body:JSON.stringify({op:'issue',member:{local_id:'synthetic-local',kind:'kids',name:'Synthetic child'}})}));}};
}
(async()=>{const findings=[];
{
 const e=environment(),first=await e.issue();assert.equal(first.status,200);const data=await first.json(); // Pretend this response never reaches caller.
 const second=await e.issue();assert.equal(second.status,200);const next=await second.json();assert.notEqual(data.code,next.code);assert.equal(e.accounts.length,1);assert.equal(e.codes.length,2);assert.equal(e.codes[0].revoked,true);
 findings.push({case:'response lost after committed issue, then retry',result:'reproduced',accountsCreated:1,codeRecords:2,previousCodeRevoked:true,sameResultReturned:false});
}
{
 const e=environment();e.loseCreationResponse();assert.equal((await e.issue()).status,400);assert.equal(e.member.user_id,null);assert.equal((await e.issue()).status,200);assert.equal(e.accounts.length,2);assert.equal(e.accounts.filter(a=>a.id!==e.member.user_id).length,1);
 findings.push({case:'Auth account created but response lost before member binding, then retry',result:'reproduced',accountsCreated:2,linkedAccounts:1,orphanAccounts:1});
}
{
 const e=environment(),responses=await Promise.all([e.issue(),e.issue()]);assert.deepEqual(responses.map(r=>r.status).sort(),[200,400]);assert.equal(e.accounts.length,2);assert.equal(e.codes.length,1);
 findings.push({case:'concurrent issue calls before member has account',result:'reproduced',responses:[200,400],accountsCreated:2,linkedAccounts:1,orphanAccounts:1});
}
fs.writeFileSync(__dirname+'/baseline-results.json',JSON.stringify({type:'Actual Edge handler; simulated Auth/RPC behavior; no network or real accounts',findings},null,2));console.log(JSON.stringify(findings,null,2));
})();
