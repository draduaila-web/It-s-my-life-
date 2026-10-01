/* BERTH.A RC246 — KIDS · DEDUP SEGURO DA BIBLIOTECA
   Parte da RC243 (estado em que o conjunto correto aparecia).
   Remove somente cards QUEBRADOS duplicados dos cinco acessórios do Gato Neblina.
   Nunca oculta containers gerais da biblioteca.
*/
(function(){
  'use strict';

  const LABELS = new Set([
    'bone de bruma',
    'coleira lunar',
    'oculos neblina',
    'mochila eterea',
    'amuleto de bruma'
  ]);

  function norm(s){
    return String(s||'')
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/\s+/g,' ')
      .trim();
  }

  function isBroken(img){
    return !!(img && img.complete && img.naturalWidth === 0);
  }

  function isGood(img){
    return !!(img && img.complete && img.naturalWidth > 2 && img.naturalHeight > 2);
  }

  function exactLabelWithin(el){
    if(!el) return '';
    const nodes = el.querySelectorAll('figcaption,.label,.title,.name,strong,h3,h4,p,span,small');
    for(const n of nodes){
      const t = norm(n.textContent);
      if(LABELS.has(t)) return t;
    }
    const own = norm(el.textContent);
    return LABELS.has(own) ? own : '';
  }

  function smallestSingleImageCard(img){
    let el = img.parentElement;
    for(let depth=0; el && depth<6; depth++, el=el.parentElement){
      const imgs = el.querySelectorAll('img');
      if(imgs.length !== 1) continue;
      const label = exactLabelWithin(el);
      if(label) return {el,label};
    }
    return null;
  }

  function collectGoodLabels(){
    const good = new Set();
    document.querySelectorAll('img').forEach(img=>{
      if(!isGood(img)) return;
      const hit = smallestSingleImageCard(img);
      if(hit) good.add(hit.label);
    });
    return good;
  }

  function clean(){
    const good = collectGoodLabels();

    document.querySelectorAll('img').forEach(img=>{
      if(!isBroken(img)) return;

      const hit = smallestSingleImageCard(img);
      if(!hit) return;
      if(!good.has(hit.label)) return;

      hit.el.style.setProperty('display','none','important');
      hit.el.setAttribute('aria-hidden','true');
      hit.el.dataset.rc246Hidden='1';
    });
  }

  function run(){
    clean();
    [100,300,700,1200,2000].forEach(ms=>setTimeout(clean,ms));
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
