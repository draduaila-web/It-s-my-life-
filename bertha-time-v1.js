/* BERTH.A — Meu Dia v2 / Motor de Tempo v1.1 — identidade
   Camada aditiva: carregar DEPOIS de app.js, finance-v6.js e work-v12.js.
   Preserva chaves/rotas legadas para evitar perda de dados.
*/
(() => {
  const ENGINE_KEY = 'bertha.time-engine.v1';
  const IDEAL_KEY = 'bertha.ideal-day.v1';
  const esc = (s='') => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const read = (k, fallback=[]) => { try { const v=JSON.parse(localStorage.getItem(k)); return v ?? fallback; } catch { return fallback; } };
  const write = (k,v) => localStorage.setItem(k,JSON.stringify(v));
  const iso = (d=new Date()) => { const x=new Date(d.getTime()-d.getTimezoneOffset()*60000); return x.toISOString().slice(0,10); };
  const minsNow = () => { const d=new Date(); return d.getHours()*60+d.getMinutes(); };
  const hhmm = (ts) => new Date(ts).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
  const durationText = m => m>=60 ? (m%60 ? `${Math.floor(m/60)}h${String(m%60).padStart(2,'0')}` : `${m/60}h`) : `${m} min`;
  const parseMinutes = v => { if(typeof v==='number') return v; const s=String(v||''); const h=(s.match(/(\d+)\s*h/)||[])[1]; const m=(s.match(/(\d+)\s*min/)||[])[1]; return (+(h||0)*60)+ +(m||0) || 30; };
  const engine = () => read(ENGINE_KEY,{active:null,history:[],snoozed:{}});
  const saveEngine = x => write(ENGINE_KEY,x);

  function sourcesToday(){
    const today=iso(), out=[];
    const push=(x)=>{ if(x && x.title) out.push(x); };
    // Tarefas (rota/chave interna legada: pendencias)
    read('minha-vida.pendencias.v1',[]).forEach(x=>{
      if(x.done||x.completed) return;
      const date=x.dueDate||x.due||'';
      if(date && date>today) return;
      push({id:`task:${x.id}`,source:'Tarefas',title:x.title||x.name||'Tarefa',date,minutes:parseMinutes(x.minutes||x.duration||x.estimate||30),time:x.time||'',priority:x.priority||'Normal',kind:'task'});
    });
    // Trabalho — BEC e TikTok já usam tarefas com duração/data.
    [['minha-vida.trabalho.bec.v1','BEC'],['minha-vida.trabalho.tiktok.v1','TikTok']].forEach(([key,label])=>{
      read(key,[]).forEach(x=>{ if(x.status==='Concluído'||(x.date&&x.date!==today)) return; push({id:`${key}:${x.id}`,source:label,title:x.title||'Tarefa',date:x.date||today,minutes:+x.minutes||parseMinutes(x.duration),time:x.time||'',priority:x.priority||'Normal',kind:'work'}); });
    });
    // CREFITO — itens datados em aberto.
    read('minha-vida.trabalho.crefito.v1',[]).forEach(x=>{ if(x.status==='Concluído'||(x.date&&x.date!==today)) return; push({id:`crefito:${x.id}`,source:'CREFITO-11',title:x.title||'Trabalho',date:x.date||today,minutes:+x.minutes||30,time:x.time||'',priority:x.priority||'Normal',kind:'work'}); });
    // Exercícios — rotina é janela, nunca horário rígido.
    const ex=read('minha-vida.exercicios.v1',null); const dow=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][new Date().getDay()];
    if(ex && Array.isArray(ex.plans)) ex.plans.filter(p=>p.active!==false && (!p.days?.length||p.days.includes(dow))).forEach(p=>push({id:`exercise:${p.id}`,source:'Exercícios',title:p.name||'Movimento',date:today,minutes:parseMinutes(p.target),windowStart:'05:16',windowEnd:'07:35',kind:'window'}));
    // Meu Dia Ideal — sugestões, não obrigações.
    read(IDEAL_KEY,[]).filter(x=>x.active!==false).forEach(x=>push({id:`ideal:${x.id}`,source:'Meu Dia Ideal',title:x.title,minutes:+x.minutes||30,period:x.period||'flex',kind:'ideal',notify:!!x.notify}));
    return out;
  }

  function timeToM(t){ if(!t||!/\d\d:\d\d/.test(t)) return null; const [h,m]=t.split(':').map(Number); return h*60+m; }
  function isEligible(x){
    const e=engine(), snooze=e.snoozed?.[x.id]; if(snooze && Date.now()<snooze) return false;
    const m=minsNow();
    if(x.time){ const t=timeToM(x.time); if(t!==null && m<t) return false; }
    if(x.windowStart&&x.windowEnd){ const a=timeToM(x.windowStart),b=timeToM(x.windowEnd); return m>=a&&m<=b; }
    if(x.period==='morning') return m>=316&&m<735;
    if(x.period==='afternoon') return m>=720&&m<1140;
    if(x.period==='night') return m>=1140;
    return true;
  }
  function doneToday(id){ return engine().history.some(h=>h.itemId===id && h.day===iso() && h.status==='done'); }
  function candidates(){ return sourcesToday().filter(x=>!doneToday(x.id)).filter(isEligible); }
  function protectedBlock(){ const m=minsNow(); if(m>=316&&m<455) return {label:'Manhã protegida',range:'05:16–07:35'}; if(m>=1140) return {label:'Noite protegida',range:'19:00+'}; return null; }
  function currentSuggestion(){
    const e=engine(); if(e.active) return {active:e.active};
    const list=candidates();
    const fixed=list.filter(x=>x.time).sort((a,b)=>timeToM(a.time)-timeToM(b.time));
    if(fixed.length) return {item:fixed[0]};
    const work=list.find(x=>x.kind==='work'); if(work) return {item:work};
    const task=list.find(x=>x.kind==='task'); if(task) return {item:task};
    const window=list.find(x=>x.kind==='window'); if(window) return {item:window};
    const ideal=list.find(x=>x.kind==='ideal'); if(ideal) return {item:ideal};
    return {free:true};
  }

  function startItem(item){
    const e=engine();
    if(e.active){ conflictDialog(item); return; }
    e.active={...item,startedAt:Date.now(),plannedMinutes:+item.minutes||30}; saveEngine(e); rerender();
  }
  function finishActive(){ const e=engine(); if(!e.active)return; const end=Date.now(), real=Math.max(1,Math.round((end-e.active.startedAt)/60000)); e.history.unshift({itemId:e.active.id,title:e.active.title,source:e.active.source,day:iso(),startedAt:e.active.startedAt,endedAt:end,plannedMinutes:e.active.plannedMinutes,realMinutes:real,status:'done'}); e.active=null; saveEngine(e); rerender(); }
  function pauseActive(next){ const e=engine(); if(e.active){ const end=Date.now(); e.history.unshift({itemId:e.active.id,title:e.active.title,source:e.active.source,day:iso(),startedAt:e.active.startedAt,endedAt:end,plannedMinutes:e.active.plannedMinutes,realMinutes:Math.max(1,Math.round((end-e.active.startedAt)/60000)),status:'paused'}); e.active=null; saveEngine(e); } startItem(next); }
  function snoozeItem(item,minutes){ const e=engine(); e.snoozed=e.snoozed||{}; e.snoozed[item.id]=Date.now()+minutes*60000; saveEngine(e); rerender(); }

  function dialogBase(title,body){ const d=document.createElement('dialog'); d.className='bertha-dialog'; d.innerHTML=`<div class="bertha-modal"><div class="bertha-modal-head"><strong>${esc(title)}</strong><button data-close>×</button></div>${body}</div>`; document.body.appendChild(d); d.querySelector('[data-close]').onclick=()=>{d.close();d.remove()}; d.addEventListener('cancel',e=>{e.preventDefault();d.close();d.remove()}); d.addEventListener('click',e=>{if(e.target===d){d.close();d.remove()}}); d.showModal(); return d; }
  function postponeDialog(item){ const d=dialogBase('Adiar esta tarefa',`<p class="bertha-muted">${esc(item.title)}</p><div class="bertha-choice-grid"><button data-min="15">15 min</button><button data-min="30">30 min</button><button data-min="60">1 hora</button><button data-later>Deixar para depois</button></div><label class="bertha-field">Escolher horário<input type="time" data-time></label>`); d.querySelectorAll('[data-min]').forEach(b=>b.onclick=()=>{snoozeItem(item,+b.dataset.min);d.close();d.remove()}); d.querySelector('[data-later]').onclick=()=>{snoozeItem(item,180);d.close();d.remove()}; d.querySelector('[data-time]').onchange=e=>{const [h,m]=e.target.value.split(':').map(Number),now=new Date(),t=new Date();t.setHours(h,m,0,0);if(t<now)t.setDate(t.getDate()+1);const en=engine();en.snoozed=en.snoozed||{};en.snoozed[item.id]=t.getTime();saveEngine(en);d.close();d.remove();rerender()}; }
  function conflictDialog(item){ const a=engine().active; const d=dialogBase('Uma atividade já está em andamento',`<p><strong>${esc(a.title)}</strong> começou às ${hhmm(a.startedAt)}.</p><div class="bertha-stack"><button class="bertha-primary" data-finish>Concluir e começar esta</button><button class="bertha-secondary" data-pause>Pausar e começar esta</button></div>`); d.querySelector('[data-finish]').onclick=()=>{finishActive();d.close();d.remove();startItem(item)}; d.querySelector('[data-pause]').onclick=()=>{pauseActive(item);d.close();d.remove()}; }

  function nowCard(){ const s=currentSuggestion();
    if(s.active){ const a=s.active, elapsed=Math.max(0,Math.floor((Date.now()-a.startedAt)/60000)), end=new Date(a.startedAt+a.plannedMinutes*60000); return `<section class="now-card bertha-now active"><div class="card-kicker">AGORA · EM ANDAMENTO</div><div class="now-title">${esc(a.title)}</div><div class="now-time">${esc(a.source)} · ${elapsed} min</div><p>Previsto: ${durationText(a.plannedMinutes)} · término estimado ${hhmm(end)}</p><div class="bertha-actions"><button class="bertha-primary" data-finish-active>Concluir</button></div></section>`; }
    if(s.item){ const x=s.item; return `<section class="now-card bertha-now"><div class="card-kicker">AGORA · ${esc(x.source).toUpperCase()}</div><div class="now-title">${esc(x.title)}</div><div class="now-time">${x.time?`previsto ${esc(x.time)} · `:''}${durationText(+x.minutes||30)}</div><p>${x.windowStart?`Pode acontecer entre ${x.windowStart} e ${x.windowEnd}.`:x.kind==='ideal'?'Uma sugestão do seu Dia Ideal — não uma obrigação.':'Está disponível para o seu dia.'}</p><div class="bertha-actions"><button class="bertha-primary" data-start="${esc(x.id)}">Começar agora</button><button class="bertha-secondary" data-postpone="${esc(x.id)}">Adiar</button></div></section>`; }
    return `<section class="now-card bertha-now free"><div class="card-kicker">AGORA</div><div class="now-title">Espaço livre</div><div class="now-time">agora</div><p>Você não precisa preencher cada minuto.</p></section>`;
  }
  function timeline(){ const m=minsNow(), w=new Date().getDay(); const status=(a,b,prot=false)=>prot?'—':m>=b?'✓':m>=a?'●':'○'; const ho={1:[1000,1120,'16:40–18:40'],2:[940,1060,'15:40–17:40'],3:[1000,1120,'16:40–18:40'],4:[940,1060,'15:40–17:40'],5:[940,1060,'15:40–17:40']}[w]; let rows=[[316,455,'05:16–07:35','Manhã protegida',true],[480,840,'08:00–14:00','Trabalho oficial',false]]; if(w===1||w===3) rows.push([880,970,'14:40–16:10','Janela estratégica',false]); if(ho) rows.push([ho[0],ho[1],ho[2],'Home office · duração planejada 2h',false]); rows.push([1140,1440,'19:00+','Noite protegida · descanso primeiro',true]); return rows.map(r=>`<div class="bertha-time-row"><i>${status(r[0],r[1],r[4])}</i><b>${r[2]}</b><span>${r[3]}</span></div>`).join(''); }

  function renderHome(){ const d=new Date(), greet=d.getHours()<12?'Bom dia':d.getHours()<18?'Boa tarde':'Boa noite'; const today=new Intl.DateTimeFormat('pt-BR',{weekday:'long',day:'numeric',month:'long'}).format(d); const tasks=sourcesToday().filter(x=>!doneToday(x.id)).slice(0,4); const free=currentSuggestion().free;
    return `<section class="day-hero"><div class="eyebrow">MEU DIA</div><h1>${greet}, Duaila.</h1><p class="day-date">${today}</p></section>${nowCard()}<section class="day-section"><div class="section-head"><h2>O que importa hoje</h2><span class="soft-count">${tasks.length}</span></div>${tasks.length?tasks.map(x=>`<div class="focus-row bertha-focus"><span class="focus-dot">•</span><div><strong>${esc(x.title)}</strong><small>${esc(x.source)} · ${durationText(+x.minutes||30)}</small></div><button data-start="${esc(x.id)}">Começar</button></div>`).join(''):`<div class="bertha-empty">Seu essencial está em dia.</div>`}</section><section class="day-section"><div class="section-head"><h2>Seu dia, sem excesso</h2></div><div class="timeline bertha-timeline">${timeline()}</div></section>${free?`<section class="free-space"><div>☁️</div><strong>Espaço livre também faz parte do dia.</strong><p>Se nada precisa ser resolvido agora, não resolva.</p></section>`:''}`;
  }

  function renderIdeal(){ const items=read(IDEAL_KEY,[]); return `<section class="hero"><div class="eyebrow">PREFERÊNCIAS</div><h2>Meu Dia Ideal</h2><p>O que você gostaria que coubesse na sua vida quando houver espaço. Não é uma agenda rígida.</p></section><button class="primary add-full" data-add-ideal>＋ Adicionar ao meu dia ideal</button><div class="list bertha-ideal-list">${items.map(x=>`<article class="card"><div><strong>${esc(x.title)}</strong><span>${({morning:'Manhã',afternoon:'Tarde',night:'Noite',flex:'Quando houver espaço'})[x.period]||'Flexível'} · ${durationText(+x.minutes||30)}${x.notify?' · 🔔':''}</span></div><button class="more" data-del-ideal="${x.id}">×</button></article>`).join('')||'<div class="bertha-empty">Ainda não há preferências. Comece com algo que você gostaria de viver com mais frequência.</div>'}</div>`; }
  function addIdealDialog(){ const d=dialogBase('Adicionar ao Meu Dia Ideal',`<label class="bertha-field">O que você gostaria de fazer?<input data-title placeholder="Ex.: Ler um livro"></label><label class="bertha-field">Melhor período<select data-period><option value="morning">Manhã</option><option value="afternoon">Tarde</option><option value="night">Noite protegida</option><option value="flex">Quando houver espaço</option></select></label><label class="bertha-field">Duração<input data-minutes type="number" min="5" step="5" value="30"></label><label class="bertha-check"><input data-notify type="checkbox"> 🔔 Notificar</label><button class="bertha-primary bertha-full" data-save>Salvar</button>`); d.querySelector('[data-save]').onclick=()=>{const title=d.querySelector('[data-title]').value.trim();if(!title)return;const arr=read(IDEAL_KEY,[]);arr.push({id:`ideal-${Date.now()}`,title,period:d.querySelector('[data-period]').value,minutes:+d.querySelector('[data-minutes]').value||30,notify:d.querySelector('[data-notify]').checked,active:true});write(IDEAL_KEY,arr);d.close();d.remove();rerender()}; }

  function bindHome(){ document.querySelectorAll('[data-start]').forEach(b=>b.onclick=()=>{const x=sourcesToday().find(i=>i.id===b.dataset.start);if(x)startItem(x)}); document.querySelectorAll('[data-postpone]').forEach(b=>b.onclick=()=>{const x=sourcesToday().find(i=>i.id===b.dataset.postpone);if(x)postponeDialog(x)}); const f=document.querySelector('[data-finish-active]'); if(f)f.onclick=finishActive; }
  function bindIdeal(){ const a=document.querySelector('[data-add-ideal]');if(a)a.onclick=addIdealDialog;document.querySelectorAll('[data-del-ideal]').forEach(b=>b.onclick=()=>{write(IDEAL_KEY,read(IDEAL_KEY,[]).filter(x=>x.id!==b.dataset.delIdeal));rerender()}) }

  function ensureStyles(){
    let s=document.getElementById('bertha-time-v1-style');
    if(!s){s=document.createElement('style');s.id='bertha-time-v1-style';document.head.appendChild(s)}
    s.textContent=`
    /* BERTH.A — identidade funcional v2 */
    .topbar>div{min-width:0}
    .topbar .eyebrow{
      text-transform:none!important;
      letter-spacing:0!important;
      font-family:"Snell Roundhand","Bradley Hand",cursive!important;
      font-size:17px!important;
      line-height:1.05!important;
      font-weight:400!important;
      color:#8a718f!important;
      margin-top:2px!important;
      white-space:nowrap;
    }
    #pageTitle{
      font-family:Inter,-apple-system,BlinkMacSystemFont,"SF Pro Display","Helvetica Neue",sans-serif!important;
      font-size:23px!important;
      font-weight:760!important;
      letter-spacing:.02em!important;
      color:#4b3f52!important;
      margin-top:2px!important;
    }
    .bertha-brand{display:none!important}
    .bertha-now{position:relative}
    .bertha-actions{display:flex;gap:9px;margin-top:14px;flex-wrap:wrap}
    .bertha-primary,.bertha-secondary,.bertha-focus button,.bertha-choice-grid button{border:0;border-radius:999px;padding:10px 14px;font-weight:800}
    .bertha-primary{background:#d989aa;color:#fff}
    .bertha-secondary,.bertha-focus button,.bertha-choice-grid button{background:#f1e9f5;color:#66506f}
    .bertha-focus{grid-template-columns:auto 1fr auto!important;align-items:center}
    .bertha-focus button{font-size:12px}
    .bertha-time-row{display:grid!important;grid-template-columns:22px 92px 1fr!important;gap:8px!important;align-items:start}
    .bertha-time-row i{font-style:normal;font-weight:900;color:#80629a}
    .bertha-empty{padding:16px;border:1px dashed rgba(92,72,104,.18);border-radius:18px;color:#817783}
    .bertha-dialog{border:0;border-radius:26px;padding:0;width:min(90vw,420px);background:#fffaf6;color:#40384a}
    .bertha-dialog::backdrop{background:rgba(50,40,52,.38);backdrop-filter:blur(4px)}
    .bertha-modal{padding:20px}
    .bertha-modal-head{display:flex;justify-content:space-between;align-items:center;font-size:20px;margin-bottom:2px}
    .bertha-modal-head button{border:0;background:transparent;font-size:28px}
    .bertha-muted{color:#817783}
    .bertha-choice-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0}
    .bertha-field{display:grid;gap:6px;margin:12px 0;font-weight:700}
    .bertha-field input,.bertha-field select{width:100%;box-sizing:border-box;padding:12px;border:1px solid #e4dce5;border-radius:14px;background:white;font:inherit}
    .bertha-check{display:flex;gap:8px;align-items:center;margin:14px 0}
    .bertha-full{width:100%}.bertha-stack{display:grid;gap:9px;margin-top:16px}

    /* Barra inferior: mesma presença visual para os quatro botões */
    .bottom-nav .nav-item{color:#6d6571!important;opacity:1!important}
    .bottom-nav .nav-item>svg,.bottom-nav .nav-item>.bertha-nav-mark{
      width:22px;height:22px;display:block;margin:0 auto 3px;
    }
    .bottom-nav .nav-item>span:last-child{font-size:11px!important;font-weight:650!important}
    .bertha-nav-mark{
      width:auto!important;
      min-width:25px;
      display:flex!important;align-items:center;justify-content:center;
      font-family:Inter,-apple-system,BlinkMacSystemFont,"SF Pro Display",sans-serif!important;
      font-size:12px!important;font-weight:850!important;letter-spacing:-.04em!important;
      color:#66506f!important;
    }
    .bottom-nav .nav-item.active,.bottom-nav .nav-item[aria-current="page"]{color:#8a5e92!important}

    /* Menu Início */
    #berthaMore{width:min(92vw,430px)!important}
    #berthaMore .bertha-modal{padding:20px 20px 18px}
    #berthaMore .bertha-modal-head strong{
      font-family:Inter,-apple-system,BlinkMacSystemFont,"SF Pro Display",sans-serif;
      font-size:21px;font-weight:760;letter-spacing:-.02em;
    }
    .bertha-menu-sub{
      padding:0 0 16px!important;
      color:#8a818c!important;
      font-family:Inter,-apple-system,BlinkMacSystemFont,"SF Pro Text","Helvetica Neue",sans-serif!important;
      font-size:13px!important;
      line-height:1.35!important;
      font-weight:300!important;
      letter-spacing:.01em!important;
    }
    .module-links.bertha-module-cards{
      display:grid!important;
      grid-template-columns:1fr 1fr!important;
      gap:9px!important;
    }
    .module-links.bertha-module-cards a{
      min-height:58px!important;
      box-sizing:border-box;
      display:flex!important;
      flex-direction:row!important;
      align-items:center!important;
      justify-content:flex-start!important;
      gap:10px!important;
      text-align:left!important;
      padding:10px 12px!important;
      border:1px solid rgba(92,72,104,.12)!important;
      border-radius:16px!important;
      background:rgba(255,255,255,.70)!important;
      box-shadow:0 4px 14px rgba(73,56,78,.045)!important;
      color:#554b59!important;
      font-family:Inter,-apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif!important;
      font-size:13px!important;
      line-height:1.15!important;
      font-weight:650!important;
      text-decoration:none!important;
    }
    .module-links.bertha-module-cards a:active{transform:scale(.985);background:#faf5fa!important}
    .module-links.bertha-module-cards a:last-child:nth-child(odd){grid-column:1 / -1}
    .bertha-menu-icon{
      flex:0 0 30px;width:30px;height:30px;border-radius:10px;
      display:grid;place-items:center;
      background:#f4eef6;color:#765f7e;
    }
    .bertha-menu-icon svg{width:17px;height:17px;display:block}
    @media(max-width:380px){
      .bertha-focus button{padding:8px 10px}
      .bertha-time-row{grid-template-columns:20px 84px 1fr!important}
      .topbar .eyebrow{font-size:15px!important}
      .module-links.bertha-module-cards a{font-size:12.5px!important;padding:9px 10px!important}
    }
    `;
  }

  const icon = (name) => {
    const p={
      tasks:'<path d="M8 6h10M8 12h10M8 18h10"/><path d="M4 6h.01M4 12h.01M4 18h.01"/>',
      ritual:'<path d="M12 3v3M12 18v3M3 12h3M18 12h3"/><path d="M16.2 7.8l2.1-2.1M5.7 18.3l2.1-2.1M16.2 16.2l2.1 2.1M5.7 5.7l2.1 2.1"/><circle cx="12" cy="12" r="3.2"/>',
      more:'<path d="M5 7h14M5 12h14M5 17h14"/>',
      heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>',
      briefcase:'<rect x="3" y="7" width="18" height="12" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18"/>',
      study:'<path d="M3 5.5A3.5 3.5 0 0 1 6.5 2H11v17H6.5A3.5 3.5 0 0 0 3 22V5.5zM21 5.5A3.5 3.5 0 0 0 17.5 2H13v17h4.5A3.5 3.5 0 0 1 21 22V5.5z"/>',
      home:'<path d="M3 11.5L12 4l9 7.5"/><path d="M5.5 10v10h13V10M9.5 20v-6h5v6"/>',
      move:'<circle cx="12" cy="4.5" r="2"/><path d="M9.5 9l2.5-2 2.5 2 2 4M12 11l-2 4-4 3M13 13l3 3 2 4"/>',
      food:'<path d="M7 3v8M4.5 3v5a2.5 2.5 0 0 0 5 0V3M7 11v10M16 3v18M16 3c3 2 4 5 4 8h-4"/>',
      recipe:'<path d="M5 3h11a3 3 0 0 1 3 3v15H7a2 2 0 0 1-2-2V3z"/><path d="M7 17h12M9 7h6M9 11h6"/>',
      wallet:'<path d="M4 6h14a2 2 0 0 1 2 2v11H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/><path d="M16 11h5v4h-5a2 2 0 0 1 0-4z"/>',
      idea:'<path d="M9 18h6M10 22h4"/><path d="M8.2 14.5A7 7 0 1 1 15.8 14.5c-1.2.8-1.8 1.7-1.8 3h-4c0-1.3-.6-2.2-1.8-3z"/>'
    };
    return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${p[name]||p.more}</svg>`;
  };

  function nav(){
    const navs=[...document.querySelectorAll('.bottom-nav')]; let n=navs[0]; navs.slice(1).forEach(x=>x.remove()); if(!n){n=document.createElement('nav');n.className='bottom-nav';document.body.appendChild(n)}
    n.innerHTML=`<a class="nav-item" data-route="meu-dia" href="#meu-dia" aria-label="Início"><span class="bertha-nav-mark">B•A</span><span>Início</span></a><a class="nav-item" data-route="pendencias" href="#pendencias" aria-label="Tarefas">${icon('tasks')}<span>Tarefas</span></a><a class="nav-item" data-route="rituais" href="#rituais">${icon('ritual')}<span>Rituais</span></a><button class="nav-item" type="button" data-bertha-more>${icon('more')}<span>Mais</span></button>`;
    const route=(location.hash||'#meu-dia').slice(1)||'meu-dia';
    n.querySelectorAll('[data-route]').forEach(a=>{if(a.dataset.route===route){a.classList.add('active');a.setAttribute('aria-current','page')}});
    const more=n.querySelector('[data-bertha-more]'); more.onclick=e=>{e.preventDefault();openMore()};
  }

  function openMore(){
    let d=document.getElementById('berthaMore'); if(d)d.remove();
    const modules=[
      ['dia-ideal','heart','Meu Dia Ideal'],
      ['trabalho','briefcase','Trabalho'],
      ['estudos','study','Estudos'],
      ['casa','home','Casa'],
      ['exercicios','move','Exercícios'],
      ['alimentacao','food','Alimentação'],
      ['receitas','recipe','Receitas'],
      ['financeiro','wallet','Financeiro'],
      ['ideias','idea','Criação & Ideias']
    ];
    d=document.createElement('dialog');d.id='berthaMore';d.className='bertha-dialog';
    d.innerHTML=`<div class="bertha-modal"><div class="bertha-modal-head"><strong>Início</strong><button data-close>×</button></div><div class="bertha-menu-sub">Everything in place. More room for life.</div><div class="module-links bertha-module-cards">${modules.map(([r,i,l])=>`<a href="#${r}"><span class="bertha-menu-icon">${icon(i)}</span><span>${l}</span></a>`).join('')}</div></div>`;
    document.body.appendChild(d);
    d.querySelector('[data-close]').onclick=()=>{d.close();d.remove()};
    d.querySelectorAll('a').forEach(a=>a.onclick=()=>{d.close();d.remove()});
    d.addEventListener('cancel',e=>{e.preventDefault();d.close();d.remove()});
    d.addEventListener('click',e=>{if(e.target===d){d.close();d.remove()}});
    d.showModal();
  }

  const originalRender = window.render;
  function rerender(){
    ensureStyles(); nav(); const route=(location.hash||'#meu-dia').slice(1)||'meu-dia'; const pt=document.querySelector('#pageTitle'); const eyebrow=document.querySelector('.topbar .eyebrow'); if(eyebrow) eyebrow.textContent = route==='meu-dia'?'Out of your head. Into your life.':''; if(pt) pt.textContent = route==='meu-dia'?'BERTH.A':route==='pendencias'?'Tarefas':route==='dia-ideal'?'Meu Dia Ideal':pt.textContent;
    if(route==='meu-dia'){ document.getElementById('app').innerHTML=renderHome();bindHome();return; }
    if(route==='dia-ideal'){ document.getElementById('app').innerHTML=renderIdeal();bindIdeal();return; }
    if(typeof originalRender==='function') originalRender(); nav(); if(route==='pendencias'){ const pt2=document.querySelector('#pageTitle');if(pt2)pt2.textContent='Tarefas'; document.querySelectorAll('h1,h2,h3,strong,span,p').forEach(el=>{if(el.children.length===0)el.textContent=el.textContent.replace(/Pendências/g,'Tarefas').replace(/Pendência/g,'Tarefa')}); }
  }
  window.render = rerender;
  window.renderMeuDia = renderHome;
  window.ensureMainNavigation = nav;
  window.openMainModuleMenu = openMore;
  window.addEventListener('hashchange',()=>setTimeout(rerender,0));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden && (location.hash==='#meu-dia'||!location.hash))rerender()});
  setInterval(()=>{if((location.hash==='#meu-dia'||!location.hash)&&document.visibilityState==='visible')rerender()},60000);
  ensureStyles(); setTimeout(rerender,0);
})();
