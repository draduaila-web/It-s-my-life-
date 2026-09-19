
(function(){if(document.getElementById('close-purchase-v2873-style'))return;const st=document.createElement('style');st.id='close-purchase-v2873-style';st.textContent=`.close-purchase-modal{display:flex!important;flex-direction:column!important;max-height:min(88dvh,760px)!important;overflow:hidden!important}.close-purchase-list{display:grid;gap:9px;overflow:auto;padding:2px 2px 10px;min-height:0}.close-purchase-item{display:grid!important;grid-template-columns:24px minmax(0,1fr) auto;align-items:center;gap:10px;margin:0!important;padding:12px 13px;border:1px solid #eadfec;border-radius:16px;background:#fff;cursor:pointer}.close-purchase-item input{position:absolute;opacity:0;pointer-events:none}.close-purchase-check{width:21px;height:21px;border:1.5px solid #cbbbd1;border-radius:7px;background:#fff;display:grid;place-items:center}.close-purchase-item input:checked+.close-purchase-check{background:#8f73a1;border-color:#8f73a1}.close-purchase-item input:checked+.close-purchase-check:after{content:'✓';color:#fff;font-size:14px;font-weight:900}.close-purchase-copy{min-width:0}.close-purchase-copy strong,.close-purchase-copy small{display:block}.close-purchase-copy strong{font-size:14px;color:#514854}.close-purchase-copy small{margin-top:3px;font-size:11px;color:#8c818e}.close-purchase-base{font-size:10px;font-weight:850;color:#80668f;background:#f3eafb;border-radius:999px;padding:6px 8px;white-space:nowrap}.close-purchase-hint{font-size:11px;line-height:1.4;color:#8a808b;padding:5px 2px 0}.close-purchase-actions{position:sticky!important;bottom:-20px!important;margin:12px -20px -20px!important;padding:13px 20px calc(13px + env(safe-area-inset-bottom))!important;background:rgba(255,253,251,.97)!important;border-top:1px solid rgba(92,72,104,.08);z-index:2}@media(max-width:560px){.close-purchase-modal{width:calc(100vw - 24px)!important;max-height:calc(100dvh - 24px)!important;border-radius:24px!important;padding:18px!important}.close-purchase-actions{bottom:-18px!important;margin:12px -18px -18px!important;padding:12px 18px calc(12px + env(safe-area-inset-bottom))!important}.close-purchase-base{display:none}}`;document.head.appendChild(st)})();
// BERTH.A v2.8.118 — Alimentação congelamento visual: ícone próprio + calor suave nos cards; integrações v117 preservadas
// BERTH.A app-v2.8.127 · Casa modais blush/sálvia + menu de áreas alinhado
window.BERTHA_BUILD="2.8.139-trabalho-estetica-integracao";
// BERTH.A v2.8.10 — Casa: dados reais, modal padrão e horários abaixo das rotinas.
const STORAGE_KEY = "minha-vida.pendencias.v1";
const state = {
  route: "meu-dia",
  filter: "abertas",
  editingId: null,
  search: ""
};

const app = document.querySelector("#app");
const dialog = document.querySelector("#pendingDialog");
const form = document.querySelector("#pendingForm");

function loadPendencias() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function savePendencias(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}
function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
function todayISO() {
  const d = new Date();
  const local = new Date(d.getTime() - d.getTimezoneOffset()*60000);
  return local.toISOString().slice(0,10);
}
function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("pt-BR", {day:"2-digit", month:"2-digit"}).format(new Date(value+"T12:00:00"));
}
function dueClass(value) {
  if (!value) return "";
  if (value < todayISO()) return "overdue";
  if (value === todayISO()) return "today";
  return "";
}
function escapeHtml(value="") {
  // Dados persistidos por versões antigas podem conter números, null ou outros
  // tipos. A camada de apresentação nunca deve cair por isso.
  return String(value ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}


function mvNow(){return new Date();}
function mvMinutes(d=mvNow()){return d.getHours()*60+d.getMinutes();}
function mvDow(d=mvNow()){return d.getDay();}
function mvDate(){return new Intl.DateTimeFormat('pt-BR',{weekday:'long',day:'numeric',month:'long'}).format(mvNow());}
function mvRead(k){try{return JSON.parse(localStorage.getItem(k)||'[]')}catch(e){return[]}}
function mvPending(){
 const a=mvRead('minha-vida.pendencias.v1'), t=new Date(); t.setHours(0,0,0,0);
 return a.filter(x=>!x.completed&&!x.done&&(!x.dueDate||new Date(x.dueDate+'T00:00:00')<=t)).slice(0,5);
}
function mvCurrentBlock(){
 const d=mvNow(), m=mvMinutes(d), w=mvDow(d);
 if(m>=320&&m<455)return ['Manhã protegida','05:20–07:35','Seu ritual de manhã. Sem tarefas domésticas.','protected'];
 if(m>=480&&m<840)return ['Trabalho CREFITO-11','08:00–14:00','Bloco oficial de trabalho.','work'];
 if((w===1||w===3)&&m>=880&&m<970)return ['Janela estratégica','14:40–16:10','Espaço para decisões e prioridades estratégicas.','strategy'];
 const ho={1:['16:40','18:40'],2:['15:40','17:40'],3:['16:40','18:40'],4:['15:40','17:40'],5:['15:40','17:40']}[w];
 if(ho){const s=+ho[0].slice(0,2)*60+ +ho[0].slice(3),e=+ho[1].slice(0,2)*60+ +ho[1].slice(3);if(m>=s&&m<e)return ['Home office',ho.join('–'),'Bloco obrigatório de trabalho em casa.','office'];}
 if(m>=1140)return ['Noite protegida','após 19:00','Agora é espaço para desacelerar. O sistema não vai encher sua noite.','rest'];
 return ['Espaço livre','agora','Você não precisa preencher cada minuto.','free'];
}
function studyWindowNow(){
 const d=mvNow(),m=mvMinutes(d),w=mvDow(d);
 if((w===1||w===3) && m>=880 && m<970) return {minutes:970-m,start:880,end:970,label:'Janela estratégica'};
 if((w===2||w===4||w===5) && m>=870 && m<910) return {minutes:910-m,start:870,end:910,label:'Janela curta'};
 return null;
}
function renderStudySuggestionMeuDia(){
 const win=studyWindowNow();
 if(!win) return '';
 const sug=estudoSugestao(win.minutes);
 if(!sug || !sug.maps?.length) return `<section class="study-now-card"><div class="eyebrow">ESTUDOS</div><strong>Nenhum conteúdo precisa entrar agora.</strong><p>Sua janela está disponível. Se quiser estudar, escolha livremente; caso contrário, preserve o espaço.</p></section>`;
 const first=sug.maps[0];
 const label=win.minutes>=75?'até 1h30':win.minutes>=45?'até 1h':'até 40 min';
 return `<section class="study-now-card"><div class="eyebrow">ESTUDOS · ${escapeHtml(win.label)} · ${label}</div><h3>${escapeHtml(sug.title)}</h3><p>${escapeHtml(sug.text)}</p><button class="study-now-action" onclick="location.hash='#estudos';setTimeout(()=>document.getElementById('mapa-${first.id}')?.scrollIntoView({behavior:'smooth',block:'center'}),80)">Mapa ${String(first.id).padStart(3,'0')} · ${escapeHtml(first.materia)}<small>${escapeHtml(first.topico)}</small></button></section>`;
}
function ensureStudyMeuDiaStyles(){
 if(document.getElementById('study-meu-dia-styles')) return;
 const style=document.createElement('style'); style.id='study-meu-dia-styles';
 style.textContent=`
 .study-now-card{margin:16px 0;padding:18px;border:1px solid rgba(92,72,104,.10);border-radius:24px;background:linear-gradient(135deg,#f3eef8,#eef5f8);box-shadow:0 8px 24px rgba(76,58,82,.05)}
 .study-now-card h3{margin:6px 0 4px;font-size:21px}.study-now-card p{margin:0 0 12px;color:#756d78}.study-now-action{width:100%;text-align:left;border:1px solid #ddd2e8;border-radius:16px;padding:12px;background:#fffdfb;color:#654b75;font-weight:800}.study-now-action small{display:block;margin-top:4px;color:#8a808e;font-weight:500}
 .bottom-nav{position:fixed!important;left:0!important;right:0!important;bottom:0!important;width:100%!important;max-width:none!important;margin:0!important;transform:none!important;display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;align-items:stretch!important;z-index:9999!important;border-radius:24px 24px 0 0!important;padding:8px 10px calc(8px + env(safe-area-inset-bottom))!important;box-sizing:border-box!important;background:rgba(255,250,246,.96)!important;backdrop-filter:blur(12px)!important}
 .bottom-nav .nav-item{min-width:0!important;width:100%!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:3px!important;flex-direction:column!important;white-space:nowrap!important}
 `;
 document.head.appendChild(style);
}
function finHomeMonthOffset(offset=0){
 const d=new Date();d.setDate(1);d.setMonth(d.getMonth()+offset);
 return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
}
function finHomeReminders(){
 try{
  const d=loadFin();
  const months=[finHomeMonthOffset(-1),finHomeMonthOffset(0),finHomeMonthOffset(1)];
  const seen=new Set(),items=[];
  months.forEach(month=>finPlannedMonth(d,month).forEach(o=>{
   if(o.paid)return;
   const days=finDaysTo(o.due),lead=Number(o.bill.reminderDays??3);
   if(days>lead)return;
   const key=`${o.bill.id}|${o.month}`;if(seen.has(key))return;seen.add(key);
   items.push({...o,days,status:finPlannedStatus(o)});
  }));
  return items.sort((a,b)=>a.due.localeCompare(b.due)).slice(0,4);
 }catch(e){return[];}
}
function renderFinanceRemindersMeuDia(){
 const items=finHomeReminders(); if(!items.length)return '';
 const rows=items.map(o=>`<a class="home-fin-reminder-row" href="#financeiro"><span class="home-fin-reminder-icon">${o.days<0?'!':'⏰'}</span><span><strong>${escapeHtml(o.bill.name||'Conta prevista')}</strong><small>${escapeHtml(o.status.label)} · ${formatDate(o.due)}</small></span><b>›</b></a>`).join('');
 return `<section class="day-section home-fin-reminders"><div class="section-head"><h2>Contas para lembrar</h2><a href="#financeiro">ver financeiro</a></div>${rows}</section>`;
}
function renderMeuDia(){
 ensureStudyMeuDiaStyles();
 const d=mvNow(), h=d.getHours(), greet=h<12?'Bom dia':h<18?'Boa tarde':'Boa noite', b=mvCurrentBlock(), p=mvPending();
 const focus=b[3]==='rest'?[['Desacelerar','Nada urgente precisa entrar aqui.']]:p.slice(0,3).map(x=>[x.title||x.name||'Pendência',x.note||'Pendência para hoje']);
 if(!focus.length)focus.push(['Seu essencial está em dia','Use este espaço para viver, descansar ou escolher o que importa.']);
 const w=mvDow(d), ho={1:'16:40–18:40',2:'15:40–17:40',3:'16:40–18:40',4:'15:40–17:40',5:'15:40–17:40'}[w]||'—';
 return `<section class="day-hero"><div class="eyebrow">💜 MEU DIA</div><h1>${greet}, Duaila.</h1><p class="day-date">${mvDate()}</p></section>
 <section class="now-card ${b[3]}"><div class="card-kicker">AGORA</div><div class="now-title">${b[0]}</div><div class="now-time">${b[1]}</div><p>${b[2]}</p></section>
 ${renderFinanceRemindersMeuDia()}
 ${renderFoodMeuDiaMini()}
 <section class="day-section"><div class="section-head"><h2>O que importa hoje</h2><span class="soft-count">${focus.length}</span></div>
 ${focus.map((x,i)=>`<div class="focus-row"><span class="focus-dot">${i+1}</span><div><strong>${x[0]}</strong><small>${x[1]}</small></div></div>`).join('')}</section>
 <section class="day-section"><div class="section-head"><h2>Seu dia, sem excesso</h2></div><div class="timeline">
 <div><b>05:20–07:35</b><span>Manhã protegida · movimento + café + se arrumar</span></div>
 <div><b>08:00–14:00</b><span>Trabalho oficial</span></div>
 ${(w===1||w===3)?'<div><b>14:40–16:10</b><span>Janela estratégica</span></div>':''}
 <div><b>${ho}</b><span>Home office</span></div><div><b>19:00+</b><span>Noite protegida · descanso primeiro</span></div></div></section>
 ${p.length?`<section class="day-section"><div class="section-head"><h2>Pendências que merecem aparecer</h2><a href="#pendencias">ver todas</a></div>${p.map(x=>`<div class="compact-item"><strong>${x.title||x.name||'Pendência'}</strong>${x.dueDate?`<small>${x.dueDate}</small>`:''}</div>`).join('')}</section>`:''}
 ${renderStudySuggestionMeuDia()}
 <section class="quick-grid"><a href="#pendencias">📝<span>Pendências</span></a><a href="#rituais">✨<span>Rituais</span></a><a href="#exercicios">🏃<span>Exercícios</span></a><a href="#alimentacao">🍽️<span>Alimentação</span></a><a href="#receitas">📖<span>Receitas</span></a><a href="#casa">🏠<span>Casa</span></a><a href="#financeiro">💰<span>Financeiro</span></a><a href="#ideias">💡<span>Criação &amp; Ideias</span></a><a href="#estudos">📚<span>Estudos</span></a></section>
 <section class="free-space"><div>☁️</div><strong>Espaço livre também faz parte do dia.</strong><p>Se nada precisa ser resolvido agora, não resolva.</p></section>`;
}

function ensureSoftMeuDiaStyles(){
  if(document.getElementById('soft-meu-dia-styles')) return;
  const style=document.createElement('style');
  style.id='soft-meu-dia-styles';
  style.textContent=`
    .quick-grid{gap:14px!important;}
    .quick-grid a{min-height:104px!important;border:1px solid rgba(92,72,104,.10)!important;box-shadow:0 8px 24px rgba(76,58,82,.06)!important;transition:transform .18s ease,box-shadow .18s ease!important;}
    .quick-grid a:active{transform:scale(.985);}
    .quick-grid a:nth-child(1){background:#f6e5ea!important;}
    .quick-grid a:nth-child(2){background:#eee7f7!important;}
    .quick-grid a:nth-child(3){background:#e5f2ed!important;}
    .quick-grid a:nth-child(4){background:#f8e9df!important;}
    .quick-grid a:nth-child(5){background:#e8f0f7!important;}
    .quick-grid a:nth-child(6){background:#f7f0d9!important;}
    .quick-grid a:nth-child(7){background:#e5f2ed!important;}
    .quick-grid a:nth-child(8){background:#f1e9f5!important;}
    .quick-grid a:nth-child(9){background:#e8eff7!important;}
    .quick-grid a span{font-weight:500!important;}
    .home-fin-reminders{background:linear-gradient(135deg,#fff5e8,#f8edf5)!important;border:1px solid rgba(155,111,91,.10)!important;border-radius:24px!important;padding:16px!important;box-shadow:0 8px 24px rgba(76,58,82,.05)!important;}
    .home-fin-reminder-row{display:grid!important;grid-template-columns:32px minmax(0,1fr) auto!important;align-items:center!important;gap:10px!important;padding:11px 2px!important;text-decoration:none!important;color:inherit!important;border-top:1px solid rgba(92,72,104,.08)!important;}
    .home-fin-reminder-row:first-of-type{border-top:0!important;}
    .home-fin-reminder-icon{display:grid!important;place-items:center!important;width:30px!important;height:30px!important;border-radius:50%!important;background:#fff7df!important;color:#8b6423!important;font-weight:900!important;}
    .home-fin-reminder-row strong,.home-fin-reminder-row small{display:block!important;}
    .home-fin-reminder-row small{margin-top:2px!important;color:#827681!important;font-size:11px!important;}
    .home-fin-reminder-row>b{font-size:24px!important;color:#8e718f!important;font-weight:400!important;}
    .home-recipes-shortcut-wrap{display:flex!important;justify-content:flex-end!important;margin:8px 2px 12px!important;}
    .home-recipes-shortcut{display:inline-flex!important;align-items:center!important;gap:7px!important;min-height:38px!important;padding:7px 12px!important;border:1px solid rgba(173,104,128,.16)!important;border-radius:999px!important;background:linear-gradient(120deg,rgba(255,244,239,.78),rgba(248,226,231,.62))!important;box-shadow:0 5px 16px rgba(93,68,77,.035)!important;text-decoration:none!important;color:#9a5e73!important;font-size:12px!important;font-weight:700!important;letter-spacing:.01em!important;}
    .home-recipes-shortcut-icon{width:17px!important;height:17px!important;display:grid!important;place-items:center!important;color:#a8667d!important;}
    .home-recipes-shortcut-icon svg{width:17px!important;height:17px!important;fill:none!important;stroke:currentColor!important;stroke-width:1.65!important;stroke-linecap:round!important;stroke-linejoin:round!important;}
    .home-recipes-shortcut b{font-size:16px!important;line-height:1!important;font-weight:400!important;color:#a8667d!important;}
  `;
  document.head.appendChild(style);
}

/* NAVEGAÇÃO PRINCIPAL — MINHA VIDA
   A abertura padrão é Meu Dia. A barra inferior mantém quatro acessos:
   B•A · Planos · Rituais · Mais. Planos reúne Tarefas e Compromissos.
*/
function ensureMainNavigation() {
  ensureSoftMeuDiaStyles();
  ensureStudyMeuDiaStyles();
  // Reconstrói uma única barra inferior, mesmo que o index antigo tenha
  // deixado uma barra duplicada/antiga. Isso evita o problema do iPhone
  // mostrar apenas “Rituais | Mais”.
  const navs = Array.from(document.querySelectorAll('.bottom-nav'));
  let nav = navs[0] || null;
  navs.slice(1).forEach(n => n.remove());
  if (!nav) {
    nav = document.createElement('nav');
    nav.className = 'bottom-nav';
    nav.setAttribute('aria-label', 'Navegação principal');
    document.body.appendChild(nav);
  }
  nav.innerHTML = `
    <a class="nav-item" data-route="meu-dia" href="#meu-dia" aria-label="B•A"><strong class="nav-ba">B•A</strong><span>Início</span></a>
    <a class="nav-item" data-route="planos" href="#planos" aria-label="Planos"><span class="nav-line-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6 5.5h12M6 12h12M6 18.5h8"/><path d="M3.5 5.5h.01M3.5 12h.01M3.5 18.5h.01"/></svg></span><span>Planos</span></a>
    <a class="nav-item" data-route="rituais" href="#rituais" aria-label="Rituais">✨<span>Rituais</span></a>
    <button class="nav-item" type="button" data-more="1" aria-label="Mais">☰<span>Mais</span></button>`;
  Object.assign(nav.style, {
    position:'fixed', left:'0', right:'0', bottom:'0', width:'100%', maxWidth:'none',
    margin:'0', transform:'none', display:'grid', gridTemplateColumns:'repeat(4,minmax(0,1fr))',
    boxSizing:'border-box', zIndex:'99999', padding:'8px 10px calc(8px + env(safe-area-inset-bottom))',
    borderRadius:'24px 24px 0 0', background:'rgba(255,250,246,.97)',
    backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)'
  });
  nav.querySelectorAll('.nav-item').forEach(item => Object.assign(item.style, {
    minWidth:'0', width:'100%', display:'flex', alignItems:'center', justifyContent:'center',
    gap:'3px', flexDirection:'column', whiteSpace:'nowrap', boxSizing:'border-box', padding:'6px 2px',
    background:'transparent', border:'0', textDecoration:'none'
  }));
  const more = nav.querySelector('[data-more]');
  if (more) more.onclick = () => document.getElementById('moduleMenu')?.showModal();

  const links = document.querySelector('.module-links');
  if (links) {
    const desired = [
      ['meu-dia','💜 Meu Dia'],
      ['planos','Planos'],
      ['pendencias','Tarefas'],
      ['compromissos','Compromissos'],
      ['ideias','💡 Criação & Ideias'],
      ['estudos','📚 Estudos / CEBRASPE'],
      ['financeiro','💰 Financeiro'],
      ['casa','🏠 Casa'],
      ['exercicios','🏃 Exercícios'],
      ['alimentacao','🍽️ Alimentação'],
      ['receitas','📖 Receitas']
    ];
    links.innerHTML = desired.map(([r,label]) => `<a href="#${r}" data-module-route="${r}">${label}</a>`).join('');
    links.querySelectorAll('[data-module-route]').forEach(a=>a.addEventListener('click',()=>{const route=a.dataset.moduleRoute;const dlg=document.getElementById('moduleMenu');if(dlg?.open)dlg.close();if(route==='financeiro'){setTimeout(()=>{if((location.hash||'').replace('#','')==='financeiro') render();},0);}}));
  }
}

function render() {
  ensureMainNavigation();
  const hash = (location.hash || "").replace("#", "").trim();
  const route = hash || state.route || "meu-dia";
  state.route = route;

  const pageTitle = document.querySelector("#pageTitle");
  if (pageTitle) {
    pageTitle.textContent =
      route === "planos" ? "Planos" :
      route === "pendencias" ? "Tarefas" :
      route === "compromissos" ? "Compromissos" :
      route === "meu-dia" ? "💜 Meu Dia" :
      route === "ideias" ? "💡 Criação & Ideias" :
      route === "rituais" ? "✨ Rituais" :
      route === "estudos" ? "📚 Estudos" :
      route === "financeiro" ? "💰 Financeiro" :
      route === "casa" ? "🏠 Casa" :
      route === "exercicios" ? "🏃 Exercícios" :
      route === "alimentacao" ? "🍽️ Alimentação" :
      route === "receitas" ? "📖 Receitas" :
      route === "compras" ? "Lista de Compras" :
      route === "progresso" ? "Meu Progresso" :
      "Minha Vida";
  }

  document.querySelectorAll(".bottom-nav .nav-item").forEach(b =>
    b.classList.toggle("active", b.dataset.route === route)
  );

  if (route === "meu-dia") {
    app.innerHTML = renderMeuDia();
    return;
  }

  // Trabalho é renderizado exclusivamente por work-v12.js.
  // Evita o placeholder antigo aparecer antes da tela correta.
  if (route === "trabalho" || route.startsWith("trabalho-")) {
    return;
  }

  if (route === "planos") renderPlanos();
  else if (route === "pendencias") renderPendencias();
  else if (route === "compromissos") renderCompromissos();
  else if (route === "ideias") renderIdeias();
  else if (route === "rituais") renderRituais();
  else if (route === "estudos") renderEstudos();
  else if (route === "financeiro") renderFinanceiro();
  else if (route === "casa") renderCasa();
  else if (route === "exercicios") renderExercicios();
  else if (route === "alimentacao") renderAlimentacao();
  else if (route === "receitas") renderReceitas();
  else if (route === "compras") renderShoppingUniversal();
  else if (route === "progresso") renderProgressOverview();
  else renderPlaceholder();
}

// Stable reference for BERTH.A runtime layers; prevents later scripts from replacing the core router.
window.__berthaCoreRender = render;
window.__berthaCoreRenderFinanceiro = renderFinanceiro;
window.addEventListener("hashchange", render);


/* ---------------------------------------------------------
   PLANOS — guarda-chuva de Tarefas + Compromissos
   v2.8.152
   --------------------------------------------------------- */
const BERTHA_COMMITMENTS_KEY='bertha.commitments.v1';
function berthaRead(key,fallback=[]){try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}}
function berthaWrite(key,value){localStorage.setItem(key,JSON.stringify(value))}
function plansEsc(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function plansDatePt(v){if(!v)return'';const d=new Date(v+'T12:00:00');return Number.isNaN(d.getTime())?v:d.toLocaleDateString('pt-BR',{day:'2-digit',month:'short'})}
function plansDuration(x){const n=Math.max(1,+x.durationValue||30),u=x.durationUnit||'minutes';return u==='days'?`${n} dia${n===1?'':'s'}`:u==='hours'?`${n}h`:`${n} min`}
function ensurePlansStyles(){if(document.getElementById('bertha-plans-v152'))return;const st=document.createElement('style');st.id='bertha-plans-v152';st.textContent=`
.nav-line-icon{width:22px;height:22px;display:grid;place-items:center}.nav-line-icon svg{width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}.nav-ba{font-size:16px;letter-spacing:.01em;font-weight:700;line-height:22px}
.plans-page{display:grid;gap:14px}.plans-hero{position:relative;overflow:hidden;padding:23px 22px 22px;border-radius:29px;border:1px solid rgba(177,132,88,.12);background:radial-gradient(circle at 56% 40%,rgba(255,249,223,.88),transparent 28%),linear-gradient(135deg,rgba(255,250,225,.99) 0%,rgba(250,229,204,.72) 54%,rgba(232,185,148,.52) 100%);box-shadow:0 12px 34px rgba(91,69,47,.04)}.plans-hero:before{content:"";position:absolute;left:34%;top:-24%;width:210px;height:180px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,242,.72),rgba(255,255,242,0) 67%);pointer-events:none}.plans-hero:after{content:"";position:absolute;right:-30px;bottom:-58px;width:210px;height:210px;border-radius:50%;background:radial-gradient(circle,rgba(218,153,111,.24),rgba(218,153,111,0) 66%);pointer-events:none}.plans-hero>*{position:relative;z-index:1}.plans-hero .eyebrow{font-size:10.5px;letter-spacing:.19em;font-weight:800;color:#9b7458}.plans-hero h2{margin:7px 0 8px;font-size:25px;line-height:1.07;letter-spacing:-.03em;color:#3d3947;font-weight:510;max-width:290px}.plans-hero p{margin:0;max-width:305px;color:#756d6a;font-size:12.5px;line-height:1.44}.plans-hero-mark{position:absolute;right:20px;top:20px!important;width:46px;height:46px;display:grid;place-items:center;color:#b58a68;opacity:.75}.plans-hero-mark svg{width:40px;height:40px;fill:none;stroke:currentColor;stroke-width:1.35;stroke-linecap:round;stroke-linejoin:round}.plans-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.plans-entry{appearance:none;text-align:left;border:1px solid rgba(151,112,80,.08);border-radius:22px;padding:17px;background:linear-gradient(140deg,rgba(255,251,232,.99),rgba(246,222,198,.62));color:#403a40;min-height:128px;box-shadow:0 8px 22px rgba(95,68,42,.025)}.plans-entry.commit{background:linear-gradient(140deg,rgba(255,250,225,.99),rgba(235,194,160,.58))}.plans-entry svg{width:25px;height:25px;fill:none;stroke:#b78365;stroke-width:1.55;stroke-linecap:round;stroke-linejoin:round}.plans-entry strong{display:block;margin-top:18px;font-size:17px}.plans-entry span{display:block;margin-top:5px;font-size:11.5px;line-height:1.35;color:#847875}.plans-summary{display:grid;gap:10px}.plans-summary-card{border:1px solid rgba(105,88,75,.07);border-radius:20px;background:#fdf9f3;padding:15px}.plans-summary-card .k{font-size:10px;letter-spacing:.14em;font-weight:800;color:#9c8170}.plans-summary-card strong{display:block;margin-top:6px;color:#413b43;font-size:15px}.plans-summary-card small{display:block;margin-top:4px;color:#8d8280}.commit-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.commit-add{border:0;border-radius:16px;padding:12px 15px;background:linear-gradient(135deg,#f7e8b8 0%,#e7bd87 45%,#cf8f67 100%);color:#fff;font-weight:800;box-shadow:0 8px 20px rgba(172,116,74,.12)}.commit-section{margin-top:18px}.commit-section h3{margin:0 0 9px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#887871}.commit-card{display:grid;grid-template-columns:64px minmax(0,1fr) 34px;gap:10px;align-items:center;padding:13px 11px;border:1px solid rgba(110,91,75,.07);border-radius:18px;background:#fdf9f3;margin-bottom:8px}.commit-time{font-size:13px;font-weight:800;color:#b47c5a}.commit-copy strong{display:block;font-size:14px;color:#413b43}.commit-copy small{display:block;margin-top:4px;color:#8a7f7b;font-size:11px}.commit-more{border:0;background:transparent;color:#9a8d89;font-size:22px}.commit-empty{padding:18px;border:1px dashed rgba(126,104,86,.14);border-radius:18px;color:#918580;font-size:12px;background:rgba(255,250,243,.5)}
.commit-dialog{border:0;padding:0;background:transparent;max-width:none}.commit-dialog::backdrop{background:rgba(53,48,52,.30);backdrop-filter:blur(4px)}.commit-modal{box-sizing:border-box;width:min(92vw,520px);max-height:min(88dvh,760px);overflow:auto;background:#fbf7f0;border:1px solid rgba(140,126,145,.10);border-radius:26px;padding:20px;box-shadow:0 20px 52px rgba(47,37,58,.14)}.commit-modal-head{display:flex;justify-content:space-between;align-items:flex-start;gap:14px;margin-bottom:15px}.commit-modal-head .eyebrow{font-size:10px;letter-spacing:.16em;font-weight:800;color:#9c7b64}.commit-modal-head h2{margin:5px 0 0;font-size:22px;color:#373440;font-weight:620}.commit-x{border:0!important;outline:0!important;box-shadow:none!important;background:rgba(247,243,237,.82)!important;color:#8e8792!important;font-size:23px;line-height:1;width:36px;height:36px;border-radius:50%;display:grid;place-items:center;padding:0}.commit-field{display:block;margin:11px 0;min-width:0}.commit-field>span{display:block;font-size:11.5px;font-weight:740;color:#655f67;margin-bottom:6px}.commit-field input,.commit-field select,.commit-field textarea{box-sizing:border-box;width:100%;min-width:0;max-width:100%;min-height:46px;border:1px solid rgba(140,126,145,.14);border-radius:15px;background:#fffdfa;padding:11px 12px;color:#3e3d4b;font:inherit;font-size:16px}.commit-field textarea{min-height:86px;resize:vertical}.commit-two{display:grid;grid-template-columns:minmax(0,1fr);gap:0}.commit-duration{display:grid;grid-template-columns:1fr 1.2fr;gap:9px}.commit-toggle-row{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:13px 0}.commit-toggle-row>div strong{display:block;font-size:13px;color:#4c4650}.commit-toggle-row>div small{display:block;margin-top:3px;font-size:11px;color:#8d848c}.commit-toggle{position:relative;width:48px;height:28px;flex:0 0 auto}.commit-toggle input{position:absolute;opacity:0}.commit-toggle i{display:block;width:48px;height:28px;border-radius:999px;background:#ded8d3;transition:.18s}.commit-toggle i:after{content:"";display:block;width:22px;height:22px;border-radius:50%;background:white;box-shadow:0 2px 6px rgba(0,0,0,.13);transform:translate(3px,3px);transition:.18s}.commit-toggle input:checked+i{background:#dfaa85}.commit-toggle input:checked+i:after{transform:translate(23px,3px)}.commit-expand{display:none}.commit-expand.on{display:block}.commit-actions{display:flex;justify-content:flex-end;gap:9px;margin-top:18px}.commit-actions button{border:0;border-radius:15px;padding:11px 16px;font-weight:800}.commit-actions .secondary{background:rgba(255,255,255,.72);color:#706972;border:1px solid rgba(140,126,145,.12)}.commit-actions .primary{background:linear-gradient(135deg,#f7e8b8 0%,#e7bd87 45%,#cf8f67 100%);color:white}.commit-delete{margin-right:auto!important;background:#fff1ee!important;color:#ad695e!important}.commit-reminder{display:grid;grid-template-columns:1fr 1.35fr;gap:9px}
@media(max-width:480px){.plans-grid{grid-template-columns:1fr 1fr}.plans-entry{padding:15px;min-height:118px}.commit-two,.commit-duration,.commit-reminder{grid-template-columns:1fr 1fr}.commit-modal{width:calc(100vw - 24px);max-height:calc(100dvh - 24px);padding:18px}}
/* v2.8.153 — Tarefas: linguagem enxuta + modal Planos forçado após estilos dinâmicos */
#pendingDialog[open] #pendingForm.modal-card{background:#fbf7f0!important;border-color:rgba(177,132,88,.10)!important}
#pendingDialog[open] .modal-head{background:linear-gradient(135deg,rgba(255,252,232,.98) 0%,rgba(247,226,198,.90) 56%,rgba(224,170,128,.62) 100%)!important;border-bottom:1px solid rgba(177,132,88,.10)!important}
#pendingDialog[open] .modal-head .eyebrow{color:#9b7458!important}
#pendingDialog[open] .modal-head h2{color:#3d3947!important}
#pendingDialog[open] input,#pendingDialog[open] select,#pendingDialog[open] textarea{background:#fffdfa!important;border-color:rgba(177,132,88,.14)!important}
#pendingDialog[open] input:focus,#pendingDialog[open] select:focus,#pendingDialog[open] textarea:focus{border-color:rgba(191,127,78,.38)!important;box-shadow:0 0 0 3px rgba(231,186,140,.12)!important}
#pendingDialog[open] .modal-actions{background:rgba(251,247,240,.97)!important;border-top-color:rgba(177,132,88,.09)!important}
#pendingDialog[open] .modal-actions .primary{background:linear-gradient(135deg,#fff1bd 0%,#e8bd88 52%,#cb855f 100%)!important;color:#fff!important}
#pendingDialog[open] .modal-head .icon-btn{background:rgba(255,252,245,.82)!important;border-color:rgba(132,105,86,.10)!important;color:#7e777a!important}
/* Tarefas dentro de Planos — mesma família amarelo-creme + pêssego */
.plans-task-hero{position:relative;overflow:hidden!important;border:1px solid rgba(177,132,88,.12)!important;background:radial-gradient(circle at 52% 32%,rgba(255,254,235,.82),transparent 30%),linear-gradient(135deg,rgba(255,251,229,.99) 0%,rgba(248,225,198,.72) 58%,rgba(221,167,126,.50) 100%)!important;box-shadow:0 12px 34px rgba(91,69,47,.04)!important}
.plans-task-hero .eyebrow{font-size:10.5px!important;letter-spacing:.19em!important;font-weight:800!important;color:#9b7458!important;margin-bottom:7px!important}
.plans-task-hero h2{font-size:25px!important;line-height:1.07!important;font-weight:510!important;letter-spacing:-.03em!important;color:#3d3947!important;margin:0 0 8px!important}
.plans-task-hero p{font-size:12.5px!important;line-height:1.44!important;color:#756d6a!important;margin:0!important}
#addBtn.primary{background:linear-gradient(135deg,#fbefc5 0%,#e8bd88 52%,#cf8f67 100%)!important;color:#fff!important;border:0!important;box-shadow:0 8px 20px rgba(172,116,74,.12)!important}
.tabs .tab.active{background:linear-gradient(135deg,rgba(249,235,196,.94),rgba(226,177,136,.88))!important;color:#785b46!important;border-color:rgba(177,132,88,.12)!important}
.pending-card .check.done{background:#d29a68!important;border-color:#d29a68!important}
`;document.head.appendChild(st)}
function renderPlanos(){ensurePlansStyles();const tasks=loadPendencias().filter(x=>!x.done&&!x.completed);const commits=berthaRead(BERTHA_COMMITMENTS_KEY,[]).filter(x=>x.active!==false);const today=new Date().toISOString().slice(0,10);const next=commits.filter(x=>x.date>=today).sort((a,b)=>`${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))[0];app.innerHTML=`<div class="plans-page"><section class="plans-hero"><div class="eyebrow">PLANOS</div><h2>Everything in its place. Life in motion.</h2><p>Você planeja. A BERTH.A organiza.</p><div class="plans-hero-mark" aria-hidden="true"><svg viewBox="0 0 48 48"><path d="M12 30c5-8 11-12 18-12 3 0 6 .7 9 2.2"/><path d="M12 35c8-3 15-4 24-2"/><path d="M31 13l4 4-4 4"/></svg></div></section><div class="plans-grid"><button class="plans-entry" data-open-tasks><svg viewBox="0 0 24 24"><path d="M6 5.5h12M6 12h12M6 18.5h8"/><path d="M3.5 5.5h.01M3.5 12h.01M3.5 18.5h.01"/></svg><strong>Tarefas</strong><span>O que precisa ser feito.</span></button><button class="plans-entry commit" data-open-commitments><svg viewBox="0 0 24 24"><rect x="4" y="5.5" width="16" height="14" rx="2.5"/><path d="M8 3.5v4M16 3.5v4M4 9.5h16"/></svg><strong>Compromissos</strong><span>O que já ocupa data e horário.</span></button></div><div class="plans-summary"><div class="plans-summary-card"><div class="k">TAREFAS ABERTAS</div><strong>${tasks.length} ${tasks.length===1?'tarefa':'tarefas'}</strong><small>${tasks[0]?plansEsc(tasks[0].title||tasks[0].name||'Próxima tarefa'):'Nada pendente agora.'}</small></div><div class="plans-summary-card"><div class="k">PRÓXIMO COMPROMISSO</div><strong>${next?`${plansDatePt(next.date)} · ${plansEsc(next.time||'sem horário')}`:'Nenhum compromisso próximo'}</strong><small>${next?plansEsc(next.title):'Seu tempo ainda está aberto.'}</small></div></div></div>`;document.querySelector('[data-open-tasks]').onclick=()=>location.hash='#pendencias';document.querySelector('[data-open-commitments]').onclick=()=>location.hash='#compromissos'}
function commitmentOccursOn(x,date){if(x.active===false)return false;if(x.repeat==='none'||!x.repeat)return x.date===date;if(x.date>date)return false;if(x.repeatUntil&&date>x.repeatUntil)return false;const start=new Date(x.date+'T12:00:00'),d=new Date(date+'T12:00:00');const days=Math.floor((d-start)/86400000);if(days<0)return false;if(x.repeat==='daily')return true;if(x.repeat==='weekly')return days%7===0;if(x.repeat==='weekdays')return (x.weekdays||[]).includes(d.getDay());if(x.repeat==='monthly')return d.getDate()===start.getDate();return false}
function renderCompromissos(){ensurePlansStyles();const all=berthaRead(BERTHA_COMMITMENTS_KEY,[]).filter(x=>x.active!==false);const today=new Date().toISOString().slice(0,10),tom=new Date(Date.now()+86400000).toISOString().slice(0,10);const todayItems=all.filter(x=>commitmentOccursOn(x,today)).sort((a,b)=>(a.time||'99:99').localeCompare(b.time||'99:99'));const upcoming=all.filter(x=>x.repeat==='none'&&x.date>today).sort((a,b)=>`${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)).slice(0,12);const recurring=all.filter(x=>x.repeat&&x.repeat!=='none');const card=x=>`<div class="commit-card"><div class="commit-time">${plansEsc(x.time||'—')}</div><div class="commit-copy"><strong>${plansEsc(x.title)}</strong><small>${plansEsc(plansDuration(x))}${x.location?` · ${plansEsc(x.location)}`:''}</small></div><button class="commit-more" data-edit-commit="${plansEsc(x.id)}">›</button></div>`;app.innerHTML=`<div class="plans-page"><section class="plans-hero"><div class="commit-head"><div><div class="eyebrow">PLANOS · COMPROMISSOS</div><h2>Everything in its place. Life in motion.</h2><p>Você marca. A BERTH.A lembra você.</p></div></div><div class="plans-hero-mark" aria-hidden="true"><svg viewBox="0 0 48 48"><rect x="11" y="13" width="26" height="24" rx="7"/><path d="M17 10v7M31 10v7M11 21h26"/></svg></div></section><button class="commit-add" data-new-commit>＋ Novo compromisso</button><section class="commit-section"><h3>Hoje</h3>${todayItems.length?todayItems.map(card).join(''):'<div class="commit-empty">Nenhum compromisso marcado para hoje.</div>'}</section><section class="commit-section"><h3>Próximos</h3>${upcoming.length?upcoming.map(x=>`<div class="commit-card"><div class="commit-time">${plansDatePt(x.date)}</div><div class="commit-copy"><strong>${plansEsc(x.title)}</strong><small>${plansEsc(x.time||'sem horário')} · ${plansEsc(plansDuration(x))}</small></div><button class="commit-more" data-edit-commit="${plansEsc(x.id)}">›</button></div>`).join(''):'<div class="commit-empty">Nenhum próximo compromisso.</div>'}</section><section class="commit-section"><h3>Recorrentes</h3>${recurring.length?recurring.map(card).join(''):'<div class="commit-empty">Nenhum compromisso recorrente.</div>'}</section></div>`;document.querySelector('[data-new-commit]').onclick=()=>openCommitmentModal();document.querySelectorAll('[data-edit-commit]').forEach(b=>b.onclick=()=>openCommitmentModal(b.dataset.editCommit))}
function openCommitmentModal(id=null){ensurePlansStyles();const all=berthaRead(BERTHA_COMMITMENTS_KEY,[]),x=id?all.find(a=>String(a.id)===String(id)):null;const dlg=document.createElement('dialog');dlg.className='commit-dialog';const today=new Date().toISOString().slice(0,10);dlg.innerHTML=`<form class="commit-modal" method="dialog"><div class="commit-modal-head"><div><div class="eyebrow">PLANOS · COMPROMISSOS</div><h2>${x?'Editar compromisso':'Novo compromisso'}</h2></div><button class="commit-x" type="button" data-close>×</button></div><label class="commit-field"><span>Título</span><input data-title value="${plansEsc(x?.title||'')}" placeholder="Ex.: Dentista"></label><div class="commit-two"><label class="commit-field"><span>Data</span><input type="date" data-date value="${plansEsc(x?.date||today)}"></label><label class="commit-field"><span>Horário</span><input type="time" data-time value="${plansEsc(x?.time||'')}"></label></div><label class="commit-field"><span>Duração</span><div class="commit-duration"><input type="number" min="1" inputmode="numeric" data-duration value="${x?.durationValue||60}"><select data-duration-unit><option value="minutes" ${x?.durationUnit!=='hours'&&x?.durationUnit!=='days'?'selected':''}>minutos</option><option value="hours" ${x?.durationUnit==='hours'?'selected':''}>horas</option><option value="days" ${x?.durationUnit==='days'?'selected':''}>dias</option></select></div></label><div class="commit-toggle-row"><div><strong>Repetir?</strong><small>Para compromissos que voltam ao calendário.</small></div><label class="commit-toggle"><input type="checkbox" data-repeat-toggle ${x?.repeat&&x.repeat!=='none'?'checked':''}><i></i></label></div><div class="commit-expand ${x?.repeat&&x.repeat!=='none'?'on':''}" data-repeat-box><label class="commit-field"><span>Frequência</span><select data-repeat><option value="daily" ${x?.repeat==='daily'?'selected':''}>Todos os dias</option><option value="weekdays" ${x?.repeat==='weekdays'?'selected':''}>Dias específicos</option><option value="weekly" ${x?.repeat==='weekly'?'selected':''}>Semanal</option><option value="monthly" ${x?.repeat==='monthly'?'selected':''}>Mensal</option></select></label><div data-weekdays style="display:${x?.repeat==='weekdays'?'block':'none'}"><label class="commit-field"><span>Dias da semana</span><select multiple data-weekdays-select size="4"><option value="1">Segunda</option><option value="2">Terça</option><option value="3">Quarta</option><option value="4">Quinta</option><option value="5">Sexta</option><option value="6">Sábado</option><option value="0">Domingo</option></select></label></div><label class="commit-field"><span>Até quando?</span><select data-repeat-mode><option value="forever" ${!x?.repeatUntil?'selected':''}>Sem data final</option><option value="date" ${x?.repeatUntil?'selected':''}>Até uma data</option></select></label><label class="commit-field ${x?.repeatUntil?'':'commit-expand'}" data-repeat-until-wrap><span>Data final</span><input type="date" data-repeat-until value="${plansEsc(x?.repeatUntil||'')}"></label></div><div class="commit-toggle-row"><div><strong>Me avisar?</strong><small>A BERTH.A pode lembrar antes.</small></div><label class="commit-toggle"><input type="checkbox" data-notify ${x?.notify?'checked':''}><i></i></label></div><div class="commit-expand ${x?.notify?'on':''}" data-notify-box><label class="commit-field"><span>Quando avisar?</span><div class="commit-reminder"><input type="number" min="0" inputmode="numeric" data-notify-value value="${x?.notifyValue??15}"><select data-notify-unit><option value="minutes" ${x?.notifyUnit!=='hours'&&x?.notifyUnit!=='days'?'selected':''}>minutos antes</option><option value="hours" ${x?.notifyUnit==='hours'?'selected':''}>horas antes</option><option value="days" ${x?.notifyUnit==='days'?'selected':''}>dias antes</option></select></div></label></div><label class="commit-field"><span>Local ou link <small style="font-weight:500;color:#9b9298">(opcional)</small></span><input data-location value="${plansEsc(x?.location||'')}"></label><label class="commit-field"><span>Observação <small style="font-weight:500;color:#9b9298">(opcional)</small></span><textarea data-note>${plansEsc(x?.note||'')}</textarea></label><div class="commit-actions">${x?'<button type="button" class="commit-delete" data-delete>Excluir</button>':''}<button type="button" class="secondary" data-close>Cancelar</button><button type="button" class="primary" data-save>Salvar</button></div></form>`;document.body.appendChild(dlg);const close=()=>{dlg.close();dlg.remove()};dlg.querySelectorAll('[data-close]').forEach(b=>b.onclick=close);const rt=dlg.querySelector('[data-repeat-toggle]'),rb=dlg.querySelector('[data-repeat-box]'),rs=dlg.querySelector('[data-repeat]'),wd=dlg.querySelector('[data-weekdays]'),rm=dlg.querySelector('[data-repeat-mode]'),ruw=dlg.querySelector('[data-repeat-until-wrap]'),nt=dlg.querySelector('[data-notify]'),nb=dlg.querySelector('[data-notify-box]');rt.onchange=()=>rb.classList.toggle('on',rt.checked);rs.onchange=()=>wd.style.display=rs.value==='weekdays'?'block':'none';rm.onchange=()=>ruw.classList.toggle('commit-expand',rm.value!=='date');nt.onchange=()=>nb.classList.toggle('on',nt.checked);if(x?.weekdays?.length){[...dlg.querySelector('[data-weekdays-select]').options].forEach(o=>o.selected=x.weekdays.includes(+o.value))}dlg.querySelector('[data-save]').onclick=()=>{const title=dlg.querySelector('[data-title]').value.trim();if(!title){dlg.querySelector('[data-title]').focus();return}const repeat=rt.checked?rs.value:'none',repeatUntil=rt.checked&&rm.value==='date'?dlg.querySelector('[data-repeat-until]').value:'';const data={id:x?.id||`commit-${Date.now()}`,title,date:dlg.querySelector('[data-date]').value||today,time:dlg.querySelector('[data-time]').value,durationValue:Math.max(1,+dlg.querySelector('[data-duration]').value||60),durationUnit:dlg.querySelector('[data-duration-unit]').value,repeat,weekdays:repeat==='weekdays'?[...dlg.querySelector('[data-weekdays-select]').selectedOptions].map(o=>+o.value):[],repeatUntil,notify:nt.checked,notifyValue:Math.max(0,+dlg.querySelector('[data-notify-value]').value||0),notifyUnit:dlg.querySelector('[data-notify-unit]').value,location:dlg.querySelector('[data-location]').value.trim(),note:dlg.querySelector('[data-note]').value.trim(),active:true,updatedAt:Date.now(),createdAt:x?.createdAt||Date.now()};const i=all.findIndex(a=>String(a.id)===String(data.id));if(i>=0)all[i]=data;else all.push(data);berthaWrite(BERTHA_COMMITMENTS_KEY,all);close();renderCompromissos()};if(x)dlg.querySelector('[data-delete]').onclick=()=>{berthaWrite(BERTHA_COMMITMENTS_KEY,all.filter(a=>String(a.id)!==String(x.id)));close();renderCompromissos()};dlg.addEventListener('cancel',e=>{e.preventDefault();close()});dlg.showModal()}

function renderPendencias() {
  const all = loadPendencias();
  const filtered = all
    .filter(p => state.filter === "abertas" ? !p.done : p.done)
    .filter(p => !state.search || `${p.title} ${p.category} ${p.note}`.toLowerCase().includes(state.search.toLowerCase()))
    .sort((a,b) => {
      if (a.done !== b.done) return Number(a.done)-Number(b.done);
      if (!a.due && !b.due) return b.createdAt-a.createdAt;
      if (!a.due) return 1;
      if (!b.due) return -1;
      return a.due.localeCompare(b.due);
    });

  const openCount = all.filter(p => !p.done).length;
  app.innerHTML = `
    <section class="hero plans-task-hero">
      <div class="eyebrow">PLANOS · TAREFAS</div><h2>Everything handled. Nothing carried.</h2>
      <p>Você registra. A BERTH.A encaixa no seu tempo.</p>
    </section>

    <div class="add-row">
      <input class="search" id="searchInput" placeholder="Buscar tarefa..." value="${escapeHtml(state.search)}">
      <button class="primary" id="addBtn">＋ Adicionar</button>
    </div>

    <div class="tabs">
      <button class="tab ${state.filter==="abertas"?"active":""}" data-filter="abertas">Abertas ${openCount ? `· ${openCount}` : ""}</button>
      <button class="tab ${state.filter==="concluidas"?"active":""}" data-filter="concluidas">Concluídas</button>
    </div>

    <div class="list">
      ${filtered.length ? filtered.map(cardHtml).join("") : emptyHtml()}
    </div>
  `;

  document.querySelector("#addBtn").onclick = () => openModal();
  document.querySelector("#searchInput").oninput = e => { state.search=e.target.value; renderPendencias(); };
  document.querySelectorAll("[data-filter]").forEach(b => b.onclick = () => { state.filter=b.dataset.filter; renderPendencias(); });
  document.querySelectorAll("[data-id]").forEach(card => {
    const id = card.dataset.id;
    card.querySelector(".check").onclick = e => { e.stopPropagation(); toggleDone(id); };
    card.querySelector(".more").onclick = e => { e.stopPropagation(); openModal(id); };
    card.onclick = e => {
      if (e.target.closest(".check,.more")) return;
      openModal(id);
    };
  });
}

function cardHtml(p) {
  const due = p.due ? `<span class="pill ${dueClass(p.due)}">${p.due < todayISO() ? "Vencida · " : ""}${formatDate(p.due)}</span>` : "";
  return `
    <article class="card pending-card" data-id="${p.id}">
      <div class="pending">
        <button class="check ${p.done ? "done":""}" aria-label="${p.done?"Reabrir":"Concluir"}"></button>
        <div class="pending-main">
          <div class="pending-title ${p.done?"done-text":""}">${escapeHtml(p.title)}</div>
          <div class="meta">
            <span class="pill">${escapeHtml(p.category)}</span>${due}
          </div>
          ${p.note ? `<p class="note">${escapeHtml(p.note)}</p>` : ""}
        </div>
        <button class="more" aria-label="Editar">•••</button>
      </div>
    </article>`;
}
function emptyHtml() {
  return state.filter === "abertas" ? `
    <div class="empty">
      <strong>Nada precisa de você agora.</strong>
      <span>Se algo surgir, coloque aqui. Você não precisa lembrar.</span>
    </div>` : `
    <div class="empty">
      <div class="symbol">✓</div>
      <strong>Ainda não há concluídas.</strong>
      <span>Quando você resolver algo, ele ficará aqui.</span>
    </div>`;
}

function openModal(id=null) {
  state.editingId = id;
  const p = id ? loadPendencias().find(x => x.id===id) : null;
  document.querySelector("#dialogEyebrow").textContent = p ? "EDITAR TAREFA" : "NOVA TAREFA";
  document.querySelector("#dialogTitle").textContent = p ? "Editar tarefa" : "Adicionar tarefa";
  document.querySelector("#pendingTitle").value = p?.title || "";
  document.querySelector("#pendingCategory").value = p?.category || "Pessoal";
  document.querySelector("#pendingDue").value = p?.due || "";
  document.querySelector("#pendingNote").value = p?.note || "";
  document.querySelector("#deletePendingBtn").hidden = !p;
  dialog.showModal();
}

function closeModal() {
  dialog.close();
  state.editingId = null;
}
document.querySelector("#cancelPendingBtn").onclick = closeModal;
document.querySelector("#deletePendingBtn").onclick = () => {
  if (!state.editingId) return;
  if (confirm("Excluir esta tarefa?")) {
    savePendencias(loadPendencias().filter(p => p.id !== state.editingId));
    closeModal(); renderPendencias();
  }
};

form.addEventListener("submit", e => {
  e.preventDefault();
  const items = loadPendencias();
  const data = {
    title: document.querySelector("#pendingTitle").value.trim(),
    category: document.querySelector("#pendingCategory").value,
    due: document.querySelector("#pendingDue").value,
    note: document.querySelector("#pendingNote").value.trim()
  };
  if (!data.title) return;
  if (state.editingId) {
    const i = items.findIndex(p => p.id===state.editingId);
    items[i] = {...items[i], ...data, updatedAt:Date.now()};
  } else {
    items.push({id:uid(), ...data, done:false, createdAt:Date.now(), updatedAt:Date.now()});
  }
  savePendencias(items);
  closeModal();
  renderPendencias();
});

function toggleDone(id) {
  const items = loadPendencias();
  const i = items.findIndex(p => p.id===id);
  if (i < 0) return;
  items[i].done = !items[i].done;
  items[i].updatedAt = Date.now();
  items[i].completedAt = items[i].done ? Date.now() : null;
  savePendencias(items);
  renderPendencias();
}


/* =========================================================
   CRIAÇÃO & IDEIAS — v2.8.140 · cards com fundo creme e véus azul/lilás
   Ideia = captura leve | Plano = horizonte | Projeto = execução em blocos
========================================================= */

const IDEAS_KEY = "minha-vida.ideias.v1";
let ideaFilter = "todas";

function loadIdeias(){ try{return JSON.parse(localStorage.getItem(IDEAS_KEY))||[]}catch{return[]} }
function saveIdeias(items){ localStorage.setItem(IDEAS_KEY,JSON.stringify(items)); }
function minsLabel(n){n=Math.max(0,+n||0);if(n>=60){const h=Math.floor(n/60),m=n%60;return `${h}h${m?` ${m}min`:''}`}return `${n} min`}
function projectBlocks(x){return (Array.isArray(x.sessionMinutes)?x.sessionMinutes:[]).map(Number).filter(n=>n>0).sort((a,b)=>a-b)}
function projectRemaining(x){const total=Math.max(0,+x.totalMinutes||0),done=Math.max(0,+x.progressMinutes||0);return total?Math.max(0,total-done):0}
function ideaSafeLink(url){try{const u=new URL(String(url||'').trim());return /^https?:$/.test(u.protocol)?u.href:''}catch(e){return ''}}

function ensureIdeasV297Styles(){
  if(document.querySelector('#ideasV297Styles')) return;
  const st=document.createElement('style'); st.id='ideasV297Styles'; st.textContent=`
  :root{--idea-blue:#6ea9dc;--idea-periwinkle:#8fa7ea;--idea-lav:#b6a6ea;--idea-ink:#30354d;--idea-cream:#fffaf4}
  .idea-hero{position:relative;overflow:hidden;padding:22px 24px!important;border:1px solid rgba(111,154,202,.20)!important;border-radius:28px!important;background:linear-gradient(118deg,rgba(223,239,252,.88),rgba(255,250,244,.96) 48%,rgba(236,231,252,.72))!important;box-shadow:0 14px 34px rgba(73,89,119,.06)!important}
  .idea-hero:before{content:"";position:absolute;inset:-70% -25% auto 25%;height:220px;background:radial-gradient(ellipse,rgba(139,190,231,.22),transparent 67%);filter:blur(18px);pointer-events:none}
  .idea-hero-kicker{position:relative;font-size:12px;letter-spacing:.18em;font-weight:750;color:#5689b8;margin-bottom:12px}
  .idea-hero h2{position:relative;margin:0 0 8px!important;font-size:30px!important;line-height:1.06!important;font-weight:520!important;color:var(--idea-ink)!important;letter-spacing:-.025em}
  .idea-hero p{position:relative;margin:0!important;max-width:88%;font-size:15px!important;line-height:1.45!important;color:#6f7587!important}
  .idea-hero + .add-row{margin-top:15px!important}
  .idea-card{position:relative;overflow:hidden;background:linear-gradient(130deg,rgba(251,249,244,.96),rgba(239,246,253,.80) 52%,rgba(238,233,250,.64))!important;border:1px solid rgba(122,157,196,.12)!important;box-shadow:0 10px 28px rgba(73,89,119,.045)!important}
  .idea-card:before{content:"";position:absolute;inset:-30% auto auto -18%;width:210px;height:210px;border-radius:50%;background:radial-gradient(circle,rgba(171,208,236,.16),transparent 62%);pointer-events:none}
  .idea-card:after{content:"";position:absolute;right:-52px;bottom:-68px;width:210px;height:210px;border-radius:50%;background:radial-gradient(circle,rgba(204,196,241,.16),transparent 60%);pointer-events:none}
  .idea-card .pending{position:relative;z-index:1}
  .idea-card .idea-symbol{color:#8ba9c8!important}
  .idea-card .pending-title{color:#30354d!important}
  .idea-card .note{color:#7c8190!important}
  .idea-card .pill{background:rgba(236,226,212,.80)!important;color:#806f63!important;border:1px solid rgba(186,167,145,.10)!important}
  .idea-card .idea-link{background:rgba(224,235,246,.72)!important;color:#5b87b0!important;border-color:rgba(112,157,205,.12)!important}
  .idea-card .idea-more{color:#8b90a0!important}
  .idea-hero-mark{position:absolute;right:22px;top:22px;font-size:24px;color:rgba(88,144,194,.48);font-weight:300}
  #addIdeaBtn.primary,#ideaDialog .primary{border:0!important;background:linear-gradient(105deg,#74afe0 0%,#7fa6e6 55%,#aa96e7 100%)!important;color:white!important;box-shadow:0 9px 22px rgba(99,143,207,.16)!important}
  .idea-tabs .idea-tab.active{background:linear-gradient(110deg,rgba(211,232,248,.94),rgba(229,230,249,.78))!important;color:#3976aa!important;box-shadow:none!important}
  .idea-empty .symbol{display:none!important}.idea-empty{padding-top:70px!important}.idea-spark{font-size:27px;color:#80add1;margin-bottom:15px;font-weight:300}.idea-empty strong{color:#30354d!important}.idea-empty span{color:#7c8190!important;line-height:1.45!important}
  #ideaDialog{background:transparent!important;border:0!important;box-shadow:none!important}
  #ideaDialog::backdrop{background:rgba(48,46,54,.32)!important;backdrop-filter:blur(7px);-webkit-backdrop-filter:blur(7px)}
  #ideaDialog #ideaForm.bertha-modal{background:linear-gradient(145deg,rgba(255,251,245,.985) 0%,rgba(245,250,255,.985) 48%,rgba(244,241,253,.965) 100%)!important;border:1px solid rgba(123,158,194,.18)!important;box-shadow:0 26px 70px rgba(44,55,78,.18)!important;color:var(--idea-ink)!important}
  #ideaDialog #ideaForm.bertha-modal{position:relative!important;isolation:isolate!important}
  #ideaDialog #ideaForm.bertha-modal:before{content:"";position:absolute;z-index:-1;pointer-events:none;inset:0;border-radius:inherit;background:radial-gradient(ellipse at 12% 8%,rgba(166,211,242,.16),transparent 34%),radial-gradient(ellipse at 92% 76%,rgba(184,166,235,.12),transparent 38%)}
  #ideaDialog .bertha-modal-head{align-items:flex-start!important;margin-bottom:12px!important}
  #ideaDialog .eyebrow{font-size:11px!important;letter-spacing:.18em!important;color:#5d91bd!important;font-weight:760!important}
  #ideaDialog .bertha-modal-head h2{font-size:25px!important;font-weight:540!important;letter-spacing:-.025em!important;color:#30354d!important;margin:4px 0 2px!important}
  #ideaDialog .idea-modal-sub{margin:0!important;color:#858a99!important;font-size:13px!important}
  #ideaDialog [data-close]{color:#4e88bc!important;background:rgba(235,244,252,.72)!important;border:0!important;border-radius:999px!important;width:36px!important;height:36px!important;font-size:25px!important;line-height:1!important}
  #ideaDialog .idea-native-type{position:absolute!important;width:1px!important;height:1px!important;overflow:hidden!important;clip:rect(0 0 0 0)!important;clip-path:inset(50%)!important;white-space:nowrap!important}
  #ideaDialog .idea-type-segments{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;padding:4px;margin:4px 0 16px;background:rgba(244,243,244,.72);border-radius:999px}
  #ideaDialog .idea-type-segments button{min-height:36px;border:0;border-radius:999px;background:transparent;color:#7b7e8c;font-size:14px;font-weight:600}
  #ideaDialog .idea-type-segments button.active{background:linear-gradient(110deg,rgba(200,227,247,.96),rgba(215,220,249,.92));color:#326fa4;box-shadow:0 2px 8px rgba(84,121,166,.08)}
  #ideaDialog label{color:#34394d!important;font-size:14px!important;font-weight:620!important}
  #ideaDialog input,#ideaDialog select,#ideaDialog textarea{min-height:46px!important;border:1px solid rgba(112,135,164,.18)!important;border-radius:13px!important;background:rgba(255,255,255,.74)!important;color:#30354d!important;padding:11px 13px!important;outline:none!important;box-shadow:none!important}
  #ideaDialog textarea{min-height:92px!important;resize:none!important}
  #ideaDialog input:focus,#ideaDialog select:focus,#ideaDialog textarea:focus{border-color:rgba(103,160,211,.55)!important;box-shadow:0 0 0 3px rgba(119,172,218,.10)!important}
  #ideaDialog #ideaConditional>.card,#ideaDialog #projectTrackOptions{background:linear-gradient(120deg,rgba(229,242,252,.72),rgba(241,238,253,.58))!important;border:1px solid rgba(119,157,197,.12)!important;border-radius:17px!important;box-shadow:none!important}
  #ideaDialog #projectTrackOptions label{font-size:13px!important;font-weight:520!important}
  #ideaDialog input[type=checkbox]{appearance:none!important;-webkit-appearance:none!important;width:20px!important;min-width:20px!important;height:20px!important;min-height:20px!important;padding:0!important;border-radius:6px!important;border:1.5px solid rgba(92,126,161,.45)!important;background:rgba(255,255,255,.75)!important;display:grid!important;place-content:center!important}
  #ideaDialog input[type=checkbox]:checked{background:linear-gradient(135deg,#69a8dc,#8c9fe2)!important;border-color:transparent!important}
  #ideaDialog input[type=checkbox]:checked:after{content:"✓";color:white;font-size:13px;font-weight:800;line-height:1}
  #ideaDialog .idea-inline-spark{color:#6f9fc7;font-size:17px}
  #ideaDialog .modal-actions{border-top:0!important;margin-top:8px!important}
  #ideaDialog .modal-actions .secondary{background:rgba(239,241,246,.72)!important;color:#71778a!important;border:0!important}
  @media(max-width:480px){.idea-hero{padding:20px!important}.idea-hero h2{font-size:28px!important}.idea-hero p{max-width:100%}#ideaDialog #ideaForm{padding:18px 18px max(28px,env(safe-area-inset-bottom))!important}}
  `; document.head.appendChild(st);
}

function renderIdeias(){
  ensureIdeasV297Styles();
  const all=loadIdeias();
  const counts={todas:all.length,ideias:all.filter(x=>x.type==='ideia').length,projetos:all.filter(x=>x.type==='projeto').length,planos:all.filter(x=>x.type==='plano').length};
  const filtered=all.filter(x=>ideaFilter==='todas'||x.type===ideaFilter).sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));
  app.innerHTML=`
    <section class="hero idea-hero"><div class="idea-hero-kicker">CRIAÇÃO &amp; IDEIAS</div><h2>Create headroom for life.</h2><p>Você guarda. A BERTH.A ajuda a dar forma quando for a hora.</p><span class="idea-hero-mark" aria-hidden="true">◇</span></section>
    <div class="add-row"><input class="search" id="ideaSearch" placeholder="Buscar ideia..." autocomplete="off"><button class="primary" id="addIdeaBtn">＋ Adicionar</button></div>
    <div class="tabs idea-tabs">${ideaTab('todas','Tudo',counts.todas)}${ideaTab('ideia','Ideias',counts.ideias)}${ideaTab('projeto','Projetos',counts.projetos)}${ideaTab('plano','Planos',counts.planos)}</div>
    <div class="list" id="ideaList">${filtered.length?filtered.map(ideaCardHtml).join(''):ideaEmptyHtml()}</div>`;
  document.querySelector('#addIdeaBtn').onclick=()=>openIdeaModal();
  document.querySelector('#ideaSearch').oninput=e=>{const q=e.target.value.toLowerCase();document.querySelector('#ideaList').innerHTML=filtered.filter(x=>`${x.title} ${x.note||''} ${x.nextAction||''}`.toLowerCase().includes(q)).map(ideaCardHtml).join('')||ideaEmptyHtml();bindIdeaCards()};
  document.querySelectorAll('.idea-tab').forEach(b=>b.onclick=()=>{ideaFilter=b.dataset.filter;renderIdeias()});
  bindIdeaCards();
}
function ideaTab(filter,label,count){return `<button class="tab idea-tab ${ideaFilter===filter?'active':''}" data-filter="${filter}">${label}${count?` · ${count}`:''}</button>`}
function ideaCardHtml(x){
  const typeLabel=x.type==='projeto'?'Projeto':x.type==='plano'?'Plano':'Ideia';
  let extra='';
  if(x.type==='projeto'){
    const rem=projectRemaining(x), total=+x.totalMinutes||0, done=+x.progressMinutes||0;
    const pct=total?Math.min(100,Math.round(done/total*100)):0;
    const estimate=x.totalDurationUnit==='days'?`<span class="pill">Estimativa: ${+x.totalDurationValue||+x.totalDays||0} ${(+x.totalDurationValue||+x.totalDays||0)===1?'dia':'dias'}${done?` · ${minsLabel(done)} realizados`:''}</span>`:(total?`<span class="pill">${pct}% · faltam ${minsLabel(rem)}</span>`:'');
    extra=`<div class="meta" style="margin-top:7px;gap:6px;flex-wrap:wrap">${estimate}${x.projectSuggestWindow?'<span class="pill">☁️ BERTA pode sugerir</span>':''}${x.nextAction?`<span class="pill">Próximo: ${escapeHtml(x.nextAction)}</span>`:''}</div>`;
  } else if(x.type==='plano' && x.planHorizon){ extra=`<div class="meta" style="margin-top:7px"><span class="pill">${escapeHtml(x.planHorizonLabel||x.planHorizon)}</span></div>`; }
  const link=ideaSafeLink(x.link);
  return `<article class="card pending-card idea-card" data-idea-id="${x.id}"><div class="pending"><div class="idea-symbol">${x.type==='projeto'?'◌':x.type==='plano'?'⌁':'✦'}</div><div class="pending-main"><div class="pending-title">${escapeHtml(x.title)}</div><div class="meta"><span class="pill">${typeLabel}</span>${link?`<a class="pill idea-link" href="${escapeHtml(link)}" target="_blank" rel="noopener">↗ Abrir link</a>`:''}</div>${x.note?`<p class="note">${escapeHtml(x.note)}</p>`:''}${extra}</div><button class="more idea-more" aria-label="Editar">•••</button></div></article>`;
}
function ideaEmptyHtml(){return `<div class="empty idea-empty"><div class="idea-spark" aria-hidden="true">◇</div><strong>Esse espaço está leve.</strong><span>Registre quando aparecer.<br>Nem toda ideia precisa virar tarefa.</span></div>`}
function bindIdeaCards(){document.querySelectorAll('[data-idea-id]').forEach(card=>card.onclick=e=>{if(e.target.closest('.idea-link'))return;if(e.target.closest('.idea-more'))e.stopPropagation();openIdeaModal(card.dataset.ideaId)})}

function openIdeaModal(id=null){
  ensureFinanceStyles();
  ensureIdeasV297Styles();
  const p=id?loadIdeias().find(x=>x.id===id):null, type=p?.type||'ideia';
  let projectShoppingNeeds=Array.isArray(p?.shoppingNeeds)?p.shoppingNeeds.map(x=>typeof x==='string'?{id:uid(),name:x,sendToShopping:false}:{id:x.id||uid(),name:String(x.name||'').trim(),sendToShopping:!!x.sendToShopping}).filter(x=>x.name):[];
  const d=document.createElement('dialog');d.id='ideaDialog';d.className='study-v10-dialog idea-dialog';
  d.innerHTML=`<form method="dialog" id="ideaForm" class="bertha-modal study-v10-modal">
    <div class="bertha-modal-head"><div><div class="eyebrow">CRIAÇÃO &amp; IDEIAS</div><h2 id="ideaModalTitle">${p?'Editar registro':'Nova entrada'}</h2><p class="idea-modal-sub">Guarde hoje. Dê forma quando for a hora.</p></div><button type="button" data-close aria-label="Fechar">×</button></div>
    <div class="idea-type-segments" role="group" aria-label="Tipo"><button type="button" data-idea-type="ideia">Ideia</button><button type="button" data-idea-type="plano">Plano</button><button type="button" data-idea-type="projeto">Projeto</button></div>
    <label class="idea-native-type">Tipo<select id="ideaType"><option value="ideia" ${type==='ideia'?'selected':''}>Ideia</option><option value="projeto" ${type==='projeto'?'selected':''}>Projeto</option><option value="plano" ${type==='plano'?'selected':''}>Plano</option></select></label>
    <label>Nome<input id="ideaTitle" required maxlength="120" value="${escapeHtml(p?.title||'')}" placeholder="Ex.: Organizar projeto da casa"></label>
    <div id="ideaConditional"></div>
    <label>Link <span class="muted">(opcional)</span><input id="ideaLink" type="url" inputmode="url" autocapitalize="none" autocomplete="url" value="${escapeHtml(p?.link||'')}" placeholder="https://..."></label>
    <label>Observação <span class="muted">(opcional)</span><textarea id="ideaNote" rows="3" maxlength="700" placeholder="Contexto, inspiração, algo que você não quer esquecer...">${escapeHtml(p?.note||'')}</textarea></label>
    <div class="modal-actions">${p?'<button type="button" class="secondary" id="deleteIdeaBtn">Excluir</button>':''}<div class="grow"></div><button type="button" class="secondary" id="cancelIdeaBtn">Cancelar</button><button class="primary" value="default">Salvar</button></div>
  </form>`;
  
  if(!document.querySelector('#ideaModalUXFix')){const s=document.createElement('style');s.id='ideaModalUXFix';s.textContent=`#ideaDialog input,#ideaDialog select,#ideaDialog textarea{font-size:16px!important;box-sizing:border-box}#ideaDialog #ideaForm>label{display:block!important;width:100%!important;box-sizing:border-box;margin:0 0 12px!important}#ideaDialog #ideaForm>label>input,#ideaDialog #ideaForm>label>select,#ideaDialog #ideaForm>label>textarea{display:block!important;width:100%!important;max-width:100%!important;margin-top:6px!important}#ideaDialog .form-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:10px}
#ideaDialog #ideaConditional>label{display:block;width:100%;box-sizing:border-box;margin:0 0 12px}
#ideaDialog #ideaConditional>label>input,#ideaDialog #ideaConditional>label>select{display:block;width:100%;max-width:100%;margin-top:6px}
@media(max-width:480px){
 #ideaDialog{width:min(92vw,520px)!important;max-height:calc(100dvh - 110px)!important;overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior:contain!important;padding:0!important;border-radius:24px!important}
 #ideaDialog #ideaForm{width:100%!important;max-height:none!important;overflow:visible!important;padding:17px 17px max(30px,env(safe-area-inset-bottom))!important;margin:0!important;border-radius:24px!important}
 #ideaDialog .form-grid{grid-template-columns:minmax(0,1fr)!important;gap:0!important}
 #ideaDialog .form-grid>label,#ideaDialog #ideaConditional>label{display:block!important;width:100%!important;min-width:0!important;margin:0 0 12px!important}
 #ideaDialog .form-grid input:not([type=checkbox]),#ideaDialog .form-grid select,#ideaDialog #ideaConditional input:not([type=checkbox]),#ideaDialog #ideaConditional select{display:block!important;width:100%!important;max-width:100%!important;min-width:0!important;margin-top:6px!important}
 #ideaDialog #ideaForm>label{margin-bottom:12px!important}
 #ideaDialog #projectBlocksHelp{display:block;line-height:1.4;margin:-2px 0 12px}
 #ideaDialog #projectTrackOptions{margin-bottom:14px!important}
 #ideaDialog #ideaConditional input[type=checkbox]{display:grid!important;width:20px!important;max-width:20px!important;min-width:20px!important;height:20px!important;min-height:20px!important;margin:2px 0 0!important;flex:0 0 20px!important}
 #ideaDialog #projectTrackOptions label{display:flex!important;align-items:flex-start!important;gap:10px!important;width:100%!important;margin:0 0 10px!important}
 #ideaDialog #projectTrackOptions label:last-of-type{margin-bottom:0!important}
 #ideaDialog #ideaConditional .project-track-master{display:flex!important;align-items:flex-start!important;gap:10px!important;width:100%!important;margin:0 0 10px!important}
 #ideaDialog #ideaConditional .project-track-master>input[type=checkbox]{display:block!important;width:20px!important;min-width:20px!important;max-width:20px!important;height:20px!important;min-height:20px!important;flex:0 0 20px!important;margin:2px 0 0!important}
 #ideaDialog #ideaConditional .project-track-copy{display:block!important;flex:1 1 auto!important;min-width:0!important;line-height:1.25!important}
 #ideaDialog #ideaConditional .project-track-copy strong{display:block!important;margin:0!important}
 #ideaDialog #ideaConditional .project-track-copy small{display:block!important;margin:2px 0 0!important;line-height:1.3!important}
 #ideaDialog #ideaConditional #projectInactiveDaysWrap{display:grid!important;grid-template-columns:130px minmax(0,1fr)!important;gap:10px!important;align-items:center!important;width:100%!important;margin:4px 0 0!important;padding:0!important}
 #ideaDialog #ideaConditional #projectInactiveDaysWrap>span{display:block!important;margin:0!important;line-height:1.2!important}
 #ideaDialog #ideaConditional #projectInactiveDaysWrap>input{display:block!important;width:100%!important;min-width:0!important;margin:0!important}
 #ideaDialog .modal-actions{position:relative!important;display:flex!important;flex-wrap:wrap!important;gap:10px!important;padding-top:8px!important;padding-bottom:4px!important}
 #ideaDialog .project-shopping-box{background:linear-gradient(120deg,rgba(229,242,252,.72),rgba(241,238,253,.58))!important;border:1px solid rgba(119,157,197,.12)!important;border-radius:17px!important}
 #ideaDialog .project-shopping-box>strong{display:block;margin-bottom:2px}#ideaDialog .project-shopping-box>small{display:block;color:#777f91;margin-bottom:10px;line-height:1.35}
 #ideaDialog .project-shopping-add{display:grid;grid-template-columns:minmax(0,1fr) 42px;gap:8px;align-items:center;margin-bottom:8px}#ideaDialog .project-shopping-add input{margin:0!important}#ideaDialog .project-shopping-add button{height:42px;border:0;border-radius:12px;background:linear-gradient(105deg,#74afe0,#aa96e7);color:white;font-size:20px}
 #ideaDialog .project-shopping-row{display:flex;align-items:center;gap:8px;padding:7px 0;border-top:1px solid rgba(112,135,164,.10)}#ideaDialog .project-shopping-row label{display:flex!important;align-items:center!important;gap:10px!important;flex:1;margin:0!important;font-weight:520!important}#ideaDialog .project-shopping-row button{border:0;background:transparent;color:#8b91a0;font-size:20px;padding:4px 6px}.project-shopping-empty{opacity:.75}

}`;document.head.appendChild(s)}
  document.body.appendChild(d);d.showModal();
  d.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>{clearInterval(ideaTypeWatcher);d.close();d.remove()});
  d.addEventListener('click',e=>{if(e.target===d){clearInterval(ideaTypeWatcher);d.close();d.remove()}});
  const conditional=d.querySelector('#ideaConditional');
  function drawConditional(){
    const t=d.querySelector('#ideaType').value;
    if(t==='ideia'){conditional.innerHTML=`<div class="card" style="padding:12px;margin:0 0 12px"><small><span class="idea-inline-spark">◇</span> Ideias não ocupam tempo no Meu Dia. Guarde primeiro; decida depois.</small></div>`;return}
    if(t==='plano'){
      const h=p?.planHorizon||'algum-dia';
      conditional.innerHTML=`<label>Horizonte<select id="planHorizon"><option value="esta-semana" ${h==='esta-semana'?'selected':''}>Esta semana</option><option value="este-mes" ${h==='este-mes'?'selected':''}>Este mês</option><option value="data" ${h==='data'?'selected':''}>Até uma data</option><option value="algum-dia" ${h==='algum-dia'?'selected':''}>Algum dia</option></select></label><label id="planDateWrap">Data-alvo <span class="muted">(opcional)</span><input id="planDate" type="date" value="${escapeHtml(p?.planDate||'')}"></label>`;
      const hs=conditional.querySelector('#planHorizon'),dw=conditional.querySelector('#planDateWrap');
      const syncPlanDate=()=>{dw.style.display=hs.value==='data'?'block':'none'}; hs.onchange=syncPlanDate; syncPlanDate(); return}
    const blocks=projectBlocks(p||{}); const blockUnit=p?.sessionUnit||((blocks.length&&blocks.every(n=>n%60===0))?'hours':'minutes');
    const raw=blocks.length?blocks.map(n=>blockUnit==='hours'?Number((n/60).toFixed(2)):n).join(', '):(blockUnit==='hours'?'2, 4, 6':'30, 40, 60');
    conditional.innerHTML=`
      <label>Resultado que você quer alcançar<input id="projectOutcome" maxlength="220" value="${escapeHtml(p?.outcome||'')}" placeholder="Ex.: Aparador terminado e instalado"></label>
      <div class="form-grid"><label>Tempo total estimado<input id="projectTotal" type="number" min="1" value="${p?.totalDurationValue||4}"></label><label>Unidade<select id="projectTotalUnit"><option value="days" ${p?.totalDurationUnit==='days'?'selected':''}>dias</option><option value="hours" ${(!p?.totalDurationUnit||p?.totalDurationUnit==='hours')?'selected':''}>horas</option><option value="minutes" ${p?.totalDurationUnit==='minutes'?'selected':''}>minutos</option></select></label></div>
      <div class="form-grid"><label>Blocos de trabalho<input id="projectBlocks" inputmode="decimal" value="${raw}" placeholder="Ex.: ${blockUnit==='hours'?'2, 4, 8':'30, 40, 60'}"></label><label>Unidade dos blocos<select id="projectBlockUnit"><option value="hours" ${blockUnit==='hours'?'selected':''}>horas</option><option value="minutes" ${blockUnit==='minutes'?'selected':''}>minutos</option></select></label></div>
      <small id="projectBlocksHelp">Digite livremente os blocos que funcionam para você. A BERTA sugere o que couber na janela disponível.</small>
      <label>Bloco preferido<select id="projectPreferred"></select></label>
      <label>Próximo passo <span class="muted">(opcional)</span><input id="projectNext" maxlength="180" value="${escapeHtml(p?.nextAction||'')}" placeholder="Ex.: Lixar o primeiro módulo"></label>
      <div class="form-grid"><label>Prioridade<select id="projectPriority"><option value="Baixa" ${p?.priority==='Baixa'?'selected':''}>Baixa</option><option value="Normal" ${!p?.priority||p?.priority==='Normal'?'selected':''}>Normal</option><option value="Alta" ${p?.priority==='Alta'?'selected':''}>Alta</option></select></label><label>Prazo <span class="muted">(opcional)</span><input id="projectDue" type="date" value="${escapeHtml(p?.dueDate||'')}"></label></div>
      <div class="project-track-master"><input id="projectTrack" type="checkbox" ${p?.trackProject!==false?'checked':''}><div class="project-track-copy"><strong>Quero que a BERTA acompanhe este projeto</strong><small>Ela pode lembrar de continuidade e mostrar em que etapa você está.</small></div></div>
      <div id="projectTrackOptions" class="card" style="padding:12px;margin:0 0 12px">
        <label style="display:flex;gap:10px;align-items:center"><input id="projectWindow" type="checkbox" ${p?.projectSuggestWindow!==false?'checked':''} style="width:auto"><span>Sugerir quando houver uma janela compatível</span></label>
        <label style="display:flex;gap:10px;align-items:center"><input id="projectContinue" type="checkbox" ${p?.projectContinuePrompt!==false?'checked':''} style="width:auto"><span>Dar peso à continuidade quando eu já tiver começado</span></label>
        <label style="display:flex;gap:10px;align-items:center"><input id="projectInactive" type="checkbox" ${p?.projectInactiveReminder?'checked':''} style="width:auto"><span>Lembrar se ficar parado</span></label>
        <div id="projectInactiveDaysWrap"><span>Dias sem avanço</span><input id="projectInactiveDays" type="number" min="1" max="60" value="${+p?.inactiveDays||7}"></div>
      </div>
      <div class="card project-shopping-box" style="padding:12px;margin:0 0 12px">
        <strong>Preciso para este projeto</strong><small>Marque o que também deve entrar na Lista de Compras.</small>
        <div class="project-shopping-add"><input id="projectShoppingNew" maxlength="100" placeholder="Ex.: Tinta para madeira"><button type="button" id="projectShoppingAdd">＋</button></div>
        <div id="projectShoppingRows"></div>
      </div>`;
    const shopRows=conditional.querySelector('#projectShoppingRows'),shopNew=conditional.querySelector('#projectShoppingNew'),shopAdd=conditional.querySelector('#projectShoppingAdd');
    const renderProjectShopping=()=>{if(!shopRows)return;shopRows.innerHTML=projectShoppingNeeds.length?projectShoppingNeeds.map(n=>`<div class="project-shopping-row"><label><input type="checkbox" data-project-shop="${n.id}" ${n.sendToShopping?'checked':''}><span>${escapeHtml(n.name)}</span></label><button type="button" data-project-shop-del="${n.id}" aria-label="Remover">×</button></div>`).join(''):`<small class="project-shopping-empty">Nenhum item adicionado.</small>`;shopRows.querySelectorAll('[data-project-shop]').forEach(cb=>cb.onchange=()=>{const n=projectShoppingNeeds.find(x=>String(x.id)===String(cb.dataset.projectShop));if(n)n.sendToShopping=cb.checked});shopRows.querySelectorAll('[data-project-shop-del]').forEach(b=>b.onclick=()=>{projectShoppingNeeds=projectShoppingNeeds.filter(x=>String(x.id)!==String(b.dataset.projectShopDel));renderProjectShopping()})};
    const addProjectShopping=()=>{const name=String(shopNew?.value||'').trim();if(!name)return;if(!projectShoppingNeeds.some(x=>x.name.toLocaleLowerCase('pt-BR')===name.toLocaleLowerCase('pt-BR')))projectShoppingNeeds.push({id:uid(),name,sendToShopping:true});shopNew.value='';renderProjectShopping()};
    shopAdd?.addEventListener('click',addProjectShopping);shopNew?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();addProjectShopping()}});renderProjectShopping();
    const blocksInput=conditional.querySelector('#projectBlocks'),blockUnitSelect=conditional.querySelector('#projectBlockUnit'),preferredSelect=conditional.querySelector('#projectPreferred');
    const parseBlockValues=()=>[...new Set(String(blocksInput?.value||'').split(/[,;\s]+/).map(s=>Number(String(s).replace(',','.'))).filter(n=>n>0))].sort((a,b)=>a-b);
    const refreshPreferred=()=>{if(!preferredSelect)return;const unit=blockUnitSelect?.value||'hours',vals=parseBlockValues(),saved=+p?.preferredSession||0;preferredSelect.innerHTML=vals.map(v=>{const mins=Math.round(unit==='hours'?v*60:v);const label=unit==='hours'?`${v} ${v===1?'hora':'horas'}`:`${v} min`;return `<option value="${mins}" ${mins===saved?'selected':''}>${label}</option>`}).join('');if(!preferredSelect.value&&preferredSelect.options.length)preferredSelect.selectedIndex=0;};
    blocksInput?.addEventListener('input',refreshPreferred);blockUnitSelect?.addEventListener('change',refreshPreferred);refreshPreferred();
    const tr=conditional.querySelector('#projectTrack'),opts=conditional.querySelector('#projectTrackOptions');
    if(tr){
      const syncTrack=()=>{opts.style.display=tr.checked?'block':'none'}; tr.onchange=syncTrack; syncTrack();
      const inactive=conditional.querySelector('#projectInactive'),inactiveWrap=conditional.querySelector('#projectInactiveDaysWrap');
      if(inactive&&inactiveWrap){const syncInactive=()=>inactiveWrap.style.display=inactive.checked?'block':'none';inactive.onchange=syncInactive;syncInactive();}
    }
  }
  const ideaTypeSelect=d.querySelector('#ideaType'),ideaModalTitle=d.querySelector('#ideaModalTitle');
  function syncIdeaModalTitle(){if(p){ideaModalTitle.textContent='Editar registro';}else{ideaModalTitle.textContent='Nova entrada';} d.querySelectorAll('[data-idea-type]').forEach(b=>b.classList.toggle('active',b.dataset.ideaType===ideaTypeSelect.value));}
  let lastIdeaType='';
  function syncIdeaTypeUI(force=false){
    const current=ideaTypeSelect?.value||'ideia';
    if(!force && current===lastIdeaType)return;
    lastIdeaType=current;
    drawConditional();
    syncIdeaModalTitle();
  }
  // iPhone/Safari: alguns selects nativos podem atualizar visualmente antes de disparar
  // o evento change de forma confiável dentro de <dialog>. Escutamos ambos e mantemos
  // uma verificação leve enquanto o modal estiver aberto.
  d.querySelectorAll('[data-idea-type]').forEach(b=>b.addEventListener('click',()=>{ideaTypeSelect.value=b.dataset.ideaType;syncIdeaTypeUI(true);}));
  ideaTypeSelect.addEventListener('input',()=>syncIdeaTypeUI(true));
  ideaTypeSelect.addEventListener('change',()=>syncIdeaTypeUI(true));
  ideaTypeSelect.addEventListener('blur',()=>syncIdeaTypeUI());
  syncIdeaTypeUI(true);
  const ideaTypeWatcher=setInterval(()=>{
    if(!d.isConnected || !d.open){clearInterval(ideaTypeWatcher);return;}
    syncIdeaTypeUI();
  },120);
  d.querySelector('#cancelIdeaBtn').onclick=()=>{clearInterval(ideaTypeWatcher);d.close();d.remove()};
  if(p)d.querySelector('#deleteIdeaBtn').onclick=()=>{if(confirm('Excluir este registro?')){saveIdeias(loadIdeias().filter(x=>x.id!==p.id));d.close();d.remove();renderIdeias()}};
  d.querySelector('#ideaForm').addEventListener('submit',e=>{
    e.preventDefault();const items=loadIdeias(),t=d.querySelector('#ideaType').value;
    let data={title:d.querySelector('#ideaTitle').value.trim(),type:t,link:d.querySelector('#ideaLink').value.trim(),note:d.querySelector('#ideaNote').value.trim()}; if(!data.title)return;
    if(data.link&&!ideaSafeLink(data.link)){const linkInput=d.querySelector('#ideaLink');linkInput.setCustomValidity('Use um link começando com http:// ou https://');linkInput.reportValidity();return}else d.querySelector('#ideaLink').setCustomValidity('');
    if(t==='plano'){
      const h=d.querySelector('#planHorizon')?.value||'algum-dia';const labels={'esta-semana':'Esta semana','este-mes':'Este mês','data':'Até uma data','algum-dia':'Algum dia'};
      Object.assign(data,{planHorizon:h,planHorizonLabel:labels[h],planDate:d.querySelector('#planDate')?.value||''});
    }
    if(t==='projeto'){
      const val=Math.max(1,+d.querySelector('#projectTotal').value||1),unit=d.querySelector('#projectTotalUnit').value,total=unit==='hours'?val*60:unit==='minutes'?val:0;
      const sessionUnit=d.querySelector('#projectBlockUnit')?.value||'hours';
      const blockValues=[...new Set(String(d.querySelector('#projectBlocks').value||'').split(/[,;\s]+/).map(s=>Number(String(s).replace(',','.'))).filter(n=>n>0))].sort((a,b)=>a-b);
      const blocks=blockValues.map(n=>Math.round(sessionUnit==='hours'?n*60:n)).filter(n=>n>0);
      const track=d.querySelector('#projectTrack').checked;
      Object.assign(data,{outcome:d.querySelector('#projectOutcome').value.trim(),totalDurationValue:val,totalDurationUnit:unit,totalMinutes:total,totalDays:unit==='days'?val:null,progressMinutes:+p?.progressMinutes||0,sessionUnit,sessionMinutes:blocks.length?blocks:[30],preferredSession:+d.querySelector('#projectPreferred').value||(blocks[0]||30),nextAction:d.querySelector('#projectNext').value.trim(),priority:d.querySelector('#projectPriority').value,dueDate:d.querySelector('#projectDue').value,trackProject:track,projectSuggestWindow:track&&d.querySelector('#projectWindow').checked,projectContinuePrompt:track&&d.querySelector('#projectContinue').checked,projectInactiveReminder:track&&d.querySelector('#projectInactive').checked,inactiveDays:Math.max(1,+d.querySelector('#projectInactiveDays').value||7),shoppingNeeds:projectShoppingNeeds.map(x=>({...x})),status:p?.status||'ativo',lastWorkedAt:p?.lastWorkedAt||null});
      const shopping=loadSharedShopping();const source=`Projeto · ${data.title}`;projectShoppingNeeds.filter(n=>n.sendToShopping).forEach(n=>{const exists=shopping.some(i=>!i.done&&String(i.name||'').trim().toLocaleLowerCase('pt-BR')===n.name.toLocaleLowerCase('pt-BR')&&String(i.source||'')===source);if(!exists)shopping.push({id:uid(),name:n.name,qty:'',unit:'',category:'Outros',expectedValue:'',source,projectId:p?.id||null,createdAt:Date.now(),done:false,cycle:'monthly'});});saveSharedShopping(shopping);
    }
    const now=Date.now(); if(p){const i=items.findIndex(x=>x.id===p.id);items[i]={...items[i],...data,updatedAt:now}}else items.push({id:uid(),...data,createdAt:now,updatedAt:now});
    saveIdeias(items);clearInterval(ideaTypeWatcher);d.close();d.remove();renderIdeias();
  });
}

/* =========================================================
   RITUAIS
========================================================= */

const RITUAIS_KEY = "minha-vida.rituais.v1";
const RITUAL_CAPILAR_KEY = "minha-vida.ritual-capilar.v1";

function loadRituais() {
  try { return JSON.parse(localStorage.getItem(RITUAIS_KEY)) || []; }
  catch { return []; }
}
function saveRituais(items) {
  localStorage.setItem(RITUAIS_KEY, JSON.stringify(items));
}
function loadCapilar() {
  try { return JSON.parse(localStorage.getItem(RITUAL_CAPILAR_KEY)) || defaultCapilar(); }
  catch { return defaultCapilar(); }
}
function saveCapilar(data) {
  localStorage.setItem(RITUAL_CAPILAR_KEY, JSON.stringify(data));
}
function defaultCapilar() {
  return {
    washDays: [],
    notes: "",
    steps: [
      {id:"lavagem", name:"Lavagem", detail:"Definir quando lavar e seguir a rotina de produtos."},
      {id:"tratamento", name:"Tratamento", detail:"Escolher o tratamento previsto para a lavagem."},
      {id:"finalizacao", name:"Finalização", detail:"Finalizar o cabelo após a lavagem."},
      {id:"dayafter", name:"Day after", detail:"Manutenção do dia seguinte à lavagem."}
    ]
  };
}

function renderRituais() {
  app.innerHTML = `
    <section class="hero">
      <h2>✨ Rituais</h2>
      <p>Space to think. Space to live.</p>
    </section>

    <div class="ritual-grid">
      <button class="ritual-card featured" id="capilarBtn">
        <span class="ritual-icon">✦</span>
        <div><strong>Ritual Capilar</strong><span>Lavagem · tratamento · finalização · day after</span></div>
        <b>›</b>
      </button>
      <button class="ritual-card" id="newRitualBtn">
        <span class="ritual-icon">＋</span>
        <div><strong>Novo ritual</strong><span>Crie outro ritual quando fizer sentido.</span></div>
        <b>›</b>
      </button>
    </div>

    <div class="section-title">MEUS RITUAIS</div>
    <div class="list" id="ritualList">
      ${loadRituais().map(ritualCardHtml).join("") || `<div class="empty"><div class="symbol">☾</div><strong>Nenhum outro ritual ainda.</strong><span>Não precisamos preencher esse espaço.</span></div>`}
    </div>
  `;

  document.querySelector("#capilarBtn").onclick = renderCapilar;
  document.querySelector("#newRitualBtn").onclick = () => openRitualModal();
  document.querySelectorAll("[data-ritual-id]").forEach(x => x.onclick = () => openRitualModal(x.dataset.ritualId));
}
function ritualCardHtml(x) {
  return `<article class="card ritual-small" data-ritual-id="${x.id}">
    <div class="pending">
      <span class="ritual-icon small">✦</span>
      <div class="pending-main"><div class="pending-title">${escapeHtml(x.name)}</div><p class="note">${escapeHtml(x.description || "")}</p></div>
      <button class="more">›</button>
    </div>
  </article>`;
}

function renderCapilar() {
  const c = loadCapilar();
  app.innerHTML = `
    <section class="hero">
      <div class="backline"><button class="back-inline" id="ritualBack">‹ Rituais</button></div>
      <h2>✦ Ritual Capilar</h2>
      <p>Um espaço próprio para a rotina do cabelo — sem misturar com as outras tarefas do dia.</p>
    </section>

    <div class="card capilar-panel">
      <div class="panel-head"><div><div class="eyebrow">ROTINA</div><h3>Lavagem & cuidado</h3></div><button class="secondary" id="editCapilar">Editar</button></div>
      <div class="capilar-steps">
        ${c.steps.map((s,i) => `<div class="capilar-step"><span>${i+1}</span><div><strong>${escapeHtml(s.name)}</strong><small>${escapeHtml(s.detail)}</small></div></div>`).join("")}
      </div>
    </div>

    <div class="section-title">OBSERVAÇÕES</div>
    <div class="card">
      <p class="note big-note">${escapeHtml(c.notes || "Nenhuma observação registrada.")}</p>
    </div>

    <div class="section-title">LAVAGENS PROGRAMADAS</div>
    <div class="card">
      <div class="wash-list">${c.washDays.length ? c.washDays.map(d => `<span class="pill today">${formatDate(d)}</span>`).join("") : `<span class="muted">Nenhuma data definida ainda.</span>`}</div>
    </div>
  `;
  document.querySelector("#ritualBack").onclick = renderRituais;
  document.querySelector("#editCapilar").onclick = () => openCapilarModal();
}

function openCapilarModal() {
  const c = loadCapilar();
  const d = document.createElement("dialog");
  d.id = "capilarDialog";
  d.innerHTML = `
    <form method="dialog" id="capilarForm" class="modal-card">
      <div class="modal-head"><div><div class="eyebrow">RITUAL CAPILAR</div><h2>Configurar rotina</h2></div><button class="icon-btn" value="cancel">×</button></div>
      <label>Datas de lavagem <span class="muted">(separe por vírgulas)</span>
        <input id="washDays" value="${c.washDays.join(", ")}" placeholder="2026-09-09, 2026-09-12">
      </label>
      <label>Observações
        <textarea id="capilarNotes" rows="4" maxlength="700" placeholder="Produtos, cuidados ou observações importantes...">${escapeHtml(c.notes)}</textarea>
      </label>
      <div class="section-title inner">ETAPAS</div>
      ${c.steps.map((s,i) => `<label class="step-edit">${i+1}. ${escapeHtml(s.name)}<textarea data-step="${s.id}" rows="2" maxlength="250">${escapeHtml(s.detail)}</textarea></label>`).join("")}
      <div class="modal-actions"><div class="grow"></div><button type="button" class="secondary" id="closeCapilar">Cancelar</button><button class="primary" value="default">Salvar</button></div>
    </form>`;
  document.body.appendChild(d);
  d.showModal();
  d.querySelector("#closeCapilar").onclick = () => { d.close(); d.remove(); };
  d.querySelector("#capilarForm").addEventListener("submit", e => {
    e.preventDefault();
    const dates = d.querySelector("#washDays").value.split(",").map(x=>x.trim()).filter(Boolean);
    const steps = c.steps.map(s => ({...s, detail:d.querySelector(`[data-step="${s.id}"]`).value.trim()}));
    saveCapilar({washDays:dates, notes:d.querySelector("#capilarNotes").value.trim(), steps});
    d.close(); d.remove(); renderCapilar();
  });
}

function openRitualModal(id=null) {
  const p = id ? loadRituais().find(x=>x.id===id) : null;
  const d = document.createElement("dialog");
  d.innerHTML = `<form method="dialog" class="modal-card" id="ritualForm">
    <div class="modal-head"><div><div class="eyebrow">RITUAL</div><h2>${p?"Editar":"Novo"} ritual</h2></div><button class="icon-btn" value="cancel">×</button></div>
    <label>Nome<input id="ritualName" required maxlength="80" value="${escapeHtml(p?.name||"")}"></label>
    <label>Descrição<textarea id="ritualDescription" rows="4" maxlength="300">${escapeHtml(p?.description||"")}</textarea></label>
    <div class="modal-actions">${p?'<button type="button" class="secondary" id="deleteRitual">Excluir</button>':""}<div class="grow"></div><button type="button" class="secondary" id="cancelRitual">Cancelar</button><button class="primary" value="default">Salvar</button></div>
  </form>`;
  document.body.appendChild(d); d.showModal();
  d.querySelector("#cancelRitual").onclick=()=>{d.close();d.remove();};
  if(p) d.querySelector("#deleteRitual").onclick=()=>{ if(confirm("Excluir este ritual?")){saveRituais(loadRituais().filter(x=>x.id!==p.id));d.close();d.remove();renderRituais();}};
  d.querySelector("#ritualForm").addEventListener("submit",e=>{
    e.preventDefault();
    const items=loadRituais(), data={name:d.querySelector("#ritualName").value.trim(),description:d.querySelector("#ritualDescription").value.trim()};
    if(p){const i=items.findIndex(x=>x.id===p.id);items[i]={...items[i],...data,updatedAt:Date.now()};}
    else items.push({id:uid(),...data,createdAt:Date.now(),updatedAt:Date.now()});
    saveRituais(items);d.close();d.remove();renderRituais();
  });
}


/* =========================================================
   ESTUDOS
========================================================= */


const ESTUDOS_KEY="minha-vida.estudos.v1";
const ESTUDOS_MAPAS_KEY="minha-vida.estudos.mapas.v1";
const ESTUDOS_CONTENT_KEY="bertha.estudos.conteudos.v1";
function loadEstudos(){try{return JSON.parse(localStorage.getItem(ESTUDOS_KEY))||{subjects:[],sessions:[],reviews:[],questions:[]}}catch{return{subjects:[],sessions:[],reviews:[],questions:[]}}}
function saveEstudos(x){localStorage.setItem(ESTUDOS_KEY,JSON.stringify(x))}
function loadMapasStatus(){try{return JSON.parse(localStorage.getItem(ESTUDOS_MAPAS_KEY))||{}}catch{return{}}}
function saveMapasStatus(x){localStorage.setItem(ESTUDOS_MAPAS_KEY,JSON.stringify(x))}
function loadStudyContents(){try{return JSON.parse(localStorage.getItem(ESTUDOS_CONTENT_KEY))||[]}catch{return[]}}
function saveStudyContents(x){localStorage.setItem(ESTUDOS_CONTENT_KEY,JSON.stringify(x))}
const TCDF_MAPAS=[{"id": 1, "bloco": "Orientação", "materia": "Orientação e Estratégia", "topico": "Como funciona a prova do TCDF 2026", "semana": "S1"}, {"id": 2, "bloco": "Orientação", "materia": "Orientação e Estratégia", "topico": "Como funciona a pontuação Cebraspe", "semana": "S1"}, {"id": 3, "bloco": "Orientação", "materia": "Orientação e Estratégia", "topico": "Como usar os Mapas da Aprovação", "semana": "S1"}, {"id": 4, "bloco": "Orientação", "materia": "Orientação e Estratégia", "topico": "Rota visual até a prova", "semana": "S1"}, {"id": 5, "bloco": "P1", "materia": "Língua Portuguesa", "topico": "Mapa Mestre de Língua Portuguesa", "semana": "S1"}, {"id": 6, "bloco": "P1", "materia": "Língua Portuguesa", "topico": "Compreensão e interpretação de textos", "semana": "S1"}, {"id": 7, "bloco": "P1", "materia": "Língua Portuguesa", "topico": "Tipos e gêneros textuais", "semana": "S1"}, {"id": 8, "bloco": "P1", "materia": "Língua Portuguesa", "topico": "Ortografia oficial", "semana": "S1"}, {"id": 9, "bloco": "P1", "materia": "Língua Portuguesa", "topico": "Coesão: referenciação, substituição e repetição", "semana": "S1"}, {"id": 10, "bloco": "P1", "materia": "Língua Portuguesa", "topico": "Conectores e sequenciação textual", "semana": "S1"}, {"id": 11, "bloco": "P1", "materia": "Língua Portuguesa", "topico": "Tempos e modos verbais", "semana": "S1"}, {"id": 12, "bloco": "P1", "materia": "Língua Portuguesa", "topico": "Classes de palavras", "semana": "S1"}, {"id": 13, "bloco": "P1", "materia": "Língua Portuguesa", "topico": "Coordenação", "semana": "S1"}, {"id": 14, "bloco": "P1", "materia": "Língua Portuguesa", "topico": "Subordinação", "semana": "S1"}, {"id": 15, "bloco": "P1", "materia": "Língua Portuguesa", "topico": "Pontuação", "semana": "S1"}, {"id": 16, "bloco": "P1", "materia": "Língua Portuguesa", "topico": "Concordância verbal e nominal", "semana": "S1"}, {"id": 17, "bloco": "P1", "materia": "Língua Portuguesa", "topico": "Regência verbal e nominal", "semana": "S1"}, {"id": 18, "bloco": "P1", "materia": "Língua Portuguesa", "topico": "Crase", "semana": "S1"}, {"id": 19, "bloco": "P1", "materia": "Língua Portuguesa", "topico": "Colocação dos pronomes átonos", "semana": "S1"}, {"id": 20, "bloco": "P1", "materia": "Língua Portuguesa", "topico": "Significação e substituição de palavras/trechos", "semana": "S1"}, {"id": 21, "bloco": "P1", "materia": "Língua Portuguesa", "topico": "Reorganização e reescrita de frases, períodos, gêneros e níveis de formalidade", "semana": "S1"}, {"id": 22, "bloco": "P1", "materia": "Lei Orgânica do DF", "topico": "Mapa Mestre da LODF", "semana": "S2"}, {"id": 23, "bloco": "P1", "materia": "Lei Orgânica do DF", "topico": "Fundamentos da organização dos poderes e do Distrito Federal", "semana": "S2"}, {"id": 24, "bloco": "P1", "materia": "Lei Orgânica do DF", "topico": "Organização do Distrito Federal", "semana": "S2"}, {"id": 25, "bloco": "P1", "materia": "Lei Orgânica do DF", "topico": "Organização dos Poderes", "semana": "S2"}, {"id": 26, "bloco": "P1", "materia": "Lei Orgânica do DF", "topico": "Tributação do Distrito Federal", "semana": "S2"}, {"id": 27, "bloco": "P1", "materia": "Lei Orgânica do DF", "topico": "Orçamento do Distrito Federal", "semana": "S2"}, {"id": 28, "bloco": "P1", "materia": "Lei Orgânica do DF", "topico": "Ordem econômica do Distrito Federal", "semana": "S2"}, {"id": 29, "bloco": "P1", "materia": "DF, RIDE e Política para Mulheres", "topico": "Mapa Mestre: DF, RIDE e Política para Mulheres", "semana": "S2"}, {"id": 30, "bloco": "P1", "materia": "DF, RIDE e Política para Mulheres", "topico": "Realidade étnica e social do Distrito Federal", "semana": "S2"}, {"id": 31, "bloco": "P1", "materia": "DF, RIDE e Política para Mulheres", "topico": "Realidade histórica e geográfica", "semana": "S2"}, {"id": 32, "bloco": "P1", "materia": "DF, RIDE e Política para Mulheres", "topico": "Realidade cultural, política e econômica", "semana": "S2"}, {"id": 33, "bloco": "P1", "materia": "DF, RIDE e Política para Mulheres", "topico": "RIDE — Lei Complementar Federal nº 94/1998", "semana": "S2"}, {"id": 34, "bloco": "P1", "materia": "DF, RIDE e Política para Mulheres", "topico": "RIDE — Decreto Federal nº 7.469/2011", "semana": "S2"}, {"id": 35, "bloco": "P1", "materia": "DF, RIDE e Política para Mulheres", "topico": "Plano Distrital de Política para Mulheres 2020–2023", "semana": "S2"}, {"id": 36, "bloco": "P1", "materia": "DF, RIDE e Política para Mulheres", "topico": "Lei Maria da Penha — Lei nº 11.340/2006", "semana": "S2"}, {"id": 37, "bloco": "P1", "materia": "Primeiros Socorros", "topico": "Cuidados iniciais, urgência, emergência e acionamento do socorro", "semana": "S2"}, {"id": 38, "bloco": "P1", "materia": "Primeiros Socorros", "topico": "Engasgo", "semana": "S2"}, {"id": 39, "bloco": "P1", "materia": "Primeiros Socorros", "topico": "Sangramento", "semana": "S2"}, {"id": 40, "bloco": "P1", "materia": "Primeiros Socorros", "topico": "Fratura", "semana": "S2"}, {"id": 41, "bloco": "P1", "materia": "Primeiros Socorros", "topico": "Queimadura", "semana": "S2"}, {"id": 42, "bloco": "P1", "materia": "Primeiros Socorros", "topico": "Desmaio e convulsão", "semana": "S2"}, {"id": 43, "bloco": "P1", "materia": "Primeiros Socorros", "topico": "Intoxicação", "semana": "S2"}, {"id": 44, "bloco": "P1", "materia": "Raciocínio Lógico e Matemática Financeira", "topico": "Mapa Mestre de RLM", "semana": "S3"}, {"id": 45, "bloco": "P1", "materia": "Raciocínio Lógico e Matemática Financeira", "topico": "Estruturas lógicas", "semana": "S3"}, {"id": 46, "bloco": "P1", "materia": "Raciocínio Lógico e Matemática Financeira", "topico": "Lógica de argumentação", "semana": "S3"}, {"id": 47, "bloco": "P1", "materia": "Raciocínio Lógico e Matemática Financeira", "topico": "Analogias e inferências", "semana": "S3"}, {"id": 48, "bloco": "P1", "materia": "Raciocínio Lógico e Matemática Financeira", "topico": "Deduções e conclusões", "semana": "S3"}, {"id": 49, "bloco": "P1", "materia": "Raciocínio Lógico e Matemática Financeira", "topico": "Proposições simples e compostas", "semana": "S3"}, {"id": 50, "bloco": "P1", "materia": "Raciocínio Lógico e Matemática Financeira", "topico": "Tabelas-verdade", "semana": "S3"}, {"id": 51, "bloco": "P1", "materia": "Raciocínio Lógico e Matemática Financeira", "topico": "Equivalências", "semana": "S3"}, {"id": 52, "bloco": "P1", "materia": "Raciocínio Lógico e Matemática Financeira", "topico": "Leis de De Morgan", "semana": "S3"}, {"id": 53, "bloco": "P1", "materia": "Raciocínio Lógico e Matemática Financeira", "topico": "Diagramas lógicos", "semana": "S3"}, {"id": 54, "bloco": "P1", "materia": "Raciocínio Lógico e Matemática Financeira", "topico": "Lógica de primeira ordem", "semana": "S3"}, {"id": 55, "bloco": "P1", "materia": "Raciocínio Lógico e Matemática Financeira", "topico": "Princípios de contagem", "semana": "S3"}, {"id": 56, "bloco": "P1", "materia": "Raciocínio Lógico e Matemática Financeira", "topico": "Probabilidade", "semana": "S3"}, {"id": 57, "bloco": "P1", "materia": "Raciocínio Lógico e Matemática Financeira", "topico": "Operações com conjuntos", "semana": "S3"}, {"id": 58, "bloco": "P1", "materia": "Raciocínio Lógico e Matemática Financeira", "topico": "Razão, proporção e porcentagem", "semana": "S3"}, {"id": 59, "bloco": "P1", "materia": "Raciocínio Lógico e Matemática Financeira", "topico": "Juros simples", "semana": "S3"}, {"id": 60, "bloco": "P1", "materia": "Raciocínio Lógico e Matemática Financeira", "topico": "Juros compostos", "semana": "S3"}, {"id": 61, "bloco": "P1", "materia": "Raciocínio Lógico e Matemática Financeira", "topico": "Taxas nominal, efetiva e equivalente", "semana": "S3"}, {"id": 62, "bloco": "P1", "materia": "Raciocínio Lógico e Matemática Financeira", "topico": "Sistemas de amortização", "semana": "S3"}, {"id": 63, "bloco": "P1", "materia": "Raciocínio Lógico e Matemática Financeira", "topico": "Fluxo de caixa", "semana": "S3"}, {"id": 64, "bloco": "P2", "materia": "Lei Orgânica e Regimento Interno do TCDF", "topico": "Mapa Mestre do TCDF", "semana": "S4"}, {"id": 65, "bloco": "P2", "materia": "Lei Orgânica e Regimento Interno do TCDF", "topico": "Natureza, competência e jurisdição", "semana": "S4"}, {"id": 66, "bloco": "P2", "materia": "Lei Orgânica e Regimento Interno do TCDF", "topico": "Composição do TCDF", "semana": "S4"}, {"id": 67, "bloco": "P2", "materia": "Lei Orgânica e Regimento Interno do TCDF", "topico": "Plenário e Câmaras", "semana": "S4"}, {"id": 68, "bloco": "P2", "materia": "Lei Orgânica e Regimento Interno do TCDF", "topico": "Presidente e Vice-Presidente", "semana": "S4"}, {"id": 69, "bloco": "P2", "materia": "Lei Orgânica e Regimento Interno do TCDF", "topico": "Conselheiros, Auditores e Ministério Público", "semana": "S4"}, {"id": 70, "bloco": "P2", "materia": "Lei Orgânica e Regimento Interno do TCDF", "topico": "Serviços auxiliares", "semana": "S4"}, {"id": 71, "bloco": "P2", "materia": "Lei Orgânica e Regimento Interno do TCDF", "topico": "Regimento Interno — Título I", "semana": "S4"}, {"id": 72, "bloco": "P2", "materia": "Lei Orgânica e Regimento Interno do TCDF", "topico": "Regimento Interno — Título II", "semana": "S4"}, {"id": 73, "bloco": "P2", "materia": "Lei Orgânica e Regimento Interno do TCDF", "topico": "Regimento Interno — Título III", "semana": "S4"}, {"id": 74, "bloco": "P2", "materia": "Lei Orgânica e Regimento Interno do TCDF", "topico": "Lei Orgânica × Regimento: visão integrada", "semana": "S4"}, {"id": 75, "bloco": "P2", "materia": "Direito Constitucional", "topico": "Mapa Mestre de Constitucional", "semana": "S4"}, {"id": 76, "bloco": "P2", "materia": "Direito Constitucional", "topico": "Princípios fundamentais", "semana": "S4"}, {"id": 77, "bloco": "P2", "materia": "Direito Constitucional", "topico": "Aplicabilidade das normas constitucionais: plena, contida, limitada e programáticas", "semana": "S4"}, {"id": 78, "bloco": "P2", "materia": "Direito Constitucional", "topico": "Emenda, reforma e revisão constitucional", "semana": "S4"}, {"id": 79, "bloco": "P2", "materia": "Direito Constitucional", "topico": "Direitos e deveres individuais e coletivos", "semana": "S4"}, {"id": 80, "bloco": "P2", "materia": "Direito Constitucional", "topico": "Direitos sociais", "semana": "S4"}, {"id": 81, "bloco": "P2", "materia": "Direito Constitucional", "topico": "Nacionalidade", "semana": "S4"}, {"id": 82, "bloco": "P2", "materia": "Direito Constitucional", "topico": "Direitos políticos e partidos políticos", "semana": "S4"}, {"id": 83, "bloco": "P2", "materia": "Direito Constitucional", "topico": "Organização político-administrativa", "semana": "S4"}, {"id": 84, "bloco": "P2", "materia": "Direito Constitucional", "topico": "União, estados, Distrito Federal e municípios", "semana": "S4"}, {"id": 85, "bloco": "P2", "materia": "Direito Constitucional", "topico": "Administração Pública: disposições gerais", "semana": "S5"}, {"id": 86, "bloco": "P2", "materia": "Direito Constitucional", "topico": "Servidores públicos", "semana": "S5"}, {"id": 87, "bloco": "P2", "materia": "Direito Constitucional", "topico": "Poder Executivo", "semana": "S5"}, {"id": 88, "bloco": "P2", "materia": "Direito Constitucional", "topico": "Presidente da República: atribuições e responsabilidades", "semana": "S5"}, {"id": 89, "bloco": "P2", "materia": "Direito Constitucional", "topico": "Poder Legislativo: estrutura, funcionamento e atribuições", "semana": "S5"}, {"id": 90, "bloco": "P2", "materia": "Direito Constitucional", "topico": "Processo legislativo", "semana": "S5"}, {"id": 91, "bloco": "P2", "materia": "Direito Constitucional", "topico": "Fiscalização contábil, financeira e orçamentária + CPI", "semana": "S5"}, {"id": 92, "bloco": "P2", "materia": "Direito Constitucional", "topico": "Poder Judiciário + Ministério Público + Advocacia Pública + Defensoria", "semana": "S5"}, {"id": 93, "bloco": "P2", "materia": "Direito Previdenciário", "topico": "Mapa Mestre de Previdenciário", "semana": "S5"}, {"id": 94, "bloco": "P2", "materia": "Direito Previdenciário", "topico": "Seguridade Social: origem e evolução", "semana": "S5"}, {"id": 95, "bloco": "P2", "materia": "Direito Previdenciário", "topico": "Seguridade: conceito, organização e princípios constitucionais", "semana": "S5"}, {"id": 96, "bloco": "P2", "materia": "Direito Previdenciário", "topico": "RGPS — Lei nº 8.212/1991 I", "semana": "S5"}, {"id": 97, "bloco": "P2", "materia": "Direito Previdenciário", "topico": "RGPS — Lei nº 8.212/1991 II", "semana": "S5"}, {"id": 98, "bloco": "P2", "materia": "Direito Previdenciário", "topico": "RGPS — Lei nº 8.213/1991 I", "semana": "S5"}, {"id": 99, "bloco": "P2", "materia": "Direito Previdenciário", "topico": "RGPS — Lei nº 8.213/1991 II", "semana": "S5"}, {"id": 100, "bloco": "P2", "materia": "Direito Previdenciário", "topico": "Regime Próprio de Previdência Social", "semana": "S5"}, {"id": 101, "bloco": "P2", "materia": "Direito Previdenciário", "topico": "RPPS/DF — LC Distrital nº 769/2008", "semana": "S5"}, {"id": 102, "bloco": "P2", "materia": "Direito Previdenciário", "topico": "Previdência complementar — LC nº 108/2001 e LC nº 109/2001", "semana": "S5"}, {"id": 103, "bloco": "P2", "materia": "Direito Previdenciário", "topico": "Previdência complementar do DF — LC Distrital nº 932/2017", "semana": "S5"}, {"id": 104, "bloco": "P2", "materia": "Direito Civil", "topico": "Mapa Mestre de Direito Civil", "semana": "S6"}, {"id": 105, "bloco": "P2", "materia": "Direito Civil", "topico": "LINDB", "semana": "S6"}, {"id": 106, "bloco": "P2", "materia": "Direito Civil", "topico": "Pessoas naturais e pessoas jurídicas", "semana": "S6"}, {"id": 107, "bloco": "P2", "materia": "Direito Civil", "topico": "Domicílio", "semana": "S6"}, {"id": 108, "bloco": "P2", "materia": "Direito Civil", "topico": "Bens", "semana": "S6"}, {"id": 109, "bloco": "P2", "materia": "Direito Civil", "topico": "Fatos jurídicos", "semana": "S6"}, {"id": 110, "bloco": "P2", "materia": "Direito Civil", "topico": "Negócio jurídico", "semana": "S6"}, {"id": 111, "bloco": "P2", "materia": "Direito Civil", "topico": "Atos lícitos e ilícitos + prescrição e decadência", "semana": "S6"}, {"id": 112, "bloco": "P2", "materia": "Direito Tributário", "topico": "Mapa Mestre de Tributário", "semana": "S6"}, {"id": 113, "bloco": "P2", "materia": "Direito Tributário", "topico": "Direito Tributário: conceito e fontes", "semana": "S6"}, {"id": 114, "bloco": "P2", "materia": "Direito Tributário", "topico": "Sistema Tributário Nacional", "semana": "S6"}, {"id": 115, "bloco": "P2", "materia": "Direito Tributário", "topico": "Princípios tributários", "semana": "S6"}, {"id": 116, "bloco": "P2", "materia": "Direito Tributário", "topico": "Limitações constitucionais ao poder de tributar", "semana": "S6"}, {"id": 117, "bloco": "P2", "materia": "Direito Tributário", "topico": "Repartição das receitas tributárias", "semana": "S6"}, {"id": 118, "bloco": "P2", "materia": "Direito Tributário", "topico": "Tributo: conceito e natureza jurídica", "semana": "S6"}, {"id": 119, "bloco": "P2", "materia": "Direito Tributário", "topico": "Imposto × taxa × contribuição de melhoria", "semana": "S6"}, {"id": 120, "bloco": "P2", "materia": "Direito Tributário", "topico": "Empréstimos compulsórios × contribuições", "semana": "S6"}, {"id": 121, "bloco": "P2", "materia": "Dados, Estatística, IA e Excel", "topico": "Mapa Mestre de Dados, Estatística, IA e Excel", "semana": "S6"}, {"id": 122, "bloco": "P2", "materia": "Dados, Estatística, IA e Excel", "topico": "Tipos de dados: estruturados/não estruturados e quantitativos/qualitativos", "semana": "S6"}, {"id": 123, "bloco": "P2", "materia": "Dados, Estatística, IA e Excel", "topico": "Produtos da análise: bases, relatórios, planilhas e dashboards", "semana": "S6"}, {"id": 124, "bloco": "P2", "materia": "Dados, Estatística, IA e Excel", "topico": "Distribuição de frequências", "semana": "S6"}, {"id": 125, "bloco": "P2", "materia": "Dados, Estatística, IA e Excel", "topico": "Média, mediana e moda", "semana": "S6"}, {"id": 126, "bloco": "P2", "materia": "Dados, Estatística, IA e Excel", "topico": "Variância e desvio-padrão", "semana": "S6"}, {"id": 127, "bloco": "P2", "materia": "Dados, Estatística, IA e Excel", "topico": "Anomalias e outliers", "semana": "S7"}, {"id": 128, "bloco": "P2", "materia": "Dados, Estatística, IA e Excel", "topico": "Séries históricas", "semana": "S7"}, {"id": 129, "bloco": "P2", "materia": "Dados, Estatística, IA e Excel", "topico": "Gráficos e boas práticas de visualização", "semana": "S7"}, {"id": 130, "bloco": "P2", "materia": "Dados, Estatística, IA e Excel", "topico": "Storytelling e narrativa com dados", "semana": "S7"}, {"id": 131, "bloco": "P2", "materia": "Dados, Estatística, IA e Excel", "topico": "Inteligência artificial generativa", "semana": "S7"}, {"id": 132, "bloco": "P2", "materia": "Dados, Estatística, IA e Excel", "topico": "Engenharia de prompt: contexto, persona, exemplos, saída e encadeamento", "semana": "S7"}, {"id": 133, "bloco": "P2", "materia": "Dados, Estatística, IA e Excel", "topico": "Vieses cognitivos e ética no uso de dados/IA", "semana": "S7"}, {"id": 134, "bloco": "P2", "materia": "Dados, Estatística, IA e Excel", "topico": "Excel: Power Query", "semana": "S7"}, {"id": 135, "bloco": "P2", "materia": "Dados, Estatística, IA e Excel", "topico": "Excel: fórmulas lógicas, financeiras e de busca", "semana": "S7"}, {"id": 136, "bloco": "P2", "materia": "Dados, Estatística, IA e Excel", "topico": "Excel: tabelas dinâmicas e grandes bases relacionais", "semana": "S7"}, {"id": 137, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Mapa Mestre de Direito Administrativo", "semana": "S7"}, {"id": 138, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Estado × Governo × Administração Pública", "semana": "S7"}, {"id": 139, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Direito Administrativo: conceito, objeto e fontes", "semana": "S7"}, {"id": 140, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Conceito e requisitos", "semana": "S7"}, {"id": 141, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Atributos", "semana": "S7"}, {"id": 142, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Classificação e espécies", "semana": "S7"}, {"id": 143, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Cassação × anulação × revogação × convalidação", "semana": "S7"}, {"id": 144, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Decadência administrativa", "semana": "S7"}, {"id": 145, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Conceito, espécies e disposições constitucionais", "semana": "S7"}, {"id": 146, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Cargo × emprego × função", "semana": "S7"}, {"id": 147, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Provimento × vacância", "semana": "S7"}, {"id": 148, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Efetividade × estabilidade × vitaliciedade", "semana": "S7"}, {"id": 149, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Remuneração, direitos, deveres e responsabilidades", "semana": "S7"}, {"id": 150, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Sindicância e PAD", "semana": "S8"}, {"id": 151, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Poder hierárquico × disciplinar", "semana": "S8"}, {"id": 152, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Poder regulamentar × poder de polícia", "semana": "S8"}, {"id": 153, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Uso × abuso de poder", "semana": "S8"}, {"id": 154, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Regime jurídico-administrativo e princípios", "semana": "S8"}, {"id": 155, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Evolução e responsabilidade por ação estatal", "semana": "S8"}, {"id": 156, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Omissão e requisitos", "semana": "S8"}, {"id": 157, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Excludentes, atenuantes, reparação e direito de regresso", "semana": "S8"}, {"id": 158, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Conceito, elementos e classificação", "semana": "S8"}, {"id": 159, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Princípios, formas de prestação e meios de execução", "semana": "S8"}, {"id": 160, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Autarquias × fundações", "semana": "S8"}, {"id": 161, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Empresas públicas × sociedades de economia mista", "semana": "S8"}, {"id": 162, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Paraestatais e terceiro setor", "semana": "S8"}, {"id": 163, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Controle administrativo", "semana": "S8"}, {"id": 164, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Controle judicial × legislativo", "semana": "S8"}, {"id": 165, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Improbidade — Lei nº 8.429/1992", "semana": "S8"}, {"id": 166, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Processo Administrativo — Lei nº 9.784/1999", "semana": "S8"}, {"id": 167, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Lei de Acesso à Informação", "semana": "S8"}, {"id": 168, "bloco": "P3", "materia": "Direito Administrativo", "topico": "LGPD", "semana": "S8"}, {"id": 169, "bloco": "P3", "materia": "Administração Financeira e Orçamentária", "topico": "Mapa Mestre de AFO", "semana": "S9"}, {"id": 170, "bloco": "P3", "materia": "Administração Financeira e Orçamentária", "topico": "Orçamento público: conceito e técnicas", "semana": "S9"}, {"id": 171, "bloco": "P3", "materia": "Administração Financeira e Orçamentária", "topico": "Princípios orçamentários", "semana": "S9"}, {"id": 172, "bloco": "P3", "materia": "Administração Financeira e Orçamentária", "topico": "Ciclo e processo orçamentário", "semana": "S9"}, {"id": 173, "bloco": "P3", "materia": "Administração Financeira e Orçamentária", "topico": "Sistema de planejamento e orçamento", "semana": "S9"}, {"id": 174, "bloco": "P3", "materia": "Administração Financeira e Orçamentária", "topico": "PPA", "semana": "S9"}, {"id": 175, "bloco": "P3", "materia": "Administração Financeira e Orçamentária", "topico": "LDO", "semana": "S9"}, {"id": 176, "bloco": "P3", "materia": "Administração Financeira e Orçamentária", "topico": "LOA", "semana": "S9"}, {"id": 177, "bloco": "P3", "materia": "Administração Financeira e Orçamentária", "topico": "Classificações orçamentárias", "semana": "S9"}, {"id": 178, "bloco": "P3", "materia": "Administração Financeira e Orçamentária", "topico": "Estrutura programática", "semana": "S9"}, {"id": 179, "bloco": "P3", "materia": "Administração Financeira e Orçamentária", "topico": "Créditos ordinários e adicionais", "semana": "S9"}, {"id": 180, "bloco": "P3", "materia": "Administração Financeira e Orçamentária", "topico": "Programação e execução orçamentária e financeira", "semana": "S9"}, {"id": 181, "bloco": "P3", "materia": "Administração Financeira e Orçamentária", "topico": "Descentralização orçamentária e financeira", "semana": "S9"}, {"id": 182, "bloco": "P3", "materia": "Administração Financeira e Orçamentária", "topico": "Acompanhamento, sistemas e alterações orçamentárias", "semana": "S9"}, {"id": 183, "bloco": "P3", "materia": "Administração Financeira e Orçamentária", "topico": "Receita pública: conceito e classificações", "semana": "S9"}, {"id": 184, "bloco": "P3", "materia": "Administração Financeira e Orçamentária", "topico": "Estágios, fontes e dívida ativa", "semana": "S9"}, {"id": 185, "bloco": "P3", "materia": "Administração Financeira e Orçamentária", "topico": "Despesa pública: conceito e classificações", "semana": "S9"}, {"id": 186, "bloco": "P3", "materia": "Administração Financeira e Orçamentária", "topico": "Estágios da despesa", "semana": "S9"}, {"id": 187, "bloco": "P3", "materia": "Administração Financeira e Orçamentária", "topico": "Restos a pagar × despesas de exercícios anteriores", "semana": "S9"}, {"id": 188, "bloco": "P3", "materia": "Administração Financeira e Orçamentária", "topico": "Dívida flutuante × fundada + suprimento de fundos", "semana": "S9"}, {"id": 189, "bloco": "P3", "materia": "Administração Financeira e Orçamentária", "topico": "Lei de Responsabilidade Fiscal", "semana": "S9"}, {"id": 190, "bloco": "P3", "materia": "Administração Financeira e Orçamentária", "topico": "Lei nº 4.320/1964", "semana": "S9"}, {"id": 191, "bloco": "P3", "materia": "Administração Financeira e Orçamentária", "topico": "Transferências voluntárias", "semana": "S9"}, {"id": 192, "bloco": "P3", "materia": "Administração Financeira e Orçamentária", "topico": "Decreto Distrital nº 32.598/2010", "semana": "S9"}, {"id": 193, "bloco": "P3", "materia": "Administração Geral e Pública", "topico": "Mapa Mestre de Administração", "semana": "S10"}, {"id": 194, "bloco": "P3", "materia": "Administração Geral e Pública", "topico": "Perspectiva clássica: científica e burocrática", "semana": "S10"}, {"id": 195, "bloco": "P3", "materia": "Administração Geral e Pública", "topico": "Relações humanas, recursos humanos e ciências comportamentais", "semana": "S10"}, {"id": 196, "bloco": "P3", "materia": "Administração Geral e Pública", "topico": "Pensamento sistêmico × contingência", "semana": "S10"}, {"id": 197, "bloco": "P3", "materia": "Administração Geral e Pública", "topico": "Evolução da Administração do setor público brasileiro", "semana": "S10"}, {"id": 198, "bloco": "P3", "materia": "Administração Geral e Pública", "topico": "Patrimonialista × burocrática × gerencial", "semana": "S10"}, {"id": 199, "bloco": "P3", "materia": "Administração Geral e Pública", "topico": "Princípios da governança pública", "semana": "S10"}, {"id": 200, "bloco": "P3", "materia": "Administração Geral e Pública", "topico": "Liderança × estratégia × controle", "semana": "S10"}, {"id": 201, "bloco": "P3", "materia": "Administração Geral e Pública", "topico": "Planejamento × organização × direção × controle", "semana": "S10"}, {"id": 202, "bloco": "P3", "materia": "Administração Geral e Pública", "topico": "SWOT × GUT × 5W2H", "semana": "S10"}, {"id": 203, "bloco": "P3", "materia": "Administração Geral e Pública", "topico": "PDCA × mapas estratégicos × benchmarking × fatores críticos de sucesso", "semana": "S10"}, {"id": 204, "bloco": "P3", "materia": "Administração Geral e Pública", "topico": "Modelagem de processos", "semana": "S10"}, {"id": 205, "bloco": "P3", "materia": "Administração Geral e Pública", "topico": "BPMN", "semana": "S10"}, {"id": 206, "bloco": "P3", "materia": "Administração Geral e Pública", "topico": "EPC × IDF0 × cadeia de valor", "semana": "S10"}, {"id": 207, "bloco": "P3", "materia": "Administração Geral e Pública", "topico": "CHA × matriz de competências × APPO", "semana": "S10"}, {"id": 208, "bloco": "P3", "materia": "Administração Geral e Pública", "topico": "Liderança × motivação", "semana": "S10"}, {"id": 209, "bloco": "P3", "materia": "Administração Geral e Pública", "topico": "PMBOK × Prince × Scrum × métodos ágeis", "semana": "S10"}, {"id": 210, "bloco": "P3", "materia": "Administração Geral e Pública", "topico": "Cronogramas, escopo, sequenciamento, esforço, duração, pessoas e Kanban", "semana": "S10"}, {"id": 211, "bloco": "P3", "materia": "LC Distrital 840/2011", "topico": "Mapa Mestre LC 840", "semana": "S10"}, {"id": 212, "bloco": "P3", "materia": "LC Distrital 840/2011", "topico": "Disposições preliminares, cargos e funções de confiança", "semana": "S10"}, {"id": 213, "bloco": "P3", "materia": "LC Distrital 840/2011", "topico": "Concurso público, nomeação e requisitos de investidura", "semana": "S10"}, {"id": 214, "bloco": "P3", "materia": "LC Distrital 840/2011", "topico": "Posse, exercício e estágio probatório", "semana": "S10"}, {"id": 215, "bloco": "P3", "materia": "LC Distrital 840/2011", "topico": "Estabilidade e formas de provimento derivado", "semana": "S10"}, {"id": 216, "bloco": "P3", "materia": "LC Distrital 840/2011", "topico": "Remoção, redistribuição e substituição", "semana": "S10"}, {"id": 217, "bloco": "P3", "materia": "LC Distrital 840/2011", "topico": "Vacância do cargo público", "semana": "S11"}, {"id": 218, "bloco": "P3", "materia": "LC Distrital 840/2011", "topico": "Carreiras, promoção, regime e jornada de trabalho", "semana": "S11"}, {"id": 219, "bloco": "P3", "materia": "LC Distrital 840/2011", "topico": "Sistema remuneratório: subsídio, remuneração, teto e descontos", "semana": "S11"}, {"id": 220, "bloco": "P3", "materia": "LC Distrital 840/2011", "topico": "Vantagens: indenizações, gratificações e adicionais", "semana": "S11"}, {"id": 221, "bloco": "P3", "materia": "LC Distrital 840/2011", "topico": "Férias", "semana": "S11"}, {"id": 222, "bloco": "P3", "materia": "LC Distrital 840/2011", "topico": "Licenças", "semana": "S11"}, {"id": 223, "bloco": "P3", "materia": "LC Distrital 840/2011", "topico": "Abono de ponto e afastamentos", "semana": "S11"}, {"id": 224, "bloco": "P3", "materia": "LC Distrital 840/2011", "topico": "Tempo de serviço e direito de petição", "semana": "S11"}, {"id": 225, "bloco": "P3", "materia": "LC Distrital 840/2011", "topico": "Deveres e responsabilidades do servidor", "semana": "S11"}, {"id": 226, "bloco": "P3", "materia": "LC Distrital 840/2011", "topico": "Infrações disciplinares", "semana": "S11"}, {"id": 227, "bloco": "P3", "materia": "LC Distrital 840/2011", "topico": "Sanções disciplinares, prescrição e extinção da punibilidade", "semana": "S11"}, {"id": 228, "bloco": "P3", "materia": "LC Distrital 840/2011", "topico": "Sindicância, processo disciplinar e revisão", "semana": "S11"}, {"id": 229, "bloco": "P3", "materia": "LC Distrital 840/2011", "topico": "Seguridade social, saúde e disposições finais e transitórias", "semana": "S11"}, {"id": 230, "bloco": "P3", "materia": "LC Distrital 840/2011", "topico": "Revisão integrada da LC 840", "semana": "S11"}, {"id": 231, "bloco": "P3", "materia": "Gestão de Contratos", "topico": "Mapa Mestre de Gestão de Contratos", "semana": "S11"}, {"id": 232, "bloco": "P3", "materia": "Gestão de Contratos", "topico": "Lei nº 14.133/2021 — visão integrada", "semana": "S11"}, {"id": 233, "bloco": "P3", "materia": "Gestão de Contratos", "topico": "Decreto Distrital nº 44.330/2023", "semana": "S11"}, {"id": 234, "bloco": "P3", "materia": "Gestão de Contratos", "topico": "IN nº 5/2017", "semana": "S11"}, {"id": 235, "bloco": "P3", "materia": "Gestão de Contratos", "topico": "Elaboração de contratos", "semana": "S11"}, {"id": 236, "bloco": "P3", "materia": "Gestão de Contratos", "topico": "Cláusulas contratuais", "semana": "S11"}, {"id": 237, "bloco": "P3", "materia": "Gestão de Contratos", "topico": "Indicadores de nível de serviço", "semana": "S11"}, {"id": 238, "bloco": "P3", "materia": "Gestão de Contratos", "topico": "Papel do fiscal", "semana": "S11"}, {"id": 239, "bloco": "P3", "materia": "Gestão de Contratos", "topico": "Papel do preposto", "semana": "S11"}, {"id": 240, "bloco": "P3", "materia": "Gestão de Contratos", "topico": "Acompanhamento da execução", "semana": "S11"}, {"id": 241, "bloco": "P3", "materia": "Gestão de Contratos", "topico": "Registro de irregularidades", "semana": "S12"}, {"id": 242, "bloco": "P3", "materia": "Gestão de Contratos", "topico": "Notificação de irregularidades", "semana": "S12"}, {"id": 243, "bloco": "P3", "materia": "Gestão de Contratos", "topico": "Penalidades", "semana": "S12"}, {"id": 244, "bloco": "P3", "materia": "Gestão de Contratos", "topico": "Sanções administrativas", "semana": "S12"}, {"id": 245, "bloco": "P3", "materia": "Gestão de Contratos", "topico": "Equação econômico-financeira", "semana": "S12"}, {"id": 246, "bloco": "P3", "materia": "Gestão de Contratos", "topico": "Reajuste", "semana": "S12"}, {"id": 247, "bloco": "P3", "materia": "Gestão de Contratos", "topico": "Repactuação", "semana": "S12"}, {"id": 248, "bloco": "P3", "materia": "Gestão de Contratos", "topico": "Quadro comparativo integrado: contratação e fiscalização", "semana": "S12"}, {"id": 249, "bloco": "P4", "materia": "Discursiva", "topico": "Como funciona a prova discursiva do TCDF", "semana": "S12"}, {"id": 250, "bloco": "P4", "materia": "Discursiva", "topico": "Critérios de correção e nota mínima", "semana": "S12"}, {"id": 251, "bloco": "P4", "materia": "Discursiva", "topico": "Como estruturar a questão de até 20 linhas", "semana": "S12"}, {"id": 252, "bloco": "P4", "materia": "Discursiva", "topico": "Como interpretar o comando da discursiva", "semana": "S12"}, {"id": 253, "bloco": "P4", "materia": "Discursiva", "topico": "Como planejar a resposta antes de escrever", "semana": "S12"}, {"id": 254, "bloco": "P4", "materia": "Discursiva", "topico": "Introdução, desenvolvimento e conclusão sem desperdiçar linhas", "semana": "S12"}, {"id": 255, "bloco": "P4", "materia": "Discursiva", "topico": "Coerência, coesão e linguagem formal", "semana": "S12"}, {"id": 256, "bloco": "P4", "materia": "Discursiva", "topico": "Erros gramaticais e impacto na pontuação", "semana": "S12"}, {"id": 257, "bloco": "P4", "materia": "Discursiva", "topico": "Gestão do limite de linhas", "semana": "S12"}, {"id": 258, "bloco": "P4", "materia": "Discursiva", "topico": "Peça técnica “Informação”: estrutura", "semana": "S12"}, {"id": 259, "bloco": "P4", "materia": "Discursiva", "topico": "Como transformar conhecimento de P3 em peça técnica", "semana": "S12"}, {"id": 260, "bloco": "P4", "materia": "Discursiva", "topico": "Checklist visual de revisão antes de entregar", "semana": "S12"}];
const ESTUDOS_MAPAS_CRUD_KEY="bertha.estudos.mapas.crud.v1";
function loadStudyMapsCrud(){
 try{const v=JSON.parse(localStorage.getItem(ESTUDOS_MAPAS_CRUD_KEY)||'{}');return{custom:Array.isArray(v.custom)?v.custom:[],overrides:v.overrides&&typeof v.overrides==='object'?v.overrides:{},deleted:Array.isArray(v.deleted)?v.deleted.map(Number):[]};}catch{return{custom:[],overrides:{},deleted:[]}}
}
function saveStudyMapsCrud(v){localStorage.setItem(ESTUDOS_MAPAS_CRUD_KEY,JSON.stringify(v))}
function studyMapsAll(){
 const c=loadStudyMapsCrud(),deleted=new Set(c.deleted.map(Number));
 const base=TCDF_MAPAS.filter(x=>!deleted.has(+x.id)).map(x=>({...x,...(c.overrides[String(x.id)]||{}),id:+x.id,custom:false}));
 const custom=c.custom.filter(x=>!deleted.has(+x.id)).map(x=>({...x,id:+x.id,custom:true}));
 return [...base,...custom].sort((a,b)=>(+a.id)-(+b.id));
}
function studyMapById(id){return studyMapsAll().find(x=>+x.id===+id)}
function nextStudyMapId(){const all=[...TCDF_MAPAS,...loadStudyMapsCrud().custom],max=all.reduce((m,x)=>Math.max(m,+x.id||0),260);return Math.max(261,max+1)}
function saveStudyMapRecord(obj){
 const c=loadStudyMapsCrud(),base=TCDF_MAPAS.some(x=>+x.id===+obj.id);
 if(base)c.overrides[String(obj.id)]={bloco:obj.bloco,materia:obj.materia,topico:obj.topico,semana:obj.semana,minutes:obj.minutes||30};
 else{const i=c.custom.findIndex(x=>+x.id===+obj.id);if(i>=0)c.custom[i]={...c.custom[i],...obj,custom:true};else c.custom.push({...obj,custom:true});}
 c.deleted=c.deleted.filter(x=>+x!==+obj.id);saveStudyMapsCrud(c);
}
function deleteStudyMapRecord(id){
 const c=loadStudyMapsCrud(),base=TCDF_MAPAS.some(x=>+x.id===+id);
 if(base){if(!c.deleted.some(x=>+x===+id))c.deleted.push(+id);delete c.overrides[String(id)];}
 else c.custom=c.custom.filter(x=>+x.id!==+id);
 saveStudyMapsCrud(c);
}
function studyMapDialog(id,onDone){
 const current=id!=null?studyMapById(id):null,dlg=document.createElement('dialog');dlg.className='study-v10-dialog study-module-dialog';
 const map=current||{id:nextStudyMapId(),bloco:'P1',materia:'',topico:'',semana:'S1',minutes:30};
 dlg.innerHTML=`<div class="study-v10-modal"><div class="study-v10-head"><div><div class="eyebrow">TCDF 2026</div><h2>${current?'Editar mapa':'Novo mapa'}</h2><p>${current?`Mapa ${String(map.id).padStart(3,'0')}`:'Ele entra na mesma biblioteca e na inteligência da BERTH.A.'}</p></div><button class="study-v10-x" type="button">×</button></div>
 ${field('Tema / título',`<input data-map-topic maxlength="180" value="${escapeHtml(map.topico||'')}" placeholder="Ex.: Controle da administração pública">`)}
 ${field('Matéria',`<input data-map-subject maxlength="120" value="${escapeHtml(map.materia||'')}" placeholder="Ex.: Direito Administrativo">`)}
 <div class="study-map-form-grid">${field('Bloco',`<input data-map-block maxlength="30" value="${escapeHtml(map.bloco||'')}" placeholder="Ex.: P2">`)}${field('Semana',`<input data-map-week maxlength="30" value="${escapeHtml(map.semana||'')}" placeholder="Ex.: S4">`)}</div>
 ${field('Duração planejada',`<div class="study-v10-duration"><input data-map-minutes type="number" min="5" step="5" value="${Math.max(5,+map.minutes||30)}"><span class="study-map-unit">minutos</span></div>`)}
 <div class="study-v10-actions">${current?'<button class="danger" type="button" data-map-delete>Excluir</button>':''}<button class="secondary" type="button" data-map-cancel>Cancelar</button><button class="primary" type="button" data-map-save>Salvar</button></div></div>`;
 document.body.appendChild(dlg);const close=()=>dlg.close();dlg.querySelector('.study-v10-x').onclick=close;dlg.querySelector('[data-map-cancel]').onclick=close;
 dlg.querySelector('[data-map-delete]')?.addEventListener('click',()=>{if(!confirm(`Excluir o Mapa ${String(map.id).padStart(3,'0')} da biblioteca? O histórico de estudos já realizado será preservado.`))return;deleteStudyMapRecord(map.id);close();setTimeout(()=>{renderEstudos();onDone?.();},0)});
 dlg.querySelector('[data-map-save]').onclick=()=>{const topico=dlg.querySelector('[data-map-topic]').value.trim(),materia=dlg.querySelector('[data-map-subject]').value.trim();if(!topico||!materia){alert('Preencha o tema e a matéria.');return;}saveStudyMapRecord({id:+map.id,topico,materia,bloco:dlg.querySelector('[data-map-block]').value.trim()||'—',semana:dlg.querySelector('[data-map-week]').value.trim()||'—',minutes:Math.max(5,+dlg.querySelector('[data-map-minutes]').value||30)});close();setTimeout(()=>{renderEstudos();onDone?.();},0)};
 dlg.onclose=()=>dlg.remove();dlg.showModal();
}

function addDaysISO(ms,n){const d=new Date(ms);d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)}
function nextStepFor(a={}){if(!a.primeira)return{field:"primeira",label:"1ª volta"};if(!a.questoes)return{field:"questoes",label:"Questões"};if(!a.domino)return{field:"domino",label:"Domínio"};return{field:"done",label:"Dominado"}}
function nextReviewFor(a={}){if(!a.primeiraAt)return null;for(const k of["r1","r3","r7","r15"])if(!a[k]&&a[k+"Due"])return{key:k,label:k.toUpperCase(),due:a[k+"Due"]};return null}
function toggleMapa(id,f){const d=loadMapasStatus(),k=String(id),a={...(d[k]||{})};if(f==="primeira"&&!a.primeira){a.primeira=true;a.primeiraAt=Date.now();a.r1Due=addDaysISO(a.primeiraAt,1);a.r3Due=addDaysISO(a.primeiraAt,3);a.r7Due=addDaysISO(a.primeiraAt,7);a.r15Due=addDaysISO(a.primeiraAt,15)}else if(f==="primeira"){a.primeira=false;a.primeiraAt=null;["r1","r3","r7","r15"].forEach(x=>{delete a[x];delete a[x+"Due"]})}else if(f==="questoes")a.questoes=!a.questoes;else if(f==="domino"){if(!a.primeira||!a.questoes){alert("Complete primeiro a 1ª volta e as questões.");return}a.domino=!a.domino}saveMapasStatus({...d,[k]:a});renderEstudos()}
function estudoSugestao(min=30){const d=loadMapasStatus(),maps=studyMapsAll(),limit=Math.max(1,+min||30),fits=x=>Math.max(5,+x.minutes||30)<=limit,rev=maps.filter(x=>nextReviewFor(d[x.id])&&fits(x)),due=maps.filter(x=>!d[x.id]?.domino&&fits(x));if(rev.length)return{title:"Revisão primeiro",text:"Há revisão prevista que cabe nesta janela.",maps:rev.slice(0,1)};if(due.length)return{title:limit<=30?`Janela de ${limit} min`:"Próximo conteúdo",text:"Este mapa cabe no tempo disponível.",maps:due.slice(0,1)};return{title:`Janela de ${limit} min`,text:"Nenhum mapa planejado cabe nesta janela sem apertar seu dia.",maps:[]}}
function studyNorm(v=""){return String(v).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")}
function studyStatus(a={}){return a.domino?"dominio":a.questoes?"questoes":a.primeira?"primeira":"nao-iniciado"}

function studyHeroIcon(){return `<svg viewBox="0 0 48 42" aria-hidden="true"><path d="M8 10h24"/><path d="M14 21h26"/><path d="M8 32h24"/><path d="M32 10l8 11-8 11"/></svg>`}
function renderEstudos(){
 const d=loadEstudos(),st=loadMapasStatus(),c=loadStudyContents(),maps=studyMapsAll(),mapCount=maps.length,first=maps.filter(x=>st[x.id]?.primeira).length,q=maps.filter(x=>st[x.id]?.questoes).length,dom=maps.filter(x=>st[x.id]?.domino).length,sug=estudoSugestao(30);
 app.innerHTML=`<section class="study-hero"><div><div class="eyebrow">ESTUDOS</div><h2>Space to think. Space to live.</h2><p>Você estuda. A BERTH.A acompanha.</p></div><span class="study-hero-icon">${studyHeroIcon()}</span></section>
 <div class="study-v10-stats"><div><b>${d.sessions.length}</b><span>sessões</span></div><div><b>${dom}</b><span>dominados</span></div><div><b>${mapCount}</b><span>mapas</span></div></div>
 <div class="study-section"><div class="section-heading"><div><div class="eyebrow">TCDF 2026</div><h3>Biblioteca de mapas</h3></div><div class="study-map-head-actions"><button class="secondary" id="addMap">＋ Mapa</button><button class="secondary" id="viewMaps">Ver mapas</button></div></div><div class="card study-v10-summary"><div><strong>${mapCount} mapas cadastrados</strong><span>${first} em 1ª volta · ${q} com questões · ${dom} dominados</span></div><button class="secondary" id="searchMaps">⌕ Buscar</button></div></div>
 <div class="study-section"><div class="section-heading"><div><div class="eyebrow">SUGESTÃO INTELIGENTE</div><h3>${escapeHtml(sug.title)}</h3></div></div><div class="card"><p>${escapeHtml(sug.text)}</p>${sug.maps[0]?`<button class="primary" data-start-map="${sug.maps[0].id}">Começar · Mapa ${String(sug.maps[0].id).padStart(3,"0")}</button>`:""}</div></div>
 <div class="study-section"><div class="section-heading"><div><div class="eyebrow">OUTROS ESTUDOS</div><h3>Outros conteúdos</h3></div><button class="secondary" id="addContent">＋ Conteúdo</button></div><div class="list">${c.length?c.map(contentCard).join(""):`<div class="empty compact"><strong>Nenhum conteúdo adicionado.</strong><span>Cadastre MBA, Tarot, aulas, áudios ou outros estudos online.</span></div>`}</div></div>
 <div class="study-section"><div class="section-heading"><div><div class="eyebrow">HISTÓRICO</div><h3>Estudos realizados</h3></div><button class="secondary" id="pastStudy">＋ Registrar passado</button></div><div class="list">${d.sessions.length?d.sessions.slice().reverse().slice(0,8).map(sessionHtml).join(""):`<div class="empty compact"><strong>Nenhum estudo registrado.</strong><span>Começar → Concluir mede o tempo automaticamente.</span></div>`}</div></div>`;
 document.querySelector("#addMap")?.addEventListener("click",()=>studyMapDialog(null));document.querySelector("#viewMaps")?.addEventListener("click",()=>openMaps(false));document.querySelector("#searchMaps")?.addEventListener("click",()=>openMaps(true));document.querySelector("[data-start-map]")?.addEventListener("click",e=>startMap(+e.currentTarget.dataset.startMap));document.querySelector("#addContent")?.addEventListener("click",()=>contentDialog());document.querySelector("#pastStudy")?.addEventListener("click",pastDialog);document.querySelectorAll("[data-study-session]").forEach(card=>card.onclick=()=>openPastStudyActions(card.dataset.studySession));document.querySelectorAll("[data-content-start]").forEach(b=>b.onclick=()=>startContent(b.dataset.contentStart));document.querySelectorAll("[data-content-open]").forEach(b=>b.onclick=()=>openContent(b.dataset.contentOpen));document.querySelectorAll("[data-content-edit]").forEach(b=>b.onclick=()=>contentDialog(b.dataset.contentEdit));document.querySelectorAll("[data-content-delete]").forEach(b=>b.onclick=()=>deleteStudyContent(b.dataset.contentDelete));
}
function contentCard(x){return `<article class="card study-v10-content"><div><small>${escapeHtml(x.group||"ESTUDO")}</small><strong>${escapeHtml(x.title)}</strong><span>${x.minutes||60} min${x.note?" · "+escapeHtml(x.note):""}</span></div><div>${x.url?`<button class="secondary" data-content-open="${x.id}">Abrir conteúdo</button>`:""}<button class="primary" data-content-start="${x.id}">Começar</button><button class="secondary" data-content-edit="${x.id}">⋯</button><button class="study-v10-trash" data-content-delete="${x.id}" aria-label="Excluir conteúdo">×</button></div></article>`}
function openMaps(focus){
 const maps=studyMapsAll(),dlg=document.createElement("dialog");dlg.className="study-v10-dialog study-module-dialog";dlg.innerHTML=`<div class="study-v10-modal maplib"><div class="study-v10-head"><div><div class="eyebrow">TCDF 2026</div><h2>${maps.length} mapas</h2><p>Busque, acompanhe, edite ou acrescente mapas.</p></div><button class="study-v10-x">×</button></div><div class="study-map-library-tools"><div class="study-v10-search">⌕<input type="search" placeholder="Buscar nos ${maps.length} mapas…"></div><button type="button" class="primary study-add-map-inline" data-new-map>＋ Mapa</button></div><div class="study-v10-filters">${[["todos","Todos"],["nao-iniciado","Não iniciados"],["primeira","1ª volta"],["questoes","Questões"],["dominio","Domínio"]].map(([v,l])=>`<button data-filter="${v}" class="${v==="todos"?"active":""}">${l}</button>`).join("")}</div><div class="study-v10-results"></div></div>`;document.body.appendChild(dlg);let filter="todos";const input=dlg.querySelector("input"),res=dlg.querySelector(".study-v10-results");
 const draw=()=>{const st=loadMapasStatus(),term=studyNorm(input.value.trim()),all=studyMapsAll(),rows=all.filter(x=>(filter==="todos"||studyStatus(st[x.id])===filter)&&(!term||studyNorm(`${x.id} ${String(x.id).padStart(3,"0")} ${x.bloco} ${x.materia} ${x.topico} ${x.semana}`).includes(term)));res.innerHTML=`<div class="study-v10-count">${rows.length} mapa${rows.length===1?"":"s"}</div>`+(rows.length?rows.map(x=>mapRow(x,st[x.id]||{})).join(""):`<div class="empty compact"><strong>Nenhum mapa encontrado.</strong><span>Tente outra palavra-chave.</span></div>`);res.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>{const id=+b.dataset.go;dlg.close();startMap(id)});res.querySelectorAll("[data-toggle]").forEach(b=>b.onclick=()=>{toggleMapa(+b.dataset.id,b.dataset.toggle);setTimeout(draw,0)});res.querySelectorAll("[data-edit-map]").forEach(b=>b.onclick=()=>studyMapDialog(+b.dataset.editMap,draw))};
 dlg.querySelector(".study-v10-x").onclick=()=>dlg.close();dlg.querySelector('[data-new-map]').onclick=()=>studyMapDialog(null,draw);input.oninput=draw;dlg.querySelectorAll("[data-filter]").forEach(b=>b.onclick=()=>{filter=b.dataset.filter;dlg.querySelectorAll("[data-filter]").forEach(x=>x.classList.toggle("active",x===b));draw()});dlg.onclose=()=>dlg.remove();draw();dlg.showModal();if(focus)setTimeout(()=>input.focus(),120)
}
function mapRow(x,a){return `<article class="study-v10-map"><div><small>MAPA ${String(x.id).padStart(3,"0")} · ${escapeHtml(x.bloco)} · ${escapeHtml(x.semana)}</small><strong>${escapeHtml(x.topico)}</strong><span>${escapeHtml(x.materia)} · ${Math.max(5,+x.minutes||30)} min</span><em>Próximo: ${nextStepFor(a).label}</em></div><div class="study-v10-mapactions">${[["primeira","1ª"],["questoes","Q"],["domino","D"]].map(([f,l])=>`<button data-id="${x.id}" data-toggle="${f}" class="${a[f]?"done":""}">${l}</button>`).join("")}<button data-go="${x.id}" class="go">Começar</button><button data-edit-map="${x.id}" class="edit-map" aria-label="Editar mapa">Editar</button></div></article>`}
function startViaBertha(item){if(window.BerthaDurationLearning)item.minutes=window.BerthaDurationLearning.effectiveMinutes(item);if(window.BerthaTimeEngine?.start)window.BerthaTimeEngine.start(item);else alert("Atualize também bertha-time-v1.js para usar o timer global.")}
function startMap(id){const x=studyMapById(id);if(x){const mins=Math.max(5,+x.minutes||30);startViaBertha({id:`study:tcdf:${id}`,learningKey:`study:tcdf:${id}`,source:"Estudos",title:`Mapa ${String(id).padStart(3,"0")} · ${x.topico}`,minutes:mins,configuredMinutes:mins,period:"flex",kind:"study"})}}
function startContent(id){const x=loadStudyContents().find(v=>v.id===id);if(!x)return;if(x.url&&confirm("Abrir o conteúdo e começar a medir?"))openContent(id);startViaBertha({id:`study:content:${id}`,learningKey:`study:content:${id}`,source:"Estudos",title:x.title,minutes:+x.minutes||60,configuredMinutes:+x.minutes||60,period:"flex",kind:"study"})}
function openContent(id){const x=loadStudyContents().find(v=>v.id===id);if(!x?.url)return;let u=x.url.trim();if(!/^https?:\/\//i.test(u))u="https://"+u;window.open(u,"_blank","noopener")}
function deleteStudyContent(id){
 const items=loadStudyContents(),item=items.find(x=>x.id===id);if(!item)return;
 if(!confirm(`Excluir “${item.title}”?`))return;
 saveStudyContents(items.filter(x=>x.id!==id));
 renderEstudos();
}
function contentDialog(id){
 const items=loadStudyContents(),e=items.find(x=>x.id===id),dlg=document.createElement("dialog");dlg.className="study-v10-dialog study-module-dialog";dlg.innerHTML=`<div class="study-v10-modal"><div class="study-v10-head"><div><div class="eyebrow">ESTUDOS</div><h2>${e?"Editar conteúdo":"Adicionar conteúdo"}</h2><p>MBA, Tarot, áudio, aula ou outro material.</p></div><button class="study-v10-x">×</button></div>${field("Nome",`<input data-title value="${escapeHtml(e?.title||"")}" placeholder="Ex.: MBA · Aula 04">`)}${field("Frente de estudo",`<input data-group value="${escapeHtml(e?.group||"")}" placeholder="Ex.: MBA, Tarot, TCDF">`)}${field("Link para abrir o conteúdo",`<input data-url value="${escapeHtml(e?.url||"")}" placeholder="https://…">`)}${field("Duração planejada",`<div class="study-v10-duration"><input data-dur type="number" min="1" value="${e?.durationValue||e?.minutes||60}"><select data-unit><option value="minutes">minutos</option><option value="hours" ${e?.durationUnit==="hours"?"selected":""}>horas</option></select></div>`)}${field("Observação",`<textarea data-note rows="3">${escapeHtml(e?.note||"")}</textarea>`)}<div class="study-v10-actions">${e?'<button class="danger" data-delete>Excluir</button>':""}<button class="secondary" data-cancel>Cancelar</button><button class="primary" data-save>Salvar</button></div></div>`;document.body.appendChild(dlg);dlg.querySelector(".study-v10-x").onclick=()=>dlg.close();dlg.querySelector("[data-cancel]").onclick=()=>dlg.close();dlg.querySelector("[data-delete]")?.addEventListener("click",()=>{if(!confirm(`Excluir “${e.title}”?`))return;saveStudyContents(loadStudyContents().filter(x=>x.id!==e.id));dlg.close();setTimeout(renderEstudos,0)});dlg.querySelector("[data-save]").onclick=()=>{const title=dlg.querySelector("[data-title]").value.trim();if(!title)return;const v=Math.max(1,+dlg.querySelector("[data-dur]").value||60),u=dlg.querySelector("[data-unit]").value,obj={id:e?.id||`sc-${Date.now()}`,title,group:dlg.querySelector("[data-group]").value.trim(),url:dlg.querySelector("[data-url]").value.trim(),durationValue:v,durationUnit:u,minutes:u==="hours"?v*60:v,note:dlg.querySelector("[data-note]").value.trim()};saveStudyContents(e?items.map(x=>x.id===e.id?obj:x):[...items,obj]);dlg.close();renderEstudos()};dlg.onclose=()=>dlg.remove();dlg.showModal()
}
function field(label,html){return `<label class="study-v10-field"><span>${label}</span>${html}</label>`}
function recordPastStudyToProgress(title,date,minutes){try{const key='bertha.time-engine.v1',e=JSON.parse(localStorage.getItem(key)||'{"active":null,"history":[],"snoozed":{}}');e.history=Array.isArray(e.history)?e.history:[];const d=String(date||todayISO()),end=new Date(`${d}T20:00:00`).getTime()||Date.now(),mins=Math.max(1,+minutes||30);e.history.unshift({itemId:`study:past:${Date.now()}`,learningKey:`study:past:${String(title||'estudo').toLowerCase().replace(/[^a-z0-9]+/g,'-')}`,title:title||'Estudo',source:'Estudos',day:d,startedAt:end-mins*60000,endedAt:end,configuredMinutes:mins,plannedMinutes:mins,realMinutes:mins,status:'done',note:'Registrado manualmente'});localStorage.setItem(key,JSON.stringify(e));}catch{}}
function pastDialog(){
 const d=loadEstudos(),dlg=document.createElement("dialog");dlg.className="study-v10-dialog study-module-dialog";dlg.innerHTML=`<div class="study-v10-modal"><div class="study-v10-head"><div><div class="eyebrow">HISTÓRICO</div><h2>Registrar estudo passado</h2><p>Para quando você estudou sem iniciar o timer.</p></div><button class="study-v10-x">×</button></div>${field("O que você estudou?",'<input data-title placeholder="Ex.: MBA · Gestão de Pessoas">')}${field("Data",`<input data-date type="date" value="${new Date().toISOString().slice(0,10)}">`)}${field("Tempo real",'<div class="study-v10-duration"><input data-dur type="number" min="1" value="30"><select data-unit><option value="minutes">minutos</option><option value="hours">horas</option></select></div>')}<div class="study-v10-actions"><button class="secondary" data-cancel>Cancelar</button><button class="primary" data-save>Salvar</button></div></div>`;document.body.appendChild(dlg);dlg.querySelector(".study-v10-x").onclick=()=>dlg.close();dlg.querySelector("[data-cancel]").onclick=()=>dlg.close();dlg.querySelector("[data-save]").onclick=()=>{const t=dlg.querySelector("[data-title]").value.trim();if(!t)return;const v=+dlg.querySelector("[data-dur]").value||30,u=dlg.querySelector("[data-unit]").value;const day=dlg.querySelector("[data-date]").value,mins=u==="hours"?v*60:v;d.sessions.push({id:`s-${Date.now()}`,subject:t,date:day,minutes:mins});saveEstudos(d);recordPastStudyToProgress(t,day,mins);dlg.close();renderEstudos()};dlg.onclose=()=>dlg.remove();dlg.showModal()
}

function openPastStudyActions(id){
 const data=loadEstudos(),s=data.sessions.find(x=>String(x.id)===String(id));if(!s)return;
 const dlg=document.createElement("dialog");dlg.className="study-v10-dialog study-module-dialog";
 dlg.innerHTML=`<div class="study-v10-modal">
   <div class="study-v10-head"><div><div class="eyebrow">ESTUDO REALIZADO</div><h2>${escapeHtml(s.subject||s.title||"Estudo")}</h2><p>${escapeHtml(s.date||"")} · ${+s.minutes||0} min</p></div><button class="study-v10-x">×</button></div>
   <p class="study-history-copy">O que você quer fazer com este registro?</p>
   <div class="study-history-actions">
     <button type="button" class="danger" data-delete-session>Excluir</button>
     <button type="button" class="secondary" data-close-session>Fechar</button>
     <button type="button" class="primary" data-repeat-session>Repetir</button>
   </div>
   <small class="study-history-help">Repetir não inicia agora. O estudo volta para as sugestões da BERTH.A quando couber no seu dia.</small>
 </div>`;
 document.body.appendChild(dlg);
 const close=()=>dlg.close();
 dlg.querySelector(".study-v10-x").onclick=close;
 dlg.querySelector("[data-close-session]").onclick=close;
 dlg.querySelector("[data-delete-session]").onclick=()=>{
   if(!confirm(`Excluir “${s.subject||s.title||"Estudo"}” do histórico?`))return;
   const fresh=loadEstudos();
   fresh.sessions=fresh.sessions.filter(x=>String(x.id)!==String(id));
   saveEstudos(fresh);
   close();
   setTimeout(renderEstudos,0);
 };
 dlg.querySelector("[data-repeat-session]").onclick=()=>{
   const item={
     id:`study:history:${s.id}`,
     repeatBaseId:`study:history:${s.id}`,
     learningKey:`study:history:${s.id}`,
     source:"Estudos",
     title:s.subject||s.title||"Estudo",
     minutes:+s.minutes||30,
     configuredMinutes:+s.minutes||30,
     period:"flex",
     kind:"study"
   };
   if(window.BerthaRepeat?.enqueue){
     window.BerthaRepeat.enqueue(item);
     close();
     setTimeout(()=>{renderEstudos();alert("Pronto. Esse estudo voltou para as sugestões da BERTH.A.");},0);
   }else{
     alert("Atualize também bertha-time-v1.js para habilitar Repetir.");
   }
 };
 dlg.onclose=()=>dlg.remove();
 dlg.showModal();
}

function sessionHtml(s){return `<article class="card study-history-card" data-study-session="${s.id}"><div><strong>${escapeHtml(s.subject||s.title||"Estudo")}</strong><div class="study-meta">${escapeHtml(s.date||"")} · ${+s.minutes||0} min</div></div><span class="study-history-chevron">›</span></article>`}

(function(){if(document.getElementById("study-v10-css"))return;const s=document.createElement("style");s.id="study-v10-css";s.textContent=`
.study-v10-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0 22px}.study-v10-stats div{background:linear-gradient(145deg,#fff9dc,#f2ecfb);border-radius:18px;padding:12px;text-align:center}.study-v10-stats b,.study-v10-stats span{display:block}.study-v10-stats b{font-size:20px}.study-v10-stats span{font-size:11px;color:#837985}.study-v10-summary,.study-v10-content{display:flex;justify-content:space-between;gap:12px;align-items:center}
.study-history-card{display:flex;justify-content:space-between;align-items:center;gap:12px;cursor:pointer}
.study-history-chevron{font-size:28px;line-height:1;color:#9a86aa}
.study-history-copy{color:#766d78;margin:6px 0 16px}
.study-history-actions{display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap}
.study-history-actions .danger{margin-right:auto;border:0;border-radius:14px;padding:10px 14px;background:#fff0f1;color:#a45d65;font-weight:800}
.study-history-help{display:block;color:#938995;line-height:1.4;margin-top:12px}
.study-v10-summary span,.study-v10-content span,.study-v10-content small,.study-v10-content strong{display:block}.study-v10-summary span,.study-v10-content span{font-size:12px;color:#887f89;margin-top:4px}.study-v10-content small{color:#8c72a6;font-weight:800;margin-bottom:4px}.study-v10-content>div:last-child{display:flex;gap:6px;flex-wrap:wrap}.study-v10-trash{border:0!important;background:#fff0f1!important;color:#a45d65!important;width:34px;height:34px;border-radius:50%!important;font-size:18px;font-weight:800;padding:0!important}
.study-v10-dialog{border:0;padding:0;background:transparent;max-width:none}.study-v10-dialog::backdrop{background:rgba(50,43,53,.30);backdrop-filter:blur(3px)}.study-v10-modal{box-sizing:border-box;width:min(92vw,520px);max-height:88vh;overflow:auto;background:#fffdfb;border-radius:28px;padding:20px;box-shadow:0 24px 70px rgba(60,48,66,.2)}.study-v10-modal.maplib{width:min(94vw,680px)}.study-v10-head{display:flex;justify-content:space-between;gap:12px;margin-bottom:16px}.study-v10-head h2{margin:3px 0 4px}.study-v10-head p{margin:0;color:#877e89;font-size:13px}.study-v10-x{border:0;background:#f2ecfb;color:#745d88;width:38px;height:38px;border-radius:50%;font-size:23px}.study-v10-field{display:block;margin:12px 0}.study-v10-field>span{display:block;font-size:12px;font-weight:800;margin-bottom:6px;color:#6d646f}.study-v10-field input,.study-v10-field select,.study-v10-field textarea,.study-v10-search input{box-sizing:border-box;width:100%;border:1px solid #e7dfe8;border-radius:15px;background:#fff;padding:12px;font:inherit}.study-v10-duration{display:grid;grid-template-columns:92px minmax(0,1fr);gap:8px}.study-v10-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:17px}.study-v10-actions .danger{margin-right:auto;border:0;border-radius:14px;padding:10px;background:#fff0f1;color:#a45d65}.study-v10-search{display:flex;align-items:center;gap:8px;border:1px solid #e7dfe8;border-radius:16px;padding:0 11px}.study-v10-search input{border:0;padding-left:0}.study-v10-filters{display:flex;gap:6px;overflow:auto;padding:10px 0}.study-v10-filters button{white-space:nowrap;border:0;border-radius:999px;padding:8px 10px;background:#f7f3f8;color:#766d78;font-weight:800}.study-v10-filters button.active{background:#eee3fa;color:#705487}.study-v10-results{max-height:58vh;overflow:auto}.study-v10-count{font-size:12px;color:#8a818c;margin:4px 0 8px}.study-v10-map{border:1px solid #ece3ed;border-radius:18px;padding:13px;margin-bottom:8px;display:flex;justify-content:space-between;gap:12px}.study-v10-map small,.study-v10-map strong,.study-v10-map span,.study-v10-map em{display:block}.study-v10-map small{font-size:10px;color:#9377a4;font-weight:900}.study-v10-map strong{font-size:14px;margin-top:4px}.study-v10-map span,.study-v10-map em{font-size:11px;color:#857b87;margin-top:4px}.study-v10-map em{font-style:normal;color:#997e9d}.study-v10-mapactions{display:flex;gap:5px;align-items:center;flex-wrap:wrap}.study-v10-mapactions button{border:1px solid #dfd0e7;background:#f5eef8;color:#735787;border-radius:11px;min-width:34px;height:34px;font-weight:800}.study-v10-mapactions button.done{background:#e2f0e7;color:#52705d;border-color:#c8ddcf}.study-v10-mapactions .go{padding:0 9px;background:#fff4cc;color:#766127;border-color:#eadb9e}
@media(max-width:480px){.study-v10-content,.study-v10-map{display:block}.study-v10-content>div:last-child,.study-v10-mapactions{margin-top:10px}.study-v10-modal{padding:17px;border-radius:24px}.study-v10-duration{grid-template-columns:92px minmax(0,1fr)}}`;document.head.appendChild(s)})();
(function(){if(document.getElementById('study-v134-css'))return;const s=document.createElement('style');s.id='study-v134-css';s.textContent=`
.study-hero{position:relative;overflow:hidden;margin:0 0 18px;padding:28px 29px 28px;border-radius:28px;border:1px solid rgba(90,124,158,.12);background:radial-gradient(circle at 16% 15%,rgba(190,219,239,.42),transparent 36%),radial-gradient(circle at 88% 80%,rgba(245,194,169,.30),transparent 39%),linear-gradient(125deg,rgba(247,252,255,.97),rgba(249,244,239,.90));box-shadow:0 11px 32px rgba(62,86,109,.045)}
.study-hero .eyebrow{color:#5f82a0;font-size:12px;font-weight:750;letter-spacing:.18em}.study-hero h2{margin:14px 0 8px;max-width:79%;font-size:31px;line-height:1.07;letter-spacing:-.035em;font-weight:500;color:#33363d}.study-hero p{margin:0;max-width:80%;font-size:15px;line-height:1.45;color:#77747a}.study-hero-icon{position:absolute;right:26px;top:25px;width:40px;height:40px;color:#a9a5a8;opacity:.67}.study-hero-icon svg{width:100%;height:100%;fill:none;stroke:currentColor;stroke-width:1.2;stroke-linecap:round;stroke-linejoin:round}
.study-v10-stats div{background:linear-gradient(135deg,rgba(224,239,249,.86),rgba(250,226,212,.70))!important;border:1px solid rgba(91,125,158,.08)!important;box-shadow:none!important}.study-v10-stats b{color:#3e5263}.study-v10-stats span{color:#7f7777!important}
.study-section>.card,.study-v10-summary,.study-v10-content{background:linear-gradient(135deg,rgba(252,250,245,.96),rgba(239,247,251,.76) 55%,rgba(253,236,226,.70))!important;border:1px solid rgba(91,125,158,.08)!important;box-shadow:0 8px 24px rgba(61,79,97,.025)!important}
.study-section .primary,.study-section .secondary,.study-v10-content .primary,.study-v10-content .secondary{border:0!important;box-shadow:none!important;color:#536574!important;background:linear-gradient(120deg,rgba(208,229,244,.96),rgba(247,207,187,.90))!important}
.study-section .secondary,.study-v10-content .secondary{background:linear-gradient(120deg,rgba(226,239,248,.92),rgba(250,223,209,.76))!important;color:#60727f!important}
.study-v10-content small{color:#6689a4!important}.study-v10-trash{background:linear-gradient(135deg,rgba(247,224,219,.92),rgba(239,231,226,.9))!important;color:#9a6965!important}
.study-now-card{border-color:rgba(91,125,158,.10)!important;background:linear-gradient(135deg,rgba(226,240,249,.88),rgba(251,226,212,.76))!important;box-shadow:0 8px 24px rgba(61,79,97,.035)!important}.study-now-card .eyebrow{color:#6388a3!important}.study-now-action{border:0!important;background:linear-gradient(120deg,rgba(211,232,246,.96),rgba(248,211,191,.91))!important;color:#526979!important;box-shadow:none!important}
.study-module-dialog .study-v10-modal{background:linear-gradient(155deg,#fffaf5 0%,#f6fbff 52%,#fff5ee 100%)!important;border:1px solid rgba(91,125,158,.10)!important}.study-module-dialog .study-v10-x{-webkit-appearance:none!important;appearance:none!important;outline:none!important;box-shadow:none!important;background:rgba(255,255,255,.44)!important;color:#77757a!important;border:1px solid rgba(91,104,116,.13)!important}.study-module-dialog input,.study-module-dialog select,.study-module-dialog textarea{font-size:16px!important;background:rgba(255,253,249,.82)!important;border-color:rgba(91,125,158,.13)!important;box-shadow:none!important}.study-module-dialog .primary,.study-module-dialog .secondary,.study-module-dialog [data-filter],.study-module-dialog .go{border:0!important;box-shadow:none!important;background:linear-gradient(120deg,rgba(207,230,245,.96),rgba(248,207,186,.90))!important;color:#556977!important}.study-module-dialog .secondary,.study-module-dialog [data-filter]{background:linear-gradient(120deg,rgba(226,239,248,.92),rgba(250,224,211,.78))!important}.study-module-dialog [data-filter].active,.study-module-dialog .study-v10-mapactions button.done{background:linear-gradient(120deg,rgba(190,219,238,.98),rgba(245,194,169,.94))!important;color:#4f6472!important}.study-module-dialog .study-v10-map{background:linear-gradient(135deg,rgba(255,252,248,.96),rgba(238,247,252,.80),rgba(253,237,228,.72))!important;border-color:rgba(91,125,158,.08)!important}
/* v135 — Estudos: azul + pêssego puro, sem lilás */
.study-module-dialog .study-v10-map small{color:#63839b!important}
.study-module-dialog .study-v10-map em{color:#8b746b!important}
.study-module-dialog .study-v10-mapactions button:not(.go){border:1px solid rgba(92,126,154,.12)!important;background:linear-gradient(120deg,rgba(226,239,248,.96),rgba(250,224,211,.86))!important;color:#587185!important}
.study-module-dialog .study-v10-mapactions button:not(.go).done{border-color:rgba(92,126,154,.10)!important;background:linear-gradient(120deg,rgba(190,219,238,.98),rgba(245,194,169,.94))!important;color:#4f6472!important}
.study-module-dialog .study-v10-filters button{color:#5e7484!important}
.study-module-dialog .study-v10-filters button.active{color:#4f6472!important}
.study-map-head-actions{display:flex;gap:8px;align-items:center}.study-map-library-tools{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:9px;align-items:center}.study-add-map-inline{min-height:44px!important;padding:0 14px!important;border-radius:14px!important}.study-v10-mapactions .edit-map{padding:0 9px!important;min-width:auto!important;background:linear-gradient(120deg,rgba(247,213,195,.94),rgba(214,232,244,.92))!important;color:#5a6d79!important}.study-map-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.study-map-unit{display:flex;align-items:center;min-height:46px;padding:0 13px;border-radius:15px;background:linear-gradient(120deg,rgba(226,239,248,.72),rgba(250,224,211,.70));color:#60717c;font-size:14px;font-weight:700}.study-v10-actions .danger{background:linear-gradient(120deg,rgba(248,218,205,.90),rgba(244,228,222,.88))!important;color:#8b5f55!important;border:0!important}@media(max-width:480px){.study-map-head-actions{gap:6px}.study-map-head-actions button{padding-left:10px!important;padding-right:10px!important}.study-map-library-tools{grid-template-columns:1fr}.study-add-map-inline{width:100%}.study-map-form-grid{grid-template-columns:1fr}}
@media(max-width:430px){.study-hero{padding:25px 24px 25px}.study-hero h2{font-size:28px;max-width:82%}.study-hero p{font-size:15px}.study-hero-icon{right:21px;top:22px;width:35px}}
`;document.head.appendChild(s)})();



const FIN_KEY="minha-vida.financeiro.v2";
const FIN_BASE={
 income:19172.96,
 fixed:[
  {id:"aluguel",name:"Aluguel da casa",value:9503.50,category:"Casa",payer:"Usuária"},
  {id:"bb",name:"BB — dívidas/parcelamentos",value:2329.59,category:"Dívidas",payer:"Usuária"},
  {id:"caesb",name:"CAESB + Neoenergia",value:203.79,category:"Casa",payer:"Usuária"},
  {id:"combustivel",name:"Combustível",value:650,category:"Transporte",payer:"Usuária",kind:"teto"},
  {id:"pets",name:"Pets",value:450,category:"Animais",payer:"Usuária",kind:"teto"},
  {id:"itau5298",name:"Itaú 5298 — fatura agosto",value:1702.25,category:"Cartão",payer:"Usuária"}
 ],
 excluded:[
  {id:"cov-itau4590",name:"Itaú 4590 — fatura alta",value:5566.54,category:"Cartão",payer:"Mãe",reason:"Pago pela mãe."},
  {id:"cov-saude",name:"Unimed + Unidental",value:0,category:"Saúde",payer:"Empregador",reason:"Benefício coberto pelo empregador."},
  {name:"BEC",value:0,payer:"—",reason:"Sem despesas atuais."}
 ],
 goals:[
  {month:"Setembro",min:2000,max:3000,saved:0},
  {month:"Outubro",min:2000,max:3000,saved:0},
  {month:"Novembro",min:2000,max:3000,saved:0},
  {month:"Dezembro",min:2000,max:3000,saved:0}
 ],
 transactions:[],
 plannedBills:[]
};
function finIsBecRecord(x){
 if(!x)return false;
 const bag=[x.name,x.category,x.source,x.scope,x.note,x.payer].filter(Boolean).join(" ").toLowerCase();
 return /(^|[^a-z])bec([^a-z]|$)|bem[- ]estar consciente/.test(bag);
}
function finPersonal(list){return (list||[]).filter(x=>!finIsBecRecord(x));}
function loadFin(){
 try{
  const raw=JSON.parse(localStorage.getItem(FIN_KEY));
  if(raw)return {...FIN_BASE,...raw,fixed:raw.fixed||FIN_BASE.fixed,excluded:raw.excluded||FIN_BASE.excluded,goals:raw.goals||FIN_BASE.goals,transactions:raw.transactions||[],plannedBills:Array.isArray(raw.plannedBills)?raw.plannedBills:[]};
 }catch{}
 try{
  const old=JSON.parse(localStorage.getItem("minha-vida.financeiro.v1"));
  if(old){const migrated={...FIN_BASE,income:old.income||FIN_BASE.income,fixed:old.expenses||FIN_BASE.fixed,excluded:old.excluded||FIN_BASE.excluded,goals:(old.goals||FIN_BASE.goals).map(g=>({...g,saved:g.saved||0})),transactions:old.transactions||[],plannedBills:[]};saveFin(migrated);return migrated;}
 }catch{}
 return JSON.parse(JSON.stringify(FIN_BASE));
}
function saveFin(d){localStorage.setItem(FIN_KEY,JSON.stringify(d));}
function money(n){return Number(n||0).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2});}
function finFixedTotal(d){return finPersonal(d.fixed).reduce((s,x)=>s+Number(x.value||0),0);}
function finMonthTransactions(d,month){return finPersonal(d.transactions).filter(x=>(x.date||"").slice(0,7)===month);}
function finMonthTotal(d,month){return finMonthTransactions(d,month).reduce((s,x)=>s+Number(x.value||0),0);}
function finCategoryTotals(d,month){const out={};finMonthTransactions(d,month).forEach(x=>{const k=x.category||"Variável";out[k]=(out[k]||0)+Number(x.value||0)});return out;}
function finCurrentMonth(){return todayISO().slice(0,7);}
function finMonthLabel(iso){const [y,m]=iso.split("-");return new Intl.DateTimeFormat("pt-BR",{month:"long",year:"numeric"}).format(new Date(Number(y),Number(m)-1,1));}
function finFixedHtml(x){return `<article class="card finance-row"><div><strong>${escapeHtml(x.name)}</strong><span>${escapeHtml(x.category)}${x.kind==="teto"?" · teto":""}</span></div><b>R$ ${money(x.value)}</b></article>`;}
function finTransactionHtml(x){return `<article class="card finance-row"><div><strong>${escapeHtml(x.name)}</strong><span>${x.date?formatDate(x.date):""} · ${escapeHtml(x.category||"Variável")}</span></div><b>R$ ${money(x.value)}</b><button class="mini-delete" data-fin-delete="${x.id}" aria-label="Excluir">×</button></article>`;}
const FIN_PRIVACY_KEY="minha-vida.financeiro.privacy.v1";
function finPrivacyHidden(){return localStorage.getItem(FIN_PRIVACY_KEY)==="hidden";}
function finEyeIcon(hidden){return hidden?`<svg class="fin-inline-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z"/><circle cx="12" cy="12" r="2.7"/></svg>`:`<svg class="fin-inline-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M10.6 6.2A10.6 10.6 0 0 1 12 6c5.5 0 9 6 9 6a15.8 15.8 0 0 1-2.2 3M6.2 6.2C4.2 7.7 3 12 3 12s3.5 6 9 6c1.3 0 2.5-.3 3.5-.7M9.9 9.9A3 3 0 0 0 14.1 14.1"/></svg>`;}
function applyFinPrivacyNative(){
 const root=document.getElementById("app"); if(!root||location.hash!=="#financeiro")return;
 const hidden=finPrivacyHidden();
 const btn=root.querySelector("#toggleFinPrivacy");
 if(btn) btn.innerHTML=finEyeIcon(!hidden)+(hidden?"Mostrar valores":"Ocultar valores");
 [...root.querySelectorAll("*")].filter(el=>!el.children.length&&/R\$\s*[\d.]+(?:,\d{2})?/.test(el.textContent||"")).forEach(el=>{
   if(hidden){
     if(!el.dataset.finOriginal) el.dataset.finOriginal=el.textContent;
     el.textContent=(el.dataset.finOriginal||el.textContent).replace(/R\$\s*[\d.]+(?:,\d{2})?/g,"R$ ••••••");
   }else if(el.dataset.finOriginal){ el.textContent=el.dataset.finOriginal; delete el.dataset.finOriginal; }
 });
}
function toggleFinPrivacyNative(){localStorage.setItem(FIN_PRIVACY_KEY,finPrivacyHidden()?"visible":"hidden");applyFinPrivacyNative();}
function finIsoDate(y,m,d){const last=new Date(y,m,0).getDate();return `${y}-${String(m).padStart(2,"0")}-${String(Math.min(Math.max(1,Number(d)||1),last)).padStart(2,"0")}`;}
function finPlannedOccurrence(b,month){
 if(!b||b.active===false||finIsBecRecord(b))return null;
 const rec=b.recurrence||"once"; let due="";
 if(rec==="monthly"){
  const start=b.startMonth||(b.dueDate||"").slice(0,7)||month;if(month<start)return null;
  const [y,m]=month.split("-").map(Number);due=finIsoDate(y,m,b.dueDay||Number((b.dueDate||"").slice(8,10))||1);
 }else{if(!(b.dueDate||"").startsWith(month))return null;due=b.dueDate;}
 const payment=(b.payments||{})[month]||null;
 return {bill:b,month,due,paid:!!payment?.paid,payment,expected:Number(b.value||0),actual:payment?.value!=null?Number(payment.value):null};
}
function finPlannedMonth(d,month){return finPersonal(d.plannedBills).map(b=>finPlannedOccurrence(b,month)).filter(Boolean).sort((a,b)=>a.due.localeCompare(b.due));}
function finDaysTo(iso){const a=new Date(todayISO()+"T12:00:00"),b=new Date(iso+"T12:00:00");return Math.round((b-a)/86400000);}
function finPlannedStatus(o){
 if(o.paid)return {label:"Paga",cls:"paid"}; const n=finDaysTo(o.due);
 if(n<0)return {label:`Atrasada · ${Math.abs(n)}d`,cls:"late"}; if(n===0)return {label:"Vence hoje",cls:"today"}; if(n===1)return {label:"Vence amanhã",cls:"soon"};
 return {label:`Vence em ${n}d`,cls:n<=Number(o.bill.reminderDays??3)?"soon":"future"};
}
function finPlannedBillHtml(o){
 const st=finPlannedStatus(o),b=o.bill,rem=Number(b.reminderDays??3);
 return `<article class="card planned-bill-row ${st.cls}"><div class="planned-bill-copy"><div class="planned-bill-top"><strong>${escapeHtml(b.name||"Conta prevista")}</strong><span class="fin-status ${st.cls}">${escapeHtml(st.label)}</span></div><span>${escapeHtml(b.category||"Outros")} · ${formatDate(o.due)}${(b.recurrence||"once")==="monthly"?" · mensal":""} · ${rem===0?"lembrar no dia":`lembrar ${rem}d antes`}</span>${b.note?`<small>${escapeHtml(b.note)}</small>`:""}</div><div class="planned-bill-side"><b>R$ ${money(o.paid?(o.actual??o.expected):o.expected)}</b><div class="planned-bill-actions">${o.paid?`<button type="button" class="secondary tiny" data-fin-unpay="${b.id}" data-month="${o.month}">Desfazer</button>`:`<button type="button" class="primary tiny" data-fin-pay="${b.id}" data-month="${o.month}">Marcar paga</button>`}<button type="button" class="secondary tiny" data-fin-edit-bill="${b.id}">Editar</button></div></div></article>`;
}
function renderFinanceiro(){
 const d=loadFin(),month=finCurrentMonth(),fixed=finFixedTotal(d),variable=finMonthTotal(d,month),planned=fixed+variable,remaining=d.income-planned,cats=finCategoryTotals(d,month),monthBills=finPlannedMonth(d,month);
 const openPlanned=monthBills.filter(x=>!x.paid).reduce((s,x)=>s+x.expected,0),paidPlanned=monthBills.filter(x=>x.paid).reduce((s,x)=>s+Number(x.actual??x.expected),0);
 const catHtml=Object.entries(cats).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([k,v])=>`<div class="finance-cat"><span>${escapeHtml(k)}</span><strong>R$ ${money(v)}</strong></div>`).join("")||`<div class="empty compact"><strong>Nenhum gasto variável registrado.</strong><span>Registre apenas o que realmente precisar acompanhar.</span></div>`;
 const goalTotal=d.goals.reduce((s,g)=>s+Number(g.saved||0),0), goalMin=d.goals.reduce((s,g)=>s+Number(g.min||0),0), goalMax=d.goals.reduce((s,g)=>s+Number(g.max||0),0);
 const alerts=monthBills.filter(o=>!o.paid&&finDaysTo(o.due)<=Number(o.bill.reminderDays??3));
 app.innerHTML=`<section class="finance-hero"><div><span class="finance-hero-kicker">FINANCEIRO</span><h2>Know what’s ahead.<br>Make room for life.</h2><p>Você registra o essencial.<br>A BERTH.A clareia o horizonte.</p></div><span class="finance-hero-icon finance-hero-symbol" aria-hidden="true"><svg viewBox="0 0 40 40" focusable="false"><path d="M7 22.5c4.4-4.2 8.7-6.3 13-6.3s8.6 2.1 13 6.3"/><path d="M9.5 27.5h21"/><circle cx="20" cy="16.2" r="1.35"/></svg></span></section>
 <section class="finance-summary card"><div class="finance-main"><span class="eyebrow">RENDA MENSAL</span><strong>R$ ${money(d.income)}</strong><button class="text-btn" id="editIncome">editar</button><button class="text-btn" id="toggleFinPrivacy" type="button">Ocultar valores</button></div><div class="finance-metrics"><div><span>Base</span><b>R$ ${money(fixed)}</b></div><div><span>Realizado · ${escapeHtml(finMonthLabel(month))}</span><b>R$ ${money(variable)}</b></div><div><span>Disponível conhecido</span><b>R$ ${money(remaining)}</b></div></div></section>
 ${alerts.length?`<section class="fin-due-alert"><strong><span class="fin-alert-icon" aria-hidden="true"></span>${alerts.length===1?"1 conta pede atenção":`${alerts.length} contas pedem atenção`}</strong><span>${alerts.slice(0,3).map(o=>`${escapeHtml(o.bill.name)} · ${escapeHtml(finPlannedStatus(o).label)}`).join("<br>")}</span></section>`:""}
 <div class="section-title">CONTAS PREVISTAS · ${escapeHtml(finMonthLabel(month).toUpperCase())}</div><section class="card planned-bills-panel"><div class="panel-head"><div><span class="eyebrow">PREVISTO → REALIZADO</span><h3>Vencimentos do mês</h3></div><button class="primary compact-btn" id="addPlannedBill">＋ Nova conta prevista</button></div><div class="planned-mini-metrics"><div><span>A vencer</span><b>R$ ${money(openPlanned)}</b></div><div><span>Já pago</span><b>R$ ${money(paidPlanned)}</b></div></div><div class="planned-bills-list">${monthBills.length?monthBills.map(finPlannedBillHtml).join(""):`<div class="empty compact"><strong>Nenhuma conta prevista neste mês.</strong><span>Cadastre vencimentos para a BERTH.A lembrar o que vem pela frente.</span></div>`}</div></section>
 <div class="section-title">ORÇAMENTO BASE</div><div class="list">${finPersonal(d.fixed).map(finFixedHtml).join("")}</div><button class="add-full secondary" id="addFixed">＋ Adicionar item ao orçamento</button>
 <div class="section-title">GASTOS DO MÊS</div><section class="card"><div class="panel-head"><div><span class="eyebrow">${escapeHtml(finMonthLabel(month))}</span><h3>O que saiu de verdade</h3></div><button class="primary compact-btn" id="addTransaction">＋ Registrar</button></div><div class="list inner-list">${finMonthTransactions(d,month).slice().reverse().slice(0,20).map(finTransactionHtml).join("")||`<div class="empty compact"><strong>Nenhum gasto registrado.</strong><span>O registro é opcional — use quando ajudar a enxergar seu mês.</span></div>`}</div></section>
 <div class="section-title">POR CATEGORIA</div><section class="card finance-cats">${catHtml}</section>
 <div class="section-title">FUNDO CARRO</div><section class="card goal-card"><div class="panel-head"><div><span class="eyebrow">SETEMBRO → DEZEMBRO</span><h3>Construção da meta</h3></div><span class="pill today">R$ ${money(goalTotal)}</span></div><p class="note">Meta mensal planejada: R$ ${money(goalMin)}–R$ ${money(goalMax)}.</p><div class="goal-list">${d.goals.map((g,i)=>`<div class="goal-row"><span>${escapeHtml(g.month)}</span><strong>R$ ${money(g.saved||0)} / ${money(g.min)}–${money(g.max)}</strong><button class="goal-toggle ${Number(g.saved||0)>=Number(g.min||0)?"done":""}" data-goal="${i}">${Number(g.saved||0)>=Number(g.min||0)?"✓":"＋"}</button></div>`).join("")}</div></section>
 <div class="section-title finance-covered-title">DESPESAS COBERTAS</div><div class="finance-covered-intro">Compromissos que hoje não saem da sua renda.</div><div class="list finance-covered-list">${finPersonal(d.excluded).map((x,i)=>`<div class="card excluded-card"><button type="button" class="covered-edit" data-fin-covered-index="${i}" aria-label="Editar despesa coberta"><div><strong>${escapeHtml(x.name)}</strong><span>${x.value?`R$ ${money(x.value)} · `:""}${x.category?`${escapeHtml(x.category)} · `:""}${escapeHtml(x.reason||"")}</span></div><span class="pill">${escapeHtml(x.payer||"Outra fonte")}</span></button></div>`).join("")||`<div class="covered-empty">Nenhuma despesa coberta cadastrada.</div>`}</div><button class="add-full secondary covered-add" id="addCovered">＋ Adicionar despesa coberta</button>`;
 ensureFinanceStyles();
 document.getElementById("editIncome").onclick=()=>openFinModal("income");document.getElementById("toggleFinPrivacy").onclick=toggleFinPrivacyNative;document.getElementById("addPlannedBill").onclick=()=>openPlannedBillModal();document.getElementById("addFixed").onclick=()=>openFinModal("fixed");document.getElementById("addTransaction").onclick=()=>openFinModal("transaction");document.getElementById("addCovered").onclick=()=>openCoveredExpenseModal();document.querySelectorAll("[data-fin-covered-index]").forEach(b=>b.onclick=()=>openCoveredExpenseModal(Number(b.dataset.finCoveredIndex)));
 document.querySelectorAll("[data-fin-edit-bill]").forEach(b=>b.onclick=()=>openPlannedBillModal(b.dataset.finEditBill));document.querySelectorAll("[data-fin-pay]").forEach(b=>b.onclick=()=>openPlannedPayModal(b.dataset.finPay,b.dataset.month));document.querySelectorAll("[data-fin-unpay]").forEach(b=>b.onclick=()=>undoPlannedPayment(b.dataset.finUnpay,b.dataset.month));
 document.querySelectorAll("[data-fin-delete]").forEach(b=>b.onclick=()=>{const x=loadFin();x.transactions=x.transactions.filter(t=>t.id!==b.dataset.finDelete);saveFin(x);renderFinanceiro()});
 document.querySelectorAll("[data-goal]").forEach(b=>b.onclick=()=>{const x=loadFin(),i=+b.dataset.goal;const current=Number(x.goals[i].saved||0);const next=current>=Number(x.goals[i].min||0)?0:Number(x.goals[i].min||0);x.goals[i].saved=next;saveFin(x);renderFinanceiro()});applyFinPrivacyNative();
}
function ensureFinanceStyles(){
 if(document.getElementById("finance-v2-styles"))return;
 const s=document.createElement("style");s.id="finance-v2-styles";s.textContent=`
 .finance-summary{background:linear-gradient(135deg,#edf5f2,#f2edf8);border:1px solid rgba(92,72,104,.10)}
 .finance-main{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.finance-main strong{font-size:32px;display:block;width:100%}.text-btn{border:0;background:transparent;color:#77558a;font-weight:700;padding:0}
 .finance-metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:16px}.finance-metrics>div{background:rgba(255,255,255,.62);border-radius:16px;padding:10px}.finance-metrics span{display:block;font-size:12px;color:#817783}.finance-metrics b{display:block;margin-top:4px;font-size:14px}
 .compact-btn{padding:9px 12px!important}.inner-list{margin-top:12px}.finance-row{position:relative;display:flex;align-items:center;justify-content:space-between;gap:10px}.finance-row>div{min-width:0}.finance-row b{white-space:nowrap}.mini-delete{border:0;background:transparent;color:#9a8e98;font-size:22px;padding:4px}.finance-cats{display:grid;gap:8px}.finance-cat{display:flex;justify-content:space-between;padding:10px 12px;border-radius:14px;background:#faf6f2}.finance-cat span{color:#655c67}.goal-toggle{min-width:38px}.goal-toggle.done{background:#e4f1eb}
 .planned-bills-panel{padding:16px}.planned-bills-list{display:grid;gap:9px;margin-top:12px}.planned-bill-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center;padding:13px 14px!important}.planned-bill-copy{min-width:0}.planned-bill-top{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.planned-bill-copy>span,.planned-bill-copy>small{display:block;color:#857b87;font-size:11px;margin-top:4px}.planned-bill-side{text-align:right}.planned-bill-side>b{display:block}.planned-bill-actions{display:flex;gap:5px;justify-content:flex-end;flex-wrap:wrap;margin-top:7px}.planned-bill-actions .tiny{padding:6px 8px!important;font-size:10px!important;border-radius:10px!important}.fin-status{display:inline-flex;padding:4px 7px;border-radius:999px;font-size:10px;font-weight:800;background:#f3eef5;color:#775b87}.fin-status.paid{background:#e5f1e9;color:#52705d}.fin-status.late{background:#fbe8e8;color:#99595d}.fin-status.today,.fin-status.soon{background:#fff0d7;color:#8c6721}.fin-due-alert{margin:10px 0 18px;padding:13px 15px;border-radius:18px;background:linear-gradient(135deg,#fff0d8,#f9e9ef);border:1px solid rgba(155,111,91,.10)}.fin-due-alert strong,.fin-due-alert span{display:block}.fin-due-alert span{font-size:11px;color:#776c72;line-height:1.45;margin-top:4px}.planned-mini-metrics{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}.planned-mini-metrics>div{background:#faf7fb;border-radius:14px;padding:10px}.planned-mini-metrics span{display:block;font-size:11px;color:#817783}.planned-mini-metrics b{display:block;margin-top:4px}.fin-delete-bill{width:100%;border:0;border-radius:14px;padding:10px;background:#fff0f1;color:#a45d65;font-weight:800;margin-top:4px}
 dialog.fin-planned-dialog{box-sizing:border-box!important;border:0!important;outline:0!important;padding:0!important;margin:auto!important;background:transparent!important;width:min(92vw,540px)!important;max-width:540px!important;max-height:calc(100dvh - 28px)!important;overflow:visible!important;box-shadow:none!important;}
 dialog.fin-planned-dialog::backdrop{background:rgba(54,44,55,.28)!important;backdrop-filter:blur(3px)!important;-webkit-backdrop-filter:blur(3px)!important;}
 dialog.fin-planned-dialog>.modal-card{box-sizing:border-box!important;width:100%!important;max-width:none!important;max-height:calc(100dvh - 28px)!important;overflow:auto!important;overscroll-behavior:contain!important;margin:0!important;padding:20px!important;border:0!important;border-radius:26px!important;background:#fffdfb!important;box-shadow:0 22px 64px rgba(58,44,63,.20)!important;}
 dialog.fin-planned-dialog .modal-head{position:sticky!important;top:-20px!important;z-index:2!important;margin:-20px -20px 14px!important;padding:20px!important;background:rgba(255,253,251,.96)!important;backdrop-filter:blur(8px)!important;-webkit-backdrop-filter:blur(8px)!important;border-bottom:1px solid rgba(92,72,104,.08)!important;align-items:center!important;}
 dialog.fin-planned-dialog .modal-head h2{margin:4px 0 0!important;font-size:25px!important;line-height:1.12!important;}
 dialog.fin-planned-dialog .modal-head .icon-btn{flex:0 0 40px!important;width:40px!important;height:40px!important;min-width:40px!important;min-height:40px!important;border:0!important;border-radius:50%!important;background:#f1e9f5!important;color:#75598a!important;font-size:25px!important;line-height:1!important;padding:0!important;box-shadow:none!important;outline:none!important;}
 dialog.fin-planned-dialog label{margin:12px 0!important;}
 dialog.fin-planned-dialog input,dialog.fin-planned-dialog select,dialog.fin-planned-dialog textarea{box-sizing:border-box!important;width:100%!important;min-height:48px!important;border:1px solid #e7dfe8!important;border-radius:15px!important;background:#fff!important;padding:12px 14px!important;font:inherit!important;}
 dialog.fin-planned-dialog textarea{min-height:82px!important;resize:vertical!important;}
 dialog.fin-planned-dialog .form-grid{display:grid!important;grid-template-columns:1fr 1fr!important;gap:10px!important;}
 dialog.fin-planned-dialog .modal-actions{position:sticky!important;bottom:-20px!important;margin:16px -20px -20px!important;padding:14px 20px calc(14px + env(safe-area-inset-bottom))!important;background:rgba(255,253,251,.96)!important;backdrop-filter:blur(8px)!important;-webkit-backdrop-filter:blur(8px)!important;border-top:1px solid rgba(92,72,104,.08)!important;}
 @media(max-width:560px){dialog.fin-planned-dialog{width:calc(100vw - 24px)!important;max-height:calc(100dvh - 24px)!important;}dialog.fin-planned-dialog>.modal-card{max-height:calc(100dvh - 24px)!important;padding:18px!important;border-radius:24px!important;}dialog.fin-planned-dialog .modal-head{top:-18px!important;margin:-18px -18px 12px!important;padding:18px!important;}dialog.fin-planned-dialog .modal-actions{bottom:-18px!important;margin:14px -18px -18px!important;padding:12px 18px calc(12px + env(safe-area-inset-bottom))!important;}dialog.fin-planned-dialog .form-grid{grid-template-columns:1fr!important;gap:0!important;}}
 @media(max-width:420px){.finance-metrics{grid-template-columns:1fr}.panel-head{gap:8px}.planned-bill-row{grid-template-columns:1fr}.planned-bill-side{text-align:left}.planned-bill-actions{justify-content:flex-start}}
/* BERTH.A v2.8.107 — Financeiro: modais unificados + iOS anti-autozoom */
dialog.fin-unified-dialog>.modal-card{background:radial-gradient(ellipse at 12% 8%,rgba(166,211,242,.10),transparent 34%),radial-gradient(ellipse at 92% 76%,rgba(184,166,235,.10),transparent 38%),linear-gradient(145deg,rgba(255,251,245,.99),rgba(248,248,252,.985) 52%,rgba(246,244,252,.98))!important;border:1px solid rgba(123,158,194,.12)!important;box-shadow:0 26px 70px rgba(44,55,78,.18)!important}
dialog.fin-unified-dialog .modal-head{align-items:flex-start!important;background:rgba(255,252,248,.91)!important}
dialog.fin-unified-dialog .modal-head .eyebrow{color:#756487!important;font-size:11px!important;font-weight:760!important;letter-spacing:.18em!important}
dialog.fin-unified-dialog .modal-head h2{font-size:25px!important;font-weight:540!important;letter-spacing:-.025em!important;line-height:1.12!important;color:#30313d!important}
dialog.fin-unified-dialog .modal-head .icon-btn{background:rgba(238,230,248,.78)!important;color:#75598a!important;border:0!important}
dialog.fin-unified-dialog label{color:#77707c!important;font-size:14px!important;font-weight:680!important}
dialog.fin-unified-dialog input,dialog.fin-unified-dialog select,dialog.fin-unified-dialog textarea{font-size:16px!important;line-height:1.25!important;color:#393641!important;background:rgba(255,255,255,.72)!important;border:1px solid rgba(125,104,145,.16)!important;box-shadow:none!important;-webkit-appearance:none}
dialog.fin-unified-dialog select{appearance:auto!important;-webkit-appearance:menulist!important}
dialog.fin-unified-dialog input:focus,dialog.fin-unified-dialog select:focus,dialog.fin-unified-dialog textarea:focus{outline:2px solid rgba(126,161,207,.18)!important;outline-offset:1px!important;border-color:rgba(116,145,192,.26)!important}
dialog.fin-unified-dialog .modal-actions{background:rgba(255,252,248,.92)!important}
dialog.fin-unified-dialog .modal-actions .secondary{background:rgba(238,230,248,.72)!important;color:#775c8b!important;border:0!important}
dialog.fin-unified-dialog .modal-actions .primary{background:linear-gradient(110deg,#9a73e5,#7e8fe5 58%,#7eb8d2)!important;color:#fff!important;border:0!important}
dialog.fin-unified-dialog .fin-modal-x{touch-action:manipulation!important;-webkit-tap-highlight-color:transparent!important}


/* BERTH.A Casa v2.8.127 — menu ancorado + modais blush/sálvia */
.casa-routine-picker{position:relative;margin:0 0 14px;z-index:8}.casa-routine-picker-btn{width:100%;min-height:58px;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:0 18px;border:1px solid rgba(132,106,118,.11);border-radius:20px;background:linear-gradient(105deg,rgba(249,226,233,.76),rgba(238,246,237,.86));box-shadow:0 8px 22px rgba(73,57,64,.04);color:#4b434d;font:inherit;text-align:left}.casa-routine-picker-label{display:flex;align-items:center;gap:12px;min-width:0}.casa-routine-picker-label strong{font-size:16px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.casa-routine-picker-chevron{font-size:18px;color:#8d7f87;transition:transform .18s}.casa-routine-picker-btn[aria-expanded="true"] .casa-routine-picker-chevron{transform:rotate(180deg)}
.casa-routine-picker-menu{position:absolute;left:0;right:0;top:calc(100% + 8px);z-index:30;padding:8px;border:1px solid rgba(132,106,118,.12);border-radius:20px;background:rgba(255,252,249,.98);box-shadow:0 20px 48px rgba(64,48,58,.16);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);max-height:min(52vh,430px);overflow:auto}.casa-routine-picker-menu[hidden]{display:none!important}.casa-routine-picker-menu button{width:100%;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 13px;border:0;border-radius:14px;background:transparent;color:#4b434d;font:inherit;text-align:left}.casa-routine-picker-menu button+button{border-top:1px solid rgba(132,106,118,.07)}.casa-routine-picker-menu button:active{background:linear-gradient(105deg,rgba(248,226,232,.72),rgba(235,244,235,.78))}.casa-routine-picker-menu button>span{display:flex;align-items:center;gap:10px;min-width:0}.casa-routine-picker-menu button strong{font-size:15px;font-weight:700}.casa-routine-picker-menu button small{min-width:30px;text-align:center;border-radius:999px;padding:5px 8px;background:#f3e9df;color:#81746b;font-size:11px;font-weight:700}
/* Modais Casa: identidade do módulo */
dialog.casa-dialog::backdrop{background:rgba(61,50,57,.34)!important;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}dialog.casa-dialog{border:0!important;background:transparent!important;padding:0!important;max-width:none!important;max-height:none!important}.casa-modal-card{background:linear-gradient(145deg,rgba(255,251,248,.99),rgba(253,247,247,.985) 56%,rgba(247,251,245,.98))!important;border:1px solid rgba(132,106,118,.12)!important;box-shadow:0 28px 68px rgba(58,45,54,.18)!important;color:#3e3842!important}.casa-modal-card .eyebrow{color:#8f6977!important}.casa-modal-card h2{color:#37313b!important;font-weight:560!important;letter-spacing:-.025em!important}.casa-modal-card label{color:#6f6570!important;font-weight:680!important}.casa-modal-card input,.casa-modal-card select,.casa-modal-card textarea{font-size:16px!important;background:rgba(255,255,255,.72)!important;border:1px solid rgba(132,106,118,.15)!important;border-radius:18px!important;color:#403943!important;box-shadow:none!important}.casa-modal-card input:focus,.casa-modal-card select:focus,.casa-modal-card textarea:focus{outline:2px solid rgba(186,154,166,.18)!important;border-color:rgba(166,126,143,.26)!important}.casa-modal-card .icon-btn,.casa-modal-card .study-v10-x,.casa-modal-x{color:#736a71!important;background:rgba(255,255,255,.54)!important;border:1px solid rgba(132,106,118,.10)!important;box-shadow:none!important}.casa-modal-card .modal-actions,.casa-modal-card .study-v10-actions{background:linear-gradient(to top,rgba(255,251,248,.98) 78%,rgba(255,251,248,0))!important;border-top:1px solid rgba(132,106,118,.07)!important}.casa-modal-card .secondary,.casa-modal-card .study-v10-actions .secondary{background:linear-gradient(135deg,rgba(238,246,237,.96),rgba(232,242,232,.96))!important;color:#647566!important;border:1px solid rgba(118,151,125,.10)!important}.casa-modal-card .primary,.casa-modal-card .study-v10-actions .primary{background:linear-gradient(115deg,#d8a5b3 0%,#d9b5b5 46%,#b9cfb9 100%)!important;color:#fff!important;border:0!important;box-shadow:0 8px 22px rgba(157,113,129,.12)!important}.casa-modal-card .danger{background:rgba(248,235,238,.9)!important;color:#9a5f6f!important;border:0!important}
/* Como fazer / Manual — mesmo sistema visual e sem emojis */
.casa-how-overlay{background:rgba(61,50,57,.34)!important;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}.casa-how-modal{background:linear-gradient(145deg,rgba(255,251,248,.995),rgba(253,247,247,.99) 58%,rgba(247,251,245,.985))!important;border:1px solid rgba(132,106,118,.12)!important;box-shadow:0 28px 68px rgba(58,45,54,.18)!important}.casa-how-modal .eyebrow{color:#8f6977!important}.casa-how-modal h2{color:#3a333d!important;letter-spacing:-.025em!important}.casa-how-modal .casa-inline-icon{color:#8a7d83!important}.casa-how-meta span{display:inline-flex!important;align-items:center!important;gap:6px!important;background:linear-gradient(135deg,#f5e8ec,#edf4eb)!important;color:#76666e!important}.casa-how-section h3,.casa-how-tip strong{display:flex!important;align-items:center!important;gap:8px!important;color:#4c444e!important}.casa-how-section ul,.casa-how-section ol{padding-left:20px}.casa-how-section li{line-height:1.45}.casa-how-tip{background:linear-gradient(120deg,rgba(249,229,235,.82),rgba(235,244,235,.88))!important;border:1px solid rgba(132,106,118,.07)!important}.casa-edit-procedure{display:flex!important;align-items:center!important;justify-content:center!important;gap:8px!important;width:100%!important;background:linear-gradient(115deg,rgba(243,220,228,.96),rgba(222,237,221,.96))!important;color:#765e69!important;border:0!important}.casa-buy-mini{background:linear-gradient(135deg,#f3e3e8,#e4efe3)!important;color:#765f69!important;border:0!important}
@media(max-width:560px){.casa-routine-picker-menu{max-height:46vh}.casa-modal-card{width:calc(100vw - 28px)!important;max-height:calc(100dvh - 28px)!important;border-radius:28px!important}.casa-how-modal{width:calc(100vw - 28px)!important;max-height:calc(100dvh - 34px)!important;border-radius:28px!important}}


/* BERTH.A Casa v2.8.127 — menu nativo estável + ações reversíveis + dicas padronizadas */
.casa-routine-picker-select-wrap{position:relative;margin:0 0 14px}.casa-routine-picker-select{width:100%!important;min-height:58px!important;padding:0 48px 0 48px!important;border:1px solid rgba(132,106,118,.11)!important;border-radius:20px!important;background:linear-gradient(105deg,rgba(249,226,233,.76),rgba(238,246,237,.86))!important;color:#4b434d!important;font-size:16px!important;font-weight:700!important;box-shadow:0 8px 22px rgba(73,57,64,.04)!important;appearance:auto!important;-webkit-appearance:menulist!important}.casa-routine-picker-select-wrap>.casa-inline-icon{position:absolute;left:18px;top:50%;transform:translateY(-50%);width:18px!important;height:18px!important;pointer-events:none;color:#8f6977}.casa-routine-picker-select-wrap>.casa-inline-icon svg{width:18px!important;height:18px!important;display:block!important}.casa-routine-picker-select:focus{outline:2px solid rgba(185,148,163,.18)!important;outline-offset:1px!important}
.casa-how-modal #editCasaHow,.casa-how-modal #editManualCasa,.casa-how-modal .casa-edit-procedure,.casa-modal-card .casa-edit-procedure{background:linear-gradient(115deg,#edcbd4 0%,#e6d7d1 48%,#d5e6d4 100%)!important;color:#6f5964!important;border:0!important;box-shadow:0 7px 18px rgba(142,103,119,.08)!important}.casa-how-modal #editCasaHow:active,.casa-how-modal #editManualCasa:active{transform:translateY(1px)}
.casa-buy-mini{cursor:pointer!important}.casa-buy-mini.is-in-list{background:linear-gradient(135deg,#e8f1e6,#dce9db)!important;color:#58705e!important}.casa-buy-mini:not(.is-in-list){background:linear-gradient(135deg,#f3e3e8,#e5efe3)!important;color:#765f69!important}
.casa-substitute-btn{border:0!important;border-radius:999px!important;padding:7px 10px!important;background:#f2e8dd!important;color:#7f736b!important;font:inherit!important;font-size:11px!important;font-weight:800!important;letter-spacing:.02em!important}.casa-substitute-info{display:grid;gap:10px}.casa-substitute-info p{margin:0;color:#6f6570;line-height:1.45}.casa-substitute-info strong{color:#403943}.casa-substitute-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:8px}
.casa-web-card{background:linear-gradient(135deg,rgba(255,249,246,.96),rgba(247,251,245,.96))!important}.casa-web-grid{grid-template-columns:1fr 1fr!important}.casa-web-link{min-height:62px!important;display:flex!important;align-items:center!important;justify-content:space-between!important;gap:10px!important;padding:12px 13px!important;border-radius:18px!important;background:linear-gradient(115deg,rgba(249,230,236,.68),rgba(239,247,237,.76))!important;border:1px solid rgba(132,106,118,.08)!important;color:#514951!important;font-size:12px!important;font-weight:720!important;box-shadow:none!important}.casa-web-link-main{display:flex;align-items:center;gap:9px;min-width:0}.casa-web-link .casa-inline-icon{width:18px!important;height:18px!important;flex:0 0 18px;color:#8a727d}.casa-web-link .casa-inline-icon svg{width:18px!important;height:18px!important}.casa-web-link .casa-web-arrow{font-size:17px;color:#8a7d83;font-weight:500}.casa-web-link:active{background:linear-gradient(115deg,rgba(246,220,229,.8),rgba(229,241,227,.86))!important}
@media(max-width:420px){.casa-web-grid{grid-template-columns:1fr!important}}

/* BERTH.A Casa v2.8.130 — corrige escala dos ícones no modal Como Fazer */
.casa-how-modal .casa-how-top-actions svg,
.casa-how-modal .casa-how-meta svg,
.casa-how-modal .casa-how-section h3>svg,
.casa-how-modal .casa-how-tip strong>svg{width:16px!important;height:16px!important;min-width:16px!important;max-width:16px!important;flex:0 0 16px!important;display:block!important;overflow:visible!important}
.casa-how-modal .casa-how-top-actions .casa-edit-procedure{min-height:44px!important;height:auto!important;padding:10px 14px!important;border-radius:16px!important;font-size:12.5px!important;line-height:1.2!important}
.casa-how-modal .casa-how-top-actions{margin:10px 0 12px!important}
.casa-how-modal .casa-how-section h3{min-height:24px!important;margin:18px 0 8px!important;font-size:14px!important}
.casa-how-modal .casa-how-tip strong{min-height:20px!important}
/* BERTH.A Casa v2.8.130 — Como Fazer sem ícones decorativos para evitar escala indevida no iOS */
.casa-manual-view .casa-how-top-actions .casa-edit-procedure{display:flex!important;align-items:center!important;justify-content:center!important;min-height:44px!important;height:44px!important;padding:0 16px!important;border-radius:16px!important;font-size:12.5px!important;line-height:1!important}
.casa-manual-view .casa-how-top-actions .casa-edit-procedure span{display:inline!important;width:auto!important;height:auto!important;margin:0!important;padding:0!important}
.casa-manual-view .casa-how-top-actions svg,.casa-manual-view .casa-how-section h3 svg,.casa-manual-view .casa-how-tip svg,.casa-manual-view .casa-how-meta svg{display:none!important}
.casa-manual-view .casa-how-section h3,.casa-manual-view .casa-how-tip strong{display:block!important}
.casa-manual-view .casa-how-meta span{min-height:auto!important;padding:7px 11px!important;border-radius:999px!important;font-size:12px!important}


/* BERTH.A Financeiro v2.8.107 */
.finance-hero{position:relative;overflow:hidden;margin:0 0 16px;padding:22px 24px 24px;border-radius:28px;border:1px solid rgba(112,92,156,.12);background:radial-gradient(circle at 88% 82%,rgba(133,220,210,.14),transparent 34%),radial-gradient(circle at 76% 10%,rgba(150,190,244,.22),transparent 38%),linear-gradient(135deg,rgba(239,235,255,.96),rgba(247,241,255,.92) 58%,rgba(240,248,247,.72));box-shadow:0 10px 30px rgba(72,56,96,.05)}
.finance-hero-kicker{display:block;color:#6652a0;font-size:12px;font-weight:750;letter-spacing:.18em;margin-bottom:12px}.finance-hero h2{margin:0 0 8px!important;color:#24233b;font-size:30px!important;line-height:1.06!important;letter-spacing:-.025em;font-family:inherit;font-weight:520!important}.finance-hero p{margin:0!important;color:#777184;font-size:15px!important;line-height:1.45!important}.finance-hero-icon{position:absolute;right:24px;top:24px;color:#6b78aa;font-size:28px;opacity:.8}
.finance-summary{background:radial-gradient(circle at 92% 12%,rgba(145,203,236,.13),transparent 38%),linear-gradient(135deg,#f5f1ff,#f7f5fb 56%,#f1f7f6)!important;border-color:rgba(112,92,156,.11)!important}.finance-summary,.planned-bills-panel,.finance-cats,.goal-card,.excluded-card{border-radius:26px}.finance-main .eyebrow,.planned-bills-panel .eyebrow,.goal-card .eyebrow{color:#7356a0}.finance-metrics>div,.planned-mini-metrics>div{background:rgba(255,255,255,.62)!important}
#addPlannedBill,#addTransaction{background:linear-gradient(105deg,#a985df 0%,#9388df 70%,#86b4d0 100%)!important;color:white!important;border:0!important;box-shadow:0 8px 20px rgba(120,93,180,.13)}#addFixed.add-full{background:linear-gradient(105deg,rgba(238,225,252,.94),rgba(232,226,249,.94))!important;color:#735696!important}
.finance-cat{background:linear-gradient(100deg,rgba(248,244,253,.94),rgba(255,253,250,.96))!important}.finance-cat:nth-child(3n+1){box-shadow:inset 4px 0 0 rgba(166,130,222,.34)}.finance-cat:nth-child(3n+2){box-shadow:inset 4px 0 0 rgba(125,158,220,.28)}.finance-cat:nth-child(3n){box-shadow:inset 4px 0 0 rgba(116,202,191,.16)}
.fin-inline-icon{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;flex:0 0 auto}.finance-main #toggleFinPrivacy{display:inline-flex;align-items:center;gap:6px}.finance-hero-icon{font-family:inherit!important;font-weight:300!important;font-size:30px!important;line-height:1!important;opacity:.58!important}.fin-alert-icon{display:inline-block;width:14px;height:14px;margin-right:6px;border:1.6px solid currentColor;border-radius:50%;vertical-align:-2px;position:relative}.fin-alert-icon:after{content:"";position:absolute;left:6px;top:2px;width:1px;height:5px;background:currentColor;box-shadow:2px 4px 0 -0.2px currentColor;transform-origin:bottom}.finance-row{border:1px solid rgba(111,154,202,.14)!important;background:radial-gradient(circle at 92% 20%,rgba(148,190,232,.07),transparent 32%),linear-gradient(110deg,rgba(250,248,253,.96),rgba(247,244,252,.90))!important;box-shadow:0 8px 24px rgba(72,56,96,.035)!important}.planned-bills-panel,.finance-cats,.goal-card{border:1px solid rgba(111,154,202,.14)!important;background:radial-gradient(circle at 92% 10%,rgba(148,190,232,.07),transparent 34%),linear-gradient(145deg,rgba(250,248,253,.96),rgba(247,244,252,.91))!important}.planned-bills-list>.empty.compact,.inner-list>.empty.compact,.finance-cats>.empty.compact{min-height:0!important;padding:22px 16px!important;border-radius:18px!important;background:linear-gradient(115deg,rgba(247,242,253,.72),rgba(248,249,255,.66))!important}.excluded-card{border:1px solid rgba(112,92,156,.08)!important;background:linear-gradient(110deg,rgba(255,255,255,.98),rgba(252,249,255,.9))!important}.goal-card{background:radial-gradient(circle at 90% 8%,rgba(122,203,193,.045),transparent 30%),linear-gradient(145deg,rgba(250,248,253,.96),rgba(247,244,252,.92))!important}.goal-toggle{background:#eee6f9!important;color:#74549a!important;border:0!important}.goal-toggle.done{background:#e8f2ef!important;color:#55796e!important}.excluded-card .pill{background:#f1e9f7;color:#71558f}.fin-due-alert{background:linear-gradient(120deg,#f7efff,#f3f5ff 74%,#f0f8f6)!important}.section-title{letter-spacing:.17em;color:#7d7582}.text-btn{color:#735696!important}
.finance-covered-title{margin-bottom:4px!important}.finance-covered-intro{margin:0 4px 12px;color:#9a929b;font-size:12px;line-height:1.4}.finance-covered-list{gap:9px}.excluded-card{padding:0!important;background:linear-gradient(110deg,rgba(248,246,251,.78),rgba(245,247,250,.68))!important;border:1px solid rgba(112,92,156,.055)!important;box-shadow:none!important}.covered-edit{width:100%;border:0;background:transparent;padding:15px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px;text-align:left;color:inherit;font:inherit}.covered-edit>div{min-width:0}.covered-edit strong{display:block;font-size:14px;font-weight:680;color:#5f5963}.covered-edit span:not(.pill){display:block;margin-top:3px;font-size:11.5px;line-height:1.35;color:#a09aa2}.covered-edit .pill{flex:0 0 auto;font-size:10.5px;background:rgba(237,229,246,.72)!important;color:#826b91!important}.covered-add{margin-top:9px!important;background:rgba(238,230,248,.62)!important;color:#775d8b!important;font-size:14px!important}.covered-empty{padding:14px 4px;color:#9a929b;font-size:13px}.finance-cats>.empty.compact,.inner-list>.empty.compact{background:transparent!important;border:0!important;padding:18px 10px!important}.goal-card{background:radial-gradient(circle at 88% 8%,rgba(129,195,205,.07),transparent 34%),linear-gradient(145deg,rgba(249,247,252,.94),rgba(244,247,249,.88))!important}.finance-hero-symbol{opacity:.48!important}.finance-hero-symbol svg{stroke-width:1.15!important}
@media(max-width:560px){.finance-hero{padding:20px 20px 22px}.finance-hero h2{font-size:28px!important}.finance-hero p{font-size:15px!important}.finance-hero-icon{right:20px;top:20px}}

/* BERTH.A Hero Symbol System v1 — abstract, module-specific marks; may become semantic references later. */
.finance-hero-symbol{width:34px!important;height:34px!important;display:grid!important;place-items:center!important;font-size:0!important;opacity:.58!important}
.finance-hero-symbol svg{width:100%;height:100%;overflow:visible;fill:none;stroke:currentColor;stroke-width:1.35;stroke-linecap:round;stroke-linejoin:round}
.finance-hero-symbol circle{fill:currentColor;stroke:none}

 `;document.head.appendChild(s);
}

function bindFinanceModalClose(dlg){
 const close=()=>{try{if(dlg.open)dlg.close()}catch(_e){};setTimeout(()=>{if(dlg.isConnected)dlg.remove()},0)};
 dlg.querySelectorAll('[data-fin-close]').forEach(btn=>{btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();close()},{passive:false})});
 dlg.addEventListener('cancel',e=>{e.preventDefault();close()});
 return close;
}
function openFinModal(type){
 const d=loadFin(),dlg=document.createElement("dialog");dlg.className="fin-planned-dialog fin-unified-dialog";
 const title=type==="income"?"Ajustar renda mensal":type==="fixed"?"Adicionar ao orçamento":"Registrar gasto";
 dlg.innerHTML=`<form method="dialog" class="modal-card" id="finForm"><div class="modal-head"><div><div class="eyebrow">FINANCEIRO</div><h2>${title}</h2></div><button type="button" class="icon-btn fin-modal-x" data-fin-close aria-label="Fechar">×</button></div>
 ${type==="income"?`<label>Renda mensal<input id="fValue" required type="number" min="0" step="0.01" value="${d.income}"></label>`:`<label>Descrição<input id="fName" required maxlength="100"></label><div class="form-grid"><label>Valor<input id="fValue" required type="number" min="0" step="0.01"></label><label>Categoria<select id="fCategory"><option>Casa</option><option>Alimentação</option><option>Transporte</option><option>Animais</option><option>Cartão</option><option>Dívidas</option><option>Henrique</option><option>Assinaturas</option><option>Saúde</option><option>Autocuidado</option><option>Lazer</option><option>Variável</option><option>Outros</option></select></label></div>${type==="transaction"?`<label>Data<input id="fDate" type="date" value="${todayISO()}"></label>`:`<label>Tipo<select id="fKind"><option>fixo</option><option>teto</option></select></label>`}`}
 <div class="modal-actions"><div class="grow"></div><button type="button" class="secondary" id="cancelFin">Cancelar</button><button class="primary" value="default">Salvar</button></div></form>`;
 document.body.appendChild(dlg);dlg.showModal();const closeFinDlg=bindFinanceModalClose(dlg);dlg.querySelector("#cancelFin").onclick=e=>{e.preventDefault();closeFinDlg()};
 dlg.querySelector("#finForm").addEventListener("submit",e=>{e.preventDefault();if(type==="income"){d.income=+dlg.querySelector("#fValue").value||0}else{const obj={id:uid(),name:dlg.querySelector("#fName").value.trim(),value:+dlg.querySelector("#fValue").value||0,category:dlg.querySelector("#fCategory").value,updatedAt:Date.now()};if(type==="transaction"){obj.date=dlg.querySelector("#fDate").value;d.transactions.push(obj)}else{obj.kind=dlg.querySelector("#fKind").value;obj.payer="Usuária";d.fixed.push(obj)}}saveFin(d);dlg.close();dlg.remove();renderFinanceiro()});
}
function openCoveredExpenseModal(index=null){
 const d=loadFin(),personal=finPersonal(d.excluded),existing=Number.isInteger(index)?personal[index]:null;
 const dlg=document.createElement("dialog");dlg.className="fin-planned-dialog fin-unified-dialog";const categories=["Casa","Alimentação","Transporte","Animais","Cartão","Dívidas","Henrique","Assinaturas","Saúde","Autocuidado","Lazer","Outros"];
 dlg.innerHTML=`<form method="dialog" class="modal-card" id="finCoveredForm"><div class="modal-head"><div><div class="eyebrow">DESPESA COBERTA</div><h2>${existing?"Editar despesa coberta":"Nova despesa coberta"}</h2></div><button type="button" class="icon-btn fin-modal-x" data-fin-close aria-label="Fechar">×</button></div><label>Nome<input id="fcName" required maxlength="100" value="${escapeHtml(existing?.name||"")}" placeholder="Ex.: Plano de saúde"></label><div class="form-grid"><label>Valor mensal <span class="muted">(se conhecido)</span><input id="fcValue" type="number" min="0" step="0.01" value="${existing?.value?Number(existing.value):""}"></label><label>Categoria<select id="fcCategory">${categories.map(x=>`<option ${x===(existing?.category||"Outros")?"selected":""}>${x}</option>`).join("")}</select></label></div><label>Quem paga<input id="fcPayer" required maxlength="80" value="${escapeHtml(existing?.payer||"")}" placeholder="Ex.: Mãe, empregador, benefício"></label><label>Observação <span class="muted">(opcional)</span><textarea id="fcReason" rows="3" placeholder="Contexto que vale a pena lembrar">${escapeHtml(existing?.reason||"")}</textarea></label>${existing?`<button type="button" class="fin-delete-bill" id="deleteCovered">Excluir despesa coberta</button>`:""}<div class="modal-actions"><div class="grow"></div><button type="button" class="secondary" id="cancelCovered">Cancelar</button><button class="primary" value="default">Salvar</button></div></form>`;
 document.body.appendChild(dlg);dlg.showModal();const closeFinDlg=bindFinanceModalClose(dlg);dlg.querySelector("#cancelCovered").onclick=e=>{e.preventDefault();closeFinDlg()};
 if(existing)dlg.querySelector("#deleteCovered").onclick=()=>{if(!confirm(`Excluir “${existing.name||"esta despesa"}”?`))return;const pos=d.excluded.findIndex(x=>x===existing||(x.id&&x.id===existing.id));if(pos>=0)d.excluded.splice(pos,1);saveFin(d);dlg.close();dlg.remove();renderFinanceiro()};
 dlg.querySelector("#finCoveredForm").addEventListener("submit",e=>{e.preventDefault();const obj={...(existing||{}),id:existing?.id||uid(),name:dlg.querySelector("#fcName").value.trim(),value:+dlg.querySelector("#fcValue").value||0,category:dlg.querySelector("#fcCategory").value,payer:dlg.querySelector("#fcPayer").value.trim(),reason:dlg.querySelector("#fcReason").value.trim(),covered:true,updatedAt:Date.now()};if(existing){const pos=d.excluded.findIndex(x=>x===existing||(x.id&&x.id===existing.id));if(pos>=0)d.excluded[pos]=obj}else d.excluded.push(obj);saveFin(d);dlg.close();dlg.remove();renderFinanceiro()});
}
function openPlannedBillModal(id){
 const d=loadFin(),existing=(d.plannedBills||[]).find(x=>x.id===id),b=existing||{id:uid(),name:"",value:"",category:"Casa",dueDate:todayISO(),recurrence:"monthly",reminderDays:3,note:"",active:true,payments:{}};
 const dlg=document.createElement("dialog");dlg.className="fin-planned-dialog fin-unified-dialog";dlg.innerHTML=`<form method="dialog" class="modal-card" id="finPlanForm"><div class="modal-head"><div><div class="eyebrow">CONTA PREVISTA</div><h2>${existing?"Editar conta prevista":"Nova conta prevista"}</h2></div><button type="button" class="icon-btn fin-modal-x" data-fin-close aria-label="Fechar">×</button></div>
 <label>Conta / descrição<input id="pbName" required maxlength="100" value="${escapeHtml(b.name||"")}" placeholder="Ex.: Neoenergia"></label><div class="form-grid"><label>Valor previsto<input id="pbValue" required type="number" min="0" step="0.01" value="${Number(b.value||0)||""}"></label><label>Categoria<select id="pbCategory">${["Casa","Alimentação","Transporte","Animais","Cartão","Dívidas","Henrique","Assinaturas","Saúde","Autocuidado","Lazer","Outros"].map(x=>`<option ${x===(b.category||"Casa")?"selected":""}>${x}</option>`).join("")}</select></label></div>
 <div class="form-grid"><label>Vencimento<input id="pbDue" required type="date" value="${b.dueDate||todayISO()}"></label><label>Recorrência<select id="pbRecurrence"><option value="monthly" ${(b.recurrence||"monthly")==="monthly"?"selected":""}>Mensal</option><option value="once" ${(b.recurrence||"")==="once"?"selected":""}>Somente uma vez</option></select></label></div>
 <label>Lembrar<select id="pbReminder"><option value="0" ${Number(b.reminderDays)===0?"selected":""}>No dia</option><option value="1" ${Number(b.reminderDays)===1?"selected":""}>1 dia antes</option><option value="3" ${Number(b.reminderDays??3)===3?"selected":""}>3 dias antes</option><option value="5" ${Number(b.reminderDays)===5?"selected":""}>5 dias antes</option><option value="7" ${Number(b.reminderDays)===7?"selected":""}>7 dias antes</option></select></label><label>Observação <span class="muted">(opcional)</span><textarea id="pbNote" rows="3">${escapeHtml(b.note||"")}</textarea></label>
 ${existing?`<button type="button" class="fin-delete-bill" id="deletePlannedBill">Excluir conta prevista</button>`:""}<div class="modal-actions"><div class="grow"></div><button type="button" class="secondary" id="cancelFinPlan">Cancelar</button><button class="primary" value="default">Salvar</button></div></form>`;
 document.body.appendChild(dlg);dlg.showModal();const closeFinDlg=bindFinanceModalClose(dlg);dlg.querySelector("#cancelFinPlan").onclick=e=>{e.preventDefault();closeFinDlg()};
 if(existing)dlg.querySelector("#deletePlannedBill").onclick=()=>{if(!confirm(`Excluir “${b.name||"esta conta"}”?`))return;d.plannedBills=(d.plannedBills||[]).filter(x=>x.id!==b.id);saveFin(d);dlg.close();dlg.remove();renderFinanceiro()};
 dlg.querySelector("#finPlanForm").addEventListener("submit",e=>{e.preventDefault();const due=dlg.querySelector("#pbDue").value,rec=dlg.querySelector("#pbRecurrence").value,obj={...b,name:dlg.querySelector("#pbName").value.trim(),value:+dlg.querySelector("#pbValue").value||0,category:dlg.querySelector("#pbCategory").value,dueDate:due,recurrence:rec,startMonth:rec==="monthly"?(b.startMonth||due.slice(0,7)):due.slice(0,7),dueDay:Number(due.slice(8,10))||1,reminderDays:+dlg.querySelector("#pbReminder").value||0,note:dlg.querySelector("#pbNote").value.trim(),active:true,payments:b.payments||{},updatedAt:Date.now()};d.plannedBills=existing?(d.plannedBills||[]).map(x=>x.id===obj.id?obj:x):[...(d.plannedBills||[]),obj];saveFin(d);dlg.close();dlg.remove();renderFinanceiro()});
}
function openPlannedPayModal(id,month){
 const d=loadFin(),b=(d.plannedBills||[]).find(x=>x.id===id);if(!b)return;const o=finPlannedOccurrence(b,month);if(!o)return;
 const dlg=document.createElement("dialog");dlg.className="fin-planned-dialog fin-pay-dialog fin-unified-dialog";dlg.innerHTML=`<form method="dialog" class="modal-card" id="finPayForm"><div class="modal-head"><div><div class="eyebrow">✓ MARCAR COMO PAGA</div><h2>${escapeHtml(b.name)}</h2></div><button type="button" class="icon-btn fin-modal-x" data-fin-close aria-label="Fechar">×</button></div><p class="note">Previsto: R$ ${money(o.expected)} · vencimento ${formatDate(o.due)}</p><div class="form-grid"><label>Valor real pago<input id="pbActual" required type="number" min="0" step="0.01" value="${o.expected}"></label><label>Data do pagamento<input id="pbPaidDate" required type="date" value="${todayISO()}"></label></div><div class="modal-actions"><div class="grow"></div><button type="button" class="secondary" id="cancelFinPay">Cancelar</button><button class="primary" value="default">Confirmar pagamento</button></div></form>`;
 document.body.appendChild(dlg);dlg.showModal();const closeFinDlg=bindFinanceModalClose(dlg);dlg.querySelector("#cancelFinPay").onclick=e=>{e.preventDefault();closeFinDlg()};dlg.querySelector("#finPayForm").addEventListener("submit",e=>{e.preventDefault();const actual=+dlg.querySelector("#pbActual").value||0,date=dlg.querySelector("#pbPaidDate").value;b.payments=b.payments||{};b.payments[month]={paid:true,value:actual,date,at:Date.now()};const existing=(d.transactions||[]).find(t=>t.plannedBillId===b.id&&t.plannedBillMonth===month),tx={id:existing?.id||uid(),name:b.name,value:actual,date,category:b.category||"Outros",plannedBillId:b.id,plannedBillMonth:month,note:"Conta prevista · paga",updatedAt:Date.now()};d.transactions=existing?(d.transactions||[]).map(t=>t.id===existing.id?tx:t):[...(d.transactions||[]),tx];saveFin(d);dlg.close();dlg.remove();renderFinanceiro()});
}
function undoPlannedPayment(id,month){const d=loadFin(),b=(d.plannedBills||[]).find(x=>x.id===id);if(!b)return;if(b.payments)delete b.payments[month];d.transactions=(d.transactions||[]).filter(t=>!(t.plannedBillId===id&&t.plannedBillMonth===month));saveFin(d);renderFinanceiro();}


function ensureCasaManualStyles(){
 if(document.getElementById('bertha-casa-manual-styles'))return;
 const s=document.createElement('style');s.id='bertha-casa-manual-styles';s.textContent=`
 .home-task-wrap{border-top:1px solid rgba(80,60,90,.10);padding:0 0 8px}.home-task-wrap .home-task{border-top:0;margin:0}
 .home-task-actions{display:flex;gap:6px;align-items:center;justify-content:flex-end;padding:0 0 3px 39px}.home-how{border:0;background:transparent;padding:5px 0;font-size:11px;font-weight:800;color:#9a6f82}.home-edit{border:0;background:#F1E9F0;border-radius:999px;padding:6px 9px;font-size:10px;font-weight:700}
 .casa-how-meta{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 8px}.casa-how-meta span{display:inline-block;background:#F1E9F0;border-radius:999px;padding:6px 9px;font-size:11px}.casa-how-tip{padding:12px;border-radius:16px;background:#FFF3D9;margin-top:14px}.casa-how-tip p{margin:5px 0 0!important}
 .mv-how-overlay{position:fixed;inset:0;z-index:99999;background:rgba(20,20,20,.25);display:flex;align-items:flex-end;padding:12px}.mv-how{width:min(520px,100%);max-height:86vh;overflow:auto;background:#FFFBF7;border-radius:25px;padding:20px;box-shadow:0 18px 55px rgba(0,0,0,.2)}.mv-how-x{float:right;border:0;background:transparent;font-size:27px}.mv-how h2{margin:6px 0 14px}.mv-how h3{font-size:12px;margin:18px 0 6px}.mv-how ul,.mv-how ol{margin-top:6px;padding-left:21px}.mv-how li{padding:6px 0;font-size:14px}.mv-how p{font-size:11px;opacity:.75}.mv-how label{display:block;font-size:11px;font-weight:700;margin:12px 0}.mv-how input,.mv-how textarea{display:block;width:100%;box-sizing:border-box;margin-top:5px;border:1px solid #ddd0d0;border-radius:12px;padding:10px;background:#fff;font:inherit}.mv-how textarea{min-height:110px}.mv-how .primary{border:0;border-radius:999px;padding:10px 15px;background:#F2C8D8;font-weight:800}
 .casa-how-top-actions{display:flex;justify-content:flex-end;margin:8px 0 12px}.casa-how-top-actions .secondary{width:100%;border:0;border-radius:999px;padding:8px 12px;background:#F1E9F0;font-weight:800;font-size:11px}.casa-buy-mini{border:0;background:#f4e5ee;border-radius:999px;padding:6px 9px;font:inherit;font-size:11px;color:#865f79;white-space:nowrap}.casa-buy-mini:disabled{opacity:.7}.casa-how-shopping-note{margin-top:14px;padding:12px;border-radius:16px;background:#EAF2F7;font-size:11px;line-height:1.45}
 .casa-schedule-card{background:linear-gradient(135deg,#fff8f1,#eef7f5 52%,#f4eef8)}.casa-schedule{display:grid;gap:0;margin-top:12px}.casa-schedule-row{display:grid;grid-template-columns:88px 1fr;gap:10px;align-items:center;padding:9px 0;border-top:1px solid rgba(120,100,120,.10)}.casa-schedule-row:first-child{border-top:0}.casa-time{font-size:11px;font-weight:800;color:#8b6b80;background:rgba(255,255,255,.72);border-radius:10px;padding:6px 7px;text-align:center}
 .casa-manual-area{margin-bottom:14px}.casa-manual-list{display:grid;gap:0}.casa-manual-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 0;border-top:1px solid rgba(80,60,90,.10)}.casa-manual-row>div{min-width:0;display:grid;gap:4px}.casa-manual-row strong{font-size:15px}.casa-manual-row small{color:#817985}.casa-manual-row .home-how{flex:0 0 auto}
 .casa-recipe{margin-bottom:14px}.casa-recipe h4{margin:14px 0 7px;font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:#7f667b}.casa-recipe ul,.casa-recipe ol{margin:7px 0 0;padding-left:20px}.casa-recipe li{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:6px 0}.casa-recipe li span{flex:1}
 .casa-inventory .chip-list{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}.casa-inventory .chip-list .pill{white-space:normal;height:auto;padding:7px 10px;line-height:1.25}.inventory-tools-head{margin-top:22px;padding-top:18px;border-top:1px solid rgba(80,60,90,.10)}.casa-product-list{display:grid;gap:8px;margin-top:12px}.casa-product-row{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;padding:10px 0;border-top:1px solid rgba(80,60,90,.08)}.casa-product-row div{display:grid;gap:3px}.casa-product-row small{font-size:10px;opacity:.7}
 .casa-web-card{background:linear-gradient(135deg,#FFF8F1,#F4EEF8 55%,#EDF7F3)}.casa-web-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:12px}.casa-web-link{display:flex;justify-content:space-between;align-items:center;gap:8px;text-decoration:none;color:inherit;background:rgba(255,255,255,.82);border:1px solid rgba(120,100,120,.10);border-radius:15px;padding:11px 12px;font-size:11px;font-weight:800}
 .casa-shopping-card{padding:16px}.casa-mini-shopping{display:grid;gap:7px}.casa-mini-shop-row{display:flex;align-items:center;gap:8px;padding:9px 10px;border-radius:13px;background:#fff}.casa-mini-shop-row label{display:flex!important;align-items:center!important;gap:8px!important;margin:0!important;flex:1}.casa-mini-shop-row input{width:auto!important;margin:0!important}.casa-mini-shop-row.done span{text-decoration:line-through;opacity:.5}
 .casa-editor-overlay{padding:18px;align-items:flex-end}.casa-editor-card{width:min(100%,620px);max-height:88vh;overflow:auto;border:none!important;outline:none!important;box-shadow:0 -12px 40px rgba(60,45,70,.14)}.casa-editor-form{display:grid;gap:14px;margin-top:16px}.casa-editor-form label{display:grid;gap:7px;font-weight:750;color:#6f6673}.casa-editor-form label small{font-weight:500;opacity:.72}.casa-editor-form input,.casa-editor-form textarea,.casa-editor-form select{width:100%;box-sizing:border-box;border:1px solid rgba(120,100,120,.16);border-radius:16px;background:#fffdfb;padding:13px 14px;font:inherit;color:inherit;resize:vertical}.casa-editor-form textarea{line-height:1.45}.casa-editor-form .modal-actions{position:sticky;bottom:0;background:linear-gradient(to top,#fffdfb 78%,rgba(255,253,251,0));padding-top:14px;display:grid;grid-template-columns:1fr 1.25fr;gap:10px}
 .casa-section{margin:12px 0;border:0}.casa-section>summary{list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 17px;border-radius:20px;background:#fff;box-shadow:0 8px 25px rgba(60,45,70,.055);font-weight:850}.casa-section>summary::-webkit-details-marker{display:none}.casa-section>summary .casa-section-left{display:flex;align-items:center;gap:10px;min-width:0}.casa-section>summary .casa-section-left span{font-size:18px}.casa-section>summary .casa-section-meta{display:flex;align-items:center;gap:8px;color:#887d89;font-size:11px}.casa-section>summary .casa-chevron{font-size:18px;transition:transform .2s ease}.casa-section[open]>summary .casa-chevron{transform:rotate(180deg)}.casa-section-body{padding-top:10px}.casa-task-exec{display:flex;gap:7px;flex-wrap:wrap;margin-top:8px}.casa-task-exec button{border:0;border-radius:999px;padding:8px 11px;font-weight:800;font-size:11px}.casa-task-start{background:#eee5f7;color:#715781}.casa-task-finish{background:#e6f2eb;color:#557361}.casa-task-reopen{background:#fff1d8;color:#7e672f}.casa-maint-card{display:grid;gap:9px}.casa-maint-meta{display:flex;flex-wrap:wrap;gap:6px}.casa-maint-meta span{background:#f5f0f6;border-radius:999px;padding:5px 8px;font-size:10px;color:#766c78}.casa-maint-actions{display:flex;gap:7px;flex-wrap:wrap}.casa-maint-actions button{border:0;border-radius:999px;padding:8px 11px;font-size:11px;font-weight:800}.casa-maint-actions .start{background:#eee5f7;color:#715781}.casa-maint-actions .finish{background:#e6f2eb;color:#557361}.casa-maint-actions .edit{background:#f6f2f5;color:#756b77}.casa-history-row{display:flex;justify-content:space-between;gap:10px;align-items:center;padding:10px 0;border-top:1px solid rgba(80,60,90,.08)}.casa-history-row small{display:block;color:#8a808b;margin-top:3px}.casa-recipe-head-actions{display:flex;gap:7px;align-items:center}.casa-recipe-edit{border:0;border-radius:999px;padding:7px 10px;background:#f2eaf5;color:#765e82;font-weight:800;font-size:11px}.casa-inline-add{width:100%;margin:8px 0 12px}
 @media(max-width:420px){.casa-editor-overlay{padding:0;align-items:flex-end}.casa-editor-card{border-radius:28px 28px 0 0!important;max-height:91vh;padding-bottom:calc(18px + env(safe-area-inset-bottom))}}

 .casa-hero-v121{position:relative;overflow:hidden;min-height:218px;box-sizing:border-box;margin:6px 0 22px;padding:31px 34px;display:flex;justify-content:space-between;gap:18px;border:1px solid rgba(133,111,122,.14);border-radius:31px;background:radial-gradient(circle at 14% 15%,rgba(229,151,167,.28),transparent 42%),radial-gradient(circle at 88% 30%,rgba(163,190,171,.36),transparent 46%),linear-gradient(135deg,rgba(255,247,241,.94),rgba(250,236,239,.90) 52%,rgba(235,242,231,.92));box-shadow:0 8px 25px rgba(83,63,70,.035)}
 .casa-hero-v121 .eyebrow{display:block;margin-bottom:20px;color:#8e626f;font-size:12px;letter-spacing:.18em;font-weight:820}.casa-hero-v121 h2{margin:0 0 16px;max-width:520px;font-size:34px;line-height:1.08;font-weight:500;letter-spacing:-.035em;color:#34303a}.casa-hero-v121 p{margin:0;max-width:520px;color:#7f747e;font-size:18px;line-height:1.42;font-weight:400}.casa-hero-mark{position:absolute;right:29px;top:31px;width:49px;height:38px;color:#aaa3a5;opacity:.68}.casa-hero-mark svg{width:100%;height:100%;stroke:currentColor;stroke-width:1.55;stroke-linecap:round}
 .casa-principle-v121{background:linear-gradient(115deg,rgba(235,196,204,.42),rgba(231,242,229,.78));border:1px solid rgba(117,139,123,.10);box-shadow:none}.casa-principle-v121 strong{display:block;margin:7px 0 4px;font-size:19px}.casa-principle-v121 p{margin:0;color:#7d737c}.casa-summary-v121 .card{background:rgba(255,252,249,.78);box-shadow:none;border:1px solid rgba(126,106,117,.10)}
 .casa-day-bridge-v121{display:grid;grid-template-columns:30px minmax(0,1fr) auto;gap:11px;align-items:center;margin:14px 0 16px;padding:12px 14px;border-radius:18px;background:linear-gradient(100deg,rgba(238,199,208,.42),rgba(239,246,234,.66));border:1px solid rgba(142,114,127,.08);color:#6d626c}.casa-day-bridge-v121 svg{width:22px;height:22px;color:#a36f7c}.casa-day-bridge-v121 strong,.casa-day-bridge-v121 small{display:block}.casa-day-bridge-v121 strong{font-size:12px}.casa-day-bridge-v121 small{font-size:10px;margin-top:2px;color:#8e838b}.casa-day-bridge-v121 a{text-decoration:none;color:#916676;font-size:11px;font-weight:800;white-space:nowrap}
 .casa-section{margin:10px 0}.casa-section>summary{border:1px solid rgba(128,106,117,.085);box-shadow:0 6px 18px rgba(60,45,70,.032);padding:14px 16px;background:rgba(255,254,252,.84)}.casa-section>summary .casa-section-left{gap:12px}.casa-section-icon{display:grid;place-items:center;width:25px;height:25px;color:#7f777b!important}.casa-section-icon svg{width:22px;height:22px}.casa-section>summary .casa-section-meta{font-size:11px}.casa-chevron{color:#928991}
 /* Exercícios: checkbox final, sem aparência nativa pesada */
 #exForm #eDays label,#exForm label:has(#eNotify){position:relative}.study-v10-modal #eDays input[type=checkbox],.study-v10-modal #eNotify{appearance:none;-webkit-appearance:none;width:19px!important;height:19px!important;min-width:19px!important;border:1.4px solid #c8b8cf!important;border-radius:6px!important;background:#fffdfb!important;margin:0!important;display:grid!important;place-items:center!important}.study-v10-modal #eDays input[type=checkbox]:checked,.study-v10-modal #eNotify:checked{background:linear-gradient(135deg,#d9c5ef,#f1c7b9)!important;border-color:#bda7c8!important}.study-v10-modal #eDays input[type=checkbox]:checked:after,.study-v10-modal #eNotify:checked:after{content:'✓';font-size:12px;line-height:1;color:#6f5879;font-weight:900}
 @media(max-width:420px){.casa-hero-v121{min-height:210px;padding:28px 30px}.casa-hero-v121 h2{font-size:32px;max-width:83%}.casa-hero-v121 p{font-size:17px;max-width:82%}.casa-hero-mark{right:25px;top:28px;width:44px}.casa-day-bridge-v121{grid-template-columns:26px 1fr}.casa-day-bridge-v121 a{grid-column:2;margin-top:2px}.casa-day-bridge-v121 small{line-height:1.3}}
 @media(max-width:420px){.casa-web-grid{grid-template-columns:1fr}}@media(max-width:380px){.casa-schedule-row{grid-template-columns:76px 1fr}.casa-time{font-size:10px}}

 /* v123 · sanfona Casa */
 .casa-section{margin:14px 0}.casa-section>summary{min-height:62px;padding:15px 18px;border:1px solid rgba(127,103,115,.10);box-shadow:0 10px 28px rgba(73,57,64,.045);background:linear-gradient(135deg,rgba(255,248,247,.96),rgba(247,250,244,.96))}.casa-section:nth-of-type(2n)>summary{background:linear-gradient(135deg,rgba(248,251,246,.98),rgba(255,246,248,.95))}.casa-section>summary .casa-section-left{gap:12px}.casa-section>summary .casa-section-left strong{font-size:18px;letter-spacing:-.01em;color:#3f3944}.casa-section-icon,.casa-inline-icon{display:inline-grid;place-items:center;width:25px;height:25px;color:#8f7f86;flex:0 0 auto}.casa-section-icon svg,.casa-inline-icon svg,.casa-recipe .panel-head h3>svg{width:22px;height:22px;stroke-width:1.35}.casa-section>summary .casa-section-meta{font-size:12px;color:#91858e}.casa-chevron{font-family:system-ui,sans-serif;color:#9b9098;font-size:15px!important}.casa-section-body{padding-top:12px}.casa-section-body>.list>.card,.casa-section-body>.card{border:1px solid rgba(127,103,115,.09);box-shadow:0 10px 28px rgba(73,57,64,.035)}
 .home-area{background:linear-gradient(180deg,rgba(255,255,255,.96),rgba(255,250,248,.97))}.home-area .panel-head h3,.casa-manual-area .panel-head h3,.casa-recipe .panel-head h3{display:flex;align-items:center;gap:9px}.home-task-wrap{padding:5px 0 12px}.home-task{align-items:flex-start;gap:11px}.home-task input[type=checkbox]{appearance:none;-webkit-appearance:none;width:23px!important;height:23px!important;border:1.5px solid #a899a3!important;border-radius:8px!important;background:rgba(255,255,255,.9)!important;margin-top:2px!important;display:grid!important;place-items:center!important;flex:0 0 auto}.home-task input[type=checkbox]:checked{background:linear-gradient(135deg,#d9b0bd,#bfcfbe)!important;border-color:transparent!important}.home-task input[type=checkbox]:checked:after{content:'✓';font-size:14px;font-weight:900;color:#fff}.home-task-actions{padding-left:34px;gap:10px}.home-how{color:#a06f82!important;font-size:12px!important;font-weight:800!important}.home-edit{background:linear-gradient(135deg,#f3e5ea,#edf2e8)!important;color:#756772!important;border:1px solid rgba(127,103,115,.08)!important}.casa-task-exec{margin-top:10px;padding-left:34px}.casa-task-exec button,.casa-maint-actions button{min-height:39px;padding:9px 15px!important}.casa-task-start,.casa-maint-actions .start{background:linear-gradient(135deg,#ecdce8,#f4ddd3)!important;color:#765a70!important}.casa-task-finish,.casa-maint-actions .finish{background:linear-gradient(135deg,#e9f2e8,#dce9df)!important;color:#56705e!important}.casa-task-reopen{background:linear-gradient(135deg,#f7ede5,#eef2e8)!important;color:#76655f!important}.casa-inline-add,#addMaintenance{background:linear-gradient(135deg,#e8d4df,#d9e6d9)!important;color:#6f5968!important;border:0!important}.casa-manual-area,.casa-recipe,.casa-inventory,.casa-schedule-card,.casa-web-card{background:linear-gradient(145deg,rgba(255,253,250,.98),rgba(248,251,246,.96))!important}.casa-manual-row,.casa-product-row{padding:14px 0}.casa-buy-mini{background:linear-gradient(135deg,#f3e5ea,#e8f0e7)!important;color:#7b6673!important}.casa-recipe-edit{border:0;border-radius:999px;padding:7px 10px;background:linear-gradient(135deg,#f2e2e8,#e7efe5);color:#765f6e;font-weight:800}.casa-schedule-card{background:linear-gradient(135deg,#fff9f6,#eef6ef 58%,#f8eef2)!important}.casa-time{background:rgba(255,255,255,.78)!important;color:#956f80!important}.casa-web-link{background:rgba(255,255,255,.84)!important;border-color:rgba(127,103,115,.08)!important}.casa-section .pill{background:#f2e8dd;color:#7f736b}
 `;document.head.appendChild(s);
}

const CASA_KEY="minha-vida.casa.v1";
const CASA_BASE={
 areas:[
  {id:"cozinha",title:"Cozinha",icon:"🍽️",tasks:[
   {id:"coz1",name:"Passar pano no piso",freq:"diário",when:"manhã/noite",done:false},
   {id:"coz2",name:"Organizar pia",freq:"diário",when:"manhã/noite",done:false},
   {id:"coz3",name:"Limpar bancada",freq:"diário",when:"manhã/noite",done:false},
   {id:"coz4",name:"Guardar alimentos",freq:"diário",when:"noite",done:false},
   {id:"coz5",name:"Retirar lixo se necessário",freq:"diário",when:"noite",done:false}
  ]},
  {id:"limpeza",title:"Limpeza da casa",icon:"🧹",tasks:[
   {id:"lim1",name:"Varrer/aspirar a casa",freq:"a cada 2 dias",when:"bloco doméstico",done:false},
   {id:"lim2",name:"Varrer e passar pano na lavanderia",freq:"a cada 2 dias",when:"bloco doméstico",done:false},
   {id:"lim3",name:"Passar pano nas áreas realmente usadas",freq:"semanal",when:"bloco doméstico",done:false},
   {id:"lim4",name:"Limpeza pesada",freq:"quinzenal",when:"bloco doméstico",done:false}
  ]},
  {id:"roupas",title:"Roupas & Lavanderia",icon:"👕",tasks:[
   {id:"roup1",name:"Separar roupas por tipo/cor",freq:"conforme volume",when:"antes da lavagem",done:false},
   {id:"roup2",name:"Lavar roupas do dia a dia",freq:"conforme volume",when:"lavanderia",done:false},
   {id:"roup3",name:"Cuidar das peças delicadas",freq:"conforme necessidade",when:"lavanderia",done:false},
   {id:"roup4",name:"Tratar manchas antes da máquina",freq:"sempre que necessário",when:"antes da lavagem",done:false},
   {id:"roup5",name:"Secar e retirar as peças no tempo certo",freq:"a cada lavagem",when:"lavanderia",done:false},
   {id:"roup6",name:"Lavar toalhas",freq:"semanal",when:"lavanderia",done:false},
   {id:"roup7",name:"Trocar/lavar roupa de cama",freq:"semanal",when:"lavanderia",done:false},
   {id:"roup8",name:"Passar roupas",freq:"semanal",when:"bloco único",done:false},
   {id:"roup9",name:"Dobrar e guardar",freq:"após secar/passar",when:"armários",done:false},
   {id:"roup10",name:"Revisar conservação e organização do armário",freq:"quinzenal",when:"armários",done:false}
  ]},
  {id:"externa",title:"Jardim • Piscina • Áreas externas",icon:"🌿",tasks:[]},
  {id:"animais",title:"Animais",icon:"🐾",tasks:[
   {id:"ani1",name:"Alimentar animais",freq:"diário",when:"manhã/noite",done:false},
   {id:"ani2",name:"Cuidar da Luna",freq:"diário",when:"manhã/início da noite",done:false}
  ]},
  {id:"henrique",title:"Henrique",icon:"👦",tasks:[
   {id:"hen1",name:"Arrumar a própria cama",freq:"diário",when:"manhã",done:false},
   {id:"hen2",name:"Organizar higiene, roupas e mochila",freq:"diário",when:"manhã",done:false},
   {id:"hen3",name:"Colocar louça da lancheira na pia",freq:"diário",when:"ao chegar",done:false},
   {id:"hen4",name:"Ajudar com os animais / Luna",freq:"diário",when:"manhã/início da noite",done:false},
   {id:"hen5",name:"Uma ajuda doméstica eventual",freq:"eventual",when:"sem sobrecarregar",done:false}
  ]}
 ],
 maintenance:[],
 notes:""
};

const CASA_TIME_KEY="minha-vida.casa.time.v2";
const CASA_TIME_BASE={
 ani1:"07:00 · 18:30", ani2:"07:15 · 18:30",
 hen1:"07:00", hen2:"07:10", hen3:"ao chegar", hen4:"18:30", hen5:"fim de semana",
 coz1:"após as refeições", coz2:"após as refeições", coz3:"após as refeições", coz4:"após o jantar", coz5:"após o jantar",
 lim1:"janela doméstica", lim2:"janela doméstica", lim3:"janela doméstica", lim4:"fim de semana",
 roup1:"janela de lavanderia", roup2:"janela de lavanderia", roup3:"janela de lavanderia", roup4:"antes da lavagem", roup5:"ao fim do ciclo", roup6:"janela de lavanderia", roup7:"janela de lavanderia", roup8:"bloco de roupas", roup9:"após secar/passar", roup10:"fim de semana"
};
function loadCasaTimes(){try{return {...CASA_TIME_BASE,...JSON.parse(localStorage.getItem(CASA_TIME_KEY)||"{}")}}catch{return {...CASA_TIME_BASE}}}
function saveCasaTimes(x){localStorage.setItem(CASA_TIME_KEY,JSON.stringify(x))}
function casaTime(id){return loadCasaTimes()[id]||"horário a definir";}
function casaTimeParts(id){const raw=String(casaTime(id)||"horário a definir").trim();if(!raw)return ["horário a definir"];if(raw.includes("·"))return raw.split("·").map(x=>x.trim()).filter(Boolean);return [raw];}
function casaTimeBubbles(id){return `<span class="casa-time-stack">${casaTimeParts(id).map(x=>`<span class="casa-time">${escapeHtml(x)}</span>`).join("")}</span>`;}

const CASA_HOW={
 coz1:{title:"Passar pano no piso",time:"10–15 min",products:["Água","Detergente neutro ou produto adequado ao piso"],materials:["Vassoura/aspirador","Mop ou pano de microfibra","Balde"],steps:["Retire objetos e resíduos soltos.","Varra ou aspire primeiro; o pano vem depois para não espalhar a sujeira.","Dilua o produto conforme o rótulo.","Passe o pano úmido, sem encharcar o piso.","Deixe o ambiente secar completamente."],tip:"Para a limpeza geral, o manual da residência orienta aspirar/varrer antes do pano úmido."},
 coz2:{title:"Organizar pia",time:"5–10 min",products:["Detergente neutro"],materials:["Esponja macia","Pano de microfibra","Escorredor"],steps:["Retire toda a louça e coloque cada item em seu lugar.","Lave o que estiver pendente.","Limpe cuba, torneira e área ao redor com detergente neutro.","Enxágue e seque as superfícies.","Finalize deixando a pia livre e pronta para o próximo uso."],tip:"A regra é deixar a cozinha pronta para o próximo dia."},
 coz3:{title:"Limpar bancada",time:"5 min",products:["Detergente neutro"],materials:["Pano de microfibra"],steps:["Retire objetos e resíduos.","Passe pano úmido com detergente neutro.","Dê atenção às áreas de gordura e aos cantos.","Passe pano limpo e finalize com a superfície seca.","Recoloque somente o que realmente pertence à bancada."],tip:"Superfícies limpas e secas facilitam a manutenção diária."},
 lim1:{title:"Varrer / aspirar a casa",time:"15–25 min",products:[],materials:["Aspirador ou vassoura","Pá/coletor","Pano de microfibra"],steps:["Recolha objetos que estejam no chão.","Comece pelas áreas mais altas e siga para o piso.","Varra ou aspire todos os ambientes, incluindo cantos e sob móveis quando possível.","Finalize com pano úmido apenas quando necessário."],tip:"O manual reforça: aspirador/varredura antes do pano úmido evita 'barrear' o chão."},
 lim2:{title:"Limpar a lavanderia",time:"10–15 min",products:["Detergente neutro ou produto adequado ao piso"],materials:["Vassoura/aspirador","Mop ou pano","Balde"],steps:["Retire cestos e objetos do piso.","Varra ou aspire primeiro.","Limpe respingos e áreas próximas à máquina.","Passe pano úmido sem excesso de água.","Deixe secar e reorganize os itens."],tip:"Mantenha a área seca e livre para circulação."},
 lim3:{title:"Passar pano nas áreas usadas",time:"10–20 min",products:["Detergente neutro ou produto adequado ao piso"],materials:["Mop/pano de microfibra","Balde"],steps:["Priorize somente os ambientes que realmente foram usados.","Retire sujeira solta com vassoura ou aspirador.","Passe pano úmido nas áreas de circulação.","Troque a água quando estiver suja.","Deixe o piso secar completamente."],tip:"A ideia é limpar o que precisa, sem transformar manutenção em uma segunda jornada."},
 lim4:{title:"Limpeza pesada",time:"60–90 min",products:["Detergente neutro","Desinfetante adequado à superfície","Álcool ou limpa-vidros"],materials:["Luvas","Panos de microfibra","Esponja","Escova macia","Aspirador","Vassoura e pá","Balde","Toalhas limpas"],steps:["Abra as janelas e reúna todos os materiais antes de começar.","Retire objetos soltos e trabalhe de cima para baixo.","Aspire/varra pisos e áreas escondidas antes do pano.","Limpe rodapés, superfícies, portas e maçanetas.","Limpe vidros e espelhos com álcool ou limpa-vidros e seque com microfibra.","Finalize os pisos com pano úmido e deixe tudo secar.","Recoloque objetos e faça uma conferência visual final."],tip:"O manual da residência orienta trabalhar de cima para baixo, manter ventilação e nunca misturar produtos de limpeza."},
 roup1:{title:"Separar roupas por tipo e cor",time:"5–10 min",products:[],materials:["Cesto(s) de roupa","Saquinhos para peças delicadas, se necessário"],steps:["Separe brancas, coloridas/escuras e peças que exigem cuidado especial.","Confira etiquetas e instruções de lavagem.","Separe peças delicadas e coloque-as em saco protetor quando indicado.","Verifique bolsos e fechos antes de colocar na máquina.","Trate manchas antes da lavagem."],tip:"Separar corretamente reduz transferência de cor e desgaste desnecessário."},
 roup2:{title:"Lavar roupas do dia a dia",time:"Conforme o ciclo",products:["Sabão para roupas","Amaciante, se desejado"],materials:["Máquina de lavar","Cesto de roupas"],steps:["Separe as peças por cor e tecido.","Não sobrecarregue a máquina.","Use a quantidade de produto indicada pelo fabricante da máquina/produto.","Escolha o ciclo compatível com as etiquetas.","Retire as roupas assim que o ciclo terminar para evitar odores e vincos."],tip:"Menos produto não significa melhor sempre; siga a dosagem indicada para sua máquina e para a carga."},
 roup3:{title:"Cuidar das peças delicadas",time:"10 min + ciclo",products:["Sabão adequado para roupas delicadas"],materials:["Saco protetor para delicadas","Máquina ou recipiente para lavagem manual"],steps:["Leia a etiqueta antes de lavar.","Separe seda, renda, tecidos finos e peças com aplicações.","Use ciclo delicado ou lavagem manual quando indicado.","Evite excesso de atrito e centrifugação agressiva.","Seque conforme a etiqueta e evite calor excessivo."],tip:"No manual de passadoria, peças delicadas entram sempre na menor temperatura."},
 roup4:{title:"Tratar manchas antes da máquina",time:"5–15 min",products:["Produto tira-manchas compatível com o tecido"],materials:["Pano limpo ou escova macia","Luvas, se o produto exigir"],steps:["Identifique o tipo de mancha e confira a etiqueta da peça.","Aplique o produto apropriado em pequena quantidade.","Trabalhe delicadamente, sem esfregar agressivamente tecidos sensíveis.","Aguarde o tempo indicado pelo fabricante.","Lave a peça normalmente e confira a mancha antes de secar ou passar."],tip:"Não fixe a mancha com calor: confirme que ela saiu antes da secagem quente ou da passadoria."},
 roup5:{title:"Secar e retirar as peças",time:"5–10 min",products:[],materials:["Varal ou secadora, conforme a etiqueta","Cabides quando apropriado"],steps:["Retire as peças da máquina assim que o ciclo terminar.","Sacuda e acomode as peças para reduzir vincos.","Use varal ou secadora somente de acordo com a etiqueta.","Evite deixar roupas úmidas acumuladas no cesto.","Quando estiverem secas, encaminhe para dobrar ou passar."],tip:"Retirar logo após a lavagem ajuda a evitar odores e vincos profundos."},
 roup6:{title:"Lavar toalhas",time:"Ciclo completo",products:["Sabão em pó ou líquido","Pouco amaciante","Vinagre de álcool, conforme o manual da residência"],materials:["Máquina de lavar","Cesto"],steps:["Reúna as toalhas e trate manchas antes de colocar na máquina.","Não encha demais a máquina; deixe espaço para circulação de água.","Use pouco sabão, conforme o manual da residência.","No dispenser de amaciante, use pouco amaciante e, conforme a rotina registrada no manual, complete com um pouco de vinagre de álcool.","Use programa compatível e retire as toalhas imediatamente ao terminar.","Coloque-as para secar sem deixá-las amontoadas."],tip:"O manual da residência orienta pouco sabão e retirada imediata das toalhas após o ciclo."},
 roup7:{title:"Trocar / lavar roupa de cama",time:"Ciclo completo",products:["Sabão para roupas","Amaciante, se desejado"],materials:["Máquina de lavar","Cesto"],steps:["Retire o jogo completo e confira manchas de suor ou oleosidade.","Trate manchas antes da lavagem.","Coloque os lençóis sem compactar demais a máquina.","Use o programa indicado para lençóis/cama ou o compatível com a etiqueta.","Retire imediatamente ao término para facilitar a secagem e a passadoria.","Dobre ou passe e guarde o jogo completo junto."],tip:"O manual recomenda espaço na máquina para evitar amassados excessivos."},
 roup8:{title:"Passar roupas",time:"20–45 min",products:["Água","Amaciante, para a misturinha do borrifador usada no manual da residência"],materials:["Ferro","Tábua de passar","Borrifador","Cabides"],steps:["Separe as roupas por tecido e temperatura.","Comece pelas peças que exigem temperatura baixa.","Passe delicadas, coloridas e peças com elástico/aplicações antes das de temperatura média.","Borrife levemente a misturinha usada na rotina da casa.","Passe camisetas e peças de algodão em temperatura adequada.","Dobre ou coloque em cabide imediatamente."],tip:"O manual orienta começar por baixa temperatura e nunca deixar o ferro parado sobre a peça."},
 roup9:{title:"Dobrar e guardar",time:"10–20 min",products:[],materials:["Superfície limpa e seca","Cabides, divisórias ou organizadores"],steps:["Separe as peças por categoria.","Dobre ou pendure de acordo com o tecido e o formato.","Guarde somente roupas completamente secas.","Mantenha peças delicadas sem compressão excessiva.","Agrupe conjuntos e jogos de cama para facilitar o uso."],tip:"Guardar logo após secar/passar evita uma segunda rodada de organização."},
 roup10:{title:"Conservar e organizar o armário",time:"15–20 min",products:[],materials:["Pano de microfibra","Cabides","Organizadores, se necessários"],steps:["Retire apenas o necessário para trabalhar por uma categoria.","Confira se as peças estão limpas e completamente secas.","Limpe prateleiras e superfícies com pano adequado.","Separe peças sem uso, para conserto ou para doação.","Devolva as roupas por categoria, deixando as mais usadas acessíveis."],tip:"A organização deve facilitar a rotina, não criar um projeto permanente."}
};


const CASA_MANUAL_PROCEDURES=[
 {id:"manual-coz-bancada",area:"Cozinha",title:"Bancadas e superfícies",time:"5–10 min",products:["Cif Espuma Milagrosa"],materials:["Pano de microfibra","Pano multiuso"],steps:["Retire objetos e migalhas.","Passe pano multiuso úmido.","Para gordura, aplique Cif Espuma Milagrosa na superfície compatível, aja conforme o rótulo e remova com pano limpo."],tip:"O manual recomenda produto específico para gordura e pano limpo para finalizar."},
 {id:"manual-coz-pia",area:"Cozinha",title:"Pia",time:"5 min",products:["Qualitá Home Lava-Louças Líquido Coco"],materials:["Esponja","Pano"],steps:["Retire resíduos.","Lave com lava-louças líquido de coco e esponja.","Enxágue e seque."],tip:"Deixar a pia limpa e seca facilita a manutenção seguinte."},
 {id:"manual-coz-fogao",area:"Cozinha",title:"Fogão / cooktop",time:"5–10 min",products:["Cif Espuma Milagrosa"],materials:["Pano","Esponja"],steps:["Remova resíduos.","Use produto apropriado para gordura.","Passe pano úmido e finalize com pano limpo."],tip:"Use somente produto compatível com a superfície."},
 {id:"manual-coz-armarios",area:"Cozinha",title:"Frentes de armários",time:"5–10 min",products:["Cif Espuma Milagrosa"],materials:["Pano de microfibra"],steps:["Retire marcas e gordura com pano levemente úmido.","Em sujeira engordurada, use produto compatível.","Finalize com pano limpo."],tip:"Teste o produto em pequena área quando houver dúvida sobre compatibilidade."},
 {id:"manual-coz-piso",area:"Cozinha",title:"Piso da cozinha",time:"10–15 min",products:["Solução apropriada para cerâmica"],materials:["Vassoura ou aspirador","Mop","Balde"],steps:["Remova resíduos com vassoura ou aspirador.","Passe mop com solução apropriada para cerâmica.","Evite excesso de água e deixe secar."],tip:"Remover a sujeira solta antes do pano evita espalhar resíduos."},
 {id:"manual-sala-poeira",area:"Sala de TV, antessala e corredores",title:"Poeira de superfícies",time:"5–10 min",products:[],materials:["Espanador","Pano de microfibra","Pano multiuso"],steps:["Retire objetos.","Passe espanador ou pano de microfibra.","Finalize com pano multiuso quando necessário."],tip:"Trabalhe por partes para não espalhar a poeira."},
 {id:"manual-sala-sofa",area:"Sala de TV, antessala e corredores",title:"Sofá",time:"10 min",products:[],materials:["Aspirador"],steps:["Aspire assentos, encostos, frestas e laterais.","Não encharque o tecido."],tip:"O manual orienta evitar água em excesso no tecido."},
 {id:"manual-sala-esteira",area:"Sala de TV, antessala e corredores",title:"Esteira",time:"5 min",products:[],materials:["Pano de microfibra"],steps:["Remova poeira.","Limpe superfícies externas com pano levemente úmido.","Não molhe partes elétricas."],tip:"Componentes elétricos devem permanecer secos."},
 {id:"manual-sala-livros",area:"Sala de TV, antessala e corredores",title:"Livros",time:"5–10 min",products:[],materials:["Espanador","Pano seco"],steps:["Tire poeira das capas e prateleiras.","Evite umidade excessiva."],tip:"Pano seco é a opção-base para preservar livros."},
 {id:"manual-sala-porcelanato",area:"Sala de TV, antessala e corredores",title:"Piso de porcelanato",time:"10–15 min",products:["Solução compatível com porcelanato"],materials:["Aspirador ou vassoura","Mop"],steps:["Aspire ou varra.","Passe mop bem torcido com solução compatível.","Finalize sem excesso de água."],tip:"Evite abrasivos e excesso de produto."},
 {id:"manual-quarto-cama",area:"Quartos",title:"Cama e organização",time:"5–10 min",products:[],materials:["Cesto de roupa","Panos"],steps:["Arrume a cama.","Recolha roupas e objetos.","Devolva cada item ao lugar."],tip:"A organização diária deve ser curta e objetiva."},
 {id:"manual-quarto-poeira",area:"Quartos",title:"Poeira",time:"5–10 min",products:[],materials:["Pano de microfibra"],steps:["Limpe as superfícies com pano de microfibra.","Comece pelas partes mais altas."],tip:"De cima para baixo reduz retrabalho."},
 {id:"manual-quarto-piso",area:"Quartos",title:"Piso dos quartos",time:"10 min",products:["Solução compatível com o piso"],materials:["Aspirador ou vassoura","Mop"],steps:["Aspire ou varra.","Passe mop bem torcido.","Deixe secar."],tip:"Evite excesso de água."},
 {id:"manual-quarto-espelhos",area:"Quartos",title:"Espelhos",time:"3–5 min",products:[],materials:["Pano próprio para vidro","Rodo de vidro"],steps:["Use pouca umidade.","Limpe a superfície.","Finalize com pano ou rodo de vidro."],tip:"Evite excesso de produto e umidade."},
 {id:"manual-banheiro-bancada",area:"Banheiros",title:"Bancada e cuba",time:"5 min",products:["Produto adequado"],materials:["Esponja","Pano"],steps:["Retire objetos.","Lave/limpe com produto compatível.","Enxágue quando necessário e seque."],tip:"A compatibilidade do produto depende da superfície."},
 {id:"manual-banheiro-vaso",area:"Banheiros",title:"Vaso sanitário",time:"5–10 min",products:["Produto adequado para vaso sanitário"],materials:["Escova de vaso/refil","Pano"],steps:["Aplique o produto próprio na parte interna.","Escove.","Acione a descarga.","Limpe a parte externa com pano."],tip:"Use a escova/refil específico para o vaso."},
 {id:"manual-banheiro-box",area:"Banheiros",title:"Box",time:"10 min",products:["Produto compatível com vidro e metais"],materials:["Rodo","Pano","Esponja"],steps:["Limpe os vidros com rodo e pano.","Remova resíduos de sabonete.","Limpe metais sem produto abrasivo."],tip:"Evite abrasivos nos metais."},
 {id:"manual-banheiro-piso",area:"Banheiros",title:"Piso cerâmico",time:"10 min",products:["Solução compatível"],materials:["Vassoura","Mop","Escova"],steps:["Varra ou aspire.","Aplique solução compatível.","Esfregue pontos necessários.","Retire excesso de água."],tip:"Cuidado com rejuntes muito encharcados."},
 {id:"manual-lav-maquina",area:"Lavanderia",title:"Máquina LG",time:"5 min",products:[],materials:["Pano de microfibra"],steps:["Após o uso, retire a roupa.","Deixe a porta aberta para ventilar.","Limpe a borracha da porta.","Limpe as superfícies externas com pano levemente úmido."],tip:"A ventilação após o uso faz parte da rotina de conservação registrada no manual."},
 {id:"manual-lav-tanque",area:"Lavanderia",title:"Tanque e bancada",time:"5–10 min",products:["Produto compatível"],materials:["Esponja","Pano"],steps:["Retire objetos.","Limpe tanque e bancada.","Seque."],tip:"Mantenha a área livre para a próxima lavagem."},
 {id:"manual-lav-panos",area:"Lavanderia",title:"Panos de limpeza",time:"10–15 min + ciclo",products:["Produto de lavagem adequado"],materials:["Máquina LG","Cesto"],steps:["Separe os panos conforme o uso.","Lave de acordo com o tipo de tecido e orientação da máquina.","Retire após o ciclo e encaminhe para secagem."],tip:"Separar panos por uso ajuda a evitar contaminação cruzada."},
 {id:"manual-lav-organizacao",area:"Lavanderia",title:"Organização da lavanderia",time:"5–10 min",products:[],materials:["Recipientes/organizadores"],steps:["Mantenha produtos fechados.","Identifique os recipientes.","Separe os produtos por função."],tip:"Produtos concentrados devem permanecer em suas embalagens originais e identificadas."},
 {id:"manual-calcados",area:"Quarto de calçados",title:"Calçados",time:"10–15 min",products:[],materials:["Escova","Pano","Secador de calçados"],steps:["Retire poeira e sujeira das solas.","Use o secador de calçados quando necessário.","Organize por categoria."],tip:"Só guarde o calçado depois de completamente seco."},
 {id:"manual-calcados-piso",area:"Quarto de calçados",title:"Piso",time:"5–10 min",products:["Solução compatível com o piso"],materials:["Aspirador ou vassoura","Mop"],steps:["Aspire ou varra.","Passe mop bem torcido."],tip:"Evite excesso de água."},
 {id:"manual-rouparia-prateleiras",area:"Rouparia / armário de enxoval",title:"Prateleiras",time:"10–15 min",products:[],materials:["Pano de microfibra","Espanador"],steps:["Retire itens por partes.","Tire o pó.","Limpe com pano levemente úmido.","Devolva os itens organizados."],tip:"Trabalhar por pequenas partes evita desmontar todo o armário."},
 {id:"manual-rouparia-enxoval",area:"Rouparia / armário de enxoval",title:"Enxoval",time:"10–20 min",products:[],materials:["Organizadores"],steps:["Dobre e agrupe por categoria.","Mantenha fácil acesso às peças de uso frequente."],tip:"A organização deve favorecer o uso frequente."},
 {id:"manual-varanda-residuos",area:"Varanda grande / área do cachorro",title:"Fezes e sujeiras pontuais",time:"3–5 min",products:[],materials:["Pá/saco","Luvas"],steps:["Recolha resíduos sólidos antes de molhar o piso.","Descarte adequadamente."],tip:"Primeiro remova os sólidos; só depois faça a lavagem."},
 {id:"manual-varanda-poeira",area:"Varanda grande / área do cachorro",title:"Poeira, pelos e folhas",time:"10 min",products:[],materials:["Vassoura","Pá","Aspirador"],steps:["Varra ou aspire conforme o equipamento disponível.","Recolha os resíduos."],tip:"Escolha o equipamento que gere menos esforço para a área."},
 {id:"manual-varanda-pedra",area:"Varanda grande / área do cachorro",title:"Pedra portuguesa",time:"15–30 min",products:["Produto compatível com pedra"],materials:["Vassoura","Escova","Mangueira ou WAP"],steps:["Remova sólidos primeiro.","Lave/esfregue com água e produto compatível.","Use a WAP apenas quando a pressão for adequada ao local e às juntas."],tip:"Teste produto e pressão em pequena área."},
 {id:"manual-varanda-moveis",area:"Varanda grande / área do cachorro",title:"Mobiliário",time:"5–10 min",products:["Produto compatível com o material, quando necessário"],materials:["Pano de microfibra"],steps:["Retire poeira.","Limpe com pano compatível com o material."],tip:"A superfície do móvel determina o produto adequado."},
 {id:"manual-garagem-piso",area:"Garagem",title:"Piso",time:"20–30 min",products:["Produto compatível com o piso, quando necessário"],materials:["Vassoura","Mangueira ou WAP"],steps:["Varra primeiro.","Lave com mangueira ou WAP quando necessário.","Direcione a água para o escoamento."],tip:"Observe sempre o escoamento antes de usar água em volume."},
 {id:"manual-garagem-cantos",area:"Garagem",title:"Cantinhos e paredes baixas",time:"10–15 min",products:["Produto compatível, quando necessário"],materials:["Escova","Mangueira"],steps:["Escove a sujeira acumulada.","Remova com água."],tip:"Trabalhe por pequenas áreas."},
 {id:"manual-janelas-vidros",area:"Janelas, grades e telas",title:"Vidros",time:"5–10 min por janela",products:["Produto compatível para vidro"],materials:["Pano","Rodo de vidro"],steps:["Remova poeira.","Limpe com pano adequado.","Finalize com rodo de vidro."],tip:"Limpar uma janela por vez ajuda a controlar o tempo."},
 {id:"manual-janelas-grades",area:"Janelas, grades e telas",title:"Grades",time:"5–10 min",products:["Produto compatível"],materials:["Pano","Escova"],steps:["Limpe separadamente com pano úmido ou escova.","Não dependa do acessório de telas."],tip:"Grades e telas têm procedimentos diferentes."},
 {id:"manual-janelas-telas",area:"Janelas, grades e telas",title:"Telas / mosquiteiros",time:"5–10 min",products:[],materials:["Ferramenta de cabo longo com cabeça própria para tela"],steps:["Use a ferramenta própria.","Faça movimentos suaves para retirar poeira."],tip:"Movimentos suaves preservam a tela."},
 {id:"manual-jardim-folhas",area:"Jardim / áreas externas",title:"Folhas",time:"10–20 min",products:[],materials:["Vassoura","Pá"],steps:["Recolha folhas e detritos com vassoura e pá.","Descarte ou destine os resíduos adequadamente."],tip:"Faça a coleta antes de lavar as áreas externas."},
 {id:"manual-jardim-cimento",area:"Jardim / áreas externas",title:"Área cimentada",time:"10–20 min",products:["Produto compatível, quando necessário"],materials:["Vassoura","Mangueira"],steps:["Varra.","Lave quando necessário.","Observe o escoamento."],tip:"Não espalhe resíduos de animais durante a lavagem."},
 {id:"manual-jardim-animais",area:"Jardim / áreas externas",title:"Resíduos de animais",time:"3–5 min",products:[],materials:["Pá/saco","Luvas"],steps:["Recolha antes da lavagem.","Descarte adequadamente."],tip:"Sempre remova os resíduos sólidos antes de molhar a área."},
 {id:"manual-piscina-superficie",area:"Piscina de 6.000 L",title:"Superfície",time:"5–10 min",products:[],materials:["Peneira/limpador de piscina"],steps:["Retire folhas e resíduos da água antes da limpeza."],tip:"Faça a remoção superficial antes de qualquer outra etapa."},
 {id:"manual-piscina-bordas",area:"Piscina de 6.000 L",title:"Bordas",time:"5–10 min",products:["Produto compatível com o revestimento"],materials:["Pano/esponja"],steps:["Limpe a borda com produto compatível.","Enxágue sem deixar resíduos na água."],tip:"A compatibilidade com o revestimento é essencial."},
 {id:"manual-piscina-agua",area:"Piscina de 6.000 L",title:"Tratamento da água",time:"Conforme necessidade",products:["Produtos próprios de tratamento"],materials:["Medidores"],steps:["Siga exclusivamente as instruções dos produtos específicos.","Siga também as orientações do fabricante da piscina."],tip:"Não improvise dosagens."},
 {id:"manual-edicula-escritorio",area:"Edícula — futuro escritório",title:"Preparação",time:"20–30 min",products:[],materials:["Ferramentas apropriadas"],steps:["Quando chegar o momento, desmonte a cama.","Libere a área."],tip:"É um projeto, não uma rotina diária."},
 {id:"manual-edicula-escritorio-piso",area:"Edícula — futuro escritório",title:"Poeira e piso",time:"15–20 min",products:["Solução compatível com o piso"],materials:["Espanador","Aspirador ou vassoura","Mop"],steps:["Remova poeira de cima para baixo.","Aspire/varra.","Limpe o piso."],tip:"Trabalhar de cima para baixo evita retrabalho."},
 {id:"manual-deposito-org",area:"Edícula — depósito",title:"Organização",time:"20–30 min por bloco",products:[],materials:["Caixas/organizadores","Pano","Vassoura"],steps:["Separe por categorias.","Retire itens sem uso.","Limpe prateleiras.","Devolva em caixas identificadas."],tip:"O próprio manual trata essa tarefa como organização por pequenos blocos."},
 {id:"manual-deposito-piso",area:"Edícula — depósito",title:"Limpeza do piso",time:"10–20 min",products:["Solução compatível com o piso"],materials:["Vassoura ou aspirador","Mop"],steps:["Retire objetos por pequenos blocos.","Varra/aspire.","Passe mop ou pano compatível."],tip:"Faça por pequenos blocos para não transformar a tarefa em um projeto enorme."},
 {id:"manual-edicula-pia",area:"Edícula — varanda e pia grande",title:"Pia grande",time:"5–10 min",products:["Qualitá Home Lava-Louças Líquido Coco"],materials:["Esponja","Pano"],steps:["Remova resíduos.","Lave e enxágue.","Finalize com pano limpo."],tip:"Deixe a pia seca ao final."},
 {id:"manual-edicula-varanda",area:"Edícula — varanda e pia grande",title:"Varanda",time:"10–20 min",products:["Produto compatível, quando necessário"],materials:["Vassoura","Mangueira","Escova"],steps:["Varra.","Retire pó e resíduos.","Lave quando necessário."],tip:"Retire resíduos sólidos antes da lavagem."},
 {id:"manual-edicula-marcenaria",area:"Edícula — varanda e pia grande",title:"Área de marcenaria",time:"10–20 min",products:[],materials:["Vassoura ou aspirador","Pano"],steps:["Recolha serragem e resíduos primeiro.","Depois limpe bancadas e piso sem espalhar a poeira."],tip:"A primeira etapa é conter a serragem, não espalhá-la."}
];

const CASA_RECIPES=[
 {id:"recipe-panos-multiuso",title:"Panos Multiuso Úmidos",time:"5–10 min",yieldText:"Recipiente abastecido",ingredients:[["Água","800 ml"],["Álcool líquido 70%","100 ml"],["Amaciante concentrado","50 ml"],["Lava-louças líquido de coco","50 ml"],["Panos limpos de algodão/microfibra","quantidade suficiente"]],materials:["Recipiente com tampa"],steps:["Misture 800 ml de água com 100 ml de álcool 70%.","Adicione 50 ml de amaciante concentrado.","Adicione 50 ml de lava-louças líquido de coco.","Misture suavemente.","Coloque os panos limpos no recipiente.","Umedeça os panos com a solução.","Torça/pressione até ficarem úmidos, sem excesso de líquido.","Guarde o recipiente fechado."],tip:"Uso para móveis, portas, puxadores, rodapés e pequenas sujeiras. Não usar como desinfetante nem em eletrônicos; em superfícies de preparo de alimentos, fazer a limpeza adequada posteriormente."},
 {id:"recipe-panos-secadora",title:"Panos Reutilizáveis para Secadora",time:"5 min",yieldText:"8–10 panos de aproximadamente 15 × 15 cm",ingredients:[["Amaciante concentrado","250 ml"],["Água","250 ml"],["Panos de algodão/flanela","8–10 unidades"]],materials:["Recipiente com tampa"],steps:["Misture 250 ml de amaciante concentrado com 250 ml de água.","Coloque os panos no recipiente.","Despeje a solução sobre os panos.","Pressione para absorver.","Na hora de usar, retire um pano e torça bem: deve ficar úmido, não pingando.","Coloque 1 pano na secadora junto com a roupa.","Depois do ciclo, retire e devolva ao recipiente para reutilização."],tip:"A receita-base do manual usa proporção 1:1 e orienta retirar o excesso antes da secadora."},
 {id:"recipe-coala",title:"Solução de Coala Chá Branco",time:"2–3 min",yieldText:"1 litro",ingredients:[["Água","1 litro"],["Coala Chá Branco concentrado","8 gotas"]],materials:["Recipiente apropriado"],steps:["Coloque 1 litro de água no recipiente.","Adicione 8 gotas de Coala Chá Branco.","Misture.","Aplique com pano úmido na superfície compatível.","Teste primeiro em pequena área."],tip:"O manual registra que não é necessário enxaguar quando usado conforme a orientação do fabricante. Não misture Coala com água sanitária, vinagre, álcool ou outros produtos sem orientação específica."}
];

const CASA_PRODUCT_CATALOG=[
 {name:"Tudo Limpinho Petklin",use:"Áreas internas de cães e gatos; varanda/áreas dos animais",status:"SUBSTITUTO",substitute:"Manter — linha principal"},
 {name:"Tudo Limpinho Álcool Perfumado — Glamour de Shopping",use:"Limpeza geral e acabamento/perfumação de superfícies compatíveis",status:"SUBSTITUTO",substitute:"Manter — linha principal"},
 {name:"Tudo Limpinho Flotalim Extra Forte",use:"Gordura e sujeira pesada em superfícies compatíveis",status:"SUBSTITUTO",substitute:"Manter — linha principal"},
 {name:"Tudo Limpinho Porcelanex",use:"Limpeza de porcelanato",status:"SUBSTITUTO",substitute:"Manter — linha principal"},
 {name:"Tudo Limpinho Tudax Limpeza Pesada",use:"Limpeza pesada geral em superfícies laváveis",status:"SUBSTITUTO",substitute:"Manter — linha principal"},
 {name:"Tudo Limpinho Querosene — Sabão Spray",use:"Desengorduramento/desengraxe e sujeira pesada conforme rótulo",status:"SUBSTITUTO",substitute:"Manter — uso específico"},
 {name:"Tudo Limpinho Limpador Clorado",use:"Higienização, desengorduramento e branqueamento em superfícies compatíveis",status:"SUBSTITUTO",substitute:"Manter — linha principal"},
 {name:"Tudo Limpinho Ultra Clean",use:"Sujeira aderida em superfícies compatíveis",status:"SUBSTITUTO",substitute:"Manter — linha principal"},
 {name:"Tudo Limpinho Rejuntec",use:"Limpeza de rejuntes",status:"SUBSTITUTO",substitute:"Manter — linha principal"},
 {name:"Tudo Limpinho Finisher Fresh Bouquet",use:"Finalizador/facilitador para roupas/tecidos conforme rótulo",status:"EM USO",substitute:"Manter — uso específico"},
 {name:"Tudo Limpinho Ultra Box",use:"Limpeza do box conforme indicação do rótulo",status:"SUBSTITUTO",substitute:"Manter — linha principal"},
 {name:"Tudo Limpinho Polimax",use:"Pasta limpadora/polidora para superfícies compatíveis",status:"SUBSTITUTO",substitute:"Manter — linha principal"},
 {name:"Tudo Limpinho Thunder — Limpeza Pesada Porcelanato",use:"Limpeza pesada específica de porcelanato",status:"SUBSTITUTO",substitute:"Manter — linha principal"},
 {name:"Qualitá Home Lava-Louças Líquido Coco",use:"Louça, pia e limpeza leve",status:"EM USO",substitute:"Tudo Limpinho — detergente próprio para louça"},
 {name:"Cif Espuma Milagrosa — Derrete Gordura",use:"Desengordurante de cozinha",status:"EM USO",substitute:"Tudo Limpinho Flotalim Extra Forte"},
 {name:"Cif Espuma Milagrosa — Extermina Limo",use:"Limo/sujeira de banheiro",status:"EM USO",substitute:"Tudo Limpinho Ultra Box / produto adequado"},
 {name:"UAU Blindex Box",use:"Limpeza profunda de box/vidros",status:"EM USO",substitute:"Tudo Limpinho Ultra Box"},
 {name:"Ypê Tira Limo — Cloro Ativo em Gel",use:"Limo e higienização conforme rótulo",status:"EM USO",substitute:"Tudo Limpinho Limpador Clorado, se compatível"},
 {name:"Aromasil Saponáceo Cremoso Cloro 3 em 1",use:"Limpeza pesada de superfícies compatíveis",status:"EM USO",substitute:"Tudo Limpinho Ultra Clean/Polimax, conforme superfície"},
 {name:"Bombril Sapólio Radium",use:"Saponáceo em pó para sujeira aderida",status:"EM USO",substitute:"Tudo Limpinho Ultra Clean/Polimax"},
 {name:"Sol Querosene 500 ml",use:"Querosene para usos específicos compatíveis",status:"EM USO",substitute:"Tudo Limpinho Querosene — Sabão Spray"},
 {name:"Veja Perfumes — Buquê Cerrado",use:"Limpeza perfumada de manutenção",status:"EM USO",substitute:"Tudo Limpinho Álcool Perfumado"},
 {name:"Coala Zulu Coala Limpa Perfume",use:"Limpeza/perfumação de manutenção",status:"EM USO",substitute:"Tudo Limpinho Álcool Perfumado ou Coala Chá Branco"},
 {name:"GloDePeroba — Jasmine",use:"Limpeza/conservação de móveis e superfícies indicadas",status:"EM USO",substitute:"Manter produto específico para madeira"},
 {name:"Lysol — lenços desinfetantes",use:"Higienização pontual de superfícies compatíveis",status:"EM USO",substitute:"Usar até acabar; sem substituição automática"},
 {name:"HIKO Fabric Refresher",use:"Revitalização de tecidos conforme rótulo",status:"EM USO",substitute:"Usar até acabar; não confundir com limpador de superfícies"},
 {name:"Jakhebe Adhesive Remover",use:"Remoção de cola/adesivo em superfícies compatíveis",status:"EM USO",substitute:"Manter como produto específico"},
 {name:"Coala Chá Branco Limpador Perfumado",use:"Limpeza perfumada concentrada para pisos, azulejos e superfícies laváveis compatíveis",status:"EM USO",substitute:"Manter como complemento"},
 {name:"Querosene",use:"Uso específico conforme manual/rótulo",status:"EM USO",substitute:"Tudo Limpinho Querosene — Sabão Spray"},
 {name:"Sabão de querosene",use:"Uso específico conforme manual/rótulo",status:"EM USO",substitute:"Tudo Limpinho Querosene — Sabão Spray"},
 {name:"Água sanitária",use:"Uso específico conforme rótulo",status:"EM USO",substitute:"Tudo Limpinho Limpador Clorado, quando compatível"},
 {name:"Tudax",use:"Limpeza pesada",status:"EM USO",substitute:"Tudo Limpinho Tudax Limpeza Pesada"},
 {name:"Solução diluída de Coala + álcool + água já preparada",use:"Solução já preparada para usos registrados",status:"EM USO",substitute:"Repreparar somente conforme receita/uso definido"},
 {name:"Amaciante concentrado",use:"Roupas e receitas de panos",status:"EM USO",substitute:"Manter conforme uso específico"},
 {name:"Álcool líquido 70%",use:"Receita de panos multiuso e usos compatíveis",status:"EM USO",substitute:"Repor quando acabar"}
];
const CASA_INVENTORY_PRODUCTS=CASA_PRODUCT_CATALOG.map(x=>x.name);
const CASA_INVENTORY_TOOLS=["Aspirador","Vassouras e escovas","Pá de lixo","Mop/esfregão com balde","Rodos e limpadores de vidro/box","Panos de microfibra","Esponjas e escovas","Espanador de penas","Lavadora/secadora LG Direct Drive 11/6 kg","Secador de calçados","Mangueiras — 2 unidades","Lavadora de alta pressão/WAP","Ferramenta de cabo longo para telas/mosquiteiros","Pia grande da edícula","Recipientes organizadores","Escovas para vaso sanitário e refil","Panos de algodão/microfibra e flanela","Panos próprios para secadora","Panos multiuso úmidos"];


// BERTH.A v2.8.9 — Casa: procedimentos ligados ao inventário real da residência.
// Mantém o catálogo como fonte de verdade e evita instruções genéricas quando já existe produto/acessório cadastrado.
const CASA_REAL_PROCEDURE_KIT={
 coz1:{products:["Coala Chá Branco Limpador Perfumado","Tudo Limpinho Porcelanex — quando o piso for porcelanato"],materials:["Aspirador","Mop/esfregão com balde","Panos de microfibra"]},
 coz2:{products:["Qualitá Home Lava-Louças Líquido Coco","Cif Espuma Milagrosa — Derrete Gordura, quando necessário"],materials:["Esponjas e escovas","Panos de microfibra","Panos multiuso úmidos"]},
 coz3:{products:["Qualitá Home Lava-Louças Líquido Coco","Cif Espuma Milagrosa — Derrete Gordura, quando houver gordura"],materials:["Panos multiuso úmidos","Panos de microfibra","Esponjas e escovas"]},
 lim1:{products:[],materials:["Aspirador","Vassouras e escovas","Pá de lixo","Panos de microfibra"]},
 lim2:{products:["Coala Chá Branco Limpador Perfumado","Tudo Limpinho Tudax Limpeza Pesada — quando necessário"],materials:["Aspirador","Vassouras e escovas","Mop/esfregão com balde","Panos de microfibra"]},
 lim3:{products:["Coala Chá Branco Limpador Perfumado","Tudo Limpinho Porcelanex — nos pisos compatíveis"],materials:["Aspirador","Mop/esfregão com balde","Panos de microfibra"]},
 lim4:{products:["Tudo Limpinho Tudax Limpeza Pesada","Tudo Limpinho Limpador Clorado — somente em superfícies compatíveis","Tudo Limpinho Rejuntec","Tudo Limpinho Ultra Box","Tudo Limpinho Porcelanex","Tudo Limpinho Álcool Perfumado — Glamour de Shopping"],materials:["Aspirador","Vassouras e escovas","Pá de lixo","Mop/esfregão com balde","Panos de microfibra","Esponjas e escovas","Rodos e limpadores de vidro/box","Espanador de penas"]},
 roup1:{products:[],materials:["Recipientes organizadores"]},
 roup2:{products:["Sabão para roupas","Amaciante concentrado"],materials:["Lavadora/secadora LG Direct Drive 11/6 kg","Recipientes organizadores"]},
 roup3:{products:["Sabão adequado para roupas delicadas"],materials:["Lavadora/secadora LG Direct Drive 11/6 kg","Recipientes organizadores"]},
 roup4:{products:["Produto tira-manchas compatível com o tecido"],materials:["Esponjas e escovas","Panos de algodão/microfibra e flanela"]},
 roup5:{products:["Tudo Limpinho Finisher Fresh Bouquet — se compatível com o uso desejado"],materials:["Lavadora/secadora LG Direct Drive 11/6 kg","Panos próprios para secadora"]},
 roup6:{products:["Sabão para roupas","Amaciante concentrado","Vinagre de álcool — conforme a rotina registrada"],materials:["Lavadora/secadora LG Direct Drive 11/6 kg","Recipientes organizadores"]},
 roup7:{products:["Sabão para roupas","Amaciante concentrado"],materials:["Lavadora/secadora LG Direct Drive 11/6 kg","Recipientes organizadores"]},
 roup8:{products:["Água","Amaciante concentrado — na misturinha já registrada"],materials:["Panos de algodão/microfibra e flanela","Recipientes organizadores"]},
 roup9:{products:[],materials:["Recipientes organizadores"]},
 roup10:{products:["Coala Chá Branco Limpador Perfumado — somente em superfície compatível e bem diluído"],materials:["Panos de microfibra","Espanador de penas","Recipientes organizadores"]}
};
Object.entries(CASA_REAL_PROCEDURE_KIT).forEach(([id,kit])=>{if(CASA_HOW[id])Object.assign(CASA_HOW[id],kit)});

const CASA_MANUAL_REAL_KIT={
 "manual-coz-bancada":{products:["Cif Espuma Milagrosa — Derrete Gordura","Qualitá Home Lava-Louças Líquido Coco — para manutenção leve"],materials:["Panos multiuso úmidos","Panos de microfibra","Esponjas e escovas"]},
 "manual-coz-pia":{products:["Qualitá Home Lava-Louças Líquido Coco"],materials:["Esponjas e escovas","Panos de microfibra"]},
 "manual-coz-fogao":{products:["Cif Espuma Milagrosa — Derrete Gordura","Tudo Limpinho Flotalim Extra Forte — para gordura pesada e superfície compatível"],materials:["Panos de microfibra","Esponjas e escovas"]},
 "manual-coz-armarios":{products:["Cif Espuma Milagrosa — Derrete Gordura, se compatível","Coala Chá Branco Limpador Perfumado — para manutenção compatível"],materials:["Panos de microfibra","Panos multiuso úmidos"]},
 "manual-coz-piso":{products:["Coala Chá Branco Limpador Perfumado","Tudo Limpinho Porcelanex — se for porcelanato"],materials:["Aspirador","Vassouras e escovas","Mop/esfregão com balde"]},
 "manual-sala-poeira":{products:["GloDePeroba — Jasmine — apenas em móveis/superfícies indicadas"],materials:["Espanador de penas","Panos de microfibra","Panos multiuso úmidos"]},
 "manual-sala-sofa":{products:["HIKO Fabric Refresher — somente conforme rótulo, depois da limpeza"],materials:["Aspirador","Panos de microfibra"]},
 "manual-sala-esteira":{products:["Lysol — lenços desinfetantes — apenas em superfícies compatíveis"],materials:["Panos de microfibra"]},
 "manual-sala-livros":{products:[],materials:["Espanador de penas","Panos de algodão/microfibra e flanela"]},
 "manual-sala-porcelanato":{products:["Tudo Limpinho Porcelanex","Coala Chá Branco Limpador Perfumado — manutenção leve"],materials:["Aspirador","Vassouras e escovas","Mop/esfregão com balde"]},
 "manual-quarto-cama":{products:["HIKO Fabric Refresher — opcional, conforme rótulo"],materials:["Recipientes organizadores","Panos de microfibra"]},
 "manual-quarto-poeira":{products:["GloDePeroba — Jasmine — em móveis indicados"],materials:["Espanador de penas","Panos de microfibra"]},
 "manual-quarto-piso":{products:["Coala Chá Branco Limpador Perfumado","Tudo Limpinho Porcelanex — se compatível"],materials:["Aspirador","Vassouras e escovas","Mop/esfregão com balde"]},
 "manual-quarto-espelhos":{products:["Tudo Limpinho Álcool Perfumado — Glamour de Shopping — somente se compatível com vidro/espelho"],materials:["Rodos e limpadores de vidro/box","Panos de microfibra"]},
 "manual-banheiro-bancada":{products:["Aromasil Saponáceo Cremoso Cloro 3 em 1 — se compatível","Tudo Limpinho Ultra Clean — substituição futura compatível"],materials:["Esponjas e escovas","Panos de microfibra"]},
 "manual-banheiro-vaso":{products:["Ypê Tira Limo — Cloro Ativo em Gel","Tudo Limpinho Limpador Clorado — substituição futura, conforme rótulo"],materials:["Escovas para vaso sanitário e refil","Panos de microfibra"]},
 "manual-banheiro-box":{products:["UAU Blindex Box","Cif Espuma Milagrosa — Extermina Limo","Tudo Limpinho Ultra Box — substituição futura"],materials:["Rodos e limpadores de vidro/box","Esponjas e escovas","Panos de microfibra"]},
 "manual-banheiro-piso":{products:["Cif Espuma Milagrosa — Extermina Limo — em áreas compatíveis","Ypê Tira Limo — Cloro Ativo em Gel — quando necessário","Tudo Limpinho Rejuntec — para rejuntes","Tudo Limpinho Limpador Clorado — substituição futura compatível"],materials:["Vassouras e escovas","Mop/esfregão com balde","Esponjas e escovas"]},
 "manual-lav-maquina":{products:[],materials:["Lavadora/secadora LG Direct Drive 11/6 kg","Panos de microfibra"]},
 "manual-lav-tanque":{products:["Qualitá Home Lava-Louças Líquido Coco","Tudo Limpinho Ultra Clean — para sujeira aderida e superfície compatível"],materials:["Esponjas e escovas","Panos de microfibra"]},
 "manual-lav-panos":{products:["Sabão para roupas","Álcool líquido 70% — somente na receita específica dos panos multiuso","Amaciante concentrado — conforme receita/uso"],materials:["Lavadora/secadora LG Direct Drive 11/6 kg","Panos multiuso úmidos","Panos próprios para secadora"]},
 "manual-lav-organizacao":{products:[],materials:["Recipientes organizadores"]},
 "manual-calcados":{products:[],materials:["Vassouras e escovas","Panos de microfibra","Secador de calçados"]},
 "manual-calcados-piso":{products:["Coala Chá Branco Limpador Perfumado","Tudo Limpinho Porcelanex — se compatível"],materials:["Aspirador","Vassouras e escovas","Mop/esfregão com balde"]},
 "manual-rouparia-prateleiras":{products:["GloDePeroba — Jasmine — apenas em superfícies indicadas"],materials:["Espanador de penas","Panos de microfibra"]},
 "manual-rouparia-enxoval":{products:[],materials:["Recipientes organizadores"]},
 "manual-varanda-residuos":{products:["Tudo Limpinho Petklin — após recolher os resíduos, conforme rótulo"],materials:["Pá de lixo","Vassouras e escovas"]},
 "manual-varanda-poeira":{products:[],materials:["Vassouras e escovas","Pá de lixo","Aspirador"]},
 "manual-varanda-pedra":{products:["Tudo Limpinho Petklin — na área dos animais, conforme rótulo","Tudo Limpinho Tudax Limpeza Pesada — quando compatível"],materials:["Vassouras e escovas","Mangueiras — 2 unidades","Lavadora de alta pressão/WAP"]},
 "manual-varanda-moveis":{products:["GloDePeroba — Jasmine — em madeira compatível","Coala Chá Branco Limpador Perfumado — em superfícies laváveis compatíveis"],materials:["Panos de microfibra"]},
 "manual-garagem-piso":{products:["Tudo Limpinho Tudax Limpeza Pesada","Tudo Limpinho Querosene — Sabão Spray — apenas em sujeira compatível e conforme rótulo"],materials:["Vassouras e escovas","Mangueiras — 2 unidades","Lavadora de alta pressão/WAP"]},
 "manual-garagem-cantos":{products:["Tudo Limpinho Tudax Limpeza Pesada"],materials:["Vassouras e escovas","Mangueiras — 2 unidades"]},
 "manual-janelas-vidros":{products:["Tudo Limpinho Álcool Perfumado — Glamour de Shopping — se compatível"],materials:["Rodos e limpadores de vidro/box","Panos de microfibra"]},
 "manual-janelas-grades":{products:["Coala Chá Branco Limpador Perfumado — se compatível"],materials:["Vassouras e escovas","Panos de microfibra"]},
 "manual-janelas-telas":{products:[],materials:["Ferramenta de cabo longo para telas/mosquiteiros"]},
 "manual-jardim-folhas":{products:[],materials:["Vassouras e escovas","Pá de lixo"]},
 "manual-jardim-cimento":{products:["Tudo Limpinho Tudax Limpeza Pesada — quando necessário e compatível"],materials:["Vassouras e escovas","Mangueiras — 2 unidades","Lavadora de alta pressão/WAP"]},
 "manual-jardim-animais":{products:["Tudo Limpinho Petklin — após a retirada dos resíduos, conforme rótulo"],materials:["Pá de lixo","Vassouras e escovas"]},
 "manual-piscina-superficie":{products:[],materials:["Peneira/limpador de piscina"]},
 "manual-piscina-bordas":{products:["Produto próprio e compatível com a piscina — não substituir automaticamente por limpador doméstico"],materials:["Esponjas e escovas","Panos de microfibra"]},
 "manual-piscina-agua":{products:["Produtos próprios de tratamento da piscina — conforme rótulo"],materials:["Medidores próprios da piscina"]},
 "manual-edicula-escritorio":{products:[],materials:["Ferramentas apropriadas"]},
 "manual-edicula-escritorio-piso":{products:["Coala Chá Branco Limpador Perfumado","Tudo Limpinho Porcelanex — se compatível"],materials:["Espanador de penas","Aspirador","Vassouras e escovas","Mop/esfregão com balde"]},
 "manual-deposito-org":{products:[],materials:["Recipientes organizadores","Panos de microfibra","Vassouras e escovas"]},
 "manual-deposito-piso":{products:["Coala Chá Branco Limpador Perfumado","Tudo Limpinho Tudax Limpeza Pesada — quando necessário"],materials:["Aspirador","Vassouras e escovas","Mop/esfregão com balde"]},
 "manual-edicula-pia":{products:["Qualitá Home Lava-Louças Líquido Coco"],materials:["Esponjas e escovas","Panos de microfibra","Pia grande da edícula"]},
 "manual-edicula-varanda":{products:["Tudo Limpinho Tudax Limpeza Pesada — quando necessário","Tudo Limpinho Petklin — se usada pelos animais"],materials:["Vassouras e escovas","Mangueiras — 2 unidades","Lavadora de alta pressão/WAP"]},
 "manual-edicula-marcenaria":{products:[],materials:["Aspirador","Vassouras e escovas","Panos de microfibra"]}
};
CASA_MANUAL_PROCEDURES.forEach(proc=>{const kit=CASA_MANUAL_REAL_KIT[proc.id];if(kit)Object.assign(proc,kit)});

const CASA_WEB=[
 ["Dicas de limpeza","https://www.google.com/search?q=dicas+de+limpeza+da+casa"],
 ["Cuidados com roupas","https://www.google.com/search?q=dicas+cuidados+com+roupas+lavagem+secagem"],
 ["Organização da lavanderia","https://www.google.com/search?q=organizacao+da+lavanderia+dicas"],
 ["Jardim e áreas externas","https://www.google.com/search?q=dicas+cuidados+jardim+e+areas+externas"],
 ["Cuidados com gatos","https://www.google.com/search?q=dicas+cuidados+com+gatos+em+casa"],
 ["Organização da casa","https://www.google.com/search?q=dicas+organizacao+da+casa"]
];



function casaManualById(id){return CASA_MANUAL_PROCEDURES.find(x=>x.id===id)||null;}
function openCasaManual(id){
 const h=casaManualViewData(id)||casaManualById(id);if(!h)return;
 const o=document.createElement("div");o.className="mv-how-overlay casa-how-overlay";o.setAttribute('role','presentation');
 const products=(h.products&&h.products.length?h.products:["Nenhum produto específico."]);
 const productRows=products.map(x=>`<li><span>${escapeHtml(x)}</span><button type="button" class="casa-buy-mini" data-casa-buy="${escapeHtml(x)}">${casaBuyLabel(x)}</button></li>`).join("");
 const materialRows=(h.materials||[]).map(x=>`<li><span>${escapeHtml(x)}</span><button type="button" class="casa-buy-mini" data-casa-buy="${escapeHtml(x)}">${casaBuyLabel(x)}</button></li>`).join("");
 o.innerHTML=`<div class="mv-how casa-how-modal casa-manual-view" role="dialog" aria-modal="true" aria-label="Como fazer ${escapeHtml(h.title)}"><button class="mv-how-x casa-modal-x" type="button" aria-label="Fechar">×</button><div class="eyebrow">MANUAL DA CASA · ${escapeHtml(h.area)}</div><h2>${escapeHtml(h.title)}</h2>
 <div class="casa-how-top-actions"><button type="button" class="secondary casa-edit-procedure" id="editManualCasa"><span>Editar este procedimento</span></button></div>
 <div class="casa-how-meta"><span>${escapeHtml(h.time)}</span></div>
 <div class="casa-how-section"><h3><span>Produtos</span></h3><ul>${productRows}</ul></div>
 <div class="casa-how-section"><h3><span>Utensílios / materiais</span></h3><ul>${materialRows||'<li><span>Nenhum material específico.</span></li>'}</ul></div>
 <div class="casa-how-section"><h3><span>Passo a passo</span></h3><ol>${(h.steps||[]).map(x=>`<li>${escapeHtml(x)}</li>`).join("")}</ol></div>
 ${h.tip?`<div class="casa-how-tip"><strong><span>Dica</span></strong><p>${escapeHtml(h.tip)}</p></div>`:''}</div>`;
 document.body.appendChild(o);const close=()=>o.remove();o.querySelector('.casa-modal-x').onclick=close;o.addEventListener('click',e=>{if(e.target===o)close()});o.querySelector('#editManualCasa').onclick=()=>{close();openCasaManualEditor(id)};o.querySelectorAll('[data-casa-buy]').forEach(b=>bindCasaBuyButton(b,b.dataset.casaBuy,h.title));
}
function openCasaManualEditor(id){
 const h=casaManualById(id);if(!h)return;const custom=loadCasaHowCustom()[id]||{};const dlg=document.createElement("dialog");dlg.className="bertha-dialog casa-dialog";
 dlg.innerHTML=`<form method="dialog" class="modal-card casa-modal-card" id="manualCasaEdit"><div class="modal-head"><div><div class="eyebrow">MANUAL DA CASA</div><h2>Editar procedimento</h2></div><button class="icon-btn" value="cancel">×</button></div><label>Ambiente<input id="mhArea" value="${escapeHtml(custom.area||h.area)}"></label><label>Atividade<input id="mhTitle" value="${escapeHtml(custom.title||h.title)}"></label><label>Tempo<input id="mhTime" value="${escapeHtml(custom.time||h.time)}"></label><label>Produtos <small>um por linha</small><textarea id="mhProducts" rows="5">${escapeHtml((custom.products||h.products).join("\n"))}</textarea></label><label>Utensílios / materiais <small>um por linha</small><textarea id="mhMaterials" rows="5">${escapeHtml((custom.materials||h.materials).join("\n"))}</textarea></label><label>Passo a passo <small>um passo por linha</small><textarea id="mhSteps" rows="8">${escapeHtml((custom.steps||h.steps).join("\n"))}</textarea></label><label>Dica<textarea id="mhTip" rows="3">${escapeHtml(custom.tip||h.tip)}</textarea></label><div class="modal-actions"><div class="grow"></div><button type="button" class="secondary" id="cancelMh">Cancelar</button><button class="primary" value="default">Salvar alterações</button></div></form>`;
 document.body.appendChild(dlg);dlg.showModal();dlg.querySelector("#cancelMh").onclick=()=>{dlg.close();dlg.remove()};
 dlg.querySelector("#manualCasaEdit").addEventListener("submit",e=>{e.preventDefault();const all=loadCasaHowCustom();all[id]={area:dlg.querySelector("#mhArea").value.trim()||h.area,title:dlg.querySelector("#mhTitle").value.trim()||h.title,time:dlg.querySelector("#mhTime").value.trim()||h.time,products:casaHowList(dlg.querySelector("#mhProducts").value),materials:casaHowList(dlg.querySelector("#mhMaterials").value),steps:casaHowList(dlg.querySelector("#mhSteps").value),tip:dlg.querySelector("#mhTip").value.trim()||h.tip};saveCasaHowCustom(all);dlg.close();dlg.remove();openCasaManual(id)});
}
function casaManualViewData(id){const h=casaManualById(id),c=loadCasaHowCustom()[id]||{};return h?{...h,...c,products:Array.isArray(c.products)?c.products:h.products,materials:Array.isArray(c.materials)?c.materials:h.materials,steps:Array.isArray(c.steps)?c.steps:h.steps}:null;}
function renderCasaManual(){
 const groups={};CASA_MANUAL_PROCEDURES.forEach(x=>{(groups[x.area]||(groups[x.area]=[])).push(x)});
 return Object.entries(groups).map(([area,items])=>`<div class="card casa-manual-area"><div class="panel-head"><h3>${casaAreaIcon(area)}<span>${escapeHtml(area)}</span></h3><span class="pill">${items.length}</span></div><div class="casa-manual-list">${items.map(x=>{const h=casaManualViewData(x.id);return `<div class="casa-manual-row"><div><strong>${escapeHtml(h.title)}</strong><small>${escapeHtml(h.time)}</small></div><button type="button" class="home-how" data-casa-manual="${x.id}">Como fazer →</button></div>`}).join("")}</div></div>`).join("");
}
const CASA_RECIPES_KEY="minha-vida.casa.recipes.v2";
function normalizeCasaRecipe(r,idx=0){
 const base=(CASA_RECIPES&&CASA_RECIPES[idx])?CASA_RECIPES[idx]:{};
 const ingRaw=Array.isArray(r?.ingredients)?r.ingredients:Array.isArray(r?.ingredientes)?r.ingredientes:[];
 const ingredients=ingRaw.map((x,i)=>{if(Array.isArray(x))return [String(x[0]||"").trim(),String(x[1]||"").trim()];if(x&&typeof x==="object")return [String(x.name||x.nome||x.item||"").trim(),String(x.qty||x.quantidade||x.amount||"").trim()];const t=String(x||"").trim();if(!t)return null;const parts=t.split(/\s*[|—–-]\s*/,2);return [parts[0]||t,parts[1]||""]}).filter(x=>x&&x[0]);
 const arr=v=>Array.isArray(v)?v.filter(Boolean).map(x=>String(x).trim()).filter(Boolean):typeof v==="string"?v.split(/\n|;/).map(x=>x.trim()).filter(Boolean):[];
 return {id:r?.id||base.id||`recipe-${Date.now()}-${idx}`,title:String(r?.title||r?.name||base.title||"Receita da casa"),time:String(r?.time||r?.tempo||base.time||""),yieldText:String(r?.yieldText||r?.yield||r?.rendimento||base.yieldText||""),ingredients:ingredients.length?ingredients:(Array.isArray(base.ingredients)?base.ingredients:[]),materials:arr(r?.materials||r?.utensilios||r?.utensils).length?arr(r?.materials||r?.utensilios||r?.utensils):arr(base.materials),steps:arr(r?.steps||r?.preparo||r?.modoPreparo).length?arr(r?.steps||r?.preparo||r?.modoPreparo):arr(base.steps),tip:String(r?.tip||r?.note||r?.observacao||base.tip||"")};
}
function loadCasaRecipes(){
 try{const x=JSON.parse(localStorage.getItem(CASA_RECIPES_KEY)||"null");if(Array.isArray(x))return x.filter(Boolean).map(normalizeCasaRecipe);}catch{}
 return JSON.parse(JSON.stringify(CASA_RECIPES)).map(normalizeCasaRecipe);
}
function saveCasaRecipes(x){localStorage.setItem(CASA_RECIPES_KEY,JSON.stringify(x))}
function renderCasaRecipes(){
 const recipes=loadCasaRecipes();
 return `<button type="button" class="secondary casa-inline-add" id="addCasaRecipe">＋ Nova receita da casa</button>`+recipes.map(r=>`<div class="card casa-recipe"><div class="panel-head"><h3>${casaLineIcon('pot')}<span>${escapeHtml(r.title)}</span></h3><div class="casa-recipe-head-actions"><span class="pill">${escapeHtml(r.time||"")}</span><button type="button" class="casa-recipe-edit" data-recipe-edit="${r.id}">Editar</button></div></div><p class="note">Rendimento: ${escapeHtml(r.yieldText||"—")}</p><h4>Ingredientes</h4><ul>${(r.ingredients||[]).map(([n,q])=>`<li><span>${escapeHtml(n)} — <b>${escapeHtml(q||"")}</b></span><button type="button" class="casa-buy-mini" data-recipe-buy="${escapeHtml(n)}">${casaBuyLabel(n)}</button></li>`).join("")}</ul>${(r.materials||[]).length?`<h4>Utensílios / materiais</h4><ul>${r.materials.map(x=>`<li><span>${escapeHtml(x)}</span></li>`).join("")}</ul>`:""}<h4>Preparo</h4><ol>${(r.steps||[]).map(x=>`<li>${escapeHtml(x)}</li>`).join("")}</ol><div class="casa-how-tip"><strong>Observação</strong><p>${escapeHtml(r.tip||"")}</p></div></div>`).join("");
}
function openCasaRecipeEditor(id){
 const recipes=loadCasaRecipes(),r=id?recipes.find(x=>String(x.id)===String(id)):null;
 const base=r||{id:`recipe-${Date.now()}`,title:"",time:"5 min",yieldText:"",ingredients:[],materials:[],steps:[],tip:""};
 const dlg=document.createElement("dialog");dlg.className="study-v10-dialog casa-dialog";
 dlg.innerHTML=`<form class="study-v10-modal casa-modal-card" id="casaRecipeForm"><div class="study-v10-head"><div><div class="eyebrow">CASA · RECEITAS</div><h2>${r?"Editar receita":"Nova receita"}</h2><p>Ingredientes, quantidades e preparo ficam editáveis.</p></div><button type="button" class="study-v10-x" data-close>×</button></div>
 ${field("Nome",`<input id="crTitle" required value="${escapeHtml(base.title)}">`)}
 <div class="form-grid">${field("Tempo",`<input id="crTime" value="${escapeHtml(base.time||"")}">`)}${field("Rendimento",`<input id="crYield" value="${escapeHtml(base.yieldText||"")}">`)}</div>
 ${field("Ingredientes · um por linha: ingrediente | quantidade",`<textarea id="crIngredients" rows="7">${escapeHtml((base.ingredients||[]).map(x=>`${x[0]} | ${x[1]||""}`).join("\n"))}</textarea>`)}
 ${field("Utensílios / materiais · um por linha",`<textarea id="crMaterials" rows="4">${escapeHtml((base.materials||[]).join("\n"))}</textarea>`)}
 ${field("Preparo · um passo por linha",`<textarea id="crSteps" rows="7">${escapeHtml((base.steps||[]).join("\n"))}</textarea>`)}
 ${field("Observação / dica",`<textarea id="crTip" rows="3">${escapeHtml(base.tip||"")}</textarea>`)}
 <div class="study-v10-actions">${r?'<button type="button" class="danger" id="deleteCasaRecipe">Excluir</button>':''}<button type="button" class="secondary" data-close>Cancelar</button><button class="primary" type="submit">Salvar</button></div></form>`;
 document.body.appendChild(dlg);const close=()=>dlg.close();dlg.querySelectorAll('[data-close]').forEach(b=>b.onclick=close);dlg.addEventListener('click',e=>{if(e.target===dlg)close()});dlg.onclose=()=>dlg.remove();
 dlg.querySelector('#deleteCasaRecipe')?.addEventListener('click',()=>{if(!confirm(`Excluir “${base.title}”?`))return;saveCasaRecipes(recipes.filter(x=>String(x.id)!==String(base.id)));close();renderCasa()});
 dlg.querySelector('#casaRecipeForm').addEventListener('submit',e=>{e.preventDefault();const ing=casaHowList(dlg.querySelector('#crIngredients').value).map(line=>{const [a,...rest]=line.split('|');return[(a||'').trim(),rest.join('|').trim()]});const obj={...base,title:dlg.querySelector('#crTitle').value.trim(),time:dlg.querySelector('#crTime').value.trim(),yieldText:dlg.querySelector('#crYield').value.trim(),ingredients:ing,materials:casaHowList(dlg.querySelector('#crMaterials').value),steps:casaHowList(dlg.querySelector('#crSteps').value),tip:dlg.querySelector('#crTip').value.trim()};saveCasaRecipes(r?recipes.map(x=>String(x.id)===String(base.id)?obj:x):[...recipes,obj]);close();renderCasa()});
 dlg.showModal();
}
function openCasaSubstituteInfo(name){const x=CASA_PRODUCT_CATALOG.find(p=>String(p.name)===String(name));if(!x)return;const dlg=document.createElement("dialog");dlg.className="bertha-dialog casa-dialog";dlg.innerHTML=`<div class="modal-card casa-modal-card"><div class="modal-head"><div><div class="eyebrow">INVENTÁRIO DA CASA</div><h2>${escapeHtml(x.name)}</h2></div><button type="button" class="icon-btn" data-close>×</button></div><div class="casa-substitute-info"><p><strong>Status:</strong> ${escapeHtml(x.status)}</p><p>${escapeHtml(x.use)}</p><p><strong>Regra de substituição:</strong> ${escapeHtml(x.substitute)}</p></div><div class="modal-actions casa-substitute-actions"><button type="button" class="secondary" data-close>Fechar</button><button type="button" class="primary" id="substituteShopping">${casaBuyLabel(x.name)}</button></div></div>`;document.body.appendChild(dlg);dlg.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>dlg.close());dlg.addEventListener('close',()=>dlg.remove());const buy=dlg.querySelector('#substituteShopping');bindCasaBuyButton(buy,x.name,'Inventário da Casa');dlg.showModal()}
function renderCasaInventory(){return `<div class="card casa-inventory"><div class="panel-head"><div><h3>Produtos que você tem</h3><p class="note">Os produtos atuais permanecem em uso até acabarem. Quando precisar repor, envie direto para a Lista de Compras universal.</p></div><span class="pill">${CASA_PRODUCT_CATALOG.length}</span></div><div class="casa-product-list">${CASA_PRODUCT_CATALOG.map(x=>`<div class="casa-product-row"><div><strong>${escapeHtml(x.name)}</strong><small>${escapeHtml(x.use)}</small><small>Substituição: ${escapeHtml(x.substitute)}</small></div><div><button type="button" class="casa-substitute-btn" data-substitute-info="${escapeHtml(x.name)}">${escapeHtml(x.status)}</button><button type="button" class="casa-buy-mini" data-inventory-buy="${escapeHtml(x.name)}">${casaBuyLabel(x.name)}</button></div></div>`).join("")}</div><div class="panel-head inventory-tools-head"><h3>Utensílios e equipamentos</h3><span class="pill">${CASA_INVENTORY_TOOLS.length}</span></div><div class="chip-list">${CASA_INVENTORY_TOOLS.map(x=>`<span class="pill">${escapeHtml(x)}</span>`).join("")}</div></div>`;}

const CASA_DURATION_KEY="minha-vida.casa.duration.v1";
const CASA_DURATION={coz1:10,coz2:10,coz3:5,coz4:10,coz5:5,lim1:20,lim2:15,lim3:15,lim4:75,roup1:10,roup2:45,roup3:30,roup4:10,roup5:10,roup6:60,roup7:60,roup8:35,roup9:20,roup10:20,ani1:10,ani2:10,hen1:5,hen2:10,hen3:5,hen4:10,hen5:20};
function loadCasaDurations(){try{return {...CASA_DURATION,...JSON.parse(localStorage.getItem(CASA_DURATION_KEY)||"{}")}}catch{return {...CASA_DURATION}}}
function saveCasaDurations(x){localStorage.setItem(CASA_DURATION_KEY,JSON.stringify(x))}
function casaDuration(id){return `${loadCasaDurations()[id]||15} min`}
function casaLocalDay(ts=Date.now()){const d=new Date(ts),p=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`}
function casaFreqText(freq){return String(freq||'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
function casaNextRoutineDate(freq,from=Date.now()){
 const f=casaFreqText(freq),d=new Date(from);d.setHours(12,0,0,0);
 let days=0,months=0;
 if(!f) return '';
 if(f.includes('diario'))days=1;
 else {const m=f.match(/a cada\s+(\d+)\s+dias?/);if(m)days=Math.max(1,+m[1]);}
 if(!days&&f.includes('semanal')&&!f.includes('quinzenal'))days=7;
 if(!days&&f.includes('quinzenal'))days=14;
 if(f.includes('mensal'))months=1;
 if(days)d.setDate(d.getDate()+days);else if(months)d.setMonth(d.getMonth()+months);else return '';
 return casaLocalDay(d.getTime());
}
function casaRoutineIsCyclic(task){return !['unica','única'].includes(casaFreqText(task?.freq))}
function casaRefreshRoutineCycles(d){
 const today=casaLocalDay();let changed=false;
 (d.areas||[]).forEach(a=>(a.tasks||[]).forEach(t=>{
   if(!casaRoutineIsCyclic(t))return;
   if(t.done){
     const fixed=t.nextDue||casaNextRoutineDate(t.freq,t.completedAt||t.lastCompletedAt||Date.now());
     if(fixed&&!t.nextDue){t.nextDue=fixed;changed=true;}
     const due=fixed?today>=fixed:(t.completedAt?casaLocalDay(t.completedAt)!==today:true);
     if(due){t.done=false;delete t.completedAt;changed=true;}
   }
 }));
 return changed;
}
function casaRecordProgress(hit,end,minutes){
 try{const key='bertha.time-engine.v1',e=JSON.parse(localStorage.getItem(key)||'{"active":null,"history":[],"snoozed":{}}');e.history=Array.isArray(e.history)?e.history:[];const itemId=`casa:routine:${hit.task.id}`;if(!e.history.some(h=>h.itemId===itemId&&h.status==='done'&&Math.abs((+h.endedAt||0)-end)<1500)){e.history.unshift({itemId,learningKey:itemId,title:hit.task.name,source:'Casa',day:casaLocalDay(end),startedAt:end,endedAt:end,configuredMinutes:minutes,plannedMinutes:minutes,realMinutes:minutes,status:'done',category:hit.area.title});localStorage.setItem(key,JSON.stringify(e));}}catch{}
}
function casaRemoveLatestProgress(id){
 try{const key='bertha.time-engine.v1',e=JSON.parse(localStorage.getItem(key)||'{"active":null,"history":[],"snoozed":{}}'),itemId=`casa:routine:${id}`;const i=(e.history||[]).findIndex(h=>h.itemId===itemId&&h.status==='done');if(i>=0){e.history.splice(i,1);localStorage.setItem(key,JSON.stringify(e));}}catch{}
}
function openCasaTaskEditor(id){
 const d=loadCasa(),task=d.areas.flatMap(a=>a.tasks).find(t=>t.id===id);if(!task)return;const ds=loadCasaDurations(),dlg=document.createElement('dialog');dlg.className='bertha-dialog casa-dialog';
 dlg.innerHTML=`<form method="dialog" class="modal-card casa-modal-card" id="casaTaskEdit"><div class="modal-head"><div><div class="eyebrow">CASA</div><h2>Editar rotina</h2></div><button class="icon-btn casa-modal-x" value="cancel" aria-label="Fechar">×</button></div><label>Atividade<input id="ctName" value="${escapeHtml(task.name)}"></label><label>Duração real estimada (min)<input id="ctMin" type="number" min="5" max="480" step="5" value="${ds[id]||15}"></label><label>Horário / janela preferencial<input id="ctTime" value="${escapeHtml(casaTime(id))}"></label><label>Frequência<input id="ctFreq" value="${escapeHtml(task.freq)}"></label><div class="modal-actions"><div class="grow"></div><button type="button" class="secondary" id="cancelCt">Cancelar</button><button class="primary" value="default">Salvar</button></div></form>`;document.body.appendChild(dlg);dlg.showModal();dlg.querySelector('#cancelCt').onclick=()=>{dlg.close();dlg.remove()};dlg.querySelector('#casaTaskEdit').addEventListener('submit',e=>{e.preventDefault();task.name=dlg.querySelector('#ctName').value.trim()||task.name;task.freq=dlg.querySelector('#ctFreq').value.trim()||task.freq;ds[id]=Math.max(5,+dlg.querySelector('#ctMin').value||ds[id]||15);const times=loadCasaTimes();times[id]=dlg.querySelector('#ctTime').value.trim()||times[id];saveCasa(d);saveCasaDurations(ds);saveCasaTimes(times);dlg.close();dlg.remove();renderCasa()});
}

function loadCasa(){
 try{
  const raw=JSON.parse(localStorage.getItem(CASA_KEY)||"null");
  const base=JSON.parse(JSON.stringify(CASA_BASE));
  if(!raw||typeof raw!=="object")return base;
  const d={...base,...raw};
  // Compatibilidade com versões antigas da Casa: nunca deixar um schema parcial
  // derrubar a tela inteira.
  d.areas=Array.isArray(raw.areas)?raw.areas:base.areas;
  d.areas=d.areas.filter(Boolean).map((a,i)=>({
    ...(base.areas[i]||{}),...a,
    id:a?.id||(base.areas[i]?.id)||`area-${i}`,
    title:a?.title||(base.areas[i]?.title)||"Casa",
    tasks:(Array.isArray(a?.tasks)?a.tasks:[]).filter(Boolean).map((t,j)=>({
      id:String(t?.id ?? `task-${i}-${j}`),
      name:String(t?.name ?? t?.title ?? "Rotina da casa"),
      freq:String(t?.freq ?? t?.frequency ?? "conforme necessário"),
      when:String(t?.when ?? t?.period ?? "horário a definir"),
      done:!!t?.done,
      ...(t&&typeof t==="object"?t:{}),
      // reaplica os campos críticos já normalizados para impedir schemas antigos
      // de sobrescrevê-los com null/número/estrutura incompatível
      id:String(t?.id ?? `task-${i}-${j}`),
      name:String(t?.name ?? t?.title ?? "Rotina da casa"),
      freq:String(t?.freq ?? t?.frequency ?? "conforme necessário"),
      when:String(t?.when ?? t?.period ?? "horário a definir"),
      done:!!t?.done
    }))
  }));
  d.maintenance=Array.isArray(raw.maintenance)?raw.maintenance:[];
  if(casaRefreshRoutineCycles(d)) saveCasa(d);
  return d;
 }catch(e){console.warn("Casa: dados antigos ignorados",e);return JSON.parse(JSON.stringify(CASA_BASE));}
}
function saveCasa(d){localStorage.setItem(CASA_KEY,JSON.stringify(d));}
const CASA_HOW_CUSTOM_KEY="minha-vida.casa.how.v1";
function loadCasaHowCustom(){
  try{
    const x=JSON.parse(localStorage.getItem(CASA_HOW_CUSTOM_KEY)||"{}");
    return x&&typeof x==="object"&&!Array.isArray(x)?x:{};
  }catch{return {}}
}
function saveCasaHowCustom(x){
  localStorage.setItem(CASA_HOW_CUSTOM_KEY,JSON.stringify(x&&typeof x==="object"&&!Array.isArray(x)?x:{}));
}
function casaHowData(id){
  const base=CASA_HOW[id];
  if(!base)return null;
  const custom=loadCasaHowCustom()[id]||{};
  return {
    ...base,
    ...custom,
    products:Array.isArray(custom.products)?custom.products:(Array.isArray(base.products)?base.products:[]),
    materials:Array.isArray(custom.materials)?custom.materials:(Array.isArray(base.materials)?base.materials:[]),
    steps:Array.isArray(custom.steps)?custom.steps:(Array.isArray(base.steps)?base.steps:[])
  };
}
const CASA_SHOP_KEY="minha-vida.compras.casa.v1";
const SHARED_SHOP_KEY="minha-vida.compras.v1";
function loadSharedShopping(){try{const x=JSON.parse(localStorage.getItem(SHARED_SHOP_KEY)||"[]");return Array.isArray(x)?x.filter(Boolean).map((i,idx)=>({id:i?.id||`shop-${Date.now()}-${idx}`,name:String(i?.name||i?.title||i?.item||"").trim(),source:i?.source||"Compras",category:i?.category||"Casa",cycle:i?.cycle||"monthly",createdAt:i?.createdAt||Date.now(),done:!!i?.done,qty:i?.qty??"",unit:i?.unit||"",expectedValue:i?.expectedValue??"",actualValue:i?.actualValue??"",purchasedAt:i?.purchasedAt||null,...i})).filter(i=>i.name):[]}catch{return []}}
function saveSharedShopping(x){localStorage.setItem(SHARED_SHOP_KEY,JSON.stringify(x))}
function migrateCasaShopping(){let legacy=[];try{legacy=JSON.parse(localStorage.getItem(CASA_SHOP_KEY)||"[]")||[]}catch{}const shared=loadSharedShopping();let changed=false;legacy.forEach(x=>{if(!shared.some(y=>String(y.name).toLowerCase()===String(x.name).toLowerCase())){shared.push({...x,category:"Casa",cycle:"monthly"});changed=true}});if(changed)saveSharedShopping(shared)}
function loadCasaShopping(){migrateCasaShopping();return loadSharedShopping().filter(x=>(x.category||"Casa")==="Casa")}
function saveCasaShopping(items){const other=loadSharedShopping().filter(x=>(x.category||"Casa")!=="Casa");saveSharedShopping([...other,...items])}
function refreshCasaShoppingUI(){const host=document.querySelector('.casa-shopping-card');if(host){host.innerHTML=`<p class="note">Produtos e utensílios enviados pelos procedimentos aparecem aqui e também em <b>Compras do mês</b>.</p>${renderCasaShoppingMini()}`;bindCasaShoppingMini()}const meta=document.querySelector('#casa-sec-compras summary .casa-section-meta > span:first-child');if(meta)meta.textContent=`${loadCasaShopping().filter(x=>!x.done).length} pendentes`}
function addCasaShopping(name,source){name=(name||"").trim();if(!name)return false;const items=loadSharedShopping();if(!items.some(x=>String(x.name).toLowerCase()===name.toLowerCase()&&!x.done)){items.push({id:uid(),name,source:source||"Casa",category:"Casa",cycle:"monthly",createdAt:Date.now(),done:false});saveSharedShopping(items)}refreshCasaShoppingUI();return true}
function removeCasaShopping(id){saveSharedShopping(loadSharedShopping().filter(x=>String(x.id)!==String(id)));refreshCasaShoppingUI()}
function casaPendingShopping(name){name=String(name||"").trim().toLocaleLowerCase("pt-BR");return loadSharedShopping().find(x=>!x.done&&String(x.name||"").trim().toLocaleLowerCase("pt-BR")===name&&(x.category||"Casa")==="Casa")||null}
function casaBuyLabel(name){return casaPendingShopping(name)?"✓ na lista":"＋ compras"}
function toggleCasaShopping(name,source){const pending=casaPendingShopping(name);if(pending){removeCasaShopping(pending.id);return false}addCasaShopping(name,source);return true}
function syncCasaBuyButton(b,name){const active=!!casaPendingShopping(name);b.textContent=active?"✓ na lista":"＋ compras";b.classList.toggle("is-in-list",active);b.setAttribute("aria-pressed",String(active));b.disabled=false}
function bindCasaBuyButton(b,name,source){syncCasaBuyButton(b,name);b.onclick=()=>{toggleCasaShopping(name,source);syncCasaBuyButton(b,name)}}
function bindCasaShoppingMini(){document.querySelectorAll("[data-casa-shop-done]").forEach(b=>b.onchange=()=>{const all=loadSharedShopping(),x=all.find(i=>String(i.id)===String(b.dataset.casaShopDone));if(x)x.done=b.checked;saveSharedShopping(all);refreshCasaShoppingUI()});document.querySelectorAll("[data-casa-shop-del]").forEach(b=>b.onclick=()=>removeCasaShopping(b.dataset.casaShopDel))}
function casaHowList(text){return String(text||"").split(/\n|;/).map(x=>x.trim()).filter(Boolean)}
function openCasaHowEditor(id){
 const h=casaHowData(id);if(!h)return;
 const dlg=document.createElement("dialog");dlg.className="study-v10-dialog casa-dialog";
 dlg.innerHTML=`<form class="study-v10-modal casa-modal-card" id="casaHowEdit"><div class="study-v10-head"><div><div class="eyebrow">CASA</div><h2>Editar como fazer</h2><p>Produtos, utensílios e passo a passo.</p></div><button type="button" class="study-v10-x" data-close>×</button></div>
 ${field("Nome",`<input id="chTitle" value="${escapeHtml(h.title)}">`)}
 ${field("Tempo estimado",`<input id="chTime" value="${escapeHtml(h.time)}">`)}
 ${field("Produtos · um por linha",`<textarea id="chProducts" rows="5">${escapeHtml((h.products||[]).join("\n"))}</textarea>`)}
 ${field("Utensílios / materiais · um por linha",`<textarea id="chMaterials" rows="5">${escapeHtml((h.materials||[]).join("\n"))}</textarea>`)}
 ${field("Passo a passo · um passo por linha",`<textarea id="chSteps" rows="8">${escapeHtml((h.steps||[]).join("\n"))}</textarea>`)}
 ${field("Dica",`<textarea id="chTip" rows="3">${escapeHtml(h.tip||"")}</textarea>`)}
 <div class="study-v10-actions"><button type="button" class="secondary" data-close>Cancelar</button><button class="primary" type="submit">Salvar alterações</button></div></form>`;
 document.body.appendChild(dlg);const close=()=>dlg.close();dlg.querySelectorAll('[data-close]').forEach(b=>b.onclick=close);dlg.addEventListener('click',e=>{if(e.target===dlg)close()});dlg.onclose=()=>dlg.remove();
 dlg.querySelector("#casaHowEdit").addEventListener("submit",e=>{e.preventDefault();const all=loadCasaHowCustom();all[id]={title:dlg.querySelector("#chTitle").value.trim()||h.title,time:dlg.querySelector("#chTime").value.trim()||h.time,products:casaHowList(dlg.querySelector("#chProducts").value),materials:casaHowList(dlg.querySelector("#chMaterials").value),steps:casaHowList(dlg.querySelector("#chSteps").value),tip:dlg.querySelector("#chTip").value.trim()||h.tip};saveCasaHowCustom(all);close();openCasaHow(id)});
 dlg.showModal();
}
function openCasaHow(id){
 const h=casaHowData(id);if(!h)return;
 const o=document.createElement("div");o.className="mv-how-overlay casa-how-overlay";o.setAttribute('role','presentation');
 const productRows=(h.products.length?h.products:["Nenhum produto específico — siga a orientação da etiqueta ou da superfície."]).map(x=>`<li><span>${escapeHtml(x)}</span><button type="button" class="casa-buy-mini" data-casa-buy="${escapeHtml(x)}">${casaBuyLabel(x)}</button></li>`).join("");
 const materialRows=(h.materials||[]).map(x=>`<li><span>${escapeHtml(x)}</span><button type="button" class="casa-buy-mini" data-casa-buy="${escapeHtml(x)}">${casaBuyLabel(x)}</button></li>`).join("");
 o.innerHTML=`<div class="mv-how casa-how-modal" role="dialog" aria-modal="true" aria-label="Como fazer ${escapeHtml(h.title)}"><button class="mv-how-x casa-modal-x" type="button" aria-label="Fechar">×</button><div class="eyebrow">COMO FAZER</div><h2>${escapeHtml(h.title)}</h2>
 <div class="casa-how-meta"><span>${casaLineIcon('clock')} ${escapeHtml(h.time)}</span></div>
 <div class="casa-how-section"><h3>Produtos</h3><ul>${productRows}</ul></div>
 <div class="casa-how-section"><h3>Utensílios / materiais</h3><ul>${materialRows||'<li><span>Nenhum material específico.</span></li>'}</ul></div>
 <div class="casa-how-section"><h3>Passo a passo</h3><ol>${(h.steps||[]).map(x=>`<li>${escapeHtml(x)}</li>`).join("")}</ol></div>
 ${h.tip?`<div class="casa-how-tip"><strong>Dica</strong><p>${escapeHtml(h.tip)}</p></div>`:''}
 <div class="casa-how-footer"><button type="button" class="secondary casa-edit-procedure" id="editCasaHow">Editar procedimento</button></div></div>`;
 document.body.appendChild(o);
 const close=()=>o.remove();
 o.querySelector('.casa-modal-x').onclick=close;
 o.addEventListener('click',e=>{if(e.target===o)close()});
 o.querySelector("#editCasaHow").onclick=()=>{close();openCasaHowEditor(id)};
 o.querySelectorAll("[data-casa-buy]").forEach(b=>bindCasaBuyButton(b,b.dataset.casaBuy,h.title));
}

function renderCasaShoppingMini(){
 const items=loadCasaShopping();
 if(!items.length)return `<div class="empty compact"><strong>Nenhum item da casa na lista.</strong><span>Quando algum produto ou utensílio estiver acabando, você pode enviá-lo daqui.</span></div>`;
 return `<div class="casa-mini-shopping">${items.map(x=>`<div class="casa-mini-shop-row ${x.done?'done':''}"><label><input type="checkbox" data-casa-shop-done="${x.id}" ${x.done?'checked':''}><span>${escapeHtml(x.name)}</span></label><button type="button" class="more" data-casa-shop-del="${x.id}">×</button></div>`).join("")}<a class="food-big-link blue" href="#alimentacao">🛒 Abrir Compras do mês</a></div>`;
}

const CASA_EXEC_KEY="minha-vida.casa.executions.v1";
function loadCasaExecutions(){try{return JSON.parse(localStorage.getItem(CASA_EXEC_KEY)||"[]")}catch{return[]}}
function saveCasaExecutions(x){localStorage.setItem(CASA_EXEC_KEY,JSON.stringify(x))}
function casaTaskById(id,d=loadCasa()){for(const a of d.areas){const t=a.tasks.find(x=>String(x.id)===String(id));if(t)return {task:t,area:a}}return null}
function casaStartRoutine(id){const hit=casaTaskById(id);if(!hit)return;const minutes=+loadCasaDurations()[id]||15;startViaBertha({id:`casa:routine:${id}`,learningKey:`casa:routine:${id}`,source:"Casa",title:hit.task.name,minutes,configuredMinutes:minutes,period:"flex",time:casaTime(id),kind:"home"})}
function casaFinishRoutine(id){const d=loadCasa(),hit=casaTaskById(id,d);if(!hit)return;const active=window.BerthaTimeEngine?.active?.();if(active&&String(active.id)===`casa:routine:${id}`){window.BerthaTimeEngine.finish();return;}const end=Date.now(),minutes=+loadCasaDurations()[id]||15;hit.task.done=true;hit.task.completedAt=end;hit.task.lastCompletedAt=end;hit.task.nextDue=casaNextRoutineDate(hit.task.freq,end);const ex=loadCasaExecutions();ex.push({id:uid(),kind:"routine",refId:id,title:hit.task.name,area:hit.area.title,completedAt:end,nextDue:hit.task.nextDue||null,frequency:hit.task.freq||"cíclica"});saveCasaExecutions(ex);casaRecordProgress(hit,end,minutes);saveCasa(d);renderCasa()}
function casaReopenRoutine(id){const d=loadCasa(),hit=casaTaskById(id,d);if(!hit)return;hit.task.done=false;delete hit.task.completedAt;delete hit.task.nextDue;casaRemoveLatestProgress(id);saveCasa(d);renderCasa()}
function maintenanceMinutes(m){const v=Math.max(1,+m.durationValue||30);return m.durationUnit==="hours"?v*60:v}
function casaStartMaintenance(id){const d=loadCasa(),m=d.maintenance.find(x=>String(x.id)===String(id));if(!m)return;const minutes=maintenanceMinutes(m);startViaBertha({id:`casa:maintenance:${id}`,learningKey:`casa:maintenance:${m.name.toLowerCase()}`,source:"Casa · Manutenção",title:m.name,minutes,configuredMinutes:minutes,date:m.date||"",period:m.period||"flex",time:m.time||"",priority:m.priority||"normal",kind:"home-maintenance"})}
function nextMaintenanceDate(date,freq){if(!date||!freq||freq==="Única"||freq==="Conforme necessário")return date||"";const d=new Date(date+"T12:00:00");if(Number.isNaN(d.getTime()))return date;if(freq==="Diária")d.setDate(d.getDate()+1);if(freq==="Semanal")d.setDate(d.getDate()+7);if(freq==="Quinzenal")d.setDate(d.getDate()+14);if(freq==="Mensal")d.setMonth(d.getMonth()+1);return d.toISOString().slice(0,10)}
function casaFinishMaintenance(id){const d=loadCasa(),m=d.maintenance.find(x=>String(x.id)===String(id));if(!m)return;const active=window.BerthaTimeEngine?.active?.();if(active&&String(active.id)===`casa:maintenance:${id}`){window.BerthaTimeEngine.finish();return;}const end=Date.now(),minutes=maintenanceMinutes(m);m.lastCompletedAt=end;const ex=loadCasaExecutions();ex.push({id:uid(),kind:"maintenance",refId:id,title:m.name,area:m.area||"Casa",completedAt:end});saveCasaExecutions(ex);try{const key='bertha.time-engine.v1',e=JSON.parse(localStorage.getItem(key)||'{"active":null,"history":[],"snoozed":{}}');e.history=Array.isArray(e.history)?e.history:[];const itemId=`casa:maintenance:${id}`;if(!e.history.some(h=>h.itemId===itemId&&h.status==='done'&&Math.abs((+h.endedAt||0)-end)<1500)){e.history.unshift({itemId,learningKey:itemId,title:m.name,source:'Casa · Manutenção',day:casaLocalDay(end),startedAt:end,endedAt:end,configuredMinutes:minutes,plannedMinutes:minutes,realMinutes:minutes,status:'done',category:m.area||'Casa'});localStorage.setItem(key,JSON.stringify(e));}}catch{}if(m.frequency&&!['Única','Conforme necessário'].includes(m.frequency)){m.date=nextMaintenanceDate(m.date,m.frequency);m.status="a_fazer"}else m.status="concluida";saveCasa(d);renderCasa()}
function casaLineIcon(name){
 const p={
  routines:'<path d="M5 7h14M5 12h14M5 17h14"/><path d="M3 7h.01M3 12h.01M3 17h.01"/>',
  toolbox:'<path d="M5 8h14v11H5z"/><path d="M9 8V5h6v3M5 12h14M12 12v2"/>',
  manual:'<path d="M5 4h10a3 3 0 0 1 3 3v13H7a2 2 0 0 1-2-2V4z"/><path d="M7 16h11M9 8h6M9 12h6"/>',
  pot:'<path d="M6 10h12v8H6zM5 10h14M9 7h6M12 5v2M18 12h2"/>',
  spray:'<path d="M9 8h7l-1-3h-5zM11 8v3M8 11h7v9H8z"/><path d="M16 6h3M18 5v2"/>',
  clock:'<circle cx="12" cy="12" r="8"/><path d="M12 8v5l3 2"/>',
  info:'<path d="M5 7h14M5 12h10M5 17h12"/>',
  edit:'<path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/>',
  basket:'<path d="M5 9h14l-2 10H7zM8 9l4-5 4 5M9 12v4M12 12v4M15 12v4"/>'
 };
 return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round">${p[name]||p.routines}</svg>`;
}
function casaAreaIcon(title){
 const t=String(title||'').toLowerCase();
 const path=t.includes('limpeza')?'<path d="M10 4h5l1.5 3H19v2h-4l-1 2H9v9H6V10h2l2-2z"/><path d="M15 7h4M18 5v4"/>':
  t.includes('roup')||t.includes('lavander')?'<rect x="5" y="4" width="14" height="16" rx="2"/><circle cx="12" cy="13" r="4"/><path d="M8 8h.01M11 8h.01"/>':
  t.includes('animal')?'<path d="M8 11c-2 0-3 1.5-3 3s1.5 3 3.5 3c1.5 0 2.5-.7 3.5-1.8 1 1.1 2 1.8 3.5 1.8 2 0 3.5-1.5 3.5-3s-1-3-3-3"/><circle cx="8" cy="7" r="1.5"/><circle cx="12" cy="5.5" r="1.5"/><circle cx="16" cy="7" r="1.5"/>':
  t.includes('henrique')?'<circle cx="12" cy="8" r="3"/><path d="M6 20c.5-4 2.5-6 6-6s5.5 2 6 6"/>':
  t.includes('jardim')||t.includes('piscina')||t.includes('extern')?'<path d="M12 20v-8"/><path d="M12 13c-4 0-6-2-6-5 3 0 5 1 6 3 1-3 3-5 7-5 0 4-2 7-7 7z"/>':
  t.includes('cozinha')?'<path d="M6 10h12v8H6zM5 10h14M9 7h6M12 5v2M18 12h2"/>':
  '<path d="M5 7h14M5 12h14M5 17h14"/>';
 return `<span class="casa-inline-icon"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round">${path}</svg></span>`;
}
function casaTipIcon(label){const t=String(label||'').toLowerCase();if(t.includes('limpeza'))return casaAreaIcon('Limpeza');if(t.includes('roupa')||t.includes('lavanderia'))return casaAreaIcon('Roupas & Lavanderia');if(t.includes('jardim')||t.includes('extern'))return casaAreaIcon('Jardim');if(t.includes('gato'))return casaAreaIcon('Animais');const raw=t.includes('organização')?casaLineIcon('routines'):casaLineIcon('info');return `<span class="casa-inline-icon">${raw}</span>`}
function casaSection(icon,title,meta,body,id){return `<details class="casa-section" id="${id||""}"><summary><span class="casa-section-left"><span class="casa-section-icon">${icon}</span><strong>${title}</strong></span><span class="casa-section-meta">${meta?`<span>${meta}</span>`:""}<span class="casa-chevron">⌄</span></span></summary><div class="casa-section-body">${body}</div></details>`}
function maintenanceCard(m){const meta=[m.area,m.type,m.date?formatDate(m.date):"",`${maintenanceMinutes(m)} min`,m.priority,m.responsible].filter(Boolean);return `<div class="card casa-maint-card"><div><strong>${escapeHtml(m.name)}</strong>${m.note?`<p class="note">${escapeHtml(m.note)}</p>`:""}</div><div class="casa-maint-meta">${meta.map(x=>`<span>${escapeHtml(String(x))}</span>`).join("")}</div><div class="casa-maint-actions"><button type="button" class="start" data-maint-start="${m.id}">▶ Começar</button><button type="button" class="edit" data-maint-edit="${m.id}">Editar</button><button type="button" class="finish" data-maint-finish="${m.id}">✓ Concluir</button></div></div>`}
function openCasaNewRoutine(areaId){
 const d=loadCasa();const area=(d.areas||[]).find(a=>String(a.id)===String(areaId));if(!area)return;
 const dlg=document.createElement('dialog');dlg.className='bertha-dialog casa-dialog';
 dlg.innerHTML=`<form method="dialog" class="modal-card casa-modal-card" id="casaNewRoutineForm"><div class="modal-head"><div><div class="eyebrow">CASA · ROTINAS</div><h2>Nova rotina</h2><p class="note">${escapeHtml(area.title)}</p></div><button class="icon-btn casa-modal-x" value="cancel" aria-label="Fechar">×</button></div><label>Atividade<input id="cnrName" required placeholder="Ex.: Limpar a varanda"></label><label>Duração estimada (min)<input id="cnrMin" type="number" min="1" max="480" step="5" value="10"></label><label>Horário / janela preferencial<input id="cnrTime" placeholder="Ex.: manhã, 18:30, janela doméstica"></label><label>Frequência<input id="cnrFreq" placeholder="Ex.: semanal, a cada 2 dias" value="conforme necessário"></label><div class="modal-actions"><div class="grow"></div><button type="button" class="secondary" id="cancelCnr">Cancelar</button><button class="primary" value="default">Salvar</button></div></form>`;
 document.body.appendChild(dlg);dlg.showModal();dlg.querySelector('#cancelCnr').onclick=()=>dlg.close();dlg.addEventListener('close',()=>dlg.remove());
 dlg.querySelector('#casaNewRoutineForm').addEventListener('submit',e=>{e.preventDefault();const name=dlg.querySelector('#cnrName').value.trim();if(!name)return;const id=`casa-${String(area.id).replace(/[^a-z0-9]+/gi,'-').toLowerCase()}-${Date.now()}`;area.tasks=Array.isArray(area.tasks)?area.tasks:[];area.tasks.push({id,name,freq:dlg.querySelector('#cnrFreq').value.trim()||'conforme necessário',when:dlg.querySelector('#cnrTime').value.trim()||'horário a definir',done:false});const ds=loadCasaDurations();ds[id]=Math.max(1,+dlg.querySelector('#cnrMin').value||10);saveCasaDurations(ds);const ts=loadCasaTimes();ts[id]=dlg.querySelector('#cnrTime').value.trim()||'flexível';saveCasaTimes(ts);saveCasa(d);dlg.close();renderCasa();requestAnimationFrame(()=>{const target=document.querySelector(`.casa-routine-group[data-routine-id="${CSS.escape(String(areaId))}"]`);if(target){target.open=true;target.scrollIntoView({behavior:'smooth',block:'start'})}})});
}
function renderCasaCore(){
 ensureCasaManualStyles();
 const d=loadCasa();
 d.maintenance=(Array.isArray(d.maintenance)?d.maintenance:[]).filter(Boolean).map(m=>({status:"a_fazer",area:"Casa geral",type:"Reparo / conserto",durationValue:30,durationUnit:"minutes",priority:"normal",frequency:"Única",responsible:"Eu",notify:false,period:"flex",...m}));
 const all=d.areas.flatMap(a=>a.tasks),done=all.filter(x=>x.done).length;
 const routineTaskHtml=(a,t)=>{const search=[a.title,t.name,casaDuration(t.id),casaTime(t.id),t.freq||"cíclica",t.when].join(" ").toLowerCase();return `<div class="home-task-wrap casa-routine-row" data-routine-search="${escapeHtml(search)}"><label class="home-task ${t.done?"done":""}"><input type="checkbox" data-casa-task="${a.id}|${t.id}" ${t.done?"checked":""}><span><strong>${escapeHtml(t.name)}</strong><small>${escapeHtml(casaDuration(t.id))} · ${escapeHtml(casaTime(t.id))} · ${escapeHtml(t.freq||"cíclica")} · ${escapeHtml(t.when)}</small>${t.done&&t.nextDue?`<small>Próxima: ${new Date(t.nextDue+"T12:00:00").toLocaleDateString("pt-BR")}</small>`:""}</span></label><div class="home-task-actions">${CASA_HOW[t.id]?`<button type="button" class="home-how" data-casa-how="${t.id}">Como fazer →</button>`:""}<button type="button" class="home-edit" data-casa-edit="${t.id}">Editar</button></div><div class="casa-task-exec">${t.done?`<button type="button" class="casa-task-reopen" data-casa-reopen="${t.id}">↻ Fazer novamente</button>`:`<button type="button" class="casa-task-start" data-casa-start="${t.id}">▶ Começar</button><button type="button" class="casa-task-finish" data-casa-finish="${t.id}">✓ Concluir</button>`}</div></div>`};
 const areaPickerLabel=a=>{const t=String(a.title||'');if(/roup|lavander/i.test(t))return 'Lavanderia';if(/jardim|piscina|extern/i.test(t))return 'Áreas externas';return t};
 const routinesHtml=`<div class="casa-routine-browser"><div class="casa-routine-picker"><button type="button" class="casa-routine-picker-btn" id="casaRoutineAreaPicker" aria-expanded="false"><span class="casa-routine-picker-label">${casaAreaIcon('rotinas')}<strong>Escolher uma área…</strong></span><span class="casa-routine-picker-chevron">⌄</span></button><div class="casa-routine-picker-menu" id="casaRoutineAreaMenu" hidden>${d.areas.map(a=>`<button type="button" data-area-pick="${escapeHtml(String(a.id))}"><span>${casaAreaIcon(a.title)}<strong>${escapeHtml(areaPickerLabel(a))}</strong></span><small>${a.tasks.length}</small></button>`).join("")}</div></div><div class="casa-routine-groups">${d.areas.map(a=>`<details class="casa-routine-group" data-routine-id="${escapeHtml(String(a.id))}"><summary><span>${casaAreaIcon(a.title)}<strong>${escapeHtml(a.title)}</strong></span><span class="casa-routine-count">${a.tasks.length}</span></summary><div class="casa-routine-group-body">${a.tasks.length?a.tasks.map(t=>routineTaskHtml(a,t)).join(""):`<p class="note">Sem rotina cadastrada. Mantemos espaço para incluir apenas o que realmente for necessário.</p>`}<button type="button" class="secondary casa-add-routine" data-add-casa-routine="${escapeHtml(String(a.id))}">＋ Adicionar rotina nesta área</button></div></details>`).join("")}</div></div>`
 const scheduled=all.filter(t=>casaTime(t.id)&&casaTime(t.id)!="ao fim do ciclo").slice().sort((a,b)=>String(casaTime(a.id)).localeCompare(String(casaTime(b.id))));
 const scheduleHtml=`<div class="card casa-schedule-card"><p class="note">Esses horários são referências para encaixe no dia — não uma agenda rígida. Para mudar um horário, edite a própria rotina.</p><div class="casa-schedule">${scheduled.map(t=>`<div class="casa-schedule-row">${casaTimeBubbles(t.id)}<strong>${escapeHtml(t.name)}</strong><button type="button" class="casa-schedule-edit" data-casa-edit="${escapeHtml(String(t.id))}">Editar</button></div>`).join("")}</div></div>`;
 const activeMaint=d.maintenance.filter(m=>m.status!=="concluida"),closedMaint=d.maintenance.filter(m=>m.status==="concluida");
 const maintenanceHtml=`<div class="card"><p class="note">Reparos, prevenção e melhorias da casa. Cada manutenção fica ligada a uma área, pode entrar no Meu Dia e pode usar o mesmo ciclo de execução da BERTH.A.</p><button class="secondary" id="addMaintenance">＋ Adicionar manutenção</button></div><div class="list">${activeMaint.map(maintenanceCard).join("")||`<div class="empty compact"><strong>Nenhuma manutenção pendente.</strong><span>Ótimo. Não precisamos criar trabalho só para preencher espaço.</span></div>`}</div>${closedMaint.length?`<div class="card"><div class="panel-head"><h3>Concluídas</h3><span class="pill">${closedMaint.length}</span></div>${closedMaint.slice().reverse().map(m=>`<div class="casa-history-row"><div><strong>${escapeHtml(m.name)}</strong><small>${escapeHtml(m.area||"Casa")} · ${m.lastCompletedAt?new Date(m.lastCompletedAt).toLocaleDateString('pt-BR'):''}</small></div><button type="button" class="more" data-maint-edit="${m.id}">›</button></div>`).join("")}</div>`:""}`;
 app.innerHTML=`<section class="casa-hero-v121"><div><span class="eyebrow">CASA</span><h2>Less to manage. More to live.</h2><p>A BERTH.A organiza. Você executa.</p></div><span class="casa-hero-mark" aria-hidden="true"><svg viewBox="0 0 64 44" fill="none"><path d="M10 11H54"/><path d="M10 24c8-8 16 8 24 0s12-8 20 0"/><path d="M10 36H54"/></svg></span></section>
 <div class="home-principle casa-principle-v121 card"><span class="eyebrow">REGRA DA CASA</span><strong>Agrupar. Delegar. Adiar quando puder.</strong><p>Não espalhar microtarefas pelo dia. O essencial entra em blocos; o resto pode esperar.</p></div>
 <div class="home-summary casa-summary-v121"><div class="card"><span>Rotinas</span><b>${all.length}</b></div><div class="card"><span>Feitas agora</span><b>${done}</b></div></div>
 <div class="casa-day-bridge-v121"><span class="casa-bridge-lines">${casaLineIcon('routines')}</span><span><strong>Casa também entra no Meu Dia.</strong><small>Itens de hoje e microtarefas aparecem quando couberem na sua janela.</small></span><a href="#meu-dia">Meu Dia →</a></div>
 ${casaSection(casaLineIcon('routines'),"Rotinas da Casa",`${all.length} rotinas`,routinesHtml,"casa-sec-rotinas")}
 ${casaSection(casaLineIcon('toolbox'),"Manutenção",activeMaint.length?`${activeMaint.length} pendente${activeMaint.length===1?'':'s'}`:"em dia",maintenanceHtml,"casa-sec-manutencao")}
 ${casaSection(casaLineIcon('manual'),"Manual da Casa",`${CASA_MANUAL_PROCEDURES.length} procedimentos`,`<div class="list">${renderCasaManual()}</div>`,"casa-sec-manual")}
 ${casaSection(casaLineIcon('pot'),"Receitas da Casa",`${loadCasaRecipes().length} receitas`,`<div class="list">${renderCasaRecipes()}</div>`,"casa-sec-receitas")}
 ${casaSection(casaLineIcon('spray'),"Inventário da Casa",`${CASA_PRODUCT_CATALOG.length} produtos`,renderCasaInventory(),"casa-sec-inventario")}
 ${casaSection(casaLineIcon('clock'),"Horários da Casa","referências",scheduleHtml,"casa-sec-horarios")}
 ${casaSection(casaLineIcon('info'),"Dicas para a Casa","consulta",`<div class="card casa-web-card"><p class="note">Quando quiser aprofundar uma tarefa, abra um caminho para a internet. O conteúdo externo é complementar; o essencial continua dentro da BERTH.A.</p><div class="casa-web-grid">${CASA_WEB.map(([label,url])=>`<a class="casa-web-link" href="${url}" target="_blank" rel="noopener"><span class="casa-web-link-main">${casaTipIcon(label)}<span>${escapeHtml(label)}</span></span><span class="casa-web-arrow">↗</span></a>`).join("")}</div></div>`,"casa-sec-dicas")}`;
 document.querySelectorAll("[data-casa-task]").forEach(el=>el.onchange=()=>{const [,tid]=el.dataset.casaTask.split("|");if(el.checked)casaFinishRoutine(tid);else casaReopenRoutine(tid);});
 const areaPicker=document.querySelector('#casaRoutineAreaPicker'),areaMenu=document.querySelector('#casaRoutineAreaMenu');
 if(areaPicker&&areaMenu){areaPicker.onclick=e=>{e.stopPropagation();const open=areaMenu.hidden;areaMenu.hidden=!open;areaPicker.setAttribute('aria-expanded',String(open))};areaMenu.querySelectorAll('[data-area-pick]').forEach(btn=>btn.onclick=e=>{e.stopPropagation();const id=btn.dataset.areaPick;const label=btn.querySelector('strong')?.textContent||'Escolher uma área…';areaPicker.querySelector('.casa-routine-picker-label strong').textContent=label;areaMenu.hidden=true;areaPicker.setAttribute('aria-expanded','false');const groups=[...document.querySelectorAll('.casa-routine-group')];groups.forEach(group=>group.open=false);const target=groups.find(group=>String(group.dataset.routineId)===String(id));if(target){target.open=true;requestAnimationFrame(()=>target.scrollIntoView({behavior:'smooth',block:'start'}));}});document.addEventListener('click',()=>{areaMenu.hidden=true;areaPicker.setAttribute('aria-expanded','false')});}
 document.querySelectorAll("[data-casa-how]").forEach(b=>b.onclick=()=>openCasaHow(b.dataset.casaHow));
 document.querySelectorAll("[data-casa-edit]").forEach(b=>b.onclick=()=>openCasaTaskEditor(b.dataset.casaEdit));
 document.querySelectorAll("[data-add-casa-routine]").forEach(b=>b.onclick=()=>openCasaNewRoutine(b.dataset.addCasaRoutine));
 document.querySelectorAll("[data-casa-start]").forEach(b=>b.onclick=()=>casaStartRoutine(b.dataset.casaStart));
 document.querySelectorAll("[data-casa-finish]").forEach(b=>b.onclick=()=>casaFinishRoutine(b.dataset.casaFinish));
 document.querySelectorAll("[data-casa-reopen]").forEach(b=>b.onclick=()=>casaReopenRoutine(b.dataset.casaReopen));
 bindCasaShoppingMini();
 document.querySelectorAll("[data-casa-manual]").forEach(b=>b.onclick=()=>openCasaManual(b.dataset.casaManual));
 document.querySelectorAll("[data-recipe-buy]").forEach(b=>bindCasaBuyButton(b,b.dataset.recipeBuy,"Receita da Casa"));
 document.querySelectorAll("[data-recipe-edit]").forEach(b=>b.onclick=()=>openCasaRecipeEditor(b.dataset.recipeEdit));
 document.querySelector("#addCasaRecipe")?.addEventListener("click",()=>openCasaRecipeEditor());
 document.querySelectorAll("[data-inventory-buy]").forEach(b=>bindCasaBuyButton(b,b.dataset.inventoryBuy,"Inventário da Casa"));
 document.querySelectorAll("[data-substitute-info]").forEach(b=>b.onclick=()=>openCasaSubstituteInfo(b.dataset.substituteInfo));
 document.querySelector("#addMaintenance")?.addEventListener("click",()=>openCasaMaintenance());
 document.querySelectorAll("[data-maint-start]").forEach(b=>b.onclick=()=>casaStartMaintenance(b.dataset.maintStart));
 document.querySelectorAll("[data-maint-finish]").forEach(b=>b.onclick=()=>casaFinishMaintenance(b.dataset.maintFinish));
 document.querySelectorAll("[data-maint-edit]").forEach(b=>b.onclick=()=>openCasaMaintenance(b.dataset.maintEdit));
}
function renderCasa(){
 try{return renderCasaCore();}
 catch(e){
  console.error("BERTH.A Casa render error",e);
  try{localStorage.setItem("bertha.casa.lastError",String(e?.stack||e));}catch{}
  app.innerHTML=`<section class="hero"><h2>🏠 Casa</h2><p>O módulo encontrou um dado antigo incompatível e foi recuperado.</p></section><div class="card"><strong>Casa recuperada</strong><p class="note">Seções antigas foram normalizadas para abrir sem perder seus dados.</p><button type="button" class="primary" id="retryCasa">Abrir Casa</button></div>`;
  document.querySelector('#retryCasa')?.addEventListener('click',()=>{try{localStorage.removeItem(CASA_RECIPES_KEY)}catch{};renderCasaCore()});
 }
}
const casaV128=document.createElement('style');casaV128.id='casa-v128-final';casaV128.textContent=`
.casa-routine-picker{position:relative;margin:0 0 14px;z-index:8}.casa-routine-picker-btn{width:100%!important;min-height:48px!important;display:flex!important;align-items:center!important;justify-content:space-between!important;padding:0 13px!important;border:1px solid rgba(132,106,118,.10)!important;border-radius:16px!important;background:linear-gradient(105deg,rgba(249,226,233,.72),rgba(238,246,237,.82))!important;color:#4b434d!important;box-shadow:none!important}.casa-routine-picker-label{display:flex!important;align-items:center!important;gap:8px!important;min-width:0}.casa-routine-picker-label strong{font-size:13.5px!important;font-weight:620!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}.casa-routine-picker-label .casa-inline-icon{width:15px!important;height:15px!important;flex:0 0 15px!important}.casa-routine-picker-chevron{font-size:15px!important;color:#8a7d83!important}.casa-routine-picker-menu{position:relative!important;left:auto!important;right:auto!important;top:auto!important;margin-top:6px!important;padding:5px!important;border-radius:15px!important;background:rgba(255,252,249,.99)!important;border:1px solid rgba(132,106,118,.10)!important;box-shadow:0 10px 24px rgba(64,48,58,.08)!important;max-height:none!important}.casa-routine-picker-menu[hidden]{display:none!important}.casa-routine-picker-menu button{min-height:40px!important;width:100%!important;display:flex!important;align-items:center!important;justify-content:space-between!important;padding:8px 9px!important;border:0!important;border-radius:10px!important;background:transparent!important;color:#4b434d!important;text-align:left!important}.casa-routine-picker-menu button>span{display:flex!important;align-items:center!important;gap:8px!important}.casa-routine-picker-menu button strong{font-size:12.5px!important;font-weight:650!important}.casa-routine-picker-menu button small{font-size:9.5px!important;min-width:24px!important;padding:4px 7px!important;border-radius:999px!important;background:#f1e7dd!important;color:#7d7169!important;text-align:center!important}.casa-routine-picker-menu .casa-inline-icon{width:15px!important;height:15px!important;flex:0 0 15px!important}.casa-routine-picker-menu .casa-inline-icon svg{width:15px!important;height:15px!important}.casa-add-routine{width:100%!important;margin:12px 0 4px!important;min-height:42px!important;border-radius:14px!important;background:linear-gradient(115deg,rgba(244,221,229,.92),rgba(221,237,222,.96))!important;color:#685961!important;border:1px solid rgba(132,106,118,.08)!important;font-size:12.5px!important;font-weight:720!important}.casa-schedule-row{grid-template-columns:82px minmax(0,1fr) auto!important}.casa-schedule-edit{border:0!important;background:linear-gradient(115deg,#ecd1d9,#dbe9db)!important;color:#675962!important;border-radius:999px!important;padding:6px 9px!important;font-size:10.5px!important;font-weight:760!important}.casa-modal-card .modal-actions .primary,.casa-modal-card .study-v10-actions .primary,.casa-how-modal .casa-edit-procedure,.casa-how-modal #editCasaHow,.casa-how-modal #editManualCasa,.casa-recipe-edit,.home-edit{background:linear-gradient(110deg,#dca7b5 0%,#e6c6ba 45%,#bdd5bf 100%)!important;background-image:linear-gradient(110deg,#dca7b5 0%,#e6c6ba 45%,#bdd5bf 100%)!important;color:#5e5057!important;border:0!important;box-shadow:none!important}.casa-modal-card .modal-actions .secondary,.casa-modal-card .study-v10-actions .secondary{background:linear-gradient(135deg,#e6f0e5,#dcebdc)!important;color:#5d6e5f!important}.casa-web-grid{display:grid!important;grid-template-columns:1fr!important;gap:7px!important}.casa-web-link{min-height:48px!important;display:flex!important;align-items:center!important;justify-content:space-between!important;padding:9px 11px!important;border-radius:14px!important;background:linear-gradient(115deg,rgba(248,229,235,.62),rgba(238,247,237,.78))!important;border:1px solid rgba(132,106,118,.08)!important;color:#514951!important;font-size:12.5px!important;font-weight:650!important;box-shadow:none!important}.casa-web-link-main{display:flex!important;align-items:center!important;gap:9px!important;min-width:0!important}.casa-web-link .casa-inline-icon{width:16px!important;height:16px!important;flex:0 0 16px!important}.casa-web-link .casa-inline-icon svg{width:16px!important;height:16px!important}.casa-web-arrow{font-size:14px!important}.casa-web-card .note{font-size:12.5px!important;line-height:1.45!important;margin-bottom:9px!important}@media(max-width:560px){.casa-schedule-row{grid-template-columns:72px minmax(0,1fr) auto!important;gap:7px!important}.casa-schedule-edit{padding:6px 8px!important;font-size:10px!important}}
`;document.head.appendChild(casaV128);
const casaV132=document.createElement('style');casaV132.id='casa-v132-horarios-fonte';casaV132.textContent=`
.casa-schedule-row{grid-template-columns:112px minmax(0,1fr) auto!important;align-items:center!important;gap:10px!important}
.casa-time-stack{display:grid!important;gap:6px!important;justify-items:start!important;align-content:start!important;min-width:0!important}
.casa-time-stack .casa-time{display:inline-flex!important;align-items:center!important;justify-content:center!important;min-height:28px!important;max-width:100%!important;padding:6px 8px!important;box-sizing:border-box!important;line-height:1.08!important;white-space:normal!important;text-align:center!important;font-size:10px!important;font-weight:800!important;overflow-wrap:break-word!important;word-break:normal!important}
.casa-schedule-row>strong{line-height:1.18!important}
.casa-product-row>div:last-child{display:grid!important;justify-items:end!important;gap:8px!important}
.casa-substitute-btn{-webkit-appearance:none!important;appearance:none!important;-webkit-tap-highlight-color:transparent!important;outline:none!important;box-shadow:none!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;min-height:30px!important;padding:0 12px!important;border-radius:999px!important;border:1px solid rgba(134,117,105,.12)!important;background:linear-gradient(115deg,rgba(245,235,225,.96),rgba(240,233,227,.96))!important;color:#776a61!important;text-transform:uppercase!important;letter-spacing:.04em!important;font-size:10.5px!important;font-weight:800!important}
.casa-substitute-btn:focus,.casa-substitute-btn:focus-visible,.casa-substitute-btn:active{outline:none!important;box-shadow:none!important;background:linear-gradient(115deg,rgba(243,232,222,.98),rgba(236,229,223,.98))!important;color:#6f635b!important}
@media(max-width:560px){.casa-schedule-row{grid-template-columns:100px minmax(0,1fr) auto!important;gap:8px!important}.casa-time-stack .casa-time{font-size:9.5px!important;padding:6px 7px!important}.casa-product-row{gap:12px!important}.casa-product-row>div:first-child{min-width:0!important}.casa-product-row>div:last-child{flex:0 0 auto!important}}
`;document.head.appendChild(casaV132);

function openCasaMaintenance(id){
 const d=loadCasa();d.maintenance=d.maintenance||[];const current=id?d.maintenance.find(x=>String(x.id)===String(id)):null;
 const m={id:current?.id||uid(),name:"",area:"Casa geral",type:"Reparo / conserto",date:"",durationValue:30,durationUnit:"minutes",priority:"normal",frequency:"Única",responsible:"Eu",notify:false,notifyWhen:"No horário da tarefa",period:"flex",time:"",note:"",status:"a_fazer",...current};
 const areas=["Casa geral",...(Array.isArray(d.areas)?d.areas:[]).map(a=>a.title),"Piscina","Jardim","Garagem","Edícula","Área externa"];
 const dlg=document.createElement("dialog");dlg.className="study-v10-dialog";
 dlg.innerHTML=`<form class="study-v10-modal" id="casaMaintForm"><div class="study-v10-head"><div><div class="eyebrow">CASA · MANUTENÇÃO</div><h2>${current?"Editar manutenção":"Nova manutenção"}</h2><p>Ligada à área da casa, ao Meu Dia e ao tempo real.</p></div><button type="button" class="study-v10-x" data-close>×</button></div>
 ${field("O que precisa ser feito?",`<input id="mName" required maxlength="100" value="${escapeHtml(m.name)}">`)}
 <div class="form-grid">${field("Área / ambiente",`<select id="mArea">${areas.map(x=>`<option ${x===m.area?'selected':''}>${escapeHtml(x)}</option>`).join('')}</select>`)}${field("Tipo",`<select id="mType">${["Preventiva","Reparo / conserto","Melhoria","Limpeza técnica","Compra / instalação"].map(x=>`<option ${x===m.type?'selected':''}>${x}</option>`).join('')}</select>`)}</div>
 <div class="form-grid">${field("Quando",`<input id="mDate" type="date" value="${escapeHtml(m.date||'')}">`)}${field("Período / janela",`<select id="mPeriod"><option value="flex" ${m.period==='flex'?'selected':''}>Flexível</option><option value="morning" ${m.period==='morning'?'selected':''}>Manhã</option><option value="afternoon" ${m.period==='afternoon'?'selected':''}>Tarde</option><option value="evening" ${m.period==='evening'?'selected':''}>Noite</option><option value="fixed" ${m.period==='fixed'?'selected':''}>Horário fixo</option></select>`)}</div>
 ${field("Horário opcional",`<input id="mTime" type="time" value="${escapeHtml(m.time||'')}">`)}
 ${field("Duração estimada",`<div class="study-v10-duration"><input id="mDur" type="number" min="1" value="${+m.durationValue||30}"><select id="mDurUnit"><option value="minutes" ${m.durationUnit==='minutes'?'selected':''}>minutos</option><option value="hours" ${m.durationUnit==='hours'?'selected':''}>horas</option></select></div>`)}
 <div class="form-grid">${field("Prioridade",`<select id="mPriority"><option value="baixa" ${m.priority==='baixa'?'selected':''}>Baixa</option><option value="normal" ${m.priority==='normal'?'selected':''}>Normal</option><option value="alta" ${m.priority==='alta'?'selected':''}>Alta</option><option value="urgente" ${m.priority==='urgente'?'selected':''}>Urgente</option></select>`)}${field("Frequência",`<select id="mFreq">${["Única","Diária","Semanal","Quinzenal","Mensal","Conforme necessário"].map(x=>`<option ${x===m.frequency?'selected':''}>${x}</option>`).join('')}</select>`)}</div>
 ${field("Responsável",`<select id="mResp">${["Eu","Henrique","Thiago","Prestador / profissional"].map(x=>`<option ${x===m.responsible?'selected':''}>${x}</option>`).join('')}</select>`)}
 <label class="study-v10-field" style="display:flex;align-items:center;gap:10px"><input id="mNotify" type="checkbox" ${m.notify?'checked':''} style="width:auto"><span style="margin:0">Me avisar?</span></label>
 <div id="mNotifyWrap" style="${m.notify?'':'display:none'}">${field("Quando avisar?",`<select id="mNotifyWhen">${["No horário da tarefa","10 min antes","30 min antes","1 hora antes","No início do período","Em um horário escolhido"].map(x=>`<option ${x===m.notifyWhen?'selected':''}>${x}</option>`).join('')}</select>`)}</div>
 ${field("Observação",`<textarea id="mNote" rows="3">${escapeHtml(m.note||'')}</textarea>`)}
 <div class="study-v10-actions">${current?'<button type="button" class="danger" id="deleteMaint">Excluir</button>':''}<button type="button" class="secondary" data-close>Cancelar</button><button class="primary" type="submit">Salvar</button></div></form>`;
 document.body.appendChild(dlg);const close=()=>dlg.close();dlg.querySelectorAll('[data-close]').forEach(b=>b.onclick=close);dlg.addEventListener('click',e=>{if(e.target===dlg)close()});dlg.onclose=()=>dlg.remove();dlg.querySelector('#mNotify').onchange=e=>dlg.querySelector('#mNotifyWrap').style.display=e.target.checked?'':'none';
 dlg.querySelector('#deleteMaint')?.addEventListener('click',()=>{if(!confirm(`Excluir “${m.name}”?`))return;d.maintenance=d.maintenance.filter(x=>String(x.id)!==String(m.id));saveCasa(d);close();renderCasa()});
 dlg.querySelector('#casaMaintForm').addEventListener('submit',e=>{e.preventDefault();const obj={...m,name:dlg.querySelector('#mName').value.trim(),area:dlg.querySelector('#mArea').value,type:dlg.querySelector('#mType').value,date:dlg.querySelector('#mDate').value,period:dlg.querySelector('#mPeriod').value,time:dlg.querySelector('#mTime').value,durationValue:Math.max(1,+dlg.querySelector('#mDur').value||30),durationUnit:dlg.querySelector('#mDurUnit').value,priority:dlg.querySelector('#mPriority').value,frequency:dlg.querySelector('#mFreq').value,responsible:dlg.querySelector('#mResp').value,notify:dlg.querySelector('#mNotify').checked,notifyWhen:dlg.querySelector('#mNotifyWhen').value,note:dlg.querySelector('#mNote').value.trim(),status:m.status||'a_fazer',updatedAt:Date.now()};d.maintenance=current?d.maintenance.map(x=>String(x.id)===String(m.id)?obj:x):[...d.maintenance,{...obj,createdAt:Date.now()}];saveCasa(d);close();renderCasa()});
 dlg.showModal();
}

const EX_KEY="minha-vida.exercicios.v1";
const EX_BASE={
  plans:[
    {id:"treino1",name:"Esteira",type:"Cardio",durationValue:20,durationUnit:"minutes",frequency:"Dias específicos",days:["Seg","Ter","Qua","Qui","Sex"],period:"morning",time:"",untilMode:"none",untilDate:"",notify:false,notifyWhen:"No início do período",note:"O objetivo é manter o ritual da manhã, não buscar perfeição.",plan:"",link:"",active:true},
    {id:"treino2",name:"Treino de força",type:"Força",durationValue:30,durationUnit:"minutes",frequency:"Conforme necessário",days:[],period:"flex",time:"",untilMode:"none",untilDate:"",notify:false,notifyWhen:"No início do período",note:"",plan:"",link:"",active:true}
  ], sessions:[], notes:""
};
function exMinutes(p){const n=Math.max(1,+p.durationValue||parseInt(String(p.target||'').match(/\d+/)?.[0]||30));return p.durationUnit==='hours'?n*60:n}
function normalizeExPlan(p={}){const target=String(p.target||'');const n=parseInt(target.match(/\d+/)?.[0]||30);return {id:p.id||uid(),name:String(p.name||'Treino'),type:String(p.type||'Treino'),durationValue:Math.max(1,+p.durationValue||n||30),durationUnit:p.durationUnit||'minutes',frequency:p.frequency||(Array.isArray(p.days)&&p.days.length?'Dias específicos':'Conforme necessário'),days:Array.isArray(p.days)?p.days:[],period:p.period||((p.name||'').toLowerCase().includes('esteira')?'morning':'flex'),time:p.time||'',untilMode:p.untilMode||'none',untilDate:p.untilDate||'',notify:!!p.notify,notifyWhen:p.notifyWhen||'No início do período',note:p.note||'',plan:p.plan||'',link:p.link||'',active:p.active!==false};}
function loadEx(){try{const raw=JSON.parse(localStorage.getItem(EX_KEY));if(raw){return {...EX_BASE,...raw,plans:(Array.isArray(raw.plans)?raw.plans:EX_BASE.plans).map(normalizeExPlan),sessions:Array.isArray(raw.sessions)?raw.sessions:[]};}}catch{}return JSON.parse(JSON.stringify(EX_BASE));}
function saveEx(d){localStorage.setItem(EX_KEY,JSON.stringify(d));}
function exDueToday(p){if(!p.active)return false;if(p.untilMode==='date'&&p.untilDate&&p.untilDate<new Date().toISOString().slice(0,10))return false;const dow=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][new Date().getDay()];if(p.frequency==='Dias específicos')return !p.days.length||p.days.includes(dow);return true;}
function exPeriodText(p){return ({morning:'Manhã',afternoon:'Tarde',evening:'Noite',flex:'Flexível'})[p.period]||'Flexível'}
function exerciseHeroIcon(){return `<svg viewBox="0 0 42 42" aria-hidden="true"><path d="M9 11h15l9 9-15 15H9z"/><path d="M9 11l9 9 15 0"/></svg>`}
function exerciseRecordProgress({name,minutes,date,plannedName=null,substituted=false,note='Registrado manualmente'}){
 try{
  const key='bertha.time-engine.v1',e=JSON.parse(localStorage.getItem(key)||'{"active":null,"history":[],"snoozed":{}}');
  e.history=Array.isArray(e.history)?e.history:[];
  const day=date||new Date().toISOString().slice(0,10),stamp=Date.now();
  e.history.unshift({itemId:`exercise-manual:${stamp}`,learningKey:`exercise-manual:${String(name||'movimento').toLowerCase().replace(/[^a-z0-9]+/g,'-')}`,title:name||'Movimento',source:'Exercícios',day,startedAt:stamp-Math.max(1,+minutes||1)*60000,endedAt:stamp,configuredMinutes:Math.max(1,+minutes||1),plannedMinutes:Math.max(1,+minutes||1),plannedItemId:substituted?'exercise-substitution':null,plannedName:plannedName||name||'Movimento',category:'movimento',realMinutes:Math.max(1,+minutes||1),status:'done',note});
  localStorage.setItem(key,JSON.stringify(e));
 }catch{}
}
function renderExercicios(){
 const d=loadEx(),today=new Date().toISOString().slice(0,10),sessions=d.sessions.slice().reverse(),due=d.plans.filter(exDueToday),focus=due[0],active=window.BerthaTimeEngine?.active?.();
 app.innerHTML=`<section class="exercise-hero"><div><span class="eyebrow">EXERCÍCIOS</span><h2>Room to move. Room to live.</h2><p>Você se movimenta. A BERTH.A sustenta o ritmo.</p></div><span class="exercise-hero-icon">${exerciseHeroIcon()}</span></section>
 ${focus?`<div class="exercise-focus card"><span class="eyebrow">HOJE</span><strong>${escapeHtml(focus.name)} · ${exMinutes(focus)} min</strong><p>${escapeHtml(exPeriodText(focus))}${focus.time?` · ${escapeHtml(focus.time)}`:''}. ${escapeHtml(focus.note||'Movimento possível, sem rigidez.')}</p><div class="exercise-focus-actions">${active&&String(active.id)===`exercise:${focus.id}`?`<button class="primary" id="finishExercise">Concluir treino</button>`:`<button class="primary" id="startExercise">Começar treino</button>`}<button class="secondary" id="doneExercise">Já fiz</button><button class="text-btn" id="otherExercise">Fiz outro</button></div></div>`:''}
 <div class="section-title">ROTINA DE MOVIMENTO</div>
 <div class="list exercise-plan-list">${d.plans.map(p=>`<div class="card exercise-plan" data-plan="${p.id}"><div class="exercise-plan-main"><strong>${escapeHtml(p.name)}</strong><span>${escapeHtml(p.type)} · ${exMinutes(p)} min · ${escapeHtml(exPeriodText(p))}</span>${p.days.length?`<small>${p.days.join(' · ')}</small>`:`<small>${escapeHtml(p.frequency)}</small>`}${p.link?`<a class="exercise-external-link" href="${escapeHtml(p.link)}" target="_blank" rel="noopener" data-ex-link="${p.id}">Abrir treino ↗</a>`:''}</div><div class="exercise-plan-actions"><span class="pill">${p.active?'Ativo':'Pausado'}</span>${p.active?`<button class="secondary" type="button" data-start-plan="${p.id}">Iniciar agora</button>`:''}</div></div>`).join('')}</div>
 <button class="secondary add-full exercise-add" id="addPlan">＋ Adicionar treino</button>
 <div class="section-title">REGISTRO</div>
 <div class="list">${sessions.slice(0,12).map(s=>`<div class="card exercise-session"><div><strong>${escapeHtml(s.name)}</strong><span>${formatDate(s.date)} · ${escapeHtml(s.duration||'')} ${s.note?`· ${escapeHtml(s.note)}`:''}</span></div><button class="more" data-ex="${s.id}">×</button></div>`).join('')||`<div class="empty compact"><strong>Nenhum treino registrado ainda.</strong><span>Quando você concluir um treino, ele aparece aqui.</span></div>`}</div>
 <div class="card exercise-note"><span class="eyebrow">REGRA</span><p>Se o dia apertar, o treino pode ser reduzido. Descanso não é falha — é parte do sistema.</p></div>`;
 document.querySelector('#addPlan').onclick=()=>openExercisePlan();
 document.querySelectorAll('[data-plan]').forEach(el=>el.onclick=e=>{if(e.target.closest('[data-start-plan],[data-ex-link]'))return;openExercisePlan(el.dataset.plan)});
 document.querySelectorAll('[data-ex-link]').forEach(a=>a.addEventListener('click',e=>e.stopPropagation()));
 document.querySelectorAll('[data-start-plan]').forEach(btn=>btn.addEventListener('click',e=>{e.stopPropagation();const plan=d.plans.find(p=>String(p.id)===String(btn.dataset.startPlan));if(!plan)return;startViaBertha({id:`exercise:${plan.id}`,learningKey:`exercise-plan-v2:${plan.id}`,source:'Exercícios',title:plan.name,minutes:exMinutes(plan),configuredMinutes:exMinutes(plan),period:plan.period,kind:'exercise'});setTimeout(renderExercicios,80)}));
 document.querySelector('#startExercise')?.addEventListener('click',()=>{startViaBertha({id:`exercise:${focus.id}`,learningKey:`exercise-plan-v2:${focus.id}`,source:'Exercícios',title:focus.name,minutes:exMinutes(focus),configuredMinutes:exMinutes(focus),period:focus.period,kind:'exercise'});setTimeout(renderExercicios,80)});
 document.querySelector('#finishExercise')?.addEventListener('click',()=>{window.BerthaTimeEngine?.finish?.();setTimeout(renderExercicios,100)});
 document.querySelector('#doneExercise')?.addEventListener('click',()=>addExerciseSession(focus.name,exMinutes(focus),today,'Registrado manualmente',{plannedName:focus.name,substituted:false,recordProgress:true}));
 document.querySelector('#otherExercise')?.addEventListener('click',()=>openOtherExercise(focus));
 document.querySelectorAll('[data-ex]').forEach(b=>b.onclick=e=>{e.stopPropagation();const x=loadEx();x.sessions=x.sessions.filter(s=>String(s.id)!==String(b.dataset.ex));saveEx(x);renderExercicios();});
}
function addExerciseSession(name,minutes,date,note='',opts={}){const d=loadEx();if(d.sessions.some(s=>s.date===date&&s.name===name)){alert('Esse treino já foi registrado hoje.');return;}const mins=Math.max(1,+minutes||30);d.sessions.push({id:uid(),name,duration:`${mins} min`,minutes:mins,date,note,plannedName:opts.plannedName||name,substituted:!!opts.substituted,createdAt:Date.now()});saveEx(d);if(opts.recordProgress)exerciseRecordProgress({name,minutes:mins,date,plannedName:opts.plannedName||name,substituted:!!opts.substituted,note});renderExercicios();}
function openOtherExercise(focus){
 const d=loadEx(),dlg=document.createElement('dialog');dlg.className='bertha-dialog';
 dlg.innerHTML=`<div class="bertha-modal study-v10-modal exercise-other-modal"><div class="bertha-modal-head"><div><div class="eyebrow">FIZ OUTRO</div><h2>O que você fez?</h2><p>Registre o movimento real sem perder o planejado.</p></div><button type="button" data-close>×</button></div><div class="exercise-other-list">${d.plans.filter(p=>String(p.id)!==String(focus?.id)).map(p=>`<button type="button" data-other-plan="${p.id}"><strong>${escapeHtml(p.name)}</strong><span>${escapeHtml(p.type)} · ${exMinutes(p)} min</span></button>`).join('')}<button type="button" data-other-new><strong>Registrar outro treino</strong><span>Nome e duração rápidos.</span></button></div></div>`;
 document.body.appendChild(dlg);const close=()=>dlg.close();dlg.querySelectorAll('[data-close]').forEach(b=>b.onclick=close);dlg.addEventListener('click',e=>{if(e.target===dlg)close()});dlg.onclose=()=>dlg.remove();
 dlg.querySelectorAll('[data-other-plan]').forEach(b=>b.onclick=()=>{const p=d.plans.find(x=>String(x.id)===String(b.dataset.otherPlan));if(!p)return;addExerciseSession(p.name,exMinutes(p),new Date().toISOString().slice(0,10),'Substituiu o treino planejado',{plannedName:focus?.name||'',substituted:true,recordProgress:true});close()});
 dlg.querySelector('[data-other-new]').onclick=()=>{close();setTimeout(()=>openQuickExercise(focus),60)};dlg.showModal();
}
function openQuickExercise(focus){
 const dlg=document.createElement('dialog');dlg.className='bertha-dialog';dlg.innerHTML=`<form class="bertha-modal study-v10-modal" id="quickExForm"><div class="bertha-modal-head"><div><div class="eyebrow">EXERCÍCIOS</div><h2>Registrar treino</h2></div><button type="button" data-close>×</button></div>${field('Nome',`<input id="qExName" required maxlength="70" placeholder="Ex.: Caminhada">`)}${field('Duração real (min)',`<input id="qExDur" type="number" min="1" value="20">`)}<div class="study-v10-actions"><button type="button" class="secondary" data-close>Cancelar</button><button class="primary" type="submit">Registrar</button></div></form>`;document.body.appendChild(dlg);const close=()=>dlg.close();dlg.querySelectorAll('[data-close]').forEach(b=>b.onclick=close);dlg.onclose=()=>dlg.remove();dlg.querySelector('#quickExForm').onsubmit=e=>{e.preventDefault();addExerciseSession(dlg.querySelector('#qExName').value.trim(),+dlg.querySelector('#qExDur').value||20,new Date().toISOString().slice(0,10),'Substituiu o treino planejado',{plannedName:focus?.name||'',substituted:true,recordProgress:true});close()};dlg.showModal();
}
function openExercisePlan(id=null){
 const d=loadEx(),current=id?d.plans.find(x=>String(x.id)===String(id)):null,p=normalizeExPlan(current||{}),dlg=document.createElement('dialog');dlg.className='bertha-dialog';
 const types=['Cardio','Força','Mobilidade','Caminhada','Pilates','Yoga','Outro'],days=['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
 dlg.innerHTML=`<form class="bertha-modal study-v10-modal" id="exForm"><div class="bertha-modal-head"><div><div class="eyebrow">EXERCÍCIOS</div><h2>${current?'Editar treino':'Novo treino'}</h2></div><button type="button" data-close>×</button></div>
 ${field('Nome',`<input id="eName" required maxlength="70" value="${escapeHtml(current?p.name:'')}" placeholder="Ex.: Pilates">`)}
 ${field('Tipo',`<select id="eType">${types.map(x=>`<option ${x===p.type?'selected':''}>${x}</option>`).join('')}</select>`)}
 <div class="form-grid">${field('Duração',`<input id="eDur" type="number" min="1" value="${p.durationValue}">`)}${field('Unidade',`<select id="eDurUnit"><option value="minutes" ${p.durationUnit==='minutes'?'selected':''}>minutos</option><option value="hours" ${p.durationUnit==='hours'?'selected':''}>horas</option></select>`)}</div>
 ${field('Frequência',`<select id="eFreq"><option ${p.frequency==='Dias específicos'?'selected':''}>Dias específicos</option><option ${p.frequency==='X vezes por semana'?'selected':''}>X vezes por semana</option><option ${p.frequency==='Conforme necessário'?'selected':''}>Conforme necessário</option></select>`)}
 <div id="eDays" style="display:flex;gap:7px;flex-wrap:wrap;margin:0 0 18px">${days.map(x=>`<label style="display:flex;gap:5px;align-items:center"><input type="checkbox" value="${x}" ${p.days.includes(x)?'checked':''}>${x}</label>`).join('')}</div>
 <div class="form-grid">${field('Período / janela',`<select id="ePeriod"><option value="flex" ${p.period==='flex'?'selected':''}>Flexível</option><option value="morning" ${p.period==='morning'?'selected':''}>Manhã</option><option value="afternoon" ${p.period==='afternoon'?'selected':''}>Tarde</option><option value="evening" ${p.period==='evening'?'selected':''}>Noite</option></select>`)}${field('Horário opcional',`<input id="eTime" type="time" value="${escapeHtml(p.time)}">`)}</div>
 ${field('Até quando?',`<select id="eUntil"><option value="none" ${p.untilMode==='none'?'selected':''}>Sem data final</option><option value="date" ${p.untilMode==='date'?'selected':''}>Até uma data</option></select><input id="eUntilDate" type="date" value="${escapeHtml(p.untilDate)}" style="margin-top:8px;${p.untilMode==='date'?'':'display:none'}">`)}
 ${field('Me avisar?',`<label style="display:flex;gap:10px;align-items:center"><input id="eNotify" type="checkbox" ${p.notify?'checked':''}> Sim</label>`)}
 <div id="eNotifyWrap" style="${p.notify?'':'display:none'}">${field('Quando avisar?',`<select id="eNotifyWhen">${['No horário da tarefa','10 min antes','30 min antes','1 hora antes','No início do período','Em um horário escolhido'].map(x=>`<option ${x===p.notifyWhen?'selected':''}>${x}</option>`).join('')}</select>`)}</div>
 ${field('Como fazer / plano (opcional)',`<textarea id="ePlan" rows="4" placeholder="Exercícios, séries, repetições ou orientação geral">${escapeHtml(p.plan)}</textarea>`)}
 ${field('Link do treino (opcional)',`<input id="eLink" type="url" value="${escapeHtml(p.link)}" placeholder="https://…">`)}
 ${field('Observação',`<textarea id="eNote" rows="3">${escapeHtml(p.note)}</textarea>`)}
 ${field('Status',`<select id="eActive"><option value="1" ${p.active?'selected':''}>Ativo</option><option value="0" ${!p.active?'selected':''}>Pausado</option></select>`)}
 <div class="study-v10-actions">${current?'<button type="button" class="danger" id="deleteExPlan">Excluir</button>':''}<button type="button" class="secondary" data-close>Cancelar</button><button class="primary" type="submit">Salvar</button></div></form>`;
 document.body.appendChild(dlg);const close=()=>dlg.close();dlg.querySelectorAll('[data-close]').forEach(b=>b.onclick=close);dlg.addEventListener('click',e=>{if(e.target===dlg)close()});dlg.addEventListener('cancel',e=>{e.preventDefault();close()});dlg.onclose=()=>dlg.remove();
 dlg.querySelector('#eUntil').onchange=e=>dlg.querySelector('#eUntilDate').style.display=e.target.value==='date'?'':'none';dlg.querySelector('#eNotify').onchange=e=>dlg.querySelector('#eNotifyWrap').style.display=e.target.checked?'':'none';dlg.querySelector('#eFreq').onchange=e=>dlg.querySelector('#eDays').style.display=e.target.value==='Dias específicos'?'flex':'none';dlg.querySelector('#eDays').style.display=p.frequency==='Dias específicos'?'flex':'none';
 dlg.querySelector('#deleteExPlan')?.addEventListener('click',()=>{if(!confirm(`Excluir “${p.name}”?`))return;d.plans=d.plans.filter(x=>String(x.id)!==String(p.id));saveEx(d);close();renderExercicios()});
 dlg.querySelector('#exForm').addEventListener('submit',e=>{e.preventDefault();const obj={...p,name:dlg.querySelector('#eName').value.trim(),type:dlg.querySelector('#eType').value,durationValue:Math.max(1,+dlg.querySelector('#eDur').value||30),durationUnit:dlg.querySelector('#eDurUnit').value,frequency:dlg.querySelector('#eFreq').value,days:[...dlg.querySelectorAll('#eDays input:checked')].map(x=>x.value),period:dlg.querySelector('#ePeriod').value,time:dlg.querySelector('#eTime').value,untilMode:dlg.querySelector('#eUntil').value,untilDate:dlg.querySelector('#eUntilDate').value,notify:dlg.querySelector('#eNotify').checked,notifyWhen:dlg.querySelector('#eNotifyWhen').value,plan:dlg.querySelector('#ePlan').value.trim(),link:dlg.querySelector('#eLink').value.trim(),note:dlg.querySelector('#eNote').value.trim(),active:dlg.querySelector('#eActive').value==='1'};d.plans=current?d.plans.map(x=>String(x.id)===String(p.id)?obj:x):[...d.plans,{...obj,id:uid()}];saveEx(d);close();renderExercicios()});dlg.showModal();
}

const FOOD_KEY="minha-vida.alimentacao.v1";
const FOOD_BASE={
 week:1,
 breakfasts:[
  ["Segunda","Pão frito + café com leite"],["Terça","Crepioca de cottage"],["Quarta","Waffle de queijo"],["Quinta","Panqueca"],["Sexta","Pão frito"],["Sábado","Cuscuz + queijo"],["Domingo","Panquecas + café com leite"]
 ],
 dinners:[
  ["Segunda","Frango assado com batatas + arroz + salada","terça"],
  ["Terça","Strogonoff de frango + arroz + batata palha + salada","quarta"],
  ["Quarta","Bife de alcatra acebolado + purê + brócolis","quinta"],
  ["Quinta","Ragu de carne + arroz + legumes","sexta"],
  ["Sexta","Hambúrguer caseiro + batata assada + salada",""],
  ["Sábado","Pizza caseira / noite de pizza",""],
  ["Domingo","Carne de panela com músculo + arroz + feijão + legumes",""]
 ],
 lunchbox:true,shoppingWeekly:true,cookingDone:false,mealLog:{}
};
function loadFood(){try{const d=JSON.parse(localStorage.getItem(FOOD_KEY));if(d)return {...FOOD_BASE,...d,mealLog:d.mealLog||{}};}catch{}return JSON.parse(JSON.stringify(FOOD_BASE));}
function saveFood(d){localStorage.setItem(FOOD_KEY,JSON.stringify(d));}
function foodTodayISO(){const x=new Date(),y=x.getFullYear(),m=String(x.getMonth()+1).padStart(2,"0"),d=String(x.getDate()).padStart(2,"0");return `${y}-${m}-${d}`;}
function foodDayName(){return ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"][new Date().getDay()];}
function plannedDinnerToday(d=loadFood()){const day=foodDayName();return d.dinners.find(x=>x[0]===day)||d.dinners[0];}
function recipeForMealName(name=""){const q=name.toLowerCase();const aliases=[
 ["frango assado","frango-assado"],["strogonoff","strogonoff"],["alcatra","alcatra"],["ragu","ragu"],["hambúrguer","hamburguer"],["hamburguer","hamburguer"],["carne de panela","musculo"],["panqueca","panquecas"],["frango grelhado","frango-grelhado"],["frango desfiado","frango-desfiado"],["risoto","risoto"],["porco assado","porco"],["carne moída","carne-legumes"],["frango gratinado","frango-gratinado"],["almôndega","almondegas"],["coxa","coxa-sobrecoxa"],["arroz de forno","arroz-forno"],["porco desfiado","porco-rap10"],["fraldinha","fraldinha"],["crepioca","crepioca"],["cuscuz","cuscuz"]
 ]; const hit=aliases.find(([a])=>q.includes(a));return hit?getRecipeById(hit[1]):null;}
function foodDayIndex(){return new Date().getDay();}
function foodBreakfastToday(d=loadFood()){const day=foodDayName();return d.breakfasts.find(x=>x[0]===day)||null;}
function foodYesterdayName(){return ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"][(new Date().getDay()+6)%7];}
function foodLunchToday(d=loadFood()){const y=foodYesterdayName(),prev=d.dinners.find(x=>x[0]===y);return prev?`Marmita: ${String(prev[1]||'').split(' + ')[0]}`:'Marmita / almoço de hoje';}
function getTodayMeals(){const d=loadFood(),key=foodTodayISO(),breakfast=foodBreakfastToday(d),dinner=plannedDinnerToday(d);return [
 {id:'breakfast',label:'Café da manhã',name:breakfast?.[1]||'Café da manhã',recipe:recipeForMealName(breakfast?.[1]||'')},
 {id:'lunch',label:'Almoço',name:foodLunchToday(d),recipe:null},
 {id:'dinner',label:'Jantar',name:dinner?.[1]||'Jantar de hoje',recipe:recipeForMealName(dinner?.[1]||'')}
].map(m=>({...m,log:(d.mealLog[key]?.meals||{})[m.id]||{}}));}
function getTodayMealState(mealId='dinner'){const d=loadFood(),key=foodTodayISO(),meal=getTodayMeals().find(x=>x.id===mealId)||getTodayMeals()[2],log=meal.log||{},selected=getRecipeById(log.selectedRecipeId)||meal.recipe;return {d,key,meal,plannedRecipe:meal.recipe,log,selected};}
function saveTodayMealChoice(mealId,recipeId,source="planned",otherText=""){const {d,key,meal}=getTodayMealState(mealId);d.mealLog[key]=d.mealLog[key]||{};d.mealLog[key].meals=d.mealLog[key].meals||{};d.mealLog[key].meals[mealId]={...(d.mealLog[key].meals[mealId]||{}),plannedRecipeId:meal.recipe?.id||null,selectedRecipeId:recipeId||null,otherText:otherText||'',source,selectedAt:new Date().toISOString()};saveFood(d);}
function foodNumeric(v){const n=Number(String(v??'').replace(',','.'));return Number.isFinite(n)?n:null;}
function foodRecipeCalories(recipe){
 if(!recipe?.nutrition)return {kcal:null,source:'Sem informação nutricional cadastrada',complete:false};
 const kcal=foodNumeric(recipe.nutrition.kcal);if(kcal==null)return {kcal:null,source:'Sem kcal cadastradas na receita',complete:false};
 const ref=recipe.nutrition.reference||'100g';
 if(ref==='portion')return {kcal:Math.round(kcal),source:'Receita cadastrada · por porção',complete:true};
 if(ref==='whole'){
  const m=String(recipe.yield||'').match(/([0-9]+(?:[.,][0-9]+)?)\s*(?:porç|unid)/i),portions=m?foodNumeric(m[1]):null;
  if(portions&&portions>0)return {kcal:Math.round(kcal/portions),source:`Receita cadastrada · prato completo ÷ ${String(portions).replace('.',',')} porções`,complete:true};
  return {kcal:null,source:'Receita cadastrada · prato completo, porção consumida não informada',complete:false};
 }
 if(ref==='100g')return {kcal:null,source:'Receita cadastrada · kcal/100 g, quantidade consumida não informada',complete:false};
 return {kcal:null,source:'Informação nutricional de ingrediente; total da refeição não calculado',complete:false};
}
function recordRecipeConsumption(mealId,title,source){
 try{
  const st=getTodayMealState(mealId),recipe=st.selected||null,nut=foodRecipeCalories(recipe),d=loadRec(),date=foodTodayISO(),key=`${date}:${mealId}`;
  d.consumptionLog=(d.consumptionLog||[]).filter(x=>x.key!==key);
  d.consumptionLog.push({key,date,mealId,mealLabel:st.meal?.label||mealId,plannedRecipeId:st.plannedRecipe?.id||null,recipeId:recipe?.id||null,title:title||recipe?.name||st.meal?.name||'Refeição',source:source||'planned',kcal:nut.kcal,kcalSource:nut.source,kcalComplete:!!nut.complete,recordedAt:new Date().toISOString()});
  saveRec(d);
 }catch(e){console.warn('BERTH.A receitas/consumo',e)}
}
function removeRecipeConsumption(mealId,date=foodTodayISO()){try{const d=loadRec(),key=`${date}:${mealId}`;d.consumptionLog=(d.consumptionLog||[]).filter(x=>x.key!==key);saveRec(d)}catch(e){console.warn('BERTH.A receitas/desfazer consumo',e)}}
function recordFoodProgress(mealId,title,source){
 try{
  const st=getTodayMealState(mealId),recipe=st.selected||null,nut=foodRecipeCalories(recipe),data=JSON.parse(localStorage.getItem('bertha.time-engine.v1')||'{}');data.history=Array.isArray(data.history)?data.history:[];const key=`food:${foodTodayISO()}:${mealId}`;data.history=data.history.filter(h=>h.itemId!==key);data.history.push({id:`${key}:${Date.now()}`,itemId:key,source:'Alimentação',category:'Alimentação',title:title||'Refeição',status:'done',startedAt:Date.now(),endedAt:Date.now(),realMinutes:0,learningKey:`meal:${mealId}`,mealId,recipeId:recipe?.id||null,plannedRecipeId:st.plannedRecipe?.id||null,mealSource:source||'planned',kcal:nut.kcal,kcalSource:nut.source,kcalComplete:!!nut.complete});localStorage.setItem('bertha.time-engine.v1',JSON.stringify(data));
 }catch(e){console.warn('BERTH.A alimentação/progresso',e)}
}
function refreshFoodRoute(){if(state.route==='receitas')renderReceitas();else if(state.route==='alimentacao')renderAlimentacao();else if(state.route==='meu-dia')renderMeuDia();else if(state.route==='progresso')renderProgressOverview();}
function setTodayMealConsumption(mealId,status,title,source){const {d,key}=getTodayMealState(mealId);d.mealLog[key]=d.mealLog[key]||{};d.mealLog[key].meals=d.mealLog[key].meals||{};d.mealLog[key].meals[mealId]={...(d.mealLog[key].meals[mealId]||{}),consumption:status,consumedAt:new Date().toISOString()};saveFood(d);if(status==='consumed'){recordRecipeConsumption(mealId,title,source);recordFoodProgress(mealId,title,source)}refreshFoodRoute();}
function undoTodayMeal(mealId){const d=loadFood(),key=foodTodayISO();if(d.mealLog?.[key]?.meals?.[mealId]){delete d.mealLog[key].meals[mealId];if(!Object.keys(d.mealLog[key].meals).length)delete d.mealLog[key];saveFood(d)}removeRecipeConsumption(mealId,key);try{const data=JSON.parse(localStorage.getItem('bertha.time-engine.v1')||'{}');data.history=Array.isArray(data.history)?data.history:[];const progressKey=`food:${key}:${mealId}`;data.history=data.history.filter(h=>h.itemId!==progressKey);localStorage.setItem('bertha.time-engine.v1',JSON.stringify(data));}catch(e){console.warn('BERTH.A alimentação/desfazer',e)}refreshFoodRoute();}
function openRecipesFromFood(action,mealId,recipeId){
 const run=()=>{if(action==='other')openChooseRecipe(mealId);else if(action==='view'&&recipeId)openFoodRecipe(recipeId,false,mealId)};
 if(state.route==='receitas'){run();return}
 location.hash='receitas';setTimeout(run,60);
}
function ensureFoodModuleStyles(){
 if(document.getElementById('bertha-food-v115-styles'))return;
 const st=document.createElement('style');st.id='bertha-food-v115-styles';st.textContent=`
 .food-v115{--food-blue:#6f98bd;--food-blue-deep:#547ca2;--food-blue-soft:#eaf3fb;--food-butter:#fff4d7;--food-peach:#f9eadf;--food-ink:#35303d;--food-muted:#8b838e}
 .food-v115-hero{position:relative;overflow:hidden;margin:2px 0 18px;padding:24px 26px 25px;border:1px solid rgba(113,137,164,.18);border-radius:26px;background:radial-gradient(circle at 18% 16%,rgba(199,225,247,.72),transparent 42%),radial-gradient(circle at 83% 80%,rgba(255,234,197,.68),transparent 38%),linear-gradient(135deg,rgba(242,248,252,.94),rgba(255,250,242,.94));box-shadow:0 14px 36px rgba(79,93,110,.055)}
 .food-v115-hero .eyebrow{display:block;margin-bottom:13px;color:#537fa6;letter-spacing:.18em;font-weight:800}
 .food-v115-hero h2{max-width:82%;margin:0 0 8px;color:#343441;font-size:30px;line-height:1.06;font-weight:520;letter-spacing:-.025em}
 .food-v115-hero p{max-width:82%;margin:13px 0 0;color:#7f7b84;font-size:17px;line-height:1.42}
 .food-v115-abstract{position:absolute;right:28px;top:28px;width:28px;height:24px;color:rgba(109,113,122,.42)}
 .food-v115-abstract:before{content:"";position:absolute;left:0;top:1px;width:28px;border-top:1.5px solid currentColor}
 .food-v115-abstract:after{content:"";position:absolute;left:0;top:7px;width:25px;height:12px;border:1.5px solid currentColor;border-top:0;border-radius:0 0 14px 14px}
 .food-v115-today{margin:0 0 18px;padding:20px 22px;border:1px solid rgba(109,136,164,.14);border-radius:25px;background:radial-gradient(circle at 84% 12%,rgba(255,236,199,.20),transparent 34%),linear-gradient(135deg,rgba(255,254,250,.92),rgba(255,250,240,.76));box-shadow:0 12px 30px rgba(72,89,106,.045)}
 .food-v115-today-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;padding-bottom:14px;border-bottom:1px solid rgba(80,103,126,.09)}
 .food-v115-today-head h3{margin:4px 0 0;font-size:24px;color:#3c3742;letter-spacing:-.02em}.food-v115-today-head .eyebrow{color:#657f99}
 .food-v115-today-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0}
 .food-v115-meal{min-width:0;padding:16px 14px 4px}.food-v115-meal+ .food-v115-meal{border-left:1px solid rgba(80,103,126,.09)}
 .food-v115-meal-label{display:flex;align-items:center;gap:7px;color:#7d858d;font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}
 .food-v115-meal-icon{width:22px;height:22px;display:grid;place-items:center;color:var(--food-blue-deep)}
 .food-v115-meal-icon svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
 .food-v115-meal strong{display:block;margin-top:9px;color:#34323b;font-size:14px;line-height:1.28;min-height:36px}
 .food-v115-actions{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-top:11px}
 .food-v115-actions button{min-height:34px!important;padding:7px 10px!important;border-radius:999px!important;border:1px solid rgba(93,132,166,.22)!important;background:rgba(235,244,251,.58)!important;color:#557b9d!important;font-size:11px!important;font-weight:760!important;box-shadow:none!important}
 .food-v115-actions button:hover{background:rgba(226,239,249,.8)!important}.food-v115-actions .food-view-btn{width:34px;padding:0!important;display:grid;place-items:center}
 .food-v115-actions .food-done-state{background:linear-gradient(135deg,rgba(223,239,250,.86),rgba(255,244,215,.74))!important}
 .food-v115-week{margin:0 0 18px}.food-v115-section-kicker{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 3px 9px}.food-v115-section-kicker .eyebrow{color:#6f7f90}
 .food-v115-card{border:1px solid rgba(104,125,146,.13)!important;border-radius:24px!important;background:radial-gradient(circle at 88% 10%,rgba(255,237,203,.14),transparent 32%),linear-gradient(145deg,rgba(255,254,250,.91),rgba(255,251,243,.72))!important;box-shadow:0 11px 26px rgba(72,89,106,.04)!important}
 .food-v115-breakfast{padding:17px 18px!important}.food-v115-breakfast-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}.food-v115-breakfast-head h3{margin:0;font-size:19px}.food-v115-pill{border-radius:999px;padding:6px 10px;background:rgba(255,239,211,.78);color:#8b7862;font-size:11px;font-weight:800}
 .food-v115-days{display:flex;gap:7px;overflow-x:auto;padding:2px 0 4px;scrollbar-width:none}.food-v115-days::-webkit-scrollbar{display:none}.food-v115-day{flex:0 0 92px;padding:11px 9px;border:1px solid rgba(98,126,154,.1);border-radius:15px;background:linear-gradient(145deg,rgba(255,249,238,.76),rgba(255,254,250,.78));text-align:center}.food-v115-day.today{background:linear-gradient(145deg,rgba(220,237,250,.9),rgba(245,249,252,.86));border-color:rgba(91,135,174,.17)}.food-v115-day b{display:block;color:#65798d;font-size:10px;letter-spacing:.08em;text-transform:uppercase}.food-v115-day span{display:block;margin-top:6px;color:#514c55;font-size:11px;line-height:1.25}
 .food-v115-dinner{padding:17px 18px!important;margin-top:10px}.food-v115-dinner-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding-bottom:8px}.food-v115-dinner-head h3{margin:0;font-size:20px}.food-v115-dinner-row{display:grid;grid-template-columns:50px minmax(0,1fr) auto;gap:10px;align-items:center;padding:11px 0;border-top:1px solid rgba(84,105,126,.08)}.food-v115-dinner-row:first-of-type{border-top:0}.food-v115-daytag{display:inline-flex;justify-content:center;padding:6px 7px;border-radius:999px;background:var(--food-blue-soft);color:#5d84a7;font-size:10px;font-weight:850}.food-v115-dinner-row strong{font-size:13px;line-height:1.25;color:#3f3a43}.food-v115-dinner-row small{display:block;margin-top:3px;color:#9a929b}.food-v115-recipe-btn{width:34px;height:34px;border:1px solid rgba(93,132,166,.18)!important;border-radius:12px!important;background:rgba(239,246,251,.64)!important;color:#5c83a5!important;padding:0!important;display:grid!important;place-items:center!important;box-shadow:none!important}
 .food-v115-routine-title{margin:20px 3px 9px;color:#74707b;letter-spacing:.16em}.food-v115-routine{padding:18px!important}.food-v115-routine label{display:grid;grid-template-columns:auto 1fr;gap:13px;align-items:center}.food-v115-routine input{width:24px;height:24px;accent-color:#6d95b8}.food-v115-routine strong,.food-v115-routine small{display:block}.food-v115-routine strong{font-size:17px}.food-v115-routine small{margin-top:3px;color:#8d858f;line-height:1.35}.food-v115-cookdate{margin-top:5px!important;color:#6f89a2!important;font-size:12px!important;font-weight:650;letter-spacing:.01em}
 @media(max-width:520px){.food-v115-hero{padding:22px 22px 23px}.food-v115-hero h2{font-size:28px}.food-v115-hero h2,.food-v115-hero p{max-width:84%}.food-v115-abstract{right:24px;top:27px;width:28px;height:24px}.food-v115-today{padding:18px 16px}.food-v115-today-grid{grid-template-columns:1fr}.food-v115-meal{padding:13px 2px}.food-v115-meal+.food-v115-meal{border-left:0;border-top:1px solid rgba(80,103,126,.08)}.food-v115-meal strong{min-height:0;font-size:15px}.food-v115-actions{margin-top:9px}.food-v115-dinner-row{grid-template-columns:44px minmax(0,1fr) auto}}
 `;document.head.appendChild(st)
}
function foodMealLineIcon(id){const icons={breakfast:'<path d="M4 8h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8z"/><path d="M16 10h2a2 2 0 0 1 0 4h-2"/><path d="M7 5c0-1 1-1 1-2M11 5c0-1 1-1 1-2"/>',lunch:'<path d="M7 3v8M4 3v5c0 2 6 2 6 0V3M7 11v10M16 3v18M16 3c4 3 4 8 0 10"/>',dinner:'<path d="M20 14.5A8 8 0 0 1 9.5 4a7 7 0 1 0 10.5 10.5z"/>'};return `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[id]||icons.dinner}</svg>`}
function renderTodayFoodCard(){const meals=getTodayMeals();return `<section class="food-v115-today"><div class="food-v115-today-head"><div><span class="eyebrow">COMIDA DE HOJE · ${escapeHtml(foodDayName().toUpperCase())}</span><h3>Seu dia já começa decidido.</h3></div></div><div class="food-v115-today-grid">${meals.map(m=>{const selected=getRecipeById(m.log.selectedRecipeId)||m.recipe,name=m.log.otherText||selected?.name||m.name,done=m.log.consumption==='consumed';return `<div class="food-v115-meal"><div class="food-v115-meal-label"><span class="food-v115-meal-icon">${foodMealLineIcon(m.id)}</span>${escapeHtml(m.label)}</div><strong>${escapeHtml(name)}</strong><div class="food-v115-actions">${done?`<button type="button" class="food-done-state" data-food-undo="${m.id}">Desfazer</button><button type="button" data-food-other="${m.id}">Alterar</button>`:`<button type="button" data-food-done="${m.id}">Fiz esta</button><button type="button" data-food-other="${m.id}">Fiz outra</button>`}${selected?`<button type="button" class="food-view-btn" aria-label="Ver receita" data-food-view="${m.id}">›</button>`:''}</div></div>`}).join('')}</div></section>`;}
function bindTodayFoodActions(){document.querySelectorAll('[data-food-done]').forEach(b=>b.onclick=()=>{const s=getTodayMealState(b.dataset.foodDone),title=s.log.otherText||s.selected?.name||s.meal.name;setTodayMealConsumption(b.dataset.foodDone,'consumed',title,s.log.source||'planned')});document.querySelectorAll('[data-food-undo]').forEach(b=>b.onclick=()=>undoTodayMeal(b.dataset.foodUndo));document.querySelectorAll('[data-food-other]').forEach(b=>b.onclick=()=>state.route==='alimentacao'?openRecipesFromFood('other',b.dataset.foodOther):openChooseRecipe(b.dataset.foodOther));document.querySelectorAll('[data-food-view]').forEach(b=>b.onclick=()=>{const st=getTodayMealState(b.dataset.foodView);if(st.selected){if(state.route==='alimentacao')openRecipesFromFood('view',b.dataset.foodView,st.selected.id);else openFoodRecipe(st.selected.id,false,b.dataset.foodView)}});}
function renderFoodMeuDiaMini(){
 return `<div class="home-recipes-shortcut-wrap"><a class="home-recipes-shortcut" href="#receitas" onclick="setTimeout(()=>document.querySelector('.recipe-today')?.scrollIntoView({behavior:'smooth',block:'start'}),90)"><span class="home-recipes-shortcut-icon">${recipeMealIcon()}</span><span>Receitas do dia</span><b>→</b></a></div>`;
}
function foodPrepProgressKey(d){return d?.cookingProgressKey||null;}
function recordFoodPrepProgress(){
 const d=loadFood(),now=Date.now(),iso=foodTodayISO(),key=`foodprep:${iso}:quinzenal`;
 d.cookingDone=true;d.cookingDoneAt=now;d.cookingProgressKey=key;saveFood(d);
 try{const data=JSON.parse(localStorage.getItem('bertha.time-engine.v1')||'{}');data.history=Array.isArray(data.history)?data.history:[];data.history=data.history.filter(h=>h.itemId!==key);data.history.push({id:`${key}:${now}`,itemId:key,source:'Alimentação',category:'Alimentação',title:'Cozinha quinzenal',status:'done',startedAt:now,endedAt:now,realMinutes:0,learningKey:'food-prep:quinzenal',activityType:'foodPrep'});localStorage.setItem('bertha.time-engine.v1',JSON.stringify(data));}catch(e){console.warn('BERTH.A preparo/progresso',e)}
}
function undoFoodPrepProgress(){
 const d=loadFood(),key=foodPrepProgressKey(d);d.cookingDone=false;d.cookingDoneAt=null;d.cookingProgressKey=null;saveFood(d);
 if(key)try{const data=JSON.parse(localStorage.getItem('bertha.time-engine.v1')||'{}');data.history=Array.isArray(data.history)?data.history:[];data.history=data.history.filter(h=>h.itemId!==key);localStorage.setItem('bertha.time-engine.v1',JSON.stringify(data));}catch(e){console.warn('BERTH.A preparo/desfazer',e)}
}
function foodPrepDateLabel(ts){if(!ts)return'';try{return new Date(ts).toLocaleDateString('pt-BR')}catch{return''}}
function renderAlimentacao(){
 ensureFoodModuleStyles();
 const d=loadFood(),today=foodDayName();
 const dayAbbr={Segunda:'SEG',Terça:'TER',Quarta:'QUA',Quinta:'QUI',Sexta:'SEX',Sábado:'SÁB',Domingo:'DOM'};
 app.innerHTML=`<div class="food-v115"><section class="food-v115-hero"><span class="eyebrow">ALIMENTAÇÃO</span><h2>Know what’s next.</h2><p>Você escolhe. A BERTH.A organiza seu dia.</p><span class="food-v115-abstract" aria-hidden="true"></span></section>${renderTodayFoodCard()}<section class="food-v115-week"><div class="food-v115-section-kicker"><span class="eyebrow">SEMANA ${escapeHtml(String(d.week||1))} · CARDÁPIO</span></div><div class="card food-v115-card food-v115-breakfast"><div class="food-v115-breakfast-head"><h3>Café da manhã</h3><span class="food-v115-pill">7 dias</span></div><div class="food-v115-days">${d.breakfasts.map(x=>`<div class="food-v115-day ${x[0]===today?'today':''}"><b>${dayAbbr[x[0]]||escapeHtml(x[0].slice(0,3))}</b><span>${escapeHtml(x[1])}</span></div>`).join('')}</div></div><div class="card food-v115-card food-v115-dinner"><div class="food-v115-dinner-head"><h3>Jantar + marmita</h3><span class="food-v115-pill">3 pessoas</span></div>${d.dinners.map(x=>{const r=recipeForMealName(x[1]);return `<div class="food-v115-dinner-row"><span class="food-v115-daytag">${dayAbbr[x[0]]||escapeHtml(x[0].slice(0,3))}</span><div><strong>${escapeHtml(x[1])}</strong>${x[2]?`<small>marmita → ${escapeHtml(x[2])}</small>`:''}</div>${r?`<button type="button" class="food-v115-recipe-btn" aria-label="Ver receita" data-food-recipe="${r.id}">›</button>`:'<span></span>'}</div>`}).join('')}</div></section><div class="section-title food-v115-routine-title">ROTINA DE PREPARO</div><div class="card food-v115-card food-v115-routine"><label><input type="checkbox" id="foodCook" ${d.cookingDone?'checked':''}><span><strong>Cozinha quinzenal</strong><small>Produzir bases, porcionar, etiquetar e congelar.</small>${d.cookingDoneAt?`<small class="food-v115-cookdate">Concluída em ${foodPrepDateLabel(d.cookingDoneAt)}</small>`:''}</span></label></div></div>`;
 document.querySelector('#foodCook').onchange=e=>{if(e.target.checked)recordFoodPrepProgress();else undoFoodPrepProgress();renderAlimentacao()};bindTodayFoodActions();document.querySelectorAll('[data-food-recipe]').forEach(b=>b.onclick=()=>openFoodRecipe(b.dataset.foodRecipe,false));
}
// ===== BERTH.A v2.8.60 · Lista de Compras Universal + Saúde + Meu Progresso =====
const HEALTH_KEY="minha-vida.saude.v1";
const SHOP_BASE_KEY="minha-vida.compras.base.v1";
function loadHealth(){try{const d=JSON.parse(localStorage.getItem(HEALTH_KEY)||"[]");return Array.isArray(d)?d.filter(Boolean):[]}catch{return []}}
function saveHealth(items){localStorage.setItem(HEALTH_KEY,JSON.stringify(items||[]))}
function shopMoney(v){const n=Number(String(v??"").replace(',','.'));return Number.isFinite(n)?n:0}
function shopMoneyBR(v){return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(shopMoney(v))}
function shopDateLabel(ts){if(!ts)return'';const d=new Date(ts);return Number.isNaN(d.getTime())?'':d.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric'})}
function shopCategoryLabel(v){return v||'Outros'}
function shopSvg(name){const p={bag:'<path d="M6 8h12l1 13H5L6 8z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/>',edit:'<path d="M4 20h4l11-11-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/>',trash:'<path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13"/>',plus:'<path d="M12 5v14M5 12h14"/>',trend:'<path d="M4 17l5-5 4 4 7-8"/><path d="M15 8h5v5"/>',heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>',check:'<path d="M5 12l4 4L19 6"/>'};return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p[name]||p.bag}</svg>`}
function ensureShoppingStyles(){if(document.getElementById('bertha-shopping-styles'))return;const st=document.createElement('style');st.id='bertha-shopping-styles';st.textContent=`
.shop-hero{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin:4px 0 14px}.shop-hero h2{margin:2px 0 4px}.shop-hero p{margin:0;color:#776d79}.shop-icon-btn{width:44px;height:44px;border:0;border-radius:14px;background:#f2eaf4;color:#76577f;display:grid;place-items:center}.shop-icon-btn svg{width:22px;height:22px}.shop-summary{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px}.shop-summary .card{padding:14px}.shop-summary b{display:block;font-size:24px;color:#493b50}.shop-summary span{font-size:12px;color:#807681}.shop-section{margin:14px 0}.shop-section-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}.shop-section-head h3{margin:0;font-size:15px}.shop-row{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:10px;align-items:center;padding:12px 0;border-bottom:1px solid rgba(91,72,96,.09)}.shop-row:last-child{border-bottom:0}.shop-row.done .shop-main strong{text-decoration:line-through;opacity:.62}.shop-row input[type=checkbox]{width:22px;height:22px}.shop-main{min-width:0}.shop-main strong,.shop-main small{display:block}.shop-main small{margin-top:3px;color:#817783;line-height:1.3}.shop-actions{display:flex;gap:4px}.shop-actions button{width:38px;height:38px;border:0;background:transparent;border-radius:12px;color:#746679;display:grid;place-items:center}.shop-actions svg{width:19px;height:19px}.shop-add{width:100%;display:flex;gap:8px;align-items:center;justify-content:center}.shop-add svg{width:19px;height:19px}.shop-filter{display:flex;gap:7px;overflow:auto;padding-bottom:3px}.shop-filter button{white-space:nowrap;border:1px solid #e7dde8;background:#fff;border-radius:999px;padding:8px 12px;color:#6d6270}.shop-filter button.active{background:#efe6f1;color:#705279;border-color:#d9c7df}.shop-history-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;padding:11px 0;border-bottom:1px solid rgba(91,72,96,.08)}.shop-history-row:last-child{border-bottom:0}.shop-history-row small{display:block;color:#817783;margin-top:3px}.progress-category{display:block;text-decoration:none;color:inherit;padding:15px 0;border-bottom:1px solid rgba(91,72,96,.09)}.progress-category:last-child{border-bottom:0}.progress-category-head{display:flex;justify-content:space-between;gap:10px;align-items:center}.progress-category-head strong{font-size:16px}.progress-category-head b{font-size:16px;color:#6e5574}.progress-category small{display:block;margin-top:4px;color:#817783}.progress-detail{margin-top:9px;padding-top:9px;border-top:1px dashed rgba(91,72,96,.13)}.progress-detail div{display:flex;justify-content:space-between;gap:12px;padding:4px 0;font-size:13px}.progress-detail span:last-child{text-align:right;color:#786d7a}.progress-food-calories{margin-top:12px;padding:12px;border:1px solid rgba(91,72,96,.08);border-radius:16px;background:rgba(255,255,255,.42)}.progress-food-calories>strong{display:block;font-size:13px;margin-bottom:6px}.progress-food-kcal-row{display:grid!important;grid-template-columns:auto 1fr;gap:3px 10px!important;padding:7px 0!important;border-bottom:1px solid rgba(91,72,96,.06)}.progress-food-kcal-row:last-child{border-bottom:0}.progress-food-kcal-row>span:nth-child(2){text-align:right;color:#6f6372}.progress-food-kcal-row small{grid-column:1/-1;margin:0!important;font-size:11px;color:#948994}.health-mini-list{display:grid;gap:8px}.health-mini-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;padding:10px 0;border-bottom:1px solid rgba(91,72,96,.08)}.health-mini-row:last-child{border-bottom:0}.health-mini-row small{display:block;color:#817783;margin-top:2px}.health-mini-actions{display:flex;gap:4px}.health-mini-actions button{border:0;background:#f3edf4;color:#76577f;border-radius:12px;padding:8px 10px;font-weight:700}.shopping-modal-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.shopping-modal-grid label{min-width:0}.shopping-modal-grid input,.shopping-modal-grid select{width:100%;box-sizing:border-box}@media(max-width:480px){.shopping-modal-grid{grid-template-columns:1fr}.shop-summary{grid-template-columns:1fr 1fr}.shop-row{grid-template-columns:auto minmax(0,1fr);}.shop-actions{grid-column:2;justify-content:flex-end}}
`;document.head.appendChild(st)}
function loadShoppingBase(){try{const x=JSON.parse(localStorage.getItem(SHOP_BASE_KEY)||"[]");return Array.isArray(x)?x.filter(Boolean):[]}catch{return []}}
function saveShoppingBase(x){localStorage.setItem(SHOP_BASE_KEY,JSON.stringify(x||[]))}
function shoppingPending(){return loadSharedShopping().filter(x=>!x.done)}
function addBaseToCurrent(){const base=loadShoppingBase(),all=loadSharedShopping();let added=0;base.forEach(b=>{const key=String(b.name||'').trim().toLocaleLowerCase('pt-BR');if(!key||all.some(x=>!x.done&&String(x.name||'').trim().toLocaleLowerCase('pt-BR')===key))return;all.push({id:uid(),name:b.name,qty:b.qty??'',unit:b.unit||'',category:b.category||'Outros',source:'Lista base',expectedValue:b.expectedValue??'',actualValue:'',createdAt:Date.now(),done:false,cycle:'base'});added++});if(added)saveSharedShopping(all);renderShoppingUniversal()}
function openClosePurchaseDialog(){const all=loadSharedShopping(),session=all.filter(x=>x.done&&!x.closedAt);if(!session.length){alert('Ainda não há itens comprados para encerrar nesta compra.');return}const base=loadShoppingBase(),baseKeys=new Set(base.map(x=>String(x.name||'').trim().toLocaleLowerCase('pt-BR'))),dlg=document.createElement('dialog');dlg.className='study-v10-dialog close-purchase-dialog';dlg.innerHTML=`<form class="study-v10-modal close-purchase-modal" id="closePurchaseForm"><div class="study-v10-head"><div><div class="eyebrow">ENCERRAR COMPRA</div><h2>Compra concluída</h2><p>Selecione, item por item, o que deseja manter na Lista base para as próximas compras.</p></div><button type="button" class="study-v10-x" data-close>×</button></div><div class="close-purchase-list">${session.map((x,i)=>`<label class="close-purchase-item"><input type="checkbox" data-keep-base="${i}" ${baseKeys.has(String(x.name||'').trim().toLocaleLowerCase('pt-BR'))?'checked':''}><span class="close-purchase-check" aria-hidden="true"></span><span class="close-purchase-copy"><strong>${escapeHtml(x.name)}</strong>${shoppingMeta(x)?`<small>${escapeHtml(shoppingMeta(x))}</small>`:''}</span><span class="close-purchase-base">Lista base</span></label>`).join('')}</div><div class="close-purchase-hint">Os itens não selecionados continuam no histórico da compra, mas não entram na Lista base.</div><div class="modal-actions close-purchase-actions"><button type="button" class="secondary" data-close>Cancelar</button><div class="grow"></div><button type="submit" class="primary">Encerrar compra</button></div></form>`;document.body.appendChild(dlg);dlg.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>dlg.close());dlg.addEventListener('close',()=>dlg.remove());dlg.querySelector('#closePurchaseForm').onsubmit=e=>{e.preventDefault();const next=[...base];session.forEach((x,i)=>{if(dlg.querySelector(`[data-keep-base="${i}"]`)?.checked){const key=String(x.name||'').trim().toLocaleLowerCase('pt-BR'),j=next.findIndex(b=>String(b.name||'').trim().toLocaleLowerCase('pt-BR')===key),entry={id:j>=0?next[j].id:uid(),name:x.name,qty:x.qty??'',unit:x.unit||'',category:x.category||'Outros',expectedValue:x.expectedValue??'',updatedAt:Date.now()};if(j>=0)next[j]={...next[j],...entry};else next.push(entry)}x.closedAt=Date.now()});saveShoppingBase(next);saveSharedShopping(all);dlg.close();renderShoppingUniversal()};dlg.showModal()}
function markShoppingDone(id,done){const all=loadSharedShopping(),x=all.find(i=>String(i.id)===String(id));if(!x)return;x.done=!!done;if(x.done){x.purchasedAt=x.purchasedAt||Date.now()}else{x.purchasedAt=null;x.actualValue=""}saveSharedShopping(all)}
function shoppingMeta(x){const q=[x.qty,x.unit].filter(Boolean).join(' '),parts=[];if(q)parts.push(q);if(x.category)parts.push(x.category);if(x.source)parts.push(x.source);return parts.join(' · ')}
function renderShoppingUniversal(){ensureShoppingStyles();const items=loadSharedShopping(),pending=items.filter(x=>!x.done),done=items.filter(x=>x.done).sort((a,b)=>(b.purchasedAt||b.createdAt||0)-(a.purchasedAt||a.createdAt||0)),base=loadShoppingBase(),openBought=done.filter(x=>!x.closedAt);const cats=[...new Set(pending.map(x=>shopCategoryLabel(x.category)))];app.innerHTML=`<section class="shop-hero"><div><div class="eyebrow">O QUE PRECISO ADQUIRIR?</div><h2>Lista de Compras</h2><p>Uma lista só, independente de onde a necessidade nasceu.</p></div><button class="shop-icon-btn" id="shopAddTop" aria-label="Adicionar item">${shopSvg('plus')}</button></section><div class="shop-summary"><div class="card"><span>Pendentes</span><b>${pending.length}</b></div><div class="card"><span>Comprados neste mês</span><b>${done.filter(x=>new Date(x.purchasedAt||0).toISOString().slice(0,7)===new Date().toISOString().slice(0,7)).length}</b></div></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px"><button class="secondary" id="shopUseBase" ${base.length?'':'disabled'}>Usar Lista base${base.length?` · ${base.length}`:''}</button><button class="primary" id="shopClosePurchase" ${openBought.length?'':'disabled'}>Encerrar compra${openBought.length?` · ${openBought.length}`:''}</button></div><div class="shop-filter" id="shopFilter"><button class="active" data-shop-filter="all">Todos</button>${cats.map(c=>`<button data-shop-filter="${escapeHtml(c)}">${escapeHtml(c)}</button>`).join('')}</div><section class="shop-section"><div class="card" id="shoppingPendingCard">${renderShoppingRows(pending)}</div><button class="secondary shop-add" id="shopAddBottom" style="margin-top:10px">${shopSvg('plus')}<span>Adicionar item</span></button></section><section class="shop-section"><div class="shop-section-head"><h3>Comprados recentemente</h3><a href="#progresso">Ver progresso</a></div><div class="card">${done.length?done.slice(0,12).map(x=>`<div class="shop-history-row"><div><strong>${escapeHtml(x.name)}</strong><small>${escapeHtml(shoppingMeta(x))}${x.purchasedAt?` · ${shopDateLabel(x.purchasedAt)}`:''}</small></div><b>${shopMoney(x.actualValue)?shopMoneyBR(x.actualValue):'—'}</b></div>`).join(''):'<div class="empty compact"><strong>Ainda não há compras registradas.</strong><span>Quando marcar um item como comprado, ele aparece aqui.</span></div>'}</div></section>`;bindShoppingUniversal()}
function renderShoppingRows(items){return items.length?items.map(x=>`<div class="shop-row ${x.done?'done':''}" data-shop-row="${x.id}" data-shop-category="${escapeHtml(shopCategoryLabel(x.category))}"><input type="checkbox" data-shop-toggle="${x.id}" ${x.done?'checked':''} aria-label="Marcar comprado"><div class="shop-main"><strong>${escapeHtml(x.name)}</strong><small>${escapeHtml(shoppingMeta(x))}${shopMoney(x.expectedValue)?` · previsto ${shopMoneyBR(x.expectedValue)}`:''}</small></div><div class="shop-actions"><button type="button" data-shop-edit="${x.id}" aria-label="Editar">${shopSvg('edit')}</button><button type="button" data-shop-delete="${x.id}" aria-label="Excluir">${shopSvg('trash')}</button></div></div>`).join(''):'<div class="empty compact"><strong>Nada para comprar.</strong><span>A lista está livre por enquanto.</span></div>'}
function bindShoppingUniversal(){document.querySelector('#shopUseBase')?.addEventListener('click',addBaseToCurrent);document.querySelector('#shopClosePurchase')?.addEventListener('click',openClosePurchaseDialog);document.querySelectorAll('[data-shop-toggle]').forEach(cb=>cb.onchange=()=>{const id=cb.dataset.shopToggle;if(cb.checked){openPurchasedModal(id)}else{markShoppingDone(id,false);renderShoppingUniversal()}});document.querySelectorAll('[data-shop-edit]').forEach(b=>b.onclick=()=>openShoppingItemModal(b.dataset.shopEdit));document.querySelectorAll('[data-shop-delete]').forEach(b=>b.onclick=()=>{if(confirm('Excluir este item da lista?')){saveSharedShopping(loadSharedShopping().filter(x=>String(x.id)!==String(b.dataset.shopDelete)));renderShoppingUniversal()}});document.querySelectorAll('#shopAddTop,#shopAddBottom').forEach(b=>b.onclick=()=>openShoppingItemModal());document.querySelectorAll('[data-shop-filter]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-shop-filter]').forEach(x=>x.classList.toggle('active',x===b));const f=b.dataset.shopFilter;document.querySelectorAll('[data-shop-row]').forEach(r=>r.style.display=f==='all'||r.dataset.shopCategory===f?'':'none')})}
function openShoppingItemModal(id=null){ensureShoppingStyles();const all=loadSharedShopping(),x=id?all.find(i=>String(i.id)===String(id)):null;const dlg=document.createElement('dialog');dlg.className='study-v10-dialog';dlg.innerHTML=`<form class="study-v10-modal" id="shoppingItemForm"><div class="study-v10-head"><div><div class="eyebrow">LISTA DE COMPRAS</div><h2>${x?'Editar item':'Adicionar item'}</h2></div><button type="button" class="study-v10-x" data-close>×</button></div><label>Item<input id="shopName" required value="${escapeHtml(x?.name||'')}" placeholder="Ex.: Leite integral"></label><div class="shopping-modal-grid"><label>Quantidade<input id="shopQty" inputmode="decimal" value="${escapeHtml(x?.qty??'')}" placeholder="Ex.: 6"></label><label>Unidade<select id="shopUnit"><option value="">Sem unidade</option>${['un','caixa','pacote','pote','garrafa','kg','g','L','ml'].map(u=>`<option ${x?.unit===u?'selected':''}>${u}</option>`).join('')}</select></label><label>Categoria<select id="shopCategory">${['Alimentação','Casa','Saúde','Autocuidado','Pets','Outros'].map(c=>`<option ${shopCategoryLabel(x?.category)===c?'selected':''}>${c}</option>`).join('')}</select></label><label>Valor previsto<input id="shopExpected" inputmode="decimal" value="${escapeHtml(x?.expectedValue??'')}" placeholder="0,00"></label></div><label>Origem<input id="shopSource" value="${escapeHtml(x?.source||'Manual')}" placeholder="Manual"></label><div class="modal-actions"><button type="button" class="secondary" data-close>Cancelar</button><div class="grow"></div><button type="submit" class="primary">Salvar</button></div></form>`;document.body.appendChild(dlg);dlg.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>dlg.close());dlg.addEventListener('close',()=>dlg.remove());dlg.querySelector('#shoppingItemForm').onsubmit=e=>{e.preventDefault();const name=dlg.querySelector('#shopName').value.trim();if(!name)return;const item=x||{id:uid(),createdAt:Date.now(),done:false,cycle:'monthly'};Object.assign(item,{name,qty:dlg.querySelector('#shopQty').value.trim(),unit:dlg.querySelector('#shopUnit').value,category:dlg.querySelector('#shopCategory').value,expectedValue:dlg.querySelector('#shopExpected').value.trim(),source:dlg.querySelector('#shopSource').value.trim()||'Manual'});if(!x)all.push(item);saveSharedShopping(all);dlg.close();if(state.route==='compras')renderShoppingUniversal();};dlg.showModal()}
function openPurchasedModal(id){const all=loadSharedShopping(),x=all.find(i=>String(i.id)===String(id));if(!x)return;const dlg=document.createElement('dialog');dlg.className='study-v10-dialog';dlg.innerHTML=`<form class="study-v10-modal" id="purchaseDoneForm"><div class="study-v10-head"><div><div class="eyebrow">COMPRA CONCLUÍDA</div><h2>${escapeHtml(x.name)}</h2><p>O valor é opcional, mas deixa o seu histórico mais fiel.</p></div><button type="button" class="study-v10-x" data-close>×</button></div><div class="shopping-modal-grid"><label>Quantidade comprada<input id="purchaseQty" inputmode="decimal" value="${escapeHtml(x.qty??'')}"></label><label>Unidade<select id="purchaseUnit"><option value="">Sem unidade</option>${['un','caixa','pacote','pote','garrafa','kg','g','L','ml'].map(u=>`<option ${x.unit===u?'selected':''}>${u}</option>`).join('')}</select></label></div><label>Valor total pago<input id="purchaseValue" inputmode="decimal" placeholder="0,00" value="${escapeHtml(x.actualValue??'')}"></label><div class="modal-actions"><button type="button" class="secondary" data-close>Cancelar</button><div class="grow"></div><button type="submit" class="primary">Marcar comprado</button></div></form>`;document.body.appendChild(dlg);let cancelled=true;dlg.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>dlg.close());dlg.addEventListener('close',()=>{if(cancelled){const cb=document.querySelector(`[data-shop-toggle="${CSS.escape(String(id))}"]`);if(cb)cb.checked=false}dlg.remove()});dlg.querySelector('#purchaseDoneForm').onsubmit=e=>{e.preventDefault();x.qty=dlg.querySelector('#purchaseQty').value.trim();x.unit=dlg.querySelector('#purchaseUnit').value;x.actualValue=dlg.querySelector('#purchaseValue').value.trim();x.done=true;x.purchasedAt=Date.now();saveSharedShopping(all);cancelled=false;dlg.close();renderShoppingUniversal();};dlg.showModal()}
function monthKeyNow(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`}
function purchasedThisMonth(){const m=monthKeyNow();return loadSharedShopping().filter(x=>x.done&&x.purchasedAt&&new Date(x.purchasedAt).toISOString().slice(0,7)===m)}
function progressGroup(items){const map=new Map();items.forEach(x=>{const k=shopCategoryLabel(x.category);if(!map.has(k))map.set(k,[]);map.get(k).push(x)});return [...map.entries()].sort((a,b)=>a[0].localeCompare(b[0],'pt-BR'))}
function progressGoalsStore(){try{return JSON.parse(localStorage.getItem('bertha.progress-goals.v1')||'{}')||{}}catch{return {}}}
function progressEngineHistory(){try{return (JSON.parse(localStorage.getItem('bertha.time-engine.v1')||'{}').history||[])}catch{return []}}
function progressWeekStart(){const d=new Date();const day=(d.getDay()+6)%7;d.setHours(0,0,0,0);d.setDate(d.getDate()-day);return d.getTime()}
function progressAreaFromHistory(h){const t=`${h.source||''} ${h.category||''} ${h.title||''} ${h.itemId||''} ${h.plannedItemId||''} ${h.learningKey||''}`.toLowerCase();if(/exerc|exercise|moviment|treino|esteira/.test(t))return'movimento';if(/autocuidado|ritual capilar/.test(t))return'autocuidado';if(/estud/.test(t))return'estudos';if(/casa/.test(t))return'casa';if(/ritual/.test(t))return'rituais';if(/crefito|trabalho|bec|tiktok/.test(t))return'trabalho';if(/projeto|criaç|ideia/.test(t))return'projetos';if(/alimenta|refei|comida/.test(t))return'alimentacao';return'outros'}
function progressGoalSummary(area,g){if(!g)return'';const nf=v=>String(v).replace('.',',');if(area==='movimento'){const a=[];if(g.sessionsPerWeek)a.push(`${nf(g.sessionsPerWeek)} sessões/sem`);if(g.minutesPerWeek)a.push(`${nf(g.minutesPerWeek)} min/sem`);return a.join(' · ')}if(area==='alimentacao'&&g.adherencePercent)return`${nf(g.adherencePercent)}% do planejamento`;if(area==='autocuidado'&&g.sessionsPerWeek)return`${nf(g.sessionsPerWeek)} momentos/sem`;if(area==='estudos'&&g.hoursPerWeek)return`${nf(g.hoursPerWeek)} h/sem`;if(area==='projetos'&&g.onTimePercent)return`${nf(g.onTimePercent)}% no prazo`;if(area==='trabalho'&&g.prioritiesPerWeek)return`${nf(g.prioritiesPerWeek)} prioridades/sem`;if(area==='casa'&&g.routinesPerWeek)return`${nf(g.routinesPerWeek)} rotinas/sem`;if(area==='rituais'&&g.sessionsPerWeek)return`${nf(g.sessionsPerWeek)} rituais/sem`;return''}
function progressActualSummary(area,g,arr){const mins=arr.reduce((s,x)=>s+(+x.realMinutes||0),0),n=arr.length;if(area==='movimento')return g?`${n}${g.sessionsPerWeek?`/${g.sessionsPerWeek}`:''} sessões${g.minutesPerWeek?` · ${mins}/${g.minutesPerWeek} min`:mins?` · ${mins} min`:''}`:`${n} sessão${n===1?'':'ões'} · ${mins} min`;if(area==='estudos')return`${(mins/60).toFixed(1).replace('.',',')}${g?.hoursPerWeek?`/${String(g.hoursPerWeek).replace('.',',')}`:''} h`;if(['autocuidado','rituais'].includes(area))return`${n}${g?.sessionsPerWeek?`/${g.sessionsPerWeek}`:''} realizado${n===1?'':'s'}`;if(area==='trabalho')return`${n}${g?.prioritiesPerWeek?`/${g.prioritiesPerWeek}`:''} conclusão${n===1?'':'ões'}`;if(area==='casa')return`${n}${g?.routinesPerWeek?`/${g.routinesPerWeek}`:''} rotina${n===1?'':'s'}`;if(area==='projetos')return n?`${n} atividade${n===1?'':'s'} de projeto`:'Ainda sem conclusão';if(area==='alimentacao'){const meals=arr.filter(x=>x.activityType!=='foodPrep'),preps=arr.filter(x=>x.activityType==='foodPrep');if(!meals.length&&!preps.length)return'Nenhum registro';const bits=[];if(meals.length){const planned=meals.filter(x=>x.mealSource==='planned').length,pct=Math.round(planned/meals.length*100),known=meals.filter(x=>Number.isFinite(+x.kcal)),kcal=known.reduce((s,x)=>s+(+x.kcal||0),0);bits.push(`${pct}% conforme planejado · ${meals.length} refeição${meals.length===1?'':'ões'}`);if(known.length)bits.push(`${Math.round(kcal)} kcal${known.length<meals.length?' parciais':''}`)}if(preps.length)bits.push(`${preps.length} preparo${preps.length===1?'':'s'}`);return bits.join(' · ');}return`${n} realizado${n===1?'':'s'}`}
function progressFinanceRow(){const d=loadFin(),month=finCurrentMonth(),fixed=finFixedTotal(d),variable=finMonthTotal(d,month),bills=finPlannedMonth(d,month),paid=bills.filter(x=>x.paid),open=bills.filter(x=>!x.paid),covered=finPersonal(d.excluded).reduce((sum,x)=>sum+Number(x.value||0),0),remaining=Number(d.income||0)-fixed-variable;return `<details class="progress-category"><summary class="progress-category-head"><strong>Financeiro</strong><b>R$ ${money(remaining)} disponíveis</b></summary><small>${paid.length}/${bills.length} contas previstas pagas · realizado R$ ${money(variable)}</small><div class="progress-detail"><div><span>Orçamento base</span><span>R$ ${money(fixed)}</span></div><div><span>Gastos registrados no mês</span><span>R$ ${money(variable)}</span></div><div><span>Contas previstas pendentes</span><span>${open.length} · R$ ${money(open.reduce((sum,x)=>sum+x.expected,0))}</span></div><div><span>Despesas cobertas hoje</span><span>R$ ${money(covered)}</span></div></div></details>`}
function progressFoodCaloriesByDay(arr){
 const meals=arr.filter(x=>x.activityType!=='foodPrep'),map=new Map();
 meals.forEach(h=>{const ts=+h.endedAt||+h.startedAt||0,day=new Date(ts);if(!ts||Number.isNaN(day.getTime()))return;const key=`${day.getFullYear()}-${String(day.getMonth()+1).padStart(2,'0')}-${String(day.getDate()).padStart(2,'0')}`;if(!map.has(key))map.set(key,{date:day,items:[]});map.get(key).items.push(h)});
 return [...map.values()].sort((a,b)=>b.date-a.date).map(g=>{const known=g.items.filter(x=>Number.isFinite(+x.kcal)),total=Math.round(known.reduce((s,x)=>s+(+x.kcal||0),0)),partial=known.length<g.items.length;const sources=[...new Set(g.items.map(x=>x.kcalSource).filter(Boolean))];return {date:g.date,total,known:known.length,count:g.items.length,partial,sources};});
}
function progressFoodExtraDetail(arr){const days=progressFoodCaloriesByDay(arr);if(!days.length)return'';return `<div class="progress-food-calories"><strong>Calorias consumidas por dia</strong>${days.map(d=>`<div class="progress-food-kcal-row"><span>${d.date.toLocaleDateString('pt-BR',{weekday:'short',day:'2-digit',month:'2-digit'})}</span><span>${d.known?`${d.total} kcal${d.partial?' · parcial':''}`:'Sem kcal calculáveis'}</span><small>Fonte: ${escapeHtml(d.sources.length?d.sources.join(' · '):'sem informação nutricional suficiente')}</small></div>`).join('')}</div>`}
function renderProgressOverview(){ensureShoppingStyles();const items=purchasedThisMonth(),groups=progressGroup(items),total=items.reduce((s,x)=>s+shopMoney(x.actualValue),0);const goals=progressGoalsStore(),week=progressEngineHistory().filter(h=>h.status==='done'&&(+h.endedAt||+h.startedAt||0)>=progressWeekStart()),areas=[['movimento','Exercícios'],['alimentacao','Alimentação'],['autocuidado','Autocuidado'],['estudos','Estudos'],['projetos','Projetos'],['trabalho','Trabalho'],['casa','Casa'],['rituais','Rituais']];const lifeRows=areas.map(([id,label])=>{const arr=week.filter(h=>progressAreaFromHistory(h)===id),g=goals[id];if(!g&&!arr.length)return'';const expected=progressGoalSummary(id,g),actual=progressActualSummary(id,g,arr);return `<details class="progress-category"><summary class="progress-category-head"><strong>${escapeHtml(label)}</strong><b>${escapeHtml(actual)}</b></summary><small>${g?`Referência: ${escapeHtml(expected)}`:'Sem referência definida no Meu Dia Ideal.'}</small><div class="progress-detail">${arr.length?arr.map(h=>`<div><span>${escapeHtml(h.title||label)}</span><span>${id==='alimentacao'?`${h.activityType==='foodPrep'?'Preparo':(h.mealSource==='planned'?'Como planejado':'Substituição')} · ${new Date(h.endedAt||h.startedAt).toLocaleDateString('pt-BR')}`:`${+h.realMinutes||0} min · ${new Date(h.endedAt||h.startedAt).toLocaleDateString('pt-BR')}`}</span></div>`).join(''):`<div><span>${id==='alimentacao'?'Nenhuma refeição registrada nesta semana.':'Nenhuma conclusão registrada nesta semana.'}</span><span>—</span></div>`}</div>${id==='alimentacao'?progressFoodExtraDetail(arr):''}</details>`}).join('')+progressFinanceRow();app.innerHTML=`<section class="shop-hero"><div><div class="eyebrow">COMO ESTOU CAMINHANDO?</div><h2>Meu Progresso</h2><p>Esperado e realizado, cada área com a sua própria régua.</p></div>${shopSvg('trend')}</section><section class="card"><div class="shop-section-head"><h3>Esta semana</h3><span>Esperado × realizado</span></div>${lifeRows||'<div class="empty compact"><strong>Seu progresso começa no que você vive.</strong><span>Defina referências no Meu Dia Ideal e conclua normalmente suas atividades.</span></div>'}</section><div class="shop-summary" style="margin-top:12px"><div class="card"><span>Itens comprados no mês</span><b>${items.length}</b></div><div class="card"><span>Valor registrado</span><b style="font-size:18px">${shopMoneyBR(total)}</b></div></div><section class="card"><div class="shop-section-head"><h3>Compras do mês</h3><span>${new Date().toLocaleDateString('pt-BR',{month:'long',year:'numeric'})}</span></div>${groups.length?groups.map(([cat,arr])=>{const subtotal=arr.reduce((s,x)=>s+shopMoney(x.actualValue),0);const consolidated=new Map();arr.forEach(x=>{const k=String(x.name).trim().toLowerCase();if(!consolidated.has(k))consolidated.set(k,{name:x.name,qty:0,unit:x.unit||'',value:0,count:0});const z=consolidated.get(k);const q=Number(String(x.qty||'').replace(',','.'));if(Number.isFinite(q)&&q)z.qty+=q;z.value+=shopMoney(x.actualValue);z.count++});return `<details class="progress-category"><summary class="progress-category-head"><strong>${escapeHtml(cat)}</strong><b>${shopMoneyBR(subtotal)}</b></summary><small>${arr.length} item${arr.length===1?'':'s'} comprado${arr.length===1?'':'s'}</small><div class="progress-detail">${[...consolidated.values()].map(z=>`<div><span>${escapeHtml(z.name)}</span><span>${z.qty?`${String(z.qty).replace('.',',')} ${escapeHtml(z.unit)}`:`${z.count} compra${z.count===1?'':'s'}`} · ${shopMoneyBR(z.value)}</span></div>`).join('')}</div></details>`}).join(''):'<div class="empty compact"><strong>Ainda não há compras registradas neste mês.</strong><span>As compras reais continuam aparecendo aqui separadamente.</span></div>'}</section>`}

function healthStatus(item){if(!item.reorderDate)return item.usageMode==='prazo'?'Uso com prazo':'Uso contínuo';const t=new Date();t.setHours(0,0,0,0);const d=new Date(item.reorderDate+'T12:00:00');const days=Math.ceil((d-t)/86400000);if(days<0)return 'Reposição atrasada';if(days===0)return 'Repor hoje';if(days<=7)return `Repor em ${days}d`;return `Próxima reposição ${formatDate(item.reorderDate)}`}
function renderHealthMini(){const h=loadHealth();return `<section class="day-section home-health-mini"><div class="section-head"><h2>Saúde</h2><button type="button" class="secondary" id="healthAddHome">Adicionar</button></div><div class="card health-mini-list">${h.length?h.map(x=>`<div class="health-mini-row"><div><strong>${escapeHtml(x.name)}</strong><small>${escapeHtml(x.type||'Medicamento')} · ${escapeHtml(healthStatus(x))}${shopMoney(x.expectedValue)?` · ${shopMoneyBR(x.expectedValue)}`:''}</small></div><div class="health-mini-actions"><button type="button" data-health-buy="${x.id}">À lista</button><button type="button" data-health-edit="${x.id}">Editar</button></div></div>`).join(''):'<div class="empty compact"><strong>Nenhum item cadastrado.</strong><span>Use apenas para medicamentos e suplementos que realmente precisam de acompanhamento.</span></div>'}</div></section>`}
function openHealthModal(id=null){const all=loadHealth(),x=id?all.find(i=>String(i.id)===String(id)):null;const dlg=document.createElement('dialog');dlg.className='study-v10-dialog';dlg.innerHTML=`<form class="study-v10-modal" id="healthForm"><div class="study-v10-head"><div><div class="eyebrow">SAÚDE</div><h2>${x?'Editar item':'Novo item'}</h2></div><button type="button" class="study-v10-x" data-close>×</button></div><label>Nome<input id="healthName" required value="${escapeHtml(x?.name||'')}" placeholder="Medicamento ou suplemento"></label><div class="shopping-modal-grid"><label>Tipo<select id="healthType"><option ${x?.type==='Medicamento'?'selected':''}>Medicamento</option><option ${x?.type==='Suplemento'?'selected':''}>Suplemento</option></select></label><label>Uso<select id="healthUsage"><option value="continuo" ${x?.usageMode!=='prazo'?'selected':''}>Uso contínuo</option><option value="prazo" ${x?.usageMode==='prazo'?'selected':''}>Uso com prazo</option></select></label><label>Próxima reposição<input id="healthReorder" type="date" value="${escapeHtml(x?.reorderDate||'')}"></label><label>Valor previsto<input id="healthValue" inputmode="decimal" value="${escapeHtml(x?.expectedValue??'')}" placeholder="0,00"></label></div><div class="modal-actions">${x?'<button type="button" class="secondary" id="healthDelete">Excluir</button>':''}<div class="grow"></div><button type="button" class="secondary" data-close>Cancelar</button><button type="submit" class="primary">Salvar</button></div></form>`;document.body.appendChild(dlg);dlg.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>dlg.close());dlg.addEventListener('close',()=>dlg.remove());dlg.querySelector('#healthDelete')?.addEventListener('click',()=>{if(confirm('Excluir este item de Saúde?')){saveHealth(all.filter(i=>String(i.id)!==String(id)));dlg.close();if(location.hash==='#meu-dia'||!location.hash)window.render?.()}});dlg.querySelector('#healthForm').onsubmit=e=>{e.preventDefault();const item=x||{id:uid(),createdAt:Date.now()};Object.assign(item,{name:dlg.querySelector('#healthName').value.trim(),type:dlg.querySelector('#healthType').value,usageMode:dlg.querySelector('#healthUsage').value,reorderDate:dlg.querySelector('#healthReorder').value,expectedValue:dlg.querySelector('#healthValue').value.trim()});if(!item.name)return;if(!x)all.push(item);saveHealth(all);dlg.close();if(location.hash==='#meu-dia'||!location.hash)window.render?.()};dlg.showModal()}
function bindHealthMini(){document.querySelector('#healthAddHome')?.addEventListener('click',()=>openHealthModal());document.querySelectorAll('[data-health-edit]').forEach(b=>b.onclick=()=>openHealthModal(b.dataset.healthEdit));document.querySelectorAll('[data-health-buy]').forEach(b=>b.onclick=()=>{const x=loadHealth().find(i=>String(i.id)===String(b.dataset.healthBuy));if(!x)return;const items=loadSharedShopping(),key=x.name.trim().toLowerCase();if(!items.some(i=>!i.done&&i.name.trim().toLowerCase()===key)){items.push({id:uid(),name:x.name,category:'Saúde',source:x.type||'Saúde',expectedValue:x.expectedValue||'',cycle:'monthly',createdAt:Date.now(),done:false});saveSharedShopping(items)}b.textContent='Na lista';b.disabled=true;})}
window.BerthaShopping={pendingCount:()=>shoppingPending().length,renderHealthMini,bindHealthMini,openHealthModal};

const REC_KEY="minha-vida.receitas.v1";
const RECIPES=[
 {id:"frango-assado",name:"Frango assado com batatas",cat:"Frango",yield:"4 porções",prep:"Produção quinzenal",finish:"Finalizar com arroz + salada",ingredients:["1 kg de coxa/sobrecoxa ou peito em pedaços","600 g de batatas","4 dentes de alho","1 cebola","Azeite, sal, páprica e ervas"],steps:["Tempere o frango e deixe tomar gosto.","Corte as batatas e disponha com o frango em assadeira.","Asse até dourar e cozinhar por completo, virando se necessário.","Porcione com o caldo da assadeira; deixe salada e itens frescos para o dia."]},
 {id:"strogonoff",name:"Strogonoff de frango",cat:"Frango",yield:"4 porções",prep:"Produção quinzenal",finish:"Servir com arroz + batata palha",ingredients:["700 g de peito de frango em cubos","1 cebola","2 dentes de alho","200 g de creme de leite","Molho de tomate ou passata","Mostarda, sal e pimenta"],steps:["Doure o frango em etapas.","Refogue cebola e alho e devolva o frango.","Junte molho e mostarda; cozinhe até ficar macio.","Finalize com creme de leite sem ferver demais. Batata palha só na hora de servir."]},
 {id:"alcatra",name:"Bife de alcatra acebolado",cat:"Carne bovina",yield:"3–4 porções",prep:"Preparar próximo ao consumo",finish:"Servir com purê + brócolis",ingredients:["600–700 g de bifes de alcatra","2 cebolas","Alho, sal e pimenta","Manteiga ou azeite"],steps:["Tempere os bifes pouco antes de preparar.","Sele em frigideira bem quente sem sobrecarregar.","Reserve e doure as cebolas na mesma frigideira.","Volte os bifes rapidamente para envolver no sabor."]},
 {id:"ragu",name:"Ragu de carne",cat:"Carne bovina",yield:"4 porções",prep:"Congelar em pote de 600–700 g",finish:"Servir com arroz ou massa + legumes",ingredients:["700 g de carne bovina em cubos ou moída","1 cebola","2 dentes de alho","400 g de tomate/passata","Cenoura opcional","Sal, pimenta e ervas"],steps:["Doure bem a carne.","Refogue cebola, alho e cenoura.","Junte tomate e cozinhe em fogo baixo até encorpar.","Esfrie antes de porcionar e congelar."]},
 {id:"hamburguer",name:"Hambúrguer caseiro",cat:"Carne bovina",yield:"1 unidade/pessoa",prep:"Modelar e congelar",finish:"Servir com batata + salada",ingredients:["150–180 g de carne moída por hambúrguer","Sal e pimenta","Queijo opcional"],steps:["Divida a carne sem compactar demais.","Modele discos e faça leve cavidade no centro.","Congele separados por papel próprio, se desejar.","Tempere com sal só ao grelhar e cozinhe até o ponto desejado."]},
 {id:"musculo",name:"Carne de panela com músculo",cat:"Carne bovina",yield:"4 porções",prep:"Produção quinzenal",finish:"Servir com arroz + feijão + legumes",ingredients:["800 g de músculo em cubos","1 cebola","3 dentes de alho","2 tomates","Cenoura opcional","Sal, pimenta e louro"],steps:["Sele o músculo na panela de pressão.","Refogue os aromáticos e junte tomate.","Adicione água suficiente e cozinhe na pressão até ficar macio.","Ajuste o caldo e porcione após esfriar."]},
 {id:"panquecas",name:"Panquecas salgadas de carne e queijo",cat:"Coringas",yield:"8–10 unidades",prep:"Pode congelar prontas",finish:"Aquecer e servir com salada",ingredients:["2 ovos","2 xícaras de leite","1½ xícara de farinha","500 g de carne moída","Queijo","Molho de tomate"],steps:["Bata a massa e faça discos finos em frigideira.","Prepare o recheio de carne moída.","Recheie, enrole e cubra com molho e queijo.","Congele em porções; aqueça até o centro estar bem quente."]},
 {id:"frango-grelhado",name:"Filé de frango grelhado",cat:"Frango",yield:"3–4 porções",prep:"Preparar próximo ao consumo",finish:"Servir com arroz + feijão + legumes",ingredients:["700 g de filé de frango","Alho","Limão opcional","Sal, pimenta e páprica","Azeite"],steps:["Tempere o frango.","Aqueça bem a frigideira.","Grelhe sem movimentar excessivamente e vire para dourar o outro lado.","Descanse alguns minutos antes de cortar."]},
 {id:"frango-desfiado",name:"Frango desfiado cremoso para Rap10",cat:"Frango",yield:"3–4 porções",prep:"Congelar o recheio",finish:"Aquecer + Rap10 + salada fresca",ingredients:["600 g de peito de frango cozido e desfiado","1 cebola","2 dentes de alho","Requeijão ou creme de ricota/cottage","Tomate ou passata","Temperos"],steps:["Refogue cebola e alho.","Junte frango e tomate e deixe reduzir.","Finalize com o ingrediente cremoso.","Congele só o recheio; monte o Rap10 na hora."]},
 {id:"risoto",name:"Risoto rápido de frango/carne",cat:"Coringas",yield:"3–4 porções",prep:"Preparar no dia",finish:"Servir com salada",ingredients:["2 xícaras de arroz já cozido ou arroz para risoto","300 g de frango ou carne pronta","Caldo","Queijo","Legumes opcionais"],steps:["Aqueça a proteína e os legumes.","Junte o arroz e um pouco de caldo.","Mexa até ficar cremoso.","Finalize com queijo e sirva imediatamente."]},
 {id:"porco",name:"Porco assado",cat:"Porco",yield:"3–4 porções",prep:"Produção quinzenal",finish:"Servir com acompanhamentos",ingredients:["800 g de lombo/pernil suíno","Alho","Limão ou laranja","Sal, pimenta e ervas","Azeite"],steps:["Tempere a carne e deixe marinar se possível.","Sele ou leve diretamente ao forno conforme o corte.","Asse até ficar cozido e dourado, sem ressecar.","Fatie depois de descansar e porcione."]},
 {id:"carne-legumes",name:"Carne moída com legumes",cat:"Carne bovina",yield:"3–4 porções",prep:"Produção quinzenal",finish:"Servir com arroz + feijão",ingredients:["600 g de carne moída","1 cebola","2 dentes de alho","Cenoura e abobrinha","Tomate","Sal e temperos"],steps:["Doure a carne até perder o excesso de líquido.","Junte cebola e alho.","Adicione legumes e tomate e cozinhe sem desmanchar demais.","Esfrie e porcione."]},
 {id:"frango-gratinado",name:"Frango gratinado com queijo",cat:"Frango",yield:"4 porções",prep:"Montar e congelar se desejado",finish:"Gratinar antes de servir",ingredients:["600 g de frango cozido/desfiado","Molho de tomate ou creme leve","200 g de queijo","Temperos"],steps:["Prepare o frango temperado.","Coloque em refratário com o molho.","Cubra com queijo.","Gratine até borbulhar e dourar."]},
 {id:"almondegas",name:"Almôndegas",cat:"Carne bovina",yield:"12–20 unidades",prep:"Congelar com molho",finish:"Servir com acompanhamento",ingredients:["600 g de carne moída","1 ovo","Aveia ou farinha de rosca","Alho e cebola","Molho de tomate","Sal e temperos"],steps:["Misture sem sovar excessivamente.","Modele as almôndegas.","Doure no forno ou frigideira.","Finalize no molho e congele já porcionado."]},
 {id:"coxa-sobrecoxa",name:"Coxa/sobrecoxa",cat:"Frango",yield:"Conforme compra",prep:"Produção quinzenal",finish:"Finalizar no forno",ingredients:["Coxas/sobrecoxas","Alho","Limão opcional","Páprica, sal e pimenta","Azeite"],steps:["Tempere com antecedência.","Disponha sem amontoar.","Asse até dourar e cozinhar por completo.","Porcione com os próprios sucos."]},
 {id:"arroz-forno",name:"Arroz de forno com frango",cat:"Coringas",yield:"4 porções",prep:"Montar e congelar antes de gratinar",finish:"Gratinar até aquecer e dourar",ingredients:["3 xícaras de arroz cozido","400 g de frango desfiado","Legumes","Molho ou requeijão","Queijo"],steps:["Misture arroz, frango, legumes e molho.","Coloque em refratário.","Cubra com queijo.","Congele montado ou gratine para servir."]},
 {id:"porco-rap10",name:"Porco desfiado com Rap10",cat:"Porco",yield:"3–4 porções",prep:"Congelar apenas o porco",finish:"Aquecer + Rap10 + queijo + salada",ingredients:["600 g de porco cozido e desfiado","Cebola","Alho","Tomate/passata","Rap10","Queijo e salada"],steps:["Refogue o porco desfiado com os aromáticos e tomate.","Deixe o recheio úmido, mas sem excesso de líquido.","Congele em porções.","Aqueça e monte o Rap10 somente na hora."]},
 {id:"fraldinha",name:"Churrasco de fraldinha",cat:"Carne bovina",yield:"3–4 porções",prep:"Congelar a peça crua",finish:"Descongelar na geladeira + churrasqueira",ingredients:["1 peça de fraldinha","Sal grosso ou sal de parrilla","Pimenta opcional"],steps:["Descongele completamente na geladeira.","Tempere próximo ao preparo.","Asse/grelhe controlando o ponto.","Descanse e corte contra as fibras."]},
 {id:"crepioca",name:"Crepioca de cottage",cat:"Café da manhã",yield:"1 porção",prep:"Preparar na hora",finish:"Ovo + tapioca + cottage",ingredients:["1 ovo","2 colheres de sopa de tapioca","2 colheres de sopa de cottage","Sal"],steps:["Misture ovo e tapioca.","Despeje em frigideira antiaderente.","Vire quando firmar.","Recheie com cottage e dobre."]},
 {id:"cuscuz",name:"Cuscuz com queijo",cat:"Café da manhã",yield:"3 porções",prep:"Preparar na hora",finish:"Servir com queijo e, se desejar, manteiga",ingredients:["1½ xícara de flocão","Água para hidratar","Sal","Queijo"],steps:["Hidrate o flocão com água e sal por alguns minutos.","Cozinhe na cuscuzeira até ficar macio.","Sirva com queijo."]},
 {id:"pico-morango",name:"Picolé de morango cremoso",cat:"Picolé",yield:"6–8 unidades",prep:"Produção quinzenal",finish:"Manter congelado",ingredients:["300 g de morango","Iogurte natural ou leite","Adoçante/açúcar opcional"],steps:["Bata os ingredientes.","Distribua nas formas.","Congele até firmar."]},
 {id:"pico-coco",name:"Picolé de coco",cat:"Picolé",yield:"6–8 unidades",prep:"Produção quinzenal",finish:"Manter congelado",ingredients:["Leite de coco","Leite ou iogurte","Coco ralado","Adoçante/açúcar opcional"],steps:["Misture ou bata os ingredientes.","Distribua nas formas.","Congele até firmar."]},
 {id:"pico-maracuja",name:"Picolé de maracujá cremoso",cat:"Picolé",yield:"6–8 unidades",prep:"Produção quinzenal",finish:"Manter congelado",ingredients:["Polpa de maracujá","Iogurte ou leite","Adoçante/açúcar opcional"],steps:["Bata os ingredientes, reservando sementes se desejar.","Distribua nas formas.","Congele até firmar."]},
 {id:"pico-banana",name:"Picolé de banana com canela",cat:"Picolé",yield:"6–8 unidades",prep:"Produção quinzenal",finish:"Manter congelado",ingredients:["3 bananas maduras","Leite ou iogurte","Canela"],steps:["Bata tudo até ficar cremoso.","Distribua nas formas.","Congele até firmar."]}
];

const RECIPE_CATEGORIES=["Refeições","Carnes & proteínas","Massas & acompanhamentos","Lanches & café da manhã","Sobremesas","Molhos & complementos","Bebidas","Outros"];
function recipeCategory(r){
 const c=String(r?.category||r?.cat||"").trim();
 if(RECIPE_CATEGORIES.includes(c))return c;
 if(["Frango","Carne bovina","Porco"].includes(c))return "Carnes & proteínas";
 if(c==="Café da manhã")return "Lanches & café da manhã";
 if(c==="Picolé")return "Sobremesas";
 if(c==="Coringas")return "Refeições";
 return "Outros";
}
function loadRec(){try{const d=JSON.parse(localStorage.getItem(REC_KEY));return {...(d||{}),favorites:Array.isArray(d?.favorites)?d.favorites:[],customRecipes:Array.isArray(d?.customRecipes)?d.customRecipes:[],consumptionLog:Array.isArray(d?.consumptionLog)?d.consumptionLog:[]};}catch{return {favorites:[],customRecipes:[],consumptionLog:[]};}}
function saveRec(d){localStorage.setItem(REC_KEY,JSON.stringify(d));}
function allRecipes(){const d=loadRec();return [...RECIPES,...d.customRecipes].map(r=>({...r,cat:recipeCategory(r),category:recipeCategory(r)}));}
function getRecipeById(id){return allRecipes().find(r=>String(r.id)===String(id));}
function isCustomRecipe(id){return loadRec().customRecipes.some(r=>String(r.id)===String(id));}
function recipeSearchUrl(r,mode="variations"){const ing=(r.ingredients||[]).slice(0,5).map(x=>x.replace(/^\d+[\d\s½¼¾⅓⅔.,/-]*\s*(kg|g|ml|l|xícara|xícaras|colher|colheres|unidade|unidades)?\s*(de\s+)?/i,"")).join(" ");const q=mode==="ingredients"?`receitas com ${ing}`:`${r.name} receita variações`;return `https://www.google.com/search?q=${encodeURIComponent(q)}`;}

function addSharedShoppingItem(name,source,category="Outros"){
 name=String(name||"").trim();if(!name)return false;
 const items=loadSharedShopping();
 const key=name.toLowerCase();
 if(!items.some(x=>String(x.name||"").trim().toLowerCase()===key&&!x.done)){
   items.push({id:uid(),name,source:source||"BERTH.A",category:category==="Alimentos"?"Alimentação":(category||"Outros"),cycle:"monthly",createdAt:Date.now(),done:false,qty:"",unit:"",expectedValue:"",actualValue:"",purchasedAt:null});
   saveSharedShopping(items);
 }
 refreshCasaShoppingUI();
 const c=document.querySelector('#monthlyShoppingCard');if(c){c.innerHTML=renderMonthlyShopping();bindMonthlyShopping()}
 return true;
}
function openRecipeShoppingDialog(r){
 const old=document.querySelector('#recipeShoppingDialog');if(old)old.remove();
 const ingredients=(r?.ingredients||[]).filter(Boolean);
 const dlg=document.createElement('dialog');dlg.id='recipeShoppingDialog';dlg.className='study-v10-dialog';
 dlg.innerHTML=`<div class="study-v10-modal"><div class="study-v10-head"><div><div class="eyebrow">LISTA DE COMPRAS</div><h2>Adicionar ingredientes</h2><p>${escapeHtml(r?.name||'Receita')}</p></div><button type="button" class="study-v10-x" data-close>×</button></div>
 <div class="card"><p class="note">Desmarque o que você já tem em casa.</p><div class="casa-mini-shopping">${ingredients.map((x,i)=>`<div class="casa-mini-shop-row"><label><input type="checkbox" data-recipe-shop-item="${i}" checked><span>${escapeHtml(x)}</span></label></div>`).join('')||'<div class="empty compact"><strong>Sem ingredientes cadastrados.</strong></div>'}</div></div>
 <div class="modal-actions"><button type="button" class="secondary" data-close>Cancelar</button><div class="grow"></div><button type="button" class="primary" id="confirmRecipeShopping" ${ingredients.length?'':'disabled'}>Adicionar selecionados</button></div></div>`;
 document.body.appendChild(dlg);
 const close=()=>dlg.close();dlg.querySelectorAll('[data-close]').forEach(b=>b.onclick=close);dlg.addEventListener('close',()=>dlg.remove());
 dlg.querySelector('#confirmRecipeShopping')?.addEventListener('click',()=>{
   const selected=[...dlg.querySelectorAll('[data-recipe-shop-item]:checked')].map(cb=>ingredients[Number(cb.dataset.recipeShopItem)]).filter(Boolean);
   selected.forEach(x=>addSharedShoppingItem(x,`Receita · ${r.name}`,'Alimentos'));
   close();
   const btn=document.querySelector('#recipeToShopping');if(btn)btn.textContent=selected.length?`✓ ${selected.length} ingrediente${selected.length===1?'':'s'} na lista`:'Adicionar ingredientes à lista';
 });
 dlg.showModal();
}
function openFoodRecipe(id,doing=false,mealId='dinner'){const r=getRecipeById(id);if(!r)return;const old=document.querySelector('#foodRecipeDialog');if(old)old.remove();const dlg=document.createElement('dialog');dlg.id='foodRecipeDialog';dlg.className='study-v10-dialog recipe-dialog';const kcal=r.nutrition?.kcal?`<span class="recipe-nutri-line">${escapeHtml(r.nutrition.kcal)} kcal${r.nutrition.reference==='100g'?' / 100 g':r.nutrition.reference==='portion'?' / porção':''}</span>`:'';dlg.innerHTML=`<div class="study-v10-modal"><div class="study-v10-head"><div><div class="eyebrow">${escapeHtml(recipeCategory(r))}</div><h2>${escapeHtml(r.name)}</h2><p>${escapeHtml(r.yield||'Rendimento não informado')} · ${escapeHtml(r.prep||'Preparo livre')} ${kcal}</p></div><button type="button" class="study-v10-x" data-close>×</button></div><div class="card recipe-detail-card"><h3>Ingredientes</h3><ul>${(r.ingredients||[]).map(x=>`<li>${escapeHtml(x)}</li>`).join('')||'<li>Sem ingredientes cadastrados.</li>'}</ul><h3>Modo de preparo</h3><ol>${(r.steps||[]).map(x=>`<li>${escapeHtml(x)}</li>`).join('')||'<li>Sem modo de preparo cadastrado.</li>'}</ol><p><strong>Finalização:</strong> ${escapeHtml(r.finish||'—')}</p>${r.notes?`<p><strong>Observações:</strong> ${escapeHtml(r.notes)}</p>`:''}</div><div class="recipe-modal-actions"><button type="button" class="primary" id="chooseThisFood">${doing?'✓ Fiz esta':'Fiz esta'}</button><button type="button" class="secondary" id="chooseOtherFromRecipe">Fiz outra</button><button type="button" class="secondary" id="recipeToShopping">Ingredientes à lista</button>${isCustomRecipe(r.id)?`<button type="button" class="secondary" id="editThisRecipe">Editar receita</button>`:''}</div></div>`;document.body.appendChild(dlg);dlg.querySelector('[data-close]').onclick=()=>dlg.close();dlg.addEventListener('close',()=>dlg.remove());dlg.querySelector('#chooseThisFood').onclick=()=>{const st=getTodayMealState(mealId),isPlanned=String(st.plannedRecipe?.id||'')===String(r.id);const src=isPlanned?'planned':'chosen';saveTodayMealChoice(mealId,r.id,src);setTodayMealConsumption(mealId,'consumed',r.name,src);dlg.close()};dlg.querySelector('#chooseOtherFromRecipe').onclick=()=>{dlg.close();openChooseRecipe(mealId)};dlg.querySelector('#recipeToShopping').onclick=()=>openRecipeShoppingDialog(r);dlg.querySelector('#editThisRecipe')?.addEventListener('click',()=>{dlg.close();openRecipeForm(r.id)});dlg.showModal();}
function openQuickOther(mealId){const dlg=document.createElement('dialog');dlg.className='study-v10-dialog recipe-dialog';dlg.innerHTML=`<form class="study-v10-modal" id="quickOtherForm"><div class="study-v10-head"><div><div class="eyebrow">FIZ OUTRA</div><h2>Outra coisa</h2><p>Registre sem precisar transformar em receita.</p></div><button type="button" class="study-v10-x" data-close>×</button></div><label>O que você fez?<input id="quickOtherText" required maxlength="120" placeholder="Ex.: Pão com queijo e café"></label><div class="modal-actions"><button type="button" class="secondary" data-close>Cancelar</button><button type="submit" class="primary">Registrar</button></div></form>`;document.body.appendChild(dlg);dlg.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>dlg.close());dlg.addEventListener('close',()=>dlg.remove());dlg.querySelector('#quickOtherForm').onsubmit=e=>{e.preventDefault();const text=dlg.querySelector('#quickOtherText').value.trim();if(!text)return;saveTodayMealChoice(mealId,null,'other',text);setTodayMealConsumption(mealId,'consumed',text,'other');dlg.close()};dlg.showModal();}
function openChooseRecipe(mealId='dinner'){const old=document.querySelector('#chooseFoodDialog');if(old)old.remove();const dlg=document.createElement('dialog');dlg.id='chooseFoodDialog';dlg.className='study-v10-dialog recipe-dialog';dlg.innerHTML=`<div class="study-v10-modal"><div class="study-v10-head"><div><div class="eyebrow">FIZ OUTRA</div><h2>O que você fez?</h2><p>Escolha como registrar esta refeição.</p></div><button type="button" class="study-v10-x" data-close>×</button></div><div class="recipe-choice-stack"><button type="button" class="recipe-choice" id="chooseExisting"><span class="recipe-line-icon">⌕</span><span><strong>Buscar nas minhas receitas</strong><small>Escolha uma receita já cadastrada.</small></span></button><button type="button" class="recipe-choice" id="chooseNew"><span class="recipe-line-icon">＋</span><span><strong>Cadastrar nova receita</strong><small>Salva na biblioteca e registra como realizada.</small></span></button><button type="button" class="recipe-choice" id="chooseQuick"><span class="recipe-line-icon">—</span><span><strong>Outra coisa</strong><small>Registre rapidamente sem salvar como receita.</small></span></button></div><div id="chooseExistingWrap" hidden><input id="chooseFoodSearch" placeholder="Buscar nas minhas receitas…"><div class="list" id="chooseFoodList" style="max-height:42vh;overflow:auto;margin-top:10px"></div></div></div>`;document.body.appendChild(dlg);const draw=()=>{const q=(dlg.querySelector('#chooseFoodSearch')?.value||'').toLowerCase();dlg.querySelector('#chooseFoodList').innerHTML=allRecipes().filter(r=>!q||r.name.toLowerCase().includes(q)||recipeCategory(r).toLowerCase().includes(q)||(r.ingredients||[]).join(' ').toLowerCase().includes(q)).map(r=>`<button type="button" class="card recipe-pick" data-choose-food="${r.id}"><span class="eyebrow">${escapeHtml(recipeCategory(r))}</span><strong>${escapeHtml(r.name)}</strong><small>${escapeHtml(r.yield||'Rendimento não informado')}</small></button>`).join('');dlg.querySelectorAll('[data-choose-food]').forEach(b=>b.onclick=()=>{const r=getRecipeById(b.dataset.chooseFood);saveTodayMealChoice(mealId,b.dataset.chooseFood,'alternative');setTodayMealConsumption(mealId,'consumed',r?.name||'Outra receita','alternative');dlg.close()})};dlg.querySelector('[data-close]').onclick=()=>dlg.close();dlg.addEventListener('close',()=>dlg.remove());dlg.querySelector('#chooseExisting').onclick=()=>{dlg.querySelector('.recipe-choice-stack').hidden=true;dlg.querySelector('#chooseExistingWrap').hidden=false;draw()};dlg.querySelector('#chooseFoodSearch').oninput=draw;dlg.querySelector('#chooseNew').onclick=()=>{dlg.close();openRecipeForm(null,{mealId,markDone:true})};dlg.querySelector('#chooseQuick').onclick=()=>{dlg.close();openQuickOther(mealId)};dlg.showModal();}
function newRecipeId(){return "custom-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,7);}
function recipeLines(v){return String(v||"").split(/\n+/).map(x=>x.trim()).filter(Boolean);}
function openRecipeForm(recipeId=null,context={}){
 const data=loadRec(); const existing=recipeId?data.customRecipes.find(r=>String(r.id)===String(recipeId)):null;
 const old=document.querySelector('#recipeFormDialog');if(old)old.remove();const dlg=document.createElement('dialog');dlg.id='recipeFormDialog';dlg.className='study-v10-dialog recipe-dialog';const n=existing?.nutrition||{};
 dlg.innerHTML=`<form class="study-v10-modal" id="recipeForm"><div class="study-v10-head"><div><div class="eyebrow">RECEITAS</div><h2>${existing?'Editar receita':'Nova receita'}</h2><p>Cadastre uma vez. A BERTH.A reaproveita quando fizer sentido.</p></div><button type="button" class="study-v10-x" data-close>×</button></div><label>Nome da receita<input id="newRecipeName" required maxlength="120" value="${escapeHtml(existing?.name||'')}" placeholder="Ex.: Escondidinho de carne"></label><label>Categoria<select id="newRecipeCategory" required>${RECIPE_CATEGORIES.map(c=>`<option value="${escapeHtml(c)}" ${recipeCategory(existing||{})===c?'selected':''}>${escapeHtml(c)}</option>`).join('')}</select></label><div class="form-grid"><label>Rendimento<input id="newRecipeYield" value="${escapeHtml(existing?.yield||'')}" placeholder="Ex.: 4 porções"></label><label>Preparo / tempo<input id="newRecipePrep" value="${escapeHtml(existing?.prep||'')}" placeholder="Ex.: 40 min"></label></div><label>Ingredientes <span class="muted">(um por linha, com quantidade)</span><textarea id="newRecipeIngredients" rows="6" required placeholder="500 g de carne moída\n1 cebola">${escapeHtml((existing?.ingredients||[]).join('\n'))}</textarea></label><label>Modo de preparo <span class="muted">(um passo por linha)</span><textarea id="newRecipeSteps" rows="6" required>${escapeHtml((existing?.steps||[]).join('\n'))}</textarea></label><label>Finalização<input id="newRecipeFinish" value="${escapeHtml(existing?.finish||'')}" placeholder="Ex.: Servir com salada"></label><div class="recipe-nutrition-box"><div class="recipe-nutrition-head"><span class="recipe-line-icon">◇</span><div><strong>Informação nutricional</strong><small>Opcional. Preencha quando tiver os dados.</small></div></div><div class="form-grid"><label>Referência<select id="newRecipeNutriRef"><option value="100g" ${n.reference==='100g'?'selected':''}>Por 100 g</option><option value="portion" ${n.reference==='portion'?'selected':''}>Por porção</option><option value="whole" ${n.reference==='whole'?'selected':''}>Prato completo</option><option value="ingredient" ${n.reference==='ingredient'?'selected':''}>Ingrediente</option></select></label><label>kcal<input id="newRecipeKcal" inputmode="decimal" value="${escapeHtml(n.kcal||'')}" placeholder="Ex.: 180"></label></div></div><label>Observações <span class="muted">(opcional)</span><textarea id="newRecipeNotes" rows="3">${escapeHtml(existing?.notes||'')}</textarea></label><div class="modal-actions">${existing?'<button type="button" class="secondary" id="deleteRecipeBtn">Excluir</button>':''}<div class="grow"></div><button type="button" class="secondary" data-close>Cancelar</button><button type="submit" class="primary">Salvar receita</button></div></form>`;
 document.body.appendChild(dlg);dlg.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>dlg.close());dlg.addEventListener('close',()=>dlg.remove());
 dlg.querySelector('#recipeForm').onsubmit=e=>{e.preventDefault();const name=dlg.querySelector('#newRecipeName').value.trim(),ingredients=recipeLines(dlg.querySelector('#newRecipeIngredients').value),steps=recipeLines(dlg.querySelector('#newRecipeSteps').value);if(!name||!ingredients.length||!steps.length)return;const x=loadRec();const rec={id:existing?.id||newRecipeId(),name,cat:dlg.querySelector('#newRecipeCategory').value,category:dlg.querySelector('#newRecipeCategory').value,yield:dlg.querySelector('#newRecipeYield').value.trim(),prep:dlg.querySelector('#newRecipePrep').value.trim(),finish:dlg.querySelector('#newRecipeFinish').value.trim(),ingredients,steps,notes:dlg.querySelector('#newRecipeNotes').value.trim(),nutrition:{reference:dlg.querySelector('#newRecipeNutriRef').value,kcal:dlg.querySelector('#newRecipeKcal').value.trim()},custom:true,updatedAt:new Date().toISOString(),createdAt:existing?.createdAt||new Date().toISOString()};const i=x.customRecipes.findIndex(r=>String(r.id)===String(rec.id));if(i>=0)x.customRecipes[i]=rec;else x.customRecipes.push(rec);saveRec(x);if(context?.mealId&&context?.markDone){saveTodayMealChoice(context.mealId,rec.id,'new-recipe');setTodayMealConsumption(context.mealId,'consumed',rec.name,'new-recipe')}dlg.close();if(state.route==='receitas')renderReceitas()};
 dlg.querySelector('#deleteRecipeBtn')?.addEventListener('click',()=>{if(!confirm('Excluir esta receita?'))return;const x=loadRec();x.customRecipes=x.customRecipes.filter(r=>String(r.id)!==String(existing.id));x.favorites=x.favorites.filter(id=>String(id)!==String(existing.id));saveRec(x);dlg.close();if(state.route==='receitas')renderReceitas()});dlg.showModal();
}
function recipeHeroIcon(){return `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 8 39 24 24 40 9 24Z"/><path d="M24 14 33 24 24 34 15 24Z"/></svg>`}
function recipeMealIcon(){return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14M7 12h10M9 16h6"/></svg>`}
function renderRecipeToday(){const meals=getTodayMeals();return `<section class="recipe-today card"><div class="recipe-today-head"><div><span class="eyebrow">HOJE · ${escapeHtml(foodDayName().toUpperCase())}</span><h3>O que entra no seu dia</h3></div><a href="#meu-dia">Meu Dia →</a></div><div class="recipe-meals">${meals.map(m=>{const selected=getRecipeById(m.log.selectedRecipeId)||m.recipe,name=m.log.otherText||selected?.name||m.name,done=m.log.consumption==='consumed';return `<div class="recipe-meal ${done?'done':''}"><span class="recipe-meal-icon">${recipeMealIcon()}</span><div class="recipe-meal-copy"><small>${escapeHtml(m.label)}</small><strong>${escapeHtml(name)}</strong></div><div class="recipe-meal-actions">${done?`<button type="button" data-food-undo="${m.id}">Desfazer</button><button type="button" data-food-other="${m.id}">Alterar</button>`:`<button type="button" data-food-done="${m.id}">Fiz esta</button><button type="button" data-food-other="${m.id}">Fiz outra</button>`}${selected?`<button type="button" class="recipe-view" data-food-view="${m.id}" aria-label="Ver receita">›</button>`:''}</div></div>`}).join('')}</div></section>`}
function renderReceitas(){
 const d=loadRec();
 app.innerHTML=`<section class="recipe-hero"><div><span class="eyebrow">RECEITAS</span><h2>Know what’s next.</h2><p>Você planeja. A BERTH.A organiza o seu dia.</p></div><span class="recipe-hero-icon">${recipeHeroIcon()}</span></section>${renderRecipeToday()}<div class="recipe-tools"><input id="recipeSearch" placeholder="Buscar receita ou ingrediente…"><button type="button" id="addFoodRecipe">＋ Nova receita</button></div><div class="recipe-library-head"><div><span class="eyebrow">BIBLIOTECA</span><h3>Minhas receitas</h3></div><button type="button" id="toggleAllRecipes">Ver todas</button></div><div class="recipe-category-row" id="recipeCategoryRow" hidden>${['Todas',...RECIPE_CATEGORIES].map((c,i)=>`<button type="button" data-recipe-cat="${i?escapeHtml(c):''}" class="${i===0?'active':''}">${escapeHtml(c)}</button>`).join('')}</div><div class="list" id="recipeList"></div><div class="card freezer-rule recipe-freezer"><span class="eyebrow">FREEZER</span><p>Identifique cada preparo com <strong>nome · data · nº de porções · finalização</strong>.</p></div>`;
 let showAll=false,cat='';const todayIds=new Set(getTodayMeals().map(m=>(getRecipeById(m.log.selectedRecipeId)||m.recipe)?.id).filter(Boolean));const update=()=>{const q=(document.querySelector('#recipeSearch')?.value||'').toLowerCase();let list=allRecipes().filter(r=>(!q||r.name.toLowerCase().includes(q)||(r.ingredients||[]).join(' ').toLowerCase().includes(q))&&(!cat||recipeCategory(r)===cat));if(!showAll&&!q&&!cat)list=list.filter(r=>todayIds.has(r.id));document.querySelector('#recipeList').innerHTML=recipeCards(list,loadRec());bindRecipeCards(update);document.querySelector('#toggleAllRecipes').textContent=showAll?'Mostrar só hoje':'Ver todas'};
 document.querySelector('#addFoodRecipe').onclick=()=>openRecipeForm();document.querySelector('#recipeSearch').oninput=e=>{if(e.target.value)showAll=true;update()};document.querySelector('#toggleAllRecipes').onclick=()=>{showAll=!showAll;document.querySelector('#recipeCategoryRow').hidden=!showAll;update()};document.querySelectorAll('[data-recipe-cat]').forEach(b=>b.onclick=()=>{cat=b.dataset.recipeCat;showAll=true;document.querySelectorAll('[data-recipe-cat]').forEach(x=>x.classList.toggle('active',x===b));update()});bindTodayFoodActions();update();
}
function bindRecipeCards(refresh){document.querySelectorAll("[data-open-recipe]").forEach(b=>b.onclick=()=>openFoodRecipe(b.dataset.openRecipe,false));document.querySelectorAll("[data-edit-recipe]").forEach(b=>b.onclick=e=>{e.stopPropagation();openRecipeForm(b.dataset.editRecipe);});document.querySelectorAll("[data-fav]").forEach(b=>b.onclick=e=>{e.stopPropagation();const x=loadRec(),id=b.dataset.fav;x.favorites=x.favorites.includes(id)?x.favorites.filter(v=>v!==id):[...x.favorites,id];saveRec(x);refresh();});}
function recipeCards(list,d){return list.map(r=>`<article class="card recipe-card"><div class="recipe-main"><div><span class="eyebrow">${escapeHtml(recipeCategory(r))}</span><h3>${escapeHtml(r.name)}</h3><span>${escapeHtml(r.yield||"Rendimento não informado")} · ${escapeHtml(r.prep||"Preparo livre")}</span></div><button class="favorite ${d.favorites.includes(r.id)?"active":""}" data-fav="${r.id}">${d.favorites.includes(r.id)?"♥":"♡"}</button></div><p><strong>Finalização:</strong> ${escapeHtml(r.finish||"—")}</p><div style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="secondary" data-open-recipe="${r.id}">Ver receita</button>${r.custom?`<button type="button" class="secondary" data-edit-recipe="${r.id}">Editar</button>`:""}</div></article>`).join("")||`<div class="empty compact"><strong>Nenhuma receita encontrada.</strong></div>`;}
function renderPlaceholder() {
  const data = {
    ideias: ["💡", "Criação & Ideias", "Este espaço vem em seguida. A ideia é registrar sem transformar tudo em obrigação."],
    rituais: ["✨", "Rituais", "O próximo módulo será construído depois de Criação & Ideias — incluindo o Ritual Capilar."]
  };
  const item = data[state.route] || ["💜", "Minha Vida", "Os módulos serão construídos de baixo para cima, na ordem definida."];
  app.innerHTML = `
    <section class="hero">
      <h2>${item[0]} ${item[1]}</h2>
      <p>${item[2]}</p>
    </section>
    <div class="module-grid">
      <button class="module" data-route="pendencias"><span class="emoji">📝</span><strong>Pendências</strong><span>Descarregar a cabeça.</span></button>
      <button class="module" data-route="ideias"><span class="emoji">💡</span><strong>Criação & Ideias</strong><span>Guardar sem obrigação.</span></button>
      <button class="module" data-route="rituais"><span class="emoji">✨</span><strong>Rituais</strong><span>Rotinas que viram cuidado.</span></button>
      <button class="module" data-route="mais"><span class="emoji">＋</span><strong>Próximos módulos</strong><span>Construídos um por vez.</span></button>
    </div>`;
  document.querySelectorAll("[data-route]").forEach(b => b.onclick = () => {
    state.route=b.dataset.route;
    location.hash = state.route;
    render();
  });
}

document.querySelector("#homeBtn").onclick = (e) => {
  e.preventDefault();
  state.route="meu-dia";
  location.hash = "meu-dia";
  render();
};

document.querySelector("#backBtn").onclick = () => {
  const route=(location.hash||"").replace("#","");
  // Dentro de um ritual, a seta global respeita a hierarquia
  // Meu Dia → Rituais → ritual específico.
  if (route.startsWith("ritual-")) {
    state.route="rituais";
    location.hash="rituais";
    render();
    window.scrollTo(0,0);
    return;
  }
  // Dentro de uma frente de Trabalho, voltar retorna à tela Trabalho,
  // e não à Home.
  if (route.startsWith("trabalho-")) {
    state.route="trabalho";
    location.hash="trabalho";
    return;
  }
  // Planos é o pai de Tarefas e Compromissos.
  if (route === "pendencias" || route === "compromissos") {
    state.route="planos";
    location.hash="planos";
    render();
    window.scrollTo(0,0);
    return;
  }
  state.route="meu-dia";
  location.hash="meu-dia";
  render();
};

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () =>
    navigator.serviceWorker.register("sw.js").catch(console.warn)
  );
}

render();

window.renderShoppingUniversal=renderShoppingUniversal;window.renderProgressOverview=renderProgressOverview;
