(async()=>{
 const original=window.fetch.bind(window);
 window.fetch=(url,opt)=>{const u=new URL(url,location.href);if(u.origin==='https://ouxellokvigbdeeyvvfv.supabase.co')return original('/api'+u.pathname+u.search,opt);if(u.origin!==location.origin)throw Error('External request blocked');return original(url,opt);};
 const data=await (await original('/bootstrap')).json();window.loadSatellites=()=>({members:[data.member]});
 const H=window.BerthaHelper,key='bertha.helper.hml.owner.auth.v1',chosen=H.sessionStorageFor(localStorage,sessionStorage,key),client=H.createClient({base:'https://ouxellokvigbdeeyvvfv.supabase.co',key:'local-only',storage:chosen.storage,sessionKey:key});
 if(!client.session())await client.acceptEmailSession(data.session);
 const user=await client.user();document.querySelector('#status').textContent=user.id===data.session.user.id?'Owner fictício conferido no Auth local':'Conta inesperada';
 const wrap=document.createElement('div');wrap.className='s156-member';const button=document.createElement('button');button.dataset.satEdit=data.member.id;button.textContent='Pessoa fictícia QA';wrap.append(button);document.querySelector('#app').append(wrap);
 const script=document.createElement('script');script.src='satellite-invites-rc369.js';document.body.append(script);
 document.querySelector('#fault').onclick=async()=>{await original('/fault',{method:'POST'});document.querySelector('#status').textContent='Próxima resposta final será perdida; dados serão reais locais.';};
 document.querySelector('#kidlogin').onclick=async()=>{try{const kid=H.createClient({base:'https://ouxellokvigbdeeyvvfv.supabase.co',key:'local-only',storage:sessionStorage,sessionKey:'qa.local.kids.r3'});const m=await kid.enterCode(document.querySelector('#kidcode').value,'kids',crypto.randomUUID());const u=await kid.user();document.querySelector('#kidstatus').textContent=m.user_id===u.id?'Kids fictício conferido no Auth local':'Identidade divergente';}catch(e){document.querySelector('#kidstatus').textContent='Falha no acesso Kids: '+e.message;}};
 document.querySelector('#counts').onclick=async()=>{document.querySelector('#countsResult').textContent=JSON.stringify(await(await original('/counts')).json());};
})().catch(()=>{document.querySelector('#status').textContent='Falha no bootstrap local; confira evidência do servidor.';});
