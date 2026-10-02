/* BERTH.A RC254 — KIDS · TRILHA DOS UNIVERSOS
Base integral: RC253.
Progressão oficial: Medalha Bronze → Medalha Prata → Medalha Ouro → Troféu → Super Troféu.
A cápsula é o prêmio do Super Troféu.
Universos: Neblina, Oceano, Espaço, Floresta, Solar e Coral.
*/
(() => {
'use strict';

const U = {
 neblina:{label:'Neblina',icon:'☁',c:'neb'},
 oceano:{label:'Oceano',icon:'≋',c:'oce'},
 espaco:{label:'Espaço',icon:'✦',c:'esp'},
 floresta:{label:'Floresta',icon:'⌁',c:'flo'},
 solar:{label:'Solar',icon:'☀',c:'sol'},
 coral:{label:'Coral',icon:'⌇',c:'cor'}
};
const norm=s=>(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();

function kidsRoot(){
 const els=[...document.querySelectorAll('main,section,article,div')];
 return els.find(e=>{
   const t=norm(e.innerText);
   return t.includes('trilha') && (t.includes('kids')||t.includes('ciclo')) &&
          e.getBoundingClientRect().width>260;
 }) || null;
}
function universe(root){
 const t=norm(root?.innerText||'');
 for(const k of Object.keys(U)) if(t.includes(k)) return k;
 return 'neblina';
}
function item(cls,label,icon){
 return `<div class="r254-item ${cls}"><div class="r254-art"><span>${icon}</span></div><div class="r254-name">${label}</div></div>`;
}
function render(){
 const root=kidsRoot();
 if(!root || root.querySelector('.r254')) return;
 const k=universe(root), u=U[k];
 const box=document.createElement('section');
 box.className=`r254 r254-${u.c}`;
 box.innerHTML=`
 <div class="r254-top"><div><small>TRILHA DO UNIVERSO</small><strong>${u.label}</strong></div><i>${u.icon}</i></div>
 <div class="r254-track">
  ${item('bronze','Medalha Bronze',u.icon)}<b>›</b>
  ${item('prata','Medalha Prata',u.icon)}<b>›</b>
  ${item('ouro','Medalha Ouro',u.icon)}<b>›</b>
  ${item('trofeu','Troféu',u.icon)}<b>›</b>
  ${item('super','Super Troféu',u.icon)}
 </div>
 <div class="r254-cap"><span>${u.icon}</span><div><strong>Super Troféu</strong><br>libera uma cápsula deste universo.</div></div>`;
 const h=[...root.querySelectorAll('h1,h2,h3,h4')].find(e=>norm(e.textContent).includes('trilha'));
 if(h?.parentElement) h.parentElement.insertAdjacentElement('afterend',box); else root.prepend(box);
}
const css=document.createElement('style');
css.textContent=`
.r254{--a:#e8e0ff;--b:#ffdee8;--d:#fff0c4;margin:14px 0 20px;padding:15px 12px;border-radius:23px;
background:linear-gradient(145deg,#fffaf3,#fffdf9 62%,var(--a) 145%);border:1px solid rgba(100,90,110,.09);
box-shadow:0 10px 28px rgba(85,70,95,.07);color:#59576b;overflow:hidden}
.r254-oce{--a:#d9f2f2;--b:#dceaff;--d:#ffe0d3}.r254-esp{--a:#dce0ff;--b:#cfd7ff;--d:#ffdce8}
.r254-flo{--a:#e1efd9;--b:#d8ead7;--d:#ffe1c5}.r254-sol{--a:#fff0bd;--b:#ffd9b9;--d:#ffe9ce}
.r254-cor{--a:#ffd9d5;--b:#d9f1ee;--d:#ffe4d2}
.r254-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}.r254-top small{display:block;font-size:9px;letter-spacing:.16em;opacity:.58}
.r254-top strong{display:block;font-size:18px;font-weight:500;margin-top:2px}.r254-top i{font-style:normal;width:39px;height:39px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(145deg,var(--a),var(--b));font-size:19px}
.r254-track{display:flex;align-items:flex-start;gap:4px;overflow-x:auto;padding:5px 1px 10px;scrollbar-width:none}.r254-track::-webkit-scrollbar{display:none}
.r254-track>b{font-weight:400;opacity:.32;margin-top:23px}.r254-item{flex:0 0 76px;text-align:center}
.r254-art{width:61px;height:61px;margin:auto auto 6px;border-radius:50%;display:grid;place-items:center;border:3px solid rgba(255,255,255,.7);box-shadow:inset 0 3px 7px #fff,0 6px 12px rgba(80,65,95,.12)}
.r254-art span{font-size:23px}.r254-name{font-size:10px;line-height:1.15}.bronze .r254-art{background:linear-gradient(145deg,#ffd4c2,#d99070)}
.prata .r254-art{background:linear-gradient(145deg,#fafbff,#adb9d4)}.ouro .r254-art{background:linear-gradient(145deg,#fff2b6,#e8ad42)}
.trofeu .r254-art{border-radius:20px 20px 25px 25px;background:linear-gradient(145deg,var(--a),var(--d))}
.super .r254-art{width:67px;height:67px;border-radius:22px;background:linear-gradient(145deg,var(--b),var(--a),var(--d));box-shadow:inset 0 3px 8px #fff,0 0 0 2px rgba(255,255,255,.5),0 8px 16px rgba(80,65,95,.14)}
.r254-cap{display:flex;align-items:center;gap:9px;margin-top:5px;padding:9px 11px;border-radius:15px;background:rgba(255,255,255,.58);font-size:11px;line-height:1.3}
.r254-cap>span{width:29px;height:34px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(145deg,var(--a),var(--b),var(--d));box-shadow:inset 0 2px 4px #fff,0 3px 8px rgba(70,60,90,.11)}
.r254-neb .r254-art:after{content:'· ✦ ·';position:absolute;font-size:8px;transform:translateY(34px);opacity:.28}
.r254:not(.r254-neb) .r254-art{border-width:2px}
`;
document.head.appendChild(css);
render();
new MutationObserver(()=>requestAnimationFrame(render)).observe(document.documentElement,{childList:true,subtree:true});
setTimeout(render,400); setTimeout(render,1200);
})();