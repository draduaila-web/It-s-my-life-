/* BERTH.A RC271 — faixa linear corrigida */
(function(){
  if(document.getElementById('rc271-style')) return;
  const norm=s=>(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const aliases={neblina:'neblina',mist:'neblina',oceano:'oceano',ocean:'oceano',espaco:'espaco',space:'espaco',floresta:'floresta',forest:'floresta',solar:'solar',coral:'coral'};
  function universe(trail){
    let box=trail.closest('section,article,[class*="card"]')||trail.parentElement, t=norm(box?.textContent);
    for(const [k,v] of Object.entries(aliases)) if(t.includes(k)) return v;
    return 'neblina';
  }
  function apply(){
    const trail=document.querySelector('.rc258-trail'); if(!trail) return;
    const s=[...trail.querySelectorAll('.r197-step')]; if(s.length<5) return;
    trail.classList.add('rc271-linear'); const u=universe(trail);
    // Medal assets are real transparent PNGs in RC271.
    ['bronze','prata','ouro'].forEach((m,i)=>{const im=s[i].querySelector('img'); if(im) im.src=`rc271_reward_${u}_${m}.png`;});
    // Trophy assets remain the approved transparent set.
    const t=s[3].querySelector('img'), st=s[4].querySelector('img');
    if(t)t.src=`rc268_reward_${u}_trofeu.png`; if(st)st.src=`rc268_reward_${u}_super.png`;
  }
  const st=document.createElement('style'); st.id='rc271-style'; st.textContent=`
  .rc258-trail.rc271-linear{display:flex!important;align-items:flex-end!important;justify-content:space-between!important;gap:4px!important;width:100%!important;box-sizing:border-box!important;padding:15px 10px 12px!important;background:rgba(255,255,255,.9)!important;border:1px solid rgba(112,90,119,.07)!important;border-radius:22px!important;overflow:hidden!important;box-shadow:0 8px 24px rgba(75,58,69,.03)!important}
  .rc258-trail.rc271-linear .r197-step{flex:1 1 0!important;min-width:0!important;width:auto!important;margin:0!important;padding:0!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:flex-end!important;background:none!important;border:0!important;outline:0!important;box-shadow:none!important;overflow:visible!important}
  .rc258-trail.rc271-linear .rc258-reward-art{display:flex!important;align-items:center!important;justify-content:center!important;margin:0 auto 7px!important;padding:0!important;background:none!important;border:0!important;outline:0!important;box-shadow:none!important;overflow:visible!important}
  .rc258-trail.rc271-linear .rc258-reward-art:before,.rc258-trail.rc271-linear .rc258-reward-art:after{display:none!important;content:none!important}
  .rc258-trail.rc271-linear .rc258-reward-art img{display:block!important;object-fit:contain!important;object-position:center!important;margin:auto!important;padding:0!important;background:transparent!important;border:0!important;outline:0!important;box-shadow:none!important;transform:none!important}
  .rc258-trail.rc271-linear .r197-step:nth-child(-n+3) .rc258-reward-art,.rc258-trail.rc271-linear .r197-step:nth-child(-n+3) img{width:42px!important;height:52px!important;max-width:42px!important;max-height:52px!important}
  .rc258-trail.rc271-linear .r197-step:nth-child(4) .rc258-reward-art,.rc258-trail.rc271-linear .r197-step:nth-child(4) img{width:76px!important;height:76px!important;max-width:76px!important;max-height:76px!important}
  .rc258-trail.rc271-linear .r197-step:nth-child(5) .rc258-reward-art,.rc258-trail.rc271-linear .r197-step:nth-child(5) img{width:88px!important;height:82px!important;max-width:88px!important;max-height:82px!important}
  /* requested visual inversion: Super Trophy before Trophy, without changing progression data */
  .rc258-trail.rc271-linear .r197-step:nth-child(4){order:5!important}.rc258-trail.rc271-linear .r197-step:nth-child(5){order:4!important}
  .rc258-trail.rc271-linear .r197-step>*:last-child{text-align:center!important;font-size:12px!important;line-height:1.15!important}
  @media(max-width:390px){.rc258-trail.rc271-linear{gap:2px!important;padding-left:7px!important;padding-right:7px!important}.rc258-trail.rc271-linear .r197-step:nth-child(-n+3) .rc258-reward-art,.rc258-trail.rc271-linear .r197-step:nth-child(-n+3) img{width:39px!important;max-width:39px!important}.rc258-trail.rc271-linear .r197-step:nth-child(4) .rc258-reward-art,.rc258-trail.rc271-linear .r197-step:nth-child(4) img{width:70px!important;max-width:70px!important}.rc258-trail.rc271-linear .r197-step:nth-child(5) .rc258-reward-art,.rc258-trail.rc271-linear .r197-step:nth-child(5) img{width:80px!important;max-width:80px!important}}
  `; document.head.appendChild(st);
  apply(); new MutationObserver(apply).observe(document.body,{childList:true,subtree:true}); document.addEventListener('click',()=>setTimeout(apply,60),true); setTimeout(apply,300);setTimeout(apply,1000);
})();