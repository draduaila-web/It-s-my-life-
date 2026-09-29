/* BERTH.A RC200 — Helper spacing + checkbox polish
   - mantém avatares aprovados
   - brisas do Helper suavizadas (menos verde, mais legíveis)
   - checkbox do Helper alinhado ao padrão suave do Owner
   - cache-bust dos assets para refletir a troca imediata no GitHub Pages */
(function(){
  const RECOG_KEY='bertha.recognition.presets.v19';
  const LEGACY_KEYS=['bertha.recognition.presets.v18','bertha.recognition.presets.v17','bertha.recognition.presets.v16','bertha.recognition.presets.v15','bertha.recognition.presets.v14','bertha.recognition.presets.v13','bertha.recognition.presets.v12','bertha.recognition.presets.v10'];
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
  const OWNER_ART={
    progress100:'owner_align_v192.png',
    goal:'owner_goal_v192.png',
    streak:'owner_sequence_v192.png',
    cycle:'owner_cycle_v192.png',
    focus:'owner_focus_v192.png',
    presence:'owner_presence_v192.png',
    balance:'owner_align_v192.png',
    sequence:'owner_sequence_v192.png',
    continuity:'owner_cycle_v192.png',
    selfcare:'owner_presence_v192.png',
    depth:'owner_focus_v192.png',
    evolution:'owner_presence_v192.png',
    delivery:'owner_goal_v192.png'
  };

  const OWNER_TONES=[
    {id:'medal-1',name:'Lilás + amarelo',bg:'linear-gradient(145deg,#faf4ff,#fff9e8 58%,#f8f4ff)',filter:'hue-rotate(0deg) saturate(.92) brightness(.98) contrast(1.02)'},
    {id:'medal-2',name:'Verde sálvia',bg:'linear-gradient(145deg,#f4fbf5,#fbfbed 58%,#f4f9f4)',filter:'hue-rotate(86deg) saturate(.84) brightness(.97) contrast(1.03)'},
    {id:'medal-3',name:'Pêssego',bg:'linear-gradient(145deg,#fff6ef,#fffaf1 58%,#fff3eb)',filter:'hue-rotate(-18deg) saturate(.90) brightness(.98) contrast(1.03)'},
    {id:'medal-4',name:'Azul névoa',bg:'linear-gradient(145deg,#f2f8ff,#fafbff 56%,#f1f6ff)',filter:'hue-rotate(126deg) saturate(.84) brightness(.98) contrast(1.03)'},
    {id:'medal-5',name:'Rosé suave',bg:'linear-gradient(145deg,#fff4f7,#fff8f4 56%,#fdf2f8)',filter:'hue-rotate(18deg) saturate(.88) brightness(.98) contrast(1.02)'},
    {id:'medal-6',name:'Menta dourada',bg:'linear-gradient(145deg,#f3fbf8,#fff9ef 56%,#f3faf8)',filter:'hue-rotate(58deg) saturate(.86) brightness(.97) contrast(1.03)'}
  ];
  const OWNER_MEDAL_CYCLE=6;

  function tryJSON(k){try{return JSON.parse(window.berthaHmlStorage.getItem(k)||'null')}catch(e){return null}}
  function stripExt(v){return String(v||'').replace(/\.(png|jpg|jpeg|svg)$/i,'')}
  function assetFile(name){ return './'+stripExt(name)+'.png?v=200'; }
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
    for(const key of LEGACY_KEYS){ raw=tryJSON(key); if(Array.isArray(raw)&&raw.length)return raw; }
    return null;
  }
  function loadPresets(){
    const raw=readRaw();
    return DEFAULTS.map((d,i)=>normalizeOne(Array.isArray(raw)?raw[i]:d,i));
  }
  function savePresets(arr){
    const out=DEFAULTS.map((d,i)=>normalizeOne(Array.isArray(arr)?arr[i]:d,i));
    try{window.berthaHmlStorage.setItem(RECOG_KEY,JSON.stringify(out))}catch(e){}
    return out;
  }
  function normalizeSatelliteKey(key){
    return typeof normalizeSatelliteAvatarKey==='function' ? normalizeSatelliteAvatarKey(key) : key;
  }
  function ownerToneFor(occurrence=0){
    return OWNER_TONES[(occurrence)%OWNER_MEDAL_CYCLE];
  }
  function ownerImg(file,cls='rc192-owner-art',tone=null){
    const style=tone?` style="--owner-filter:${tone.filter};--owner-bg:${tone.bg}"`:'';
    return `<span class="rc193-owner-art-shell ${tone?`rc193-tone rc193-tone-${tone.id}`:''}"${style}><img class="${cls}" src="./${file}?v=200" alt="" aria-hidden="true"></span>`;
  }
  function helperStateFromRow(row,i){
    const current=loadPresets();
    const base=current[i]||DEFAULTS[i]||DEFAULTS[0];
    const next={...base};
    const name=row.querySelector('[data-name]');
    const msg=row.querySelector('[data-msg]');
    const active=row.querySelector('[data-active]');
    if(name) next.name=name.value.trim()||base.name;
    if(msg) next.message=msg.value.trim()||base.message;
    if(active) next.active=!!active.checked;
    return next;
  }

  const RECOG_NAMES=Object.values(VARIANTS).flat();
  try{ if(typeof R186_RECOGNITION_PNG_ASSETS!=='undefined') RECOG_NAMES.forEach(n=>R186_RECOGNITION_PNG_ASSETS.add(n)); }catch(e){}
  savePresets(loadPresets());

  window.r147RecognitionDefaults = ()=>loadPresets().map(x=>({...x}));
  window.r147RecognitionPresets = ()=>loadPresets().map(x=>({...x}));
  window.r147SaveRecognitionPresets = x=>savePresets(x);

  window.satelliteAvatarIcon = function(key='person'){
    key = normalizeSatelliteKey(key);
    const src = './'+(AVATARS[key]||AVATARS.person);
    return `<img class="sat-avatar-art" src="${src}" alt="" aria-hidden="true">`;
  };

  function ownerRewardFileByCriterion(criterion){
    return OWNER_ART[criterion]||OWNER_ART.progress100;
  }
  function roomItems(){
    const base=[
      {key:'sequence',name:'Constância',sub:'7 dias'},
      {key:'cycle',name:'Ciclo concluído',sub:'rotina ou projeto'},
      {key:'focus',name:'Foco',sub:'30 dias'},
      {key:'balance',name:'Equilíbrio',sub:'semana alinhada'},
      {key:'goal',name:'Meta alcançada',sub:'objetivo concluído'},
      {key:'presence',name:'Presença',sub:'ritual mantido'},
      {key:'sequence',name:'Sequência',sub:'novo marco'},
      {key:'delivery',name:'Projeto entregue',sub:'etapa importante'},
      {key:'continuity',name:'Continuidade',sub:'ciclo renovado'},
      {key:'selfcare',name:'Autocuidado',sub:'escolha consciente'},
      {key:'depth',name:'Profundidade',sub:'foco sustentado'},
      {key:'evolution',name:'Evolução',sub:'histórico pessoal'}
    ];
    return base.map(item=>({
      ...item,
      occurrence:0,
      tone:ownerToneFor(0),
      medal:1
    }));
  }

  function openOwnerCollection(){
    if(typeof r147Dialog!=='function') return;
    const items=roomItems();
    const legend=OWNER_TONES.map((tone,i)=>`<span class="rc195-medal-chip rc195-${tone.id}"><i></i><b>${i+1}ª medalha</b><small>${tone.name}</small></span>`).join('');
    const html=`<div class="rc193-owner-room-note"><strong>Ciclo de medalhas</strong><p>A 1ª medalha de cada conquista usa a mesma paleta. Quando aquela mesma conquista se repetir, ela avança para a 2ª cor, depois 3ª, até completar um ciclo de 6 medalhas.</p></div><div class="rc195-medal-legend">${legend}</div><div class="r147-collection rc192-owner-room rc193-owner-room">${items.map((x)=>`<div class="r147-col-item rc192-owner-col rc193-owner-col">${ownerImg(ownerRewardFileByCriterion(x.key),'rc192-owner-col-art',x.tone)}<strong>${x.name}</strong><small>${x.sub}</small><em class="rc193-owner-repeat">${x.medal}ª medalha</em></div>`).join('')}</div>`;
    const dlg=r147Dialog('Sala de Troféus',html);
    return dlg;
  }

  function enhanceOwnerPane(){
    const pane=document.querySelector('.r147-pane[data-r147pane="owner"]');
    if(!pane) return;
    const roomBtn=pane.querySelector('#r147OwnerRoom');
    if(roomBtn && !roomBtn.dataset.rc192Bound){
      const clone=roomBtn.cloneNode(true);
      clone.dataset.rc192Bound='1';
      roomBtn.replaceWith(clone);
      clone.addEventListener('click',function(ev){
        ev.preventDefault();
        ev.stopPropagation();
        openOwnerCollection();
      });
    }

    const cards=[...pane.querySelectorAll('.r147-ach')];
    const files=['progress100','cycle','focus','presence'];
    cards.forEach((card,i)=>{
      const art=card.querySelector('.art');
      const key=files[i];
      if(!art||!key) return;
      art.innerHTML=ownerImg(ownerRewardFileByCriterion(key),'rc192-owner-art',ownerToneFor(0));
      art.classList.add('rc192-owner-art-wrap');
      card.classList.add('rc193-owner-card');
    });

    pane.querySelectorAll('[data-r147-owner]').forEach((row,i)=>{
      const current=(typeof loadOwnerRewards==='function' ? loadOwnerRewards() : [])[i]||{};
      const criterion=(row.querySelector('[data-criterion]')?.value)||current.criterion||['progress100','goal','streak','cycle'][i]||'progress100';
      const tone=ownerToneFor(0);
      const top=row.querySelector('.rc178-owner-top');
      if(top && !top.querySelector('.rc192-owner-mini')){
        const thumb=document.createElement('div');
        thumb.className='rc192-owner-mini';
        thumb.innerHTML=ownerImg(ownerRewardFileByCriterion(criterion),'rc192-owner-mini-art',tone);
        top.insertBefore(thumb, top.firstChild);
      }
      const select=row.querySelector('[data-criterion]');
      const thumbShell=top?.querySelector('.rc193-owner-art-shell');
      const thumbImg=top?.querySelector('.rc192-owner-mini-art');
      if(select && !select.dataset.rc192Bound){
        select.dataset.rc192Bound='1';
        select.addEventListener('change',()=>{
          const nextTone=ownerToneFor(0);
          if(thumbImg) thumbImg.src='./'+ownerRewardFileByCriterion(select.value);
          if(thumbShell){thumbShell.style.setProperty('--owner-filter',nextTone.filter);thumbShell.style.setProperty('--owner-bg',nextTone.bg);thumbShell.className=`rc193-owner-art-shell rc193-tone rc193-tone-${nextTone.id}`;}
        });
      }
    });
  }

  function enhanceHelperPane(){
    const pane=document.querySelector('.r147-pane[data-r147pane="helpers"]');
    if(!pane) return;
    const presets=loadPresets();

    const helperIntro=pane.querySelector(".r147-helper-context > div");
    if(helperIntro){
      const nameEl=helperIntro.querySelector("strong");
      const textEl=helperIntro.querySelector("small");
      helperIntro.style.display="block";
      helperIntro.style.minWidth="0";
      if(nameEl){
        nameEl.style.display="inline-block";
        nameEl.style.margin="0 14px 0 0";
        nameEl.style.verticalAlign="baseline";
      }
      if(textEl){
        textEl.style.display="inline";
        textEl.style.margin="0";
        textEl.style.lineHeight="1.42";
        textEl.style.verticalAlign="baseline";
      }
    }

    pane.querySelectorAll('[data-r147-rec]').forEach((btn,i)=>{
      const p=presets.filter(x=>x.active!==false)[i];
      if(!p) return;
      const img=btn.querySelector('img');
      if(img) img.src=assetFile(p.asset);
    });

    const details=pane.querySelector('details');
    if(details && !details.querySelector('.rc192-variant-note')){
      const note=document.createElement('div');
      note.className='rc192-variant-note';
      note.innerHTML='<strong>Cores dos reconhecimentos</strong><p>Em cada card, escolha a miniatura <b>Rosé</b> ou <b>Brisa</b>. A variação já atualiza o reconhecimento enviado.</p>';
      const config=details.querySelector('.r147-config');
      if(config) details.insertBefore(note, config);
    }

    pane.querySelectorAll('[data-r147-preset]').forEach((row,i)=>{
      const p=presets[i]; if(!p) return;
      const head=row.querySelector('.reward-config-head');
      if(!head) return;
      const headImgs=[...head.querySelectorAll('img')];
      let img=headImgs[0];
      if(!img){
        img=document.createElement('img');
        img.alt='';
        head.insertBefore(img, head.firstChild);
      }
      headImgs.slice(1).forEach(extra=>extra.remove());
      img.className='rc196-rec-thumb';
      img.src=assetFile(p.asset);

      const active=head.querySelector('.reward-active');
      if(active && !active.classList.contains('rc192-helper-active')){
        const input=active.querySelector('input');
        const checked=!!input?.checked;
        active.className='reward-active rc178-owner-active rc192-helper-active';
        active.innerHTML='';
        if(input){ input.checked=checked; input.setAttribute('data-active',''); active.appendChild(input); }
        const span=document.createElement('span'); span.className='rc178-check';
        const em=document.createElement('em'); em.textContent='Ativo';
        active.appendChild(span); active.appendChild(em);
      }

      let picker=row.querySelector('.rc192-variant-picker');
      if(!picker){
        picker=document.createElement('div');
        picker.className='rc192-variant-picker';
        picker.innerHTML=`<div class="rc192-variant-head"><strong>Variação de cor</strong><small>Escolha a família visual deste reconhecimento.</small></div><div class="rc192-variant-options"><button type="button" data-variant="0"><i></i><b>${VARIANT_LABELS[0]}</b></button><button type="button" data-variant="1"><i></i><b>${VARIANT_LABELS[1]}</b></button></div>`;
        const grid=row.querySelector('.r147-config-grid');
        if(grid) row.insertBefore(picker, grid); else row.appendChild(picker);
      }
      picker.querySelectorAll('[data-variant]').forEach((b,variantIndex)=>{
        const preview=(VARIANTS[p.id]||VARIANTS.thanks)[variantIndex];
        b.style.setProperty('--preview',`url("${assetFile(preview)}")`);
        b.classList.toggle('active',variantIndex===p.variant);
        if(!b.dataset.rc192Bound){
          b.dataset.rc192Bound='1';
          b.addEventListener('click',()=>{
            const current=loadPresets();
            current[i]=helperStateFromRow(row,i);
            current[i].variant=variantIndex;
            current[i].asset=(VARIANTS[current[i].id]||VARIANTS.thanks)[variantIndex];
            const saved=savePresets(current);
            picker.querySelectorAll('[data-variant]').forEach((x,j)=>x.classList.toggle('active',j===variantIndex));
            img.src=assetFile(saved[i].asset);
            requestAnimationFrame(()=>enhanceHelperPane());
          });
        }
      });
    });

    const bubble=document.querySelector('.r148-build');
    if(bubble) bubble.textContent='HML · RC200';
  }

  function enhanceSatModal(){
    const dlg=document.querySelector('dialog.sat-modal[open]');
    if(!dlg) return;
  }

  function runEnhancements(){
    enhanceHelperPane();
    enhanceOwnerPane();
    enhanceSatModal();
  }

  const baseRender=window.renderRewardsRC147||window.renderUniversalRewards;
  if(typeof baseRender==='function'){
    const wrapped=function(tab=''){
      baseRender(tab);
      requestAnimationFrame(runEnhancements);
      setTimeout(runEnhancements,80);
    };
    window.renderRewardsRC147=wrapped;
    window.renderUniversalRewards=wrapped;
    window.renderKidsRewards=wrapped;
  }

  const style=document.createElement('style');
  style.id='rc192-owner-helper-style';
  style.textContent=`
    .sat-avatar-art{display:block;width:100%;height:100%;object-fit:contain!important;object-position:center!important;filter:drop-shadow(0 6px 14px rgba(106,84,106,.10))}
    .sat-member>.sat-avatar,.r147-helper-context .sat-avatar,.r147-kid-avatar{overflow:visible!important;background:transparent!important}
    .sat-member>.sat-avatar .sat-avatar-art,.r147-helper-context .sat-avatar-art,.r147-kid-avatar .sat-avatar-art{width:100%!important;height:100%!important}

    dialog.sat-modal .sat-avatar-picker{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important;width:100%!important}
    dialog.sat-modal .sat-avatar-choice{height:118px!important;min-height:118px!important;padding:9px 8px 11px!important;gap:5px!important;background:linear-gradient(145deg,rgba(255,253,249,.96),rgba(249,246,250,.92))!important;border:1px solid rgba(126,110,128,.10)!important;transition:transform .16s ease,box-shadow .16s ease,border-color .16s ease!important;overflow:hidden!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;box-sizing:border-box!important}
    dialog.sat-modal .sat-avatar-choice .sat-avatar-art{width:70px!important;height:70px!important;flex:0 0 70px!important}
    dialog.sat-modal .sat-avatar-choice small{display:grid!important;gap:0!important;justify-items:center!important;font-size:10.4px!important;line-height:1.12!important;color:#706873!important;text-align:center!important;white-space:normal!important;overflow-wrap:anywhere!important}
    dialog.sat-modal .sat-avatar-choice.active{transform:translateY(-1px)!important;border-color:rgba(164,132,159,.24)!important;box-shadow:0 8px 22px rgba(90,69,88,.08),0 0 0 2px rgba(204,177,199,.16)!important;background:linear-gradient(145deg,#fffdf9,#f8f3f8)!important}

    html body dialog.sat-modal .sat-permissions, html body dialog.sat-modal .sat-kids-settings{gap:12px!important}
    html body dialog.sat-modal .sat-permission{display:grid!important;grid-template-columns:28px minmax(0,1fr)!important;align-items:center!important;gap:14px!important;padding:16px!important;min-height:0!important;border-radius:22px!important;background:rgba(255,253,249,.90)!important;border:1px solid rgba(122,108,128,.10)!important;box-shadow:none!important}
    html body dialog.sat-modal .sat-permission.is-checked{background:linear-gradient(135deg,rgba(251,247,239,.98),rgba(248,237,240,.55) 42%,rgba(237,246,252,.42) 100%)!important;border-color:rgba(201,170,176,.24)!important}
    html body dialog.sat-modal .sat-checkbox,.sat-member .sat-checkbox{appearance:none!important;-webkit-appearance:none!important;width:26px!important;height:26px!important;margin:0!important;border-radius:10px!important;border:1.5px solid rgba(183,167,191,.92)!important;background:linear-gradient(145deg,rgba(255,251,248,.98),rgba(247,243,250,.98))!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.82),0 4px 12px rgba(166,147,172,.10)!important;position:relative!important;display:inline-block!important;vertical-align:middle!important;cursor:pointer!important}html body dialog.sat-modal .sat-checkbox:checked,.sat-member .sat-checkbox:checked{border-color:transparent!important;background:linear-gradient(145deg,#f1d3de,#e2cfe7 58%,#d9e7f2)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.70),0 6px 14px rgba(177,153,175,.16)!important}html body dialog.sat-modal .sat-checkbox:checked::after,.sat-member .sat-checkbox:checked::after{content:"";position:absolute;left:9px;top:5px;width:6px;height:12px;border:solid #fff;border-width:0 2.5px 2.5px 0;transform:rotate(45deg)}
    html body dialog.sat-modal .sat-permission-copy{display:grid!important;gap:4px!important;min-width:0!important;width:100%!important}
    html body dialog.sat-modal .sat-permission-copy strong, html body dialog.sat-modal .sat-permission strong{display:block!important;font-size:14px!important;line-height:1.25!important;font-weight:520!important;color:#4d4550!important;white-space:normal!important}
    html body dialog.sat-modal .sat-permission-copy small, html body dialog.sat-modal .sat-permission small{display:block!important;font-size:11.5px!important;line-height:1.45!important;color:#867e89!important;white-space:normal!important;overflow-wrap:anywhere!important}

    .r147-pane[data-r147pane="helpers"] .r147-rec-grid{grid-template-columns:1fr!important;gap:12px!important}
    .r147-pane[data-r147pane="helpers"] .r147-rec{grid-template-columns:82px minmax(0,1fr)!important;gap:14px!important;min-height:112px!important;padding:14px!important;border-radius:22px!important;background:#fffdf9!important;border:1px solid rgba(122,108,128,.09)!important;align-items:center!important}
    .r147-pane[data-r147pane="helpers"] .r147-rec img,.r147-pane[data-r147pane="helpers"] .r147-rec .r147-img{width:82px!important;height:82px!important;object-fit:contain!important;background:transparent!important;border-radius:0!important;filter:drop-shadow(0 7px 16px rgba(101,83,107,.10))}
    .r147-pane[data-r147pane="helpers"] .r147-rec strong{display:block!important;font-size:14px!important;line-height:1.25!important;font-weight:500!important}
    .r147-pane[data-r147pane="helpers"] .r147-rec small{display:block!important;margin-top:4px!important;font-size:11px!important;line-height:1.4!important;color:#88808b!important}

    .rc192-variant-note{display:grid;gap:6px;margin:14px 0 2px;padding:14px 16px;border-radius:20px;background:linear-gradient(135deg,rgba(251,245,247,.95),rgba(250,247,242,.95) 50%,rgba(241,247,252,.95));border:1px solid rgba(126,110,128,.08)}
    .rc192-variant-note strong{font-size:13px;color:#554d58}
    .rc192-variant-note p{margin:0;font-size:11.5px;line-height:1.45;color:#857d88}

    .r147-pane[data-r147pane="helpers"] [data-r147-preset]{padding:14px!important;border-radius:24px!important;background:rgba(255,253,249,.94)!important;border:1px solid rgba(122,108,128,.09)!important;display:grid!important;gap:12px!important;box-shadow:none!important}
    .r147-pane[data-r147pane="helpers"] [data-r147-preset] .reward-config-head{display:grid!important;grid-template-columns:64px minmax(0,1fr) 56px!important;gap:14px!important;align-items:center!important;margin:0!important}
    .r147-pane[data-r147pane="helpers"] [data-r147-preset] .reward-config-head>div{min-width:0!important}
    .rc196-rec-thumb{width:64px!important;height:64px!important;object-fit:contain!important;display:block!important;filter:drop-shadow(0 6px 14px rgba(101,83,107,.09))}
    .r147-pane[data-r147pane="helpers"] [data-r147-preset] .reward-config-head strong{display:block!important;font-size:14px!important;line-height:1.25!important;font-weight:500!important;color:#4f4752!important}
    .r147-pane[data-r147pane="helpers"] [data-r147-preset] .reward-config-head small{display:block!important;margin-top:4px!important;font-size:11.25px!important;line-height:1.42!important;color:#8a818c!important}
    .r147-pane[data-r147pane="helpers"] [data-r147-preset] .reward-active{justify-self:end!important;align-self:start!important}
    .r147-pane[data-r147pane="helpers"] [data-r147-preset] .r147-config-grid{display:grid!important;grid-template-columns:1fr 1.6fr!important;gap:10px!important}
    .r147-pane[data-r147pane="helpers"] [data-r147-preset] .r147-config-grid label{display:grid!important;gap:5px!important}
    .r147-pane[data-r147pane="helpers"] [data-r147-preset] .r147-config-grid label[style*="span 2"]{grid-column:span 1!important}
    .rc178-owner-active .rc178-check,.rc192-helper-active .rc178-check{width:36px!important;height:36px!important;border-radius:12px!important;border:1px solid rgba(183,167,191,.92)!important;background:linear-gradient(145deg,rgba(255,251,248,.98),rgba(247,243,250,.98))!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.82),0 4px 12px rgba(166,147,172,.10)!important}.rc192-helper-active,.rc178-owner-active{width:56px!important}.rc178-owner-active input:checked + .rc178-check,.rc192-helper-active input:checked + .rc178-check{border-color:transparent!important;background:linear-gradient(145deg,#f1d3de,#e2cfe7 58%,#d9e7f2)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.65),0 6px 14px rgba(177,153,175,.16)!important}.rc178-owner-active input:checked + .rc178-check:after,.rc192-helper-active input:checked + .rc178-check:after{left:12px!important;top:7px!important;width:8px!important;height:15px!important}.rc192-helper-active em,.rc178-owner-active em{font-size:10.5px!important}
    .r147-pane[data-r147pane="helpers"] .r147-helper-context>div{display:block!important;min-width:0!important}.r147-pane[data-r147pane="helpers"] .r147-helper-context>div>strong{display:inline-block!important;margin:0 14px 0 0!important;white-space:normal!important;vertical-align:baseline!important}.r147-pane[data-r147pane="helpers"] .r147-helper-context>div>small{display:inline!important;margin:0!important;white-space:normal!important;line-height:1.42!important;vertical-align:baseline!important}

    .rc192-variant-picker{display:grid;gap:8px;padding:12px 13px;border-radius:18px;background:linear-gradient(145deg,rgba(255,251,246,.90),rgba(247,245,249,.88));border:1px solid rgba(128,111,132,.08)}
    .rc192-variant-head{display:grid;gap:2px}
    .rc192-variant-head strong{font-size:12px;color:#544c57}
    .rc192-variant-head small{font-size:10.5px;color:#857d88}
    .rc192-variant-options{display:flex;gap:10px;flex-wrap:wrap}
    .rc192-variant-options button{width:88px!important;min-width:88px!important;padding:7px 8px 8px!important;border-radius:16px!important;border:1px solid rgba(132,114,135,.11)!important;background:#fffdf9!important;display:grid!important;place-items:center!important;gap:4px!important;box-shadow:none!important}
    .rc192-variant-options button i{display:block;width:52px;height:52px;background-image:var(--preview);background-size:contain;background-position:center;background-repeat:no-repeat}
    .rc192-variant-options button b{font-size:10px!important;font-weight:600!important;color:#7d7380}
    .rc192-variant-options button.active{border-color:rgba(155,128,155,.28)!important;box-shadow:0 0 0 2px rgba(199,173,196,.18)!important;background:linear-gradient(145deg,#fffdf9,#f7f2f8)!important}

    .rc192-owner-art-wrap{display:grid!important;place-items:center!important}
    .rc192-owner-art{display:block;width:88px;height:88px;object-fit:contain;filter:drop-shadow(0 8px 18px rgba(102,84,108,.10))}
    .rc192-owner-mini{width:64px;height:64px;display:grid;place-items:center;flex:0 0 64px;border-radius:18px;background:linear-gradient(145deg,rgba(255,249,246,.95),rgba(247,244,249,.94));border:1px solid rgba(128,111,132,.08)}
    .rc192-owner-mini-art{display:block;width:48px;height:48px;object-fit:contain}
    .rc178-owner-top{grid-template-columns:58px minmax(0,1fr) 54px!important;align-items:center!important;gap:14px!important}
    .rc178-owner-top .rc178-owner-copy{min-width:0!important}
    .rc192-owner-room .r147-col-item{padding:16px!important;border:1px solid rgba(122,108,128,.08)!important;border-radius:22px!important}
    .rc193-owner-art-shell{display:grid;place-items:center;width:100%;border-radius:24px;padding:8px;background:var(--owner-bg,linear-gradient(145deg,#faf5fb,#fbf8ef));box-shadow:inset 0 1px 0 rgba(255,255,255,.76);border:1px solid rgba(128,111,132,.07)}
    .rc193-owner-art-shell img{filter:var(--owner-filter,none) drop-shadow(0 8px 18px rgba(102,84,108,.10))}
    .rc193-owner-card .art .rc193-owner-art-shell{width:96px;height:96px}
    .rc192-owner-art{display:block;width:88px;height:88px;object-fit:contain}
    .rc192-owner-col-art{display:block;width:74px;height:74px;object-fit:contain;margin:0 auto 2px}
    .rc192-owner-mini .rc193-owner-art-shell{width:48px;height:48px;padding:0;border:none;background:transparent;box-shadow:none}
    .rc192-owner-mini-art{display:block;width:48px;height:48px;object-fit:contain}
    .rc192-owner-col strong{display:block;margin-top:2px}
    .rc193-owner-room-note{display:grid;gap:6px;margin:0 0 12px;padding:14px 16px;border-radius:20px;background:linear-gradient(135deg,rgba(251,245,247,.95),rgba(250,247,242,.95) 50%,rgba(241,247,252,.95));border:1px solid rgba(126,110,128,.08)}
    .rc193-owner-room-note strong{font-size:13px;color:#554d58}
    .rc193-owner-room-note p{margin:0;font-size:11.5px;line-height:1.45;color:#857d88}
    .rc193-owner-col{position:relative;overflow:hidden}
    .rc193-owner-repeat{display:inline-flex;align-self:center;justify-self:center;margin-top:6px;padding:5px 8px;border-radius:999px;background:rgba(255,255,255,.72);border:1px solid rgba(127,113,134,.08);font-style:normal;font-size:10px;color:#7c7380}
    .rc195-medal-legend{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:0 0 12px}
    .rc195-medal-chip{display:grid;grid-template-columns:18px minmax(0,1fr);grid-template-areas:'dot title' 'dot subtitle';column-gap:8px;row-gap:1px;padding:10px 11px;border-radius:16px;border:1px solid rgba(126,110,128,.08);background:rgba(255,253,249,.94)}
    .rc195-medal-chip i{grid-area:dot;display:block;width:18px;height:18px;border-radius:999px;background:var(--chip-bg);box-shadow:inset 0 1px 0 rgba(255,255,255,.8)}
    .rc195-medal-chip b{grid-area:title;font-size:11px;color:#57505b}
    .rc195-medal-chip small{grid-area:subtitle;font-size:10px;color:#8a828d}
    .rc195-medal-1{--chip-bg:linear-gradient(145deg,#e9d8ff,#f4d96b)}
    .rc195-medal-2{--chip-bg:linear-gradient(145deg,#d8ecd4,#cde0ad)}
    .rc195-medal-3{--chip-bg:linear-gradient(145deg,#ffd9bf,#f7b46f)}
    .rc195-medal-4{--chip-bg:linear-gradient(145deg,#d7e7ff,#a8c5f7)}
    .rc195-medal-5{--chip-bg:linear-gradient(145deg,#ffdce7,#f2b9c9)}
    .rc195-medal-6{--chip-bg:linear-gradient(145deg,#d9efe8,#eac978)}


    .r147-pane[data-r147pane="helpers"] [data-r147-preset] .reward-config-head>div{min-width:0!important;padding-right:2px!important}
    .r147-pane[data-r147pane="helpers"] [data-r147-preset] .reward-config-head strong,.r147-pane[data-r147pane="helpers"] [data-r147-preset] .reward-config-head small{overflow-wrap:anywhere!important}
    .r147-pane[data-r147pane="helpers"],.r147-pane[data-r147pane="owner"]{padding-bottom:150px!important}
    .r147-dialog-card{padding-bottom:32px!important}
    @media(max-width:560px){
      .rc195-medal-legend{grid-template-columns:1fr 1fr}

      .r147-pane[data-r147pane="helpers"] [data-r147-preset] .reward-config-head{grid-template-columns:58px minmax(0,1fr) 54px!important}
      .rc196-rec-thumb{width:58px!important;height:58px!important}
      .r147-pane[data-r147pane="helpers"] [data-r147-preset] .r147-config-grid{grid-template-columns:1fr!important}
      .r147-pane[data-r147pane="helpers"] .r147-rec{grid-template-columns:74px minmax(0,1fr)!important}
      .r147-pane[data-r147pane="helpers"] .r147-rec img,.r147-pane[data-r147pane="helpers"] .r147-rec .r147-img{width:74px!important;height:74px!important}
      .rc192-owner-art{width:80px;height:80px}
      .rc178-owner-top{grid-template-columns:58px minmax(0,1fr) auto!important}
      .rc192-owner-mini{width:58px;height:58px;flex-basis:58px}
      .rc192-owner-mini-art{width:44px;height:44px}
    }
    @media(max-width:430px){
      .rc192-variant-options button{width:78px!important;min-width:78px!important}
      .rc192-variant-options button i{width:46px!important;height:46px!important}
    }
  `;
  document.head.appendChild(style);

  document.documentElement.dataset.berthaBuild='RC200';

  /* RC194: o core da BERTH.A repinta a tela em DOMContentLoaded/pageshow.
     Mantemos os refinamentos vivos após qualquer repaint sem tocar no Owner core. */
  let rc194Scheduled=false;
  function scheduleEnhancements(delay=0){
    if(rc194Scheduled) return;
    rc194Scheduled=true;
    const go=()=>{
      rc194Scheduled=false;
      try{ runEnhancements(); }catch(e){ console.error('RC194 enhancement',e); }
    };
    if(delay) setTimeout(()=>requestAnimationFrame(go),delay);
    else requestAnimationFrame(()=>requestAnimationFrame(go));
  }
  function bindRenderLifecycle(){
    const names=['renderRewardsRC147','renderUniversalRewards','renderKidsRewards'];
    names.forEach(name=>{
      const fn=window[name];
      if(typeof fn!=='function'||fn.__rc194Wrapped) return;
      const wrapped=function(...args){
        const result=fn.apply(this,args);
        scheduleEnhancements();
        setTimeout(()=>scheduleEnhancements(),80);
        return result;
      };
      wrapped.__rc194Wrapped=true;
      wrapped.__rc194Base=fn;
      window[name]=wrapped;
    });
  }
  bindRenderLifecycle();
  const appNode=document.getElementById('app');
  if(appNode && window.MutationObserver){
    const obs=new MutationObserver(muts=>{
      if(!muts.some(m=>m.type==='childList'&&(m.addedNodes.length||m.removedNodes.length))) return;
      scheduleEnhancements(20);
    });
    obs.observe(appNode,{childList:true,subtree:true});
    window.__berthaRC194Observer=obs;
  }
  document.addEventListener('DOMContentLoaded',()=>{bindRenderLifecycle();scheduleEnhancements();setTimeout(()=>scheduleEnhancements(),180);});
  window.addEventListener('pageshow',()=>{bindRenderLifecycle();scheduleEnhancements(40);setTimeout(()=>scheduleEnhancements(),220);});
  window.addEventListener('hashchange',()=>{bindRenderLifecycle();scheduleEnhancements(40);});
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-r147tab],#r147OwnerRoom,details summary')) setTimeout(()=>scheduleEnhancements(),30);
  },true);
  scheduleEnhancements(60);
})();
