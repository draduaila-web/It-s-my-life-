/* BERTH.A RC253 — KIDS · AJUSTE DE ESCALA DOS ACESSÓRIOS
   Base deliberada: RC250 (antes da regressão RC251).
   Regra central: NUNCA tocar na grade de seleção dos companheiros.
*/
(function(){
'use strict';

const PETS={
  deer:{name:'Cervo de Nuvem',prefix:'deer'},
  bear:{name:'Ursinho de Bruma',prefix:'bear'},
  rabbit:{name:'Coelho de Nuvem',prefix:'rabbit'}
};
const ORDER=['head','neck','eyes','back','special'];
const RX={
  head:/cabe[cç]a|gorro|tiara|bon[eé]|chap[eé]u/i,
  neck:/pesco[cç]o|coleira|len[cç]o|bandana/i,
  eyes:/olhos|[oó]culos|visor/i,
  back:/corpo\s*\/?\s*costas|costas|bolsa|mochila|alforge/i,
  special:/especial|amuleto|medalha|ins[ií]gnia|chaveiro/i
};
function norm(s){return String(s||'').replace(/\s+/g,' ').trim()}

/* Localiza PRIMEIRO o título KIT DO PET e só então o bloco imediatamente associado.
   Não usa mais o nome do pet para subir pela árvore da página. */
function kitRoot(){
  const headings=[...document.querySelectorAll('h1,h2,h3,h4,h5,p,span,strong,div')]
    .filter(el=>el.children.length===0 && norm(el.textContent).toUpperCase()==='KIT DO PET');

  for(const h of headings){
    let x=h.parentElement;
    for(let i=0;x && i<5;i++,x=x.parentElement){
      const t=norm(x.textContent).toUpperCase();
      if(!t.includes('KIT DO PET')) continue;
      // proteção absoluta: um kit nunca pode conter a grade dos 6 companheiros.
      const companionHits=['GATO NEBLINA','COELHO DE NUVEM','RAPOSA NEBLINA','CORUJINHA LUNAR','CERVO DE NUVEM','URSINHO DE BRUMA']
        .filter(n=>t.includes(n)).length;
      if(companionHits<=1 && x.querySelectorAll('img').length>=1 && x.querySelectorAll('img').length<=8) return x;
    }
  }
  return null;
}

function currentPet(kit){
  const t=norm(kit.textContent);
  for(const [key,p] of Object.entries(PETS)) if(t.includes(p.name)) return key;
  return null;
}

function slotFrom(card,idx){
  const t=norm(card?.textContent);
  for(const slot of ORDER) if(RX[slot].test(t)) return slot;
  return ORDER[idx]||null;
}

function cardFor(img,kit){
  let x=img.parentElement;
  for(let i=0;x && x!==kit && i<6;i++,x=x.parentElement){
    if(ORDER.some(s=>RX[s].test(norm(x.textContent)))) return x;
  }
  return img.parentElement;
}

function colorFrom(card){
  const buttons=[...card.querySelectorAll('button,[role="button"],[aria-pressed],[aria-selected]')];
  const selected=buttons.find(b=>
    b.getAttribute('aria-pressed')==='true' ||
    b.getAttribute('aria-selected')==='true' ||
    /\b(selected|active)\b/i.test(b.className||'')
  );
  const t=norm(selected?.textContent||'').toLowerCase();
  if(t.includes('coral')) return 'coral';
  if(t.includes('misto')) return 'misto';
  return 'nevoa';
}

function fixDeerBear(kit,key){
  const prefix=PETS[key].prefix;
  const imgs=[...kit.querySelectorAll('img')].slice(0,5);

  imgs.forEach((img,idx)=>{
    const card=cardFor(img,kit);
    const slot=slotFrom(card,idx);
    if(!slot) return;

    function apply(){
      const src=`${prefix}_${slot}_${colorFrom(card)}.png`;
      img.setAttribute('src',src);
      img.removeAttribute('srcset');
      img.style.setProperty('display','block','important');
      img.style.setProperty('width','132px','important');
      img.style.setProperty('height','132px','important');
      img.style.setProperty('max-width','132px','important');
      img.style.setProperty('max-height','132px','important');
      img.style.setProperty('margin','0 auto','important');
      img.style.setProperty('object-fit','contain','important');
      img.style.setProperty('object-position','center','important');
      img.style.setProperty('opacity','1','important');
      img.style.setProperty('visibility','visible','important');
      img.style.setProperty('background','transparent','important');
      img.style.setProperty('transform','scale(1.35)','important');
      img.style.setProperty('transform-origin','center center','important');
    }
    img.onerror=()=>{
      const fb=`${prefix}_${slot}_nevoa.png`;
      if(!(img.getAttribute('src')||'').endsWith(fb)) img.setAttribute('src',fb);
    };
    apply();
    card?.addEventListener('click',()=>setTimeout(apply,60),true);
    card?.addEventListener('change',()=>setTimeout(apply,60),true);
  });
}

function enlargeRabbitKit(kit){
  [...kit.querySelectorAll('img')].slice(0,5).forEach(img=>{
    // Somente a imagem dentro do Kit. Nenhum transform é aplicado fora de kitRoot().
    img.style.setProperty('width','132px','important');
    img.style.setProperty('height','132px','important');
    img.style.setProperty('max-width','132px','important');
    img.style.setProperty('max-height','132px','important');
    img.style.setProperty('margin','0 auto','important');
    img.style.setProperty('object-fit','contain','important');
    img.style.setProperty('opacity','1','important');
    img.style.setProperty('visibility','visible','important');
    img.style.setProperty('transform','scale(1.35)','important');
    img.style.setProperty('transform-origin','center center','important');
  });
}

function hideLibrary(){
  [...document.querySelectorAll('h1,h2,h3,h4,p,span,strong,div')].forEach(h=>{
    if(h.children.length || norm(h.textContent).toUpperCase()!=='BIBLIOTECA DO COMPANHEIRO') return;
    const section=h.closest('section,article,[class*="library"]');
    if(section) section.style.setProperty('display','none','important');
  });
}

function run(){
  hideLibrary();
  const kit=kitRoot();
  if(!kit) return;
  const key=currentPet(kit);
  if(key==='deer'||key==='bear') fixDeerBear(kit,key);
  if(key==='rabbit') enlargeRabbitKit(kit);
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run,{once:true}); else run();
window.addEventListener('pageshow',run);
window.addEventListener('hashchange',()=>setTimeout(run,80));
document.addEventListener('click',()=>setTimeout(run,120),true);
document.addEventListener('change',()=>setTimeout(run,120),true);
[180,500,1000,1800,3000].forEach(t=>setTimeout(run,t));
})();