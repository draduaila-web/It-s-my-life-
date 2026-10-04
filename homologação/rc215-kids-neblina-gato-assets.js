/* BERTH.A RC215 — Kids · Neblina · Gato Neblina — renderer fix
   Corrige RC214: os assets existiam no patch, mas o painel RC209 usa um renderer local.
   RC215 atua diretamente nos nós renderizados e preserva storage/trilha/Owner/Helper.
*/
(function(){
  'use strict';
  const BUILD='RC215';
  const BASE='assets/rc215/kids/neblina/gato/';
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

  function selectedKid(){
    const sel=document.querySelector('[data-r152kidselect]');
    if(sel && sel.value) return String(sel.value);
    if(window.__rc209Member!=null) return String(window.__rc209Member);
    return String(window.berthaHmlStorage?.getItem('bertha.rewards.selected.kid')||'');
  }

  function variantFor(aid){
    const mid=selectedKid();
    const raw=window.berthaHmlStorage?.getItem('bertha.kids.accessory.variant.'+mid+'.'+aid);
    const n=Number(raw);
    return Number.isFinite(n)?Math.max(0,Math.min(2,n)):2;
  }

  function srcFor(aid){
    const stem=IDS[aid];
    if(!stem) return '';
    const pal=PALS[variantFor(aid)]||'misto';
    return BASE+stem+'-'+pal+'.png?v=215';
  }

  function patchRenderedAssets(root=document){
    root.querySelectorAll('.rc209-acc-proxy[data-acc]').forEach(proxy=>{
      const aid=proxy.getAttribute('data-acc');
      if(!IDS[aid]) return;
      const src=srcFor(aid);
      proxy.classList.add('rc215-gato-asset');
      proxy.setAttribute('data-rc215','1');
      proxy.innerHTML='<img src="'+src+'" alt="" loading="eager" decoding="async">';
    });
  }

  const style=document.createElement('style');
  style.id='rc215-gato-assets-style';
  style.textContent=`
    .r197-acc-art .rc215-gato-asset{display:flex!important;align-items:center!important;justify-content:center!important;width:100%!important;height:100%!important;min-height:132px!important;overflow:visible!important;background:transparent!important}
    .r197-acc-art .rc215-gato-asset img{display:block!important;width:96%!important;height:132px!important;object-fit:contain!important;object-position:center!important;filter:none!important;transform:none!important}
    .r197-acc:has(.rc215-gato-asset) .r197-acc-art{min-height:140px!important;overflow:visible!important}
  `;
  document.head.appendChild(style);

  let queued=false;
  function schedulePatch(){
    if(queued) return; queued=true;
    requestAnimationFrame(()=>{queued=false;stamp();patchRenderedAssets(document);});
  }

  schedulePatch();
  [80,220,550,1100,2200].forEach(ms=>setTimeout(schedulePatch,ms));
  window.addEventListener('pageshow',()=>setTimeout(schedulePatch,50));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(schedulePatch,50)});
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-r147tab="kids"],[data-rc209variant],[data-r152kidselect]')) setTimeout(schedulePatch,40);
  },true);
  document.addEventListener('change',e=>{
    if(e.target.matches('[data-r152kidselect]')) setTimeout(schedulePatch,40);
  },true);

  const target=document.querySelector('[data-r147pane="kids"]')||document.body;
  const observer=new MutationObserver(schedulePatch);
  observer.observe(target,{childList:true,subtree:true});
})();
