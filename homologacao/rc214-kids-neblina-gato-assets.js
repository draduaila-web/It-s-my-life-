/* BERTH.A RC214 — Kids · Neblina · bloco Gato Neblina
   Escopo: somente os 5 acessórios do Gato Neblina em 3 variações reais de asset.
   Névoa / Coral / Misto. Preserva a lógica RC209/RC213 e não altera storage/trilha.
*/
(function(){
  'use strict';
  const BUILD='RC214';
  const BASE='assets/rc214/kids/neblina/gato/';
  const IDS={
    'mist_mist_v1_cat_head_0':'bone',
    'mist_mist_v1_cat_neck_1':'coleira',
    'mist_mist_v1_cat_eyes_2':'oculos',
    'mist_mist_v1_cat_back_3':'mochila',
    'mist_mist_v1_cat_special_4':'amuleto'
  };
  const PALS=['nevoa','coral','misto'];

  function stamp(){
    document.documentElement.dataset.berthaBuild=BUILD;
    document.documentElement.dataset.berthaIndex=BUILD;
    document.title='BERTH.A · Homologação '+BUILD;
    const idx=document.getElementById('rc157IndexBadge');
    if(idx) idx.textContent='INDEX · '+BUILD;
    document.querySelectorAll('body *').forEach(el=>{
      if(el.children.length===0 && /^HML\s*·\s*RC\d+/i.test((el.textContent||'').trim())) el.textContent='HML · '+BUILD;
    });
  }

  function currentMember(){
    if(window.__rc209Member!=null) return String(window.__rc209Member);
    return String(window.berthaHmlStorage?.getItem('bertha.rewards.selected.kid')||'');
  }
  function variantFor(aid){
    const mid=currentMember();
    const raw=window.berthaHmlStorage?.getItem('bertha.kids.accessory.variant.'+mid+'.'+aid);
    const n=Number(raw);
    return Number.isFinite(n)?Math.max(0,Math.min(2,n)):2;
  }
  function assetMarkup(aid,cls=''){
    const stem=IDS[aid];
    const pal=PALS[variantFor(aid)]||'misto';
    const src=BASE+stem+'-'+pal+'.png?v=214-gato-neblina';
    return `<span class="r197-art rc214-gato-asset ${cls||''}" data-rc214-aid="${aid}" data-rc214-pal="${pal}"><img src="${src}" alt="" loading="eager" decoding="async"></span>`;
  }

  function install(){
    if(typeof window.r147img!=='function') return false;
    if(window.__RC214_GATO_INSTALLED__) return true;
    const previous=window.r147img;
    window.r147img=function(name,cls=''){
      if(IDS[name]) return assetMarkup(name,cls);
      return previous.apply(this,arguments);
    };
    window.__RC214_GATO_INSTALLED__=true;
    return true;
  }

  function rerender(){
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
  style.id='rc214-gato-assets-style';
  style.textContent=`
    .rc214-gato-asset{display:flex!important;align-items:center!important;justify-content:center!important;width:100%!important;height:100%!important;min-height:126px!important;overflow:visible!important;background:transparent!important}
    .rc214-gato-asset img{display:block!important;width:96%!important;height:96%!important;object-fit:contain!important;object-position:center!important;filter:none!important;transform:none!important}
    .r197-acc-art:has(.rc214-gato-asset){min-height:136px!important;overflow:visible!important}
  `;
  document.head.appendChild(style);

  function boot(){ stamp(); if(install()) rerender(); }
  boot();
  [80,220,600,1300,2600].forEach(ms=>setTimeout(boot,ms));
  window.addEventListener('pageshow',()=>setTimeout(boot,80));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(boot,80)});
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-r147tab="kids"]')) setTimeout(boot,80);
    if(e.target.closest('[data-rc209variant]')) setTimeout(()=>{stamp();rerender();},80);
  });
})();
