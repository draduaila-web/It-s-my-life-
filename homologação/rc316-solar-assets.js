/* BERTH.A RC316 — Universo Solar */
(()=>{
 const V='321';
 const pets={
 'Leão':'lion','Fênix':'phoenix','Dragão solar':'dragon','Lagarto':'lizard','Criatura mística brilhante':'mystic','Abelha':'bee'};
 const names={lion:['Coroa solar','Colar aurora','Capa do amanhecer','Visor solar','Cetro de luz'],phoenix:['Halo de fogo','Asas aurora','Manto de plumas','Órbita solar','Faixa de luz'],dragon:['Chapéu orbital','Colar estelar','Mochila solar','Luneta de plasma','Asas de luz'],lizard:['Visor térmico','Lenço solar','Mochila de exploração','Anel orbital','Luneta solar'],mystic:['Tiara radiante','Manto prismático','Halo celeste','Varinha solar','Órbita mística'],bee:['Chapéu de sol','Óculos de néctar','Capa luminosa','Mochila de pólen','Lenço aurora']};
 const slots=['Cabeça','Pescoço','Corpo / costas','Olhos','Especial'];
 const petSrc=k=>`rc316_solar_${k}.png?v=${V}`;
 const accSrc=(k,i,v)=>`rc316_solar_${k}_acc${i}${v===1?'_coral':v===2?'_misto':''}.png?v=${V}`;
 function exact(root,txt){return [...root.querySelectorAll('*')].find(e=>e.children.length===0&&e.textContent.trim()===txt)}
 function card(el){let p=el;for(let i=0;p&&i<10;i++,p=p.parentElement){const r=p.getBoundingClientRect?.();if(r&&r.width>120&&r.height>150&&r.width<500&&p.querySelector?.('img'))return p}return el.parentElement}
 function petCardForLabel(label){
   const hits=[...document.querySelectorAll('*')].filter(e=>e.children.length===0&&e.textContent.trim()===label);
   for(const e of hits){let p=e;for(let i=0;p&&i<10;i++,p=p.parentElement){const r=p.getBoundingClientRect?.();const im=p.querySelector?.('img');if(im&&r&&r.width>120&&r.width<430&&r.height>180&&r.height<650)return p}}
   return null;
 }
 function setImg(c,src,cls){let im=c.querySelector('img');if(!im){im=document.createElement('img');c.prepend(im)} im.src=src;im.classList.add(cls);im.style.cssText+='object-fit:contain!important;object-position:center!important;width:90%!important;height:90%!important;background:transparent!important;';}
 function fixPets(){for(const [label,key] of Object.entries(pets)){const c=petCardForLabel(label);if(!c)continue;setImg(c,petSrc(key),'rc316-solar-pet');const im=c.querySelector('img');if(im){im.alt=label;im.style.setProperty('width','82%','important');im.style.setProperty('height','72%','important');im.style.setProperty('max-width','230px','important');im.style.setProperty('max-height','230px','important');im.style.setProperty('object-fit','contain','important');im.style.setProperty('object-position','center','important');im.style.setProperty('background','transparent','important');im.style.setProperty('border-radius','0','important');}}
 }
 function fixKits(){for(const [label,key] of Object.entries(pets)){const heads=[...document.querySelectorAll('*')].filter(e=>e.children.length===0&&e.textContent.trim()===label);for(const h of heads){let sec=h;for(let n=0;sec&&n<8;n++,sec=sec.parentElement){if((sec.textContent||'').includes('KIT DO PET'))break}if(!sec)continue;let cards=[...sec.querySelectorAll('img')].map(im=>card(im)).filter((x,i,a)=>x&&a.indexOf(x)===i&&x!==card(h));cards=cards.filter(c=>!c.textContent.includes(label)).slice(0,5);cards.forEach((c,j)=>{let v=Number(c.dataset.v||0);setImg(c,accSrc(key,j+1,v),'rc316-solar-acc'); const texts=[...c.querySelectorAll('*')].filter(e=>e.children.length===0);const title=texts.find(e=>/Cabeça|Pescoço|Corpo|Olhos|Especial/.test(c.textContent)&&e.textContent.trim().length>2); if(title&&names[key][j]) title.textContent=names[key][j];});}}
 }
 function fixCaps(){document.querySelectorAll('img').forEach(im=>{const s=(im.src+' '+im.alt).toLowerCase();if(s.includes('capsul')&&s.includes('solar')){im.src='rc316_capsule_solar.png?v='+V;im.style.cssText+='object-fit:contain!important;object-position:center!important;background:transparent!important;border-radius:0!important;box-shadow:none!important;transform:none!important;'}})}
 function all(){fixPets();fixKits();fixCaps()}
 new MutationObserver(()=>requestAnimationFrame(all)).observe(document.documentElement,{subtree:true,childList:true});
 document.addEventListener('click',()=>setTimeout(all,20),true); if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',all,{once:true});else all();setTimeout(all,500);setTimeout(all,1500);
})();