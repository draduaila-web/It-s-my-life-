/* BERTH.A RC280 — Oceano: 5 acessórios exclusivos por pet */
(function(){
  const st=document.createElement('style');
  st.textContent=`
    .rc280-ocean-acc{min-width:0!important;min-height:0!important;width:100%!important;height:100%!important;display:flex!important;align-items:center!important;justify-content:center!important;background:transparent!important;overflow:visible!important}
    .rc280-ocean-acc img{width:76%!important;height:76%!important;max-width:76%!important;max-height:76%!important;object-fit:contain!important;display:block!important;filter:none!important}
    .rc208-library .rc280-ocean-acc img{width:100%!important;height:100%!important;max-width:100%!important;max-height:100%!important;object-fit:contain!important}
  `;
  document.head.appendChild(st);
  document.documentElement.dataset.berthaOceanAccessories='RC280';
})();
