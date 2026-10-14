(function(){
'use strict';
var H=window.BerthaHelper,owner=document.body.dataset.helperMode==='owner',kidsMode=document.body.dataset.helperMode==='kids',app=document.getElementById('helperApp');
var authKey='bertha.helper.hml.'+(owner?'owner':kidsMode?'kids':'adult')+'.auth.v1',persistentStorage=null;
try{persistentStorage=window.localStorage;}catch(_){}
var authStorage=H.sessionStorageFor(persistentStorage,sessionStorage,authKey);
var client=H.createClient({base:'https://ouxellokvigbdeeyvvfv.supabase.co',key:'sb_publishable_2lmnQX4WD-s343sEZoFERA_B4URTnip',storage:authStorage.storage,sessionKey:authKey});
var claimNonce=null;try{claimNonce=sessionStorage.getItem('bertha.code.claim.nonce');}catch(_){}if(!claimNonce){claimNonce=crypto.randomUUID();try{sessionStorage.setItem('bertha.code.claim.nonce',claimNonce);}catch(_){}}
var social=null,inviteUI=null,transportKey=null;
function clearTransport(clear){if(social){social.destroy(clear);social=null;}if(inviteUI){inviteUI.destroy();inviteUI=null;}transportKey=null;}
var user=null,members=[],tasks=[],network=null,sources=null,view=['messages','invitations','privacy','recognitions'].includes(location.hash.slice(1))?location.hash.slice(1):'all',period='all',search='',loading=false,generation=0,interval=null;
var labels={today:'Hoje',yesterday:'Ontem',earlier:'Anteriores',upcoming:'Próximas',all:'Todas'};
var states={available:'Disponível para ajudar',assigned:'Delegada',accepted:'Assumida',in_progress:'Em andamento',completed:'Aguardando validação',validated:'Concluída'};
function el(id){return document.getElementById(id);}function safe(s){return H.escape(s);}
function notice(s,error){var node=el('notice');if(node){node.textContent=s||'';node.classList.toggle('error',!!error);}}
function fail(e){if(/email rate limit exceeded|over_email_send_rate_limit/i.test(e.message||'')){notice('O serviço limitou temporariamente os e-mails de acesso. Aguarde a liberação. Não solicite códigos repetidamente.',true);return;}notice(navigator.onLine===false?'Você está sem conexão. Nenhuma ação foi confirmada.':e.message||'Não foi possível concluir.',true);}
function shell(content){
 document.body.classList.toggle('owner',owner);
 app.innerHTML='<div class="shell"><header class="top"><img class="logo" src="'+(owner||kidsMode?'bertha-icon-512.png':'helper-icon-512-rc365.png')+'" alt="'+(owner?'BERTH.A':(kidsMode?'BERTH.A Kids':'BERTH.A Helper — azul, verde e coral'))+'"><div><div class="brand">BERTH.A'+(owner?'':' <span class="helper-brand-label">'+(kidsMode?'Kids':'Helper')+'</span>')+'</div><div class="eyebrow">'+(owner?'Owner · conectar adultos':(kidsMode?'Kids · meu espaço':'Helper · colaboração adulta'))+'</div></div><button class="account" id="account">'+(user?'Minha conta':'Entrar')+'</button></header><section class="hero"><div class="eyebrow">'+(owner?'REDE BERTH.A':'SEU ESPAÇO NA REDE')+'</div><h1>'+(owner?'Everything handled.<br>Nothing carried.':'Your life, with<br>somewhere to land.')+'</h1><p>'+(owner?'Você conta com a BERTH.A. A BERTH.A conta com os seus.':'Você se importa. A BERTH.A conecta.')+'</p></section><div id="notice" class="status" role="status" aria-live="polite"></div><div id="content">'+content+'</div><footer><p class="note">BERTH.A · Homologação. Compartilhe apenas o que faz sentido.</p>'+(owner?'<a href="./?v=381#satelites">Voltar à minha rede</a>':'')+'</footer></div>'+(!owner&&!kidsMode&&user?'<nav class="bottom" aria-label="Navegação Helper"><button id="allView" aria-pressed="'+(view==='all')+'">Colaborar</button><button id="mineView" aria-pressed="'+(view==='mine')+'">Minhas tarefas</button><button id="accountBottom">Conta</button></nav>':'');
 el('account').onclick=account;
 if(user&&(owner?network:members.length)&&!kidsMode){var nav=document.createElement('div');nav.className='row social-tabs';nav.innerHTML=['all','messages','invitations'].concat(owner?[]:['casa','recognitions']).map(function(v){return '<button type="button" data-helper-tab="'+v+'" aria-pressed="'+(view===v)+'">'+({all:'Meu Dia',messages:'Mensagens',invitations:'Convites',privacy:'Comunicação',casa:'Casa',recognitions:'Reconhecimentos'})[v]+'</button>';}).join('');el('content').before(nav);nav.querySelectorAll('[data-helper-tab]').forEach(function(b){b.onclick=function(){view=b.dataset.helperTab;render();};});}

 if(el('allView')){el('allView').onclick=function(){view='all';render();};el('mineView').onclick=function(){view='mine';render();};el('accountBottom').onclick=account;}
}
var guides=[],recognitions=[];
var pendingEmailKey=authKey+'.email',inviteKey='bertha.helper.hml.pendingInvite.v1',lastEmailRequest=Number(authStorage.storage.getItem(authKey+'.lastEmailRequest')||0);
function authContent(){
 if(!owner)return '<section class="panel auth"><div class="eyebrow">Primeiro acesso</div><h2>Seu convite conecta.</h2><p>Digite o código que o Owner enviou junto com o link deste app.</p><form id="codeForm"><div class="fields"><label>Código de convite<input id="inviteCode" required maxlength="16" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="XXXX-XXXX-XXXX"></label></div><button class="primary" type="submit">Conectar meu espaço</button></form><p class="note">Não precisa de e-mail ou senha. O código é individual e vale por sete dias. Depois da entrada, seu acesso fica salvo neste aparelho.</p><p class="note">Para trocar de aparelho ou recuperar seu acesso, peça um novo código ao Owner.</p>'+(!kidsMode?'<button id="legacyAccess" type="button">Já usava acesso por e-mail</button>':'')+'</section>';
 return emailContent();
}
function emailContent(){
 return '<section class="panel auth"><div class="eyebrow">Conectar uma vez</div><h2>Seu código de acesso.</h2><p>Receba um código no e-mail e digite aqui. Seu acesso ficará salvo neste app.</p><form id="authForm"><div class="fields"><label>E-mail<input id="email" type="email" autocomplete="email" required maxlength="254"></label></div><button class="primary" type="submit">Receber meu código</button></form><form id="emailOtpForm"><div class="fields"><label>Código recebido por e-mail<input id="emailOtpCode" type="text" inputmode="numeric" pattern="[0-9]{6,10}" autocomplete="one-time-code" required minlength="6" maxlength="10" placeholder="Digite o código completo"></label></div><button class="primary" type="submit">Confirmar e entrar</button></form><p class="note">Digite o código do último e-mail. Não precisa abrir nenhum link nem sair para o Safari.</p></section>';
}
function bindAuth(){
 var cf=el('codeForm');if(cf){cf.onsubmit=async function(e){e.preventDefault();if(!cf.reportValidity())return;var b=cf.querySelector('button');b.disabled=true;notice('Conectando seu espaço…');try{await client.enterCode(el('inviteCode').value,kidsMode?'kids':'adult',claimNonce);sessionStorage.removeItem('bertha.code.claim.nonce');await initialize();notice('Seu espaço está conectado.');}catch(err){fail(err);}finally{if(b.isConnected)b.disabled=false;}};var legacy=el('legacyAccess');if(legacy)legacy.onclick=function(){shell(emailContent());bindAuth();};return;}
 var otp=el('emailOtpForm');if(otp)otp.onsubmit=async function(e){e.preventDefault();if(!otp.reportValidity())return;var button=otp.querySelector('button'),field=el('emailOtpCode'),email=el('email').value.trim();button.disabled=true;notice('Confirmando seu acesso…');try{await client.verifyEmailOtp(email,field.value);field.value='';authStorage.storage.removeItem(pendingEmailKey);await initialize();}catch(err){fail(err);}finally{if(button.isConnected)button.disabled=false;}};
 var f=el('authForm');if(!f)return;try{el('email').value=authStorage.storage.getItem(pendingEmailKey)||'';}catch(_){}
 f.onsubmit=async function(e){e.preventDefault();if(!f.reportValidity())return;lastEmailRequest=Math.max(lastEmailRequest,Number(authStorage.storage.getItem(authKey+'.lastEmailRequest')||0));if(Date.now()-lastEmailRequest<60000){notice('Aguarde um minuto antes de pedir outro link.',true);return;}var email=el('email').value.trim(),button=f.querySelector('button');lastEmailRequest=Date.now();authStorage.storage.setItem(authKey+'.lastEmailRequest',String(lastEmailRequest));authStorage.storage.setItem(pendingEmailKey,email.toLowerCase());button.disabled=true;notice('Solicitando seu link…');
  try{var url=new URL(location.pathname,location.origin);url.searchParams.set('v','372');if(owner&&new URLSearchParams(location.search).get('return')==='main')url.searchParams.set('return','main');var invite;try{invite=sessionStorage.getItem(inviteKey);}catch(_){}if(!owner&&invite)url.searchParams.set('invite',invite);await client.requestEmailLink(email,url.href);authStorage.storage.setItem(pendingEmailKey,email.toLowerCase());lastEmailRequest=Date.now();notice('Código enviado. Confira o último e-mail e digite o código completo abaixo.');}catch(err){fail(err);}finally{button.disabled=false;}
 };
}
async function restoreEmailLink(){
 var fragment=new URLSearchParams(location.hash.slice(1)),query=new URLSearchParams(location.search),invite=query.get('invite')||fragment.get('link');
 if(invite&&/^[0-9a-f-]{36}$/i.test(invite)){try{sessionStorage.setItem(inviteKey,invite);}catch(_){}}
 var hasAuth=fragment.has('access_token')||fragment.has('error');
 if(!hasAuth){if(query.has('invite')){query.delete('invite');history.replaceState(null,'',location.pathname+'?'+query.toString());}return false;}
 var access=fragment.get('access_token'),refresh=fragment.get('refresh_token'),expires=Number(fragment.get('expires_in')||3600),failed=fragment.has('error');
 // Remove sensitive fragment before rendering/account confirmation. No token logging.
 history.replaceState(null,'',location.pathname+'?v=371');
 if(failed){notice('Este link expirou ou já foi utilizado. Solicite um novo link.',true);return true;}
 try{var candidate=await client.inspectEmailSession({access_token:access,refresh_token:refresh,expires_in:Number.isFinite(expires)&&expires>0?expires:3600});
  var requested=authStorage.storage.getItem(pendingEmailKey),same=requested&&requested.toLowerCase()===candidate.user.email.toLowerCase();
  async function accept(){client.acceptEmailSession(candidate);authStorage.storage.removeItem(pendingEmailKey);await initialize();}
  if(same)await accept();else{modal('Confirmar meu acesso','<p>Entrar como <strong>'+safe(candidate.user.email)+'</strong>?</p><p class="note">O link abriu em outro navegador ou aparelho. Confirme que este é o seu e-mail para entrar com segurança. Depois, você poderá aceitar o convite do Owner.</p>',accept);}
 }catch(err){fail(err);}return true;
}
function modal(title,body,onSubmit){
 var dlg=document.createElement('dialog');dlg.innerHTML='<form><div class="modal-head"><div><div class="eyebrow">'+(owner?'Conexão Helper':onSubmit?'Colaboração':'Sua conta')+'</div><h2>'+safe(title)+'</h2></div><button class="close" type="button" aria-label="Fechar">×</button></div>'+body+'<div class="status modal-status" role="status" aria-live="polite"></div><div class="modal-actions"><button type="button" class="cancel">Cancelar</button>'+(onSubmit?'<button class="primary" type="submit">Confirmar</button>':'')+'</div></form>';
 document.body.appendChild(dlg);var form=dlg.querySelector('form');
 dlg.querySelector('.close').onclick=dlg.querySelector('.cancel').onclick=function(){dlg.close();};
 dlg.addEventListener('close',function(){dlg.remove();});
 form.onsubmit=async function(e){e.preventDefault();if(!onSubmit||!form.reportValidity())return;var buttons=form.querySelectorAll('button');buttons.forEach(function(b){b.disabled=true;});try{await onSubmit(dlg);dlg.close();}catch(err){dlg.querySelector('.modal-status').textContent=err.message;dlg.querySelector('.modal-status').classList.add('error');}finally{buttons.forEach(function(b){b.disabled=false;});}};
 dlg.showModal();return dlg;
}
function account(){
 if(!user){(el('inviteCode')||el('email'))?.scrollIntoView({block:'center'});return;}
 var d=modal('Minha conta','<p>'+safe(user.app_metadata?.bertha_code_member?(members[0]?.name||'Seu espaço'):user.email)+'</p><p class="note">O acesso às atividades depende do vínculo e das permissões do Owner.</p><p class="note">'+(authStorage.persistent?'Acesso salvo neste aparelho.':'Acesso mantido somente nesta aba.')+'</p><div class="row"><button type="button" id="activateSocialPush">Ativar avisos da rede</button><button type="button" id="stopSocialPush">Parar esses avisos neste aparelho</button></div><p class="note" id="pushState" role="status">A ativação é voluntária neste aparelho. Receba avisos de mensagens, convites e reconhecimentos.</p><button type="button" id="signout">Sair desta conta</button>',null);
 if(kidsMode){d.querySelector('#activateSocialPush').parentElement.remove();d.querySelector('#pushState').remove();}
 if(!kidsMode){d.querySelector('#activateSocialPush').onclick=async function(){this.disabled=true;try{var result=await window.BerthaHelperPush.activate(client,user);this.textContent=result.enabled?'Avisos ativados':'Permitir avisos neste aparelho';d.querySelector('#pushState').textContent=result.enabled?'Notificações de mensagens e convites ativadas neste aparelho.':'Serviço pronto. Toque novamente em Ativar para permitir os avisos neste aparelho.';}catch(e){d.querySelector('#pushState').textContent=e.message;}finally{this.disabled=false;}};
 d.querySelector('#stopSocialPush').onclick=async function(){try{await window.BerthaHelperPush.stop(client,user);d.querySelector('#pushState').textContent='Avisos de mensagens e convites interrompidos neste aparelho.';}catch(e){d.querySelector('#pushState').textContent=e.message;}};
 }
 d.querySelector('#signout').onclick=async function(){await window.BerthaHelperPush.stop(client,user).catch(function(){});clearTransport(true);try{await client.signOut();}catch(_){}authStorage.storage.removeItem(pendingEmailKey);sessionStorage.removeItem(inviteKey);user=null;members=[];tasks=[];network=null;generation++;clearInterval(interval);d.close();render();};
}
function taskHtml(t){
 var guide=guides.find(function(g){return g.source_ref===String(t.source_ref||'').split('|').slice(0,2).join('|');});
 var mine=members.some(function(m){return m.id===t.actor_id;});
 var action=!owner?(t.actor_id&&!mine?'':t.state==='available'||t.state==='assigned'?'<button class="primary" data-action="claim" data-task="'+safe(t.id)+'">'+(t.responsibility==='help'?'Quero ajudar':'Assumir tarefa')+'</button>':mine&&t.state==='accepted'?'<button class="primary" data-action="start" data-task="'+safe(t.id)+'">Começar</button>':mine&&t.state==='in_progress'?'<button class="primary" data-action="complete" data-task="'+safe(t.id)+'">Concluir</button>':''):(t.state==='completed'?'<button class="primary" data-action="validate" data-task="'+safe(t.id)+'">Validar conclusão</button>':'');
 return '<article class="task"><div class="eyebrow">'+safe(t.area)+'</div><h3>'+safe(t.title)+'</h3><p class="note">'+dateLabel(t.task_date)+'</p><span class="pill">'+safe(states[t.state]||t.state)+(t.actor_id&&!mine&&!owner?' · outra pessoa':'')+'</span>'+(guide?window.BerthaGuides.body(guide):'')+'<div class="row">'+action+'</div></article>';
}
function dateLabel(s){return H.dateValid(s)?new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'short',timeZone:'UTC'}).format(new Date(s+'T12:00:00Z')):'Sem data';}
function filtered(){
 var mids=members.map(function(m){return m.id;}),text=search.trim().toLocaleLowerCase('pt-BR');
 return tasks.filter(function(t){return (view!=='mine'||mids.includes(t.actor_id)||(t.responsibility==='delegated'&&!t.actor_id&&t.targets.some(function(id){return mids.includes(id);})))&&(period==='all'||H.bucket(t.task_date,H.localDay())===period)&&(!text||(t.title+' '+t.area).toLocaleLowerCase('pt-BR').includes(text));})
 .sort(function(a,b){return a.task_date.localeCompare(b.task_date)||a.title.localeCompare(b.title);});
}
function taskPanel(){
 return '<section class="panel"><div class="row" style="justify-content:space-between"><div><h2>'+(owner?'Atividades compartilhadas':view==='mine'?'Meu espaço de colaboração':'Onde posso ajudar?')+'</h2><p class="note">'+(owner?'Acompanhe as ações e confira as conclusões da rede.':'Só aparecem as atividades que foram compartilhadas com você.')+'</p></div><button id="refresh">Atualizar</button></div><div class="tools"><label>Buscar atividade<input id="search" type="search" value="'+safe(search)+'" placeholder="Nome ou área"></label></div><div class="filters" role="group" aria-label="Período">'+Object.keys(labels).map(function(k){return '<button data-period="'+k+'" aria-pressed="'+(period===k)+'">'+labels[k]+'</button>';}).join('')+'</div><div id="taskList"></div></section>';
}
function bindTasks(){
 el('search').oninput=function(){search=this.value;drawList();};document.querySelectorAll('[data-period]').forEach(function(b){b.onclick=function(){period=b.dataset.period;document.querySelectorAll('[data-period]').forEach(function(x){x.setAttribute('aria-pressed',x.dataset.period===period);});drawList();};});
 el('refresh').onclick=async function(){try{await loadRemote();notice('Atividades atualizadas.');}catch(e){fail(e);}};drawList();
}
function drawList(){
 var list=el('taskList');if(!list)return;var rows=filtered();list.innerHTML=rows.length?'<div class="grid" style="margin-top:22px">'+rows.map(taskHtml).join('')+'</div>':'<div class="empty"><h3>'+(!tasks.length?'Ainda não há atividades compartilhadas.':'Nenhuma atividade neste recorte.')+'</h3><p>'+(!tasks.length?'Quando o Owner compartilhar uma tarefa, ela aparecerá aqui.':'Você pode escolher outro período ou ajustar a busca.')+'</p></div>';
 list.querySelectorAll('[data-action]').forEach(function(b){b.onclick=async function(){
  if(b.disabled)return;var op=b.dataset.action,id=b.dataset.task;
  if(op==='complete'){modal('Concluir atividade?','<p>Confirme quando você tiver terminado. A validação seguirá a regra definida pelo Owner.</p>',async function(){await changeTask(op,id);});}
  else{b.disabled=true;try{await changeTask(op,id);}catch(e){fail(e);}finally{if(b.isConnected)b.disabled=false;}}
 };});
}
async function changeTask(op,id){var result=await client.action(op,{task_id:id,network_id:network&&network.id});tasks=tasks.map(function(t){return t.id===result.id?result:t;});drawList();notice(op==='claim'?'Que bom contar com sua ajuda.':op==='start'?'Atividade em andamento.':result.state==='completed'?'Conclusão enviada para validação do Owner.':'Conclusão registrada.');}
function ownerPanel(){
 if(!network)return '<section class="panel"><h2>Conectar minha rede</h2><p>A conexão usa seus adultos já cadastrados. Você escolhe o que compartilhar.</p><button id="connect" class="primary">Conectar minha rede</button></section>';
 return '<section class="panel"><div class="row" style="justify-content:space-between"><div><h2>Pessoas da minha rede</h2><p class="note">Cada pessoa recebe apenas os conteúdos autorizados para seu perfil.</p></div><button id="syncMembers">Ler cadastros e atualizar permissões</button></div><div id="memberList">'+members.map(function(m){return '<div class="member"><div class="grow"><strong>'+safe(m.name)+'</strong><p class="note">'+(!m.active?'Acesso pausado':m.user_id?'Conta vinculada':'Aguardando vínculo')+' · '+(m.permissions.tasks===true?'tarefas autorizadas':'tarefas não autorizadas')+'</p></div><div class="row">'+(!m.active?'<button data-resume="'+safe(m.id)+'">Retomar acesso</button>':(!m.user_id?'<button data-link="'+safe(m.id)+'">Vincular conta</button>':'')+'<button data-pause="'+safe(m.id)+'">Pausar acesso</button>')+'</div></div>';}).join('')+'</div><div id="ownerEmpty"></div></section><section class="panel"><h2>Escolher atividades para compartilhar</h2><p class="note">Somente rotinas e manutenções já disponíveis para ajuda ou delegação. Os registros da BERTH.A principal permanecem preservados.</p><button id="readTasks">Ler atividades deste navegador</button><div id="shareArea"></div></section>'+taskPanel();
}
function render(){
 if(user&&view==='recognitions'&&!owner){clearTransport();shell('<section class="panel"><h2>Reconhecimentos</h2>'+ (recognitions.length?recognitions.map(function(r){var art=/^(thanks|flower|coffee|pause|reward|saved|hug|care|arrasou)$/.test(r.art_key)?r.art_key:'thanks';return '<article class="recognition-received"><img src="rc352_rec_'+art+'.webp" alt=""><div><h3>'+safe(r.name)+'</h3><p>'+safe(r.message)+'</p><small>'+safe(new Date(r.sent_at).toLocaleDateString('pt-BR'))+'</small></div></article>';}).join(''):'<p>Os agradecimentos do Owner aparecerão aqui.</p>')+'</section>');return;}
 if(user&&view==='casa'&&members.length&&!owner){clearTransport();shell('<section class="panel" id="guidePanel"></section>');if(kidsMode){var back=document.createElement('button');back.textContent='Voltar';back.onclick=function(){view='all';render();};el('content').prepend(back);}window.BerthaGuides.mount(el('guidePanel'),{client:client,user:user,network:{id:members[0].network_id}});return;}
 if(user&&['messages','privacy','invitations'].includes(view)&&(owner?network:members.length)&&!kidsMode){
  var nid=owner?network.id:members[0].network_id,key=user.id+'|'+nid+'|'+view;
  if(transportKey!==key){clearTransport();transportKey=key;if(view==='invitations')inviteUI=window.BerthaInvitations.create({client:client,user:user,network:{id:nid},owner:owner,escape:safe});else social=window.BerthaSocial.create({client:client,user:user,network:{id:nid},owner:owner,escape:safe});}
  shell('<section class="panel" id="transportPanel"></section>');
  if(owner&&view!=='invitations'){var tabs=document.createElement('div');tabs.className='row social-tabs';tabs.innerHTML='<button data-message-mode="messages">Conversas</button><button data-message-mode="privacy">Permissões de conversa</button>';el('transportPanel').before(tabs);tabs.querySelectorAll('button').forEach(function(b){b.onclick=function(){view=b.dataset.messageMode;render();};});}
(inviteUI?inviteUI.mount(el('transportPanel')):social.mount(el('transportPanel'),view)).catch(fail);return;
 }
 clearTransport();
 if(!user){shell(authContent());bindAuth();return;}
 if(owner){shell(ownerPanel());bindOwner();if(network)bindTasks();return;}
 if(!members.length&&user.app_metadata?.bertha_code_member){shell('<section class="panel"><h2>Seu acesso à rede está indisponível.</h2><p>Converse com o Owner para conferir seu vínculo e as permissões. Seu histórico permanece preservado.</p></section>');return;}
 if(!members.length){shell('<section class="panel"><div class="eyebrow">Acesso confirmado</div><h2>Falta conectar sua rede.</h2><p>Você já entrou como <strong>'+safe(user.app_metadata?.bertha_code_member?(members[0]?.name||'Seu espaço'):user.email)+'</strong>. Para receber as atividades compartilhadas, abra o convite que o Owner enviou pelo WhatsApp ou cole o link abaixo.</p><p class="note">O novo código de convite conecta sua conta individual de satélite, sem e-mail ou senha. Convites antigos por link continuam disponíveis para o e-mail indicado pelo Owner.</p><form id="linkForm"><div class="fields"><label>Link de convite ou código<input id="linkCode" required maxlength="2048" autocomplete="off" placeholder="Cole aqui o convite do Owner"></label></div><button class="primary" type="submit">Conectar com o Owner</button></form></section>');
  var hash=new URLSearchParams(location.hash.slice(1)),code=hash.get('link');try{code=code||sessionStorage.getItem(inviteKey);}catch(_){}if(code&&/^[0-9a-f-]{36}$/i.test(code))el('linkCode').value=code;
  el('linkForm').onsubmit=async function(e){e.preventDefault();var f=this;if(!f.reportValidity())return;var value=el('linkCode').value,shortCode=H.inviteCodeValue(value);
   if(shortCode){modal('Entrar com o código de convite?','<p>O Helper passará a usar a conta individual deste convite. Confira que ele foi enviado para você.</p><p class="note">O cadastro e os dados da sua conta por e-mail serão preservados. Não precisa confirmar e-mail novamente.</p>',async function(){await client.enterCode(shortCode,kidsMode?'kids':'adult',claimNonce);sessionStorage.removeItem('bertha.code.claim.nonce');sessionStorage.removeItem(inviteKey);await initialize();notice('Seu espaço está conectado.');});return;}
   var token=H.inviteToken(value);if(!token){notice('Confira o código de três blocos enviado pelo Owner ou cole o link de convite antigo.',true);return;}f.querySelector('button').disabled=true;try{await client.action('link_accept',{token:token});sessionStorage.removeItem(inviteKey);history.replaceState(null,'',location.pathname+location.search);await loadRemote();notice('Seu espaço foi conectado.');}catch(err){fail(err);}finally{if(f.isConnected)f.querySelector('button').disabled=false;}};return;
 }
 if(kidsMode){shell('<section class="panel"><div class="eyebrow">Minha rede</div><h2>Olá, '+safe(members[0].name)+'.</h2><p>Seu acesso Kids está conectado à rede do responsável.</p><p class="note">Missões, companheiros e conquistas entre aparelhos estão em implementação. As artes e o progresso já existentes na BERTH.A do Owner permanecem preservados.</p><button id="kidsGuides" class="primary">Casa</button></section>');el('kidsGuides').onclick=function(){view='casa';render();};return;}
 shell(taskPanel());bindTasks();
}
function bindOwner(){
 if(el('connect'))el('connect').onclick=async function(){this.disabled=true;try{network=await client.action('network',{});await loadRemote();notice('Rede conectada. Agora leia os adultos cadastrados.');}catch(e){fail(e);}finally{if(this.isConnected)this.disabled=false;}};
 if(!network)return;
 el('syncMembers').onclick=async function(){this.disabled=true;try{
  sources=H.ownerSources(localStorage);
  for(var m of sources.members)await client.action('member',{network_id:network.id,local_id:String(m.id),name:m.name,avatar_key:m.avatarKey,permissions:{tasks:m.permissions&&m.permissions.casa===true},requires_validation:m.requiresValidation===true});
  await loadRemote();notice(sources.members.length?'Cadastros e permissões atualizados.':'Não há adultos cadastrados neste navegador. Abra a BERTH.A principal para cadastrar uma pessoa real.');
 }catch(e){fail(e);}finally{if(this.isConnected)this.disabled=false;}};
 el('readTasks').onclick=function(){sources=H.ownerSources(localStorage);drawShare();};
 document.querySelectorAll('[data-link]').forEach(function(b){b.onclick=function(){
  var m=members.find(function(x){return x.id===b.dataset.link;});
  modal('Vincular '+m.name,'<p>Informe o e-mail que esta pessoa usará no Helper.</p><div class="fields"><label>E-mail do adulto<input name="email" type="email" required maxlength="254" autocomplete="off"></label></div>',async function(d){
   var link=await client.action('link',{network_id:network.id,member_id:m.id,email:d.querySelector('input').value.trim()});
   var url=new URL('helper.html',location.href);url.hash='link='+link.token;
   var result=modal('Vínculo pronto','<p>Válido por sete dias e apenas para o e-mail informado. Compartilhe pessoalmente com '+safe(m.name)+'.</p><label>Link de convite<input readonly value="'+safe(url.href)+'"></label><p class="note">Nenhuma mensagem foi enviada automaticamente.</p><button type="button" id="copyLink">Copiar convite</button>',null);
   result.querySelector('#copyLink').onclick=async function(){try{await navigator.clipboard.writeText(url.href);result.querySelector('.modal-status').textContent='Convite copiado. Envie pelo WhatsApp para esta pessoa.';}catch(_){result.querySelector('.modal-status').textContent='Selecione e copie o link acima.';}};
  });
 };});
 document.querySelectorAll('[data-resume]').forEach(function(b){b.onclick=function(){modal('Retomar acesso?','<p>A mesma conta volta a acessar as atividades autorizadas. Vínculos antigos revogados continuam inválidos.</p>',async function(){var remote=members.find(function(m){return m.id===b.dataset.resume;}),local=H.ownerSources(localStorage).members.find(function(m){return remote&&String(m.id)===remote.local_id;});if(!local||local.permissions?.casa!==true)throw new Error('Confira o cadastro e a permissão para tarefas na BERTH.A principal antes de retomar.');await client.action('member',{network_id:network.id,local_id:String(local.id),name:local.name,avatar_key:local.avatarKey,permissions:{tasks:true},requires_validation:local.requiresValidation===true});await client.action('resume',{network_id:network.id,member_id:b.dataset.resume});await loadRemote();notice('Acesso retomado.');});};});
 document.querySelectorAll('[data-pause]').forEach(function(b){b.onclick=function(){modal('Pausar acesso?','<p>Esta conta deixa de receber e consultar atividades compartilhadas. Os cadastros e históricos permanecem preservados.</p>',async function(){await client.action('pause',{network_id:network.id,member_id:b.dataset.pause});await loadRemote();notice('Acesso pausado.');});};});
}
function drawShare(){
 var adults=sources.members.filter(function(m){return m.permissions&&m.permissions.casa===true&&members.some(function(r){return r.local_id===String(m.id)&&r.active;});});
 var area=el('shareArea');if(!adults.length){area.innerHTML='<p>Leia os cadastros e escolha adultos com permissão para tarefas na BERTH.A principal.</p>';return;}
 area.innerHTML='<div class="fields"><label>Compartilhar com<select id="shareMember">'+adults.map(function(m){return '<option value="'+safe(String(m.id))+'">'+safe(m.name)+'</option>';}).join('')+'<option value="__all">Todos os adultos autorizados</option></select></label></div><form id="shareForm"><div id="sourceList"></div><div class="row"><button type="submit" class="primary">Compartilhar atividades escolhidas</button><button type="button" id="cancelShare">Cancelar seleção</button></div></form>';
 function showSources(){var choice=el('shareMember').value,chosen=choice==='__all'?adults:adults.filter(function(x){return String(x.id)===choice;}),available=sources.tasks.filter(function(x){return chosen.some(function(m){return H.eligibleSource(x,m);});});el('sourceList').innerHTML=available.length?available.map(function(x,i){return '<div class="share-row"><input type="checkbox" id="pick-'+i+'" data-source="'+i+'" aria-label="Compartilhar '+safe(x.task.name)+'"><label for="pick-'+i+'">'+safe(x.task.name)+'<small>'+safe(x.area)+' · '+(x.task.responsibility==='help'?'Disponível para ajuda':'Delegada')+'</small></label><label>Dia combinado<input type="date" data-date="'+i+'" value="'+H.localDay()+'"></label></div>';}).join(''):'<p>Nenhuma atividade disponível para este adulto. Revise ajuda/delegação em Casa.</p>';
  el('cancelShare').onclick=function(){area.innerHTML='';};el('sourceList').querySelectorAll('[data-source]').forEach(function(c){c.onchange=function(){el('sourceList').querySelector('[data-date="'+c.dataset.source+'"]').required=c.checked;};});
  el('shareForm').onsubmit=async function(e){e.preventDefault();var selected=[...this.querySelectorAll('[data-source]:checked')];if(!selected.length){notice('Escolha pelo menos uma atividade.',true);return;}this.querySelector('button').disabled=true;
   try{
    // Refresh the current local permissions and responsibility before each explicit publish.
    var current=H.ownerSources(localStorage),liveMembers=chosen.map(function(m){return current.members.find(function(x){return String(x.id)===String(m.id);});}),remoteByLocal={};
    if(liveMembers.some(function(m){return !m||m.permissions?.casa!==true;}))throw new Error('A permissão mudou. Atualize os cadastros antes de compartilhar.');
    for(var live of liveMembers)remoteByLocal[String(live.id)]=await client.action('member',{network_id:network.id,local_id:String(live.id),name:live.name,avatar_key:live.avatarKey,permissions:{tasks:true},requires_validation:live.requiresValidation===true});
    for(var checkbox of selected){var i=Number(checkbox.dataset.source),source=available[i],nowSource=current.tasks.find(function(x){return x.kind===source.kind&&String(x.task.id)===String(source.task.id);}),date=el('shareForm').querySelector('[data-date="'+i+'"]').value;
     var recipients=nowSource?liveMembers.filter(function(m){return H.eligibleSource(nowSource,m);}):[];
     if(!nowSource||!recipients.length||!H.dateValid(date))throw new Error('A atividade ou seu destinatário mudou. Leia novamente.');
     await client.action('share',{network_id:network.id,source_ref:source.kind+'|'+source.task.id+'|'+date,title:nowSource.task.name,area:nowSource.area,task_date:date,targets:recipients.map(function(m){return remoteByLocal[String(m.id)].id;}),responsibility:nowSource.task.responsibility,requires_validation:false});
    }
    await loadRemote();notice('Atividades compartilhadas. Repetir o mesmo envio não duplica a atividade.');
   }catch(err){fail(err);}finally{if(this.isConnected)this.querySelector('button').disabled=false;}
  };
 }
 el('shareMember').onchange=showSources;showSources();
}
async function loadRemote(){
 if(loading)return;loading=true;var g=++generation;
 try{
  var fetchedMembers=await client.query('bertha_hml_members','select=*&order=name.asc'),fetchedTasks=await client.query('bertha_hml_tasks','select=*&order=task_date.asc');
  var fetchedRecognitions=await client.query('bertha_hml_recognitions','select=*&order=sent_at.desc');
  var fetchedGuides=await client.query('bertha_hml_guides','select=*&order=title.asc');
  var fetchedNetworks=await client.query('bertha_hml_networks','select=*');
  if(g!==generation||!user)return;
  recognitions=fetchedRecognitions;guides=fetchedGuides;members=fetchedMembers;
  if(owner){network=fetchedNetworks.find(function(n){return n.owner_id===user.id;})||null;members=members.filter(function(m){return network&&m.network_id===network.id;});tasks=fetchedTasks.filter(function(t){return network&&t.network_id===network.id;});}
  else{members=members.filter(function(m){return m.user_id===user.id&&m.active&&m.kind===(kidsMode?'kids':'adult');});var networks=members.map(function(m){return m.network_id;});tasks=fetchedTasks.filter(function(t){return !t.withdrawn&&networks.includes(t.network_id);});}
  if(!transportKey||!['messages','privacy','invitations'].includes(view)||!(owner?network:members.length))render();
 }finally{loading=false;}
}
async function initialize(){
 try{user=await client.user();await loadRemote();if(owner&&(localStorage.getItem('bertha.hml.invite.pending.v369')||new URLSearchParams(location.search).get('return')==='main')){location.replace('./?v=372#satelites');return;}clearInterval(interval);interval=setInterval(function(){if(document.visibilityState==='visible'&&user&&!owner&&!document.querySelector('dialog[open]')&&document.activeElement?.id!=='search')loadRemote().catch(fail);},20000);}
 catch(e){user=null;render();fail(e);}
}
window.addEventListener('storage',function(e){if(e.key!==authKey)return;generation++;user=null;members=[];tasks=[];network=null;clearInterval(interval);render();restoreEmailLink().then(function(handled){if(!handled&&client.session())initialize();});});
window.addEventListener('offline',function(){notice('Você está sem conexão. Aguarde antes de confirmar atividades.',true);});
window.addEventListener('online',function(){if(user)loadRemote().then(function(){notice('Conexão retomada.');}).catch(fail);});
render();restoreEmailLink().then(function(handled){if(!handled&&client.session())initialize();});
})();


