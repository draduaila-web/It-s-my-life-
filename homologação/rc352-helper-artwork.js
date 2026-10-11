/* RC352 — final Helper recognitions with two multicolor palettes; presentation only. */
(()=>{'use strict';
 const metrics={"rc352_rec_pause.webp": {"w": 384, "h": 384, "b": [75, 17, 309, 365], "kind": "helper"}, "rc352_rec_coffee.webp": {"w": 384, "h": 384, "b": [48, 33, 357, 348], "kind": "helper"}, "rc352_rec_flower.webp": {"w": 384, "h": 384, "b": [36, 14, 352, 370], "kind": "helper"}, "rc352_rec_saved.webp": {"w": 384, "h": 384, "b": [29, 23, 357, 357], "kind": "helper"}, "rc352_rec_arrasou.webp": {"w": 384, "h": 384, "b": [43, 31, 341, 360], "kind": "helper"}, "rc352_rec_care.webp": {"w": 384, "h": 384, "b": [26, 48, 358, 343], "kind": "helper"}, "rc352_rec_hug.webp": {"w": 384, "h": 384, "b": [29, 48, 357, 337], "kind": "helper"}, "rc352_rec_reward.webp": {"w": 384, "h": 384, "b": [39, 36, 345, 353], "kind": "helper"}, "rc352_rec_thanks.webp": {"w": 384, "h": 384, "b": [23, 62, 364, 331], "kind": "helper"}};
 function resolve(src){
  const name=(src||'').split('?')[0].split('/').pop();
  const helper=name.match(/^recognition_(thanks|flower|coffee|pause|reward|saved|hug|care|arrasou)(?:_v(?:188|189)(?:_([ab]))?)?\.(?:png|jpg)$/);
  if(helper)return './rc352_rec_'+helper[1]+'.webp?v=352&palette='+(helper[2]==='b'?'brisa':'rose');
  return src;
 }
 function fit(m,fw,fh){
  const [l,t,r,b]=m.b,base=Math.min(fw/m.w,fh/m.h),scale=.86*Math.min(fw/(r-l),fh/(b-t))/base;
  return {scale,x:(m.w/2-(l+r)/2)*base*scale,y:(m.h/2-(t+b)/2)*base*scale};
 }
 const listening=new WeakSet();
 function normalize(img){
  const raw=img.getAttribute('src')||'',next=resolve(raw);
  if(next!==raw)img.setAttribute('src',next);
  const file=next.split('?')[0].split('/').pop(),m=metrics[file];if(!m)return;
  img.dataset.rc352Artwork=m.kind;
  if(m.kind==='helper'){
   const palette=/palette=brisa/.test(next)?'brisa':'rose';img.dataset.rc352Palette=palette;
   const filter='url("#rc352-'+palette+'")';if(img.style.getPropertyValue('filter')!==filter||img.style.getPropertyPriority('filter')!=='important')img.style.setProperty('filter',filter,'important');
  }
  if(!listening.has(img)){listening.add(img);img.addEventListener('load',()=>normalize(img));resize?.observe(img);}
  const w=img.clientWidth,h=img.clientHeight;if(!w||!h)return;
  const f=fit(m,w,h),value=`translate(${f.x.toFixed(3)}px,${f.y.toFixed(3)}px) scale(${f.scale.toFixed(6)})`;
  if(img.style.getPropertyValue('--rc352-fit')!==value)img.style.setProperty('--rc352-fit',value);
  if(img.style.getPropertyValue('transform')!==value||img.style.getPropertyPriority('transform')!=='important')img.style.setProperty('transform',value,'important');
 }
 const resize=typeof ResizeObserver==='function'?new ResizeObserver(es=>es.forEach(e=>normalize(e.target))):null;
 const style=document.createElement('style');style.id='rc352-owner-helper-style';
 style.textContent=`
 body.bertha-hml::before{content:"HML · RC352"!important}
 img[data-rc352-artwork]{object-fit:contain!important;object-position:50% 50%!important;transform:var(--rc352-fit,scale(.86))!important;transform-origin:center!important;background:transparent!important;border-radius:0!important}
 img[data-rc352-palette="rose"]{filter:url("#rc352-rose")!important}
 img[data-rc352-palette="brisa"]{filter:url("#rc352-brisa")!important}
 .rc192-variant-options [data-variant] i{background-size:86% 86%!important;background-position:center!important;background-repeat:no-repeat!important}
 .rc192-variant-options [data-variant="0"] i{filter:url("#rc352-rose")!important}
 .rc192-variant-options [data-variant="1"] i{filter:url("#rc352-brisa")!important}
 `;document.head.appendChild(style);
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.id='rc352-palette-filters';svg.setAttribute('aria-hidden','true');svg.setAttribute('width','0');svg.setAttribute('height','0');svg.style.cssText='position:absolute;pointer-events:none;overflow:hidden';
 svg.innerHTML=`<defs>
 <filter id="rc352-rose" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="1 .025 .20 0 0 .06 .86 .015 0 .012 .025 .10 .72 0 .025 0 0 0 1 0"/></filter>
 <filter id="rc352-brisa" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values=".78 .06 .02 0 .012 .025 .96 .055 0 0 .04 .045 1.03 0 .005 0 0 0 1 0"/></filter>
 </defs>`;
 function scan(root){if(root.nodeType!==1&&root.nodeType!==9)return;if(root.matches?.('img'))normalize(root);root.querySelectorAll('img').forEach(normalize);}
 function stamp(){document.documentElement.dataset.berthaBuild='RC352';document.documentElement.dataset.berthaIndex='RC352';document.querySelectorAll('#rc157IndexBadge').forEach(e=>e.textContent='INDEX · RC352');document.title='BERTH.A · Homologação RC352';}
 const observer=new MutationObserver(rs=>rs.forEach(r=>r.type==='attributes'?normalize(r.target):r.addedNodes.forEach(scan)));
 function start(){document.body.appendChild(svg);scan(document);observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['src']});stamp();}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
 setTimeout(stamp,1400);window.addEventListener('pageshow',()=>{scan(document);stamp();});window.addEventListener('hashchange',()=>setTimeout(stamp,200));document.addEventListener('click',e=>{if(e.target.closest('[data-r147tab]'))setTimeout(stamp,200);},true);
})();
