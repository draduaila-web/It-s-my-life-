(function(){
'use strict';
var H=window.BerthaHelper,key='bertha.helper.hml.owner.auth.v1',pendingKey='bertha.hml.invite.pending.v369';
var chosen=H.sessionStorageFor(localStorage,sessionStorage,key),client=H.createClient({base:'https://ouxellokvigbdeeyvvfv.supabase.co',key:'sb_publishable_2lmnQX4WD-s343sEZoFERA_B4URTnip',storage:chosen.storage,sessionKey:key}),busy=false;
var style=document.createElement('style');style.textContent='.sat-invite-dialog{max-width:560px;width:calc(100% - 28px);border:1px solid #e3e5df;border-radius:26px;padding:0;background:#fffcf5;color:#48555b}.sat-invite-dialog::backdrop{background:rgba(54,64,68,.26)}.sat-invite-dialog .modal-card{padding:24px;background:#fffcf5!important}.sat-invite-dialog label{display:grid;gap:8px;margin:16px 0;font-size:16px}.sat-invite-dialog input,.sat-invite-dialog textarea{box-sizing:border-box;width:100%;font-size:16px;line-height:1.5;padding:12px;border:1px solid #dce1de;border-radius:16px;background:#fffdf9;color:#48555b}.sat-invite-dialog p{line-height:1.55}.sat-invite-dialog .modal-actions{display:flex;gap:10px;flex-wrap:wrap}.sat-invite-dialog .note{font-size:14px}.sat-invite-dialog button{min-height:44px;padding:10px 16px;border-radius:16px;border:1px solid #dce1de;background:#fffdf9;color:#48555b;font:inherit}.sat-invite-dialog .primary{background:linear-gradient(120deg,#f7d1bb,#d6eee0,#cae9ee)}.sat-invite-dialog .modal-head{display:flex;justify-content:space-between;align-items:start;gap:12px}.sat-invite-dialog h2{font-size:25px;font-weight:400;margin:8px 0}.sat-invite-dialog [data-close]{min-width:44px}.sat-invite-dialog .error{color:#91534e}.sat-invite-code{letter-spacing:.09em;font-weight:500}.sat-invite-dialog .eyebrow{font-size:12px;letter-spacing:.16em}';document.head.appendChild(style);
function modal(title,body){var d=document.createElement('dialog');d.className='bertha-dialog casa-dialog sat-modal sat-invite-dialog';d.innerHTML='<div class="modal-card"><div class="modal-head"><div><div class="eyebrow">REDE BERTH.A</div><h2>'+H.escape(title)+'</h2></div><button data-close aria-label="Fechar" type="button">×</button></div>'+body+'<p class="sat-invite-status note" role="status" aria-live="polite"></p></div>';document.body.appendChild(d);d.querySelector('[data-close]').onclick=function(){d.close();};d.onclose=function(){d.remove();};d.showModal();return d;}
function members(){try{return loadSatellites().members;}catch(_){return [];}}
function payload(m){return {local_id:String(m.id),name:m.name,kind:m.role==='kids'?'kids':'adult',avatar_key:m.avatarKey,permissions:m.permissions||{},requires_validation:m.requiresValidation===true};}
async function ownerAccess(m){
 if(client.session()){var owner=await client.user();if(owner.app_metadata?.bertha_code_member)throw new Error('Conecte a conta do Owner para convidar.');return owner.id;}
 var adultKey='bertha.helper.hml.adult.auth.v1',existing;try{existing=JSON.parse(localStorage.getItem(adultKey)||sessionStorage.getItem(adultKey)||'null');}catch(_){}
 if(existing?.access_token&&!existing.user?.app_metadata?.bertha_code_member){
  return await new Promise(function(resolve){var d=modal('Conectar a rede do Owner','<p>Usar <strong>'+H.escape(existing.user?.email||'sua conta')+'</strong> para organizar esta rede?</p><p class="note">Essa conta será a responsável pelos convites e conteúdos compartilhados. Seus cadastros locais serão preservados.</p><button class="primary" id="useOwner" type="button">Conectar minha rede</button>');var done=false;d.addEventListener('close',function(){if(!done)resolve(false);});d.querySelector('#useOwner').onclick=async function(){this.disabled=true;try{var checked=await client.inspectEmailSession(existing);if(checked.user.app_metadata?.bertha_code_member)throw new Error('Use a conta do Owner.');await client.acceptEmailSession(checked);localStorage.setItem(adultKey,JSON.stringify(checked));done=true;d.close();resolve(checked.user.id);}catch(e){d.querySelector('.sat-invite-status').textContent=e.message;this.disabled=false;}};});
 }
 if(m)localStorage.setItem(pendingKey,String(m.id));
 modal('Conectar a rede do Owner','<p>Seu satélite já está salvo. Para emitir códigos válidos, conecte sua conta do Owner uma vez neste aparelho.</p><p class="note">O convidado entrará apenas com o código, sem e-mail ou senha. Ao voltar, a BERTH.A gera o convite deste cadastro.</p><a class="primary" href="helper-owner.html?v=369">Conectar minha conta do Owner</a>');return false;
}
async function issue(m,previousOperation,expectedOwner){
 if(busy)return;busy=true;var d;
 try{
  if(!m||['removed','paused'].includes(m.status))throw new Error('Escolha um satélite ativo.');
  var ownerId=await ownerAccess(m);if(!ownerId)return;if(expectedOwner&&expectedOwner!==ownerId)throw new Error('A conta mudou. Reabra o convite na rede do Owner.');
  d=modal('Preparando o convite','<p>Conectando o cadastro à sua rede…</p>');
  var result=await client.inviteCode(payload(m),'issue',previousOperation,ownerId);d.close();
  if(result.state!=='ready'){var reason={used:'Este código já foi usado.',expired:'Este código expirou.',revoked:'Este código foi cancelado.',key_changed:'A configuração do serviço mudou; este código não pode ser recuperado.'}[result.state]||'Este convite não está disponível.';d=modal('Convite indisponível','<p>'+H.escape(reason)+' Nenhum novo código foi emitido automaticamente.</p><button id="replaceCode" type="button">Gerar novo código</button>');d.querySelector('#replaceCode').onclick=function(){d.close();replace(m,result.operation_id,ownerId);};return;}
  var url=new URL(m.role==='kids'?'kids.html':'helper.html',location.href);url.searchParams.set('v','369');url.hash='';
  var label=m.role==='kids'?'Kids':'Helper',message='Seu espaço BERTH.A '+label+' está pronto, '+m.name+'.\n\nAbra: '+url.href+'\nCódigo de convite: '+result.code+'\n\nDigite o código no primeiro acesso. Ele é individual e vale até '+new Date(result.expires_at).toLocaleString('pt-BR')+'. Depois, seu acesso fica salvo neste aparelho.';
  d=modal('Convite para '+m.name,'<p>Compartilhe pessoalmente com '+H.escape(m.name)+(m.role==='kids'?' e o responsável':'')+'.</p><label>Código individual<input class="sat-invite-code" id="inviteResultCode" readonly value="'+H.escape(result.code)+'"></label><label>Link do app '+label+'<input id="inviteResultLink" readonly value="'+H.escape(url.href)+'"></label><label>Mensagem pronta<textarea id="inviteResultMessage" readonly rows="6">'+H.escape(message)+'</textarea></label><div class="modal-actions"><button class="primary" data-copy="inviteResultMessage" type="button">Copiar convite completo</button><button data-copy="inviteResultCode" type="button">Copiar código</button><button data-copy="inviteResultLink" type="button">Copiar link</button><button id="replaceCode" type="button">Gerar novo código</button><button id="revokeCode" type="button">Cancelar este código</button></div><p class="note">Válido até '+new Date(result.expires_at).toLocaleString('pt-BR')+'. Uso único. Reabrir recupera este mesmo código. Gerar novo código substitui o anterior após sua confirmação. Nenhuma mensagem foi enviada automaticamente.</p>');
  d.querySelectorAll('[data-copy]').forEach(function(b){b.onclick=async function(){var input=d.querySelector('#'+b.dataset.copy);try{await navigator.clipboard.writeText(input.value);d.querySelector('.sat-invite-status').textContent='Copiado. Agora você pode colar no WhatsApp.';}catch(_){input.select();d.querySelector('.sat-invite-status').textContent='Selecione e copie o texto acima.';}};});
  d.querySelector('#replaceCode').onclick=function(){d.close();replace(m,result.operation_id,ownerId);};
  d.querySelector('#revokeCode').onclick=async function(){this.disabled=true;try{await client.inviteCode(payload(m),'revoke',result.operation_id,ownerId);d.querySelector('.sat-invite-status').textContent='Código cancelado. Acessos já conectados permanecem até serem pausados pelo Owner.';d.querySelectorAll('[data-copy]').forEach(function(b){b.disabled=true;});}catch(e){d.querySelector('.sat-invite-status').textContent=e.message;this.disabled=false;}};
  localStorage.removeItem(pendingKey);
 }catch(e){if(d?.isConnected)d.close();modal('Não foi possível confirmar o convite','<p>'+H.escape(e.message)+'</p><p class="note">O cadastro local foi preservado. Use o botão Convite para recuperar a mesma operação, sem gerar outro código.</p>');}finally{busy=false;}
}
// The previous operation is the compare-and-swap token, not a new random intent per tab.
function replace(m,operation,ownerId){
 var d=modal('Substituir o código?','<p>O código anterior deixará de funcionar. Acessos já conectados não serão encerrados.</p><div class="modal-actions"><button id="confirmReplace" type="button">Gerar novo código</button><button id="cancelReplace" type="button">Cancelar</button></div>');
 d.querySelector('#cancelReplace').onclick=function(){d.close();};
 d.querySelector('#confirmReplace').onclick=function(){this.disabled=true;d.close();issue(m,operation,ownerId);};
}
// Extend the approved editor without rewriting the frozen core or its save logic.
if(typeof window.openSatelliteEditor==='function'){
 var editor=window.openSatelliteEditor;
 window.openSatelliteEditor=function(id){
  var before=members().map(function(m){return String(m.id);});editor(id);
  var form=document.querySelector('dialog[open] #satForm');if(!form)return;var submit=form.onsubmit;
  form.onsubmit=function(e){var name=form.querySelector('#satName')?.value.trim();submit.call(this,e);if(!name)return;
   var m=members().find(function(x){return id?String(x.id)===String(id):!before.includes(String(x.id));});
   if(m)queueMicrotask(function(){window.dispatchEvent(new CustomEvent('bertha:satellite-saved',{detail:{member:m,created:!id}}));});
  };
 };
}
window.addEventListener('bertha:satellite-saved',function(e){var m=e.detail?.member;if(!m)return;if(e.detail.created)issue(m);else if(client.session())client.prepareInvite(payload(m)).catch(function(err){modal('Permissões aguardam conexão','<p>'+H.escape(err.message)+'</p><p class="note">O cadastro local foi salvo. Confira a conexão da rede antes de compartilhar.</p>');});});
function decorate(){
 document.querySelectorAll('[data-sat-edit],.s156-member [data-edit]').forEach(function(edit){if(edit.parentElement.querySelector('[data-code-invite]'))return;var b=document.createElement('button');b.type='button';b.className=edit.classList.contains('s156-btn')?'s156-btn':'secondary';b.dataset.codeInvite=edit.dataset.satEdit||edit.dataset.edit;b.textContent='Convite';b.onclick=function(){issue(members().find(function(m){return String(m.id)===b.dataset.codeInvite;}));};edit.parentElement.appendChild(b);});
}
var root=document.getElementById('app')||document.body;new MutationObserver(decorate).observe(root,{childList:true,subtree:true});decorate();
var pending=localStorage.getItem(pendingKey);if(pending&&client.session()){var m=members().find(function(x){return String(x.id)===pending;});if(m)issue(m);else localStorage.removeItem(pendingKey);}
})();

