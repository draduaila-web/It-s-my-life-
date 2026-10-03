/* BERTH.A RC277 — microajuste final: desce somente a arte do Super Troféu */
(function(){
  if(document.getElementById('rc277-super-trofeu-descer')) return;
  const s=document.createElement('style');
  s.id='rc277-super-trofeu-descer';
  s.textContent=`
    /* Mantém tamanho, grid, rótulos e demais conquistas intactos. */
    .rc258-trail.rc271-linear .r197-step:nth-child(5) .rc258-reward-art,
    .rc258-trail.rc271-linear .r197-step:nth-child(5) img{
      transform:translateY(14px)!important;
    }
  `;
  document.head.appendChild(s);
})();
