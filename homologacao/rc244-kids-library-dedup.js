/* BERTH.A RC244 — KIDS · LIMPEZA DE DUPLICATAS QUEBRADAS DA BIBLIOTECA
   Remove somente cards duplicados com imagem quebrada quando já existe,
   na mesma biblioteca, um card equivalente com imagem válida.
   Não altera os cards válidos, pets, pontos, ciclos, Owner, Helper ou badges.
*/
(function(){
  'use strict';

  function normalize(s){
    return String(s||'')
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/\s+/g,' ')
      .trim();
  }

  function cardFor(img){
    return img.closest(
      '.r197-acc, .kids-library-card, .kids-companion-card, .companion-card, '+
      '.reward-card, .pet-card, article, li, figure, button, .card, div'
    );
  }

  function cardLabel(card){
    if(!card) return '';
    const candidates = card.querySelectorAll(
      'figcaption, .label, .title, .name, strong, h3, h4, p, span'
    );
    for(const el of candidates){
      const t = normalize(el.textContent);
      if(t && t.length <= 80) return t;
    }
    return normalize(card.textContent).slice(0,80);
  }

  function isGood(img){
    return !!(img && img.complete && img.naturalWidth > 1 && img.naturalHeight > 1);
  }

  function clean(){
    const imgs = Array.from(document.querySelectorAll('img'));
    const goodByLabel = new Map();

    for(const img of imgs){
      if(!isGood(img)) continue;
      const card = cardFor(img);
      const label = cardLabel(card);
      if(label && !goodByLabel.has(label)) goodByLabel.set(label, card);
    }

    for(const img of imgs){
      if(isGood(img)) continue;
      const card = cardFor(img);
      if(!card || card.dataset.rc244Hidden==='1') continue;

      const label = cardLabel(card);
      const good = label ? goodByLabel.get(label) : null;

      if(good && good !== card){
        card.dataset.rc244Hidden='1';
        card.style.setProperty('display','none','important');
        card.setAttribute('aria-hidden','true');
      }
    }
  }

  function run(){
    clean();
    [100,300,700,1400].forEach(ms=>setTimeout(clean,ms));
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',run,{once:true});
  }else{
    run();
  }

  window.addEventListener('pageshow',run);
  window.addEventListener('hashchange',()=>setTimeout(run,50));
  document.addEventListener('click',()=>setTimeout(run,100),true);
  document.addEventListener('change',()=>setTimeout(run,100),true);
})();
