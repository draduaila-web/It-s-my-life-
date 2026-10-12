/* RC353 — universal satellite avatars; presentation only. */
(()=>{'use strict';
 const metrics={"rc353_avatar_man.webp":{"w":384,"h":384,"b":[45,18,339,371]},"rc353_avatar_woman.webp":{"w":384,"h":384,"b":[46,15,342,371]},"rc353_avatar_romantic_m.webp":{"w":384,"h":384,"b":[46,19,348,367]},"rc353_avatar_romantic_f.webp":{"w":384,"h":384,"b":[20,18,375,365]},"rc353_avatar_boy.webp":{"w":384,"h":384,"b":[69,19,315,370]},"rc353_avatar_girl.webp":{"w":384,"h":384,"b":[26,16,365,366]}};
 function resolve(src){const name=(src||'').split('?')[0].split('/').pop(),m=name.match(/^satellite_avatar_(man|woman|romantic_m|romantic_f|boy|girl)_v189\.png$/);return m?'./rc353_avatar_'+m[1]+'.webp?v=353':src;}
 function fit(m,w,h){const [l,t,r,b]=m.b,base=Math.min(w/m.w,h/m.h),scale=.88*Math.min(w/(r-l),h/(b-t))/base;return {scale,x:(m.w/2-(l+r)/2)*base*scale,y:(m.h/2-(t+b)/2)*base*scale};}
 const listening=new WeakSet();
 function normalize(img){const raw=img.getAttribute('src')||'',next=resolve(raw),file=next.split('?')[0].split('/').pop(),m=metrics[file];if(!m)return;if(next!==raw)img.setAttribute('src',next);img.dataset.rc353Avatar='1';if(!listening.has(img)){listening.add(img);img.addEventListener('load',()=>normalize(img));resize?.observe(img);}const w=img.clientWidth,h=img.clientHeight;if(!w||!h)return;const f=fit(m,w,h),value=`translate(${f.x.toFixed(3)}px,${f.y.toFixed(3)}px) scale(${f.scale.toFixed(6)})`;if(img.style.getPropertyValue('transform')!==value||img.style.getPropertyPriority('transform')!=='important')img.style.setProperty('transform',value,'important');}
 const resize=typeof ResizeObserver==='function'?new ResizeObserver(es=>es.forEach(e=>normalize(e.target))):null;
 const style=document.createElement('style');style.id='rc353-satellite-avatar-style';style.textContent=`
 body.bertha-hml::before{content:"HML · RC361"!important}
 img[data-rc353-avatar]{object-fit:contain!important;object-position:50% 50%!important;transform-origin:center!important;background:transparent!important;border-radius:0!important;filter:none!important}
 `;document.head.appendChild(style);
 function stamp(){document.documentElement.dataset.berthaBuild='RC361';document.documentElement.dataset.berthaIndex='RC361';document.querySelectorAll('#rc157IndexBadge').forEach(e=>{if(e.textContent!=='INDEX · RC361')e.textContent='INDEX · RC361';});if(document.title!=='BERTH.A · Homologação RC361')document.title='BERTH.A · Homologação RC361';}
 let badge=null,badgeObserver=null;
 function watchBadge(){const next=document.querySelector('#rc157IndexBadge');if(next===badge)return;badgeObserver?.disconnect();badge=next;if(badge){badgeObserver=new MutationObserver(stamp);badgeObserver.observe(badge,{subtree:true,childList:true,characterData:true});stamp();}}
 function scan(root){if(root.nodeType!==1&&root.nodeType!==9)return;if(root.matches?.('img'))normalize(root);root.querySelectorAll('img').forEach(normalize);}
 const observer=new MutationObserver(rs=>{rs.forEach(r=>r.type==='attributes'?normalize(r.target):r.addedNodes.forEach(scan));watchBadge();});
 function start(){scan(document);observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['src']});watchBadge();stamp();}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
 setTimeout(stamp,1500);window.addEventListener('pageshow',()=>{scan(document);watchBadge();stamp();});window.addEventListener('hashchange',()=>setTimeout(stamp,300));document.addEventListener('click',e=>{if(e.target.closest('[data-r147tab]'))setTimeout(stamp,300);},true);
})();
