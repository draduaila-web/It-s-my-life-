/* RC351 — Owner recognition emblems only; preserves the existing medal cycle. */
(()=>{'use strict';
 const metrics={"rc351_owner_constancy.webp":{"w":384,"h":384,"b":[24,35,373,351]},"rc351_owner_cycle.webp":{"w":384,"h":384,"b":[47,47,340,342]},"rc351_owner_focus.webp":{"w":384,"h":384,"b":[59,31,341,326]},"rc351_owner_balance.webp":{"w":384,"h":384,"b":[15,13,369,364]},"rc351_owner_goal.webp":{"w":384,"h":384,"b":[25,36,375,343]},"rc351_owner_presence.webp":{"w":384,"h":384,"b":[27,41,357,333]},"rc351_owner_sequence.webp":{"w":384,"h":384,"b":[22,69,363,301]},"rc351_owner_delivery.webp":{"w":384,"h":384,"b":[11,32,379,317]},"rc351_owner_continuity.webp":{"w":384,"h":384,"b":[24,26,364,357]},"rc351_owner_selfcare.webp":{"w":384,"h":384,"b":[29,35,355,339]},"rc351_owner_depth.webp":{"w":384,"h":384,"b":[26,27,358,357]},"rc351_owner_evolution.webp":{"w":384,"h":384,"b":[71,13,318,370]}};
 const legacy={align:'balance',goal:'goal',sequence:'sequence',cycle:'cycle',focus:'focus',presence:'presence'};
 function resolve(src){const name=(src||'').split('?')[0].split('/').pop(),match=name.match(/^owner_(align|goal|sequence|cycle|focus|presence)_v192\.png$/);return match?'./rc351_owner_'+legacy[match[1]]+'.webp?v=351':src;}
 function fit(m,fw,fh){const [l,t,r,b]=m.b,base=Math.min(fw/m.w,fh/m.h),scale=.86*Math.min(fw/(r-l),fh/(b-t))/base;return {scale,x:(m.w/2-(l+r)/2)*base*scale,y:(m.h/2-(t+b)/2)*base*scale};}
 const listening=new WeakSet();
 function normalize(img){
  const raw=img.getAttribute('src')||'',next=resolve(raw),file=next.split('?')[0].split('/').pop(),m=metrics[file];if(!m)return;
  if(next!==raw)img.setAttribute('src',next);
  img.dataset.rc351Artwork='owner';
  if(!listening.has(img)){listening.add(img);img.addEventListener('load',()=>normalize(img));resize?.observe(img);}
  const w=img.clientWidth,h=img.clientHeight;if(!w||!h)return;
  const f=fit(m,w,h),value=`translate(${f.x.toFixed(3)}px,${f.y.toFixed(3)}px) scale(${f.scale.toFixed(6)})`;
  if(img.style.getPropertyValue('transform')!==value||img.style.getPropertyPriority('transform')!=='important')img.style.setProperty('transform',value,'important');
 }
 const resize=typeof ResizeObserver==='function'?new ResizeObserver(es=>es.forEach(e=>normalize(e.target))):null;
 const style=document.createElement('style');style.id='rc351-owner-style';style.textContent=`
 body.bertha-hml::before{content:"HML · RC351"!important}
 img[data-rc351-artwork="owner"]{object-fit:contain!important;object-position:50% 50%!important;transform-origin:center!important;background:transparent!important;border-radius:0!important}
 `;document.head.appendChild(style);
 function scan(root){if(root.nodeType!==1&&root.nodeType!==9)return;if(root.matches?.('img'))normalize(root);root.querySelectorAll('img').forEach(normalize);}
 function stamp(){document.documentElement.dataset.berthaBuild='RC351';document.documentElement.dataset.berthaIndex='RC351';document.querySelectorAll('#rc157IndexBadge').forEach(e=>e.textContent='INDEX · RC351');document.title='BERTH.A · Homologação RC351';}
 const observer=new MutationObserver(rs=>rs.forEach(r=>r.type==='attributes'?normalize(r.target):r.addedNodes.forEach(scan)));
 function start(){scan(document);observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['src']});stamp();}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
 setTimeout(stamp,1300);window.addEventListener('pageshow',()=>{scan(document);stamp();});window.addEventListener('hashchange',()=>setTimeout(stamp,150));document.addEventListener('click',e=>{if(e.target.closest('[data-r147tab]'))setTimeout(stamp,150);},true);
})();
