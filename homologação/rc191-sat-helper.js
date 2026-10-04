/* BERTH.A RC191 — Satélites + Helper/Reconhecimentos.
   - avatares homologados congelados
   - correção de estrutura no modal de satélites
   - reconhecimentos com imagens novas + 2 variações de cor
   - correção de build/caching para helper */
(function(){
  const RECOG_KEY='bertha.recognition.presets.v14';
  const LEGACY_KEYS=['bertha.recognition.presets.v13','bertha.recognition.presets.v12','bertha.recognition.presets.v10'];
  const VARIANT_LABELS=['Rosé','Brisa'];
  const VARIANTS={
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
  const DEFAULTS=[
    {id:'thanks',name:'Obrigada por hoje',message:'Obrigada por deixar o meu dia mais leve.',variant:0,active:true},
    {id:'flower',name:'Uma flor para você',message:'Um carinho para agradecer pela ajuda.',variant:0,active:true},
    {id:'coffee',name:'Vale café',message:'Um café por minha conta. Obrigada pela ajuda.',variant:0,active:true},
    {id:'moment',name:'Vale uma pausa especial',message:'Uma pausa gostosa para você aproveitar como quiser.',variant:0,active:true},
    {id:'reward',name:'Essa merece uma recompensa melhor',message:'Essa ajuda merece algo especial. Escolha como quer transformar esse reconhecimento em algo real.',variant:0,active:true},
    {id:'saved',name:'Você salvou meu dia',message:'Você salvou meu dia hoje. Obrigada por estar comigo nisso.',variant:0,active:true},
    {id:'hug',name:'Um abraço em forma de obrigada',message:'Receba esse carinho como meu obrigada.',variant:0,active:true},
    {id:'kiss',name:'Um carinho para você',message:'Um carinho porque você fez diferença.',variant:0,active:true},
    {id:'rocked',name:'Arrasou',message:'Você mandou muito bem. Arrasou!',variant:0,active:true}
  ];
  const AVATARS={
    man:'satellite_avatar_man_v189.png',
    woman:'satellite_avatar_woman_v189.png',
    romantic_m:'satellite_avatar_romantic_m_v189.png',
    romantic_f:'satellite_avatar_romantic_f_v189.png',
    boy:'satellite_avatar_boy_v189.png',
    girl:'satellite_avatar_girl_v189.png',
    person:'satellite_avatar_man_v189.png',
    family:'satellite_avatar_woman_v189.png',
    son:'satellite_avatar_boy_v189.png',
    daughter:'satellite_avatar_girl_v189.png'
  };

  function tryJSON(k){try{return JSON.parse(window.berthaHmlStorage.getItem(k)||'null')}catch(e){return null}}
  function stripExt(v){return String(v||'').replace(/\.(png|jpg|jpeg|svg)$/i,'')}
  function normalizeId(raw,i){
    const fallback=(DEFAULTS[i]||DEFAULTS[0]).id;
    const id=String(raw?.id||fallback);
    return VARIANTS[id]?id:fallback;
  }
  function normalizeOne(raw,i){
    const base=DEFAULTS[i]||DEFAULTS[0];
    const id=normalizeId(raw,i);
    const assetRaw=stripExt(raw?.asset||'');
    let variant=Number.isFinite(+raw?.variant)?Math.max(0,Math.min(1,+raw.variant)):null;
    if(variant===null){
      const idx=(VARIANTS[id]||[]).findIndex(v=>v===assetRaw);
      variant=idx>=0?idx:(base.variant||0);
    }
    return {
      ...base,
      ...raw,
      id,
      variant,
      name:String(raw?.name||base.name),
      message:String(raw?.message||base.message),
      active: raw?.active!==false,
      asset:(VARIANTS[id]||VARIANTS.thanks)[variant]
    };
  }
  function readRaw(){
    let raw=tryJSON(RECOG_KEY);
    if(Array.isArray(raw)&&raw.length)return raw;
    for(const key of LEGACY_KEYS){ raw=tryJSON(key); if(Array.isArray(raw)&&raw.length) return raw; }
    return null;
  }
  function loadPresets(){
    const raw=readRaw();
    const out=DEFAULTS.map((d,i)=>normalizeOne(Array.isArray(raw)?raw[i]:d,i));
    return out;
  }
  function savePresets(arr){
    const out=DEFAULTS.map((d,i)=>normalizeOne(Array.isArray(arr)?arr[i]:d,i));
    try{window.berthaHmlStorage.setItem(RECOG_KEY,JSON.stringify(out))}catch(e){}
    return out;
  }

  // migrate immediately and teach the asset helper about the new filenames
  const RECOG_NAMES=Object.values(VARIANTS).flat();
  try{ if(typeof R186_RECOGNITION_PNG_ASSETS!=='undefined') RECOG_NAMES.forEach(n=>R186_RECOGNITION_PNG_ASSETS.add(n)); }catch(e){}
  savePresets(loadPresets());

  window.r147RecognitionDefaults = ()=>loadPresets().map(x=>({...x}));
  window.r147RecognitionPresets = ()=>loadPresets().map(x=>({...x}));
  window.r147SaveRecognitionPresets = x=>savePresets(x);

  window.satelliteAvatarIcon = function(key='person'){
    key = typeof normalizeSatelliteAvatarKey==='function' ? normalizeSatelliteAvatarKey(key) : key;
    const src = './'+(AVATARS[key]||AVATARS.person);
    return `<img class="sat-avatar-art" src="${src}" alt="" aria-hidden="true">`;
  };

  function assetFile(name){ return './'+stripExt(name)+'.png'; }

  function enhanceHelperPane(){
    const pane=document.querySelector('.r147-pane[data-r147pane="helpers"]');
    if(!pane) return;
    const presets=loadPresets();

    // top action cards
    pane.querySelectorAll('[data-r147-rec]').forEach((btn,i)=>{
      const p=presets.filter(x=>x.active!==false)[i];
      if(!p) return;
      const img=btn.querySelector('img');
      if(img) img.src=assetFile(p.asset);
    });

    // editor cards
    pane.querySelectorAll('[data-r147-preset]').forEach((row,i)=>{
      const p=presets[i]; if(!p) return;
      const head=row.querySelector('.reward-config-head');
      if(!head) return;
      let img=head.querySelector('.rc191-rec-thumb');
      if(!img){
        img=document.createElement('img');
        img.className='rc191-rec-thumb';
        img.alt='';
        head.insertBefore(img, head.firstChild);
      }
      img.src=assetFile(p.asset);
      let picker=row.querySelector('.rc191-variant-picker');
      if(!picker){
        picker=document.createElement('div');
        picker.className='rc191-variant-picker';
        picker.innerHTML=`<span>Cor do reconhecimento</span><div class="rc191-variant-options"><button type="button" data-variant="0"><i></i><b>${VARIANT_LABELS[0]}</b></button><button type="button" data-variant="1"><i></i><b>${VARIANT_LABELS[1]}</b></button></div>`;
        const grid=row.querySelector('.r147-config-grid');
        if(grid) row.insertBefore(picker, grid); else row.appendChild(picker);
      }
      picker.querySelectorAll('[data-variant]').forEach((b,variantIndex)=>{
        const preview=(VARIANTS[p.id]||VARIANTS.thanks)[variantIndex];
        b.style.setProperty('--preview',`url("${assetFile(preview)}")`);
        b.classList.toggle('active',variantIndex===p.variant);
        b.onclick=()=>{
          const current=loadPresets();
          current[i].variant=variantIndex;
          current[i].asset=(VARIANTS[p.id]||VARIANTS.thanks)[variantIndex];
          const saved=savePresets(current);
          picker.querySelectorAll('[data-variant]').forEach((x,j)=>x.classList.toggle('active',j===variantIndex));
          img.src=assetFile(saved[i].asset);
          const liveCards=[...pane.querySelectorAll('[data-r147-rec]')];
          const activeIndex=saved.filter(x=>x.active!==false).findIndex((x,idx)=>idx===i);
          // refresh whole pane list safely
          requestAnimationFrame(()=>enhanceHelperPane());
        };
      });
    });

    const bubble=document.querySelector('.r148-build');
    if(bubble) bubble.textContent='HML · RC191';
  }

  function enhanceSatModal(){
    const dlg=document.querySelector('dialog.sat-modal[open]');
    if(!dlg) return;
    // purely style-driven, hook left for future JS tweaks if needed
  }

  function runEnhancements(){
    enhanceHelperPane();
    enhanceSatModal();
  }

  const baseRender=window.renderRewardsRC147||window.renderUniversalRewards;
  if(typeof baseRender==='function'){
    const wrapped=function(tab=''){
      baseRender(tab);
      requestAnimationFrame(runEnhancements);
      setTimeout(runEnhancements,60);
    };
    window.renderRewardsRC147=wrapped;
    window.renderUniversalRewards=wrapped;
    window.renderKidsRewards=wrapped;
  }

  const style=document.createElement('style');
  style.id='rc191-sat-helper-style';
  style.textContent=`
    .sat-avatar-art{display:block;width:100%;height:100%;object-fit:contain!important;object-position:center!important;filter:drop-shadow(0 6px 14px rgba(106,84,106,.10))}
    .sat-member>.sat-avatar,.r147-helper-context .sat-avatar,.r147-kid-avatar{overflow:visible!important;background:transparent!important}
    .sat-member>.sat-avatar .sat-avatar-art,.r147-helper-context .sat-avatar-art,.r147-kid-avatar .sat-avatar-art{width:100%!important;height:100%!important}

    /* Satélites — cards de avatar congelados */
    dialog.sat-modal .sat-avatar-picker{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important;width:100%!important}
    dialog.sat-modal .sat-avatar-choice{height:118px!important;min-height:118px!important;padding:9px 8px 11px!important;gap:5px!important;background:linear-gradient(145deg,rgba(255,253,249,.96),rgba(249,246,250,.92))!important;border:1px solid rgba(126,110,128,.10)!important;transition:transform .16s ease,box-shadow .16s ease,border-color .16s ease!important;overflow:hidden!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;box-sizing:border-box!important}
    dialog.sat-modal .sat-avatar-choice .sat-avatar-art{width:70px!important;height:70px!important;flex:0 0 70px!important}
    dialog.sat-modal .sat-avatar-choice small{display:grid!important;gap:0!important;justify-items:center!important;font-size:10.4px!important;line-height:1.12!important;color:#706873!important;text-align:center!important;white-space:normal!important;overflow-wrap:anywhere!important}
    dialog.sat-modal .sat-avatar-choice.active{transform:translateY(-1px)!important;border-color:rgba(164,132,159,.24)!important;box-shadow:0 8px 22px rgba(90,69,88,.08),0 0 0 2px rgba(204,177,199,.16)!important;background:linear-gradient(145deg,#fffdf9,#f8f3f8)!important}

    /* Satélites — estrutura de permissões mais estável */
    html body dialog.sat-modal .sat-permissions,
    html body dialog.sat-modal .sat-kids-settings{gap:12px!important}
    html body dialog.sat-modal .sat-permission{
      display:grid!important;
      grid-template-columns:28px minmax(0,1fr)!important;
      align-items:center!important;
      gap:14px!important;
      padding:16px!important;
      min-height:0!important;
      border-radius:22px!important;
      background:rgba(255,253,249,.90)!important;
      border:1px solid rgba(122,108,128,.10)!important;
      box-shadow:none!important;
    }
    html body dialog.sat-modal .sat-permission.is-checked{background:linear-gradient(135deg,rgba(251,247,239,.98),rgba(248,237,240,.55) 42%,rgba(237,246,252,.42) 100%)!important;border-color:rgba(201,170,176,.24)!important}
    html body dialog.sat-modal .sat-checkbox{width:24px!important;height:24px!important;margin:0!important}
    html body dialog.sat-modal .sat-permission-copy{display:grid!important;gap:4px!important;min-width:0!important;width:100%!important}
    html body dialog.sat-modal .sat-permission-copy strong,
    html body dialog.sat-modal .sat-permission strong{display:block!important;font-size:14px!important;line-height:1.25!important;font-weight:520!important;color:#4d4550!important;white-space:normal!important}
    html body dialog.sat-modal .sat-permission-copy small,
    html body dialog.sat-modal .sat-permission small{display:block!important;font-size:11.5px!important;line-height:1.45!important;color:#867e89!important;white-space:normal!important;overflow-wrap:anywhere!important}

    /* Helper — cards de reconhecimento ativos */
    .r147-pane[data-r147pane="helpers"] .r147-rec-grid{grid-template-columns:1fr!important;gap:12px!important}
    .r147-pane[data-r147pane="helpers"] .r147-rec{
      grid-template-columns:82px minmax(0,1fr)!important;
      gap:14px!important;
      min-height:112px!important;
      padding:14px!important;
      border-radius:22px!important;
      background:#fffdf9!important;
      border:1px solid rgba(122,108,128,.09)!important;
      align-items:center!important;
    }
    .r147-pane[data-r147pane="helpers"] .r147-rec img,
    .r147-pane[data-r147pane="helpers"] .r147-rec .r147-img{
      width:82px!important;
      height:82px!important;
      object-fit:contain!important;
      background:transparent!important;
      border-radius:0!important;
      filter:drop-shadow(0 7px 16px rgba(101,83,107,.10));
    }
    .r147-pane[data-r147pane="helpers"] .r147-rec strong{display:block!important;font-size:14px!important;line-height:1.25!important;font-weight:500!important}
    .r147-pane[data-r147pane="helpers"] .r147-rec small{display:block!important;margin-top:4px!important;font-size:11px!important;line-height:1.4!important;color:#88808b!important}

    /* Helper — cards de configuração com imagem */
    .r147-pane[data-r147pane="helpers"] [data-r147-preset]{
      padding:14px!important;
      border-radius:24px!important;
      background:rgba(255,253,249,.94)!important;
      border:1px solid rgba(122,108,128,.09)!important;
      display:grid!important;
      gap:12px!important;
      box-shadow:none!important;
    }
    .r147-pane[data-r147pane="helpers"] [data-r147-preset] .reward-config-head{
      display:grid!important;
      grid-template-columns:72px minmax(0,1fr) auto!important;
      gap:14px!important;
      align-items:center!important;
      margin:0!important;
    }
    .r147-pane[data-r147pane="helpers"] [data-r147-preset] .reward-config-head>div{min-width:0!important}
    .r147-pane[data-r147pane="helpers"] .rc191-rec-thumb{
      width:72px!important;height:72px!important;object-fit:contain!important;display:block!important;
      filter:drop-shadow(0 7px 16px rgba(101,83,107,.10));
    }
    .r147-pane[data-r147pane="helpers"] [data-r147-preset] .reward-config-head strong{display:block!important;font-size:14px!important;line-height:1.25!important;font-weight:500!important;color:#4f4752!important}
    .r147-pane[data-r147pane="helpers"] [data-r147-preset] .reward-config-head small{display:block!important;margin-top:4px!important;font-size:11.25px!important;line-height:1.42!important;color:#8a818c!important}
    .r147-pane[data-r147pane="helpers"] [data-r147-preset] .reward-active{justify-self:end!important;align-self:start!important}
    .r147-pane[data-r147pane="helpers"] [data-r147-preset] .r147-config-grid{display:grid!important;grid-template-columns:1fr 1.6fr!important;gap:10px!important}
    .r147-pane[data-r147pane="helpers"] [data-r147-preset] .r147-config-grid label{display:grid!important;gap:5px!important}
    .r147-pane[data-r147pane="helpers"] [data-r147-preset] .r147-config-grid label[style*="span 2"]{grid-column:span 1!important}

    .rc191-variant-picker{display:grid;gap:7px;padding:11px 12px;border-radius:18px;background:linear-gradient(145deg,rgba(255,251,246,.90),rgba(247,245,249,.88));border:1px solid rgba(128,111,132,.08)}
    .rc191-variant-picker>span{font-size:10.5px;color:#817983}
    .rc191-variant-options{display:flex;gap:10px;flex-wrap:wrap}
    .rc191-variant-options button{width:68px!important;min-width:68px!important;padding:6px 6px 7px!important;border-radius:16px!important;border:1px solid rgba(132,114,135,.11)!important;background:#fffdf9!important;display:grid!important;place-items:center!important;gap:3px!important;box-shadow:none!important}
    .rc191-variant-options button i{display:block;width:46px;height:46px;background-image:var(--preview);background-size:contain;background-position:center;background-repeat:no-repeat}
    .rc191-variant-options button b{font-size:10px!important;font-weight:600!important;color:#7d7380}
    .rc191-variant-options button.active{border-color:rgba(155,128,155,.28)!important;box-shadow:0 0 0 2px rgba(199,173,196,.18)!important;background:linear-gradient(145deg,#fffdf9,#f7f2f8)!important}

    @media(max-width:560px){
      .r147-pane[data-r147pane="helpers"] [data-r147-preset] .reward-config-head{grid-template-columns:64px minmax(0,1fr) auto!important}
      .r147-pane[data-r147pane="helpers"] .rc191-rec-thumb{width:64px!important;height:64px!important}
      .r147-pane[data-r147pane="helpers"] [data-r147-preset] .r147-config-grid{grid-template-columns:1fr!important}
      .r147-pane[data-r147pane="helpers"] .r147-rec{grid-template-columns:74px minmax(0,1fr)!important}
      .r147-pane[data-r147pane="helpers"] .r147-rec img,.r147-pane[data-r147pane="helpers"] .r147-rec .r147-img{width:74px!important;height:74px!important}
    }
    @media(max-width:430px){
      dialog.sat-modal .sat-avatar-choice{height:112px!important;min-height:112px!important}
      .rc191-variant-options button{width:62px!important;min-width:62px!important}
      .rc191-variant-options button i{width:42px!important;height:42px!important}
    }
  `;
  document.head.appendChild(style);

  document.documentElement.dataset.berthaIndex='RC191';
  document.documentElement.dataset.berthaAssets='RC191';
  document.documentElement.dataset.berthaBuild='RC191';

  document.addEventListener('DOMContentLoaded',()=>{requestAnimationFrame(runEnhancements)});
  setTimeout(runEnhancements,120);
})();
