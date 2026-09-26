
/* ============================================================
   BERTH.A RC164 — Premiações: acabamento visual unificado
   Owner · Kids · Reconhecimentos
   ============================================================ */
(function(){
  const STYLE_ID='bertha-ui-v164';
  let repairing=false;

  function addStyles(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      body[data-bertha-route="premiacoes"] *{
        font-family:inherit!important;
        word-spacing:normal!important;
      }

      /* HERO: versão aprovada */
      body[data-bertha-route="premiacoes"] .r147-hero{
        background:linear-gradient(135deg,
          rgba(249,205,218,.66) 0%,
          rgba(255,245,224,.80) 43%,
          rgba(218,234,252,.88) 100%)!important;
        border:1px solid rgba(170,157,177,.13)!important;
        box-shadow:0 12px 28px rgba(74,57,69,.04)!important;
        min-height:178px!important;
        padding:24px 26px!important;
      }
      body[data-bertha-route="premiacoes"] .r147-hero .sat-hero-copy{max-width:82%!important}
      body[data-bertha-route="premiacoes"] .r147-hero h2{
        margin:12px 0 9px!important;
        font-size:31px!important;
        line-height:1.04!important;
        font-weight:420!important;
        letter-spacing:-.032em!important;
      }
      body[data-bertha-route="premiacoes"] .r147-hero p{
        margin:0!important;
        max-width:510px!important;
        font-size:14px!important;
        line-height:1.46!important;
        color:#736c78!important;
      }
      body[data-bertha-route="premiacoes"] .r147-hero-orbit{display:none!important}
      body[data-bertha-route="premiacoes"] .r164-hero-icon{
        position:absolute!important;
        right:25px!important;
        top:28px!important;
        width:47px!important;
        height:47px!important;
        color:#939aab!important;
        opacity:.58!important;
        fill:none!important;
        stroke:currentColor!important;
        stroke-width:1.35!important;
        stroke-linecap:round!important;
        stroke-linejoin:round!important;
      }
      body[data-bertha-route="premiacoes"] .r164-hero-icon *{
        fill:none!important;stroke:currentColor!important;
      }

      /* TABS */
      body[data-bertha-route="premiacoes"] .r147-tabs{
        padding:5px!important;
        border-radius:22px!important;
        background:rgba(255,253,249,.84)!important;
        border:1px solid rgba(122,104,129,.08)!important;
      }
      body[data-bertha-route="premiacoes"] .r147-tabs button{
        min-height:46px!important;
        border-radius:17px!important;
        font-size:12.5px!important;
        font-weight:420!important;
        color:#7b7380!important;
      }
      body[data-bertha-route="premiacoes"] .r147-tabs button.active{
        background:#fff!important;color:#514956!important;
        box-shadow:0 7px 18px rgba(80,62,77,.045)!important;
      }

      /* SHARED CARDS */
      body[data-bertha-route="premiacoes"] .r147-card{
        padding:18px!important;
        border-radius:26px!important;
        background:rgba(255,253,250,.93)!important;
        border:1px solid rgba(122,104,129,.075)!important;
        box-shadow:0 9px 24px rgba(72,58,72,.025)!important;
      }
      body[data-bertha-route="premiacoes"] .r147-head h3{
        margin:0!important;
        font-size:20px!important;
        font-weight:420!important;
        line-height:1.14!important;
        letter-spacing:-.02em!important;
        color:#49424d!important;
      }
      body[data-bertha-route="premiacoes"] .r147-head p{
        margin:5px 0 0!important;
        font-size:11.5px!important;
        line-height:1.45!important;
        color:#847b86!important;
      }

      /* OWNER */
      body[data-bertha-route="premiacoes"] [data-r147pane="owner"] .r147-ach-grid{
        grid-template-columns:repeat(2,minmax(0,1fr))!important;
        gap:12px!important;
      }
      body[data-bertha-route="premiacoes"] [data-r147pane="owner"] .r147-ach{
        min-height:174px!important;
        padding:12px!important;
        border-radius:22px!important;
        gap:7px!important;
        background:linear-gradient(155deg,#fffdfa,#faf7f4)!important;
        border:1px solid rgba(122,104,129,.075)!important;
      }
      body[data-bertha-route="premiacoes"] [data-r147pane="owner"] .r147-ach .art{
        width:88px!important;height:88px!important;
      }
      body[data-bertha-route="premiacoes"] [data-r147pane="owner"] .r147-ach strong{
        display:block!important;
        font-size:11.5px!important;
        line-height:1.24!important;
        font-weight:430!important;
        color:#4d4650!important;
      }
      body[data-bertha-route="premiacoes"] [data-r147pane="owner"] .r147-ach small{
        display:block!important;
        font-size:10.2px!important;
        line-height:1.35!important;
        color:#8a818b!important;
      }
      body[data-bertha-route="premiacoes"] [data-r147pane="owner"] .r147-action{
        min-height:38px!important;
        padding:0 14px!important;
        font-size:10.8px!important;
      }

      /* KIDS */
      body[data-bertha-route="premiacoes"] .r152-kid-overview{gap:16px!important}
      body[data-bertha-route="premiacoes"] .r152-current{
        padding:16px!important;
        border-radius:24px!important;
        background:linear-gradient(135deg,
          rgba(248,233,239,.60),
          rgba(255,248,234,.72) 48%,
          rgba(233,240,249,.76))!important;
        border:1px solid rgba(143,126,145,.075)!important;
      }
      body[data-bertha-route="premiacoes"] .r152-pet-hero{
        display:grid!important;
        grid-template-columns:88px 1fr!important;
        gap:13px!important;
        align-items:center!important;
      }
      body[data-bertha-route="premiacoes"] .r152-pet-hero>img{
        width:88px!important;height:88px!important;
        border-radius:24px!important;
        background:#fffdfa!important;
        padding:5px!important;
        box-sizing:border-box!important;
      }
      body[data-bertha-route="premiacoes"] .r152-pet-hero strong{
        display:block!important;
        font-size:18px!important;
        font-weight:420!important;
        line-height:1.15!important;
        color:#4b444f!important;
      }
      body[data-bertha-route="premiacoes"] .r152-pet-hero small{
        display:block!important;
        margin-top:4px!important;
        font-size:11px!important;
        color:#817984!important;
      }
      body[data-bertha-route="premiacoes"] .r152-stats{
        grid-template-columns:repeat(2,minmax(0,1fr))!important;
        gap:9px!important;
        margin-top:13px!important;
      }
      body[data-bertha-route="premiacoes"] .r152-stats>div{
        padding:11px 12px!important;
        border-radius:17px!important;
        background:#fffdfa!important;
        border:1px solid rgba(122,104,129,.065)!important;
      }
      body[data-bertha-route="premiacoes"] .r152-stats small{
        display:block!important;
        font-size:9.4px!important;
        color:#8a818b!important;
      }
      body[data-bertha-route="premiacoes"] .r152-stats strong{
        display:block!important;
        margin-top:4px!important;
        font-size:12.5px!important;
        font-weight:420!important;
        color:#4d4650!important;
      }
      body[data-bertha-route="premiacoes"] .r152-activity{
        gap:8px!important;margin-top:11px!important;
      }
      body[data-bertha-route="premiacoes"] .r152-activity span{
        padding:7px 10px!important;
        border-radius:999px!important;
        background:rgba(255,253,250,.84)!important;
        font-size:9.5px!important;
        color:#776f7a!important;
      }

      /* RECOGNITIONS */
      body[data-bertha-route="premiacoes"] .r147-helper-context{
        grid-template-columns:58px 1fr!important;
        gap:12px!important;
        align-items:center!important;
        padding:13px!important;
        border-radius:22px!important;
        background:linear-gradient(135deg,
          rgba(248,233,239,.58),
          rgba(255,248,234,.68) 48%,
          rgba(233,240,249,.74))!important;
        border:1px solid rgba(150,132,150,.075)!important;
      }
      body[data-bertha-route="premiacoes"] .r147-rec-grid{
        grid-template-columns:1fr!important;
        gap:10px!important;
      }
      body[data-bertha-route="premiacoes"] .r147-rec{
        grid-template-columns:62px 1fr!important;
        min-height:104px!important;
        gap:12px!important;
        align-items:center!important;
        padding:13px!important;
        border-radius:22px!important;
        background:#fffdfa!important;
        border:1px solid rgba(122,104,129,.075)!important;
        text-decoration:none!important;
      }
      body[data-bertha-route="premiacoes"] .r147-rec img{
        width:62px!important;height:62px!important;
        border-radius:19px!important;
        padding:6px!important;
        box-sizing:border-box!important;
        background:linear-gradient(135deg,
          rgba(249,205,218,.42) 0%,
          rgba(255,244,224,.58) 48%,
          rgba(218,234,252,.62) 100%)!important;
      }
      body[data-bertha-route="premiacoes"] .r147-rec strong{
        display:block!important;
        font-size:12.5px!important;
        line-height:1.25!important;
        font-weight:430!important;
        color:#4d4650!important;
        text-decoration:none!important;
      }
      body[data-bertha-route="premiacoes"] .r147-rec small{
        display:block!important;
        margin-top:4px!important;
        font-size:11px!important;
        line-height:1.4!important;
        color:#857c87!important;
      }

      /* Fix browser-link blue in any recognition/action label */
      body[data-bertha-route="premiacoes"] .r147-rec,
      body[data-bertha-route="premiacoes"] .r147-rec *,
      body[data-bertha-route="premiacoes"] .recognition-preview,
      body[data-bertha-route="premiacoes"] .recognition-preview *{
        text-decoration:none!important;
      }
      body[data-bertha-route="premiacoes"] .r147-rec strong,
      body[data-bertha-route="premiacoes"] .recognition-preview strong{
        color:#4d4650!important;
      }

      /* PERSONALIZATION */
      body[data-bertha-route="premiacoes"] details summary{
        font-size:13.5px!important;
        line-height:1.35!important;
        font-weight:420!important;
        color:#514956!important;
      }
      body[data-bertha-route="premiacoes"] .reward-config-card{
        padding:15px!important;
        border-radius:22px!important;
        background:#fffdfa!important;
        border:1px solid rgba(122,104,129,.075)!important;
      }
      body[data-bertha-route="premiacoes"] .reward-config-head{
        display:grid!important;
        grid-template-columns:58px minmax(0,1fr) auto!important;
        gap:12px!important;
        align-items:center!important;
      }
      body[data-bertha-route="premiacoes"] .reward-config-head>.r147-img,
      body[data-bertha-route="premiacoes"] .reward-config-head>img{
        width:58px!important;
        height:58px!important;
        min-width:58px!important;
        max-width:58px!important;
        object-fit:contain!important;
        border-radius:18px!important;
        padding:6px!important;
        box-sizing:border-box!important;
        background:linear-gradient(135deg,
          rgba(249,205,218,.42) 0%,
          rgba(255,244,224,.58) 48%,
          rgba(218,234,252,.62) 100%)!important;
      }
      body[data-bertha-route="premiacoes"] .reward-config-head strong{
        display:block!important;
        font-size:12.5px!important;
        line-height:1.25!important;
        font-weight:430!important;
        color:#4d4650!important;
      }
      body[data-bertha-route="premiacoes"] .reward-config-head small{
        display:block!important;
        margin-top:4px!important;
        font-size:10.5px!important;
        line-height:1.4!important;
        color:#857c87!important;
      }
      body[data-bertha-route="premiacoes"] .reward-active{
        font-size:10px!important;
        line-height:1.2!important;
      }

      @media(max-width:430px){
        body[data-bertha-route="premiacoes"] .r147-hero{padding:23px!important}
        body[data-bertha-route="premiacoes"] .r147-hero h2{font-size:29px!important}
      }
    `;
    document.head.appendChild(s);
  }

  function heroIcon(){
    return `<svg class="r164-hero-icon" viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="25" r="13"/>
      <path d="M25 38l-3 15 10-6 10 6-3-15"/>
      <path d="M32 17l2.5 5.1 5.7.8-4.1 4 1 5.7-5.1-2.7-5.1 2.7 1-5.7-4.1-4 5.7-.8z"/>
    </svg>`;
  }

  function polish(){
    addStyles();
    document.body.dataset.berthaRoute='premiacoes';
    const hero=document.querySelector('.r147-page .r147-hero');
    if(hero){
      const eyebrow=hero.querySelector('.eyebrow');
      const h=hero.querySelector('h2');
      const p=hero.querySelector('p');
      if(eyebrow)eyebrow.textContent='PREMIAÇÕES';
      if(h)h.textContent='Progress worth celebrating.';
      if(p)p.textContent='Conquistas para você. Gamificação para Kids. Reconhecimento para quem caminha junto.';
      hero.querySelector('.r147-hero-orbit,.r163-reward-hero-icon,.r162-reward-hero-icon,.r164-hero-icon')?.remove();
      hero.insertAdjacentHTML('beforeend',heroIcon());
    }
  }

  const base=window.renderRewardsV163 || window.renderRewardsV162 || window.renderRewardsRC152 || window.renderUniversalRewards;
  window.renderRewardsV164=function(tab=''){
    const out=base?.(tab);
    polish();
    return out;
  };
  window.renderRewardsV163=window.renderRewardsV164;
  window.renderRewardsV162=window.renderRewardsV164;
  window.renderUniversalRewards=window.renderRewardsV164;
  window.renderKidsRewards=window.renderRewardsV164;

  const obs=new MutationObserver(()=>{
    if(repairing)return;
    if((location.hash||'').replace('#','')!=='premiacoes')return;
    if(document.querySelector('.r147-page')){
      repairing=true;
      requestAnimationFrame(()=>{
        try{polish()}finally{setTimeout(()=>repairing=false,80)}
      });
    }
  });
  const app=document.getElementById('app');
  if(app)obs.observe(app,{childList:true,subtree:false});

  addStyles();
  document.documentElement.dataset.berthaBuild='RC164';
})();
