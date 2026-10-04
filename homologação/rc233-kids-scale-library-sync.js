/* BERTH.A RC233 — Kids · escala Cervo/Ursinho + bibliotecas sincronizadas */
(function(){
'use strict';
const BUILD='RC233';
const PALS=['nevoa','coral','misto'];
const PREFIX='bertha.kids.accessory.variant.';
const store=()=>window.berthaHmlStorage||window.localStorage;
function selectedKid(){const s=document.querySelector('#r152KidSel');if(s&&s.value)return String(s.value);if(window.__rc209Member!=null)return String(window.__rc209Member);return String(store().getItem('bertha.rewards.selected.kid')||'default');}
function variantFor(aid){const n=Number(store().getItem(PREFIX+selectedKid()+'.'+aid));return Number.isFinite(n)?Math.max(0,Math.min(2,n)):2;}

const KIT={
 deer:{
  pet:'Cervo de Nuvem',
  ids:{'mist_mist_v1_deer_head_0':'head','mist_mist_v1_deer_neck_1':'neck','mist_mist_v1_deer_eyes_2':'eyes','mist_mist_v1_deer_back_3':'back','mist_mist_v1_deer_special_4':'special'},
  names:['Tiara Nuvem Lunar','Coleira Celeste','Monóculo Encantado','Mochila Cervo de Nuvem','Varinha Mágica Celeste']
 },
 bear:{
  pet:'Ursinho de Bruma',
  ids:{'mist_mist_v1_bear_head_0':'head','mist_mist_v1_bear_neck_1':'neck','mist_mist_v1_bear_eyes_2':'eyes','mist_mist_v1_bear_back_3':'back','mist_mist_v1_bear_special_4':'special'},
  names:['Gorro Soninho de Bruma','Lenço de Bruma','Óculos Redondos de Bruma','Mochilinha de Bruma','Pingente Sonho de Bruma']
 }
};
const LIB={
 cat:{pet:'Gato Neblina',names:['Boné de Bruma','Coleira Lunar','Óculos Neblina','Mochila Etérea','Amuleto de Bruma']},
 rabbit:{pet:'Coelho de Nuvem',names:['Boné de Nuvem','Bandana de Bruma','Óculos de Grau Nuvem','Mochila Saltinho','Pingente Coelho de Nuvem']},
 fox:{pet:'Raposa Neblina',names:['Gorro Aurora','Lenço Estelar','Óculos da Raposa','Mochila Cauda Estelar','Amuleto Raposa Celeste']},
 owl:{pet:'Corujinha Lunar',names:['Chapéu Pena Lunar','Gravata Lua-Sábia','Óculos de Leitura Lunar','Bolsa-Livro Celeste','Medalhão Pena Oráculo']},
 deer:{pet:'Cervo de Nuvem',names:KIT.deer.names},
 bear:{pet:'Ursinho de Bruma',names:KIT.bear.names}
};
const KINDS=['head','neck','eyes','back','special'];

function tightAsset(animal,kind,pal){return './rc233-assets/'+animal+'_'+kind+'_'+pal+'.png?v=233';}
function libAsset(animal,kind){return './rc233-assets/lib_'+animal+'_'+kind+'.png?v=233';}

function patchKit(){
 document.querySelectorAll('.rc209-acc-proxy[data-acc]').forEach(proxy=>{
  const aid=proxy.getAttribute('data-acc'); let animal=null,kind=null;
  for(const a of ['deer','bear']){if(KIT[a].ids[aid]){animal=a;kind=KIT[a].ids[aid];break;}}
  if(!animal)return;
  const pal=PALS[variantFor(aid)];
  const src=tightAsset(animal,kind,pal);
  proxy.classList.add('rc233-tight'); proxy.dataset.rc233=animal;
  let img=proxy.querySelector('img');
  if(!img){proxy.replaceChildren();img=document.createElement('img');img.alt='';img.loading='eager';img.decoding='async';proxy.appendChild(img);}
  if(img.getAttribute('src')!==src)img.setAttribute('src',src);
 });
}

function exactTextElements(text){return [...document.querySelectorAll('h1,h2,h3,h4,strong')].filter(el=>(el.textContent||'').trim()===text);}
function findLibraryCard(pet){
 for(const heading of exactTextElements(pet)){
  let n=heading;
  for(let i=0;i<8&&n;i++,n=n.parentElement){
   const t=(n.textContent||'');
   if(t.includes('BIBLIOTECA DO COMPANHEIRO') && t.includes(pet)) return n;
  }
 }
 return null;
}
function buildLibrary(animal,cfg){
 const card=findLibraryCard(cfg.pet); if(!card)return;
 if(card.dataset.rc233Library===animal)return;
 card.dataset.rc233Library=animal;
 card.classList.add('rc233-library-card');
 const items=KINDS.map((kind,i)=>`<div class="rc233-library-item"><div class="rc233-library-art"><img src="${libAsset(animal,kind)}" alt="" loading="eager" decoding="async"></div><div class="rc233-library-name">${cfg.names[i]}</div></div>`).join('');
 card.innerHTML=`<div class="rc233-library-head"><div class="rc233-library-kicker">BIBLIOTECA DO COMPANHEIRO</div><h3>${cfg.pet}</h3><p>Os cinco acessórios são próprios deste pet. As imagens e nomes abaixo acompanham o pack atual homologado.</p></div><div class="rc233-library-grid">${items}</div>`;
}
function patchLibraries(){Object.entries(LIB).forEach(([a,c])=>buildLibrary(a,c));}
function stamp(){
 document.documentElement.dataset.berthaBuild=BUILD; document.documentElement.dataset.berthaIndex=BUILD; document.title='BERTH.A · Homologação '+BUILD;
 const idx=document.getElementById('rc157IndexBadge'); if(idx)idx.textContent='INDEX · '+BUILD;
 document.querySelectorAll('body *').forEach(el=>{if(el.children.length)return;const t=(el.textContent||'').trim();if(/^HML\s*·\s*RC\d+/i.test(t))el.textContent='HML · '+BUILD;});
}
function patch(){patchKit();patchLibraries();stamp();}

const style=document.createElement('style');style.id='rc233-kids-scale-library-style';style.textContent=`
.r197-acc:has(.rc233-tight) .r197-acc-art{height:186px!important;min-height:186px!important;overflow:visible!important;display:flex!important;align-items:center!important;justify-content:center!important}
.r197-acc-art .rc233-tight{width:100%!important;height:100%!important;display:flex!important;align-items:center!important;justify-content:center!important;overflow:visible!important;background:transparent!important}
.r197-acc-art .rc233-tight img{display:block!important;width:auto!important;height:174px!important;max-width:94%!important;max-height:174px!important;object-fit:contain!important;object-position:center!important;transform:none!important;filter:none!important}
.rc233-library-card{padding:28px 26px 30px!important;box-sizing:border-box!important}
.rc233-library-head{margin-bottom:22px!important}.rc233-library-kicker{font-size:11px!important;letter-spacing:.18em!important;color:#9b9298!important;margin-bottom:8px!important}.rc233-library-head h3{margin:0 0 8px!important;font-size:26px!important;font-weight:500!important;letter-spacing:-.02em!important;color:#45404a!important}.rc233-library-head p{margin:0!important;max-width:620px!important;line-height:1.45!important;color:#817a82!important;font-size:15px!important}
.rc233-library-grid{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:24px 18px!important;align-items:start!important}
.rc233-library-item{text-align:center!important;min-width:0!important}.rc233-library-art{width:104px!important;height:104px!important;margin:0 auto 8px!important;border-radius:25px!important;border:1px solid rgba(120,104,112,.10)!important;background:rgba(255,252,248,.62)!important;display:flex!important;align-items:center!important;justify-content:center!important;overflow:hidden!important}.rc233-library-art img{display:block!important;width:92px!important;height:92px!important;object-fit:contain!important;object-position:center!important}.rc233-library-name{font-size:12.5px!important;line-height:1.22!important;color:#69636a!important;min-height:31px!important;padding:0 2px!important}
@media(max-width:430px){.rc233-library-card{padding:26px 22px 28px!important}.rc233-library-grid{gap:24px 10px!important}.rc233-library-art{width:92px!important;height:92px!important;border-radius:22px!important}.rc233-library-art img{width:82px!important;height:82px!important}.rc233-library-name{font-size:11.5px!important}.rc233-library-head h3{font-size:25px!important}}
`;
document.head.appendChild(style);
KINDS.forEach(k=>PALS.forEach(p=>['deer','bear'].forEach(a=>{const i=new Image();i.src=tightAsset(a,k,p);})));Object.keys(LIB).forEach(a=>KINDS.forEach(k=>{const i=new Image();i.src=libAsset(a,k);}));
let raf=0;function schedule(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;patch();});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
window.addEventListener('pageshow',schedule);window.addEventListener('hashchange',()=>setTimeout(schedule,40));
document.addEventListener('click',e=>{if(e.target.closest('[data-r147tab="kids"],[data-rc209variant],[data-r152pet],#rc208PetSel,#r152KidSel'))setTimeout(schedule,60);},true);
document.addEventListener('change',e=>{if(e.target.matches('#rc208PetSel,#r152KidSel'))setTimeout(schedule,60);},true);
[120,350,800,1600].forEach(ms=>setTimeout(schedule,ms));
})();
