/* BERTH.A RC190 — Satélites + Helper/Reconhecimentos only. Owner frozen.
   Visual refresh with approved assets + 2 color variants per recognition. */
(function(){
  const R189_VARIANTS={
    thanks:['recognition_thanks_v189_a.png','recognition_thanks_v189_b.png'],
    flower:['recognition_flower_v189_a.png','recognition_flower_v189_b.png'],
    coffee:['recognition_coffee_v189_a.png','recognition_coffee_v189_b.png'],
    moment:['recognition_pause_v189_a.png','recognition_pause_v189_b.png'],
    reward:['recognition_reward_v189_a.png','recognition_reward_v189_b.png'],
    saved:['recognition_saved_v189_a.png','recognition_saved_v189_b.png'],
    hug:['recognition_hug_v189_a.png','recognition_hug_v189_b.png'],
    kiss:['recognition_care_v189_a.png','recognition_care_v189_b.png'],
    rocked:['recognition_arrasou_v189_a.png','recognition_arrasou_v189_b.png']
  };
  const R189_DEFAULTS=[
    {id:'thanks',name:'Obrigada por hoje',message:'Obrigada por deixar o meu dia mais leve.',variant:0},
    {id:'flower',name:'Uma flor para você',message:'Um carinho para agradecer pela ajuda.',variant:0},
    {id:'coffee',name:'Vale café',message:'Um café por minha conta. Obrigada pela ajuda.',variant:0},
    {id:'moment',name:'Vale uma pausa especial',message:'Uma pausa gostosa para você aproveitar como quiser.',variant:0},
    {id:'reward',name:'Essa merece uma recompensa melhor',message:'Essa ajuda merece algo especial. Escolha como quer transformar esse reconhecimento em algo real.',variant:0},
    {id:'saved',name:'Você salvou meu dia',message:'Você salvou meu dia hoje. Obrigada por estar comigo nisso.',variant:0},
    {id:'hug',name:'Um abraço em forma de obrigada',message:'Receba esse carinho como meu obrigada.',variant:0},
    {id:'kiss',name:'Um carinho para você',message:'Um carinho porque você fez diferença.',variant:0},
    {id:'rocked',name:'Arrasou',message:'Você mandou muito bem. Arrasou!',variant:0}
  ];
  const KEY='bertha.recognition.presets.v13';
  const VARIANT_LABELS=['Rosé','Brisa'];
  const hydrate=(x,i)=>{const d=R189_DEFAULTS[i]||R189_DEFAULTS[0],id=x?.id||d.id,variant=Math.max(0,Math.min(1,Number(x?.variant ?? d.variant)||0));return {...d,...x,id,variant,asset:(R189_VARIANTS[id]||R189_VARIANTS.thanks)[variant]};};
  const load=()=>{let raw=null;try{raw=JSON.parse(window.berthaHmlStorage.getItem(KEY)||'null')}catch(e){};return R189_DEFAULTS.map((d,i)=>hydrate(Array.isArray(raw)?raw[i]:d,i));};
  const save=(arr)=>{const clean=R189_DEFAULTS.map((d,i)=>hydrate(Array.isArray(arr)?arr[i]:d,i));try{window.berthaHmlStorage.setItem(KEY,JSON.stringify(clean))}catch(e){};return clean;};
  save(load());
  window.r147RecognitionDefaults = ()=>load().map(x=>({...x}));
  window.r147RecognitionPresets = ()=>load().map(x=>({...x}));
  window.r147SaveRecognitionPresets = (x)=>save(x);

  const AV={man:'satellite_avatar_man_v189.png',woman:'satellite_avatar_woman_v189.png',romantic_m:'satellite_avatar_romantic_m_v189.png',romantic_f:'satellite_avatar_romantic_f_v189.png',boy:'satellite_avatar_boy_v189.png',girl:'satellite_avatar_girl_v189.png',person:'satellite_avatar_man_v189.png',family:'satellite_avatar_woman_v189.png',son:'satellite_avatar_boy_v189.png',daughter:'satellite_avatar_girl_v189.png'};
  window.satelliteAvatarIcon=function(key='person'){key=typeof normalizeSatelliteAvatarKey==='function'?normalizeSatelliteAvatarKey(key):key;const a=AV[key]||AV.person;return `<img class="sat-avatar-art" src="./${a}" alt="" aria-hidden="true">`;};
  function assetSrc(name){return `./${name}`;}
  function enhanceHelper(){
    const pane=document.querySelector('.rewards-page [data-r147pane="helpers"]'); if(!pane)return;
    const presets=load();
    pane.querySelectorAll('[data-r147-preset]').forEach((row,i)=>{
      const p=presets[i]; if(!p)return;
      const img=row.querySelector('.reward-config-head img'); if(img)img.src=assetSrc(p.asset);
      let chooser=row.querySelector('.rc189-variant-picker');
      if(!chooser){
        chooser=document.createElement('div'); chooser.className='rc189-variant-picker';
        chooser.innerHTML=`<span>Cor do reconhecimento</span><div><button type="button" data-r189-variant="0" aria-label="${VARIANT_LABELS[0]}"><i></i><b>${VARIANT_LABELS[0]}</b></button><button type="button" data-r189-variant="1" aria-label="${VARIANT_LABELS[1]}"><i></i><b>${VARIANT_LABELS[1]}</b></button></div>`;
        const grid=row.querySelector('.r147-config-grid'); row.insertBefore(chooser,grid||row.lastChild);
      }
      chooser.querySelectorAll('[data-r189-variant]').forEach((b,v)=>{
        b.classList.toggle('active',v===p.variant);
        b.style.setProperty('--preview',`url("${assetSrc(R189_VARIANTS[p.id][v])}")`);
        b.onclick=()=>{
          const all=load(); all[i].variant=v; all[i].asset=R189_VARIANTS[p.id][v]; const saved=save(all);
          chooser.querySelectorAll('button').forEach((x,j)=>x.classList.toggle('active',j===v));
          if(img)img.src=assetSrc(saved[i].asset);
          const card=pane.querySelectorAll('.r147-rec img')[i]; if(card)card.src=assetSrc(saved[i].asset);
        };
      });
    });
    pane.querySelectorAll('.r147-rec img').forEach((img,i)=>{if(presets[i])img.src=assetSrc(presets[i].asset)});
    const build=document.querySelector('.r148-build');if(build)build.textContent='HML · RC190';
  }
  const baseRender=window.renderRewardsRC147||window.renderUniversalRewards;
  if(typeof baseRender==='function'){const wrapped=function(tab=''){baseRender(tab);requestAnimationFrame(enhanceHelper);}; window.renderRewardsRC147=wrapped; window.renderUniversalRewards=wrapped; window.renderKidsRewards=wrapped;}
  const st=document.createElement('style'); st.id='rc189-sat-helper'; st.textContent=`
    .sat-avatar-art{display:block;width:100%;height:100%;object-fit:contain!important;object-position:center!important;filter:drop-shadow(0 6px 14px rgba(106,84,106,.10))}
    dialog.sat-modal .sat-avatar-picker{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important;width:100%!important}
    dialog.sat-modal .sat-avatar-choice{height:118px!important;min-height:118px!important;padding:9px 8px 11px!important;gap:5px!important;background:linear-gradient(145deg,rgba(255,253,249,.96),rgba(249,246,250,.92))!important;border:1px solid rgba(126,110,128,.10)!important;transition:transform .16s ease,box-shadow .16s ease,border-color .16s ease!important;overflow:hidden!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;box-sizing:border-box!important}
    dialog.sat-modal .sat-avatar-choice .sat-avatar-art{width:70px!important;height:70px!important;flex:0 0 70px!important}
    dialog.sat-modal .sat-avatar-choice small{display:grid!important;gap:0!important;justify-items:center!important;font-size:10.4px!important;line-height:1.12!important;color:#706873!important;text-align:center!important;white-space:normal!important;overflow-wrap:anywhere!important}
    dialog.sat-modal .sat-avatar-choice.active{transform:translateY(-1px)!important;border-color:rgba(164,132,159,.24)!important;box-shadow:0 8px 22px rgba(90,69,88,.08),0 0 0 2px rgba(204,177,199,.16)!important;background:linear-gradient(145deg,#fffdf9,#f8f3f8)!important}
    .sat-member>.sat-avatar .sat-avatar-art,.r147-helper-context .sat-avatar-art,.r147-kid-avatar .sat-avatar-art{width:100%!important;height:100%!important;object-fit:contain!important}
    .sat-member>.sat-avatar{padding:2px!important;overflow:visible!important;background:transparent!important}
    .rewards-page [data-r147pane="helpers"] img[src*="recognition_"]{object-fit:contain!important;background:transparent!important;border-radius:0!important;box-shadow:none!important;padding:0!important;transform:none!important}
    .rewards-page [data-r147pane="helpers"] .r147-rec img{width:88px!important;height:88px!important;filter:drop-shadow(0 6px 16px rgba(101,83,107,.10))}
    .rewards-page [data-r147pane="helpers"] img[src*="recognition_arrasou_v189"]{transform:scale(1.08)!important}
    .rewards-page [data-r147pane="helpers"] .reward-config-head img{width:68px!important;height:68px!important;flex:0 0 68px!important;filter:drop-shadow(0 5px 14px rgba(101,83,107,.08))}
    .rc189-variant-picker{display:grid;gap:7px;margin:10px 0 11px!important;padding:10px 11px;border-radius:16px;background:linear-gradient(145deg,rgba(255,251,246,.88),rgba(247,245,249,.86));border:1px solid rgba(128,111,132,.08)}
    .rc189-variant-picker>span{font-size:10.5px;color:#817983}
    .rc189-variant-picker>div{display:flex;gap:9px;align-items:flex-start;flex-wrap:wrap}
    .rc189-variant-picker button{width:66px!important;min-width:66px!important;padding:6px 6px 7px!important;border-radius:16px!important;border:1px solid rgba(132,114,135,.11)!important;background:#fffdf9!important;box-shadow:none!important;display:grid!important;place-items:center!important;gap:3px!important}
    .rc189-variant-picker button i{display:block;width:46px;height:46px;background-image:var(--preview);background-size:contain;background-position:center;background-repeat:no-repeat}
    .rc189-variant-picker button b{font-size:10px!important;font-weight:600!important;color:#7d7380}
    .rc189-variant-picker button.active{border-color:rgba(155,128,155,.28)!important;box-shadow:0 0 0 2px rgba(199,173,196,.18)!important;background:linear-gradient(145deg,#fffdf9,#f7f2f8)!important}
    @media(max-width:430px){dialog.sat-modal .sat-avatar-choice{height:112px!important;min-height:112px!important}.rc189-variant-picker button{width:62px!important;min-width:62px!important}.rc189-variant-picker button i{width:42px;height:42px}}
  `; document.head.appendChild(st); document.documentElement.dataset.berthaIndex='RC190'; document.documentElement.dataset.berthaAssets='RC190'; document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(enhanceHelper));
})();
