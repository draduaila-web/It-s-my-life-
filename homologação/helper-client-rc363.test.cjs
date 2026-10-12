const assert=require('node:assert/strict'),H=require('./helper-client-rc363.js');
let n=0;function eq(a,b){assert.deepEqual(a,b);n++;}
function memory(seed={}){const data={...seed};return {data,getItem:k=>data[k]??null,setItem:(k,v)=>data[k]=v,removeItem:k=>delete data[k]};}
function response(data,status=200){return {ok:status<400,status,text:async()=>JSON.stringify(data)};}
async function main(){
 eq(H.dateValid('2026-02-31'),false);eq(H.dateValid('2028-02-29'),true);eq(H.dateValid('2026-2-01'),false);
 eq(H.bucket('2026-10-12','2026-10-12'),'today');eq(H.bucket('2026-10-11','2026-10-12'),'yesterday');
 eq(H.bucket('2026-10-08','2026-10-12'),'earlier');eq(H.bucket('2026-10-14','2026-10-12'),'upcoming');
 eq(H.bucket('2025-12-31','2026-01-01'),'yesterday');eq(H.bucket('2026-02-31','2026-03-01'),'undated');
 eq(H.escape('<img onerror="x">&'), '&lt;img onerror=&quot;x&quot;&gt;&amp;');
 const old=memory({'bertha-hml::bertha.satellites.v1':JSON.stringify({members:[{id:'a',name:'A',role:'adult',permissions:{casa:true}},{id:'k',name:'Kid',role:'kids'},{id:'p',role:'adult',status:'paused'}]}),'bertha-hml::minha-vida.casa.v1':JSON.stringify({areas:[{title:'Jardim',tasks:[{id:'1',name:'Plant',responsibility:'help'},{id:'2',name:'Private',responsibility:'owner'},{id:'3',responsibility:'help',done:true},{id:'4',responsibility:'delegated',assigneeIds:['a']},{id:'5',responsibility:'delegated',assigneeIds:['b']}]}],maintenance:[{id:'m',name:'Manutenção',responsibility:'help'}]})});
 const before=JSON.stringify(old.data),source=H.ownerSources(old);
 eq(source.members.map(m=>m.id),['a']);eq(source.tasks.length,4);eq(JSON.stringify(old.data),before);
 eq(H.eligibleSource(source.tasks[0],source.members[0]),true);eq(H.eligibleSource(source.tasks[1],source.members[0]),true);eq(H.eligibleSource(source.tasks[2],source.members[0]),false);
 eq(H.eligibleSource({task:{responsibility:'help',claimedById:'b'}},source.members[0]),false);eq(H.eligibleSource(source.tasks[0],{id:'a',permissions:{casa:false}}),false);
 const store=memory({untouched:'preserved'}),calls=[];
 const session={access_token:'TEST-token',refresh_token:'TEST-refresh',expires_in:3600,user:{id:'test-user'}};
 const client=H.createClient({base:'https://test.invalid',key:'PUBLIC-TEST',storage:store,sessionKey:'qa-auth',fetch:async(url,opts)=>{calls.push({url,opts});return response(url.includes('/token?')?session:url.includes('/user')?{id:'test-user'}:[]);}});
 eq(client.session(),null);await client.signIn('test@example.invalid','FAKE-only-in-memory');eq(client.session().user.id,'test-user');
 eq(JSON.stringify(store.data).includes('FAKE-only-in-memory'),false);eq(calls[0].opts.headers.Authorization,undefined);
 await client.query('bertha_hml_tasks','select=*');eq(calls.at(-1).opts.headers.Authorization,'Bearer TEST-token');
 await assert.rejects(client.query('bertha_shared_tasks','select=*'),/Fonte não autorizada/);n++;
 await client.signOut();eq(client.session(),null);eq(store.data.untouched,'preserved');eq(store.getItem('qa-auth'),null);
 let refreshCount=0;
 const expired=memory({'auth':JSON.stringify({...session,expires_at:1})});
 const refreshing=H.createClient({base:'https://test.invalid',key:'PUBLIC-TEST',storage:expired,sessionKey:'auth',fetch:async(url)=>{if(url.includes('refresh_token')){refreshCount++;await new Promise(r=>setTimeout(r,5));return response(session);}return response({id:'test-user'});}});
 await Promise.all([refreshing.user(),refreshing.user()]);eq(refreshCount,1);
 let resolveLogin;
 const raceStore=memory(),race=H.createClient({base:'https://test.invalid',key:'PUBLIC-TEST',storage:raceStore,sessionKey:'race',fetch:()=>new Promise(r=>resolveLogin=r)});
 const pending=race.signIn('test@example.invalid','FAKE-only');await race.signOut();resolveLogin(response(session));await assert.rejects(pending,/conta mudou/);n++;eq(race.session(),null);eq(raceStore.getItem('race'),null);
 const bad=H.createClient({base:'https://test.invalid',key:'PUBLIC-TEST',storage:memory(),sessionKey:'bad',fetch:async()=>response({message:'Conta inválida'},400)});
 await assert.rejects(bad.signIn('test@example.invalid','FAKE-only'),/Conta inválida/);n++;eq(bad.session(),null);
 console.log('PASS: '+n+' verificações de calendário, recortes, escape, preservação, transporte, renovação e logout. Nenhuma conta/credencial/rede real utilizada.');
}
main().catch(e=>{console.error(e);process.exit(1)});
