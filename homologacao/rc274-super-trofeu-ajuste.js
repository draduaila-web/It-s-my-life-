/* BERTH.A RC274 — microajuste visual: somente Super Troféu */
(function(){
  if(document.getElementById('rc274-super-trofeu')) return;
  const s=document.createElement('style');
  s.id='rc274-super-trofeu';
  s.textContent=`
    /* Super Troféu ~11% maior que na RC273, sem alterar card, lógica ou assets */
    .rc258-trail.rc271-linear .r197-step:nth-child(5) .rc258-reward-art,
    .rc258-trail.rc271-linear .r197-step:nth-child(5) img{
      width:93px!important;
      height:86px!important;
      max-width:93px!important;
      max-height:86px!important;
      object-fit:contain!important;
    }
    @media(max-width:390px){
      .rc258-trail.rc271-linear .r197-step:nth-child(5) .rc258-reward-art,
      .rc258-trail.rc271-linear .r197-step:nth-child(5) img{
        width:87px!important;
        height:86px!important;
        max-width:87px!important;
        max-height:86px!important;
      }
    }
  `;
  document.head.appendChild(s);
})();