/* BERTH.A RC275 — ajuste visual sobre RC274 funcional */
(function(){
  if(document.getElementById('rc275-hierarquia-compacta')) return;
  const s=document.createElement('style');
  s.id='rc275-hierarquia-compacta';
  s.textContent=`
    /* Redistribuição: medalhas compactas, mais área para Troféus */
    .rc258-trail.rc271-linear{
      display:grid!important;
      grid-template-columns:15% 15% 15% 23% 32%!important;
      column-gap:0!important;
      align-items:end!important;
      padding-left:12px!important;
      padding-right:12px!important;
    }
    .rc258-trail.rc271-linear::before{
      width:45%!important;
      left:0!important;
    }
    .rc258-trail.rc271-linear::after{
      width:55%!important;
      right:0!important;
    }
    .rc258-trail.rc271-linear .r197-step{
      width:100%!important;
      min-width:0!important;
      margin:0!important;
      padding:0!important;
      justify-self:center!important;
    }

    /* Medalhas: próximas entre si, mantendo tamanho delicado */
    .rc258-trail.rc271-linear .r197-step:nth-child(-n+3) .rc258-reward-art,
    .rc258-trail.rc271-linear .r197-step:nth-child(-n+3) img{
      width:38px!important;height:48px!important;
      max-width:38px!important;max-height:48px!important;
      object-fit:contain!important;
    }

    /* Troféu normal discretamente menor */
    .rc258-trail.rc271-linear .r197-step:nth-child(4) .rc258-reward-art,
    .rc258-trail.rc271-linear .r197-step:nth-child(4) img{
      width:66px!important;height:68px!important;
      max-width:66px!important;max-height:68px!important;
      object-fit:contain!important;
    }

    /* Super Troféu claramente dominante */
    .rc258-trail.rc271-linear .r197-step:nth-child(5) .rc258-reward-art,
    .rc258-trail.rc271-linear .r197-step:nth-child(5) img{
      width:108px!important;height:98px!important;
      max-width:108px!important;max-height:98px!important;
      object-fit:contain!important;
    }

    @media(max-width:390px){
      .rc258-trail.rc271-linear{
        grid-template-columns:15% 15% 15% 23% 32%!important;
        padding-left:8px!important;padding-right:8px!important;
      }
      .rc258-trail.rc271-linear .r197-step:nth-child(-n+3) .rc258-reward-art,
      .rc258-trail.rc271-linear .r197-step:nth-child(-n+3) img{
        width:35px!important;height:46px!important;
        max-width:35px!important;max-height:46px!important;
      }
      .rc258-trail.rc271-linear .r197-step:nth-child(4) .rc258-reward-art,
      .rc258-trail.rc271-linear .r197-step:nth-child(4) img{
        width:62px!important;height:66px!important;
        max-width:62px!important;max-height:66px!important;
      }
      .rc258-trail.rc271-linear .r197-step:nth-child(5) .rc258-reward-art,
      .rc258-trail.rc271-linear .r197-step:nth-child(5) img{
        width:100px!important;height:94px!important;
        max-width:100px!important;max-height:94px!important;
      }
    }
  `;
  document.head.appendChild(s);
})();