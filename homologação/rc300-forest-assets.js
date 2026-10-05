/* BERTH.A RC300 — Floresta */
(function(){
 const s=document.createElement('style'); s.id='rc300-forest-style'; s.textContent=`
 .rc300-forest-pet,.rc300-forest-acc{display:flex!important;align-items:center!important;justify-content:center!important;overflow:visible!important;background:transparent!important}
 .rc300-forest-pet img{width:100%!important;height:100%!important;object-fit:contain!important;display:block!important;filter:none!important}
 .rc300-forest-acc img{width:92%!important;height:92%!important;object-fit:contain!important;display:block!important}
 .rc208-library .rc300-forest-acc img{width:100%!important;height:100%!important}
 .rc300-forest-acc[data-v="0"] img{filter:hue-rotate(85deg) saturate(1.10) brightness(1.03)!important}
 .rc300-forest-acc[data-v="1"] img{filter:hue-rotate(-28deg) saturate(1.16) brightness(1.03)!important}
 .rc300-forest-acc[data-v="2"] img{filter:hue-rotate(16deg) saturate(1.10) contrast(1.04)!important}
 `;document.head.appendChild(s);document.documentElement.dataset.berthaForestAssets='RC300';
})();
