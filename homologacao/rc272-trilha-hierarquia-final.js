/* BERTH.A RC272 — hierarquia final da trilha */
(function(){
  if(document.getElementById('rc272-style')) return;
  const norm=s=>(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const aliases={neblina:'neblina',mist:'neblina',oceano:'oceano',ocean:'oceano',espaco:'espaco',space:'espaco',floresta:'floresta',forest:'floresta',solar:'solar',coral:'coral'};
  function universe(trail){
    let box=trail.closest('section,article,[class*="card"]')||trail.parentElement, t=norm(box?.textContent);
    for(const [k,v] of Object.entries(aliases)) if(t.includes(k)) return v;
    return 'neblina';
  }
  function labelNode(step){ return step ? step.lastElementChild : null; }
  function apply(){
    const trail=document.querySelector('.rc258-trail'); if(!trail) return;
    const s=[...trail.querySelectorAll('.r197-step')]; if(s.length<5) return;
    trail.classList.add('rc272-linear');
    const u=universe(trail);
    ['bronze','prata','ouro'].forEach((m,i)=>{const im=s[i].querySelector('img'); if(im) im.src=`rc271_reward_${u}_${m}.png`;});
    const t=s[3].querySelector('img'), st=s[4].querySelector('img');
    if(t)t.src=`rc268_reward_${u}_trofeu.png`;
    if(st)st.src=`rc268_reward_${u}_super.png`;
    // Progression order is Bronze, Silver, Gold, Trophy, Super Trophy.
    s.forEach(x=>x.style.removeProperty('order'));
    const labs=['Bronze','Prata','Ouro','Troféu','Super'];
    s.slice(0,5).forEach((step,i)=>{ const l=labelNode(step); if(l) l.textContent=labs[i]; });
    if(!trail.querySelector('.rc272-group-medals')){
      const a=document.createElement('div'); a.className='rc272-group-label rc272-group-medals'; a.textContent='MEDALHAS';
      const b=document.createElement('div'); b.className='rc272-group-label rc272-group-trophies'; b.textContent='TROFÉUS';
      trail.append(a,b);
    }
  }
  const st=document.createElement('style'); st.id='rc272-style'; st.textContent=`
  .rc258-trail.rc272-linear{position:relative!important;display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;grid-template-rows:22px 96px!important;align-items:end!important;gap:0 5px!important;width:100%!important;box-sizing:border-box!important;padding:14px 10px 12px!important;background:rgba(255,255,255,.9)!important;border:1px solid rgba(112,90,119,.07)!important;border-radius:22px!important;overflow:hidden!important;box-shadow:0 8px 24px rgba(75,58,69,.03)!important}
  .rc258-trail.rc272-linear .rc272-group-label{grid-row:1!important;align-self:start!important;text-align:center!important;font-size:10px!important;line-height:1!important;letter-spacing:.18em!important;font-weight:600!important;color:rgba(79,70,84,.58)!important;pointer-events:none!important}
  .rc258-trail.rc272-linear .rc272-group-medals{grid-column:1/4!important}.rc258-trail.rc272-linear .rc272-group-trophies{grid-column:4/6!important}
  .rc258-trail.rc272-linear .r197-step{grid-row:2!important;min-width:0!important;width:auto!important;margin:0!important;padding:0!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:flex-end!important;background:none!important;border:0!important;outline:0!important;box-shadow:none!important;overflow:visible!important}
  .rc258-trail.rc272-linear .r197-step:nth-child(1){grid-column:1!important}.rc258-trail.rc272-linear .r197-step:nth-child(2){grid-column:2!important}.rc258-trail.rc272-linear .r197-step:nth-child(3){grid-column:3!important}.rc258-trail.rc272-linear .r197-step:nth-child(4){grid-column:4!important}.rc258-trail.rc272-linear .r197-step:nth-child(5){grid-column:5!important}
  .rc258-trail.rc272-linear .rc258-reward-art{display:flex!important;align-items:flex-end!important;justify-content:center!important;margin:0 auto 5px!important;padding:0!important;background:none!important;border:0!important;outline:0!important;box-shadow:none!important;overflow:visible!important}
  .rc258-trail.rc272-linear .rc258-reward-art:before,.rc258-trail.rc272-linear .rc258-reward-art:after{display:none!important;content:none!important}
  .rc258-trail.rc272-linear .rc258-reward-art img{display:block!important;object-fit:contain!important;object-position:center bottom!important;margin:auto!important;padding:0!important;background:transparent!important;border:0!important;outline:0!important;box-shadow:none!important;transform:none!important}
  .rc258-trail.rc272-linear .r197-step:nth-child(-n+3) .rc258-reward-art,.rc258-trail.rc272-linear .r197-step:nth-child(-n+3) img{width:40px!important;height:50px!important;max-width:40px!important;max-height:50px!important}
  .rc258-trail.rc272-linear .r197-step:nth-child(4) .rc258-reward-art,.rc258-trail.rc272-linear .r197-step:nth-child(4) img{width:70px!important;height:70px!important;max-width:70px!important;max-height:70px!important}
  .rc258-trail.rc272-linear .r197-step:nth-child(5) .rc258-reward-art,.rc258-trail.rc272-linear .r197-step:nth-child(5) img{width:82px!important;height:76px!important;max-width:82px!important;max-height:76px!important}
  .rc258-trail.rc272-linear .r197-step>*:last-child{text-align:center!important;font-size:11px!important;line-height:1.05!important;white-space:nowrap!important}
  @media(max-width:390px){.rc258-trail.rc272-linear{gap:0 3px!important;padding-left:7px!important;padding-right:7px!important}.rc258-trail.rc272-linear .r197-step:nth-child(-n+3) .rc258-reward-art,.rc258-trail.rc272-linear .r197-step:nth-child(-n+3) img{width:37px!important;max-width:37px!important}.rc258-trail.rc272-linear .r197-step:nth-child(4) .rc258-reward-art,.rc258-trail.rc272-linear .r197-step:nth-child(4) img{width:66px!important;max-width:66px!important}.rc258-trail.rc272-linear .r197-step:nth-child(5) .rc258-reward-art,.rc258-trail.rc272-linear .r197-step:nth-child(5) img{width:76px!important;max-width:76px!important}}
  `; document.head.appendChild(st);
  apply(); new MutationObserver(apply).observe(document.body,{childList:true,subtree:true}); document.addEventListener('click',()=>setTimeout(apply,60),true); setTimeout(apply,300);setTimeout(apply,1000);
})();
