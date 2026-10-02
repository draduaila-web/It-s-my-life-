/* BERTH.A RC255 — KIDS · TRILHA COMPLETA
Base: RC254.
Corrige posição + aplica os 30 assets aprovados (6 universos x 5 conquistas).
*/
(() => {
'use strict';
const N=s=>(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
const universes=['neblina','oceano','espaco','floresta','solar','coral'];
const labels={neblina:'Neblina',oceano:'Oceano',espaco:'Espaço',floresta:'Floresta',solar:'Solar',coral:'Coral'};
const rewards=['bronze','prata','ouro','trofeu','super'];

function vis(e){if(!e)return false;const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden';}
function trail(){return document.querySelector('.r254');}

function kidsRegion(){
 const els=[...document.querySelectorAll('section,article,div,main')].filter(vis);
 return els.find(e=>{
   const t=N(e.innerText);
   return t.includes('kids')&&t.includes('trilha por colecao')&&e.getBoundingClientRect().width>250&&e.getBoundingClientRect().height>80;
 }) || els.find(e=>{
   const t=N(e.innerText);
   return t.includes('ciclo')&&(t.includes('universo')||t.includes('colecao'))&&e.getBoundingClientRect().width>250&&e.getBoundingClientRect().height<innerHeight*1.7;
 }) || null;
}
function currentUniverse(region){
 const t=N(region?.innerText||'');
 // Prefer exact visible selector labels.
 const exact=[...region.querySelectorAll('button,[role=button],[role=tab],label,option,span,div')].filter(vis).find(e=>{
   const x=N(e.textContent);
   return universes.includes(x) && (
     e.getAttribute('aria-selected')==='true' || e.classList.contains('active') ||
     e.classList.contains('selected') || e.matches('option:checked')
   );
 });
 if(exact) return N(exact.textContent);
 for(const u of universes) if(t.includes(u)) return u;
 return 'neblina';
}
function universeAnchor(region,u){
 const nodes=[...region.querySelectorAll('button,[role=button],[role=tab],label,span,h1,h2,h3,h4,div')].filter(vis);
 const n=nodes.find(e=>N(e.textContent)===u);
 if(!n)return null;
 let p=n;
 for(let i=0;i<3&&p.parentElement;i++){
   const h=p.getBoundingClientRect().height;
   if(h>45&&h<280)return p;
   p=p.parentElement;
 }
 return n;
}
function applyAssets(tr,u){
 tr.className=tr.className.replace(/\br254-(neb|oce|esp|flo|sol|cor)\b/g,'').trim();
 const cls={neblina:'neb',oceano:'oce',espaco:'esp',floresta:'flo',solar:'sol',coral:'cor'}[u];
 tr.classList.add('r254-'+cls,'r255-placed');
 const title=tr.querySelector('.r254-top strong');
 if(title)title.textContent=labels[u];

 const cards=[...tr.querySelectorAll('.r254-item')];
 cards.slice(0,5).forEach((card,i)=>{
   const art=card.querySelector('.r254-art');
   if(!art)return;
   let im=art.querySelector('img.r255-reward-img');
   if(!im){
     art.innerHTML='';
     im=document.createElement('img');
     im.className='r255-reward-img';
     art.appendChild(im);
   }
   im.src=`rc255_assets/reward_${u}_${rewards[i]}_rc255.jpg`;
   im.alt=`${labels[u]} — ${['Medalha Bronze','Medalha Prata','Medalha Ouro','Troféu','Super Troféu'][i]}`;
 }
 );
 // Cápsula é consequência do Super Troféu, não uma sexta conquista na trilha.
 const note=tr.querySelector('.r254-cap');
 if(note) note.innerHTML=`<div><strong>Super Troféu</strong><br>Ao concluir o ciclo, libera a cápsula do Universo ${labels[u]}.</div>`;
}
function place(){
 const tr=trail(); if(!tr)return;
 const region=kidsRegion();
 if(!region){tr.style.display='none';return;}
 const u=currentUniverse(region);
 applyAssets(tr,u);
 tr.style.display='';
 const anchor=universeAnchor(region,u);
 if(anchor) anchor.insertAdjacentElement('afterend',tr);
 else{
   const children=[...region.children].filter(vis);
   const config=children.find(e=>{const t=N(e.innerText);return t.includes('universo')||t.includes('colecao')||t.includes('ciclo');});
   if(config)config.insertAdjacentElement('afterend',tr); else region.appendChild(tr);
 }
}
const css=document.createElement('style');
css.textContent=`
body>.r254,main>.r254:first-child{display:none!important}
.r254.r255-placed{display:block!important;margin:16px 0 18px!important}
.r255-placed .r254-art{width:76px!important;height:76px!important;border:0!important;background:none!important;box-shadow:none!important;border-radius:18px!important;overflow:hidden!important}
.r255-placed .r254-item.super .r254-art{width:82px!important;height:82px!important}
.r255-reward-img{width:100%!important;height:100%!important;display:block!important;object-fit:cover!important;border-radius:18px!important}
.r255-placed .r254-art:after{display:none!important}
.r255-placed .r254-cap{padding:10px 12px!important;margin-top:8px!important}
`;
document.head.appendChild(css);
const run=()=>requestAnimationFrame(place);
run();
new MutationObserver(run).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style','aria-selected']});
setTimeout(run,350);setTimeout(run,1000);setTimeout(run,1800);
})();