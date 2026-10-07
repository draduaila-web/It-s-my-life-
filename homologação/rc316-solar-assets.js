/* BERTH.A RC326 — Solar: aplica os assets existentes após todo o runtime legado.
   Escopo: somente pets, acessórios e cápsula Solar. Não toca medalhas/troféus. */
(()=>{
  'use strict';
  const V='326';
  const PETS=[
    ['Leão','lion'],
    ['Fênix','phoenix'],
    ['Dragão solar','dragon'],
    ['Lagarto','lizard'],
    ['Criatura mística brilhante','mystic'],
    ['Abelha','bee']
  ];
  const variantSuffix={nevoa:'', 'névoa':'', coral:'_coral', misto:'_misto'};

  const norm=s=>(s||'').replace(/\s+/g,' ').trim();
  const leafs=(root=document)=>[...root.querySelectorAll('*')].filter(e=>e.children.length===0);

  function exactLeaves(root,text){
    return leafs(root).filter(e=>norm(e.textContent)===text);
  }

  function ancestor(el,pred,max=14){
    let p=el;
    for(let i=0;p&&i<max;i++,p=p.parentElement){
      try{ if(pred(p)) return p; }catch{}
    }
    return null;
  }

  function styleAsset(img,kind){
    if(!img) return;
    img.dataset.berthaSolar326=kind;
    img.style.setProperty('object-fit','contain','important');
    img.style.setProperty('object-position','center center','important');
    img.style.setProperty('background','transparent','important');
    img.style.setProperty('box-shadow','none','important');
    img.style.setProperty('border-radius','0','important');
    img.style.setProperty('padding','0','important');
    img.style.setProperty('transform','none','important');
  }

  function setPetCard(label,key){
    const hits=exactLeaves(document,label);
    for(const hit of hits){
      const card=ancestor(hit,p=>{
        const t=norm(p.textContent);
        if(t.includes('KIT DO PET')) return false;
        if(!p.querySelector?.('img')) return false;
        // A pet card should not contain names of several Solar pets.
        let n=0;
        for(const [lab] of PETS) if(t.includes(lab)) n++;
        return n===1;
      },10);
      if(!card) continue;
      const img=card.querySelector('img');
      if(!img) continue;
      img.src=`rc316_solar_${key}.png?v=${V}`;
      img.alt=label;
      styleAsset(img,'pet');
      img.style.setProperty('width','88%','important');
      img.style.setProperty('height','78%','important');
      img.style.setProperty('max-width','235px','important');
      img.style.setProperty('max-height','235px','important');
      return true;
    }
    return false;
  }

  function findKit(label){
    const hits=exactLeaves(document,label);
    for(const hit of hits){
      const kit=ancestor(hit,p=>{
        const t=norm(p.textContent);
        return t.includes('KIT DO PET') &&
               t.includes(label) &&
               t.includes('Névoa') &&
               t.includes('Coral') &&
               t.includes('Misto') &&
               p.querySelectorAll?.('img').length>=5;
      },14);
      if(kit) return kit;
    }
    // fallback: any smallest element whose text identifies this pet's kit
    const all=[...document.querySelectorAll('*')].filter(p=>{
      const t=norm(p.textContent);
      return t.includes('KIT DO PET') && t.includes(label) &&
             t.includes('Névoa') && t.includes('Coral') && t.includes('Misto') &&
             p.querySelectorAll?.('img').length>=5;
    });
    all.sort((a,b)=>(a.textContent||'').length-(b.textContent||'').length);
    return all[0]||null;
  }

  function cardForImage(img,kit){
    return ancestor(img,p=>{
      if(p===kit) return false;
      const t=norm(p.textContent);
      return t.includes('Névoa') && t.includes('Coral') && t.includes('Misto');
    },8);
  }

  function accessoryCards(kit){
    if(!kit) return [];
    const cards=[];
    for(const img of kit.querySelectorAll('img')){
      const c=cardForImage(img,kit);
      if(c && !cards.includes(c)) cards.push(c);
    }
    return cards.slice(0,5);
  }

  function activeVariant(card){
    const v=card.dataset.berthaSolarVariant;
    if(v) return v;
    // Read existing app selection when present.
    for(const el of card.querySelectorAll('*')){
      const txt=norm(el.textContent).toLowerCase();
      if(!(txt in variantSuffix)) continue;
      const cs=getComputedStyle(el);
      const selected=el.getAttribute('aria-selected')==='true' ||
                     el.classList.contains('active') ||
                     el.classList.contains('selected') ||
                     parseFloat(cs.borderWidth||'0')>=2;
      if(selected) return txt;
    }
    return 'névoa';
  }

  function setKit(label,key){
    const kit=findKit(label);
    if(!kit) return false;
    const cards=accessoryCards(kit);
    if(cards.length<5) return false;
    cards.forEach((card,i)=>{
      const variant=activeVariant(card);
      const suffix=variantSuffix[variant] ?? '';
      const img=card.querySelector('img');
      if(!img) return;
      img.src=`rc316_solar_${key}_acc${i+1}${suffix}.png?v=${V}`;
      styleAsset(img,'accessory');
      img.style.setProperty('width','84%','important');
      img.style.setProperty('height','84%','important');
      img.style.setProperty('max-width','220px','important');
      img.style.setProperty('max-height','220px','important');
      card.dataset.berthaSolarPet=key;
      card.dataset.berthaSolarSlot=String(i+1);
    });
    return true;
  }

  function setSolarCapsule(){
    // Do not touch reward/trophy images. Target only the capsule reward card.
    for(const el of exactLeaves(document,'Prêmio do Super Troféu: cápsula')){
      const reward=ancestor(el,p=>{
        const t=norm(p.textContent);
        return t.includes('Prêmio do Super Troféu: cápsula') &&
               t.includes('A cápsula é liberada junto com o Super Troféu.') &&
               p.querySelector?.('img');
      },8);
      if(!reward) continue;

      // Ensure this reward block belongs to Solar by checking a nearby ancestor.
      const solarBlock=ancestor(reward,p=>{
        const t=norm(p.textContent);
        return t.includes('Solar') &&
               t.includes('Bronze') &&
               t.includes('Prata') &&
               t.includes('Ouro') &&
               t.includes('Troféu');
      },8);
      if(!solarBlock) continue;

      const imgs=[...reward.querySelectorAll('img')];
      if(!imgs.length) continue;
      const img=imgs[imgs.length-1];
      img.src=`rc316_capsule_solar.png?v=${V}`;
      styleAsset(img,'capsule');
      img.style.setProperty('width','112px','important');
      img.style.setProperty('height','112px','important');
      img.style.setProperty('max-width','112px','important');
      img.style.setProperty('max-height','112px','important');
      return true;
    }
    return false;
  }

  function apply(){
    for(const [label,key] of PETS){
      setPetCard(label,key);
      setKit(label,key);
    }
    setSolarCapsule();
    document.documentElement.dataset.berthaSolarAssets='RC326';
  }

  // Capture variation clicks and immediately swap only that accessory.
  document.addEventListener('click',ev=>{
    const target=ev.target?.closest?.('*');
    if(!target) return;
    const txt=norm(target.textContent).toLowerCase();
    if(!(txt in variantSuffix)) return;

    const card=ancestor(target,p=>p.dataset?.berthaSolarPet && p.dataset?.berthaSolarSlot,8);
    if(!card) return;
    card.dataset.berthaSolarVariant=txt;
    const key=card.dataset.berthaSolarPet;
    const slot=card.dataset.berthaSolarSlot;
    const img=card.querySelector('img');
    if(img){
      img.src=`rc316_solar_${key}_acc${slot}${variantSuffix[txt]}.png?v=${V}`;
      styleAsset(img,'accessory');
    }
    setTimeout(apply,30);
  },true);

  // Reapply after the older renderer finishes or redraws the page.
  let timer=null;
  const schedule=()=>{
    clearTimeout(timer);
    timer=setTimeout(apply,40);
  };
  new MutationObserver(schedule).observe(document.documentElement,{
    subtree:true, childList:true
  });

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',apply,{once:true});
  }else apply();

  addEventListener('pageshow',apply);
  [120,350,700,1200,2000,3200,5000].forEach(ms=>setTimeout(apply,ms));
})();
