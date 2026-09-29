/* BERTH.A RC213 — Kids/Neblina — Item 01 Boné de Bruma
   Patch mínimo sobre a base estável RC211/RC209.
   Não altera storage, trilha, owner/helper ou os demais acessórios.
*/
(function(){
  'use strict';
  const BUILD='RC213';
  const ASSET='assets/rc213/kids/neblina/gato/bone-bruma.png?v=213-item01';

  function stamp(){
    document.documentElement.dataset.berthaBuild=BUILD;
    document.documentElement.dataset.berthaIndex=BUILD;
    document.title='BERTH.A · Homologação '+BUILD;
    const idx=document.getElementById('rc157IndexBadge');
    if(idx && idx.textContent!=='INDEX · '+BUILD) idx.textContent='INDEX · '+BUILD;
    document.querySelectorAll('body *').forEach(el=>{
      if(el.children.length===0 && /^HML\s*·\s*RC\d+/i.test((el.textContent||'').trim())){
        el.textContent='HML · '+BUILD;
      }
    });
  }

  function installAssetPatch(){
    if(typeof window.r147img!=='function') return false;
    if(window.__RC213_ITEM01_INSTALLED__) return true;
    const previous=window.r147img;
    window.r147img=function(name,cls=''){
      if(name==='mist_v1_cat_head'){
        return `<span class="r197-art rc213-asset3d ${cls||''}"><img src="${ASSET}" alt="" loading="eager" decoding="async"></span>`;
      }
      return previous.apply(this,arguments);
    };
    window.__RC213_ITEM01_INSTALLED__=true;
    return true;
  }

  function rerenderKids(){
    if((location.hash||'').replace('#','')!=='premiacoes') return;
    const pane=document.querySelector('[data-r147pane="kids"]');
    if(!pane || typeof window.r152KidsPanel!=='function' || typeof window.r152WireKids!=='function') return;
    const kids=(window.loadSatellites?.().members||[]).filter(m=>m.status!=='removed'&&m.role==='kids');
    if(!kids.length) return;
    let mid=window.berthaHmlStorage?.getItem('bertha.rewards.selected.kid')||kids[0].id;
    if(!kids.some(k=>String(k.id)===String(mid))) mid=kids[0].id;
    pane.innerHTML=window.r152KidsPanel(mid);
    window.r152WireKids();
  }

  const style=document.createElement('style');
  style.id='rc213-item01-style';
  style.textContent=`
    .rc213-asset3d{display:flex!important;align-items:center;justify-content:center;width:100%;height:100%;min-height:112px;overflow:visible!important}
    .rc213-asset3d img{display:block!important;width:94%!important;height:94%!important;object-fit:contain!important;object-position:center!important;filter:none!important;transform:none!important}
  `;
  document.head.appendChild(style);

  function boot(){
    stamp();
    if(installAssetPatch()) rerenderKids();
  }
  boot();
  [80,250,700,1600,3000].forEach(ms=>setTimeout(boot,ms));
  window.addEventListener('pageshow',()=>setTimeout(boot,80));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(boot,80)});
  document.addEventListener('click',e=>{if(e.target.closest('[data-r147tab="kids"]'))setTimeout(boot,80)});

  const observer=new MutationObserver(()=>stamp());
  const idx=document.getElementById('rc157IndexBadge');
  if(idx) observer.observe(idx,{childList:true,characterData:true,subtree:true});
})();
