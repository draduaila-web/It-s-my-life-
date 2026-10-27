(function(root){
'use strict';
function locationState(s,now){now=now||Date.now();if(s.state==='ended'||Date.parse(s.expires_at)<=now)return 'ended';if(!s.updated_at)return 'unavailable';var age=now-Date.parse(s.updated_at);return !Number.isFinite(age)||age>60000?'stale':'current';}
function mergeMessages(remote,outbox){var ids=new Set(remote.map(function(m){return m.client_id;}));return remote.concat(outbox.filter(function(m){return !ids.has(m.client_id);}));}
function create(options){
 var client=options.client,user=options.user,network=options.network,owner=options.owner,safe=options.escape;
 var directory=[],conversation=null,outbox=[],cache={},host=null,view=null,map=null,mapLayers=[],mapsign='',timer=null,alive=true,epoch=0;
 var watch=null,gpsTimer=null,gpsGeneration=0,sharing=false,expires=0,sendingPosition=false,gpsNotice='',lastPositionSent=0;
 var pendingKey='bertha.helper.hml.outbox.'+user.id+'.'+network.id;
 // Drafts and failed sends are kept in this tab only, scoped to account and network.
 try{outbox=JSON.parse(sessionStorage.getItem(pendingKey)||'[]').map(function(m){m.status='failed';return m;});}catch(_){}
 function save(){sessionStorage.setItem(pendingKey,JSON.stringify(outbox));}
 function rpc(op,arg){return client.social(op,Object.assign({network_id:network.id},arg),user.id);}
 function name(id){var p=directory.find(function(p){return p.user_id===id;});return p?p.name:'Participante';}
 function el(id){return host&&host.querySelector('#'+id);}
 function status(s){if(el('socialStatus'))el('socialStatus').textContent=s;}
 async function init(){directory=await rpc('directory',{});}
 function destroyMap(){if(map){map.remove();map=null;}mapsign='';}
 async function mount(node,mode){host=node;view=mode;var g=++epoch;destroyMap();await init();if(!alive||g!==epoch||!host.isConnected)return;
  if(mode==='messages')await messages();else if(mode==='privacy')await privacy();
  clearInterval(timer);timer=setInterval(function(){if(alive&&document.visibilityState==='visible'&&host&&host.isConnected)refresh().catch(function(e){status(e.message);});},5000);
 }
 async function messages(){
  host.innerHTML='<h2>Mensagens</h2><p class="note">Duplas de membros da rede precisam da autorização do Owner. Após revogação ou bloqueio, o histórico pode ser consultado pelos dois participantes com acesso ativo à rede. O Owner não lê conversas privadas entre adultos.</p><label>Conversar com<select id="peer"><option value="">Escolha uma pessoa</option>'+directory.filter(function(p){return p.user_id!==user.id;}).map(function(p){return '<option value="'+safe(p.user_id)+'">'+safe(p.name)+'</option>';}).join('')+'</select></label><div id="socialStatus" class="status" role="status"></div><div id="conversationTools"></div><div id="messages" class="message-list" aria-live="polite"></div><form id="messageForm" hidden><label>Sua mensagem<textarea id="messageBody" required maxlength="2000" rows="3"></textarea></label><button class="primary" type="submit">Enviar</button></form>';
  el('peer').onchange=async function(){var g=++epoch;conversation=null;el('messageForm').hidden=true;el('messages').innerHTML='';el('conversationTools').innerHTML='';if(!this.value)return;
   try{var c=await rpc('open',{user_a:user.id,user_b:this.value});if(!alive||g!==epoch)return;conversation=c;await refreshMessages();}catch(e){if(g===epoch)status(e.message);}
  };
  el('messageForm').onsubmit=function(e){e.preventDefault();var body=el('messageBody').value.trim();if(!body||!conversation)return;var m={client_id:crypto.randomUUID(),conversation_id:conversation.id,sender_id:user.id,body:body,status:'pending',sent_at:new Date().toISOString()};outbox.push(m);save();el('messageBody').value='';send(m);};
  conversation=null;
  var recent=await client.query('bertha_hml_conversations','select=*&network_id=eq.'+network.id),incoming=await client.query('bertha_hml_messages','select=conversation_id,sender_id,sent_at&order=sent_at.desc&limit=100');
  var latest=incoming.find(function(m){return recent.some(function(c){return c.id===m.conversation_id;});}),selected=latest?recent.find(function(c){return c.id===latest.conversation_id;}):null,peer=selected?(selected.user_a===user.id?selected.user_b:selected.user_a):(owner?null:directory.find(function(p){return p.is_owner;})?.user_id);
  if(peer&&alive&&view==='messages'&&host.isConnected&&el('peer')){el('peer').value=peer;await el('peer').onchange.call(el('peer'));}
 }
 async function send(m){if(m.status==='sending')return;m.status='sending';save();
  try{if(conversation)await drawMessages();var accepted=await rpc('send',{conversation_id:m.conversation_id,client_id:m.client_id,body:m.body});var rows=cache[m.conversation_id]||[];if(!rows.some(function(x){return x.id===accepted.id;}))rows.push(accepted);cache[m.conversation_id]=rows;outbox=outbox.filter(function(x){return x.client_id!==m.client_id;});save();if(alive&&view==='messages')await refreshMessages();}
  catch(e){m.status='failed';save();if(alive&&view==='messages'){status(e.message);await drawMessages();}}
 }
 async function drawMessages(remote){
  if(!conversation||!el('messages'))return;var cid=conversation.id,g=epoch;
  if(!remote){try{remote=await client.query('bertha_hml_messages','select=*&conversation_id=eq.'+conversation.id+'&order=sent_at.desc,id.desc&limit=100');cache[cid]=remote.slice();}catch(e){remote=(e.status===401||e.status===403)?[]:(cache[cid]||[]).slice();}}
  if(!alive||g!==epoch||!conversation||conversation.id!==cid||!el('messages'))return;remote=remote.slice().sort(function(a,b){return Date.parse(a.sent_at)-Date.parse(b.sent_at);});var rows=mergeMessages(remote,outbox.filter(function(m){return m.conversation_id===conversation.id;}));
  el('messages').innerHTML=rows.map(function(m){return '<article class="message '+(m.sender_id===user.id?'mine':'')+'"><strong>'+safe(name(m.sender_id))+'</strong><p>'+safe(m.body)+'</p><small>'+safe(new Date(m.sent_at).toLocaleString('pt-BR'))+' · '+(m.status==='failed'?'Falha':m.status?'Envio pendente':'Enviado')+'</small>'+(m.status==='failed'?'<button data-retry="'+safe(m.client_id)+'">Tentar novamente</button>':'')+'</article>';}).join('')||'<p>A conversa começa com sua primeira mensagem.</p>';
  el('messages').querySelectorAll('[data-retry]').forEach(function(b){b.onclick=function(){var m=outbox.find(function(x){return x.client_id===b.dataset.retry;});if(m)send(m);};});
 }
 async function refreshMessages(){
  if(!conversation)return;var cid=conversation.id,g=epoch;
  var cs=await client.query('bertha_hml_conversations','select=*&id=eq.'+cid);
  if(!alive||g!==epoch||!el('messageForm'))return;
  if(!cs.length){conversation=null;el('messageForm').hidden=true;el('messages').innerHTML='';status('Conversa indisponível.');return;}
  conversation=cs[0];var allowed=conversation.allowed&&conversation.blocked_by.length===0;
  el('messageForm').hidden=!allowed;status(allowed?'Mensagens de texto · atualização a cada 5 segundos enquanto esta página estiver aberta.':'Novos envios bloqueados. Histórico preservado para participantes ativos.');
  var blocked=conversation.blocked_by.includes(user.id);el('conversationTools').innerHTML='<button id="blockPeer">'+(blocked?'Desbloquear pessoa':'Bloquear pessoa')+'</button>';
  el('blockPeer').onclick=async function(){try{await rpc('block',{conversation_id:cid,blocked:!blocked});await refreshMessages();}catch(e){status(e.message);}};
  await drawMessages();
 }
 async function privacy(){
  var generation=epoch;
  if(!owner){host.innerHTML='<h2>Privacidade</h2><p>Você pode bloquear uma pessoa na conversa. Revogar uma dupla impede novos envios e preserva o histórico para os participantes ativos.</p>';return;}
  var peers=directory.filter(function(p){return !p.is_owner;}),permissions=await rpc('permissions',{});
  if(!alive||generation!==epoch||!host.isConnected)return;var pairs=[];peers.forEach(function(a,i){peers.slice(i+1).forEach(function(b){pairs.push({a:a,b:b,allowed:permissions.some(function(p){return p.allowed&&[p.user_a,p.user_b].includes(a.user_id)&&[p.user_a,p.user_b].includes(b.user_id);})});});});
  host.innerHTML='<h2>Comunicação da rede</h2><p>Novas conversas entre membros da rede ficam bloqueadas por padrão. Autorizar uma dupla não dá acesso às conversas privadas dos adultos.</p>'+pairs.map(function(p,i){return '<label class="check privacy-row"><input type="checkbox" data-pair="'+i+'" '+(p.allowed?'checked':'')+'>'+safe(p.a.name)+' ↔ '+safe(p.b.name)+'</label>';}).join('')+(!pairs.length?'<p>Para autorizar uma dupla, conecte pelo menos duas pessoas à rede usando os códigos individuais. Cadastros ainda sem vínculo não aparecem aqui.</p>':'')+'<div id="socialStatus" class="status" role="status"></div>';
  host.querySelectorAll('[data-pair]').forEach(function(b){b.onchange=async function(){var p=pairs[Number(b.dataset.pair)],value=b.checked;b.disabled=true;try{await rpc('communication',{user_a:p.a.user_id,user_b:p.b.user_id,allowed:value});status(value?'Comunicação autorizada.':'Novos envios bloqueados. Histórico preservado para os participantes ativos.');}catch(e){b.checked=!value;status(e.message);}finally{b.disabled=false;}};});
 }
 async function refresh(){if(view==='messages')await refreshMessages();}
 return {mount:mount,refresh:refresh,destroy:function(clear){alive=false;epoch++;clearInterval(timer);destroyMap();outbox=[];if(clear)sessionStorage.removeItem(pendingKey);}};
}
var api={create:create,locationState:locationState,mergeMessages:mergeMessages};
if(typeof module==='object'&&module.exports)module.exports=api;else root.BerthaSocial=api;
})(typeof window==='object'?window:globalThis);


