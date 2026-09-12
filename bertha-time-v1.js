/* BERTH.A — Meu Dia v2 / Motor de Tempo v2.2 — Rituais ciclo e exclusão
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
      push({id:`task:${x.id}`,source:'Tarefas',title:x.title||x.name||'Tarefa',date,minutes:parseMinutes(x.minutes||x.duration||x.estimate||30),time:x.time||'',period:x.period||'flex',priority:x.priority||'Normal',notify:!!x.notify,notifyOffset:x.notifyOffset||'at-time',kind:'task'});
    });

    // Rituais — eventos previstos para hoje.
    ritualSourcesForToday().forEach(push);

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
    const ritual=list.find(x=>x.kind==='ritual'); if(ritual) return {item:ritual};
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
    return `<section class="now-card bertha-now free"><div class="card-kicker">AGORA</div><div class="now-title">Espaço livre</div><div class="now-time">agora</div><p><strong>Espaço livre também faz parte do dia.</strong><br>Se nada precisa ser resolvido agora, não resolva.</p></section>`;
  }
  function timeline(){ const m=minsNow(), w=new Date().getDay(); const status=(a,b,prot=false)=>prot?'—':m>=b?'✓':m>=a?'●':'○'; const ho={1:[1000,1120,'16:40–18:40'],2:[940,1060,'15:40–17:40'],3:[1000,1120,'16:40–18:40'],4:[940,1060,'15:40–17:40'],5:[940,1060,'15:40–17:40']}[w]; let rows=[[316,455,'05:16–07:35','Manhã protegida',true],[480,840,'08:00–14:00','Trabalho oficial',false]]; if(w===1||w===3) rows.push([880,970,'14:40–16:10','Janela estratégica',false]); if(ho) rows.push([ho[0],ho[1],ho[2],'Home office · duração planejada 2h',false]); rows.push([1140,1440,'19:00+','Noite protegida · descanso primeiro',true]); return rows.map(r=>`<div class="bertha-time-row"><i>${status(r[0],r[1],r[4])}</i><b>${r[2]}</b><span>${r[3]}</span></div>`).join(''); }

  function renderHome(){ const d=new Date(), greet=d.getHours()<12?'Bom dia':d.getHours()<18?'Boa tarde':'Boa noite'; const today=new Intl.DateTimeFormat('pt-BR',{weekday:'long',day:'numeric',month:'long'}).format(d); const tasks=sourcesToday().filter(x=>!doneToday(x.id)).slice(0,4); const free=currentSuggestion().free;
    return `<section class="day-hero"><div class="eyebrow">MEU DIA</div><h1>${greet}, Duaila.</h1><p class="day-date">${today}</p></section>${nowCard()}<section class="day-section"><div class="section-head"><h2>O que importa hoje</h2><span class="soft-count">${tasks.length}</span></div>${tasks.length?tasks.map(x=>`<div class="focus-row bertha-focus"><span class="focus-dot">•</span><div><strong>${esc(x.title)}</strong><small>${esc(x.source)} · ${durationText(+x.minutes||30)}</small></div><button data-start="${esc(x.id)}">Começar</button></div>`).join(''):`<div class="bertha-empty">Seu essencial está em dia.</div>`}</section><section class="day-section"><div class="section-head"><h2>Seu dia, sem excesso</h2></div><div class="timeline bertha-timeline">${timeline()}</div></section>${free?`<section class="free-space"><div>☁️</div><strong>Espaço livre também faz parte do dia.</strong><p>Se nada precisa ser resolvido agora, não resolva.</p></section>`:''}`;
  }

  function renderIdeal(){ const items=read(IDEAL_KEY,[]); return `<section class="hero"><div class="eyebrow">PREFERÊNCIAS</div><h2>Meu Dia Ideal</h2><p>O que você gostaria que coubesse na sua vida quando houver espaço. Não é uma agenda rígida.</p></section><button class="primary add-full" data-add-ideal>＋ Adicionar ao meu dia ideal</button><div class="list bertha-ideal-list">${items.map(x=>`<article class="card"><div><strong>${esc(x.title)}</strong><span>${({morning:'Manhã',afternoon:'Tarde',night:'Noite',flex:'Quando houver espaço'})[x.period]||'Flexível'} · ${durationText(+x.minutes||30)}${x.notify?' · 🔔':''}</span></div><button class="more" data-del-ideal="${x.id}">×</button></article>`).join('')||'<div class="bertha-empty">Ainda não há preferências. Comece com algo que você gostaria de viver com mais frequência.</div>'}</div>`; }
  function addIdealDialog(){ const d=dialogBase('Adicionar ao Meu Dia Ideal',`<label class="bertha-field">O que você gostaria de fazer?<input data-title placeholder="Ex.: Ler um livro"></label><label class="bertha-field">Melhor período<select data-period><option value="morning">Manhã</option><option value="afternoon">Tarde</option><option value="night">Noite protegida</option><option value="flex">Quando houver espaço</option></select></label><label class="bertha-field">Duração<input data-minutes type="number" min="5" step="5" value="30"></label><label class="bertha-check"><input data-notify type="checkbox"> 🔔 Notificar</label><button class="bertha-primary bertha-full" data-save>Salvar</button>`); d.querySelector('[data-save]').onclick=()=>{const title=d.querySelector('[data-title]').value.trim();if(!title)return;const arr=read(IDEAL_KEY,[]);arr.push({id:`ideal-${Date.now()}`,title,period:d.querySelector('[data-period]').value,minutes:+d.querySelector('[data-minutes]').value||30,notify:d.querySelector('[data-notify]').checked,active:true});write(IDEAL_KEY,arr);d.close();d.remove();rerender()}; }


  const TASKS_KEY='minha-vida.pendencias.v1';

  function taskIsDone(x){ return !!(x.done||x.completed||x.status==='Concluído'); }
  function taskLabelPeriod(p){
    return ({morning:'Manhã',afternoon:'Tarde',night:'Noite',flex:'Flexível',specific:'Horário específico'})[p]||'Flexível';
  }

  function taskDurationParts(x){
    const unit=x.durationUnit;
    const value=Number(x.durationValue);
    if(unit && value>0) return {value,unit};
    const mins=parseMinutes(x.minutes||x.duration||30);
    if(mins>=1440 && mins%1440===0) return {value:mins/1440,unit:'days'};
    if(mins>=60 && mins%60===0) return {value:mins/60,unit:'hours'};
    return {value:mins,unit:'minutes'};
  }
  function taskDurationMinutes(value,unit){
    const n=Math.max(1,Number(value)||1);
    if(unit==='days') return n*1440;
    if(unit==='hours') return n*60;
    return n;
  }
  function taskDurationPretty(value,unit){
    const n=Number(value)||1;
    if(unit==='days') return `${n} ${n===1?'dia':'dias'}`;
    if(unit==='hours') return `${n} ${n===1?'hora':'horas'}`;
    return `${n} min`;
  }

  function taskLabelPriority(p){
    const v=String(p||'Normal').toLowerCase();
    if(v.includes('import')) return 'Importante';
    if(v.includes('baix')) return 'Baixa';
    return 'Normal';
  }
  function taskMeta(x){
    const bits=[];
    if(x.dueDate||x.due) bits.push(`Prazo ${esc((x.dueDate||x.due).split('-').reverse().join('/'))}`);
    const dp=taskDurationParts(x);
    bits.push(taskDurationPretty(dp.value,dp.unit));
    const per=taskLabelPeriod(x.period);
    bits.push(x.time ? `${per} · ${esc(x.time)}` : per);
    bits.push(taskLabelPriority(x.priority));
    if(x.notify) bits.push('🔔 aviso');
    return bits.join(' · ');
  }

  function renderTasks(){
    const arr=read(TASKS_KEY,[]);
    const open=arr.filter(x=>!taskIsDone(x));
    const done=arr.filter(taskIsDone);
    return `
      <section class="bertha-tasks" data-task-view="open">
        <section class="bertha-task-hero">
          <div class="bertha-task-kicker">TAREFAS</div>
          <h1>Vamos tirar isso da cabeça.</h1>
          <p>Um lugar simples para guardar o que precisa ser resolvido — sem transformar tudo em urgência.</p>
        </section>

        <div class="bertha-task-tools">
          <label class="bertha-task-search">
            <span aria-hidden="true">⌕</span>
            <input type="search" data-task-search placeholder="Buscar tarefa..." autocomplete="off">
          </label>
          <button class="bertha-task-add" type="button" data-add-task><span>＋</span> Adicionar</button>
        </div>

        <div class="bertha-task-tabs" role="tablist" aria-label="Status das tarefas">
          <button class="active" type="button" data-task-tab="open">Abertas <em>${open.length}</em></button>
          <button type="button" data-task-tab="done">Concluídas <em>${done.length}</em></button>
        </div>

        <div class="bertha-task-list" data-task-list="open">
          ${open.length ? open.map(x=>`
            <article class="bertha-task-card" data-task-id="${esc(x.id)}">
              <button class="bertha-task-check" type="button" data-task-complete="${esc(x.id)}" aria-label="Concluir tarefa">○</button>
              <div class="bertha-task-copy">
                <strong>${esc(x.title||x.name||'Tarefa')}</strong>
                <span>${taskMeta(x)}</span>
                ${x.note||x.observation ? `<small>${esc(x.note||x.observation)}</small>`:''}
              </div>
              <button class="bertha-task-more" type="button" data-task-edit="${esc(x.id)}" aria-label="Editar tarefa">•••</button>
            </article>`).join('') :
            `<div class="bertha-task-empty"><div>☁️</div><strong>Nada precisa de você agora.</strong><p>Se algo surgir, coloque aqui. Você não precisa lembrar.</p></div>`
          }
        </div>

        <div class="bertha-task-list" data-task-list="done" hidden>
          ${done.length ? done.map(x=>`
            <article class="bertha-task-card done" data-task-id="${esc(x.id)}">
              <button class="bertha-task-check" type="button" data-task-reopen="${esc(x.id)}" aria-label="Reabrir tarefa">✓</button>
              <div class="bertha-task-copy">
                <strong>${esc(x.title||x.name||'Tarefa')}</strong>
                <span>${taskMeta(x)}</span>
              </div>
              <button class="bertha-task-more" type="button" data-task-edit="${esc(x.id)}" aria-label="Editar tarefa">•••</button>
            </article>`).join('') :
            `<div class="bertha-task-empty"><div>✓</div><strong>Nenhuma concluída ainda.</strong><p>Quando você concluir algo, ele aparece aqui sem ocupar sua cabeça.</p></div>`
          }
        </div>
      </section>`;
  }

  function taskDialog(existing=null){
    const x=existing||{};
    const d=document.createElement('dialog');
    d.className='bertha-dialog bertha-task-dialog';
    d.innerHTML=`
      <form class="bertha-task-modal" method="dialog">
        <div class="bertha-task-modal-head">
          <div><span>${existing?'EDITAR TAREFA':'NOVA TAREFA'}</span><h2>${existing?'Ajustar tarefa':'Adicionar tarefa'}</h2></div>
          <button type="button" data-close aria-label="Fechar">×</button>
        </div>

        <div class="bertha-task-modal-body">
          <label class="bertha-task-field">
            <span>O que precisa sair da sua cabeça?</span>
            <input data-title value="${esc(x.title||x.name||'')}" placeholder="Ex.: Resolver documento" autofocus>
          </label>

          <label class="bertha-task-field">
            <span>Categoria</span>
            <select data-category>
              ${['Pessoal','Casa','Trabalho','Estudos','Saúde','Financeiro','BEC','Outro'].map(v=>`<option ${String(x.category||'Pessoal')===v?'selected':''}>${v}</option>`).join('')}
            </select>
          </label>

          <div class="bertha-task-two">
            <label class="bertha-task-field">
              <span>Prazo <small>opcional</small></span>
              <input data-due type="date" value="${esc(x.dueDate||x.due||'')}">
            </label>
            <div class="bertha-task-field">
              <span>Quanto tempo leva?</span>
              <div class="bertha-duration-input">
                <input data-duration-value type="number" min="1" step="1" inputmode="numeric" value="${taskDurationParts(x).value}">
                <select data-duration-unit>
                  <option value="minutes" ${taskDurationParts(x).unit==='minutes'?'selected':''}>minutos</option>
                  <option value="hours" ${taskDurationParts(x).unit==='hours'?'selected':''}>horas</option>
                  <option value="days" ${taskDurationParts(x).unit==='days'?'selected':''}>dias</option>
                </select>
              </div>
            </div>
          </div>

          <div class="bertha-task-field">
            <span>Quando pode acontecer?</span>
            <div class="bertha-segment" data-period-group>
              ${[['flex','Flexível'],['morning','Manhã'],['afternoon','Tarde'],['night','Noite']].map(([v,l])=>`<button type="button" data-period="${v}" class="${(x.period||'flex')===v?'active':''}">${l}</button>`).join('')}
            </div>
          </div>

          <div class="bertha-task-two">
            <label class="bertha-task-field">
              <span>Horário <small>opcional</small></span>
              <input data-time type="time" value="${esc(x.time||'')}">
            </label>
            <div class="bertha-task-field">
              <span>Prioridade</span>
              <div class="bertha-segment compact" data-priority-group>
                ${[['Baixa','Baixa'],['Normal','Normal'],['Importante','Import.']].map(([v,l])=>`<button type="button" data-priority="${v}" class="${taskLabelPriority(x.priority)===v?'active':''}">${l}</button>`).join('')}
              </div>
            </div>
          </div>

          <label class="bertha-task-field">
            <span>Repetir</span>
            <select data-repeat>
              <option value="none" ${(x.repeat||'none')==='none'?'selected':''}>Não repetir</option>
              <option value="daily" ${x.repeat==='daily'?'selected':''}>Todos os dias</option>
              <option value="weekly" ${x.repeat==='weekly'?'selected':''}>Toda semana</option>
              <option value="weekdays" ${x.repeat==='weekdays'?'selected':''}>Dias úteis</option>
            </select>
          </label>

          <div class="bertha-notify-box">
            <label class="bertha-toggle-row">
              <div><strong>Me avisar?</strong><span>Guardar a preferência de notificação</span></div>
              <input data-notify type="checkbox" ${x.notify?'checked':''}>
              <i></i>
            </label>
            <label class="bertha-task-field bertha-notify-when" ${x.notify?'':'hidden'}>
              <span>Quando avisar?</span>
              <select data-notify-offset>
                <option value="at-time" ${(x.notifyOffset||'at-time')==='at-time'?'selected':''}>No horário da tarefa</option>
                <option value="10" ${String(x.notifyOffset)==='10'?'selected':''}>10 min antes</option>
                <option value="30" ${String(x.notifyOffset)==='30'?'selected':''}>30 min antes</option>
                <option value="60" ${String(x.notifyOffset)==='60'?'selected':''}>1 hora antes</option>
                <option value="period-start" ${String(x.notifyOffset)==='period-start'?'selected':''}>No início do período</option>
                <option value="custom-time" ${String(x.notifyOffset)==='custom-time'?'selected':''}>Em um horário escolhido</option>
              </select>
              <label class="bertha-notify-custom" ${String(x.notifyOffset)==='custom-time'?'':'hidden'}>
                <span>Horário do aviso</span>
                <input data-notify-time type="time" value="${esc(x.notifyTime||'')}">
              </label>
              <small class="bertha-notify-note">Se a tarefa não tiver horário, use “No início do período” ou escolha um horário para o aviso.</small>
            </label>
          </div>

          <label class="bertha-task-field">
            <span>Observação <small>opcional</small></span>
            <textarea data-note placeholder="Algum detalhe que você não quer esquecer?">${esc(x.note||x.observation||'')}</textarea>
          </label>
        </div>

        <div class="bertha-task-modal-actions">
          ${existing?'<button class="bertha-danger-link" type="button" data-delete>Excluir</button>':'<span></span>'}
          <div>
            <button class="bertha-task-cancel" type="button" data-close>Cancelar</button>
            <button class="bertha-task-save" type="button" data-save>Salvar</button>
          </div>
        </div>
      </form>`;

    document.body.appendChild(d);
    const close=()=>{try{d.close()}catch{} d.remove()};
    d.querySelectorAll('[data-close]').forEach(b=>b.onclick=close);
    d.addEventListener('cancel',e=>{e.preventDefault();close()});
    d.addEventListener('click',e=>{if(e.target===d)close()});

    let period=x.period||'flex';
    let priority=taskLabelPriority(x.priority);
    d.querySelectorAll('[data-period]').forEach(b=>b.onclick=()=>{
      period=b.dataset.period;
      d.querySelectorAll('[data-period]').forEach(z=>z.classList.toggle('active',z===b));
    });
    d.querySelectorAll('[data-priority]').forEach(b=>b.onclick=()=>{
      priority=b.dataset.priority;
      d.querySelectorAll('[data-priority]').forEach(z=>z.classList.toggle('active',z===b));
    });
    const notify=d.querySelector('[data-notify]');
    const notifyWhen=d.querySelector('.bertha-notify-when');
    const notifyOffset=d.querySelector('[data-notify-offset]');
    const notifyCustom=d.querySelector('.bertha-notify-custom');
    const syncNotifyCustom=()=>{ if(notifyCustom) notifyCustom.hidden=notifyOffset.value!=='custom-time'; };
    notify.onchange=()=>notifyWhen.hidden=!notify.checked;
    notifyOffset.onchange=syncNotifyCustom;
    syncNotifyCustom();

    d.querySelector('[data-save]').onclick=()=>{
      const title=d.querySelector('[data-title]').value.trim();
      if(!title){ d.querySelector('[data-title]').focus(); return; }
      const arr=read(TASKS_KEY,[]);
      const item={
        ...(existing||{}),
        id: existing?.id || `task-${Date.now()}`,
        title,
        name:title,
        category:d.querySelector('[data-category]').value,
        dueDate:d.querySelector('[data-due]').value,
        durationValue:+d.querySelector('[data-duration-value]').value||1,
        durationUnit:d.querySelector('[data-duration-unit]').value,
        minutes:taskDurationMinutes(d.querySelector('[data-duration-value]').value,d.querySelector('[data-duration-unit]').value),
        period,
        time:d.querySelector('[data-time]').value,
        priority,
        repeat:d.querySelector('[data-repeat]').value,
        notify:notify.checked,
        notifyOffset:d.querySelector('[data-notify-offset]').value,
        notifyTime:d.querySelector('[data-notify-time]')?.value||'',
        note:d.querySelector('[data-note]').value.trim(),
        done:taskIsDone(existing||{}),
        completed:taskIsDone(existing||{}),
        createdAt:existing?.createdAt||Date.now(),
        updatedAt:Date.now()
      };
      const idx=arr.findIndex(t=>String(t.id)===String(item.id));
      if(idx>=0) arr[idx]=item; else arr.unshift(item);
      write(TASKS_KEY,arr);
      close(); rerender();
    };
    const del=d.querySelector('[data-delete]');
    if(del) del.onclick=()=>{
      if(!confirm('Excluir esta tarefa?')) return;
      write(TASKS_KEY,read(TASKS_KEY,[]).filter(t=>String(t.id)!==String(existing.id)));
      close(); rerender();
    };
    d.showModal();
  }

  function setTaskDone(id,done){
    const arr=read(TASKS_KEY,[]);
    const x=arr.find(t=>String(t.id)===String(id));
    if(!x)return;
    x.done=done; x.completed=done; x.status=done?'Concluído':'Aberto'; x.completedAt=done?Date.now():null;
    write(TASKS_KEY,arr); rerender();
  }

  function bindTasks(){
    const add=document.querySelector('[data-add-task]');
    if(add) add.onclick=()=>taskDialog();

    document.querySelectorAll('[data-task-tab]').forEach(b=>b.onclick=()=>{
      const tab=b.dataset.taskTab;
      document.querySelectorAll('[data-task-tab]').forEach(z=>z.classList.toggle('active',z===b));
      document.querySelectorAll('[data-task-list]').forEach(l=>l.hidden=l.dataset.taskList!==tab);
      document.querySelector('.bertha-tasks')?.setAttribute('data-task-view',tab);
    });

    const search=document.querySelector('[data-task-search]');
    if(search) search.oninput=()=>{
      const q=search.value.trim().toLocaleLowerCase('pt-BR');
      document.querySelectorAll('.bertha-task-card').forEach(card=>{
        card.hidden=q && !card.textContent.toLocaleLowerCase('pt-BR').includes(q);
      });
    };

    document.querySelectorAll('[data-task-complete]').forEach(b=>b.onclick=()=>setTaskDone(b.dataset.taskComplete,true));
    document.querySelectorAll('[data-task-reopen]').forEach(b=>b.onclick=()=>setTaskDone(b.dataset.taskReopen,false));
    document.querySelectorAll('[data-task-edit]').forEach(b=>b.onclick=()=>{
      const x=read(TASKS_KEY,[]).find(t=>String(t.id)===String(b.dataset.taskEdit));
      if(x) taskDialog(x);
    });
  }


  // ============================================================
  // RITUAIS v2 — arquitetura genérica
  // ============================================================
  const RITUALS_KEY='bertha.rituals.v2';
  const RITUAL_EVENTS_KEY='bertha.ritual.events.v2';
  const CAPILLARY_SETTINGS_KEY='bertha.ritual.capilar.settings.v2';
  const SELFCARE_SETTINGS_KEY='bertha.ritual.autocuidado.settings.v2';

  const RITUAL_ICONS={
    hair:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 20c-2.8-1.5-4.2-4-4.2-7.2C3.8 7.9 7.2 4 12 4c4.6 0 8.2 3.6 8.2 8.2 0 3.2-1.6 6-4.2 7.8"/><path d="M8.2 19.8c2.2-2.5 2.8-5.4 2.1-8.8M12.1 20c1.8-2.6 2.2-5.5 1.2-8.8M16 19.8c1.1-2.3 1.2-4.8.2-7.4"/><path d="M5.3 9.1c3.1.2 5.5-1.4 6.7-4.8 1.4 3.2 3.6 4.8 6.8 5"/></svg>`,
    selfcare:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21c4-2.8 6.4-6.3 6.4-10.3A6.4 6.4 0 0 0 12 4.3a6.4 6.4 0 0 0-6.4 6.4C5.6 14.7 8 18.2 12 21Z"/><path d="M9 10.2c.8-.8 1.8-1.2 3-1.2s2.2.4 3 1.2M9.5 14.2c1.6 1.1 3.4 1.1 5 0"/></svg>`,
    sparkle:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3c.7 4.5 2.5 6.3 7 7-4.5.7-6.3 2.5-7 7-.7-4.5-2.5-6.3-7-7 4.5-.7 6.3-2.5 7-7Z"/><path d="M19 16c.3 1.8 1.2 2.7 3 3-1.8.3-2.7 1.2-3 3-.3-1.8-1.2-2.7-3-3 1.8-.3 2.7-1.2 3-3Z"/></svg>`,
    flower:`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="2.2"/><path d="M12 9.8C8.2 7.8 8.4 4 12 4c3.6 0 3.8 3.8 0 5.8ZM14.2 12c2-3.8 5.8-3.6 5.8 0 0 3.6-3.8 3.8-5.8 0ZM12 14.2c3.8 2 3.6 5.8 0 5.8-3.6 0-3.8-3.8 0-5.8ZM9.8 12c-2 3.8-5.8 3.6-5.8 0 0-3.6 3.8-3.8 5.8 0Z"/></svg>`,
    moon:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 15.2A8.3 8.3 0 0 1 8.8 4 8.5 8.5 0 1 0 20 15.2Z"/></svg>`,
    bath:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16v2.2A5.8 5.8 0 0 1 14.2 20H9.8A5.8 5.8 0 0 1 4 14.2V12ZM7 12V7.5A3.5 3.5 0 0 1 10.5 4H12"/><path d="M3 12h18M7 20l-1 2M17 20l1 2"/></svg>`,
    nail:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 20c-2.1-1.3-3-3.4-2.4-6.1l1.3-6.2c.3-1.4 2.2-1.5 2.7-.2l.2.6.6-4c.2-1.5 2.4-1.4 2.5.1l.2 4.1.5-3.2c.2-1.4 2.3-1.3 2.4.2l.2 4 .4-2.2c.3-1.4 2.3-1.1 2.3.3l-.1 6.7c0 3.7-2.5 6.2-6.2 6.2H9Z"/></svg>`,
    heart:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 5.8c-2-2-5.2-2-7.2 0L12 7.1l-1.3-1.3c-2-2-5.2-2-7.2 0s-2 5.2 0 7.2L12 21l8.5-8c2-2 2-5.2 0-7.2Z"/></svg>`
  };
  function ritualIcon(key='sparkle'){ return RITUAL_ICONS[key]||RITUAL_ICONS.sparkle; }

  const CAPILLARY_WASHES={"31/08": {"shampoo": "t:r S10 Colors Even More — Grayish-Brown Color Protective Shampoo", "s10": "30–60 s de massagem • SEM PAUSA", "tratamento": "REPARAÇÃO\nKerasys Propolis Hair Bonding Pro Repair Treatment", "condicionador": "Mise en Scène Perfect Serum Styling Conditioner", "serum": "Mise en Scène Perfect Serum Original"}, "02/09": {"shampoo": "Elseve Cachos Longos dos Sonhos Shampoo Nutri-Preenchedor", "tratamento": "HIDRATAÇÃO\nMáscara Hidra + Reconstrução", "condicionador": "Elseve Cachos Longos dos Sonhos Condicionador Selador", "serum": "Mise en Scène Perfect Serum Hydrating"}, "04/09": {"shampoo": "Mise en Scène Perfect Serum Styling Shampoo", "tratamento": "NUTRIÇÃO\nPré-shampoo: óleo de semente de uva (20–30 min) → lavagem", "condicionador": "Mise en Scène Perfect Serum Styling Conditioner", "serum": "Mise en Scène Perfect Serum Original"}, "06/09": {"shampoo": "Elseve Cachos Longos dos Sonhos Shampoo Nutri-Preenchedor", "tratamento": "REPARAÇÃO\nKerasys Propolis Hair Bonding Pro Repair Treatment", "condicionador": "Elseve Cachos Longos dos Sonhos Condicionador Selador", "serum": "Mise en Scène Perfect Serum Styling"}, "08/09": {"shampoo": "t:r S10 Colors Even More — Grayish-Brown Color Protective Shampoo", "s10": "30–60 s de massagem • SEM PAUSA", "tratamento": "HIDRATAÇÃO\nMáscara Hidra + Reconstrução", "condicionador": "Mise en Scène Perfect Serum Styling Conditioner", "serum": "Mise en Scène Perfect Serum Hydrating"}, "10/09": {"shampoo": "Elseve Cachos Longos dos Sonhos Shampoo Nutri-Preenchedor", "tratamento": "ACIDIFICAÇÃO\nLola Tannic Acid Acidificante — 5 min, comprimento e pontas", "condicionador": "Elseve Cachos Longos dos Sonhos Condicionador Selador", "serum": "Mise en Scène Perfect Serum Original"}, "12/09": {"shampoo": "Mise en Scène Perfect Serum Styling Shampoo", "tratamento": "NUTRIÇÃO\nPré-shampoo: óleo de coco ou semente de uva (20–30 min)", "condicionador": "Mise en Scène Perfect Serum Styling Conditioner", "serum": "Mise en Scène Perfect Serum Hydrating"}, "14/09": {"shampoo": "Elseve Cachos Longos dos Sonhos Shampoo Nutri-Preenchedor", "tratamento": "PÓS-COR\nLavagem suave + condicionador; sem máscara pesada", "condicionador": "Mise en Scène Perfect Serum Styling Conditioner", "serum": "Mise en Scène Perfect Serum Original"}, "16/09": {"shampoo": "Mise en Scène Perfect Serum Styling Shampoo", "tratamento": "HIDRATAÇÃO\nMáscara Hidra + Reconstrução", "condicionador": "Mise en Scène Perfect Serum Styling Conditioner", "serum": "Mise en Scène Perfect Serum Hydrating"}, "18/09": {"shampoo": "Elseve Cachos Longos dos Sonhos Shampoo Nutri-Preenchedor", "tratamento": "REPARAÇÃO\nKerasys Propolis Hair Bonding Pro Repair Treatment", "condicionador": "Elseve Cachos Longos dos Sonhos Condicionador Selador", "serum": "Mise en Scène Perfect Serum Styling"}, "20/09": {"shampoo": "Mise en Scène Perfect Serum Styling Shampoo", "tratamento": "NUTRIÇÃO\nPré-shampoo: óleo de semente de uva (20–30 min)", "condicionador": "Mise en Scène Perfect Serum Styling Conditioner", "serum": "Mise en Scène Perfect Serum Original"}, "22/09": {"shampoo": "Elseve Cachos Longos dos Sonhos Shampoo Nutri-Preenchedor", "tratamento": "ACIDIFICAÇÃO\nLola Tannic Acid Acidificante — 5 min", "condicionador": "Elseve Cachos Longos dos Sonhos Condicionador Selador", "serum": "Mise en Scène Perfect Serum Hydrating"}, "24/09": {"shampoo": "t:r S10 Colors Even More — Grayish-Brown Color Protective Shampoo", "s10": "30–60 s de massagem • SEM PAUSA", "tratamento": "HIDRATAÇÃO\nMáscara Hidra + Reconstrução", "condicionador": "Mise en Scène Perfect Serum Styling Conditioner", "serum": "Mise en Scène Perfect Serum Styling"}, "26/09": {"shampoo": "Elseve Cachos Longos dos Sonhos Shampoo Nutri-Preenchedor", "tratamento": "REPARAÇÃO\nKerasys Propolis Hair Bonding Pro Repair Treatment", "condicionador": "Elseve Cachos Longos dos Sonhos Condicionador Selador", "serum": "Mise en Scène Perfect Serum Original"}, "28/09": {"shampoo": "Mise en Scène Perfect Serum Styling Shampoo", "tratamento": "NUTRIÇÃO\nPré-shampoo: óleo de girassol ou semente de uva (20–30 min)", "condicionador": "Mise en Scène Perfect Serum Styling Conditioner", "serum": "Mise en Scène Perfect Serum Hydrating"}, "30/09": {"shampoo": "Elseve Cachos Longos dos Sonhos Shampoo Nutri-Preenchedor", "tratamento": "HIDRATAÇÃO\nMáscara Hidra + Reconstrução", "condicionador": "Elseve Cachos Longos dos Sonhos Condicionador Selador", "serum": "Mise en Scène Perfect Serum Styling"}, "02/10": {"shampoo": "Mise en Scène Perfect Serum Styling Shampoo", "tratamento": "REPARAÇÃO\nKerasys Propolis Hair Bonding Pro Repair Treatment", "condicionador": "Mise en Scène Perfect Serum Styling Conditioner", "serum": "Mise en Scène Perfect Serum Original"}, "04/10": {"shampoo": "Elseve Cachos Longos dos Sonhos Shampoo Nutri-Preenchedor", "tratamento": "ACIDIFICAÇÃO\nLola Tannic Acid Acidificante — 5 min", "condicionador": "Elseve Cachos Longos dos Sonhos Condicionador Selador", "serum": "Mise en Scène Perfect Serum Hydrating"}, "06/10": {"shampoo": "Mise en Scène Perfect Serum Styling Shampoo", "tratamento": "NUTRIÇÃO\nPré-shampoo: óleo de semente de uva (20–30 min)", "condicionador": "Mise en Scène Perfect Serum Styling Conditioner", "serum": "Mise en Scène Perfect Serum Original"}, "08/10": {"shampoo": "Elseve Cachos Longos dos Sonhos Shampoo Nutri-Preenchedor", "tratamento": "HIDRATAÇÃO\nMáscara Hidra + Reconstrução", "condicionador": "Elseve Cachos Longos dos Sonhos Condicionador Selador", "serum": "Mise en Scène Perfect Serum Hydrating"}, "10/10": {"shampoo": "t:r S10 Colors Even More — Grayish-Brown Color Protective Shampoo", "s10": "30–60 s de massagem • SEM PAUSA", "tratamento": "REPARAÇÃO\nKerasys Propolis Hair Bonding Pro Repair Treatment", "condicionador": "Mise en Scène Perfect Serum Styling Conditioner", "serum": "Mise en Scène Perfect Serum Styling"}, "12/10": {"shampoo": "Elseve Cachos Longos dos Sonhos Shampoo Nutri-Preenchedor", "tratamento": "ACIDIFICAÇÃO\nLola Tannic Acid Acidificante — 5 min", "condicionador": "Elseve Cachos Longos dos Sonhos Condicionador Selador", "serum": "Mise en Scène Perfect Serum Original"}, "14/10": {"shampoo": "Mise en Scène Perfect Serum Styling Shampoo", "tratamento": "HIDRATAÇÃO\nMáscara Hidra + Reconstrução", "condicionador": "Mise en Scène Perfect Serum Hydrating", "serum": ""}};
  const CAPILLARY_TEMPLATE_START=new Date(2026,7,31), CAPILLARY_START=new Date(2026,8,12), CAPILLARY_END=new Date(2026,9,14);

  const SELFCARE_START=new Date(2026,8,12);
  const SELFCARE_CYCLE=[
    {title:'MEZZO BIOSCULPT',minutes:20,tasks:['Limpeza facial','Mezzo — 20 min','Hidratação']},
    {title:'DEPILAÇÃO',minutes:25,tasks:['Banho morno','Pernas + axilas','Virilha','Hidratação']},
    {title:'MÁSCARA FACIAL',minutes:25,tasks:['Higienizar pele','Máscara calmante','Retirar','Sérum + hidratação']},
    {title:'MANUTENÇÃO',minutes:10,tasks:['Óleo cutículas','Creme mãos','Creme pés','Conferir soft gel']},
    {title:'DIA DAS UNHAS',minutes:180,tasks:['Remover soft gel','Preparar unhas','Aplicar soft gel','Fazer os pés','Hidratar']},
    {title:'LIVRE',minutes:0,optional:true,tasks:['Cronograma capilar','Hidratação corporal','Cutículas','Desacelerar']},
    {title:'RESET',minutes:15,tasks:['Hidratar mãos','Óleo cutículas','Creme pés','Skincare noturno']},
    {title:'MEZZO BIOSCULPT',minutes:20,tasks:['Limpeza facial','Mezzo — 20 min','Hidratação']},
    {title:'DEPILAÇÃO',minutes:25,tasks:['Banho morno','Pernas + axilas','Virilha','Hidratação']},
    {title:'BUÇO + SOBRANCELHAS',minutes:15,tasks:['Aparelho no buço','Pinça','Tesoura','Hidratação']},
    {title:'MÁSCARA FACIAL',minutes:25,tasks:['Higienizar pele','Máscara antioxidante','Retirar','Sérum + hidratação']},
    {title:'SPA CORPORAL',minutes:35,tasks:['Banho','Esfoliação','Depilação localizada','Hidratação','Creme nos pés']},
    {title:'MEZZO + RELAXAMENTO',minutes:25,tasks:['Mezzo — 20 min','Skincare','Hidratação corporal','Relaxar']},
    {title:'RESET',minutes:15,tasks:['Hidratar mãos','Óleo cutículas','Creme pés','Skincare noturno']}
  ];

  function defaultRituals(){
    return [
      {id:'capilar',title:'Ritual Capilar',subtitle:'Cronograma · recorrências · cuidados extras',icon:'hair',builtIn:true},
      {id:'autocuidado',title:'Autocuidado',subtitle:'Corpo · rosto · unhas · depilação · protocolos',icon:'selfcare',builtIn:true}
    ];
  }
  function ritualCatalog(){
    const custom=read(RITUALS_KEY,[]);
    return [...defaultRituals(),...custom.filter(x=>!['capilar','autocuidado'].includes(x.id))];
  }
  function ritualEvents(){ return read(RITUAL_EVENTS_KEY,[]); }
  function saveRitualEvents(v){ write(RITUAL_EVENTS_KEY,v); }
  function dateKey(d){ return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`; }
  function dateLabelLong(d){
    return d.toLocaleDateString('pt-BR',{day:'2-digit',month:'short'}).replace('.','').toUpperCase();
  }
  function capillaryCycleTotal(){ return Math.floor((CAPILLARY_END-CAPILLARY_START)/86400000)+1; }
  function dayStart(d){ return new Date(d.getFullYear(),d.getMonth(),d.getDate()); }
  function capillaryDay(d){ return Math.floor((dayStart(d)-CAPILLARY_START)/86400000)+1; }
  function capillaryEvent(d){
    d=dayStart(d); if(d<CAPILLARY_START||d>CAPILLARY_END)return null;
    const k=dateKey(d);
    if(k==='13/09') return {date:d,type:'color',title:'Coloração da raiz',subtitle:'Imédia L’Oréal 6.1 · somente raiz/brancos',minutes:60,period:'night',tasks:['Imédia L’Oréal 6.1 — somente raiz/brancos.','Não puxar a permanente para o comprimento.','Após enxaguar, seguir o passo a passo da caixa.','Sem máscara/reconstrução neste momento.','Deixar o cabelo em repouso.']};
    const r=CAPILLARY_WASHES[k];
    if(r){
      const kind=String(r.tratamento||'').split('\n')[0];
      return {date:d,type:'wash',title:`Lavagem · ${kind}`,subtitle:r.shampoo,minutes:45,period:'morning',tasks:[`Shampoo: ${r.shampoo}`,...(r.s10?[r.s10]:[]),r.tratamento,`Condicionador: ${r.condicionador}`,'Finalização: Phyto Manga → Lola Plot Twist Guava Mousse → Griffus Amo Cachos Gelatina Dia Seguinte',...(r.serum?[`Sérum: ${r.serum}`]:[]),'À noite: preservar a definição; sem lavagem.']};
    }
    return {date:d,type:'dayafter',title:'Day After',subtitle:'Retoque e preservação da definição',minutes:10,period:'morning',tasks:['Umedecer mãos/áreas necessárias.','Lola Plot Twist Guava Misturinha OU Griffus Amo Cachos Gelatina Dia Seguinte.','Amassar de baixo para cima.','Se houver frizz: 1 gota de sérum/óleo nas pontas.','À noite: preservar o cabelo; sem lavagem.']};
  }
  function selfcareEvent(d){
    const diff=Math.floor((dayStart(d)-SELFCARE_START)/86400000), idx=((diff%14)+14)%14, base=SELFCARE_CYCLE[idx];
    return {...base,date:dayStart(d),cycleDay:idx+1,type:'selfcare',period:'night',subtitle:`Dia ${idx+1} / 14`};
  }
  function ritualDefaultSettings(ritualId,type){
    if(ritualId==='capilar'){
      if(type==='color') return {period:'night',time:'',priority:'Importante',notify:false,notifyOffset:'at-time',notifyTime:''};
      return {period:'morning',time:'',priority:'Normal',notify:false,notifyOffset:'at-time',notifyTime:''};
    }
    return {period:'night',time:'',priority:'Normal',notify:false,notifyOffset:'at-time',notifyTime:''};
  }
  function ritualSetting(ritualId,type){
    const key=ritualId==='capilar'?CAPILLARY_SETTINGS_KEY:SELFCARE_SETTINGS_KEY;
    const all=read(key,{});
    return {...ritualDefaultSettings(ritualId,type),...(all[type]||{})};
  }
  function customEventsOn(d){
    const isoD=iso(dayStart(d)), weekday=d.getDay();
    return ritualEvents().filter(e=>{
      if(e.date===isoD)return true;
      if(e.repeat==='daily')return true;
      if(e.repeat==='weekly' && Number(e.weekday)===weekday)return true;
      if(e.repeat==='weekdays' && weekday>=1&&weekday<=5)return true;
      if(e.repeat==='interval' && e.startDate && e.intervalDays){
        const n=Math.floor((dayStart(d)-new Date(e.startDate+'T00:00:00'))/86400000);
        return n>=0 && n%Number(e.intervalDays)===0;
      }
      return false;
    });
  }
  function ritualSourcesForToday(){
    const d=new Date(), out=[];
    const cap=capillaryEvent(d);
    if(cap){
      const s=ritualSetting('capilar',cap.type);
      out.push({id:`ritual:capilar:${iso(d)}:${cap.type}`,source:'Ritual Capilar',title:`Ritual Capilar · ${cap.title}`,date:iso(d),minutes:cap.minutes,time:s.time||'',period:s.period||cap.period,priority:s.priority||'Normal',notify:!!s.notify,notifyOffset:s.notifyOffset||'at-time',kind:'ritual'});
    }
    const sc=selfcareEvent(d), ss=ritualSetting('autocuidado','selfcare');
    if(!sc.optional) out.push({id:`ritual:autocuidado:${iso(d)}`,source:'Autocuidado',title:`Autocuidado · ${sc.title}`,date:iso(d),minutes:sc.minutes,time:ss.time||'',period:ss.period||'night',priority:ss.priority||'Normal',notify:!!ss.notify,notifyOffset:ss.notifyOffset||'at-time',kind:'ritual'});
    customEventsOn(d).forEach(e=>out.push({id:`ritual-extra:${e.id}:${iso(d)}`,source:e.ritualTitle||'Ritual',title:e.title,date:iso(d),minutes:+e.minutes||15,time:e.time||'',period:e.period||'flex',priority:e.priority||'Normal',notify:!!e.notify,notifyOffset:e.notifyOffset||'at-time',kind:'ritual'}));
    return out;
  }

  function renderRituals(){
    const cards=ritualCatalog().map(r=>`
      <button class="bertha-ritual-card" type="button" data-open-ritual="${r.id}">
        <span class="bertha-line-icon">${ritualIcon(r.icon)}</span>
        <span><strong>${esc(r.title)}</strong><small>${esc(r.subtitle||'')}</small></span><b>›</b>
      </button>`).join('');
    return `<section class="bertha-ritual-page">
      <section class="bertha-ritual-hero"><div class="bertha-task-kicker">RITUAIS</div><h1>Rotinas que cuidam de você.</h1><p>Você configura uma vez. A BERTH.A traz o cuidado para o seu dia quando ele fizer sentido.</p></section>
      <div class="bertha-section-label">MEUS RITUAIS</div>
      <div class="bertha-ritual-grid">${cards}</div>
      <button class="bertha-new-ritual" type="button" data-new-ritual><span class="bertha-line-icon">${ritualIcon('sparkle')}</span><span><strong>Novo ritual</strong><small>Crie um ritual para qualquer cuidado que queira acompanhar.</small></span><b>›</b></button>
    </section>`;
  }

  function ritualDetailData(id,d=new Date()){
    if(id==='capilar') return capillaryEvent(d);
    if(id==='autocuidado') return selfcareEvent(d);
    return null;
  }
  function renderRitualDetail(id){
    const r=ritualCatalog().find(x=>x.id===id)||defaultRituals()[0], ev=ritualDetailData(id,new Date());
    const extras=ritualEvents().filter(x=>x.ritualId===id);
    let upcoming='';
    for(let i=1;i<=8;i++){const d=new Date();d.setDate(d.getDate()+i);const x=ritualDetailData(id,d);if(x)upcoming+=`<div class="bertha-ritual-upcoming"><span>${d.toLocaleDateString('pt-BR',{day:'2-digit',month:'short'}).replace('.','')}</span><div><strong>${esc(x.title)}</strong><small>${esc(x.subtitle||'')}</small></div></div>`;}
    return `<section class="bertha-ritual-page">
      <a class="bertha-back-link" href="#rituais">‹ Rituais</a>
      <section class="bertha-ritual-detail-hero"><span class="bertha-line-icon large">${ritualIcon(r.icon)}</span><div><div class="bertha-task-kicker">${esc(r.title).toUpperCase()}</div><h1>${id==='capilar'?'Seu cronograma, no lugar certo.':'Cuidar também é ritual.'}</h1><p>${esc(r.subtitle||'')}</p></div></section>
      ${ev?`<section class="bertha-ritual-today"><div class="bertha-ritual-head"><div><span>HOJE · ${dateLabelLong(new Date())}</span><h2>${esc(ev.title)}</h2><p>${esc(ev.subtitle||'')}</p><small class="bertha-cycle-position">${id==='capilar'?`Dia ${capillaryDay(new Date())} de ${capillaryCycleTotal()}`:`Dia ${ev.cycleDay} de 14`}</small></div><button type="button" data-config-ritual="${id}">Editar</button></div>
        ${ev.optional?`<div class="bertha-free-note">Hoje é um espaço livre. A BERTH.A não transforma descanso em pendência.</div>`:`<div class="bertha-ritual-time">${durationText(ev.minutes)} · ${taskLabelPeriod(ritualSetting(id,ev.type).period||ev.period)}</div>`}
        <div class="bertha-check-steps">${(ev.tasks||[]).map(t=>`<label><input type="checkbox"><span>${esc(t)}</span></label>`).join('')}</div>
      </section>`:''}
      <div class="bertha-section-row"><span>PRÓXIMOS DIAS</span>${id==='capilar'?'<button type="button" data-full-capillary>Ver 45 dias</button>':''}</div>
      <div class="bertha-upcoming-list">${upcoming}</div>
      <div class="bertha-section-row"><span>CUIDADOS & EXTRAS</span><button type="button" data-add-ritual-event="${id}">＋ Adicionar</button></div>
      <div class="bertha-extra-list">${extras.length?extras.map(e=>`<button class="bertha-extra-card" data-edit-ritual-event="${e.id}"><span class="bertha-line-icon">${ritualIcon(e.icon||'sparkle')}</span><span><strong>${esc(e.title)}</strong><small>${esc(ritualRepeatLabel(e))} · ${durationText(e.minutes)}</small></span><b>›</b></button>`).join(''):`<div class="bertha-empty-soft">Você pode adicionar corte, coloração, procedimentos ou qualquer outro cuidado aqui.</div>`}</div>
      ${shouldShowCycleActions(id)?cycleActionsHtml(id):''}
      <button type="button" class="bertha-delete-ritual" data-delete-ritual="${id}">Excluir ritual</button>
    </section>`;
  }
  function ritualDurationParts(e){
    if(e.durationValue && e.durationUnit) return {value:e.durationValue,unit:e.durationUnit};
    const mins=Number(e.minutes)||20;
    if(mins%1440===0) return {value:mins/1440,unit:'days'};
    if(mins%60===0) return {value:mins/60,unit:'hours'};
    return {value:mins,unit:'minutes'};
  }
  function ritualDurationMinutes(value,unit){
    const n=Math.max(1,Number(value)||1);
    return unit==='days'?n*1440:unit==='hours'?n*60:n;
  }

  function ritualRepeatLabel(e){
    if(e.repeat==='daily')return 'Todos os dias';
    if(e.repeat==='weekly')return 'Toda semana';
    if(e.repeat==='weekdays')return 'Dias úteis';
    if(e.repeat==='interval')return `A cada ${e.intervalDays||1} dias`;
    return e.date?new Date(e.date+'T00:00:00').toLocaleDateString('pt-BR'):'Pontual';
  }

  function ritualEventDialog(ritualId,eventId=''){
    const existing=ritualEvents().find(x=>x.id===eventId);
    const ritual=ritualCatalog().find(x=>x.id===ritualId);
    const x=existing?{...existing}:{id:uid(),ritualId,ritualTitle:ritual?.title||'Ritual',title:'',icon:'sparkle',date:'',minutes:20,period:'flex',time:'',priority:'Normal',repeat:'none',intervalDays:30,notify:false,notifyOffset:'at-time',notifyTime:'',note:'',steps:''};
    const d=document.createElement('dialog');d.className='bertha-dialog bertha-task-dialog bertha-ritual-dialog';
    d.innerHTML=`<form class="bertha-task-modal" method="dialog">
      <div class="bertha-task-modal-head"><div><span>${esc((ritual?.title||'Ritual').toUpperCase())}</span><h2>${existing?'Editar cuidado':'Adicionar cuidado'}</h2></div><button type="button" data-close>×</button></div>
      <div class="bertha-task-modal-body">
        <label class="bertha-task-field"><span>O que você quer incluir?</span><input data-title value="${esc(x.title)}" placeholder="Ex.: Colorir raiz"></label>
        <div class="bertha-task-field"><span>Ícone</span><div class="bertha-icon-picker">${Object.keys(RITUAL_ICONS).map(k=>`<button type="button" data-icon="${k}" class="${x.icon===k?'active':''}">${ritualIcon(k)}</button>`).join('')}</div></div>
        <div class="bertha-task-two bertha-ritual-date-duration">
          <label class="bertha-task-field"><span>Data <small>opcional</small></span><input data-date type="date" value="${x.date||''}"></label>
          <div class="bertha-task-field"><span>Quanto tempo leva?</span>
            <div class="bertha-duration-input">
              <input data-duration-value type="number" min="1" step="1" inputmode="numeric" value="${ritualDurationParts(x).value}">
              <select data-duration-unit>
                <option value="minutes" ${ritualDurationParts(x).unit==='minutes'?'selected':''}>minutos</option>
                <option value="hours" ${ritualDurationParts(x).unit==='hours'?'selected':''}>horas</option>
                <option value="days" ${ritualDurationParts(x).unit==='days'?'selected':''}>dias</option>
              </select>
            </div>
          </div>
        </div>
        <div class="bertha-task-field"><span>Quando pode acontecer?</span><div class="bertha-segment" data-period-group>${[['flex','Flexível'],['morning','Manhã'],['afternoon','Tarde'],['night','Noite']].map(([v,l])=>`<button type="button" data-period="${v}" class="${x.period===v?'active':''}">${l}</button>`).join('')}</div></div>
        <div class="bertha-task-two"><label class="bertha-task-field"><span>Horário <small>opcional</small></span><input data-time type="time" value="${x.time||''}"></label><div class="bertha-task-field"><span>Prioridade</span><div class="bertha-segment compact" data-priority-group>${[['Baixa','Baixa'],['Normal','Normal'],['Importante','Import.']].map(([v,l])=>`<button type="button" data-priority="${v}" class="${x.priority===v?'active':''}">${l}</button>`).join('')}</div></div></div>
        <label class="bertha-task-field"><span>Repetir</span><select data-repeat><option value="none">Não repetir</option><option value="daily">Todos os dias</option><option value="weekly">Toda semana</option><option value="weekdays">Dias úteis</option><option value="interval">A cada X dias</option></select></label>
        <label class="bertha-task-field bertha-interval-field"><span>A cada quantos dias?</span><input data-interval type="number" min="1" value="${x.intervalDays||30}"></label>
        <label class="bertha-task-field"><span>Etapas / instruções <small>uma por linha</small></span><textarea data-steps placeholder="Ex.: Aplicar somente na raiz">${esc(x.steps||'')}</textarea></label>
        <div class="bertha-notify-box"><label class="bertha-toggle-row"><div><strong>Me avisar?</strong><span>Guardar preferência de lembrete</span></div><input data-notify type="checkbox" ${x.notify?'checked':''}><i></i></label>
          <label class="bertha-task-field bertha-notify-when"><span>Quando avisar?</span><select data-notify-offset><option value="at-time">No horário</option><option value="10">10 min antes</option><option value="30">30 min antes</option><option value="60">1 hora antes</option><option value="period-start">No início do período</option><option value="custom-time">Em um horário escolhido</option></select><label class="bertha-notify-custom"><span>Horário do aviso</span><input data-notify-time type="time" value="${x.notifyTime||''}"></label></label>
        </div>
        <label class="bertha-task-field"><span>Observação <small>opcional</small></span><textarea data-note>${esc(x.note||'')}</textarea></label>
      </div>
      <div class="bertha-task-modal-actions">${existing?'<button class="bertha-delete-soft" type="button" data-delete>Excluir</button>':'<span></span>'}<div><button class="bertha-task-cancel" type="button" data-close>Cancelar</button><button class="bertha-task-save" type="button" data-save>Salvar</button></div></div>
    </form>`;
    document.body.appendChild(d);
    d.querySelector('[data-repeat]').value=x.repeat||'none';
    d.querySelector('[data-notify-offset]').value=x.notifyOffset||'at-time';
    const sync=()=>{d.querySelector('.bertha-interval-field').hidden=d.querySelector('[data-repeat]').value!=='interval';d.querySelector('.bertha-notify-when').hidden=!d.querySelector('[data-notify]').checked;d.querySelector('.bertha-notify-custom').hidden=d.querySelector('[data-notify-offset]').value!=='custom-time';};sync();
    d.querySelector('[data-repeat]').onchange=sync;d.querySelector('[data-notify]').onchange=sync;d.querySelector('[data-notify-offset]').onchange=sync;
    d.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>{d.close();d.remove()});
    d.querySelectorAll('[data-icon]').forEach(b=>b.onclick=()=>d.querySelectorAll('[data-icon]').forEach(z=>z.classList.toggle('active',z===b)));
    d.querySelectorAll('[data-period]').forEach(b=>b.onclick=()=>d.querySelectorAll('[data-period]').forEach(z=>z.classList.toggle('active',z===b)));
    d.querySelectorAll('[data-priority]').forEach(b=>b.onclick=()=>d.querySelectorAll('[data-priority]').forEach(z=>z.classList.toggle('active',z===b)));
    d.querySelector('[data-save]').onclick=()=>{
      const title=d.querySelector('[data-title]').value.trim();if(!title){d.querySelector('[data-title]').focus();return;}
      const durationValue=+d.querySelector('[data-duration-value]').value||1, durationUnit=d.querySelector('[data-duration-unit]').value;
      Object.assign(x,{title,icon:d.querySelector('[data-icon].active')?.dataset.icon||'sparkle',date:d.querySelector('[data-date]').value,durationValue,durationUnit,minutes:ritualDurationMinutes(durationValue,durationUnit),period:d.querySelector('[data-period].active')?.dataset.period||'flex',time:d.querySelector('[data-time]').value,priority:d.querySelector('[data-priority].active')?.dataset.priority||'Normal',repeat:d.querySelector('[data-repeat]').value,intervalDays:+d.querySelector('[data-interval]').value||30,notify:d.querySelector('[data-notify]').checked,notifyOffset:d.querySelector('[data-notify-offset]').value,notifyTime:d.querySelector('[data-notify-time]').value,steps:d.querySelector('[data-steps]').value,note:d.querySelector('[data-note]').value});
      if(x.repeat==='weekly') x.weekday=x.date?new Date(x.date+'T00:00:00').getDay():new Date().getDay();
      if(x.repeat==='interval'&&!x.startDate)x.startDate=x.date||iso(new Date());
      const arr=ritualEvents(),i=arr.findIndex(e=>e.id===x.id);if(i>=0)arr[i]=x;else arr.push(x);saveRitualEvents(arr);d.close();d.remove();rerender();
    };
    d.querySelector('[data-delete]')?.addEventListener('click',()=>{if(confirm('Excluir este cuidado?')){saveRitualEvents(ritualEvents().filter(e=>e.id!==x.id));d.close();d.remove();rerender();}});
    d.addEventListener('cancel',e=>{e.preventDefault();d.close();d.remove()});d.showModal();
  }

  function ritualSettingsDialog(id){
    const ev=ritualDetailData(id,new Date()); if(!ev)return;
    const key=id==='capilar'?CAPILLARY_SETTINGS_KEY:SELFCARE_SETTINGS_KEY, all=read(key,{}), type=ev.type, x={...ritualDefaultSettings(id,type),...(all[type]||{})};
    const d=document.createElement('dialog');d.className='bertha-dialog bertha-task-dialog';
    d.innerHTML=`<form class="bertha-task-modal" method="dialog"><div class="bertha-task-modal-head"><div><span>RITUAL</span><h2>Configurar ${esc(id==='capilar'?'Ritual Capilar':'Autocuidado')}</h2></div><button type="button" data-close>×</button></div><div class="bertha-task-modal-body">
      <div class="bertha-task-field"><span>Quando pode acontecer?</span><div class="bertha-segment">${[['flex','Flexível'],['morning','Manhã'],['afternoon','Tarde'],['night','Noite']].map(([v,l])=>`<button type="button" data-period="${v}" class="${x.period===v?'active':''}">${l}</button>`).join('')}</div></div>
      <label class="bertha-task-field"><span>Horário <small>opcional</small></span><input data-time type="time" value="${x.time||''}"></label>
      <div class="bertha-task-field"><span>Prioridade</span><div class="bertha-segment">${['Baixa','Normal','Importante'].map(v=>`<button type="button" data-priority="${v}" class="${x.priority===v?'active':''}">${v}</button>`).join('')}</div></div>
      <div class="bertha-notify-box"><label class="bertha-toggle-row"><div><strong>Me avisar?</strong><span>Guardar preferência de lembrete</span></div><input data-notify type="checkbox" ${x.notify?'checked':''}><i></i></label></div>
      <div class="bertha-schedule-note">${id==='capilar'?'O cronograma-base de 45 dias permanece preservado. Corte, coloração e outros cuidados entram em “Cuidados & extras”.':'O ciclo-base de 14 dias continua automaticamente. Novos cuidados podem ser adicionados sem alterar o ciclo.'}</div>
    </div><div class="bertha-task-modal-actions"><span></span><div><button class="bertha-task-cancel" type="button" data-close>Cancelar</button><button class="bertha-task-save" type="button" data-save>Salvar</button></div></div></form>`;
    document.body.appendChild(d);d.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>{d.close();d.remove()});d.querySelectorAll('[data-period]').forEach(b=>b.onclick=()=>d.querySelectorAll('[data-period]').forEach(z=>z.classList.toggle('active',z===b)));d.querySelectorAll('[data-priority]').forEach(b=>b.onclick=()=>d.querySelectorAll('[data-priority]').forEach(z=>z.classList.toggle('active',z===b)));
    d.querySelector('[data-save]').onclick=()=>{all[type]={...x,period:d.querySelector('[data-period].active')?.dataset.period||'flex',time:d.querySelector('[data-time]').value,priority:d.querySelector('[data-priority].active')?.dataset.priority||'Normal',notify:d.querySelector('[data-notify]').checked};write(key,all);d.close();d.remove();rerender();};d.showModal();
  }


  const RITUAL_CYCLES_KEY='bertha.ritual.cycles.v1';
  function ritualCycles(){ return read(RITUAL_CYCLES_KEY,{}); }
  function saveRitualCycles(v){ write(RITUAL_CYCLES_KEY,v); }
  function currentCycleState(id){
    const all=ritualCycles();
    return all[id]||{number:1,status:'active',mode:'template',revisions:[]};
  }
  function cloneCycle(id,review=false){
    const all=ritualCycles(), prev=currentCycleState(id);
    all[id]={...prev,number:(prev.number||1)+1,status:'active',mode:review?'review':'same',
      revisions:[...(prev.revisions||[]),{from:prev.number||1,at:new Date().toISOString(),review}]};
    saveRitualCycles(all);
    if(review){
      alert('Novo ciclo criado como cópia do anterior. Você pode alterar apenas o que quiser em Cuidados & Extras e nas configurações do ritual.');
    }else{
      alert('Novo ciclo criado repetindo a configuração anterior.');
    }
    rerender();
  }
  function endCycle(id){
    const all=ritualCycles(), prev=currentCycleState(id);
    all[id]={...prev,status:'ended',endedAt:new Date().toISOString()};
    saveRitualCycles(all); rerender();
  }
  function shouldShowCycleActions(id){
    const today=dayStart(new Date());
    if(id==='autocuidado'){
      const diff=Math.floor((today-SELFCARE_START)/86400000);
      return diff>=13; // only on/after final day of the 14-day cycle
    }
    if(id==='capilar') return today>=dayStart(CAPILLARY_END);
    return false;
  }
  function cycleActionsHtml(id){
    const c=currentCycleState(id);
    return `<section class="bertha-cycle-actions">
      <div><span>PRÓXIMO CICLO</span><h3>Ciclo ${c.number||1}</h3><p>Ao terminar, você pode repetir tudo, revisar uma cópia ou encerrar.</p></div>
      <div class="bertha-cycle-buttons">
        <button type="button" data-repeat-cycle="${id}">Repetir igual</button>
        <button type="button" data-review-cycle="${id}">Revisar e repetir</button>
        <button type="button" class="quiet" data-end-cycle="${id}">Encerrar</button>
      </div>
    </section>`;
  }


  function fullSelfcareSchedule(){
    const d=modalShell('Ciclo de Autocuidado','14 dias');
    let rows='';
    for(let i=0;i<14;i++){
      const date=new Date(SELFCARE_START); date.setDate(SELFCARE_START.getDate()+i);
      const ev=selfcareEvent(date);
      if(!ev)continue;
      rows+=`<div class="bertha-full-schedule-row">
        <span>${date.toLocaleDateString('pt-BR',{day:'2-digit',month:'short'}).replace('.','')}</span>
        <div><strong>${esc(ev.title)}</strong><small>Dia ${i+1} de 14${ev.optional?' · Livre':` · ${durationText(ev.minutes)} · ${taskLabelPeriod(ritualSetting('autocuidado',ev.type).period||ev.period)}`}</small></div>
      </div>`;
    }
    d.querySelector('.bertha-modal-content').innerHTML=`<div class="bertha-full-schedule">${rows}</div>`;
  }

  function fullCapillarySchedule(){
    let html='<div class="bertha-full-schedule">';for(let i=0;i<45;i++){const d=new Date(CAPILLARY_START);d.setDate(d.getDate()+i);const e=capillaryEvent(d);html+=`<div><b>Dia ${i+1} · ${d.toLocaleDateString('pt-BR')}</b><span>${esc(e.title)}${e.subtitle?' · '+esc(e.subtitle):''}</span></div>`;}html+='</div>';dialogBase('Cronograma capilar · 45 dias',html);
  }
  function newRitualDialog(){
    const d=document.createElement('dialog');d.className='bertha-dialog bertha-task-dialog';
    d.innerHTML=`<form class="bertha-task-modal" method="dialog"><div class="bertha-task-modal-head"><div><span>RITUAIS</span><h2>Novo ritual</h2></div><button type="button" data-close>×</button></div><div class="bertha-task-modal-body"><label class="bertha-task-field"><span>Nome do ritual</span><input data-title placeholder="Ex.: Sono"></label><div class="bertha-task-field"><span>Ícone</span><div class="bertha-icon-picker">${Object.keys(RITUAL_ICONS).map((k,i)=>`<button type="button" data-icon="${k}" class="${i===0?'active':''}">${ritualIcon(k)}</button>`).join('')}</div></div><label class="bertha-task-field"><span>Descrição <small>opcional</small></span><input data-subtitle placeholder="O que faz parte deste ritual?"></label></div><div class="bertha-task-modal-actions"><span></span><div><button class="bertha-task-cancel" type="button" data-close>Cancelar</button><button class="bertha-task-save" type="button" data-save>Criar</button></div></div></form>`;
    document.body.appendChild(d);d.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>{d.close();d.remove()});d.querySelectorAll('[data-icon]').forEach(b=>b.onclick=()=>d.querySelectorAll('[data-icon]').forEach(z=>z.classList.toggle('active',z===b)));d.querySelector('[data-save]').onclick=()=>{const title=d.querySelector('[data-title]').value.trim();if(!title)return;const arr=read(RITUALS_KEY,[]),id='ritual-'+Date.now();arr.push({id,title,subtitle:d.querySelector('[data-subtitle]').value.trim(),icon:d.querySelector('[data-icon].active')?.dataset.icon||'sparkle'});write(RITUALS_KEY,arr);d.close();d.remove();location.hash='#ritual-'+id;};d.showModal();
  }

  function applyHiddenRituals(){
    const hidden=hiddenRituals();
    hidden.forEach(id=>{
      document.querySelectorAll(`[data-open-ritual="${id}"],[data-ritual="${id}"]`).forEach(el=>el.style.display='none');
    });
  }
  function bindRituals(){
    applyHiddenRituals();
    document.querySelectorAll('[data-open-ritual]').forEach(b=>b.onclick=()=>location.hash='#ritual-'+b.dataset.openRitual);
    document.querySelector('[data-new-ritual]')?.addEventListener('click',newRitualDialog);
  }

  const HIDDEN_RITUALS_KEY='bertha.ritual.hidden.v1';
  function hiddenRituals(){ return read(HIDDEN_RITUALS_KEY,[]); }
  function deleteRitual(id){
    if(!confirm('Excluir este ritual? Ele deixará de aparecer em Meus Rituais e de alimentar o Meu Dia.')) return;
    if(id==='capilar'||id==='autocuidado'){
      const h=hiddenRituals(); if(!h.includes(id))h.push(id); write(HIDDEN_RITUALS_KEY,h);
    }else{
      const customs=customRituals().filter(r=>r.id!==id); saveCustomRituals(customs);
      const extras=ritualExtras().filter(e=>e.ritualId!==id); saveRitualExtras(extras);
    }
    location.hash='#rituais'; rerender();
  }

  function bindRitualDetail(id){
    document.querySelector('[data-config-ritual]')?.addEventListener('click',()=>ritualSettingsDialog(id));
    document.querySelector('[data-add-ritual-event]')?.addEventListener('click',()=>ritualEventDialog(id));
    document.querySelectorAll('[data-edit-ritual-event]').forEach(b=>b.onclick=()=>ritualEventDialog(id,b.dataset.editRitualEvent));
    document.querySelector('[data-full-capillary]')?.addEventListener('click',fullCapillarySchedule);
    document.querySelector('[data-full-selfcare]')?.addEventListener('click',fullSelfcareSchedule);
    document.querySelector('[data-repeat-cycle]')?.addEventListener('click',()=>cloneCycle(id,false));
    document.querySelector('[data-review-cycle]')?.addEventListener('click',()=>cloneCycle(id,true));
    document.querySelector('[data-end-cycle]')?.addEventListener('click',()=>{if(confirm('Encerrar este ciclo? O histórico será preservado.')) endCycle(id);});
    document.querySelector('[data-delete-ritual]')?.addEventListener('click',()=>deleteRitual(id));
  }

  function bindHome(){ document.querySelectorAll('[data-start]').forEach(b=>b.onclick=()=>{const x=sourcesToday().find(i=>i.id===b.dataset.start);if(x)startItem(x)}); document.querySelectorAll('[data-postpone]').forEach(b=>b.onclick=()=>{const x=sourcesToday().find(i=>i.id===b.dataset.postpone);if(x)postponeDialog(x)}); const f=document.querySelector('[data-finish-active]'); if(f)f.onclick=finishActive; }
  function bindIdeal(){ const a=document.querySelector('[data-add-ideal]');if(a)a.onclick=addIdealDialog;document.querySelectorAll('[data-del-ideal]').forEach(b=>b.onclick=()=>{write(IDEAL_KEY,read(IDEAL_KEY,[]).filter(x=>x.id!==b.dataset.delIdeal));rerender()}) }

  function ensureStyles(){
    let s=document.getElementById('bertha-time-v1-style');
    if(!s){s=document.createElement('style');s.id='bertha-time-v1-style';document.head.appendChild(s)}
    s.textContent=`
    /* BERTH.A — identidade funcional v1.3 */
    .topbar>div{min-width:0}
    .topbar .eyebrow{
      text-transform:none!important;
      letter-spacing:0!important;
      font-family:"Segoe Print","Bradley Hand","Chalkboard SE","Comic Sans MS",cursive!important;
      font-size:18px!important;
      line-height:1.08!important;
      font-weight:400!important;
      color:#a05b83!important;
      margin-top:5px!important;
      white-space:nowrap;
      transform:rotate(-1deg);
      transform-origin:left center;
    }
    #pageTitle{
      font-family:Inter,-apple-system,BlinkMacSystemFont,"SF Pro Display","Helvetica Neue",sans-serif!important;
      font-size:31px!important;
      line-height:1!important;
      font-weight:790!important;
      letter-spacing:.025em!important;
      color:#493b50!important;
      margin-top:3px!important;
    }
    .bertha-brand{display:none!important}
    #app .day-hero,#app .hero{
      box-shadow:0 10px 28px rgba(91,69,98,.075)!important;
    }
    #app .day-hero h1,#app .hero h1{
      color:#3f3545!important;
    }
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
      width:24px;height:24px;display:block;margin:0 auto 4px;
    }
    .bottom-nav .nav-item>span:last-child{font-size:11px!important;font-weight:700!important}
    .bertha-nav-mark{
      width:auto!important;
      min-width:32px;
      display:flex!important;align-items:center;justify-content:center;
      font-family:Georgia,"Times New Roman",serif!important;
      font-size:17px!important;font-weight:600!important;letter-spacing:-.08em!important;
      color:#755579!important;
      text-shadow:0 1px 0 rgba(255,255,255,.8);
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
      padding:1px 0 17px!important;
      color:#6f6573!important;
      font-family:"Montserrat","Avenir Next",Inter,-apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif!important;
      font-size:13px!important;
      line-height:1.35!important;
      font-weight:300!important;
      letter-spacing:.015em!important;
    }
    .module-links.bertha-module-cards{
      display:grid!important;
      grid-template-columns:repeat(3,minmax(0,1fr))!important;
      gap:10px!important;
    }
    .module-links.bertha-module-cards a{
      min-height:92px!important;
      box-sizing:border-box;
      display:flex!important;
      flex-direction:column!important;
      align-items:center!important;
      justify-content:center!important;
      gap:8px!important;
      text-align:center!important;
      padding:11px 6px 10px!important;
      border:1px solid rgba(92,72,104,.13)!important;
      border-bottom-color:rgba(92,72,104,.22)!important;
      border-radius:18px!important;
      background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(251,247,249,.96))!important;
      box-shadow:
        0 7px 0 rgba(109,87,115,.07),
        0 11px 18px rgba(73,56,78,.08),
        inset 0 1px 0 rgba(255,255,255,1)!important;
      color:#4f4553!important;
      font-family:Inter,-apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif!important;
      font-size:11.5px!important;
      line-height:1.12!important;
      font-weight:720!important;
      text-decoration:none!important;
      transition:transform .08s ease,box-shadow .08s ease;
    }
    .module-links.bertha-module-cards a:active{
      transform:translateY(4px)!important;
      box-shadow:0 3px 0 rgba(109,87,115,.06),0 6px 10px rgba(73,56,78,.06)!important;
    }
    .module-links.bertha-module-cards a:last-child:nth-child(odd){grid-column:auto!important}
    .bertha-menu-icon{
      flex:0 0 43px;width:43px;height:43px;border-radius:14px;
      display:grid;place-items:center;
      background:#f7f2f6;
      box-shadow:inset 0 0 0 1px rgba(92,72,104,.06);
    }
    .bertha-menu-icon svg{width:24px;height:24px;display:block;stroke-width:1.8}
    .module-links.bertha-module-cards a:nth-child(1) .bertha-menu-icon{color:#b75f87;background:#fbeaf2}
    .module-links.bertha-module-cards a:nth-child(2) .bertha-menu-icon{color:#8065a6;background:#f0eafb}
    .module-links.bertha-module-cards a:nth-child(3) .bertha-menu-icon{color:#548e84;background:#e9f6f2}
    .module-links.bertha-module-cards a:nth-child(4) .bertha-menu-icon{color:#c17c62;background:#fff0e9}
    .module-links.bertha-module-cards a:nth-child(5) .bertha-menu-icon{color:#5484ad;background:#eaf4fc}
    .module-links.bertha-module-cards a:nth-child(6) .bertha-menu-icon{color:#b58642;background:#fff4dc}
    .module-links.bertha-module-cards a:nth-child(7) .bertha-menu-icon{color:#9b668d;background:#f7eaf3}
    .module-links.bertha-module-cards a:nth-child(8) .bertha-menu-icon{color:#6e75a5;background:#eeeffa}
    .module-links.bertha-module-cards a:nth-child(9) .bertha-menu-icon{color:#4f9483;background:#e8f5f0}
    @media(max-width:380px){
      .bertha-focus button{padding:8px 10px}
      .bertha-time-row{grid-template-columns:20px 84px 1fr!important}
      .topbar .eyebrow{font-size:16px!important}
      #pageTitle{font-size:28px!important}
      .module-links.bertha-module-cards{gap:8px!important}
      .module-links.bertha-module-cards a{font-size:10.5px!important;min-height:86px!important;padding:9px 4px!important}
      .bertha-menu-icon{width:39px;height:39px;flex-basis:39px}
      .bertha-menu-icon svg{width:22px;height:22px}
    }

    /* BERTH.A v1.3 — identidade oficial + fade */
    .topbar .eyebrow{display:none!important}
    #pageTitle{
      display:flex!important;align-items:center;justify-content:center!important;
      width:100%!important;max-width:310px!important;margin:0 auto!important;
      font-size:0!important;line-height:0!important;
    }
    #pageTitle .bertha-official-logo{
      display:block;width:min(100%,300px);height:auto;
      mix-blend-mode:multiply;
    }

    /* Saudação: abertura mais compacta; AGORA ganha hierarquia */
    #app .day-hero{
      padding-top:22px!important;padding-bottom:20px!important;
      min-height:0!important;
      box-shadow:0 8px 22px rgba(91,69,98,.055)!important;
    }
    #app .day-hero h1{
      font-size:clamp(30px,8.2vw,39px)!important;
      line-height:1.02!important;margin-top:8px!important;margin-bottom:7px!important;
    }
    #app .day-hero .day-date{margin-top:0!important}
    #app .bertha-now{
      background:linear-gradient(155deg,#fffaf5 0%,#fbf3f5 54%,#f7f1f7 100%)!important;
      border:1px solid rgba(128,94,137,.16)!important;
      box-shadow:0 9px 24px rgba(83,62,89,.07)!important;
    }
    #app .bertha-now .card-kicker{color:#8d668d!important}
    #app .bertha-now .now-title{color:#433847!important}
    #app .bertha-now p{color:#6f6573!important;line-height:1.45!important}
    #app .bertha-now p strong{color:#55485b!important;font-weight:720!important}

    /* Timeline: cor como informação, não como faixa infantil */
    .bertha-timeline{display:grid!important;gap:9px!important}
    .bertha-time-row{
      position:relative!important;
      padding:12px 13px 12px 14px!important;
      border-radius:16px!important;
      background:linear-gradient(180deg,rgba(255,252,249,.96),rgba(250,246,245,.96))!important;
      border:1px solid rgba(88,70,94,.08)!important;
      box-shadow:0 5px 13px rgba(73,56,78,.045)!important;
      overflow:hidden!important;
    }
    .bertha-time-row::before{
      content:"";position:absolute;left:0;top:8px;bottom:8px;width:4px;border-radius:0 5px 5px 0;
      background:#d99bb7;
    }
    .bertha-time-row:nth-child(2)::before{background:#8fc4df}
    .bertha-time-row:nth-child(3)::before{background:#e5c66f}
    .bertha-time-row:nth-child(4)::before{background:#c8a7d8}
    .bertha-time-row:nth-child(5)::before{background:#91c9b7}
    .bertha-time-row i{font-size:17px!important;color:#a36b91!important}
    .bertha-time-row:nth-child(2) i{color:#5d96b6!important}
    .bertha-time-row:nth-child(3) i{color:#b58a32!important}
    .bertha-time-row:nth-child(4) i{color:#8b69a1!important}
    .bertha-time-row:nth-child(5) i{color:#5c9987!important}
    .bertha-time-row b{color:#625866!important;font-weight:700!important}
    .bertha-time-row span{color:#746b76!important}

    /* Barra inferior: símbolo oficial e estado ativo legível */
    .bertha-nav-mark{
      width:34px!important;height:26px!important;min-width:34px!important;
      background-image:url("data:image/png;base64,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")!important;
      background-size:contain!important;background-position:center!important;background-repeat:no-repeat!important;
      font-size:0!important;color:transparent!important;
      mix-blend-mode:multiply;
    }
    .bottom-nav .nav-item{color:#69616d!important}
    .bottom-nav .nav-item>span:last-child{font-weight:720!important;color:currentColor!important}
    .bottom-nav .nav-item.active,.bottom-nav .nav-item[aria-current="page"]{color:#9b5f83!important}

    /* Menu: 3x3, cor contínua que se dissolve no bege */
    #berthaMore .bertha-modal{
      background:linear-gradient(180deg,#fffaf5 0%,#fbf5ef 100%)!important;
    }
    .bertha-menu-sub{color:#746b76!important}
    .module-links.bertha-module-cards a{
      border:1px solid rgba(91,72,96,.10)!important;
      border-bottom-color:rgba(91,72,96,.17)!important;
      box-shadow:0 7px 0 rgba(102,82,106,.065),0 11px 18px rgba(73,56,78,.07)!important;
    }
    .bertha-menu-icon{
      width:38px!important;height:38px!important;flex-basis:38px!important;
      border-radius:0!important;background:transparent!important;box-shadow:none!important;
    }
    .bertha-menu-icon svg{width:29px!important;height:29px!important;stroke-width:1.75!important}

    /* Linha 1 — cor presente */
    .module-links.bertha-module-cards a:nth-child(1){
      background:linear-gradient(180deg,#f5bfd3 0%,#f8d7e3 62%,#f9e7e7 100%)!important;color:#9f4f73!important}
    .module-links.bertha-module-cards a:nth-child(2){
      background:linear-gradient(180deg,#d6c0ed 0%,#e3d6f1 62%,#eee4ea 100%)!important;color:#74569b!important}
    .module-links.bertha-module-cards a:nth-child(3){
      background:linear-gradient(180deg,#addbd5 0%,#cce7e0 62%,#e6eee6 100%)!important;color:#397f75!important}

    /* Linha 2 — tonalidade média */
    .module-links.bertha-module-cards a:nth-child(4){
      background:linear-gradient(180deg,#f5d4c8 0%,#f8e1d8 62%,#f8e9df 100%)!important;color:#a96852!important}
    .module-links.bertha-module-cards a:nth-child(5){
      background:linear-gradient(180deg,#cfe3f1 0%,#deebf2 62%,#edf0ec 100%)!important;color:#4e82a4!important}
    .module-links.bertha-module-cards a:nth-child(6){
      background:linear-gradient(180deg,#f5e2ae 0%,#f7eac8 62%,#f7eddd 100%)!important;color:#9e7937!important}

    /* Linha 3 — quase fundida ao bege do modal */
    .module-links.bertha-module-cards a:nth-child(7){
      background:linear-gradient(180deg,#f4e4e7 0%,#f7ece9 65%,#f8f0e9 100%)!important;color:#95647d!important}
    .module-links.bertha-module-cards a:nth-child(8){
      background:linear-gradient(180deg,#ebe5ef 0%,#f1ebee 65%,#f8f0e9 100%)!important;color:#706a98!important}
    .module-links.bertha-module-cards a:nth-child(9){
      background:linear-gradient(180deg,#e3eee8 0%,#edf1eb 65%,#f8f0e9 100%)!important;color:#4f887c!important}

    .module-links.bertha-module-cards a .bertha-menu-icon{color:currentColor!important}
    .module-links.bertha-module-cards a>span:last-child{color:currentColor!important;font-weight:740!important}


    /* BERTH.A v1.4 — VISUAL APROVADO */
    body{background:#fff9f2!important}

    /* Cabeçalho: logo real limpa, central, sem retângulo de fundo */
    .topbar{align-items:center!important}
    #pageTitle{max-width:285px!important}
    #pageTitle .bertha-official-logo{
      width:min(100%,280px)!important;
      background:transparent!important;
      mix-blend-mode:normal!important;
      filter:none!important;
    }

    /* Saudação mais delicada */
    #app .day-hero{
      position:relative!important;
      padding:22px 145px 20px 24px!important;
      min-height:142px!important;
      background:linear-gradient(135deg,#fff4f5 0%,#fdf6f3 55%,#fbf2f7 100%)!important;
      border:1px solid rgba(205,145,175,.18)!important;
    }
    #app .day-hero h1{
      font-family:Georgia,"Times New Roman",serif!important;
      font-size:clamp(29px,7.8vw,37px)!important;
      font-weight:400!important;
      letter-spacing:-.025em!important;
      color:#3f3545!important;
    }
    #app .day-hero::after{
      content:"☾\A\A DIAS LEVES\A TAMBÉM\A CONSTROEM\A GRANDES\A VIDAS.";
      white-space:pre;
      position:absolute;right:21px;top:24px;
      width:102px;text-align:center;
      color:#8f8191;
      font-family:Inter,-apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif;
      font-size:9.5px;line-height:1.35;letter-spacing:.16em;
    }
    #app .day-hero::first-line{font-size:26px;color:#d7a4bb}

    /* AGORA com presença suave e sem branco puro */
    #app .bertha-now{
      position:relative!important;
      padding-right:145px!important;
      background:
        radial-gradient(circle at 14% 15%,rgba(241,183,217,.34),transparent 34%),
        radial-gradient(circle at 82% 22%,rgba(206,192,243,.25),transparent 36%),
        radial-gradient(circle at 92% 85%,rgba(247,224,164,.28),transparent 36%),
        #fff9f3!important;
      min-height:170px!important;
    }
    #app .bertha-now::after{
      content:"♧\A —\A RESPIRO\A FOCO\A EQUILÍBRIO\A MOVIMENTO\A VOCÊ";
      white-space:pre;
      position:absolute;right:20px;top:28px;
      width:102px;text-align:center;
      color:#8a728f;
      font-family:Inter,-apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif;
      font-size:9.5px;line-height:1.35;letter-spacing:.16em;
    }

    /* O que importa hoje: nada de branco puro */
    .bertha-empty{
      background:linear-gradient(180deg,#fff8f3 0%,#fcf5f1 100%)!important;
      border-color:rgba(114,91,121,.18)!important;
      color:#746b76!important;
    }

    /* Timeline aprovada: cards suaves, coloridos e sem branco */
    .bertha-time-row{
      background:linear-gradient(180deg,#fff7f4 0%,#fbf0f2 100%)!important;
      border-color:rgba(111,85,118,.08)!important;
    }
    .bertha-time-row:nth-child(2){
      background:linear-gradient(180deg,#f5f4ff 0%,#eef1fb 100%)!important;
    }
    .bertha-time-row:nth-child(3){
      background:linear-gradient(180deg,#fff8ec 0%,#fbf0dd 100%)!important;
    }
    .bertha-time-row:nth-child(4){
      background:linear-gradient(180deg,#faf5fc 0%,#f4edf8 100%)!important;
    }

    /* Bottom nav: sem fundo de destaque; B•A sozinho */
    .bottom-nav{
      background:transparent!important;
      border:0!important;
      box-shadow:none!important;
      backdrop-filter:none!important;
    }
    .bottom-nav .nav-item{
      background:transparent!important;
      border:0!important;
      box-shadow:none!important;
    }
    .bottom-nav .nav-item.active,
    .bottom-nav .nav-item[aria-current="page"]{
      background:transparent!important;
      box-shadow:none!important;
    }
    .bottom-nav .nav-item[data-route="meu-dia"]>span:last-child{display:none!important}
    .bertha-nav-mark{
      width:42px!important;height:34px!important;min-width:42px!important;
      background-image:url("data:image/png;base64,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")!important;
      background-size:contain!important;background-position:center!important;background-repeat:no-repeat!important;
      mix-blend-mode:normal!important;
      filter:none!important;
      margin-bottom:0!important;
    }

    /* MENU FINAL: colunas fixas rosa | lilás | azul; fade vertical */
    #berthaMore .bertha-modal{
      background:linear-gradient(180deg,#fffaf6 0%,#fbf4ee 100%)!important;
    }
    .module-links.bertha-module-cards a{
      border:1px solid rgba(93,72,101,.10)!important;
      border-bottom-color:rgba(93,72,101,.15)!important;
      box-shadow:0 7px 0 rgba(102,82,106,.055),0 11px 18px rgba(73,56,78,.055)!important;
    }
    .bertha-menu-icon{
      width:39px!important;height:39px!important;flex-basis:39px!important;
      background:transparent!important;border-radius:0!important;box-shadow:none!important;
    }
    .bertha-menu-icon svg{width:30px!important;height:30px!important}

    /* linha 1 — intensidade média */
    .module-links.bertha-module-cards a:nth-child(1){
      background:linear-gradient(180deg,#f6c9d9 0%,#f8dce6 70%,#fae8eb 100%)!important;color:#b64d79!important}
    .module-links.bertha-module-cards a:nth-child(2){
      background:linear-gradient(180deg,#dcc7ee 0%,#e8d9f2 70%,#f0e7f3 100%)!important;color:#75519e!important}
    .module-links.bertha-module-cards a:nth-child(3){
      background:linear-gradient(180deg,#c8e1f3 0%,#d9eaf6 70%,#e9f2f7 100%)!important;color:#3f78a2!important}

    /* linha 2 — mais clara, mesmas colunas */
    .module-links.bertha-module-cards a:nth-child(4){
      background:linear-gradient(180deg,#f8dde6 0%,#fae8ec 72%,#fbefef 100%)!important;color:#c45f84!important}
    .module-links.bertha-module-cards a:nth-child(5){
      background:linear-gradient(180deg,#e9ddf2 0%,#f0e8f5 72%,#f5eff4 100%)!important;color:#805ca6!important}
    .module-links.bertha-module-cards a:nth-child(6){
      background:linear-gradient(180deg,#deebf5 0%,#eaf2f7 72%,#f2f6f6 100%)!important;color:#4e82aa!important}

    /* linha 3 — quase no bege do fundo */
    .module-links.bertha-module-cards a:nth-child(7){
      background:linear-gradient(180deg,#f8e9ec 0%,#faefef 72%,#fbf3ee 100%)!important;color:#bd6683!important}
    .module-links.bertha-module-cards a:nth-child(8){
      background:linear-gradient(180deg,#f0eaf3 0%,#f4eff4 72%,#faf3ee 100%)!important;color:#775f98!important}
    .module-links.bertha-module-cards a:nth-child(9){
      background:linear-gradient(180deg,#edf3f7 0%,#f3f5f5 72%,#faf3ee 100%)!important;color:#557e9b!important}

    .module-links.bertha-module-cards a .bertha-menu-icon{color:currentColor!important}
    .module-links.bertha-module-cards a>span:last-child{color:currentColor!important}

    @media(max-width:390px){
      #app .day-hero{padding-right:125px!important}
      #app .bertha-now{padding-right:124px!important}
      #app .day-hero::after,#app .bertha-now::after{right:12px;width:92px;font-size:8.6px}
    }


    /* BERTH.A v1.6 — correções de polimento */
    /* 1) Barra inferior: recupera a cápsula, sem fundo rosa atrás do B•A */
    .bottom-nav{
      background:rgba(255,250,246,.96)!important;
      border:1px solid rgba(106,86,112,.13)!important;
      box-shadow:0 8px 28px rgba(70,55,76,.10)!important;
      backdrop-filter:blur(18px)!important;
      -webkit-backdrop-filter:blur(18px)!important;
      border-radius:28px!important;
    }
    .bottom-nav .nav-item{
      background:transparent!important;
      box-shadow:none!important;
    }
    .bottom-nav .nav-item.active,
    .bottom-nav .nav-item[aria-current="page"]{
      background:transparent!important;
      box-shadow:none!important;
    }

    /* 2) Saudação: tipografia mais elegante e sem quebra ruim no iPhone */
    #app .day-hero h1{
      font-family:Didot,"Bodoni 72","Bodoni 72 Smallcaps",Georgia,"Times New Roman",serif!important;
      font-size:clamp(29px,8vw,35px)!important;
      line-height:1.02!important;
      font-weight:400!important;
      letter-spacing:-.025em!important;
      white-space:nowrap!important;
    }

    /* No iPhone real, os textos decorativos laterais comprimiam o conteúdo.
       Mantemos o visual limpo e priorizamos a hierarquia aprovada. */
    @media(max-width:430px){
      #app .day-hero{
        padding-right:24px!important;
        min-height:0!important;
      }
      #app .day-hero::after{display:none!important}
      #app .bertha-now{
        padding-right:24px!important;
      }
      #app .bertha-now::after{display:none!important}
    }

    /* 3) Menu: mesmo degradê aprovado, só com um pouco mais de luz */
    .module-links.bertha-module-cards a{
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,.86),
        inset 0 10px 22px rgba(255,255,255,.16),
        0 7px 0 rgba(102,82,106,.055),
        0 11px 18px rgba(73,56,78,.055)!important;
    }
    .module-links.bertha-module-cards a:nth-child(1){
      background:
        radial-gradient(circle at 24% 14%,rgba(255,255,255,.46),transparent 38%),
        linear-gradient(180deg,#f6c9d9 0%,#f8dce6 70%,#fae8eb 100%)!important}
    .module-links.bertha-module-cards a:nth-child(2){
      background:
        radial-gradient(circle at 24% 14%,rgba(255,255,255,.44),transparent 38%),
        linear-gradient(180deg,#dcc7ee 0%,#e8d9f2 70%,#f0e7f3 100%)!important}
    .module-links.bertha-module-cards a:nth-child(3){
      background:
        radial-gradient(circle at 24% 14%,rgba(255,255,255,.44),transparent 38%),
        linear-gradient(180deg,#c8e1f3 0%,#d9eaf6 70%,#e9f2f7 100%)!important}
    .module-links.bertha-module-cards a:nth-child(4){
      background:
        radial-gradient(circle at 24% 14%,rgba(255,255,255,.42),transparent 38%),
        linear-gradient(180deg,#f8dde6 0%,#fae8ec 72%,#fbefef 100%)!important}
    .module-links.bertha-module-cards a:nth-child(5){
      background:
        radial-gradient(circle at 24% 14%,rgba(255,255,255,.42),transparent 38%),
        linear-gradient(180deg,#e9ddf2 0%,#f0e8f5 72%,#f5eff4 100%)!important}
    .module-links.bertha-module-cards a:nth-child(6){
      background:
        radial-gradient(circle at 24% 14%,rgba(255,255,255,.42),transparent 38%),
        linear-gradient(180deg,#deebf5 0%,#eaf2f7 72%,#f2f6f6 100%)!important}
    .module-links.bertha-module-cards a:nth-child(7){
      background:
        radial-gradient(circle at 24% 14%,rgba(255,255,255,.36),transparent 38%),
        linear-gradient(180deg,#f8e9ec 0%,#faefef 72%,#fbf3ee 100%)!important}
    .module-links.bertha-module-cards a:nth-child(8){
      background:
        radial-gradient(circle at 24% 14%,rgba(255,255,255,.36),transparent 38%),
        linear-gradient(180deg,#f0eaf3 0%,#f4eff4 72%,#faf3ee 100%)!important}
    .module-links.bertha-module-cards a:nth-child(9){
      background:
        radial-gradient(circle at 24% 14%,rgba(255,255,255,.36),transparent 38%),
        linear-gradient(180deg,#edf3f7 0%,#f3f5f5 72%,#faf3ee 100%)!important}


    /* BERTH.A v1.7 — tipografia e barra inferior */
    /* Saudação: volta à linguagem tipográfica principal da interface */
    #app .day-hero h1{
      font-family:Montserrat,Inter,-apple-system,BlinkMacSystemFont,"SF Pro Display",sans-serif!important;
      font-size:clamp(28px,7.4vw,32px)!important;
      line-height:1.08!important;
      font-weight:400!important;
      letter-spacing:-.035em!important;
      white-space:nowrap!important;
      color:#3f3545!important;
    }

    /* Barra inferior: bege-rosado suave, integrada ao fundo sem ficar branca */
    .bottom-nav{
      background:rgba(250,239,235,.94)!important;
      border:1px solid rgba(176,136,155,.16)!important;
      box-shadow:
        0 -1px 0 rgba(255,255,255,.62) inset,
        0 9px 28px rgba(74,56,77,.10)!important;
      backdrop-filter:blur(20px)!important;
      -webkit-backdrop-filter:blur(20px)!important;
    }


    /* B•A OFICIAL — asset gráfico da identidade, sem a frase */
    .bertha-nav-mark{
      width:54px!important;
      height:34px!important;
      display:block!important;
      margin:0 auto!important;
      background:transparent url("data:image/png;base64,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") center/contain no-repeat!important;
      color:transparent!important;
      font-size:0!important;
      line-height:0!important;
      filter:none!important;
    }
    .bertha-nav-mark span{display:none!important}
    .bottom-nav .nav-item[data-route="meu-dia"]>span:last-child{display:none!important}


    /* TAREFAS v1.8 — mesma linguagem visual da Home */
    .bertha-tasks{
      padding:0 0 118px!important;
      font-family:Inter,-apple-system,BlinkMacSystemFont,"SF Pro Text","Helvetica Neue",sans-serif;
      color:#3f3545;
    }
    .bertha-task-hero{
      margin:10px 16px 16px;
      padding:22px 20px 20px;
      border:1px solid rgba(204,159,182,.30);
      border-radius:28px;
      background:
        radial-gradient(circle at 7% 0%,rgba(245,201,219,.28),transparent 48%),
        radial-gradient(circle at 98% 100%,rgba(232,218,251,.34),transparent 46%),
        rgba(255,250,247,.92);
      box-shadow:0 12px 30px rgba(91,69,98,.07);
    }
    .bertha-task-kicker{
      color:#d18bab;
      font-family:"Montserrat","Avenir Next",Inter,sans-serif;
      font-size:13px;font-weight:700;letter-spacing:.16em;
      margin-bottom:8px;
    }
    .bertha-task-hero h1{
      margin:0 0 8px!important;
      font-family:"Montserrat","Avenir Next",Inter,sans-serif!important;
      font-size:29px!important;line-height:1.12!important;font-weight:500!important;
      letter-spacing:-.035em!important;color:#3f3545!important;
    }
    .bertha-task-hero p{
      margin:0;color:#817783;font-size:15px;line-height:1.5;
    }
    .bertha-task-tools{
      display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;
      padding:0 16px 14px;
    }
    .bertha-task-search{
      height:50px;display:flex;align-items:center;gap:8px;
      padding:0 14px;border:1px solid rgba(112,92,119,.14);border-radius:18px;
      background:rgba(255,255,255,.76);box-shadow:inset 0 1px 0 rgba(255,255,255,.9);
    }
    .bertha-task-search span{font-size:20px;color:#9e929f}
    .bertha-task-search input{
      min-width:0;width:100%;border:0!important;outline:0;background:transparent!important;
      font:inherit;font-size:15px;color:#514756;padding:0!important;box-shadow:none!important;
    }
    .bertha-task-add{
      min-width:114px;border:0;border-radius:18px;padding:0 16px;
      background:linear-gradient(180deg,#df9ab8,#d486aa);color:#fff;
      font:700 15px/1 Inter,sans-serif;box-shadow:0 8px 18px rgba(194,113,151,.19);
    }
    .bertha-task-add span{font-size:20px;font-weight:500;vertical-align:-1px}
    .bertha-task-tabs{
      display:flex;gap:8px;padding:0 16px 16px;
    }
    .bertha-task-tabs button{
      border:0;border-radius:999px;padding:10px 15px;background:transparent;color:#807581;
      font:700 14px/1 Inter,sans-serif;
    }
    .bertha-task-tabs button.active{background:#f4dce8;color:#a45f82}
    .bertha-task-tabs em{
      display:inline-grid;place-items:center;min-width:20px;height:20px;margin-left:4px;
      border-radius:999px;background:rgba(255,255,255,.58);font-style:normal;font-size:11px;
    }
    .bertha-task-list{display:grid;gap:10px;padding:0 16px}
    .bertha-task-list[hidden]{display:none!important}
    .bertha-task-card{
      display:grid;grid-template-columns:34px minmax(0,1fr) 34px;align-items:start;gap:8px;
      padding:15px 14px;border:1px solid rgba(112,92,119,.12);border-radius:21px;
      background:
        linear-gradient(135deg,rgba(255,249,247,.98),rgba(248,240,250,.82));
      box-shadow:0 8px 22px rgba(87,67,93,.055);
    }
    .bertha-task-card.done{opacity:.68;background:rgba(248,245,246,.82)}
    .bertha-task-check,.bertha-task-more{
      width:34px;height:34px;border:0;border-radius:50%;background:transparent;color:#a76a8a;
      font-size:23px;line-height:1;padding:0;
    }
    .bertha-task-more{font-size:15px;color:#918591}
    .bertha-task-copy{min-width:0;display:grid;gap:5px;padding-top:3px}
    .bertha-task-copy strong{font-size:15px;font-weight:700;color:#423847}
    .bertha-task-copy span{font-size:12px;line-height:1.35;color:#8a7f8b}
    .bertha-task-copy small{font-size:12px;line-height:1.4;color:#756b77}
    .bertha-task-card.done .bertha-task-copy strong{text-decoration:line-through}
    .bertha-task-empty{
      text-align:center;padding:88px 22px 30px;color:#8a808b;
    }
    .bertha-task-empty>div{font-size:24px;margin-bottom:20px;opacity:.75}
    .bertha-task-empty strong{display:block;color:#423847;font-size:17px;margin-bottom:8px}
    .bertha-task-empty p{margin:0 auto;max-width:310px;font-size:14px;line-height:1.55}

    /* Modal de Tarefas — alinhado e sem moldura preta */
    .bertha-task-dialog{
      width:min(92vw,460px)!important;
      max-width:460px!important;
      max-height:min(88dvh,760px)!important;
      padding:0!important;
      margin:auto!important;
      border:0!important;
      outline:0!important;
      border-radius:28px!important;
      overflow:hidden!important;
      background:#fffaf7!important;
      box-shadow:0 24px 70px rgba(54,42,58,.26)!important;
    }
    .bertha-task-dialog::backdrop{
      background:rgba(54,43,57,.28)!important;
      backdrop-filter:blur(7px)!important;
    }
    .bertha-task-modal{display:flex;flex-direction:column;max-height:min(88dvh,760px);background:#fffaf7}
    .bertha-task-modal-head{
      flex:0 0 auto;display:flex;align-items:center;justify-content:space-between;
      padding:20px 20px 15px;border-bottom:1px solid rgba(112,92,119,.09);
      background:linear-gradient(135deg,rgba(250,231,239,.7),rgba(245,239,252,.54));
    }
    .bertha-task-modal-head span{
      display:block;margin-bottom:5px;color:#9b7187;font:700 11px/1 "Montserrat",Inter,sans-serif;
      letter-spacing:.16em;
    }
    .bertha-task-modal-head h2{
      margin:0;font-family:"Montserrat","Avenir Next",Inter,sans-serif;font-size:24px;font-weight:500;
      letter-spacing:-.03em;color:#3f3545;
    }
    .bertha-task-modal-head button{
      width:40px;height:40px;border:0;border-radius:50%;background:rgba(255,255,255,.72);
      color:#7d5f88;font-size:27px;line-height:1;
    }
    .bertha-task-modal-body{
      overflow:auto;-webkit-overflow-scrolling:touch;padding:17px 20px 8px;
    }
    .bertha-task-field{display:grid;gap:7px;margin:0 0 15px;min-width:0}
    .bertha-task-field>span{
      color:#716674;font-size:13px;font-weight:700;
    }
    .bertha-task-field small{font-weight:500;color:#a198a2}
    .bertha-task-field input,.bertha-task-field select,.bertha-task-field textarea{
      width:100%;box-sizing:border-box;border:1px solid rgba(112,92,119,.14)!important;
      border-radius:15px!important;background:rgba(255,255,255,.86)!important;
      color:#433a47!important;font:500 15px/1.25 Inter,sans-serif!important;
      outline:0!important;box-shadow:none!important;
    }
    .bertha-task-field input,.bertha-task-field select{height:48px;padding:0 13px!important}
    .bertha-task-field textarea{min-height:80px;resize:vertical;padding:12px 13px!important}
    .bertha-task-field input:focus,.bertha-task-field select:focus,.bertha-task-field textarea:focus{
      border-color:#dca1ba!important;box-shadow:0 0 0 3px rgba(220,161,186,.18)!important;
    }
    .bertha-task-two{display:grid;grid-template-columns:1fr 1fr;gap:10px}
    .bertha-segment{
      display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;
    }
    .bertha-segment.compact{grid-template-columns:repeat(3,minmax(0,1fr))}
    .bertha-segment button{
      min-width:0;border:1px solid rgba(112,92,119,.11);border-radius:12px;padding:9px 5px;
      background:#f8f3f6;color:#7b6e7d;font:700 11px/1 Inter,sans-serif;
    }
    .bertha-segment button.active{
      background:#f2dbe7;color:#9f5f80;border-color:rgba(201,130,164,.24);
      box-shadow:inset 0 0 0 1px rgba(255,255,255,.5);
    }

    .bertha-duration-input{
      display:grid;
      grid-template-columns:minmax(92px,.8fr) minmax(130px,1.2fr);
      gap:8px;
      min-width:0;
    }
    .bertha-duration-input input,.bertha-duration-input select{
      width:100%;height:48px;box-sizing:border-box;
      border:1px solid rgba(112,92,119,.14)!important;border-radius:15px!important;
      background:rgba(255,255,255,.86)!important;color:#433a47!important;
      font:500 15px/1.25 Inter,sans-serif!important;outline:0!important;box-shadow:none!important;
    }
    .bertha-duration-input input{
      padding:0 12px!important;
      text-align:center;
      min-width:0;
    }
    .bertha-duration-input select{
      padding:0 34px 0 12px!important;
      min-width:0;
      width:100%;
      white-space:nowrap;
      text-overflow:clip;
    }
    .bertha-duration-input input:focus,.bertha-duration-input select:focus{
      border-color:#dca1ba!important;box-shadow:0 0 0 3px rgba(220,161,186,.18)!important;
    }
    .bertha-notify-custom{
      display:grid;gap:6px;margin-top:9px;
    }
    .bertha-notify-custom[hidden]{display:none!important}
    .bertha-notify-custom span{font-size:12px;font-weight:700;color:#716674}
    .bertha-notify-custom input{
      width:100%;height:46px;box-sizing:border-box;padding:0 12px;
      border:1px solid rgba(112,92,119,.14);border-radius:14px;
      background:rgba(255,255,255,.88);color:#433a47;font:500 15px Inter,sans-serif;
    }

    .bertha-notify-box{
      margin:2px 0 15px;padding:12px;border:1px solid rgba(112,92,119,.10);border-radius:17px;
      background:linear-gradient(135deg,rgba(246,238,251,.72),rgba(255,245,239,.72));
    }
    .bertha-toggle-row{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;position:relative}
    .bertha-toggle-row>div{display:grid;gap:2px}
    .bertha-toggle-row strong{font-size:14px;color:#4b414e}
    .bertha-toggle-row span{font-size:11px;color:#8d818f}
    .bertha-toggle-row input{position:absolute;opacity:0;pointer-events:none}
    .bertha-toggle-row i{
      width:44px;height:26px;border-radius:999px;background:#d8cfd9;position:relative;transition:.18s ease;
    }
    .bertha-toggle-row i::after{
      content:"";position:absolute;width:20px;height:20px;left:3px;top:3px;border-radius:50%;
      background:white;box-shadow:0 2px 5px rgba(50,40,52,.18);transition:.18s ease;
    }
    .bertha-toggle-row input:checked+i{background:#d78ead}
    .bertha-toggle-row input:checked+i::after{transform:translateX(18px)}
    .bertha-notify-when{margin:12px 0 0!important}
    .bertha-notify-note{display:block;color:#9b919b!important;font-size:10.5px!important;line-height:1.35}
    .bertha-task-modal-actions{
      flex:0 0 auto;display:flex;align-items:center;justify-content:space-between;gap:12px;
      padding:13px 20px calc(13px + env(safe-area-inset-bottom));
      border-top:1px solid rgba(112,92,119,.09);background:rgba(255,250,247,.97);
    }
    .bertha-task-modal-actions>div{display:flex;gap:8px;margin-left:auto}
    .bertha-task-cancel,.bertha-task-save,.bertha-danger-link{
      border:0;border-radius:14px;padding:11px 16px;font:700 14px/1 Inter,sans-serif;
    }
    .bertha-task-cancel{background:#eee5f4;color:#725a82}
    .bertha-task-save{background:#d78ead;color:white;min-width:92px}
    .bertha-danger-link{background:transparent;color:#b77b82;padding-left:0}
    @media(max-width:480px){
      .bertha-task-two:has(.bertha-duration-input){
        grid-template-columns:1fr!important;
      }
      .bertha-duration-input{
        grid-template-columns:88px minmax(0,1fr)!important;
        width:100%!important;
      }
      .bertha-duration-input select{
        width:100%!important;
        min-width:0!important;
      }
    }
    @media(max-width:390px){
      .bertha-task-hero h1{font-size:26px!important}
      .bertha-task-tools{grid-template-columns:minmax(0,1fr) 108px}
      .bertha-task-add{min-width:108px;padding:0 12px;font-size:14px}
      .bertha-task-two{grid-template-columns:1fr}
      .bertha-task-modal-body{padding-left:16px;padding-right:16px}
      .bertha-task-modal-head,.bertha-task-modal-actions{padding-left:16px;padding-right:16px}
    }



    /* RITUAIS v2.0 — line icons + templates extensíveis */
    .bertha-ritual-page{padding:0 16px 118px;color:#403644;font-family:Inter,-apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif}
    .bertha-ritual-hero,.bertha-ritual-detail-hero{margin:10px 0 18px;padding:22px 20px;border-radius:28px;border:1px solid rgba(199,157,180,.28);background:radial-gradient(circle at 10% 0%,rgba(246,202,219,.28),transparent 48%),radial-gradient(circle at 95% 100%,rgba(224,215,247,.38),transparent 48%),rgba(255,250,247,.92);box-shadow:0 10px 28px rgba(89,67,95,.06)}
    .bertha-ritual-hero h1,.bertha-ritual-detail-hero h1{margin:0 0 8px;font-family:"Montserrat","Avenir Next",Inter,sans-serif;font-size:28px;line-height:1.12;font-weight:500;letter-spacing:-.035em}.bertha-ritual-hero p,.bertha-ritual-detail-hero p{margin:0;color:#827783;font-size:14px;line-height:1.5}
    .bertha-section-label{margin:24px 2px 11px;color:#8c7d89;font-size:11px;font-weight:800;letter-spacing:.16em}
    .bertha-ritual-grid{display:grid;gap:10px}.bertha-ritual-card,.bertha-new-ritual,.bertha-extra-card{width:100%;display:grid;grid-template-columns:50px minmax(0,1fr) 18px;gap:12px;align-items:center;text-align:left;padding:15px;border:1px solid rgba(108,88,115,.11);border-radius:21px;background:rgba(255,255,255,.78);color:#453a49;box-shadow:0 7px 20px rgba(87,67,93,.045)}
    .bertha-ritual-card:nth-child(1){background:linear-gradient(135deg,rgba(247,222,234,.84),rgba(248,240,246,.82))}.bertha-ritual-card:nth-child(2){background:linear-gradient(135deg,rgba(232,225,248,.84),rgba(245,241,251,.84))}
    .bertha-new-ritual{margin-top:10px;background:linear-gradient(135deg,rgba(232,241,237,.76),rgba(250,248,244,.86))}
    .bertha-ritual-card strong,.bertha-new-ritual strong,.bertha-extra-card strong{display:block;font-size:16px;margin-bottom:4px}.bertha-ritual-card small,.bertha-new-ritual small,.bertha-extra-card small{display:block;color:#887d89;font-size:11px;line-height:1.35}.bertha-ritual-card>b,.bertha-new-ritual>b,.bertha-extra-card>b{font-size:23px;color:#9a8e99;font-weight:400}
    .bertha-line-icon{width:46px;height:46px;border-radius:15px;background:rgba(255,255,255,.66);display:grid;place-items:center;color:#8b687c}.bertha-line-icon svg{width:25px;height:25px;fill:none;stroke:currentColor;stroke-width:1.45;stroke-linecap:round;stroke-linejoin:round}.bertha-line-icon.large{width:56px;height:56px;border-radius:18px}.bertha-line-icon.large svg{width:31px;height:31px}
    .bertha-back-link{display:inline-block;margin:4px 0 8px;color:#87648f;text-decoration:none;font-size:14px;font-weight:700}.bertha-ritual-detail-hero{display:grid;grid-template-columns:58px minmax(0,1fr);gap:14px;align-items:center}
    .bertha-ritual-today{padding:18px;border:1px solid rgba(110,90,116,.11);border-radius:23px;background:linear-gradient(135deg,rgba(251,230,239,.72),rgba(247,241,251,.86));box-shadow:0 8px 22px rgba(87,67,93,.05)}
    .bertha-ritual-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}.bertha-ritual-head>div>span{display:block;color:#9c7187;font-size:10px;font-weight:800;letter-spacing:.14em;margin-bottom:5px}.bertha-ritual-head h2{margin:0;font-size:20px;line-height:1.2}.bertha-ritual-head p{margin:5px 0 0;color:#897d89;font-size:12px}.bertha-ritual-head button{border:0;border-radius:13px;background:#eee2f6;color:#765986;padding:9px 12px;font-size:12px;font-weight:800}
    .bertha-ritual-time{margin-top:11px;color:#8a7e8a;font-size:11px}.bertha-check-steps{margin-top:15px;display:grid;gap:8px}.bertha-check-steps label{display:grid;grid-template-columns:22px 1fr;gap:7px;align-items:start;color:#625764;font-size:12px;line-height:1.4}.bertha-check-steps input{accent-color:#b9859f}
    .bertha-free-note{margin-top:13px;padding:12px;border-radius:14px;background:rgba(255,255,255,.55);color:#7c707c;font-size:12px;line-height:1.45}
    .bertha-section-row{display:flex;align-items:center;justify-content:space-between;margin:24px 2px 10px;color:#8c7d89;font-size:11px;font-weight:800;letter-spacing:.14em}.bertha-section-row button{border:0;background:transparent;color:#87648f;font-weight:800;font-size:11px;letter-spacing:0}
    .bertha-upcoming-list{display:grid;gap:7px}.bertha-ritual-upcoming{display:grid;grid-template-columns:58px 1fr;gap:10px;align-items:center;padding:11px 13px;border-radius:17px;background:rgba(255,255,255,.7);border:1px solid rgba(108,88,115,.09)}.bertha-ritual-upcoming>span{text-transform:uppercase;color:#a16f87;font-size:10px;font-weight:800}.bertha-ritual-upcoming strong{display:block;font-size:12px}.bertha-ritual-upcoming small{display:block;margin-top:3px;color:#8b808b;font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .bertha-extra-list{display:grid;gap:8px}.bertha-extra-card{padding:12px;background:rgba(255,255,255,.72)}.bertha-extra-card .bertha-line-icon{width:40px;height:40px}.bertha-extra-card .bertha-line-icon svg{width:21px;height:21px}.bertha-empty-soft{padding:18px;border-radius:18px;background:#faf6f7;color:#8a7e89;font-size:12px;line-height:1.45;text-align:center}
    .bertha-icon-picker{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.bertha-icon-picker button{height:50px;border:1px solid rgba(110,90,116,.12);border-radius:14px;background:#fbf8f9;color:#8a7080;display:grid;place-items:center}.bertha-icon-picker button.active{background:#f2dce8;border-color:#d7a7bf}.bertha-icon-picker svg{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}
    .bertha-schedule-note{padding:11px 12px;border-radius:14px;background:#f7f1f6;color:#887d89;font-size:11px;line-height:1.45}.bertha-delete-soft{border:0;background:transparent;color:#aa6675;font-weight:800;font-size:12px}
    .bertha-full-schedule{padding:12px 17px 22px;max-height:66vh;overflow:auto;display:grid;gap:7px}.bertha-full-schedule>div{padding:10px 12px;border-radius:14px;background:#fbf6f8;border:1px solid rgba(112,92,119,.08)}.bertha-full-schedule b{display:block;font-size:11px;color:#594d5c}.bertha-full-schedule span{display:block;margin-top:3px;color:#887c88;font-size:10px;line-height:1.35}


    /* RITUAIS v2.1 — correções iPhone + início 12/09 */
    .bertha-cycle-position{display:block;margin-top:5px;color:#9a8d98;font-size:10px;font-weight:600;letter-spacing:0}
    .bertha-cycle-actions{margin-top:18px;padding:16px;border-radius:20px;background:linear-gradient(135deg,rgba(238,229,247,.70),rgba(250,244,239,.82));border:1px solid rgba(108,88,115,.10)}
    .bertha-cycle-actions>div>span{display:block;color:#91748a;font-size:10px;font-weight:800;letter-spacing:.14em;margin-bottom:4px}
    .bertha-cycle-actions h3{margin:0 0 5px;font-size:17px;color:#443948}
    .bertha-cycle-actions p{margin:0;color:#877b87;font-size:11px;line-height:1.4}
    .bertha-cycle-buttons{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:13px}
    .bertha-cycle-buttons button{border:0;border-radius:13px;padding:10px 8px;background:#eaddeb;color:#6f557c;font-size:11px;font-weight:800}
    .bertha-cycle-buttons button.quiet{grid-column:1/-1;background:rgba(255,255,255,.65);color:#897c88}
    .bertha-ritual-dialog .bertha-task-modal{max-height:min(88vh,760px);overflow:hidden}
    .bertha-ritual-dialog .bertha-task-modal-body{overflow-y:auto;-webkit-overflow-scrolling:touch;min-height:0}
    .bertha-ritual-dialog .bertha-task-modal-actions{position:sticky;bottom:0;z-index:5;background:rgba(255,250,247,.98);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}
    .bertha-ritual-dialog .bertha-task-field,.bertha-ritual-dialog .bertha-task-two>*{min-width:0}
    .bertha-ritual-dialog input,.bertha-ritual-dialog select,.bertha-ritual-dialog textarea{max-width:100%;box-sizing:border-box}
    .bertha-ritual-dialog .bertha-duration-input{display:grid;grid-template-columns:88px minmax(0,1fr);gap:8px;min-width:0}
    .bertha-ritual-dialog .bertha-duration-input select{width:100%;min-width:0}
    @media(max-width:480px){
      .bertha-ritual-dialog{padding:10px!important}
      .bertha-ritual-dialog .bertha-task-modal{width:min(100%,calc(100vw - 20px));max-height:90vh;border-radius:22px}
      .bertha-ritual-date-duration{grid-template-columns:1fr!important}
      .bertha-ritual-dialog .bertha-task-two{grid-template-columns:1fr!important}
      .bertha-ritual-dialog .bertha-segment{grid-template-columns:repeat(2,minmax(0,1fr))}
      .bertha-ritual-dialog .bertha-segment.compact{grid-template-columns:repeat(3,minmax(0,1fr))}
      .bertha-ritual-dialog .bertha-icon-picker{grid-template-columns:repeat(4,minmax(0,1fr))}
      .bertha-ritual-dialog .bertha-task-modal-head{padding-right:8px}
      .bertha-ritual-dialog .bertha-task-modal-body{padding-bottom:18px}
    }


    .bertha-delete-ritual{display:block;width:100%;margin:18px 0 4px;padding:12px;border:1px solid rgba(143,103,118,.16);border-radius:14px;background:rgba(255,255,255,.55);color:#a36d7d;font-size:11px;font-weight:750}
    .bertha-full-schedule{display:grid;gap:9px}
    .bertha-full-schedule-row{display:grid;grid-template-columns:82px minmax(0,1fr);gap:10px;align-items:center;padding:12px;border:1px solid rgba(108,88,115,.10);border-radius:16px;background:rgba(255,255,255,.66)}
    .bertha-full-schedule-row>span{font-size:10px;font-weight:800;letter-spacing:.08em;color:#a06f87;text-transform:uppercase}
    .bertha-full-schedule-row strong,.bertha-full-schedule-row small{display:block}
    .bertha-full-schedule-row strong{font-size:12px;color:#4d424d}
    .bertha-full-schedule-row small{margin-top:3px;font-size:10px;color:#8d818b}

    /* Menu aprovado: congelado. Não alterar. */

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
    ensureStyles(); nav(); const route=(location.hash||'#meu-dia').slice(1)||'meu-dia'; const pt=document.querySelector('#pageTitle'); const eyebrow=document.querySelector('.topbar .eyebrow'); if(eyebrow) eyebrow.textContent=''; if(pt){ if(route==='meu-dia') pt.innerHTML='<img class="bertha-official-logo" alt="BERTH.A — Out of your head. Into your life." src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAjAAAADLCAYAAABwO6mcAAEAAElEQVR42uy9d7wsWVU2/Ky9d1X3CTffyYFhApOYxCRgEgMzQxARMYCBVxERA+qLIoIKiooRiQIKosKLoETlHZAwOTBMgInA5Bkmz5100zmnu2rvvb4/9q7qquqK3X3uDH5v31/9zrl9uivsuNaznvUsMjufgLUWUkoQEYwxAAAhBACAiKC1hhQBINzvQkgIIWCMARFgyYKYwUQgkjBsQRCQYQ9EBJBMz8cW0BYwscFgMEA81AvLy8sf3bZt289s27YN27Ztw9bt27Bjxw4Mh0Ps2LkTg8EAKysriOMYxhhYa2EJkFICxiIIAigpQcQIwz56vQCLi4tYu3Yt1q1bh82bN2Hj5s1Yt27tNxcX1zwv6IexkgH6YQAJBscRmBnM7J9PIJQK1mpYCyhJYGYA1j0P2LWNELDGou7lPu9e7hz+Zf3vwn+u7DOF81T9baLrPwVeZc+UvV+kLd39mZLPND9y8QOF6zfcX9kdJt9xn6XGe1ztV/MzNH+37XfaXoupcH7uNubT/vXnIUbDOHAfsOjWFswMIqo8Pzc0C/Fs+7BNP5S3WdvvU8Nz1s+X7s/LEz+/6xvR2HdV13PnpIoxw63axaJhfGT6ott854rzVZ+LmcFU/rfk/rquBV32jLJ1ufH8JffLzK3aEwDI7twOkAVYgGHAlkCCQZCwYAgQLBjMAAuCZAnNFjCAgQEEQUqClBJCKEAKECno2GAYR9i5Y/nAhx9++I4f3Hsv7vnBfbj//vvxxBPbsHPnTiwtLWHn9iWsrKzkDRRweqNMBGu9kSAIAjRatIgQSAWpCDIzwLTW0FqnRgkAiEBhcXERC4uLWLNmDfbZZx88bf99ceShz8BBBz4de++9N/X7fYRSAQDieAjy17BWQzAgvSFjbAxJIjdB6jbV0o2akwHH6fSoGpTTGAhtNvony7ApXrv0+X8IDZj896hV/6yWwbLaRlJXA6etAdN6LghqtXGm3xU02fNxxT3NyIAp67NJ5+b/VAOmdKPzBkxxHFaPSy60D1XeV/679e3StOF2n4fdDZi68ZjsN23XoGmd5a7rQN28qbsXMkvbIYQAM2Ct8R6jBUAgJcHaAFKALSE2FsQCyiMeDAEWhOWVAXbu3Hn6/fc/ePGtt96KO+64A/f84D48/MgWPPHENiwtLSGKIofKeEOHmRHHQ0gpYa0dm8BKqfTo9Xro9XoQgUIgpLsfZlhrEA+HiOMYURQhjmPEcQwiShElpZRDbAAYYzCIIhhjYJhAbBAQI1ACmzdvxoEHHogjDz8CRx99NA4//NDT9tht82XWWgghoOOhM2SEvz8SMDaGwLi1PlODoGLQNV2jOJGfqshM5QSqWQC63Tt1XCio1ebC5N4XjRsJ1W7Iq2FgPBkGTNO1Kjd6W28gJmO9aPCMbfZc36/J16o81K6IEvHqGzBt5rpbq5FD/JrGe32fUUO/PTkGTLVRI+o3uLG1ghsQnCaHhRoNmDZzos7AaucwiJkYMLPaDyZdZ7KIaBckJvk8maUdboGwBCEBQQoGnIaSpAygrUEY9EGBgBlaPLFtO+647Ta+8bvfx+133Y07774H9997L7bt2AGrNZRSCMMQBIFer5eGZhJDg4jQ6/UwN9/HwsIc5ufnsWHDBmzcuBGbNm3Cbrvtht0374a1a9di/fr16M/PYWFu/teDXvg5JeQjQknAuntcXtn5Vzt37vz97du3Y9u2bXjkkUdw//334+6778b99z2ILVu2YOfyCgAg7PcRBCGEkmBL3qgyHnFxxg+shZSEp+23P4448jCcfvrpOPboo/5u7332epMEI9ZDWB1DSglmhiQGcbUBM7kFPpoudROiGYFotrp3pQHTBnVpmsa1GyW3g367GDBl/ZhMvC4GTLFP6gyYacfNar86Q9FUMRYbPMomA6Zs48yFedPxRmMLZnE8tkF9VsuAmbwfuhkw2c//sBswyfW7rV/V918eOip3iIqIXlmIhplT6kR7o//JMWBmZZh0RQ0tGhx0W+/Aktm5BEgBIQMYHUFri6AXQgQBwAzWjMe3bcXtt9/J111/A2647kbcevtteHTLYxgMY8TMkIFCP+wh6IWQJKB1jOFwiFgPEUqFdevWYbfdNmGffffCwQcehKc//enYc889sW7dWmxYv/bYuV5w/dzcHJRS4EJIxlrrBollaGvcAwmC9B044upIJM9ljMVwOMRgEOEHd9/Dt9xyC67+9ndww4034sEHH4a2wNzcPIIgAEkxug7gQ0MW0WCAwWAZzIx99t4TJzzrOPzIS1+C448/jhbm+7DGIBqsIFTCwY3cDoLrYjwQUeo6Vm12XQyYWYeophn0VZsGd7xGVWy82XCp99Qr+0nkrzMrBGZX8WSKC1zZhtMFwWG2re7RosrwoIkg8bKQbL7dyje6RoOjZn5O0he06r5BN4N99DxVxvNkBkw1AlZ1PwKAnYkBU7YOdAkh5T/TbMDkvi+K/UydEJiy/mzjoI0+U99fjSHQVVx32jhhRcemaj2scnTIrAwRawullCPFSveBH/zgvs9ed+31P3nl1Vfhu9/9Lu6++x4MowgCEkIFCKSCZYBUAAuDaDCE1jGCUGLT+nU47LDDcOQzD8cJzzoe++67z6V77Lnb6b1eD1ISwI7MSwJAHMGydmGdDIGYEu4L5T3Y1CNLNnYf4km+T5DpQ0oZQKkQlhmWBHbs2IEbb/oun3feBbjyyivxwIMPQ4V99ObmRtdLGs8ygkBBaw0TxxgsL6HXD3DooYfg5S9/OV78ohfSujWLiIcrAGnPweHZL1olBkzRym3Db9kVxsssyKE8o+u3f7R6Ul+xDccWdGvHvfPMGC3G6CdF0p4sA6b5XrhVX1d7hlR7/jqIubhAl20ERS5Slj/X1C+zCMWVhRa6EKKz99mu/anyHPn3qq4ndpEBMzsEZrYGXxMCUpxPCRJLle3fzYF88g2YWRovjYYcodYRrQ4RJwbMQIOUhDXAHXfdxVdd/W1cccWVuOn738MjWx4DgNS4EUKAmBEbCxgLA5e1FAQCJ594HI5/1jE49pijcMD++/7cnnvu8ylnnXJqoLBjAkMkN8cWDJMj4LZdEEYwvM1v9Ha08DEzLJO7byUhpUNchApw//0PvPHCCy9+9xe++CXccuvt6M0tIAzD0QAVBLAzjKwxUEqBrPHIUoRDD3kGXv3qn8OPvOQcChVhOFiGCtz9yExrW+ONLx4hSkSAkBJaD112FyZne2cNnKqR7DLBeGx6MnMNha3l8pB40GKCwduBAzLpMtdsKEyWXVO8s7psiLYt3ITGzZK31NawbUaIWkLtVQhMQ7vZJvKpbbcAV20k4wgSNbZP3RhuQniaOD9drjXrz7dDwArtaLmlYbFahgq3nrelBrItT8ToYgDVZf80kdST/asplLdaxkbdOG8TDuIZR7ib5l3RISAz0Lj629fxZz//BXz7O9fhwYcfATNjbmEhfxLrDYKUcOsWnjiOsfeeu+Er536elNBQQQgTD6BjgMjFAJnsKB2RZJp25iB4W9rBdbHuHPrgvy84zy2wNFovpHQZVVJKxMZ9prewCFjCjp0r+Oznv8Cf+tSn8OBDW7B27XpASGitAZIgclwXqz0nSBHiOIYeRjAmxoknHIc3/MbrceKJx5HREYwegAgIPJJlTfKcYhQTJQJbA5IAm+4bUi4GWNVeFa520YARTRyUpvvKsNiawlZNm+FqGzBl12WePEV4FgZMWciKK1C31YJxp/OquBZqH1237UZXjcCULtoNBkzT849vINTJAOhqwEyKzk6azr6aBkz98zw1DJiWAHeHdip3gJJQSBdDu7Q9K5CVWaB4rcZv1/PTLhqHnEe60vNe+PWL+Pff+kfYun0b1qxdDwgFgGDZZfJordOeLmYLAUC0soynH7g//uPTn6BAGlht0AskpOghtrHvCzsKAfkQD1kGw2Sgt/JFsinWDeLcgl82boIgQGw0iAhChUgyiwwDFgpBqHDffQ+++x/+8aNv/MpXvgoZ9KBU4ENaeT2cRCun3+8DRiMaDiCkxat/7mfxy697DS0uzCEarkAKl9Ul2D23EALWWpjY6cxIKTwa0wxZ1yEa0xgwXZYZquqTlgbMtMRhRpUH05yNVZ/FMZknPI5ATAZltzVgpkGcupCeZ5HuWc79mZ0BkxtXDemhxQU0Ox6yWSlNG0frcdGQpl1nwLTNLJzE0J7YAO5swNCU3+82Pp5KIahiqDS3TnNV3+SR2K6GQ2v5gJZjoWvop9taOR6etyUh+NpzcH4Oi6uvvgaPPb4VmzbvDm1HkJoxJtVlScTjko044agkL0kCgZBQQiJULlU6igb+vRGnJV1EvPECOzKKcryWwv+rYPSyTTJ7OENBpsiHlNJd2y/qAoxAEJZ27sT+++/1O3/xzrfTX/3lO7Ew10M8HPgUb2e0DIdDL9znUrNXVlYQW4YKAwSqh3/86D/hV1//G3zHnfc8pmQfoABShI5X5JEqIQSCXq+zwFnd5l/WTqv9appklSJLFf066+tPYih1RcCqxuIkz1JnxNZdo007V2VBPBnjZle+ss83Da+lbTsV165ZjIVZoGSTOgz/7zWbMdgdEV6dpIpJ16xp14q6646iMu3XueLnxNDrpgwGEYLAoRPDSHtuooAQCkRuE7bWpgdbgmCgF4aQQsCYkf6KjmL0ej3A53ELZghmkPUHsqQiBrNND0diQnpk/w+w8/QF0qNpIRCCoHUM9qrBJBhKAMQJJyfG4nwfNjJYWR7gRS86kz7yjx/Eoc84EIPlHQiVhB4OEIYhlHKk3uT5icgrCzPWrtuEa759PV73K7+28fIrrmKpQgyiGBYCQoUQQiCKIliPaBljIL1o3lSTZAY+SNN5KN8hu2wx3tUG2pOxyGeRgirjpa3R3uaZ2mpBTObJuqM8nEaFY3JjtczAr2qHNs80iUG+2mOi+CxtQlmrsvlxA2pEVDiQO6YdB8XzjZ+fpjxWt71SA4DGCeSjtPfmfm5u18nGbp0TXQyNTnL9adb8Omcu3d+11iCpQFIhiiKnves/XBYyKruYEAJKSggGdBQjCAKwNqBMVo67IQuwcagGt1PfbLt4VC1gWmsEYQgVBLB6hCSBCEoSBCxMHIFthEASlrcv4bDDDqIPfuD9dNqpz8XO7dsQ9gLYOEoNj8RQY0vO0GNnyGzYuBu2PrETb/q9t+K88y7h+YU10JYxHA4hvSgfM0MolYr5TUrWynqXdcdqGxirvchnM89Ww9CYNTl2lgZSccJO4kWVIV9dx8q0/VZ3TOtBVs2Vss9XLYyzHter0ZbTGi5PVT2h/8mvtuvvas3BWayHbe+tahw2ocTT3quAkGOLWxwbBEHgN+w4DaNkQ0EkOOWFBIGElNJnJAWAZVCmlhIACOKMIeNDR7CdPXAGXFq0PziDHpQ1hxAC1hjoOHbGCzPYGMTRENZoGKOhJEESw+oY/Z7EYGkJ69euwd/+9V/RC190Nh577BGoQAJGo9/vu/NIAW0NLAEGBM3AUBuEvXkYA7zlrX+Ib3zjQg57c1BhD1FswIJAUiD2xlDdxtmmg3Nht5ZITNHvaPO93H0Q5T/vEbFpkZ+mfnQAHDtUL/P7aiw2k06stqGGOqHDouBd2zHw5IUI6j3ZauNaTEB87r5xl3lxdZ7lNJ7uRBB9w3W6iTbOJmxQ1s5NSMzE569se0o1wVbTKKvnx01ubAu4RBUByhFPLTj3nK0EIGn12nnW12+D+E5KQSgFTxLtFQCpEdLr9TxhlVPOS9nCQeRQFSEEjLWAAozRsGwAIljPnUlvTGRiXqIcVagaNNMu1KnOTeZZATfA2Gu9KAHAasAaGB1BCcKfvP1t9PIf+1E88dijCEIFY0YqvMrzfaSUEKTAlsBMUEEPRBJ/+La349vfuY6FEBDKta1QyreFyLXNrCC3Sbkmky54/5M8u2kX+kk+X8fVmIRX0QZZ+WHivzRtMJN+f1e1wTScg0mf/X862tJljZq2LTsZeUSrslb8T1v72vRhlXJ58ZoiW3WamTPEVU51QggWgAWzARGnvyfhmASRSRuCCMhk2CSWpy2pGTQ9dJZ4c5ReO+vJF8NhRY+CYEGwkAKAdTwcqQiABiNGECr8yZ+8nZ79nJOwtLQDSikAFkEg89cjOCOFCdrCEXRY4A//6G3Y8ujjxyS1mXQUufpMrNOMBdcXCbG3G7DQxejIZw95NKPE46+ydsv+1hWSnxSZqZ4w08bAR1fJcrCqsaHyO2vTB3XhqirCetlE7mJ41oWNJl2cpnUmcpt0AwKSeLLFQ8CpcTchFGXOV5f7njb239aASs8vCBDdeE1d+2yaApFlfTHNMbq34lyeFsEZP5I9qIhA1JWx6MIxq21by7tAlXnycTsro2oWJPQqVLostCWKRMFxooytvFEWlA4Im2k4dyMmsxXtWiu8ypNtgqgIdkQ6hnVCezpGvxfiL/78z/5u3332SusgicTAE/4YG50CTAL33ns/3vGnf36dtkCsLQw4r/iLcq5D0zNPYvjNmvPSphL3rDzsaZ57mjG1mlkBs/hOlUGZ9QonDUOslje/K+P9VSGkpwrnYJr2mxRlownI+KvZVl31oWZpQD9ZffbD+JoW5V+NfhJjxgtZh6aQdUfGJ85mBXXaVMhWe9gTwHttMwtmkZkhJKB1hP323+tNb3nLm71hxojjGKFHYUbXSZAqJ6RnmLGwuIiLL74EX/jCf3KvNwdBCiQdv6g+Bz7J5hj3SKpCbxNtUBgvGNnm87OCHtvmBjBc2C2XorYLN8HVqxmVZNlNzp2oCkO1WxB4rMDfrjKEu6QxT7oOTNt3ZYjBrhgns872mPXmmZ6vClmxXCPelm1f8sfoe23bexaGw7Qk865Gcdvnao2cTMnd6rq+zAqBnNX3RNmX2pLDkv8XdWFyvTVjT22SNMn6hZEqb1vAQhKgBDBYWsHznncKvexHfwQ6GmCuF3pScMkkgElhUWMYUoX40Ic/ggce2vJ+COmqXgM+HDX5ZOs6QNp68U9Vr3NXIQRPheeaZmPq6u3NguS5WmOoTXhsV6JHbRbcXZkVNG3bT4tizKItiu2xmuvR/8vGmt1Ym4SHNKmBWHU+MWa8WFcDKD0wqrorMj54ViwuK25XV8MgV/I+OVILvHDk0IfRkXBE2nJFxu+pcC4QGCI9RvfLKQJjrXap4Rb4jd/4DVq3bh3ieAghfHqvpfSGLOs0y8rpxQjMza3Bww89hi98/r9+U5DyrBvR0QPFGEZRGutGt6Bd6rmjPvLcWTWhhSvQRcCoTvRpV8Lcq7g8oC4Pa9V0GESi3cGFA2N8gdz1PVej+Tma8stm4ynWZhIJqs7CaMHReKqNqaYNYBY8p8nbPz+Ostyytv1fVLBdzf6ZVIaiM1JSDO0W9WIa5/fqzqe665dFWqq0mGZlCLc9lyjbqLp6OEW1z/TiTFNLBU2rINgOzSnfngUAG2tIErCsoYcRdtu8Fj/7M6/EYHnFieNlakQVicLMTicmGsYIwz4++7n/xENbHntDGPQBAJrtqosCzcJb21Uxz1l7ubNYuJ/qMeumjL02ZR2m2dRWy3hsE1qu4/+0XQh/2BRqdzXqNGkq8TRr/WqPr13NRdlVirurbWzXob2TGIhNY6CoI1V2zpTEm60IXcpFyJhm7juicVNpKoXdptMnyhxgrsQQxjtAlppvyWdUGKZkSGMMjAZ+/Md/jJ52wH7QOnLXMi4rK3skLwNX+LIXzuORRx7DRRdd8gFLrg4T29llXzWVWWh/1gLHBYCYhoA2Y8ig7ca1GobcU31xmeUG91SH2md5f0/lsVDM3mwKGbZ5rkmdkVp+VQa5K6JeeQSs8Lkp0aanjGFZ8zx1G3gZ1yQRfe2KXM3yvndFmzc5VG2uL7KNKdGdX8IWE/ExdtXCUgdR1cFh6QKiNSQxYA1UIBAPh9i4YR1edM7ZGA6WvRifrbyOlBJDHUMoCSkVvvb186C1HvGGWEwMcXZeZGbcP7OsBdTmKPteU2rxNGPsh5EbVGyzqQisFR7QUwVxmIY3MQsF5iqF4125Aay2zs80aMWuyIBrs77/v9fke+xqj+Mmbludcc7MEESM2MawxLBe4yXRekmSo4kIlhgGNvNlk/5NyRDW5kNJlNVfyFboLMYvk1hpQrLxR67+UcWRf6Z8LZbxza/8HNbqTLppftG21sL4KtYkGHE8hFQMaw3OPucsrFu3ZoTCAGAIaOMQFyKGBANGo9cLMNRDiDDAHXfcgfvve4CDoO+uIwggOdZGKYufrTuq9EdQpW7ilY4zjd2lMGBZtlFxINUJ8Y1xKip6IKuqnFNYLjGKixvzqJpw/sjW1sqOoaJXQ9S8CFZjVCNEz5+lpadU/Fx9Hta0AFZzVkQFB22Mb8CAtU7fiTk9qtpnvEZOea2c0XnG53YC9BY5FbnPZXRhskfbjS9RBB5x7uo91aymCGfGVtrOPosmuY9qroN7nrGsncKRnKvqPsrGfnZ8FbPTxjPW6jlLxfNVjdPqcTR+JMuSAKUI06g96zfXYh9Mu/F255blOZTFeZKuWyXnLZX0qOT3EAREq3Zsq7fT5dV2PjWdf1q5jzLl7Gy/i+Lg7rIIVodqgKR3ucVyXuzcWXp9TcznvIEz/txCCDBbxHEMJQlWG7CJse9ee9KzjjsW0WAIS5xVBgSIQDa/cCilEIYhtu3Yie9+9/tga0dFMilv6M2igvJq1jnqwqWYhWdZJb//VAlB7CqP+8lCeP4naFisJvrzZHvJbeZqFS+oDYozS22nSdqzKZX+yRyTZbpLdc80yxDuLDPZZr2ONnGnupQCqRP5FNPc4CQGTpO12yaFu/b8LUhnTfdepoAqfPVsay201phfM4/nPOdkWNa5c2RTyoUQUEp5ZMr9bozB9TfekLPU3S8u6ytRJx0ZeARGGXxmvYc0G8GqWUySaReTNpDzNItpvl9bVoFdZRnyGSw/WM0Y+Q+t4TVllkqVp1w1N6bWm5kZ2ZimqjGVvdao2Cy1ToVtsxZ1IYE27gczUALeVX3WVql7VxhkTU5h2wKOZchZ2/VzFmunanOTtaEH/7DSD3LK3tyMhZiyv0/qHbSdLMVQiZQSbKxPnQZ0FOHoo4/GmjVrnJEhRmnYSbXqVCNHELRxsua9Xg933303tNaQwhknTC4bSXDd/TZvpEX29iys8EkyDyblXjyVEIw2wnCTzJenOsrQtdL1DzsiU9XP3euBrY6zUFUnK7v+Vp3rh71eUleF3onG/Qx0mEqNv6dgW0+fCDP+tyZkr45mMIt2EUB+42yb8pXdWEnwxA1VZn2WieU1P3xzfnwXSz+xHCUJZ637LCSneQOYWOPp+z+N9t17H1/4klw9JX8dpZSrfeRVTl0oyhkxW7ZswWAQZThDotAlor2BgTyfJH16EgCJXabKsbpqH7OYtBWx+/8xYZHV7uGiFhPP/LyTHbt+cd+VhkAz6lzdHuX31n6d7KKDMunRdW94qkg6dB0PM9dvmvH4Wg3NoLJSJkXO2rRzVsyis/I3ySPrn1c3ZXNWVZObINGE0JuEh5LPzM3N4aCDDkIcD6HIVabOCvqNimPa3PeWl5cxHA4PyKdwez28DhBc12eZZjF/Ki4aqxknbguh/rC/puW3/E/k/UwzRlZDsn+1DaJJioTuKudj0ozLWczvLuvtU63t2oIEdXtH11IKZeeZNszaxM8SdQ/SdqAkNZSqe1k08l6qNs3mayPNHpoE7m9qMJupqi2lHOvgQw89NHefCaqSvFc0ehIkZzAY/Gn+PkbIC7e02NtNktl6qpX+3Cp4Rm3Ejpr7d/Wefxa6O43XeBKVYuufO68I3YYzsrojsL79qr6XrUo8SyRn+jlQlQW0Ou3UtG601Z5pW7W57T6wmvy+VV0HKsbdpMhUpYPdEtmpvJ8ZixRW9V+Cusxqjx5Vq58UEisxcvL/l+Ox4QbNkzZISBvtgCZRp/pspPHvJMhKorYrpUNOZKCwzz77QAkJISlnyGh2hk8SXkrOZQForbGysvJqCAHDDLtKk2i1ocYupQAmRQPqvIau5L9JRRHbjpf/v6EP/1NRlEkNlqLx0jbLYpo5strVgCdpr2mRvB8mI2ZX6G6tZp2xSeZFFdpSNT6nyUJquj+VyN8Xb65sMpYRc5L3cxPZmy3W2lG9FBYz67y2mh3ZBpxE7S8xwKwdMa0ThEUIAVjGhg3r0Ov10vcsj76rfTsZYyBkAGNdEUfL7BR6G+6taYEqT9ujqSdBpyJdHc7VRjSp6h7KDIiuxONJF9bsnEh+T+bAOF+gsUU6jftpF+m2JN1JCLmzguBTKHU1Nxoe94TL/t+EGiV/ZyokKiRjJN9AsAnUXS3TOtU4mHp8JNpXJZmORfByVmOyuCbkHJYpHOqyzxXXibG1YZXHXVWbNbVlTlKDWlRCT05jq+e7i5SM7+mVgN0M1oJRWaHVaV81a2uOiJD+I1ErNvTD6rFlJ8Hi/PwotOSnYCKKl4W74jhOyc7MDKWU49W4N4BCFtdqWt5l/bZaTP9pM5KqCIVNhuessqB+GGohreYG9/9eTW1fbyCu9gL+VKrIPe06MdH3CnN+FtmQs5p/icEwTb+MRzYm4/3t6nbZVS818iycIiZ3aKCqYo6pZcstTEZqPwFnnSngOjL5XYyZnvWePAOC0e/3IYSAtgxkkSh/HmstSIr0O9ZazM8tYs383KsS3pArKTCKdVPO0+NVXeBcP/GqlbOvPlc7xKIITRa9qeq+FTNJG1ztDWCs8iu3XWR4ZohNK48MmKhqbBaxqDWgZzC+OpH6G+6r8WXd5lmmHruaIpJj/d3+TKXjpkozZtYaUpMWNOzSnm3Dy6sxf9knr2TnL1LndAZq2iV2MBGBi2nKHjVru21MKqPQ5PiOKUC3RDiL87NpvVSz2KxKDZixBaqbp1C3WHYNh9Qt0E1xQOaCJV20iL3eSxo3S4wWMdpAjTGQIoBlC2MMNm/ejDVr1vwHbP5+JGgqV63LYCxOsFkbjavhmc1S82dWqM2uQMdm7c3+TytkiY5b+VOpv55K15xViGi17r0sBAIuRxfaGkxtjPZdqYo7jaGW2+fQrE8zi/tvqmW0yxCYaW6eCuaStRYykdcvlsYmOD4M2amuO8sU4XJPJbHOyjvdPQfn0qxd9aORkWWtIwBbrcFWQypCHMfYtGkTer0etI5BchR2c0hIN0b4JCqxOZG+BqNndkNxOvZ5s/e/ukJiT9YG1bUnyvWRqvRDnvobdHcvn2bSjk+eAcUN71PD52mm87Cp/2vr4NQgRblqzFOWCSny1KqMj0n2ja6E5ZGyOu9yA7FM4HWMcPskIVXjiNVsZo1q2jzqH5BzCEzWYEl3/+IEY7FqC9i0sFfTd60HYpgA9mSpwSCCMc6AsQyQcBXoXOFA9uiLgDYGihTiOMbmzRv9vVgATihPcMlSRASepQkxZXXm1WzfH4ZXUe34hxWleaojT9M9yw/neJoWNZnl+jhrRKfpOm3HYF3SwKRpwAyeqh+63Pus+r2q+nnbdsm+l42ezIKr2HVNaUqwaYrMqKobmjT2mHnTB0QSr4hbP0hbi3xWWRBtrGxb8giGGY899hiGwyGEVIX2s2nGlhAiJfqGPYXDDjtslGrGAJPx6rnOMCKGL4TJtUyRaTOLZrlxPXkb+pMD3f4wbu75fh/5QGUEyKcmCtVmDkyfldOELOSMdfBEa0v1xlIeNq0mB3NLpOap12dlGa/UoR1bOXi7FpBblbWjav7VUiIq2nhSZ7NyHFYMt64lSVKDjMsN1VG2YgsEpv5CmcZMUgSR1+1wl7dOzn6sJ+0uHTizJor5Kua+grRIDZj5hcAZLElqNBOEdFWotdZQSkBHMdYuzOOZzzwSIhCIhgZSEaRfNYm7N0txILbN1mnz+Uk9hVl49cVY9pO1cT7VjZZJeWGTzp/V7I9Jzj1NLadZODhtpQEI7XlJUzuPHQyYJ7OeVXajatpg64yYWTtjs9pfqjKIuhoNdf01bfJB66LMtPrjJeE0dXmpBEJK4SiutuzGBZqSz7hKyoIUrDUQnh1NxN6IsU4JEJl4MbUXLJoElqpu7KIYGrfywIxmhGGIYaxdphYLGAvcc9+9TutGClhtAZJpKI0hYI0zXgAGrMYhzzgcz3jGMygeDl2lat82uclMo+yAtt5vUxptFhkqvl8WE23OHiq2edNCOxn601xZt5sHPp41kn/uUb/XcxGK32u+Ppd62MVsqa5s/fGYd9cQLRfur2U78ih83EpyvMqQLgojdi7h1HUxrfAgJzT2hNcCbZKLSP6e1H8hEhVrWrEGHDfc73QEVNfe3FmnpGo+pZmU3K2/chzJDLJFopDZyeUaL7NCmLtmC1VlszH58NRIXKOcx8eFexX162/SX5kBWNquY9mNKOjsJHwxIhCk1yqT0NBgZgTCvSf9OKVCF6fnF1TbLl2RL6YiwjnaQMr2QlW2YXXRlMjF4chNUAZXTDTO3D2tuvVcx1cYXbMeibB+ckupMIiGkDIAEyE2FoEQuO/+B2GMyQmbuUV9VAuJ2SCQAlt3bsdzTn42+r0A0SAGrHH2Hc/G62+z6DxZMfG2RLsmo3U1rf9doWbcGuHYxSGAMkOsS2x/khTr/0kIWevwG7f3fmeBYj6VX0XOZFcKwSz4P81ZqNNxcxqvW4OglAIJRcO44JBWPlPpdRjWMgIVpIkoEC7xxGjjFOct1xp5066bY9+lbiiRmkX6VJlGx67SQqhT4C03TGz9plroL0lJHadRCQFrLZRSWF5ext133w0lA+eLCeTSp90PTolS69evx3Of+5x0zgZBADbxTBahNiXO227eXfRHZgG3dgrhrZKhQdzWl6ep26HOAxudvTh+Z3vdNghFmzlt0VWPZBdtjE1rR0eka9rvz1IBeTUNrzacwzZIAk9hmHXJrqxat+qu20lpvGqP4XZITBcgoDi7290nTTVeA6lgdAShJOJYg8gVHw6USzhJ9rxSVNHrzZSSbaecX20NeDXeWaK288osvTodmNX2HtoYMdO8EmTFGobqhdBmhLI8+uhj19577/0QgRrxNdhk7t+mSNNgsILDDj0IRxx+OA0GKwiUgo4jSHpyF64qD3pXx5afrIW8rYT5ao2vp7q33DaNlHbRGGl7T/9/rpK9WhtGZWG9mpp4Xa5RDGvPEqGqQ32n5ZHkPkfd7oU69k8RmZ1W+iERWk1q/CXuveNtqlwx46zhMrqfydeV0vukbv2hmgZF2yyderIo13iP1THgaRGANvV0Rr/nh9RosXS/CyF8OYAwNVZuueWWY3fu3Im5hbUezmOQ58AIATC7iLeUBK0jnHPOWejPBRgux2Bj05IDNCWCMotFf9JNrf0iQlP1Z3tPuj4Lo/lzVaRVsUpGx3Q6HolS8+S5JzST+61SFK6+zuoaGGMGegUnoCvi0vb9XWZ00EwbbTxDqOErIuE20kiHp4y7wxVZW9RiX+laJmMaEnjV3leFJIxtxDy7/inbV6dNrODCPpcUHBakMNQxgiBwtf88z0VWGC/ghM1lZiqC1+UzzJwpJdASxSgiM2O/J6QrL1E/a8+gCzLQxdqvevZU44YojTdaa9EPFK7+9jWItMY8EUyuwKWBtQSGgRISg+UV7Lfv3vjRH3npUTZyCI0xMXr9PjgaTjTRmrQUJtEH6JLBNGvE4Kley+fJhvp3ldc9i3L32Z1vtUPJq52lNgsF01lWbJ8EIZnVplIljjbr8096/11T1mdR56yJA9aY5Yl2CGd6v4W/tebAVOznOrYI+nMgoaDEPGAZbK1z1slbMZmSN0QdMpc6OApl86zNWFFt4aey3P3aVNwcm3jyAd8EJ1WFurgmD76+szmHyhhjfEFGglQSxjruyvZtO3Dddddhbm4OSIm7CfJCLhOLCQIMrSO8/OUvw267b7rJxrHj0AiBOB5AYXZw92STsa5Y4nSlDVbvntsgMV2RnqZxNu1m2RaBGmEpdbHlydth0vbnyfpjZsjPhPcv6smSjWuMmC5ENraGFqTvVxvBaSsUNmlIpTHNnKZrt9Zp6h2Ml6p7L93veMp+t9WIE4GmQlsmkQhJrmPAAAuEc3PYum0Hzj33XN62cwcCIXHCCSfg6KOPJoaBtQagUZkbV1WdwLCt7msWXJiy8ZBmIU1SH2I2VvKu5VhU1URqNcEFAULAaIZhg36/jyuv+g7ffdc96PXm0s8mfBljYyTpRSsrA+y7z1541St/mqw10CZyadVsQJZbeXbTFLGctIjatAvNk63fMv6s7WoEtfFeVlvY7anE32haC6ZdYFcdVWpQTm7ka0ypx1Lnoe8qNKmNommbdWOW9z2J9P+07VOX5VRpQIAm6vcmAbmqv3FFCLssyaQKQWprCLnsKYWPfuxf+aMf/SjCfg/GGOy1x574p4999Pb999n7YEsjYdVdMmcb9uJiu4rcwxQ+1AZiy5J8cmGXDtLOdYhIsTBXufImtYLvUvXbOliPigeByGncSCkhRQC2wIUXXoSVKAZJAc0u9YyIYKxjbltrIIlhdITXvvY1WLduLUwUuzRzY0GWx8jPxQ6y1qZGUd39l7VT1d/bwrRl18q+lz1fW/h0l2xe5DJjiuO57J6L999lM570+bJjq1JDoc5g4PK1JKvsnOoKzTCE2+Z8xc+0zYBrnapacx9N91j1/ez4KDu6bIplR3IeAXck4zM5Zjln6r7fpf0mFUXMnYPq0Zey63Qp6DtJm7V5tjpEpssaWhcZKDtHl3bPjU92GmzF+Z/9rBACWmu3X0PAMEGKADIIcd8DD77ry1/9BuYWN2B+YQPWrtsN9z24Bed++asHkQoAFukeT0SwWjujwealUsrGfBFpzK19JQZkXXZWVduJNpteG8t+Eg+nzWBrGqCTTPqyhqiDTYkIxhgYBkQQ4r77H3r7eedfiLn+AoweEXwT400AIDbYvn0rTjrpBLzix19OJooAslBKOIXeIGg1mdq0b/E5ikhT10V5GoRtNSzzqsne1GdtN6CuPIaZhb0avODV2swmOU8bw7XpmnVGxKzuc1f2X5v1rclgWi20eVYG2pO1PlQ5GZN+p+75q1CRafk9s+Z/jRkFLQ0prTXCMITOSIhEUQQV9nDpZd/63QcffhQqnEOkGbEBgt48Lv/mt7AyGIIFQSgJrXVKp0iMoVlEDNqg4nUvUWYB1VmNbSznSb2srp9tg8RUnTs1kEq+VbyHpMMIElIC5577lXc89tgTUMqhMjBuYCilIEk4VUMhsHbNGvzWb74BQriwUiAFopWBiycaCxPHEy/M03jYTZ7OuCIr+SwcKvn/rlmoKqF4y94boNxR5gHWj9MCV4tKvAbhwol5T4IrjnLkpcs4boXE+OcvekSrsC1O1N9Nz90W9WprgKTzRdAYwtXJW6dRpeRJ5lqxf1ZL6O/JRkDL5oZr9+Ix2Xow7Z7RxbAt9p9ocd9l60QZ0rBqxh9ZkOAc8uIQP19K2TvV2sKpxxsGhIRQAYZDjYsuuRQMkR4giV5vDt///i34/vdv4V4vBJHMtyVzJQrcGvyoaZ8mFLXUgOliAe3KiryTeg1tjK6mcFX6ORmASYAF4ZFHt9KXv/JVCBWCKIHXnOJuFA+gdQxJjO3bnsAv/MKr8axnHUPDlSUE0sF4Yc9pxsRxhLDXm2m7rDbysKv6us7zmNaTnMYDfbLCYpN4ZrMMIU16H9O0/a7elCcJncxUgXTKef5U4U2tRnZi034zS0OwVVmMio26S2mcXdm2SQjJJaO496SUuPvuu/n6G2/CwsIaxIZh4RXkITCIYvz3V78OkKeJKJkisIm4Xd0cLRO37TIHq34vXlc0xfTK4MhJJ2K7hWPkxVKphzudp1i9iFLpoT3qZg0gpcKXvnSuvfPOOxGGPRjr7t8YAzBDCYlASmzbtg1nnHEafuEX/hetrAwghENlHHfXwmqDIAig43jkKQoaxcXF7CDerlDs6k3CcqRieji7vr+zXCauUNTMexNV5+tcpMeNG3ApEjQ6RKWnysyN7diIpjV6iO3n10jnQ6RH0/jJlhnp4plOggRUcUtazRHK8Keo/bxqQkjreHeThkWeDAN1NTflupBXndHQNkTUqh8ZuaNq76uab8XNNi1FA57puG82WgsFlzNGR5avyiTxrSuvwmOPPQYA6IchAqEAJgih0OvN4bLLLsMjWx6fd+Vw/DMJAQYBQqaaZ5OAILN6iTYXmtZw+WHjXWRfxhgwCQRBDw8+tOV//Z9Pfgq9uQUIGaQLlJQSxsSw1mDHjm14+tOfhj/5kz/54/m5HpQAlCAIn3YmgwAqCNJyBKthoKzGQjdJ6HCWnvGk0PKT6aW3MQpncY+rxe8oW5CbNpVZrQFd9Z6mJUU+GZv8U82A6UpynWT+7sr1vsm4nFZLbBZzeFKEogkUKBowicxHsmdprfG1r30NYRimiSJCCARBAAAIwxAPPPAArrv+hiUZhmAABs4QMuxdhFXkktUlE2V/F2087tVOxX0qexBKqbRY44c//OGPP/bYY95gMbC+knAWLlu3bh3+9l1/jd133+1PY89xMcakFrCOhoijIYT/fzNyMJ3n2rx5FJGu+jarygLLe+W7MOzE9SqZzchbu/YbHfAHTYU+dt+EyvvHdd0sDctxD64p9bPNuKtEhiasvZM9T1k2V1vUo2xeFQ22Ntk9VWNml82DGQmydVkjm5za1do32oYr26yBZVk707RDY9IFrZb2j5u3VeGsBH1hZigZ4vrrb+SbbroJC3N9CGLE8RDGalg2MGa0b11wwQWIo8jxYEjAgMGCYGl2YoBtx3LZtVTVYK4WhmueCEmsbTQwBFAjfFM2aGZV5bJpEgki+JqLuYFlPQ3KGiDszeHyK77FX/qvryDs9UEkYIyFEG5gWDaANQgk4z3v/Vs884gjyOgIkhiwFkJ62eMgAGuDRGmbuVlKu2mBmXbwNBULbNMfsyxUN74ZiNp7Z9RXSx1rx7R2T7m0+fh4rxegGxdq6larBFP2pdPJalccrrHtk+JsVFKsrkYnI5GJsA2V3XPtmplvbcbJNHo0ZfeQpDR3vea0dXO6fmea+b2a6tG7CrVqK+bWRY+lrtjvpEZWG12xVXPgSu+bnPimN2rI0xKUVIAU+NrXv+EoECRABEgpwAzE8RBKKbDVCPvz+NaVV+PRx594/sb16y4A67RGElsCW1tpD8xSnLXuXCkCY5i95km3tN0EekqFZTLaJrl8b3ImTFlMsJ3HU85RAVuALQicO7x0arVHmMa8DRzJ2sFs1lowSTAJRJYAGWLb0gr+9l3vRWwsgl4fcRxDSMCaGIEEoCMIMnjX3/4Vnn3yCaTjFRg7BJEBidE9WGPSPYvZhZ6y2QpjcdhChkl5bDa/TTVCtcWD3MBNmObJy7B1bZRhpzNEhmvg/o0ZWem9EgREmhXkOz+XKVT8f/Kd7L+6hStBsIoolS0cLAiGCRAKJANE2gIk/QRG/jlTk5sgiMFWg42FIAE2DAHh/q8Ilj0xTggXGybKMfo5d/8jpCuH4GQyN7I8jOzh/i5GPB5/PQvAMgEkXf8U9GVcbJ+9KT7SiBAgSBLpJp5whKw/v6V8FpfTfzCQQpYiK4m2kSQx0qExFkLIsXGdvQ/ice5AcX3IPlPZ+wQJgsws6OwPN3/YWKe7xMIfhblVhbT58xp2Y8ct2GUcKpE7BCSIxej+JLl5IgW0NZCkICBdzVdLmXshSFLpBmitdRofliAgIUkAliEg3XtCTByuqUX0WnjU2XT6RIcknZPkjmScC5C/b//T7xWW3N+tNYC16eeZrd9MbTq2sm2bHMlLkkjHcvbIrp1FNdwuIbSkLarGpRCiVZZosV/aIjGd9L3Ijvh+fv0RkGDr1ioIglAKDzz48GsuvexbkME8rCftGmOgdQQipxzvMmkDPPLIEzj/vEvOD4IetHa0BxtrEBsI6ceCmByFya5xZe3R5KyLaTwBCxQKRLW3qpNBP6twwySx4UQIyGpHnLXWAkLBMKCtm95CSXzkox/j62+8CWvXb8Bw6GoXRVHkyLlxhEAJ/N27/hpnnH4qxcOB03shQEgqWSiSBDcgS0HqCjtPwvIuexljIKQE+yraQqlcDSgS7A6i0c/MBly24eYGZIaknEuzLElJrktdTg6SAiQFhJIQSuYIz1UkPmstglBiOBzCxt6DYAakSI2cMnQlaWcpJXSs0zCgEBImYfUnY85ZSiPhMiHGNpkqhcxkESx+NzmS6yTChslRVlU3K35YVyW+jGSaXYySn8mGo5QCvB5Sen6l/GZrIAOVtrUIA0AQ4jga77/keaUoffayEiFtsnDGDEIg15aV52iYPtKbMtVz0xYOgMmm40hr7Yn+2nPebEqqFEJA+E1cCAFtDLSOAYwyPZI21VrneAxuHDZn6HVFPWbJCyl1ahOtLCEQWxdaJzl6riRjJmmfsjGRrFVtN/y2Wai1oaaOOmdlJXcmQSeaeDz1qd6jOSal9PWNJL511VX//MBDW0BCARCjRBSyYLifBLfWsRU47/wLEUU6pVNI6YxpY4wLKbVo36Z0/zZZlGXfV20bsUlyPz0SbxOzgl4bJuGUVWWTTJDIV+KMIo2g14fRFr1eDxdddAl/4hOfwMaNGzEYDEAkQUJCAdA6RkCEd73rb3Daqc8hHcUuWGa9N2G45v5tK7HiLvLZVUTLnCdQCBUJQbBGZypuD93iESiYKBoZAcJ5SSIb/YABhMo8B43VHedEPIlKDARC7nw5FWJCaUirWEtGZMI3Sd9mz5mIDEZaox+GDhHwE5DA/t6pNtSSCDjFsYGxFlKNPGAi5w8SjWoYufuzudDSeKjOwWejZ7alEz1FBb1mUbL4MzOMZUBY2Ex4Ny0+aiyszW+EZYuE8GhBsd2Sl9YaKgwBo2F0BCkIwksCmKGGUBIsLIbxEDIMQKFEFA/dJq0ktDX5a2d5L1SzHiToLBpC1+SRCsqPLjE2L8xYCAvsxj+VhuFsxWpUmE/EaSjT/bT5ir8WCEK3GVhjYAEIIcGpAZr0sYZl67ITedR3Es5oDEKBOBpCBX2oQEHrAbRhSBGkY65qgyg3VKrX1lmGQRLuhRACSinExhn+IOEcAWO9MSYAKTEYDl1FZAfPOOSTbY7fMTLYklA813r4XX1kqshWLNs/iutuMTzVpGtFUzrwTCN6Bo8h1haxTgzmAEopaK1x0UUXwVqLMAwRD11/KKWgTTRCAI1DWIIgwA033ICbb76Zjzz8EIqHA7AiKOFQL8PcCYgY78N27VX1UrtS0yWPfMw+XjrJ4CQaeZiDSEOFAbS1EErivgfuP/edf/EXrkOTzcxasN/QAiXxwfe/GyefdBwNBwMwDIJAQggFa+LWHTIt878OZmu8PlkH2yoJwwZBP4CNLfRwCEsEBcoYE8nvzpBhkm4BQXmhLTfrRe09mDLeBI0MivL6JZlwGLnNizK2os0YRsZYBGHPE47IhYS0BgkBSt5jBgnkQgTuepxC+UIEEFJCKsJQD6HAudApUu4IwzKDko3MI5Qi+XvBYx5t5iIX4kvbJ9YgKaBIwLCBNQxtYxde86ih2yDySrkJclRV1DT3/5rFORGuSrxiIoKOY5DfkAxbuIjcyJNz6IoLaYFEOg5A7AB+YiR2raiod1PcSPNDiMfCwQnWSe6kSPjxSTHZEcxe4AYVw8xc4AKV8dCyDgKKCB5nTw4RKMSRazulHFSfjCsVBLBGQ1sDpQJY69CYbN8YzzMwnnuwsrKMMAyhAuWRv8nWli56WpN8P/m7kO6ZXQoupcgnmEGQ0FZDKZcJw8ag35vHMFpJlWOzFZjz12TsimSBLpvqrtZdKvA4UjdsLL3cK+mG/TncdscP+Lprb8Dc3HyaXBLFg3QeEhGMZighwGxAAFZWhrjwgotw1FGHgyK35nBR6oMx1Tjr0qbZc6qpG67GQMktktT1gdptxEWrk8p4GTUvtzAHIBCCQEAbdqJ1BvijP3rbj9x///1YWLsOBNdx/V6InTt3YsOGDfjwB9+PZx56EEWDZUghoFSAOI59CEnAGguRdrAowMsZEtaURL26vinWncgjAQwGe6lohmZGbCIEgUubI5IwllMPP9vqNlmrbcmEzz4cNylxUqlBSxgV0xtVxi5sagBiv5kJTjYSz9PhEYIRxV53Jxog6IVuA2KdWFCjiumCAZtFQdjzSwjGAgbWe8M9DIYrCEPhUCiPXrAgCLb+p49Fs3Vet78/8u1ORGgqMMnMkEI5fpplGPIcHAGwFbCwSRoSjOcXkE+T4qxnm51OWbIhXMX0XHcV4HkpCFbHGdTHpueI4xjaGoRhD1EUwUqP4g1jBKoHa4zjp3j3lXyJNGfTiFF1ZlRnLLEtyaogN26tHzaWDKQ3rpN2TgxYzmT6la0FZkzZE2n/WWoIw2UMQHduUeJpWrC1sEQgthCMNISmjfaIWoBhxJBBCCGsk3lXoTeECUK4fjDGoNfrQUqJYTx0nrPnzTxpL7KNHxFCOCTEGCgZwjA7HqECZOCeE0KCiRAbx0/TxmXLsNU5U4WpYOBi18ptFJGYKmSmKYOOugEXNcZV+fsmM0YDKRFFGkwSF1x4ER555DEsrFkPYwEpXKSB2WBlGKHfn4dFlO7ZiZFy2WWX4TW/9L8wF6iEPJKuYbM0UNpmsqXVqGeRBjWullhyU1SS5cL12UmToBNUkgVSLKyVHVwq7HtolxFpAxn0oFSIt/7B2/ib37oGmzftDq01rN8gHnvsURxz1JF4z3ve89H99t39V4ZLS5hf6CEeDqGNS0NTUsEaOzG3qIox39YqbeJd5DxTS4iZEYQhJAuQENDGIugFYAiQZb8hECw55MXAQLAYi7emYZMUgbEZrpPfPBuqjmIs/S8JtyVhGefBO9Jx/noyyX7LuuMMSH+pIOyBo6EL9wgFozVkqYfveD4WDubWFlBhD4EMwAxoNlicc2TuQDQs3j2Zey4LMQ6Dl9nsmfuRNoFLk/Y0Di2ihA+jHU/COG9dCQnhNYYckdeMVWBPFl32JNsqHlviPTtPLYbyvJcktCSoDyKJucV5N4+YoAKGlCGYNdh67hQcX6nVgs0FJ5uTUIFNx5UjyjrjkBOyqBgVTHTlJLyMP42ypKgi5CAqIfqGVGEancEZM1lj3Bks5An/w5UBRCihE2K1ChHHMXoLi1CKEFuDKF5B2F90CJY2kIoAa6DjAYIghDEWxlgQOUSHdd64n5XnW7cRdzl3MTxgCTDaoDfXh5QBLATi2EApAbIWQV85w5cdmRQQkJQhClC7NXJWr2lq+dW1Fc2gT0b/l4lLOXpPjHimw1gj6IXYsWMHLrzoEqciL5SnO2gsLy9jbq6XhpiCIEA01H6uM/r9Pu64627ceON3+bRTTqZosALh1990HavZl7oI3VWl5ledQ03TiGVEpSSu2/FsqzH0Sn8v8kMiHbuFDRJhfx7GEt71d+/lc8/9KjZv2sPVjoCEUsDSju340R95Id72R39A6zeswcryDvQDCY6HEG67g+r1oYcDKOWLNVrKSTiPEAVuhTQ1DwqqRV6osLixyEPoMuhDxxEYCjfffCv/x398FksrgxTJCKTyC7/bMNxmZ9NMi4TQ6TxtW2hn502VxzvdBEj4HZXPysKFufyGDRajDZEsSIjMeMxmyThDJwgCGBMjUAKnnnoKznzeaaR1DBjt+shaUKJQycJZC8xusySCthYy6OPxx7cd8G+f/sxdDz/8CGSQSHMzhAz85mVSQyX7HMNBXEl0H7WLM8hccpGCEPDPwmm9rSAIEIQSc/0FbNq8AXvtuQ82b9qATZs2PmtxYeHa+flFl65vAdYG2kRpEbdsmEvApuMvSVF395bJ6MouKB6YNpYhpQJAGHpDxjDh8//5Jb7wokvT+2Qm9HoB4tggDBVIKJBgCFJjpMy8g0FgNj6MomGtQ4OMcaRNZoK12j+GcdkVyewhl6lDUqSGTDJeJYmcAQNvzKXZl7abs5SueYJSAyVrqDPTCFUlp/t09DFH4RWveDmtX7MWUTzwyCfBxBpzC2twzz33f+TDH/rI6x546EH0+66/gqCH4coARz/zCPziL76a5udCaAtYlimaCEgA2vNDVjE8UfNealT6dUZwwVEVlDPgXdgigJQBrrjyav7Upz+Dbdu2OT5GHENKgcXFRfz0T/0ETj3lOWSioT+TKd/suMrw3DVIzGqGpOo2/HKZBPI+YoZDpyR0pKHCPq678tt8xx13od/v+3CvhZIC++61Jx599FGEQYBBnIQ7HbJniDEf9rF92zIuvOAinHbKc0FSwFgXvhSymwHYJi2+eqzxdAZMW77MLKG9pmvlwhtkx0ietd8lglAuXm+tC0e9573v43/++CewccNuYCYISVhZXoYexnjT77wRP/fzryQlLaLlHegFbpNJMlSMMYCHhR16YHMpf10QkqbnbyXyVYY6FcJvLjV8AQ/e/9A7fvf33oJbb70Tvf48hJCwzKlODnn4NldCPRsW9LtE9n6tNzyq0uKTbKb6MvUCxC7fmWFH14GApRFJNSFjj1jtrm8cv0liZWkHrrr62zj66KOxfsNaxNrCGosg4WlYdz+gRKTJ9aFUEhAK//TP/3LXP33s41izZp0nplpfOyRp62Jo0PlEEmIsyynLvHf3P4IanFEx+unGuEMyOIO8SOEMmg1r131n48b1eNrTnobDDjsMRx91FA4++EBat24RYR+IojhtBwH257H+3DaHP2T7M9sXUroYulAOhSElQUriW1dew+/8i79GFDuSYGLMJirT2huGxcyqUchuRHh3PBU79tPahIvELuU2RZVG7SiJICjJWimmemfI0d54Y3bp1S5jrmDgl0hEjK19ImOQG1PYwB0S6YcSrNX47699HXvsvie/+CUvIgsBm/CJpOO9vO/9H3zdf/3nl7F+/XoMhyuO7Bq781588aUgIv7N3/41GiwtI0lnlTKA0cZnoXAnEm8bj7dp4xjfC8rbMeH0jPhiAkEvxH33PvCRd7zjz3D3D+7D4pp1qSNjdAStI1x/3XX45Cc/8f599trjt2BNI1l30hD7LPalsrFT165ZXk9bdeKJMpeIobV10hGxwSWXXYbl4QDzc2sQxTGkEIgHA/z6W34P//ovH8ftt9+O3vyCC5OrnlszJBAZh+BcceW38OjjT2Dj+kUwRs5E17apI/IW/142/jpzYFJxuhIYerQIez0Ya1IEpg0aU6xbks3aSPUQSpCVlCSWhRTTCqKcg8CFECCloKMIBJlOJiKJ2DJUL0QggD/8g3fwF/7rS9h9tz1hjAVIYNvWrTjyyMPx1t9/E4495nDSgwFiPYSSgDURBAXu/MyQaW0bpNoHRYiN0ezlVREZSyemqM6gyQ0kQTm8h71iQmwsQiVw4cWXvf3Ou+7Fho27ub+RdBswEUhKwGpHvjNezcdvBFLKlHuSQIoj7QSvBVI2qT2y0gjXsoATzUhQjtFPwHM8REa7I2PAJPejAoEglNi+fTu2bHmEN25cRxDk1kVBjpeU3psAkU25PEQKy4MI3/7ODVi3fhPm5xcRpwYMZ57DETOldFwFKYQzACFzekf5iZtJtc4gS9mfnKBBcETd7MbOzNi+cwWPPr4NN996F879ytcx3+9jzz1355NOOgGnPPe5OO64Y2j9urWA0dAmgjUaQSgBY/zckGk7OjKpSjOemBmSfFqr8siA6iG2Bkr1cNP3boY2hDXrNuTmqbUumybOGPNj6b6Z57Rk0/5KkJikn5kJxsS+7komFOavJ9M2dKmiRjvULVl8mY13LnSqi2NMDCEcXG4d3brVRlJMUbZ+FCbP487vU1fhQnsqkNi+fStuvf02vAgvAhNg2G1gEsDSzhXcftudWLNmLYJwDipw7Rz2BIRfDG+9/c5U6sF4o9Cmplf9Btc23NwmBF1ci6iGgJ2sg0l23sigcajrI4888rqHHt6CxTUbACEhJaXIE2CxY+cK7r//wd/cb999fyuOI0jv7DiDtySjT1AnB3DSkHylo+m5XE2SIsQoQU46OLdczhMhGo9muPcFgjDEffc/9O7LL7sCSobp/Fxe2oGDD3w6znr+mXT11Vfz7bffnpN/SCQzmIGFhTV44IGHcO13ruOzX3gmRVoDsJCiXhQwazdUfa6uz5oMIDUOj1LjDbSyAEGdK3sWyQht0YX8ufLfkT6ux8MhpF/Y2DrykwEjCOewdesSfu8tv89XXnk1Nm/e7DxOazBY3onXve6X8NrX/ALN9QMMB0MoWISBBGsNpaQnGVJLRMV2HrSNCEyH2PW48QjAo09OuE6AhHI2ip+JmgEB45SHecS5UH7jcNoClLsfZywlBlZVqMvkDNgy5Vd3/wlJ1vqxkSzcxklaW+NE8ZJsF/KhhdQIsYgMg43GmnVrsHHjxgOMdh54qCTYuqyQfKaDdGEyCJAMICQgVABSgcu8IiTYihMMIIHBcBnG6DREkaIRBrUVtpM5V63lkd9AE00HKSWEVJAiQNibS/UzBDEefPhRfOYzX8DnPvcFHPC0/fh5zzsdL/vRl+Lgpx9AVilEgxX/TMohEQRYtimMn13AUs0Skoi8QULkSMObNu0GwI0DCcJw6FQ8pZCpTpLVJmMMZp/D8UWs76eU6JuuAS4DwljtjBXiNPWYM549CYdWCCEgRQAhOI3jW+MyfYyJffYPnDo2HHl/tCmMzl3nJeb6LNkwhRdyo/JNMIoiABZ77rknpCToFQ0ZCMSRM8pk4EJvSAvjkUedkilIqThjaZiE0XnDnhUa3ibklmtT4ZBaggSkcmgZhBNjxIiQykiEA5PnS9jftnK95Bk8VxfJitUMEXXaL8lWRkYYApHWkD3gm1dc+cYHHngIQW8+dey11jj+WUejPxfixOOfhS996UuQYD/z4MeldUYlMxgCXz/vfLzgrDO9JhaPIc9V+3Kb9+tU36uQRNVWebFpM50mHTvHpcnoP+RjnFVs5JRaUvoZY4wnJxkIGcJqDc2usrQKerjpe7fyH/zRn+Duu+/GHnvsAa01tm1/DPvssw/e/Fd/jtNPOZGMBuIogoAGQFBQiK0Ga5c+mtxvfiPm3AacBZCooELcdgEq/Ru1bFuMhPty9ytcQMFYmzMCnagfgYgR6RjuMQn9fghrJeZ6PZ92anNWe642FI2PnbaeXtabT0IGVVVo89eRueso4UIvVgO/9Iuvxm4b1v3A2ggKBibWUD5Swykx2I+7hLvjM1FGwloy5+0IIbG8cwd2230zjjvuWFgdeV0F4cMbqnBfmUWSbGVFXS8PnWYSxXGM7du345FHHsHjjz+OHTt2YGUYQ6geQBLz833HS/GbdxCsA8C47/4H8dGPfgyf/exn8bwzTuef//mfx2GHHEwgizgeIpABwkDBmBix1pCepJuKGVof4iOChKtAK0CQQYiTTz75o8cdc/Tr7rjrbhitMe+JzYIIfY/kcLHPUzE7/zNVJi6GI/x4EhJGOGPFiehpfz9OyFBbh9KGQR9RpNHv973wmyv1EccxFhfnIcCQkkaicHDGBZPX2TEjPlad4FaxUjxJmSt3QTbRg3EZXsIAhzzzcJx19pkHaRP5+aOhBSPoKVgjPNLmDF+TVNNmhkzVaTl1OIRHCx3SzTPZdNuEipqcyRximpBIM9+3PmySH+PkjefE4XXPJjgRbqzeayw8wklT8kky2USTtmEOMSi05SSaOlWho0b5ES5kwRHQ680hGmqcf/6FiA2jJwSYCUpa9Ps9vPCFZ4OIceppz91v3333vfexRx+HDEKHjILTLFoiicXFtbjqymtw/wMPvX3fffb8U2hbmuXX5pmbdGDajmuFVXxNasxMG7fMWuVEhNgYKBViMHQSyf25BQih8On/+Cy//wP/CG0Zu+22G3bu3AFmg5e+9CX4nd99I21Yu4DByhDEQCABZomgFyLasRNhf96FkFJ1TG8WNN47IyO90YkrNKvFarzNR+c02Ro/bPyi4jIf/vTP/gxHHnn4N+LB8Oxkm+n1gi9KEncKIe7Okwdou7/XrYX+3drwjOuTw2/gB/iQ3Fpm3uD/tiH5+/hLDJlAAvQEES9rrZ8fSHH5mjULp65dswZgA2mtDwBxmkZMzGBhUl0gR17l3KI7ahcCC3hZcwbD4DknnYx3/OmbyWl2eOPZ8xhkhgeVSn6zrSwCR17SnyhDkvOVMaLI4NHHH/tfP7jr7o/f/+BD+M61N+LG734P9957L5gZCwsLTiHaGMSxS8fdsHEz4miAL3/la7j4kkvxIy9+Cf/K61+3z+67b3ogHg5S1GXEJ8oo4WJkzEgpYeFKPjBb7Lvv3r/ywQ+971fuvfd+TngvJs4rxo4FjEmkJGUhXMZUgiwV+9H3f48zBFBjHOkelqHCHq66+lq8+73vgzEGYRikyE8QSFjWEAT88R+/HUcdeSgtLe/4cWvwNB0Pf0zK4EpjzLFWm2OstXuyNqUGTA6NyigJ+zEekVA/KJDy1oK8WhKb3a012GffvWhxfg4QjOXlZQBArx9A6whSOq6BZXd9Cxc2y+rLOOMmW5bElqbhd6ng3RU9qA4XTcBLEeSRSzkyVFMiN8FQgkTZEfeFVh/dmHTNbRJi62rEdKsNxmmoaNSO7FE7iUBK3HrH7XzDDTdgYWExLQcQxxpHHn4ojj32GDJ6iD12W3/ficc/C1/8z/+Ltf05GO2EKAELbQxYMCQIjz76KC666KJ3vPrnX/WnsWEoiDFHrM0YnLTeVPF7qgu01sZQyTbqpB2W89a7lhsvevNEYJIYxBogibk1i3h4y6On/83fvOviCy+6BGvWrINixhOPPYIDDtgfv/prr8MLX/gC0kZjOBikssnkpTvjlSGC/pwzjmTgrkfG8Yc5M6HJemqmKGHw1Cg7tqmPgRYWblGd1jpEIKkimoq+WV+2MoOguLt2hpaQCamU8bT99sK+e+9xjtUOfuz1ejA2TtGJvPFWtKRlpwWiTIa89Bkz6eqpp+p1QEb8I+sqrJoYke9TIUQariBf0AzWCduw9EYmi5yXm17XER9AsE64kC2i4TLAwDCKYHXswxVe9Cn1jGwqhZ7qx2T6JWmnXH2VAik1VBL77LP7J/bZe/dPMAM/9VMvw/btQ1x33XX8xS/8Fy6//HJs27ET69atQz8MPWoBCNnD4pp5EDE++7n/xNXXXHf/r/7aL+PFLzqLrHX9KYWXG2dGr9eHiaKxkC77Z46N45OtWTuPI575DCqKjaXZZTkdFzviSkmXojnivMkxcbri/miMQwYNO+ZK2OvhB/fcw7AxAslgMwQJAakIUbzsOENWY9PGBaxf30cY2i/2enPQ0fC9Lg1ZOQ/TuhCSu2fjFYqRjqXs/SXIQfK7gUfp8jqMaTSciGFZw8RDREZDeSPRIcOOKJ+kwVurvbIqMjwkU+IU8Sjc3zB/dqVAKViU7w0+uSJL9B0ZyMn9jhCYgo6yDzRzRkNJQCTrbYf6OXVFg8eLsnbfZHPPMybs3C37prUAKo3O72HqvGAjEy679JvYsWMJC2vWg8ilrC8vR3jpS1+CubkAgxWntfPCF52Nr3z1ayMen1SwViIIFGAZFgZBr4/zzrsAP/1TP5m5T55ZHnHbOly1BkzXOjtlgnVdjZe6UEqXMu1ZzRcnjMSAAIKwD0sCX/7KV/kDf/8hPPTQFiwsrMHS0hKMifHyl78Mv/lbv0GbNq7FiveSCBZShRBKuho6YQg2DBLCFbRKoOO0cKTJdWpLe2QitKmxbzgPaWYNvDJDJ+0L65eKdCMy3mN2WSAEi6XlHQjDEMtL25wIEhjWZ8mUkXPdy23qZQXxsunR6ffZicSZzP+LujLZMgJpNhMlpQh8mivIka5J+PRA6VVAs/LbzqhIIdokI5oshFCub61x4QG2qXECL/MulfCxaIDYQgUCZA2sNVDChaVEUl808VbSTc4RdGVqtJuUEJg8pBDKZ7RYxFrDJwA40rAIMB8KnH7KyXTaqSfj5u/fxv/n3z6F88+7EI8/vg1r16yDVBKWLdi6dOg1Gzbh0ce24k/e8Ze44YYb+H//9m9Rr9fDcBjBGMZ8r494EEFKhzYYrUckXebUGyPlSKU61oBlSOVUPBlOsEybCKxNzoBJ9HxYuCwx92yu3pATkBMpU4y9UelChBLGxM5DZ3c9ISWG0YozPGBBJHy9oZEhbq3Gzp07UqN6544n3MKnFNg454SZAWPzGRU2nwacEnULISSmPF/IiQ6TT9t2/c++/mYgXKjEePK3NZ4KXiz8ZylFalFKgk8M6/qQwywRiEmMl+QZxsVa2yJFNieUlEN96sSLOq6tRdmAWfCJxjhULa5dGnIt7su572Wcg0wEIIkISCIMowgXXHABgl4fRIR+v484HmK33TfhBWedeTyzRuAJ1CeddBIdsP/T+L6HHoJSodeAolExV0UIgx5uvOl7+P7Nt/CRRxxCbGzps5Xt55OoOjeVx1Fdih82kXImhc3alUyvYNmnHI+M5ZkcghAIAZIKN996B3/g7z+Iyy6/Ev35Raiwj0cffxxHHXk4Xv8rv4Szz34+aaMxWB64DBJr0Qt6rp4Ru00kHjr9iyiOwSZGEPRctVtO78AHHly2g1sHdapLUuSkTBVr7YhMYayNRSYzwCf6sIN1ZaKSSonHbBAohUA6S3zdmkUn4jY35zdbb/kjSWMvqVjO+YUur0uTKJUlnpr/6SvW5uvicMo1SL6fkF2RZpQgPafWMXq9HmysoXXsMsO8TLYjoqVithhV8hpV9HKeMY/CF9ZlpyWesQqkazehnFq+VBBkRh65HTcYKVswQI0v/kSc1tixcFooo7TrrP4SQcIAzLDaIIo0DjnoAPqLd/4xvv0TP8H/+i+fwCWXXY7hcIj+wiKInIqmZQkGoT/fx2f+4wu47ZZb+e1vf/vH9j9g71/mFfesQRC4z2oDWFd6wbU1EEUDnwGgAAv0lYLVBtZoDykD0hgIz+lIVvDEY2b2ITsCRFKTK9Ut4pQfYwmQvuAmQcJKR8DX1nl8YaDAlryStnCcicgjW3CZgYIIgVRg48b4vF/ItdauOrYibxf7quypQFJhngnKhFvhqymPFMeTDEMBJ+0gvLFqtQGkQBQxZODqhhntFIqZKEWVUpQHwhtj0o/LZO0QuarbQJJmbybKoqnSoZpVmGakNZRX0i41UpBkb2Ynjc0LYiaTJ2u0VKgAT2N4WH/PU1JrWrfjOCl3Muc23SN5JMNAkLjmmqv4lltuQdhbdOVTiDAYDPDiF56FvfbY9B0ghhCOA9nvS5xyyin4xKc+5dD12EKpIDVkXEkVhcHSNpx33nk46pmHO2Qb7UpOTCuKWEoYqNsQmwilIonHTrQb23QAll6nxKJPia+Jl13oeZuQuyBgRQBQgK07h3jvB/6BX/+rv4FLLr0C6zZswvLyCmJj8Ju/+Zv4+Mf/hc444wwyxolt9ft99Pp9zM3Pg2TgCE1KgaRyqr0QUCqEUCEGUQRj4eO1znMaSTgLn+3k/5ZFiFoO0DoUqjKEVqzKbROo1o4QFv9+GtiwPiujJJSXFR9TSiEMXbmEICW1usWaOEEo/E/rvFrBPpzDSYjG7STkE1hhtQsD+e8JWFcBmBiKRO68wguxCVjIRFPEh2PSKsw2qQ6twZ6X4TYIx+NQaYptAK3teMgCmbCGddlLMDpXBTq9hid+Jun++XkgoHy2UFp5WCJXyTs9RBE+LnjlWYHAhBNgPYGRfW0uNgilgNERdm7bgaOPOoL+9l1/SW//oz/EHnvujmhl2XlQYegjUwo6tli7fgOuve4m/Mrrf+O1V155HffnerAWiIbajQmrXS0eo11xT8tQUiJQTjFVkGtrAVc+Q0lyqBObdIyJzBYs4FOf4TQDyU2cdO12onfsZfK9Fo8zT9x4lIBMeSmuLZKMopE8gkcPDbssIF+jSfnvmVhDkifP6mTsmPL5U7rpZxwvdm2fjMvkfsmjVMLtDn4sO1KxUsrfK/nsJ/K8quqK2+l6yy7rKUV7dhEHpGYhd0epMeE3cRaFvZlLq2g7xMWO7ROp4Va2J7SscFy3j1WtvV2+3yU1fXYvqo1OsCB8/bzzEFtXLiYxqgIpcObzTwPIjUdS0hPcgRe+8Gwszs+l9QHjOE4zEZPK6mHYx8UXXY7HH986z0wTASBt97KmcyhX2iTLYWhPok0l3OV4I4okltswKWTRQk+5EgJsGUKSLyXvoNcEkgVbSKUAIsRDVwmXtYW1Tg3XMvCNb5zPH/nov+DOu+9Gvz+HjZv3wNbt23D8iSfg1a9+NQ466MDP3HrHnfz4I1swGAygtYaOh2mRq36/jzAMMD8/j4X5efT6faxbt+53+v3+e/r9Pnq9eQSZEglaaxgbI9YOOg9Cl2adlCFHktnh66EkRf7IFTuBjiJI4QXBpGPZJ6uU4CrCnh0bzFljSYjE3x8JlzmRNecvWuuIjjl9i2RDpSScpEDCQim1xGyd4mqCwnmeQMritx7t8XBsikT5qrCUKcTIqC4V36SHYzGqckxcgDrIeeDZ7KWkWKKxFiSdxo2QMhd6yhoIaa1YNvA6erA+Y4WIIaDSSebSdj2awzYNbZGlTE0nj07JZJ7J3CY0XgiTUuQqWdwJlNYKJB/qclmmIl3sFREokOB4AEESP/GKl9Dxxx/1jXf+xV+f9Z1rr8dcfxFSBfA8WKwMNXoLa/Dwlsfwxt95M/74j9/G55x9GkWe8M5WgwSn2U3whpplAyGFR8Jsyj3LSvUXKWzlWXROPZeLkDGMQ0Qg07i+ED6zh9SIQ5RwtwRBa+Mo1dbVRnIJoRJGW1cSQ7twqIB145KR1p0YZRJRq0VXjI1NMapGDVeiwYkHJoirI8QrJdMQp6A8QTjdsMll/5EAhA/jSVASOSzhXExD2m02VFrzabLGRxpK9t8xFixETiNs5BwJr6Ek0wEz0vuhAqeD0/ZjIG3furBMXcSAOC/MknWS61qWGtot+/fa6AK14zCOfT55Jl8KBJSEs0MYthAqwINbHnnTZd/8FubmF72cA8CI8fSnPw0nHn88xXEMthLauPEmJXD4EQfTwQcfwN//3u1Qvb5TtLYMzRGIGLHVUGEPd919L6655oalF551GkVDDSVVyoc0vuJ4orVWZnxSsSYgUSOtpGz8qiboq3X6XOPg7zpx3APq2EKFASwYMoFnhQBJpzVBRAj6PacGGswh7Etcd/33+EMf/kdcceXV6PfnsH7DZlhrsWNpBzZv3oy1a9fiM//+H7jrrjt/OooiWB05fkEcA5YR9gNIUoj1MPWuE6n0Xq/37rm5uXdv2LgR8/Pz2GfPvbDbbptwyCGH4IADDrhrt903Hzi/sBYwFkZHEGQRa5fdIhWN9Cik82DTBdRXp00mrFIK0XDoaqEkPJsJFigqiUmP3rQp9yKdFK7YESB8HDVBWQQghLgLSOpsSFhYSOTrWXWDoH1xQmoOK3bxZkRLIh77HZZ93SOQhfTS8MQylaBPyKdc4h041M3HgX016qyh1uQ9Ebh2kSsLGxLXb1kS7DdEgzga4IAD9jv77z/wXvz5O/+Kv3zu17B23XpYdgaC8QrUvfkF7Fjagbe+9Q+xuPBuPvGE48gyA1LCmsgtTLFOBcecejHDFj1m7rrp1afVE4/CegkXlMY2KZMLR6TBgJSb5rk7bEBWFGyUorNGE4XCKxHsAl0jKcWR1g7jfAquAsEIpzSdnaejnwLWj1Mm63WouHN16ebQTv28o2yRWi/kOHa+pAwIFzdmO2Z4ZMtqpHMjW0PPa+1Mk5Jc3yaT93uduN8s0tvrxlqqeWQdN1OzI7kHgcI3v3Xl3z7++FYE4RxIKYRKYufWHTjt1OdiYb6PWK+4sKulNOlCBRKnnvIc3Hjj9xFyH7HNKFmzTauiG0O45JLLcfbzT/NK9jZFBl1o3ju6E6KEbdqQmR0HpksnNXJVxoorlnf0yDMRqYfi/q4z4l6uKBsgAe3eN54MaK3LQrAW0CwQ9AI89PAjZ37wgx+64LzzL4QxjA0bNoBIIIqGCIIAaxYWsH3rVvz3l7+MMKkxI1Uqxtbr9SBJIhrETh8EEmGvh6AfgKTT4rBG4onHd+LBBx/DMHKoTYLYzM/3n77PPvvwEUcchhNPeBaOPuqZvM+ee4iw3wd5ZU5I591ruLLygpSv5+OVUaXPSrGxDzlUeA+e5CqQJ69WohkVE3UU16eM7HtGWMz/3xF56Ym2sOqYgiKVuB40LXzdPFYnT9drvpdEsK5IILeW05ow1fLueUNmjGvRYiEtJbgl1luCCJBAPIjQmwvxx3/8R7Qwv4Y//R+fwYb1m1PDJIoiWOsWQhNHePPvvQUf/ciH+JCD9yerY5jYIlCugnKyMBmb5ws1hzwrirQ1eLojYnxBz6gkrj6SMxhx4op12kDjUuVtNhAqFKNtGlZj5M2ktgBXh4hdSBQpepnN5hx3Kps33K5jZ6INlWzlvKlWYi+oM2fXOB4P4ZTpnySk+C7ieqXEUlssQNt9/clqX82SR1T3DGmWpnKiq0LIJHsfQoXQscU3vnE+dGyxsBjCGosojjG/MIdzzjnLYdjGQIrAQbGCvQSCxPOf//xtn/g//7FOx04R2/Cofpr1h1AKl11+ObZs2fLG3Tavf0+sI6/iPZKiqETnytaBSkXnegNOTROH6rrp5Mi4GdVFF/v0bybpx150TSoXWlEqhGabZhnIHmGwMkQ4vwZSAF/84rn80Y98DFu2bMHiuvU+e8LBzmEYYPv27V7e2+KgA/bFvvvuiw0bNmCvPfbEpvUbMD8/n8b5VqIhdm7bjgcefgiPPvo4HnroIezcuRODYZxqZswvLKLf7yMy2lerthhoje/fcjuuvf5G/PtnvoCN69fSM488nM844zSccfppj++33z6bwnAOsR5Ce6PHWMf5YCZID9EDgAgCkI85li1Io8U4cc5Gi3PZpOYSyDJNHxTjAlMo4ZalGi4pHJivQF028FZjIjfVd2kyuFvdUxp6G1diHdsUx+aMBRfT5yuy7Ah1xdna3W+pFzgKxAKSMFwaQPX6+P03/zZt2bKFL7zwYvT6c9CsfXVjgIRC0BN49PEn8Cd/+mf4+w+8d+/FfvBAr9d3BGivTxLHMWRSrJTaer0VMuMpH6KqL1Ef2qkYG0WF1qIScDVngaYeg5WS6mX9X5h76R1wxaaVbXNfmbzumm3uu43B0kZgrI1hVToPSgp87goOySQic0+VV1YlO6kYz0K4Ao1C4K677uabrr8JoZdSAIClHTtw2nNPwjMOOZisjhEIV57DEkDGBYKjAeOAA562/qgjj+BvXnEVgt6CL6I6MkCMZvR6PTzyyCO48sqr3v1jL3vxe+KYvPK2TnmBk9gMdXWSyvYXNUvvt9Ziz6YZ1lwzIQanaWFwtZZYkOMUyABxHEEaoL+wBg8/8sTmv/7b9zzyzW9+E1JKbNi8m+fMCCwNd3i9kgDHHn0EDjv0EJx44ok47BmH/uamTZv+XhIQBL4qsjEQXqPBCYFKJDXvHt+2DQ8++CDf/P1bcN0N1+Paa6/FQw9twTDSUOEchAwcwxuEhcUeFtesQxRFGBqLK6+5Dld86yp87GP/svHkk0/kF7/4RTj52SfS2rUuk0cogdijS6xdx0sVwkSRU0VNjZiiQUBj6XNIMlyyabotNrsiAsNkc8gAj1Rw108/XgqeN3OlV1ozUKr1Frp6kcVNqGC7lZEqR21IlUb6GFW7QimaCZkK5dUbRnovXAJkZd5PkDhB1onhKQU9iBCEPUTxEGHYw5+844/ooYcf4FtuvRMq7PmKzBLD4RDWGKxftwHfvuZa/P0HPnj/2/7wLTQYrkAJl+GV8FWSwooiE9um9HmaDZfUqGjkMLTLeiwiAFleVlZFl/2GWRXCmNRRqySTFgwoLpH+z91j0VhpDBHXG13TZn60r7GUMxXbBHortaHKjMyyMjFtENIqR2r83HkEptFpKHBRuKCFQmI6B46pXc0gzYyg18NgMEAgA8C4Qp8XXHARtm7djsW16xAPI5eJqSOcccZpEALQg8ipsDsSbErN0Nqi1+vjzOefgQsvvgQiCF2iQNKecE6+lEFKEv6RH3lRyvMk6ULtEqKVJlxTIcym5CLVtpHLLHeb9eInnfyUZ55nN2siQOsYUiqQh7KEdRCZUAKXXXYlv+vv3of7HngIi2vXuDLzOsJgOIQUAsceezTOPvtsPOvYo2/Yd+99jumFImGPIh5ECJRAtLwjhd3ZeKInfJE5j4asXexj45GH0jOecTB+7OUvxcrKCq699nr++jfOw2WXX4l77nsQQkmsW7cO1gCxdUxtAOgF7udwaHD+BZfh4osux0EHP51f+tKX4CUveTFt2LgOMnA1aCy7tFHh0SejdZo4OY6GmTSFuU4Xp2yxsjTOPSDBY8SNhCRInutgrX16k+rkk+UttQ0FlE4W8htpsuFw+2sUz5vA5rn2J9tqfk1kiFFN7NgCZjBErxciHkaQQsJEEebn+njr778Zr/+1X8dKFAEkfSy9B1LA0mCADZs249P//jmcdtppfOYZp9LK8nb0QwVOiqOW1I9JQsjTeLZNoZJq1KskPIBx+f9iXaZJVFI7jdkMgseV4SluRDJm6bk3GWDTq8by2DPnUEHu3sZV4ai21ZybSiW0bac29z0LVKcRtRrZTylnUlsDGQTQxuIb512AMOjBFTkFosEKNm1cj2effNK3TTx0+kwiURpPDBm3BcSDCCedcPwFmzasf/627UuQYS8NlydZlYnUwo03fhf33ffA8oEHHjC/vLQDYahcFMU2E3Gn/TuAeg5M28ndleSW915NYcMQGRYyPP9CuPLfQQhIAbbAhz70Mf7kv30a2gJr166DMRpLg51Yv2EtfvSlL8HLfuSlPzjo4H0PYFfEFSa20EOXs25NjLDXA8eRq8ybSYVlZigp4LJtyJd4jxHpGMZnDwWS8JyTTqSTTz4Rjz+27aUXXnzJ//3s576A66+/ESQV1qxdnyovJlLhJAz6vQBKSNx5x7344N//Ez77mS/yT/zUK/Djr/gxWrt2DjpyZFlrtCs8aeM06wMlHtmoTW2q+Nuq2nXWyxE2U0+Kxvxm4fVRfNtsGD+jzZT/Gl/EUoQgPW93xdBp6opMsvHkPbJ2nvroOZJsLznTDYfS6Gthg+fR/WaVQME21dgZDgZugTMaRBLRcoSjjjqcfvmXXsPvef+HMbewFgmvLKk4DWZIGeADH/ggTj7xBAQqRGyMUxdmi1AGae8XQzTZEdS2vyhXwNDXFPKnccq4lCoBF5HBfAmAgmElxje+nPIxrx76XBU+auOFzuqeVtvJyPVvQWgyi6SUGg+MnME/QtrqkZ9puG1tQpvTtO9qhM6rKjkTEQRJaOMMi5gN5np9fOvKb/Odd96NcG7eJ6AILK0s4cznnYV99979BDYus9C1v4WrT2vB2kkcxNEAe+2x+wue8+yT+P9+5Wsuwxc2SeRM9bOCoIdt23fiwosvmTvwwKc7LSwf2rRkYH1GZldHsI3hlo/YzNAztCUeYXVncorAUA7RJ69a6v6v2RcWlAEeefSJ9a//1d/gD//DPyEM5rA4P4+d27dht02b8Ftv+HV88uP/Sm/87V+lgw/a9wAdMXSsMVheAZsYJJz+SBgqcBylhdiIRKIP7363SNEXp7mhnbYDW5B24lRGR9CDFWxYu3DuT7/iZfTpT/wzfeD978KxRx+Jpe1PYBitpHoPQggoGYIQgKHQn1sDQSEefWw73veBD+MXf+lX+Nz/+w2WgSPMWgiY2DhFTh6X3863qS0Nc5TF+YtVbbO/l4WaxlQimRdK3ptq/ExTCLRsgBefexIeVzFcVXvtEnQlp9Q6xfWL5MC6zxWJxK6DHSwsmMG+UjWxRdhTGA6W8dOv/Ck69NBDMByuQMlE6ycEhIRhwpq163DLrXfiS+d+mXv9RQ/7U1q1Ont/bcZf07238m45u+Env4vaIoxtDeRdseE3tcOsrl81Jrq0dZt5WxaCntQIGPtZSGlufz/UelyWrauToC6zQl66rKOWnAMRhCEMyGWxEvC1r5+HSDukVJACWYYUwJnPOx0CjHi4AgGCjiOw1V6s0uk5OXkGjUAJnHLqs8FGQxLAvmSLK03iCMCJYXXZZd9EFHmZBT8Xc+VQWq7/bedC9m+iuEgWGfplHVRW6jp7jmTfTeL7qBnYwqdjOk0uC0nCqWSS03WwEIhig6C3gJu++33+mZ/5uSeuuOJq7L7bXtixYweIgd/49V/BP330w/SqV76M1q6Zx3AQYTiIoCRDEhAqX0AONoXLnMaAS2PkRMUzLS4mXBVh63Z8AenuDY5roEhAMBBK5aoaD5cRCsaLz34BffqTH6d3/MkfYe89d8P2rY86cStjc+RC7a/FJNHrzeOuO+/B2972Drzxf7+V777rga8oKSGEciqdxkuiGwNBBGtiV5BQAGx12mfWH6mwVCE2ziUCas5Rp1rI0tXtsfkSDenvXLsQFD0dZqQs9rYbWXGTbLLIq8IJZZOlVcGxksKEiU5H9v3shE4MGxJceW8OqGlXmTu/EaHQr5Rq8pR+jw1A1ilCWycYaHUMAcZCv4dffu1rYIyGEEAYSK8HIZ1Yo1BYXFyDf/u3T+PRRx87Kgj7YJLQ7FVlE4gko6SaOgSTGmyJCGLNIpeE5bKaIsV1q4r7UbV2Te7Bl6+Bo6rJXnOpJsxrMxV9bWZOT7vh1Y37sjadxPBsdGC4aHS6MGMZ0ZMqyLzZdiqKFU6NUFH+yN5vlYPUNjQ9qUFX1b5ZUdFEN8haiziKPDIS4L4Htrzmksu/iTAM3dpuXZbsIQcdiJNPPP5wY2NflsQ4aRC4zziRUIKJNQKlMByu4LTnPmePffbeE8PhihO2B0GQ2w/n+07sbm5uAdffeANu+t73WIaB49OJPFewjENYt1fkM2JFbTuKuphjW6hzKghUO4VV65nSg8EAQRAgir3xog16c2vw31/9Or/udb+Kxx7fik2bNuHBLQ/j1FNPxSc+/rHXv/pnXkXr181huORQEQWGJIbVEYQ1Hn43I4+5wmseH0CuZH16wKZKoYIYBA321qqxQxg9gCSLn/3Zn6B/++S/rvvRl70U27c/DqnYqX4KTq1mTQwmlykVhn3M9edx/vkX4tX/6xdf/MUvfpmNdbL+xgLDYQzj5eylDFIpdBUEedi9RlGysqgZZYYCU0N2DWdKDOyaV13Ips3RzoMaT1Evg2vr/t98/1w29TqhBpOgOolC8IiL49SOBQPGxjj11OfSSSc8C4PlJWeUGZsuGoYJUin84J77cP6FF94QhGEm+0FBKTVTBK3pJbi43rTnMmTbfFIjpWxBXh00xkyNhM8K+eoUbu3gWNQ5LHUGwTSGwKxRrmnua5L1r+y+pZSw5DKDSAhccvFl/3zfvQ+4WkY2xtzcHAYry3juKc/B5o2bbraxduVUknGWEVtM0rCNiSHYYmFhYctJJ52A4WAZvSBwgooiQBB4NXYhXRp3bHHBBRd5sTyX1qpjO5N2aSL5iqqObhrsdYNA1IjUpdZu6k069MN4qfegFyA2GqQkDANz/TX4wuf/i9/85re6HAhyBKI3v/l38e73/DntveduH2EbY7i0BIIzJlyVNOPqxiRS34zUu3MFC50EvSEDK2xq2DBZMBnAK2cKX2lWkPWHzhyACl2YKJGLB1ls37ETmzat2/7Xf/12+uM/ezsiM8TSYAdIGEAYxHYIUoShHkIGCtFQwxjCXH8Ry8tDvPnNb8Gb3/IHvGPnCkgFDhkiCafOb33WCGC0q7BNcKEw9oTq7JGP9VIqRe4MFpGD4tPDUqOX1TV0VAe1doG3p+UDlCNDnDFcKB9iE/lSw00oUJ1ORhuUpWphLOvPnOYGoVIQMOsJwwufWdawOsbCfA8v+9EXQwhHIA9CCatjyEAhCAKEYR+93hzOPfcriI1F0OtDBT0YuLRNFpQeHrDMVHBuUaTN31OT88MwJWT/dpv8WB818JNmURyxlfFMsxnXqzFXJruYaHtT3kizE4XPqhyJLoZS4zW4cDSIanY1ZCa9r7LnE6QgZQCtga985atOz0xKhGGIKBqg3w/xghe8AIn2ixAiTb1OkJ2y3/tzIV7yIy9GGIYO/WJ4cTpGL/BK4hCQQYiLLr4U23cuQ4a9lDYhSLXKpJqknVKEpnRR6SDwVHxPotwjqzqfJQBSuAwiY6CtdYsjCfTm1uBT//5Zftvb/xQLi+uxY8cS9tprD3zwgx/Az/3MK2h5aYDhYBlkY/SUhAQDxvFVlADMMGrtqTtJ/jzhz4UALEZaJzyS+SZXB4BIpAZXYr0qQdAmxmAY4RUvfzF9+B/eh91234goXoHlGFIStB5ACIc4KRV6IiJBG8a69Ztw7pf/G6/+hdfwzbfczkF/DpaEM1aSGkRCpWUXUvizY/w33UC4hkdRucBMhsLMIuOjCmIsQuZVi1s5cVhUbixtn4kqNPtm6aF1XihtXk8hJ2VgLEw8xJnPO4Oetv++GK6spJ/TWiM2GpHRWFiziJtvvQVXXnklk1JgJigZpmGANuG9ugV4kpdoIYFft/50R9AmDIlVZQGOf7rlALCd51+VAzKNcTONc9Pmc9Ny67qUw5kERWnSFJp0DNXdTxWXyRiDIFS49trr+OZbb8fCwqIvPKsxjAY4+qgj8czDD6PBYIAwDDMOtyvFk1QsY0Gp4rwBw5gYxx13DB100NMRRZH7vEd1nfqvI/73wj4efPBhXHvttSwVoC0gVFAZCiwLcbZF0MbWgTapqa06uSthJ4mTgQASGEYxSEpAKAjZgwzm8H/P/TK/6+/eg/UbN2Hr1q14/vOfh3/66D++5IjDD6FoOEQYCEjJ0CaCNhGkIkiBTCE5X5unxsMbxdx9LJ9ppB8BCcuUHkzCFWn0PwmuOp8UgRfNc4aYCgSksBBkoOMYJzzrKPrwB993w/7774vlpR2Q5GpAuSKGDsqLtMYwjsGCYKzF3Pwa3HnXvXj9r/8WrrzmWu71FxEZIDauiKVh9u0lRnVYBIE9t2ak6UJpxe7qAdImNGNSPkX9IsNoJeXiQ2k5tEiMI0g2o/5Y/DzT9BtO47guU3OdITSceHgClKufUjVxs21VhwwlZlQSsx6hLyPDleH4MItzfZz63OdguLIMsq6GF2AzRQcZsba44MKLXB0vpQCpIOQIHQT7+eARPgOuovh02ujKPOCuG0zuPT/GRkhkt409SQYscpGmQUbqCOHtjJld/6ojwjZuyln1XsulrdiGa9JmTLQlk5YblLwq7dV2vFXzEvOOZlIP7BtfPx+DwTDDM3RGyJlnnoGw10vPGccjnlWCnDpVeFc+RSgJIZ1g5dq1a3Daaac5bbVApUZ5ZLTLCBY+hMUWXz73v2F1uUL5rBy24rnENAuMwKiAG0oU9KpuKIGYSHp5cjhSoIWAsQIymMPXvv4N/vN3/iXmFxewfftW/OzPvgp/9ZfvpN02bfxvGw0AMwRxDIYZWY3GOD0V33iJAmFXaK6ShOhDDC6UJbxhINJniuIB2GqEoQRZA8kW4BiDpWU8/YD9jvnohz+04bBDDsbKjp2uroxwFXHjOE5DUNZaGBA0W4S9Pp7Yth3/+42/h29+60peWFwLCAmhQkgR5GLydZVsO3lUFbtOvniZHV+IniRFy+JknmWsOxETS565LmwxSTZCVVbEpEbZeP+LWuKq8AQ+a2K84MznYX6hD2ttqiztvDiL2BOUb/zuTVhaHgIQiId6JO9f4Vk1qSVPEwqZNjvyqRKemQit6Gi4tA15dF0zus/5bvy5XYFcTrpWVKHVZX9vgwhOGmpKNGC2Pr4T3/rWVc7pIMdPs9Zit9024XlnnvG31hiXYWgp5a5JL9zKcMYLBLmyAcJx3yAFmBhnv/BsKK/omzg14NG+ZwxDCoUrr74KDz748Bt6vZ6rEC+olRBi26y3ss+LqpOUeZ1toMg2sH+x7o4MnfFiWaI3t4BvXnEVv/Mv/gbza9Zi647t+OVf/iW85a1vol5PYbiy06VCKwmjIyiftZSo76owcJ67BYQYVQzOIjGp3Dvb1PMtss+TbIo0q0J4jgmEr4TqPU0fSyQ26IU9kLXQgxWnV8oWAQGhIAx3LmPz+g1b3/fu9/3O3rvvCb0Sg3VS/wiI9BCxiTzHxULIAJHRkEGIlWGEN/7um3DFlVdxoObAULAkIJTTxUlrKmVi+xYChqkWjnMHtSq4NS3cPIvFqk4roMlom2TxqPICq4z0WRhMVNATbLpXS8XNWeT8ktH3BYRQqbeWbTNmgwMO2J/23XsvxNEw9eqMMdDeCej1erj//vvx+OOPvwOCXMg0Ey8fQ8QKCMdYqQd/1K0N0xo9JPJrkykgWWXhm2k2zVmkEs861PNUlcqfRQirqzMw2fW8snYVuTjLLfNH9r0ilya73wg0p3U3tV8yna+55jt85513o9ebc0WJAawMlvDs55yEfffd+82xHqaOveNqekFHoVIggYRK95EkzMTMOOKII+iYY47BymDglHZphGyxpdQY2rp1Ky666KIPJOUxZj0GytZd0aaR6gycYmPbKinmBGL2ISMkqWBSOCGeIEQ4N4drr7+R//AP3gYiws5t2/Gbv/5r+LVf/xUyegWDwTb0exICGjAWAUbVLxP0Ikm1q4IO23oeYxsjZGogZA2F3HU8IqKkhCCGEtKV+zUWvVBhuLKCfffc/J6P/MOH/mPTxnUYDpYRCEIUDaC8NZzUegIAIR3zW6gAS8sRfvdNb8FN37uFVRBAqhDWKwaXxROb0xvtqGxDtq9LlJETrY0icFemqDmxomxFX1Rq2jCP1TxqQp/qzlPGKRAl1QCS1OjxTXZ14PxaXZ8WzkIChCc1Z4QrK55u4om2w7p163DIIYdgOBz6rMA49faTNN8d25fwve99/+2CgCiKYAynKExZaEOUtEkXJKWYcll0prKGXit115bef9WGUjeWOo17FuPzLoNyJuUZqKrtWKzKeOpqKNQegkcK5w1Zq61QELKtjZKZa0F13IRnhcy1M2RcFODL//0VGG0zUg4uc/ass16QrpOO3hA4JCUMAUEuXCSkd8wBUhIkRbq3xXGMMBQ4/YxTYXTkM3NdFqwg5csKuL3LWovzLrgQw4FOpR0M06opFMPHP3KeSd2kzHpvUkqACVKOxGuS4kEmqxbqY2wGEgYSkHMwVqSZSNoAJHsQKsQD9z/0R7/3pt8HM2N5aQd++bW/gNe+9tVEPIREjL4SgI0hSUAiE9vPhqdSLoEj345NrNQydnyXJjJaTk+DnRAe+d8ZBpY1DPliWtaVjmcDWM2wHnq3rAGjQSLGymAH9tp746ve+56/hJKOZJVqG7BwCqg+tKQC4UuVA2sW12NpZ4S3vPVt+ME9D35KBI5opa2BNgzDGhAuW0Mol30liVNP2IniCQh//+4Z4ibgHeT5NMlkESy8ZkDV5pHXoSEmCAinIZDUccCINF0fymuvkzLWjwVPKPn/iKPDvp4PN282LCC80ZpshIkKZAKjVm5kFTyLRLenyAEqenZN2RCC8+3PPpMu4cgkPClkUEQI5T2vAEwyJdwdeeSR6WJnrXUlLSx7RWyFKNK47bbbUioN2RGKl7SvgAVZCwFbbnSkdYmS+8lmJY57uiSFL6wpKzfupA9kQf03CYc6pwZe88LJIeR5cd1Jnlnl32LIuTS8kMn+KyUjlqBnWY2h0qKIHQ2ZLhkfzc+d/D+Zx6N06hHCXX6uJNU2IY4y8tkvOY0YyksRlJ+r/N6qCm7WiqSl89FxB23GNWnSLClFgRp4fEWkx8DCwCbyaSMnOeNAp88GAZIB7rjzbr7iW1dhbnEB2o+V4coA+++/P0444QSK4zgl3TvjJXDRBzGSi0goCKP55LNrya3azz/9FGxYtwhrYqfaS4D29dC01jBgBEEPN333+7j5lltZqRDGFNZxa0frcs187mIIirYeR9XEzA16JLLfme+YOLfIa61Tzy+KY1gISBlgx/ZlvOUtf/Bny8vLsNbiZS97Gd7whtcTQUOw9YiBLYHXRauNrc1EbuuVZKG/8rBGvs2CXg+xHkJ55zcaLuHwIw6ht739D7C8cwcCIdP4oitJzggSS9m/p7VFb24e99//AP7iL//6Z1aGQ1f00cv8u3R0C6EU4ihK27s6xMcjL5n85k7ZAZcpM8/VvCbRtRDjKqASk6Y15qHIIkJVDypn0atiWKICF2n08LukkbZVF83emyN1y9Sx8DCf+64U2GOvPdHr9UaClHY0BggOUn7ooYfScZlTq05clxRNGIWIpvVKq/vRpmjiyNEQJYhhpvUn4I80Klw3kFfrHITR/Yl2i3euEvx0Xn0b8uiUOAJGekcTblKMzvOiS5hvtTPRJgmPZK+XhHESoczkMwlXjUji4ksuxyOPPQGlnEK2kMDyyk4899knYa7XT8PB2YiBCz3bHE8uIbln10QigoktnnHI0+kZhxyEeDjIjZ8EwWUmqLCHrVu34+JLLnP37YVhLURtWL5rJuO44Q9MnQ6XxuQKsT8lpFP/tJHzgoSrt6CNQRj2nYcvgL/6m7/mm2+9BQsLCzjuWcfgzW/6XYqGcSquk+iWNA28SVL7uoiUtUn5ShAA5+VZDJaXEARBXs3WaLz0xS+hn37lT2LHzu1Y6M+BTQxr4D5rLAKpUu9LKAWhFBYWF3HJZZfi3X/3PiavAaN64QgFsM4DBjNM7KzlBD1CTiCLagmoVYPJol7noyo7KMvqf7Lk2icZ16sFH3cl8U1CMixDs7xqUGlf77fffqkBU7bISymxZcuWNExrwI18g13N32giV7bt4y4lMMrCmrNS+O0adpv1XGizztZqiCFTLyuHItmxdaJuba/KwpnFGJp0vW8zztobjONIXlHNFgAMU2oQBEGAHTuX8fWvnwelgpSLEscx5ufncc45Z0MFzhm1rL1F5EJFYyn+qXK4zYU3KUmGIeCcc85BHMcpzSHJNir2yfnnn4/t25bS0FImhDOGNHfpi7I2FG0HQtmgyUOkznihsZRcB0UTG5C0aX666s1BWyAIFf793z/PX//6ediwYQMWFufw9re//ZmLa/up1UgsfHnuRGjMd7QgB5dPuKi3icHXaYrANjOs04GXyYiS0lX/JcH4nd/53+Lggw/EysoSer0ehEwGl0y5Pf1+32WGsIa1wLp1G/DZz34e533jAg57PVjjwjvEAvBKqtoTuaw11Z6Xh7SbSkNkK44XYWAW1MrTa8NG7yr1v0vi0S3CWF2uNa2uSNsx3eTRFMeytRYbN248tt/vp2M0ORJ+mZQSg8Eg9f7qNrJJ+6BNUbcuaOkImeGpHbW2G9e0zzsrtGG1jZhJnjElGlDzZ9vWr+raVnXzoytHaJaGapkRl4TTkjmYRWCCoIfrr7+Bv3fzrVhYWMBwOAQArCwt4YgjDsNhhx1G8TB2FeRBOVTenUdW3lsOlIAFx8Cpzz3l0xvWrcfyju0gL4pnrXW6sdYijmMsLi7itttuww033chCjKgiXfu3jQHbiEN2QzlsLpSUrW/ErCEVXPEoGBc/Gw4R9nq49eY7+R/+4SPYsGEDtNZ455/9KfbcY8N3o+Whq2Hk4545BVnk5fPbhBJWEwYUXD2x2Fj0w146ECUxlADm+yF0NMTmTev599/8Jhjr6tEkZCt3LhcIHQyH6PWdcBCkgLYMFczh3e9+Hx568JHnOJ6M9ZYygY0FWz3SxGGby8ByvSU6TXTKBGXJx4ZHqItshcRM6qFOMsCL1y+7n1lI37clqK32GGw9Z5Piqammj00raIdhcH3P60WkZQKkSD27BC5OUUEhWnuis9pcm+Z4EYqftbpzF2Snc9ZUS+Nt1uNlNcMo2fp4q02sbTpn6bMWMoeKx7TXajKWSr6ZcdQpNVYSJyOhGFgmxIZx3vkXYhBFTqcMgI5dFuGLzj4HC/N9xPEwLYmTowWICvQQfs+22tXa8w6w1hr77LPXzx555OGI/DXY6lyBx+Tcy8sDV1rAIqP2XlgnK0r6dC0QLKYdsFUWFbEj/4xki90hvAKgoBCDlRh/866/A1vCysoKXvva1+DoY46gONYIeypXE6S8w22rxWwWk6KNh1vV8MaY1ChJvpdovxgT45RTnk2v+PEfxfLKEhQhlXtOUtkS1neC3Fjvwtz9g/vx8U/8n29K5Ui61lpoXyVYCF8U0zLIuoKMrl9yJmejYm9dG9oZLJBdSXizRENawccdQziTbFrTjNmmQmllYZXs/5M6KGnV9Ex9o2xcXAQONtZap5l/bSDzWaARbdV267zJrn3TrES9uobpLFL0u6py14WHZoHEFJ3OWRh9deUDmhDLpmSAicsQtKAjdA01Z+e3YYswDPH41icOvOLKbyMM+umc1Fpjw7o1OP20Uy6y2kD5eZ2gOWmlaIer1EZaRpEG4zNlXUVrJQgwOj1nwtMBBIx293b55Zfj8SeeONCh96LSYW7b1lVjVkw7wXLS+sUO9DeViMwppRDHxkkNBxKf/Ld/55tu/B4gCKeeeipe+cqfJmMsrB7AxJErLFfIskjecNkW00+AWXuKRcs9JU1pDVinO2O1gZTS152JEPYEfuu33rBhzZoFFzIKwoyDoCGke27DOm3b2DLm+vP4/Oe/iBuu/67Lu7JINQCICKxNeX8l6eB18vs+i8XStChWktJHpe0zSy+ydHFOsnFWYZPpUnpjlrybaRCYrDdXmh3kEZls2nWxXRMjR/Bs2q/LBjDr8FQXuLquXXcF0ttmgy4+a9vPtW2HfHHS7mOxSt29TeXnadGgSfaGok5YVsNFgKqNJGouSVJmWI9lFSYGR0Y0jpmgVIirr/r2Hfff/wBEoHxWkkEcR3jWs47F3nvteaaJhy7Zj1xxY5ewkRHk5Lq1wumkJcT8QAkMBwM897nP/sLue2xGNBxA+ppq2bAWC8Lc3ALuved+XHnlVXcIoTL8SVHJUZu0T0WbOFzVIHacI5u2Rcq3ZfLpY36YE0AyQKQNSAYgoXDjTbfyv/zrJxD257BmzRq84Q2//tuBIsTDFSglYKxjUzNMxSB2R5U13RZBaSJgtamp02YRyaasZXkxQgisLC1j08YNW3/5ta/Btq1PpCmFyfljj6rEcZzCdWwJkApbn9iOz33280jCSImXnCNbCUrbDCRzcK5FfRWIhLHeBb6bJMtrEq+ny6I3SyN3tSD3tptzk6dYNr7LPpsslFl+ltY6HS8J/yVBUYUQ6PVChyYaO/Um3La92tSFaVvuoTUJv8Hza9v303jwk3ruXRVnV1OBd3TNkW7PUzUTqMtYaAqHdUWA2hg57MtgkAwQG8ZFF18GbQ16vbkUTSU2eP6ZZ0J5QjAbO7ZvJ3pprdsBxnFXTYx99trzJ0464XgMhyuQSiCUClEUuarY1rp6SUIi0jEuvvhSl54NmePb1NVEato7iu0uil9sWghKT5Lx0hySRA6eSuJsLGBBsJAABRgMNd77vg8gjl1o5fW/8svYe6893r+ysowgkGBrEAgBGONzxi2yRduz99oWGq1qgLaLY9Nkr7uHfPqbARGQZPaTt4qFAF7xipfT0562H5aWdqQDQscWYJGSJi0zjPV5+FpjYWENvvSlc3H77bezEApKhiNrHZwxXoqejshpvARBkL/nTJ5+qlPjBaqyGiiJCnFxciZeSltVyUng2KIBWkQWao2ogjJzzRfSOO84CY5y0GyZ8Fp2sSgdSwWvLlsPqqw2VF2Mvt3C6DV4/D1rraGUy3aLokhGUZTTgknuUwjXBhs2bHBenXcuEk9UglISP/E458jJEGXmbYnicFuve0wrpib8mfQdOvBhqsZmW4OiidybvcciwlWUP8hmotRt6FVhxC6GQD3alfHKuf3ml31OZuOVUExp+CA75lItGKo3eJuMr7ZChF2MyJxhUajb1gZ5Kb1WwvH0ml3JWialcx5sxlkPwxC33X4Xf+vqazC/uNZFNwKBKBriafvvi9NPPeW0KBqAGOm8zCJmic4LFbiLub5IagQakxZoTvrknHPOwdx8D8bEMCZGfy5MawEm/To/v4irrrwGDz+05Q2JIn7iDBswhKBUK2gSNHHkhFUYLG0mu03hMi6NczqhHQnNjNjA1TlSEp/+9H/wlVd/G0EQ4OQTT8BLX3IODYcDKCGg42Eq/iYVIZFxLlaObqusOUkMsk0++jR8heKA6akAJh5i7ZoF/MRP/jiWl3ZCsCfl1nmZ7OKYS8sDfOE//wtBGGKoDZgIJFSq/QHh4aokj11QKaG16pnGK/9ax0+yJlVbnQUPpc74q/OKuhpFkyIwk3i/dem2TYvrtMTJ5kXdpoaytRbbt2+/e3l52Wk0RVHOOJO+5MDmzZshSLRGGqr6tIuEet25V6PQZhuof7WuUdWHbcq6PFloRZvnyulFNRTYzT1DTdXxpvDTJGhb2fiqMoa6rkVVn68zzhz1QvrECSdCyQAuu/wKPPrI4ympF5YRDZZxynOejd02bbxMSUftSEJGpXPKNo9nd36vwUaMOB7ixJNOoEMPORg6inPobBj0/X1LhEEPWx59BJde/s0PiMAVQ9baQpAacwSbwpZ1fSXqjJdWIRIaqSayF61hiDQ6qtkCJCFFD/3ePO6884Gdn/vsFxGGIdauXcQvveYXhi5rSYPYWZzWs5tH3nQ+P73tRjDtRtRKGIkL9TAyGMaISS5K/o/UM9E68s8MvPSlLzlj9903Y+BDaSOFX07hvBwJkyTCMMSX//urePjRx34tCPsgGQBCQAU9gKRXXR2lxCbPZXPhuGoC75inZHlsIhSRgVmGaqri+W0InLMwXiqlAxo26Wkh60kM8zrkBRj1VZYTk2Q33HvvvfsOBpFTXPaoW/L35Pc99tijFr2cxsBv6813IdBnPjAzI6ZuDLaJ61chvJNuiMTtnIK2pMn8vGviumSx8fK/1m2gVXpFVX3fhJA1OZ9NaEydkm4RDW0iJXcyriqycrJCdu7/AXbuXMHFF1+KMAxTDirACEOFs85+AUA6LQmSLfFjMHL+q8aM8KhNukdoM1K6lhLaRFhYmMPpZ5zmxFmVgvJieNZaZwMwu/p8QuHrXzsPOnb3nZQoYOax6EB30rpTVBdlg6fMs6qSv05q/2Q7JikwZ4V1u6MUsEwgAB//108sPPTQQxBC4JWv/CkcfMj+/Z3bt4LYCem0qyA9Ck3Nyrue1EtqG3+vZFGTKx8g4Pg/e+25+ZLTz3gudu7cmQ7AbGikaMTE1iDsz+GB+x/CpZdd/iEZBjDsizkCYCUBKUEefSFf/JGL9yGTUhH5OkiJscLsSyOU3NMsYs1tEJMuOjGz9kIngeRn8Woy0rpkMZVmJZnYLVLMuOP2212Nk0SL0Y4WuySTbr999+4MtbcxzqbNXJoEiWuLAjZtdkUkqM191T1zU1ZgPttzMgO4reE8KQeoeI/OYBnJOVAh5Fq8l7YcmTYZVWXrSNP8bbupTlq0sG05hCTMmxhxQghcf8NNfNP3boYKQwgGQiUQDZbxjEMOxHFHH0WwBv1A1dwbdwIpiH1ITzB6gUIUDXDOOWdh3bo1sGxyJGOlFKQMYAxjbmEB3//+93HLbbdykk2b3cfKHOSuDpComnB1HVi8kLs55TkVPsNFcGq3x5FBrxfg29/+Ln/ta99AGIY4/NCD8KpX/iQNlpcwFwboBRKsDQQDgQhgNLtYoK9JMY54uDo700zKSSZ5W8i6LC46djDDRAZSBB7qM2C2eNGLXogwVCl5N8sZoOR3jCx2C6A/P4eLLrrEVckWAmquB+sYX7kjUe9Nw30Fq78Ia2YNFa211wjI15JhtgBbEDg9BAGUqZFSRKHKPLeq1MZJjYrSzX8VsqAmNUzaVNCt+2yXRTPl2GSQ0+xnoyjCbbfdlr43HA5dXxubCtctLCzg4IMPBuB1JaxJPbY2hsM0qFwXvsIkpRm6ol2rnXHUxO0rPmux7tdqiDp2aiebJ+1m78mtJ44V2dhXhNpEirbjv8p4qVybqVxrrI0j0QWRS+qy1Rm32RIzBOD88y+EMRZKhk4qg4EoGuD5L3ge5hf6vsSA535V1BvKZjvlOC9FBEg53qOLjNg0q/jggw+mY489FsPhMA1VJSKsIwFMiaWlFXzjG+eDVFKbLJ/W3X6cceFIAICSbIUuXgwRQZD0WKHIhJNclpJO4+zAv/3bp7CysoL5+Xn8xht+DYECBBixHqbnUirwdR8ErOWpFo02XIOmjI5J1Da7LJzp4PEcAxMPcfRRR9J+++6d8hCyAn6jkI+rNpoUlAuCHq6/4QY8/PDDb5SBI1UZOCiPfSoxi1HYqCwFvfh7NnzAxnNybAZ5sbpgyDTDwY1ieVNCxLsaDZlV6GTSzJUuOjtj7c0j4cQoinDLLbcgDMN0AUxexhisrKxgj913x1577UV6GLWKn3eZH5PWRJk2fNelXlbXKs6TiPCVHWWp7G3HzLQIWFt0qK5eVVa5XDDStaSYyl96jzQbY7FpjFTtAdMqZ09S+TvbDsYYaHYqt4YZDzz08G9deuml6PddjaNAKZg4wh67b8aLznkhYH2BYWMKWk2Tq95mtV4SfpxSEmeffVZ6nUQpOPl8isooiUsvvRRLO4epptmoCGpzmn0rBKZK8KrVyzqCHzjfRAnNg4jQ7/dxwfmX8uWXX465Xh+nnXoKTjj+WFpa3gY2MUKlYGINSQJWG7BhECQEqREzO0EzeFTJdNqCZtNAq6P2atZDSCvHlhxKhWk7WWsRRQPMz/dx/PHHYxgNajoYqSaHlBJBr4cntm/Djd/97ruDMIAFIQj7KfLCJD06U66LUhYKyx6J0m/6GWNzMu1ZaLDoGQpQY+ijbpGvzQjLVGkue6ZZGTxdJlb7sTO9d1yVFVJlKArp0FGRWUCCIMAtt9zC99xzT2rAJMUak2eJ4xjHHHMMwtAVjDM2HgsB1IU8uvT3LIzTLiG1OiNyVo5Kl7BXXbhqmg2y48jKrWuNRidk5f4AO24QZRWdW7XjlGGsScbVrAT8uhoNRDTK7vNGiJMw6OHiiy9+3yOPPAYpg9RQWFpawgknnID999+XjI0RCFnpiCfIiwN+XJQji9LkeFV2tPbHsSPsJoKsIOCUU055xT777JOuF4kzRES+vAAQqBD3/OA+XHPNNSwza0rZmjpJO4s2sFvdhB6J4ozHUKy/RBQzPvnJTzkYerGPn3/1q8A2Qj8MECoF6624tKqlCneJR73afJk24ZA4duiTHkZQfrAyDE4++URHh+YsuUvkLNekHtEoDx+4/vrrfcKRQCIilEClpd4tZCXTP0vAS0JeFm7QW3KQoAWna1T2SINJJNwBXxcDiTHqi4qR9PoG0iNE7v3kJ8H/3VJayCw5OAmNCeq0gZSFlepCgTnErGYSpZB5y4V0kkKC4+Mqf8UqIyJNy4YYhRSFAMkATAKXX3YFlpdWIIRMFT2TTUaAIQk4/rhjXU2zpA4K61Rhu4n71bQ5d+0zp03k0d40K0q2VpqdZp3o4gQ1Pc9IWr1OG0P65x0V4ksLJBbmVXF+TfyTqPJgIcBC+P8jPZik+zsjDf0btiMSrF+/suTwLgZjE3IyK0N2luHQJmQ5U6ardO1J/y4IUaTx5a98FSSli3B44cleL8ALXvCC1PkAgLCnnMicz0ISHul3912gQiBvSBLnUXgpJQQIPaWwMliCEkAcRdh7r92/eMKzjsMwGoCs566ygaRRmEgIgeXBCi666CIn/WENhAxAGWmOacAHAYi0kbLZMVXW/5innizfnFHw9BojWjOC3gLOO/8SvuHGm8AAXnDWGXjGIQeQjSMoJljLICEzJCW4jBxfRZm8gsyIu2BzR9vaFasYWCiF5xILOkEgSLCr9pmwzcnpISjpUsYTBEYIZ5Ace9xRH9ywcQ2ieJiywkcDnyCcPK8rzaDcptPv93HbrXfAalcFHNZ52oIYgtjHnA2ylWCTfkzI0w5piWF8ZpQQbkQnE8OwX5RYwpCChoQWCkYGuSN5TwsBLQSMENAgaCJo36sMAePAHNfLTBljR3jRPf9/IQEhU4Mo+V0zAKGQzJ+EJ8TGpD/ZeHeghHRMhbjwePdaV3ZeIt2os/NCZqT4q1CfOqjaLfA2BygWF5NillteTJAK2V82fwhAs4EIAhgAFASImcFBCCskhAowjA3Ov/hSrN2wGUNjXXuyG3OBFNDREAc+fT88+6TjycQRYCwoCQfApJVsk5R9pjzHKalSn1MYbdDLKHppLiCaIfhzfq1KVECLqGFdaLOIuBRRxDZGiUO/uNIIyyqauozNEQnfyUVwCq1LMFgwrOcTOGRDpLpPsdPqgbUWy4OB2xCIYcjNL0MiN7+K88ny6H0LgrEofd/V1XHfMzQ6tJ+zlil3GAs3jxmwLGGh0oNlCEMCTApMCpEGSCRhytEmmXI2CqHrtJ+YXSKCn2s2FU4doeAjNLKbMV23QTYaRoWsy+L4KCY6JAKslM0EYuFK77BI97tkbrisXgXZm8cVV13D3735FswvLkJrlzlo4ggHHXgAzjjtdIoiDalCsCBoP/fTtoHJ1X1K8TXKlJjxayTYppYTeV0aADCxRiAkJFtIz3s8+6zngYghlYASSdma0VzV7IpOXvrNK3DvfQ++uze3AG3d+yTkWI2srBdMJfo1xUQhMU2YJfmsYQaUGGUQedGrXn8R0ZDx75/5HAaxxoaN6/GqV/0UiGOwD0k0MZFnFfN8sl5NELm1bqOVInA58j4stG7N4hsOOuhA36YjT2Wk6CvTya6UgtZOcOihBx7G0tKKVyker0SdoCrJZph4r0lF0VH7J4sCp1CvNtaNb5LQDBgQDEvEDGgrEDNgWPoFVPmFK4DxtTA0JAwTYhbQFoisW2w1ZPrTGUjup7Zu0UzO6f7mv2MFDBOEZ7wn4YwR0YyAwvN38ZbbZjxNmqGRiAJOD4s7y6fqGZP0R2stVBDAWkD1+g69Egoy6OHiSy7ju39wP4QKEfZ6MDwSsNNaY7CyhLOefyYW5vswXvtBKQnj66HU8SWmQS7HNoPcYjeSaihTi551TbQmzsJkaK4oQRTGia1aW8hEPZAkVoYRlAqhvS6IFS5EPJpnBG2BmAViw26eWYzmFylXm0aE0BbpvEoQTkPCzUESziBhAkOBkzlMIp3fFiK9foKMOoPH/11IUBC6e2FvCLFFImnXhK4U3mg1J5qU2Ouyv9pyi9pw99qkAhf5Qvn/+T4XCmwJ5194MXRsEUfGcRvZ6bKcfPKJmJvv++tSCiqk3CnBEJyIllbxPm3Ooata/5JwvYBL5DjhhBPo6Qfsj507t6dGaCAopRxYC5CUuOee+/DNb13xRqSioGom+kqqySJt4iRksxksvKcuOMUgLrzwIv72VdcgEAKnn34qDnnGgTTYuRWBUpVy5NnYbtuNZ1Li5KzCSNOcKx0sPl0NgtHv93HggQfiW1deV0DCxp9ZknDpdGGIxx57DI888sjda9fufwBSiNbmFnlKYEIkRg5ysK6De93fjbFQKgDFyhkLFlDBXPodKaXH8UT6kyQ5XlSSle3+lCrJMo3+XySiUwWkygXvPQ3XWOOfg1NekJACg8GSj9fWKy/bXB2grPZFOyi5bOMEUbo4p0x/jw401w/iHDZk0aSBYfJQEufngo0NZBikMWkAMFHsPCPVAwj4z//8LwRBD1IqRLFT/QzDEGxdHa5gzRq86EXnFOYkVYZJ2hIW28D648rLLfgl6XvNRfWmdULafpezGTlc88yJIe6dDVLOMNAWUEGIIAhheR6wgAodj56JAUsgGDhRbOHOQ57HAB82yMwlLx3ipN/JqX2T4PQnsQCTdQkafhI7xMT9HP3doUhUqDrM3nu21sKwhmXHjxihO+57ZetnVai2SztPKqzZRoemqBPjRhq13JCTsKcnojA8Gu/aaxRFGKl8yyDAPffce+2FF17s1mIiBELCaI1er4ezzjoLUgFau8VTCAKxdIifP1eKuKOc8sEF4cAcE4oy84qFDw0SiC3WbVjAKaeeirs++SmnHSUsIuPGk5TOAer1Qgih8I2vnYcffclL3Oe0cYreXB2yd+1DpcZe8j3VxPpvk6pmrAYMfM0DJ9tNUmE4jPGpT/47mAmLi4v46Z/6CegocvyMJE5qJ9fWqJLZniSWOguUZRIjZiz04I0YJRX22muvjPS9X1hIgDNFHZ3V69LcSCisLO3Efffc+7SDDtw/V4ck205Obmi0GTAAwxo6MWAy0LuUCnGswUx473vfj7Vr5tiVj3AemciQtbN6AMnvMqMRBOn7XRCk57bkx5+FYOHDXM76MYbTBTR538BAeLj1BWechjOfdyoRSQhhoXUMYzTCMKxy2irHQZnxUr0Qju65KrOrztsiwd4bspWGcLHY4iQ8DiklYCyEDGGNhmEXppQgBGGIiy/+Jn/n2huxsGYtYm1BKkAovaFFhB3bduLlP/ZiHHDAARSbAZSidIy4zITmmmlNRsxkqI1t5DjkjZn2htJqcONGG0DSx6Kw8Wb7XPhkBcd/ufvuu/F7b3oLMzOCoOc/58JJQgi3AVpXzI+tC0mDRWkYrQyhSAwWZAwYsIAl6+cpu/lW+Hu6npBT1zVgkCUXcvX/t7GGCATi4RCG2RW1FQJaWwT9OTdnGNVzMAnPeOGyYggXFZmls3Bw247h6fcOzhtfNHpmsIQKFC699PJjt2zZgnVrN6Z9OVhZwbFHH4ojjjic2Pq5ILyhme4nyVrFY6Hx/NqUWlOjMenfooyzloaJARhrEQJ44QtfiM985nNpBMYYA4KE1S4ZJ45jLMzN4zvf+Q7uuecePvyIZ1C0tLOwjk6JwJRVBs0aCNVZEz5e6VOmQ0nQOkIge7juuuv4hutvQr8/j9NPOxWHHXYIRdE2BFIgHsZQIsg1bJdFuq1Q1FNJVrudMRMAwm08++23H4IgcMYAjw/CxFhIjQ6fLfLggw+OJr7xXCHhvDCX3eU4S5IAkykFYDMGjPXcKOcGEsL+HL597fVgM/T1r0IXu4bIGSJZA2asgKWgDAIjx7ys1PPLGDBZw8WhRQQmC2IBAYMrLr0EG9b/JR9/7HE0HK5AelVIozlFrJD1Irh6c7GetpEKCCLPC8uPLeM+zGUl6DPTMpHyRvtNup0hnChsUs4jSUjZqd9i/CdNBBEGjlxvLXoqwHAQ4V8//n8gVM8bii7cFEURCAxrNBYX5/GzP/szkIpgWXi17MQoFbn49CSLe5M4WGLgJTw99obVGIGpgNAUf++ySc0SmW3DoEsi+aNxMor7W2Ysrazg4ssu93NcesdCpCG+UftYWJtwQZB68HVrZ7KBCibPmRhtZEwMSRJM7BBWcNrnlCknYT1yYOGQIAsveEneUSLHnyApwMYi0jGCIESv13MbHdlMvTVuJV0xjmTOtnL1NEZLVYmA8fstWm/OtUyJtnD1hZaXhzjvvPMgReDXaReCMSbGWWc/H/05heHKwGm2WL82CC7iKBVhK6QIXHr9ZE7DI/6JYq5wBpGlUdjJ2h4OP+wwOvjgg/m22+4ASVcqQHv9KCUktLYIBWHnjmVcdNFFOPzwQ5y+DVzIMrcHku0UllVVE7gO3Rg7iRqRKJNwhRASX/z8f0Jri/UbF/Gqn/lJR07SDqEZFX6abKA1eU67agGq8iTHwm1V37XWqeMWKpwL4RCYXq83Mm4IuYJvCUlMSgk22vMSDHbu3AnYhBznFhz2RDlmO0p/BXJGS5aNzh61iXUMpQSGwyEWFxdhdTgqBubJtWWaFUXtCmS4C+U8AFsII3FuAc7Fa9OihjGiaCe+//3v47ijj3J1ObRJF/e2KbpM+eXPElztH/DEXIq6MVG12E2TKTFaqpJsgJFYlPTFGlnrdIGBDPCZf/sUX3/9d7G4dgOGkYYQCSEZCAOFbU/swK//6i/jsMMOJRsPRn1q2xljXR2I7hkJaERduhovXZ6jraFTFvpKn8EWxnaOlOpCtJY15ucWPem/5w2X2BfhrFDrblF5uupncb3KF3kttJmXuBhDx/z6ArJON2RBeT6PxqJw/DXjlb2TcYXUNh0PISUh4kmd0lllpK0mrSAZJy6TyxGwVdjDdd+5lm+48btQSqWf0zrC4uICnnf66e+HL5ApRAiwTlHRqv7PIZ4JEpysv0lpoCQkKEbOZ+IwUSYUORwM0Ov38aIXno3rrrsOa9dvgtbW2wUh2Gjv8ADz8/M47xvn4xd+/udc8kqGAzZpP6hJ49RZMh3IWW1BEMBiiN78Am675U6++qpvY25uDiefeAKOOOxQMib2eeKAkAKwdmoLuahBUUSPJkF3ulvTU+h4UDZdGTnDYu3atej1etCxSeFBt8HIkceRQQ8Sw2ZlZaXEyPYl7UfkFxdIsuUCTiLxeD3pqtfrYTgcQonE6PHZAHGcM1jY/7Q+pdVSg9hYEUqHyd1TWbkGA/ZaBgZ6OEhDbVEUIVRBrrJt1thrQmKc+9I29bU51EQZkT+Ru4YcScDTWNC3G2rH+S1nJC3va6cEEtY4Au8w1oAxCOf6uPY7N/A/fexf0Z9fg1hbKOURNctQJBANBnjmUUfg51/9s8SZcI2UAppH5QbqFul2IaRqD7pqLtfP/3x4m1qGklYXY6nuV+sNFWvYJYGkGwmlDo4QDKtd9hFJgTiOEYQKg+VlENTEYpxlBgwLaj3uLFWf2/3do3VevI6IEKieN6YtQhXCWu0RXY/AwKJMoXv8J41l9zwZCNr0e0JmbLBHs33GVcJgOf/887G8vIz5xbV+zlgsLS3h+c87Dfvus9dv22iAQJDjA1qCFNIbszrlwIycQ055N24xFSna4iGQ9HYcF2mkos4ZaNmF7D1ny1qcfvqpP/jQhz/8tCgaelV+158QEmwNSAmEYR93330Pbr75Vn7Ws44mHcdOsBYMT95KERmCadXGqm3jlw0K62PsWmtISZ4VbaEk8JWvfBXbt+/A/MIa/PQrfxJBKBENliGIwYYhVABt41ThrwxV6TIQy4i/q8FzmfXESM6r2fE/EqTFxbuDm6SUz4wjDRKjcIgQlBIyE/0cMCM2BoYtllaWwcIbND6Fk0ri4Jass/SN85jIUimHwlpGFA0xN99DIBJkzqkvJiGbLPICQZDkqmGPITF+0xYZCy7v0dnx8gUV9aYIGj/5c7+I5z73uaS1470IEIzRqQR3u/4qagtYgJRr7wr0xRIgk3GX4vWJsF8JOW1Cz7G1oZ1F+simJpPWsauJZV0Giwx7eOzxHXjnO/8W23esoD8XQluLIGAfDgbAjrz71jf/HhbmQljjlDzcWNA+vbfewJtUW6P4fyEoj6y0IHjOco7WoS/536l7MVkfLrXp+DYegTHptmPZIFQBgkBAxxZSMIK5PpgNgl4IIllbNiCLYFY+g3CSD2UCl1XrXlX/jdBTZ6gbdigweeKntTEEEcKAEOt4zMEgz82bhfLuLMZBm6KldcZWu/sapQb7gJ4DBZiwc2kZl3/zW5Bh4Av/JsibxvOedzqIGFEcIwxDP3dHRHC2lBoShETvBTnHcXwdcaHD8dC5AJH1ocZR2NqygdWMp+2/3wHPOu4YvuTSKzC3sNal2FuHIDKxWy+FwGBliPMvvAjPOuE4F7LyDvWk/aUSy7fYGYn3WlevgMgLjBkDEs67DcIQjz7+xIEXXHgpGALPefZJOO7Yw8nEAzAbkJAA2IvXiZmgJG0+P7nSab12RCVxs0DqphqxouS8QgjERoN8+XQp5bVE9Mzkbw4mdIuelCol/BFZSOk2XBfuGaRKyO57nCIwzJkK0gSw8VA1iZFipnWLKKUkCgNig3/44N/j6QfsR4PB4I1CyDustQdIQbcR8QoRPUFEW4nkIwz0CRgw0Ceibf75zP9H3XvH23ZV9eLfMedca+1Tbk1PCIFAgBASEoqBFFLpiBQbIF1BnwUV20NBRVF+IoLlvUcR1IdIUQFBKSGdJJBOCCGB9F5uv/eUvdeac47fH2PO1Xbf51zwXT6bk3vuOXuvNdeco3zHd3xHA3UKN15P+GqByjzgE2be7L1/LDNvDq8t4b12EdFuDXpg86YNV8n6+pIkGTkazQ+gochJnUqmONZ660e30qqol1Y9AMMjiIKeG22JgnwF3kjcTyV3JX4mVfhsLTMahERFlClJEjhbQBn52aIoKoVnJigidG2BJJ3HSrfA23/nHXzjzd/Hli0HILcFAAUOLdFKe6yurOB3f/ftOP4px1BhXcl7ieXhek43a9t0s2SA4eWgEb9P1HawTVIg1fZDSWoEj+xmGqbOO7zbavTvjSptl+VQ0mD4IA4Zrs9bKK1R9Ho48rFH4S/e92cXa0W3KtL3ACoHfKo03R7PR+09y3MS/x6uZ/dApESpOxnIFNHDIFodYP8219+3/lkE9JTCg0Oez67we1vEDip2zp3EjA1KJ9++44673vC7//P3Syin7vi11lVBmZpk3T4S7xrLg5PMIZvU50xSZq7bETFPUt51VJ1xD+GkZHMZvnHZpXznnXejk82XchaF7eFRRx6K55xx2uNtnkOTgSt8EHJUEFMo2mClnQ9BDIhLdLbyA5Wt5DB0maN9NpFTp8JeVTXdG9FqU4qhNePss87EJZdeJtIgSiFJwvwmUlBazsrc/CIuu+KbePPun8emjRvgi1yuCQzPwpkBABd14RgjHawZVyIahWoQidorIKQdZkaWdXDB+V+8/d5770OnM48Xv/hFMAnQXSmglYLyEl0S+RpHY/9E2usVhU8yoGsa1KcRKHLlFGKw2D4IVY2YmkYzZmkEIduxIA86MfKPoQOyzjFp68EwA6o2a0kxGuBdNBjaGMzNZ9iwcQFz89kHjE5F7UX5APwFRVzxKithj62Aa7BkfWliBsCuivQqpuZK4OPsYea7hzoIVgOmlw9zJKNLFG0yLg1+u4HBTwxEImmaVSBAN/bE4DLCuA6ecSRMTQQfgo+6jo9jK45RKVjLSDvzWF7p4g/e9W7+xuWXY+uWg9HLbQhMxChmRmPHtu1461vehJ/56Z+gXtdCaw5dLm7IKq4tWah+dvA5anKJ1jaXpvnfg96/33YMO9+TdlhNXkqmWlBWlRYUGBs2LuCwQw85K0k0dEn49UEYUwli02wkqRmHCPvTkO9HQTCqzmn9vMaf83I22wiDd8XgwDEmZVoENxG/hh/Ne6tvSLTo06CvjNpM+ojXgEzuJ+R8vf6IJoqC0mLLSKvAqTXwDJz39Quw0s2xdX5RWpI7CR5++EG8+MXPx9atW2633WWRHFSyD4hME62m5tBGtMqMukbGLtV9SYXRhlQGXMFACmKCCuE1pNDNc2TQOO20U37zoAMP/Ku9+5ZhTCIirDqp8V1F+fu++x/EVVdfyy94/plkbZDUCIh5e+zEuDNvJsuSRr9J7DixltHrFbjwwovAzHjCEx+PZ5/yTIKT2qYxCXzuy8xxPcsw6yWAN+sBGJstTngP9TX33j8m1odJKfiawNjQGjYzsiwb2j5MtU2MIfcWW51Ft8SDFIIaMgvS4R2gCvjYQh9g7zbfRWwhgV20oX0TJCvHMICAOCqrjRoSmpIa1WDQOtOQv3Nj8GgfLyMiM0P4BVHTpWLkNxVgCRSQHNHLAKHRtcNlENe6PuUDFN9U+B1mwBkeikTUzVopyZo0Q+EcGATrHJJsHjt27n7G773jnVdfftmVOGDrQXBOSHbWdpEYBa2Abdsfwk//1Cvxi2/5BSpyD01RPKZJ/P5h8ASagop1hA4j+SxRfp2GvSeNR1mHl4lG3cN4/ZDhZ3948iNIuPyMzbsoXMzgOQiUhQCEY1mTGn+vfz9yx2Lbs6+hxCpETvUYJ6TuYa8OGtgaBroOQecBwOVK5BOUzGLzTiGdz0AM2KIHMnNjy29iP6ksUUlQtVbyOw9NbNZnTw9LqpvnmRXBkyrtjFYJPESc9N77HvqHq666Bhs3bgIzkGQpnLPYtGkTXvj854O9hYOTx0SQYLEiwVVUAcHepXsz6ALFB82lPeKwxq4smzMAbeLYgrrN9mWZ0HsZA1QUBQ455JAPPPWpx//VxZdcDuUcOlkGz/E5UagQpNi1tISvX3AJzj33TJlcTQreSjBVcK+UeaiUrofbc7XWMktpzBXQ6XRw/XU38E033QylCC984QuQdQi9fLUxzbK58XjNm2XYrJJZgpVBXSeTtHNPco3DIUrqI0USAb1e7/S6WvGoabX1tV2cXwiJmR9dl/WVsJruo3uh1HGpvySYioRRVzpymartw1j2sMHDRi9ZC6VEdfga2i9LDgmF0RBhRISiahSCJlX9HVWrdklGIz+RAuvAWUE8+HkRV0FWo8Xce8D5huR5JGPyAGE7Rab1uUra2UviMw0tLbYDo/orTvTt5blkclqEwnqFh2eRb+/MbcB3bryZ3/CmX7j6m1dcjc1bt8J7gWi73RUYTXBFjocffhCve+1r8I7f+13qpBo2X5FMi10j0FzLOZjlDI46z+OO+DRKn7N0Qc5S4o6DXSXTrcYQNLliqvzabNF3IagVgVYdUZpgL+IkNR0cTv3rsO8rRdCBXxcB1BJIDdoriuTn4u8YIpgwRsMocUCalAwfJBWGEMh/k2IkoSygSYWyhtxPmqZrUkxeuxLy9Htx1j0xSNm2Qv9cVe5nGVisNXD55Ze/4ZHt26XLl6Wzd3lpFY95zGNw3HHHUb0cFccrAGH0CclYCqVQTnCk1uwq+elgu8KsNNIEMhoqMTBJEqreFYIfxwXFoNtBhsG6wGM5++yzsbq6iiRJUIQGj8p/6aAJtwHXXXc9br/9Xq4Pq4xo1DRn0gwbqjbIeQ9UMg0G3FlAG+C8876OleUuDj30UJxx5qmnsq0yOGstEkqC0TbSz47Zg5hYX5s0+h6oZ1PjoPAUWduw9Zk24yTEKFhEq0AM5yVj37t3r3QcZJ260CpIEWJgKjAgwXkHBMhvYWGhir7Zg9iDfQwexCGFSU1NXsOA5y9oggQTUXm5LF2QhiYNYlfqCFCoW0mp0Md0r5Lf9ajkeClM6abYEhsZ6FrukSOeHl5cG2bZiLQqASYakmfFlj0qq+v9Co+Ka9lTKZ3NZWmoMaMlQJ1KoX/ODgXNFNIVMqRUqa5QEYF0MCFccnWYVfgdCeK45AfUMqcaN8YL2RvOeXhHKLwHaYMknUO3V+BDH/kw/9MnPglnSYIXh1BXBObmMuzbtwNzaYL/+Xu/hdf+3GtIeYdeINuDXQ1lmgyVHGcv1jsAWh8hsTW9w1j+zFgHqbjmiHSZWxIpJElWTpz3lED+2cN5ByaUJYDRqOMIdJ0HV18H3QvV2ptLIVlW1XiSUu43zMMigiIV1HgZFBIgsJROitxBpcnwYYb1AGVM19/kbe7tEuX67gsalqSWXYc8AGGrglfrPbROkOeMCy64SKyhSUOe5mGtxYte9BIsLi7C2R4UGUBHPSjp3alUlwV144hYBw5NtGF1Ir7EPr4qIQUHE8UquYWCxpdWBqu56IZZx3jWs0550VFHHfXlHbv2Ym5uQYjnUTcKVfv/ww8/jEsuuQRPPObnkPe6JcChwhgiBdG7GRvADKvtTiImRDVNEaWABx/YdtbVV10Pay3OOvsMHHLI1iu8zZsljsCEjvNZ1guCnpTQNQtnZX8a0ti1wuBSKCj+eeChB+GcQxoVi2lY1B8Og7XQSuGArVvFR4UBXUy1slGtTboxBKKCgKSVL/yL1jqUkLhx0Kq14xqfJYgg1WcGoPbVofl3rkGEtVHOsXwSg1Nuy2uDRSobKNGgsc+9NVJgXMxMLPwkpaiBeGjtg3R6v4Nmqukm9NlNKSVFZoNME+GAxviy8wxhQBwDjdk/fa2kvvp74aR9Eloh68zBQ+PyK67kD334o/j2d76L+fkFLG6cQ3c1L42JAWPX7h144uOOwu/+ztvxrJNPpnx1BYqk0yXqvcShIJ4G77m1BAeT6FQ0vj/heSuH/42Q7R90jbN0Tk1SZmruE4V2q35MCKqGChW682JJTIJ5EZiU4FYTwaQGrnAjO96GXnM8s+Qnus/BAUOViVcVv8CPqH2+sw6sFBx7cFEgnctqaAP3tb43Po+HJ5HD1p2m1AHa3/yYkXIkYcCvZx/QDoUk1bjhOzfzt2/8DubmF0Gk4Zz40cMOOxwvfelLX5MlCl7PQev+mLVNgyqfj0djcrxq+UEOATRXotHwjqEa3Kx+vEHHipkCDjv8gK8897nPx8f+4f9ibm6hj8snw4qlk/Hiiy/GG3/upxt7wbloZ/XkQnZj648j9FW01rB5ASLgiiu+eeE999yH+fl5nHvu2QABzhVh5QwMRfW+GhP7R0SumrXVc1jgtJ4HIcJo99xzT7lWAuPV+DGhlZlCOUYHvsPi4iKOOOIIIZPGgMXL7OeYUccZOtzK3voIpSSaK5pRzWAKEuWNA6MHKWSO7+YoaSCtTEi3DVKd4MmqlLKOBnNgd9EQu8U+trw6DKLlREdZF/Nj55Om4B+q+VGhG6mO5Plw2KWFVAsUL1hXiWgosIA4tfJZM4uLhtyXjP9G8hD+XRsNk2UAK6ysFrjsiiv5U5/+N1x9zfUoPGPDhs0AaeQ9L/ONmLFvaQ+8d/jZn/lJ/Mbbfpk2bphHb3kJnSyRwM1amXHjvHQhtPhR6+EQZhH4mj4QGu7gmEeXmybN6MchAc25cf2lYIWqBCD8FV0mEgQF7xggLRpQ5UA+D88O1kt51g0ih9d1oto2CwBCU2B8np5GAzjDnns/ntlsK/PkoEiDjJBSXdD+zm0uRPOapsuggYtRmiCOEqi4D1SWbCdD+ni/+YJh7z+YMtFSFFYRoRJVc5UYeA985StfwcpyFwccuAUrXRneWRQFkiTDZz/zb5+0veVPxlZpj3qJJ3KgpKvNUG1UTduvs4jQQlFJD5CEVdDj+PsV3yWUy0PpWgKOAoWzWF5ahdYJjElx6+13oNPpBFsbxlmEn09TA+cZ81kHP7jl+7jhhhv46U87gazL5Rk7LukMk/wxo4KVsZFukD32TMhz4KKLLsHy8j48+5SzcfzxTyGb9wIHQIEcl9LIJdGRRos8zQIBj2pfHGjIZviMUTNqhiMAGKGMGbLxsOk0pES07eFtpeZKWTOqaXzAy3p6lvnP8IwNGxZx6EEHv5y9BVsnNUu0WufqpZU6ajDg2hQpqYmjCXUStBjBCQ/+sKwukoXrfyyGb2JPzWiH0BZEG1LOaBZwasbESx2orgTsVVCmpGhAt1TlIweGgkOTQCazaFQ5CdZxkOIGhXJdUPgI6I8P3R71TDMiP3VOqCZd8STqasdBAbXXK3DLzbfyFVdchfMvuBC33HwboDSyuUUYVO3kpIF9e3ejKHI8++Sn49fe9is4/rjjiODh8x5SI6VA5yR4IcXQavKheus1tmPUmaUJdWCmC4z8VEHVOGc3/j082mrUVBv4Sdwvzhcz2FhuUIrgw8w0DRoYhE9STqIgQla3B5Mq1tbb+/vPFdeSrXAevId1DipJAXgUzkIlZuAzV9MEqowBQcwgUjUNxiZKIU0/3QDIEQjWVH+cD1cjnD7vgH379uGiSy7H3MIC8qBky95Da8KePXvw93//MRDbUg3dkxIRO9XmjvnyfskL4Z/DV+JmlytqI2DqAS2Vwzyb3UwSVPowi08Cq9xaKXnpBHNzc1WpKlyT96LKzOyglMaevXtx+eXfxEknniDDZtkJv8oYWGsn4h6ZRtcIixpkrIN578sebUK93VCgbwdp40s7c7jjznv4uuuugzaEH3/JC2E0w+YFtA7S4yTzNuCFkCnRI484ODy2zDN6/kq/WNDAIKaPEzMGfqxre4Cav19vzyT0BwxUq8HWlFg9O3lfI9ejKIO1Hvff/yDSJCsNl2Vbwn6KRP7ZWkaSarjcottdwXFPfjwWF+e/wLaQoCZ0DlE8bFTB1PHK263ISlWkUx0yH610SbIiktqqDjhjyXeZEIZulKC8Lx3zqJp0lXkNm2Deeurc5CeoMgBs/Vwfh4Bq83d83DdbmjtThpVxTWRt165dWFpaBjHDJArGGHlpU0fUy2utS834EENFIaq2ArF3DtZa9Lo97Nmz53uPPPLIsXffdS9uvfU2fP8Hd+C2O+7Crl27kGUZOosboJQOAzs9iqJA0esC3uGZTz8Rr/25V+E5pz2L0kzD5qvlmoQ8DZFUx30ZOA/lgKwFlq9z2NqBaNVOXNmDdvWvKmGHji4fOGK1vVYnwlf7kCoeAKO/zDg0QKt0NZr2ZA0t3hTsgI8BjgSQYRwiFEkXpw58Ku8dFFH5TFQbbuTBf6FBhyYGyuOAivaQRGrZz5J82SwJxSRXaYVEKVh2lfCf1yBDQQMpdOEEIUoprcgaSLLLYbxH9fnSNUMyvSfYVkE/uRUk1p4Ri56WlK+5RCg8ACgvhOgaMsotP8FEYNKl3SBf/l8/8ktUJU51gb/yveO8OQ3PHoVjdOYyXHTxBXzXnfdiccOmclgycwFSgEkV5hY2wztqEl5bj64stjOhPVMuDs2tB8nlUGHVmv5e/l4zCe/j/cGjE/xKXhRwIeCyhZSDvHNSGjLSnZk7iyTr4OJLL8frX/96LMwbOBuUpm0PiWoN4w1n2hM3KhFm1j75eAO5s5hfXMRll12BBx58EMc/+Vg8/eknnaUCzEd1cbQ+BAQjVRd/1IMYB62JIpoYmpwqc1Ue1uXQSkjO2x/a9tr77n0gCNFBSj5la2/Fi9Vao9vroWOkle3Rj340OlkGEQ6sjWqolyiIypkWdTGwMmhhqnQpMLxrNRoowM92zwPX+oc/fK2ecSjGVKggMyHLMtx00/fx5je9lTcsziNNDRYXF2GMQdaZl0AmS5EkiXRkhO4TgcCNBKhcOVvPFt4Bhe2hu5qj1+thz5492LNnD3bu3I3V1VWsrKwAykBrgzSbw0EHHQoPCYR7vS6stcjzHAcdsAXPPvtMvPIVL8XTTzqRlAFsvgyf52DnoFXyI1nvaVDNQTIJzekAvvwaSaUTozA8+b3UA6w12aYwTqIvcEbUYQoOJ86lqc+pYS3ZMrcC8/2Iis10f7HTioNOTVhsVVLeVJmS1JPV0inWgkppFx9U15J2mjoxVrFEEVVpmpuDToPj8XECd1g/FYY4tLWdCP0BalQ2nwWBaZwNdmBoKPIorINO55DnFuddcGHgPAFFt4u5uQy93EE7KVnnOUOrDlZXezBGlXaaR/inGITEpg0XUd2aYrOgJG2qiC/b6P2Qrq864uO9h2cLZgooCtDr9ZCaBNrEZEJ+v9Pp4PY77sJ3vnsTP/tZT6P4vsYYFL0i8PXMAD8rU7pBDAP42k3WobWQ5fcx0/s3Uq/Xw7VXXw3nHE4++WQceughF68s7UNqdJnNEtoqiuMOWPPnRsHKk2T70xidqYS4aG2hjES/EqlrDtmI0bjz7rv/7yOPbEeadQIPI5RB4v3G5vwwb8RaC6UUjj32WBkvkHPDOatyOJfuO47tdkFf/zv2zxiZtfKFJu34mEbwilvCczQuoGYFsILWKZwFHnl4B+6//0EkSVJCoDHTc8FICzHW95Vi8zyvMiqSwNB5C62MzHia65RDNJkVNm46JDx7QlHk6K7sQ+5ypNpg44YNOPbYJ+K0U0/F6aef/kuPOvygD4GA5b1LMJqQpArWOtGN4P6gcVY+11rVrged8cbXESWktY5qqM/KmvR+1oP3Nm74YmPv8fjvTf8c1ruJgQGo6e+/xtOYtC3aE2C1nKXEA8rXnqGPdk/KcqrGE+FQ6PVUlPOctJc2cFvaR5nKo3xEyAIfMPDYiG2JPI1WYY5+IibyqgyCpPRcwHoV24Bw22138pVXXok0TQMyRuguryDNDFxRwCQGRWEBZZElKZwvpCQThAjbgV6ldcUNfzNsNp1qeTMhjgcl9zqHakD3rWcH7xikpO1ekFEj6IsvauWk6jO73S4uvPBCnPLsp0tVx3JQ9tWBHlHt0jrXMQB0/QjMKFGnQSqZnU4H119/Pe68/XZs3boV55xzDrxnKKyvmFybob7eCovDpkb3ZYqepzr/k3R1eQ8450FGApG0cLjhhhuw2usimZurtHYocClYRIfIi2M0mmCdx5YtW3D88cfXNooOeR2Vir3tiy8RGBVnoeiyXFi1JfPUk4KnebZr2ROTvscoI9NQoaxNu679+64GSoWK3xIzO60B7x2ytAOQtDbrUIoDVEm0lGyw0ueJ5Y0sy0oS3erqqsx1UiIzvnGjxvJqL+hm6LBn5H3hciwudHD0k4/F4x7/WBx33LE47rjjPn/UUUe8gkJ5qreaA/DIsgze9VAUNnRXcV/GNmk34npm+aMmcq+XEu+46+/rKNsPzQWN0tWUgdKogGXSYPBHhdC0uYaVwm6LtFuzUY1A0hM8DebFxe+pdrLL1ZBC8Xvtbsf4dxtwGVWVeij+vi+vw3Eoe8EHZQdfs6E088RypYKQgpPfv/DCC7F3124sbjwARSEohCLCytISXNGTrlSTAdwN2k8Vit5uKIlt9qU9CzOvSItuj9h7HknFiNyVkgPofGPqef3+Irc1SkIUjpGmGZIkQ1vvhUjBekY2N4/Lv/kt7Nqzb9OGhWwP2MJZRqK1+ESNwXObQtnOTOJQRm3yNE1x2223YXV5GU960uNx4oknUhGGS1mbw6hhzH3ez4dGTWhUBkci4wfVcQ0CHe+Yy7+3AqCyXSz02xudwhYeV111TflvdQVeZkJTtltaz7z3eMITn4gnPPEYEpKUQjxyMpq9rXzS1FKhPtQloDEhWxnejlkfTMcDINW20AQNhPDLw0DDDfIowvZakIB6h0hjPap12NVYI1Szi0grOLZIkxQLC4swQRcmNQnyPIcLkHZTRdiVhiBJTQmbLi8vI9EGWSeFMQYry6tIOnNY7fWwuLiIlZUV6ETq5kpp2KKLn/2pl+HX3vaLxA4wRsiSSkG0FUJtOzFCxouTf9uqwOsRfKyXoxuk09Gsu08OCU7i8KcJlEcFP2tBX9pITPtczpIstEUA1zpnbijCQPvDdocmgQh9VAXCarg3AO2BRmgUx42RTMKWC9TNEWOlgFuTCyKCTkpGNdT0R+IgQjTaugGv4uiVti/rrw40hn2quPZaUBgvk6eZGaurq7joootC00a4DmKsdpfxuMc+Gj/x0pcgS6STMDNzSBINB1eWhZrPuBm4xIAlfi1HR/Q9U9/Yk+1humqIn4zosXOiT+Q9kBcOH/3ox7Br526oJJF/8xR0vhTAwo958MEHce211+8+56zTyRZWxp940cfStWAlBqz1/WymDVja/+6cQ5om6PVWcfbZZ2NuPsHS0jJ0rf2yPYxr2gyg3cI9jTjWNEJzfQJpGDXEbTjcPOn0UnnQvszO88JhYWEet95+N9908/fC1FHpeum/l/CZIQLvdldw2mmnoTOXoLeygiSMHiBQKAVyQzy73mLaIHKHToiGw61V7KtriJvKz2QQqTbFb1Cr6f4uTQ3LuAlNHZHGXJc4cZsIxCT6OMRYWV3CyT92Bv7wj37/YHi7sSiKHyeGV0rdRaS3M9DxHkcw8ybv/VFgtyGsYSrZnX+ct/ykJE0/BeYOiLrW+lM+/OEPP/O8887H4sZN6OWrMMaAlILj0F1GjK9+9at42knH81lnn0pLS6uAk0nSSgEwBsSA40IU38lD6ViG4oHr3XbK6+X4hp2PtQUA6FdVnlLde9LZZW30dxqV3+b7rDN6NE3ytMby13oGq5PY5SgXUQXdNJSTVH43aFgplsDDtdrFmxxbXepJleloIO57BEdM0XE2k0/G4MGwo8bv9HfxGljvQCAszG/AN755Ff/gB7ehM78A73047wxX5Hjtz70aP/mKlxOxD+KFQuZuJIw1Lkw9uWZFQlbWNV3QMVVFbq0Xexk/0S53cpCVULVnxUoHnSvCd759A3/xP/+rLIETpMvIh/bqJOsgz7s4/4ILce65Z4OC7EpM6sbtUdO/wOOdb4TFoygOM2Pz5s04+5wzYa18cEUO5cZBG3dwBjnqOqly2kM0VH+EBtUJxx9aHsD687WSw9iMaUDLowrhQZIYEDS+cell2LtnCRs2bUZuJbxRyoQuFVeKDjEcdBAnOuTgA3Haaacg78kzoaB4Wd5X3NxRZ46CYJF3ZftcI4qvWQbZeAFdIV8ajmEGdFyNfJST6ZP1n8J4jhIaG5dFj9lDRcNRUoSmCWCLxAAbFjIcctDGbd7xNqXwQXYe1ruyoys+eO8Z7G2jrb1wFqnJoIyGKyw8GInJ8M53/U8sL+/jK674FjZs2oKisLDWhhlGBUyisNJdxe/83u/id3/3t/mVr/gJsr1cnpGzQhL0DkYJaTEIPIOt7BGj9dRB4KwBx7Ro2VrLGzFYmJRPwRR4AmM5JdQoG8wC8czCy5vGvk06sXl/l48msQ/9HCDua0WsTxGvP1un5OVJkBTiqlsuUqZ85HKEIIZc4IoA8KwkQKEw5w0uKCcwnKrKysozdEkVZTApKCd7oe0PSkSotf5V+b6lo2YyQBk4r/Dlr5yHbs9h03yGvGfFHtgcj3rU4Tj99FP/sLBd2O4yUl21n9eFPOuzr2JpOwZ1LpSOGlxHxLbpdhXB13R4fL8mT22shYYOYutOZm0pI5+jE2iT4pRTn4Uvf/UrYRSNyEyIqJ0MglZKIcvm8O1vfwf33//gvx515GE/1e2ugLTQI9QwhK4mxtdXRpjmT5IY7N6zEyec8BQc87jHUVEUMAphANn4SdejEI61Qp3rMQNl0Jo05tPQWq4xtOQBKJyHMimWVru4+NJvwHoHD6oNw+LG/JvqOhyWl/fhqU89Ho9/3NGkwkjySmenFTwpCgPEqv+GGjxDaPh+8DPf8zSQOLdQkHEGcNq9PCqLro+YH7QmZcdWKPPFzoSi6KHIu1hZXUKRd5H3lpH3llEU8bWEvFiBK1ZR2FXYXOYR2XwFeW8ZNu+CnUV3dRlznQTv+dM/pmOffAyW9u6EUoTExLbGICTFgEky/PG7/xT//rn/YB3If8roUgDPWgvnbEWob6i+7t8/0xDnB4mZjXqORBi6byf+o0bPzFovRGIapHs9AsRZz8R6Pethmi391+j6rtePTZ6rTjTXqhISNz9HlVIKPiheO5C3UM7DOAvtLLS1UL4AcQ5wDoIFIOUbYlUmmNWm45rCLQ9EkyYRhyVoQBkQJXjw4e1/+a1vXoPO/IJwQDI5x0tLSzjzzOfgkEMOfjexw/xCB0ozjPFIEoZW4RXmUyklXxOlYBQj0YDRJKgssbTkh5dRHjr8d/1r/aUUoEleSnskipBoRqIJRgEgC6M8lAZSo5CaINDhJYE64/TT6PDDDoEmwHsLo6uSU+y6TDsdPPzIdlx51dU/6SHzkhSZyY5v3aANWvh6r3lbYClGQqk2eNELXwgiIEnEeVpr+x7YoMm6o4KW5ldqvaarM8dyaqusOjALGFSbDtXV0RtyIiMVMzhVy54IWiXQ2uBbV17DV19zHRYWNsBaWynxhnqkIgNnuSzfERGy1ODHX/wSEBHyPA+ZfiuAUaocIkjQQaBInoeubaq60+AhZb82ibrkvjT4L3U12f4DHjsDBu2pSRzEKAM97jm0tY8Gvr9vahCUgyxb722UAnkK2hFAolNoEOazDjKjkRmNRImejmIPDYYJInGaICiIs9BKquJZYpAahbksgbcOmzcv4gPv/6vHHH7YYSh6PZgw6j41CbwDnGN4aMwvbsa7/+Q9+OKX/otJZwAUCuvhAFgWAyMzd9AIZKYJ3Aet36ABddOUbev7aZL3G1bSikH94JZrGliCLvcAYaLPHoYSjRsaOmkQXb++cWs46R5vf1adgDltMth8+fCKc1nVRAJ/1fPuv5Zhw2qHDdaNnAxyHsYBxgUdIFJwzsOQkvPirKAs2oOUBYwMN4TNgXwF6O4DeksA9wDjQMYhIY8UgHbCVxMxLOEEWl/AKYaFG5p4NWYO1RMG0tAmhWd5L8eAzhJc8a0r337PffcjTTuCvIR24wMO2Ioff+mLpZU86EnFeVgScIQAQ1UBShmohDEFirnG1QmabgHpYudllp135VdpeXXSiVUPaBAH7QoyosMIjPj3aFvitXpvccBBm3DGGWdg3759yLJMmlRM0kD6lRJ/9JWvfA1F7mB0KtISZACtyoTbExr+n5n7SbyDuAGxxBCDEhE+Y2hNyPMujj76MTjnnLPIOw94qWFF/kZbqfFHVXP9Uf0ZZXw8Ac46kDYAGeSFw79/7gvIrUeShY0RpKY5RF1RdC7PcySJxu5d23Haac/GKac+m3yRQxEH8jRgrYNR/ePbCSLIRBMYPWAwTbnUpJmAZzJNq/t6r/u4gGjoZwcuUB9iSM0OpCoajsJWNa2eUANtuZHw26E2D1XOPCpVq+OEcgXkKz0ccsjWu//6Ax986C1v/aVD9+1bRpp1AA5iX57gPMOzQza3AX/wzj9GkiT8/Oc9l7R2IR2VYZtaKfR6PWRZJgz/kUKQwxHSSZW614qQTspPWcv+YEw2CmA8h2M0l+j/JTu1Ns7M8PJwI1iZ4K2Yhpfdhf4ncgCJSUEFwzmGThIRZlQhOPIWJvbcsgVWVlT3kW1udece+LwH2+uKk1cEpAaqI2KQC1sO+QlsPOCLRBqkE8C5MDLEQxsDxx4IAuk04SPWWsMzUBQFEBMLZWAd8JWvngedJDBJAuckAMiLLk464SQ85clPFu6L1gDixOagZl9DhxRqTRCsZAAvaoJ1HIT4uFIkJvKAV7E6BhbJ3mpeUt9omCGlXfJhfpKSpg+qTtbznncuvvgf/wl4JxIThYyxkY6kIlQfEtx8y234wW2381OOewJ1V3KYwKsZeObD+TL9m7gd/Uu3RDUtUpXDGwFGr7eKF77gediyZRFL+5aRGlkwa63ASMb0OYYmebDiWsyiXzC23VPRRFnUILiTfY0kNoR4OI0AW5xTwWGDSUs2lxoXN333e3z55d/E/PxC1ZETJMPhhfwUO7xcQGSyLMHLX/ZSzKUJVlaX0Ekz6TbxogsD1d8u3OD/QM9k6FRr87ZZK8PalolppALzpF0Nk8ylGceliBkc0wj+Uwwo1CjURoWugTi9W4KWRvdWqXER1z20sDOVrcwSvDDiQGofjN7qSo7HPf7Iw97/V+/jX/rFX0aR90KXXwFSKRw8rJMadza3iD9+958hy+b4rDNPp+7KXmRZB4BHr8jRmZ+HzXNo0rL/FI1wyrOXNkYFp9OUdttTsGeNB0YHIjxB1yEmXqehPzfDWgz67KgHNUn5dZa1Gf27PNP5FIG+yUawRHs4bkgjMyMlDbYeXgk5HaThigK604ErVqETkihj+67ndu+9+7yVR7aBbVdIus4hU60GEwv0FMGnd/4HzS1g8ehjrsXBBz8DWQfspKzPhYdWwS4rU9ksGoJiKplpFQMPIoJKDNhapFkHN373e3zttVdjw4YNJUiQZgb7lnbj7LPPRKdjsLqygkQTbM5IjRHUXnNtWn31eErNpMiFrFuqqJruqQw6UEOSoh8eMrdx6DDk+DnS3BhVJhneMU444QQ65phj+JYf3AqTzkkXF/uSZsIe0DrBtke246ILL8FTnvwE6cb1RTBP3OfvSwXuSaLG2Asev8ZAxuY5DjrwQLz0pT/+Jmc9siwRZUB4GAUkWTawLDOqpDSurjrwQK9pNsn+Q1rGGjgCdGJEDAmET336s9i3vAKTJmWHUoQiIyM7SRKR12aLXr6KJz/5WJxz1hm02l1GliUoil4pkmRqwWM5EHJIzV9E2VolHPQPcWv+rsCPw8pvkzyf9aq5TwrZD62l8pAMsFQTDdrSAyBtCVrCkMcIi8PVBjFW2YtCbYBfGcS07oWD0JV38K5Aohm9lRwnnngs/fmf/Smc78HaHIkWTYWoemqth9YJCge84/ffieuu/w7PL25EUTgU1sOYBK6w0NqMRcbGlehm4bZMuhcmbZefBfXE0MB78j1H69QpN03H3CTrOxlShImQyfVBRgcExzxclmEg+qJGlIWD5D+RLjuEXFFApxquuwydacAVWPr+D/iRG647r/fg/ZjrrWDe9jDPBRa1Q+Z7yFwPqc8xD4eNGtjMHvPdJag927Htu1c9fcf132Is7YZOFHQolxMRkqQztPQ96HrjSBhpciGQkm6cCy6+BMtdGeuhNGASBe8dDjl4K846+zm/UAQkXUGLkjdHOoAJVITmCwPUg6PoZhwAGb83jjpRf43iApbKy61zZXs5ssTgjDNPR1EUIO8CcuxKPmf8Ojc3h4suugRLSz0YY/obSwacHTW5UJVkKrEs5L1Hr9fDc55zGg4/7JB/8IWVCNWG2RVKwea9xobkGuHVE9XjvpEcldEHqslNmcTI1mu4w99vsg4DxeMn9MaD6Km2kcKl5bmF1gluuulmPv/8CzE/vwhbCDTomAJvgcoHzZAHnyQJvPf4+Te/EQsL8/C2CMqECqlJYJRG0es1g5fGetPwAQCsBg4lIh52v+PXi7mJmtVb0cc993HQ9no4vHFOdtC+UqFWVCfVem+r4AWuqjvHGSvhgNcDmUoWP3ZheJD3YFgkmYL3ObKOxsryMs48+xT6w3f9Pvbs3g5vC6lXeyv1fmNQ5C6IERr8xq+/HTd+92aeW1yE1gmUTuCYYFkEukLIVTsL3PeK3/fEcPCNl6cffXlkrWTbSUji+yuQmeT91vI5swpKDrOzNJVdprEJzCTbRyka6ci8q80asgWU9kCxCp0SsHM7dl7+Tc7vuBPp8j4kvgdSPajES1nJ5jBGQScKyih4xShgUVABq3Io1cVcsQKz+2E8eOU3GA/c8xWlPNLEwHlgtcjR5DSqwSXIELjU10rOKWF1pcBl37gcadqREpUXYuvSvj142tNOxKOOOOTvNVWCcjrJQvdRKGMparym9aNt0vM4hDE2gtT9SNkcAtVnUz1bgIDTTz8dGzZsKAXxYkmrKpQYzM8v4tZbb8Mtt9zCZdzR1garca36EJhBGzFGR3XkRSmF1dVVLC7O42d++qfChF4H5wooDSRJArAfmRVMk5mPOlyzMvanzSBnfb9xxlMZg27ew8c+9jEsr64izTKZI8G1Ta9kI0QeklLAnj0CL55z5lnUXVlBlmXiMMnDFgUARhI6UsZeJ2Msk349fNWk8v+zGORRBOBR5ZBZ0aHmZFZXHmrfJvYNyPKlbKcACqPr+1rYfQhyPGyRl6KQWaKxvLSEH3/pi+gP3vn7WF7Z0+j2c87BGAOtEjATVns5fuvtv4fbb7/nLp3IgFBmEpKcC6JTI4K1UQHepFn/LGdxYgRlPyOqs+ikTMPbWc8up2GB9rgzMQo5GBfIT7t2g5szxq/lsMxfEAspGUEBZBikHAAL7NuNnd/5NtOubZgvVjBPFhpFKeqqPJCarOnfvAT1No7R9BZzmkGry9hgu7jnumteYB+87xb4AokizGWdscTjyGGslz3i340xuP76b/ONN94MbbKSvAov/NIXv/AFInhpc7AT+8+u6tqqgqJ6kFmXHGmhjYNeU6Khg/dKTbLAExxXyvmkNfK8wNFHH03HHfskrKysgDz3xROiaSb+7YILL4ZK9Zj4IQY+rBrzE/o2SC1yjPof3jsoBs455xwce+yxBN/kyfgADyVpimqECZUcEE/TO7RJu3zKwzFjRj9plh6RlPoI92Ym3fqcGvIi1yUliSzLcMEFF/D555+PhYVFOCcPMsKN8YCladqYe3TAAQfgl37praL5AQejUA7ONEaH2qKfjLjKmDjY5CEDvcYeBK5PZI33v/8czrBS4yQzZ6g9OnqEsfVlpqhKfaRKpC9wYxB0e6jqouN6R11NsyT+noQvQbCqZbTyXg8/8zM/RW9961uxtHePtElCVDaJZKinh4JOUjyyfQd+/dd/86h77rnv6zrJAEXIbYFukQvDf1SG3Dqv4xDOaUpEsyIfwxKaacQtp7nmSa9xZrL4Gkt0+6v0PUkgOizQnWQt+zuP9MjgK2RyrSwilMQThUI5sPGA6wL5CrZfexW77Q8i86vQ6IGRw3GsEnj4guALBrG07ZKDdBMigaIMijIQRBU90wq66GITeey45eYnYseulwMAekWNdF9HnvpGqpf3G5swxI57fPm/zoOzQJrMw1pAU4per8DjH3s0fuyZT6cIDGhDUJrgvW2Ufj0xPPnGV1bCo/M0HFVtv+B90HzxA3zZgG5SwsDuPT9g2/Z6PSQJ4eyzzw7v48pkuxlAEuY6C7j88suxe9c+4QnVRvz08X0m9SL1aM85B1cU2LxlE17z6p+FBqMoetLSpZqdJ64mQzwssh6nVTBNq+wgZzVJa956QcCTw7FxhLvCjl278ZEPfwxKJ2VZSGsNY1KZdUEGWmvkeRfOFTAEFL0u3vz6n8Mxj30sFYWUiaLkcxSYi2W89ajTD8ucJjVwk2R2+7PEMEu2Oh2ioGpDynwDQu8faaEaL2YqD2ZdeK2s8SqFoiigIBCyCX/33uJXfvkX6U1vfC12bn8YWSJaD8KTyqS7oQCSrIP77n8Qv/Xbv3Puffc98K86yVAUDibNgmI6jTxf7Wxyrc90f8zUalwHXCO0HIeMTooGrMe1VeidmgrBbZQs4UMi4IaiouvB0VmPMxq5YO2yUvXvbizyMjBQbKCVALSW6cpO0Je9N3+HezsfwQI5GHYo8hU4JyV2aRuOI1yoJPInKpGW65hDBE8s4m8M2AJz5DBnc+y8+Tufw749QCZioSJLUVMyr+/HyB0FN5TXvffYvm3nSVdeczXSbE52rHXw3qK3soznnH4qDtiyGUV3teQ/FrWBrzrwZFSZ+PjWvq/5PhXLMdVU8/W2rzRgCjYRg51DmhoUPYtn/tjTHzlg65Y+iQ+lTDkAVycGd999L75z43c5ItUiaTG4TKnilE3y8lLsGyPaGQqklUykJBGvyXvL+PEXPR9PedITyLq87DuH84ICOC7rgmXGydU0XvmcoIzYiPJqESLVhNdGIjaENrciEiQVqJH5txV+vR8UHDUz5ipzbq+dQHAxQ3WQV3mf4RV5NpXGiogXeSgkaYJ/+qdP8Q/uuBsbNm2F82hkxUqZ8AAJzB6dVGPfvh047dnPwKt+5hVkSIxYonSjywceIF3XjaYaYqRL8by6XYmtfUCYQNoiXcdyQ1tmvt/41lAGlushruqkVa3W19j7dUhzMAeJamvafDWfb/vaRiFCjblUJVrSj6DJdXnJHDxVJDjItNtIdHfOBv2DqP9QwcfxfeW+ZX2d9yWCVtWiqTyYGgrkK0lt2c9eOv28Ra+3irf/1q/RK3/yJdi2/SEkqpahgcCkkBcMZTLc9P3b8I53vvMnH9m+7RVppyNBUUvXRvacliGPSmZzKabyBcfli7m/Q2imMmJ4ju39U3//cd1m9TWuk5MjpK2UrgWJ3CjtNW1I9dnV33kgP6iOtNY5gv2l1+r+6gmV974xB6zauyG4ZVVes/e+RFcb60x+oqaGOuevNtQbw7hro8/1gPozBgcqJVG9/hxZNZAIxSJDHx1uzOrre7OOcvvaZGhWoibLzOjojqjs3nkHr9x7JzZphrM5rC8A0lBOQ1lAM0DsUfgePFlp9w16KPAcBPB9vDCwlkGsSZLIdcIBxSryh+5iuFXpMCIFkBFfAC9dhKRkzhErQBlYtsi5ACsSobokxZVXX33dffc/iKyTyLlVDux62LxpEWefdWZZLvLOyVikaHvJg60NejCihlv/n+KgTeXDfvZUavWUvgCjOYjDtHn60ewKsVFKicoYyTqCPQgWBg6u6OKxRx15yEknPRW9vAut5Rkr6FLhl4hARqOwDhecfwm8UwAbMGuZwUS+vOd4vWpSg0Ok4HyBoujh8MMPxc/+9CtvImJQdNBTGLNZEZBJBKOm6XgYByevB2oTo03nHEgrWC9oSZImuPrab/MnP/0ZLG7YDNFKqgSPCLoMGhQREq2R91ZxwJbN+K3ffBvm0wTeFlDwI8slky3skGdf/2+a3lntL17CYKHBwQ5u1jr+LAhVCzXuM75lEFNPECYQaVNtPZrwd02MvLeMP/2TP6QXvfC52LFzu7RaRgFEKGidgKGQpXO48upr8c53/dG/796774BsbgHWi0OIWV0ZKKmqhLnWdRuGXqyHBsykvI1+/hHW5bmvRxlmWoRHhcBl1OiSabu+9i86w61miZAoUBVEjhrzMmLRSkkIIgJZB+QF9tx7LxYhhF4TGydCKVZxnTjKtTEA1EIlfEg0WIbZ6kTk/p1DqjQMGN09O4E9u09FKH9xGQh6OLaAlzl0IAK7QjpCQ+AKAKvdApdc/A1BzomglYLWhJXlJTzu8Y/FsU84hry3NRXgluQ/+dL3Dn421ECBm2OCaLThH7KPxvHe2pw/BS/id+xgNIGdw5lnnC5zM62rJeqqDGiZGWQ0rr72Ojz0yPZXIXRMxspEbCLSOpXkZPARUf0GwjOyLMPKygpe8YpX4DGPPeopedEdWKZZq2FaT9b9OC7MWohygPTVK68qRKnF6jYmQGNh8QEgyzLs3r0Pf/xHfwLvZAK1oDhUto8ZJchKmmhYm0MpwNocv/4bb8Nxxx1HRVEArjmnYlKirerbeLMRq6mh5UOYdKJ33zOL6FDQemy/X0XaGpQpT+c4BkGd6wWdzyxnjybSOPAeAkIV1TWlh0zURhUIf/7nf0Ynn/xM7Nq1A0lK8FwAJOXdoihgrcXmzVvxjUuvwJ+95//bvrLaExlzaFhmkDEovCCKKsiY+yEcqjJz5sk5K8McrQeX82rWejan5Wetb3fPZArhk/D+friyEJMrm6+FtD0NB23o2jD3dUCKnAkDmuAeeeih5b37xMFF2+ErG1LXoeHYFejDPmRBR31AhlkRfG3kinAKRT07YcDu3Qe7bdtl8KKY69lW1+wroq7Le/L3woKtcEO1TnDn7Xfyt664EgsLC437VUrhrLPOwtz8fEPNfvpkYTCyNunZnPksBOSwgeaHV1H0cNppp2w87LDDYK1tNB/Ukf4sy3DnnXfimmuu+ZcYvER1/wqoCENrJ3dSjN7KKo569KPxEy/98Y8WQbJ+6oBijQdw2o6I4YjSdLLlw1j9jd/z/ciA9x5kNHpFLmWjJIFn4C/+8i/5rnvvE2ExK4qMMQOO0aZSgHMF5rIUe3bvxKt/9lX4qVe8nJaX9or8vNYTGbtRXR6DkKuh6z0QQVb7debK/p6FFf84jBdxG0ZoHoWkzIreTTKniQIas7q8jDTR+OAH3kdPeuLjsXf3DihiFMVqCcUbk6DXLbBp0xZ86T+/jPf95QdYmxSOpYURXA30tHkOlSQNAv/+6JjZXyjdpIjbegYD04n8Ocw6xf2HjXQOu79JeXCTkuYbwX8dXWqR/yMNoT4tXqhnBXY+eN8hHaMr2+yEBu/RPy9JDbi2WJ6S1l0uETsZ1xE00ZhhwEjYYXnndqC7Wsr1Vz4g+AUf6QMEWCtBlRNNr8sv/yb27NlTasJoLeT7gw46CM973rl321jSp4rT0j8lSk2ESI4a17DWRH5ccCpDHLXwYZhxwAFb9p126rPRy7vC41LcaFiJv6OUwvnnn1+WppIkaXR1lSXI+Hh9iDrLmwzQlSKCzQtkWYalpb141at+BkccccRbGE7UeMk3IO5Js+7+mx096yhmapN0F41DXqZt02xHto36d82RDD3snpAkGZxjMAif+OS/8H984UvYtHELvIP09gduBRGFmRG5zK8hYHl5H57//OfiN37z14VzpCBdSewG9PGHyNv7Freg33i2S1312ST1WR7j1mVkm/vY59V67pGL0npNoxczbC8OzHZbrYaeeI2ZuUJbNXI9HOAovaGFuQ5WlvZiw+Ic/tffffCdhxy8Fb3VJWSpEaQm8Km0TtErPA465Ah89t++gL/9u//D2dxCSW0hZVBYD5CGtUWwB5PrIo0rZ0ySMba7ntYSRDQUX2cMXmZRH17rdY9CrGZBA9c3OKumca8FqRy0X8YNkh2cXDkgIWDv7swt7YEGoJWqApxwHkWnkxsHX9UH5VKN60QVt054OQqeGaQVXPjMVCu4lWXwvj1nIPJS2IlCLirukiagyHMhDzuZTr97915ccsk3wjw6KmdD5XkPz3zm0/HoRz/6MZJ0mPFcviHB+SwB+1pLw+3EFtys5IA8rHN4wQueh/n5VHSs4KGNoM/WS9OKc4xONodrr7ke995z/7/H7ykyZbNKORFgkgtLEoM9e3fhKU95Cl72sp84wDnpgiBGCdUNi7bXgpbMahimiTAnUVAc/hkoJ3vSQCVXQs8W8GAUjrGwOI+vX3Ahf+Cv/xYbNx8IJhlz7pwr++G11tBgJKmGUQo27+KZz3ga/uw9f0qdxADeQRPDu6IxYHDidk+uYve6XHt70BvXWJT17Kcc1T7BgZn2OQ4qAUzKQxqVWYxH21rDBAdpt5Sziirp/1l5XNMgMuMcGVsHlxfopAny7goOOWjrn374Q/8LW7dswOryEhRLxuedZJNGd1AUHhs3bsI//NMn8ZnP/jtn8/NQJg3y5IlkQSops5zhzoNnur/JJp7PjhaMQwjWC/VYa5BRn+q+P7Vv2sNLp5USWKtQ5LDgZdS5Lks8PNqHCBrjgT07tpt8FeRsKNPofn4k0XhpjUDu1wGlUUxItUj3O8iARGYHxTKuZWXvrovhi/B7HghkYADwLCUjOCn52tyi0+ngpu/dzN+76RYkaVZNsw/O+LnPOweKAOeL/gAEriaOub5o2zTPeprnL4mxqxohbIETjn8KHfukJ6AoemUgwsxI07T8b601du3ZjW9cftkrdGoamlVxzYQk3tqwwqRuar8YY6DBeN1rX4ODD96609pcnOdIPlzF1h+onVYu3GDEZVzwUe9QamTmiiaepzPugcTOD3iu9ckPeeCqEhAStEjKEkk6j8IRtMlwxTev4997x7ugdAZSCaxXYWw4lfW9GL0rAKvL+/DUE4/DBz/4fsqypMH0lwOKvtdw8p8PCrFctt1FAnBf8ALXGBffNrCe1nZgRq191AcYK7ikmvOJ1uN5R6RjqGEbdEBpPNIwDHca9h6DHXs4T76aLquYYTRBG4K3ObJUwboujjrqCHr/+/8CGzbMwXMwoCQooAeBVAptOuh05vCX7/sgLrroCialYL10TCiTonAWSZYFblZzNlqTlMkjX4P26CBEp428TIrE7E/Buckc8WAF1kmN/TA0YtKp3pNk6IMR7vFzpSZxXrOUSMcRr8u2YGoJQfrBZXp4DywvLaq8BxOkPPqSu9D5GH0HDSjGqGAnNXsJYLwESMSV2JpnhiOHggsADr3lfTLB2Tu5Nucrpx0cuDFKuoOUQq9wuPCiS9DNc6Rpp+RHFkWOww47BE9/+kmPieKUDQ4aDSb+j7c7zXM2auTLsKRv9P5SjW7j9p/6c1BKgeHQ6aR43vOeC62ptCURcYIiKK0BrZAkGS677AqsrubodOYBoESlIsdI9T1GVi0hO2Bp72486+ST8eIXv4iKXBRBTeh2mPQArNVoDIvWx7V5zepIp8moYhtlDKJ8ObRRIbcec/PzuOba6/lX3vbrIJUg7SygW1gRLPMyCTVJEpBidLsrSBON3uoynnbSU/F3f/M3tHXLJmjiEn2J6E8pyTzhupalvlrZqc7d4SEZ4cDhhTEsmuGRDtMFWitqMS2yMUyHaJLgpiHe1DpGg4bV9a+hX7MScanq6RlGKbg8B9jCFat46glPpj97z5/AFUEuPQggpkkWYHWFJO0gyTp49x//Ka677kbOOiHTdKIlk/cK/D8yTLkJXdf2aBtN3G+Q+ToGTLOqi0+VKEypRD0LYtg38G9Edj9sDk/pvD037BX5OByVpZV5dQXEMqIj6mnJZ+jG/Dc/JmGhWiOGZhG3axBOfSGBeJh/5mxeBTABzo7ibAjt4ZGAmqYdPPLI9n/9xhXfhDYpbOg8TbRCL1/FSSc9FYccsvXuvKb3MrjUOr7CMUgHbb1Rx0kqHNFHcUi2AA/nCpxz7lm/tXXLJnhrkaYmcPaKEKAI78gYg5tuugl33XUXUxD+c1aGGBtjxHcOuwilEfq0GYuL83jDG16HuU4qw7KSJOhITF5/GwfnDgpAZj3s4+qCk9QHG7NqlJKNHzZVHa3w8CF0D4x1reE8wCqFIwNtMlxy6Tf5V9/2duSFByFBkVdTRJUIh4CdDLpamM+we88OnHjiCfibv/kgbd60AcRO+ubDM9EtIcBR0XPUNyi1ScLsHLYyt4pq6MswDkz9uRD6y1aepjPkdd2MflJs/xyePtXIxs/0Zxd1XZBRsuYlwjbBfhoWfMU/YuR04/ujoNkSbaohDqwG7UtfDoUcF4QpLa3VRiuwK3DqKSfTH/7RO9HtrUI4a7VMKKoGa4NeYfE/3/Eu/ODW+3KTKHgm5NbWtDj6hSdLZHIMMjLcgDb1oUad30Glj9iZFqHlYbytsW2fI5KtdullnOMYVbYZFkS073Gcsx8XFAxDdoZOh6fZWmljV+A04wAG/ZtnV2rARJRFmyrDRm2A8MDrVwB8AWZXjlsZVn6OZfpxpauyNFVHS70EJpoU4Dw0yRkjZwEX2qbDLDqFpp8AFJgUVJLh4ksu/cm777kPSUdUsaOCtlLAi1/yQkCGV5dChdXe4lLRvs4xmXSMTd1uEk3+rEf59MHnrInE1NGS+nk44ojD33/aaaei11stkRUEYcNIpTA6wZ7d+3DhBRfJ940gM762DmWYJ6JpaPRme2+xurqMF77geTjt1GeRcwWMUeitLpebYZyhHoWWjApaRkmVj+oGWY+yRl8UGXrP6/ehAjSmlELPFgKzkxh/HaD6JO3g05/5V/613/hN9IoCiclAkSUfO4i8jBXXmqCIsXPXdjzvnLPxf/7339HmzQth2rMDwdeE/zASjRrFLRkWpNQP7mihuvCenta9g2JaxG4Q0jFLFitdCePVKePB4SGOoBRcXIcMf6pyFNdEw4hkn4RJ4S976Y/Tr//arwZFTwX2DqSAJHIElAGTwq6du/Fbv/U7yd13P/jpLBOVUscE6zhA4twwREUhHKxx9zNt6+wwe1JvjY2Ga/r5XGpmG7AWYvc4hzCMDD+xDMGI7w9yMrPq+axFUXtYyaJvBlj8txpyNrCsG1CY+D6WCJ4J1ldOsFGebWkzley3tnJuiaLH4cNif733MGAo70EuJJzWl6gLQOWMn8azNRqsCMok6PZyXPqNy2UqvI/lJYO8u4Ljjn0invG0pxGH9zZBnHQg72dKXsqw87S/kJn2Z8dOpJJ86woQgOc+97nodFIYRWCW9un6dGpZN41LvnEpdu/dV6kQa12VkOKbxnKQToywrZ2DMRobNizg1a9+VYCqragVhrYv5/y6Q5CTBEPr2bI5fMaNdD059kFOOqjRKgWdprDeo1sUcACSNAODUHhGr3AgbQAy+OM/+TN+z5+/DwwNrRKQSZD3bEvR1kKRA8Fh985teN1rXo0/e8+f0PxcgnylVw33KicXKwnRFYF0/G958UBHEJAK50TZMdRpwa40AINQjEmc+TQHZ1hNtp8zQRNnheMO0LQBVlvXZFJRw/XYj7HLqD8wpyGv2n1HJBS6dS0e1hV445teRW9+0+uxsrQbaRYbS33IEqX7KJ2bx0OPbMNvvv23f+bBB3eeIqMsRDmalAErAisFkyTI8xxJlsANkIIfYQGGX/+gzM1HxzW6+6mPeD6JI52RxDVsSvPoKeyTEZ1HJSGj99cgdWAeGjxNX8rqz9hnnWE1CQLUTq7qc9ooBAsNiQoOxijJUOgUXulqRUJLNFrzljhI/scuOyauqa5reChYBVgwLAXU1xZl8EKFg3YEdhE5GN584JngGTBJhu99/za+/js3IpubA7RCmqZQirC6uoxTnvUsbNgwh7y7AhV0ZdgVpV1QMcmq8Xh4Bjs5aN+uzX4Ne5+qW41DEBrlQSQB9njmjz2djn7cY9DtrpRdsOX7sIL3QJp28P3v34prr7mOY0s7eyFUq8RICSneYym+4woQMfbt2YOXv+xleNKTHk8274oKXpirEMlH02Ypk/IdxgU+s06AnjbLqDOeyegykAGArNMBSKNbWORWHMHihg24974HL3nLL/4P/tS//Cs68/PQKgG0kRpfIsGiK4pAlnXoruxDd2Uv/vBdf4Df+e3foE5mUHRzaENVbXVE9DwqO2obhHq5yLOF93bqTrHYYu9nrPFPk7VOm3FOsk/q3UfjMuVBx3XUnpkW+RmXoU7N5aqX+BhINKPIHX7tV99CP/nKl2Hfnp3oZBrsqxIRs8ibE2ncddc9ePtv/c7lyyurMEbULp3jkq9lC+mkmKTjcFjpYhRSONG9em7t69H7Z9xznabkvdYusuZ1qKFrMsl8rnHaVWvJmicJeGZp66YBXR1tafq6rYqNE3XyLtWR03AJZnEznEmhTCo2GgwoXforgurnbNQaAdoIjExkqZ1H74BCXspJEsjMyOYWxCrEluzwnhGdN8aAlIHKOrj40m9gtZvDmLT0KzbPsWFxES94/vNlPEC4O1/YASre7VLN/kG/2+WetYp7loryYRaV1ho2zzE/18HZZ56FbncFiVYoip5UG+IsxeBnrbU477zzWjOmQvcukSykSZKyhybWEQ8++EC86lU/84fOCpPaaCpnGU0SkQ36frkJW/ol40pG0xq79fzDzHAsGa53Qs4FaeS5ReEYpFJ05haRZnP48lcu5Ne+/s3P+fb138XGzZuhVQKlDHorq0iUBlsHBYtEM7KEsLxvF4581KH40P/5X3jlK19G7J1E4RqVVDT5MpNgFScEE/yg9mCiMrBoGLYyg4kzKvpbv5uGxLWGrTWnb8fJy+OCz/H7ojn7ZvwzbXdSTDcqoF85srWPap0OdSibR0xkHnTPQ4Ov1hA+HgKRj4frw/1TlUFCqbIrQEOGuLGz8LYL0sA7fv+36dRTT8aePbuhNcHZvIRrlRE7kKUdfPe738Pv/d47uMgtlJIW7Ppk9KJoooiDz2I/4jIYWYizn1CijI17Lp9H4EOFVlLZn/0l0UnRxFHo2Q/DtgwbhzEqYRtVbhvH5xnGWxieuAxDSicr/Y1DLfsQNLiGamv9Nfh51DghpKG3bHlCkSRwVA0ehqL2FVddMw3+pq9dn2oNYPVlZxKcLQOXvLBwpDC3cdO/AQR2QQOKVINzA6Wgsgw7du/FpVd8E2magTwh1dIynOc5nvKUp+BJTzpGBvOSB2rKtNMkeNPwUYc9r/VClGvmFUpVdIs6Zw0AzjzzDGzcuLExusQ5V85e9I6hVYIrr7wa99z/wNeVTqQqErg1qh4llTNQNLBnz2689rWvwZFHHvpum3dR9PLGjdbLTqMi8nGZ7bBFHMeunqUsNEvmH5GmyCSPht57H7Y2Ya6TYfvOXQf+3u++k9/+O7+LpX0ryDoLUJSWUzTn5uZQFEI2SzODbm8Fe/fsxMtf9lJ89O8/dODJz3oa2aIHb3NRXQzICymudsKYoXbT/Bv55viBYfXxWdQap4Wpx13rxHM4MB1Rux5URCdZtZr7vpbNQSW0WUqbzcF36zsbqP7zGkL87qQJbK8Ho4H3/+Vf0BMe/xisLO1DmppQsw/BuPWwDMzPLeDiiy7Fu//0PWy9OIQ8t8jSuVJfg0O3xSRk1vX8M6jM1xe4eJqKjDircNzsE6lVpdY6xciD9eqEmhSRmtTxTT2Vnkaf8YHSDsOQJs8AaWDDllvTjVuRW1eV18PPSamoElZjiiUmRrsbsCT1R0TFh3I7+1KKwgHIPSOdnwcWF34+2gNWMWgJdlsJEqTTFNde922+8657YEgmxXsr84FcYfHcc84GWw9vHdi6RnA3vhRKa/Zx6+k/B32vzn+RppVgUwuPxx19NB335Cdh3749ZTmufPbhPTrzc3h42yO47LLLzk06aVCuV/Glyjk98Re73S6OPfZYvPSlL53Lc6mXZ50EPkywZeZyhs8kqMm4jHVYO91/hz9SLtFlhMgsbVzSp54gMRk+9/kv82te/fptX/7yeVhc2IROZwHeo5omzSJr3ckSJEZh986dOOTgA/D+v/j/8Ed/9C7aunnTjn179iLRBK2Fla61hvNVDbSuiyEkNAUObcyDSvqxN7+9xRV76DDqHC3V2TpTv07SnoaHMqq9fRLj1q8rMFqpd9JujIkOX7vzYAiXoAxqFDU6j9bT6E+SQcVrKJ9/Y6ZU9ce6HIBFr9dFmhr89d984PGHHnow9u7dC6UUCuca3RnWWhxwwEH4jy98Ce973/s4y+ZApNHr9copwOOQgkmC30E2QrOG8mpkua3+O6PtBU1UDql3TLUDhsmRncmUiidtTBh0ntazXL5W1GgWp9e28+1uwVEI1ag9AzCQZDj4iCPvQ01NHkTw1Hz2dSTVB5QGADTJ9HfFCoYFEVQe8t+Oy85PAHAEuDTB5kMPAZJ0j41DG0NQxCGAIiIkJoOzHl87/wIUhRWhyDAbqej2cPjhh+O00077VWsttKGquhaSy6GCkeGMr0fL/SRl+OFv5oMKsR+I0JXxQq2jNb5fnudIU4NzzjknACJFOVahVOXxQJJkMMbg4osvRm+lW47ccc4JAsMQQpE2krG5osCb3/h6bN2yseus9KS7XHq04zRIo2TK5CQ140mj/EmJk/WOi7LuiGkE1iZ76J4ARy4QeQ0cAytdi2xuA0wyh1u+fzv/+m/8Fr/jD/4I23bsxsKGjWU3FzHgbQFNgNGi4NhbWYYrunjLz78Bn/nUJ+h5zz2L8t4K4C06qYG3BdgJC9v5qstjkHGrj6kflqkNyjRZaXiKI+Brmhlhwm01yl6PDULqpZV6INV+HrN8rTKn4T9XGqQBPzfoNXgP+EZduaq3u0ZNvhz5PiTnIdJlQY2Glr5Qk9ievSNkqFOMBD/UFXS9CBx6j0QTVlf24dCDtt7+3j//E2zeuIC8twodhj4KZCtDRfPCY/OWA/Gv//YF/NUH/5aTtANlEvn3UEoaRjZd65yVUSTWoRIJfrADjHmcQ//QuWFzvNaztFS/hrhf/cD3lL3lCSVS0Oy5qr4qVmMd0CgEcpbBu+uaVAaGbd/1coWyta91sDgpgZSWORhKIT3i8CN9Zw490nADxAVL5KW1qky+xufj2r9IIFL/bEcKTiXwnTnQIYf9PaLEhm525BK0AOYmwb0PPPjPV119LXSSldWONDNYXVnCs5/1DBxx2CF/l/dWG8rXbVHSaX3rWtG8qUjxo+a11eQB6kGrUUHx3Hk8+1knn3/gAVukyaSB3CTQSYZeN0dnbgHfufG7uPOee7mTzQNKQ5GBYtI1sRmPvLeCp530ZDz33DOIixwGDso7WVAn83UotP8OPvzVa3AmXdtMJBhB5MOUPfFBgyVGoc2XaryYNBCY454rjkjMFD3JpFLZEBIpkgozFLwvvVv8/LLWrgAPD1IKPW+F3a5SdOYXcfe9j3z2ve/9IL/+Tb+E8y+6Ahs3HYj5hU1gr0vOrdJCoFSwcEUXq8u7ccYZz8Y/f+LjePvbf5U2bVxA3luBQeBFwEMTQxMj0aEVtlbCKKddRxEndiHybQd99WyQq8wAwoZnkNRplXSXQOmyLBARFxWyeKLYd+/DoHjhWhQhyIoDupz3cF7mXBTeyX+zL79a52CZ4by4VucZlhnWeRSO4Txggwp34RjWcfk1fr/8yj5qCsOB5XPCf3vm8nPj9bjwe857GevgnTx3dvCugGMrDiaU1OAivO/gOS87HZy1IAtoaLANXWHewYWRDiKshCDHX2uRr+1vYmqotjYVbQcgDr52XUMToMhJi8+7GViQB7QyQfjLIyHAFV08+YlH05+/510gzpH3lpEmBLADE6B0AtaiYzS/cSs+9o+fwEc+/o9s0vlyv3i2wlsgSGeeNjIShhSU0mNb3AchOZELwXDlfcd+KRm7AbA28jzBUEqSBKMIpML5qBlMCcQlCNVayxwbkrKvjExoBjHDuDxtVLA9Gb1S41Wlomu0k0z9SBEjnB2SYFBMFMteUkkgJVdTfZWShKMuccFMtentgwOiup5StGv9Ssj9PycvNO6zuv9mgFTXy2qgo/UER3O515kZIKAoJNv25EVLy0c7R2LXQ+mh9CsqdBOJTK1cC2k4pcCJQV70gLkOtj7+8fk+rWEpBaCQkIZRBEsOTnmwUZIYeYKCkkRFEbyysGSDPXEAaTBJqYiSVFDKNEPugVXS2HTU44DNB/xCHPIozw4wSkM5BljDQobZnXfhxa+578EHkKYpClh4OHRzUbN/7vPOhnU9aE3Bd4SBhZBZBiomq/X1rSEfw1Tu+4OZNtcw7G2WV/8+Hx8MSfm9uqZqvE61x+oaPqK7Jd3M3uYg9ijyLo48/LDnnnjC8eitrkCxlziDJEBwDCjTAekOllcsLrn0ckATrJf4wQDSq25dDk0K5B1+4c1vRidLUPSWYYLu8kAIl3ksljEWvgX3p6zltF0aACNHdcYgyuU9RPWCw4NGY74C4qwhrhlLjhoiFWGLATi28pCVDO+yXg58ms3BeYU77rqXv/TFr+CLX/wStm3bgfmFDTjggINgrZUDqSQAc76AL3JYdnBFjmc882l461t/Ac94+tOIuYC3BZzLxfCC++r6o9Qs23wAh2pq6yRRN9fLDYrEIQcjqYxGkiTIrYfRicy7Ig+jRXRpcXHDpQRgcWFePo/Q4OUMK5O01UL0gJ9XLIFS+6uGHvh9BQ0mCag9ZOhoeUk14ym1ZlGhnUs74CKHt1bsZd+SKig4mYUZHE/kIGnUArxIaCUPow16vV7JHZN/szBaw4fBY618LxiL4WJqYhhayNkU6W3Vfh2+E1BTtg7aEGzRg9Yaz/qxZ9CfvPtd/K4//BOws9DahO600AXACmBg4+YD8Nd/87/R6XT4DT/3s1TYVZBOJDiOwVM4d6p0MOPnEFWCaAM4WgNKZXFAHysChcGn2qhSpM9ZwLFDkiTo9nowpiJzxudmjAyEc0HfRgNTdSCNCsyGnb36DLFB/x6deaKkTBfRz+gAPJftFUiMlPgSncLaHJomv4ax/KJGyZgmcIrjbE7gTxVdpNk8YsczCOEZOCRag8OeFTstZzlJEinVK2ltrotgiV+IHaEMMkb4E95CP/robG7nLu4+9Ai0B7TvgeGQJCJTXxQFFAgm0ZLxk4KGlPuZBB5jpmAbDZQXX2DSORTQwNwCzOJGZI89hsAKDhpKaegYmBc9JOkc8jwHpx0s9xy+fsFFUKRhvQOxCOGtLO/D8cc+EccddyxRcK5JkoBdgaKwJUG5CnqHIOrsp+4Um3Q/rCfXceA+YgfrHXRicPY5Z+GCiy4OOlUEHdcrigCSoGxXXP4tvOY1r4LRCGJ3ZdavsbS8F89+9rNxyimnkKszoWvEK1pnegqzn7j00xJsl40ckBOlNNh7sOXSi1H4n9ISJXq2cCG6K3kCuhrjzUrQKPbCQelkKfKexdXX3MBf+PwXcf6Fl2JpaRlz84uYX9iAJEnQ660iTRJ45+ReGNi7dzc2LMzjxKceh9e+5tU47fRTKUk0eiurSDODPO+OFAEbJ0XfyLChg7PzDcMTHWRzVlNlljwUSElEniSqUa+MMs2S9chGMirFZVdc9Zy777qXrbXlqHjAj20BHqVEWnWlqRCQyNcYoMBT4/vEkmrHvyfaSJYbOhmp6mgs/14UBQDGgQdswQlPPpZSreXefRHKLa7iC9WDPQjXq3D2STaUkopcUIcsS+FdDmZGp9ORtfO1+w/tlGVPx6Dux1bgOe1AP3m+Q0pVbSKdMfBhn8u+7cF54EUvfB7t3bvEf/Lu92DTlq1gIuggoqViwACFjZu34K8+8NeYm8v4la/4CXKF3GKayvlx4obAtcGksxjKSQTvDIlOh6CLMsVdkQ70SiC3BTqdjgyLC5we7wUx6vUKAKIvobwRFdU1DMfzIduMIns8jZ2MqIMysNYjSxWMEYSoV3RlmnjZYEFlYKoUYH0hwuA8uQ0ZxA8aRvKdKXAhX+NfcUlENcZI0hB1rLw4nyzLYB3DhXmMWiehGgAUuUOWdsCkQVocWFXKifA9IWECWQ5BjgK8xZYnnUi7lq/m1V07sFFnUI5hixxQDANBvQpPMoeORf9FRQ0lRfBKED7vOVQEFJwm5GTQ6yzi4OOf9mPQGZxOAAcQFDx7mDSB7/VQuAKeFNIkwbe+dQ3fcMON6HTmpYPVWyRKOp9OPfXZ2LxlE1aX9oJI0P6oLaMUNUpK7Wc6yciGSc4ST0DCHVXWnYTAPWrQqtIEa3M85zmn0UEHHcAPP7QDncWNIXlG2PdOKhqpxg9uvQW33voDPvGpx1PeXYKJA5WcL5Aowpve+HokRqG3ugoTINhxktGzRmftzKTtgBoPpfX9iAARQdrbUCOFkZaBUEqBnYN3gdMQ2tooQLDee3hbwLKXDgslGWdiNO6996F3ffNbV/3xl7/8VVx97fXodrvYuHET5hc2lBBuUfRgNKHoiRBPr9fD4vwcXvTC5+IVr3gZnvn0Z1CaGdheD449klSj6HWhtBKkxrkYV0xlyBv/RrMRsQT7kQCEqEK9kk4mxmMuQ57nABiJMbBFDx/8wN/AKIU4qyN+lgtwuQ9Bpg/PZtD3619HOe1qFpcau4di/ZxJnALXhiNKB01XInh4vPn1r+f/8UtvJWklR5gL5BsoVlThBBFUYqC1vsV7j16RY6GzAAKjV+Qg5UBeYXV1NZRVxDgmiZZhiEa6DZrrv34ZQDWSYUTQrzVsUZQk9GgUO50ObOHRW1nFT77i5bRn127+X//7Q9iwcQsseyjI8wMAawtoRejML+Iv3vcBbN26lc888wwCF3A1cp7WukITJYJeU8AyjNclU8ErXkjkncXgrHA2KAUr2FwQmfhZWZpCaQ3vGIXLkax58CuPDRiafIDA8Yh8reDgI+JgvYiJyjU3Saw6GPuokp52OnA9N/F1r6X7ZGhC1UYIBkgzyMgZoQbkTsbcmkRjdXUVnQ0dOMfQWhy3sxZKE9LOHGIHHLQSpJqq1JXZQyMg6NaDEgPf7UIlCWA8thx7PO246QZe2rMDCyqDsjK3iAwhMQbspFwFraFYQTmCY4YNiRuF6yFP8DDossKyTnHYSU97Dg469GpYESwlb0Fai71zoUs1JM7Welx88aVYXVpBumUB3jJICfq0YWEez3/Bc+Fz4dolifBLTavLL9GmqlT8EBCS9Ug0RiGubd9f5DmUTjA/v4jnP//5+IePfwJwHvJo0pKD2OvlWFzYiN07HsZll12Gk046HswEo5SCVkDR7eGss87EM5/5dIqcGKVUOZ+gPACEkVTFaf/EujVaDq7sA/E80OyTF3KcJpFHlwMeVGlZ6szOWxiTwhZFuQFkWJ0voWiTziFVGoVlPPjQw7/17W/f8L6LLrwE11zzbTyyfQcAYHFxIxYXNzVgPO89itxi39IyjCI86sjDcc455+BFL3g+nvikJ5DWBF9Y2HwVSSA/e+uQmQSWPdg6cXC+WPP6lUlJY1NVU1ibRDbd/LkwvVsb6YAqih48dBmkkCE4djBJBtIKiTZIOwKRJkkiUHzUS6mVcCb5OiqyHzaDZtgBiZ1a5OVgxO+LoZ9DohWW9u7Bl7/6Nbz61a9+2dYtm74gZEEfCkShRlwCI6q0z4Xjp1rnQvkhhzIaRdFDkmr4kB1YmwMUWwaFTetBxQAAdT9JREFU5JoXOXQ0QC2+i+IpDcVQ56hGrpGryQAorZFpBVvE0ReA0RqKPH7xLW+inTt38j9/8jM44MCDsJr3JEMNpSHnLdg7aJPine96N97//vfxyT/2dFLIpY01PDMfygHK89ByaJuoObPhDKTA+vC+Xq8nzl8B1vZCiaZXBgrW5oAV1MOYiMCswYjTYESMR6jXCgIs58CYJIgIir1NSoGzAkrLmBHPFkWRQ6lIMPDQWhRc0zEB/ihkbiKEd4ry2rCylHMFTOh0jclwUfQwN5cJPSEIzeW5RWJUuFdRfRbJFhM2jG8SQskJhUArIHdQaQeu6Ipw6OZNOODYJ52169bvX7S0eycyNkiI4XMLzwWU0fBKQTkPS0JJkGFiAen1Ds4xlNJY9gy/dSsOO+FEwsJGFLZAojOg8DA6lRlJiUG324VJFNgzlDJYWl7GZZdchoX5DSBoWFegow1We0s45Tmn4uijH0PW5Ui0KUtG2hgUeQ6iUFIqScE0JcKGgYF2lfQMCsTHP9c+7bAZw4DIl+lk83AsTRDnnnsu/uWTn5VyapKg182hdQJmjzTrYGlpGVoluPjib+CNb3gDMpPAKGK4vIe5rQt4/et+TvZCtye1VfJTJ4yjiHvjJLKjUSOuugZiBt4/zEwea709i8EBqhQHRERY7eViHEwiDlkbEfFyjOXlZdx25z18w43fxVVXXYUbbrgRDzzwEBKTYWFhERs2bBLiVVEEFWIFW/Swb3kfNCkccOAWPP/cM3D2mWfg5JNPpk2bFwHn4blA0ZMJpUSEwq5Cs64OMXN4rwJKr1ckzBOt+yDitYgNCTSdZTImwTuCUgRb5AHSVFA6gQ3daGkq/fhlC2p7c7bgR0K7lgJgkCpnm/MxpuWvMbWVA2G79hkysj6HtRbZXCe2wD8MALmzyLQJHVgVyTySy0FlhnyDTKFlKC3zUUyiJChRggAmiYErLAgRhTGNNtFGPbs16HAUZFv/nVk6e+rPO+/1YIyGSRIZleHFKUhmmuK33/7rtHv3bv78F/4Thx/xKPRsESbDOmRpCmslSej2VvDOd74TH/zAX/JTjj2GtNbwzlWlWGaoVhfIenWxUKAHlQGQd8jzLjZv3gyrPNJUo2cLCbaIYb2FVgqkwv2ixpFzfiyHZNQwxqnKv+XwOSq7kjQI3klpi52HTkLZQBFMGKS7lHeF5Ks1nO8J4Z9Uo0w3abmnnRAM22PTOMdBpYjYDVf/bxf3h9ZgZ6Hgsbq6gnkzDwWPLMtkyC07zM3NYd+endX5CZL/nvrVq6Gka1YrDZ/nINLwSvyA2XrgxVuOS6l39528dP99yHuryEwKcIEipCieQvuvUmBN8EpJSSsIhbJOsfUxRwFHPpYwvwhHBkgV4FCi/NYWUKyQZRmcL1B4h06icdVVl/P9998PIuHnJJrk6TuLs886HVmqUfRy4e9FLkuJtun9pne2Hr4cY+zzqLMU31fX+Iq2l+OEpxxPRx11FN9+512Yg5K28mCnut0uNAjJ3Bzuu+8+XHXl1XzWGaeRAXuwtzjrzOfgqSc8maLKpjbSaTBgezYm1M7ibEctjG8h7a6tSsiq4QcZDApcDakeEXRioHRSQnDMQGEt9iwt4eGHt/Edd9yB6274Nm767vdw1133YO++ZTAzFhc34qADDwEC/Mdssbx3H5aX90EbBZUoHHrQgTjzrGfjOaedipNPPvmZB2zeck1qhH+Td1ckaAny1UYrUOhpt3khhpcYnr1IXlsLHjFEcC1kK6bJSk5auLw468znPPjP//zJw+6/727Mb9hYJqZJkmBlOa86O4BynHlEaWLJyEP0FNqlJA6/x0R9f5+lxjqodq/aEGVtWbVRsDbHysoSznjFT2Dz5sVvsivQmUvBeSF1+zrPK/4/AaQUsizB4x73WFx08WXo2HmBmckj1QqFhNF44hOfGErwgqzBOeiS5Fq1cavQATAus+1zNDSb8YqGUGsFrUWoMnJhjFIobAGTpSjyVZhkDn/0rt+noij4P//rK0iyDtgLyX/FyhDIWCK755578K53vQv/+A8fxYaFrOQPRbSnLZC4HkitJCaxvV2SlycfdywWFuewa/c26UpxgoJZmyPvreIxjzkSWzdvgtZaBlpqDa2UjPUwRlpwZ3AMdeRvVEbcGJKqqnK46DB5ZFmCww8/BD/4wQ8AxXBO1FmFN1Kgl6/gyEcdIV0uJA0GUUTUhH22FuRlkGMZZqsHntX2WlHTnpVD98J1d4sCaaJw6KGH3nDYoYc+9d77H4JO5tBdWYGClG127duNgw7cisMPO+QMhG68OpAcvQ8zw4IBAxQ2B4XOJZcXUMYg7/WQduaRPfFYyg469NeW7r33r5d3bQevdqFgkWoCYUWujT0K79AtLNjMIdmwEcmmzdhw1NGE+Q2A6YiCuVdA4cDhwVsn07OdE6SToJEkBswOd911F3bueBiHHPoorKzuQ5qm2Le0giMOPxinnXrK/2BXQEHKSkQqDDK0JX+x3KMDS3hrLgINDNAn8dGNfTNpgDvsfQMSoxVBG+CnfvIV+IN3/qFQAUAwJkWvtyr+xlksuQJ5bxX33XMPSCnQX7z3ffy5z30Bn/jEJ/jxxzxWrS4tCXufAxmvJSbUbMuavV4W38f6AaJnUSAsRqT1TL2FWTkv7pKZpV3XWnTzHnbs2MkPP/ww7rn7Ptx3332469578MADD+Dhhx/G8vKy8GSUwtzcnLhbLxumKAr4ALunaYqDDz4Yj3vsY/CU45+Mpz71eBx77JNo0+aFwJ8RIR0hiVYTpb2XQYlxQ0QnIpmpZKvey2H1cEOzt4kCmBjQwU2UJfrWTBDrHaAVsnQON3//B/zZz/wbdu3ajc7cArROaqJ2qLQ/whyK+JmimRIluXWjGCgdFaKtUP9KFLqIoAPSJ1kyWJV/R+vf41eG6/s5EXBrrosP4xKkBFLgwAO34Cdf+RMvOOiALV8DO7gQgKna4LF4uH1oSXZMMEkH99z3yNc//KGPnLttx84gYy17RCmF0049BT/1U68kTSLd73yBrNRMUqFdtCp9VuATgYeQeIlbBoCmP1v1v1srIpR1Mm/cm9ZacYxkABjkhcPH//Gf+K577hXo21ZzWURsi2CMwqMffSR+5mdeRhsX5sFhimw5O8xzXxlwkJMciiBwrcRZtg5XCY5nMW7OMq685lr+93/7HLp5r+TDKAVsWFzAi1/8Qpz67GdSt7sCUzuHVRY4Xg5/lDPvd+7Dfi4M96u1IhARdJLi3vsf/JuPfOTvf/WOO+9Cls0BrKSjDYxHHXkE3vrzb37BwYds/Vqe58LloqojS40l3I5D+PyQwGtCXpKPwwXbnxOIACoMXYzz08J6pukcrrjyGv7c578o84EC90MCM4XXv+61OPHEE4jZlerkVOO1VTPdXDmBXRIX2yiPe29B7JGQFnXzpeXjsW/PpcW+vZtXV/aAuCcUBFIw6Tyy+Y3QGzZfgk2bz8TCJkAZwDI8ZHK79xZKAz60vceOMRX4bzG5VybFHXfeyx/92D/ipptvQR6CkQ2L83jTG9+Ac89+DsG7MiAv17SF2ranW/eTsCcjWY9KFNuJ08gqSiv58hiH+qmRejYOjDRN0esWSLIOVpZzfOgjH+Xrr79BusZyV3YPsrdgdnjG007Cm9/8RtqwOA961zt+n7duORBve9vbqNtbCYiFA7wN3Siub+GaB9RPhbo0bp4IzCK3f/nlV/CNN90UZq0Uwm/RGiYM5yoHY4VN3u12kfcsVla66PVyLC8vY9/SEpaWlrBr7x7s3bsXKysrZRZQH+sdB9jJ3CeCSRQ6SYoDDjgARx55JI569KNwzDHH4AlPeDwe+9jHUpoYJGmc0yDliNJA86DsI7RG17MRbsmcxd55xTNLkreN8cjApdY+3Xh+QfOgEq8zzXavQclWbaqBPP8mPbcSg/KiV9EKYJo/R0HSezRrJj6vNh24HjhRiy7SV+l1DEYB9rYRZEaFXymF1bQVtMh1eyIoSgPKp8qj20AOg7YMs4OCL7UbfN+k1mogYelpB50TbhoTpunQzGEZV/+m8uW9C0NBg7SBIgNWusx8B/tDaRtldo2ZUtGgjwrAxwZevtlVh0FilaxEz0WF56eoFhTKGbQuR3QU1fNGec/1Eu6w4GUYChEdzDAkvRlQtOaGQZet+ghS99zYXxGtc6JZFLqoIsdLsw4t/jxmX9DQexvtsCbrSCmRNmo+H6pNFm5z8+JzAmko0+nfXxwgVGZYmyNOd6v0jkJeG2U1SEif9WGf9TNDLIq6sd1fOgRD8hO3mYnRZ5Q9D/+OoHpOlQNnAgolZ0f7qPtT7Sko0dFiJRplubMyhkaJYKwJ+kXW5WU3qlrDOJFR4zvWe7QHtbhrTOOQl1FcsOiboj0P5zgmfRCfFGfy6aiqzNX8LHP6qafguONP+BXPVtrzbOA8DKjBzVo6GqcM6KFw+KMeBes9tm3bgQcffgA7t+/E7j17sGvnTqx2u1jatw/LKyvodbsorJXxNWBpt0WF1CglEv9pmuKAzVvkv7MEnWwOWSdFkiRYWFjAli1bsHHjRjz2MY/Cox/9aDzqUY/6zObNG392YW4eSgeiHCk4l4O5QNENQ/hItCNQivWovuBlEJS6HnXMadtsJ3kfBgMs6yl4Ui90g6khTtOXED7F9u0WEjLoa0RS6ogK0+S8gkH3XzqAENBU2bSqjWSvDCkplgGZ5EOAKcFJvRRQ7+yJfAvyDIcCzLaaIwVp/9c6qbrn2IVDVmkNgSZTvZx2X4xD5yadJkwl102yeQcLFB6eXLkPEDlMFGr40c7DCWe+NacrtvuO62oZdY3t4MEPIjOTR2FXq4RAVQNGxdmEmSkQYTYMHGHix6MME63vdK3HMVhmX03T5iBbVh94KxwvD2JXPgM9APUZtWem6S6qfp6nI/SOyOzbe7XswmIH210W8UQE5L1WkhPBPxo4dJa41YHnRVqhz9mG6qunZlDnwjUrSsGKYMkC2oPYQysPYh3eL2pncWXTSRSjPCuAbNAL1TKahQPKBwachYN08JmQALNbhXWC/KXalKjipN2j4wKSYQgnD62kzMaNmYSfM0rtubSzJDOmHFdNNmAKlUMqu0qJUZbtSs/FDOKiQBGEuJK0aoOMcNg4nYlxCMxoVICkhhhKFTpJhFHgHYikFVWTQq/Isbq8gn3LS//VXVl90WqvC5s7WOfQXenK+HISIyfwtkGWZUjTFAsLC8tpZv5xvrPwK3NzGTKT1FQ6CZY9jNHwXpjxKiTFzjk4myNN06r8w/0Ihlft7hKerBbNqi/QmVYsahqUpr/y1HLc9dZOqjgHk9T/J+k7kgy0vw8pHuBhB1W1EIqB8D1x1G6uFCvrgUwDcBAF43gwonR7uQ7wTeOtqBRcK4OhmqCiDZ+hGCFAapM3+jOYhkEZ5iA8T1RCGmZMhhsqLjPJ4e8bujygYEiQjbgfNAiOXMVJaY+44PXJ9qgdrA4NMOI+pUoZtFx638oauUSQuZV4jBspMCyIVgO4Z6POcf+j4oY9rNuGkqhMvjE6pQx2yPeVEdqIz8SyCq1S36AAZpKgqG1XqufZ3Mee+m1J3GeDsv6+0lS4QhcegHYsbdHBtHjEYY3VQNxydhwDRAmIFbQXPpLVVkRlEcT0XFB7DwkXx3k/0V6X9tuG64tJky5LKzFBEMSJy8RP8XikZBI0ZRLbP06vZRy40Hcu+uzXOH+kxgYw7fMVh7H6MJA2+iOiAcFxsbwsCFpmkAemr8xqyIJYGU98AGeiEqlmjcwHGXciDdGokYevlBnwMCNJlirDXHePMv+ghLfZ+XJsezkg0QGOxUDE+n6Do2BdOWRQHmCrpkdNIb6JA5i1UrBGGMlhm76xzmFTNJkj3EBF6hD5sEOkMJmg0dDDMoHOy8jPV6oxsE0FgavSwDC1no+vsl9CKBGhLPlRX3DU3PdUZhay/1wIwCL600deVeMg2CGZvm+R5dZt+zQDmDi2volKVPt10Myj+rn3AzoJp9kHQw1rqzzqh74Hl5woVwuM4/PQpSNvlqR8WNDSuU0ItY8LYDyGl2oG2oFACI9dk21EsH3Oqq4fFfgTfqTjmBZ9mTWAoVYJqU1uHhbA0ICJy81AfvC+i6hKGcBYQHMVWHjN1V4Pk6Gl2C1BhkIieyQmNIrhieEharmKRdyORZsh2HmugmJfpwAIpzEmt0SqRG0kWHaiiaUYOg5htDXBywnOyrAkZRRCNpGQ3Rg/MiyAKX9X0ZgKgRprj0ZWCIZSUMLf7dLeUu0xckyk84cbYmXDHfDaAhgVMifSqgY9ezjnobWKNNG+Wq6OmRQlJVlToKagIOubxEFSXM4WkpkMVNU1jRZDx74kLNZbFCX4qUFiFMezc4OEOw0XoX3QpzHw7ZryWrJdEdKuz6vwDcNeTj0dhgDwZBD7sINSL/FMgiA01mYA9Epc8Vq4NhivP5xsBTBltt6f+Tdr/tzIAOUAUwP2b6NDg+HHZoDUB/1OSOIdoJA0tobdNkDNNRxsFIftSe9HO7pBSM9EZNih+6fJiVHD9gHRwPsdpmM1LoAZauhbDrj9vHhcQlOSYAd/bpVgDNsHPNH9jHJMg++VJyKFthHS/gCmdR+qST4tJy5T2ynTmP1bQ1ADkEasQiAYM3suy/5yQcJOU0yiwkwERlGb3VjNZBKF86pv2xIHJfAwn8hXI2g8uI8b1TjLqraXHQ1FMNYq8T9pALM/OTL9+2S29x5b8grUBKOTBEWvJ8GLUiiCQFlR5D+0Ue0lryBM/5W5PKb8e6PEWic5hoy61lcX3tCFmqSHcqHOHeyMFmUkGTvgvbRgOwcXHVjQWIjETDmgVEp5x3o/ld0A0wcv02ZEE0G3Q8h4Yw9FQCuIfOs9WuMAGoafq8h6zIHzAzKsSUplk0hV85BSXOmImarBS745MFDmN3JN+nzA+7fK7KJnU6F9dWPfluMZh5pUmTRPpeUxrTEb68gwvBOhv6wwKEMavccINFF5a1bD7QOxk+vcpdYE3LpjYQwOjCadJzMJn2nyWUGA0gYoxRR46PpxdPR9ACbNhH6O6g5rr88wuzKVnRnqMJWUATG4o2bce6ra3DLhoHA5bykGuCqMnBAzEf2MA4HBujYB2lWDDBm1MR3kw/cFWfFco/J7Dl2z1KeMXakVV9If1C7tYPYxAGs5N8Oe2/QCebNVDar9rft/plYajdSDYetiOLQ+WitTdRNjYHMR14GvHNWkNfhxbVj9D0JecSP4st1Y/luFNgEeAO3LZ7uqPqyiEBCFgITBuqmeizAojxSFCbpc1s7Ln3MeRDIPKYrNkVKgwM+REkSYswT0Dc8b7AzrnrDeTKnW7KQGB0hDug9ae8jFLjNqd1NEiFSQJmpFvvHrKMXRSQA6Hn+TYw+uICiD9pmUDRuljpphK2dpMfr0jmJph70kTZHwWRKFqRbIUDUcgVufU89KB5UeCDRzMDvYafAkcWUzkwFA8fkzNdQ62y7Tt8QHyQ/eX8MUPIfqE02859vAQ0TAqG8Sdw0n61szT82OlWEE1Ymew4h9PPz3OeKA5XOI073FMfcrkNfzJd+YuURrcl6DztUk85AGn8d43lQTeYn7jOuIE8H52ioSl3h2RHbbpTBFNVI+qrWqkFFXJreeAB9pCD60AIfPdsrJzDUKLf9I5OzWEqJy74eyNNVKVFXISUL4DaNK6k644uBRk+wc2uDbSs6z2fzB+3UYgXoQokW1asR6JlGTXH8k72qqZ4BxQKyQ76VM105+YgDDHDqOwqyUwpatxoOy50lhn0nRBOddGHXvoQIBty5+NKqEUpKkAsmyCd/FcpEfml1IMCJS1XGWUn0IHcdBZGxrpGZqBESaBmzSKRxHe9OtVyY47YYi1eYKtNa6rjAYoAkKdfhJs7C1MuAHDowc9lalodOV8W8Emq1usSFTkaF1LTjSaBblqTZHaljbauiO44p3NCr4nyarHaeyPCroqzg6wxCygDSqybocBhVmpoHEB9bbJ1LBVTWD1nw+kRM3ykHTjNdWOVTqQyIjUjIxAZYjwV2V5YbyfVsBliqDjvCrfnQpaFQnyFrO4nCkQE15lmvXVwtKqB7xkq9sDffPACsVbOvdj1RdCzcGtcqeFr5LdbUOzbXi8EiD9agRxDmcZQ5DhE2fv4n7se6/SvXnksKABiI4SXA5KYAwzgY0/MgauJmzTSgfbKfrQ4glmPVlUBvRNQm4mjpKxKvLQztVpjFA/cZnUJ6y/k5tfB3Qj/n39UE8eCrybtVm2hz0xmMh9v5gbDgnZnBEPf6ZTGq8p31uk8LCMx6nGffv2vbdpEJgkXM1CUdmlH7ItOtRrcGowGP96u4D0VLmhqOapIQ0ieEet5fGTe8dRBCM9mJ4Bjt+nMOkbdSzo6uD99lkXS3T2eVxQmltcu6kz6dOIu9/b27dH1fJwoAAqP57xFR1H9UEJKvEoU425r7vr8Vxj+rInZTjt17lmUHCd4Ovf3p/PI2cx7Bt3n7es5DNSwRm1IVOutCTHrj9/Wec8RhUgx28Bv3kyMEPbhaHTFMZtFGs7HEQ4mhHPrr0NYoEtuZBfOuGLk3fHrg/INFByESjXbnMA1v3TGsL9KZB7YYZj/+Of9a7Fj+J0Z3szEyH2Kz1PtqQ+bTXsF52edp7mP2+eYB9jU4OAxO+ho2OGTyqEQ6DFlBNWXobbUNHBTU8k0Luf+dzNu18sOkSremu0UyDsAyqf+7vgVJrWaiBJYN1dMjTIy/T3+8sD3W0ARrX5jldhrg/DuB0wQxNlCn+qPZibFMmnnxtpzUU+5N4t1YHPkjSfrQTWr/7WrPq6DqJfQ0jyU4a0M/qjNaCENXP13qUfEc9z2nLJM3fo4nuaZQu0iB/Mcuw1Pbv/SjP5LCKyCDkatgA0mlKj9MiqNMG5sOenxm3WWaFQNeWVa9fILPW1rQf9kb7YV//er33tEjAuMnka7muYaW5YQZw2r08dOLwhAhN431Aa1rf9ecw/Gj2/qz7fNJS0ixrNhjFoHWzPZPc87DEY7y8xdrtapw7tD8z/mmfRf/3pnuf8Y598HX+qM7JLGNmJivHDB8xMSjwHjhGYgLUZD3t+iCbYUZFjmuBsH94D3z0QZ7koE87tnxWgzZdZjEZ2jGQDDfy2fS3Sa+XY5wVjlxLwDts5sY0Ae96O/OBRqFlNTmMvphmzab92R9VFjiYVDhJqy+m5twNLwGv1blOp6+zHijP6PuY7OcmJX6Ofy/GepYX1+MZrcdeHk96HV+un5RHOAl6vvZ1GTZcedz554mSvmGB3aRNOpMj6NPbZuaAwIzT4hhtmMZ/8H8neHs6ozH6d9cDHVlrp8Z6HPi1OLtJn/OPIpCY1thPur5rkfcel+lMu76D1mwWPY71yqjX2oU27R6Y9HlN89k/Kqc7CdG4/+cmd5DT2vn/bnZ78LOnqdd2mnM+zcDcaZCDte6PdgCwHnt1EuR6LTZ6llld4/6YSYOMtcCw+yPwGBdRljNPZhiUN/hzh5Nmp3u/2TO7wQ5v1vUdzw2apCw0bujdWqP06VSJR60rr6vhKb/X11U0+XqM/hma6GfX2j249oCZWk60XVsfjyjub7sx+P3GIbM/WqRr0AymQcjvqBLIpIH0tLaRm61Ps50rms4ujdoz4zpaZhH4HCfRv/bnTRPbpdk+azKO4rgS+yhycv17s/ratZZYzXpnZNMYqZnn50z08zTTgg2/j/VDRmb5/aGS62MO5yzIyP4q/81KGF5LgLE/EbFh9zT5BONRjmT/3ses3S3rgXyt17n574Tu7u9AZtY9P81enLaD8/+FtV4vIvew0tNa1NNnVS+e5b5mGeY4yXuNkypYf6Ci9Vzc8r6ZA5DRH9C+kdmmYo7fKIORl0mc/7AIfrLIef0zrP2Zgc6KcMyCyE1bYpl2j01qwNejJLUe4nv7Q+theGlpffbvpIqe4wMlv186qMZxvwbZiWEQ/HqVLqclOs7ipMbZz0HE6En2x6C9VSfJrtVZzjIHp/l7gy9EKV0b5zHJxY7WCZv1+U37uZOf12nvh8dwuaYLHsaViAfpVI2ardZ+X55hFmADgdnfTOtJEIxJDNnaDd1/rz+T8B5+mNnMeiJs42DHUdH8WrLK/fH8/7u2J7fJdMOex6zOeRo17bWs3+TtltPbqWna0PcXYrIWCP2HhTCN5iZM3y67Vp+ylqF/67lf18Lb+1F2+U2LTI3qsJzlfE5i80fZrUmoCfHnzbBFX29i6aABa2s7sMNr2Gup+63FGK1HRr1+Tma4Eutar21/GtWR06fXgNT8KIOO0ZkQreuaTeu0J3Xss68lTXiOZ3uW4/Uoxr2vH4rkTGt/1lOzZr1FJIfZjWmQ31EJyP4YVzBoH7WR/TqCMtqeju8uG4ZUrU3UUA1cu0lKuMPV1CcTymvq5IxXCV6L+OK4GYiTco7GTqFuIzDrmVGNmuszKRloPQ/BrCTB/a0Auh6fNS1PY9rzt17o0DgDOUmg9KMMRNYriB1eXlhflG49+UX/r/3Z33X3HyZK8qPQrxpnl6cZeLk/pAHaM5CmTQb3F2l8FMqwlkB00gS3PXF92uf9w9hnawFERv2umUUoZ5qfGafDMnngMgyi++/psNby2Wv7TJ4KsZoW4ZiGTLyehnRW5Gq9S6Szdp0NPxujje0gtn/7WmZpT1y/5zUbsjTLvtlfgUK8j8kC/dlQwEna5Nvf259IZxU4rE3TimjwmqwXn26te2P296ZydMGsY17GId8ScKzVrnLtekcFg4MQqdFjGX4453GSMT5jApj9RYSc1oDOtunXzjIfVn9bb9XAcfe5v4Kl/aUzM0swu/4jG364We4PK6AdOwyPfjjDUffH+66XltGgNs/+szzd+087wHbSYZtrnTmzv23BfwfV2XFBR3yea+Xt7Y+9OsqHzFqW+2Gs86xzjaaVXZnmPEw6DQCokXh/2MjDpAf6RzUKYPLPHBy5jm2Z5aAgSrM96EllyPe3qNn+cKTrqW2yXvNmhv1s/7TbwfuiPGfcMnY0+/r+sAjG48Yo/Pf8MzzBWSuhd382O+wP5zZNKXKUMu2PMqBZ68iM9Zg2PZ1NanJ2Jr23SedHDQ7uqG/f/6hI5MOCkGG8ulk/x0yqFDrtHx9+X0ejTZMv0ODPi6Pum3XQ9ehcGi8vPW6DN9vGJuvm82vS4CCexbSM0ZRovaEHg6D7rntk9uZJfoYVQH6qQHBcS916ERhlJfTQ+1lfZzU8+GSWhxjPxvCzWL+ecYGeQjVlnMdq7/SXaCOmrRprU7VDT+EIFFXTgPeDkRzWMjxJZ1vc634iYUnusztrC1Dk/apJy6MQpPUOFpvPey1DJYePVOFyH453kKrcXw3HH85F23eM4kcM5+LQOnDXmt9XkPEg5XVO1Tnlp0YrpnfyPJZfV9+HwxLwtSTIg+dXqdpnD7cDw8rjcb1VmDyu4D3gPUgRSIUPZCUIgZcpusQMRQoKBGJVpZ31TeI9VHDmnhggDUb4HSIo6PI9lTFwzqIxjyf8u3eAVkmfjDMRwXuGVgngARX+V960ZyhQ7auHJgl6mD08hetq/XFMcEzwJLdVZsrwIPjG51cLzyBm6PJhEJRS5c9qreC9qzY7GblvMlBKhXtxUFrBgQGtYNmDFcF6wEPVhqgJbKogz4GY5b9Bcp9hvatXfDyxhqvgPUNpA++qa2EvKJAnQCkFb608f+/A3oGUDm+kwEqDlYYnBcfVOqjKU4GgZb+Qls9gAkFDkQI8l9fO7OG9g6d4XxTuJ+xDyO8TAUrJPbKTjWvzok/bwhODFeDj74LAzofPC+uvEngvz1KejS+vsb4GcWq07HW5/7hWcZ80nRCXA++cZSiVQJGS+/QWihjehWAA8XodPDkwXONQEisQK1nTeJbi2YQH2Ml7ag1beJBOwvui3PfsfLj2cHYpfq78t7yqPRWRQAAgxXC+gDIazrny+UXjTYpDQMPBAFcGkJnhwCDF5fOGVrDOlftRKVl3T4ADg0nDQ02UBTK3P5PL64gvh8pulcecPIgBbx2I5TywkrPO3gLeyX5Scn6dc2E/yp6ML7BDW89CayPrGkBUdh4KBFfY8AxQntX43+wcFJHYFefExhBKW8Dsy3WK+wFebCex2Li+gFLL/iWjy7V2TPBQ8ornI9qG8vtUJpntYLnitXDDYatwv7LfRIMFLGvmLENRCushO1sZcaDkoYhBLL/DzgdzbeVZwMBDgVGAUYQ1k3tW4Tyr8PkRvRzk2MKKNwNUz3BO7IJ3cQ86lC5My5l3zkLp+G8EMhpyQrmhV8LRprADlBI7E/yEUoBSgHNyrh0YrKh8n7rfUFS96j5U9qI8m8p3yM8RfDj/FPZN9HsAcfQFst4u/E/soiv9h6bmvpbn0rwe712whWJ/o+/3NpwNVZs9xgpMuvRZrAiWPVRiYMOZZEXgYDuivRHbK88D5AHy0FqXNrqyibVXXOfaesjfSSKZIs8BZiitK6etZNGttfDOykNjhjLBCbYzHa4u1HpUTjhsOKXFIHproZRqLkZ8YOGmiAjGGGitYa0VgwwN7xyINEhr2WhOjFB8r/Z7jmJml/+mhg+o0lqX7xfvJ167c64sBflgXPKiC+tyJEkCgOGcE4NEVD4gUgpaaxTOlp+ZZln53lprFEURrklVpYY6WkAYC40yc3BGDFd4GGNgW2sff0YpLc9FaxAxXNGDTrTkqNFoEECkwaQR903p/MLBjZQAIpb7jfdsDCisX31NnXPgsD5Ko1yv+G/WWvl9rZGmaQgQdd+k3DpSVBoDisZO7lkb2UtJYsSwKgVHct3W2nD9CkWew9o8rAU1Xu0/StUCKma5F6WgtayP1gmUSsFeAnCCLl9K6/L3ozXyXg40hzVQRMHoB8PvHEyiUNgeHMlaFa4AaQXSCs47OPZQGuXaNV9AncAn1yBOM0kNvLVI0hTamOi+RyOt4TqJXTgPshayzkn53xJEVD+vlBqLztSf5dDsunYmPIU7a2VySZKUwarzHIJdeV7eutoZEC/kvZdrDtcaz55n27A1WmtAUc1uyWdFexd/P+4rbYzYL2horeE8wHDQhmCLorE28fxGO1O3QWWQQ4JwMTOKIgfAMMaE+64cgve2/DnFkN3HGnoCNC06ljoC4L04HFcUUFrDs22cSa0SOOeC4waKoij3mtZGbLtOobWprSWBlAcpOeuOPby3cGFfMXtAia1RuuZzwvOP6yOBWZXtG52iiIEqM8hUZ9pZ+Z0ky2CLokxiiqJAkiTQ4fxXfiUm6wS2FgTAOnkPWxQobFGuvw7XFE97f0DOQwcjtv8en7VSCuxcWBvf2F8Vaq6afysTZl/5n3im4l5y8hli31W171l8P9jDpB0UzoLZwxixGc4X5TmPCZkhgstzJJTI+XZyRXV0NCYknm0ZXEa/BEQ/2RrhExItH5xO6Xvs0l5oo8HelxFn/RBp4jgmFkXukCSpRLNaw1kbok8VsgjIgVYGeSHfN94B7OBZQZkUztrgPGLmhoZRiEatmqMiBzgeJEWmenghgiYiwMn3TKIGqodG9EWHBxyhqCaHgfs4Cj68jw2wX9ygbOWBaZXAsw0GUJwwM0u2xArKJLB5XjpeqPCAVLhvKLCTQ26MEYMQjKnzhWQEDaY6VRwauAHci8nri0SCLpASQx6zcoarnq8ykhGwApEugxMFX2ZocW1kH1T7h4jgCwutVekkjEkAEoOttQ7rXTkH5iQElQWcc0hUBugEvZUlZFkGKMA5XwW2KnyWU42SUCT7EamwhgGNcwV0ksDlvsy+AYYv5PM1KQm0lILLJTCoGwZVz34gWa04hoASOkAnCsxFQG9SkE7gOQezK42Z97KOREWJHkVHWT4XEjSBCCANOGthHSPLMhS+ALM4LNl7pjS01tpgfBUQMt4SaanXo8NdWEhQl+e5PB9W4foIxIX8ZCwHsmpB/WKYfAgENcs5texBpuYkQ+Cgk3B+nJeATqsp6+At6BkSEMQ9qjkUhihcswW0MeKsjIZTHuwsUs9g66DSDEw1CNvXRAJ1cGadDNbaEDDIfosJRgwwKkdXcQpVLRgyJikdo3MOSZqiF4KOJBGEUCkFtj7YFbHJ0ZnoNAW8h3VWbFA4Q2UAYMRuALJ3tE7A7MAQewtHYAoIer1ITIPbk9uaILKGtkTcTJLA2aJMOhQZOABGpxK02B6Uotp+55qN8AFt0mCvwSigjYXzFrYgJCYLdt9CG4JSgC1Q2XfnywDSsZwdYkkY4nk2LPcry6mQGA2wReEtmIAkIJiF7ZW+Jcky5MsrSNMUed4Te6yiQ6cSoYvPikh8iE4SuBCklYmRczAmK/1EuZ7UTDrbWz6iLyoGOPCNANm5qntMBRSo4tPV7VHcg5IMs/NIsww+ViS8JLTeUY3SICCBZV+CF0aJH9CmA7AFw8KGAFZwr7BHWexOYgQFdU58pfcWSldxhbMSFCPYPXBSJkoScihJfln8ULOUzfDULHmRX1mqlU6qRWbnoTVVGXswgs55mCxDsSoog3cFlFYAJFsmLWUGkBiqBDbwNXQoK7lw6ORgkzGNOqMEGNw6RPIALXvAClyqtUavyKGpQhMMySKS4oGlBtkYVY01ogieZMNEQ9skWAoMWI/aSYXs3/lQOlCSRdkiGJMK7ozlg5h9xUMWo+JEaTjL0GlSOnnyXP285r4acXRwZeA1gMdRBm4xW3IubChfHlYXDKC1FomW52W9BGLynhHSUyCYEnmJpRZxWlxmV4UtQAwYk5QGX9ZJkAK5J18Ga9GRaS3BGhRBIZNMnkJm2vPQOgGV9aBgAFjQk/J6XM0ohMPnQomjzFZJggaB702ZIUZDyxzKMEqCGO9cPFVlAKNbZcgID2sERMtLEOu5EKjeJcHYMQDfzMbg4LmAyTLAMmwtiHQuBEqe4VzY01qegyeUP1c4izRNwczI8xydNGugWIkyLQaEbiIWYR8qLWdMkCIPZoLWkhhUpSNuBNLMDBP2D9cMJwCYLEOe98qylQlpcxmkeQkCtDZTcgha7eWKQxlwcABDPpSZSWBtNgpsC6QsyZYtLKCozLZtbqGMrjg8ISOP/06eG1l5HgIKIgJbFyD7QaRMgjEZet0uOKyFMRXaXJY4axyQOiodUQyTJiVaFB2plBVjkmQk0cyygHQzAFc6mTrHxMNLgE/9jrQdwJTKp0kqyW5IKi072SeIgbNpDPH0IZEjDkmoq8p7kTpAipEX+6C1htHz6AXkMO2ksLYLZkaiO7KvCwujqQwkoChQFRQYSuylAoxsNDiSxIudLTNVpaTk7YJvi8lTURRIwrNRaQLX69UQfl2iicYYKGjktgcyGt1eD1mWwTuLRMn9wHNw6FkrgGlyzNrBYz2AEU6hhTZGkGwCvENAkWS9TUhy4vmr/FyTM2fCyIXC2UbADDZlUlpwAaPT0kdoU+tQcoJskfJg8tBkSmRQaw0KCYrSAByBVBI+nFEUPSgdAipK4MFg2PLvsYphXV76qjqIEm1VPeorqdnFyr4yArURqtQKhhQ8y0HJ8xyJNlBKl39PVRoQkcrAxgzLegC6A3iLlFyoiSdlWUlpgMMm9bW2OKUAZhLIMwYMzkFrObRQkiHZUEZSiQH5CtZMjUSbSimkRpW1+QbkX6uxNaAobpJUI8ODSGrGzjkhtZKG97a2KUhKLk4QqCTW0olLpCSWaKR8ZKQ2ylWAIFk0lwiPK8IBTlPA22bNt8ygVFlWaGSvLeJsDO5KiFxT6ewyk5ROG2RKRILhwGwBLwdcapAJoKR+iVg+ogBLhvV3iAa4KufJJuXSQBtSpWOOjsF7B53KOrlCgYyGQtzEAsJ6lnUwWQaX5/BQMIkqP59YNZ1aRBcKXzokwJclKx14MUqL+dBK9ppRATa3wUkw9ZNba+ULy1XmwszQJPCoo0LQQqfBpKCND8FTMA6xzOWV8AYci0PzEbFCjbejQQR0iwJaZWHvyLlJQ2YPSKCqAq+iXmqIzphJNjzVYHbFgE4y9FZ7SNO0gquNQt7tSuBRwvRVOTHGzN6KY3IK6PV66OgklME0WAtnTcGH88VS3lIq1LE1vOcZSJBc8cP6AhhfZqNx/xS9HrTJUMDDkVj1zHvZqakWPh5X512Ccd8gV8s+tTBpit7KCrKsA2sLCXS9BOWdLEMRAonUiJ0k6MBV0eiu5kjTjjjaYOe0IRSFrH3kmsj+4BLZLu1QPRnR1bPKfQ5jdFnKjjalKAqkhsRO+JiIVA6WSUj3g9Y/rnFMpLyX98ydLf2FD+VSDhwQsaPhfgMfxOg58RdG9lGRO2SdDnzRC9w7KQ+RkbNZOFXaSGZXBVZOghYdODWaFPK8C52kAAkCA9LwmoPNkTObu1DWswWUMZJyMAuvjiIibktfBhd4SeH8x+DRg6G1Qd6zwjcqBGF0VJU5FTy0Eh8TKxMxIY7+hCPqGwKYiPwPC2Ccc2WyGblXedivxhiwK4Y0eVTJf7TF3ostZBWCcpXAe4BZytKybpJQSOAWz5CBKwQFZnZgxfCFhyqTIznfEvsJskkwAVmW0p/WGiu9HhIzB2aC41yCpsC5SZRGYXNkSRpsjGsEMKpme1lRBUTY1SWQEm5Ems0BKkZSGkWvyi5c0RMnVVgkqQYXXDkK7wVG83ngK6TIHWFubg7oLgvpSSdwXJFhdbj4yHUpigLOVXXzeECU0oIcsAQP8v5JGfEbI9lyDIiUVuitrEAjZMLUbqLxfRlOZLv3BzABglRCTo0lHnDFbTFKg5TCyvJyuBaGy3NkWQYXyhJieAygCLn1SDsZPBR0Ylr1VVmqyCNha0GhvOK9bPboKGPc3qeU2aoJMzMse6RZB0XeK4MKiXIZRgFsAVIJVno5OnMLcL6ASRhFr1s6H6WMZO+1QAeKwExQoe4PIhS57IE0y+CLIvAwHIySICRCm9FAOOeEOOpzQBkYPReLm3B5HoiCEvSSUsINUcKncd6VXBsFCSYBgT9jsKiUKUueRdGV/ZYkcLmDThIw58jzrjgzRRWiFZE40n0BTH3NvapKPt57QQFhobWgWWmyAEChsCtwrkBqEihDgGU4Jmg9B/bBmMKj6O1Dkhh0u73A3ZBzIhlRCq0yEBmoEHBZa9HpdAJSGoh5BBS9lQDzBqOiVLlfPKEsB8JZAAomnavuqXAACWGQLTcQoxjEIATckRxpiZCmKYpejkRJchGDFW8LqYUrhYIlwTC1DJFptjbWSHotux49QXMMPCQ5Iuuh0wTdnoVJE/iIfthc+AS+gE4MtIqooSQsJk3QKxw6c3PCbygKpEacgNGCQDqWQA1aAc6WPEBmD+KqxLy6uorO/AYpQIbzEpEIhiCQigEbSjIKBGtzaBLORtHtljZSa0GSNAikEyidlc+mKHrIsrmKW8ZODnfgKMWESsoSPrqevj1dfw7WWmSdDmwhvsATkOeSKWtjQCZBUfRQ2C4yk4QSlfDPFGmwTySpLVbhvUWiU/R6PWSJDpwoh6IokM11kDsH5xU684tw7IWHpoQfMZ/OwVsH2+sKJu4t0tTINiQtJN4QwLAiKLDQjpMOvAcUCwm2LCdb4WS6GIgxQymAAs8jIrExIRan7kE6CyWQwOckFRABX9rKvLuETifYf1VLPBWVDRYRRVAtHmk7gCkBhCQRNJmqYKgoCkGjeIB2TlnVUM2uUiL0bIG5+cWSrJ8YDe+LUPqTIFlr8WvOWmidSHRCEFulal+D37KFA7GDtWJL2VOJVvtgowWVSUHaSPIJD2MUer0ekkSHUmEBowjd7go0VeUjFfcoN3l55Hpd5M6i01mALRyuvPJqPv/883HvffchSVIcfvij8MynPw1nnX0mJYlG0VuFMQreFdWmD8hNGYmmHfzX187nB+67Fz//uleTIgUHBdKxhGGRmgTbtm0769Of/rcLn/u8F+CYYx5HzhdlZwCRoD3KpPiXf/5nvva665B0MmidwCSp1DWTBMwWWgFGAYcffjh+8hWvpCxLykPcLq+Q9wFRCHFv699jaSZCfT5cd2Iy3HP/ff/3vPPOe+2VV16JlZUVzM/P4xknPQ3Pe/65ex/7uMdtyrsrcM4hTaT275yVhxAjb2bknpF25nHl1dfwhRddAp100O0V0gECwkJnDs4XWFlawrnPPRunn3oKsSsqBnxAWBSHa2vp+MQDU5aYjBEzaR0+8cl/5r179+Itb3kLGWPA3sLbnkCjTgOUgEyCf/mXf+FDDtqC5z/vbHJFV8p0IZNkaHhFcn61ATjFju27D/v617/+wIUXno+9e/eiM5fhuOOOw/Of/1wcf/zxxOzgrYUmwNsczjl00hTeMzwkwEoSA5Ok+Pd/+xLv2rULr3/Dq4hCO2ZZlvEeJpvHDddfx1/72tfxuje84QUHH7L1a9ZaaOgGKiVZaIqbv3crf+TvPwatNZIkQZolyPMcG+Y24vHHHI1zzz2LNm3eAFfkYDhkgVNSBkHQjdJdnUsCInjly/WuGxGTEHbt3oNPf+pz/JyzzsYTn/g48mxDCYJBrKBNCmuBD33ow3z00UfjRS95AXWX98IkqiLIhtoyAHTmF/D5z/0nf/PKqyU5CAEWE5CaRPxo0cVLXvxCPO2kE6m3uio1aYijrTodBCVDyHJVmuB7N97G//7vn8fb3vartHHTPKzrCdeJa5wxZil7eQc4LrkWO/fuO/iDf/e/H961axeMltKqSgw2b96M4447Fs961rPefcShh/2hdTkcCzrheitIjAF7biCh0ymn1kvEITHy1XtJACNlW9IpHCl86KN/z5s3b8arX/lyIleU+8oFdJiMEUQHhMu/eSV/+zs34K1vfStlWQZvi9Dd5qGMAjywc+8+/N3f/R2fdcbpOP30U0nIuILk2VzS1rTTwb33PvCtj370YyczFBwIRidQJoEig16vgHdFKNnn+PEXvwCnnnEaud6y2JBQvvLewpgUK91VdNIMIIN77t3x5a9+7esvvOzyS7Fnzx5s3LgRJ5xwAl7yohfiCU88htgWUn6MyFTgzTHsQPL7sDZ3VpXTTNMU3V6BT3ziE3zcU0/EKaecQnlvWdK+0KVojIFOMnznO7fweeedh1e88iVLRx/16A0+lGSIAdvLS7QwLzzIZFBJB7fefgefd95Xcf0N12PHtu1yT09+Cl76kpfgCY8/mop8BWmqhWdjAiFeSXOB1xQ4egwmhU9/9gv86Ec/Bqef+iyCtyUBFk5QAdIJLrjgAv7mZZfjV3/tl2nzhnk4K89DOmg18kLK253OHG75wR38iX/+F/iAiCmdYnV1FZs2LOLxxzwOL33xS2hxIasC0FqjA1HJaKlVBMbLCsSSrVQ4MnzxP/+L77//frzxjW8ko1mSct9qXGm9n/Mejr1w3LTCajfHP37i//JJJz4dz3z6SQT4UNYP1xa6NSnY1Ssuv5Kv+NY3kaZJSbItigImyeDZore6ipe/7KU44cTjqLe8JAllKF0yB0GOZA6f/szn+PpvfxedTiqIDSt0Oh0pVzmHJCW86md/+guPOuzQlztbhGc5RC6NFVTuLDrZPO64/c77f+M33s6/+iu/hltu/j42bdqK+flF/OD7t+GP/vg9eN1r38g33ngTZ/PzWF1dLclozAyVJMJlUQL8syJce831+I8v/SeKQLb1YLiSea0BbfDItl0Xfu7zX8Q999wrpRkn5EaBppSUVbzHyuoqtm3bhoceegQ7d+3GLd+/FZdcegVu+f6t2LdvH3bv3o2HHnoI99xzT4DKKu7HyC4kDK/7MkuGTNqgcA6f+JdP8ute97rXfvzjH0eSJDjqqKMwNzeHr371q3jD69+08eMf/Th7KKRpB3nhAtok913WJ2NDoNa486578B9f+k88/PA27NixA7t37sH27dtx//33Y9u2bdi1axdWVlYa18+tjou+4KyNxigJooqigMpSHHHEkfj4x/8RX/v6Rax1B4WtsduZoNMMn/v8F/k9f/bnSLK5su0dnssov17OImhcdPE3+Gdf9doH3vvev0CvV+Coox6LDYsbccEFF+AXfuGteO9738vbt+98mdEpeoWFMmmJwvmAppgkQy8vAJPg29/+Dv7rq1+D94DJOnBeMgdbeDjvAQLuvf9B/OeXv4rl5eWvVjCmaj1HafF74KGH8ZWvnYcHH9qOe+9/AD/4/q34/i0/wLXXXo+//uD/wi/+4i/z9266hdNsIew/uS4fDNzQtSVqGKD6OgbXin37lq/8zL9+DnfecReIEmnHtgTAwHvZp6t5D1+/4ALccOONAKHiU9S6rEwqdWPrPS674gpceumleOSRR3DfA/fjvgfux91334nb77gVd9xxG2677TZs375dAkYtAYogA83W7dg9I4YK+OQnP4XPfvbfcNllV/DgDiA1VOtlz9LyzV/92tdx480/wLbtu7Bjzx5s274D37nxu/jgX/8tfu61r3/X//nIh7lwDKUTrPYKmLQDG3kJE2qQtDvChqnglnQprpVQvZAGL7joUlx93fXQSYrCOXiHskynlELes/BgmLSDW2+/De//qw/i4//wT0JBC05SmQTsGFAKReGe+oUvfgkPPvgwoAVZ0VBwuS95XtKtg3t37NqOBx54ADt2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">'; else pt.textContent=route==='pendencias'?'Tarefas':route==='dia-ideal'?'Meu Dia Ideal':pt.textContent; }
    if(route==='meu-dia'){ document.getElementById('app').innerHTML=renderHome();bindHome();return; }
    if(route==='pendencias'){ document.getElementById('app').innerHTML=renderTasks();bindTasks();return; }
    if(route==='rituais'){ document.getElementById('app').innerHTML=renderRituals();bindRituals();return; }
    if(route.startsWith('ritual-')){ const rid=route.slice(7); document.getElementById('app').innerHTML=renderRitualDetail(rid);bindRitualDetail(rid);return; }
    if(route==='dia-ideal'){ document.getElementById('app').innerHTML=renderIdeal();bindIdeal();return; }
    if(typeof originalRender==='function') originalRender(); nav();
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
