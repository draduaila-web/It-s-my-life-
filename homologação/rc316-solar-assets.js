/* BERTH.A RC325 — Solar: assets no padrão validado, sem alterar trilha/troféus */
(()=>{
  'use strict';
  const V='325';
  const PETS={
    'Leão':'lion',
    'Fênix':'phoenix',
    'Dragão solar':'dragon',
    'Lagarto':'lizard',
    'Criatura mística brilhante':'mystic',
    'Abelha':'bee'
  };

  const petSrc=(key)=>`rc316_solar_${key}.png?v=${V}`;
  const accSrc=(key,i,variant)=>{
    const suffix=variant===1?'_coral':variant===2?'_misto':'';
    return `rc316_solar_${key}_acc${i}${suffix}.png?v=${V}`;
  };

  const leaves=(root=document)=>[...root.querySelectorAll('*')].filter(e=>e.children.length===0);
  const exact=(root,text)=>leaves(root).filter(e=>e.textContent.trim()===text);

  function smallestAncestor(start,predicate,max=12){
    let p=start;
    for(let i=0;p&&i<max;i++,p=p.parentElement){
      if(predicate(p)) return p;
    }
    return null;
  }

  function solarCollection(){
    const solarLabels=exact(document,'Solar');
    for(const el of solarLabels){
      const sec=smallestAncestor(el,p=>{
        const t=p.textContent||'';
        return t.includes('COLEÇÃO 05') && t.includes('Leão') && t.includes('Fênix') && t.includes('Abelha');
      });
      if(sec) return sec;
    }
    return null;
  }

  function petCard(section,label){
    if(!section) return null;
    for(const el of exact(section,label)){
      const c=smallestAncestor(el,p=>{
        if(!p.querySelector?.('img')) return false;
        const r=p.getBoundingClientRect?.();
        return !!r && r.width>=120 && r.width<=430 && r.height>=160 && r.height<=650;
      },10);
      if(c) return c;
    }
    return null;
  }

  function setImage(card,src,kind){
    if(!card) return null;
    let img=card.querySelector('img');
    if(!img){
      img=document.createElement('img');
      card.prepend(img);
    }
    img.src=src;
    img.dataset.berthaSolar=kind;
    img.style.setProperty('object-fit','contain','important');
    img.style.setProperty('object-position','center center','important');
    img.style.setProperty('background','transparent','important');
    img.style.setProperty('border-radius','0','important');
    img.style.setProperty('box-shadow','none','important');
    img.style.setProperty('padding','0','important');
    img.style.setProperty('margin','0 auto','important');
    return img;
  }

  function fixPets(){
    const section=solarCollection();
    if(!section) return;
    for(const [label,key] of Object.entries(PETS)){
      const c=petCard(section,label);
      const img=setImage(c,petSrc(key),'pet');
      if(!img) continue;
      img.alt=label;
      img.style.setProperty('width','82%','important');
      img.style.setProperty('height','72%','important');
      img.style.setProperty('max-width','230px','important');
      img.style.setProperty('max-height','230px','important');
    }
  }

  function kitSection(label){
    for(const h of exact(document,label)){
      const sec=smallestAncestor(h,p=>{
        const t=p.textContent||'';
        return t.includes('KIT DO PET') && t.includes(label) && t.includes('5 acessórios');
      },12);
      if(sec) return sec;
    }
    return null;
  }

  function cardFromImage(img,section){
    let p=img;
    for(let i=0;p&&p!==section&&i<10;i++,p=p.parentElement){
      const r=p.getBoundingClientRect?.();
      if(r&&r.width>=120&&r.width<=430&&r.height>=180&&r.height<=700) return p;
    }
    return null;
  }

  function accessoryCards(section){
    if(!section) return [];
    const seen=[];
    for(const img of section.querySelectorAll('img')){
      const c=cardFromImage(img,section);
      if(!c || seen.includes(c)) continue;
      const t=c.textContent||'';
      if(/Medalha|Troféu|Prêmio do Super/.test(t)) continue;
      seen.push(c);
    }
    return seen.slice(0,5);
  }

  function selectedVariant(card){
    const raw=Number(card?.dataset?.v||0);
    return (raw===1 || raw===2) ? raw : 0;
  }

  function fixKits(){
    for(const [label,key] of Object.entries(PETS)){
      const sec=kitSection(label);
      if(!sec) continue;
      accessoryCards(sec).forEach((card,index)=>{
        const img=setImage(card,accSrc(key,index+1,selectedVariant(card)),'accessory');
        if(!img) return;
        img.style.setProperty('width','86%','important');
        img.style.setProperty('height','86%','important');
        img.style.setProperty('max-width','220px','important');
        img.style.setProperty('max-height','220px','important');
      });
    }
  }

  function fixSolarCapsule(){
    for(const el of leaves(document)){
      if(el.textContent.trim()!=='Prêmio do Super Troféu: cápsula') continue;
      const reward=smallestAncestor(el,p=>{
        const t=p.textContent||'';
        return t.includes('Prêmio do Super Troféu: cápsula') && !!p.querySelector?.('img');
      },8);
      if(!reward) continue;

      // Only act on the Solar reward block.
      const parent=smallestAncestor(reward,p=>{
        const t=p.textContent||'';
        return t.includes('Solar') && t.includes('Medalha Bronze') && t.includes('Super Troféu');
      },8);
      if(!parent) continue;

      const img=reward.querySelector('img');
      if(!img) continue;
      img.src=`rc316_capsule_solar.png?v=${V}`;
      img.dataset.berthaSolar='capsule';
      img.style.setProperty('object-fit','contain','important');
      img.style.setProperty('object-position','center center','important');
      img.style.setProperty('background','transparent','important');
      img.style.setProperty('border-radius','0','important');
      img.style.setProperty('box-shadow','none','important');
      img.style.setProperty('padding','0','important');
      img.style.setProperty('transform','none','important');
    }
  }

  function apply(){
    fixPets();
    fixKits();
    fixSolarCapsule();
  }

  let queued=false;
  const queue=()=>{
    if(queued) return;
    queued=true;
    requestAnimationFrame(()=>{queued=false;apply();});
  };

  const mo=new MutationObserver(queue);
  mo.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['data-v']});
  document.addEventListener('click',()=>setTimeout(apply,20),true);
  addEventListener('pageshow',apply);
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',apply,{once:true}); else apply();
  setTimeout(apply,250);
  setTimeout(apply,900);
  document.documentElement.dataset.berthaSolarAssets='RC325';
})();
