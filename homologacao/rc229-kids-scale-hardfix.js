/* BERTH.A RC229 — correção efetiva de escala Raposa + Corujinha
   Esta RC usa PNGs embutidos com canvas apertado ao conteúdo real.
   O CSS passa a dimensionar o próprio conteúdo, não o canvas transparente antigo.
*/
(function(){
  'use strict';
  const BUILD='RC229';
  const style=document.createElement('style');
  style.id='rc229-kids-scale-hardfix-style';
  style.textContent=`
    .r197-acc:has(.rc224-fox-asset) .r197-acc-art,
    .r197-acc:has(.rc225-owl-asset) .r197-acc-art{
      min-height:184px!important;
      height:184px!important;
      overflow:visible!important;
      display:flex!important;
      align-items:center!important;
      justify-content:center!important;
    }
    .r197-acc-art .rc224-fox-asset,
    .r197-acc-art .rc225-owl-asset{
      width:100%!important;
      height:100%!important;
      min-height:0!important;
      display:flex!important;
      align-items:center!important;
      justify-content:center!important;
      overflow:visible!important;
      background:transparent!important;
    }
    .r197-acc-art .rc224-fox-asset img,
    .r197-acc-art .rc225-owl-asset img{
      width:auto!important;
      height:auto!important;
      max-width:92%!important;
      max-height:168px!important;
      min-width:118px!important;
      object-fit:contain!important;
      object-position:center!important;
      transform:none!important;
      filter:none!important;
      display:block!important;
    }
    /* alguns acessórios muito estreitos precisam de presença mínima no card */
    .r197-acc-art .rc224-fox-asset img{max-width:94%!important;max-height:170px!important;}
    .r197-acc-art .rc225-owl-asset img{max-width:94%!important;max-height:170px!important;}
  `;
  document.head.appendChild(style);
  function stamp(){
    document.documentElement.dataset.berthaBuild=BUILD;
    document.documentElement.dataset.berthaIndex=BUILD;
    document.title='BERTH.A · Homologação '+BUILD;
    const idx=document.getElementById('rc157IndexBadge');
    if(idx) idx.textContent='INDEX · '+BUILD;
    document.querySelectorAll('body *').forEach(el=>{
      if(el.children.length!==0)return;
      const t=(el.textContent||'').trim();
      if(/^HML\s*·\s*RC\d+/i.test(t)) el.textContent='HML · '+BUILD;
    });
  }
  function run(){stamp();setTimeout(stamp,80);setTimeout(stamp,350);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true}); else run();
  window.addEventListener('pageshow',run);
  window.addEventListener('hashchange',()=>setTimeout(run,30));
})();
