
/* ============================================================
   BERTH.A RC162 — Convites + Premiações
   Ajuste visual cirúrgico, sem alterar regras funcionais.
   ============================================================ */
(function(){
  const STYLE_ID='bertha-ui-v162';
  let rewardRepairing=false;

  function addStyles(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      /* ---- referência cromática: Meu Dia Ideal ---- */
      :root{
        --b162-hero:linear-gradient(135deg,
          rgba(249,205,218,.66) 0%,
          rgba(255,245,224,.80) 43%,
          rgba(218,234,252,.88) 100%);
        --b162-cta:linear-gradient(90deg,
          rgba(232,150,182,.94) 0%,
          rgba(244,190,182,.88) 30%,
          rgba(247,221,183,.86) 52%,
          rgba(210,222,238,.92) 78%,
          rgba(178,211,226,.94) 100%);
      }

      body[data-bertha-route="convites"] .sat-ideal-hero,
      body[data-bertha-route="premiacoes"] .r147-hero{
        position:relative!important;
        background:var(--b162-hero)!important;
        border:1px solid rgba(170,157,177,.13)!important;
        box-shadow:0 12px 28px rgba(74,57,69,.04)!important;
      }

      /* ---- CONVITES ---- */
      body[data-bertha-route="convites"] .sat-ideal-hero{
        min-height:190px!important;
        padding:24px 26px!important;
      }
      body[data-bertha-route="convites"] .sat-ideal-hero .sat-hero-copy{
        max-width:78%!important;
      }
      body[data-bertha-route="convites"] .r162-invite-hero-icon{
        position:absolute!important;
        right:25px!important;
        top:27px!important;
        width:43px!important;
        height:43px!important;
        color:#9198aa!important;
        opacity:.58!important;
        fill:none!important;
        stroke:currentColor!important;
        stroke-width:1.35!important;
        stroke-linecap:round!important;
        stroke-linejoin:round!important;
      }
      body[data-bertha-route="convites"] .r162-invite-hero-icon *{
        fill:none!important;
        stroke:currentColor!important;
      }
      body[data-bertha-route="convites"] .sat-main-cta,
      body[data-bertha-route="convites"] #newInvite{
        background:var(--b162-cta)!important;
        color:#fff!important;
        border:1px solid rgba(164,145,155,.10)!important;
        box-shadow:0 8px 22px rgba(125,91,109,.055)!important;
        font-weight:650!important;
      }
      body[data-bertha-route="convites"] .r162-invite-card-icon{
        background:linear-gradient(135deg,
          rgba(249,205,218,.42) 0%,
          rgba(255,244,224,.58) 48%,
          rgba(218,234,252,.62) 100%)!important;
        border:1px solid rgba(165,151,170,.08)!important;
        color:#7f7787!important;
        box-shadow:none!important;
      }

      /* ---- PREMIAÇÕES: HERO ---- */
      body[data-bertha-route="premiacoes"] .r147-hero{
        min-height:184px!important;
        padding:24px 26px!important;
      }
      body[data-bertha-route="premiacoes"] .r147-hero .sat-hero-copy{
        max-width:80%!important;
        position:relative!important;
        z-index:1!important;
      }
      body[data-bertha-route="premiacoes"] .r147-hero h2{
        margin:12px 0 9px!important;
        max-width:470px!important;
        font-size:31px!important;
        line-height:1.04!important;
        font-weight:420!important;
        letter-spacing:-.032em!important;
      }
      body[data-bertha-route="premiacoes"] .r147-hero p{
        margin:0!important;
        max-width:500px!important;
        font-size:14px!important;
        line-height:1.45!important;
      }
      body[data-bertha-route="premiacoes"] .r162-reward-hero-icon{
        position:absolute!important;
        right:25px!important;
        top:27px!important;
        width:47px!important;
        height:47px!important;
        color:#9499aa!important;
        opacity:.59!important;
        fill:none!important;
        stroke:currentColor!important;
        stroke-width:1.35!important;
        stroke-linecap:round!important;
        stroke-linejoin:round!important;
      }
      body[data-bertha-route="premiacoes"] .r162-reward-hero-icon *{
        fill:none!important;
        stroke:currentColor!important;
      }
      body[data-bertha-route="premiacoes"] .r147-hero-orbit{display:none!important}

      /* ---- PREMIAÇÕES: módulo ---- */
      body[data-bertha-route="premiacoes"] .r147-page{
        gap:15px!important;
      }
      body[data-bertha-route="premiacoes"] .r147-tabs{
        padding:5px!important;
        border-radius:22px!important;
        background:rgba(255,253,249,.82)!important;
        border:1px solid rgba(116,99,127,.075)!important;
        box-shadow:0 8px 22px rgba(72,58,72,.025)!important;
      }
      body[data-bertha-route="premiacoes"] .r147-tabs button{
        min-height:46px!important;
        border-radius:17px!important;
        font-size:12px!important;
      }
      body[data-bertha-route="premiacoes"] .r147-tabs button.active{
        background:rgba(255,255,255,.88)!important;
        color:#574c5b!important;
        box-shadow:0 7px 18px rgba(80,62,77,.05)!important;
      }
      body[data-bertha-route="premiacoes"] .r147-card{
        padding:17px!important;
        border-radius:25px!important;
        background:rgba(255,253,250,.92)!important;
        border:1px solid rgba(116,99,127,.075)!important;
        box-shadow:0 9px 26px rgba(72,58,72,.028)!important;
      }
      body[data-bertha-route="premiacoes"] .r147-head h3{
        font-size:19px!important;
        font-weight:430!important;
        letter-spacing:-.02em!important;
      }
      body[data-bertha-route="premiacoes"] .r147-head p{
        margin-top:4px!important;
        line-height:1.4!important;
      }

      /* painel curatorial do Kids */
      body[data-bertha-route="premiacoes"] .r162-kids-module-intro{
        padding:15px 16px!important;
        border-radius:22px!important;
        background:linear-gradient(135deg,
          rgba(247,226,234,.60),
          rgba(255,247,230,.68) 48%,
          rgba(229,238,249,.72))!important;
        border:1px solid rgba(150,132,150,.075)!important;
      }
      body[data-bertha-route="premiacoes"] .r162-kids-module-intro .eyebrow{
        margin-bottom:7px!important;
      }
      body[data-bertha-route="premiacoes"] .r162-kids-module-intro strong{
        display:block!important;
        font-size:18px!important;
        font-weight:430!important;
        letter-spacing:-.015em!important;
        color:#49424c!important;
      }
      body[data-bertha-route="premiacoes"] .r162-kids-module-intro p{
        margin:5px 0 0!important;
        color:#817984!important;
        font-size:11px!important;
        line-height:1.45!important;
      }

      body[data-bertha-route="premiacoes"] .r152-current{
        padding:15px!important;
        border-radius:22px!important;
        background:linear-gradient(135deg,
          rgba(249,226,234,.58),
          rgba(255,247,231,.68) 48%,
          rgba(226,237,249,.72))!important;
        border:1px solid rgba(143,126,145,.075)!important;
      }
      body[data-bertha-route="premiacoes"] .r152-form-grid{
        gap:11px!important;
      }
      body[data-bertha-route="premiacoes"] .r152-form-grid label{
        gap:6px!important;
        color:#716875!important;
        font-size:11px!important;
      }
      body[data-bertha-route="premiacoes"] .r152-form-grid select,
      body[data-bertha-route="premiacoes"] .r152-form-grid input{
        min-height:47px!important;
        border-radius:16px!important;
        background:#fffdfa!important;
        border:1px solid rgba(128,109,131,.11)!important;
        box-shadow:none!important;
      }
      body[data-bertha-route="premiacoes"] .r152-pets button,
      body[data-bertha-route="premiacoes"] .r152-acc-grid label{
        border-radius:18px!important;
        background:#fffdfa!important;
        border-color:rgba(128,109,131,.075)!important;
      }
      body[data-bertha-route="premiacoes"] .r152-pets button.active,
      body[data-bertha-route="premiacoes"] .r152-acc-grid label.active{
        border-color:rgba(199,135,165,.26)!important;
        box-shadow:0 0 0 3px rgba(232,178,200,.10)!important;
      }
      body[data-bertha-route="premiacoes"] .primary,
      body[data-bertha-route="premiacoes"] #r152SaveCycle{
        background:var(--b162-cta)!important;
        color:#fff!important;
        border:1px solid rgba(164,145,155,.10)!important;
        box-shadow:0 8px 22px rgba(125,91,109,.055)!important;
        font-weight:650!important;
      }

      @media(max-width:430px){
        body[data-bertha-route="convites"] .sat-ideal-hero,
        body[data-bertha-route="premiacoes"] .r147-hero{
          padding:23px 23px!important;
        }
        body[data-bertha-route="convites"] .sat-ideal-hero .sat-hero-copy,
        body[data-bertha-route="premiacoes"] .r147-hero .sat-hero-copy{
          max-width:82%!important;
        }
        body[data-bertha-route="convites"] .r162-invite-hero-icon,
        body[data-bertha-route="premiacoes"] .r162-reward-hero-icon{
          right:21px!important;top:23px!important;
        }
        body[data-bertha-route="premiacoes"] .r147-hero h2{
          font-size:29px!important;
        }
      }
    `;
    document.head.appendChild(s);
  }

  function inviteHeroIcon(){
    return `<svg class="r162-invite-hero-icon" viewBox="0 0 64 64" aria-hidden="true">
      <rect x="12" y="15" width="40" height="37" rx="8"/>
      <path d="M21 11v9M43 11v9M12 26h40"/>
      <path d="M23 38l6 6 13-14"/>
    </svg>`;
  }

  function rewardHeroIcon(){
    return `<svg class="r162-reward-hero-icon" viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="26" r="14"/>
      <path d="M25 39l-3 15 10-6 10 6-3-15"/>
      <path d="M32 17l2.6 5.3 5.9.9-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.2 5.9-.9z"/>
      <path d="M50 15l2 2M14 15l-2 2M50 37l2 2M14 37l-2 2"/>
    </svg>`;
  }

  function polishConvites(){
    addStyles();
    document.body.dataset.berthaRoute='convites';
    const hero=document.querySelector('.sat-page .sat-ideal-hero');
    if(hero){
      hero.querySelector('.sat-hero-icon,.r162-invite-hero-icon')?.remove();
      hero.insertAdjacentHTML('beforeend',inviteHeroIcon());
    }
    document.querySelectorAll('.sat-page .sat-card .sat-member .sat-avatar')
      .forEach(x=>x.classList.add('r162-invite-card-icon'));
  }

  function polishRewards(){
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
      hero.querySelector('.r147-hero-orbit,.r162-reward-hero-icon')?.remove();
      hero.insertAdjacentHTML('beforeend',rewardHeroIcon());
    }

    const kidsPane=document.querySelector('[data-r147pane="kids"] .r152-kid-overview');
    if(kidsPane && !kidsPane.querySelector('.r162-kids-module-intro')){
      kidsPane.insertAdjacentHTML('afterbegin',`
        <section class="r162-kids-module-intro">
          <div class="eyebrow">CONFIGURAÇÃO KIDS</div>
          <strong>Ciclo de Progressão</strong>
          <p>Defina o tema, o pet, os acessórios e os marcos deste ciclo. A trilha completa fica no perfil Kids.</p>
        </section>`);
    }
  }

  const baseConvites=window.renderConvites;
  window.renderConvitesV162=function(){
    const out=baseConvites?.();
    polishConvites();
    return out;
  };

  const baseRewards =
    window.renderRewardsRC152 ||
    window.__berthaFinalRewardsRenderer ||
    window.renderUniversalRewards;

  window.renderRewardsV162=function(tab=''){
    const out=baseRewards?.(tab);
    polishRewards();
    return out;
  };

  /* Os aliases públicos apontam para a versão atual para reduzir a chance
     de qualquer camada antiga repintar Premiações. */
  window.renderUniversalRewards=window.renderRewardsV162;
  window.renderKidsRewards=window.renderRewardsV162;

  /* Guarda de rota: se um renderer legado reaparecer na página de Premiações,
     restaura a versão atual uma única vez. */
  const obs=new MutationObserver(()=>{
    if(rewardRepairing)return;
    if((location.hash||'').replace('#','')!=='premiacoes')return;

    const legacy=document.querySelector('.rewards-page:not(.r147-page)');
    const current=document.querySelector('.r147-page');
    if(legacy && !current){
      rewardRepairing=true;
      requestAnimationFrame(()=>{
        try{window.renderRewardsV162()}finally{
          setTimeout(()=>{rewardRepairing=false},80);
        }
      });
      return;
    }
    if(current)polishRewards();
  });
  obs.observe(document.getElementById('app'),{childList:true,subtree:false});

  addStyles();
  document.documentElement.dataset.berthaBuild='RC162';
})();
