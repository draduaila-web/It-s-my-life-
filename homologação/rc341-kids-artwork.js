/* BERTH.A RC341 — Kids: arte inteira, escala Neblina e paletas legíveis.
   Ajusta apenas apresentação. Não altera imagens, pontos, ciclos ou escolhas salvas. */
(function(){
 'use strict';
 if(document.getElementById('rc341-kids-artwork-style'))return;
 const ACCESSORY='.rc209-kids-shell .r197-art[data-acc] img';
 const PET='.rc209-kids-shell .r197-current-art img,.rc209-kids-shell .r197-pet-art img,.rc209-kids-shell .r197-history img';
 const images=ACCESSORY+','+PET;
 const cache=new Map(),listening=new WeakSet();
 const style=document.createElement('style');style.id='rc341-kids-artwork-style';style.textContent=`
 .rc209-kids-shell .r197-acc-grid .r197-acc:not(.unlocked){opacity:1!important;border-style:dashed!important}
 .rc209-kids-shell .r197-acc-grid .r197-acc:not(.unlocked) .rc208-lock{background:#f0eae5!important;color:#756873!important}
 .rc209-kids-shell .r197-acc-grid .r197-acc .r197-acc-art{width:112px!important;max-width:100%!important;height:144px!important;min-height:144px!important;margin-inline:auto!important;padding:0!important;box-sizing:border-box!important;display:flex!important;align-items:center!important;justify-content:center!important;overflow:hidden!important}
 .rc209-kids-shell :is(.r197-acc-art,.rc208-library i) .r197-art[data-acc]{display:flex!important;align-items:center!important;justify-content:center!important;width:100%!important;height:100%!important;min-width:0!important;min-height:0!important;overflow:visible!important;background:transparent!important}
 .rc209-kids-shell :is(.r197-acc-art,.rc208-library i) .r197-art[data-acc] img{display:block!important;width:100%!important;height:100%!important;max-width:100%!important;max-height:100%!important;min-width:0!important;min-height:0!important;object-fit:contain!important;object-position:center!important;transform:var(--rc341-fit,scale(.74))!important;transform-origin:center!important;border-radius:0!important}
 .rc209-kids-shell :is(.r197-acc-art,.rc208-library i) .r197-art[data-acc]>svg{display:block!important;width:100%!important;height:100%!important;max-width:100%!important;max-height:100%!important;transform:scale(.82)!important;overflow:visible!important;filter:none!important}
 .rc209-kids-shell :is(.r197-acc-art,.rc208-library i) .r197-art[data-acc][data-v="0"] img{filter:url("#rc341-nevoa")!important}
 .rc209-kids-shell :is(.r197-acc-art,.rc208-library i) .r197-art[data-acc][data-v="1"] img{filter:url("#rc341-coral")!important}
 .rc209-kids-shell :is(.r197-acc-art,.rc208-library i) .r197-art[data-acc][data-v="2"] img{filter:saturate(.82)!important}
 .rc209-kids-shell :is(.r197-current-art,.r197-pet-art,.r197-history) .r197-art{width:100%!important;height:100%!important;min-height:0!important;display:flex!important;align-items:center!important;justify-content:center!important;background:transparent!important;overflow:visible!important}
 .rc209-kids-shell :is(.r197-current-art,.r197-pet-art,.r197-history) .r197-art img{width:100%!important;height:100%!important;max-width:100%!important;max-height:100%!important;object-fit:contain!important;object-position:center!important;transform:var(--rc341-fit,scale(.82))!important;transform-origin:center!important;filter:saturate(.9)!important}
 .rc209-kids-shell .rc260-capsule img.rc260-capsule-art{object-fit:contain!important;object-position:center!important;box-sizing:border-box!important;border-radius:0!important;background:transparent!important;box-shadow:none!important}
 `;document.head.appendChild(style);
 // Duotone pastel: preserva alfa, sombras e highlights; colore também itens cinzentos.
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
 svg.setAttribute('aria-hidden','true');svg.setAttribute('width','0');svg.setAttribute('height','0');svg.id='rc341-kids-palette-defs';
 svg.style.cssText='position:absolute;pointer-events:none;overflow:hidden';
 svg.innerHTML=`<defs>
 <filter id="rc341-nevoa" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncR type="table" tableValues=".04 .45 .98"/><feFuncG type="table" tableValues=".06 .65 .99"/><feFuncB type="table" tableValues=".09 .78 1"/></feComponentTransfer></filter>
 <filter id="rc341-coral" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncR type="table" tableValues=".09 .8 1"/><feFuncG type="table" tableValues=".05 .54 .98"/><feFuncB type="table" tableValues=".04 .44 .96"/></feComponentTransfer></filter>
 </defs>`;
 function fit(bounds,w,h,frameW,frameH,target){
  const base=Math.min(frameW/w,frameH/h);
  const scale=Math.min(frameW,frameH)*target/(Math.max(bounds.right-bounds.left,bounds.bottom-bounds.top)*base);
  const x=(w/2-(bounds.left+bounds.right)/2)*base*scale;
  const y=(h/2-(bounds.top+bounds.bottom)/2)*base*scale;
  return {scale,x,y};
 }
 function boundsFor(img){
  const key=img.currentSrc||img.src;if(cache.has(key))return cache.get(key);
  const w=img.naturalWidth,h=img.naturalHeight;
  const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)return null;
  try{
   ctx.drawImage(img,0,0);const pixels=ctx.getImageData(0,0,w,h).data;
   let left=w,top=h,right=0,bottom=0;
   // Ignore apenas pixels quase invisíveis na medição; preserva o PNG e seu alfa.
   for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(pixels[(y*w+x)*4+3]>8){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x+1);bottom=Math.max(bottom,y+1);}
   const bounds=right>left&&bottom>top?{left,top,right,bottom}:null;
   cache.set(key,bounds);return bounds;
  }catch(_){cache.set(key,null);return null;}
 }
 function normalize(img){
  if(!img.matches(images))return;
  if(!listening.has(img)){listening.add(img);img.addEventListener('load',()=>normalize(img));resize?.observe(img);}
  if(!img.complete||!img.naturalWidth||!img.clientWidth||!img.clientHeight)return;
  const bounds=boundsFor(img);if(!bounds)return; // Contain + safe fallback remains if canvas cannot read a source.
  const target=img.closest('[data-acc]') ? .74 : .82;
  const result=fit(bounds,img.naturalWidth,img.naturalHeight,img.clientWidth,img.clientHeight,target);
  const value=`translate(${result.x.toFixed(3)}px,${result.y.toFixed(3)}px) scale(${result.scale.toFixed(6)})`;
  if(img.style.getPropertyValue('--rc341-fit')!==value)img.style.setProperty('--rc341-fit',value);
 }
 const resize=typeof ResizeObserver==='function'?new ResizeObserver(entries=>entries.forEach(e=>normalize(e.target))):null;
 function scan(root){
  if(root.nodeType!==1&&root.nodeType!==9)return;
  if(root.matches?.(images))normalize(root);
  root.querySelectorAll(images).forEach(normalize);
 }
 const observer=new MutationObserver(records=>{
  records.forEach(record=>{
   if(record.type==='attributes')normalize(record.target);
   else record.addedNodes.forEach(node=>scan(node));
  });
 });
 function start(){document.body.appendChild(svg);scan(document);observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['src']});}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
 document.documentElement.dataset.berthaKidsArtwork='RC341';
})();
