/* BERTH.A RC216 — Kids · ciclo de 30 dias + assets Gato Neblina + cache bust
   - Preserva a base RC211/RC209.
   - Corrige o renderer dos 15 assets do Gato Neblina com caminho versionado RC216.
   - Trilha por pontos atribuídos pelo Owner.
   - Primeiro pet de cada período de 30 dias: Bronze → Prata → Ouro → Troféu → Super Troféu → Cápsula.
   - Pets seguintes no mesmo período: Troféu → Super Troféu → Cápsula.
   - Após a cápsula, 5 acessórios são liberados por metas de pontos configuráveis.
   - Sem punição, sem perda de pontos, sem ranking. Conquistas históricas permanecem.
*/
(function(){
  'use strict';
  const BUILD='RC216';
  const ASSET_BASE='assets/rc216/kids/neblina/gato/';
  const PERIOD_MS=30*24*60*60*1000;
  const PERIOD_ANCHOR='bertha.kids.30day.anchor.';
  const VARIANT_PREFIX='bertha.kids.accessory.variant.';
  const IDS={
    'mist_mist_v1_cat_head_0':'bone',
    'mist_mist_v1_cat_neck_1':'coleira',
    'mist_mist_v1_cat_eyes_2':'oculos',
    'mist_mist_v1_cat_back_3':'mochila',
    'mist_mist_v1_cat_special_4':'amuleto'
  };
  const PALS=['nevoa','coral','misto'];
  const FULL=[
    {key:'bronze',label:'Bronze'},
    {key:'silver',label:'Prata'},
    {key:'gold',label:'Ouro'},
    {key:'trophy',label:'Troféu'},
    {key:'super',label:'Super Troféu'},
    {key:'capsule',label:'Cápsula'}
  ];
  const SHORT=[
    {key:'trophy',label:'Troféu'},
    {key:'super',label:'Super Troféu'},
    {key:'capsule',label:'Cápsula'}
  ];

  const store=()=>window.berthaHmlStorage||window.localStorage;
  function stamp(){
    document.documentElement.dataset.berthaBuild=BUILD;
    document.documentElement.dataset.berthaIndex=BUILD;
    document.title='BERTH.A · Homologação '+BUILD;
    const idx=document.getElementById('rc157IndexBadge');
    if(idx) idx.textContent='INDEX · '+BUILD;
    document.querySelectorAll('body *').forEach(el=>{
      if(el.children.length===0 && /^HML\s*·\s*RC\d+/i.test((el.textContent||'').trim())) el.textContent='HML · '+BUILD;
    });
  }

  function selectedKid(){
    const sel=document.querySelector('#r152KidSel');
    if(sel && sel.value) return String(sel.value);
    if(window.__rc209Member!=null) return String(window.__rc209Member);
    return String(store().getItem('bertha.rewards.selected.kid')||'');
  }

  function periodMeta(mid){
    const s=store();
    const key=PERIOD_ANCHOR+mid;
    let anchor=Number(s.getItem(key));
    const now=Date.now();
    if(!Number.isFinite(anchor)||anchor<=0||anchor>now){anchor=now;s.setItem(key,String(anchor));}
    const index=Math.max(0,Math.floor((now-anchor)/PERIOD_MS));
    const start=anchor+index*PERIOD_MS;
    const end=start+PERIOD_MS;
    return {id:'p'+index,index,start,end,day:Math.min(30,Math.floor((now-start)/(24*60*60*1000))+1)};
  }

  function variantFor(aid){
    const mid=selectedKid();
    const n=Number(store().getItem(VARIANT_PREFIX+mid+'.'+aid));
    return Number.isFinite(n)?Math.max(0,Math.min(2,n)):2;
  }
  function srcFor(aid){
    const stem=IDS[aid]; if(!stem) return '';
    return ASSET_BASE+stem+'-'+PALS[variantFor(aid)]+'.png?v=216a';
  }
  function preloadAssets(){
    Object.values(IDS).forEach(stem=>PALS.forEach(p=>{const im=new Image();im.decoding='async';im.src=ASSET_BASE+stem+'-'+p+'.png?v=216a';}));
  }

  const oldNew=window.r152NewCycle;
  if(typeof oldNew==='function'){
    window.r152NewCycle=function(mid){
      const c=oldNew(mid);
      const pm=periodMeta(mid);
      const box=window.r152Box?.(mid)?.box||{history:[]};
      const completed=(box.history||[]).filter(h=>h&&h.status==='complete'&&h.periodId===pm.id).length;
      c.periodId=pm.id;c.periodStart=pm.start;c.periodEnd=pm.end;
      c.cycleMode=completed===0?'full':'short';
      c.pointsPerStep=Math.max(1,+c.pointsPerStep||20);
      c.pointsPerAccessory=Math.max(1,+c.pointsPerAccessory||c.pointsPerStep);
      return c;
    };
  }

  const oldEnsure=window.r152EnsureCycle;
  if(typeof oldEnsure==='function'){
    window.r152EnsureCycle=function(mid){
      let res=window.r152Box?.(mid); let box=res?.box; let all=res?.all;
      const pm=periodMeta(mid);
      if(box&&box.current&&box.current.periodId&&box.current.periodId!==pm.id){
        box.history=box.history||[];
        box.history.push({...box.current,status:'period-closed',closedAt:Date.now()});
        box.current=null; if(all){all[mid]=box;window.r152SaveAllCycles?.(all);}
      }
      const c=oldEnsure(mid);
      if(!c.periodId){
        const box2=window.r152Box?.(mid)?.box||{history:[]};
        const completed=(box2.history||[]).filter(h=>h&&h.status==='complete'&&h.periodId===pm.id).length;
        c.periodId=pm.id;c.periodStart=pm.start;c.periodEnd=pm.end;c.cycleMode=completed===0?'full':'short';
      }
      c.pointsPerStep=Math.max(1,+c.pointsPerStep||20);
      c.pointsPerAccessory=Math.max(1,+c.pointsPerAccessory||c.pointsPerStep);
      const box3=window.r152Box?.(mid); if(box3?.box&&box3?.all){box3.box.current=c;box3.all[mid]=box3.box;window.r152SaveAllCycles?.(box3.all);}
      return c;
    };
  }

  function currentLifetime(mid){return +(window.loadKidsProgress?.()[mid]?.lifetime||0)}
  function stateFor(mid,c){
    const pm=periodMeta(mid);
    const cycle=Math.max(0,currentLifetime(mid)-(+c.startLifetime||0));
    const pps=Math.max(1,+c.pointsPerStep||20);
    const ppa=Math.max(1,+c.pointsPerAccessory||pps);
    const rewards=(c.cycleMode==='short')?SHORT:FULL;
    const baseCount=rewards.length;
    const baseDone=Math.min(baseCount,Math.floor(cycle/pps));
    const capsuleReached=baseDone>=baseCount;
    const baseTarget=baseCount*pps;
    const accessoryPoints=Math.max(0,cycle-baseTarget);
    const unlocked=capsuleReached?Math.min(5,Math.floor(accessoryPoints/ppa)):0;
    const complete=unlocked>=5;
    let nextLabel=''; let pointsToNext=0;
    if(!capsuleReached){
      nextLabel=rewards[baseDone]?.label||'Cápsula';
      pointsToNext=Math.max(0,(baseDone+1)*pps-cycle);
    }else if(!complete){
      nextLabel='Acessório '+(unlocked+1)+' de 5';
      pointsToNext=Math.max(0,(unlocked+1)*ppa-accessoryPoints);
    }else nextLabel='Pet completo';
    return {pm,cycle,pps,ppa,rewards,baseCount,baseDone,capsuleReached,baseTarget,accessoryPoints,unlocked,complete,nextLabel,pointsToNext};
  }

  function patchAssets(root){
    root.querySelectorAll('.rc209-acc-proxy[data-acc]').forEach(proxy=>{
      const aid=proxy.getAttribute('data-acc'); if(!IDS[aid]) return;
      const src=srcFor(aid);
      proxy.classList.add('rc216-gato-asset');
      proxy.dataset.rc216='1';
      let im=proxy.querySelector('img');
      if(!im){proxy.replaceChildren();im=document.createElement('img');im.alt='';im.loading='eager';im.decoding='async';proxy.appendChild(im);}
      if(im.getAttribute('src')!==src) im.setAttribute('src',src);
    });
  }

  function findCurrent(){
    const mid=selectedKid(); if(!mid||typeof window.r152EnsureCycle!=='function') return null;
    const c=window.r152EnsureCycle(mid); return {mid,c,st:stateFor(mid,c)};
  }

  function patchTrail(root,ctx){
    const shell=root.querySelector('.rc209-kids-shell'); if(!shell||!ctx) return;
    const {mid,c,st}=ctx;
    shell.dataset.rc216='1';

    const stats=shell.querySelectorAll('.r197-current .r197-stats>span');
    if(stats[0]){const sm=stats[0].querySelector('small'),b=stats[0].querySelector('b');if(sm)sm.textContent='Próxima conquista';if(b)b.textContent=st.nextLabel;}
    if(stats[1]){const sm=stats[1].querySelector('small'),b=stats[1].querySelector('b');if(sm)sm.textContent='Pontos do ciclo';if(b)b.textContent=String(st.cycle);}
    if(stats[2]){const sm=stats[2].querySelector('small'),b=stats[2].querySelector('b');if(sm)sm.textContent='Acessórios';if(b)b.textContent=st.unlocked+'/5';}

    const heroP=shell.querySelector('.r197-hero .r197-top p');
    if(heroP) heroP.textContent='Ciclo de 30 dias · dia '+st.pm.day+'/30 · sem ranking e sem perda de pontos';

    const trailCard=[...shell.querySelectorAll('.r197-card')].find(x=>(x.querySelector('.r197-kicker')?.textContent||'').includes('TRILHA KIDS'));
    if(trailCard){
      const h=trailCard.querySelector('h3');
      if(h) h.textContent=(c.cycleMode==='short')?'Troféu → Super Troféu → Cápsula':'Bronze → Prata → Ouro → Troféu → Super Troféu → Cápsula';
      const p=trailCard.querySelector('.r197-head p');
      if(p) p.textContent='Cada conquista é liberada por pontuação definida pelo Owner. Após a cápsula, novas metas de pontos liberam os 5 acessórios.';
      const steps=[...trailCard.querySelectorAll('.r197-trail .r197-step')];
      steps.forEach((el,i)=>{
        const show=(c.cycleMode!=='short')||i>=3;
        el.style.display=show?'':'none';
        if(!show)return;
        const logical=(c.cycleMode==='short')?i-3:i;
        el.classList.toggle('done',logical<st.baseDone);
        el.classList.toggle('current',logical===st.baseDone&&!st.capsuleReached);
      });
      const after=trailCard.querySelector('.r197-after');
      if(after){
        const b=after.querySelector('b'),span=after.querySelector('span');
        if(b)b.textContent=st.capsuleReached?(st.complete?'Pet completo':'Pet revelado · personalização em andamento'):'Próxima conquista: '+st.nextLabel;
        if(span)span.textContent=st.complete?'5/5 acessórios liberados · coleção preservada':('Faltam '+st.pointsToNext+' pontos para '+st.nextLabel+'.');
      }
    }

    const kitCard=[...shell.querySelectorAll('.r197-card')].find(x=>(x.querySelector('.r197-kicker')?.textContent||'').includes('KIT DO PET'));
    if(kitCard){
      const p=kitCard.querySelector('.r197-head p'); if(p)p.textContent='5 acessórios exclusivos deste companheiro · cada item é liberado por uma nova meta de pontos após a cápsula.';
      [...kitCard.querySelectorAll('.r197-acc')].forEach((card,i)=>{
        const unlocked=i<st.unlocked;
        card.classList.toggle('unlocked',unlocked);
        const cb=card.querySelector('input[type="checkbox"]');if(cb){cb.checked=unlocked;cb.disabled=true;}
        const lock=card.querySelector('.rc208-lock');
        if(lock){
          const need=Math.max(0,(i+1)*st.ppa-st.accessoryPoints);
          lock.textContent=unlocked?'Liberado':(st.capsuleReached?'Faltam '+need+' pontos':'Disponível após a cápsula');
        }
      });
    }

    const settings=[...shell.querySelectorAll('.r197-card')].find(x=>(x.querySelector('.r197-kicker')?.textContent||'').includes('CONFIGURAÇÃO DO OWNER'));
    if(settings){
      const title=settings.querySelector('h3');if(title)title.textContent='Coleção, pet e metas de pontos';
      const p=settings.querySelector('.r197-head p');if(p)p.textContent='O Owner define coleção, pet e quantos pontos cada conquista exige.';
      const grid=settings.querySelector('.r197-settings');
      if(grid&&!settings.querySelector('#rc216AccPts')){
        const lab=document.createElement('label');lab.innerHTML='Pontos por acessório<input id="rc216AccPts" type="number" min="1" value="'+st.ppa+'">';grid.appendChild(lab);
      }else if(settings.querySelector('#rc216AccPts')) settings.querySelector('#rc216AccPts').value=String(st.ppa);
      const pps=settings.querySelector('#r152Pts'); if(pps&&pps.previousSibling&&pps.parentElement) pps.parentElement.childNodes[0].nodeValue='Pontos por conquista';
      const save=settings.querySelector('#r152SaveCycle');
      if(save&&!save.dataset.rc216){
        save.dataset.rc216='1';
        save.addEventListener('click',()=>{
          setTimeout(()=>{
            const boxInfo=window.r152Box?.(mid);const cc=window.r152EnsureCycle?.(mid);if(!boxInfo||!cc)return;
            const input=document.querySelector('#rc216AccPts');
            cc.pointsPerAccessory=Math.max(1,+input?.value||cc.pointsPerStep||20);
            cc.periodId=st.pm.id;cc.periodStart=st.pm.start;cc.periodEnd=st.pm.end;
            boxInfo.box.current=cc;boxInfo.all[mid]=boxInfo.box;window.r152SaveAllCycles?.(boxInfo.all);
          },20);
        },true);
      }
    }

    const finish=shell.querySelector('#r152FinishCycle');
    if(finish){
      finish.disabled=!st.complete;
      if(!finish.dataset.rc216){
        const clone=finish.cloneNode(true);clone.dataset.rc216='1';finish.replaceWith(clone);
        clone.addEventListener('click',()=>{
          const bi=window.r152Box?.(mid);const cc=window.r152EnsureCycle?.(mid);const ss=cc?stateFor(mid,cc):null;
          if(!bi||!cc||!ss?.complete)return;
          bi.box.history=bi.box.history||[];
          bi.box.history.push({...cc,status:'complete',completedAt:Date.now(),periodId:ss.pm.id});
          bi.box.current=null;bi.all[mid]=bi.box;window.r152SaveAllCycles?.(bi.all);
          window.renderRewardsRC152?.('kids');setTimeout(schedule,40);
        });
      }
    }
  }

  const style=document.createElement('style');
  style.id='rc216-kids-style';
  style.textContent=`
    .r197-acc-art .rc216-gato-asset{display:flex!important;align-items:center!important;justify-content:center!important;width:100%!important;height:100%!important;min-height:136px!important;overflow:visible!important;background:transparent!important}
    .r197-acc-art .rc216-gato-asset img{display:block!important;width:98%!important;height:136px!important;object-fit:contain!important;object-position:center!important;filter:none!important;transform:none!important}
    .r197-acc:has(.rc216-gato-asset) .r197-acc-art{min-height:144px!important;overflow:visible!important}
    .rc209-kids-shell[data-rc216="1"] .rc208-settings{grid-template-columns:repeat(5,minmax(0,1fr))!important}
    @media(max-width:700px){.rc209-kids-shell[data-rc216="1"] .rc208-settings{grid-template-columns:1fr 1fr!important}}
    @media(max-width:480px){.rc209-kids-shell[data-rc216="1"] .rc208-settings{grid-template-columns:1fr!important}}
  `;
  document.head.appendChild(style);

  let observer=null,queued=false;
  function run(){
    queued=false;
    if(observer)observer.disconnect();
    try{stamp();const pane=document.querySelector('[data-r147pane="kids"]')||document;patchAssets(pane);patchTrail(pane,findCurrent());}
    finally{if(observer){const t=document.querySelector('[data-r147pane="kids"]')||document.body;observer.observe(t,{childList:true,subtree:true});}}
  }
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(run);}

  preloadAssets();
  observer=new MutationObserver(schedule);
  const t=document.querySelector('[data-r147pane="kids"]')||document.body;
  observer.observe(t,{childList:true,subtree:true});
  schedule();[80,220,550,1100,2200].forEach(ms=>setTimeout(schedule,ms));
  window.addEventListener('pageshow',()=>setTimeout(schedule,50));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(schedule,50)});
  document.addEventListener('click',e=>{if(e.target.closest('[data-r147tab="kids"],[data-rc209variant],#r152KidSel,[data-rc208collection],[data-r152pet]'))setTimeout(schedule,40)},true);
  document.addEventListener('change',e=>{if(e.target.matches('#r152KidSel,#rc208CollectionSel,#rc208PetSel'))setTimeout(schedule,40)},true);
})();
