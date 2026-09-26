
/* ============================================================
   BERTH.A RC159 — menu/first-paint stabilization
   Fixes:
   1) Satélites renders only AFTER Mais dialog closes.
   2) Convites renders only AFTER Mais dialog closes.
   3) Convites hero icon has explicit first-paint SVG styling.
   ============================================================ */
(function(){
  const STYLE_ID='bertha-rc159-route-style';

  function ensureStyle(){
    if(document.getElementById(STYLE_ID)) return;
    const st=document.createElement('style');
    st.id=STYLE_ID;
    st.textContent=`
      /* Convites: não depender da injeção tardia de estilos */
      body[data-bertha-route="convites"] .sat-hero-icon{
        display:block!important;
        width:42px!important;
        height:42px!important;
        color:#9b8d95!important;
        fill:none!important;
        stroke:currentColor!important;
        stroke-width:1.35!important;
        stroke-linecap:round!important;
        stroke-linejoin:round!important;
        opacity:.74!important;
      }
      body[data-bertha-route="convites"] .sat-hero-icon *{
        fill:none!important;
        stroke:currentColor!important;
      }

      /* Satélites: garante layout após fechamento do dialog Mais */
      body[data-bertha-route="satelites"] #app{
        opacity:1!important;
        visibility:visible!important;
        transform:none!important;
      }
    `;
    document.head.appendChild(st);
  }

  function closeMenuThen(fn){
    const dlg=document.getElementById('moduleMenu');
    if(dlg?.open){
      const done=()=>{
        dlg.removeEventListener('close',done);
        requestAnimationFrame(()=>requestAnimationFrame(fn));
      };
      dlg.addEventListener('close',done,{once:true});
      dlg.close();
      // fallback Safari: se close não disparar como esperado
      setTimeout(()=>{ if(!dlg.open) fn(); },90);
      return;
    }
    requestAnimationFrame(()=>requestAnimationFrame(fn));
  }

  function renderRoute(route){
    state.route=route;
    document.body.dataset.berthaRoute=route;
    try{history.replaceState({berthaRoute:route},'',location.pathname+location.search+'#'+route)}catch{}

    if(route==='satelites'){
      if(typeof window.renderSatellitesV157==='function') return window.renderSatellitesV157();
      if(typeof window.renderSatellites==='function') return window.renderSatellites();
    }
    if(route==='convites'){
      if(typeof window.renderConvites==='function'){
        window.renderConvites();
        ensureStyle();
        // second paint only for first-load CSS/layout settling
        requestAnimationFrame(()=>{ ensureStyle(); });
        return;
      }
    }
    if(route==='premiacoes'){
      if(typeof window.__berthaFinalRewardsRenderer==='function') return window.__berthaFinalRewardsRenderer();
      if(typeof window.renderUniversalRewards==='function') return window.renderUniversalRewards();
    }
    return window.__berthaCoreRender?.();
  }

  function handle(e){
    const a=e.target.closest?.('#moduleMenu [data-module-route],#moduleMenu a[href^="#"]');
    if(!a)return;
    const route=(a.dataset.moduleRoute || a.getAttribute('href')?.replace('#','') || '').trim();
    if(!['satelites','convites','premiacoes'].includes(route)) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation?.();

    closeMenuThen(()=>renderRoute(route));
  }

  // Capture before all older route listeners.
  document.addEventListener('pointerup',handle,true);
  document.addEventListener('click',handle,true);

  // Direct URL / Safari bfcache support.
  function settle(){
    ensureStyle();
    const route=(location.hash||'').replace('#','').trim();
    if(['satelites','convites','premiacoes'].includes(route)){
      closeMenuThen(()=>renderRoute(route));
    }
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',()=>setTimeout(settle,40),{once:true});
  } else {
    setTimeout(settle,40);
  }
  window.addEventListener('pageshow',()=>setTimeout(settle,40));

  document.documentElement.dataset.berthaBuild='RC159';
})();
