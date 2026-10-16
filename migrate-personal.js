(function(root){
'use strict';
const S=root.BerthaPersonalStorage,C=S.CONTRACT,H=root.BerthaHelper,d=root.document;
const button=d.getElementById('prepare'),back=d.getElementById('return'),closed=d.getElementById('closed'),status=d.getElementById('status'),open=d.getElementById('open');let client=null,checked=null,busy=false;
function controls(){button.disabled=busy||!checked||!closed.checked;back.disabled=busy||!checked||!closed.checked;}
async function revalidate(){
 if(!S.destination(root.location.href))throw Error('Abra esta etapa pelo endereço pessoal confirmado.');
 const user=await client.user(),rows=await client.query('bertha_hml_networks','select=*&id=eq.'+C.networkId),network=rows.find(n=>n.id===C.networkId&&n.owner_id===user.id);
 S.network(network,user.id);if(network.reset_generation<1)throw Error('A preparação de recomeço da rede ainda não foi confirmada. Nenhuma cópia foi alterada.');
 return {userId:user.id,network,authVerified:true};
}
closed.onchange=controls;
button.onclick=async()=>{if(busy)return;busy=true;controls();try{
 const existing=S.readJournal(root.localStorage),migrationId=existing?.meta.migrationId||'personal-'+root.crypto.randomUUID();
 if(existing&&!S.readMarker(root.localStorage))throw Error('Há uma preparação interrompida. Use Desfazer para remover somente os bytes desta tentativa antes de recomeçar.');
 const result=await S.run(root.localStorage,{mode:'sanitize-original',migrationId,href:root.location.href,writersPaused:closed.checked,locks:root.navigator.locks,revalidate});
 status.textContent=result.alreadyApplied?'A cópia pessoal já está preparada.':'Cópia pessoal preparada e conferida. A origem permanece intacta. Notificações continuam sem nova ativação.';open.hidden=false;back.hidden=false;
}catch(e){status.textContent=e.message+(e.rollback&&!e.rollback.restored?' A tentativa foi interrompida e há dados concorrentes; não apague nem importe nada.':'');back.hidden=!S.readJournal(root.localStorage);}finally{busy=false;controls();}};
back.onclick=async()=>{if(busy)return;busy=true;controls();try{
 if(!root.navigator.locks)throw Error('Este navegador não oferece a trava necessária para uma reversão segura.');
 await root.navigator.locks.request('bertha-personal-migration-v1',{mode:'exclusive'},async()=>{const fresh=await revalidate();const result=S.rollback(root.localStorage,{verifyContext:()=>({...fresh,href:root.location.href,writersPaused:closed.checked,lockHeld:true})});if(!result.restored)throw Error('Há alterações concorrentes; a cópia foi preservada para revisão.');});
 status.textContent='A cópia pessoal desta preparação foi removida. Origem, Ajuda e dados antigos continuam intactos.';open.hidden=true;back.hidden=true;
}catch(e){status.textContent=e.message;}finally{busy=false;controls();}};
(async()=>{try{
 if(!S.destination(root.location.href))throw Error('Esta prévia local não acessa a rede real. A preparação só funciona no endereço pessoal confirmado.');
 if(!root.navigator.locks)throw Error('Seu navegador precisa oferecer Web Locks para esta preparação segura.');
 const session=H.sessionStorageFor(root.localStorage,root.sessionStorage,C.authKeys.owner);client=H.createClient({base:C.projectOrigin,key:'sb_publishable_2lmnQX4WD-s343sEZoFERA_B4URTnip',storage:session.storage,sessionKey:C.authKeys.owner,personalMigration:true});
 checked=await revalidate();const current=S.readMarker(root.localStorage);if(current){if(current.ownerId!==checked.userId||current.epoch!==checked.network.reset_generation)throw Error('A conta ou geração mudou. A cópia existente foi preservada; é necessária uma nova conciliação.');status.textContent='Sua cópia pessoal já está preparada.';open.hidden=false;}else status.textContent='Conta e geração confirmadas. Feche outras abas Owner para continuar.';
 back.hidden=!S.readJournal(root.localStorage);controls();
}catch(e){status.textContent=e.message;}})();
})(window);
