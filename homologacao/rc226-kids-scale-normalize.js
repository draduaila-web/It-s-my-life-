/* BERTH.A RC226 — normalização visual Raposa + Corujinha Lunar
   Escopo: presença visual/escala dos assets nos cards. Não altera lógica, nomes, variantes ou progressão Kids.
*/
(function(){
  'use strict';
  const BUILD='RC226';
  function stamp(){
    document.documentElement.dataset.berthaBuild=BUILD;
    document.documentElement.dataset.berthaIndex=BUILD;
    document.title='BERTH.A · Homologação '+BUILD;
    const idx=document.getElementById('rc157IndexBadge'); if(idx) idx.textContent='INDEX · '+BUILD;
    document.querySelectorAll('body *').forEach(el=>{
      const t=(el.textContent||'').trim();
      if(el.children.length===0 && /^HML\s*·\s*RC\d+/i.test(t)) el.textContent='HML · '+BUILD;
    });
  }
  const style=document.createElement('style');
  style.id='rc226-kids-scale-normalize-style';
  style.textContent=`
    /* Raposa: corrige presença visual menor sem estourar ou cortar */
    .r197-acc-art .rc224-fox-asset{
      min-height:176px!important;
      overflow:visible!important;
      display:flex!important;align-items:center!important;justify-content:center!important;
    }
    .r197-acc-art .rc224-fox-asset img{
      width:100%!important;height:174px!important;
      object-fit:contain!important;object-position:center!important;
      transform:scale(1.14)!important;transform-origin:center center!important;
      filter:none!important;
    }
    .r197-acc:has(.rc224-fox-asset) .r197-acc-art{min-height:184px!important;overflow:visible!important;}

    /* Corujinha Lunar: aproxima escala do padrão Gato/Coelho e elimina sensação de mini-ícone */
    .r197-acc-art .rc225-owl-asset{
      min-height:176px!important;
      overflow:visible!important;
      display:flex!important;align-items:center!important;justify-content:center!important;
    }
    .r197-acc-art .rc225-owl-asset img{
      width:100%!important;height:176px!important;
      object-fit:contain!important;object-position:center!important;
      transform:scale(1.16)!important;transform-origin:center center!important;
      filter:none!important;
    }
    .r197-acc:has(.rc225-owl-asset) .r197-acc-art{min-height:184px!important;overflow:visible!important;}
  `;
  document.head.appendChild(style);
  function run(){ stamp(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run,{once:true}); else run();
  window.addEventListener('pageshow',run);
  window.addEventListener('hashchange',()=>setTimeout(run,20));
  new MutationObserver(()=>{stamp();}).observe(document.documentElement,{childList:true,subtree:true});
})();
