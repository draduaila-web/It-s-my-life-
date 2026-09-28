/* BERTH.A RC187B — compat visual sem sobrescrever presets antigos */
(function(){
 const KEY='bertha.recognition.presets.v9';
 const defaults=[
  {id:'thanks',asset:'recognition_thanks',name:'Obrigada por hoje',message:'Obrigada por deixar o meu dia mais leve.'},
  {id:'flower',asset:'recognition_flower',name:'Uma flor para você',message:'Um carinho para agradecer pela ajuda.'},
  {id:'coffee',asset:'recognition_coffee',name:'Vale café',message:'Um café por minha conta. Obrigada pela ajuda.'},
  {id:'moment',asset:'recognition_pause',name:'Vale uma pausa especial',message:'Uma pausa gostosa para você aproveitar como quiser.'},
  {id:'reward',asset:'recognition_reward',name:'Essa merece uma recompensa melhor',message:'Essa ajuda merece algo especial. Escolha como quer transformar esse reconhecimento em algo real.'},
  {id:'saved',asset:'recognition_saved',name:'Você salvou meu dia',message:'Você salvou meu dia hoje. Obrigada por estar comigo nisso.'},
  {id:'hug',asset:'recognition_hug',name:'Um abraço em forma de obrigada',message:'Receba esse carinho como meu obrigada.'},
  {id:'kiss',asset:'recognition_care',name:'Um carinho para você',message:'Um carinho porque você fez diferença.'},
  {id:'rocked',asset:'recognition_arrasou',name:'Arrasou',message:'Você mandou muito bem. Arrasou!'}
 ];
 try{window.berthaHmlStorage.setItem(KEY,JSON.stringify(defaults));}catch(e){}
 document.documentElement.dataset.berthaAssets='RC187B';
})();
