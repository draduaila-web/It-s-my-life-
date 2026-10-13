const assert=require('node:assert/strict'),H=require('./helper-client-rc363.js');
function memory(){const values={};return {getItem:k=>values[k]??null,setItem:(k,v)=>values[k]=v,removeItem:k=>delete values[k]};}
const response=(data,status=200)=>({ok:status<400,status,text:async()=>JSON.stringify(data)});
(async()=>{
 const user={id:'QA-code-user',app_metadata:{bertha_code_member:'QA-member'}},member={id:'QA-member',kind:'adult',user_id:user.id},session={access_token:'QA-access',refresh_token:'QA-refresh',expires_in:3600,user};
 const storage=memory(),requests=[],fetch=async(url,opt)=>{requests.push({url,opt});return response(url.includes('/user')?user:{session,member});};
 const client=H.createClient({storage,sessionKey:'qa',base:'https://qa.invalid',key:'PUBLIC-QA',fetch});
 await assert.rejects(client.enterCode('123','adult','QA-nonce'),/Confira/);assert.equal(requests.length,0);
 await client.enterCode('abcd-efgh-jklm','adult','QA-nonce');assert.equal(JSON.parse(requests[0].opt.body).code,'ABCDEFGHJKLM');assert.equal(JSON.parse(requests[0].opt.body).op,'claim');assert.equal(requests[0].opt.headers.Authorization,undefined);assert.equal(client.session().user.id,user.id);assert.ok(requests[1].url.endsWith('/auth/v1/user'));assert.ok(!requests.some(r=>r.url.includes('/otp')));
 const reload=H.createClient({storage,sessionKey:'qa',base:'https://qa.invalid',key:'PUBLIC-QA',fetch});assert.equal(reload.session().user.id,user.id);
 const bad=H.createClient({storage:memory(),sessionKey:'qa',base:'https://qa.invalid',key:'PUBLIC-QA',fetch:async()=>response({session,member:{...member,kind:'kids'}})});await assert.rejects(bad.enterCode('ABCDEFGHJKLM','adult','QA-nonce'),/confirmar/);assert.equal(bad.session(),null);
 const forged=H.createClient({storage:memory(),sessionKey:'qa',base:'https://qa.invalid',key:'PUBLIC-QA',fetch:async(url)=>response(url.includes('/user')?{id:'different'}:{session,member})});await assert.rejects(forged.enterCode('ABCDEFGHJKLM','adult','QA-nonce'),/conta mudou/);assert.equal(forged.session(),null);
 const denied=H.createClient({storage:memory(),sessionKey:'qa',base:'https://qa.invalid',key:'PUBLIC-QA',fetch:async()=>response({message:'Código indisponível'},403)});await assert.rejects(denied.enterCode('ABCDEFGHJKLM','adult','QA-nonce'),/indisponível/);assert.equal(denied.session(),null);
 console.log('PASS RC369: código sem e-mail, sessão só após verificação Auth, persistência, perfil errado, identidade divergente, código negado. Todas as requisições deste teste são mocks.');
})();
