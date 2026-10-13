const assert=require('node:assert/strict'),H=require('./helper-client-rc363.js');
function memory(seed={}){const d={...seed};return {getItem:k=>d[k]??null,setItem:(k,v)=>d[k]=v,removeItem:k=>delete d[k]};}
const response=(data,status=200)=>({ok:status<400,status,text:async()=>JSON.stringify(data)});
(async()=>{
 const storage=memory(),calls=[],user={id:'QA-same-account',email:'qa@example.invalid',email_confirmed_at:'2026-10-13T00:00:00Z'},session={access_token:'QA-new-token',refresh_token:'QA-new-refresh',expires_in:3600,user};
 const client=H.createClient({storage,sessionKey:'qa',base:'https://fixture.invalid',key:'PUBLIC-QA',fetch:async(url,opt)=>{calls.push({url,opt});return response(url.includes('/user')?user:url.includes('refresh_token')?session:{});}});
 await client.requestEmailLink(' QA@example.invalid ','https://draduaila-web.github.io/It-s-my-life-/homologa%C3%A7%C3%A3o/helper.html?v=367&invite=fixture');
 assert.equal(calls.length,1);assert.deepEqual(JSON.parse(calls[0].opt.body),{email:'qa@example.invalid',create_user:true});assert.equal(calls[0].opt.headers.Authorization,undefined);assert.ok(calls[0].url.includes('redirect_to='));assert.equal(client.session(),null);
 await assert.rejects(client.requestEmailLink('bad','https://draduaila-web.github.io/It-s-my-life-/homologa%C3%A7%C3%A3o/helper.html'),/e-mail/);
 await assert.rejects(client.requestEmailLink('qa@example.invalid','https://evil.invalid/helper.html'),/Destino/);
 await assert.rejects(client.requestEmailLink('qa@example.invalid','https://draduaila-web.github.io/other/helper.html'),/Destino/);
 const checked=await client.inspectEmailSession({access_token:'QA-old-access',refresh_token:'QA-old-refresh',expires_in:3600});assert.equal(client.session(),null);assert.equal(checked.user.id,user.id);client.acceptEmailSession(checked);assert.equal(client.session().access_token,'QA-new-token');
 const same=H.createClient({storage,sessionKey:'qa',base:'https://fixture.invalid',key:'PUBLIC-QA',fetch:async()=>response(user)});assert.equal(same.session().user.id,user.id);
 const other=H.createClient({storage:memory(),sessionKey:'qa',base:'https://fixture.invalid',key:'PUBLIC-QA',fetch:async(url)=>response(url.includes('/user')?user:{...session,user:{...user,id:'QA-other-account'}})});
 await assert.rejects(other.inspectEmailSession({access_token:'QA-access',refresh_token:'QA-refresh'}),/mesma conta/);assert.equal(other.session(),null);
 const unconfirmed=H.createClient({storage:memory(),sessionKey:'qa',base:'https://fixture.invalid',key:'PUBLIC-QA',fetch:async()=>response({...user,email_confirmed_at:null})});await assert.rejects(unconfirmed.inspectEmailSession({access_token:'QA-access',refresh_token:'QA-refresh'}),/Confirme/);
 const expired=H.createClient({storage,sessionKey:'qa',base:'https://fixture.invalid',key:'PUBLIC-QA',fetch:async()=>response({message:'Link expirado'},401)});await assert.rejects(expired.inspectEmailSession({access_token:'QA-expired',refresh_token:'QA-expired'}),/expirado/);assert.equal(expired.session().user.id,user.id);
 await client.signOut();assert.equal(same.session(),null);
 const legacy=memory({qa:JSON.stringify(session)}),chosen=H.sessionStorageFor(memory(),legacy,'qa');assert.equal(chosen.persistent,true);assert.equal(legacy.getItem('qa'),null);assert.equal(JSON.parse(chosen.storage.getItem('qa')).user.id,user.id);
 console.log('PASS RC367: email/redirect validation, no session before link, server-confirmed account, paired tokens, same IDs, persisted reload, expired/mismatched links, logout and legacy-session migration. All Auth requests mocked; no real emails sent.');
})().catch(e=>{console.error(e);process.exit(1)});
