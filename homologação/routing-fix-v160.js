
/* ============================================================
   BERTH.A RC160 — rota única + hero unificado
   ============================================================ */
(function(){
  const STYLE_ID='bertha-rc160-route-style';
  let lock=false;

  function ensureStyle(){
    if(document.getElementById(STYLE_ID))return;
    const st=document.createElement('style');st.id=STYLE_ID;
    st.textContent=`
      /* Uma só paleta para os heros de Satélites, Convites e Premiações:
         mesma linguagem aprovada do Meu Dia Ideal. */
      body[data-bertha-route="satelites"] .s156-hero,
      body[data-bertha-route="convites"] .sat-ideal-hero,
      body[data-bertha-route="premiacoes"] .sat-ideal-hero{
        background:linear-gradient(135deg,
          rgba(249,205,218,.68) 0%,
          rgba(255,245,224,.78) 42%,
          rgba(218,234,252,.86) 100%)!important;
        border-color:rgba(170,157,177,.13)!important;
        box-shadow:0 12px 28px rgba(74,57,69,.04)!important;
      }

      body[data-bertha-route="convites"] .sat-hero-icon{
        display:block!important;width:42px!important;height:42px!important;
        color:#989fb0!important;fill:none!important;stroke:currentColor!important;
        stroke-width:1.35!important;stroke-linecap:round!important;stroke-linejoin:round!important;
        opacity:.62!important;
      }
      body[data-bertha-route="convites"] .sat-hero-icon *{
        fill:none!important;stroke:currentColor!important;
      }

      body[data-bertha-route="satelites"] #app,
      body[data-bertha-route="convites"] #app,
      body[data-bertha-route="premiacoes"] #app{
        opacity:1!important;visibility:visible!important;transform:none!important;
      }
    `;
    document.head.appendChild(st);
  }

  function renderRoute(route){
    ensureStyle();
    state.route=route;
    document.body.dataset.berthaRoute=route;
    try{history.replaceState({berthaRoute:route},'',location.pathname+location.search+'#'+route)}catch{}

    if(route==='satelites'){
      return window.renderSatellitesV156?.() || window.renderSatellitesV157?.() || window.renderSatellites?.();
    }
    if(route==='convites'){
      const out=window.renderConvites?.();
      ensureStyle();
      return out;
    }
    if(route==='premiacoes'){
      return window.__berthaFinalRewardsRenderer?.() || window.renderUniversalRewards?.();
    }
  }

  function closeThenRender(route){
    if(lock)return;
    lock=true;
    const dlg=document.getElementById('moduleMenu');

    const paint=()=>{
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        renderRoute(route);
        lock=false;
      }));
    };

    if(dlg?.open){
      const onClose=()=>{
        dlg.removeEventListener('close',onClose);
        paint();
      };
      dlg.addEventListener('close',onClose,{once:true});
      dlg.close();
      // Safari fallback
      setTimeout(()=>{ if(lock && !dlg.open){ paint(); } },120);
    }else paint();
  }

  function intercept(e){
    const a=e.target.closest?.('#moduleMenu [data-module-route],#moduleMenu a[href^="#"]');
    if(!a)return;
    const route=(a.dataset.moduleRoute||a.getAttribute('href')?.slice(1)||'').trim();
    if(!['satelites','convites','premiacoes'].includes(route))return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation?.();
    closeThenRender(route);
  }

  /* pointerdown é usado para impedir qualquer listener antigo de pointerup/click
     de pintar a tela por baixo do dialog. */
  document.addEventListener('pointerdown',intercept,true);
  document.addEventListener('click',intercept,true);

  function settleDirect(){
    ensureStyle();
    const route=(location.hash||'').replace('#','').trim();
    if(['satelites','convites','premiacoes'].includes(route)){
      const dlg=document.getElementById('moduleMenu');
      if(dlg?.open)dlg.close();
      requestAnimationFrame(()=>renderRoute(route));
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(settleDirect,60),{once:true});
  else setTimeout(settleDirect,60);
  window.addEventListener('pageshow',()=>setTimeout(settleDirect,50));

  document.documentElement.dataset.berthaBuild='RC160';
})();
