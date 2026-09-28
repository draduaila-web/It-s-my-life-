/* BERTH.A RC189 — Satélites + Helper/Reconhecimentos only. Owner frozen. */
(function(){
  const R189_VARIANTS={
    thanks:['recognition_thanks_v189_a','recognition_thanks_v189_b'],
    flower:['recognition_flower_v189_a','recognition_flower_v189_b'],
    coffee:['recognition_coffee_v189_a','recognition_coffee_v189_b'],
    moment:['recognition_pause_v189_a','recognition_pause_v189_b'],
    reward:['recognition_reward_v189_a','recognition_reward_v189_b'],
    saved:['recognition_saved_v189_a','recognition_saved_v189_b'],
    hug:['recognition_hug_v189_a','recognition_hug_v189_b'],
    kiss:['recognition_care_v189_a','recognition_care_v189_b'],
    rocked:['recognition_arrasou_v189_a','recognition_arrasou_v189_b']
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
  const KEY='bertha.recognition.presets.v11';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const hydrate=(x,i)=>{const d=R189_DEFAULTS[i]||R189_DEFAULTS[0], id=x?.id||d.id, variant=Math.max(0,Math.min(1,+x?.variant||0));return {...d,...x,id,variant,asset:(R189_VARIANTS[id]||R189_VARIANTS.thanks)[variant]}};
  const load=()=>{let raw=null;try{raw=JSON.parse(window.berthaHmlStorage.getItem(KEY)||'null')}catch(e){};return R189_DEFAULTS.map((d,i)=>hydrate(Array.isArray(raw)?raw[i]:d,i));};
  const save=(arr)=>{const clean=R189_DEFAULTS.map((d,i)=>hydrate(Array.isArray(arr)?arr[i]:d,i));try{window.berthaHmlStorage.setItem(KEY,JSON.stringify(clean))}catch(e){};return clean;};
  save(load());
  window.r147RecognitionDefaults=r147RecognitionDefaults=()=>load().map(x=>({...x}));
  window.r147RecognitionPresets=r147RecognitionPresets=()=>load().map(x=>({...x}));
  window.r147SaveRecognitionPresets=r147SaveRecognitionPresets=(x)=>save(x);

  const AV={
    man:'satellite_avatar_man_v189',woman:'satellite_avatar_woman_v189',romantic_m:'satellite_avatar_romantic_m_v189',romantic_f:'satellite_avatar_romantic_f_v189',boy:'satellite_avatar_boy_v189',girl:'satellite_avatar_girl_v189',person:'satellite_avatar_man_v189',family:'satellite_avatar_woman_v189',son:'satellite_avatar_boy_v189',daughter:'satellite_avatar_girl_v189'
  };
  window.satelliteAvatarIcon=satelliteAvatarIcon=function(key='person'){
    key=typeof normalizeSatelliteAvatarKey==='function'?normalizeSatelliteAvatarKey(key):key;
    const a=AV[key]||AV.person;
    return `<img class="sat-avatar-art" src="./${a}.svg" alt="" aria-hidden="true">`;
  };

  function assetSrc(name){return `./${name}.svg`}
  function enhanceHelper(){
    const pane=document.querySelector('.rewards-page [data-r147pane="helpers"]'); if(!pane)return;
    const presets=load();
    pane.querySelectorAll('[data-r147-preset]').forEach((row,i)=>{
      const p=presets[i]; if(!p)return;
      const img=row.querySelector('.reward-config-head img'); if(img)img.src=assetSrc(p.asset);
      let chooser=row.querySelector('.rc189-variant-picker');
      if(!chooser){
        chooser=document.createElement('div');chooser.className='rc189-variant-picker';chooser.innerHTML=`<span>Cor do reconhecimento</span><div><button type="button" data-r189-variant="0" aria-label="Variação 1"><i></i></button><button type="button" data-r189-variant="1" aria-label="Variação 2"><i></i></button></div>`;
        const grid=row.querySelector('.r147-config-grid'); row.insertBefore(chooser,grid||row.lastChild);
      }
      chooser.querySelectorAll('[data-r189-variant]').forEach((b,v)=>{
        b.classList.toggle('active',v===p.variant);
        b.style.setProperty('--preview',`url("${assetSrc(R189_VARIANTS[p.id][v])}")`);
        b.onclick=()=>{const all=load();all[i].variant=v;all[i].asset=R189_VARIANTS[p.id][v];save(all);chooser.querySelectorAll('button').forEach((x,j)=>x.classList.toggle('active',j===v));if(img)img.src=assetSrc(R189_VARIANTS[p.id][v]); const card=pane.querySelectorAll('.r147-rec img')[i];if(card)card.src=assetSrc(R189_VARIANTS[p.id][v]);};
      });
    });
    pane.querySelectorAll('.r147-rec img').forEach((img,i)=>{if(presets[i])img.src=assetSrc(presets[i].asset)});
    const build=document.querySelector('.r148-build');if(build)build.textContent='HML · RC189';
  }

  const baseRender=window.renderRewardsRC147||window.renderUniversalRewards;
  if(typeof baseRender==='function'){
    const wrapped=function(tab=''){baseRender(tab);requestAnimationFrame(enhanceHelper);};
    window.renderRewardsRC147=renderRewardsRC147=wrapped;
    window.renderUniversalRewards=renderUniversalRewards=wrapped;
    window.renderKidsRewards=renderKidsRewards=wrapped;
  }

  const st=document.createElement('style');st.id='rc189-sat-helper';st.textContent=`
    /* RC189 Satélites — new glossy asset family */
    .sat-avatar-art{display:block;width:100%;height:100%;object-fit:contain!important;object-position:center!important}
    dialog.sat-modal .sat-avatar-choice{height:108px!important;min-height:108px!important;padding:8px 8px 9px!important;gap:5px!important;background:linear-gradient(145deg,rgba(255,253,249,.96),rgba(249,246,250,.92))!important;border:1px solid rgba(126,110,128,.10)!important;transition:transform .16s ease,box-shadow .16s ease,border-color .16s ease!important}
    dialog.sat-modal .sat-avatar-choice .sat-avatar-art{width:68px!important;height:68px!important;flex:0 0 68px!important}
    dialog.sat-modal .sat-avatar-choice small{font-size:10.5px!important;line-height:1.12!important;color:#706873!important}
    dialog.sat-modal .sat-avatar-choice.active{transform:translateY(-1px)!important;border-color:rgba(164,132,159,.24)!important;box-shadow:0 8px 22px rgba(90,69,88,.08),0 0 0 2px rgba(204,177,199,.16)!important;background:linear-gradient(145deg,#fffdf9,#f8f3f8)!important}
    .sat-member>.sat-avatar .sat-avatar-art,.r147-helper-context .sat-avatar-art,.r147-kid-avatar .sat-avatar-art{width:100%!important;height:100%!important;object-fit:contain!important}
    .sat-member>.sat-avatar{padding:2px!important;overflow:visible!important;background:transparent!important}

    /* RC189 Helper — transparent artwork, controlled scale, diverse family */
    .rewards-page [data-r147pane="helpers"] img[src*="recognition_"]{object-fit:contain!important;background:transparent!important;border-radius:0!important;box-shadow:none!important;padding:0!important;transform:none!important}
    .rewards-page [data-r147pane="helpers"] .r147-rec img{width:86px!important;height:86px!important}
    .rewards-page [data-r147pane="helpers"] img[src*="recognition_arrasou_v189"]{transform:scale(1.12)!important}
    .rewards-page [data-r147pane="helpers"] .reward-config-head img{width:64px!important;height:64px!important;flex:0 0 64px!important}

    /* Helper color personalization: two real previews per recognition */
    .rc189-variant-picker{display:grid;gap:7px;margin:10px 0 11px!important;padding:10px 11px;border-radius:16px;background:linear-gradient(145deg,rgba(255,251,246,.88),rgba(247,245,249,.86));border:1px solid rgba(128,111,132,.08)}
    .rc189-variant-picker>span{font-size:10.5px;color:#817983}
    .rc189-variant-picker>div{display:flex;gap:9px;align-items:center}
    .rc189-variant-picker button{width:54px!important;height:54px!important;min-width:54px!important;padding:3px!important;border-radius:16px!important;border:1px solid rgba(132,114,135,.11)!important;background:#fffdf9!important;box-shadow:none!important;display:grid!important;place-items:center!important}
    .rc189-variant-picker button i{display:block;width:46px;height:46px;background-image:var(--preview);background-size:contain;background-position:center;background-repeat:no-repeat}
    .rc189-variant-picker button.active{border-color:rgba(155,128,155,.28)!important;box-shadow:0 0 0 2px rgba(199,173,196,.18)!important;background:linear-gradient(145deg,#fffdf9,#f7f2f8)!important}
    @media(max-width:430px){dialog.sat-modal .sat-avatar-choice{height:104px!important;min-height:104px!important}.rc189-variant-picker button{width:50px!important;height:50px!important;min-width:50px!important}.rc189-variant-picker button i{width:42px;height:42px}}
  `;document.head.appendChild(st);

  document.documentElement.dataset.berthaIndex='RC189';
  document.documentElement.dataset.berthaAssets='RC189';
  document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(enhanceHelper));
})();
