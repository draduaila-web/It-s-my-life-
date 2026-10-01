/* BERTH.A RC238 — PREMIAÇÕES VERSION CLEANUP (code-only)
   Goal: stop legacy RC196/RC199/other debug badges from visually fighting with the active build.
   No assets and no Kids/Owner/Helper business logic changes.
*/
(function(){
'use strict';
const BUILD='RC238';
const ROOT=document.documentElement;

function ensureStyle(){
  if(document.getElementById('rc238-version-style')) return;
  const s=document.createElement('style');
  s.id='rc238-version-style';
  s.textContent=`
    #rc157IndexBadge,[data-rc238-legacy-badge="1"]{display:none!important;visibility:hidden!important;pointer-events:none!important}
    #rc238IndexBadge,#rc238HmlBadge{
      position:fixed;top:calc(env(safe-area-inset-top,0px) + 8px);z-index:2147483647;
      padding:5px 9px;border-radius:999px;color:#fff;font:700 10px/1 system-ui,-apple-system,sans-serif;
      letter-spacing:.08em;pointer-events:none;box-shadow:0 1px 0 rgba(255,255,255,.08) inset;
      white-space:nowrap
    }
    #rc238IndexBadge{left:16px;background:#876e7e}
    #rc238HmlBadge{right:16px;background:#4f4b56}
  `;
  document.head.appendChild(s);
}

function ensureCanonicalBadges(){
  if(!document.body) return;
  let idx=document.getElementById('rc238IndexBadge');
  if(!idx){idx=document.createElement('div');idx.id='rc238IndexBadge';document.body.appendChild(idx);}
  idx.textContent='INDEX · '+BUILD;
  let hml=document.getElementById('rc238HmlBadge');
  if(!hml){hml=document.createElement('div');hml.id='rc238HmlBadge';document.body.appendChild(hml);}
  hml.textContent='HML · '+BUILD;
}

function isLeaf(el){return el && el.nodeType===1 && !el.children.length;}
function normalizeText(t){return String(t||'').replace(/\s+/g,' ').trim();}
function markLegacy(root){
  if(!root || root.nodeType!==1) return;
  const scan=[root,...root.querySelectorAll('*')];
  for(const el of scan){
    if(!isLeaf(el)) continue;
    if(el.id==='rc238IndexBadge'||el.id==='rc238HmlBadge') continue;
    const t=normalizeText(el.textContent);
    if(/^HML\s*·\s*RC\d+$/i.test(t) || /^INDEX\s*·\s*RC\d+$/i.test(t) || /^HOMOLOGA(?:C|Ç)[AÃ]O$/i.test(t)){
      el.setAttribute('data-rc238-legacy-badge','1');
    }
  }
}

function stamp(){
  ROOT.dataset.berthaBuild=BUILD;
  ROOT.dataset.berthaIndex=BUILD;
  document.title='BERTH.A · Homologação '+BUILD;
  ensureStyle();
  ensureCanonicalBadges();
  markLegacy(document.body);
}

let queued=false;
function schedule(){
  if(queued) return;
  queued=true;
  requestAnimationFrame(()=>{queued=false;stamp();});
}

function installObserver(){
  if(!document.body || window.__rc238VersionObserver) return;
  const obs=new MutationObserver(muts=>{
    let relevant=false;
    for(const m of muts){
      if(m.type==='childList'){
        for(const n of m.addedNodes){if(n.nodeType===1){markLegacy(n);relevant=true;}}
      } else if(m.type==='characterData'){
        const p=m.target.parentElement;
        if(p){markLegacy(p);relevant=true;}
      }
    }
    if(relevant) schedule();
  });
  obs.observe(document.body,{subtree:true,childList:true,characterData:true});
  window.__rc238VersionObserver=obs;
}

function boot(){stamp();installObserver();}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
window.addEventListener('pageshow',schedule);
window.addEventListener('hashchange',()=>setTimeout(schedule,20));
[50,180,500,1200,2200].forEach(ms=>setTimeout(schedule,ms));
})();
