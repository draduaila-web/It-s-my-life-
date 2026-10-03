/* BERTH.A RC270 — trilha final: medalhas sem fundo + hierarquia correta */
(function(){
  if (document.getElementById('rc270-trail-final')) return;

  const aliases = {
    neblina:'neblina', mist:'neblina',
    oceano:'oceano', ocean:'oceano',
    espaco:'espaco', space:'espaco',
    floresta:'floresta', forest:'floresta',
    solar:'solar', coral:'coral'
  };
  const norm = s => (s||'').toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'').trim();

  function getUniverse(trail){
    const scope = trail.closest('section,article,[class*="card"]') || trail.parentElement;
    const headings = [...scope.querySelectorAll('h1,h2,h3,h4,[class*="title"],[class*="universe"]')];
    for (const el of headings){
      const n = norm(el.textContent);
      for (const [k,v] of Object.entries(aliases)){
        if (n === k || n.includes(k)) return v;
      }
    }
    const t = norm(scope.textContent);
    for (const [k,v] of Object.entries(aliases)){
      if (t.includes(k)) return v;
    }
    return 'neblina';
  }

  function apply(){
    const trail = document.querySelector('.rc258-trail');
    if (!trail) return;
    const steps = [...trail.querySelectorAll('.r197-step')];
    if (steps.length < 5) return;

    trail.classList.add('rc270-final-trail');

    // Correct order is preserved by DOM:
    // Bronze, Silver, Gold, Trophy, Super Trophy.
    const u = getUniverse(trail);
    [[3,'trofeu'],[4,'super']].forEach(([i,type]) => {
      const img = steps[i].querySelector('.rc258-reward-art img');
      if (img) {
        const src = `rc268_reward_${u}_${type}.png`;
        if (!img.getAttribute('src')?.endsWith(src)) img.setAttribute('src', src);
      }
    });
  }

  const style = document.createElement('style');
  style.id = 'rc270-trail-final';
  style.textContent = `
    .rc258-trail.rc270-final-trail{
      display:grid!important;
      grid-template-columns:repeat(5,minmax(0,1fr))!important;
      gap:2px!important;
      align-items:end!important;
      background:rgba(255,255,255,.84)!important;
      border:1px solid rgba(112,90,119,.07)!important;
      border-radius:22px!important;
      padding:16px 7px 12px!important;
      overflow:visible!important;
      box-shadow:0 8px 24px rgba(75,58,69,.03)!important;
    }

    .rc258-trail.rc270-final-trail .r197-step{
      min-width:0!important;
      width:auto!important;
      margin:0!important;
      padding:0!important;
      background:transparent!important;
      background-color:transparent!important;
      background-image:none!important;
      border:0!important;
      outline:0!important;
      box-shadow:none!important;
      border-radius:0!important;
      overflow:visible!important;
      display:flex!important;
      flex-direction:column!important;
      align-items:center!important;
      justify-content:flex-end!important;
    }

    /* No individual square/background behind ANY reward. */
    .rc258-trail.rc270-final-trail .rc258-reward-art,
    .rc258-trail.rc270-final-trail .rc258-reward-art::before,
    .rc258-trail.rc270-final-trail .rc258-reward-art::after{
      background:transparent!important;
      background-color:transparent!important;
      background-image:none!important;
      border:0!important;
      outline:0!important;
      box-shadow:none!important;
      border-radius:0!important;
    }

    .rc258-trail.rc270-final-trail .rc258-reward-art{
      overflow:visible!important;
      display:flex!important;
      align-items:center!important;
      justify-content:center!important;
      margin:0 auto 7px!important;
      padding:0!important;
      position:relative!important;
    }

    /* Medals stay deliberately small in Owner overview. */
    .rc258-trail.rc270-final-trail .r197-step:nth-child(-n+3) .rc258-reward-art{
      width:48px!important;height:60px!important;max-width:48px!important;
    }
    .rc258-trail.rc270-final-trail .r197-step:nth-child(-n+3) .rc258-reward-art img{
      width:48px!important;height:60px!important;max-width:48px!important;max-height:60px!important;
      object-fit:contain!important;object-position:center!important;
      transform:none!important;border:0!important;outline:0!important;box-shadow:none!important;
      background:transparent!important;
    }

    /* Trophy is clearly larger than medals. */
    .rc258-trail.rc270-final-trail .r197-step:nth-child(4) .rc258-reward-art{
      width:80px!important;height:82px!important;max-width:80px!important;
    }
    .rc258-trail.rc270-final-trail .r197-step:nth-child(4) .rc258-reward-art img{
      width:80px!important;height:82px!important;max-width:80px!important;max-height:82px!important;
      object-fit:contain!important;object-position:center!important;
      transform:none!important;border:0!important;outline:0!important;box-shadow:none!important;
      background:transparent!important;
    }

    /* Super Trophy is the largest achievement. */
    .rc258-trail.rc270-final-trail .r197-step:nth-child(5) .rc258-reward-art{
      width:92px!important;height:88px!important;max-width:92px!important;
    }
    .rc258-trail.rc270-final-trail .r197-step:nth-child(5) .rc258-reward-art img{
      width:92px!important;height:88px!important;max-width:92px!important;max-height:88px!important;
      object-fit:contain!important;object-position:center!important;
      transform:none!important;border:0!important;outline:0!important;box-shadow:none!important;
      background:transparent!important;
    }

    /* Active state: subtle glow only, never a square. */
    .rc258-trail.rc270-final-trail .r197-step.active .rc258-reward-art,
    .rc258-trail.rc270-final-trail .r197-step.is-active .rc258-reward-art,
    .rc258-trail.rc270-final-trail .r197-step[aria-current="true"] .rc258-reward-art{
      filter:drop-shadow(0 0 7px rgba(181,154,211,.24))!important;
    }

    .rc258-trail.rc270-final-trail .r197-step > :last-child{
      text-align:center!important;
    }

    @media(max-width:390px){
      .rc258-trail.rc270-final-trail{gap:1px!important;padding-left:4px!important;padding-right:4px!important}
      .rc258-trail.rc270-final-trail .r197-step:nth-child(-n+3) .rc258-reward-art,
      .rc258-trail.rc270-final-trail .r197-step:nth-child(-n+3) .rc258-reward-art img{
        width:45px!important;max-width:45px!important;
      }
      .rc258-trail.rc270-final-trail .r197-step:nth-child(4) .rc258-reward-art,
      .rc258-trail.rc270-final-trail .r197-step:nth-child(4) .rc258-reward-art img{
        width:74px!important;max-width:74px!important;
      }
      .rc258-trail.rc270-final-trail .r197-step:nth-child(5) .rc258-reward-art,
      .rc258-trail.rc270-final-trail .r197-step:nth-child(5) .rc258-reward-art img{
        width:84px!important;max-width:84px!important;
      }
    }
  `;
  document.head.appendChild(style);

  apply();
  new MutationObserver(apply).observe(document.body,{childList:true,subtree:true});
  document.addEventListener('click',()=>setTimeout(apply,60),true);
  setTimeout(apply,300);
  setTimeout(apply,1000);
})();