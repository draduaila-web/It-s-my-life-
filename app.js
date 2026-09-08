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
function renderMeuDia(){
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
 ${renderRituaisHojeV13()}
 ${p.length?`<section class="day-section"><div class="section-head"><h2>Pendências que merecem aparecer</h2><a href="#pendencias">ver todas</a></div>${p.map(x=>`<div class="compact-item"><strong>${x.title||x.name||'Pendência'}</strong>${x.dueDate?`<small>${x.dueDate}</small>`:''}</div>`).join('')}</section>`:''}
 <section class="quick-grid"><a href="#rituais">✨<span>Rituais</span></a><a href="#exercicios">🏃<span>Exercícios</span></a><a href="#alimentacao">🍽️<span>Alimentação</span></a><a href="#receitas">📖<span>Receitas</span></a><a href="#cabelo">💇‍♀️<span>Cabelo</span></a><a href="#casa">🏠<span>Casa</span></a><a href="#financeiro">💰<span>Financeiro</span></a></section>
 <section class="free-space"><div>☁️</div><strong>Espaço livre também faz parte do dia.</strong><p>Se nada precisa ser resolvido agora, não resolva.</p></section>`;
}

/* CORREÇÃO PRINCIPAL:
   O hash é usado para navegação quando existir; sem hash, a página inicial
   agora é Pendências. A rota Meu Dia continua disponível em #meu-dia.
*/
/* ===== RITUAIS DE HOJE + AUTOCUIDADO V13 ===== */
const SELFCARE_KEY_V13="minha-vida.selfcare.v3";
const SELFCARE_BASE_V13=[
["MEZZO BIOSCULPT","✦","20 min",["Limpeza facial","Mezzo — 20 min","Hidratação"],"mezzo"],
["DEPILAÇÃO","◦","20–30 min",["Banho morno","Pernas + axilas","Virilha","Hidratação"],"depilacao"],
["MÁSCARA FACIAL","✦","20–30 min",["Higienizar pele","Máscara calmante","Retirar","Sérum + hidratação"],"mascara"],
["MANUTENÇÃO","◦","10 min",["Óleo cutículas","Creme mãos","Creme pés","Conferir soft gel"],"manutencao"],
["DIA DAS UNHAS","♡","≈ 3 horas",["Remover soft gel","Preparar unhas","Aplicar soft gel","Fazer os pés","Hidratar"],"unhas"],
["LIVRE","✧","Variável",["Cronograma capilar","Hidratação corporal","Cutículas","Desacelerar"],"livre"],
["RESET","☾","10–15 min",["Hidratar mãos","Óleo cutículas","Creme pés","Skincare noturno"],"reset"],
["MEZZO BIOSCULPT","✦","20 min",["Limpeza facial","Mezzo — 20 min","Hidratação"],"mezzo"],
["DEPILAÇÃO","◦","20–30 min",["Banho morno","Pernas + axilas","Virilha","Hidratação"],"depilacao"],
["BUÇO + SOBRANCELHAS","✧","15 min",["Aparelho no buço","Pinça","Tesoura","Hidratação"],"sobrancelhas"],
["MÁSCARA FACIAL","✦","20–30 min",["Higienizar pele","Máscara antioxidante","Retirar","Sérum + hidratação"],"mascara"],
["SPA CORPORAL","♡","30–40 min",["Banho","Esfoliação","Depilação localizada","Hidratação","Creme nos pés"],"spa"],
["MEZZO + RELAXAMENTO","☾","20–30 min",["Mezzo — 20 min","Skincare","Hidratação corporal","Relaxar"],"mezzo-relax"],
["RESET","☾","10–15 min",["Hidratar mãos","Óleo cutículas","Creme pés","Skincare noturno"],"reset"]
];
const SELFCARE_HOW_V13={
mezzo:["Limpeza facial","Mezzo — 20 min","Hidratação"],
depilacao:["Banho morno","Realizar depilação programada","Hidratar a pele"],
mascara:["Higienizar a pele","Aplicar a máscara indicada","Retirar","Sérum + hidratação"],
manutencao:["Óleo nas cutículas","Creme nas mãos","Creme nos pés","Conferir soft gel"],
unhas:["Remover soft gel","Preparar unhas","Aplicar soft gel","Fazer os pés","Hidratar"],
livre:["Escolher o cuidado previsto","Hidratação corporal ou cutículas","Se envolver cabelo, abrir o COMO do Ritual Capilar","Desacelerar"],
reset:["Hidratar mãos","Óleo nas cutículas","Creme nos pés","Skincare noturno"],
sobrancelhas:["Aparelho no buço","Pinça nas sobrancelhas","Tesoura se necessário","Hidratação"],
spa:["Banho","Esfoliação","Depilação localizada se prevista","Hidratação","Creme nos pés"],
"mezzo-relax":["Mezzo — 20 min","Skincare","Hidratação corporal","Relaxar"]
};
function selfcareLoadV13(){
 try{const x=JSON.parse(localStorage.getItem(SELFCARE_KEY_V13)||"null");if(x&&Array.isArray(x.days)&&x.days.length===14)return x;}catch(e){}
 const days=SELFCARE_BASE_V13.map(x=>({titulo:x[0],icone:x[1],duracao:x[2],tarefas:[...x[3]],id:x[4]}));
 const x={cycleStart:"2026-08-30",days,overrides:{}};localStorage.setItem(SELFCARE_KEY_V13,JSON.stringify(x));return x;
}
function selfcareDateKeyV13(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
function selfcareIndexV13(d=new Date()){
 const x=selfcareLoadV13(),a=x.cycleStart.split("-").map(Number),start=new Date(a[0],a[1]-1,a[2]),cur=new Date(d.getFullYear(),d.getMonth(),d.getDate());
 return ((Math.floor((cur-start)/86400000)%14)+14)%14;
}
function selfcareTodayV13(d=new Date()){
 const x=selfcareLoadV13(),k=selfcareDateKeyV13(d),i=selfcareIndexV13(d);return {index:i,items:[x.days[i],...(x.overrides[k]||[])]};
}
function selfcareDoneV13(item,d=new Date()){return localStorage.getItem(`minha-vida.selfcare.done.${selfcareDateKeyV13(d)}.${item.id||item.titulo}`)==="1";}
function selfcareToggleV13(item){const k=`minha-vida.selfcare.done.${selfcareDateKeyV13(new Date())}.${item.id||item.titulo}`;if(localStorage.getItem(k)==="1")localStorage.removeItem(k);else localStorage.setItem(k,"1");render();}
function selfcareHowV13(item){
 const steps=SELFCARE_HOW_V13[item.id]||item.tarefas||[],o=document.createElement("div");o.className="mv-how-overlay";
 o.innerHTML=`<div class="mv-how"><button class="mv-how-x" onclick="this.closest('.mv-how-overlay').remove()">×</button><div class="eyebrow">COMO FAZER</div><h2>${item.icone||"✦"} ${escapeHtml(item.titulo||"Ritual")}</h2><ol>${steps.map(s=>`<li>${escapeHtml(s)}</li>`).join("")}</ol><p>Você poderá editar este passo a passo pelo próprio app.</p></div>`;document.body.appendChild(o);
}
function renderAutocuidadoV13(){
 const x=selfcareLoadV13(),t=selfcareTodayV13();
 app.innerHTML=`<section class="hero selfcare-v13-hero"><div class="backline"><button class="back-inline" onclick="location.hash='rituais';renderRituais()">‹ Rituais</button></div><div class="eyebrow">🌸 RITUAIS</div><h2>Autocuidado</h2><p>Ciclo de 14 dias em looping contínuo. Você pode editar e acrescentar cuidados em datas específicas.</p></section>
 <section class="selfcare-v13-today"><div class="selfcare-v13-head"><strong>✨ Hoje • Dia ${t.index+1}/14</strong><button class="secondary" onclick="openSelfcareEditV13()">Editar ciclo</button></div>
 ${t.items.map(it=>`<article class="selfcare-v13-card"><span class="sc-icon">${it.icone||"✦"}</span><div><b>${escapeHtml(it.titulo)}</b><small>⏱ ${escapeHtml(it.duracao||"Variável")}</small><div class="sc-actions"><button onclick='selfcareHowV13(${JSON.stringify(it).replace(/'/g,"&#39;")})'>COMO FAZER →</button><button onclick='selfcareToggleV13(${JSON.stringify(it).replace(/'/g,"&#39;")})'>${selfcareDoneV13(it)?"↩ Feito":"✓ Marcar feito"}</button></div></div></article>`).join("")}</section>
 <section class="selfcare-v13-add"><button onclick="openSelfcareDateV13()">＋ Adicionar ritual em uma data</button><p>Para cadastrar plasma, botox e tratamentos profundos quando as datas forem definidas.</p></section>
 <section class="selfcare-v13-cycle"><strong>📅 Ciclo contínuo</strong><div class="sc-cycle-grid">${x.days.map((it,i)=>`<button onclick="openSelfcareDayV13(${i})"><b>${i+1}</b><span>${escapeHtml(it.titulo)}</span></button>`).join("")}</div></section>`;
}
function openSelfcareDayV13(i){
 const x=selfcareLoadV13(),it=x.days[i],o=document.createElement("div");o.className="mv-how-overlay";
 o.innerHTML=`<div class="mv-how"><button class="mv-how-x" onclick="this.closest('.mv-how-overlay').remove()">×</button><div class="eyebrow">EDITAR CICLO</div><h2>Dia ${i+1}/14</h2><label>Título<input id="scv13t" value="${escapeHtml(it.titulo)}"></label><label>Duração<input id="scv13d" value="${escapeHtml(it.duracao||"Variável")}"></label><label>Checklist<textarea id="scv13s">${escapeHtml((it.tarefas||[]).join("\n"))}</textarea></label><button class="primary" onclick="saveSelfcareDayV13(${i})">Salvar</button></div>`;document.body.appendChild(o);
}
function saveSelfcareDayV13(i){const x=selfcareLoadV13(),it=x.days[i];it.titulo=document.getElementById("scv13t").value.trim()||"Ritual";it.duracao=document.getElementById("scv13d").value.trim()||"Variável";it.tarefas=document.getElementById("scv13s").value.split("\n").map(x=>x.trim()).filter(Boolean);selfcareSaveV13(x);document.querySelector(".mv-how-overlay")?.remove();render();}
function selfcareSaveV13(x){localStorage.setItem(SELFCARE_KEY_V13,JSON.stringify(x));}
function openSelfcareDateV13(){const o=document.createElement("div");o.className="mv-how-overlay";o.innerHTML=`<div class="mv-how"><button class="mv-how-x" onclick="this.closest('.mv-how-overlay').remove()">×</button><div class="eyebrow">NOVO RITUAL</div><h2>＋ Adicionar data</h2><label>Data<input id="scv13date" type="date" value="${selfcareDateKeyV13(new Date())}"></label><label>Ritual<input id="scv13new" placeholder="Ex.: Plasma facial"></label><label>Duração<input id="scv13dur" value="30 min"></label><label>Como fazer / checklist<textarea id="scv13tasks" placeholder="Um passo por linha"></textarea></label><button class="primary" onclick="saveSelfcareDateV13()">Adicionar</button></div>`;document.body.appendChild(o);}
function saveSelfcareDateV13(){const x=selfcareLoadV13(),k=document.getElementById("scv13date").value;if(!k)return;x.overrides[k]=x.overrides[k]||[];x.overrides[k].push({id:"custom-"+Date.now(),titulo:document.getElementById("scv13new").value.trim()||"Novo ritual",icone:"✦",duracao:document.getElementById("scv13dur").value.trim()||"Variável",tarefas:document.getElementById("scv13tasks").value.split("\n").map(x=>x.trim()).filter(Boolean)});selfcareSaveV13(x);document.querySelector(".mv-how-overlay")?.remove();render();}
function openSelfcareEditV13(){openSelfcareDayV13(selfcareIndexV13(new Date()));}
function ritualsTodayV13(){
 const arr=[];let h=null;try{if(typeof hairTodayData==="function")h=hairTodayData();}catch(e){}
 if(h)arr.push({type:"hair",title:"Ritual Capilar",sub:hairTypeLabel(h.kind),icon:"💇‍♀️"});
 const s=selfcareTodayV13();s.items.forEach(it=>arr.push({type:"selfcare",item:it,title:it.titulo,sub:`${it.duracao||"Variável"} • Dia ${s.index+1}/14`,icon:it.icone||"🌸"}));return arr;
}
function renderRituaisHojeV13(){
 const arr=ritualsTodayV13();if(!arr.length)return "";
 return `<section class="mv-rh-v13"><div class="mv-rh-v13-head"><h2>✨ Rituais de hoje</h2><span>${arr.length} ${arr.length===1?"ritual":"rituais"}</span></div>${arr.map(x=>`<article class="mv-rh-v13-card"><span>${x.icon}</span><div><b>${escapeHtml(x.title)}</b><small>${escapeHtml(x.sub)}</small><div><button onclick='${x.type==="hair"?"location.hash=\"cabelo\";renderCabelo()":"selfcareHowV13("+JSON.stringify(x.item).replace(/'/g,"&#39;")+")"}'>COMO FAZER →</button><button onclick='${x.type==="hair"?"location.hash=\"cabelo\";renderCabelo()":"selfcareToggleV13("+JSON.stringify(x.item).replace(/'/g,"&#39;")+")"}'>${x.type==="hair"?"Abrir":(selfcareDoneV13(x.item)?"↩ Feito":"✓ Feito")}</button></div></div></article>`).join("")}</section>`;
}

function render() {
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
      route === "autocuidado" ? "🌸 Autocuidado" :
      route === "estudos" ? "📚 Estudos" :
      route === "financeiro" ? "💰 Financeiro" :
      route === "casa" ? "🏠 Casa" :
      route === "exercicios" ? "🏃 Exercícios" :
      route === "alimentacao" ? "🍽️ Alimentação" :
      route === "receitas" ? "📖 Receitas" :
      "Minha Vida";
  }

  document.querySelectorAll(".nav-item").forEach(b =>
    b.classList.toggle("active", b.dataset.route === route)
  );

  if (route === "meu-dia") {
    app.innerHTML = renderMeuDia();
    return;
  }
  if (route === "autocuidado") {
    renderAutocuidadoV13();
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
  else if (route === "cabelo") renderCabelo();
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
      <div class="ritual-today-hint">✨ <strong>Rituais de hoje</strong><span>Os rituais programados aparecem automaticamente no Meu Dia.</span></div>
      <button class="ritual-card featured" id="capilarBtn">
        <span class="ritual-icon">✦</span>
        <div><strong>Ritual Capilar</strong><span>Lavagem · tratamento · finalização · day after</span></div>
        <b>›</b>
      </button>
      <button class="ritual-card featured" id="autocuidadoBtn">
        <span class="ritual-icon">🌸</span>
        <div><strong>Ritual de Autocuidado</strong><span>Unhas · depilação · pele · tratamentos</span></div>
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

  document.querySelector("#capilarBtn").onclick = () => { location.hash = "cabelo"; renderCabelo(); };
  document.querySelector("#autocuidadoBtn").onclick = () => { location.hash = "autocuidado"; renderAutocuidadoV13(); };
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

function renderEstudos() {
  const d = loadEstudos();
  const totalSessions = d.sessions.length;
  const totalQuestions = d.questions.reduce((n,q)=>n + Number(q.count || 0), 0);
  const completedReviews = d.reviews.filter(x=>x.done).length;

  app.innerHTML = `
    <section class="hero">
      <h2>📚 Estudos</h2>
      <p>Um lugar para organizar o CEBRASPE e outros conteúdos sem transformar estudo em uma agenda pesada.</p>
    </section>

    <div class="study-summary">
      <div class="summary-card"><strong>${d.subjects.length}</strong><span>matérias</span></div>
      <div class="summary-card"><strong>${totalSessions}</strong><span>estudos registrados</span></div>
      <div class="summary-card"><strong>${totalQuestions}</strong><span>questões</span></div>
    </div>

    <div class="study-section">
      <div class="section-heading"><div><div class="eyebrow">FOCO</div><h3>CEBRASPE</h3></div><button class="secondary" id="addSubject">＋ Matéria</button></div>
      <div class="list">
        ${d.subjects.length ? d.subjects.map(subjectHtml).join("") : `<div class="empty compact"><strong>Comece pelas matérias.</strong><span>Cadastre apenas o que realmente faz parte do seu estudo.</span></div>`}
      </div>
    </div>

    <div class="study-section">
      <div class="section-heading"><div><div class="eyebrow">REGISTRO</div><h3>Estudos realizados</h3></div><button class="secondary" id="addSession">＋ Estudo</button></div>
      <div class="list">
        ${d.sessions.length ? d.sessions.slice().reverse().slice(0,8).map(sessionHtml).join("") : `<div class="empty compact"><strong>Nenhum estudo registrado.</strong><span>O registro é opcional. Use quando ajudar a enxergar seu progresso.</span></div>`}
      </div>
    </div>

    <div class="study-section">
      <div class="section-heading"><div><div class="eyebrow">REVISÕES</div><h3>Revisões</h3></div><button class="secondary" id="addReview">＋ Revisão</button></div>
      <div class="list">
        ${d.reviews.length ? d.reviews.map(reviewHtml).join("") : `<div class="empty compact"><strong>Nenhuma revisão planejada.</strong><span>Não é preciso preencher o calendário antes de precisar dele.</span></div>`}
      </div>
    </div>

    <div class="study-section">
      <div class="section-heading"><div><div class="eyebrow">QUESTÕES</div><h3>Questões</h3></div><button class="secondary" id="addQuestions">＋ Registrar</button></div>
      <div class="list">
        ${d.questions.length ? d.questions.slice().reverse().slice(0,8).map(questionHtml).join("") : `<div class="empty compact"><strong>Nenhuma questão registrada.</strong><span>Registre volume quando isso for útil para você.</span></div>`}
      </div>
    </div>
  `;

  document.querySelector("#addSubject").onclick = () => openStudyModal("subject");
  document.querySelector("#addSession").onclick = () => openStudyModal("session");
  document.querySelector("#addReview").onclick = () => openStudyModal("review");
  document.querySelector("#addQuestions").onclick = () => openStudyModal("questions");

  document.querySelectorAll("[data-study-edit]").forEach(x => x.onclick = () => openStudyModal(x.dataset.studyEdit, x.dataset.id));
  document.querySelectorAll("[data-review-toggle]").forEach(x => x.onclick = () => {
    const data = loadEstudos(), i = data.reviews.findIndex(r=>r.id===x.dataset.reviewToggle);
    if(i>=0){ data.reviews[i].done=!data.reviews[i].done; saveEstudos(data); renderEstudos(); }
  });
}
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


const FIN_KEY="minha-vida.financeiro.v1";
const FIN_BASE={
  income: 19172.96,
  expenses: [
    {id:"aluguel",name:"Aluguel da casa",value:9503.50,category:"Casa",payer:"Usuária",status:"confirmado"},
    {id:"bb",name:"BB — dívidas/parcelamentos",value:2329.59,category:"Dívidas",payer:"Usuária",status:"confirmado"},
    {id:"caesb",name:"CAESB + Neoenergia",value:203.79,category:"Casa",payer:"Usuária",status:"base"},
    {id:"combustivel",name:"Combustível",value:650,category:"Transporte",payer:"Usuária",status:"teto"},
    {id:"pets",name:"Pets",value:450,category:"Animais",payer:"Usuária",status:"teto"},
    {id:"itau5298",name:"Itaú 5298 — fatura agosto",value:1702.25,category:"Cartão",payer:"Usuária",status:"confirmado"}
  ],
  excluded:[
    {name:"Itaú 4590 — fatura alta",value:5566.54,payer:"Mãe",reason:"Pago pela mãe; fora do orçamento da usuária."},
    {name:"Unimed + Unidental",value:0,payer:"Empregador",reason:"Benefício; não entra no orçamento."},
    {name:"BEC",value:0,payer:"—",reason:"Sem despesas atuais."}
  ],
  goals:[
    {month:"Setembro",min:2000,max:3000,status:"Pendente"},
    {month:"Outubro",min:2000,max:3000,status:"Pendente"},
    {month:"Novembro",min:2000,max:3000,status:"Pendente"},
    {month:"Dezembro",min:2000,max:3000,status:"Pendente"}
  ],
  transactions:[]
};
function loadFin(){try{const d=JSON.parse(localStorage.getItem(FIN_KEY));if(d)return {...FIN_BASE,...d};}catch{}return JSON.parse(JSON.stringify(FIN_BASE));}
function saveFin(d){localStorage.setItem(FIN_KEY,JSON.stringify(d));}
function finKnownTotal(d){return d.expenses.reduce((s,x)=>s+Number(x.value||0),0);}
function money(n){return Number(n||0).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2});}
function renderFinanceiro(){
 const d=loadFin(),known=finKnownTotal(d),balance=d.income-known;
 const min=d.goals.reduce((s,x)=>s+Number(x.min||0),0),max=d.goals.reduce((s,x)=>s+Number(x.max||0),0);
 app.innerHTML=`<section class="hero"><h2>💰 Financeiro</h2><p>Clareza sobre o que realmente sai do seu caixa — sem transformar sua vida em contabilidade.</p></section>
 <div class="money-hero card"><span class="eyebrow">RENDA MENSAL BASE</span><strong>R$ ${money(d.income)}</strong><div class="money-grid"><div><span>Conhecido</span><b>R$ ${money(known)}</b></div><div><span>Sobra conhecida</span><b>R$ ${money(balance)}</b></div></div></div>
 <div class="section-title">ORÇAMENTO BASE</div><div class="list">${d.expenses.map(finExpenseHtml).join("")}</div><button class="add-full secondary" id="addExpense">＋ Adicionar despesa</button>
 <div class="section-title">COMPRAS / GASTOS DO MÊS</div><div class="card"><p class="note">A planilha enviada não traz uma lista detalhada das compras do mês. Ela registra que alimentação, seguros, assinaturas, despesas do Henrique e variáveis ainda precisam ser incorporados ao fechamento. Por isso, esses gastos ficam separados até termos os valores reais.</p><button class="primary" id="addTransaction">＋ Registrar gasto</button></div>
 <div class="list">${d.transactions.slice().reverse().slice(0,10).map(transactionHtml).join("")||`<div class="empty compact"><strong>Nenhum gasto registrado.</strong><span>Podemos começar a registrar aqui sem alterar o orçamento-base.</span></div>`}</div>
 <div class="section-title">FUNDO CARRO</div><div class="card goal-card"><div class="panel-head"><div><span class="eyebrow">SETEMBRO → DEZEMBRO</span><h3>Meta acumulada</h3></div><span class="pill today">R$ ${money(min)}–${money(max)}</span></div><div class="goal-list">${d.goals.map((g,i)=>`<div class="goal-row"><span>${escapeHtml(g.month)}</span><strong>R$ ${money(g.min)}–${money(g.max)}</strong><button class="goal-toggle ${g.status==="Concluído"?"done":""}" data-goal="${i}">${g.status==="Concluído"?"✓":"○"}</button></div>`).join("")}</div></div>
 <div class="section-title">FORA DO SEU ORÇAMENTO</div><div class="list">${d.excluded.map(x=>`<div class="card excluded-card"><div><strong>${escapeHtml(x.name)}</strong><span>${x.value?`R$ ${money(x.value)} · `:""}${escapeHtml(x.reason)}</span></div><span class="pill">${escapeHtml(x.payer)}</span></div>`).join("")}</div>`;
 document.querySelector("#addExpense").onclick=()=>openFinModal("expense");
 document.querySelector("#addTransaction").onclick=()=>openFinModal("transaction");
 document.querySelectorAll("[data-goal]").forEach(b=>b.onclick=()=>{const x=loadFin(),i=+b.dataset.goal;x.goals[i].status=x.goals[i].status==="Concluído"?"Pendente":"Concluído";saveFin(x);renderFinanceiro();});
}
function finExpenseHtml(x){return `<article class="card finance-row"><div><strong>${escapeHtml(x.name)}</strong><span>${escapeHtml(x.category)} · ${escapeHtml(x.status)}</span></div><b>R$ ${money(x.value)}</b></article>`;}
function transactionHtml(x){return `<article class="card finance-row"><div><strong>${escapeHtml(x.name)}</strong><span>${x.date?formatDate(x.date):""} · ${escapeHtml(x.category||"Variável")}</span></div><b>R$ ${money(x.value)}</b></article>`;}
function openFinModal(type){
 const d=loadFin(),dlg=document.createElement("dialog");
 dlg.innerHTML=`<form method="dialog" class="modal-card" id="finForm"><div class="modal-head"><div><div class="eyebrow">💰 FINANCEIRO</div><h2>Registrar ${type==="expense"?"despesa":"gasto"}</h2></div><button class="icon-btn" value="cancel">×</button></div>
 <label>Descrição<input id="fName" required maxlength="100"></label><div class="form-grid"><label>Valor<input id="fValue" required type="number" min="0" step="0.01"></label><label>Categoria<input id="fCategory" maxlength="50" value="Variável"></label></div>
 ${type==="expense"?`<label>Responsável<select id="fPayer"><option>Usuária</option><option>Mãe</option><option>Empregador</option></select></label>`:`<label>Data<input id="fDate" type="date" value="${todayISO()}"></label>`}
 <div class="modal-actions"><div class="grow"></div><button type="button" class="secondary" id="cancelFin">Cancelar</button><button class="primary" value="default">Salvar</button></div></form>`;
 document.body.appendChild(dlg);dlg.showModal();dlg.querySelector("#cancelFin").onclick=()=>{dlg.close();dlg.remove()};
 dlg.querySelector("#finForm").addEventListener("submit",e=>{e.preventDefault();const obj={id:uid(),name:dlg.querySelector("#fName").value.trim(),value:+dlg.querySelector("#fValue").value||0,category:dlg.querySelector("#fCategory").value.trim(),updatedAt:Date.now()};if(type==="expense"){obj.payer=dlg.querySelector("#fPayer").value;obj.status="manual";d.expenses.push(obj)}else{obj.date=dlg.querySelector("#fDate").value;d.transactions.push(obj)}saveFin(d);dlg.close();dlg.remove();renderFinanceiro()});
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

const FOOD_KEY="minha-vida.alimentacao.v3";
const FOOD_DAYS=["Segunda","Terça","Quarta","Quinta","Sexta","Sábado","Domingo"];
const FOOD_MONTHS=[
 {id:"2026-09",label:"Setembro",defined:true},
 {id:"2026-10",label:"Outubro",defined:false},
 {id:"2026-11",label:"Novembro",defined:false},
 {id:"2026-12",label:"Dezembro",defined:false}
];
const FOOD_WEEKS=[
 {id:1,title:"Semana 1",pico:"Morango cremoso + coco",meals:[
  ["Segunda","Pão frito + café com leite","Frango assado com batatas + arroz + salada","frango, batata, arroz, folhas, tomate"],
  ["Terça","Crepioca de cottage","Strogonoff de frango + arroz + batata palha + salada","frango, creme, tomate, arroz, batata"],
  ["Quarta","Waffle de queijo","Bife de alcatra acebolado + purê + brócolis","alcatra, cebola, batata, brócolis"],
  ["Quinta","Panqueca","Ragu de carne + arroz + legumes","carne moída, tomate, arroz, legumes"],
  ["Sexta","Pão frito","Hambúrguer caseiro + batata assada + salada","carne moída, batata, folhas, tomate"],
  ["Sábado","Cuscuz + queijo","Pizza caseira / noite de pizza","massa, queijo, tomate"],
  ["Domingo","Panquecas + café com leite","Carne de panela com músculo + arroz + feijão + legumes","músculo, arroz, feijão, legumes"]
 ]},
 {id:2,title:"Semana 2",pico:"Maracujá cremoso + banana com canela",meals:[
  ["Segunda","Crepioca","Carne de panela desfiada + arroz + legumes","músculo, arroz, legumes"],
  ["Terça","Waffle de queijo","Panquecas salgadas de carne e queijo + salada","carne moída, queijo, farinha, folhas"],
  ["Quarta","Pão frito","Filé de frango grelhado + arroz + feijão + legumes","filé de frango, arroz, feijão, legumes"],
  ["Quinta","Panquecas","Frango desfiado cremoso + Rap10 + salada","frango, Rap10, creme, folhas"],
  ["Sexta","Cuscuz + queijo","Hambúrguer caseiro + batata rústica","carne moída, batata, queijo"],
  ["Sábado","Waffle + café com leite","Risoto de frango/carne + salada","arroz, frango ou carne, queijo, folhas"],
  ["Domingo","Panquecas","Lagarto assado + arroz + feijão + farofa + salada","lagarto, arroz, feijão, farinha, folhas"]
 ]},
 {id:3,title:"Semana 3",pico:"Manga + abacaxi com coco",meals:[
  ["Segunda","Pão frito","Porco assado + arroz + feijão + salada","carne suína, arroz, feijão, folhas"],
  ["Terça","Crepioca de cottage","Carne moída com legumes + arroz + feijão","carne moída, legumes, arroz, feijão"],
  ["Quarta","Waffle de queijo","Frango gratinado com queijo + batata + salada","frango, queijo, batata, folhas"],
  ["Quinta","Panquecas","Almôndegas ao molho + arroz + legumes","carne moída, tomate, arroz, legumes"],
  ["Sexta","Pão frito","Rap10 de carne/frango + queijo + salada","Rap10, carne ou frango, queijo, folhas"],
  ["Sábado","Cuscuz","Lanche caseiro / hambúrguer / batata","carne moída, pão, batata, queijo"],
  ["Domingo","Panquecas","Coxa e sobrecoxa assada + arroz + feijão + farofa + salada","coxa/sobrecoxa, arroz, feijão, farinha, folhas"]
 ]},
 {id:4,title:"Semana 4",pico:"Morango com leite + doce de leite",meals:[
  ["Segunda","Crepioca","Coxa/sobrecoxa desfiada + arroz + legumes","frango, arroz, legumes"],
  ["Terça","Waffle de queijo","Bife acebolado + batata + salada","alcatra, cebola, batata, folhas"],
  ["Quarta","Pão frito","Ragu de carne + massa + salada","carne moída, tomate, massa, folhas"],
  ["Quinta","Panquecas","Frango desfiado + arroz de forno + salada","frango, arroz, queijo, folhas"],
  ["Sexta","Cuscuz + queijo","Pizza caseira / noite de lanche","massa, queijo, tomate"],
  ["Sábado","Waffle + café com leite","Porco desfiado + Rap10 + acompanhamentos","carne suína, Rap10, queijo, salada"],
  ["Domingo","Panquecas","Churrasco de fraldinha + arroz + farofa + vinagrete + salada","fraldinha, arroz, farinha, tomate, cebola, folhas"]
 ]}
];
const FOOD_PREP=["Cozinha quinzenal","Produzir proteínas e bases","Porcionar e etiquetar","Congelar o que tolera freezer","Deixar amanhã encaminhado"];
const FOOD_RECIPE_IDS={
 "Frango assado com batatas":"frango-assado","Strogonoff de frango":"strogonoff","Bife de alcatra acebolado":"alcatra","Ragu de carne":"ragu","Hambúrguer caseiro":"hamburguer","Carne de panela com músculo":"musculo","Carne de panela desfiada":"musculo","Panquecas salgadas de carne e queijo":"panquecas","Filé de frango grelhado":"frango-grelhado","Frango desfiado cremoso":"frango-desfiado","Frango desfiado cremoso para Rap10":"frango-desfiado","Risoto de frango/carne":"risoto","Porco assado":"porco","Carne moída com legumes":"carne-legumes","Frango gratinado com queijo":"frango-gratinado","Almôndegas ao molho":"almondegas","Coxa e sobrecoxa assada":"coxa-sobrecoxa","Coxa/sobrecoxa desfiada":"coxa-sobrecoxa","Arroz de forno":"arroz-forno","Porco desfiado":"porco-rap10","Porco desfiado + Rap10":"porco-rap10","Churrasco de fraldinha":"fraldinha","Crepioca":"crepioca","Crepioca de cottage":"crepioca","Cuscuz + queijo":"cuscuz","Picolé de morango cremoso":"pico-morango","Picolé de coco":"pico-coco","Picolé de maracujá cremoso":"pico-maracuja","Picolé de banana com canela":"pico-banana"
};
/* Ingredientes usados para gerar a lista. Quando a receita é oficial, os valores vêm do Livro de Receitas; acompanhamentos comuns entram como itens de apoio. */
const FOOD_ING={
 "frango-assado":[["Coxa/sobrecoxa ou filé de frango","800 g","Carnes"],["Batata","700 g","Hortifruti"],["Alho","3 dentes","Hortifruti"],["Cebola","1/2 un.","Hortifruti"],["Azeite","2 colheres (sopa)","Cozinha"],["Limão","1 un.","Hortifruti"]],
 "strogonoff":[["Frango","800 g","Carnes"],["Cebola","1 un. pequena","Hortifruti"],["Alho","2 dentes","Hortifruti"],["Manteiga ou azeite","1 colher (sopa)","Cozinha"],["Creme de leite","200 g","Laticínios"],["Molho de tomate","3–4 colheres (sopa)","Despensa"],["Mostarda","a gosto","Despensa"],["Batata palha","1 pacote","Despensa"]],
 "alcatra":[["Alcatra","700–800 g","Carnes"],["Cebola","1–2 un.","Hortifruti"],["Alho","2 dentes","Hortifruti"],["Azeite","1 colher (sopa)","Cozinha"],["Batata para purê","1 kg","Hortifruti"],["Brócolis","1 maço","Hortifruti"]],
 "ragu":[["Carne moída","800 g","Carnes"],["Molho de tomate","700–800 ml","Despensa"],["Cebola","1 un.","Hortifruti"],["Alho","3 dentes","Hortifruti"],["Azeite","1 colher (sopa)","Cozinha"],["Macarrão","400–500 g","Despensa"]],
 "hamburguer":[["Carne moída","1 kg","Carnes"],["Batata","1 kg","Hortifruti"],["Pão de hambúrguer","1 pacote","Padaria"],["Folhas para salada","1 maço","Hortifruti"],["Tomate","3–4 un.","Hortifruti"]],
 "musculo":[["Músculo","1,2 kg","Carnes"],["Cebola","2 un.","Hortifruti"],["Alho","4 dentes","Hortifruti"],["Tomate ou tomate pelado","2 un. ou 200 ml","Hortifruti/Despensa"],["Azeite","2 colheres (sopa)","Cozinha"],["Arroz","500 g","Despensa"],["Feijão","500 g","Despensa"],["Legumes variados","1 kg","Hortifruti"]],
 "panquecas":[["Carne moída","600 g","Carnes"],["Muçarela","200 g","Laticínios"],["Molho de tomate","400–500 ml","Despensa"],["Discos de panqueca","8 un.","Despensa"]],
 "frango-grelhado":[["Filé de frango","700–800 g","Carnes"],["Alho","2 dentes","Hortifruti"],["Azeite","1 colher (sopa)","Cozinha"],["Limão","1 un.","Hortifruti"],["Arroz","500 g","Despensa"],["Feijão","500 g","Despensa"],["Legumes variados","1 kg","Hortifruti"]],
 "frango-desfiado":[["Frango desfiado","500–600 g","Carnes"],["Cottage ou cream cheese","150 g","Laticínios"],["Cebola","1/2 un.","Hortifruti"],["Tomate ou molho","a gosto","Hortifruti/Despensa"],["Rap10","4–8 un.","Despensa"],["Folhas para salada","1 maço","Hortifruti"]],
 "risoto":[["Arroz para risoto","300 g","Despensa"],["Frango desfiado","300–400 g","Carnes"],["Cebola","1/2 un.","Hortifruti"],["Manteiga","1 colher (sopa)","Cozinha"],["Queijo","50–80 g","Laticínios"],["Folhas para salada","1 maço","Hortifruti"]],
 "porco":[["Carne suína","1,2–1,4 kg","Carnes"],["Alho","4 dentes","Hortifruti"],["Cebola","1 un.","Hortifruti"],["Azeite","2 colheres (sopa)","Cozinha"],["Limão","1 un.","Hortifruti"],["Arroz","500 g","Despensa"],["Feijão","500 g","Despensa"]],
 "carne-legumes":[["Carne moída","700 g","Carnes"],["Cenoura","1 un.","Hortifruti"],["Abobrinha","1 un. pequena","Hortifruti"],["Cebola","1/2 un.","Hortifruti"],["Alho","2 dentes","Hortifruti"],["Azeite","1 colher (sopa)","Cozinha"],["Arroz","500 g","Despensa"],["Feijão","500 g","Despensa"]],
 "frango-gratinado":[["Filé de frango","800 g","Carnes"],["Muçarela","200 g","Laticínios"],["Cottage/cream cheese ou molho leve","150–200 g","Laticínios"],["Alho","2 dentes","Hortifruti"],["Batata","1 kg","Hortifruti"],["Folhas para salada","1 maço","Hortifruti"]],
 "almondegas":[["Carne moída","700 g","Carnes"],["Molho de tomate","600–700 ml","Despensa"],["Cebola","1 un.","Hortifruti"],["Alho","2 dentes","Hortifruti"],["Arroz","500 g","Despensa"],["Legumes variados","1 kg","Hortifruti"]],
 "coxa-sobrecoxa":[["Coxa/sobrecoxa","1,5 kg","Carnes"],["Alho","3 dentes","Hortifruti"],["Cebola","1 un.","Hortifruti"],["Batata","700 g","Hortifruti"],["Arroz","500 g","Despensa"],["Feijão","500 g","Despensa"],["Farofa/farinha","250 g","Despensa"],["Folhas para salada","1 maço","Hortifruti"]],
 "arroz-forno":[["Frango desfiado","500–600 g","Carnes"],["Arroz cozido","500–600 g","Despensa"],["Muçarela","150 g","Laticínios"],["Milho/ervilha","1/2 xícara","Despensa"],["Cottage/cream cheese ou molho","150 g","Laticínios"]],
 "porco-rap10":[["Porco desfiado","400–500 g","Carnes"],["Rap10","6–8 un.","Despensa"],["Queijo","150 g","Laticínios"],["Folhas/vinagrete","a gosto","Hortifruti"]],
 "fraldinha":[["Fraldinha","1,0–1,2 kg","Carnes"],["Sal grosso/parrilla","a gosto","Despensa"],["Arroz","500 g","Despensa"],["Farofa/farinha","250 g","Despensa"],["Tomate","3–4 un.","Hortifruti"],["Cebola roxa","1 un.","Hortifruti"],["Folhas para salada","1 maço","Hortifruti"]],
 "crepioca":[["Ovos","1 un.","Café/receitas"],["Tapioca","2 colheres (sopa)","Despensa"],["Cottage","2 colheres (sopa)","Laticínios"]],
 "cuscuz":[["Flocão de milho","1/2 xícara por pessoa","Despensa"],["Queijo","a gosto","Laticínios"],["Manteiga","a gosto","Cozinha"]],
 "lagarto":[["Lagarto","1,0–1,2 kg","Carnes"],["Alho","3 dentes","Hortifruti"],["Cebola","1 un.","Hortifruti"],["Arroz","500 g","Despensa"],["Feijão","500 g","Despensa"],["Farofa/farinha","250 g","Despensa"],["Folhas para salada","1 maço","Hortifruti"]],
 "pizza":[["Massa para pizza","2–3 un.","Padaria"],["Muçarela","400–500 g","Laticínios"],["Molho de tomate","300–400 ml","Despensa"],["Tomate","3–4 un.","Hortifruti"]]
};
const FOOD_BREAKFAST_ING={
 "Pão frito + café com leite":[["Pão","1 pacote","Padaria"],["Manteiga","a gosto","Cozinha"],["Leite","500 ml","Laticínios"],["Café","a gosto","Café/receitas"]],
 "Pão frito":[["Pão","1 pacote","Padaria"],["Manteiga","a gosto","Cozinha"]],
 "Crepioca de cottage":[...FOOD_ING.crepioca],
 "Crepioca":[...FOOD_ING.crepioca],
 "Waffle de queijo":[["Ovos","a conferir na receita","Café/receitas"],["Muçarela","a conferir na receita","Laticínios"],["Farinha","a conferir na receita","Despensa"]],
 "Waffle + café com leite":[["Ovos","a conferir na receita","Café/receitas"],["Muçarela","a conferir na receita","Laticínios"],["Farinha","a conferir na receita","Despensa"],["Leite","500 ml","Laticínios"],["Café","a gosto","Café/receitas"]],
 "Panqueca":[["Ovos","a conferir na receita","Café/receitas"],["Farinha de trigo","a conferir na receita","Despensa"],["Leite","a conferir na receita","Laticínios"]],
 "Panquecas + café com leite":[["Ovos","a conferir na receita","Café/receitas"],["Farinha de trigo","a conferir na receita","Despensa"],["Leite","500 ml + receita","Laticínios"],["Café","a gosto","Café/receitas"]],
 "Cuscuz + queijo":[...FOOD_ING.cuscuz],
 "Cuscuz":[...FOOD_ING.cuscuz]
};
const FOOD_LUNCHBOX=[
 ["Segunda","sanduíche + maçã + biscoito + suco"],["Terça","pão de queijo + tangerina + biscoito + Chamyto"],["Quarta","sanduíche + banana + biscoito + Toddynho com menos açúcar"],["Quinta","pão de queijo + maçã + biscoito + iogurte"],["Sexta","Rap10/sanduíche + laranja + biscoito + suco"]
];
const FOOD_LUNCH_ING=[
 ["Pão/sanduíche","1 pacote","Lancheira"],["Pão de queijo","1 pacote","Lancheira"],["Rap10","1 pacote","Lancheira"],["Biscoitos variados","4–8 pacotes","Lancheira"],["Maçã","4–5 un.","Hortifruti"],["Banana","4–5 un.","Hortifruti"],["Tangerina","3–5 un.","Hortifruti"],["Laranja","3–5 un.","Hortifruti"],["Suco","2–3 unidades","Lancheira"],["Chamyto","1–2 unidades","Laticínios"],["Toddynho com menos açúcar","1–2 unidades","Lancheira"],["Iogurte","1–2 unidades","Laticínios"]
];
function foodDefaultMonth(){return {month:"2026-09",week:1,overrides:{},customMonths:{},shoppingDone:{},prepDone:[]};}
function loadFood(){
 try{
  const raw=JSON.parse(localStorage.getItem(FOOD_KEY));
  if(raw)return {...foodDefaultMonth(),...raw,overrides:raw.overrides||{},customMonths:raw.customMonths||{},shoppingDone:raw.shoppingDone||{},prepDone:raw.prepDone||[]};
 }catch{}
 return foodDefaultMonth();
}
function saveFood(d){localStorage.setItem(FOOD_KEY,JSON.stringify(d));}
function foodInternetUrl(query){return "https://www.google.com/search?q="+encodeURIComponent("receita "+query);}
function foodBaseMeal(week,day,type){
 const m=week.meals.find(x=>x[0]===day); if(!m)return {name:"",recipeId:"",ingredients:""};
 const name=type==="breakfast"?m[1]:m[2];
 const key=Object.keys(FOOD_RECIPE_IDS).find(k=>name===k || name.startsWith(k+" ") || name.includes(k));
 return {name,recipeId:key?FOOD_RECIPE_IDS[key]:"",ingredients:""};
}
function foodMeal(d,week,day,type){
 const ov=d.overrides?.[week.id]?.[day]?.[type];
 if(ov)return ov;
 return foodBaseMeal(week,day,type);
}
function foodAllMeals(d){
 const weekList=FOOD_WEEKS;
 const out=[];
 weekList.forEach(w=>FOOD_DAYS.forEach(day=>["breakfast","dinner"].forEach(type=>out.push(foodMeal(d,w,day,type)))));
 return out;
}
function foodAddIngredient(map,item){
 const [name,qty,cat]=item; const key=name.toLowerCase();
 if(!map[key])map[key]={name,qtys:[],cat:cat||"Outros"};
 if(qty && !map[key].qtys.includes(qty))map[key].qtys.push(qty);
}
function foodShoppingItems(d){
 const map={};
 const weeks=foodMonthWeeks(d);
 weeks.forEach(w=>FOOD_DAYS.forEach(day=>{
  ["breakfast","dinner"].forEach(type=>{
   const meal=foodMeal(d,w,day,type);
   if(meal.recipeId && FOOD_ING[meal.recipeId]) FOOD_ING[meal.recipeId].forEach(x=>foodAddIngredient(map,x));
   else if(type==="breakfast" && FOOD_BREAKFAST_ING[meal.name]) FOOD_BREAKFAST_ING[meal.name].forEach(x=>foodAddIngredient(map,x));
   else if(meal.ingredients) meal.ingredients.split(/[,;\n]+/).map(x=>x.trim()).filter(Boolean).forEach(x=>foodAddIngredient(map,[x,"quantidade a definir","Personalizados"]));
   else if(meal.name) foodAddIngredient(map,[meal.name,"conferir receita","A definir"]);
  });
 }));
 FOOD_LUNCH_ING.forEach(x=>foodAddIngredient(map,x));
 return Object.values(map).sort((a,b)=>a.cat.localeCompare(b.cat)||a.name.localeCompare(b.name));
}
function foodShoppingHash(items){return items.map(x=>x.name.toLowerCase()).join("|");}
function foodMonthLabel(id){return FOOD_MONTHS.find(m=>m.id===id)?.label||id;}
function foodMonthWeeks(d){
 if(d.month==="2026-09")return FOOD_WEEKS;
 const custom=d.customMonths?.[d.month];
 if(custom?.weeks)return custom.weeks;
 return [];
}
function foodMonthIsDefined(d){return d.month==="2026-09" || !!d.customMonths?.[d.month]?.weeks;}
function foodRecipeOptions(){
 return RECIPES.map(r=>`<option value="${r.id}">${escapeHtml(r.name)}</option>`).join("");
}
function openFoodMealEditor(weekId,day,type){
 const d=loadFood(); const sourceWeeks=foodMonthWeeks(d); const week=sourceWeeks.find(w=>w.id===weekId)||FOOD_WEEKS.find(w=>w.id===weekId)||FOOD_WEEKS[0]; const current=foodMeal(d,week,day,type);
 const dlg=document.createElement("dialog");
 dlg.innerHTML=`<form method="dialog" class="modal-card" id="foodMealForm"><div class="modal-head"><div><div class="eyebrow">🍽️ ${day.toUpperCase()}</div><h2>Alterar ${type==="breakfast"?"café da manhã":"jantar"}</h2></div><button class="icon-btn" value="cancel">×</button></div>
 <label>Escolher uma receita da casa<select id="foodRecipe"><option value="">— escolher —</option>${foodRecipeOptions()}</select></label>
 <label>Nome da refeição<input id="foodName" required maxlength="100" value="${escapeHtml(current.name)}" placeholder="Ex.: Frango com legumes"></label>
 <label>Se for uma opção nova, ingredientes para a lista de mercado<textarea id="foodIngredients" rows="4" placeholder="Ex.: 600 g frango, 2 tomates, 1 abobrinha">${escapeHtml(current.ingredients||"")}</textarea></label>
 <div class="food-modal-note">📖 Se você escolher uma receita do livro, o app usa os ingredientes cadastrados dela. Se criar uma opção nova, informe os ingredientes para que ela entre na lista de mercado.</div>
 <div class="modal-actions"><button type="button" class="secondary" id="foodCancel">Cancelar</button><button type="button" class="secondary" id="foodReset">Voltar ao cardápio-base</button><button class="primary" value="default">Salvar</button></div></form>`;
 document.body.appendChild(dlg); dlg.showModal();
 const sel=dlg.querySelector("#foodRecipe"); if(current.recipeId)sel.value=current.recipeId;
 sel.onchange=()=>{const r=RECIPES.find(x=>x.id===sel.value);if(r){dlg.querySelector("#foodName").value=r.name;dlg.querySelector("#foodIngredients").value="";}};
 dlg.querySelector("#foodCancel").onclick=()=>{dlg.close();dlg.remove()};
 dlg.querySelector("#foodReset").onclick=()=>{const x=loadFood();if(x.overrides?.[weekId]?.[day]?.[type])delete x.overrides[weekId][day][type];saveFood(x);dlg.close();dlg.remove();renderAlimentacao();};
 dlg.querySelector("#foodMealForm").addEventListener("submit",e=>{e.preventDefault();const x=loadFood();x.overrides=x.overrides||{};x.overrides[weekId]=x.overrides[weekId]||{};x.overrides[weekId][day]=x.overrides[weekId][day]||{};x.overrides[weekId][day][type]={name:dlg.querySelector("#foodName").value.trim(),recipeId:sel.value,ingredients:dlg.querySelector("#foodIngredients").value.trim()};saveFood(x);dlg.close();dlg.remove();renderAlimentacao();});
}
function openFoodMonthCreator(monthId){
 const d=loadFood(); const prev=FOOD_MONTHS[FOOD_MONTHS.findIndex(m=>m.id===monthId)-1];
 const dlg=document.createElement("dialog");
 dlg.innerHTML=`<form method="dialog" class="modal-card" id="foodMonthForm"><div class="modal-head"><div><div class="eyebrow">🗓️ ${foodMonthLabel(monthId).toUpperCase()}</div><h2>Definir cardápio</h2></div><button class="icon-btn" value="cancel">×</button></div>
 <p>Este mês ainda não tem um cardápio definido. Você pode deixá-lo em aberto ou criar uma cópia do mês anterior para editar refeição por refeição.</p>
 <div class="modal-actions"><button type="button" class="secondary" id="foodMonthCancel">Cancelar</button><button type="button" class="primary" id="foodCopyMonth">Copiar mês anterior</button></div></form>`;
 document.body.appendChild(dlg);dlg.showModal();
 dlg.querySelector("#foodMonthCancel").onclick=()=>{dlg.close();dlg.remove()};
 dlg.querySelector("#foodCopyMonth").onclick=()=>{
  if(monthId!=="2026-09"){
   const source=monthId==="2026-10"?FOOD_WEEKS:((d.customMonths?.["2026-10"]?.weeks)||FOOD_WEEKS);
   d.customMonths=d.customMonths||{};d.customMonths[monthId]={weeks:JSON.parse(JSON.stringify(source))};d.month=monthId;d.week=1;saveFood(d);dlg.close();dlg.remove();renderAlimentacao();
  }
 };
}
function renderFoodShopping(d){
 const items=foodShoppingItems(d),done=d.shoppingDone||{},hash=foodShoppingHash(items);
 return `<div class="food-shopping-head"><div><span class="eyebrow">AUTOMÁTICA</span><strong>Lista gerada pelo cardápio</strong><p>Se você alterar uma refeição, a lista é recalculada.</p></div><span class="food-count">${items.filter(x=>done[x.name]).length}/${items.length}</span></div><div class="food-shopping-list">${items.map((x,i)=>{const checked=!!done[x.name];return `<label class="food-shop-item ${checked?'done':''}"><input type="checkbox" data-food-shopping-item="${escapeHtml(x.name)}" ${checked?'checked':''}><span><b>${escapeHtml(x.name)}</b><small>${escapeHtml(x.qtys.join(" + "))} · ${escapeHtml(x.cat)}</small></span></label>`}).join("")}</div><div class="food-shopping-foot">💡 A lista é uma estimativa baseada nas receitas cadastradas e no cardápio do mês. Confira o estoque antes de comprar.</div>`;
}
function renderAlimentacao(){
 const d=loadFood();
 const month=foodMonthLabel(d.month),defined=foodMonthIsDefined(d);
 const weeks=foodMonthWeeks(d); const week=weeks.find(w=>w.id===Number(d.week))||weeks[0];
 const today=FOOD_DAYS[(new Date().getDay()+6)%7];
 const todayMeal=week?.meals?.find(m=>m[0]===today);
 const prepDone=new Set(d.prepDone||[]);
 const todayHtml=defined&&todayMeal?`<div class="food-today"><span class="eyebrow">🍽️ HOJE · ${today.toUpperCase()}</span><strong>${escapeHtml(foodMeal(d,week,today,"dinner").name)}</strong><small>${escapeHtml(foodMeal(d,week,today,"dinner").ingredients||todayMeal[3])}</small><div class="food-link-row"><a class="food-link pink" href="#receitas">📖 Minhas receitas</a><a class="food-link blue" target="_blank" rel="noopener" href="${foodInternetUrl(foodMeal(d,week,today,"dinner").name)}">🔎 Mais opções na internet</a></div></div>`:`<div class="food-today"><strong>Esse mês ainda está em construção.</strong><small>Defina o cardápio quando quiser; a lista de mercado será criada a partir dele.</small></div>`;
 const monthTabs=FOOD_MONTHS.map(m=>`<button class="food-month-tab ${m.id===d.month?'active':''}" data-food-month="${m.id}">${m.label}</button>`).join("");
 const weekTabs=defined?weeks.map(w=>`<button class="food-week-tab ${w.id===week?.id?'active':''}" data-food-week="${w.id}">${w.title}</button>`).join(""):"";
 const menuHtml=defined&&week?`<div class="food-menu-grid">${week.meals.map((m,i)=>{const b=foodMeal(d,week,m[0],"breakfast"),dn=foodMeal(d,week,m[0],"dinner");return `<article class="food-meal-card food-tone-${i%6} ${m[0]===today?'today':''}"><div class="food-meal-head"><span>${m[0]}</span>${m[0]===today?'<b>HOJE</b>':''}</div><div class="food-meal-line"><small>☀️ ${escapeHtml(b.name)}</small><button class="food-edit" data-food-edit="${week.id}|${m[0]}|breakfast">Alterar</button></div><div class="food-meal-line"><strong>🌙 ${escapeHtml(dn.name)}</strong><button class="food-edit" data-food-edit="${week.id}|${m[0]}|dinner">Alterar</button></div><em>${escapeHtml(dn.ingredients||m[3])}</em><div class="food-meal-actions"><a href="#receitas">📖 Minhas receitas</a><a target="_blank" rel="noopener" href="${foodInternetUrl(dn.name)}">🔎 Outras receitas</a></div></article>`}).join("")}</div>`:`<div class="food-empty-month card"><div class="food-empty-icon">🗓️</div><strong>${month} ainda não tem cardápio definido</strong><p>O sistema já está pronto até dezembro. Quando o cardápio do mês for definido, a lista de mercado passa a nascer dele automaticamente.</p><button class="primary" id="foodDefineMonth">＋ Definir este mês</button></div>`;
 app.innerHTML=`
 <section class="hero food-hero"><div class="eyebrow">🍽️ MINHA VIDA · ${month.toUpperCase()}</div><h2>Alimentação</h2><p>Cardápio → receitas → preparo → lista de mercado. Tudo se ajusta quando você muda uma refeição.</p></section>
 <div class="food-month-tabs">${monthTabs}</div>
 ${todayHtml}
 ${defined?`<div class="food-week-tabs">${weekTabs}</div>`:""}
 ${defined?`<div class="section-title">${week.title.toUpperCase()} · CARDÁPIO</div>`:""}
 ${menuHtml}
 ${defined?`<div class="food-control-row"><a class="food-big-link pink" href="#receitas">📖 Minhas receitas</a><button class="food-big-link blue" id="foodMarketJump">🛒 Lista de mercado</button></div>`:""}
 ${defined?`<div class="section-title">🛒 LISTA DE MERCADO</div><div class="card food-shopping-card" id="foodShoppingCard">${renderFoodShopping(d)}</div>`:""}
 ${defined?`<div class="section-title">🎒 LANCHEIRA DO HENRIQUE</div><div class="card food-lunchbox"><p><strong>Base:</strong> 1 salgado + 1 crocante + 1 fruta + 1 bebida.</p>${FOOD_LUNCHBOX.map(x=>`<div>${x[0]} · ${x[1]}</div>`).join("")}</div>`:""}
 ${defined?`<div class="section-title">🧊 COZINHA QUINZENAL</div><div class="card food-checklist">${FOOD_PREP.map((x,i)=>`<label class="food-check-row ${prepDone.has(String(i))?'done':''}"><input type="checkbox" data-food-prep="${i}" ${prepDone.has(String(i))?'checked':''}><span>${x}</span></label>`).join("")}<div class="food-rule"><b>Quinzena 1</b><span>Abastecer Semanas 1 e 2 com proteínas, arroz, feijão e bases.</span></div><div class="food-rule"><b>Quinzena 2</b><span>Abastecer Semanas 3 e 4, renovar coringas e deixar compras ajustadas.</span></div></div>`:""}
 <div class="card food-note"><span class="eyebrow">⚙️ COMO FUNCIONA</span><p><strong>Você muda o cardápio → o app muda a lista.</strong> Receitas da casa usam os ingredientes cadastrados do livro; uma receita nova entra na lista quando você informar seus ingredientes.</p></div>`;
 document.querySelectorAll("[data-food-month]").forEach(b=>b.onclick=()=>{const x=loadFood();x.month=b.dataset.foodMonth;x.week=1;saveFood(x);renderAlimentacao();});
 document.querySelectorAll("[data-food-week]").forEach(b=>b.onclick=()=>{const x=loadFood();x.week=Number(b.dataset.foodWeek);saveFood(x);renderAlimentacao();});
 document.querySelectorAll("[data-food-edit]").forEach(b=>b.onclick=()=>{const [wid,day,type]=b.dataset.foodEdit.split("|");openFoodMealEditor(Number(wid),day,type);});
 document.querySelectorAll("[data-food-prep]").forEach(el=>el.onchange=()=>{const x=loadFood();const a=new Set(x.prepDone||[]);el.checked?a.add(el.dataset.foodPrep):a.delete(el.dataset.foodPrep);x.prepDone=[...a];saveFood(x);renderAlimentacao();});
 document.querySelectorAll("[data-food-shopping-item]").forEach(el=>el.onchange=()=>{const x=loadFood();x.shoppingDone=x.shoppingDone||{};el.checked?x.shoppingDone[el.dataset.foodShoppingItem]=true:delete x.shoppingDone[el.dataset.foodShoppingItem];saveFood(x);renderAlimentacao();});
 document.querySelector("#foodDefineMonth")?.addEventListener("click",()=>openFoodMonthCreator(d.month));
 document.querySelector("#foodMarketJump")?.addEventListener("click",()=>document.querySelector("#foodShoppingCard")?.scrollIntoView({behavior:"smooth",block:"start"}));
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

// =====================================================
// 💇‍♀️ COMO FAZER • RITUAL CAPILAR
// Fonte: cronograma capilar Scriptable • 31/08/2026–14/10/2026
// =====================================================
const HAIR_START = new Date(2026,7,31);
const HAIR_END = new Date(2026,9,14);
const HAIR_KEY = "minha-vida.cabelo.v1";
const HAIR_WASH = {
"31/08":{shampoo:"t:r S10 Colors Even More — Grayish-Brown Color Protective Shampoo",s10:"30–60 s de massagem • SEM PAUSA",tratamento:"REPARAÇÃO\nKerasys Propolis Hair Bonding Pro Repair Treatment",condicionador:"Mise en Scène Perfect Serum Styling Conditioner",serum:"Mise en Scène Perfect Serum Original"},
"02/09":{shampoo:"Elseve Cachos Longos dos Sonhos Shampoo Nutri-Preenchedor",tratamento:"HIDRATAÇÃO\nMáscara Hidra + Reconstrução",condicionador:"Elseve Cachos Longos dos Sonhos Condicionador Selador",serum:"Mise en Scène Perfect Serum Hydrating"},
"04/09":{shampoo:"Mise en Scène Perfect Serum Styling Shampoo",tratamento:"NUTRIÇÃO\nPré-shampoo: óleo de semente de uva (20–30 min) → lavagem",condicionador:"Mise en Scène Perfect Serum Styling Conditioner",serum:"Mise en Scène Perfect Serum Original"},
"06/09":{shampoo:"Elseve Cachos Longos dos Sonhos Shampoo Nutri-Preenchedor",tratamento:"REPARAÇÃO\nKerasys Propolis Hair Bonding Pro Repair Treatment",condicionador:"Elseve Cachos Longos dos Sonhos Condicionador Selador",serum:"Mise en Scène Perfect Serum Styling"},
"08/09":{shampoo:"t:r S10 Colors Even More — Grayish-Brown Color Protective Shampoo",s10:"30–60 s de massagem • SEM PAUSA",tratamento:"HIDRATAÇÃO\nMáscara Hidra + Reconstrução",condicionador:"Mise en Scène Perfect Serum Styling Conditioner",serum:"Mise en Scène Perfect Serum Hydrating"},
"10/09":{shampoo:"Elseve Cachos Longos dos Sonhos Shampoo Nutri-Preenchedor",tratamento:"ACIDIFICAÇÃO\nLola Tannic Acid Acidificante — 5 min, comprimento e pontas",condicionador:"Elseve Cachos Longos dos Sonhos Condicionador Selador",serum:"Mise en Scène Perfect Serum Original"},
"12/09":{shampoo:"Mise en Scène Perfect Serum Styling Shampoo",tratamento:"NUTRIÇÃO\nPré-shampoo: óleo de coco ou semente de uva (20–30 min)",condicionador:"Mise en Scène Perfect Serum Styling Conditioner",serum:"Mise en Scène Perfect Serum Hydrating"},
"14/09":{shampoo:"Elseve Cachos Longos dos Sonhos Shampoo Nutri-Preenchedor",tratamento:"PÓS-COR\nLavagem suave + condicionador; sem máscara pesada",condicionador:"Mise en Scène Perfect Serum Styling Conditioner",serum:"Mise en Scène Perfect Serum Original"},
"16/09":{shampoo:"Mise en Scène Perfect Serum Styling Shampoo",tratamento:"HIDRATAÇÃO\nMáscara Hidra + Reconstrução",condicionador:"Mise en Scène Perfect Serum Styling Conditioner",serum:"Mise en Scène Perfect Serum Hydrating"},
"18/09":{shampoo:"Elseve Cachos Longos dos Sonhos Shampoo Nutri-Preenchedor",tratamento:"REPARAÇÃO\nKerasys Propolis Hair Bonding Pro Repair Treatment",condicionador:"Elseve Cachos Longos dos Sonhos Condicionador Selador",serum:"Mise en Scène Perfect Serum Styling"},
"20/09":{shampoo:"Mise en Scène Perfect Serum Styling Shampoo",tratamento:"NUTRIÇÃO\nPré-shampoo: óleo de semente de uva (20–30 min)",condicionador:"Mise en Scène Perfect Serum Styling Conditioner",serum:"Mise en Scène Perfect Serum Original"},
"22/09":{shampoo:"Elseve Cachos Longos dos Sonhos Shampoo Nutri-Preenchedor",tratamento:"ACIDIFICAÇÃO\nLola Tannic Acid Acidificante — 5 min",condicionador:"Elseve Cachos Longos dos Sonhos Condicionador Selador",serum:"Mise en Scène Perfect Serum Hydrating"},
"24/09":{shampoo:"t:r S10 Colors Even More — Grayish-Brown Color Protective Shampoo",s10:"30–60 s de massagem • SEM PAUSA",tratamento:"HIDRATAÇÃO\nMáscara Hidra + Reconstrução",condicionador:"Mise en Scène Perfect Serum Styling Conditioner",serum:"Mise en Scène Perfect Serum Styling"},
"26/09":{shampoo:"Elseve Cachos Longos dos Sonhos Shampoo Nutri-Preenchedor",tratamento:"REPARAÇÃO\nKerasys Propolis Hair Bonding Pro Repair Treatment",condicionador:"Elseve Cachos Longos dos Sonhos Condicionador Selador",serum:"Mise en Scène Perfect Serum Original"},
"28/09":{shampoo:"Mise en Scène Perfect Serum Styling Shampoo",tratamento:"NUTRIÇÃO\nPré-shampoo: óleo de girassol ou semente de uva (20–30 min)",condicionador:"Mise en Scène Perfect Serum Styling Conditioner",serum:"Mise en Scène Perfect Serum Hydrating"},
"30/09":{shampoo:"Elseve Cachos Longos dos Sonhos Shampoo Nutri-Preenchedor",tratamento:"HIDRATAÇÃO\nMáscara Hidra + Reconstrução",condicionador:"Elseve Cachos Longos dos Sonhos Condicionador Selador",serum:"Mise en Scène Perfect Serum Styling"},
"02/10":{shampoo:"Mise en Scène Perfect Serum Styling Shampoo",tratamento:"REPARAÇÃO\nKerasys Propolis Hair Bonding Pro Repair Treatment",condicionador:"Mise en Scène Perfect Serum Styling Conditioner",serum:"Mise en Scène Perfect Serum Original"},
"04/10":{shampoo:"Elseve Cachos Longos dos Sonhos Shampoo Nutri-Preenchedor",tratamento:"ACIDIFICAÇÃO\nLola Tannic Acid Acidificante — 5 min",condicionador:"Elseve Cachos Longos dos Sonhos Condicionador Selador",serum:"Mise en Scène Perfect Serum Hydrating"},
"06/10":{shampoo:"Mise en Scène Perfect Serum Styling Shampoo",tratamento:"NUTRIÇÃO\nPré-shampoo: óleo de semente de uva (20–30 min)",condicionador:"Mise en Scène Perfect Serum Styling Conditioner",serum:"Mise en Scène Perfect Serum Original"},
"08/10":{shampoo:"Elseve Cachos Longos dos Sonhos Shampoo Nutri-Preenchedor",tratamento:"HIDRATAÇÃO\nMáscara Hidra + Reconstrução",condicionador:"Elseve Cachos Longos dos Sonhos Condicionador Selador",serum:"Mise en Scène Perfect Serum Hydrating"},
"10/10":{shampoo:"t:r S10 Colors Even More — Grayish-Brown Color Protective Shampoo",s10:"30–60 s de massagem • SEM PAUSA",tratamento:"REPARAÇÃO\nKerasys Propolis Hair Bonding Pro Repair Treatment",condicionador:"Mise en Scène Perfect Serum Styling Conditioner",serum:"Mise en Scène Perfect Serum Styling"},
"12/10":{shampoo:"Elseve Cachos Longos dos Sonhos Shampoo Nutri-Preenchedor",tratamento:"ACIDIFICAÇÃO\nLola Tannic Acid Acidificante — 5 min",condicionador:"Elseve Cachos Longos dos Sonhos Condicionador Selador",serum:"Mise en Scène Perfect Serum Original"},
"14/10":{shampoo:"Mise en Scène Perfect Serum Styling Shampoo",tratamento:"HIDRATAÇÃO\nMáscara Hidra + Reconstrução",condicionador:"Mise en Scène Perfect Serum Styling Conditioner",serum:"Mise en Scène Perfect Serum Hydrating"}
};
function hairLoad(){try{return JSON.parse(localStorage.getItem(HAIR_KEY))||{done:{}}}catch{return{done:{}}}}
function hairSave(x){localStorage.setItem(HAIR_KEY,JSON.stringify(x))}
function hairDateKey(d){return String(d.getDate()).padStart(2,"0")+"/"+String(d.getMonth()+1).padStart(2,"0")}
function hairDateBR(d){return String(d.getDate()).padStart(2,"0")+"/"+String(d.getMonth()+1).padStart(2,"0")+"/"+d.getFullYear()}
function hairDayNumber(d){return Math.floor((d-HAIR_START)/86400000)+1}
function hairDay(d){let x=new Date(d);x.setHours(0,0,0,0);return x}
function hairFinalizacao(){return "Phyto Manga → Lola Plot Twist Guava Mousse → Griffus Amo Cachos Gelatina Dia Seguinte"}
function hairDayAfter(){return `💦 Umedecer mãos/áreas necessárias.\n✨ Lola Plot Twist Guava Misturinha OU Griffus Amo Cachos Gelatina Dia Seguinte.\nAmassar de baixo para cima.\n\n🪞 Se houver frizz em cabelo seco:\n1 gota de Mise en Scène Perfect Serum Original ou Elseve Óleo Extraordinário nas pontas.\n\n🌙 NOITE: preservar o cabelo; sem lavagem.`}
function hairColoring(){return `🎨 COLORAÇÃO • 🌙 NOITE\n\nImédia L'Oréal 6.1 — somente raiz/brancos.\nNão puxar a permanente para o comprimento.\n\n🧴 Após enxaguar: seguir o passo a passo da caixa.\nNão fazer máscara/reconstrução neste momento.\n\n🌙 Após a coloração: deixar o cabelo em repouso.\n➡️ Próxima lavagem: 14/09 de manhã.`}
function hairTodayData(){
 const now=hairDay(new Date());
 if(now<HAIR_START)return {kind:"before",date:now};
 if(now>HAIR_END)return {kind:"done",date:now};
 const key=hairDateKey(now),r=HAIR_WASH[key];
 if(r)return {kind:"wash",date:now,key,r};
 if(key==="13/09")return {kind:"color",date:now,key};
 return {kind:"dayafter",date:now,key};
}
function hairStepRows(info){
 if(info.kind==="wash"){
  const r=info.r, rows=["🚿 LAVAGEM • ☀️ MANHÃ","🧴 "+r.shampoo];
  if(r.s10)rows.push("⏱️ "+r.s10);
  rows.push("🧖🏼‍♀️ "+r.tratamento,"🧴 Cond.: "+r.condicionador,"💇🏼‍♀️ FINALIZAÇÃO • "+hairFinalizacao(),"✨ Sérum: "+r.serum,"🌙 NOITE: não lavar; preservar a definição."); return rows;
 }
 if(info.kind==="color")return hairColoring().split("\n");
 if(info.kind==="before")return ["🌙 DIA 0 — 30/08/2026","NÃO LAVAR","✨ Preservar os cachos.","🌙 À noite: proteger o cabelo para dormir.","🫧 O cronograma oficial começa amanhã."];
 if(info.kind==="done")return ["🌙 CRONOGRAMA FINALIZADO","Os 45 dias foram concluídos."];
 return ["☀️ MANHÃ • DAY AFTER",...hairDayAfter().split("\n")];
}
function hairTypeLabel(k){return k==="wash"?"Lavagem":k==="color"?"Coloração":k==="dayafter"?"Day after":k==="before"?"Antes do início":"Finalizado"}
function renderCabelo(){
 const info=hairTodayData(), steps=hairStepRows(info), done=hairLoad().done||{};
 const todayKey=info.key||hairDateKey(info.date);
 const nextWash=Object.entries(HAIR_WASH).filter(([k])=>{
   const [dd,mm]=k.split("/").map(Number);
   const y=mm<8?2027:2026;
   return new Date(y,mm-1,dd)>=hairDay(new Date());
 }).slice(0,5);
 const doneToday=!!done[todayKey];
 app.innerHTML=`<section class="hair-hero"><div class="backline"><button class="back-inline" id="hairBack">‹ Rituais</button></div><div class="eyebrow">💇‍♀️ COMO FAZER</div><h2>Ritual Capilar</h2><p>Seu cronograma de 45 dias, transformado em um caminho simples dentro do MINHA VIDA.</p></section>
 <section class="hair-today"><div class="hair-kicker">HOJE • ${hairDateBR(info.date)} • DIA ${Math.max(1,Math.min(45,hairDayNumber(info.date)))}/45</div><div class="hair-title">${hairTypeLabel(info.kind)}</div><div class="hair-steps">${steps.map((x,i)=>`<div class="hair-step"><span>${i+1}</span><div>${escapeHtml(x).replace(/\n/g,"<br>")}</div></div>`).join("")}</div><button class="hair-complete" id="hairComplete">${doneToday?"✓ Feito hoje":"Marcar como feito"}</button></section>
 <section class="hair-section"><div class="section-head"><h2>Seu caminho</h2><span class="soft-count">45 dias</span></div><div class="hair-links"><button data-hair-view="cronograma">📅 Ver cronograma</button><button data-hair-view="dayafter">✨ Como fazer o day after</button><button data-hair-view="night">🌙 Como preservar à noite</button></div></section>
 <section class="hair-section"><div class="section-head"><h2>Próximas lavagens</h2></div><div class="hair-list">${nextWash.map(([k,r])=>`<button class="hair-list-item" data-hair-date="${k}"><strong>${k}</strong><span>${escapeHtml(r.tratamento.split("\n")[0])}</span><small>${escapeHtml(r.shampoo)}</small></button>`).join("")||`<div class="empty compact"><strong>Nenhuma lavagem futura no cronograma.</strong></div>`}</div></section>`;
 document.querySelector("#hairBack").onclick=()=>{location.hash="rituais";renderRituais()};
 document.querySelector("#hairComplete").onclick=()=>{const x=hairLoad();x.done=x.done||{};x.done[todayKey]=!x.done[todayKey];hairSave(x);renderCabelo()};
 document.querySelectorAll("[data-hair-view]").forEach(b=>b.onclick=()=>openHairInfo(b.dataset.hairView));
 document.querySelectorAll("[data-hair-date]").forEach(b=>b.onclick=()=>openHairWash(b.dataset.hairDate));
}
function openHairInfo(type){
 let title="",body="";
 if(type==="dayafter"){title="✨ Como fazer o day after";body=hairDayAfter();}
 else if(type==="night"){title="🌙 Como preservar à noite";body="Não lavar. Preservar a definição e proteger o cabelo para dormir. Na manhã seguinte, seguir o COMO do day after quando necessário.";}
 else {title="📅 Cronograma de 45 dias";body=Object.entries(HAIR_WASH).map(([k,r])=>`${k} • ${r.tratamento.split("\\n")[0]}`).join("\n")+"\n\n13/09 • COLORAÇÃO — Imédia L'Oréal 6.1, somente raiz/brancos.";}
 openHairDialog(title,body);
}
function openHairWash(key){const r=HAIR_WASH[key];if(!r)return;openHairDialog("🚿 Lavagem • "+key,`☀️ MANHÃ\n\n🧴 ${r.shampoo}${r.s10?"\n⏱️ "+r.s10:""}\n\n🧖🏼‍♀️ ${r.tratamento}\n\n🧴 Cond.: ${r.condicionador}\n\n💇🏼‍♀️ FINALIZAÇÃO\n${hairFinalizacao()}\n\n✨ Sérum: ${r.serum}\n\n🌙 NOITE: não lavar; preservar a definição.`)}
function openHairDialog(title,body){const d=document.createElement("dialog");d.className="hair-dialog";d.innerHTML=`<div class="hair-dialog-inner"><div class="eyebrow">COMO FAZER</div><h3>${escapeHtml(title)}</h3><div class="hair-dialog-body">${escapeHtml(body).replace(/\n/g,"<br>")}</div><button class="primary" id="closeHair">Fechar</button></div>`;document.body.appendChild(d);d.querySelector("#closeHair").onclick=()=>{d.close();d.remove()};d.addEventListener("click",e=>{if(e.target===d){d.close();d.remove()}});d.showModal();}

function renderPlaceholder() {
  const data = {
    ideias: ["💡", "Criação & Ideias", "Este espaço vem em seguida. A ideia é registrar sem transformar tudo em obrigação."],
    rituais: ["✨", "Rituais", "Seu espaço para rotinas conscientes. O Ritual Capilar já pode ser acessado pelo caminho COMO FAZER."]
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

document.querySelector("#homeBtn").onclick = () => {
  state.route="meu-dia";
  state.filter="abertas";
  state.search="";
  location.hash = "meu-dia";
  render();
};

document.querySelector("#backBtn").onclick = () => {
  state.route="meu-dia";
  location.hash = "meu-dia";
  render();
};

document.querySelectorAll(".nav-item").forEach(b => {
  b.onclick = () => {
    state.route=b.dataset.route;
    location.hash = state.route;
    render();
  };
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () =>
    navigator.serviceWorker.register("sw.js").catch(console.warn)
  );
}

render();
