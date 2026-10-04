/* ============================================================
 BERTH.A RC169 — correção final de premiações
 ============================================================ */
(function(){
 const BASE='';
 const PNG=new Set([
  'capsule_ocean','ocean_turtle_cute','ocean_shark_cute','ocean_acc_backpack','ocean_acc_collar','ocean_acc_glasses','ocean_acc_cap','ocean_acc_badge','ocean_acc_special',
  'medal_gold','super_trophy','solar_lion_cute',
  'pin_constancy','pin_cycle','pin_focus','pin_goal','pin_presence','pin_balance',
  'pin_sequence','pin_delivery','pin_continuity','pin_selfcare','pin_depth','pin_evolution',
  'capsule_space','capsule_coral','capsule_solar','capsule_forest','capsule_mist',
  'ocean_dolphin_cute','ocean_octopus_cute','ocean_whale_cute','ocean_clownfish_cute',
  'recognition_saved','recognition_hug'
 ]);
 const known=new Set([
  'recognition_heart','recognition_flower','recognition_coffee','recognition_dinner','recognition_family','recognition_gift','recognition_hug','recognition_saved',
  'pin_constancy','pin_cycle','pin_focus','pin_balance','pin_goal','pin_presence','pin_sequence','pin_delivery','pin_continuity','pin_selfcare','pin_depth','pin_evolution',
  'medal_bronze','medal_silver','medal_gold','trophy','super_trophy',
  'capsule_mist','capsule_ocean','capsule_space','capsule_forest','capsule_solar','capsule_coral',
  'mist_cat_cute','mist_rabbit_cute','mist_fox_cute','ocean_turtle_cute','ocean_shark_cute','ocean_dolphin_cute',
  'space_alien_cute','space_robot_cute','space_cat_cute','forest_wolf_cute','forest_fox_cute','forest_tiger_cute',
  'solar_lion_cute','solar_dragon_cute','solar_phoenix_cute','ocean_octopus_cute','ocean_whale_cute','ocean_clownfish_cute','coral_axolotl_cute','coral_octopus_cute','coral_seahorse_cute',
  ...['mist','ocean','space','forest','solar','coral'].flatMap(t=>['cap','collar','glasses','backpack','badge','special'].map(k=>`${t}_acc_${k}`))
 ]);
 const oldImg=window.r147img;
 window.r147img=r147img=function(name,cls=''){
   const n=String(name||'');
   if(known.has(n)) return `<img class="r147-img ${cls}" src="${BASE}${n}.${PNG.has(n)?'png':'svg'}" alt="">`;
   return oldImg?oldImg(n,cls):`<img class="r147-img ${cls}" src="${n}.svg" alt="">`;
 };

 function recognitionDefaults169(){
   return [
    {id:'thanks',asset:'recognition_heart',name:'Obrigada por hoje',message:'Obrigada por deixar o meu dia mais leve.',active:true},
    {id:'flower',asset:'recognition_flower',name:'Uma flor para você',message:'Um carinho para agradecer pela ajuda.',active:true},
    {id:'coffee',asset:'recognition_coffee',name:'Vale café',message:'Um café por minha conta. Obrigada pela ajuda.',active:true},
    {id:'dinner',asset:'recognition_dinner',name:'Vale jantar a dois',message:'Quero retribuir esse cuidado com um jantar a dois.',active:true},
    {id:'family',asset:'recognition_family',name:'Vale almoço em família',message:'Esse reconhecimento vale um almoço gostoso em família.',active:true},
    {id:'gift',asset:'recognition_gift',name:'Um mimo para você',message:'Você fez diferença. Quero te dar um mimo.',active:true},
    {id:'saved',asset:'recognition_saved',name:'Você salvou meu dia',message:'Você salvou meu dia hoje. Obrigada por estar comigo nisso.',active:true},
    {id:'hug',asset:'recognition_hug',name:'Um abraço em forma de obrigada',message:'Receba esse carinho como meu obrigada.',active:true}
   ];
 }
 function normalizeRecognition(list){
   const defaults=recognitionDefaults169();
   const byId=Object.fromEntries(defaults.map(x=>[x.id,x]));
   if(!Array.isArray(list)||!list.length) return defaults;
   const out=list.map(item=>{
     const d=byId[item.id] || defaults.find(x=>x.name===item.name) || null;
     if(!d) return item;
     const next={...d,...item};
     if(item.id==='saved' || /salvou meu dia/i.test(String(item.name||''))) next.asset='recognition_saved';
     if(item.id==='hug' || /abraço/i.test(String(item.name||''))) next.asset='recognition_hug';
     if(item.id==='thanks' || /obrigada por hoje/i.test(String(item.name||''))) next.asset='recognition_heart';
     if(item.id==='flower' || /flor/i.test(String(item.name||''))) next.asset='recognition_flower';
     return next;
   });
   // ensure any missing defaults are present
   defaults.forEach(d=>{ if(!out.some(x=>x.id===d.id)) out.push(d); });
   return out;
 }
 function readStore(key){ try{return JSON.parse(window.berthaHmlStorage.getItem(key)||'null');}catch{return null} }
 function writeStore(key,val){ try{window.berthaHmlStorage.setItem(key,JSON.stringify(val));}catch{} }
 function migrateRecognitionPresets(){
   const key='bertha.recognition.presets.v2';
   const normalized=normalizeRecognition(readStore(key));
   writeStore(key,normalized);
   return normalized;
 }
 window.r147RecognitionDefaults=recognitionDefaults169;
 window.r147RecognitionPresets=r147RecognitionPresets=function(){
   return migrateRecognitionPresets();
 };
 if(typeof window.r147SaveRecognitionPresets==='function'){
    const oldSave=window.r147SaveRecognitionPresets;
    window.r147SaveRecognitionPresets=function(x){ oldSave(normalizeRecognition(x)); };
 }

 const COLOR_KEY='bertha.kids.accessory.colors.v167';
 const PALETTE={rosa:'#ee8eae',lilas:'#a989df',azul:'#73b8e7',menta:'#79c9b8',dourado:'#e5b154',coral:'#ea917c'};
 function loadColors(){try{return JSON.parse(window.berthaHmlStorage.getItem(COLOR_KEY)||'{}')}catch{return {}}}
 function saveColors(x){window.berthaHmlStorage.setItem(COLOR_KEY,JSON.stringify(x))}
 function selectedKid(){return document.querySelector('#r152KidSel')?.value||window.berthaHmlStorage.getItem('bertha.rewards.selected.kid')||''}
 function cycleId(){const mid=selectedKid();try{return r152EnsureCycle(mid)?.id||'current'}catch{return 'current'}}
 function colorFor(asset){const c=loadColors();return c[`${selectedKid()}::${cycleId()}::${asset}`]||'azul'}
 function filterFor(k){return {rosa:'hue-rotate(310deg) saturate(1.08)',lilas:'hue-rotate(250deg) saturate(1.10)',azul:'hue-rotate(190deg) saturate(1.05)',menta:'hue-rotate(135deg) saturate(.92)',dourado:'hue-rotate(25deg) saturate(1.15)',coral:'hue-rotate(340deg) saturate(1.1)'}[k]||'none'}
 function personalizeAccessories(){
   document.querySelectorAll('[data-r152acc]').forEach(input=>{
     const label=input.closest('label'); if(!label||label.querySelector('.r166-colors'))return;
     const asset=input.dataset.r152acc,img=label.querySelector('img');
     const wrap=document.createElement('div');wrap.className='r166-colors';
     const active=colorFor(asset);
     wrap.innerHTML=Object.entries(PALETTE).map(([k,v])=>`<button type="button" class="${k===active?'active':''}" data-r166color="${k}" style="--c:${v}" aria-label="${k}"></button>`).join('');
     label.appendChild(wrap);
     if(img)img.style.filter=filterFor(active);
     wrap.querySelectorAll('button').forEach(b=>b.onclick=e=>{
       e.preventDefault();e.stopPropagation();
       const all=loadColors(),key=`${selectedKid()}::${cycleId()}::${asset}`;all[key]=b.dataset.r166color;saveColors(all);
       wrap.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===b));
       if(img)img.style.filter=filterFor(b.dataset.r166color);
     });
   });
 }
 function fixHelper(){
   document.querySelectorAll('.r147-helper-context>div').forEach(d=>{
     const st=d.querySelector('strong'),sm=d.querySelector('small');if(st)st.style.display='block';if(sm){sm.style.display='block';sm.style.marginTop='5px'}
   });
 }
 function patchOwnerCollection(){
   if(typeof window.r147OwnerCollection!=='function') return;
   window.r147OwnerCollection=function(){
     const items=[
      ['pin_constancy','Constância','7 dias'],
      ['pin_cycle','Ciclo concluído','rotina ou projeto'],
      ['pin_focus','Foco','30 dias'],
      ['pin_balance','Equilíbrio','semana alinhada'],
      ['pin_goal','Meta alcançada','objetivo concluído'],
      ['pin_presence','Presença','ritual mantido'],
      ['pin_sequence','Sequência','novo marco'],
      ['pin_delivery','Projeto entregue','etapa importante'],
      ['pin_continuity','Continuidade','ciclo renovado'],
      ['pin_selfcare','Autocuidado','escolha consciente'],
      ['pin_depth','Profundidade','foco sustentado'],
      ['pin_evolution','Evolução','histórico pessoal']
     ];
     r147Dialog('Sala de Troféus',`<div class="r152-pin-intro"><strong>Sua coleção de pins</strong><small>Sem imagens Kids: uma vitrine de conquistas pessoais.</small></div><div class="r147-collection">${items.map(x=>`<div class="r147-col-item">${r147img(x[0])}<strong>${x[1]}</strong><small>${x[2]}</small></div>`).join('')}</div>`)
   }
 }
 function refreshRecognitionCardsIfOpen(){
   const recogPane=[...document.querySelectorAll('[data-r147pane="helpers"] .r147-card, [data-r147pane="helpers"] .r147-rec, [data-r147pane="helpers"] img')];
   // no-op hook: image rendering is data-driven after preset migration.
   return recogPane.length;
 }
 function apply(){migrateRecognitionPresets();personalizeAccessories();fixHelper();patchOwnerCollection();refreshRecognitionCardsIfOpen();}
 const style=document.createElement('style');style.id='rc169-style';style.textContent=`
 body[data-bertha-route="premiacoes"] input[type="checkbox"]{-webkit-appearance:none!important;appearance:none!important;width:20px!important;height:20px!important;border-radius:7px!important;border:1.3px solid rgba(116,91,139,.28)!important;background:#fffdfa!important;position:relative!important;display:inline-grid!important;place-items:center!important;vertical-align:middle!important}
 body[data-bertha-route="premiacoes"] input[type="checkbox"]:checked{background:linear-gradient(135deg,#e9a7bf,#c9b5e9)!important;border-color:transparent!important}
 body[data-bertha-route="premiacoes"] input[type="checkbox"]:checked:after{content:"";width:5px;height:9px;border:solid #fff;border-width:0 1.8px 1.8px 0;transform:rotate(45deg) translate(-1px,-1px)}
 body[data-bertha-route="premiacoes"] .r147-helper-context>div{display:block!important;min-width:0!important}
 body[data-bertha-route="premiacoes"] .r147-helper-context strong{display:block!important;margin:0 0 5px!important;line-height:1.22!important}
 body[data-bertha-route="premiacoes"] .r147-helper-context small{display:block!important;margin:0!important;line-height:1.38!important}
 body[data-bertha-route="premiacoes"] .r147-img{object-fit:contain!important;background:transparent!important}
 body[data-bertha-route="premiacoes"] .r147-ach .art img{width:100%!important;height:100%!important;object-fit:contain!important}
 body[data-bertha-route="premiacoes"] .r166-colors{display:flex!important;gap:5px!important;justify-content:center!important;flex-wrap:wrap!important;margin-top:7px!important}
 body[data-bertha-route="premiacoes"] .r166-colors button{width:16px!important;height:16px!important;padding:0!important;border-radius:50%!important;background:var(--c)!important;border:2px solid #fff!important;box-shadow:0 0 0 1px rgba(94,75,100,.12)!important}
 body[data-bertha-route="premiacoes"] .r166-colors button.active{box-shadow:0 0 0 2px rgba(179,115,147,.34)!important;transform:scale(1.08)!important}
 body[data-bertha-route="premiacoes"] .r152-acc-grid label{grid-template-rows:auto auto auto!important}
 body[data-bertha-route="premiacoes"] .r152-acc-grid img{transition:filter .18s ease!important}
 `;document.head.appendChild(style);
 const base=window.renderRewardsV164||window.renderRewardsRC152||window.renderUniversalRewards;
 window.renderRewardsV169=function(tab=''){patchOwnerCollection();migrateRecognitionPresets();const out=base?.(tab);requestAnimationFrame(apply);return out};
 window.renderRewardsV166=window.renderRewardsV169;
 window.renderRewardsV164=window.renderRewardsV169;
 window.renderRewardsV163=window.renderRewardsV169;
 window.renderUniversalRewards=window.renderRewardsV169;
 window.renderKidsRewards=window.renderRewardsV169;
 const obs=new MutationObserver(()=>{if((location.hash||'').slice(1)==='premiacoes')requestAnimationFrame(apply)});const app=document.getElementById('app');if(app)obs.observe(app,{childList:true,subtree:true});
 document.addEventListener('click',function(e){
   const btn=e.target.closest('#r147OwnerRoom');
   if(!btn) return;
   e.preventDefault();
   e.stopPropagation();
   if(e.stopImmediatePropagation) e.stopImmediatePropagation();
   patchOwnerCollection();
   window.r147OwnerCollection();
 },true);

 document.documentElement.dataset.berthaBuild='RC169';
 apply();
})();
