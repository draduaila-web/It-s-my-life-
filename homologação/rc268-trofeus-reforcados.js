/* BERTH.A RC268 — troféus transparentes reforçados; cápsula congelada */
(function(){
  if(document.getElementById('rc268-trophy-assets')) return;

  const map={mist:'neblina',neblina:'neblina',ocean:'oceano',oceano:'oceano',
    space:'espaco',espaco:'espaco',forest:'floresta',floresta:'floresta',
    solar:'solar',coral:'coral'};

  function currentTheme(){
    const a=document.querySelector('[data-theme].active,[data-theme][aria-selected="true"],[data-collection].active,[data-collection][aria-selected="true"]');
    let t=a&&(a.dataset.theme||a.dataset.collection);
    if(t) return map[t]||'neblina';
    const txt=(document.body.innerText||'').toLowerCase();
    if(txt.includes('oceano')) return 'oceano';
    if(txt.includes('espaço')||txt.includes('espaco')) return 'espaco';
    if(txt.includes('floresta')) return 'floresta';
    if(txt.includes('solar')) return 'solar';
    if(txt.includes('coral')) return 'coral';
    return 'neblina';
  }

  function apply(){
    const trail=document.querySelector('.rc258-trail');
    if(!trail) return;
    const steps=trail.querySelectorAll('.r197-step');
    if(steps.length<5) return;
    const t=currentTheme();

    [[3,'trofeu'],[4,'super']].forEach(([i,k])=>{
      const art=steps[i].querySelector('.rc258-reward-art');
      const img=art&&art.querySelector('img');
      if(!art||!img) return;
      img.src=`rc268_reward_${t}_${k}.png`;

      art.style.setProperty('background','transparent','important');
      art.style.setProperty('overflow','visible','important');
      art.style.setProperty('width','100%','important');
      art.style.setProperty('max-width','94px','important');
      art.style.setProperty('aspect-ratio','1 / 1','important');
      art.style.setProperty('margin','0 auto 6px','important');

      img.style.setProperty('display','block','important');
      img.style.setProperty('width','100%','important');
      img.style.setProperty('height','100%','important');
      img.style.setProperty('object-fit','contain','important');
      img.style.setProperty('object-position','center center','important');
      img.style.setProperty('transform','none','important');
      img.style.setProperty('background','transparent','important');
      img.style.setProperty('margin','0','important');
      img.style.setProperty('padding','0','important');
    });
  }

  const s=document.createElement('style');
  s.id='rc268-trophy-assets';
  s.textContent=`
    .rc258-trail .r197-step:nth-child(4),
    .rc258-trail .r197-step:nth-child(5){overflow:visible!important}
    .rc258-trail .r197-step:nth-child(4) .rc258-reward-art,
    .rc258-trail .r197-step:nth-child(5) .rc258-reward-art{
      background:transparent!important;overflow:visible!important
    }
    @media(max-width:390px){
      .rc258-trail .r197-step:nth-child(4) .rc258-reward-art,
      .rc258-trail .r197-step:nth-child(5) .rc258-reward-art{max-width:88px!important}
    }`;
  document.head.appendChild(s);

  apply();
  new MutationObserver(apply).observe(document.body,{childList:true,subtree:true});
  document.addEventListener('click',()=>setTimeout(apply,50),true);
  setTimeout(apply,300); setTimeout(apply,1000);
})();