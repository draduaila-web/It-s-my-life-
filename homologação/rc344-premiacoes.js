/* BERTH.A RC344 — acabamento das premiações; conserva as escalas existentes. */
(()=>{
 'use strict';
 if(document.getElementById('rc344-awards-style'))return;
 const style=document.createElement('style');style.id='rc344-awards-style';
 style.textContent=`
 .rc209-kids-shell img[data-rc344-award-palette]{object-fit:contain!important;object-position:center!important;background:transparent!important;border-radius:0!important}
 .rc344-award-capsule{display:inline-flex;align-items:center;justify-content:center}
 .rc344-award-capsule img{display:block;width:100%;height:100%;object-fit:contain;object-position:center;background:transparent}
 img[src*="rc344_"][data-rc344-award-palette="boy"]{filter:url("#rc344-awards-cool")!important}
 img[src*="rc344_"][data-rc344-award-palette="girl"]{filter:url("#rc344-awards-warm")!important}
 img[src*="rc344_"][data-rc344-award-palette="neutral"]{filter:none!important}
 `;document.head.appendChild(style);
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
 svg.setAttribute('aria-hidden','true');svg.setAttribute('width','0');svg.setAttribute('height','0');
 svg.style.cssText='position:absolute;pointer-events:none;overflow:hidden';
 // Matrizes de cor completas: preservam diferenças entre materiais e o alfa.
 svg.innerHTML=`<defs>
 <filter id="rc344-awards-cool" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values=".80 .04 .025 0 .015 .025 .96 .035 0 0 .035 .045 1 0 0 0 0 0 1 0"/></filter>
 <filter id="rc344-awards-warm" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values=".88 .025 .18 0 0 .06 .88 .015 0 .01 .045 .10 .72 0 .01 0 0 0 1 0"/></filter>
 </defs>`;
 const start=()=>document.body.appendChild(svg);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
