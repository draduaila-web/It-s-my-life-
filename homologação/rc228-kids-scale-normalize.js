/* BERTH.A RC228 — normalização real de escala Raposa + Corujinha Lunar
   Assets recortados pelo conteúdo alfa e reembutidos; corrige miniaturização sem cortes/rebarbas.
*/
(function(){
  'use strict';
  const BUILD='RC228';
  function stamp(){
    document.documentElement.dataset.berthaBuild=BUILD;
    document.documentElement.dataset.berthaIndex=BUILD;
    document.title='BERTH.A · Homologação '+BUILD;
    const idx=document.getElementById('rc157IndexBadge'); if(idx) idx.textContent='INDEX · '+BUILD;
    document.querySelectorAll('body *').forEach(el=>{
      if(el.children.length!==0) return;
      const t=(el.textContent||'').trim();
      if(/^HML\s*·\s*RC\d+/i.test(t)) el.textContent='HML · '+BUILD;
    });
  }
  const style=document.createElement('style');
  style.id='rc228-kids-scale-normalize-style';
  style.textContent=`
    .r197-acc-art .rc224-fox-asset, .r197-acc-art .rc225-owl-asset{
      min-height:176px!important;overflow:visible!important;display:flex!important;align-items:center!important;justify-content:center!important;
    }
    .r197-acc-art .rc224-fox-asset img, .r197-acc-art .rc225-owl-asset img{
      display:block!important;width:100%!important;height:172px!important;object-fit:contain!important;object-position:center!important;transform:none!important;filter:none!important;
    }
    .r197-acc:has(.rc224-fox-asset) .r197-acc-art, .r197-acc:has(.rc225-owl-asset) .r197-acc-art{
      min-height:184px!important;overflow:visible!important;
    }
  `;
  document.head.appendChild(style);
  function run(){stamp();setTimeout(stamp,120);setTimeout(stamp,600);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  window.addEventListener('pageshow',run);
  window.addEventListener('hashchange',()=>setTimeout(run,30));
})();
