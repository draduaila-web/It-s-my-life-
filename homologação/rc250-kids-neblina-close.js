/* BERTH.A RC250 — FECHAMENTO DO UNIVERSO NEBLINA
   Base: RC247 (estado seguro com pets visíveis)
   Escopo:
   - Biblioteca do Companheiro fora da interface.
   - Cervo: Kit usa os arquivos reais deer_{slot}_{cor}.png.
   - Ursinho: Kit usa os arquivos reais bear_{slot}_{cor}.png.
   - Coelho: pet permanece no tamanho original; somente imagens do Kit aumentam.
   - Nenhuma alteração em Gato, Raposa, Coruja, Owner, Helper ou lógica de pontos.
*/
(function(){
  'use strict';

  const slots = ['head','neck','eyes','back','special'];
  const colors = ['nevoa','coral','misto'];

  const names = {
    deer: 'Cervo de Nuvem',
    bear: 'Ursinho de Bruma',
    rabbit: 'Coelho de Nuvem'
  };

  function norm(s){ return String(s||'').replace(/\s+/g,' ').trim(); }

  function hideLibrary(){
    const leaves = Array.from(document.querySelectorAll('h1,h2,h3,h4,p,span,strong,div'))
      .filter(el => el.children.length===0 && norm(el.textContent).toUpperCase()==='BIBLIOTECA DO COMPANHEIRO');

    leaves.forEach(h=>{
      let el = h;
      for(let i=0; el && i<7; i++, el=el.parentElement){
        const t = norm(el.textContent).toUpperCase();
        if(t.includes('BIBLIOTECA DO COMPANHEIRO') &&
           !t.includes('CONFIGURAÇÃO DO OWNER') &&
           el.querySelectorAll('img').length <= 8){
          el.style.setProperty('display','none','important');
          el.setAttribute('aria-hidden','true');
          break;
        }
      }
    });
  }

  function kitSections(){
    const out=[];
    const candidates=Array.from(document.querySelectorAll('section,article,div'));
    for(const el of candidates){
      const t=norm(el.textContent);
      if(!/KIT DO PET/i.test(t)) continue;
      const count=el.querySelectorAll('img').length;
      if(count<1 || count>20) continue;
      out.push(el);
    }
    // smallest unique sections first
    return out.sort((a,b)=>a.querySelectorAll('*').length-b.querySelectorAll('*').length);
  }

  function findKit(petName){
    return kitSections().find(el => norm(el.textContent).includes(petName)) || null;
  }

  function slotFromText(txt){
    txt = norm(txt).toLowerCase();
    if(/cabeça|cabeca|gorro|boné|bone|tiara|chap[eé]u/.test(txt)) return 'head';
    if(/pescoço|pescoco|coleira|lenço|lenco|bandana/.test(txt)) return 'neck';
    if(/óculos|oculos|visor/.test(txt)) return 'eyes';
    if(/mochila|alforge|costas/.test(txt)) return 'back';
    if(/especial|amuleto|chaveiro|medalha|insígnia|insignia/.test(txt)) return 'special';
    return null;
  }

  function colorFromCard(card){
    const selected = card.querySelector('[aria-pressed="true"],[aria-selected="true"],.selected,.active,[class*="selected"],[class*="active"]');
    const txt = norm(selected?.textContent || card.textContent).toLowerCase();
    if(txt.includes('coral') && !txt.includes('misto')) return 'coral';
    if(txt.includes('misto')) return 'misto';
    return 'nevoa';
  }

  function accessoryCard(img, kit){
    let el=img.parentElement;
    for(let i=0;el && el!==kit && i<6;i++,el=el.parentElement){
      const txt=norm(el.textContent);
      if(slotFromText(txt) && el.querySelectorAll('img').length===1) return el;
    }
    return img.parentElement;
  }

  function wireKit(petKey){
    const kit=findKit(names[petKey]);
    if(!kit) return;

    const imgs=Array.from(kit.querySelectorAll('img'));
    imgs.forEach((img,idx)=>{
      const card=accessoryCard(img,kit);
      const slot=slotFromText(card?.textContent) || slots[Math.min(idx,4)];
      if(!slot) return;

      const apply=()=>{
        const color=colorFromCard(card || kit);
        const wanted=`${petKey}_${slot}_${color}.png`;
        const current=(img.getAttribute('src')||'').split('/').pop();
        if(current!==wanted) img.setAttribute('src',wanted);

        img.style.setProperty('display','block','important');
        img.style.setProperty('visibility','visible','important');
        img.style.setProperty('opacity','1','important');
        img.style.setProperty('object-fit','contain','important');
        img.style.setProperty('object-position','center','important');
      };

      img.addEventListener('error',()=>{
        // If a color-state lookup ever fails, use the confirmed nevoa asset for that slot.
        const fallback=`${petKey}_${slot}_nevoa.png`;
        if(!(img.getAttribute('src')||'').endsWith(fallback)) img.setAttribute('src',fallback);
      });

      apply();

      if(card){
        card.addEventListener('click',()=>setTimeout(apply,30),true);
        card.addEventListener('change',()=>setTimeout(apply,30),true);
      }
    });
  }

  function enlargeRabbitKitOnly(){
    const kit=findKit(names.rabbit);
    if(!kit) return;
    Array.from(kit.querySelectorAll('img')).forEach(img=>{
      img.style.setProperty('display','block','important');
      img.style.setProperty('visibility','visible','important');
      img.style.setProperty('opacity','1','important');
      img.style.setProperty('object-fit','contain','important');
      img.style.setProperty('object-position','center','important');
      img.style.setProperty('transform','scale(1.28)','important');
      img.style.setProperty('transform-origin','50% 50%','important');
    });
  }

  function resetRabbitPet(){
    // Only reset an image in the companion-selection card whose card text is exactly about Coelho.
    const leaves=Array.from(document.querySelectorAll('h1,h2,h3,h4,p,span,strong,div'))
      .filter(el=>el.children.length===0 && norm(el.textContent)===names.rabbit);
    for(const label of leaves){
      let el=label.parentElement;
      for(let i=0;el && i<6;i++,el=el.parentElement){
        if(/KIT DO PET/i.test(norm(el.textContent))) break;
        const imgs=el.querySelectorAll('img');
        if(imgs.length===1){
          const img=imgs[0];
          img.style.removeProperty('transform');
          img.style.removeProperty('scale');
          return;
        }
      }
    }
  }

  function run(){
    hideLibrary();
    resetRabbitPet();
    wireKit('deer');
    wireKit('bear');
    enlargeRabbitKitOnly();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run,{once:true});
  else run();

  window.addEventListener('pageshow',run);
  window.addEventListener('hashchange',()=>setTimeout(run,60));
  document.addEventListener('click',()=>setTimeout(run,100),true);
  document.addEventListener('change',()=>setTimeout(run,100),true);
  [150,400,900,1600,2800].forEach(ms=>setTimeout(run,ms));
})();
