/* BERTH.A RC239 — RUNTIME VERSION LOCK
   Mantém somente os marcadores visuais/técnicos da versão em RC239.
   Não altera lógica funcional, assets, pets, Owner, Kids ou reconhecimentos.
*/
(function(){
  'use strict';

  const BUILD = 'RC239';

  function lockVersion(){
    const root = document.documentElement;

    if(root.dataset.berthaBuild !== BUILD)
      root.dataset.berthaBuild = BUILD;

    if(root.dataset.berthaIndex !== BUILD)
      root.dataset.berthaIndex = BUILD;

    window.BERTHA_BUILD = BUILD;

    const wantedTitle = 'BERTH.A · Homologação ' + BUILD;
    if(document.title !== wantedTitle)
      document.title = wantedTitle;

    const idx = document.getElementById('rc157IndexBadge');
    if(idx && idx.textContent !== 'INDEX · ' + BUILD)
      idx.textContent = 'INDEX · ' + BUILD;

    document.querySelectorAll('body *').forEach(el=>{
      if(el.children.length) return;

      const text = (el.textContent || '').trim();

      if(/^HML\s*·\s*RC\d+/i.test(text) && text !== 'HML · ' + BUILD){
        el.textContent = 'HML · ' + BUILD;
      }
    });

    root.classList.add('rc239-clean');
  }

  function installStyle(){
    if(document.getElementById('rc239-clean-style')) return;

    const style = document.createElement('style');
    style.id = 'rc239-clean-style';
    style.textContent = `
      body.bertha-hml::before{
        content:"HML · RC239"!important;
        right:16px!important;
        background:#4f4b56!important;
        font-size:10px!important;
      }

      .r148-build,
      .rc154-build,
      .hml-build-pill,
      [data-rc238-legacy-badge="1"],
      #rc238IndexBadge,
      #rc238HmlBadge{
        display:none!important;
      }
    `;
    document.head.appendChild(style);
  }

  function run(){
    installStyle();
    lockVersion();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', run, {once:true});
  }else{
    run();
  }

  window.addEventListener('pageshow', run);
  window.addEventListener('hashchange', ()=>setTimeout(run, 0));
  document.addEventListener('click', ()=>setTimeout(run, 0), true);
  document.addEventListener('change', ()=>setTimeout(run, 0), true);

  const observer = new MutationObserver(()=>{
    requestAnimationFrame(lockVersion);
  });

  observer.observe(document.documentElement,{
    subtree:true,
    childList:true,
    attributes:true,
    attributeFilter:['data-bertha-build','data-bertha-index']
  });

  [100,250,500,1000,1800,3000].forEach(ms=>setTimeout(run,ms));
})();
