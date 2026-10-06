/* BERTH.A RC305 — Floresta compacta */
(function(){
 const s=document.createElement('style'); s.id='rc303-forest-style'; s.textContent=`
 .rc300-forest-pet,.rc300-forest-acc{display:flex!important;align-items:center!important;justify-content:center!important;overflow:visible!important;background:transparent!important}
 .rc300-forest-pet img{width:100%!important;height:100%!important;object-fit:contain!important;display:block!important;filter:none!important}
 .rc300-forest-acc img{width:90%!important;height:90%!important;object-fit:contain!important;object-position:center!important;display:block!important;filter:none!important}
 .rc208-library .rc300-forest-acc img{width:96%!important;height:96%!important;filter:none!important}
 img[src*="rc260_capsule_floresta.png"]{object-fit:contain!important;object-position:50% 48%!important;transform:scale(.70)!important;transform-origin:50% 50%!important;background:transparent!important;border-radius:0!important;box-shadow:none!important}
 `;document.head.appendChild(s);
 function base(src){return src.replace(/_(coral|misto)(?=\.png(?:\?|$))/,'').replace(/\?.*$/,'')}
 function sync(el){
   if(!el||!el.matches||!el.matches('.rc300-forest-acc'))return;
   const img=el.querySelector('img'); if(!img)return;
   const v=String(el.dataset.v||'0'); let b=base(img.getAttribute('src')||'');
   if(!/rc300_forest_/.test(b))return;
   const q='?v=305'; img.src=b+q;
   img.style.filter=v==='1'?'sepia(.20) saturate(1.05) hue-rotate(320deg) brightness(1.03)':v==='2'?'saturate(1.08) hue-rotate(8deg) brightness(1.02)':'saturate(.92) hue-rotate(18deg) brightness(1.04)';
 }
 function all(){document.querySelectorAll('.rc300-forest-acc').forEach(sync)}
 new MutationObserver(ms=>{for(const m of ms){if(m.type==='attributes')sync(m.target);m.addedNodes&&m.addedNodes.forEach(n=>{if(n.nodeType===1){if(n.matches?.('.rc300-forest-acc'))sync(n);n.querySelectorAll?.('.rc300-forest-acc').forEach(sync)}})}}).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['data-v']});
 document.addEventListener('click',()=>setTimeout(all,0),true); setTimeout(all,100); setTimeout(all,700);
 document.documentElement.dataset.berthaForestAssets='RC305';
})();