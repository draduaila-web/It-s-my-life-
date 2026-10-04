/* BERTH.A RC210 — Kids Neblina · assets 3D finais
   Apenas camada visual. Preserva trilha/estado/Owner da RC209.
*/
(function(){
  'use strict';
  const oldImg=window.r147img;
  const base='assets/kids/neblina/';
  const map={
    'mist_mist_v1_cat_head_0':'boné_de_bruma',
    'mist_mist_v1_cat_neck_1':'coleira_lunar',
    'mist_mist_v1_cat_eyes_2':'óculos_neblina',
    'mist_mist_v1_cat_back_3':'mochila_etérea',
    'mist_mist_v1_cat_special_4':'amuleto_lunar'
  };
  const rewards={
    medal_bronze:'medalha_bronze.png',
    medal_silver:'medalha_prata.png',
    medal_gold:'medalha_ouro.png',
    trophy:'trofeu.png',
    super_trophy:'super_trofeu.png',
    capsule_mist:'capsula.png'
  };
  function memberId(){return window.__rc209Member?.id||''}
  function variantFor(aid){
    const raw=window.berthaHmlStorage?.getItem('bertha.kids.accessory.variant.'+String(memberId())+'.'+aid);
    const n=Number(raw); return Number.isFinite(n)?Math.max(0,Math.min(2,n)):2;
  }
  function asset(src, cls='', variant='misto'){
    return '<span class="r197-art rc210-final-asset '+cls+'" data-variant="'+variant+'"><img src="'+base+src+'?v=210" alt="" loading="eager" decoding="async"></span>';
  }
  window.r147img=function(name,cls=''){
    if(map[name]){
      const v=variantFor(name), suffix=v===0?'nevoa':v===1?'coral':'misto';
      return asset(map[name]+'_'+suffix+'.png',cls,suffix);
    }
    if(rewards[name]) return asset(rewards[name],cls,'reward');
    if(/^capsule_mist$/.test(name)) return asset('capsula.png',cls,'reward');
    return oldImg?oldImg(name,cls):'';
  };

  const style=document.createElement('style');
  style.textContent=`
    .rc210-final-asset{display:flex!important;align-items:center;justify-content:center;width:100%;height:100%;min-height:96px;overflow:visible!important;background:transparent!important}
    .rc210-final-asset img{display:block;max-width:94%;max-height:128px;width:auto;height:auto;object-fit:contain;filter:none!important;transform:none!important}
    .r197-acc-art .rc210-final-asset img{max-height:132px}
    .r197-step .rc210-final-asset img,.r197-reward .rc210-final-asset img{max-height:84px}
    .rc209-variants button i.warm{background:linear-gradient(135deg,#e58c78,#f0b09a)!important}
    .rc209-variants button i.cool{background:linear-gradient(135deg,#9bbfd2,#9fd0bf)!important}
    .rc209-variants button i.mix{background:linear-gradient(135deg,#9bbfd2 0%,#e58c78 52%,#f0d99a 100%)!important}
  `;
  document.head.appendChild(style);

  function stamp(){
    document.documentElement.dataset.berthaIndex='RC210';
    document.querySelectorAll('[class*="hml"],[data-hml],.hml-pill').forEach(el=>{if(/HML\s*·?\s*RC\d+/i.test(el.textContent||''))el.textContent=(el.textContent||'').replace(/HML\s*·?\s*RC\d+/i,'HML · RC210')});
    document.querySelectorAll('*').forEach(el=>{if(el.childElementCount===0 && /^INDEX\s*·\s*RC\d+$/i.test((el.textContent||'').trim())) el.textContent='INDEX · RC210';});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',stamp,{once:true});else stamp();
  window.addEventListener('pageshow',()=>setTimeout(stamp,0));
})();
