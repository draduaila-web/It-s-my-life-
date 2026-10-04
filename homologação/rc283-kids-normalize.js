/* BERTH.A RC283 — normalização visual Kids. Neblina = padrão mestre. */
(function(){
 const st=document.createElement('style'); st.id='rc283-kids-normalize'; st.textContent=`
 /* Neblina: preservar escala/recorte; apenas devolver presença visual */
 .rc209-kids-shell .r197-pet-art img:not([src*="rc278_ocean_"]):not([src*="rc282_space_"]),
 .rc209-kids-shell .r197-acc-art img:not([src*="rc280_ocean_"]):not([src*="rc282_space_"]){filter:saturate(1.10) contrast(1.05)!important}
 /* Oceano: sem fundo + acessórios na mesma leitura dimensional do Neblina */
 .rc278-ocean-pet,.rc280-ocean-acc{background:transparent!important;overflow:visible!important}
 .rc278-ocean-pet img{width:100%!important;height:100%!important;object-fit:contain!important;transform:scale(.96)!important;border-radius:0!important}
 .rc280-ocean-acc img{width:100%!important;height:100%!important;max-width:100%!important;max-height:100%!important;object-fit:contain!important;transform:scale(1.06)!important;background:transparent!important;border-radius:0!important}
 /* Espaço: corrigir RC282 — nunca usar cover; assets individuais transparentes */
 .rc282-space-pet,.rc282-space-acc{background:transparent!important;overflow:visible!important;border-radius:0!important}
 .rc282-space-pet img{width:100%!important;height:100%!important;object-fit:contain!important;transform:scale(.96)!important;background:transparent!important;border-radius:0!important}
 .rc282-space-acc img{width:100%!important;height:100%!important;object-fit:contain!important;transform:scale(1.04)!important;background:transparent!important;border-radius:0!important}
 `; document.head.appendChild(st); document.documentElement.dataset.berthaKidsNormalize='RC283';
})();
