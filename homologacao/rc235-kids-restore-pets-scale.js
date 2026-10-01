/* BERTH.A RC235 — RESTORE PETS + safe scale only
   Removes destructive library DOM rewrites introduced by RC233/RC234.
   Keeps the Cervo/Ursinho accessory scale correction without touching pet cards or libraries.
*/
(function(){
'use strict';
const BUILD='RC235';
const PALS=['nevoa','coral','misto'];
const PREFIX='bertha.kids.accessory.variant.';
const store=()=>window.berthaHmlStorage||window.localStorage;
function selectedKid(){const s=document.querySelector('#r152KidSel');if(s&&s.value)return String(s.value);if(window.__rc209Member!=null)return String(window.__rc209Member);return String(store().getItem('bertha.rewards.selected.kid')||'default');}
function variantFor(aid){const n=Number(store().getItem(PREFIX+selectedKid()+'.'+aid));return Number.isFinite(n)?Math.max(0,Math.min(2,n)):2;}
const KIT={
 deer:{'mist_mist_v1_deer_head_0':'head','mist_mist_v1_deer_neck_1':'neck','mist_mist_v1_deer_eyes_2':'eyes','mist_mist_v1_deer_back_3':'back','mist_mist_v1_deer_special_4':'special'},
 bear:{'mist_mist_v1_bear_head_0':'head','mist_mist_v1_bear_neck_1':'neck','mist_mist_v1_bear_eyes_2':'eyes','mist_mist_v1_bear_back_3':'back','mist_mist_v1_bear_special_4':'special'}
};
function asset(animal,kind,pal){return './rc233-assets/'+animal+'_'+kind+'_'+pal+'.png?v=235';}
function patchScale(){
 document.querySelectorAll('.rc209-acc-proxy[data-acc]').forEach(proxy=>{
  const aid=proxy.getAttribute('data-acc'); let animal=null,kind=null;
  for(const a of ['deer','bear']){if(KIT[a][aid]){animal=a;kind=KIT[a][aid];break;}}
  if(!animal)return;
  const src=asset(animal,kind,PALS[variantFor(aid)]);
  proxy.classList.add('rc235-tight');
  let img=proxy.querySelector('img');
  if(!img){proxy.replaceChildren();img=document.createElement('img');img.alt='';img.loading='eager';img.decoding='async';proxy.appendChild(img);}
  if(img.getAttribute('src')!==src)img.setAttribute('src',src);
 });
}
function stamp(){
 document.documentElement.dataset.berthaBuild=BUILD; document.documentElement.dataset.berthaIndex=BUILD; document.title='BERTH.A · Homologação '+BUILD;
 const idx=document.getElementById('rc157IndexBadge'); if(idx)idx.textContent='INDEX · '+BUILD;
 document.querySelectorAll('body *').forEach(el=>{if(el.children.length)return;const t=(el.textContent||'').trim();if(/^HML\s*·\s*RC\d+/i.test(t))el.textContent='HML · '+BUILD;});
}
const style=document.createElement('style');style.id='rc235-safe-scale-style';style.textContent=`
.r197-acc:has(.rc235-tight) .r197-acc-art{height:186px!important;min-height:186px!important;overflow:visible!important;display:flex!important;align-items:center!important;justify-content:center!important}
.r197-acc-art .rc235-tight{width:100%!important;height:100%!important;display:flex!important;align-items:center!important;justify-content:center!important;overflow:visible!important;background:transparent!important}
.r197-acc-art .rc235-tight img{display:block!important;width:auto!important;height:174px!important;max-width:94%!important;max-height:174px!important;object-fit:contain!important;object-position:center!important;transform:none!important;filter:none!important}
`;document.head.appendChild(style);
function patch(){patchScale();stamp();}
let raf=0;function schedule(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;patch();});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
window.addEventListener('pageshow',schedule);window.addEventListener('hashchange',()=>setTimeout(schedule,40));
document.addEventListener('click',e=>{if(e.target.closest('[data-r147tab="kids"],[data-rc209variant],[data-r152pet],#rc208PetSel,#r152KidSel'))setTimeout(schedule,60);},true);
document.addEventListener('change',e=>{if(e.target.matches('#rc208PetSel,#r152KidSel'))setTimeout(schedule,60);},true);
[120,350,800,1600].forEach(ms=>setTimeout(schedule,ms));
})();
