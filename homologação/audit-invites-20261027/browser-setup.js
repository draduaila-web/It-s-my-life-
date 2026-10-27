// Only this fixture replaces fetch. The production files are loaded unchanged.
const member={id:'synthetic-kid',name:'Pessoa fictícia',role:'kids',permissions:{casa:true}},authKey='bertha.helper.hml.owner.auth.v1';
window.loadSatellites=()=>({members:[member]});
if(!localStorage.getItem(authKey))localStorage.setItem(authKey,JSON.stringify({access_token:'synthetic-access',refresh_token:'synthetic-refresh',expires_at:4102444800,user:{id:'synthetic-owner',email:'fixture@example.invalid',app_metadata:{}}}));
let lose=false;const calls=[];
function show(result){document.querySelector('#evidence').textContent=JSON.stringify({fixture:true,calls,result},null,2);}
const dbp=new Promise((resolve,reject)=>{let q=indexedDB.open('bertha-invite-synthetic-ledger',1);q.onupgradeneeded=()=>q.result.createObjectStore('ledger');q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error);});
async function transaction(body){const db=await dbp;return new Promise((resolve,reject)=>{const tx=db.transaction('ledger','readwrite'),s=tx.objectStore('ledger'),q=s.get('member');let result;q.onsuccess=()=>{let row=q.result||{generation:0,accounts:1};
 if(body.op==='used'){row.state='used';result={...row};}
 else if(body.op==='revoke'){if(row.id!==body.previous_operation){result={error:true};return;}row.state='revoked';result={revoked:true};}
 else{let prev=body.previous_operation;if(prev&&prev!==row.id&&prev!==row.previous){result={error:true};return;}
 if(!row.id||prev===row.id){row={...row,previous:row.id,id:crypto.randomUUID(),generation:row.generation+1,state:'ready'};}
 result={operation_id:row.id,state:row.state,expires_at:'2030-01-01T00:00:00Z',...(row.state==='ready'?{code:'ABCD-EFGH-'+String(row.generation).padStart(4,'2')}:{})};}
 s.put(row,'member');};tx.oncomplete=()=>resolve(result);tx.onerror=tx.onabort=()=>reject(tx.error);});}
window.fetch=async function(url,opt={}){if(!String(url).startsWith('https://ouxellokvigbdeeyvvfv.supabase.co/'))throw Error('Blocked fixture request');let body=opt.body?JSON.parse(opt.body):{},result;
 if(url.endsWith('/auth/v1/user'))result={id:'synthetic-owner',email_confirmed_at:'2026-01-01',app_metadata:{}};
 else if(url.endsWith('/functions/v1/bertha-code-access')){calls.push({op:body.op,previous:body.previous_operation||null});result=await transaction(body);show(result);if(lose){lose=false;throw Error('Resposta perdida (simulada).');}}
 else throw Error('Unexpected fixture route');return new Response(JSON.stringify(result),{status:result.error?409:200,headers:{'Content-Type':'application/json'}});};
document.querySelector('#lose').onclick=()=>{lose=true;show({nextResponseLost:true});};document.querySelector('#used').onclick=async()=>show(await transaction({op:'used'}));
