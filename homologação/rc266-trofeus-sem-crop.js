/* BERTH.A RC266 — only Trophy/Super Trophy fit correction */
(function(){
 if(document.getElementById('rc266-trophy-fit')) return;
 const s=document.createElement('style'); s.id='rc266-trophy-fit';
 s.textContent=`
 .rc258-trail .r197-step:nth-child(4),
 .rc258-trail .r197-step:nth-child(5){
   min-width:0!important; overflow:visible!important;
 }
 .rc258-trail .r197-step:nth-child(4) .rc258-reward-art,
 .rc258-trail .r197-step:nth-child(5) .rc258-reward-art{
   width:100%!important; max-width:88px!important; aspect-ratio:1/1!important;
   margin:0 auto 6px!important; overflow:hidden!important;
   transform:none!important; position:static!important;
   box-sizing:border-box!important; border-radius:15px!important;
 }
 .rc258-trail .r197-step:nth-child(4) .rc258-reward-art img,
 .rc258-trail .r197-step:nth-child(5) .rc258-reward-art img{
   display:block!important; width:100%!important; height:100%!important;
   max-width:100%!important; max-height:100%!important;
   object-fit:contain!important; object-position:center center!important;
   transform:none!important; margin:0!important; padding:0!important;
   position:static!important;
 }
 @media(max-width:390px){
  .rc258-trail .r197-step:nth-child(4) .rc258-reward-art,
  .rc258-trail .r197-step:nth-child(5) .rc258-reward-art{max-width:76px!important}
 }`;
 document.head.appendChild(s);
})();