/* BERTH.A RC249 — KIDS · CORREÇÃO CIRÚRGICA NEBLINA
   Corrige o erro da RC248:
   - NÃO aumenta o pet Coelho;
   - aumenta somente as artes dos acessórios dentro do Kit do Coelho;
   - reforça a exibição dos kits de Cervo e Ursinho;
   - remove visualmente apenas "Biblioteca do Companheiro";
   - não religa scripts antigos de biblioteca.
*/
(function(){
  'use strict';

  const PET_NAMES = {
    rabbit: /coelho de nuvem/i,
    deer: /cervo de nuvem/i,
    bear: /ursinho de bruma/i
  };

  function norm(s){
    return String(s||'').replace(/\s+/g,' ').trim();
  }

  function leafText(re){
    return Array.from(document.querySelectorAll('h1,h2,h3,h4,strong,p,span,div'))
      .find(el => el.children.length===0 && re.test(norm(el.textContent)));
  }

  function hideCompanionLibrary(){
    Array.from(document.querySelectorAll('*')).forEach(el=>{
      if(el.children.length) return;
      if(norm(el.textContent).toUpperCase()!=='BIBLIOTECA DO COMPANHEIRO') return;

      const host =
        el.closest('section') ||
        el.closest('article') ||
        el.closest('.card') ||
        el.closest('[class*="library"]') ||
        el.parentElement?.parentElement;

      if(host){
        host.style.setProperty('display','none','important');
        host.setAttribute('aria-hidden','true');
      }
    });
  }

  function petCardFor(nameRe){
    const label = leafText(nameRe);
    if(!label) return null;

    let el=label.parentElement;
    for(let i=0;el && i<7;i++,el=el.parentElement){
      const imgs=el.querySelectorAll('img');
      if(imgs.length===1) return {card:el,img:imgs[0]};
    }
    return null;
  }

  function resetRabbitPet(){
    const hit=petCardFor(PET_NAMES.rabbit);
    if(!hit) return;
    const img=hit.img;
    img.style.setProperty('transform','none','important');
    img.style.setProperty('scale','1','important');
    img.style.setProperty('opacity','1','important');
    img.style.setProperty('max-width','100%','important');
    img.style.setProperty('max-height','100%','important');
  }

  function findKitFor(nameRe){
    const petLabel = leafText(nameRe);
    if(!petLabel) return null;

    // procura o menor ancestral do pet que também contenha o título "Kit do Pet"
    let scope=petLabel.parentElement;
    for(let i=0;scope && i<9;i++,scope=scope.parentElement){
      const txt=norm(scope.textContent);
      if(/kit do pet/i.test(txt)) break;
    }

    // fallback: procura a seção de kit mais próxima na página.
    const roots = scope ? [scope, document] : [document];
    for(const root of roots){
      const heads=Array.from(root.querySelectorAll('h1,h2,h3,h4,strong,p,span,div'))
        .filter(el=>el.children.length===0 && /kit do pet/i.test(norm(el.textContent)));
      for(const h of heads){
        const section =
          h.closest('section') ||
          h.closest('article') ||
          h.closest('.card') ||
          h.parentElement?.parentElement ||
          h.parentElement;
        if(section) return section;
      }
    }
    return null;
  }

  function enlargeRabbitKit(){
    const kit=findKitFor(PET_NAMES.rabbit);
    if(!kit) return;

    kit.querySelectorAll('img').forEach(img=>{
      img.style.setProperty('display','block','important');
      img.style.setProperty('opacity','1','important');
      img.style.setProperty('transform','scale(1.18)','important');
      img.style.setProperty('transform-origin','50% 52%','important');
      img.style.setProperty('max-width','92%','important');
      img.style.setProperty('max-height','92%','important');
      img.style.setProperty('object-fit','contain','important');
      img.style.setProperty('filter','saturate(1.06) contrast(1.04)','important');
    });
  }

  function normalizeKit(nameRe){
    const kit=findKitFor(nameRe);
    if(!kit) return;

    kit.style.removeProperty('display');
    kit.style.setProperty('visibility','visible','important');
    kit.style.setProperty('opacity','1','important');

    kit.querySelectorAll('img').forEach(img=>{
      img.style.setProperty('display','block','important');
      img.style.setProperty('visibility','visible','important');
      img.style.setProperty('opacity','1','important');
      img.style.setProperty('object-fit','contain','important');
      img.style.setProperty('object-position','center','important');
      img.style.setProperty('transform','none','important');
    });
  }

  function run(){
    hideCompanionLibrary();
    resetRabbitPet();
    enlargeRabbitKit();
    normalizeKit(PET_NAMES.deer);
    normalizeKit(PET_NAMES.bear);
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',run,{once:true});
  }else{
    run();
  }

  window.addEventListener('pageshow',run);
  window.addEventListener('hashchange',()=>setTimeout(run,50));
  document.addEventListener('click',()=>setTimeout(run,90),true);
  document.addEventListener('change',()=>setTimeout(run,90),true);
  [120,350,800,1500,2600].forEach(ms=>setTimeout(run,ms));
})();
