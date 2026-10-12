(function(){
'use strict';
var H=window.BerthaHelper,owner=document.body.dataset.helperMode==='owner',app=document.getElementById('helperApp');
var client=H.createClient({base:'https://ouxellokvigbdeeyvvfv.supabase.co',key:'sb_publishable_2lmnQX4WD-s343sEZoFERA_B4URTnip',storage:sessionStorage,sessionKey:'bertha.helper.hml.'+(owner?'owner':'adult')+'.auth.v1'});
var user=null,members=[],tasks=[],network=null,sources=null,view='all',period='today',search='',loading=false,generation=0,interval=null;
var labels={today:'Hoje',yesterday:'Ontem',earlier:'Anteriores',upcoming:'Próximas',all:'Todas'};
var states={available:'Disponível para ajudar',assigned:'Delegada',accepted:'Assumida',in_progress:'Em andamento',completed:'Aguardando validação',validated:'Concluída'};
function el(id){return document.getElementById(id);}function safe(s){return H.escape(s);}
function notice(s,error){var node=el('notice');if(node){node.textContent=s||'';node.classList.toggle('error',!!error);}}
function fail(e){notice(navigator.onLine===false?'Você está sem conexão. Nenhuma ação foi confirmada.':e.message||'Não foi possível concluir.',true);}
function shell(content){
 document.body.classList.toggle('owner',owner);
 app.innerHTML='<div class="shell"><header class="top"><img class="logo" src="'+(owner?'bertha-icon-512.png':'helper-icon-rc363.svg')+'" alt="'+(owner?'BERTH.A':'BERTH.A Helper em menta')+'"><div><div class="brand">BERTH.A'+(owner?'':' <sup style="font-size:11px;letter-spacing:0">h</sup>')+'</div><div class="eyebrow">'+(owner?'Owner · conectar adultos':'Helper · colaboração adulta')+'</div></div><button class="account" id="account">'+(user?'Minha conta':'Entrar')+'</button></header><section class="hero"><div class="eyebrow">Homologação · RC363</div><h1>'+(owner?'Um vínculo simples.<br>Uma rede que coopera.':'Um pouco de ajuda.<br>Uma vida mais leve.')+'</h1><p>'+(owner?'Escolha o adulto, conecte a conta dele e compartilhe as atividades que vocês querem cuidar juntos.':'Encontre o que pode fazer hoje, ofereça ajuda e acompanhe suas atividades. Cada contribuição tem seu espaço.')+'</p></section><div id="notice" class="status" role="status" aria-live="polite"></div><div id="content">'+content+'</div><footer><p class="note">BERTH.A · Homologação. Compartilhe apenas o que faz sentido.</p><a href="./?v=362#satelites">Abrir BERTH.A principal</a></footer></div>'+(!owner&&user?'<nav class="bottom" aria-label="Navegação Helper"><button id="allView" aria-pressed="'+(view==='all')+'">Colaborar</button><button id="mineView" aria-pressed="'+(view==='mine')+'">Minhas tarefas</button><button id="accountBottom">Conta</button></nav>':'');
 el('account').onclick=account;
 if(el('allView')){el('allView').onclick=function(){view='all';render();};el('mineView').onclick=function(){view='mine';render();};el('accountBottom').onclick=account;}
}
function authContent(){
 return '<section class="panel auth"><div class="eyebrow">Seu acesso</div><h2>Entre na sua BERTH.A</h2><p>'+(owner?'Use sua conta para conectar a rede. Seus cadastros locais continuam na BERTH.A principal.':'Use o e-mail que o Owner escolheu para seu vínculo.')+'</p><form id="authForm"><div class="fields"><label>E-mail<input id="email" type="email" autocomplete="username" required maxlength="254"></label><label>Senha<input id="password" type="password" autocomplete="current-password" required minlength="1" maxlength="128"></label></div><div class="row"><button class="primary" type="submit">Entrar</button><button id="signup" type="button">Criar minha conta</button></div></form><p class="note">Ao criar a conta, confira o e-mail de confirmação e depois entre aqui.</p></section>';
}
function bindAuth(){
 var f=el('authForm');if(!f)return;
 async function submit(signup){if(!f.reportValidity())return;var email=el('email').value.trim(),password=el('password').value;if(signup&&password.length<8){notice('Use pelo menos oito caracteres para criar sua senha.',true);return;}f.querySelectorAll('button').forEach(function(b){b.disabled=true;});notice('Conectando…');
  try{if(signup){await client.signUp(email,password);if(!client.session()){notice('Confira seu e-mail para confirmar a conta. Depois entre com sua senha.');return;}}else await client.signIn(email,password);await initialize();}
  catch(e){fail(e);}finally{var p=el('password');if(p)p.value='';if(f.isConnected)f.querySelectorAll('button').forEach(function(b){b.disabled=false;});}
 }
 f.onsubmit=function(e){e.preventDefault();submit(false);};el('signup').onclick=function(){submit(true);};
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
 if(!user){el('email')?.scrollIntoView({block:'center'});return;}
 var d=modal('Minha conta','<p>'+safe(user.email)+'</p><p class="note">O acesso às atividades depende do vínculo e das permissões do Owner.</p><button type="button" id="signout">Sair desta conta</button>',null);
 d.querySelector('#signout').onclick=async function(){try{await client.signOut();}catch(_){}user=null;members=[];tasks=[];network=null;generation++;clearInterval(interval);d.close();render();};
}
function taskHtml(t){
 var mine=members.some(function(m){return m.id===t.actor_id;});
 var action=!owner?(t.actor_id&&!mine?'':t.state==='available'||t.state==='assigned'?'<button class="primary" data-action="claim" data-task="'+safe(t.id)+'">'+(t.responsibility==='help'?'Quero ajudar':'Assumir tarefa')+'</button>':mine&&t.state==='accepted'?'<button class="primary" data-action="start" data-task="'+safe(t.id)+'">Começar</button>':mine&&t.state==='in_progress'?'<button class="primary" data-action="complete" data-task="'+safe(t.id)+'">Concluir</button>':''):(t.state==='completed'?'<button class="primary" data-action="validate" data-task="'+safe(t.id)+'">Validar conclusão</button>':'');
 return '<article class="task"><div class="eyebrow">'+safe(t.area)+'</div><h3>'+safe(t.title)+'</h3><p class="note">'+dateLabel(t.task_date)+'</p><span class="pill">'+safe(states[t.state]||t.state)+(t.actor_id&&!mine&&!owner?' · outra pessoa':'')+'</span><div class="row">'+action+'</div></article>';
}
function dateLabel(s){return H.dateValid(s)?new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'short',timeZone:'UTC'}).format(new Date(s+'T12:00:00Z')):'Sem data';}
function filtered(){
 var mids=members.map(function(m){return m.id;}),text=search.trim().toLocaleLowerCase('pt-BR');
 return tasks.filter(function(t){return (view!=='mine'||mids.includes(t.actor_id))&&(period==='all'||H.bucket(t.task_date,H.localDay())===period)&&(!text||(t.title+' '+t.area).toLocaleLowerCase('pt-BR').includes(text));})
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
 return '<section class="panel"><div class="row" style="justify-content:space-between"><div><h2>Adultos da minha rede</h2><p class="note">Vínculo por e-mail confirmado. Helper é a colaboração do adulto.</p></div><button id="syncMembers">Ler cadastros e atualizar permissões</button></div><div id="memberList">'+members.map(function(m){return '<div class="member"><div class="grow"><strong>'+safe(m.name)+'</strong><p class="note">'+(!m.active?'Acesso pausado':m.user_id?'Conta vinculada':'Aguardando vínculo')+' · '+(m.permissions.tasks===true?'tarefas autorizadas':'tarefas não autorizadas')+'</p></div><div class="row">'+(!m.active?'':(!m.user_id?'<button data-link="'+safe(m.id)+'">Vincular conta</button>':'')+'<button data-pause="'+safe(m.id)+'">Pausar acesso</button>')+'</div></div>';}).join('')+'</div><div id="ownerEmpty"></div></section><section class="panel"><h2>Escolher atividades para compartilhar</h2><p class="note">Somente rotinas e manutenções já disponíveis para ajuda ou delegação. Os registros da BERTH.A principal permanecem preservados.</p><button id="readTasks">Ler atividades deste navegador</button><div id="shareArea"></div></section>'+taskPanel();
}
function render(){
 if(!user){shell(authContent());bindAuth();return;}
 if(owner){shell(ownerPanel());bindOwner();if(network)bindTasks();return;}
 if(!members.length){shell('<section class="panel"><h2>Vamos conectar seu espaço</h2><p>Peça ao Owner seu vínculo de acesso e use o mesmo e-mail escolhido por ele.</p><form id="linkForm"><div class="fields"><label>Código de vínculo<input id="linkCode" required pattern="[0-9a-fA-F-]{36}" maxlength="36" autocomplete="off"></label></div><button class="primary" type="submit">Conectar com o Owner</button></form></section>');
  var hash=new URLSearchParams(location.hash.slice(1)),code=hash.get('link');if(code&&/^[0-9a-f-]{36}$/i.test(code))el('linkCode').value=code;
  el('linkForm').onsubmit=async function(e){e.preventDefault();var f=this;if(!f.reportValidity())return;f.querySelector('button').disabled=true;try{await client.action('link_accept',{token:el('linkCode').value.trim()});history.replaceState(null,'',location.pathname+location.search);await loadRemote();notice('Seu espaço foi conectado.');}catch(err){fail(err);}finally{if(f.isConnected)f.querySelector('button').disabled=false;}};return;
 }
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
   var result=modal('Vínculo pronto','<p>Válido por sete dias e apenas para o e-mail informado. Compartilhe pessoalmente com '+safe(m.name)+'.</p><label>Link de acesso<input readonly value="'+safe(url.href)+'"></label><p class="note">Nenhuma mensagem foi enviada automaticamente.</p><button type="button" id="copyLink">Copiar vínculo</button>',null);
   result.querySelector('#copyLink').onclick=async function(){try{await navigator.clipboard.writeText(url.href);result.querySelector('.modal-status').textContent='Vínculo copiado.';}catch(_){result.querySelector('.modal-status').textContent='Selecione e copie o link acima.';}};
  });
 };});
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
  var fetchedNetworks=await client.query('bertha_hml_networks','select=*');
  if(g!==generation||!user)return;
  members=fetchedMembers;
  if(owner){network=fetchedNetworks.find(function(n){return n.owner_id===user.id;})||null;members=members.filter(function(m){return network&&m.network_id===network.id;});tasks=fetchedTasks.filter(function(t){return network&&t.network_id===network.id;});}
  else{members=members.filter(function(m){return m.user_id===user.id&&m.active&&m.kind==='adult';});var networks=members.map(function(m){return m.network_id;});tasks=fetchedTasks.filter(function(t){return networks.includes(t.network_id);});}
  render();
 }finally{loading=false;}
}
async function initialize(){
 try{user=await client.user();await loadRemote();clearInterval(interval);interval=setInterval(function(){if(document.visibilityState==='visible'&&user&&!owner&&!document.querySelector('dialog[open]')&&document.activeElement?.id!=='search')loadRemote().catch(fail);},20000);}
 catch(e){user=null;render();fail(e);}
}
window.addEventListener('offline',function(){notice('Você está sem conexão. Aguarde antes de confirmar atividades.',true);});
window.addEventListener('online',function(){if(user)loadRemote().then(function(){notice('Conexão retomada.');}).catch(fail);});
render();if(client.session())initialize();
})();
