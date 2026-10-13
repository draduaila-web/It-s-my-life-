(function(root){
'use strict';
function plan(H,sources,remoteMembers,remoteTasks){
 return sources.tasks.map(function(x){var recipients=sources.members.filter(function(m){return H.eligibleSource(x,m);}).map(function(m){return remoteMembers.find(function(r){return r.local_id===String(m.id)&&r.active&&r.kind==='adult'&&r.permissions.tasks===true;});}).filter(Boolean);if(!recipients.length)return null;
 var prefix=x.kind+'|'+x.task.id+'|',old=remoteTasks.filter(function(t){return t.source_ref.startsWith(prefix)&&!t.withdrawn&&!['completed','validated'].includes(t.state);}).sort(function(a,b){return b.task_date.localeCompare(a.task_date);})[0];var date=H.dateValid(x.task.date)?x.task.date:H.localDay();
 return {source_ref:old?old.source_ref:prefix+date,title:x.task.name,area:x.area,task_date:old?old.task_date:date,targets:recipients.map(function(m){return m.id;}),responsibility:x.task.responsibility,requires_validation:x.task.requiresValidation===true};
 }).filter(Boolean);
}
root.BerthaNetworkPlan=plan;
if(!root.document)return;
var H=root.BerthaHelper,storage=H.sessionStorageFor(localStorage,sessionStorage,'bertha.helper.hml.owner.auth.v1').storage,client=H.createClient({base:'https://ouxellokvigbdeeyvvfv.supabase.co',key:'sb_publishable_2lmnQX4WD-s343sEZoFERA_B4URTnip',storage:storage,sessionKey:'bertha.helper.hml.owner.auth.v1'}),busy=false,scheduled=null,lastSignature='';
function feedback(text){var actions=document.querySelector('.s156-actions');if(!actions)return;var node=document.getElementById('networkSync381');if(!node){node=document.createElement('p');node.id='networkSync381';node.className='note';node.setAttribute('role','status');actions.after(node);}node.textContent=text;}
function rawRead(key){try{return JSON.parse(root.berthaHmlStorage.getItem(key)||'[]');}catch(_){return [];}}
async function sync(){
 if(busy||!client.session()||document.visibilityState==='hidden')return;busy=true;
 try{
 var user=await client.user(),networks=await client.query('bertha_hml_networks','select=*'),network=networks.find(function(n){return n.owner_id===user.id;});if(!network)return;
 var sources=H.ownerSources(localStorage),remoteMembers=await client.query('bertha_hml_members','select=*');
 for(var m of sources.members){await client.prepareInvite({local_id:String(m.id),name:m.name,kind:'adult',avatar_key:m.avatarKey,permissions:m.permissions,requires_validation:m.requiresValidation===true});}
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
 for(var completed of remoteTasks.filter(function(t){return t.state==='validated'&&!t.withdrawn;})){var pieces=completed.source_ref.split('|'),d=loadCasa(),task=pieces[0]==='maintenance'?(d.maintenance||[]).find(function(x){return String(x.id)===pieces[1];}):(d.areas||[]).flatMap(function(a){return a.tasks||[];}).find(function(x){return String(x.id)===pieces[1];});if(task?.satelliteStatus==='completed'&&task.networkCompletedRef!==completed.source_ref){task.networkCompletedRef=completed.source_ref;saveCasa(d);validateSatelliteCasaTask(task.id);}}
 sources=H.ownerSources(localStorage);var tasks=plan(H,sources,remoteMembers,remoteTasks),signature=JSON.stringify([user.id,tasks]);if(signature!==lastSignature){await client.syncTasks({network_id:network.id,tasks:tasks});lastSignature=signature;}
 var sent=await client.query('bertha_hml_recognitions','select=source_ref&network_id=eq.'+network.id),known=new Set(sent.map(function(r){return r.source_ref;}));
 for(var rec of rawRead('bertha.recognitions.v1')){if(known.has(String(rec.id)))continue;var member=remoteMembers.find(function(m){return m.local_id===String(rec.memberId)&&m.active&&m.kind==='adult';});if(!member)continue;var match=String(rec.icon||'').match(/recognition_(thanks|flower|coffee|pause|reward|saved|hug|care|arrasou).*?([ab])?$/),art=match?match[1]:/flor/i.test(rec.name)?'flower':/salvou/i.test(rec.name)?'saved':/incrível|arrasou/i.test(rec.name)?'arrasou':'thanks';await client.recognize({network_id:network.id,member_id:member.id,source_ref:String(rec.id),name:rec.name||'Reconhecimento',message:rec.message||'',icon:match?'':rec.icon||'',art_key:art,palette:/_b$/.test(rec.icon||'')?'brisa':'rose',sent_at:new Date(rec.at||Date.now()).toISOString()});}
 feedback('Atividades e reconhecimentos sincronizados com os Helpers.');
 }catch(e){lastSignature='';feedback('A rede ainda não sincronizou: '+e.message);}finally{busy=false;}
}
function schedule(){clearTimeout(scheduled);scheduled=setTimeout(sync,800);}
var original=root.berthaHmlStorage.setItem;root.berthaHmlStorage.setItem=function(key,value){var result=original.call(this,key,value);if(['minha-vida.casa.v1','bertha.satellites.v1','bertha.recognitions.v1'].includes(key))schedule();return result;};
root.addEventListener('storage',schedule);root.addEventListener('online',schedule);root.addEventListener('hashchange',schedule);document.addEventListener('visibilitychange',schedule);setInterval(sync,20000);schedule();
})(typeof window==='object'?window:globalThis);
