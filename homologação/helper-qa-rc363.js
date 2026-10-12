// Dedicated QA only. This file is never loaded by helper.html or helper-owner.html.
(function(){
var H=window.BerthaHelper,key='bertha.helper.qa.rc363',owner=new URLSearchParams(location.search).get('mode')==='owner';
document.body.dataset.helperMode=owner?'owner':'adult';
function offset(n){var d=new Date();d.setDate(d.getDate()+n);return H.localDay(d);}
var data;try{data=JSON.parse(localStorage.getItem(key)||'null');}catch(_){}
if(!data){data={network:{id:'qa-network',owner_id:'qa-owner'},members:[{id:'qa-a',network_id:'qa-network',local_id:'qa-local-a',user_id:'qa-adult',name:'QA Adulto A',active:true,kind:'adult',permissions:{tasks:true},requires_validation:true},{id:'qa-b',network_id:'qa-network',local_id:'qa-local-b',user_id:'qa-adult-b',name:'QA Adulto B',active:true,kind:'adult',permissions:{tasks:true},requires_validation:true}],tasks:[{id:'qa-today',title:'Organizar materiais da casa e guardar os itens de uso diário no lugar combinado com todas as pessoas da rede',area:'Casa · organização',task_date:offset(0),state:'available',responsibility:'help',targets:['qa-a'],requires_validation:true},{id:'qa-yesterday',title:'Conferir utensílios da cozinha',area:'Cozinha',task_date:offset(-1),state:'assigned',responsibility:'delegated',targets:['qa-a'],requires_validation:true},{id:'qa-earlier',title:'Cuidar das plantas da varanda',area:'Jardim',task_date:offset(-4),state:'available',responsibility:'help',targets:['qa-a'],requires_validation:true},{id:'qa-next',title:'Revisar manutenção do equipamento',area:'Manutenção',task_date:offset(2),state:'available',responsibility:'help',targets:['qa-a'],requires_validation:true}],events:[]};data.tasks.forEach(function(t){t.network_id='qa-network';});localStorage.setItem(key,JSON.stringify(data));}
function read(){return JSON.parse(localStorage.getItem(key));}
function save(d){localStorage.setItem(key,JSON.stringify(d));}
H.ownerSources=function(){return {members:[{id:'qa-local-a',role:'adult',name:'QA Adulto A',permissions:{casa:true},requiresValidation:true},{id:'qa-local-b',role:'adult',name:'QA Adulto B',permissions:{casa:true},requiresValidation:true}],tasks:[{kind:'routine',area:'Casa',task:{id:'qa-source',name:'QA Atividade para compartilhar',responsibility:'help',satelliteStatus:'available'}}]};};
H.createClient=function(){return {
session:function(){return {qa:true};},
user:async function(){return {id:owner?'qa-owner':'qa-adult',email:owner?'owner@example.invalid':'adult@example.invalid'};},
signOut:async function(){},
query:async function(table){var d=read();if(table==='bertha_hml_members')return owner?d.members:d.members.filter(function(m){return m.user_id==='qa-adult'&&m.active;});if(table==='bertha_hml_tasks')return owner?d.tasks:d.tasks.filter(function(t){return d.members.some(function(m){return m.id==='qa-a'&&m.active&&m.permissions.tasks&&t.targets.includes(m.id);});});if(table==='bertha_hml_networks')return [d.network];return [];},
action:async function(op,arg){var d=read(),t=d.tasks.find(function(x){return x.id===arg.task_id;}),m=d.members.find(function(x){return x.id===arg.member_id;});
 if(op==='network')return d.network;
 if(op==='member'){m=d.members.find(function(x){return x.local_id===arg.local_id;});if(!m)throw new Error('QA member unavailable');m.permissions=arg.permissions;save(d);return m;}
 if(op==='pause'){m.active=false;save(d);return m;}
 if(op==='share'){t=d.tasks.find(function(x){return x.source_ref===arg.source_ref;});if(!t){t=Object.assign({id:'qa-shared-'+d.tasks.length,state:'available'},arg);d.tasks.push(t);}else t.targets=Array.from(new Set(t.targets.concat(arg.targets)));save(d);return t;}
 if(!t)throw new Error('QA task unavailable');
 if(op==='claim'){if(!t.actor_id){t.actor_id='qa-a';t.state='accepted';d.events.push(op);}else if(t.actor_id!=='qa-a')throw new Error('Outra pessoa assumiu.');}
 if(op==='start'&&t.state==='accepted'){t.state='in_progress';d.events.push(op);}
 if(op==='complete'&&t.state==='in_progress'){t.state='completed';d.events.push(op);}
 if(op==='validate'&&t.state==='completed'){t.state='validated';d.events.push(op);}
 save(d);return t;
}};};})();
