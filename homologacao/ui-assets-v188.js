/* BERTH.A RC188 — compat visual sem sobrescrever presets antigos */
(function(){
 const KEY='bertha.recognition.presets.v10';
 const defaults=[
  {id:'thanks',asset:'recognition_thanks_v188',name:'Obrigada por hoje',message:'Obrigada por deixar o meu dia mais leve.'},
  {id:'flower',asset:'recognition_flower_v188',name:'Uma flor para você',message:'Um carinho para agradecer pela ajuda.'},
  {id:'coffee',asset:'recognition_coffee_v188',name:'Vale café',message:'Um café por minha conta. Obrigada pela ajuda.'},
  {id:'moment',asset:'recognition_pause_v188',name:'Vale uma pausa especial',message:'Uma pausa gostosa para você aproveitar como quiser.'},
  {id:'reward',asset:'recognition_reward_v188',name:'Essa merece uma recompensa melhor',message:'Essa ajuda merece algo especial. Escolha como quer transformar esse reconhecimento em algo real.'},
  {id:'saved',asset:'recognition_saved_v188',name:'Você salvou meu dia',message:'Você salvou meu dia hoje. Obrigada por estar comigo nisso.'},
  {id:'hug',asset:'recognition_hug_v188',name:'Um abraço em forma de obrigada',message:'Receba esse carinho como meu obrigada.'},
  {id:'kiss',asset:'recognition_care_v188',name:'Um carinho para você',message:'Um carinho porque você fez diferença.'},
  {id:'rocked',asset:'recognition_arrasou_v188',name:'Arrasou',message:'Você mandou muito bem. Arrasou!'}
 ];
 try{window.berthaHmlStorage.setItem(KEY,JSON.stringify(defaults));}catch(e){}
 document.documentElement.dataset.berthaAssets='RC188';
})();
