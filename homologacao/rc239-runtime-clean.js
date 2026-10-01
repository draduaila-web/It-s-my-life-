/* BERTH.A RC239 — CLEAN RUNTIME STAMP
   Consolidates visible build markers without MutationObservers.
   Leaves approved business logic untouched.
*/
(function(){
'use strict';
const BUILD='RC239';
function stamp(){
  document.documentElement.dataset.berthaBuild=BUILD;
  document.documentElement.dataset.berthaIndex=BUILD;
  window.BERTHA_BUILD=BUILD;
  document.title='BERTH.A · Homologação '+BUILD;
  const idx=document.getElementById('rc157IndexBadge');
  if(idx) idx.textContent='INDEX · '+BUILD;
  document.documentElement.classList.add('rc239-clean');
}
function style(){
  if(document.getElementById('rc239-clean-style')) return;
  const s=document.createElement('style');
  s.id='rc239-clean-style';
  s.textContent=`
    body.bertha-hml::before{content:"HML · RC239"!important;right:16px!important;background:#4f4b56!important;font-size:10px!important;letter-spacing:.08em!important}
    .r148-build,.rc154-build,.hml-build-pill,[data-rc238-legacy-badge="1"],#rc238IndexBadge,#rc238HmlBadge{display:none!important}
  `;
  document.head.appendChild(s);
}
function run(){style();stamp();}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run,{once:true}); else run();
window.addEventListener('pageshow',run);
})();
