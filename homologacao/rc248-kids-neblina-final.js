/* BERTH.A RC248 — KIDS · FECHAMENTO DO UNIVERSO NEBLINA
   Escopo fechado:
   1) remove visualmente apenas "Biblioteca do Companheiro";
   2) aumenta o pet Coelho de Nuvem;
   3) garante Cervo de Nuvem e Ursinho de Bruma com os assets já homologados;
   4) não altera kits, cores, pontos, ciclos, Owner, Helper, reconhecimentos ou outros pets.
*/
(function(){
  'use strict';

  const PETS = {
    rabbit: {
      re: /^coelho de nuvem$/i,
      scale: 1.20
    },
    deer: {
      re: /^cervo de nuvem$/i,
      fallback: 'kids_neblina_deer_rc207.png',
      scale: 1.00
    },
    bear: {
      re: /^ursinho de bruma$/i,
      fallback: 'kids_neblina_bear_rc207.png',
      scale: 1.00
    }
  };

  function norm(s){
    return String(s || '')
      .replace(/\s+/g,' ')
      .trim();
  }

  function exactTextElements(re){
    return Array.from(document.querySelectorAll('h1,h2,h3,h4,strong,p,span,div'))
      .filter(el => el.children.length === 0 && re.test(norm(el.textContent)));
  }

  function singleImageCardFromLabel(labelEl){
    let el = labelEl?.parentElement;
    for(let depth=0; el && depth<7; depth++, el=el.parentElement){
      const imgs = el.querySelectorAll('img');
      if(imgs.length === 1) return {card:el,img:imgs[0]};
    }
    return null;
  }

  function removeCompanionLibraries(){
    const headings = Array.from(document.querySelectorAll('*')).filter(el=>{
      if(el.children.length) return false;
      return norm(el.textContent).toUpperCase() === 'BIBLIOTECA DO COMPANHEIRO';
    });

    headings.forEach(h=>{
      const host =
        h.closest('section') ||
        h.closest('article') ||
        h.closest('.card') ||
        h.closest('[class*="library"]') ||
        h.parentElement?.parentElement ||
        h.parentElement;

      if(host && host.dataset.rc248LibraryHidden !== '1'){
        host.dataset.rc248LibraryHidden = '1';
        host.style.setProperty('display','none','important');
        host.setAttribute('aria-hidden','true');
      }
    });
  }

  function fixPet(def){
    const labels = exactTextElements(def.re);
    for(const label of labels){
      const hit = singleImageCardFromLabel(label);
      if(!hit) continue;

      const {card,img} = hit;

      // evita confundir o card do pet com "Kit do Pet", que possui vários acessórios
      if(card.querySelectorAll('img').length !== 1) continue;

      img.style.setProperty('display','block','important');
      img.style.setProperty('opacity','1','important');
      img.style.setProperty('object-fit','contain','important');
      img.style.setProperty('object-position','center','important');
      img.style.setProperty('transform',`scale(${def.scale || 1})`,'important');
      img.style.setProperty('transform-origin','50% 55%','important');

      if(def.fallback){
        const repair = ()=>{
          if(img.complete && img.naturalWidth === 0){
            if(!img.src.endsWith(def.fallback)) img.src = def.fallback;
          }
        };
        img.addEventListener('error',()=>{
          if(!img.src.endsWith(def.fallback)) img.src = def.fallback;
        },{once:false});
        repair();
      }
    }
  }

  function run(){
    removeCompanionLibraries();
    fixPet(PETS.rabbit);
    fixPet(PETS.deer);
    fixPet(PETS.bear);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded',run,{once:true});
  }else{
    run();
  }

  window.addEventListener('pageshow',run);
  window.addEventListener('hashchange',()=>setTimeout(run,40));
  document.addEventListener('click',()=>setTimeout(run,80),true);
  document.addEventListener('change',()=>setTimeout(run,80),true);

  [120,350,800,1500,2600].forEach(ms=>setTimeout(run,ms));
})();
