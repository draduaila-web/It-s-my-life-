/* BERTH.A RC227 — build owner único + normalização visual Raposa/Corujinha
   Corrige disputa entre patches incrementais e elimina o loop de MutationObserver.
*/
(function(){
  'use strict';
  const BUILD='RC227';
  function stamp(){
    document.documentElement.dataset.berthaBuild=BUILD;
    document.documentElement.dataset.berthaIndex=BUILD;
    if(document.title!=='BERTH.A · Homologação '+BUILD) document.title='BERTH.A · Homologação '+BUILD;
    const idx=document.getElementById('rc157IndexBadge');
    if(idx && idx.textContent!=='INDEX · '+BUILD) idx.textContent='INDEX · '+BUILD;
    document.querySelectorAll('body *').forEach(el=>{
      if(el.children.length!==0) return;
      const t=(el.textContent||'').trim();
      if(/^HML\s*·\s*RC\d+/i.test(t) && t!=='HML · '+BUILD) el.textContent='HML · '+BUILD;
    });
  }
  const style=document.createElement('style');
  style.id='rc227-kids-scale-normalize-style';
  style.textContent=`
    .r197-acc-art .rc224-fox-asset{min-height:176px!important;overflow:visible!important;display:flex!important;align-items:center!important;justify-content:center!important}
    .r197-acc-art .rc224-fox-asset img{width:100%!important;height:174px!important;object-fit:contain!important;object-position:center!important;transform:scale(1.14)!important;transform-origin:center!important;filter:none!important}
    .r197-acc:has(.rc224-fox-asset) .r197-acc-art{min-height:184px!important;overflow:visible!important}
    .r197-acc-art .rc225-owl-asset{min-height:176px!important;overflow:visible!important;display:flex!important;align-items:center!important;justify-content:center!important}
    .r197-acc-art .rc225-owl-asset img{width:100%!important;height:176px!important;object-fit:contain!important;object-position:center!important;transform:scale(1.16)!important;transform-origin:center!important;filter:none!important}
    .r197-acc:has(.rc225-owl-asset) .r197-acc-art{min-height:184px!important;overflow:visible!important}
  `;
  document.head.appendChild(style);
  function run(){ stamp(); setTimeout(stamp,100); setTimeout(stamp,450); setTimeout(stamp,1200); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run,{once:true}); else run();
  window.addEventListener('pageshow',run);
  window.addEventListener('hashchange',()=>setTimeout(run,30));
})();
