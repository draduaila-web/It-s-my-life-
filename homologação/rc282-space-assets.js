/* BERTH.A RC282 — Kids · Universo Espaço: pets + 5 acessórios exclusivos por personagem */
(function(){
 const s=document.createElement('style'); s.id='rc282-space-style'; s.textContent=`
 .rc282-space-pet,.rc282-space-acc{display:flex!important;align-items:center!important;justify-content:center!important;overflow:hidden!important;border-radius:18px!important}
 .rc282-space-pet img,.rc282-space-acc img{width:100%!important;height:100%!important;object-fit:cover!important;display:block!important;filter:none!important}
 .rc208-library .rc282-space-pet img,.rc208-library .rc282-space-acc img{width:100%!important;height:100%!important}

 /* RC336 assets: normalize visible artwork, not the transparent PNG canvas. */
 .rc336-space-pet,.rc336-space-acc{min-width:0!important;min-height:0!important;width:100%!important;height:100%!important;display:flex!important;align-items:center!important;justify-content:center!important;background:transparent!important;overflow:visible!important}
 .rc209-kids-shell .r197-current-art .rc336-space-pet img,.rc209-kids-shell .r197-pet-art .rc336-space-pet img,.r197-history .rc336-space-pet img{width:100%!important;height:100%!important;max-width:100%!important;max-height:100%!important;object-fit:contain!important;object-position:center!important;transform:scale(var(--rc282-art-scale,1.5))!important;transform-origin:center!important;display:block!important}
 .r197-acc:has(.rc336-space-acc) .r197-acc-art{width:100%!important;height:156px!important;min-height:156px!important;padding:0!important;display:grid!important;place-items:center!important;overflow:hidden!important}
 .rc209-kids-shell .r197-acc-art .rc336-space-acc img,.rc208-library .rc336-space-acc img{width:100%!important;height:100%!important;max-width:100%!important;max-height:100%!important;object-fit:contain!important;object-position:center!important;transform:scale(var(--rc282-art-scale,1.8))!important;transform-origin:center!important;display:block!important}
 .rc260-capsule .rc260-capsule-art[src*="rc340_capsule_espaco_clean"]{object-fit:contain!important;object-position:center!important;background:transparent!important;padding:0!important;border-radius:0!important;box-shadow:none!important;filter:none!important}
 img[src*="rc336_space_cat.png"]{--rc282-art-scale:1.563}
 img[src*="rc336_space_cat_acc1.png"],img[src*="rc336_space_cat_acc1_coral.png"],img[src*="rc336_space_cat_acc1_misto.png"]{--rc282-art-scale:1.661}
 img[src*="rc336_space_cat_acc2.png"],img[src*="rc336_space_cat_acc2_coral.png"],img[src*="rc336_space_cat_acc2_misto.png"]{--rc282-art-scale:1.661}
 img[src*="rc336_space_cat_acc3.png"],img[src*="rc336_space_cat_acc3_coral.png"],img[src*="rc336_space_cat_acc3_misto.png"]{--rc282-art-scale:1.661}
 img[src*="rc336_space_cat_acc4.png"],img[src*="rc336_space_cat_acc4_coral.png"],img[src*="rc336_space_cat_acc4_misto.png"]{--rc282-art-scale:1.661}
 img[src*="rc336_space_cat_acc5.png"],img[src*="rc336_space_cat_acc5_coral.png"],img[src*="rc336_space_cat_acc5_misto.png"]{--rc282-art-scale:1.661}
 img[src*="rc336_space_alien.png"]{--rc282-art-scale:1.563}
 img[src*="rc336_space_alien_acc1.png"],img[src*="rc336_space_alien_acc1_coral.png"],img[src*="rc336_space_alien_acc1_misto.png"]{--rc282-art-scale:1.661}
 img[src*="rc336_space_alien_acc2.png"],img[src*="rc336_space_alien_acc2_coral.png"],img[src*="rc336_space_alien_acc2_misto.png"]{--rc282-art-scale:1.661}
 img[src*="rc336_space_alien_acc3.png"],img[src*="rc336_space_alien_acc3_coral.png"],img[src*="rc336_space_alien_acc3_misto.png"]{--rc282-art-scale:1.661}
 img[src*="rc336_space_alien_acc4.png"],img[src*="rc336_space_alien_acc4_coral.png"],img[src*="rc336_space_alien_acc4_misto.png"]{--rc282-art-scale:1.661}
 img[src*="rc336_space_alien_acc5.png"],img[src*="rc336_space_alien_acc5_coral.png"],img[src*="rc336_space_alien_acc5_misto.png"]{--rc282-art-scale:1.661}
 img[src*="rc336_space_robot.png"]{--rc282-art-scale:1.556}
 img[src*="rc336_space_robot_acc1.png"],img[src*="rc336_space_robot_acc1_coral.png"],img[src*="rc336_space_robot_acc1_misto.png"]{--rc282-art-scale:1.661}
 img[src*="rc336_space_robot_acc2.png"],img[src*="rc336_space_robot_acc2_coral.png"],img[src*="rc336_space_robot_acc2_misto.png"]{--rc282-art-scale:1.661}
 img[src*="rc336_space_robot_acc3.png"],img[src*="rc336_space_robot_acc3_coral.png"],img[src*="rc336_space_robot_acc3_misto.png"]{--rc282-art-scale:1.661}
 img[src*="rc336_space_robot_acc4.png"],img[src*="rc336_space_robot_acc4_coral.png"],img[src*="rc336_space_robot_acc4_misto.png"]{--rc282-art-scale:1.661}
 img[src*="rc336_space_robot_acc5.png"],img[src*="rc336_space_robot_acc5_coral.png"],img[src*="rc336_space_robot_acc5_misto.png"]{--rc282-art-scale:1.661}
 img[src*="rc336_space_astronaut.png"]{--rc282-art-scale:1.57}
 img[src*="rc336_space_astronaut_acc1.png"],img[src*="rc336_space_astronaut_acc1_coral.png"],img[src*="rc336_space_astronaut_acc1_misto.png"]{--rc282-art-scale:1.661}
 img[src*="rc336_space_astronaut_acc2.png"],img[src*="rc336_space_astronaut_acc2_coral.png"],img[src*="rc336_space_astronaut_acc2_misto.png"]{--rc282-art-scale:1.661}
 img[src*="rc336_space_astronaut_acc3.png"],img[src*="rc336_space_astronaut_acc3_coral.png"],img[src*="rc336_space_astronaut_acc3_misto.png"]{--rc282-art-scale:1.661}
 img[src*="rc336_space_astronaut_acc4.png"],img[src*="rc336_space_astronaut_acc4_coral.png"],img[src*="rc336_space_astronaut_acc4_misto.png"]{--rc282-art-scale:1.661}
 img[src*="rc336_space_astronaut_acc5.png"],img[src*="rc336_space_astronaut_acc5_coral.png"],img[src*="rc336_space_astronaut_acc5_misto.png"]{--rc282-art-scale:1.661}
 img[src*="rc336_space_planet.png"]{--rc282-art-scale:1.556}
 img[src*="rc336_space_planet_acc1.png"],img[src*="rc336_space_planet_acc1_coral.png"],img[src*="rc336_space_planet_acc1_misto.png"]{--rc282-art-scale:1.661}
 img[src*="rc336_space_planet_acc2.png"],img[src*="rc336_space_planet_acc2_coral.png"],img[src*="rc336_space_planet_acc2_misto.png"]{--rc282-art-scale:1.661}
 img[src*="rc336_space_planet_acc3.png"],img[src*="rc336_space_planet_acc3_coral.png"],img[src*="rc336_space_planet_acc3_misto.png"]{--rc282-art-scale:1.661}
 img[src*="rc336_space_planet_acc4.png"],img[src*="rc336_space_planet_acc4_coral.png"],img[src*="rc336_space_planet_acc4_misto.png"]{--rc282-art-scale:1.661}
 img[src*="rc336_space_planet_acc5.png"],img[src*="rc336_space_planet_acc5_coral.png"],img[src*="rc336_space_planet_acc5_misto.png"]{--rc282-art-scale:1.661}
 img[src*="rc336_space_comet.png"]{--rc282-art-scale:1.57}
 img[src*="rc336_space_comet_acc1.png"],img[src*="rc336_space_comet_acc1_coral.png"],img[src*="rc336_space_comet_acc1_misto.png"]{--rc282-art-scale:1.661}
 img[src*="rc336_space_comet_acc2.png"],img[src*="rc336_space_comet_acc2_coral.png"],img[src*="rc336_space_comet_acc2_misto.png"]{--rc282-art-scale:1.661}
 img[src*="rc336_space_comet_acc3.png"],img[src*="rc336_space_comet_acc3_coral.png"],img[src*="rc336_space_comet_acc3_misto.png"]{--rc282-art-scale:1.661}
 img[src*="rc336_space_comet_acc4.png"],img[src*="rc336_space_comet_acc4_coral.png"],img[src*="rc336_space_comet_acc4_misto.png"]{--rc282-art-scale:1.661}
 img[src*="rc336_space_comet_acc5.png"],img[src*="rc336_space_comet_acc5_coral.png"],img[src*="rc336_space_comet_acc5_misto.png"]{--rc282-art-scale:1.661}
 `; document.head.appendChild(s); document.documentElement.dataset.berthaSpaceAssets='RC282';
})();
