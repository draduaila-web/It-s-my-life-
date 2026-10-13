(function(root){
'use strict';
function create(o){var host=null,epoch=0,timer=null,alive=true;var client=o.client,safe=o.escape;
 async function refresh(){var g=epoch;if(!alive||!host?.isConnected)return;var items=await client.query('bertha_hml_invitations','select=*&network_id=eq.'+o.network.id+'&order=updated_at.desc'),responses=await client.query('bertha_hml_invitation_responses','select=*');if(!alive||g!==epoch)return;
 host.innerHTML='<h2>Convites</h2><p class="note">Cada pessoa escolhe se vai, talvez ou não vai.</p><div id="inviteStatus" class="status" role="status"></div>'+items.map(function(i){var r=responses.filter(function(r){return r.invitation_id===i.id;});return '<article class="task"><h3>'+safe(i.title)+'</h3><p>'+safe(i.when_text||'Sem horário')+'</p>'+(o.owner?'<p>'+r.length+' resposta(s) recebida(s).</p>':'<label>Sua resposta<select data-rsvp="'+safe(i.id)+'"><option value="">Escolha</option>'+[['yes','Vou'],['maybe','Talvez'],['no','Não vou']].map(function(x){return '<option value="'+x[0]+'" '+(r.some(function(a){return a.status===x[0];})?'selected':'')+'>'+x[1]+'</option>';}).join('')+'</select></label><button class="primary" data-save-rsvp="'+safe(i.id)+'">Salvar resposta</button>')+'</article>';}).join('');if(!items.length)host.innerHTML+='<p>Nenhum convite compartilhado com você.</p>';
 host.querySelectorAll('[data-save-rsvp]').forEach(function(b){b.onclick=async function(){var value=host.querySelector('[data-rsvp="'+b.dataset.saveRsvp+'"]').value;if(!value)return;this.disabled=true;try{await client.invitation('respond',{invitation_id:b.dataset.saveRsvp,status:value},o.user.id);await refresh();host.querySelector('#inviteStatus').textContent='Sua resposta foi enviada ao Owner.';}catch(e){host.querySelector('#inviteStatus').textContent=e.message;b.disabled=false;}};});
 }
 return {mount:async function(node){host=node;epoch++;await refresh();clearInterval(timer);timer=setInterval(function(){if(document.visibilityState==='visible'&&!host.querySelector('select:focus'))refresh().catch(function(){});},10000);},destroy:function(){alive=false;epoch++;clearInterval(timer);}};
}
root.BerthaInvitations={create:create};
})(window);
