/* BERTH.A RC280 — Oceano: escala visual e cores suaves dos acessórios */
(function(){
  const st=document.createElement('style');
  st.textContent=`
    .rc280-ocean-acc{min-width:0!important;min-height:0!important;width:100%!important;height:100%!important;display:flex!important;align-items:center!important;justify-content:center!important;background:transparent!important;overflow:visible!important}
    /* O PNG tem margens transparentes: dimensionar o quadro e a arte separadamente. */
    .r197-acc:has(.rc280-ocean-acc) .r197-acc-art{width:100%!important;height:156px!important;min-height:156px!important;padding:0!important;display:grid!important;place-items:center!important;overflow:hidden!important}
    .r197-acc-art .rc280-ocean-acc img{width:100%!important;height:100%!important;max-width:100%!important;max-height:100%!important;object-fit:contain!important;object-position:center!important;display:block!important;transform:scale(1.03)!important;transform-origin:center!important}
    .rc208-library .rc280-ocean-acc img{width:100%!important;height:100%!important;max-width:100%!important;max-height:100%!important;object-fit:contain!important;object-position:center!important;transform:scale(1.03)!important;transform-origin:center!important}
    /* Mantém o volume da arte original, sem elevar brilho ou contraste. */
    .rc280-ocean-acc[data-v="0"] img{filter:hue-rotate(60deg) saturate(.72)!important}
    .rc280-ocean-acc[data-v="1"] img{filter:hue-rotate(-18deg) saturate(.72)!important}
    .rc280-ocean-acc[data-v="2"] img{filter:saturate(.78)!important}
  `;
  document.head.appendChild(st);
  document.documentElement.dataset.berthaOceanAccessories='RC280';
})();
