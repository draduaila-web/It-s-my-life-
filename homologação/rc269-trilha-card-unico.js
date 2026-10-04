/* BERTH.A RC269 — card único, hierarquia e universo correto */
(function(){
 if(document.getElementById('rc269-trail-single-card')) return;
 const aliases={neblina:'neblina',mist:'neblina',oceano:'oceano',ocean:'oceano',
  espaco:'espaco',space:'espaco',floresta:'floresta',forest:'floresta',solar:'solar',coral:'coral'};
 const norm=s=>(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();

 function universe(trail){
   /* Resolve pelo título da PRÓPRIA trilha, evitando capturar Oceano de outro elemento da página. */
   const els=[...trail.parentElement.querySelectorAll('h1,h2,h3,h4,[class*="title"],[class*="universe"]')];
   for(const el of els){
     const n=norm(el.textContent);
     for(const [k,v] of Object.entries(aliases)) if(n===k || n.includes(k)) return v;
   }
   const t=norm(trail.parentElement.textContent);
   for(const [k,v] of Object.entries(aliases)) if(t.includes(k)) return v;
   return 'neblina';
 }
 function apply(){
   const trail=document.querySelector('.rc258-trail');
   if(!trail)return;
   const steps=[...trail.querySelectorAll('.r197-step')];
   if(steps.length<5)return;
   trail.classList.add('rc269-single-card');
   const u=universe(trail);
   [[3,'trofeu'],[4,'super']].forEach(([i,k])=>{
     const img=steps[i].querySelector('.rc258-reward-art img');
     if(img) img.src=`rc268_reward_${u}_${k}.png`;
   });
 }
 const s=document.createElement('style'); s.id='rc269-trail-single-card';
 s.textContent=`
 .rc258-trail.rc269-single-card{
   display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;
   gap:3px!important;align-items:end!important;
   background:rgba(255,255,255,.82)!important;
   border:1px solid rgba(112,90,119,.08)!important;border-radius:22px!important;
   padding:14px 7px 12px!important;overflow:visible!important;
   box-shadow:0 8px 24px rgba(75,58,69,.035)!important
 }
 .rc258-trail.rc269-single-card .r197-step{
   min-width:0!important;width:auto!important;margin:0!important;padding:0!important;
   background:transparent!important;border:0!important;box-shadow:none!important;
   border-radius:0!important;overflow:visible!important;
   display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:flex-end!important
 }
 .rc258-trail.rc269-single-card .rc258-reward-art{
   background:transparent!important;border:0!important;outline:0!important;
   box-shadow:none!important;border-radius:0!important;overflow:visible!important;
   display:flex!important;align-items:center!important;justify-content:center!important;
   margin:0 auto 7px!important;padding:0!important;position:relative!important
 }
 .rc258-trail.rc269-single-card .r197-step:nth-child(-n+3) .rc258-reward-art{
   width:55px!important;height:66px!important;max-width:55px!important
 }
 .rc258-trail.rc269-single-card .r197-step:nth-child(-n+3) .rc258-reward-art img{
   width:55px!important;height:66px!important;max-width:55px!important;max-height:66px!important;
   object-fit:contain!important;object-position:center!important;transform:none!important
 }
 .rc258-trail.rc269-single-card .r197-step:nth-child(4) .rc258-reward-art{
   width:72px!important;height:78px!important;max-width:72px!important
 }
 .rc258-trail.rc269-single-card .r197-step:nth-child(4) .rc258-reward-art img{
   width:72px!important;height:78px!important;max-width:72px!important;max-height:78px!important;
   object-fit:contain!important;object-position:center!important;transform:none!important
 }
 .rc258-trail.rc269-single-card .r197-step:nth-child(5) .rc258-reward-art{
   width:82px!important;height:84px!important;max-width:82px!important
 }
 .rc258-trail.rc269-single-card .r197-step:nth-child(5) .rc258-reward-art img{
   width:82px!important;height:84px!important;max-width:82px!important;max-height:84px!important;
   object-fit:contain!important;object-position:center!important;transform:none!important
 }
 .rc258-trail.rc269-single-card .r197-step.active .rc258-reward-art,
 .rc258-trail.rc269-single-card .r197-step.is-active .rc258-reward-art,
 .rc258-trail.rc269-single-card .r197-step[aria-current="true"] .rc258-reward-art{
   filter:drop-shadow(0 0 7px rgba(181,154,211,.26))!important
 }
 .rc258-trail.rc269-single-card .r197-step > :last-child{text-align:center!important}
 @media(max-width:390px){
  .rc258-trail.rc269-single-card{gap:1px!important;padding-left:4px!important;padding-right:4px!important}
  .rc258-trail.rc269-single-card .r197-step:nth-child(-n+3) .rc258-reward-art,
  .rc258-trail.rc269-single-card .r197-step:nth-child(-n+3) .rc258-reward-art img{width:51px!important;max-width:51px!important}
  .rc258-trail.rc269-single-card .r197-step:nth-child(4) .rc258-reward-art,
  .rc258-trail.rc269-single-card .r197-step:nth-child(4) .rc258-reward-art img{width:66px!important;max-width:66px!important}
  .rc258-trail.rc269-single-card .r197-step:nth-child(5) .rc258-reward-art,
  .rc258-trail.rc269-single-card .r197-step:nth-child(5) .rc258-reward-art img{width:75px!important;max-width:75px!important}
 }`;
 document.head.appendChild(s);
 apply();
 new MutationObserver(apply).observe(document.body,{childList:true,subtree:true});
 document.addEventListener('click',()=>setTimeout(apply,60),true);
 setTimeout(apply,300);setTimeout(apply,1000);
})();