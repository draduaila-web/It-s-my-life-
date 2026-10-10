/* BERTH.A RC290 — Kids final visual normalization */
(function(){
 const old=document.getElementById('rc289-kids-variants'); if(old) old.remove();
 const s=document.createElement('style'); s.id='rc290-kids-variants'; s.textContent=`
 .rc282-space-pet,.rc282-space-acc{overflow:visible!important;background:transparent!important}
 .rc282-space-pet img,.rc282-space-acc img{object-fit:contain!important}
 /* Névoa: azul/lilás suave */
 .rc282-space-acc[data-v="0"] img,.rc336-space-acc[data-v="0"] img{filter:hue-rotate(15deg) saturate(.78)!important}
 /* Coral: quente e suave */
 .rc282-space-acc[data-v="1"] img,.rc336-space-acc[data-v="1"] img{filter:hue-rotate(-28deg) saturate(.72)!important}
 /* Misto: paleta original suavizada */
 .rc282-space-acc[data-v="2"] img,.rc336-space-acc[data-v="2"] img{filter:saturate(.82)!important}
 `; document.head.appendChild(s); document.documentElement.dataset.berthaKidsVariants='RC290';
})();
