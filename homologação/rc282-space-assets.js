/* BERTH.A RC282 — Espaço: proporções e respiro baseados na Neblina */
(function(){
 const s=document.createElement('style'); s.id='rc282-space-style'; s.textContent=`
 .rc282-space-pet,.rc282-space-acc,.rc336-space-pet,.rc336-space-acc{display:flex!important;align-items:center!important;justify-content:center!important;min-width:0!important;min-height:0!important;width:100%!important;height:100%!important;overflow:visible!important;background:transparent!important}
 .rc209-kids-shell .r197-current-art .rc336-space-pet img,.rc209-kids-shell .r197-pet-art .rc336-space-pet img,.r197-history .rc336-space-pet img{width:100%!important;height:100%!important;max-width:100%!important;max-height:100%!important;object-fit:contain!important;object-position:center!important;transform:scale(var(--rc282-art-scale,1.4))!important;transform-origin:center!important;display:block!important;filter:saturate(.9)!important}
 /* Neblina/Gato: quadro de 144px e arte com cerca de 83px visíveis. */
 .r197-acc:has(.rc336-space-acc) .r197-acc-art{width:112px!important;max-width:100%!important;height:144px!important;min-height:144px!important;padding:0!important;display:flex!important;align-items:center!important;justify-content:center!important;overflow:hidden!important}
 .rc209-kids-shell .r197-acc-art .rc336-space-acc img{width:100%!important;height:100%!important;max-width:100%!important;max-height:100%!important;object-fit:contain!important;object-position:center!important;transform:scale(var(--rc282-art-scale,1.25))!important;transform-origin:center!important;display:block!important}
 .rc208-library .rc336-space-acc img{width:100%!important;height:100%!important;max-width:100%!important;max-height:100%!important;object-fit:contain!important;object-position:center!important;transform:scale(var(--rc282-art-scale,1.25))!important;transform-origin:center!important;display:block!important}
 .rc260-capsule .rc260-capsule-art[src*="rc340_capsule_espaco_clean"]{object-fit:contain!important;object-position:center!important;background:transparent!important;padding:5px!important;box-sizing:border-box!important;border-radius:0!important;box-shadow:none!important;filter:saturate(.9)!important}
 img[src*="rc336_space_cat.png"]{--rc282-art-scale:1.424}
 img[src*="rc282_space_cat_head.png"]{--rc282-art-scale:1.275}
 img[src*="rc282_space_cat_neck.png"]{--rc282-art-scale:1.275}
 img[src*="rc282_space_cat_eyes.png"]{--rc282-art-scale:1.275}
 img[src*="rc282_space_cat_back.png"]{--rc282-art-scale:1.275}
 img[src*="rc282_space_cat_special.png"]{--rc282-art-scale:1.275}
 img[src*="rc336_space_alien.png"]{--rc282-art-scale:1.424}
 img[src*="rc282_space_alien_head.png"]{--rc282-art-scale:1.275}
 img[src*="rc282_space_alien_neck.png"]{--rc282-art-scale:1.275}
 img[src*="rc282_space_alien_eyes.png"]{--rc282-art-scale:1.275}
 img[src*="rc282_space_alien_back.png"]{--rc282-art-scale:1.275}
 img[src*="rc282_space_alien_special.png"]{--rc282-art-scale:1.275}
 img[src*="rc336_space_robot.png"]{--rc282-art-scale:1.418}
 img[src*="rc282_space_robot_head.png"]{--rc282-art-scale:1.275}
 img[src*="rc282_space_robot_neck.png"]{--rc282-art-scale:1.275}
 img[src*="rc282_space_robot_eyes.png"]{--rc282-art-scale:1.275}
 img[src*="rc282_space_robot_back.png"]{--rc282-art-scale:1.275}
 img[src*="rc282_space_robot_special.png"]{--rc282-art-scale:1.275}
 img[src*="rc336_space_astronaut.png"]{--rc282-art-scale:1.431}
 img[src*="rc282_space_astronaut_head.png"]{--rc282-art-scale:1.275}
 img[src*="rc282_space_astronaut_neck.png"]{--rc282-art-scale:1.275}
 img[src*="rc282_space_astronaut_eyes.png"]{--rc282-art-scale:1.275}
 img[src*="rc282_space_astronaut_back.png"]{--rc282-art-scale:1.275}
 img[src*="rc282_space_astronaut_special.png"]{--rc282-art-scale:1.275}
 img[src*="rc336_space_planet.png"]{--rc282-art-scale:1.418}
 img[src*="rc282_space_planet_head.png"]{--rc282-art-scale:1.275}
 img[src*="rc282_space_planet_neck.png"]{--rc282-art-scale:1.275}
 img[src*="rc282_space_planet_eyes.png"]{--rc282-art-scale:1.275}
 img[src*="rc282_space_planet_back.png"]{--rc282-art-scale:1.275}
 img[src*="rc282_space_planet_special.png"]{--rc282-art-scale:1.275}
 img[src*="rc336_space_comet.png"]{--rc282-art-scale:1.431}
 img[src*="rc282_space_comet_head.png"]{--rc282-art-scale:1.275}
 img[src*="rc282_space_comet_neck.png"]{--rc282-art-scale:1.275}
 img[src*="rc282_space_comet_eyes.png"]{--rc282-art-scale:1.275}
 img[src*="rc282_space_comet_back.png"]{--rc282-art-scale:1.275}
 img[src*="rc282_space_comet_special.png"]{--rc282-art-scale:1.275}
 `; document.head.appendChild(s); document.documentElement.dataset.berthaSpaceAssets='RC282';
})();
