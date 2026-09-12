// BERTH.A app-v2.8.13 · Casa schema-safe
window.BERTHA_BUILD="2.8.14-casa";
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
 if(!sug || !sug.maps?.length) return `<section class="study-now-card"><div class="eyebrow">📚 ESTUDOS</div><strong>Nenhum conteúdo precisa entrar agora.</strong><p>Sua janela está disponível. Se quiser estudar, escolha livremente; caso contrário, preserve o espaço.</p></section>`;
 const first=sug.maps[0];
 const label=win.minutes>=75?'até 1h30':win.minutes>=45?'até 1h':'até 40 min';
 return `<section class="study-now-card"><div class="eyebrow">📚 ESTUDOS · ${escapeHtml(win.label)} · ${label}</div><h3>${escapeHtml(sug.title)}</h3><p>${escapeHtml(sug.text)}</p><button class="study-now-action" onclick="location.hash='#estudos';setTimeout(()=>document.getElementById('mapa-${first.id}')?.scrollIntoView({behavior:'smooth',block:'center'}),80)">Mapa ${String(first.id).padStart(3,'0')} · ${escapeHtml(first.materia)}<small>${escapeHtml(first.topico)}</small></button></section>`;
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
function renderMeuDia(){
 ensureStudyMeuDiaStyles();
 const d=mvNow(), h=d.getHours(), greet=h<12?'Bom dia':h<18?'Boa tarde':'Boa noite', b=mvCurrentBlock(), p=mvPending();
 const focus=b[3]==='rest'?[['Desacelerar','Nada urgente precisa entrar aqui.']]:p.slice(0,3).map(x=>[x.title||x.name||'Pendência',x.note||'Pendência para hoje']);
 if(!focus.length)focus.push(['Seu essencial está em dia','Use este espaço para viver, descansar ou escolher o que importa.']);
 const w=mvDow(d), ho={1:'16:40–18:40',2:'15:40–17:40',3:'16:40–18:40',4:'15:40–17:40',5:'15:40–17:40'}[w]||'—';
 return `<section class="day-hero"><div class="eyebrow">💜 MEU DIA</div><h1>${greet}, Duaila.</h1><p class="day-date">${mvDate()}</p></section>
 <section class="now-card ${b[3]}"><div class="card-kicker">AGORA</div><div class="now-title">${b[0]}</div><div class="now-time">${b[1]}</div><p>${b[2]}</p></section>
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
  `;
  document.head.appendChild(style);
}

/* NAVEGAÇÃO PRINCIPAL — MINHA VIDA
   A abertura padrão é Meu Dia. A barra inferior mantém quatro acessos:
   Meu Dia · Pendências · Rituais · Mais. O menu Mais começa por Meu Dia
   e depois Pendências, como definido no fluxo do app.
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
    <a class="nav-item" data-route="meu-dia" href="#meu-dia" aria-label="Meu Dia">💜<span>Meu Dia</span></a>
    <a class="nav-item" data-route="pendencias" href="#pendencias" aria-label="Pendências">📝<span>Pendências</span></a>
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
      ['pendencias','📝 Pendências'],
      ['ideias','💡 Criação & Ideias'],
      ['estudos','📚 Estudos / CEBRASPE'],
      ['financeiro','💰 Financeiro'],
      ['casa','🏠 Casa'],
      ['exercicios','🏃 Exercícios'],
      ['alimentacao','🍽️ Alimentação'],
      ['receitas','📖 Receitas']
    ];
    links.innerHTML = desired.map(([r,label]) => `<a href="#${r}" data-module-route="${r}">${label}</a>`).join('');
    links.querySelectorAll('[data-module-route]').forEach(a=>a.addEventListener('click',()=>{const dlg=document.getElementById('moduleMenu');if(dlg?.open)dlg.close();}));
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
      route === "pendencias" ? "📝 Pendências" :
      route === "meu-dia" ? "💜 Meu Dia" :
      route === "ideias" ? "💡 Criação & Ideias" :
      route === "rituais" ? "✨ Rituais" :
      route === "estudos" ? "📚 Estudos" :
      route === "financeiro" ? "💰 Financeiro" :
      route === "casa" ? "🏠 Casa" :
      route === "exercicios" ? "🏃 Exercícios" :
      route === "alimentacao" ? "🍽️ Alimentação" :
      route === "receitas" ? "📖 Receitas" :
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

  if (route === "pendencias") renderPendencias();
  else if (route === "ideias") renderIdeias();
  else if (route === "rituais") renderRituais();
  else if (route === "estudos") renderEstudos();
  else if (route === "financeiro") renderFinanceiro();
  else if (route === "casa") renderCasa();
  else if (route === "exercicios") renderExercicios();
  else if (route === "alimentacao") renderAlimentacao();
  else if (route === "receitas") renderReceitas();
  else renderPlaceholder();
}

window.addEventListener("hashchange", render);

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
    <section class="hero">
      <h2>Vamos tirar isso da cabeça.</h2>
      <p>Um lugar simples para guardar o que precisa ser resolvido — sem transformar tudo em urgência.</p>
    </section>

    <div class="add-row">
      <input class="search" id="searchInput" placeholder="Buscar pendência..." value="${escapeHtml(state.search)}">
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
      <div class="symbol">☁︎</div>
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
  document.querySelector("#dialogEyebrow").textContent = p ? "EDITAR PENDÊNCIA" : "NOVA PENDÊNCIA";
  document.querySelector("#dialogTitle").textContent = p ? "Editar pendência" : "Adicionar pendência";
  document.querySelector("#pendingTitle").value = p?.title || "";
  document.querySelector("#pendingCategory").value = p?.category || "Pessoal";
  document.querySelector("#pendingDue").value = p?.due || "";
  document.querySelector("#pendingNote").value = p?.note || "";
  document.querySelector("#deletePendingBtn").hidden = !p;
  dialog.showModal();
  setTimeout(() => document.querySelector("#pendingTitle").focus(), 50);
}

function closeModal() {
  dialog.close();
  state.editingId = null;
}
document.querySelector("#cancelPendingBtn").onclick = closeModal;
document.querySelector("#deletePendingBtn").onclick = () => {
  if (!state.editingId) return;
  if (confirm("Excluir esta pendência?")) {
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
   IDEIAS
========================================================= */

const IDEAS_KEY = "minha-vida.ideias.v1";
let ideaFilter = "todas";

function loadIdeias() {
  try { return JSON.parse(localStorage.getItem(IDEAS_KEY)) || []; }
  catch { return []; }
}
function saveIdeias(items) {
  localStorage.setItem(IDEAS_KEY, JSON.stringify(items));
}
function renderIdeias() {
  const all = loadIdeias();
  const counts = {
    todas: all.length,
    ideias: all.filter(x => x.type === "ideia").length,
    projetos: all.filter(x => x.type === "projeto").length,
    planos: all.filter(x => x.type === "plano").length
  };
  const filtered = all
    .filter(x => ideaFilter === "todas" || x.type === ideaFilter)
    .sort((a,b) => b.updatedAt - a.updatedAt);

  app.innerHTML = `
    <section class="hero">
      <h2>Guarde sem se obrigar.</h2>
      <p>Ideias podem simplesmente existir. Quando fizer sentido, uma delas pode virar projeto, plano ou pendência.</p>
    </section>

    <div class="add-row">
      <input class="search" id="ideaSearch" placeholder="Buscar ideia..." autocomplete="off">
      <button class="primary" id="addIdeaBtn">＋ Adicionar</button>
    </div>

    <div class="tabs idea-tabs">
      ${ideaTab("todas","Tudo",counts.todas)}
      ${ideaTab("ideia","Ideias",counts.ideias)}
      ${ideaTab("projeto","Projetos",counts.projetos)}
      ${ideaTab("plano","Planos",counts.planos)}
    </div>

    <div class="list" id="ideaList">
      ${filtered.length ? filtered.map(ideaCardHtml).join("") : ideaEmptyHtml()}
    </div>
  `;

  document.querySelector("#addIdeaBtn").onclick = () => openIdeaModal();
  document.querySelector("#ideaSearch").oninput = e => {
    const q = e.target.value.toLowerCase();
    document.querySelector("#ideaList").innerHTML = filtered
      .filter(x => `${x.title} ${x.note}`.toLowerCase().includes(q))
      .map(ideaCardHtml).join("") || ideaEmptyHtml();
    bindIdeaCards();
  };
  document.querySelectorAll(".idea-tab").forEach(b => b.onclick = () => {
    ideaFilter = b.dataset.filter;
    renderIdeias();
  });
  bindIdeaCards();
}

function ideaTab(filter, label, count) {
  return `<button class="tab idea-tab ${ideaFilter===filter?"active":""}" data-filter="${filter}">${label}${count ? ` · ${count}` : ""}</button>`;
}
function ideaCardHtml(x) {
  const typeLabel = x.type === "projeto" ? "Projeto" : x.type === "plano" ? "Plano" : "Ideia";
  return `
    <article class="card pending-card idea-card" data-idea-id="${x.id}">
      <div class="pending">
        <div class="idea-symbol">${x.type === "projeto" ? "◌" : x.type === "plano" ? "⌁" : "✦"}</div>
        <div class="pending-main">
          <div class="pending-title">${escapeHtml(x.title)}</div>
          <div class="meta"><span class="pill">${typeLabel}</span></div>
          ${x.note ? `<p class="note">${escapeHtml(x.note)}</p>` : ""}
        </div>
        <button class="more idea-more" aria-label="Editar">•••</button>
      </div>
    </article>`;
}
function ideaEmptyHtml() {
  return `<div class="empty"><div class="symbol">✦</div><strong>Esse espaço está leve.</strong><span>Registre uma ideia quando ela aparecer. Ela não precisa virar tarefa.</span></div>`;
}
function bindIdeaCards() {
  document.querySelectorAll("[data-idea-id]").forEach(card => {
    card.onclick = e => {
      if (e.target.closest(".idea-more")) e.stopPropagation();
      openIdeaModal(card.dataset.ideaId);
    };
  });
}

function openIdeaModal(id=null) {
  const p = id ? loadIdeias().find(x => x.id===id) : null;
  const title = p ? "Editar registro" : "Nova ideia";
  const type = p?.type || "ideia";
  const body = `
    <form method="dialog" id="ideaForm" class="modal-card">
      <div class="modal-head">
        <div><div class="eyebrow">${p ? "EDITAR" : "CRIAÇÃO & IDEIAS"}</div><h2>${title}</h2></div>
        <button class="icon-btn" value="cancel" aria-label="Fechar">×</button>
      </div>
      <label>
        Nome
        <input id="ideaTitle" required maxlength="120" value="${escapeHtml(p?.title || "")}" placeholder="Ex.: Organizar projeto da casa">
      </label>
      <label>
        Tipo
        <select id="ideaType">
          <option value="ideia" ${type==="ideia"?"selected":""}>Ideia</option>
          <option value="projeto" ${type==="projeto"?"selected":""}>Projeto</option>
          <option value="plano" ${type==="plano"?"selected":""}>Plano</option>
        </select>
      </label>
      <label>
        Observação <span class="muted">(opcional)</span>
        <textarea id="ideaNote" rows="4" maxlength="500" placeholder="Contexto, inspiração, próximos pensamentos...">${escapeHtml(p?.note || "")}</textarea>
      </label>
      <div class="modal-actions">
        ${p ? `<button type="button" class="secondary" id="deleteIdeaBtn">Excluir</button>` : ""}
        <div class="grow"></div>
        <button type="button" class="secondary" id="cancelIdeaBtn">Cancelar</button>
        <button class="primary" value="default">Salvar</button>
      </div>
    </form>`;
  const d = document.createElement("dialog");
  d.id = "ideaDialog";
  d.innerHTML = body;
  document.body.appendChild(d);
  d.showModal();
  d.querySelector("#cancelIdeaBtn").onclick = () => { d.close(); d.remove(); };
  if (p) d.querySelector("#deleteIdeaBtn").onclick = () => {
    if (confirm("Excluir este registro?")) {
      saveIdeias(loadIdeias().filter(x => x.id !== p.id));
      d.close(); d.remove(); renderIdeias();
    }
  };
  d.querySelector("#ideaForm").addEventListener("submit", e => {
    e.preventDefault();
    const items = loadIdeias();
    const data = {
      title: d.querySelector("#ideaTitle").value.trim(),
      type: d.querySelector("#ideaType").value,
      note: d.querySelector("#ideaNote").value.trim()
    };
    if (!data.title) return;
    if (p) {
      const i = items.findIndex(x => x.id===p.id);
      items[i] = {...items[i], ...data, updatedAt:Date.now()};
    } else {
      items.push({id:uid(), ...data, createdAt:Date.now(), updatedAt:Date.now()});
    }
    saveIdeias(items);
    d.close(); d.remove(); renderIdeias();
  });
  setTimeout(() => d.querySelector("#ideaTitle").focus(), 50);
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
      <p>Rotinas que cuidam de você sem virar uma lista infinita. Cada ritual tem seu próprio espaço.</p>
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
function addDaysISO(ms,n){const d=new Date(ms);d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)}
function nextStepFor(a={}){if(!a.primeira)return{field:"primeira",label:"1ª volta"};if(!a.questoes)return{field:"questoes",label:"Questões"};if(!a.domino)return{field:"domino",label:"Domínio"};return{field:"done",label:"Dominado"}}
function nextReviewFor(a={}){if(!a.primeiraAt)return null;for(const k of["r1","r3","r7","r15"])if(!a[k]&&a[k+"Due"])return{key:k,label:k.toUpperCase(),due:a[k+"Due"]};return null}
function toggleMapa(id,f){const d=loadMapasStatus(),k=String(id),a={...(d[k]||{})};if(f==="primeira"&&!a.primeira){a.primeira=true;a.primeiraAt=Date.now();a.r1Due=addDaysISO(a.primeiraAt,1);a.r3Due=addDaysISO(a.primeiraAt,3);a.r7Due=addDaysISO(a.primeiraAt,7);a.r15Due=addDaysISO(a.primeiraAt,15)}else if(f==="primeira"){a.primeira=false;a.primeiraAt=null;["r1","r3","r7","r15"].forEach(x=>{delete a[x];delete a[x+"Due"]})}else if(f==="questoes")a.questoes=!a.questoes;else if(f==="domino"){if(!a.primeira||!a.questoes){alert("Complete primeiro a 1ª volta e as questões.");return}a.domino=!a.domino}saveMapasStatus({...d,[k]:a});renderEstudos()}
function estudoSugestao(min=30){const d=loadMapasStatus(),rev=TCDF_MAPAS.filter(x=>nextReviewFor(d[x.id])),due=TCDF_MAPAS.filter(x=>!d[x.id]?.domino);if(rev.length)return{title:"Revisão primeiro",text:"Há revisão prevista antes de abrir conteúdo novo.",maps:rev.slice(0,1)};return{title:min<=30?"Janela de 30 min":"Próximo conteúdo",text:"Escolha um mapa que caiba no tempo disponível.",maps:due.slice(0,1)}}
function studyNorm(v=""){return String(v).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")}
function studyStatus(a={}){return a.domino?"dominio":a.questoes?"questoes":a.primeira?"primeira":"nao-iniciado"}

function renderEstudos(){
 const d=loadEstudos(),st=loadMapasStatus(),c=loadStudyContents(),first=TCDF_MAPAS.filter(x=>st[x.id]?.primeira).length,q=TCDF_MAPAS.filter(x=>st[x.id]?.questoes).length,dom=TCDF_MAPAS.filter(x=>st[x.id]?.domino).length,sug=estudoSugestao(30);
 app.innerHTML=`<section class="hero"><div class="eyebrow">ESTUDOS</div><h2>Aprender, sem carregar tudo na cabeça.</h2><p>Escolha o conteúdo. A BERTH.A cuida do tempo, do progresso e das próximas sugestões.</p></section>
 <div class="study-v10-stats"><div><b>${d.sessions.length}</b><span>sessões</span></div><div><b>${dom}</b><span>dominados</span></div><div><b>260</b><span>mapas</span></div></div>
 <div class="study-section"><div class="section-heading"><div><div class="eyebrow">TCDF 2026</div><h3>Biblioteca de mapas</h3></div><button class="secondary" id="viewMaps">Ver mapas</button></div><div class="card study-v10-summary"><div><strong>260 mapas cadastrados</strong><span>${first} em 1ª volta · ${q} com questões · ${dom} dominados</span></div><button class="secondary" id="searchMaps">⌕ Buscar</button></div></div>
 <div class="study-section"><div class="section-heading"><div><div class="eyebrow">SUGESTÃO INTELIGENTE</div><h3>${escapeHtml(sug.title)}</h3></div></div><div class="card"><p>${escapeHtml(sug.text)}</p>${sug.maps[0]?`<button class="primary" data-start-map="${sug.maps[0].id}">Começar · Mapa ${String(sug.maps[0].id).padStart(3,"0")}</button>`:""}</div></div>
 <div class="study-section"><div class="section-heading"><div><div class="eyebrow">OUTROS ESTUDOS</div><h3>Outros conteúdos</h3></div><button class="secondary" id="addContent">＋ Conteúdo</button></div><div class="list">${c.length?c.map(contentCard).join(""):`<div class="empty compact"><strong>Nenhum conteúdo adicionado.</strong><span>Cadastre MBA, Tarot, aulas, áudios ou outros estudos online.</span></div>`}</div></div>
 <div class="study-section"><div class="section-heading"><div><div class="eyebrow">HISTÓRICO</div><h3>Estudos realizados</h3></div><button class="secondary" id="pastStudy">＋ Registrar passado</button></div><div class="list">${d.sessions.length?d.sessions.slice().reverse().slice(0,8).map(sessionHtml).join(""):`<div class="empty compact"><strong>Nenhum estudo registrado.</strong><span>Começar → Concluir mede o tempo automaticamente.</span></div>`}</div></div>`;
 document.querySelector("#viewMaps")?.addEventListener("click",()=>openMaps(false));document.querySelector("#searchMaps")?.addEventListener("click",()=>openMaps(true));document.querySelector("[data-start-map]")?.addEventListener("click",e=>startMap(+e.currentTarget.dataset.startMap));document.querySelector("#addContent")?.addEventListener("click",()=>contentDialog());document.querySelector("#pastStudy")?.addEventListener("click",pastDialog);document.querySelectorAll("[data-study-session]").forEach(card=>card.onclick=()=>openPastStudyActions(card.dataset.studySession));document.querySelectorAll("[data-content-start]").forEach(b=>b.onclick=()=>startContent(b.dataset.contentStart));document.querySelectorAll("[data-content-open]").forEach(b=>b.onclick=()=>openContent(b.dataset.contentOpen));document.querySelectorAll("[data-content-edit]").forEach(b=>b.onclick=()=>contentDialog(b.dataset.contentEdit));document.querySelectorAll("[data-content-delete]").forEach(b=>b.onclick=()=>deleteStudyContent(b.dataset.contentDelete));
}
function contentCard(x){return `<article class="card study-v10-content"><div><small>${escapeHtml(x.group||"ESTUDO")}</small><strong>${escapeHtml(x.title)}</strong><span>${x.minutes||60} min${x.note?" · "+escapeHtml(x.note):""}</span></div><div>${x.url?`<button class="secondary" data-content-open="${x.id}">Abrir conteúdo</button>`:""}<button class="primary" data-content-start="${x.id}">Começar</button><button class="secondary" data-content-edit="${x.id}">⋯</button><button class="study-v10-trash" data-content-delete="${x.id}" aria-label="Excluir conteúdo">×</button></div></article>`}
function openMaps(focus){
 const dlg=document.createElement("dialog");dlg.className="study-v10-dialog";dlg.innerHTML=`<div class="study-v10-modal maplib"><div class="study-v10-head"><div><div class="eyebrow">TCDF 2026</div><h2>260 mapas</h2><p>Busque por número, matéria, tema ou palavra-chave.</p></div><button class="study-v10-x">×</button></div><div class="study-v10-search">⌕<input type="search" placeholder="Buscar nos 260 mapas…"></div><div class="study-v10-filters">${[["todos","Todos"],["nao-iniciado","Não iniciados"],["primeira","1ª volta"],["questoes","Questões"],["dominio","Domínio"]].map(([v,l])=>`<button data-filter="${v}" class="${v==="todos"?"active":""}">${l}</button>`).join("")}</div><div class="study-v10-results"></div></div>`;document.body.appendChild(dlg);let filter="todos";const input=dlg.querySelector("input"),res=dlg.querySelector(".study-v10-results");
 const draw=()=>{const st=loadMapasStatus(),term=studyNorm(input.value.trim()),rows=TCDF_MAPAS.filter(x=>(filter==="todos"||studyStatus(st[x.id])===filter)&&(!term||studyNorm(`${x.id} ${String(x.id).padStart(3,"0")} ${x.bloco} ${x.materia} ${x.topico} ${x.semana}`).includes(term)));res.innerHTML=`<div class="study-v10-count">${rows.length} mapa${rows.length===1?"":"s"}</div>`+(rows.length?rows.map(x=>mapRow(x,st[x.id]||{})).join(""):`<div class="empty compact"><strong>Nenhum mapa encontrado.</strong><span>Tente outra palavra-chave.</span></div>`);res.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>{const id=+b.dataset.go;dlg.close();startMap(id)});res.querySelectorAll("[data-toggle]").forEach(b=>b.onclick=()=>{toggleMapa(+b.dataset.id,b.dataset.toggle);setTimeout(draw,0)})};
 dlg.querySelector(".study-v10-x").onclick=()=>dlg.close();input.oninput=draw;dlg.querySelectorAll("[data-filter]").forEach(b=>b.onclick=()=>{filter=b.dataset.filter;dlg.querySelectorAll("[data-filter]").forEach(x=>x.classList.toggle("active",x===b));draw()});dlg.onclose=()=>dlg.remove();draw();dlg.showModal();if(focus)setTimeout(()=>input.focus(),100)
}
function mapRow(x,a){return `<article class="study-v10-map"><div><small>MAPA ${String(x.id).padStart(3,"0")} · ${escapeHtml(x.bloco)} · ${escapeHtml(x.semana)}</small><strong>${escapeHtml(x.topico)}</strong><span>${escapeHtml(x.materia)}</span><em>Próximo: ${nextStepFor(a).label}</em></div><div class="study-v10-mapactions">${[["primeira","1ª"],["questoes","Q"],["domino","D"]].map(([f,l])=>`<button data-id="${x.id}" data-toggle="${f}" class="${a[f]?"done":""}">${l}</button>`).join("")}<button data-go="${x.id}" class="go">Começar</button></div></article>`}
function startViaBertha(item){if(window.BerthaDurationLearning)item.minutes=window.BerthaDurationLearning.effectiveMinutes(item);if(window.BerthaTimeEngine?.start)window.BerthaTimeEngine.start(item);else alert("Atualize também bertha-time-v1.js para usar o timer global.")}
function startMap(id){const x=TCDF_MAPAS.find(v=>v.id===id);if(x)startViaBertha({id:`study:tcdf:${id}`,learningKey:`study:tcdf:${id}`,source:"Estudos",title:`Mapa ${String(id).padStart(3,"0")} · ${x.topico}`,minutes:30,configuredMinutes:30,period:"flex",kind:"study"})}
function startContent(id){const x=loadStudyContents().find(v=>v.id===id);if(!x)return;if(x.url&&confirm("Abrir o conteúdo e começar a medir?"))openContent(id);startViaBertha({id:`study:content:${id}`,learningKey:`study:content:${id}`,source:"Estudos",title:x.title,minutes:+x.minutes||60,configuredMinutes:+x.minutes||60,period:"flex",kind:"study"})}
function openContent(id){const x=loadStudyContents().find(v=>v.id===id);if(!x?.url)return;let u=x.url.trim();if(!/^https?:\/\//i.test(u))u="https://"+u;window.open(u,"_blank","noopener")}
function deleteStudyContent(id){
 const items=loadStudyContents(),item=items.find(x=>x.id===id);if(!item)return;
 if(!confirm(`Excluir “${item.title}”?`))return;
 saveStudyContents(items.filter(x=>x.id!==id));
 renderEstudos();
}
function contentDialog(id){
 const items=loadStudyContents(),e=items.find(x=>x.id===id),dlg=document.createElement("dialog");dlg.className="study-v10-dialog";dlg.innerHTML=`<div class="study-v10-modal"><div class="study-v10-head"><div><div class="eyebrow">ESTUDOS</div><h2>${e?"Editar conteúdo":"Adicionar conteúdo"}</h2><p>MBA, Tarot, áudio, aula ou outro material.</p></div><button class="study-v10-x">×</button></div>${field("Nome",`<input data-title value="${escapeHtml(e?.title||"")}" placeholder="Ex.: MBA · Aula 04">`)}${field("Frente de estudo",`<input data-group value="${escapeHtml(e?.group||"")}" placeholder="Ex.: MBA, Tarot, TCDF">`)}${field("Link para abrir o conteúdo",`<input data-url value="${escapeHtml(e?.url||"")}" placeholder="https://…">`)}${field("Duração planejada",`<div class="study-v10-duration"><input data-dur type="number" min="1" value="${e?.durationValue||e?.minutes||60}"><select data-unit><option value="minutes">minutos</option><option value="hours" ${e?.durationUnit==="hours"?"selected":""}>horas</option></select></div>`)}${field("Observação",`<textarea data-note rows="3">${escapeHtml(e?.note||"")}</textarea>`)}<div class="study-v10-actions">${e?'<button class="danger" data-delete>Excluir</button>':""}<button class="secondary" data-cancel>Cancelar</button><button class="primary" data-save>Salvar</button></div></div>`;document.body.appendChild(dlg);dlg.querySelector(".study-v10-x").onclick=()=>dlg.close();dlg.querySelector("[data-cancel]").onclick=()=>dlg.close();dlg.querySelector("[data-delete]")?.addEventListener("click",()=>{if(!confirm(`Excluir “${e.title}”?`))return;saveStudyContents(loadStudyContents().filter(x=>x.id!==e.id));dlg.close();setTimeout(renderEstudos,0)});dlg.querySelector("[data-save]").onclick=()=>{const title=dlg.querySelector("[data-title]").value.trim();if(!title)return;const v=Math.max(1,+dlg.querySelector("[data-dur]").value||60),u=dlg.querySelector("[data-unit]").value,obj={id:e?.id||`sc-${Date.now()}`,title,group:dlg.querySelector("[data-group]").value.trim(),url:dlg.querySelector("[data-url]").value.trim(),durationValue:v,durationUnit:u,minutes:u==="hours"?v*60:v,note:dlg.querySelector("[data-note]").value.trim()};saveStudyContents(e?items.map(x=>x.id===e.id?obj:x):[...items,obj]);dlg.close();renderEstudos()};dlg.onclose=()=>dlg.remove();dlg.showModal()
}
function field(label,html){return `<label class="study-v10-field"><span>${label}</span>${html}</label>`}
function pastDialog(){
 const d=loadEstudos(),dlg=document.createElement("dialog");dlg.className="study-v10-dialog";dlg.innerHTML=`<div class="study-v10-modal"><div class="study-v10-head"><div><div class="eyebrow">HISTÓRICO</div><h2>Registrar estudo passado</h2><p>Para quando você estudou sem iniciar o timer.</p></div><button class="study-v10-x">×</button></div>${field("O que você estudou?",'<input data-title placeholder="Ex.: MBA · Gestão de Pessoas">')}${field("Data",`<input data-date type="date" value="${new Date().toISOString().slice(0,10)}">`)}${field("Tempo real",'<div class="study-v10-duration"><input data-dur type="number" min="1" value="30"><select data-unit><option value="minutes">minutos</option><option value="hours">horas</option></select></div>')}<div class="study-v10-actions"><button class="secondary" data-cancel>Cancelar</button><button class="primary" data-save>Salvar</button></div></div>`;document.body.appendChild(dlg);dlg.querySelector(".study-v10-x").onclick=()=>dlg.close();dlg.querySelector("[data-cancel]").onclick=()=>dlg.close();dlg.querySelector("[data-save]").onclick=()=>{const t=dlg.querySelector("[data-title]").value.trim();if(!t)return;const v=+dlg.querySelector("[data-dur]").value||30,u=dlg.querySelector("[data-unit]").value;d.sessions.push({id:`s-${Date.now()}`,subject:t,date:dlg.querySelector("[data-date]").value,minutes:u==="hours"?v*60:v});saveEstudos(d);dlg.close();renderEstudos()};dlg.onclose=()=>dlg.remove();dlg.showModal()
}

function openPastStudyActions(id){
 const data=loadEstudos(),s=data.sessions.find(x=>String(x.id)===String(id));if(!s)return;
 const dlg=document.createElement("dialog");dlg.className="study-v10-dialog";
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
  {name:"Itaú 4590 — fatura alta",value:5566.54,payer:"Mãe",reason:"Pago pela mãe; fora do orçamento da usuária."},
  {name:"Unimed + Unidental",value:0,payer:"Empregador",reason:"Benefício; não entra no orçamento."},
  {name:"BEC",value:0,payer:"—",reason:"Sem despesas atuais."}
 ],
 goals:[
  {month:"Setembro",min:2000,max:3000,saved:0},
  {month:"Outubro",min:2000,max:3000,saved:0},
  {month:"Novembro",min:2000,max:3000,saved:0},
  {month:"Dezembro",min:2000,max:3000,saved:0}
 ],
 transactions:[]
};
function loadFin(){
 try{
  const raw=JSON.parse(localStorage.getItem(FIN_KEY));
  if(raw)return {...FIN_BASE,...raw,fixed:raw.fixed||FIN_BASE.fixed,excluded:raw.excluded||FIN_BASE.excluded,goals:raw.goals||FIN_BASE.goals,transactions:raw.transactions||[]};
 }catch{}
 // migrate the previous finance store if it exists
 try{
  const old=JSON.parse(localStorage.getItem("minha-vida.financeiro.v1"));
  if(old){const migrated={...FIN_BASE,income:old.income||FIN_BASE.income,fixed:old.expenses||FIN_BASE.fixed,excluded:old.excluded||FIN_BASE.excluded,goals:(old.goals||FIN_BASE.goals).map(g=>({...g,saved:g.saved||0})),transactions:old.transactions||[]};saveFin(migrated);return migrated;}
 }catch{}
 return JSON.parse(JSON.stringify(FIN_BASE));
}
function saveFin(d){localStorage.setItem(FIN_KEY,JSON.stringify(d));}
function money(n){return Number(n||0).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2});}
function finFixedTotal(d){return d.fixed.reduce((s,x)=>s+Number(x.value||0),0);}
function finMonthTotal(d,month){return d.transactions.filter(x=>(x.date||"").slice(0,7)===month).reduce((s,x)=>s+Number(x.value||0),0);}
function finCategoryTotals(d,month){const out={};d.transactions.filter(x=>(x.date||"").slice(0,7)===month).forEach(x=>{const k=x.category||"Variável";out[k]=(out[k]||0)+Number(x.value||0)});return out;}
function finCurrentMonth(){return todayISO().slice(0,7);}
function finMonthLabel(iso){const [y,m]=iso.split("-");return new Intl.DateTimeFormat("pt-BR",{month:"long",year:"numeric"}).format(new Date(Number(y),Number(m)-1,1));}
function finFixedHtml(x){return `<article class="card finance-row"><div><strong>${escapeHtml(x.name)}</strong><span>${escapeHtml(x.category)}${x.kind==="teto"?" · teto":""}</span></div><b>R$ ${money(x.value)}</b></article>`;}
function finTransactionHtml(x){return `<article class="card finance-row"><div><strong>${escapeHtml(x.name)}</strong><span>${x.date?formatDate(x.date):""} · ${escapeHtml(x.category||"Variável")}</span></div><b>R$ ${money(x.value)}</b><button class="mini-delete" data-fin-delete="${x.id}" aria-label="Excluir">×</button></article>`;}
function renderFinanceiro(){
 const d=loadFin(),month=finCurrentMonth(),fixed=finFixedTotal(d),variable=finMonthTotal(d,month),planned=fixed+variable,remaining=d.income-planned,cats=finCategoryTotals(d,month);
 const catHtml=Object.entries(cats).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([k,v])=>`<div class="finance-cat"><span>${escapeHtml(k)}</span><strong>R$ ${money(v)}</strong></div>`).join("")||`<div class="empty compact"><strong>Nenhum gasto variável registrado.</strong><span>Registre apenas o que realmente precisar acompanhar.</span></div>`;
 const goalTotal=d.goals.reduce((s,g)=>s+Number(g.saved||0),0), goalMin=d.goals.reduce((s,g)=>s+Number(g.min||0),0), goalMax=d.goals.reduce((s,g)=>s+Number(g.max||0),0);
 app.innerHTML=`<section class="hero"><h2>💰 Financeiro</h2><p>Clareza sobre o dinheiro, sem transformar sua vida em contabilidade.</p></section>
 <section class="finance-summary card"><div class="finance-main"><span class="eyebrow">RENDA MENSAL</span><strong>R$ ${money(d.income)}</strong><button class="text-btn" id="editIncome">editar</button></div><div class="finance-metrics"><div><span>Base</span><b>R$ ${money(fixed)}</b></div><div><span>Variável · ${escapeHtml(finMonthLabel(month))}</span><b>R$ ${money(variable)}</b></div><div><span>Disponível conhecido</span><b>R$ ${money(remaining)}</b></div></div></section>
 <div class="section-title">ORÇAMENTO BASE</div><div class="list">${d.fixed.map(finFixedHtml).join("")}</div><button class="add-full secondary" id="addFixed">＋ Adicionar item ao orçamento</button>
 <div class="section-title">GASTOS DO MÊS</div><section class="card"><div class="panel-head"><div><span class="eyebrow">${escapeHtml(finMonthLabel(month))}</span><h3>O que saiu de verdade</h3></div><button class="primary compact-btn" id="addTransaction">＋ Registrar</button></div><div class="list inner-list">${d.transactions.slice().reverse().slice(0,20).map(finTransactionHtml).join("")||`<div class="empty compact"><strong>Nenhum gasto registrado.</strong><span>O registro é opcional — use quando ajudar a enxergar seu mês.</span></div>`}</div></section>
 <div class="section-title">POR CATEGORIA</div><section class="card finance-cats">${catHtml}</section>
 <div class="section-title">FUNDO CARRO</div><section class="card goal-card"><div class="panel-head"><div><span class="eyebrow">SETEMBRO → DEZEMBRO</span><h3>Construção da meta</h3></div><span class="pill today">R$ ${money(goalTotal)}</span></div><p class="note">Meta mensal planejada: R$ ${money(goalMin)}–R$ ${money(goalMax)}.</p><div class="goal-list">${d.goals.map((g,i)=>`<div class="goal-row"><span>${escapeHtml(g.month)}</span><strong>R$ ${money(g.saved||0)} / ${money(g.min)}–${money(g.max)}</strong><button class="goal-toggle ${Number(g.saved||0)>=Number(g.min||0)?"done":""}" data-goal="${i}">${Number(g.saved||0)>=Number(g.min||0)?"✓":"＋"}</button></div>`).join("")}</div></section>
 <div class="section-title">FORA DO SEU ORÇAMENTO</div><div class="list">${d.excluded.map(x=>`<div class="card excluded-card"><div><strong>${escapeHtml(x.name)}</strong><span>${x.value?`R$ ${money(x.value)} · `:""}${escapeHtml(x.reason)}</span></div><span class="pill">${escapeHtml(x.payer)}</span></div>`).join("")}</div>`;
 ensureFinanceStyles();
 document.getElementById("editIncome").onclick=()=>openFinModal("income");
 document.getElementById("addFixed").onclick=()=>openFinModal("fixed");
 document.getElementById("addTransaction").onclick=()=>openFinModal("transaction");
 document.querySelectorAll("[data-fin-delete]").forEach(b=>b.onclick=()=>{const x=loadFin();x.transactions=x.transactions.filter(t=>t.id!==b.dataset.finDelete);saveFin(x);renderFinanceiro()});
 document.querySelectorAll("[data-goal]").forEach(b=>b.onclick=()=>{const x=loadFin(),i=+b.dataset.goal;const current=Number(x.goals[i].saved||0);const next=current>=Number(x.goals[i].min||0)?0:Number(x.goals[i].min||0);x.goals[i].saved=next;saveFin(x);renderFinanceiro()});
}
function ensureFinanceStyles(){
 if(document.getElementById("finance-v2-styles"))return;
 const s=document.createElement("style");s.id="finance-v2-styles";s.textContent=`
 .finance-summary{background:linear-gradient(135deg,#edf5f2,#f2edf8);border:1px solid rgba(92,72,104,.10)}
 .finance-main{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.finance-main strong{font-size:32px;display:block;width:100%}.text-btn{border:0;background:transparent;color:#77558a;font-weight:700;padding:0}
 .finance-metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:16px}.finance-metrics>div{background:rgba(255,255,255,.62);border-radius:16px;padding:10px}.finance-metrics span{display:block;font-size:12px;color:#817783}.finance-metrics b{display:block;margin-top:4px;font-size:14px}
 .compact-btn{padding:9px 12px!important}.inner-list{margin-top:12px}.finance-row{position:relative;display:flex;align-items:center;justify-content:space-between;gap:10px}.finance-row>div{min-width:0}.finance-row b{white-space:nowrap}.mini-delete{border:0;background:transparent;color:#9a8e98;font-size:22px;padding:4px}.finance-cats{display:grid;gap:8px}.finance-cat{display:flex;justify-content:space-between;padding:10px 12px;border-radius:14px;background:#faf6f2}.finance-cat span{color:#655c67}.goal-toggle{min-width:38px}.goal-toggle.done{background:#e4f1eb}
 @media(max-width:420px){.finance-metrics{grid-template-columns:1fr}.panel-head{gap:8px}}
 `;document.head.appendChild(s);
}
function openFinModal(type){
 const d=loadFin(),dlg=document.createElement("dialog");
 const title=type==="income"?"Ajustar renda mensal":type==="fixed"?"Adicionar ao orçamento":"Registrar gasto";
 dlg.innerHTML=`<form method="dialog" class="modal-card" id="finForm"><div class="modal-head"><div><div class="eyebrow">💰 FINANCEIRO</div><h2>${title}</h2></div><button class="icon-btn" value="cancel">×</button></div>
 ${type==="income"?`<label>Renda mensal<input id="fValue" required type="number" min="0" step="0.01" value="${d.income}"></label>`:`<label>Descrição<input id="fName" required maxlength="100"></label><div class="form-grid"><label>Valor<input id="fValue" required type="number" min="0" step="0.01"></label><label>Categoria<select id="fCategory"><option>Casa</option><option>Alimentação</option><option>Transporte</option><option>Animais</option><option>Cartão</option><option>Dívidas</option><option>Henrique</option><option>Assinaturas</option><option>Saúde</option><option>Variável</option><option>Outros</option></select></label></div>${type==="transaction"?`<label>Data<input id="fDate" type="date" value="${todayISO()}"></label>`:`<label>Tipo<select id="fKind"><option>fixo</option><option>teto</option></select></label>`}`}
 <div class="modal-actions"><div class="grow"></div><button type="button" class="secondary" id="cancelFin">Cancelar</button><button class="primary" value="default">Salvar</button></div></form>`;
 document.body.appendChild(dlg);dlg.showModal();dlg.querySelector("#cancelFin").onclick=()=>{dlg.close();dlg.remove()};
 dlg.querySelector("#finForm").addEventListener("submit",e=>{e.preventDefault();if(type==="income"){d.income=+dlg.querySelector("#fValue").value||0}else{const obj={id:uid(),name:dlg.querySelector("#fName").value.trim(),value:+dlg.querySelector("#fValue").value||0,category:dlg.querySelector("#fCategory").value,updatedAt:Date.now()};if(type==="transaction"){obj.date=dlg.querySelector("#fDate").value;d.transactions.push(obj)}else{obj.kind=dlg.querySelector("#fKind").value;obj.payer="Usuária";d.fixed.push(obj)}}saveFin(d);dlg.close();dlg.remove();renderFinanceiro()});
}


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
 @media(max-width:420px){.casa-web-grid{grid-template-columns:1fr}}@media(max-width:380px){.casa-schedule-row{grid-template-columns:76px 1fr}.casa-time{font-size:10px}}
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
 ["🧹 Dicas de limpeza","https://www.google.com/search?q=dicas+de+limpeza+da+casa"],
 ["👕 Cuidados com roupas","https://www.google.com/search?q=dicas+cuidados+com+roupas+lavagem+secagem"],
 ["🧺 Organização da lavanderia","https://www.google.com/search?q=organizacao+da+lavanderia+dicas"],
 ["🌿 Jardim e áreas externas","https://www.google.com/search?q=dicas+cuidados+jardim+e+areas+externas"],
 ["🐾 Cuidados com gatos","https://www.google.com/search?q=dicas+cuidados+com+gatos+em+casa"],
 ["✨ Organização da casa","https://www.google.com/search?q=dicas+organizacao+da+casa"]
];



function casaManualById(id){return CASA_MANUAL_PROCEDURES.find(x=>x.id===id)||null;}
function openCasaManual(id){
 const h=casaManualById(id);if(!h)return;
 const o=document.createElement("div");o.className="mv-how-overlay";
 const products=h.products.length?h.products:["Nenhum produto específico."];
 o.innerHTML=`<div class="mv-how"><button class="mv-how-x" type="button">×</button><div class="eyebrow">MANUAL DA CASA · ${escapeHtml(h.area)}</div><h2>🧽 ${escapeHtml(h.title)}</h2><div class="casa-how-top-actions"><button type="button" class="secondary" id="editManualCasa">✏️ Editar este procedimento</button></div><div class="casa-how-meta"><span>⏱️ ${escapeHtml(h.time)}</span></div><h3>🧴 Produtos</h3><ul>${products.map(x=>`<li><span>${escapeHtml(x)}</span><button type="button" class="casa-buy-mini" data-casa-buy="${escapeHtml(x)}">＋ compras</button></li>`).join("")}</ul><h3>🧰 Utensílios / materiais</h3><ul>${h.materials.map(x=>`<li><span>${escapeHtml(x)}</span><button type="button" class="casa-buy-mini" data-casa-buy="${escapeHtml(x)}">＋ compras</button></li>`).join("")}</ul><h3>Passo a passo</h3><ol>${h.steps.map(x=>`<li>${escapeHtml(x)}</li>`).join("")}</ol><div class="casa-how-tip"><strong>💡 Dica</strong><p>${escapeHtml(h.tip)}</p></div></div>`;
 document.body.appendChild(o);
 o.querySelector(".mv-how-x").onclick=()=>o.remove();
 o.addEventListener("click",e=>{if(e.target===o)o.remove()});
 o.querySelector("#editManualCasa").onclick=()=>{o.remove();openCasaManualEditor(id)};
 o.querySelectorAll("[data-casa-buy]").forEach(b=>b.onclick=()=>{addCasaShopping(b.dataset.casaBuy,h.title);b.textContent="✓ na lista";b.disabled=true;});
}
function openCasaManualEditor(id){
 const h=casaManualById(id);if(!h)return;const custom=loadCasaHowCustom()[id]||{};const dlg=document.createElement("dialog");
 dlg.innerHTML=`<form method="dialog" class="modal-card" id="manualCasaEdit"><div class="modal-head"><div><div class="eyebrow">MANUAL DA CASA</div><h2>Editar procedimento</h2></div><button class="icon-btn" value="cancel">×</button></div><label>Ambiente<input id="mhArea" value="${escapeHtml(custom.area||h.area)}"></label><label>Atividade<input id="mhTitle" value="${escapeHtml(custom.title||h.title)}"></label><label>Tempo<input id="mhTime" value="${escapeHtml(custom.time||h.time)}"></label><label>🧴 Produtos <small>um por linha</small><textarea id="mhProducts" rows="5">${escapeHtml((custom.products||h.products).join("\n"))}</textarea></label><label>🧰 Utensílios / materiais <small>um por linha</small><textarea id="mhMaterials" rows="5">${escapeHtml((custom.materials||h.materials).join("\n"))}</textarea></label><label>Passo a passo <small>um passo por linha</small><textarea id="mhSteps" rows="8">${escapeHtml((custom.steps||h.steps).join("\n"))}</textarea></label><label>💡 Dica<textarea id="mhTip" rows="3">${escapeHtml(custom.tip||h.tip)}</textarea></label><div class="modal-actions"><div class="grow"></div><button type="button" class="secondary" id="cancelMh">Cancelar</button><button class="primary" value="default">Salvar alterações</button></div></form>`;
 document.body.appendChild(dlg);dlg.showModal();dlg.querySelector("#cancelMh").onclick=()=>{dlg.close();dlg.remove()};
 dlg.querySelector("#manualCasaEdit").addEventListener("submit",e=>{e.preventDefault();const all=loadCasaHowCustom();all[id]={area:dlg.querySelector("#mhArea").value.trim()||h.area,title:dlg.querySelector("#mhTitle").value.trim()||h.title,time:dlg.querySelector("#mhTime").value.trim()||h.time,products:casaHowList(dlg.querySelector("#mhProducts").value),materials:casaHowList(dlg.querySelector("#mhMaterials").value),steps:casaHowList(dlg.querySelector("#mhSteps").value),tip:dlg.querySelector("#mhTip").value.trim()||h.tip};saveCasaHowCustom(all);dlg.close();dlg.remove();openCasaManual(id)});
}
function casaManualViewData(id){const h=casaManualById(id),c=loadCasaHowCustom()[id]||{};return h?{...h,...c,products:Array.isArray(c.products)?c.products:h.products,materials:Array.isArray(c.materials)?c.materials:h.materials,steps:Array.isArray(c.steps)?c.steps:h.steps}:null;}
function renderCasaManual(){
 const groups={};CASA_MANUAL_PROCEDURES.forEach(x=>{(groups[x.area]||(groups[x.area]=[])).push(x)});
 return Object.entries(groups).map(([area,items])=>`<div class="card casa-manual-area"><div class="panel-head"><h3>🧽 ${escapeHtml(area)}</h3><span class="pill">${items.length}</span></div><div class="casa-manual-list">${items.map(x=>{const h=casaManualViewData(x.id);return `<div class="casa-manual-row"><div><strong>${escapeHtml(h.title)}</strong><small>⏱️ ${escapeHtml(h.time)}</small></div><button type="button" class="home-how" data-casa-manual="${x.id}">Como fazer →</button></div>`}).join("")}</div></div>`).join("");
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
 return `<button type="button" class="secondary casa-inline-add" id="addCasaRecipe">＋ Nova receita da casa</button>`+recipes.map(r=>`<div class="card casa-recipe"><div class="panel-head"><h3>🧪 ${escapeHtml(r.title)}</h3><div class="casa-recipe-head-actions"><span class="pill">${escapeHtml(r.time||"")}</span><button type="button" class="casa-recipe-edit" data-recipe-edit="${r.id}">Editar</button></div></div><p class="note">Rendimento: ${escapeHtml(r.yieldText||"—")}</p><h4>Ingredientes</h4><ul>${(r.ingredients||[]).map(([n,q])=>`<li><span>${escapeHtml(n)} — <b>${escapeHtml(q||"")}</b></span><button type="button" class="casa-buy-mini" data-recipe-buy="${escapeHtml(n)}">＋ compras</button></li>`).join("")}</ul>${(r.materials||[]).length?`<h4>Utensílios / materiais</h4><ul>${r.materials.map(x=>`<li><span>${escapeHtml(x)}</span></li>`).join("")}</ul>`:""}<h4>Preparo</h4><ol>${(r.steps||[]).map(x=>`<li>${escapeHtml(x)}</li>`).join("")}</ol><div class="casa-how-tip"><strong>💡 Observação</strong><p>${escapeHtml(r.tip||"")}</p></div></div>`).join("");
}
function openCasaRecipeEditor(id){
 const recipes=loadCasaRecipes(),r=id?recipes.find(x=>String(x.id)===String(id)):null;
 const base=r||{id:`recipe-${Date.now()}`,title:"",time:"5 min",yieldText:"",ingredients:[],materials:[],steps:[],tip:""};
 const dlg=document.createElement("dialog");dlg.className="study-v10-dialog";
 dlg.innerHTML=`<form class="study-v10-modal" id="casaRecipeForm"><div class="study-v10-head"><div><div class="eyebrow">CASA · RECEITAS</div><h2>${r?"Editar receita":"Nova receita"}</h2><p>Ingredientes, quantidades e preparo ficam editáveis.</p></div><button type="button" class="study-v10-x" data-close>×</button></div>
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
function renderCasaInventory(){return `<div class="card casa-inventory"><div class="panel-head"><div><h3>🧴 Produtos que você tem</h3><p class="note">Os produtos atuais permanecem em uso até acabarem. A transição para Tudo Limpinho acontece conforme o mapa do manual.</p></div><span class="pill">${CASA_PRODUCT_CATALOG.length}</span></div><div class="casa-product-list">${CASA_PRODUCT_CATALOG.map(x=>`<div class="casa-product-row"><div><strong>${escapeHtml(x.name)}</strong><small>${escapeHtml(x.use)}</small><small>Substituição: ${escapeHtml(x.substitute)}</small></div><span class="pill">${escapeHtml(x.status)}</span></div>`).join("")}</div><div class="panel-head inventory-tools-head"><h3>🧰 Utensílios e equipamentos</h3><span class="pill">${CASA_INVENTORY_TOOLS.length}</span></div><div class="chip-list">${CASA_INVENTORY_TOOLS.map(x=>`<span class="pill">${escapeHtml(x)}</span>`).join("")}</div></div>`;}

const CASA_DURATION_KEY="minha-vida.casa.duration.v1";
const CASA_DURATION={coz1:10,coz2:10,coz3:5,coz4:10,coz5:5,lim1:20,lim2:15,lim3:15,lim4:75,roup1:10,roup2:45,roup3:30,roup4:10,roup5:10,roup6:60,roup7:60,roup8:35,roup9:20,roup10:20,ani1:10,ani2:10,hen1:5,hen2:10,hen3:5,hen4:10,hen5:20};
function loadCasaDurations(){try{return {...CASA_DURATION,...JSON.parse(localStorage.getItem(CASA_DURATION_KEY)||"{}")}}catch{return {...CASA_DURATION}}}
function saveCasaDurations(x){localStorage.setItem(CASA_DURATION_KEY,JSON.stringify(x))}
function casaDuration(id){return `${loadCasaDurations()[id]||15} min`}
function openCasaTaskEditor(id){
 const d=loadCasa(),task=d.areas.flatMap(a=>a.tasks).find(t=>t.id===id);if(!task)return;const ds=loadCasaDurations(),dlg=document.createElement('dialog');
 dlg.innerHTML=`<form method="dialog" class="modal-card" id="casaTaskEdit"><div class="modal-head"><div><div class="eyebrow">🏠 CASA</div><h2>Editar rotina</h2></div><button class="icon-btn" value="cancel">×</button></div><label>Atividade<input id="ctName" value="${escapeHtml(task.name)}"></label><label>Duração real estimada (min)<input id="ctMin" type="number" min="5" max="480" step="5" value="${ds[id]||15}"></label><label>Horário / janela preferencial<input id="ctTime" value="${escapeHtml(casaTime(id))}"></label><label>Frequência<input id="ctFreq" value="${escapeHtml(task.freq)}"></label><div class="modal-actions"><div class="grow"></div><button type="button" class="secondary" id="cancelCt">Cancelar</button><button class="primary" value="default">Salvar</button></div></form>`;document.body.appendChild(dlg);dlg.showModal();dlg.querySelector('#cancelCt').onclick=()=>{dlg.close();dlg.remove()};dlg.querySelector('#casaTaskEdit').addEventListener('submit',e=>{e.preventDefault();task.name=dlg.querySelector('#ctName').value.trim()||task.name;task.freq=dlg.querySelector('#ctFreq').value.trim()||task.freq;ds[id]=Math.max(5,+dlg.querySelector('#ctMin').value||ds[id]||15);const times=loadCasaTimes();times[id]=dlg.querySelector('#ctTime').value.trim()||times[id];saveCasa(d);saveCasaDurations(ds);saveCasaTimes(times);dlg.close();dlg.remove();renderCasa()});
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
const CASA_SHOP_KEY="minha-vida.compras.casa.v1";
const SHARED_SHOP_KEY="minha-vida.compras.v1";
function loadSharedShopping(){try{const x=JSON.parse(localStorage.getItem(SHARED_SHOP_KEY)||"[]");return Array.isArray(x)?x.filter(Boolean).map((i,idx)=>({id:i?.id||`shop-${Date.now()}-${idx}`,name:String(i?.name||i?.title||i?.item||"").trim(),source:i?.source||"Compras",category:i?.category||"Casa",cycle:i?.cycle||"monthly",createdAt:i?.createdAt||Date.now(),done:!!i?.done,...i})).filter(i=>i.name):[]}catch{return []}}
function saveSharedShopping(x){localStorage.setItem(SHARED_SHOP_KEY,JSON.stringify(x))}
function migrateCasaShopping(){let legacy=[];try{legacy=JSON.parse(localStorage.getItem(CASA_SHOP_KEY)||"[]")||[]}catch{}const shared=loadSharedShopping();let changed=false;legacy.forEach(x=>{if(!shared.some(y=>String(y.name).toLowerCase()===String(x.name).toLowerCase())){shared.push({...x,category:"Casa",cycle:"monthly"});changed=true}});if(changed)saveSharedShopping(shared)}
function loadCasaShopping(){migrateCasaShopping();return loadSharedShopping().filter(x=>(x.category||"Casa")==="Casa")}
function saveCasaShopping(items){const other=loadSharedShopping().filter(x=>(x.category||"Casa")!=="Casa");saveSharedShopping([...other,...items])}
function refreshCasaShoppingUI(){const host=document.querySelector('.casa-shopping-card');if(host){host.innerHTML=`<p class="note">Produtos e utensílios enviados pelos procedimentos aparecem aqui e também em <b>Compras do mês</b>.</p>${renderCasaShoppingMini()}`;bindCasaShoppingMini()}const meta=document.querySelector('#casa-sec-compras summary .casa-section-meta > span:first-child');if(meta)meta.textContent=`${loadCasaShopping().filter(x=>!x.done).length} pendentes`}
function addCasaShopping(name,source){name=(name||"").trim();if(!name)return false;const items=loadSharedShopping();if(!items.some(x=>String(x.name).toLowerCase()===name.toLowerCase()&&!x.done)){items.push({id:uid(),name,source:source||"Casa",category:"Casa",cycle:"monthly",createdAt:Date.now(),done:false});saveSharedShopping(items)}refreshCasaShoppingUI();return true}
function removeCasaShopping(id){saveSharedShopping(loadSharedShopping().filter(x=>String(x.id)!==String(id)));refreshCasaShoppingUI()}
function bindCasaShoppingMini(){document.querySelectorAll("[data-casa-shop-done]").forEach(b=>b.onchange=()=>{const all=loadSharedShopping(),x=all.find(i=>String(i.id)===String(b.dataset.casaShopDone));if(x)x.done=b.checked;saveSharedShopping(all);refreshCasaShoppingUI()});document.querySelectorAll("[data-casa-shop-del]").forEach(b=>b.onclick=()=>removeCasaShopping(b.dataset.casaShopDel))}
function casaHowList(text){return String(text||"").split(/\n|;/).map(x=>x.trim()).filter(Boolean)}
function openCasaHowEditor(id){
 const h=casaHowData(id);if(!h)return;
 const dlg=document.createElement("dialog");dlg.className="study-v10-dialog";
 dlg.innerHTML=`<form class="study-v10-modal" id="casaHowEdit"><div class="study-v10-head"><div><div class="eyebrow">CASA</div><h2>Editar como fazer</h2><p>Produtos, utensílios e passo a passo.</p></div><button type="button" class="study-v10-x" data-close>×</button></div>
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
 const o=document.createElement("div");o.className="mv-how-overlay";
 const productRows=(h.products.length?h.products:["Nenhum produto específico — siga a orientação da etiqueta ou da superfície."]).map(x=>`<li><span>${escapeHtml(x)}</span><button type="button" class="casa-buy-mini" data-casa-buy="${escapeHtml(x)}">＋ compras</button></li>`).join("");
 const materialRows=h.materials.map(x=>`<li><span>${escapeHtml(x)}</span><button type="button" class="casa-buy-mini" data-casa-buy="${escapeHtml(x)}">＋ compras</button></li>`).join("");
 o.innerHTML=`<div class="mv-how"><button class="mv-how-x" onclick="this.closest('.mv-how-overlay').remove()">×</button><div class="eyebrow">COMO FAZER</div><h2>🧺 ${escapeHtml(h.title)}</h2>
 <div class="casa-how-top-actions"><button type="button" class="secondary" id="editCasaHow">✏️ Editar este procedimento</button></div>
 <div class="casa-how-meta"><span>⏱️ ${escapeHtml(h.time)}</span></div>
 <h3>🧴 Produtos</h3><ul>${productRows}</ul>
 <h3>🧰 Utensílios / materiais</h3><ul>${materialRows}</ul>
 <h3>Passo a passo</h3><ol>${h.steps.map(x=>`<li>${escapeHtml(x)}</li>`).join("")}</ol>
 <div class="casa-how-tip"><strong>💡 Dica</strong><p>${escapeHtml(h.tip)}</p></div>
 <div class="casa-how-shopping-note">🛒 Quando algum produto ou utensílio estiver acabando, toque em <b>＋ compras</b>. Ele vai para a lista compartilhada de compras.</div></div>`;
 document.body.appendChild(o);
 o.querySelector("#editCasaHow").onclick=()=>{o.remove();openCasaHowEditor(id)};
 o.querySelectorAll("[data-casa-buy]").forEach(b=>b.onclick=()=>{addCasaShopping(b.dataset.casaBuy,h.title);b.textContent="✓ na lista";b.disabled=true;});
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
function casaFinishRoutine(id){const d=loadCasa(),hit=casaTaskById(id,d);if(!hit)return;const active=window.BerthaTimeEngine?.active?.();if(active&&String(active.id)===`casa:routine:${id}`){window.BerthaTimeEngine.finish();return;}hit.task.done=true;hit.task.completedAt=Date.now();const ex=loadCasaExecutions();ex.push({id:uid(),kind:"routine",refId:id,title:hit.task.name,area:hit.area.title,completedAt:Date.now()});saveCasaExecutions(ex);saveCasa(d);renderCasa()}
function casaReopenRoutine(id){const d=loadCasa(),hit=casaTaskById(id,d);if(!hit)return;hit.task.done=false;delete hit.task.completedAt;saveCasa(d);renderCasa()}
function maintenanceMinutes(m){const v=Math.max(1,+m.durationValue||30);return m.durationUnit==="hours"?v*60:v}
function casaStartMaintenance(id){const d=loadCasa(),m=d.maintenance.find(x=>String(x.id)===String(id));if(!m)return;const minutes=maintenanceMinutes(m);startViaBertha({id:`casa:maintenance:${id}`,learningKey:`casa:maintenance:${m.name.toLowerCase()}`,source:"Casa · Manutenção",title:m.name,minutes,configuredMinutes:minutes,date:m.date||"",period:m.period||"flex",time:m.time||"",priority:m.priority||"normal",kind:"home-maintenance"})}
function nextMaintenanceDate(date,freq){if(!date||!freq||freq==="Única"||freq==="Conforme necessário")return date||"";const d=new Date(date+"T12:00:00");if(Number.isNaN(d.getTime()))return date;if(freq==="Diária")d.setDate(d.getDate()+1);if(freq==="Semanal")d.setDate(d.getDate()+7);if(freq==="Quinzenal")d.setDate(d.getDate()+14);if(freq==="Mensal")d.setMonth(d.getMonth()+1);return d.toISOString().slice(0,10)}
function casaFinishMaintenance(id){const d=loadCasa(),m=d.maintenance.find(x=>String(x.id)===String(id));if(!m)return;const active=window.BerthaTimeEngine?.active?.();if(active&&String(active.id)===`casa:maintenance:${id}`){window.BerthaTimeEngine.finish();return;}m.lastCompletedAt=Date.now();const ex=loadCasaExecutions();ex.push({id:uid(),kind:"maintenance",refId:id,title:m.name,area:m.area||"Casa",completedAt:Date.now()});saveCasaExecutions(ex);if(m.frequency&&!["Única","Conforme necessário"].includes(m.frequency)){m.date=nextMaintenanceDate(m.date,m.frequency);m.status="a_fazer"}else m.status="concluida";saveCasa(d);renderCasa()}
function casaSection(icon,title,meta,body,id){return `<details class="casa-section" id="${id||""}"><summary><span class="casa-section-left"><span>${icon}</span><strong>${title}</strong></span><span class="casa-section-meta">${meta?`<span>${meta}</span>`:""}<span class="casa-chevron">⌄</span></span></summary><div class="casa-section-body">${body}</div></details>`}
function maintenanceCard(m){const meta=[m.area,m.type,m.date?formatDate(m.date):"",`${maintenanceMinutes(m)} min`,m.priority,m.responsible].filter(Boolean);return `<div class="card casa-maint-card"><div><strong>${escapeHtml(m.name)}</strong>${m.note?`<p class="note">${escapeHtml(m.note)}</p>`:""}</div><div class="casa-maint-meta">${meta.map(x=>`<span>${escapeHtml(String(x))}</span>`).join("")}</div><div class="casa-maint-actions"><button type="button" class="start" data-maint-start="${m.id}">▶ Começar</button><button type="button" class="edit" data-maint-edit="${m.id}">Editar</button><button type="button" class="finish" data-maint-finish="${m.id}">✓ Concluir</button></div></div>`}
function renderCasaCore(){
 ensureCasaManualStyles();
 const d=loadCasa();
 d.maintenance=(Array.isArray(d.maintenance)?d.maintenance:[]).filter(Boolean).map(m=>({status:"a_fazer",area:"Casa geral",type:"Reparo / conserto",durationValue:30,durationUnit:"minutes",priority:"normal",frequency:"Única",responsible:"Eu",notify:false,period:"flex",...m}));
 const all=d.areas.flatMap(a=>a.tasks),done=all.filter(x=>x.done).length;
 const routinesHtml=`<div class="list">${d.areas.map(a=>`<div class="card home-area"><div class="panel-head"><h3>${a.icon} ${escapeHtml(a.title)}</h3><span class="pill">${a.tasks.length}</span></div>${a.tasks.length?a.tasks.map(t=>`<div class="home-task-wrap"><label class="home-task ${t.done?"done":""}"><input type="checkbox" data-casa-task="${a.id}|${t.id}" ${t.done?"checked":""}><span><strong>${escapeHtml(t.name)}</strong><small>⏱️ ${escapeHtml(casaDuration(t.id))} · ⏰ ${escapeHtml(casaTime(t.id))} · ${escapeHtml(t.freq)} · ${escapeHtml(t.when)}</small></span></label><div class="home-task-actions">${CASA_HOW[t.id]?`<button type="button" class="home-how" data-casa-how="${t.id}">Como fazer →</button>`:""}<button type="button" class="home-edit" data-casa-edit="${t.id}">Editar</button></div><div class="casa-task-exec">${t.done?`<button type="button" class="casa-task-reopen" data-casa-reopen="${t.id}">↻ Fazer novamente</button>`:`<button type="button" class="casa-task-start" data-casa-start="${t.id}">▶ Começar</button><button type="button" class="casa-task-finish" data-casa-finish="${t.id}">✓ Concluir</button>`}</div></div>`).join(""):`<p class="note">Sem rotina cadastrada. Mantemos espaço para incluir apenas o que realmente for necessário.</p>`}</div>`).join("")}</div>`;
 const scheduleHtml=`<div class="card casa-schedule-card"><p class="note">Esses horários são referências para encaixe no dia — não uma agenda rígida.</p><div class="casa-schedule">${all.filter(t=>casaTime(t.id)&&casaTime(t.id)!="ao fim do ciclo").slice().sort((a,b)=>String(casaTime(a.id)).localeCompare(String(casaTime(b.id)))).map(t=>`<div class="casa-schedule-row"><span class="casa-time">${escapeHtml(casaTime(t.id))}</span><strong>${escapeHtml(t.name)}</strong></div>`).join("")}</div></div>`;
 const activeMaint=d.maintenance.filter(m=>m.status!=="concluida"),closedMaint=d.maintenance.filter(m=>m.status==="concluida");
 const maintenanceHtml=`<div class="card"><p class="note">Reparos, prevenção e melhorias da casa. Cada manutenção fica ligada a uma área, pode entrar no Meu Dia e pode usar o mesmo ciclo de execução da BERTH.A.</p><button class="secondary" id="addMaintenance">＋ Adicionar manutenção</button></div><div class="list">${activeMaint.map(maintenanceCard).join("")||`<div class="empty compact"><strong>Nenhuma manutenção pendente.</strong><span>Ótimo. Não precisamos criar trabalho só para preencher espaço.</span></div>`}</div>${closedMaint.length?`<div class="card"><div class="panel-head"><h3>Concluídas</h3><span class="pill">${closedMaint.length}</span></div>${closedMaint.slice().reverse().map(m=>`<div class="casa-history-row"><div><strong>${escapeHtml(m.name)}</strong><small>${escapeHtml(m.area||"Casa")} · ${m.lastCompletedAt?new Date(m.lastCompletedAt).toLocaleDateString('pt-BR'):''}</small></div><button type="button" class="more" data-maint-edit="${m.id}">›</button></div>`).join("")}</div>`:""}`;
 app.innerHTML=`<section class="hero"><h2>🏠 Casa</h2><p>Uma casa funcional, sem transformar a manutenção em uma segunda jornada.</p></section>
 <div class="home-principle card"><span class="eyebrow">REGRA DA CASA</span><strong>Agrupar. Delegar. Adiar quando puder.</strong><p>Não espalhar microtarefas pelo dia. O essencial entra em blocos; o resto pode esperar.</p></div>
 <div class="home-summary"><div class="card"><span>Rotinas</span><b>${all.length}</b></div><div class="card"><span>Feitas agora</span><b>${done}</b></div></div>
 ${casaSection("🧹","Rotinas da Casa",`${all.length} rotinas`,routinesHtml,"casa-sec-rotinas")}
 ${casaSection("🛠️","Manutenção",activeMaint.length?`${activeMaint.length} pendente${activeMaint.length===1?'':'s'}`:"em dia",maintenanceHtml,"casa-sec-manutencao")}
 ${casaSection("📖","Manual da Casa",`${CASA_MANUAL_PROCEDURES.length} procedimentos`,`<div class="list">${renderCasaManual()}</div>`,"casa-sec-manual")}
 ${casaSection("🧪","Receitas da Casa",`${loadCasaRecipes().length} receitas`,`<div class="list">${renderCasaRecipes()}</div>`,"casa-sec-receitas")}
 ${casaSection("🧴","Inventário da Casa",`${CASA_PRODUCT_CATALOG.length} produtos`,renderCasaInventory(),"casa-sec-inventario")}
 ${casaSection("⏰","Horários da Casa","referências",scheduleHtml,"casa-sec-horarios")}
 ${casaSection("💡","Dicas para a Casa","consulta",`<div class="card casa-web-card"><p class="note">Quando quiser aprofundar uma tarefa, abra um caminho para a internet. O conteúdo externo é complementar; o essencial continua dentro da BERTH.A.</p><div class="casa-web-grid">${CASA_WEB.map(([label,url])=>`<a class="casa-web-link" href="${url}" target="_blank" rel="noopener">${label}<span>↗</span></a>`).join("")}</div></div>`,"casa-sec-dicas")}
 ${casaSection("🛒","Lista de compras da Casa",`${loadCasaShopping().filter(x=>!x.done).length} pendentes`,`<div class="card casa-shopping-card"><p class="note">Produtos e utensílios enviados pelos procedimentos ficam aqui e também podem ser vistos na lista de compras.</p>${renderCasaShoppingMini()}</div>`,"casa-sec-compras")}`;
 document.querySelectorAll("[data-casa-task]").forEach(el=>el.onchange=()=>{const [aid,tid]=el.dataset.casaTask.split("|"),x=loadCasa(),a=x.areas.find(a=>a.id===aid),t=a.tasks.find(t=>t.id===tid);if(t){t.done=el.checked;if(t.done)t.completedAt=Date.now();else delete t.completedAt;saveCasa(x);renderCasa();}});
 document.querySelectorAll("[data-casa-how]").forEach(b=>b.onclick=()=>openCasaHow(b.dataset.casaHow));
 document.querySelectorAll("[data-casa-edit]").forEach(b=>b.onclick=()=>openCasaTaskEditor(b.dataset.casaEdit));
 document.querySelectorAll("[data-casa-start]").forEach(b=>b.onclick=()=>casaStartRoutine(b.dataset.casaStart));
 document.querySelectorAll("[data-casa-finish]").forEach(b=>b.onclick=()=>casaFinishRoutine(b.dataset.casaFinish));
 document.querySelectorAll("[data-casa-reopen]").forEach(b=>b.onclick=()=>casaReopenRoutine(b.dataset.casaReopen));
 bindCasaShoppingMini();
 document.querySelectorAll("[data-casa-manual]").forEach(b=>b.onclick=()=>openCasaManual(b.dataset.casaManual));
 document.querySelectorAll("[data-recipe-buy]").forEach(b=>b.onclick=()=>{addCasaShopping(b.dataset.recipeBuy,"Receita da Casa");b.textContent="✓ na lista";b.disabled=true;});
 document.querySelectorAll("[data-recipe-edit]").forEach(b=>b.onclick=()=>openCasaRecipeEditor(b.dataset.recipeEdit));
 document.querySelector("#addCasaRecipe")?.addEventListener("click",()=>openCasaRecipeEditor());
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
    {id:"treino1",name:"Esteira",type:"Cardio",target:"20 min",days:["Seg","Ter","Qua","Qui","Sex"],active:true},
    {id:"treino2",name:"Treino de força",type:"Força",target:"Conforme treino",days:[],active:true}
  ],
  sessions:[],
  notes:""
};
function loadEx(){try{const d=JSON.parse(localStorage.getItem(EX_KEY));if(d)return {...EX_BASE,...d};}catch{}return JSON.parse(JSON.stringify(EX_BASE));}
function saveEx(d){localStorage.setItem(EX_KEY,JSON.stringify(d));}
function renderExercicios(){
 const d=loadEx(), today=new Date().toISOString().slice(0,10);
 const sessions=d.sessions.slice().reverse();
 app.innerHTML=`<section class="hero"><h2>🏃 Exercícios</h2><p>Movimento como parte da rotina — sem transformar treino em cobrança.</p></section>
 <div class="exercise-focus card"><span class="eyebrow">HOJE</span><strong>05:35–05:55 · Esteira</strong><p>20 minutos. O objetivo é manter o ritual da manhã, não buscar perfeição.</p><button class="primary" id="quickExercise">✓ Registrar treino de hoje</button></div>
 <div class="section-title">ROTINA DE MOVIMENTO</div>
 <div class="list">${d.plans.map(p=>`<div class="card exercise-plan"><div><strong>${escapeHtml(p.name)}</strong><span>${escapeHtml(p.type)} · ${escapeHtml(p.target)}</span>${p.days.length?`<small>${p.days.join(" · ")}</small>`:""}</div><span class="pill">${p.active?"Ativo":"Pausado"}</span></div>`).join("")}</div>
 <button class="secondary add-full" id="addPlan">＋ Adicionar treino</button>
 <div class="section-title">REGISTRO</div>
 <div class="list">${sessions.slice(0,12).map(s=>`<div class="card exercise-session"><div><strong>${escapeHtml(s.name)}</strong><span>${formatDate(s.date)} · ${escapeHtml(s.duration||"")} ${s.note?`· ${escapeHtml(s.note)}`:""}</span></div><button class="more" data-ex="${s.id}">×</button></div>`).join("")||`<div class="empty compact"><strong>Nenhum treino registrado ainda.</strong><span>Comece pelo ritual de esteira da manhã.</span></div>`}</div>
 <div class="card exercise-note"><span class="eyebrow">REGRA</span><p>Se o dia apertar, o treino pode ser reduzido. Se estiver cansada, descanso não é falha — é parte do sistema.</p></div>`;
 document.querySelector("#quickExercise").onclick=()=>addExerciseSession("Esteira","20 min",today);
 document.querySelector("#addPlan").onclick=()=>openExercisePlan();
 document.querySelectorAll("[data-ex]").forEach(b=>b.onclick=()=>{const x=loadEx();x.sessions=x.sessions.filter(s=>s.id!==b.dataset.ex);saveEx(x);renderExercicios();});
}
function addExerciseSession(name,duration,date){
 const d=loadEx();
 if(d.sessions.some(s=>s.date===date&&s.name===name)){alert("Esse treino já foi registrado hoje.");return;}
 d.sessions.push({id:uid(),name,duration,date,note:"",createdAt:Date.now()});saveEx(d);renderExercicios();
}
function openExercisePlan(){
 const d=loadEx(),dlg=document.createElement("dialog");
 dlg.innerHTML=`<form method="dialog" class="modal-card" id="exForm"><div class="modal-head"><div><div class="eyebrow">🏃 EXERCÍCIOS</div><h2>Novo treino</h2></div><button class="icon-btn" value="cancel">×</button></div>
 <label>Nome<input id="eName" required maxlength="70" placeholder="Ex.: Pilates"></label>
 <div class="form-grid"><label>Tipo<input id="eType" value="Treino"></label><label>Duração/meta<input id="eTarget" placeholder="Ex.: 30 min"></label></div>
 <div class="modal-actions"><div class="grow"></div><button type="button" class="secondary" id="cancelEx">Cancelar</button><button class="primary" value="default">Salvar</button></div></form>`;
 document.body.appendChild(dlg);dlg.showModal();dlg.querySelector("#cancelEx").onclick=()=>{dlg.close();dlg.remove()};
 dlg.querySelector("#exForm").addEventListener("submit",e=>{e.preventDefault();d.plans.push({id:uid(),name:dlg.querySelector("#eName").value.trim(),type:dlg.querySelector("#eType").value.trim(),target:dlg.querySelector("#eTarget").value.trim(),days:[],active:true});saveEx(d);dlg.close();dlg.remove();renderExercicios();});
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
 lunchbox:true,
 shoppingWeekly:true,
 cookingDone:false
};
function loadFood(){try{const d=JSON.parse(localStorage.getItem(FOOD_KEY));if(d)return {...FOOD_BASE,...d};}catch{}return JSON.parse(JSON.stringify(FOOD_BASE));}
function saveFood(d){localStorage.setItem(FOOD_KEY,JSON.stringify(d));}
function renderAlimentacao(){
 const d=loadFood();
 app.innerHTML=`<section class="hero"><h2>🍽️ Alimentação</h2><p>Comer bem com menos decisões: cardápio definido, cozinha quinzenal e finalizações simples.</p></section>
 <div class="food-principle card"><span class="eyebrow">SISTEMA DA CASA</span><strong>Jantar → marmita do dia seguinte</strong><p>O planejamento foi construído para 3 pessoas e, de segunda a quinta, uma porção extra para a marmita.</p></div>
 <div class="section-title">SEMANA 1 · CARDÁPIO</div>
 <div class="list"><div class="card"><div class="panel-head"><h3>☀️ Café da manhã</h3><span class="pill">7 dias</span></div>${d.breakfasts.map(x=>`<div class="food-row"><span>${x[0]}</span><strong>${escapeHtml(x[1])}</strong></div>`).join("")}</div>
 <div class="card"><div class="panel-head"><h3>🌙 Jantar + marmita</h3><span class="pill">3 pessoas</span></div>${d.dinners.map(x=>`<div class="food-row"><span>${x[0]}</span><strong>${escapeHtml(x[1])}</strong>${x[2]?`<small>marmita → ${x[2]}</small>`:""}</div>`).join("")}</div></div>
 <div class="section-title">ROTINA DE PREPARO</div>
 <div class="card food-checklist">
  <label><input type="checkbox" id="foodCook" ${d.cookingDone?"checked":""}><span><strong>Cozinha quinzenal</strong><small>Produzir bases, porcionar, etiquetar e congelar.</small></span></label>
  <div class="food-rule"><b>Compra mensal</b><span>Carnes, arroz, feijão, grãos, massas, flocão, tapioca, Rap10, biscoitos, azeite, manteiga, café e itens de boa validade.</span></div>
  <div class="food-rule"><b>Compra semanal</b><span>Frutas, verduras, folhas, pão, iogurtes, cottage, frios e demais perecíveis.</span></div>
 </div>
 <div class="section-title">AMANHÃ</div>
 <div class="card tomorrow-food"><span class="eyebrow">ANTES DE DORMIR</span><strong>Preparar alimentação de amanhã</strong><p>Deixar encaminhados café da manhã, lancheira e marmita. De manhã, apenas finalizar o que for necessário.</p></div>
 <div class="section-title">COMPRAS DO MÊS</div>
 <div class="card" id="monthlyShoppingCard">${renderMonthlyShopping()}</div>
 <div class="card food-note"><span class="eyebrow">FREEZER</span><p>As etiquetas seguem: <strong>NOME • DATA • Nº DE PORÇÕES • FINALIZAÇÃO</strong>. Arroz e feijão podem ser congelados; folhas, salada e itens crocantes ficam frescos.</p></div>`;
 document.querySelector("#foodCook").onchange=e=>{const x=loadFood();x.cookingDone=e.target.checked;saveFood(x);};
 bindMonthlyShopping();
}
function renderMonthlyShopping(){const items=loadSharedShopping().filter(x=>(x.cycle||"monthly")==="monthly");return items.length?`<div class="casa-mini-shopping">${items.map(x=>`<div class="casa-mini-shop-row ${x.done?'done':''}"><label><input type="checkbox" data-month-shop-done="${x.id}" ${x.done?'checked':''}><span>${escapeHtml(x.name)}</span></label><small>${escapeHtml(x.category||x.source||'Compras')}</small><button type="button" class="more" data-month-shop-del="${x.id}">×</button></div>`).join("")}</div>`:`<div class="empty compact"><strong>Nenhum item pendente.</strong><span>Itens enviados pela Casa aparecem aqui automaticamente.</span></div>`}
function bindMonthlyShopping(){document.querySelectorAll('[data-month-shop-done]').forEach(b=>b.onchange=()=>{const all=loadSharedShopping(),x=all.find(i=>String(i.id)===String(b.dataset.monthShopDone));if(x)x.done=b.checked;saveSharedShopping(all);const c=document.querySelector('#monthlyShoppingCard');if(c){c.innerHTML=renderMonthlyShopping();bindMonthlyShopping()}});document.querySelectorAll('[data-month-shop-del]').forEach(b=>b.onclick=()=>{saveSharedShopping(loadSharedShopping().filter(x=>String(x.id)!==String(b.dataset.monthShopDel)));const c=document.querySelector('#monthlyShoppingCard');if(c){c.innerHTML=renderMonthlyShopping();bindMonthlyShopping()}})}

const REC_KEY="minha-vida.receitas.v1";
const RECIPES=[
 {id:"frango-assado",name:"Frango assado com batatas",cat:"Frango",yield:"4 porções",prep:"Produção quinzenal",finish:"Finalizar com arroz + salada"},
 {id:"strogonoff",name:"Strogonoff de frango",cat:"Frango",yield:"4 porções",prep:"Produção quinzenal",finish:"Servir com arroz + batata palha"},
 {id:"alcatra",name:"Bife de alcatra acebolado",cat:"Carne bovina",yield:"3–4 porções",prep:"Preparar próximo ao consumo",finish:"Servir com purê + brócolis"},
 {id:"ragu",name:"Ragu de carne",cat:"Carne bovina",yield:"4 porções",prep:"Congelar em pote de 600–700 g",finish:"Fazer a massa no dia de servir"},
 {id:"hamburguer",name:"Hambúrguer caseiro",cat:"Carne bovina",yield:"1 unidade/pessoa",prep:"Modelar e congelar",finish:"Servir com batata + salada"},
 {id:"musculo",name:"Carne de panela com músculo",cat:"Carne bovina",yield:"4 porções",prep:"Produção quinzenal",finish:"Servir com arroz + feijão + legumes"},
 {id:"panquecas",name:"Panquecas salgadas de carne e queijo",cat:"Coringas",yield:"Conforme receita",prep:"Pode congelar prontas",finish:"Aquecer e servir com salada"},
 {id:"frango-grelhado",name:"Filé de frango grelhado",cat:"Frango",yield:"3–4 porções",prep:"Preparar próximo ao consumo",finish:"Servir com arroz + feijão + legumes"},
 {id:"frango-desfiado",name:"Frango desfiado cremoso para Rap10",cat:"Frango",yield:"3–4 porções",prep:"Congelar o recheio",finish:"Aquecer + Rap10 + salada fresca"},
 {id:"risoto",name:"Risoto rápido de frango/carne",cat:"Coringas",yield:"3–4 porções",prep:"Preparar no dia",finish:"Servir com salada"},
 {id:"porco",name:"Porco assado",cat:"Porco",yield:"3–4 porções",prep:"Produção quinzenal",finish:"Servir com acompanhamentos"},
 {id:"carne-legumes",name:"Carne moída com legumes",cat:"Carne bovina",yield:"3–4 porções",prep:"Produção quinzenal",finish:"Servir com arroz + feijão"},
 {id:"frango-gratinado",name:"Frango gratinado com queijo",cat:"Frango",yield:"4 porções",prep:"Montar e congelar se desejado",finish:"Gratinar antes de servir"},
 {id:"almondegas",name:"Almôndegas",cat:"Carne bovina",yield:"12–20 unidades",prep:"Congelar com molho",finish:"Servir com acompanhamento"},
 {id:"coxa-sobrecoxa",name:"Coxa/sobrecoxa",cat:"Frango",yield:"Conforme compra",prep:"Produção quinzenal",finish:"Finalizar no forno"},
 {id:"arroz-forno",name:"Arroz de forno com frango",cat:"Coringas",yield:"4 porções",prep:"Montar e congelar antes de gratinar",finish:"Gratinar até aquecer e dourar"},
 {id:"porco-rap10",name:"Porco desfiado com Rap10",cat:"Porco",yield:"3–4 porções",prep:"Congelar apenas o porco",finish:"Aquecer + Rap10 + queijo + salada"},
 {id:"fraldinha",name:"Churrasco de fraldinha",cat:"Carne bovina",yield:"3–4 porções",prep:"Congelar a peça crua",finish:"Descongelar na geladeira + churrasqueira"},
 {id:"crepioca",name:"Crepioca de cottage",cat:"Café da manhã",yield:"1 porção",prep:"Preparar na hora",finish:"Ovo + tapioca + cottage"},
 {id:"cuscuz",name:"Cuscuz com queijo",cat:"Café da manhã",yield:"3 porções",prep:"Preparar na hora",finish:"Servir com queijo e, se desejar, manteiga"},
 {id:"pico-morango",name:"Picolé de morango cremoso",cat:"Picolé",yield:"Estoque",prep:"Produção quinzenal",finish:"Manter congelado"},
 {id:"pico-coco",name:"Picolé de coco",cat:"Picolé",yield:"Estoque",prep:"Produção quinzenal",finish:"Manter congelado"},
 {id:"pico-maracuja",name:"Picolé de maracujá cremoso",cat:"Picolé",yield:"Estoque",prep:"Produção quinzenal",finish:"Manter congelado"},
 {id:"pico-banana",name:"Picolé de banana com canela",cat:"Picolé",yield:"Estoque",prep:"Produção quinzenal",finish:"Manter congelado"}
];
function loadRec(){try{const d=JSON.parse(localStorage.getItem(REC_KEY));return d||{favorites:[]};}catch{return {favorites:[]};}}
function saveRec(d){localStorage.setItem(REC_KEY,JSON.stringify(d));}
function renderReceitas(){
 const d=loadRec();
 app.innerHTML=`<section class="hero"><h2>📖 Receitas</h2><p>O livro da casa: receitas organizadas para cozinhar uma vez e facilitar muitos dias.</p></section>
 <div class="recipe-principle card"><span class="eyebrow">COMO USAR</span><strong>Receita → produção → freezer → finalização</strong><p>As receitas fazem parte do sistema de alimentação quinzenal, não são uma lista para decidir o que cozinhar todos os dias.</p></div>
 <div class="recipe-filters"><input id="recipeSearch" placeholder="Buscar receita…"><select id="recipeCat"><option value="">Todas</option>${[...new Set(RECIPES.map(r=>r.cat))].map(c=>`<option>${c}</option>`).join("")}</select></div>
 <div class="list" id="recipeList">${recipeCards(RECIPES,d)}</div>
 <div class="card freezer-rule"><span class="eyebrow">❄️ FREEZER</span><p>Identificar cada preparo com <strong>NOME • DATA • Nº DE PORÇÕES • FINALIZAÇÃO</strong>. Preparações refrigeradas: referência doméstica de 3–4 dias; congelados, preferencialmente ao longo da quinzena.</p></div>`;
 const update=()=>{const q=document.querySelector("#recipeSearch").value.toLowerCase(),c=document.querySelector("#recipeCat").value;document.querySelector("#recipeList").innerHTML=recipeCards(RECIPES.filter(r=>(!q||r.name.toLowerCase().includes(q))&&(!c||r.cat===c)),loadRec());};
 document.querySelector("#recipeSearch").oninput=update;document.querySelector("#recipeCat").onchange=update;
 document.querySelectorAll("[data-fav]").forEach(b=>b.onclick=()=>{const x=loadRec(),id=b.dataset.fav;x.favorites=x.favorites.includes(id)?x.favorites.filter(v=>v!==id):[...x.favorites,id];saveRec(x);update();});
}
function recipeCards(list,d){return list.map(r=>`<article class="card recipe-card"><div class="recipe-main"><div><span class="eyebrow">${escapeHtml(r.cat)}</span><h3>${escapeHtml(r.name)}</h3><span>${escapeHtml(r.yield)} · ${escapeHtml(r.prep)}</span></div><button class="favorite ${d.favorites.includes(r.id)?"active":""}" data-fav="${r.id}">${d.favorites.includes(r.id)?"♥":"♡"}</button></div><p><strong>Finalização:</strong> ${escapeHtml(r.finish)}</p></article>`).join("")||`<div class="empty compact"><strong>Nenhuma receita encontrada.</strong></div>`;}
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
  // Dentro de uma frente de Trabalho, voltar retorna à tela Trabalho,
  // e não à Home.
  if (route.startsWith("trabalho-")) {
    state.route="trabalho";
    location.hash="trabalho";
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
