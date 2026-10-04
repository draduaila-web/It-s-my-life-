/* BERTH.A RC245 — KIDS · REMOÇÃO ROBUSTA DE BIBLIOTECA DUPLICADA QUEBRADA
   O bloco correto permanece. Só remove o card quebrado quando já existe outro card
   com o mesmo rótulo e imagem válida na página.
*/
(function(){
  'use strict';

  function norm(s){
    return String(s||'')
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/\s+/g,' ')
      .trim();
  }

  function good(img){
    return !!(img && img.complete && img.naturalWidth > 2 && img.naturalHeight > 2);
  }

  function broken(img){
    return !!(img && img.complete && img.naturalWidth === 0);
  }

  function textNodes(el){
    const out=[];
    if(!el) return out;
    for(const n of el.querySelectorAll('figcaption,.label,.title,.name,strong,h3,h4,p,span,small')){
      const t=norm(n.textContent);
      if(t && t.length <= 90) out.push(t);
    }
    return out;
  }

  function ancestors(img){
    const arr=[];
    let el=img?.parentElement;
    for(let i=0;el && i<6;i++,el=el.parentElement){
      arr.push(el);
    }
    return arr;
  }

  function bestCard(img){
    const an=ancestors(img);
    for(const el of an){
      const labels=textNodes(el);
      if(labels.length && labels.length <= 6) return el;
    }
    return an[0] || null;
  }

  function labelOf(card){
    const labels=textNodes(card);
    if(!labels.length) return '';
    // prioriza o menor texto legível do card (normalmente o nome do acessório)
    return labels
      .filter(t=>t.length>=3)
      .sort((a,b)=>a.length-b.length)[0] || '';
  }

  function buildGoodLabels(){
    const set=new Set();
    document.querySelectorAll('img').forEach(img=>{
      if(!good(img)) return;
      const card=bestCard(img);
      const label=labelOf(card);
      if(label) set.add(label);
    });
    return set;
  }

  function clean(){
    const goodLabels=buildGoodLabels();

    document.querySelectorAll('img').forEach(img=>{
      if(!broken(img)) return;

      const card=bestCard(img);
      if(!card || card.dataset.rc245Hidden==='1') return;

      const label=labelOf(card);
      if(label && goodLabels.has(label)){
        card.dataset.rc245Hidden='1';
        card.style.setProperty('display','none','important');
        card.setAttribute('aria-hidden','true');
      }
    });

    // segunda passada: se sobrou um container quebrado com um dos cinco nomes já válidos,
    // sobe até o menor ancestral que contém só um acessório e o remove.
    const validLabels=buildGoodLabels();
    document.querySelectorAll('img').forEach(img=>{
      if(!broken(img)) return;
      let el=img.parentElement;
      for(let depth=0; el && depth<7; depth++,el=el.parentElement){
        const txt=norm(el.textContent);
        const matched=[...validLabels].find(l=>l && txt===l);
        if(matched){
          el.style.setProperty('display','none','important');
          el.setAttribute('aria-hidden','true');
          break;
        }
      }
    });
  }

  function run(){
    clean();
    [80,220,500,900,1500,2400].forEach(ms=>setTimeout(clean,ms));
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',run,{once:true});
  }else{
    run();
  }

  window.addEventListener('pageshow',run);
  window.addEventListener('hashchange',()=>setTimeout(run,40));
  document.addEventListener('click',()=>setTimeout(run,80),true);
  document.addEventListener('change',()=>setTimeout(run,80),true);

  const mo=new MutationObserver(()=>requestAnimationFrame(clean));
  mo.observe(document.documentElement,{subtree:true,childList:true});
})();
