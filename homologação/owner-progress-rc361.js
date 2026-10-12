/* BERTH.A RC361 — evidências do Owner. Sem rede, GPS ou acesso ao Saúde. */
(function(root,factory){
  const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;
  else{root.BerthaOwnerProgress=api;api.install(root);}
})(typeof window==='object'?window:null,function(){
  'use strict';
  function stamp(h){const x=h.endedAt||h.startedAt||0;return typeof x==='number'?x:Date.parse(x)||Number(x)||0;}
  function day(at){const d=new Date(at);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
  function eventKey(h){return h.id?String(h.id):JSON.stringify([h.itemId||h.plannedItemId||h.learningKey,h.day||day(stamp(h)),stamp(h)]);}
  function unique(history){const seen=new Set();return (history||[]).filter(h=>{if(h.status!=='done'||!stamp(h))return false;const k=eventKey(h);if(seen.has(k))return false;seen.add(k);return true;});}
  function referenceScore(dim,hist,g,days,finance,dims){
    const target=Number(g&&g.targetPercent);
    if(target>0){const dates=new Set(unique(hist).filter(h=>dims(h).includes(dim)).map(h=>h.day||day(stamp(h))));return {handled:true,value:Math.min(100,Math.round(dates.size/Math.max(1,days)*100/target*100)),days:dates.size,target};}
    if(dim==='financeiro'&&Number(g&&g.onTimePercent)>0){if(finance.onTime==null)return {handled:true,value:null};const vals=[Math.min(100,finance.onTime/Number(g.onTimePercent)*100)];if(finance.goalPct!=null)vals.push(finance.goalPct);return {handled:true,value:Math.round(vals.reduce((a,b)=>a+b,0)/vals.length)};}
    return {handled:false,value:null};
  }
  function period(at,rec){const d=new Date(at);if(rec==='monthly')return day(at).slice(0,7);if(rec==='weekly'){d.setDate(d.getDate()-(d.getDay()+6)%7);return day(d.getTime());}return '';}
  function art(rule){if(rule.criterion==='streak'){if(Number(rule.value)>=30)return 'focus';return /constância|constancia/i.test(rule.name||'')?'constancy':'sequence';}return {progress100:'balance',goal:'goal',cycle:'cycle'}[rule.criterion]||'evolution';}
  function advance(input,candidates,rules,baseline){
    const ledger=JSON.parse(JSON.stringify(input));ledger.seen=ledger.seen||{};ledger.pending=ledger.pending||{};ledger.awards=ledger.awards||[];
    const active=new Map(rules.filter(r=>r.active!==false).map(r=>[String(r.id),r]));
    candidates.sort((a,b)=>a.at-b.at||a.key.localeCompare(b.key)).forEach(c=>{
      const r=active.get(String(c.rewardId));if(!r)return;const k=JSON.stringify([r.id,r.criterion,c.key]);if(ledger.seen[k])return;ledger.seen[k]=true;if(baseline)return;
      const bucket=period(c.at,r.recurrence);if(r.recurrence==='once'&&ledger.awards.some(a=>a.rewardId===r.id))return;
      if(bucket&&ledger.awards.some(a=>a.rewardId===r.id&&a.bucket===bucket))return;
      const batch=(r.criterion==='goal'||r.criterion==='cycle')?Math.max(1,Math.floor(Number(r.value)||1)):1;
      const pending=ledger.pending[r.id]||(ledger.pending[r.id]=[]);pending.push(c);if(pending.length<batch)return;
      const evidence=pending.splice(0,batch),occurrence=ledger.awards.filter(a=>a.rewardId===r.id).length+1;
      ledger.awards.push({id:k,rewardId:r.id,name:r.name,criterion:r.criterion,artKey:art(r),at:c.at,bucket,occurrence,toneIndex:(occurrence-1)%6,evidence:evidence.map(e=>({key:e.key,label:e.label,records:e.records||[]}))});
    });return ledger;
  }
  function streakCandidates(rule,hist,qualifies){
    const byDay=new Map();unique(hist).forEach(h=>{const d=h.day||day(stamp(h));if(!byDay.has(d))byDay.set(d,[]);byDay.get(d).push(h);});
    let run=0,previous='';const out=[],n=Math.max(1,Math.floor(Number(rule.value)||7));
    [...byDay.keys()].sort().forEach(d=>{const prev=new Date(d+'T12:00:00');prev.setDate(prev.getDate()-1);run=qualifies(byDay.get(d))?(previous===day(prev.getTime())?run+1:1):0;previous=d;if(run&&run%n===0)out.push({rewardId:rule.id,key:'streak:'+d+':'+n,at:Math.max(...byDay.get(d).map(stamp)),label:n+' dias de referências atendidas',records:byDay.get(d).map(eventKey)});});return out;
  }
  function completedCycles(plans,hist){return (plans||[]).filter(p=>p.required.length&&p.required.every(item=>unique(hist).some(h=>(h.day||day(stamp(h)))===item.day&&String(h.itemId||'')===item.itemId))).map(p=>({key:'cycle:'+p.key,label:p.label,at:Math.max(...unique(hist).filter(h=>p.required.some(i=>(h.day||day(stamp(h)))===i.day&&String(h.itemId||'')===i.itemId)).map(stamp)),records:unique(hist).filter(h=>p.required.some(i=>(h.day||day(stamp(h)))===i.day&&String(h.itemId||'')===i.itemId)).map(eventKey)}));}
  function install(win){
    const storage=win.berthaHmlStorage;if(!storage||!win.BerthaLifeEvidence)return;
    const KEY='bertha.owner.achievements.v1';let queued=false,baseline=false;
    const read=()=>{try{const raw=storage.getItem(KEY);if(!raw)return null;const value=JSON.parse(raw);if(value.version!==1||!Array.isArray(value.awards))throw Error('Histórico Owner desconhecido');return value;}catch(e){console.warn('BERTH.A Owner: histórico preservado sem alteração',e);return false;}};
    const rules=()=>typeof loadOwnerRewards==='function'?loadOwnerRewards():[];
    function candidates(){
      const rs=rules(),snap=win.BerthaLifeEvidence.snapshot('week'),hist=unique(win.BerthaLifeEvidence.history()),out=[];
      rs.filter(r=>r.active!==false).forEach(r=>{
        if(r.criterion==='progress100'){
          const mode=r.recurrence==='monthly'?'month':'week',s=win.BerthaLifeEvidence.snapshot(mode),refs=s.scores.filter(x=>s.goals[x[0]]);
          refs.filter(x=>x[2]!=null&&x[2]>=Math.max(1,Number(r.value)||100)).forEach(x=>{const proof=s.hist.filter(h=>x[0]==='financeiro'||win.BerthaLifeEvidence.dimensions(h).includes(x[0]));if(proof.length)out.push({rewardId:r.id,key:'alignment:'+x[0]+':'+mode+':'+s.period,at:Math.max(...proof.map(stamp)),label:x[1]+' · '+x[2]+'% das referências · '+s.period,records:proof.map(eventKey)});});
        }
        if(r.criterion==='streak')out.push(...streakCandidates(r,hist,list=>{const refs=Object.keys(snap.goals).filter(k=>k!=='financeiro'&&snap.goals[k].targetPercent);return refs.length>0&&refs.every(k=>referenceScore(k,list,snap.goals[k],1,{},win.BerthaLifeEvidence.dimensions).value>=100);}));
        if(r.criterion==='goal')out.push(...win.BerthaLifeEvidence.completedGoals().map(c=>({...c,rewardId:r.id})));
        if(r.criterion==='cycle')out.push(...completedCycles(win.BerthaTimeEngine&&win.BerthaTimeEngine.ownerCyclePlans?win.BerthaTimeEngine.ownerCyclePlans():[],hist).map(c=>({...c,rewardId:r.id})));
      });return out;
    }
    function refresh(){queued=false;const previous=read();if(previous===false)return;const first=!previous;const initial=previous||{version:1,createdAt:Date.now(),seen:{},pending:{},awards:[]};const next=advance(initial,candidates(),rules(),first||baseline);baseline=false;if(JSON.stringify(initial)!==JSON.stringify(next)||first)storage.setItem(KEY,JSON.stringify(next));}
    function schedule(isBaseline){baseline=baseline||isBaseline;if(queued)return;queued=true;queueMicrotask(refresh);}
    const priorSet=storage.setItem.bind(storage);storage.setItem=function(key,value){const result=priorSet(key,value);if(key!==KEY){if(key==='bertha.progress-goals.v1'||key==='bertha.owner.rewards.v1')schedule(true);else if(key==='bertha.time-engine.v1'||key==='bertha.ritual.cycles.v1'||key==='bertha.finance.goals.named.v1'||key==='minha-vida.ideias.v1')schedule(false);}return result;};
    win.BerthaOwnerAchievements={history:()=>{const v=read();return v&&v.awards||[];},refresh,counts:()=>{const counts={};win.BerthaOwnerAchievements.history().forEach(a=>{counts[a.artKey]=(counts[a.artKey]||0)+1;});return counts;}};
    refresh();if(location.hash==='#progresso'&&typeof renderProgressOverview==='function')renderProgressOverview();
  }
  return {stamp,day,eventKey,unique,referenceScore,advance,streakCandidates,completedCycles,install};
});
