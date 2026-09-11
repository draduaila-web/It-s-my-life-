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
  return value.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
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
  if (more) more.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    openMainModuleMenu();
  };
  const moduleMenu = document.getElementById('moduleMenu');

  // Garante o fechamento do menu principal pelo X mesmo quando o index
  // estiver vindo de uma versão antiga/cacheada.
  if (moduleMenu) {
    const menuClose = moduleMenu.querySelector('.sheet-head button');
    if (menuClose) menuClose.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      moduleMenu.close();
    };
    moduleMenu.oncancel = (e) => { e.preventDefault(); moduleMenu.close(); };
    moduleMenu.onclick = (e) => {
      if (e.target === moduleMenu) moduleMenu.close();
    };
  }

  const links = document.querySelector('.module-links');
  if (links) {
    const desired = [
      ['meu-dia','💜 Meu Dia'],
      ['pendencias','📝 Pendências'],
      ['ideias','💡 Criação & Ideias'],
      ['trabalho','💼 Trabalho'],
      ['estudos','📚 Estudos / CEBRASPE'],
      ['financeiro','💰 Financeiro'],
      ['casa','🏠 Casa'],
      ['exercicios','🏃 Exercícios'],
      ['alimentacao','🍽️ Alimentação'],
      ['receitas','📖 Receitas']
    ];
    links.innerHTML = desired.map(([r,label]) => `<a href="#${r}">${label}</a>`).join('');
    // Ao escolher um módulo no menu, navega e fecha o menu automaticamente.
    // O usuário não precisa tocar no X.
    links.querySelectorAll('a[href^="#"]').forEach(link => {
      link.onclick = (e) => {
        const href = link.getAttribute('href');
        if (!href) return;
        e.preventDefault();
        const menu = document.getElementById('moduleMenu');
        if (menu && menu.open) menu.close();
        if (location.hash === href) {
          render();
        } else {
          location.hash = href;
        }
      };
    });
  }
}

function openMainModuleMenu() {
  // Busca o menu no momento do toque. Isso evita falhas na primeira abertura
  // quando o DOM ainda está sendo montado ou quando uma versão antiga foi
  // mantida pelo cache do Safari.
  let menu = document.getElementById('moduleMenu');
  if (!menu) {
    // Se a versão do HTML ainda não tiver o dialog, cria uma versão funcional
    // usando a mesma lista oficial de módulos.
    menu = document.createElement('dialog');
    menu.id = 'moduleMenu';
    menu.innerHTML = `
      <div class="sheet-head"><strong>MINHA VIDA</strong><button type="button" aria-label="Fechar">✕</button></div>
      <div class="module-links"></div>`;
    document.body.appendChild(menu);
    const st = document.createElement('style');
    st.textContent = `#moduleMenu{border:0;border-radius:28px;padding:0;width:min(92vw,520px);max-height:82vh;background:#fffaf6;color:#3f3745;box-shadow:0 20px 60px rgba(50,35,55,.25)}#moduleMenu::backdrop{background:rgba(55,45,55,.42);backdrop-filter:blur(5px)}#moduleMenu .sheet-head{display:flex;align-items:center;justify-content:space-between;padding:22px 24px 16px;font-size:24px}#moduleMenu .sheet-head button{border:0;background:transparent;font-size:30px;color:#76578b;padding:8px;cursor:pointer}#moduleMenu .module-links{display:grid;gap:10px;padding:0 16px 20px;overflow:auto}#moduleMenu .module-links a{display:block;padding:18px 20px;border-radius:22px;text-decoration:none;color:#17131a;font-size:21px;font-weight:600}#moduleMenu .module-links a:nth-child(1){background:#f6e0e7}#moduleMenu .module-links a:nth-child(2){background:#eee4f7}#moduleMenu .module-links a:nth-child(3){background:#e2f0e9}#moduleMenu .module-links a:nth-child(4){background:#f8e9b9}#moduleMenu .module-links a:nth-child(5){background:#dfebf7}#moduleMenu .module-links a:nth-child(6){background:#f7dfd1}#moduleMenu .module-links a:nth-child(7){background:#f4dfeb}#moduleMenu .module-links a:nth-child(8){background:#e8e0f4}#moduleMenu .module-links a:nth-child(9){background:#e2f0e9}#moduleMenu .module-links a:nth-child(10){background:#f8edc9}`;
    document.head.appendChild(st);
  }
  ensureMainNavigation();
  menu = document.getElementById('moduleMenu');
  if (!menu) return;
  const links = menu.querySelector('.module-links');
  if (links && !links.children.length) {
    const desired = [['meu-dia','💜 Meu Dia'],['pendencias','📝 Pendências'],['ideias','💡 Criação & Ideias'],['trabalho','💼 Trabalho'],['estudos','📚 Estudos / CEBRASPE'],['financeiro','💰 Financeiro'],['casa','🏠 Casa'],['exercicios','🏃 Exercícios'],['alimentacao','🍽️ Alimentação'],['receitas','📖 Receitas']];
    links.innerHTML = desired.map(([r,label]) => `<a href="#${r}">${label}</a>`).join('');
  }
  const close = menu.querySelector('.sheet-head button');
  if (close) close.onclick = (e) => { e.preventDefault(); menu.close(); };
  menu.querySelectorAll('.module-links a').forEach(link => {
    link.onclick = (e) => {
      e.preventDefault();
      const href = link.getAttribute('href');
      menu.close();
      if (location.hash === href) render(); else location.hash = href;
    };
  });
  if (!menu.open) menu.showModal();
}

// Delegação global: garante que o botão Mais funcione mesmo que a barra seja
// reconstruída depois do primeiro carregamento.
if (!window.__minhaVidaMoreDelegate) {
  window.__minhaVidaMoreDelegate = true;
  document.addEventListener('click', (e) => {
    const btn = e.target.closest && e.target.closest('[data-more]');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    openMainModuleMenu();
  }, true);
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
      route === "trabalho" || route.startsWith("trabalho-") ? "💼 Trabalho" :
      "Minha Vida";
  }

  document.querySelectorAll(".bottom-nav .nav-item").forEach(b =>
    b.classList.toggle("active", b.dataset.route === route)
  );

  if (route === "meu-dia") {
    app.innerHTML = renderMeuDia();
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
  else if (route === "trabalho") renderTrabalho();
  else if (route === "trabalho-crefito") renderTrabalhoSub("crefito");
  else if (route === "trabalho-bec") renderTrabalhoSub("bec");
  else if (route === "trabalho-tiktok") renderTrabalhoSub("tiktok");
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

const ESTUDOS_KEY = "minha-vida.estudos.v1";

function loadEstudos() {
  try {
    const data = JSON.parse(localStorage.getItem(ESTUDOS_KEY));
    return data || { subjects: [], sessions: [], reviews: [], questions: [] };
  } catch {
    return { subjects: [], sessions: [], reviews: [], questions: [] };
  }
}
function saveEstudos(data) {
  localStorage.setItem(ESTUDOS_KEY, JSON.stringify(data));
}

const TCDF_MAPAS = [{"id": 1, "bloco": "Orientação", "materia": "Orientação e Estratégia", "topico": "Como funciona a prova do TCDF 2026", "semana": "S1"}, {"id": 2, "bloco": "Orientação", "materia": "Orientação e Estratégia", "topico": "Como funciona a pontuação Cebraspe", "semana": "S1"}, {"id": 3, "bloco": "Orientação", "materia": "Orientação e Estratégia", "topico": "Como usar os Mapas da Aprovação", "semana": "S1"}, {"id": 4, "bloco": "Orientação", "materia": "Orientação e Estratégia", "topico": "Rota visual até a prova", "semana": "S1"}, {"id": 5, "bloco": "P1", "materia": "Língua Portuguesa", "topico": "Mapa Mestre de Língua Portuguesa", "semana": "S1"}, {"id": 6, "bloco": "P1", "materia": "Língua Portuguesa", "topico": "Compreensão e interpretação de textos", "semana": "S1"}, {"id": 7, "bloco": "P1", "materia": "Língua Portuguesa", "topico": "Tipos e gêneros textuais", "semana": "S1"}, {"id": 8, "bloco": "P1", "materia": "Língua Portuguesa", "topico": "Ortografia oficial", "semana": "S1"}, {"id": 9, "bloco": "P1", "materia": "Língua Portuguesa", "topico": "Coesão: referenciação, substituição e repetição", "semana": "S1"}, {"id": 10, "bloco": "P1", "materia": "Língua Portuguesa", "topico": "Conectores e sequenciação textual", "semana": "S1"}, {"id": 11, "bloco": "P1", "materia": "Língua Portuguesa", "topico": "Tempos e modos verbais", "semana": "S1"}, {"id": 12, "bloco": "P1", "materia": "Língua Portuguesa", "topico": "Classes de palavras", "semana": "S1"}, {"id": 13, "bloco": "P1", "materia": "Língua Portuguesa", "topico": "Coordenação", "semana": "S1"}, {"id": 14, "bloco": "P1", "materia": "Língua Portuguesa", "topico": "Subordinação", "semana": "S1"}, {"id": 15, "bloco": "P1", "materia": "Língua Portuguesa", "topico": "Pontuação", "semana": "S1"}, {"id": 16, "bloco": "P1", "materia": "Língua Portuguesa", "topico": "Concordância verbal e nominal", "semana": "S1"}, {"id": 17, "bloco": "P1", "materia": "Língua Portuguesa", "topico": "Regência verbal e nominal", "semana": "S1"}, {"id": 18, "bloco": "P1", "materia": "Língua Portuguesa", "topico": "Crase", "semana": "S1"}, {"id": 19, "bloco": "P1", "materia": "Língua Portuguesa", "topico": "Colocação dos pronomes átonos", "semana": "S1"}, {"id": 20, "bloco": "P1", "materia": "Língua Portuguesa", "topico": "Significação e substituição de palavras/trechos", "semana": "S1"}, {"id": 21, "bloco": "P1", "materia": "Língua Portuguesa", "topico": "Reorganização e reescrita de frases, períodos, gêneros e níveis de formalidade", "semana": "S1"}, {"id": 22, "bloco": "P1", "materia": "Lei Orgânica do DF", "topico": "Mapa Mestre da LODF", "semana": "S2"}, {"id": 23, "bloco": "P1", "materia": "Lei Orgânica do DF", "topico": "Fundamentos da organização dos poderes e do Distrito Federal", "semana": "S2"}, {"id": 24, "bloco": "P1", "materia": "Lei Orgânica do DF", "topico": "Organização do Distrito Federal", "semana": "S2"}, {"id": 25, "bloco": "P1", "materia": "Lei Orgânica do DF", "topico": "Organização dos Poderes", "semana": "S2"}, {"id": 26, "bloco": "P1", "materia": "Lei Orgânica do DF", "topico": "Tributação do Distrito Federal", "semana": "S2"}, {"id": 27, "bloco": "P1", "materia": "Lei Orgânica do DF", "topico": "Orçamento do Distrito Federal", "semana": "S2"}, {"id": 28, "bloco": "P1", "materia": "Lei Orgânica do DF", "topico": "Ordem econômica do Distrito Federal", "semana": "S2"}, {"id": 29, "bloco": "P1", "materia": "DF, RIDE e Política para Mulheres", "topico": "Mapa Mestre: DF, RIDE e Política para Mulheres", "semana": "S2"}, {"id": 30, "bloco": "P1", "materia": "DF, RIDE e Política para Mulheres", "topico": "Realidade étnica e social do Distrito Federal", "semana": "S2"}, {"id": 31, "bloco": "P1", "materia": "DF, RIDE e Política para Mulheres", "topico": "Realidade histórica e geográfica", "semana": "S2"}, {"id": 32, "bloco": "P1", "materia": "DF, RIDE e Política para Mulheres", "topico": "Realidade cultural, política e econômica", "semana": "S2"}, {"id": 33, "bloco": "P1", "materia": "DF, RIDE e Política para Mulheres", "topico": "RIDE — Lei Complementar Federal nº 94/1998", "semana": "S2"}, {"id": 34, "bloco": "P1", "materia": "DF, RIDE e Política para Mulheres", "topico": "RIDE — Decreto Federal nº 7.469/2011", "semana": "S2"}, {"id": 35, "bloco": "P1", "materia": "DF, RIDE e Política para Mulheres", "topico": "Plano Distrital de Política para Mulheres 2020–2023", "semana": "S2"}, {"id": 36, "bloco": "P1", "materia": "DF, RIDE e Política para Mulheres", "topico": "Lei Maria da Penha — Lei nº 11.340/2006", "semana": "S2"}, {"id": 37, "bloco": "P1", "materia": "Primeiros Socorros", "topico": "Cuidados iniciais, urgência, emergência e acionamento do socorro", "semana": "S2"}, {"id": 38, "bloco": "P1", "materia": "Primeiros Socorros", "topico": "Engasgo", "semana": "S2"}, {"id": 39, "bloco": "P1", "materia": "Primeiros Socorros", "topico": "Sangramento", "semana": "S2"}, {"id": 40, "bloco": "P1", "materia": "Primeiros Socorros", "topico": "Fratura", "semana": "S2"}, {"id": 41, "bloco": "P1", "materia": "Primeiros Socorros", "topico": "Queimadura", "semana": "S2"}, {"id": 42, "bloco": "P1", "materia": "Primeiros Socorros", "topico": "Desmaio e convulsão", "semana": "S2"}, {"id": 43, "bloco": "P1", "materia": "Primeiros Socorros", "topico": "Intoxicação", "semana": "S2"}, {"id": 44, "bloco": "P1", "materia": "Raciocínio Lógico e Matemática Financeira", "topico": "Mapa Mestre de RLM", "semana": "S3"}, {"id": 45, "bloco": "P1", "materia": "Raciocínio Lógico e Matemática Financeira", "topico": "Estruturas lógicas", "semana": "S3"}, {"id": 46, "bloco": "P1", "materia": "Raciocínio Lógico e Matemática Financeira", "topico": "Lógica de argumentação", "semana": "S3"}, {"id": 47, "bloco": "P1", "materia": "Raciocínio Lógico e Matemática Financeira", "topico": "Analogias e inferências", "semana": "S3"}, {"id": 48, "bloco": "P1", "materia": "Raciocínio Lógico e Matemática Financeira", "topico": "Deduções e conclusões", "semana": "S3"}, {"id": 49, "bloco": "P1", "materia": "Raciocínio Lógico e Matemática Financeira", "topico": "Proposições simples e compostas", "semana": "S3"}, {"id": 50, "bloco": "P1", "materia": "Raciocínio Lógico e Matemática Financeira", "topico": "Tabelas-verdade", "semana": "S3"}, {"id": 51, "bloco": "P1", "materia": "Raciocínio Lógico e Matemática Financeira", "topico": "Equivalências", "semana": "S3"}, {"id": 52, "bloco": "P1", "materia": "Raciocínio Lógico e Matemática Financeira", "topico": "Leis de De Morgan", "semana": "S3"}, {"id": 53, "bloco": "P1", "materia": "Raciocínio Lógico e Matemática Financeira", "topico": "Diagramas lógicos", "semana": "S3"}, {"id": 54, "bloco": "P1", "materia": "Raciocínio Lógico e Matemática Financeira", "topico": "Lógica de primeira ordem", "semana": "S3"}, {"id": 55, "bloco": "P1", "materia": "Raciocínio Lógico e Matemática Financeira", "topico": "Princípios de contagem", "semana": "S3"}, {"id": 56, "bloco": "P1", "materia": "Raciocínio Lógico e Matemática Financeira", "topico": "Probabilidade", "semana": "S3"}, {"id": 57, "bloco": "P1", "materia": "Raciocínio Lógico e Matemática Financeira", "topico": "Operações com conjuntos", "semana": "S3"}, {"id": 58, "bloco": "P1", "materia": "Raciocínio Lógico e Matemática Financeira", "topico": "Razão, proporção e porcentagem", "semana": "S3"}, {"id": 59, "bloco": "P1", "materia": "Raciocínio Lógico e Matemática Financeira", "topico": "Juros simples", "semana": "S3"}, {"id": 60, "bloco": "P1", "materia": "Raciocínio Lógico e Matemática Financeira", "topico": "Juros compostos", "semana": "S3"}, {"id": 61, "bloco": "P1", "materia": "Raciocínio Lógico e Matemática Financeira", "topico": "Taxas nominal, efetiva e equivalente", "semana": "S3"}, {"id": 62, "bloco": "P1", "materia": "Raciocínio Lógico e Matemática Financeira", "topico": "Sistemas de amortização", "semana": "S3"}, {"id": 63, "bloco": "P1", "materia": "Raciocínio Lógico e Matemática Financeira", "topico": "Fluxo de caixa", "semana": "S3"}, {"id": 64, "bloco": "P2", "materia": "Lei Orgânica e Regimento Interno do TCDF", "topico": "Mapa Mestre do TCDF", "semana": "S4"}, {"id": 65, "bloco": "P2", "materia": "Lei Orgânica e Regimento Interno do TCDF", "topico": "Natureza, competência e jurisdição", "semana": "S4"}, {"id": 66, "bloco": "P2", "materia": "Lei Orgânica e Regimento Interno do TCDF", "topico": "Composição do TCDF", "semana": "S4"}, {"id": 67, "bloco": "P2", "materia": "Lei Orgânica e Regimento Interno do TCDF", "topico": "Plenário e Câmaras", "semana": "S4"}, {"id": 68, "bloco": "P2", "materia": "Lei Orgânica e Regimento Interno do TCDF", "topico": "Presidente e Vice-Presidente", "semana": "S4"}, {"id": 69, "bloco": "P2", "materia": "Lei Orgânica e Regimento Interno do TCDF", "topico": "Conselheiros, Auditores e Ministério Público", "semana": "S4"}, {"id": 70, "bloco": "P2", "materia": "Lei Orgânica e Regimento Interno do TCDF", "topico": "Serviços auxiliares", "semana": "S4"}, {"id": 71, "bloco": "P2", "materia": "Lei Orgânica e Regimento Interno do TCDF", "topico": "Regimento Interno — Título I", "semana": "S4"}, {"id": 72, "bloco": "P2", "materia": "Lei Orgânica e Regimento Interno do TCDF", "topico": "Regimento Interno — Título II", "semana": "S4"}, {"id": 73, "bloco": "P2", "materia": "Lei Orgânica e Regimento Interno do TCDF", "topico": "Regimento Interno — Título III", "semana": "S4"}, {"id": 74, "bloco": "P2", "materia": "Lei Orgânica e Regimento Interno do TCDF", "topico": "Lei Orgânica × Regimento: visão integrada", "semana": "S4"}, {"id": 75, "bloco": "P2", "materia": "Direito Constitucional", "topico": "Mapa Mestre de Constitucional", "semana": "S4"}, {"id": 76, "bloco": "P2", "materia": "Direito Constitucional", "topico": "Princípios fundamentais", "semana": "S4"}, {"id": 77, "bloco": "P2", "materia": "Direito Constitucional", "topico": "Aplicabilidade das normas constitucionais: plena, contida, limitada e programáticas", "semana": "S4"}, {"id": 78, "bloco": "P2", "materia": "Direito Constitucional", "topico": "Emenda, reforma e revisão constitucional", "semana": "S4"}, {"id": 79, "bloco": "P2", "materia": "Direito Constitucional", "topico": "Direitos e deveres individuais e coletivos", "semana": "S4"}, {"id": 80, "bloco": "P2", "materia": "Direito Constitucional", "topico": "Direitos sociais", "semana": "S4"}, {"id": 81, "bloco": "P2", "materia": "Direito Constitucional", "topico": "Nacionalidade", "semana": "S4"}, {"id": 82, "bloco": "P2", "materia": "Direito Constitucional", "topico": "Direitos políticos e partidos políticos", "semana": "S4"}, {"id": 83, "bloco": "P2", "materia": "Direito Constitucional", "topico": "Organização político-administrativa", "semana": "S4"}, {"id": 84, "bloco": "P2", "materia": "Direito Constitucional", "topico": "União, estados, Distrito Federal e municípios", "semana": "S4"}, {"id": 85, "bloco": "P2", "materia": "Direito Constitucional", "topico": "Administração Pública: disposições gerais", "semana": "S5"}, {"id": 86, "bloco": "P2", "materia": "Direito Constitucional", "topico": "Servidores públicos", "semana": "S5"}, {"id": 87, "bloco": "P2", "materia": "Direito Constitucional", "topico": "Poder Executivo", "semana": "S5"}, {"id": 88, "bloco": "P2", "materia": "Direito Constitucional", "topico": "Presidente da República: atribuições e responsabilidades", "semana": "S5"}, {"id": 89, "bloco": "P2", "materia": "Direito Constitucional", "topico": "Poder Legislativo: estrutura, funcionamento e atribuições", "semana": "S5"}, {"id": 90, "bloco": "P2", "materia": "Direito Constitucional", "topico": "Processo legislativo", "semana": "S5"}, {"id": 91, "bloco": "P2", "materia": "Direito Constitucional", "topico": "Fiscalização contábil, financeira e orçamentária + CPI", "semana": "S5"}, {"id": 92, "bloco": "P2", "materia": "Direito Constitucional", "topico": "Poder Judiciário + Ministério Público + Advocacia Pública + Defensoria", "semana": "S5"}, {"id": 93, "bloco": "P2", "materia": "Direito Previdenciário", "topico": "Mapa Mestre de Previdenciário", "semana": "S5"}, {"id": 94, "bloco": "P2", "materia": "Direito Previdenciário", "topico": "Seguridade Social: origem e evolução", "semana": "S5"}, {"id": 95, "bloco": "P2", "materia": "Direito Previdenciário", "topico": "Seguridade: conceito, organização e princípios constitucionais", "semana": "S5"}, {"id": 96, "bloco": "P2", "materia": "Direito Previdenciário", "topico": "RGPS — Lei nº 8.212/1991 I", "semana": "S5"}, {"id": 97, "bloco": "P2", "materia": "Direito Previdenciário", "topico": "RGPS — Lei nº 8.212/1991 II", "semana": "S5"}, {"id": 98, "bloco": "P2", "materia": "Direito Previdenciário", "topico": "RGPS — Lei nº 8.213/1991 I", "semana": "S5"}, {"id": 99, "bloco": "P2", "materia": "Direito Previdenciário", "topico": "RGPS — Lei nº 8.213/1991 II", "semana": "S5"}, {"id": 100, "bloco": "P2", "materia": "Direito Previdenciário", "topico": "Regime Próprio de Previdência Social", "semana": "S5"}, {"id": 101, "bloco": "P2", "materia": "Direito Previdenciário", "topico": "RPPS/DF — LC Distrital nº 769/2008", "semana": "S5"}, {"id": 102, "bloco": "P2", "materia": "Direito Previdenciário", "topico": "Previdência complementar — LC nº 108/2001 e LC nº 109/2001", "semana": "S5"}, {"id": 103, "bloco": "P2", "materia": "Direito Previdenciário", "topico": "Previdência complementar do DF — LC Distrital nº 932/2017", "semana": "S5"}, {"id": 104, "bloco": "P2", "materia": "Direito Civil", "topico": "Mapa Mestre de Direito Civil", "semana": "S6"}, {"id": 105, "bloco": "P2", "materia": "Direito Civil", "topico": "LINDB", "semana": "S6"}, {"id": 106, "bloco": "P2", "materia": "Direito Civil", "topico": "Pessoas naturais e pessoas jurídicas", "semana": "S6"}, {"id": 107, "bloco": "P2", "materia": "Direito Civil", "topico": "Domicílio", "semana": "S6"}, {"id": 108, "bloco": "P2", "materia": "Direito Civil", "topico": "Bens", "semana": "S6"}, {"id": 109, "bloco": "P2", "materia": "Direito Civil", "topico": "Fatos jurídicos", "semana": "S6"}, {"id": 110, "bloco": "P2", "materia": "Direito Civil", "topico": "Negócio jurídico", "semana": "S6"}, {"id": 111, "bloco": "P2", "materia": "Direito Civil", "topico": "Atos lícitos e ilícitos + prescrição e decadência", "semana": "S6"}, {"id": 112, "bloco": "P2", "materia": "Direito Tributário", "topico": "Mapa Mestre de Tributário", "semana": "S6"}, {"id": 113, "bloco": "P2", "materia": "Direito Tributário", "topico": "Direito Tributário: conceito e fontes", "semana": "S6"}, {"id": 114, "bloco": "P2", "materia": "Direito Tributário", "topico": "Sistema Tributário Nacional", "semana": "S6"}, {"id": 115, "bloco": "P2", "materia": "Direito Tributário", "topico": "Princípios tributários", "semana": "S6"}, {"id": 116, "bloco": "P2", "materia": "Direito Tributário", "topico": "Limitações constitucionais ao poder de tributar", "semana": "S6"}, {"id": 117, "bloco": "P2", "materia": "Direito Tributário", "topico": "Repartição das receitas tributárias", "semana": "S6"}, {"id": 118, "bloco": "P2", "materia": "Direito Tributário", "topico": "Tributo: conceito e natureza jurídica", "semana": "S6"}, {"id": 119, "bloco": "P2", "materia": "Direito Tributário", "topico": "Imposto × taxa × contribuição de melhoria", "semana": "S6"}, {"id": 120, "bloco": "P2", "materia": "Direito Tributário", "topico": "Empréstimos compulsórios × contribuições", "semana": "S6"}, {"id": 121, "bloco": "P2", "materia": "Dados, Estatística, IA e Excel", "topico": "Mapa Mestre de Dados, Estatística, IA e Excel", "semana": "S6"}, {"id": 122, "bloco": "P2", "materia": "Dados, Estatística, IA e Excel", "topico": "Tipos de dados: estruturados/não estruturados e quantitativos/qualitativos", "semana": "S6"}, {"id": 123, "bloco": "P2", "materia": "Dados, Estatística, IA e Excel", "topico": "Produtos da análise: bases, relatórios, planilhas e dashboards", "semana": "S6"}, {"id": 124, "bloco": "P2", "materia": "Dados, Estatística, IA e Excel", "topico": "Distribuição de frequências", "semana": "S6"}, {"id": 125, "bloco": "P2", "materia": "Dados, Estatística, IA e Excel", "topico": "Média, mediana e moda", "semana": "S6"}, {"id": 126, "bloco": "P2", "materia": "Dados, Estatística, IA e Excel", "topico": "Variância e desvio-padrão", "semana": "S6"}, {"id": 127, "bloco": "P2", "materia": "Dados, Estatística, IA e Excel", "topico": "Anomalias e outliers", "semana": "S7"}, {"id": 128, "bloco": "P2", "materia": "Dados, Estatística, IA e Excel", "topico": "Séries históricas", "semana": "S7"}, {"id": 129, "bloco": "P2", "materia": "Dados, Estatística, IA e Excel", "topico": "Gráficos e boas práticas de visualização", "semana": "S7"}, {"id": 130, "bloco": "P2", "materia": "Dados, Estatística, IA e Excel", "topico": "Storytelling e narrativa com dados", "semana": "S7"}, {"id": 131, "bloco": "P2", "materia": "Dados, Estatística, IA e Excel", "topico": "Inteligência artificial generativa", "semana": "S7"}, {"id": 132, "bloco": "P2", "materia": "Dados, Estatística, IA e Excel", "topico": "Engenharia de prompt: contexto, persona, exemplos, saída e encadeamento", "semana": "S7"}, {"id": 133, "bloco": "P2", "materia": "Dados, Estatística, IA e Excel", "topico": "Vieses cognitivos e ética no uso de dados/IA", "semana": "S7"}, {"id": 134, "bloco": "P2", "materia": "Dados, Estatística, IA e Excel", "topico": "Excel: Power Query", "semana": "S7"}, {"id": 135, "bloco": "P2", "materia": "Dados, Estatística, IA e Excel", "topico": "Excel: fórmulas lógicas, financeiras e de busca", "semana": "S7"}, {"id": 136, "bloco": "P2", "materia": "Dados, Estatística, IA e Excel", "topico": "Excel: tabelas dinâmicas e grandes bases relacionais", "semana": "S7"}, {"id": 137, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Mapa Mestre de Direito Administrativo", "semana": "S7"}, {"id": 138, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Estado × Governo × Administração Pública", "semana": "S7"}, {"id": 139, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Direito Administrativo: conceito, objeto e fontes", "semana": "S7"}, {"id": 140, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Conceito e requisitos", "semana": "S7"}, {"id": 141, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Atributos", "semana": "S7"}, {"id": 142, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Classificação e espécies", "semana": "S7"}, {"id": 143, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Cassação × anulação × revogação × convalidação", "semana": "S7"}, {"id": 144, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Decadência administrativa", "semana": "S7"}, {"id": 145, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Conceito, espécies e disposições constitucionais", "semana": "S7"}, {"id": 146, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Cargo × emprego × função", "semana": "S7"}, {"id": 147, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Provimento × vacância", "semana": "S7"}, {"id": 148, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Efetividade × estabilidade × vitaliciedade", "semana": "S7"}, {"id": 149, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Remuneração, direitos, deveres e responsabilidades", "semana": "S7"}, {"id": 150, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Sindicância e PAD", "semana": "S8"}, {"id": 151, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Poder hierárquico × disciplinar", "semana": "S8"}, {"id": 152, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Poder regulamentar × poder de polícia", "semana": "S8"}, {"id": 153, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Uso × abuso de poder", "semana": "S8"}, {"id": 154, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Regime jurídico-administrativo e princípios", "semana": "S8"}, {"id": 155, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Evolução e responsabilidade por ação estatal", "semana": "S8"}, {"id": 156, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Omissão e requisitos", "semana": "S8"}, {"id": 157, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Excludentes, atenuantes, reparação e direito de regresso", "semana": "S8"}, {"id": 158, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Conceito, elementos e classificação", "semana": "S8"}, {"id": 159, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Princípios, formas de prestação e meios de execução", "semana": "S8"}, {"id": 160, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Autarquias × fundações", "semana": "S8"}, {"id": 161, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Empresas públicas × sociedades de economia mista", "semana": "S8"}, {"id": 162, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Paraestatais e terceiro setor", "semana": "S8"}, {"id": 163, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Controle administrativo", "semana": "S8"}, {"id": 164, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Controle judicial × legislativo", "semana": "S8"}, {"id": 165, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Improbidade — Lei nº 8.429/1992", "semana": "S8"}, {"id": 166, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Processo Administrativo — Lei nº 9.784/1999", "semana": "S8"}, {"id": 167, "bloco": "P3", "materia": "Direito Administrativo", "topico": "Lei de Acesso à Informação", "semana": "S8"}, {"id": 168, "bloco": "P3", "materia": "Direito Administrativo", "topico": "LGPD", "semana": "S8"}, {"id": 169, "bloco": "P3", "materia": "Administração Financeira e Orçamentária", "topico": "Mapa Mestre de AFO", "semana": "S9"}, {"id": 170, "bloco": "P3", "materia": "Administração Financeira e Orçamentária", "topico": "Orçamento público: conceito e técnicas", "semana": "S9"}, {"id": 171, "bloco": "P3", "materia": "Administração Financeira e Orçamentária", "topico": "Princípios orçamentários", "semana": "S9"}, {"id": 172, "bloco": "P3", "materia": "Administração Financeira e Orçamentária", "topico": "Ciclo e processo orçamentário", "semana": "S9"}, {"id": 173, "bloco": "P3", "materia": "Administração Financeira e Orçamentária", "topico": "Sistema de planejamento e orçamento", "semana": "S9"}, {"id": 174, "bloco": "P3", "materia": "Administração Financeira e Orçamentária", "topico": "PPA", "semana": "S9"}, {"id": 175, "bloco": "P3", "materia": "Administração Financeira e Orçamentária", "topico": "LDO", "semana": "S9"}, {"id": 176, "bloco": "P3", "materia": "Administração Financeira e Orçamentária", "topico": "LOA", "semana": "S9"}, {"id": 177, "bloco": "P3", "materia": "Administração Financeira e Orçamentária", "topico": "Classificações orçamentárias", "semana": "S9"}, {"id": 178, "bloco": "P3", "materia": "Administração Financeira e Orçamentária", "topico": "Estrutura programática", "semana": "S9"}, {"id": 179, "bloco": "P3", "materia": "Administração Financeira e Orçamentária", "topico": "Créditos ordinários e adicionais", "semana": "S9"}, {"id": 180, "bloco": "P3", "materia": "Administração Financeira e Orçamentária", "topico": "Programação e execução orçamentária e financeira", "semana": "S9"}, {"id": 181, "bloco": "P3", "materia": "Administração Financeira e Orçamentária", "topico": "Descentralização orçamentária e financeira", "semana": "S9"}, {"id": 182, "bloco": "P3", "materia": "Administração Financeira e Orçamentária", "topico": "Acompanhamento, sistemas e alterações orçamentárias", "semana": "S9"}, {"id": 183, "bloco": "P3", "materia": "Administração Financeira e Orçamentária", "topico": "Receita pública: conceito e classificações", "semana": "S9"}, {"id": 184, "bloco": "P3", "materia": "Administração Financeira e Orçamentária", "topico": "Estágios, fontes e dívida ativa", "semana": "S9"}, {"id": 185, "bloco": "P3", "materia": "Administração Financeira e Orçamentária", "topico": "Despesa pública: conceito e classificações", "semana": "S9"}, {"id": 186, "bloco": "P3", "materia": "Administração Financeira e Orçamentária", "topico": "Estágios da despesa", "semana": "S9"}, {"id": 187, "bloco": "P3", "materia": "Administração Financeira e Orçamentária", "topico": "Restos a pagar × despesas de exercícios anteriores", "semana": "S9"}, {"id": 188, "bloco": "P3", "materia": "Administração Financeira e Orçamentária", "topico": "Dívida flutuante × fundada + suprimento de fundos", "semana": "S9"}, {"id": 189, "bloco": "P3", "materia": "Administração Financeira e Orçamentária", "topico": "Lei de Responsabilidade Fiscal", "semana": "S9"}, {"id": 190, "bloco": "P3", "materia": "Administração Financeira e Orçamentária", "topico": "Lei nº 4.320/1964", "semana": "S9"}, {"id": 191, "bloco": "P3", "materia": "Administração Financeira e Orçamentária", "topico": "Transferências voluntárias", "semana": "S9"}, {"id": 192, "bloco": "P3", "materia": "Administração Financeira e Orçamentária", "topico": "Decreto Distrital nº 32.598/2010", "semana": "S9"}, {"id": 193, "bloco": "P3", "materia": "Administração Geral e Pública", "topico": "Mapa Mestre de Administração", "semana": "S10"}, {"id": 194, "bloco": "P3", "materia": "Administração Geral e Pública", "topico": "Perspectiva clássica: científica e burocrática", "semana": "S10"}, {"id": 195, "bloco": "P3", "materia": "Administração Geral e Pública", "topico": "Relações humanas, recursos humanos e ciências comportamentais", "semana": "S10"}, {"id": 196, "bloco": "P3", "materia": "Administração Geral e Pública", "topico": "Pensamento sistêmico × contingência", "semana": "S10"}, {"id": 197, "bloco": "P3", "materia": "Administração Geral e Pública", "topico": "Evolução da Administração do setor público brasileiro", "semana": "S10"}, {"id": 198, "bloco": "P3", "materia": "Administração Geral e Pública", "topico": "Patrimonialista × burocrática × gerencial", "semana": "S10"}, {"id": 199, "bloco": "P3", "materia": "Administração Geral e Pública", "topico": "Princípios da governança pública", "semana": "S10"}, {"id": 200, "bloco": "P3", "materia": "Administração Geral e Pública", "topico": "Liderança × estratégia × controle", "semana": "S10"}, {"id": 201, "bloco": "P3", "materia": "Administração Geral e Pública", "topico": "Planejamento × organização × direção × controle", "semana": "S10"}, {"id": 202, "bloco": "P3", "materia": "Administração Geral e Pública", "topico": "SWOT × GUT × 5W2H", "semana": "S10"}, {"id": 203, "bloco": "P3", "materia": "Administração Geral e Pública", "topico": "PDCA × mapas estratégicos × benchmarking × fatores críticos de sucesso", "semana": "S10"}, {"id": 204, "bloco": "P3", "materia": "Administração Geral e Pública", "topico": "Modelagem de processos", "semana": "S10"}, {"id": 205, "bloco": "P3", "materia": "Administração Geral e Pública", "topico": "BPMN", "semana": "S10"}, {"id": 206, "bloco": "P3", "materia": "Administração Geral e Pública", "topico": "EPC × IDF0 × cadeia de valor", "semana": "S10"}, {"id": 207, "bloco": "P3", "materia": "Administração Geral e Pública", "topico": "CHA × matriz de competências × APPO", "semana": "S10"}, {"id": 208, "bloco": "P3", "materia": "Administração Geral e Pública", "topico": "Liderança × motivação", "semana": "S10"}, {"id": 209, "bloco": "P3", "materia": "Administração Geral e Pública", "topico": "PMBOK × Prince × Scrum × métodos ágeis", "semana": "S10"}, {"id": 210, "bloco": "P3", "materia": "Administração Geral e Pública", "topico": "Cronogramas, escopo, sequenciamento, esforço, duração, pessoas e Kanban", "semana": "S10"}, {"id": 211, "bloco": "P3", "materia": "LC Distrital 840/2011", "topico": "Mapa Mestre LC 840", "semana": "S10"}, {"id": 212, "bloco": "P3", "materia": "LC Distrital 840/2011", "topico": "Disposições preliminares, cargos e funções de confiança", "semana": "S10"}, {"id": 213, "bloco": "P3", "materia": "LC Distrital 840/2011", "topico": "Concurso público, nomeação e requisitos de investidura", "semana": "S10"}, {"id": 214, "bloco": "P3", "materia": "LC Distrital 840/2011", "topico": "Posse, exercício e estágio probatório", "semana": "S10"}, {"id": 215, "bloco": "P3", "materia": "LC Distrital 840/2011", "topico": "Estabilidade e formas de provimento derivado", "semana": "S10"}, {"id": 216, "bloco": "P3", "materia": "LC Distrital 840/2011", "topico": "Remoção, redistribuição e substituição", "semana": "S10"}, {"id": 217, "bloco": "P3", "materia": "LC Distrital 840/2011", "topico": "Vacância do cargo público", "semana": "S11"}, {"id": 218, "bloco": "P3", "materia": "LC Distrital 840/2011", "topico": "Carreiras, promoção, regime e jornada de trabalho", "semana": "S11"}, {"id": 219, "bloco": "P3", "materia": "LC Distrital 840/2011", "topico": "Sistema remuneratório: subsídio, remuneração, teto e descontos", "semana": "S11"}, {"id": 220, "bloco": "P3", "materia": "LC Distrital 840/2011", "topico": "Vantagens: indenizações, gratificações e adicionais", "semana": "S11"}, {"id": 221, "bloco": "P3", "materia": "LC Distrital 840/2011", "topico": "Férias", "semana": "S11"}, {"id": 222, "bloco": "P3", "materia": "LC Distrital 840/2011", "topico": "Licenças", "semana": "S11"}, {"id": 223, "bloco": "P3", "materia": "LC Distrital 840/2011", "topico": "Abono de ponto e afastamentos", "semana": "S11"}, {"id": 224, "bloco": "P3", "materia": "LC Distrital 840/2011", "topico": "Tempo de serviço e direito de petição", "semana": "S11"}, {"id": 225, "bloco": "P3", "materia": "LC Distrital 840/2011", "topico": "Deveres e responsabilidades do servidor", "semana": "S11"}, {"id": 226, "bloco": "P3", "materia": "LC Distrital 840/2011", "topico": "Infrações disciplinares", "semana": "S11"}, {"id": 227, "bloco": "P3", "materia": "LC Distrital 840/2011", "topico": "Sanções disciplinares, prescrição e extinção da punibilidade", "semana": "S11"}, {"id": 228, "bloco": "P3", "materia": "LC Distrital 840/2011", "topico": "Sindicância, processo disciplinar e revisão", "semana": "S11"}, {"id": 229, "bloco": "P3", "materia": "LC Distrital 840/2011", "topico": "Seguridade social, saúde e disposições finais e transitórias", "semana": "S11"}, {"id": 230, "bloco": "P3", "materia": "LC Distrital 840/2011", "topico": "Revisão integrada da LC 840", "semana": "S11"}, {"id": 231, "bloco": "P3", "materia": "Gestão de Contratos", "topico": "Mapa Mestre de Gestão de Contratos", "semana": "S11"}, {"id": 232, "bloco": "P3", "materia": "Gestão de Contratos", "topico": "Lei nº 14.133/2021 — visão integrada", "semana": "S11"}, {"id": 233, "bloco": "P3", "materia": "Gestão de Contratos", "topico": "Decreto Distrital nº 44.330/2023", "semana": "S11"}, {"id": 234, "bloco": "P3", "materia": "Gestão de Contratos", "topico": "IN nº 5/2017", "semana": "S11"}, {"id": 235, "bloco": "P3", "materia": "Gestão de Contratos", "topico": "Elaboração de contratos", "semana": "S11"}, {"id": 236, "bloco": "P3", "materia": "Gestão de Contratos", "topico": "Cláusulas contratuais", "semana": "S11"}, {"id": 237, "bloco": "P3", "materia": "Gestão de Contratos", "topico": "Indicadores de nível de serviço", "semana": "S11"}, {"id": 238, "bloco": "P3", "materia": "Gestão de Contratos", "topico": "Papel do fiscal", "semana": "S11"}, {"id": 239, "bloco": "P3", "materia": "Gestão de Contratos", "topico": "Papel do preposto", "semana": "S11"}, {"id": 240, "bloco": "P3", "materia": "Gestão de Contratos", "topico": "Acompanhamento da execução", "semana": "S11"}, {"id": 241, "bloco": "P3", "materia": "Gestão de Contratos", "topico": "Registro de irregularidades", "semana": "S12"}, {"id": 242, "bloco": "P3", "materia": "Gestão de Contratos", "topico": "Notificação de irregularidades", "semana": "S12"}, {"id": 243, "bloco": "P3", "materia": "Gestão de Contratos", "topico": "Penalidades", "semana": "S12"}, {"id": 244, "bloco": "P3", "materia": "Gestão de Contratos", "topico": "Sanções administrativas", "semana": "S12"}, {"id": 245, "bloco": "P3", "materia": "Gestão de Contratos", "topico": "Equação econômico-financeira", "semana": "S12"}, {"id": 246, "bloco": "P3", "materia": "Gestão de Contratos", "topico": "Reajuste", "semana": "S12"}, {"id": 247, "bloco": "P3", "materia": "Gestão de Contratos", "topico": "Repactuação", "semana": "S12"}, {"id": 248, "bloco": "P3", "materia": "Gestão de Contratos", "topico": "Quadro comparativo integrado: contratação e fiscalização", "semana": "S12"}, {"id": 249, "bloco": "P4", "materia": "Discursiva", "topico": "Como funciona a prova discursiva do TCDF", "semana": "S12"}, {"id": 250, "bloco": "P4", "materia": "Discursiva", "topico": "Critérios de correção e nota mínima", "semana": "S12"}, {"id": 251, "bloco": "P4", "materia": "Discursiva", "topico": "Como estruturar a questão de até 20 linhas", "semana": "S12"}, {"id": 252, "bloco": "P4", "materia": "Discursiva", "topico": "Como interpretar o comando da discursiva", "semana": "S12"}, {"id": 253, "bloco": "P4", "materia": "Discursiva", "topico": "Como planejar a resposta antes de escrever", "semana": "S12"}, {"id": 254, "bloco": "P4", "materia": "Discursiva", "topico": "Introdução, desenvolvimento e conclusão sem desperdiçar linhas", "semana": "S12"}, {"id": 255, "bloco": "P4", "materia": "Discursiva", "topico": "Coerência, coesão e linguagem formal", "semana": "S12"}, {"id": 256, "bloco": "P4", "materia": "Discursiva", "topico": "Erros gramaticais e impacto na pontuação", "semana": "S12"}, {"id": 257, "bloco": "P4", "materia": "Discursiva", "topico": "Gestão do limite de linhas", "semana": "S12"}, {"id": 258, "bloco": "P4", "materia": "Discursiva", "topico": "Peça técnica “Informação”: estrutura", "semana": "S12"}, {"id": 259, "bloco": "P4", "materia": "Discursiva", "topico": "Como transformar conhecimento de P3 em peça técnica", "semana": "S12"}, {"id": 260, "bloco": "P4", "materia": "Discursiva", "topico": "Checklist visual de revisão antes de entregar", "semana": "S12"}];
const ESTUDOS_MAPAS_KEY = "minha-vida.estudos.mapas.v1";
function loadMapasStatus(){try{return JSON.parse(localStorage.getItem(ESTUDOS_MAPAS_KEY))||{};}catch{return {};}}
function saveMapasStatus(x){localStorage.setItem(ESTUDOS_MAPAS_KEY,JSON.stringify(x));}
function mapaStatus(id){return loadMapasStatus()[String(id)]||{};}
function addDaysISO(ts,days){const d=new Date(ts);d.setHours(12,0,0,0);d.setDate(d.getDate()+days);return d.toISOString().slice(0,10);}
function todayLocalISO(){const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10);}
function formatReviewLabel(iso){if(!iso)return '';const today=todayLocalISO();if(iso<today)return 'vencida';if(iso===today)return 'hoje';return new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'2-digit'}).format(new Date(iso+'T12:00:00'));}
function nextReviewFor(a){if(!a?.primeiraAt)return null;const reviews=[['D+1',1,'r1'],['D+3',3,'r3'],['D+7',7,'r7'],['D+15',15,'r15']];for(const [label,days,key] of reviews){const due=a[key+'Due']||addDaysISO(a.primeiraAt,days);if(!a[key] && due<=todayLocalISO())return {label,days,key,due};}return null;}
function nextStepFor(a){if(!a?.primeira)return {label:'Fazer 1ª volta',field:'primeira',hint:'Leitura ativa + palavras-chave'};if(!a.questoes)return {label:'Fazer questões',field:'questoes',hint:'C/E do tópico + registrar erros'};if(!a.domino)return {label:'Conquistar Domino',field:'domino',hint:'Acertar o teste e explicar o rodapé-macete sem olhar'};return {label:'Domino conquistado',field:null,hint:'Manter revisões 1-3-7-15'};}
function toggleMapa(id,field){const d=loadMapasStatus(),k=String(id),a={...(d[k]||{})};if(field==='primeira' && !a.primeira){a.primeira=true;a.primeiraAt=Date.now();a.r1Due=addDaysISO(a.primeiraAt,1);a.r3Due=addDaysISO(a.primeiraAt,3);a.r7Due=addDaysISO(a.primeiraAt,7);a.r15Due=addDaysISO(a.primeiraAt,15);}else if(field==='primeira'){a.primeira=false;a.primeiraAt=null;['r1','r3','r7','r15'].forEach(k2=>{delete a[k2];delete a[k2+'Due'];});}else if(field==='questoes'){a.questoes=!a.questoes;}else if(field==='domino'){if(!a.primeira||!a.questoes){alert('Complete primeiro a 1ª volta e as questões.');return;}a.domino=!a.domino;}saveMapasStatus({...d,[k]:a});renderEstudos();}
function toggleMapaReview(id,key){const d=loadMapasStatus(),k=String(id),a={...(d[k]||{})};if(!a.primeiraAt)return;a[key]=!a[key];saveMapasStatus({...d,[k]:a});renderEstudos();}
function estudoSugestao(minutos){const d=loadMapasStatus(),reviewDue=TCDF_MAPAS.filter(x=>nextReviewFor(d[String(x.id)])),due=TCDF_MAPAS.filter(x=>!d[x.id]?.domino),revis=TCDF_MAPAS.filter(x=>d[x.id]?.primeira&&!d[x.id]?.domino&&!d[x.id]?.questoes);if(reviewDue.length)return{title:'Revisão primeiro',text:'Há revisão prevista. Faça a mais antiga antes de abrir conteúdo novo.',maps:reviewDue.slice(0,Math.max(1,minutos<=30?1:2)),review:true};if(minutos<=15)return{title:'Janela curta',text:'Faça 5–10 questões C/E ou uma retomada ativa.',maps:revis.slice(0,1)};if(minutos<=30)return{title:'Janela de 30 min',text:'Estude 1 mapa e faça uma retomada ativa.',maps:due.slice(0,1)};if(minutos<=60)return{title:'Janela de 1h',text:'1–2 mapas + questões do tópico.',maps:due.slice(0,2)};if(minutos<=90)return{title:'Janela de 1h30',text:'Mapa + questões + registro de erros.',maps:due.slice(0,2)};return{title:'Janela longa',text:'2–4 mapas, questões e revisões previstas.',maps:due.slice(0,4)};}
function renderEstudos(){const d=loadEstudos(),st=loadMapasStatus(),totalQuestions=d.questions.reduce((n,q)=>n+Number(q.count||0),0),first=TCDF_MAPAS.filter(x=>st[x.id]?.primeira).length,q=TCDF_MAPAS.filter(x=>st[x.id]?.questoes).length,dom=TCDF_MAPAS.filter(x=>st[x.id]?.domino).length,sug=estudoSugestao(30);
app.innerHTML=`<section class="hero"><h2>📚 Estudos</h2><p>Menos decisões. Mais ritual. O TCDF é acompanhado mapa a mapa, sem transformar seu dia em uma agenda pesada.</p></section>
<div class="study-summary"><div class="summary-card"><strong>${first}</strong><span>1ª volta</span></div><div class="summary-card"><strong>${q}</strong><span>com questões</span></div><div class="summary-card"><strong>${dom}<small> / 260</small></strong><span>Domino</span></div></div>
<div class="card" style="margin:14px 0"><div class="eyebrow">SUGESTÃO INTELIGENTE · 30 MIN</div><h3>${sug.title}</h3><p>${sug.text}</p>${sug.maps.map(x=>`<button class="secondary" style="margin-top:6px;width:100%;text-align:left" onclick="document.getElementById('mapa-${x.id}').scrollIntoView({behavior:'smooth',block:'center'})">Mapa ${String(x.id).padStart(3,'0')} · ${escapeHtml(x.materia)}<br><small>${escapeHtml(x.topico)}</small></button>`).join('')}</div>
<div class="study-section"><div class="section-heading"><div><div class="eyebrow">TCDF 2026</div><h3>260 mapas</h3></div></div><div class="card"><p><strong>Regra:</strong> 1ª volta → Questões → Domino. Domino só entra quando você acerta o teste C/E e consegue explicar o rodapé-macete sem olhar.</p><div style="display:flex;gap:8px;flex-wrap:wrap"><span class="pill">P1 59</span><span class="pill">P2 73</span><span class="pill">P3 112</span><span class="pill">P4 12</span></div></div>
<div class="list">${TCDF_MAPAS.map(x=>{const a=st[x.id]||{},step=nextStepFor(a),nr=nextReviewFor(a),reviewDone=nr?Boolean(a[nr.key]):false;const base='border:1.5px solid #e5dbe9;border-radius:22px;padding:16px;margin-bottom:10px;background:#fffdfb;';const b=(done,label,field,active)=>`<button class="study-check ${done?'done':''}" style="min-width:48px;height:44px;border-radius:16px;font-weight:800;${done?'background:#dceee4;color:#496e5a;border:1px solid #bcd8c7;':'background:#f1e7f6;color:#745487;border:1px solid #dfcdea;'}${active?'box-shadow:0 0 0 2px rgba(117,84,135,.14);':''}" title="${label}" onclick="toggleMapa(${x.id},'${field}')">${done?'✓':label}</button>`;return `<article class="card study-card" id="mapa-${x.id}" style="${base}"><div style="min-width:0;flex:1"><strong style="display:block;line-height:1.25">Mapa ${String(x.id).padStart(3,'0')} · ${escapeHtml(x.topico)}</strong><span class="study-meta">${escapeHtml(x.materia)} · ${x.bloco} · ${x.semana}</span><div style="margin-top:10px;font-size:13px;color:#745487;font-weight:700">Próximo: ${escapeHtml(step.label)}</div><div style="font-size:12px;color:#8b818d;margin-top:3px">${escapeHtml(step.hint)}</div>${nr?`<div style="display:flex;align-items:center;gap:8px;margin-top:9px"><span style="font-size:12px;font-weight:800;color:#9a5f72">🔄 ${nr.label} · ${formatReviewLabel(nr.due)}</span><button class="secondary" style="padding:6px 10px;font-size:12px" onclick="toggleMapaReview(${x.id},'${nr.key}')">${reviewDone?'✓ Feita':'Revisar'}</button></div>`:''}</div><div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-left:10px">${b(a.primeira,'1ª','primeira',step.field==='primeira')}${b(a.questoes,'Q','questoes',step.field==='questoes')}${b(a.domino,'D','domino',step.field==='domino')}</div></article>`}).join('')}</div></div>
<div class="study-section"><div class="section-heading"><div><div class="eyebrow">REGISTRO</div><h3>Estudos realizados</h3></div><button class="secondary" id="addSession">＋ Estudo</button></div><div class="list">${d.sessions.length?d.sessions.slice().reverse().slice(0,8).map(sessionHtml).join(''):`<div class="empty compact"><strong>Nenhum estudo registrado.</strong><span>Use o registro quando ajudar a enxergar seu progresso.</span></div>`}</div></div>
<div class="study-section"><div class="section-heading"><div><div class="eyebrow">QUESTÕES</div><h3>Volume registrado</h3></div><button class="secondary" id="addQuestions">＋ Registrar</button></div><div class="list">${d.questions.length?d.questions.slice().reverse().slice(0,8).map(questionHtml).join(''):`<div class="empty compact"><strong>Nenhuma questão registrada.</strong><span>O volume dos mapas é acompanhado acima.</span></div>`}</div></div>`;
document.querySelector('#addSession').onclick=()=>openStudyModal('session');document.querySelector('#addQuestions').onclick=()=>openStudyModal('questions');document.querySelectorAll('[data-study-edit]').forEach(x=>x.onclick=()=>openStudyModal(x.dataset.studyEdit,x.dataset.id));}

function subjectHtml(x) {
  return `<article class="card study-card"><div><strong>${escapeHtml(x.name)}</strong><span class="study-meta">${escapeHtml(x.content || "Conteúdos ainda não detalhados.")}</span></div><button class="more" data-study-edit="subject" data-id="${x.id}">•••</button></article>`;
}
function sessionHtml(x) {
  return `<article class="card study-card"><div><strong>${escapeHtml(x.subject || "Estudo")}</strong><span class="study-meta">${formatDate(x.date)} · ${escapeHtml(x.minutes || "—")} min${x.note ? " · "+escapeHtml(x.note) : ""}</span></div><button class="more" data-study-edit="session" data-id="${x.id}">•••</button></article>`;
}
function reviewHtml(x) {
  return `<article class="card study-card"><button class="study-check ${x.done?"done":""}" data-review-toggle="${x.id}">${x.done?"✓":"○"}</button><div><strong class="${x.done?"done-text":""}">${escapeHtml(x.subject || "Revisão")}</strong><span class="study-meta">${x.date ? formatDate(x.date) : "Sem data"}${x.note ? " · "+escapeHtml(x.note) : ""}</span></div><button class="more" data-study-edit="review" data-id="${x.id}">•••</button></article>`;
}
function questionHtml(x) {
  return `<article class="card study-card"><div><strong>${Number(x.count||0)} questões</strong><span class="study-meta">${escapeHtml(x.subject || "CEBRASPE")}${x.accuracy !== "" && x.accuracy != null ? " · "+escapeHtml(String(x.accuracy))+"% de acerto" : ""}${x.note ? " · "+escapeHtml(x.note) : ""}</span></div><button class="more" data-study-edit="questions" data-id="${x.id}">•••</button></article>`;
}

function openStudyModal(type, id=null) {
  const data = loadEstudos();
  const collection = type === "subject" ? "subjects" : type === "session" ? "sessions" : type === "review" ? "reviews" : "questions";
  const existing = id ? data[collection].find(x=>x.id===id) : null;
  const title = {subject:"Matéria",session:"Estudo realizado",review:"Revisão",questions:"Questões"}[type];
  const bodyByType = {
    subject: `<label>Matéria<input id="sName" required maxlength="80" value="${escapeHtml(existing?.name||"")}" placeholder="Ex.: Língua Portuguesa"></label>
              <label>Conteúdos <span class="muted">(opcional)</span><textarea id="sContent" rows="3" maxlength="400">${escapeHtml(existing?.content||"")}</textarea></label>`,
    session: `<label>Matéria<input id="sName" maxlength="80" value="${escapeHtml(existing?.subject||"")}" placeholder="Ex.: Direito Constitucional"></label>
              <div class="form-grid"><label>Data<input id="sDate" type="date" value="${existing?.date||todayISO()}"></label><label>Minutos<input id="sMinutes" type="number" min="1" max="1440" value="${existing?.minutes||30}"></label></div>
              <label>Observação <span class="muted">(opcional)</span><input id="sNote" maxlength="160" value="${escapeHtml(existing?.note||"")}"></label>`,
    review: `<label>Matéria<input id="sName" maxlength="80" value="${escapeHtml(existing?.subject||"")}" placeholder="Ex.: Português"></label>
             <label>Data <span class="muted">(opcional)</span><input id="sDate" type="date" value="${existing?.date||""}"></label>
             <label>Observação <span class="muted">(opcional)</span><input id="sNote" maxlength="160" value="${escapeHtml(existing?.note||"")}"></label>`,
    questions: `<label>Matéria<input id="sName" maxlength="80" value="${escapeHtml(existing?.subject||"CEBRASPE")}"></label>
                <div class="form-grid"><label>Nº de questões<input id="sCount" type="number" min="1" value="${existing?.count||10}"></label><label>% de acerto<input id="sAccuracy" type="number" min="0" max="100" value="${existing?.accuracy ?? ""}"></label></div>
                <label>Observação <span class="muted">(opcional)</span><input id="sNote" maxlength="160" value="${escapeHtml(existing?.note||"")}"></label>`
  }[type];

  const dlg=document.createElement("dialog");
  dlg.innerHTML=`<form method="dialog" class="modal-card" id="studyForm">
    <div class="modal-head"><div><div class="eyebrow">📚 ESTUDOS</div><h2>${existing?"Editar":"Registrar"} ${title.toLowerCase()}</h2></div><button class="icon-btn" value="cancel">×</button></div>
    ${bodyByType}
    <div class="modal-actions">${existing?'<button type="button" class="secondary" id="deleteStudy">Excluir</button>':""}<div class="grow"></div><button type="button" class="secondary" id="cancelStudy">Cancelar</button><button class="primary" value="default">Salvar</button></div>
  </form>`;
  document.body.appendChild(dlg); dlg.showModal();
  dlg.querySelector("#cancelStudy").onclick=()=>{dlg.close();dlg.remove();};
  if(existing) dlg.querySelector("#deleteStudy").onclick=()=>{if(confirm("Excluir este registro?")){data[collection]=data[collection].filter(x=>x.id!==existing.id);saveEstudos(data);dlg.close();dlg.remove();renderEstudos();}};
  dlg.querySelector("#studyForm").addEventListener("submit",e=>{
    e.preventDefault();
    let obj={id:existing?.id||uid(),updatedAt:Date.now()};
    const v=id=>dlg.querySelector(id)?.value ?? "";
    if(type==="subject") obj={...obj,name:v("#sName").trim(),content:v("#sContent").trim()};
    if(type==="session") obj={...obj,subject:v("#sName").trim(),date:v("#sDate"),minutes:Number(v("#sMinutes"))||0,note:v("#sNote").trim()};
    if(type==="review") obj={...obj,subject:v("#sName").trim(),date:v("#sDate"),note:v("#sNote").trim(),done:existing?.done||false};
    if(type==="questions") obj={...obj,subject:v("#sName").trim(),count:Number(v("#sCount"))||0,accuracy:v("#sAccuracy"),note:v("#sNote").trim()};
    const idx=existing ? data[collection].findIndex(x=>x.id===existing.id) : -1;
    if(idx>=0) data[collection][idx]=obj; else data[collection].push(obj);
    saveEstudos(data); dlg.close(); dlg.remove(); renderEstudos();
  });
}


const FIN_KEY="minha-vida.financeiro.v3";
const FIN_PRIVACY_KEY="minha-vida.financeiro.privacy.v1";
const FIN_BASE={
 income:19172.96,
 fixed:[
  {id:"aluguel",name:"Aluguel da casa",value:9503.50,category:"Casa",payer:"Usuária"},
  {id:"caesb",name:"CAESB + Neoenergia",value:203.79,category:"Casa",payer:"Usuária"},
  {id:"combustivel",name:"Combustível",value:650,category:"Transporte",payer:"Usuária",kind:"teto"},
  {id:"pets",name:"Pets",value:450,category:"Animais",payer:"Usuária",kind:"teto"}
 ],
 cards:[
  {id:"itau4590",name:"Itaú 4590",payer:"Mãe",inBudget:false,lastStatement:5566.54,dueDay:26,note:"Acompanhar, mas não descontar do seu orçamento."},
  {id:"itau5298",name:"Itaú 5298",payer:"Usuária",inBudget:true,lastStatement:1702.25,dueDay:null,note:"Pago por você."},
  {id:"bb",name:"BB",payer:"Usuária",inBudget:true,lastStatement:2833.37,dueDay:12,futureBalance:8561.85,note:"Pago por você."},
  {id:"cef",name:"CEF",payer:"Usuária",inBudget:true,lastStatement:862.57,dueDay:11,note:"Pago por você."}
 ],
 loan:{id:"loan1",name:"Empréstimo",monthlyPayment:2329.59,dueDay:null,totalInstallments:null,paidInstallments:null,balance:null,inBudget:true,note:"Editar quando quiser completar os dados do contrato."},
 goals:[
  {month:"Setembro",min:2000,max:3000,saved:0},
  {month:"Outubro",min:2000,max:3000,saved:0},
  {month:"Novembro",min:2000,max:3000,saved:0},
  {month:"Dezembro",min:2000,max:3000,saved:0}
 ],
 transactions:[],
 plans:[],
 rules:[]
};
const FIN_CATEGORIES=["Casa","Alimentação","Transporte","Pets","Henrique","Assinaturas","Saúde","Autocuidado","Lazer","Educação","Trabalho","Dívidas","Compras pessoais","Outros"];
const FIN_PAYMENT=["Pix","Cartão de crédito","Débito","Boleto","Débito automático","Dinheiro","Transferência"];
const FIN_CARD_ACCOUNTS=["Itaú 4590","Itaú 5298","BB","CEF"];
const FIN_BANK_ACCOUNTS=["Conta Itaú","Conta BB","Conta CEF","Outra conta"];
const FIN_BEHAVIOR=["Essencial","Planejado","Variável","Impulso"];
const FIN_PRIORITIES=["Alta","Normal","Baixa"];
const FIN_TIMES=["5 min","10 min","15 min","20 min","30 min","45 min","1h","1h30","2h"];
function finPrivacy(){return localStorage.getItem(FIN_PRIVACY_KEY)!=="hidden";}
function setFinPrivacy(hidden){localStorage.setItem(FIN_PRIVACY_KEY,hidden?"hidden":"visible");}
function finCloneBase(){return JSON.parse(JSON.stringify(FIN_BASE));}
function finNormalize(d){
 const base=finCloneBase();
 return {...base,...d,
  fixed:Array.isArray(d?.fixed)?d.fixed.filter(x=>!String(x.id||"").includes("itau5298")&&!String(x.name||"").includes("Itaú 5298")&&!String(x.id||"").match(/^bb$/)):base.fixed,
  cards:Array.isArray(d?.cards)&&d.cards.length?d.cards:base.cards,
  loan:d?.loan||base.loan,
  goals:Array.isArray(d?.goals)&&d.goals.length?d.goals:base.goals,
  transactions:Array.isArray(d?.transactions)?d.transactions:[],
  plans:Array.isArray(d?.plans)?d.plans:[],rules:Array.isArray(d?.rules)?d.rules:[]
 };
}
function loadFin(){
 try{const raw=JSON.parse(localStorage.getItem(FIN_KEY));if(raw)return finNormalize(raw)}catch{}
 for(const oldKey of ["minha-vida.financeiro.v2","minha-vida.financeiro.v1"]){
  try{const old=JSON.parse(localStorage.getItem(oldKey));if(old){
   const migrated=finNormalize({...old,fixed:old.fixed||old.expenses||FIN_BASE.fixed,transactions:old.transactions||[]});
   saveFin(migrated);return migrated;
  }}catch{}
 }
 return finCloneBase();
}
function saveFin(d){localStorage.setItem(FIN_KEY,JSON.stringify(finNormalize(d)));}
function money(n){return Number(n||0).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2});}
function finMoney(n){return finPrivacy()?`R$ ${money(n)}`:"R$ ••••••";}
function finCardByName(d,name){return (d.cards||[]).find(c=>c.name===name)}
function finTxInBudget(d,t){if(t.inBudget===false)return false;const c=finCardByName(d,t.account);return c?c.inBudget!==false:true;}
function finFixedTotal(d){return d.fixed.reduce((s,x)=>s+Number(x.value||0),0)+Number(d.loan?.inBudget!==false?d.loan?.monthlyPayment||0:0);}
function finMonthTotal(d,month){return d.transactions.filter(x=>(x.date||"").slice(0,7)===month&&finTxInBudget(d,x)).reduce((s,x)=>s+Number(x.value||0),0);}
function finCategoryTotals(d,month){const out={};d.transactions.filter(x=>(x.date||"").slice(0,7)===month&&finTxInBudget(d,x)).forEach(x=>{const k=x.category||"Outros";out[k]=(out[k]||0)+Number(x.value||0)});return out;}
function finCurrentMonth(){return todayISO().slice(0,7);}
function finMonthLabel(iso){const [y,m]=iso.split("-");return new Intl.DateTimeFormat("pt-BR",{month:"long",year:"numeric"}).format(new Date(Number(y),Number(m)-1,1));}
function finFixedHtml(x){return `<article class="card finance-row"><div><strong>${escapeHtml(x.name)}</strong><span>${escapeHtml(x.category)}${x.kind==="teto"?" · teto":""}</span></div><b>${finMoney(x.value)}</b></article>`;}
function finTransactionHtml(d,x){const meta=[x.date?formatDate(x.date):"",x.category||"Outros",x.payment||"",x.account||"",x.behavior||""].filter(Boolean).join(" · ");const outside=!finTxInBudget(d,x);return `<article class="card finance-row ${outside?"outside-budget":""}"><div><strong>${escapeHtml(x.name)}</strong><span>${escapeHtml(meta)}${outside?" · fora do orçamento":""}</span></div><b>${finMoney(x.value)}</b><button class="mini-delete" data-fin-delete="${x.id}" aria-label="Excluir">×</button></article>`;}
function finCardHtml(c){return `<article class="card fin-card-account"><div class="fin-card-top"><div><span class="eyebrow">${c.inBudget===false?"ACOMPANHAMENTO":"PAGO POR VOCÊ"}</span><h3>${escapeHtml(c.name)}</h3></div><span class="pill ${c.inBudget===false?"":"today"}">${escapeHtml(c.payer)}</span></div><div class="fin-card-value"><span>Última fatura informada</span><strong>${finMoney(c.lastStatement||0)}</strong></div><div class="fin-card-meta">${c.dueDay?`Vence dia ${c.dueDay}`:"Vencimento a informar"}${c.futureBalance?` · Futuras: ${finMoney(c.futureBalance)}`:""}</div><small>${escapeHtml(c.note||"")}</small></article>`;}
function finPlanHtml(x){return `<article class="card fin-plan"><div><strong>${escapeHtml(x.what)}</strong><span>${[x.when?formatDate(x.when):"",x.where||"",x.time||"",x.priority||""].filter(Boolean).join(" · ")}</span>${x.how?`<small>${escapeHtml(x.how)}</small>`:""}</div><button class="goal-toggle ${x.done?"done":""}" data-fin-plan="${x.id}">${x.done?"✓":"○"}</button></article>`;}
function renderFinanceiro(){
 const d=loadFin(),month=finCurrentMonth(),fixed=finFixedTotal(d),variable=finMonthTotal(d,month),planned=fixed+variable,remaining=d.income-planned,cats=finCategoryTotals(d,month),visible=finPrivacy();
 const catHtml=Object.entries(cats).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([k,v])=>`<div class="finance-cat"><span>${escapeHtml(k)}</span><strong>${finMoney(v)}</strong></div>`).join("")||`<div class="empty compact"><strong>Nenhum gasto classificado neste mês.</strong><span>Quando você registrar ou importar movimentações, elas aparecem aqui.</span></div>`;
 const goalTotal=d.goals.reduce((s,g)=>s+Number(g.saved||0),0),goalMin=d.goals.reduce((s,g)=>s+Number(g.min||0),0),goalMax=d.goals.reduce((s,g)=>s+Number(g.max||0),0);
 app.innerHTML=`<section class="hero"><h2>💰 Financeiro</h2><p>Ver o dinheiro por origem, forma de pagamento e propósito — sem contar a mesma despesa duas vezes.</p></section>
 <section class="finance-summary card"><div class="finance-main"><span class="eyebrow">RENDA MENSAL</span><strong>${finMoney(d.income)}</strong><div class="finance-actions"><button class="text-btn" id="toggleFinPrivacy">${visible?"🙈 Ocultar valores":"👁️ Mostrar valores"}</button><button class="text-btn" id="editIncome">editar</button></div></div><div class="finance-metrics"><div><span>Base + empréstimo</span><b>${finMoney(fixed)}</b></div><div><span>Gastos · ${escapeHtml(finMonthLabel(month))}</span><b>${finMoney(variable)}</b></div><div><span>Disponível conhecido</span><b>${finMoney(remaining)}</b></div></div></section>
 <div class="fin-quick"><button class="primary" id="addTransaction">＋ Registrar gasto</button><button class="secondary" id="addPlan">🗓️ Planejar</button></div>
 <div class="section-title">CARTÕES & FATURAS</div><section class="fin-card-grid">${d.cards.map(finCardHtml).join("")}</section><p class="fin-helper">A compra é a despesa. O pagamento da fatura é só a quitação dela — não entra novamente como gasto.</p>
 <div class="section-title">EMPRÉSTIMO</div><section class="card loan-card"><div class="panel-head"><div><span class="eyebrow">COMPROMISSO MENSAL</span><h3>${escapeHtml(d.loan.name||"Empréstimo")}</h3></div><button class="secondary compact-btn" id="editLoan">Editar</button></div><strong class="loan-value">${finMoney(d.loan.monthlyPayment||0)}</strong><span>${d.loan.dueDay?`Vencimento: dia ${d.loan.dueDay}`:"Vencimento ainda não informado"}</span></section>
 <div class="section-title">ORÇAMENTO BASE</div><div class="list">${d.fixed.map(finFixedHtml).join("")}</div><button class="add-full secondary" id="addFixed">＋ Adicionar item ao orçamento</button>
 <div class="section-title">GASTOS DO MÊS</div><section class="card"><div class="panel-head"><div><span class="eyebrow">${escapeHtml(finMonthLabel(month))}</span><h3>O que saiu de verdade</h3></div><button class="primary compact-btn" id="addTransaction2">＋ Registrar</button></div><div class="list inner-list">${d.transactions.slice().reverse().slice(0,30).map(x=>finTransactionHtml(d,x)).join("")||`<div class="empty compact"><strong>Nenhum gasto registrado.</strong><span>Você pode lançar manualmente agora e, depois, importar extratos/faturas.</span></div>`}</div></section>
 <div class="section-title">POR CATEGORIA</div><section class="card finance-cats">${catHtml}</section>
 <div class="section-title">META · FUNDO CARRO</div><section class="card goal-card"><div class="panel-head"><div><span class="eyebrow">SETEMBRO → DEZEMBRO</span><h3>Construção da meta</h3></div><span class="pill today">${finMoney(goalTotal)}</span></div><p class="note">Meta total planejada: ${finMoney(goalMin)}–${finMoney(goalMax)}.</p><div class="goal-list">${d.goals.map((g,i)=>`<div class="goal-row"><span>${escapeHtml(g.month)}</span><strong>${finMoney(g.saved||0)} / ${money(g.min)}–${money(g.max)}</strong><button class="goal-toggle ${Number(g.saved||0)>=Number(g.min||0)?"done":""}" data-goal="${i}">${Number(g.saved||0)>=Number(g.min||0)?"✓":"＋"}</button></div>`).join("")}</div></section>
 <div class="section-title">PRÓXIMAS AÇÕES FINANCEIRAS</div><section class="card"><div class="panel-head"><div><span class="eyebrow">O QUÊ · COMO · ONDE · QUANDO</span><h3>Planejamento</h3></div><button class="secondary compact-btn" id="addPlan2">＋ Nova</button></div><div class="list inner-list">${d.plans.map(finPlanHtml).join("")||`<div class="empty compact"><strong>Nenhuma ação pendente.</strong><span>Ex.: revisar fatura, pagar boleto, conferir extrato ou fazer aporte.</span></div>`}</div></section>
 <div class="section-title">IMPORTAÇÃO</div><section class="card import-card"><div><span class="eyebrow">PRÓXIMA ETAPA</span><h3>Ler extratos e faturas</h3><p class="note">O módulo já separa forma de pagamento e origem. A próxima camada será importar CSV/Excel e sugerir categorias para sua confirmação; PDF/foto vem depois.</p></div><button class="secondary compact-btn" id="importInfo">Como vai funcionar</button></section>`;
 ensureFinanceStyles();
 document.getElementById("toggleFinPrivacy").onclick=()=>{setFinPrivacy(finPrivacy());renderFinanceiro()};
 document.getElementById("editIncome").onclick=()=>openFinModal("income");
 document.getElementById("addFixed").onclick=()=>openFinModal("fixed");
 document.getElementById("addTransaction").onclick=document.getElementById("addTransaction2").onclick=()=>openFinModal("transaction");
 document.getElementById("addPlan").onclick=document.getElementById("addPlan2").onclick=()=>openFinPlanModal();
 document.getElementById("editLoan").onclick=()=>openFinLoanModal();
 document.getElementById("importInfo").onclick=()=>openFinImportInfo();
 document.querySelectorAll("[data-fin-delete]").forEach(b=>b.onclick=()=>{const x=loadFin();x.transactions=x.transactions.filter(t=>t.id!==b.dataset.finDelete);saveFin(x);renderFinanceiro()});
 document.querySelectorAll("[data-goal]").forEach(b=>b.onclick=()=>{const x=loadFin(),i=+b.dataset.goal;const current=Number(x.goals[i].saved||0);const next=current>=Number(x.goals[i].min||0)?0:Number(x.goals[i].min||0);x.goals[i].saved=next;saveFin(x);renderFinanceiro()});
 document.querySelectorAll("[data-fin-plan]").forEach(b=>b.onclick=()=>{const x=loadFin(),p=x.plans.find(q=>q.id===b.dataset.finPlan);if(p){p.done=!p.done;saveFin(x);renderFinanceiro()}});
}
function ensureFinanceStyles(){
 if(document.getElementById("finance-v5-styles"))return;
 const old=document.getElementById("finance-v3-styles");if(old)old.remove();
 const s=document.createElement("style");s.id="finance-v5-styles";s.textContent=`
 .finance-summary{background:linear-gradient(135deg,#edf5f2,#f2edf8);border:1px solid rgba(92,72,104,.10)}.finance-main{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.finance-main strong{font-size:32px;display:block;width:100%}.finance-actions{display:flex;gap:16px}.text-btn{border:0;background:transparent;color:#77558a;font-weight:700;padding:0}.finance-metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:16px}.finance-metrics>div{background:rgba(255,255,255,.62);border-radius:16px;padding:10px}.finance-metrics span{display:block;font-size:12px;color:#817783}.finance-metrics b{display:block;margin-top:4px;font-size:14px}.fin-quick{display:grid;grid-template-columns:1.2fr 1fr;gap:10px;margin:14px 0}.fin-card-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.fin-card-account{padding:16px!important}.fin-card-top{display:flex;justify-content:space-between;gap:8px;align-items:flex-start}.fin-card-top h3{margin:3px 0 0}.fin-card-value{margin:16px 0 6px}.fin-card-value span,.fin-card-meta,.fin-card-account small{display:block;color:#817783;font-size:12px}.fin-card-value strong{display:block;font-size:20px;margin-top:2px}.fin-card-meta{margin-bottom:7px}.fin-helper{font-size:12px;color:#817783;margin:8px 4px 0}.loan-card .loan-value{display:block;font-size:26px;margin:6px 0}.loan-card>span{color:#817783;font-size:13px}.finance-dialog{appearance:none!important;-webkit-appearance:none!important;outline:0!important;border:0!important;max-width:620px!important;max-height:82vh!important;margin:auto!important;padding:0!important;border-radius:28px!important;background:#fffdfb!important;overflow:hidden!important;box-shadow:0 24px 70px rgba(55,42,60,.20)!important}.finance-dialog::backdrop{background:rgba(45,37,48,.34)!important;backdrop-filter:blur(3px)}.finance-dialog .modal-card{width:100%!important;max-width:none!important;max-height:82vh!important;box-sizing:border-box!important;overflow-y:auto!important;overflow-x:hidden!important;padding:24px!important}.finance-dialog .modal-head{position:sticky!important;top:-24px!important;z-index:5!important;background:#fffdfb!important;padding:0 0 18px!important;margin-bottom:18px!important}.finance-dialog .modal-head .icon-btn{width:48px!important;height:48px!important;min-width:48px!important;border-radius:50%!important;cursor:pointer!important;pointer-events:auto!important;z-index:20!important}.finance-dialog label{display:block!important;margin-bottom:16px!important}.finance-dialog input,.finance-dialog select,.finance-dialog textarea{width:100%!important;box-sizing:border-box!important}.finance-dialog .form-grid{display:grid!important;grid-template-columns:1fr 1fr!important;gap:14px!important}.compact-btn{padding:9px 12px!important}.inner-list{margin-top:12px}.finance-row{position:relative;display:flex;align-items:center;justify-content:space-between;gap:10px}.finance-row>div{min-width:0}.finance-row b{white-space:nowrap}.mini-delete{border:0;background:transparent;color:#9a8e98;font-size:22px;padding:4px}.outside-budget{opacity:.72}.finance-cats{display:grid;gap:8px}.finance-cat{display:flex;justify-content:space-between;padding:10px 12px;border-radius:14px;background:#faf6f2}.finance-cat span{color:#655c67}.goal-toggle{min-width:38px}.goal-toggle.done{background:#e4f1eb}.fin-plan{display:flex;align-items:center;justify-content:space-between}.fin-plan span,.fin-plan small{display:block;color:#817783;font-size:12px;margin-top:4px}.import-card{display:flex;align-items:center;justify-content:space-between;gap:16px}.import-card h3{margin:3px 0 6px}
 @media(max-width:560px){.finance-dialog{width:92vw!important;max-width:92vw!important;max-height:84vh!important;border-radius:24px!important}.finance-dialog .modal-card{max-height:84vh!important;padding:20px!important}.finance-dialog .form-grid{grid-template-columns:1fr!important}.finance-dialog .modal-head{top:-20px!important}.fin-card-grid{grid-template-columns:1fr}.import-card{align-items:flex-start;flex-direction:column}}@media(max-width:420px){.finance-metrics{grid-template-columns:1fr}.panel-head{gap:8px}.fin-quick{grid-template-columns:1fr}}
 `;document.head.appendChild(s);
}
function finDialogShell(title,body,saveLabel="Salvar"){
 const dlg=document.createElement("dialog");dlg.className="finance-dialog";dlg.innerHTML=`<form method="dialog" class="modal-card" id="finForm"><div class="modal-head"><div><div class="eyebrow">💰 FINANCEIRO</div><h2>${title}</h2></div><button type="button" class="icon-btn" id="closeFinX" aria-label="Fechar">×</button></div>${body}<div class="modal-actions"><div class="grow"></div><button type="button" class="secondary" id="cancelFin">Cancelar</button><button class="primary" id="saveFin" value="default">${saveLabel}</button></div></form>`;document.body.appendChild(dlg);dlg.showModal();
 const close=()=>{try{if(dlg.open)dlg.close()}finally{if(dlg.isConnected)dlg.remove()}};dlg.querySelector("#closeFinX").onclick=e=>{e.preventDefault();e.stopPropagation();close()};dlg.querySelector("#cancelFin").onclick=e=>{e.preventDefault();e.stopPropagation();close()};dlg.addEventListener("cancel",e=>{e.preventDefault();close()});dlg.addEventListener("click",e=>{if(e.target===dlg)close()});return {dlg,close};
}
function openFinModal(type){
 const d=loadFin(),options=(arr,sel)=>arr.map(x=>`<option ${x===sel?"selected":""}>${x}</option>`).join("");
 const title=type==="income"?"Ajustar renda mensal":type==="fixed"?"Adicionar ao orçamento":"Registrar gasto";
 const body=type==="income"?`<label>Renda mensal<input id="fValue" required type="number" min="0" step="0.01" value="${d.income}"></label>`:`<label>O quê<input id="fName" required maxlength="100" placeholder="Ex.: mercado, gasolina, farmácia…"></label><div class="form-grid"><label>Valor<input id="fValue" required type="number" min="0" step="0.01"></label><label>Quando<input id="fDate" type="date" value="${todayISO()}"></label></div><div class="form-grid"><label>Categoria<select id="fCategory">${options(FIN_CATEGORIES,"Casa")}</select></label><label>Como pagou<select id="fPayment">${options(FIN_PAYMENT,"Pix")}</select></label></div><label>De onde saiu<select id="fAccount"></select></label>${type==="transaction"?`<div class="form-grid"><label>Comportamento<select id="fBehavior">${options(FIN_BEHAVIOR,"Variável")}</select></label><label>Parcelas<input id="fInstallments" type="number" min="1" step="1" value="1"></label></div><label>Observação<input id="fNote" maxlength="180" placeholder="Opcional"></label>`:`<label>Tipo<select id="fKind"><option>fixo</option><option>teto</option></select></label>`}`;
 const {dlg,close}=finDialogShell(title,body);
 if(type!=="income"){
  const payment=dlg.querySelector("#fPayment"),account=dlg.querySelector("#fAccount");
  const updateAccounts=()=>{const arr=payment.value==="Cartão de crédito"?FIN_CARD_ACCOUNTS:payment.value==="Dinheiro"?["Dinheiro"]:FIN_BANK_ACCOUNTS;account.innerHTML=arr.map(x=>`<option>${x}</option>`).join("")};payment.addEventListener("change",updateAccounts);updateAccounts();
 }
 dlg.querySelector("#finForm").addEventListener("submit",e=>{e.preventDefault();if(type==="income"){d.income=+dlg.querySelector("#fValue").value||0}else{const obj={id:uid(),name:dlg.querySelector("#fName").value.trim(),value:+dlg.querySelector("#fValue").value||0,category:dlg.querySelector("#fCategory").value,updatedAt:Date.now()};if(type==="transaction"){obj.date=dlg.querySelector("#fDate").value;obj.payment=dlg.querySelector("#fPayment").value;obj.account=dlg.querySelector("#fAccount").value;obj.behavior=dlg.querySelector("#fBehavior").value;obj.installments=+dlg.querySelector("#fInstallments").value||1;obj.note=dlg.querySelector("#fNote").value.trim();const card=finCardByName(d,obj.account);obj.inBudget=card?card.inBudget!==false:true;d.transactions.push(obj)}else{obj.payment=dlg.querySelector("#fPayment").value;obj.account=dlg.querySelector("#fAccount").value;obj.kind=dlg.querySelector("#fKind").value;obj.payer="Usuária";d.fixed.push(obj)}}saveFin(d);close();renderFinanceiro()});
}
function openFinLoanModal(){const d=loadFin(),l=d.loan||{};const {dlg,close}=finDialogShell("Editar empréstimo",`<label>Nome<input id="lName" value="${escapeHtml(l.name||"Empréstimo")}"></label><div class="form-grid"><label>Parcela mensal<input id="lValue" type="number" min="0" step="0.01" value="${Number(l.monthlyPayment||0)}"></label><label>Vencimento · dia<input id="lDue" type="number" min="1" max="31" value="${l.dueDay||""}"></label></div><div class="form-grid"><label>Total de parcelas<input id="lTotal" type="number" min="1" value="${l.totalInstallments||""}"></label><label>Parcelas pagas<input id="lPaid" type="number" min="0" value="${l.paidInstallments||""}"></label></div><label>Saldo devedor <span class="muted">(opcional)</span><input id="lBalance" type="number" min="0" step="0.01" value="${l.balance||""}"></label><label>Observação<input id="lNote" value="${escapeHtml(l.note||"")}"></label>`);dlg.querySelector("#finForm").addEventListener("submit",e=>{e.preventDefault();d.loan={...l,name:dlg.querySelector("#lName").value.trim()||"Empréstimo",monthlyPayment:+dlg.querySelector("#lValue").value||0,dueDay:+dlg.querySelector("#lDue").value||null,totalInstallments:+dlg.querySelector("#lTotal").value||null,paidInstallments:+dlg.querySelector("#lPaid").value||null,balance:+dlg.querySelector("#lBalance").value||null,note:dlg.querySelector("#lNote").value.trim(),inBudget:true};saveFin(d);close();renderFinanceiro()});}
function openFinPlanModal(){const d=loadFin(),options=(arr,sel)=>arr.map(x=>`<option ${x===sel?"selected":""}>${x}</option>`).join("");const {dlg,close}=finDialogShell("Nova ação financeira",`<label>O quê<input id="pWhat" required placeholder="Ex.: revisar fatura BB"></label><label>Como<input id="pHow" placeholder="Ex.: conferir compras e parcelas"></label><div class="form-grid"><label>Onde<input id="pWhere" placeholder="Ex.: App BB"></label><label>Quando<input id="pWhen" type="date"></label></div><div class="form-grid"><label>Tempo<select id="pTime">${options(FIN_TIMES,"20 min")}</select></label><label>Prioridade<select id="pPriority">${options(FIN_PRIORITIES,"Normal")}</select></label></div>`);dlg.querySelector("#finForm").addEventListener("submit",e=>{e.preventDefault();d.plans.push({id:uid(),what:dlg.querySelector("#pWhat").value.trim(),how:dlg.querySelector("#pHow").value.trim(),where:dlg.querySelector("#pWhere").value.trim(),when:dlg.querySelector("#pWhen").value,time:dlg.querySelector("#pTime").value,priority:dlg.querySelector("#pPriority").value,done:false,createdAt:Date.now()});saveFin(d);close();renderFinanceiro()});}
function openFinImportInfo(){const {dlg,close}=finDialogShell("Importar extrato / fatura",`<div class="card" style="box-shadow:none"><strong>Etapa 1 · CSV / Excel</strong><p class="note">Ler data, descrição e valor; sugerir categoria, forma de pagamento e origem; você confirma antes de salvar.</p></div><div class="card" style="box-shadow:none"><strong>Etapa 2 · PDF / imagem</strong><p class="note">Extrair as movimentações e aplicar as mesmas regras de confirmação.</p></div><p class="note"><b>Regra de segurança:</b> o sistema nunca deve somar novamente o pagamento da fatura como se fosse uma nova despesa.</p>`,`Entendi`);dlg.querySelector("#cancelFin").style.display="none";dlg.querySelector("#finForm").addEventListener("submit",e=>{e.preventDefault();close()});}


function ensureWorkStyles(){
 if(document.getElementById("work-v2-styles")) return;
 const s=document.createElement("style");s.id="work-v2-styles";s.textContent=`
 .work-grid{display:grid;gap:14px}.work-card{border:1px solid rgba(92,72,104,.12);text-align:left;display:grid;grid-template-columns:52px 1fr;grid-template-rows:auto auto;column-gap:12px;align-items:center;cursor:pointer;padding:18px!important}.work-card .work-icon{grid-row:1/3;font-size:32px}.work-card strong{font-size:19px}.work-card span:last-child{font-size:13px;color:#817783}.work-note{margin-top:16px;display:grid;gap:6px}.work-note span{color:#817783}.work-subnav{display:flex;align-items:center;gap:10px;margin:4px 0 18px}.work-back{border:0;background:#f1e9f5;color:#654b75;border-radius:999px;padding:9px 14px;font-weight:800}.work-subtitle{color:#817783;margin:0}.work-panels{display:grid;gap:12px}.work-panel{padding:18px!important;display:grid;gap:7px;border:1px solid rgba(92,72,104,.10)}.work-panel span{color:#817783;font-size:14px}.work-panel .panel-tag{justify-self:start;background:#f7f0e8;border-radius:999px;padding:6px 10px;font-size:12px;color:#756975;font-weight:700}.work-rule{margin-top:16px;padding:14px 16px;border-radius:18px;background:linear-gradient(135deg,#f5edf7,#eef5f2);color:#6e6470} .modal-brand-logo{width:28px;height:20px;object-fit:contain;vertical-align:middle}.hero h2{display:flex;align-items:center;gap:10px}.hero-brand-logo{width:42px;height:32px;object-fit:contain}.bec-mark{display:flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,#edf5f2,#f5edf7);color:#65795f;font-size:18px;font-weight:900;letter-spacing:-1px}.tiktok-mark{display:flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:14px;background:#111;color:#fff;font-size:28px;font-weight:900}
 .work-front-v12 .work-card{min-height:96px!important;background:#fffdfb!important;grid-template-columns:82px 1fr!important;grid-template-rows:1fr!important;column-gap:18px!important;padding:16px 18px!important;}
 .work-front-v12 .work-icon{grid-row:1!important;width:82px!important;height:76px!important;display:flex!important;align-items:center!important;justify-content:center!important;}
 .work-front-v12 .work-logo{display:block!important;width:76px!important;height:76px!important;object-fit:contain!important;}
 .work-front-v12 .crefito-logo{width:80px!important;height:68px!important;}
 .work-front-v12 .bec-logo{width:72px!important;height:72px!important;}
 .work-front-v12 .tiktok-logo{width:68px!important;height:68px!important;border-radius:16px!important;}
 .work-front-v12 .work-copy{display:grid!important;gap:3px!important;min-width:0;text-align:left!important}.work-front-v12 button.work-card{font:inherit;color:#40384a!important;border:1px solid rgba(92,72,104,.12)!important;width:100%!important;appearance:none!important;-webkit-appearance:none!important}.work-front-v12 button.work-card *{pointer-events:none!important}
 .work-front-v12 .work-copy strong{font-size:19px!important;color:#40384a!important;line-height:1.15!important;}
 .work-front-v12 .work-copy span{font-size:14px!important;color:#817783!important;line-height:1.3!important;}
 .work-front-v12 .work-card:active{transform:scale(.985)}
 .work-front-v11 .work-card{min-height:82px!important;background:#fffdfb!important}.work-front-v11 .work-icon{width:56px!important;height:56px!important;display:flex!important;align-items:center!important;justify-content:center!important}.work-front-v11 .work-logo{width:52px!important;height:52px!important;object-fit:contain!important}.work-front-v11 .logo-fallback{display:none;align-items:center;justify-content:center;width:52px;height:52px;border-radius:15px;background:linear-gradient(135deg,#eaf5f3,#f4e9ef);color:#315f62;font-weight:900;font-size:17px;letter-spacing:-.5px}.work-front-v11 .bec-wordmark{display:flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:16px;background:linear-gradient(135deg,#f2eee8,#edf5f2);color:#5c725c;font-size:22px;font-weight:900;letter-spacing:-1.5px}.work-front-v11 .tiktok-wordmark{display:flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:16px;background:#111;color:#fff;font-size:31px;font-weight:900}.work-front-v11 .tiktok-wordmark i{font-style:normal;text-shadow:2px 0 #25f4ee,-2px 0 #fe2c55}.work-front-v11 .work-card strong{font-size:19px!important}.work-front-v11 .work-card span:last-child{font-size:14px!important}.work-front-v11 .work-card{transition:transform .15s ease,box-shadow .15s ease}.work-front-v11 .work-card:active{transform:scale(.985)}

 `;document.head.appendChild(s)
}
function renderTrabalho(){
 ensureWorkStyles();ensureCrefitoStyles();
 app.innerHTML=`<section class="hero work-front-hero"><div class="eyebrow">💼 TRABALHO</div><h2>Trabalho</h2><p>Um espaço separado para organizar minhas frentes profissionais, sem misturar trabalho com o Financeiro.</p></section>
 <div class="section-title">MINHAS FRENTES</div>
 <section class="work-grid work-front-v12">
  <article class="card work-card work-card-crefito" data-work-route="trabalho-crefito" role="button" tabindex="0">
   <span class="work-icon work-logo-wrap"><img class="work-logo official-logo crefito-logo" src="crefito11-logo.png" alt="CREFITO-11"></span>
   <span class="work-copy"><strong>CREFITO-11</strong><span>Trabalho oficial · 08:00–14:00</span></span>
  </article>
  <a href="#trabalho-bec" class="card work-card work-card-bec" data-work-route="trabalho-bec" aria-label="Abrir BEC">
   <span class="work-icon work-logo-wrap"><img class="work-logo official-logo bec-logo" src="bec-logo.png" alt="BEC"></span>
   <span class="work-copy"><strong>BEC</strong><span>Empresa, projetos e operações.</span></span>
  </a>
  <a href="#trabalho-tiktok" class="card work-card work-card-tiktok" data-work-route="trabalho-tiktok" aria-label="Abrir TikTok">
   <span class="work-icon work-logo-wrap"><img class="work-logo official-logo tiktok-logo" src="tiktok-logo.png" alt="TikTok"></span>
   <span class="work-copy"><strong>TikTok</strong><span>Conteúdo, ideias e presença digital.</span></span>
  </a>
 </section>
 <section class="card work-note"><strong>Menos decisões · mais clareza</strong><span>Cada frente tem seu próprio espaço. O que for realmente importante pode depois alimentar o Meu Dia.</span></section>`;
 window.openWorkRoute=(route)=>{
   state.route=route;
   const hash="#"+route;
   if(location.hash!==hash) location.hash=hash;
   else render();
 };
 // Os cards principais usam links reais (#rota). Isso evita conflitos de toque
 // do Safari/iPhone com listeners duplicados e mantém a navegação nativa.
 window.openWorkRoute = window.openWorkRoute;
}

const CREFITO_KEY="minha-vida.trabalho.crefito.v1";
function loadCrefito(){try{return JSON.parse(localStorage.getItem(CREFITO_KEY))||[]}catch{return[]}}
function saveCrefito(x){localStorage.setItem(CREFITO_KEY,JSON.stringify(x))}
function ensureCrefitoStyles(){
 if(document.getElementById("crefito-v4-styles")) return;
 const s=document.createElement("style");s.id="crefito-v4-styles";s.textContent=`
 .work-card{text-decoration:none!important;color:#40384a!important;cursor:pointer!important;display:flex!important;align-items:center!important}.work-card strong{color:#40384a!important}.work-card span{color:#817783!important}.work-card .work-icon{display:flex;align-items:center;justify-content:center;width:52px;height:52px}.work-logo{width:48px;height:48px;object-fit:contain;display:block}.work-logo.bec{width:52px;height:52px;border-radius:14px;object-fit:contain}.tiktok-word{font-size:18px;font-weight:900;letter-spacing:-1px;color:#111;line-height:1}.tiktok-word i{font-style:normal;text-shadow:2px 0 #25f4ee,-2px 0 #fe2c55}
 .work-summary{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin:14px 0 20px}.work-stat{padding:15px;border-radius:18px;background:#f7f0e8;border:1px solid rgba(92,72,104,.09)}.work-stat b{display:block;font-size:22px;color:#4b4350}.work-stat span{font-size:12px;color:#817783}.work-section{margin-top:18px}.work-section-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}.work-section-head h3{margin:0}.work-add{border:0;border-radius:999px;background:#eee7f7;color:#654b75;padding:8px 13px;font-weight:800}.work-list{display:grid;gap:9px}.work-item{padding:14px 16px!important;display:grid;grid-template-columns:1fr auto;gap:5px}.work-item small{color:#817783}.work-badge{align-self:start;border-radius:999px;padding:5px 9px;background:#f7f0e8;color:#756975;font-size:11px;font-weight:800}.work-empty{padding:18px;border:1px dashed rgba(92,72,104,.18);border-radius:18px;color:#817783;text-align:center}.work-rule{margin-top:16px;padding:14px 16px;border-radius:18px;background:linear-gradient(135deg,#f5edf7,#eef5f2);color:#6e6470} .modal-brand-logo{width:28px;height:20px;object-fit:contain;vertical-align:middle}.hero h2{display:flex;align-items:center;gap:10px}.hero-brand-logo{width:42px;height:32px;object-fit:contain}.bec-mark{display:flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,#edf5f2,#f5edf7);color:#65795f;font-size:18px;font-weight:900;letter-spacing:-1px}.tiktok-mark{display:flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:14px;background:#111;color:#fff;font-size:28px;font-weight:900}
 .crefito-dialog{outline:none!important;border:0!important;max-width:620px!important;max-height:84vh!important;margin:auto!important;padding:0!important;border:0!important;border-radius:28px!important;background:#fffdfb!important;overflow:hidden!important;box-shadow:0 24px 70px rgba(55,42,60,.20)!important}.crefito-dialog::backdrop{background:rgba(45,37,48,.34)!important;backdrop-filter:blur(3px)}.crefito-dialog .modal-card{width:100%!important;max-width:none!important;max-height:84vh!important;box-sizing:border-box!important;overflow-y:auto!important;overflow-x:hidden!important;padding:24px!important}.crefito-dialog .modal-head{position:sticky!important;top:-24px!important;z-index:5!important;background:#fffdfb!important;padding:0 0 18px!important;margin-bottom:18px!important}.crefito-dialog .modal-head .icon-btn{width:48px!important;height:48px!important;min-width:48px!important;border-radius:50%!important;cursor:pointer!important;pointer-events:auto!important;z-index:20!important}.crefito-dialog label{display:block!important;margin-bottom:16px!important}.crefito-dialog input,.crefito-dialog select,.crefito-dialog textarea{width:100%!important;box-sizing:border-box!important}.crefito-dialog .form-grid{display:grid!important;grid-template-columns:1fr 1fr!important;gap:14px!important}.crefito-dialog .choice-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0 0 16px}.crefito-dialog .choice-title{font-weight:800;color:#6f6672;margin:2px 0 8px}.crefito-dialog .choice{display:flex;align-items:center;gap:10px;border:1px solid #e6dce4;border-radius:14px;padding:11px 12px;background:#fff;font-weight:700;color:#6f6672;min-height:46px;box-sizing:border-box}.crefito-dialog .choice input{width:20px!important;height:20px!important;margin:0;accent-color:#80629a}.crefito-dialog .modal-actions{display:flex;gap:10px;justify-content:flex-end;padding-top:4px}.crefito-dialog .modal-actions .secondary{border:0;background:#f2ecef;color:#655b67;border-radius:999px;padding:10px 15px;font-weight:800}.crefito-dialog .modal-actions .primary{border:0;background:#d989aa;color:white;border-radius:999px;padding:10px 17px;font-weight:800}.crefito-dialog .modal-actions .grow{flex:1}@media(max-width:560px){.crefito-dialog{width:92vw!important;max-width:92vw!important;max-height:84vh!important;border-radius:24px!important}.crefito-dialog .modal-card{max-height:84vh!important;padding:20px!important}.crefito-dialog .form-grid,.crefito-dialog .choice-grid{grid-template-columns:1fr 1fr!important}.crefito-dialog .modal-head{top:-20px!important}}
 `;document.head.appendChild(s)
}
function openCrefitoItem(kind){
 const labels={demanda:"Nova demanda",projeto:"Novo projeto",reuniao:"Nova reunião",pauta:"Nova pauta / acompanhamento"};
 const dlg=document.createElement("dialog");dlg.className="crefito-dialog";
 const today=todayISO();
 dlg.innerHTML=`<form method="dialog" class="modal-card" id="crefitoForm"><div class="modal-head"><div><div class="eyebrow"><img class="modal-brand-logo" src="https://www.crefito11.gov.br/arquivos/img_logo/logo.png" alt="CREFITO-11"> CREFITO-11</div><h2>${labels[kind]}</h2></div><button type="button" class="icon-btn" id="closeCrefitoX" aria-label="Fechar">×</button></div>
 <label>Título<input id="cTitle" required placeholder="O que precisa ser acompanhado?"></label>
 <div class="form-grid"><label>Data<input id="cDate" type="date" value="${today}"></label>${kind==="reuniao"?`<label>Horário<input id="cTime" type="time"></label>`:`<label>Status<select id="cStatus"><option>Aberto</option><option>Em andamento</option><option>Concluído</option><option>Aguardando</option></select></label>`}</div>
 ${kind==="reuniao"?`<label>Status<select id="cStatus"><option>Agendada</option><option>Realizada</option><option>Cancelada</option></select></label>`:""}
 <label>Prioridade<select id="cPriority"><option>Normal</option><option>Alta</option><option>Baixa</option></select></label>
 <div class="choice-title">👥 Relaciona-se com</div><div class="choice-grid">${["Profissional","Empresa","Presidência","Jurídico","Tesouraria","Atendimento","TI / Informática","Outro setor"].map(x=>`<label class="choice"><input type="checkbox" name="rel" value="${x}"><span>${x}</span></label>`).join("")}</div>
 <label>Pessoa / contato<input id="cContact" maxlength="120" placeholder="Nome da pessoa, responsável ou contato (opcional)"></label>
 <div class="choice-title">🗂️ Sistemas / planilhas envolvidos</div><div class="choice-grid">${["Implanta","Siscaf","SEI","Excel / planilha","Google Sheets","Outro sistema"].map(x=>`<label class="choice"><input type="checkbox" name="sys" value="${x}"><span>${x}</span></label>`).join("")}</div>
 <label>Observação<textarea id="cNote" placeholder="Anotações, próximos passos ou contexto..."></textarea></label>
 <div class="modal-actions"><div class="grow"></div><button type="button" class="secondary" id="cancelCrefito">Cancelar</button><button class="primary" id="saveCrefito" value="default">Salvar</button></div></form>`;
 document.body.appendChild(dlg);dlg.showModal();
 const close=()=>{try{if(dlg.open)dlg.close()}finally{if(dlg.isConnected)dlg.remove()}};
 dlg.querySelector("#closeCrefitoX").onclick=e=>{e.preventDefault();e.stopPropagation();close()};dlg.querySelector("#cancelCrefito").onclick=e=>{e.preventDefault();e.stopPropagation();close()};dlg.addEventListener("cancel",e=>{e.preventDefault();close()});dlg.addEventListener("click",e=>{if(e.target===dlg)close()});
 dlg.querySelector("#crefitoForm").onsubmit=e=>{e.preventDefault();const arr=loadCrefito();const checked=n=>Array.from(dlg.querySelectorAll(`input[name="${n}"]:checked`)).map(x=>x.value);arr.push({id:uid(),kind,title:dlg.querySelector("#cTitle").value.trim(),date:dlg.querySelector("#cDate").value,status:dlg.querySelector("#cStatus")?.value||"Agendada",time:dlg.querySelector("#cTime")?.value||"",priority:dlg.querySelector("#cPriority").value,relations:checked("rel"),contact:dlg.querySelector("#cContact").value.trim(),systems:checked("sys"),note:dlg.querySelector("#cNote").value.trim(),createdAt:Date.now()});saveCrefito(arr);close();renderCrefito()};
}
function renderCrefito(){
 ensureWorkStyles();ensureCrefitoStyles();
 const all=loadCrefito(), today=new Date().toISOString().slice(0,10), open=all.filter(x=>x.status!=="Concluído"), upcoming=all.filter(x=>x.kind==="reuniao"&&x.date>=today).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
 const labels={demanda:"Demanda",projeto:"Projeto",reuniao:"Reunião",pauta:"Pauta"};
 const item=x=>`<article class="card work-item"><div><strong>${escapeHtml(x.title)}</strong><small>${x.date?new Date(x.date+"T12:00:00").toLocaleDateString("pt-BR"):"Sem data"}${x.time?` · ${x.time}`:""} · ${labels[x.kind]} · ${x.priority}</small>${(x.relations||[]).length?`<small>Relaciona-se: ${escapeHtml(x.relations.join(", "))}</small>`:""}${(x.systems||[]).length?`<small>Sistemas: ${escapeHtml(x.systems.join(", "))}</small>`:""}${x.contact?`<small>Contato: ${escapeHtml(x.contact)}</small>`:""}${x.note?`<small>${escapeHtml(x.note)}</small>`:""}</div><span class="work-badge">${x.status||"Agendada"}</span></article>`;
 app.innerHTML=`<section class="hero"><div class="eyebrow">💼 TRABALHO</div><h2><img class="hero-brand-logo" src="https://www.crefito11.gov.br/arquivos/img_logo/logo.png" alt="CREFITO-11"> CREFITO-11</h2><p>Um espaço próprio para acompanhar o trabalho oficial, sem misturar com a vida pessoal.</p></section>
 <div class="work-subnav"><button class="work-back" id="backWork">← Trabalho</button><p class="work-subtitle">ROTINA OFICIAL · 08:00–14:00</p></div>
 <section class="work-summary"><div class="work-stat"><b>${open.length}</b><span>itens em aberto</span></div><div class="work-stat"><b>${upcoming.length}</b><span>reuniões futuras</span></div></section>
 <section class="work-section"><div class="work-section-head"><h3>📋 Demandas</h3><button class="work-add" data-add="demanda">+ adicionar</button></div><div class="work-list">${all.filter(x=>x.kind==="demanda").slice(-5).reverse().map(item).join("")||`<div class="work-empty">Nenhuma demanda registrada ainda.</div>`}</div></section>
 <section class="work-section"><div class="work-section-head"><h3>📁 Projetos</h3><button class="work-add" data-add="projeto">+ adicionar</button></div><div class="work-list">${all.filter(x=>x.kind==="projeto").slice(-5).reverse().map(item).join("")||`<div class="work-empty">Nenhum projeto registrado ainda.</div>`}</div></section>
 <section class="work-section"><div class="work-section-head"><h3>🗓️ Reuniões</h3><button class="work-add" data-add="reuniao">+ adicionar</button></div><div class="work-list">${upcoming.slice(0,5).map(item).join("")||`<div class="work-empty">Nenhuma reunião futura registrada.</div>`}</div></section>
 <section class="work-section"><div class="work-section-head"><h3>📝 Pautas & acompanhamentos</h3><button class="work-add" data-add="pauta">+ adicionar</button></div><div class="work-list">${all.filter(x=>x.kind==="pauta").slice(-5).reverse().map(item).join("")||`<div class="work-empty">Nenhuma pauta registrada ainda.</div>`}</div></section>
 <div class="work-rule">O que for realmente importante pode depois alimentar o Meu Dia. Registrar aqui não cria obrigação automaticamente.</div>`;
 document.getElementById("backWork").onclick=()=>{location.hash="trabalho"};document.querySelectorAll("[data-add]").forEach(b=>b.onclick=()=>openCrefitoItem(b.dataset.add));
}
const WORK_BEC_KEY="minha-vida.trabalho.bec.v1";
const WORK_TIKTOK_KEY="minha-vida.trabalho.tiktok.v1";
const WORK_DURATIONS=["15 min","30 min","45 min","1h","1h30","2h"];
const WORK_PRIORITIES=["Normal","Alta","Baixa"];
const WORK_STATUSES=["A fazer","Em andamento","Concluído"];
function loadWorkTasks(key){try{return JSON.parse(localStorage.getItem(key)||'[]')}catch{return[]}}
function saveWorkTasks(key,items){localStorage.setItem(key,JSON.stringify(items))}
function workTaskMinutes(v){return ({"15 min":15,"30 min":30,"45 min":45,"1h":60,"1h30":90,"2h":120}[v]||30)}
function workTaskDateLabel(v){return v?new Date(v+'T12:00:00').toLocaleDateString('pt-BR'):"Sem data"}
function ensureWorkTaskStyles(){
 if(document.getElementById('work-dialog-global-styles'))return;
 const gs=document.createElement('style');gs.id='work-dialog-global-styles';gs.textContent='dialog{outline:none!important}dialog:focus{outline:none!important}dialog::-webkit-backdrop{background:rgba(45,37,48,.34)}';document.head.appendChild(gs);
 if(document.getElementById('work-task-styles'))return;
 const s=document.createElement('style');s.id='work-task-styles';s.textContent=`
 .work-action-grid{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 12px}.work-click-panel{cursor:pointer;transition:transform .15s ease,box-shadow .15s ease}.work-click-panel:active{transform:scale(.99)}.work-panel-main{display:grid;gap:5px;text-align:left;border:0;background:transparent;padding:0;color:#40384a;width:100%;font:inherit;cursor:pointer}.work-panel-main h3{margin:0;font-size:20px}.work-panel-main span{color:#756d78;font-size:14px;line-height:1.35}.work-click-panel .work-action-grid{margin-top:8px}.work-click-panel .work-action-chip{cursor:pointer}.work-action-chip{border:1px solid #e1d7e5;background:#fffdfb;color:#66586d;border-radius:999px;padding:9px 12px;font-weight:700;font-size:13px}.work-action-chip:active{transform:scale(.985)}
 .work-task-item{align-items:center}.work-task-actions{display:flex;align-items:center;gap:6px}.mini-work-edit{border:0;background:#f2ecef;color:#6d6270;border-radius:50%;width:32px;height:32px;font-size:16px}.work-sub-logo{width:42px!important;height:42px!important;object-fit:contain!important}.work-action-plan{display:grid;gap:5px;margin-bottom:16px}.work-action-plan strong{font-size:16px}.work-action-plan span{color:#756d78}.work-plan-panels{gap:14px}.work-plan-card{cursor:pointer}.work-plan-card .work-panel-main{pointer-events:auto}
 `;document.head.appendChild(s);
}
function openWorkTaskModal(cfg, preset=null){
 const dlg=document.createElement('dialog');dlg.className='finance-dialog';
 const isEdit=!!preset;
 const options=(arr,sel)=>arr.map(x=>`<option ${x===sel?'selected':''}>${x}</option>`).join('');
 const title=isEdit?'Editar tarefa':`Nova tarefa · ${cfg.name}`;
 dlg.innerHTML=`<form method="dialog" class="modal-card" id="workTaskForm"><div class="modal-head"><div><div class="eyebrow">💼 ${escapeHtml(cfg.name.toUpperCase())}</div><h2>${title}</h2></div><button type="button" class="icon-btn" id="closeWorkTaskX" aria-label="Fechar">×</button></div>
 <label>O que precisa ser feito?<input id="wtTitle" required maxlength="140" placeholder="Ex.: acompanhar campanha" value="${escapeHtml(preset?.title||'')}"></label>
 <div class="form-grid"><label>Quando<input id="wtDate" type="date" value="${preset?.date||todayISO()}"></label><label>Quanto tempo<select id="wtDuration">${options(WORK_DURATIONS,preset?.duration||'30 min')}</select></label></div>
 <div class="form-grid"><label>Prioridade<select id="wtPriority">${options(WORK_PRIORITIES,preset?.priority||'Normal')}</select></label><label>Status<select id="wtStatus">${options(WORK_STATUSES,preset?.status||'A fazer')}</select></label></div>
 <label>Observação<textarea id="wtNote" maxlength="500" placeholder="Opcional">${escapeHtml(preset?.note||'')}</textarea></label>
 <div class="modal-actions"><div class="grow"></div><button type="button" class="secondary" id="cancelWorkTask">Cancelar</button><button class="primary" value="default">Salvar</button></div></form>`;
 document.body.appendChild(dlg);dlg.showModal();
 const close=()=>{try{if(dlg.open)dlg.close()}finally{dlg.remove()}};
 dlg.querySelector('#closeWorkTaskX').onclick=e=>{e.preventDefault();close()};dlg.querySelector('#cancelWorkTask').onclick=e=>{e.preventDefault();close()};dlg.addEventListener('cancel',e=>{e.preventDefault();close()});dlg.addEventListener('click',e=>{if(e.target===dlg)close()});
 dlg.querySelector('#workTaskForm').onsubmit=e=>{e.preventDefault();const arr=loadWorkTasks(cfg.key);const data={id:preset?.id||uid(),title:dlg.querySelector('#wtTitle').value.trim(),date:dlg.querySelector('#wtDate').value,duration:dlg.querySelector('#wtDuration').value,minutes:workTaskMinutes(dlg.querySelector('#wtDuration').value),priority:dlg.querySelector('#wtPriority').value,status:dlg.querySelector('#wtStatus').value,note:dlg.querySelector('#wtNote').value.trim(),createdAt:preset?.createdAt||Date.now(),updatedAt:Date.now(),source:cfg.name};if(!data.title)return;if(preset){const i=arr.findIndex(x=>x.id===preset.id);if(i>=0)arr[i]=data;else arr.push(data)}else arr.push(data);saveWorkTasks(cfg.key,arr);close();renderTrabalhoSub(cfg.kind)};
}
function workTaskCard(x,cfg){return `<article class="card work-item work-task-item"><div><strong>${escapeHtml(x.title)}</strong><small>${workTaskDateLabel(x.date)} · ${escapeHtml(x.duration||'30 min')} · ${escapeHtml(x.priority||'Normal')}</small>${x.note?`<small>${escapeHtml(x.note)}</small>`:''}</div><div class="work-task-actions"><span class="work-badge">${escapeHtml(x.status||'A fazer')}</span><button class="mini-work-edit" data-work-edit="${escapeHtml(x.id)}" aria-label="Editar">✎</button></div></article>`}
function renderWorkTaskArea(cfg){
 const all=loadWorkTasks(cfg.key), open=all.filter(x=>x.status!=='Concluído').sort((a,b)=>(a.date||'9999').localeCompare(b.date||'9999'));
 const actionButtons=cfg.actions.map(a=>`<button class="work-action-chip" data-work-action="${escapeHtml(a)}">${escapeHtml(a)}</button>`).join('');
 const taskHtml=open.slice(0,12).map(x=>workTaskCard(x,cfg)).join('')||`<div class="work-empty">Nenhuma tarefa em aberto ainda.</div>`;
 return `<section class="work-section"><div class="work-section-head"><h3>O que preciso fazer</h3><button class="work-add" id="addWorkTask">+ adicionar</button></div>
 <div class="work-action-grid">${actionButtons}</div><div class="work-list">${taskHtml}</div></section>`;
}
function renderTrabalhoSub(kind){
 if(kind==='crefito'){renderCrefito();return}
 ensureWorkStyles();ensureWorkTaskStyles();
 const cfgs={
  bec:{
   kind:'bec',key:WORK_BEC_KEY,name:'BEC',
   desc:'Seu espaço para a empresa, projetos e operações.',tag:'EMPRESA',
   logo:'bec-logo.png',
   groups:[
    {title:'Matrizia',desc:'Campanhas, matches e resultados.',actions:['Nova campanha','Acompanhar matches','Acompanhar campanha','Verificar resultados','Outro']},
    {title:'Instagram',desc:'Conteúdo e divulgação.',actions:['Novo post','Novo story','Novo Reels','Impulsionar','Outro']},
    {title:'Bling',desc:'Registrar uma tarefa operacional.',actions:['Nova tarefa']},
    {title:'Desenvolvimento de produtos',desc:'Registrar o próximo passo de um desenvolvimento.',actions:['Nova tarefa']},
    {title:'Novo projeto',desc:'Registrar uma ideia que virou ação.',actions:['Nova tarefa']}
   ]
  },
  tiktok:{
   kind:'tiktok',key:WORK_TIKTOK_KEY,name:'TikTok',
   desc:'Seu espaço para conteúdo e presença digital.',tag:'CONTEÚDO',
   logo:'tiktok-logo.png',
   groups:[
    {title:'Ideias',desc:'Guardar ideias antes de decidir quando publicar.',actions:['Definir ideia']},
    {title:'Produção',desc:'Roteirizar, gravar e editar conteúdos.',actions:['Roteirizar','Gravar','Editar']},
    {title:'Publicação',desc:'Publicar e reaproveitar conteúdos quando fizer sentido.',actions:['Publicar','Reaproveitar conteúdo']},
    {title:'Comunidade',desc:'Responder e manter presença com quem acompanha.',actions:['Responder / comunidade']},
    {title:'Análise',desc:'Ver o que funcionou e definir a próxima ação.',actions:['Analisar resultado','Planejar próxima semana']},
    {title:'Outra tarefa',desc:'Qualquer ação que não esteja nas opções acima.',actions:['Outra tarefa']}
   ]
  }
 };
 const cfg=cfgs[kind];
 const all=loadWorkTasks(cfg.key),done=all.filter(x=>x.status==='Concluído').length;
 const logo=`<img class="hero-brand-logo work-sub-logo" src="${cfg.logo}" alt="${cfg.name}">`;
 const actionBtn=(group,a)=>`<button type="button" class="work-action-chip" data-work-action="${escapeHtml(a)}" data-work-group="${escapeHtml(group)}">${escapeHtml(a)}</button>`;
 const groupsHtml=cfg.groups.map(g=>`
   <section class="card work-panel work-click-panel">
     <div class="panel-tag">${cfg.tag}</div>
     <button type="button" class="work-panel-main" data-work-group-main="${escapeHtml(g.title)}" aria-label="Adicionar tarefa em ${escapeHtml(g.title)}">
       <h3>${escapeHtml(g.title)}</h3><span>${escapeHtml(g.desc)}</span>
     </button>
     <div class="work-action-grid">${g.actions.map(a=>actionBtn(g.title,a)).join('')}</div>
   </section>`).join('');
 const taskHtml=renderWorkTaskArea(cfg);
 app.innerHTML=`<section class="hero"><div class="eyebrow">💼 TRABALHO</div><h2>${logo} ${cfg.name}</h2><p>${cfg.desc}</p></section>
 <div class="work-subnav"><button class="work-back" id="backWork">← Trabalho</button><p class="work-subtitle">${cfg.tag}</p></div>
 ${kind==='tiktok'?`<section class="work-section"><div class="work-section-head"><h3>Como organizar</h3></div><div class="work-panels work-plan-panels">${[
 ['1 · Clareza','Definir posicionamento, pilares e linguagem.'],
 ['2 · Banco de ideias','Capturar ideias sem precisar produzir na hora.'],
 ['3 · Produção','Roteirizar → gravar → editar.'],
 ['4 · Publicação','Publicar → reaproveitar quando fizer sentido.'],
 ['5 · Análise','Analisar resultados → definir próxima ação.']
 ].map(([t,d])=>`<section class="card work-panel work-click-panel work-plan-card" data-plan-title="${escapeHtml(t)}"><div class="panel-tag">CONTEÚDO</div><button type="button" class="work-panel-main"><h3>${escapeHtml(t)}</h3><span>${escapeHtml(d)}</span></button></section>`).join('')}</div></section>`:''}
 ${taskHtml}
 <section class="work-section"><div class="work-section-head"><h3>Áreas</h3><span class="work-badge">${done} concluídas</span></div><div class="work-panels">${groupsHtml}</div></section>
 <div class="work-rule">O objetivo é saber o que precisa ser feito e quanto tempo isso ocupa. O Meu Dia usa essas tarefas quando fizer sentido.</div>`;
 document.getElementById('backWork').onclick=()=>{location.hash='trabalho'};
 document.getElementById('addWorkTask').onclick=()=>openWorkTaskModal(cfg);
 const openTask=(title)=>openWorkTaskModal(cfg,{title:`${title} · `,date:todayISO(),duration:'30 min',priority:'Normal',status:'A fazer',note:''});
 document.querySelectorAll('[data-work-action]').forEach(b=>b.onclick=(e)=>{
   e.preventDefault();e.stopPropagation();
   const action=b.dataset.workAction, group=b.dataset.workGroup;
   const presetTitle=(action==='Nova tarefa'||action==='Outra tarefa')?`${group} · `:`${group} · ${action}`;
   openWorkTaskModal(cfg,{title:presetTitle,date:todayISO(),duration:'30 min',priority:'Normal',status:'A fazer',note:''});
 });
 document.querySelectorAll('[data-work-group-main]').forEach(b=>b.onclick=(e)=>{
   e.preventDefault();e.stopPropagation();openTask(b.dataset.workGroupMain);
 });
 document.querySelectorAll('[data-plan-title]').forEach(card=>card.onclick=(e)=>{
   e.preventDefault();e.stopPropagation();openTask(card.dataset.planTitle);
 });
 document.querySelectorAll('[data-work-edit]').forEach(b=>b.onclick=(e)=>{e.preventDefault();e.stopPropagation();const item=all.find(x=>x.id===b.dataset.workEdit);if(item)openWorkTaskModal(cfg,item)});
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
  {id:"lavanderia",title:"Lavanderia",icon:"🧺",tasks:[
   {id:"lav1",name:"Rodar uma lavanderia",freq:"conforme volume",when:"1–2x/semana",done:false},
   {id:"lav2",name:"Lavar toalhas",freq:"semanal",when:"lavanderia",done:false},
   {id:"lav3",name:"Trocar/lavar roupa de cama",freq:"semanal",when:"lavanderia",done:false},
   {id:"lav4",name:"Bloco de passar",freq:"semanal",when:"bloco único",done:false}
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
function loadCasa(){try{const d=JSON.parse(localStorage.getItem(CASA_KEY));if(d)return {...CASA_BASE,...d};}catch{}return JSON.parse(JSON.stringify(CASA_BASE));}
function saveCasa(d){localStorage.setItem(CASA_KEY,JSON.stringify(d));}
function renderCasa(){
 const d=loadCasa();
 const all=d.areas.flatMap(a=>a.tasks), done=all.filter(x=>x.done).length;
 app.innerHTML=`<section class="hero"><h2>🏠 Casa</h2><p>Uma casa funcional, sem transformar a manutenção em uma segunda jornada.</p></section>
 <div class="home-principle card"><span class="eyebrow">REGRA DA CASA</span><strong>Agrupar. Delegar. Adiar quando puder.</strong><p>Não espalhar microtarefas pelo dia. O essencial entra em blocos; o resto pode esperar.</p></div>
 <div class="home-summary"><div class="card"><span>Rotinas</span><b>${all.length}</b></div><div class="card"><span>Feitas agora</span><b>${done}</b></div></div>
 <div class="section-title">ROTINAS</div>
 <div class="list">${d.areas.map(a=>`<div class="card home-area"><div class="panel-head"><h3>${a.icon} ${escapeHtml(a.title)}</h3><span class="pill">${a.tasks.length}</span></div>
 ${a.tasks.length?a.tasks.map(t=>`<label class="home-task ${t.done?"done":""}"><input type="checkbox" data-casa-task="${a.id}|${t.id}" ${t.done?"checked":""}><span><strong>${escapeHtml(t.name)}</strong><small>${escapeHtml(t.freq)} · ${escapeHtml(t.when)}</small></span></label>`).join(""):`<p class="note">Sem rotina cadastrada. Mantemos espaço para incluir apenas o que realmente for necessário.</p>`}</div>`).join("")}</div>
 <div class="section-title">MANUTENÇÃO</div>
 <div class="card"><p class="note">Problemas, reparos e projetos da casa ficam aqui para não invadirem o dia. Só entram como prioridade quando realmente precisam de atenção.</p><button class="secondary" id="addMaintenance">＋ Adicionar manutenção</button></div>
 <div class="list">${d.maintenance.map(x=>`<div class="card maintenance-row"><div><strong>${escapeHtml(x.name)}</strong><span>${escapeHtml(x.note||"")}</span></div><button class="more" data-maint="${x.id}">✓</button></div>`).join("")||`<div class="empty compact"><strong>Nenhuma manutenção pendente.</strong><span>Ótimo. Não precisamos criar trabalho só para preencher espaço.</span></div>`}</div>`;
 document.querySelectorAll("[data-casa-task]").forEach(el=>el.onchange=()=>{const [aid,tid]=el.dataset.casaTask.split("|"),x=loadCasa(),a=x.areas.find(a=>a.id===aid),t=a.tasks.find(t=>t.id===tid);t.done=el.checked;saveCasa(x);renderCasa();});
 document.querySelector("#addMaintenance").onclick=()=>openCasaMaintenance();
 document.querySelectorAll("[data-maint]").forEach(b=>b.onclick=()=>{const x=loadCasa();x.maintenance=x.maintenance.filter(m=>m.id!==b.dataset.maint);saveCasa(x);renderCasa();});
}
function openCasaMaintenance(){
 const d=loadCasa(),dlg=document.createElement("dialog");
 dlg.innerHTML=`<form method="dialog" class="modal-card" id="casaForm"><div class="modal-head"><div><div class="eyebrow">🏠 CASA</div><h2>Nova manutenção</h2></div><button class="icon-btn" value="cancel">×</button></div>
 <label>O que precisa ser resolvido?<input id="mName" required maxlength="100"></label><label>Observação (opcional)<textarea id="mNote" rows="3"></textarea></label>
 <div class="modal-actions"><div class="grow"></div><button type="button" class="secondary" id="cancelCasa">Cancelar</button><button class="primary" value="default">Salvar</button></div></form>`;
 document.body.appendChild(dlg);dlg.showModal();dlg.querySelector("#cancelCasa").onclick=()=>{dlg.close();dlg.remove()};
 dlg.querySelector("#casaForm").addEventListener("submit",e=>{e.preventDefault();d.maintenance.push({id:uid(),name:dlg.querySelector("#mName").value.trim(),note:dlg.querySelector("#mNote").value.trim(),createdAt:Date.now()});saveCasa(d);dlg.close();dlg.remove();renderCasa();});
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
 <div class="card food-note"><span class="eyebrow">FREEZER</span><p>As etiquetas seguem: <strong>NOME • DATA • Nº DE PORÇÕES • FINALIZAÇÃO</strong>. Arroz e feijão podem ser congelados; folhas, salada e itens crocantes ficam frescos.</p></div>`;
 document.querySelector("#foodCook").onchange=e=>{const x=loadFood();x.cookingDone=e.target.checked;saveFood(x);};
}

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
  if (state.route.startsWith("trabalho-")) { state.route="trabalho"; location.hash="trabalho"; render(); return; }
  state.route="meu-dia";
  location.hash = "meu-dia";
  render();
};

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () =>
    navigator.serviceWorker.register("sw.js").catch(console.warn)
  );
}

window.addEventListener("DOMContentLoaded", ensureMainNavigation);

render();
