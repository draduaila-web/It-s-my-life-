/* BERTH.A RC237 — CODE-ONLY RECOVERY
   Emergency recovery after RC236 split upload: no assets bundled.
   Restores the last stable Kids renderer chain from RC235 and stamps RC237.
*/
(function(){
'use strict';
const BUILD='RC237';
function stamp(){
  document.documentElement.dataset.berthaBuild=BUILD;
  document.documentElement.dataset.berthaIndex=BUILD;
  document.title='BERTH.A · Homologação '+BUILD;
  const idx=document.getElementById('rc157IndexBadge');
  if(idx) idx.textContent='INDEX · '+BUILD;
  document.querySelectorAll('body *').forEach(el=>{
    if(el.children.length) return;
    const t=(el.textContent||'').trim();
    if(/^HML\s*·\s*RC\d+/i.test(t)) el.textContent='HML · '+BUILD;
  });
}
function recoverKids(){
  // Remove only RC236/RC234/RC233 transient build markers/classes if present.
  document.documentElement.classList.remove('rc236','rc234','rc233');
  document.body && document.body.classList.remove('rc236','rc234','rc233');
  // Ask the stable RC235 patch to re-run through the events it already listens to.
  window.dispatchEvent(new Event('pageshow'));
  window.dispatchEvent(new Event('hashchange'));
}
function run(){recoverKids();stamp();}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(run,0),{once:true}); else setTimeout(run,0);
[80,250,700,1500].forEach(ms=>setTimeout(run,ms));
window.addEventListener('pageshow',()=>setTimeout(run,30));
})();
