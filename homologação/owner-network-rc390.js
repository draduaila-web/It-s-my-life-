(function(root){
'use strict';
function plan(H,sources,remoteMembers,remoteTasks){
 return sources.tasks.map(function(x){var recipients=sources.members.filter(function(m){return H.eligibleSource(x,m);}).map(function(m){return remoteMembers.find(function(r){return r.local_id===String(m.id)&&r.active&&['adult','kids'].includes(r.kind)&&r.permissions.tasks===true;});}).filter(Boolean);if(!recipients.length)return null;
 var prefix=x.kind+'|'+x.task.id+'|',old=remoteTasks.filter(function(t){return t.source_ref.startsWith(prefix)&&!t.withdrawn&&!['completed','validated'].includes(t.state);}).sort(function(a,b){return b.task_date.localeCompare(a.task_date);})[0];var date=H.dateValid(x.task.date)?x.task.date:H.localDay();
 return {source_ref:old?old.source_ref:prefix+date,title:x.task.name,area:x.area,task_date:old?old.task_date:date,targets:recipients.map(function(m){return m.id;}),responsibility:x.task.responsibility,requires_validation:x.task.requiresValidation===true};
 }).filter(Boolean);
}
root.BerthaNetworkPlan=plan;
if(!root.document)return;
var H=root.BerthaHelper,storage=H.sessionStorageFor(localStorage,sessionStorage,'bertha.helper.hml.owner.auth.v1').storage,client=H.createClient({base:'https://ouxellokvigbdeeyvvfv.supabase.co',key:'sb_publishable_2lmnQX4WD-s343sEZoFERA_B4URTnip',storage:storage,sessionKey:'bertha.helper.hml.owner.auth.v1'}),busy=false,scheduled=null,lastSignature='';
function feedback(text){var actions=document.querySelector('.s156-actions');if(!actions)return;var node=document.getElementById('networkSync381');if(!node){node=document.createElement('p');node.id='networkSync381';node.className='note';node.setAttribute('role','status');actions.after(node);}node.textContent=text;}
function ownerSources390(){var s=H.ownerSources(localStorage),all=rawRead('bertha.satellites.v1');s.members=(all.members||[]).filter(function(m){return ['adult','kids'].includes(m.role)&&!['removed','paused'].includes(m.status);});return s;}
function art390(asset){if(typeof root.r147img!=='function')return '';var d=document.createElement('div');d.innerHTML=root.r147img(asset);return d.querySelector('img')?.getAttribute('src')||'';}
function kidsSnapshot390(member){var id=member.id,p=(typeof root.loadKidsProgress==='function'?root.loadKidsProgress():{})[id]||{},c=typeof root.r152EnsureCycle==='function'?root.r152EnsureCycle(id):null,box=typeof root.r152Box==='function'?root.r152Box(id).box:{history:[]};if(!c)return {progress:p};
var units=Math.floor(Math.max(0,(+p.lifetime||0)-(+c.startLifetime||0))/Math.max(1,+c.pointsPerStep||20)),unlocked=Math.min(5,Math.floor(Math.max(0,units-5)/3)),theme=c.theme||'mist',labels=['Medalha Bronze','Medalha Prata','Medalha Ouro','Troféu','Super Troféu'],types=['bronze','prata','ouro','trofeu','super'],rewards=root.BerthaKidsAwardsRC344||{},palette=root.berthaHmlStorage.getItem('bertha.kids.palette.'+id)||'neutral';
return {progress:{lifetime:+p.lifetime||0,season:+p.season||0,seasonKey:p.seasonKey,log:(p.log||[]).slice(0,30)},cycle:{number:c.number,theme:theme,petName:root.r152PetLabel?.(c.pet)||'Companheiro',petSrc:art390(c.pet),capsuleSrc:rewards.capsules?.[theme]||'',revealed:units>=5,pointsPerStep:+c.pointsPerStep||20,cyclePoints:Math.max(0,(+p.lifetime||0)-(+c.startLifetime||0)),units:units,unlocked:unlocked,palette:palette,awards:types.map(function(type,i){return {name:labels[i],src:rewards.rewards?.[theme+'_'+type]||'',unlocked:units>=i+1};}),accessories:(c.accessories||[]).slice(0,5).map(function(a,i){return {id:a,name:root.r152AccLabel?.(a)||'Acessório',src:art390(a),unlocked:i<unlocked};})},history:(box.history||[]).map(function(h){return {number:h.number,petName:root.r152PetLabel?.(h.pet)||'Companheiro',petSrc:art390(h.pet),completedAt:h.completedAt};})};}
function rawRead(key){try{return JSON.parse(root.berthaHmlStorage.getItem(key)||'[]');}catch(_){return [];}}
async function sync(){
 if(busy||!client.session()||document.visibilityState==='hidden'||document.querySelector('dialog[open]'))return;busy=true;
 try{
 var user=await client.user(),networks=await client.query('bertha_hml_networks','select=*'),network=networks.find(function(n){return n.owner_id===user.id;});if(!network)return;
 var sources=ownerSources390(),remoteMembers=await client.query('bertha_hml_members','select=*');
 for(var m of sources.members){await client.prepareInvite({local_id:String(m.id),name:m.name,kind:m.role==='kids'?'kids':'adult',avatar_key:m.avatarKey,permissions:m.permissions,requires_validation:m.requiresValidation===true});}
 remoteMembers=await client.query('bertha_hml_members','select=*');remoteMembers=remoteMembers.filter(function(m){return m.network_id===network.id;});
 var remoteTasks=await client.query('bertha_hml_tasks','select=*&network_id=eq.'+network.id+'&order=task_date.asc');
 var data=loadCasa(),changed=false;
 for(var t of remoteTasks){if(t.withdrawn||!t.actor_id)continue;var pieces=t.source_ref.split('|'),local=pieces[0]==='maintenance'?(data.maintenance||[]).find(function(x){return String(x.id)===pieces[1];}):(data.areas||[]).flatMap(function(a){return a.tasks||[];}).find(function(x){return String(x.id)===pieces[1];});var member=remoteMembers.find(function(m){return m.id===t.actor_id;});if(!local||!member||!['help','delegated'].includes(local.responsibility))continue;
 if(local.networkCompletedRef===t.source_ref)continue;
 if(local.satelliteStatus==='validated'&&t.state==='completed'){await client.action('validate',{network_id:network.id,task_id:t.id});continue;}
 if(local.done||local.status==='concluida')continue;
 var localState=t.state==='validated'?'completed':t.state;
 if(['accepted','in_progress','completed'].includes(localState)&&(local.satelliteStatus!==localState||String(local.claimedById)!==member.local_id)){local.claimedById=member.local_id;local.satelliteStatus=localState;if(['completed','validated'].includes(t.state)){local.completedById=member.local_id;local.completedAt=Date.parse(t.completed_at)||Date.now();}changed=true;}
 }
 if(changed)saveCasa(data);
 for(var completed of remoteTasks.filter(function(t){return t.state==='validated'&&!t.withdrawn;})){var pieces=completed.source_ref.split('|'),d=loadCasa(),task=pieces[0]==='maintenance'?(d.maintenance||[]).find(function(x){return String(x.id)===pieces[1];}):(d.areas||[]).flatMap(function(a){return a.tasks||[];}).find(function(x){return String(x.id)===pieces[1];});if(task?.satelliteStatus==='completed'&&task.networkCompletedRef!==completed.source_ref){task.networkCompletedRef=completed.source_ref;saveCasa(d);validateSatelliteCasaTask(task.id);render();}}
 sources=ownerSources390();var tasks=plan(H,sources,remoteMembers,remoteTasks),signature=JSON.stringify([user.id,tasks]);if(signature!==lastSignature){await client.syncTasks({network_id:network.id,tasks:tasks});lastSignature=signature;}
 for(var kid of sources.members.filter(function(m){return m.role==='kids';})){var remoteKid=remoteMembers.find(function(m){return m.local_id===String(kid.id)&&m.kind==='kids'&&m.active;});if(remoteKid)await client.kidsProfile({network_id:network.id,member_id:remoteKid.id,snapshot:kidsSnapshot390(kid)});}
 var sent=await client.query('bertha_hml_recognitions','select=source_ref&network_id=eq.'+network.id),known=new Set(sent.map(function(r){return r.source_ref;}));
 for(var rec of rawRead('bertha.recognitions.v1')){if(known.has(String(rec.id)))continue;var member=remoteMembers.find(function(m){return m.local_id===String(rec.memberId)&&m.active&&m.kind==='adult';});if(!member)continue;var match=String(rec.icon||'').match(/recognition_(thanks|flower|coffee|pause|reward|saved|hug|care|arrasou).*?([ab])?$/),art=match?match[1]:/flor/i.test(rec.name)?'flower':/salvou/i.test(rec.name)?'saved':/incrível|arrasou/i.test(rec.name)?'arrasou':'thanks';await client.recognize({network_id:network.id,member_id:member.id,source_ref:String(rec.id),name:rec.name||'Reconhecimento',message:rec.message||'',icon:match?'':rec.icon||'',art_key:art,palette:/_b$/.test(rec.icon||'')?'brisa':'rose',sent_at:new Date(rec.at||Date.now()).toISOString()});}
 if(changed&&location.hash==='#satelites')renderSatellites();
 if(window.BerthaCollaborationHistory)window.BerthaCollaborationHistory.render(remoteTasks,remoteMembers);
 feedback('Atividades, reconhecimentos e progresso Kids sincronizados com a rede.');
 }catch(e){lastSignature='';feedback('A rede ainda não sincronizou: '+e.message);}finally{busy=false;}
}
function schedule(){clearTimeout(scheduled);scheduled=setTimeout(sync,800);}
var original=root.berthaHmlStorage.setItem;root.berthaHmlStorage.setItem=function(key,value){var result=original.call(this,key,value);if(['minha-vida.casa.v1','bertha.satellites.v1','bertha.recognitions.v1','bertha.kids.progress.v1','bertha.kids.cycles.v2'].includes(key))schedule();return result;};
root.addEventListener('storage',schedule);root.addEventListener('online',schedule);root.addEventListener('hashchange',schedule);document.addEventListener('visibilitychange',schedule);setInterval(sync,20000);schedule();
})(typeof window==='object'?window:globalThis);

