/* BERTH.A RC257 — âncora exata da trilha; base RC256 */
(()=>{'use strict';
const N=s=>(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
const U=['neblina','oceano','espaco','floresta','solar','coral'];
const V=e=>{if(!e)return false;const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden'};

function card(){
 const els=[...document.querySelectorAll('section,article,div')].filter(V);
 const label=els.find(e=>['kids · trilha por colecao','kids trilha por colecao'].includes(N(e.textContent)));
 if(label){
  let p=label.parentElement;
  for(let i=0;i<6&&p;i++,p=p.parentElement){
   const t=N(p.innerText),r=p.getBoundingClientRect();
   if(t.includes('trilha por colecao')&&U.every(u=>t.includes(u))&&r.width>280&&r.height>250)return p;
  }
 }
 return els.find(e=>{const t=N(e.innerText),r=e.getBoundingClientRect();return t.includes('trilha por colecao')&&U.every(u=>t.includes(u))&&r.width>280&&r.height>250&&r.height<1800})||null;
}
function grid(c){
 const m=[...c.querySelectorAll('div,section,nav')].filter(V).filter(e=>{
  const t=N(e.innerText),r=e.getBoundingClientRect();
  return U.every(u=>t.includes(u))&&r.width>250&&r.height>90&&r.height<500;
 });
 m.sort((a,b)=>a.getBoundingClientRect().height-b.getBoundingClientRect().height);
 return m[0]||null;
}
function hideLegacy(){
 const hs=[...document.querySelectorAll('div,section,article,h1,h2,h3,h4,p,span')].filter(V).filter(e=>N(e.textContent)==='trilha kids');
 for(const h of hs){
  if(h.closest('#rc256-universe-trail'))continue;
  let p=h.parentElement;
  for(let i=0;i<6&&p;i++,p=p.parentElement){
   const t=N(p.innerText),r=p.getBoundingClientRect();
   if(t.includes('bronze')&&t.includes('prata')&&t.includes('ouro')&&t.includes('super trofeu')&&r.width>280&&r.height>180&&r.height<1000){
    p.style.setProperty('display','none','important');p.dataset.rc257Legacy='1';break;
   }
  }
 }
}
function place(){
 const c=card(),tr=document.getElementById('rc256-universe-trail');if(!c||!tr)return;
 const g=grid(c);if(!g)return;
 g.insertAdjacentElement('afterend',tr);
 tr.style.setProperty('display','block','important');tr.classList.add('rc257-positioned');
 hideLegacy();
}
const st=document.createElement('style');
st.textContent='#rc256-universe-trail.rc257-positioned{display:block!important;margin:16px 0 20px!important}[data-rc257-legacy="1"]{display:none!important}';
document.head.appendChild(st);
[0,250,700,1400,2400].forEach(ms=>setTimeout(place,ms));
document.addEventListener('click',e=>{if(U.includes(N(e.target?.textContent)))setTimeout(place,120)},true);
})();