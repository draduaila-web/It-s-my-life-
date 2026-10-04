/* BERTH.A RC256 — KIDS · TRILHA ESTÁVEL
   Base: RC253 (último estado estável).
   Não carrega RC254 nem RC255.
   Uma única trilha: Bronze > Prata > Ouro > Troféu > Super Troféu.
   Cápsula = prêmio do Super Troféu.
*/
(() => {
'use strict';

const U = {
 neblina:'Neblina', oceano:'Oceano', espaco:'Espaço',
 floresta:'Floresta', solar:'Solar', coral:'Coral'
};
const rewards = [
 ['bronze','Medalha Bronze'],['prata','Medalha Prata'],['ouro','Medalha Ouro'],
 ['trofeu','Troféu'],['super','Super Troféu']
];
const norm = s => (s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
 .toLowerCase().replace(/\s+/g,' ').trim();
const visible = e => {
 if(!e) return false;
 const r=e.getBoundingClientRect(), s=getComputedStyle(e);
 return r.width>0 && r.height>0 && s.display!=='none' && s.visibility!=='hidden';
};

function universeButtons(){
 const wanted = Object.keys(U);
 return [...document.querySelectorAll('button,[role="button"],[role="tab"],div')]
  .filter(visible)
  .filter(e => wanted.includes(norm(e.textContent)));
}

function selectorGroup(){
 const btns = universeButtons();
 if(btns.length < 6) return null;
 let p = btns[0].parentElement;
 for(let i=0;i<5 && p;i++,p=p.parentElement){
   const text=norm(p.innerText);
   if(Object.keys(U).every(u=>text.includes(u)) && p.getBoundingClientRect().height<500) return p;
 }
 return null;
}

function currentUniverse(group){
 const buttons=[...group.querySelectorAll('button,[role="button"],[role="tab"],div')]
   .filter(visible).filter(e=>Object.keys(U).includes(norm(e.textContent)));
 const selected=buttons.find(e =>
   e.getAttribute('aria-selected')==='true' ||
   e.classList.contains('active') || e.classList.contains('selected') ||
   /selected|active|current/i.test(e.getAttribute('class')||'')
 );
 if(selected) return norm(selected.textContent);

 // Fallback visual: selected card commonly has a distinct border/background.
 let best=null, score=-1;
 for(const e of buttons){
   const cs=getComputedStyle(e);
   let s=0;
   if(parseFloat(cs.borderWidth||0)>1) s+=2;
   if(cs.boxShadow && cs.boxShadow!=='none') s+=1;
   if(s>score){score=s;best=e;}
 }
 return best ? norm(best.textContent) : 'neblina';
}

function hideLegacyTrail(){
 const heads=[...document.querySelectorAll('h1,h2,h3,h4,h5,p,div,span')]
   .filter(e=>visible(e) && norm(e.textContent)==='trilha kids');
 for(const h of heads){
   if(h.closest('#rc256-universe-trail')) continue;
   let p=h;
   for(let i=0;i<5 && p.parentElement;i++,p=p.parentElement){
     const t=norm(p.innerText);
     const r=p.getBoundingClientRect();
     if(t.includes('bronze') && t.includes('prata') && t.includes('ouro') &&
        t.includes('super trofeu') && r.width>250 && r.height<900){
       p.style.setProperty('display','none','important');
       break;
     }
   }
 }
}

function render(){
 const group=selectorGroup();
 if(!group) return;

 hideLegacyTrail();

 const u=currentUniverse(group);
 let trail=document.getElementById('rc256-universe-trail');
 if(!trail){
   trail=document.createElement('section');
   trail.id='rc256-universe-trail';
   group.insertAdjacentElement('afterend',trail);
 }
 trail.dataset.universe=u;

 trail.innerHTML=`
   <div class="r256-head">
     <div><small>TRILHA DO UNIVERSO</small><strong>${U[u]}</strong></div>
   </div>
   <div class="r256-track">
     ${rewards.map(([key,label],i)=>`
       <div class="r256-step">
         <img src="rc256_reward_${u}_${key}.jpg" alt="${U[u]} — ${label}">
         <span>${label}</span>
       </div>${i<rewards.length-1?'<i>›</i>':''}
     `).join('')}
   </div>
   <div class="r256-capsule">
     <strong>Super Troféu</strong>
     <span>libera a cápsula do Universo ${U[u]}.</span>
   </div>`;
}

const css=document.createElement('style');
css.textContent=`
#rc256-universe-trail{margin:16px 0 20px;padding:17px 14px;border-radius:24px;
 background:rgba(255,255,255,.72);border:1px solid rgba(108,94,120,.10);
 box-shadow:0 9px 24px rgba(80,65,95,.06);color:#575466;overflow:hidden}
.r256-head small{display:block;font-size:10px;letter-spacing:.18em;opacity:.58}
.r256-head strong{display:block;font-size:20px;font-weight:500;margin-top:4px}
.r256-track{display:flex;align-items:flex-start;gap:5px;overflow-x:auto;padding:16px 0 8px;scrollbar-width:none}
.r256-track::-webkit-scrollbar{display:none}
.r256-step{flex:0 0 94px;text-align:center}
.r256-step img{width:88px;height:88px;display:block;margin:0 auto 7px;object-fit:cover;border-radius:18px}
.r256-step span{display:block;font-size:11px;line-height:1.15}
.r256-track i{font-style:normal;opacity:.28;margin-top:34px;font-size:20px}
.r256-capsule{display:flex;gap:5px;flex-wrap:wrap;margin-top:10px;padding:11px 13px;border-radius:16px;
 background:linear-gradient(110deg,rgba(231,216,255,.58),rgba(255,236,199,.55),rgba(214,241,230,.58));
 font-size:12px;line-height:1.3}
.r256-capsule strong{font-weight:600}
@media(max-width:480px){
 #rc256-universe-trail{padding:15px 12px}
 .r256-step{flex-basis:90px}.r256-step img{width:84px;height:84px}
}`;
document.head.appendChild(css);

// Sem MutationObserver global: evita loops/reparenting e a tela vazia vista na RC255.
document.addEventListener('click', e=>{
 const t=norm(e.target?.textContent);
 if(Object.keys(U).includes(t)) setTimeout(render,80);
}, true);

render();
setTimeout(render,350);
setTimeout(render,900);
setTimeout(render,1800);
})();
