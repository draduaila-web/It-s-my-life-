/* BERTH.A RC243 — KIDS · REPARO DE PETS + BIBLIOTECA
   Escopo cirúrgico:
   - restaura Cervo/Ursinho quando a imagem falha;
   - aumenta Coelho sem tocar em Gato/Coruja/Raposa;
   - repara imagens quebradas da Biblioteca do Companheiro com os SVGs de acessórios
     já existentes no repositório;
   - não altera pontos, ciclos, Owner, Helper, reconhecimentos ou versionamento.
*/
(function(){
  'use strict';

  const PET_FALLBACKS = [
    {re:/\b(cervo|deer)\b/i, src:'kids_neblina_deer_rc207.png'},
    {re:/\b(ursinho|urso|bear)\b/i, src:'kids_neblina_bear_rc207.png'}
  ];

  const ACC_FALLBACKS = [
    {re:/\b(bon[eé]|cap|chap[eé]u)\b/i, src:'accessory_cap.svg'},
    {re:/\b(coleira|colar|collar)\b/i, src:'accessory_collar.svg'},
    {re:/\b([oó]culos|glasses)\b/i, src:'accessory_glasses.svg'},
    {re:/\b(mochila|backpack)\b/i, src:'accessory_backpack.svg'},
    {re:/\b(amuleto|medalha|ins[ií]gnia|badge|especial|special)\b/i, src:'accessory_badge.svg'}
  ];

  function cardText(img){
    const host = img.closest(
      '.r197-acc, .kids-library-card, .kids-companion-card, .companion-card, '+
      '.reward-card, .pet-card, article, li, button, figure, div'
    );
    return (host?.textContent || img.alt || '').trim();
  }

  function safeSet(img, src){
    if(!img || !src) return;
    if(img.dataset.rc243Src === src) return;
    img.dataset.rc243Src = src;
    img.src = src;
    img.decoding = 'async';
    img.loading = 'eager';
    img.style.setProperty('display','block','important');
    img.style.setProperty('opacity','1','important');
    img.style.setProperty('object-fit','contain','important');
    img.style.setProperty('object-position','center','important');
  }

  function repairBroken(img){
    const txt = cardText(img);
    const src = img.getAttribute('src') || '';

    for(const p of PET_FALLBACKS){
      if(p.re.test(txt) || p.re.test(src)){
        safeSet(img,p.src);
        return;
      }
    }

    for(const a of ACC_FALLBACKS){
      if(a.re.test(txt)){
        safeSet(img,a.src);
        return;
      }
    }
  }

  function normalizeRabbit(){
    document.querySelectorAll('img').forEach(img=>{
      const txt = cardText(img);
      const src = img.getAttribute('src') || '';
      if(/\b(coelho|rabbit)\b/i.test(txt+' '+src)){
        img.style.setProperty('transform','scale(1.14)','important');
        img.style.setProperty('transform-origin','50% 55%','important');
        img.style.setProperty('opacity','1','important');
        img.style.setProperty('filter','saturate(1.06) contrast(1.04)','important');
        img.style.setProperty('max-width','96%','important');
        img.style.setProperty('max-height','96%','important');
      }
    });
  }

  function repair(){
    document.querySelectorAll('img').forEach(img=>{
      if(img.complete && img.naturalWidth === 0) repairBroken(img);
      if(!img.dataset.rc243Bound){
        img.dataset.rc243Bound='1';
        img.addEventListener('error',()=>repairBroken(img),{passive:true});
      }
    });
    normalizeRabbit();
  }

  function run(){
    repair();
    [120,350,800,1500].forEach(ms=>setTimeout(repair,ms));
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
})();
