/* BERTH.A RC290 — Kids final visual normalization */
(function(){
 const old=document.getElementById('rc289-kids-variants'); if(old) old.remove();
 const s=document.createElement('style'); s.id='rc290-kids-variants'; s.textContent=`
 .rc282-space-pet,.rc282-space-acc{overflow:visible!important;background:transparent!important}
 .rc282-space-pet img,.rc282-space-acc img{object-fit:contain!important}
 /* Névoa: azul/verde claramente presente */
 .rc282-space-acc[data-v="0"] img{filter:hue-rotate(95deg) saturate(1.18) brightness(1.04)!important}
 /* Coral: quente, coral/dourado */
 .rc282-space-acc[data-v="1"] img{filter:hue-rotate(-34deg) saturate(1.22) brightness(1.03)!important}
 /* Misto: azul + lilás/rosa original, mais contrastado e diferente do coral */
 .rc282-space-acc[data-v="2"] img{filter:hue-rotate(18deg) saturate(1.12) contrast(1.05)!important}
 `; document.head.appendChild(s); document.documentElement.dataset.berthaKidsVariants='RC290';
})();
