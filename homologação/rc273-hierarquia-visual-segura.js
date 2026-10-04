/* BERTH.A RC273 — base funcional RC271; somente apresentação visual */
(function(){
  if(document.getElementById('rc273-safe-visual')) return;

  const style=document.createElement('style');
  style.id='rc273-safe-visual';
  style.textContent=`
    /* RC271 continua responsável pelo funcionamento. RC273 só redesenha. */
    .rc258-trail.rc271-linear{
      position:relative!important;
      padding-top:42px!important;
      overflow:visible!important;
    }

    /* Cabeçalhos visuais dos dois grupos — sem inserir/remover nós no DOM. */
    .rc258-trail.rc271-linear::before{
      content:"MEDALHAS";
      position:absolute;
      top:13px;
      left:0;
      width:60%;
      text-align:center;
      font-size:10px;
      line-height:1;
      letter-spacing:.13em;
      font-weight:600;
      color:rgba(77,65,78,.62);
      pointer-events:none;
    }
    .rc258-trail.rc271-linear::after{
      content:"TROFÉUS";
      position:absolute;
      top:13px;
      right:0;
      width:40%;
      text-align:center;
      font-size:10px;
      line-height:1;
      letter-spacing:.13em;
      font-weight:600;
      color:rgba(77,65,78,.62);
      pointer-events:none;
    }

    /* Ordem visual correta: Bronze, Prata, Ouro, Troféu, Super. */
    .rc258-trail.rc271-linear .r197-step:nth-child(1){order:1!important}
    .rc258-trail.rc271-linear .r197-step:nth-child(2){order:2!important}
    .rc258-trail.rc271-linear .r197-step:nth-child(3){order:3!important}
    .rc258-trail.rc271-linear .r197-step:nth-child(4){order:4!important}
    .rc258-trail.rc271-linear .r197-step:nth-child(5){order:5!important}

    /* Medalhas permanecem pequenas e transparentes. */
    .rc258-trail.rc271-linear .r197-step:nth-child(-n+3) .rc258-reward-art,
    .rc258-trail.rc271-linear .r197-step:nth-child(-n+3) img{
      width:40px!important;height:50px!important;
      max-width:40px!important;max-height:50px!important;
      background:transparent!important;
    }

    /* Troféu e Super: mantém proporção aprovada, Super com altura controlada. */
    .rc258-trail.rc271-linear .r197-step:nth-child(4) .rc258-reward-art,
    .rc258-trail.rc271-linear .r197-step:nth-child(4) img{
      width:76px!important;height:76px!important;
      max-width:76px!important;max-height:76px!important;
    }
    .rc258-trail.rc271-linear .r197-step:nth-child(5) .rc258-reward-art,
    .rc258-trail.rc271-linear .r197-step:nth-child(5) img{
      width:84px!important;height:78px!important;
      max-width:84px!important;max-height:78px!important;
    }

    /* Rótulos curtos sem alterar os textos/dados reais do app. */
    .rc258-trail.rc271-linear .r197-step > *:last-child{
      font-size:0!important;
      line-height:1.15!important;
      min-height:14px!important;
    }
    .rc258-trail.rc271-linear .r197-step > *:last-child::after{
      font-size:12px!important;
      line-height:1.15!important;
      color:inherit!important;
    }
    .rc258-trail.rc271-linear .r197-step:nth-child(1) > *:last-child::after{content:"Bronze"}
    .rc258-trail.rc271-linear .r197-step:nth-child(2) > *:last-child::after{content:"Prata"}
    .rc258-trail.rc271-linear .r197-step:nth-child(3) > *:last-child::after{content:"Ouro"}
    .rc258-trail.rc271-linear .r197-step:nth-child(4) > *:last-child::after{content:"Troféu"}
    .rc258-trail.rc271-linear .r197-step:nth-child(5) > *:last-child::after{content:"Super"}

    @media(max-width:390px){
      .rc258-trail.rc271-linear{padding-top:40px!important}
      .rc258-trail.rc271-linear .r197-step:nth-child(-n+3) .rc258-reward-art,
      .rc258-trail.rc271-linear .r197-step:nth-child(-n+3) img{
        width:38px!important;max-width:38px!important;
      }
      .rc258-trail.rc271-linear .r197-step:nth-child(4) .rc258-reward-art,
      .rc258-trail.rc271-linear .r197-step:nth-child(4) img{
        width:70px!important;max-width:70px!important;
      }
      .rc258-trail.rc271-linear .r197-step:nth-child(5) .rc258-reward-art,
      .rc258-trail.rc271-linear .r197-step:nth-child(5) img{
        width:78px!important;max-width:78px!important;
      }
    }
  `;
  document.head.appendChild(style);
})();