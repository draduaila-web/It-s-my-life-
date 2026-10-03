/* BERTH.A RC276 — somente alinhamento fino sobre RC275 */
(function(){
  if(document.getElementById('rc276-alinhamento-final')) return;
  const s=document.createElement('style');
  s.id='rc276-alinhamento-final';
  s.textContent=`
    /* Mantém proporções da RC275. Ajusta somente geometria/alinhamento. */
    .rc258-trail.rc271-linear{
      grid-template-columns:15% 15% 15% 23% 32%!important;
      align-items:end!important;
    }

    /* Cabeçalhos centralizados exatamente nos blocos 45/55. */
    .rc258-trail.rc271-linear::before{
      left:0!important;
      width:45%!important;
      text-align:center!important;
    }
    .rc258-trail.rc271-linear::after{
      left:45%!important;
      right:auto!important;
      width:55%!important;
      text-align:center!important;
    }

    /* Cada conquista vira uma coluna vertical estável. */
    .rc258-trail.rc271-linear .r197-step{
      align-self:end!important;
      display:flex!important;
      flex-direction:column!important;
      align-items:center!important;
      justify-content:flex-end!important;
      text-align:center!important;
      height:150px!important;
      box-sizing:border-box!important;
    }

    /* Área visual comum: imagens apoiadas na mesma linha inferior. */
    .rc258-trail.rc271-linear .r197-step .rc258-reward-art{
      flex:1 1 auto!important;
      display:flex!important;
      align-items:flex-end!important;
      justify-content:center!important;
      margin:0 auto 10px!important;
    }

    /* Rótulos na mesma linha de base, centralizados sob a própria imagem. */
    .rc258-trail.rc271-linear .r197-step > *:last-child{
      flex:0 0 18px!important;
      width:100%!important;
      min-height:18px!important;
      margin:0!important;
      text-align:center!important;
      display:flex!important;
      align-items:flex-end!important;
      justify-content:center!important;
    }

    /* Neutraliza deslocamentos residuais sem alterar tamanhos. */
    .rc258-trail.rc271-linear .r197-step img{
      margin-left:auto!important;
      margin-right:auto!important;
      transform:none!important;
    }

    @media(max-width:390px){
      .rc258-trail.rc271-linear .r197-step{height:146px!important}
      .rc258-trail.rc271-linear .r197-step .rc258-reward-art{margin-bottom:9px!important}
    }
  `;
  document.head.appendChild(s);
})();