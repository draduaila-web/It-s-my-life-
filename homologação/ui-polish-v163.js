/* ============================================================
   BERTH.A RC163 — Premiações: linguagem visual unificada
   Owner · Kids · Reconhecimentos
   ============================================================ */
(function(){
  const STYLE_ID='bertha-ui-v163';
  let repairing=false;

  function addStyles(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      :root{
        --b163-hero:linear-gradient(135deg,
          rgba(249,205,218,.66) 0%,
          rgba(255,245,224,.80) 43%,
          rgba(218,234,252,.88) 100%);
        --b163-panel:linear-gradient(135deg,
          rgba(248,233,239,.58) 0%,
          rgba(255,248,234,.70) 48%,
          rgba(233,240,249,.76) 100%);
        --b163-cta:linear-gradient(90deg,
          rgba(232,150,182,.94) 0%,
          rgba(244,190,182,.88) 30%,
          rgba(247,221,183,.86) 52%,
          rgba(210,222,238,.92) 78%,
          rgba(178,211,226,.94) 100%);
        --b163-card:#fffdfa;
        --b163-border:rgba(122,104,129,.08);
        --b163-text:#4a434d;
        --b163-soft:#827985;
      }

      body[data-bertha-route="premiacoes"] .r147-page{gap:16px!important;padding-bottom:28px!important}
      body[data-bertha-route="premiacoes"] .r147-pane{gap:16px!important}
      body[data-bertha-route="premiacoes"] .r147-hero{
        position:relative!important;
        background:var(--b163-hero)!important;
        border:1px solid rgba(170,157,177,.13)!important;
        box-shadow:0 12px 28px rgba(74,57,69,.04)!important;
      }
      body[data-bertha-route="premiacoes"] .r147-tabs{
        padding:5px!important;border-radius:22px!important;
        background:rgba(255,253,249,.84)!important;
        border:1px solid var(--b163-border)!important;
        box-shadow:0 8px 22px rgba(72,58,72,.025)!important;
      }
      body[data-bertha-route="premiacoes"] .r147-tabs button{
        min-height:46px!important;border-radius:17px!important;
        color:#7c7480!important;font-size:12.5px!important;font-weight:430!important;
      }
      body[data-bertha-route="premiacoes"] .r147-tabs button.active{
        background:rgba(255,255,255,.9)!important;color:#524a56!important;
        box-shadow:0 7px 18px rgba(80,62,77,.05)!important;
      }
      body[data-bertha-route="premiacoes"] .r147-card{
        padding:18px!important;border-radius:26px!important;background:rgba(255,253,250,.92)!important;
        border:1px solid var(--b163-border)!important;box-shadow:0 10px 26px rgba(72,58,72,.03)!important;
      }
      body[data-bertha-route="premiacoes"] .r147-head{margin-bottom:14px!important;gap:12px!important}
      body[data-bertha-route="premiacoes"] .r147-head>div,
      body[data-bertha-route="premiacoes"] .r147-helper-context>div,
      body[data-bertha-route="premiacoes"] .recognition-preview>div,
      body[data-bertha-route="premiacoes"] .reward-config-head>div,
      body[data-bertha-route="premiacoes"] .r147-rec span,
      body[data-bertha-route="premiacoes"] .r152-pet-hero>div{display:grid!important;gap:3px!important;align-content:start!important}
      body[data-bertha-route="premiacoes"] .r147-head h3,
      body[data-bertha-route="premiacoes"] .reward-config-head strong,
      body[data-bertha-route="premiacoes"] .r147-helper-context strong,
      body[data-bertha-route="premiacoes"] .recognition-preview strong,
      body[data-bertha-route="premiacoes"] .r147-rec strong,
      body[data-bertha-route="premiacoes"] .r152-pet-hero strong,
      body[data-bertha-route="premiacoes"] .r152-hist-row strong,
      body[data-bertha-route="premiacoes"] .r147-ach strong,
      body[data-bertha-route="premiacoes"] .r147-month strong,
      body[data-bertha-route="premiacoes"] .r163-module-intro strong,
      body[data-bertha-route="premiacoes"] .r163-section-bridge strong,
      body[data-bertha-route="premiacoes"] .r152-pin-note strong,
      body[data-bertha-route="premiacoes"] .r152-pin-intro strong,
      body[data-bertha-route="premiacoes"] .r150-owner-room-intro strong{display:block!important}
      body[data-bertha-route="premiacoes"] .r147-head h3{margin:0!important;font-size:19.5px!important;font-weight:420!important;letter-spacing:-.02em!important;color:var(--b163-text)!important}
      body[data-bertha-route="premiacoes"] .r147-head p,
      body[data-bertha-route="premiacoes"] .reward-config-head small,
      body[data-bertha-route="premiacoes"] .r147-helper-context small,
      body[data-bertha-route="premiacoes"] .recognition-preview small,
      body[data-bertha-route="premiacoes"] .r147-rec small,
      body[data-bertha-route="premiacoes"] .r152-pet-hero small,
      body[data-bertha-route="premiacoes"] .r152-hist-row small,
      body[data-bertha-route="premiacoes"] .r147-ach small,
      body[data-bertha-route="premiacoes"] .r147-month small,
      body[data-bertha-route="premiacoes"] .r163-module-intro p,
      body[data-bertha-route="premiacoes"] .r163-section-bridge p,
      body[data-bertha-route="premiacoes"] .r152-pin-note small,
      body[data-bertha-route="premiacoes"] .r152-pin-intro small,
      body[data-bertha-route="premiacoes"] .r150-owner-room-intro small{display:block!important;margin:0!important;font-size:11.5px!important;line-height:1.45!important;color:var(--b163-soft)!important}

      /* intro blocks shared by the 3 fronts */
      body[data-bertha-route="premiacoes"] .r163-module-intro,
      body[data-bertha-route="premiacoes"] .r163-section-bridge{
        padding:15px 16px!important;border-radius:22px!important;background:var(--b163-panel)!important;
        border:1px solid rgba(150,132,150,.075)!important;
      }
      body[data-bertha-route="premiacoes"] .r163-module-intro .eyebrow,
      body[data-bertha-route="premiacoes"] .r163-section-bridge .eyebrow{margin-bottom:7px!important}
      body[data-bertha-route="premiacoes"] .r163-module-intro strong,
      body[data-bertha-route="premiacoes"] .r163-section-bridge strong{font-size:18px!important;font-weight:420!important;letter-spacing:-.015em!important;color:var(--b163-text)!important}

      /* owner */
      body[data-bertha-route="premiacoes"] [data-r147pane="owner"] .r147-ach-grid{gap:10px!important}
      body[data-bertha-route="premiacoes"] [data-r147pane="owner"] .r147-ach{
        min-height:168px!important;padding:12px 10px!important;border-radius:22px!important;
        background:linear-gradient(155deg,rgba(255,253,250,.94),rgba(246,242,239,.88))!important;
      }
      body[data-bertha-route="premiacoes"] [data-r147pane="owner"] .r147-ach .art{width:86px!important;height:86px!important}
      body[data-bertha-route="premiacoes"] [data-r147pane="owner"] .r147-room{gap:9px!important}
      body[data-bertha-route="premiacoes"] [data-r147pane="owner"] .r147-month{min-height:72px!important;border-radius:18px!important}
      body[data-bertha-route="premiacoes"] [data-r147pane="owner"] details,
      body[data-bertha-route="premiacoes"] [data-r147pane="helpers"] details{display:grid!important;gap:12px!important}
      body[data-bertha-route="premiacoes"] [data-r147pane="owner"] summary,
      body[data-bertha-route="premiacoes"] [data-r147pane="helpers"] summary{
        list-style:none!important;cursor:pointer!important;display:flex!important;align-items:center!important;gap:10px!important;
        padding:14px 16px!important;border-radius:18px!important;background:#fffdfa!important;border:1px solid var(--b163-border)!important;
        font-weight:420!important;font-size:13.5px!important;color:var(--b163-text)!important;
      }
      body[data-bertha-route="premiacoes"] summary::-webkit-details-marker{display:none!important}
      body[data-bertha-route="premiacoes"] summary::before{content:'▸';font-size:18px!important;line-height:1;color:#6e6571!important;transform:translateY(-1px)}
      body[data-bertha-route="premiacoes"] details[open] summary::before{content:'▾'}

      /* helper / recognitions */
      body[data-bertha-route="premiacoes"] .r147-helper-context{
        grid-template-columns:56px 1fr!important;gap:12px!important;align-items:center!important;
        padding:13px!important;border-radius:22px!important;background:var(--b163-panel)!important;
        border:1px solid rgba(150,132,150,.075)!important;margin-bottom:13px!important;
      }
      body[data-bertha-route="premiacoes"] .r147-helper-context .sat-avatar,
      body[data-bertha-route="premiacoes"] .recognition-preview .symbol,
      body[data-bertha-route="premiacoes"] .reward-config-head>.r147-img,
      body[data-bertha-route="premiacoes"] .reward-config-head>img{
        width:56px!important;height:56px!important;min-width:56px!important;border-radius:18px!important;
        background:linear-gradient(135deg,rgba(249,205,218,.42) 0%,rgba(255,244,224,.58) 48%,rgba(218,234,252,.62) 100%)!important;
        border:1px solid rgba(165,151,170,.08)!important;display:grid!important;place-items:center!important;
        object-fit:contain!important;padding:6px!important;box-sizing:border-box!important;color:#7f7787!important;
      }
      body[data-bertha-route="premiacoes"] .recognition-preview{
        display:grid!important;grid-template-columns:56px 1fr!important;gap:12px!important;align-items:center!important;
        padding:13px!important;border-radius:20px!important;background:#fffdfa!important;border:1px solid var(--b163-border)!important;
      }
      body[data-bertha-route="premiacoes"] .r147-rec-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important}
      body[data-bertha-route="premiacoes"] .r147-rec{
        grid-template-columns:56px 1fr!important;gap:10px!important;padding:12px!important;border-radius:20px!important;
        border:1px solid var(--b163-border)!important;background:#fffdfa!important;align-items:center!important;
      }
      body[data-bertha-route="premiacoes"] .r147-rec img{width:56px!important;height:56px!important;border-radius:18px!important;background:linear-gradient(135deg,rgba(249,205,218,.42) 0%,rgba(255,244,224,.58) 48%,rgba(218,234,252,.62) 100%)!important;padding:6px!important;box-sizing:border-box!important}
      body[data-bertha-route="premiacoes"] .recognition-history .item{border-radius:18px!important;padding:13px 14px!important}

      /* config cards shared */
      body[data-bertha-route="premiacoes"] .reward-config-card{
        gap:12px!important;padding:15px!important;border-radius:22px!important;background:#fffdfa!important;
        border:1px solid var(--b163-border)!important;box-shadow:none!important;
      }
      body[data-bertha-route="premiacoes"] .reward-config-head{
        grid-template-columns:56px minmax(0,1fr) auto!important;gap:12px!important;align-items:center!important;
      }
      body[data-bertha-route="premiacoes"] .reward-active{gap:7px!important;font-size:10.5px!important;line-height:1.2!important;color:#7b7380!important}
      body[data-bertha-route="premiacoes"] .reward-form-grid,
      body[data-bertha-route="premiacoes"] .r147-config-grid,
      body[data-bertha-route="premiacoes"] .r152-form-grid{gap:11px!important}
      body[data-bertha-route="premiacoes"] .reward-form-grid label,
      body[data-bertha-route="premiacoes"] .r147-config label,
      body[data-bertha-route="premiacoes"] .r152-form-grid label{gap:6px!important;font-size:11px!important;color:#7d7480!important}
      body[data-bertha-route="premiacoes"] .reward-form-grid input,
      body[data-bertha-route="premiacoes"] .reward-form-grid select,
      body[data-bertha-route="premiacoes"] .r147-config input,
      body[data-bertha-route="premiacoes"] .r147-config select,
      body[data-bertha-route="premiacoes"] .r147-config textarea,
      body[data-bertha-route="premiacoes"] .r152-form-grid input,
      body[data-bertha-route="premiacoes"] .r152-form-grid select,
      body[data-bertha-route="premiacoes"] #r152KidSel{
        min-height:46px!important;border-radius:16px!important;border:1px solid rgba(128,109,131,.11)!important;background:#fffdfa!important;
        padding:10px 12px!important;font-size:16px!important;color:#49434d!important;box-shadow:none!important;
      }
      body[data-bertha-route="premiacoes"] .primary,
      body[data-bertha-route="premiacoes"] #r152SaveCycle,
      body[data-bertha-route="premiacoes"] #r147SaveOwner,
      body[data-bertha-route="premiacoes"] #r147SaveRecPresets{
        background:var(--b163-cta)!important;color:#fff!important;border:1px solid rgba(164,145,155,.10)!important;
        box-shadow:0 8px 22px rgba(125,91,109,.055)!important;font-weight:650!important;
      }

      /* kids */
      body[data-bertha-route="premiacoes"] .r152-kid-overview{gap:16px!important}
      body[data-bertha-route="premiacoes"] .r152-current{
        padding:16px!important;border-radius:24px!important;background:var(--b163-panel)!important;border:1px solid rgba(143,126,145,.075)!important;
      }
      body[data-bertha-route="premiacoes"] .r152-pet-hero{gap:12px!important;align-items:center!important}
      body[data-bertha-route="premiacoes"] .r152-pet-hero>img{width:82px!important;height:82px!important;border-radius:24px!important;background:#fffdfa!important;padding:4px!important;box-sizing:border-box!important}
      body[data-bertha-route="premiacoes"] .r152-stats{gap:9px!important;margin-top:12px!important}
      body[data-bertha-route="premiacoes"] .r152-stats>div,
      body[data-bertha-route="premiacoes"] .r152-activity span,
      body[data-bertha-route="premiacoes"] .r152-hist-row,
      body[data-bertha-route="premiacoes"] .r152-accessories,
      body[data-bertha-route="premiacoes"] .r152-pets button,
      body[data-bertha-route="premiacoes"] .r152-acc-grid label{background:#fffdfa!important;border-color:rgba(128,109,131,.075)!important}
      body[data-bertha-route="premiacoes"] .r152-stats>div{padding:10px!important;border-radius:16px!important}
      body[data-bertha-route="premiacoes"] .r152-stats small{font-size:9px!important}
      body[data-bertha-route="premiacoes"] .r152-stats strong{font-size:12px!important;font-weight:420!important}
      body[data-bertha-route="premiacoes"] .r152-theme-preview{grid-template-columns:140px 1fr!important;gap:14px!important;margin:14px 0!important}
      body[data-bertha-route="premiacoes"] .r152-capsule img{width:118px!important;height:118px!important}
      body[data-bertha-route="premiacoes"] .r152-pets{gap:9px!important}
      body[data-bertha-route="premiacoes"] .r152-pets button{padding:9px!important;border-radius:18px!important;gap:5px!important}
      body[data-bertha-route="premiacoes"] .r152-pets span{width:82px!important;height:82px!important}
      body[data-bertha-route="premiacoes"] .r152-pets strong{font-size:10.5px!important;font-weight:420!important}
      body[data-bertha-route="premiacoes"] .r152-pets small{font-size:8.5px!important}
      body[data-bertha-route="premiacoes"] .r152-accessories{padding:13px!important;border-radius:20px!important;margin-bottom:14px!important}
      body[data-bertha-route="premiacoes"] .r152-acc-grid{gap:8px!important}
      body[data-bertha-route="premiacoes"] .r152-acc-grid label{padding:8px!important;border-radius:16px!important}
      body[data-bertha-route="premiacoes"] .r152-acc-grid span{width:52px!important;height:52px!important}
      body[data-bertha-route="premiacoes"] .r152-hist-row{padding:10px!important;border-radius:17px!important}

      @media(max-width:560px){
        body[data-bertha-route="premiacoes"] .r147-rec-grid{grid-template-columns:1fr!important}
        body[data-bertha-route="premiacoes"] .r147-config-grid,
        body[data-bertha-route="premiacoes"] .reward-form-grid,
        body[data-bertha-route="premiacoes"] .r152-form-grid{grid-template-columns:1fr!important}
        body[data-bertha-route="premiacoes"] .r152-theme-preview{grid-template-columns:1fr!important}
      }
    `;
    document.head.appendChild(s);
  }

  function ensureBridge(pane, eyebrow, title, body){
    if(!pane || pane.querySelector('.r163-module-intro')) return;
    const firstCard=pane.querySelector('.r147-card');
    const block=document.createElement('section');
    block.className='r163-module-intro';
    block.innerHTML=`<div class="eyebrow">${eyebrow}</div><strong>${title}</strong><p>${body}</p>`;
    if(firstCard) pane.insertBefore(block, firstCard); else pane.prepend(block);
  }

  function polishOwner(){
    const pane=document.querySelector('[data-r147pane="owner"]');
    if(!pane) return;
    ensureBridge(pane,'OWNER','Conquistas pessoais, com linguagem BERTH.A.','Reconhecimentos visuais para a sua própria jornada, sem perder leveza nem cair em linguagem infantil.');
  }

  function polishHelpers(){
    const pane=document.querySelector('[data-r147pane="helpers"]');
    if(!pane) return;
    ensureBridge(pane,'RECONHECIMENTOS','Gestos leves, com a mesma curadoria visual.','Escolha, personalize e envie agradecimentos com a mesma linguagem do módulo — delicada, clara e consistente.');
  }

  function polishKids(){
    const pane=document.querySelector('[data-r147pane="kids"]');
    if(!pane) return;
    const overview=pane.querySelector('.r152-kid-overview');
    if(!overview) return;
    // bloco extra apenas se ainda não existir
    if(!overview.querySelector('.r163-section-bridge')){
      const cfgCard=overview.querySelector('.r147-card');
      const block=document.createElement('section');
      block.className='r163-section-bridge';
      block.innerHTML='<div class="eyebrow">KIDS</div><strong>Mesma família visual. Outra lógica de progresso.</strong><p>O Owner configura o ciclo; a criança enxerga a trilha no Satélite Kids.</p>';
      if(cfgCard) overview.insertBefore(block, cfgCard); else overview.prepend(block);
    }
  }

  function polishRewards(){
    addStyles();
    document.body.dataset.berthaRoute='premiacoes';
    const hero=document.querySelector('.r147-page .r147-hero');
    if(hero){
      const eyebrow=hero.querySelector('.eyebrow');
      const h=hero.querySelector('h2');
      const p=hero.querySelector('p');
      if(eyebrow) eyebrow.textContent='PREMIAÇÕES';
      if(h) h.textContent='Progress worth celebrating.';
      if(p) p.textContent='Conquistas para você. Gamificação para Kids. Reconhecimento para quem caminha junto.';
    }
    polishOwner();
    polishHelpers();
    polishKids();
  }

  const prevRewards = window.renderRewardsV162 || window.renderRewardsRC152 || window.renderUniversalRewards;
  window.renderRewardsV163=function(tab=''){
    const out=prevRewards?.(tab);
    polishRewards();
    return out;
  };
  window.renderRewardsV162=window.renderRewardsV163;
  window.renderUniversalRewards=window.renderRewardsV163;
  window.renderKidsRewards=window.renderRewardsV163;

  const obs=new MutationObserver(()=>{
    if(repairing) return;
    if((location.hash||'').replace('#','')!=='premiacoes') return;
    const current=document.querySelector('.r147-page');
    if(current){
      repairing=true;
      requestAnimationFrame(()=>{
        try{ polishRewards(); } finally { setTimeout(()=>repairing=false,80); }
      });
    }
  });
  const app=document.getElementById('app');
  if(app) obs.observe(app,{childList:true,subtree:false});

  addStyles();
  document.documentElement.dataset.berthaBuild='RC163';
})();
