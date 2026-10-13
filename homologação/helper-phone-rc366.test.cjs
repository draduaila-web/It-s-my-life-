const assert=require('node:assert/strict'),H=require('./helper-client-rc363.js');
const memory=(d={})=>({getItem:k=>d[k]??null,setItem:(k,v)=>d[k]=v,removeItem:k=>delete d[k]});
const response=(d,status=200)=>({ok:status<400,status,text:async()=>JSON.stringify(d)});
(async()=>{
 assert.equal(H.normalizePhone('(11) 99999-9999'),'+5511999999999');assert.equal(H.normalizePhone('+55 11 99999-9999'),'+5511999999999');assert.equal(H.normalizePhone('5511999999999'),'+5511999999999');
 assert.throws(()=>H.normalizePhone('9999'),/celular/);assert.throws(()=>H.normalizePhone('abc11999999999'),/celular/);
 const session={access_token:'FIXTURE-ACCESS',refresh_token:'FIXTURE-REFRESH',expires_at:Math.floor(Date.now()/1000)+3600,user:{id:'FIXTURE-ID'}};
 const primary=memory(),legacy=memory({auth:JSON.stringify(session)}),chosen=H.sessionStorageFor(primary,legacy,'auth');
 assert.equal(chosen.persistent,true);assert.equal(legacy.getItem('auth'),null);assert.equal(JSON.parse(primary.getItem('auth')).user.id,'FIXTURE-ID');
 const blocked=H.sessionStorageFor({setItem(){throw Error('Denied');}},memory(),'auth');assert.equal(blocked.persistent,false);
 const calls=[],fetch=async(url,options)=>{calls.push({url,options});if(url.endsWith('/settings'))return response({external:{phone:true}});if(url.endsWith('/verify'))return response(session);if(url.endsWith('/user'))return response({id:'FIXTURE-ID'});return response({});};
 const options={storage:primary,sessionKey:'auth',base:'https://fixture.invalid',key:'PUBLIC-FIXTURE',fetch};
 const client=H.createClient(options);assert.equal(client.session().user.id,'FIXTURE-ID');await client.user();assert.equal(calls.at(-1).options.headers.Authorization,'Bearer FIXTURE-ACCESS');
 await client.requestPhoneCode('(11) 99999-9999');assert.deepEqual(JSON.parse(calls.at(-1).options.body),{phone:'+5511999999999',channel:'sms',create_user:true});
 await assert.rejects(client.verifyPhoneCode('(11) 99999-9999','123'),/seis/);
 await client.verifyPhoneCode('(11) 99999-9999','123456');assert.equal(H.createClient(options).session().user.id,'FIXTURE-ID');
 assert.equal(primary.getItem('auth').includes('123456'),false);
 await client.requestPhoneChange('(11) 99999-9999');assert.equal(calls.at(-1).options.method,'PUT');assert.equal(calls.at(-1).options.headers.Authorization,'Bearer FIXTURE-ACCESS');await client.verifyPhoneChange('(11) 99999-9999','123456');assert.equal(client.session().user.id,'FIXTURE-ID');
 const disabledCalls=[],disabled=H.createClient({...options,storage:memory(),fetch:async(url)=>{disabledCalls.push(url);return response({external:{phone:false}});}});
 await assert.rejects(disabled.requestPhoneCode('(11) 99999-9999'),/não está configurado/);assert.equal(disabledCalls.length,1); // no SMS request when provider disabled
 await client.signOut();assert.equal(H.createClient(options).session(),null);
 console.log('PASS RC366: phone formatting, OTP requests/verification fixtures, persistent reload, storage fallback, legacy migration, logout and provider-disabled guard. No real SMS sent.');
})().catch(e=>{console.error(e);process.exit(1)});
