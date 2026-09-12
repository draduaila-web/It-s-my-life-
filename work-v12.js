
(function(){
  const APP = () => document.querySelector('#app');
  const TODAY = () => {
    const d = new Date();
    const local = new Date(d.getTime() - d.getTimezoneOffset()*60000);
    return local.toISOString().slice(0,10);
  };
  const uid = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const esc = (s='') => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const read = (key) => { try { return JSON.parse(localStorage.getItem(key)||'[]'); } catch { return []; } };
  const save = (key,items) => localStorage.setItem(key, JSON.stringify(items));

  const KEYS = {
    crefito:'minha-vida.trabalho.crefito.v1',
    bec:'minha-vida.trabalho.bec.v1',
    tiktok:'minha-vida.trabalho.tiktok.v1'
  };

  const WORK = {
    crefito:{
      name:'CREFITO-11', icon:'🏛️', tag:'TRABALHO OFICIAL · 08:00–14:00',
      desc:'Demandas, projetos, reuniões e acompanhamentos do trabalho oficial.',
      key:KEYS.crefito,
      groups:[
        ['Demandas',['Nova demanda','Acompanhar demanda']],
        ['Projetos',['Novo projeto','Próximo passo']],
        ['Reuniões',['Preparar reunião','Participar de reunião','Registrar encaminhamentos']],
        ['Documentos & processos',['SEI / documento','Conferir processo','Despacho / resposta']],
        ['Acompanhamentos',['Cobrar retorno','Verificar andamento','Outro']]
      ]
    },
    bec:{
      name:'BEC', icon:'✦', tag:'EMPRESA',
      desc:'Empresa, campanhas, conteúdo, operação e desenvolvimento.',
      key:KEYS.bec,
      groups:[
        ['Matrizia',['Nova campanha','Acompanhar matches','Acompanhar campanha','Verificar resultados','Outro']],
        ['Instagram',['Novo post','Novo story','Novo Reels','Impulsionar','Outro']],
        ['Bling',['Nova tarefa']],
        ['Desenvolvimento de produtos',['Nova tarefa']],
        ['Novo projeto',['Nova tarefa']]
      ]
    },
    tiktok:{
      name:'TikTok', icon:'🎬', tag:'CONTEÚDO',
      desc:'Ideias, produção, publicação, comunidade e análise.',
      key:KEYS.tiktok,
      groups:[
        ['Ideias',['Definir ideia']],
        ['Produção',['Roteirizar','Gravar','Editar']],
        ['Publicação',['Publicar','Reaproveitar conteúdo']],
        ['Comunidade',['Responder / comunidade']],
        ['Análise',['Analisar resultado','Planejar próxima semana']],
        ['Outra tarefa',['Outra tarefa']]
      ]
    }
  };

  function injectStyles(){
    if(document.getElementById('work-v12-styles')) return;
    const s=document.createElement('style');
    s.id='work-v12-styles';
    s.textContent=`
      .work12-hero{margin-bottom:24px}
      .work12-fronts{display:grid;gap:14px}
      .work12-front{width:100%;border:1px solid rgba(92,72,104,.11);background:#fffdfb;border-radius:28px;padding:20px;display:grid;grid-template-columns:60px 1fr 26px;gap:14px;align-items:center;text-align:left;color:#40384a;box-shadow:0 8px 24px rgba(76,58,82,.045);cursor:pointer;font:inherit}
      .work12-front:active{transform:scale(.988)}
      .work12-icon{width:58px;height:58px;border-radius:19px;display:flex;align-items:center;justify-content:center;font-size:28px}
      .work12-front:nth-child(1) .work12-icon{background:#e7f0f5}
      .work12-front:nth-child(2) .work12-icon{background:#edf3e8;color:#6b765a}
      .work12-front:nth-child(3) .work12-icon{background:#f4e8ef}
      .work12-front strong{display:block;font-size:21px;margin-bottom:4px}
      .work12-front small{display:block;color:#817783;font-size:15px;line-height:1.3}
      .work12-arrow{font-size:25px;color:#9b82aa}
      .work12-note{margin-top:18px;padding:18px 20px!important}
      .work12-note p{margin:7px 0 0;color:#817783}
      .work12-back{border:0;background:#f0e6f6;color:#715486;border-radius:999px;padding:10px 14px;font-weight:800}
      .work12-subhead{display:flex;align-items:center;gap:12px;margin:0 0 18px}
      .work12-subhero{display:flex;gap:14px;align-items:center;margin:0 0 20px}
      .work12-subhero .work12-icon{flex:0 0 58px}
      .work12-subhero h2{margin:0;font-size:29px}
      .work12-subhero p{margin:5px 0 0;color:#817783}
      .work12-summary{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px}
      .work12-stat{padding:15px;border-radius:20px;background:linear-gradient(135deg,#f7f0e8,#f1edf7);border:1px solid rgba(92,72,104,.08)}
      .work12-stat b{font-size:24px;display:block}
      .work12-stat span{font-size:12px;color:#817783}
      .work12-actions{display:grid;gap:13px}
      .work12-group{padding:18px!important;border:1px solid rgba(92,72,104,.10)}
      .work12-group h3{margin:0 0 5px;font-size:20px}
      .work12-group p{margin:0 0 12px;color:#817783;font-size:14px}
      .work12-chips{display:flex;flex-wrap:wrap;gap:8px}
      .work12-chip{border:1px solid #e3d9e6;background:#fffdfb;color:#685970;border-radius:999px;padding:9px 12px;font-size:13px;font-weight:750;cursor:pointer}
      .work12-chip:active{transform:scale(.98)}
      .work12-section{margin-top:24px}
      .work12-section-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
      .work12-section-head h3{margin:0}
      .work12-add{border:0;background:#eadcf4;color:#6d4d82;border-radius:999px;padding:9px 13px;font-weight:800}
      .work12-list{display:grid;gap:10px}
      .work12-task{padding:16px 17px!important;display:grid;grid-template-columns:1fr auto;gap:8px}
      .work12-task strong{display:block;font-size:17px}
      .work12-task small{display:block;color:#817783;margin-top:4px;line-height:1.35}
      .work12-badge{background:#f4ecf7;color:#705680;border-radius:999px;padding:6px 9px;font-size:11px;font-weight:800;height:max-content}
      .work12-empty{padding:18px;border:1px dashed rgba(92,72,104,.18);border-radius:20px;color:#817783;text-align:center}
      .work12-task-actions{display:flex;align-items:flex-start;gap:6px}
      .work12-edit{border:0;background:#f4eef2;border-radius:50%;width:34px;height:34px;color:#6d6270}
      .work12-rule{margin:20px 0;padding:16px 18px;border-radius:20px;background:linear-gradient(135deg,#f5edf7,#eef5f2);color:#6e6470}
      .work12-dialog{width:min(92vw,520px);max-width:520px;max-height:70vh;border:0;border-radius:24px;padding:0;background:#fffdfb;box-shadow:0 24px 70px rgba(55,42,60,.22)}
      .work12-dialog::backdrop{background:rgba(45,37,48,.34);backdrop-filter:blur(3px)}
      .work12-form{padding:14px 16px 12px;max-height:70vh;overflow:auto;box-sizing:border-box}
      .work12-form-head{display:flex;justify-content:space-between;align-items:flex-start;position:sticky;top:-14px;background:#fffdfb;z-index:3;padding:0 0 9px;margin-bottom:9px;border-bottom:1px solid #eee5e8}
      .work12-form-head h2{margin:2px 0 0;font-size:22px;line-height:1.05}
      .work12-form-head .eyebrow{font-size:10px}
      .work12-x{border:0;background:#fbf8f7;border-radius:50%;width:36px;height:36px;min-width:36px;color:#77558a;font-size:21px;line-height:1}
      .work12-form label{display:block;margin:0 0 7px;color:#756b77;font-weight:700;font-size:13px}
      .work12-form input,.work12-form select,.work12-form textarea{width:100%;box-sizing:border-box;margin-top:3px;border:1px solid #e5dce1;border-radius:13px;padding:8px 10px;background:#fff;color:#40384a;font:inherit;min-height:38px}
      .work12-form textarea{min-height:56px;resize:vertical}
      .work12-grid2{display:grid;grid-template-columns:1fr 1fr;gap:8px}
      .work12-more{margin:1px 0 6px;border:1px solid #eadfee;border-radius:14px;background:#faf6fb}
      .work12-more summary{cursor:pointer;list-style:none;padding:9px 11px;color:#705680;font-weight:800;font-size:13px}
      .work12-more summary::-webkit-details-marker{display:none}
      .work12-more summary::after{content:'⌄';float:right}
      .work12-more[open] summary::after{content:'⌃'}
      .work12-more-body{padding:0 9px 3px}
      .work12-form-actions{display:flex;gap:8px;justify-content:flex-end;position:sticky;bottom:-12px;background:linear-gradient(to bottom,rgba(255,253,251,0),#fffdfb 13px);padding:17px 0 1px;margin-top:-2px;z-index:3}
      .work12-secondary,.work12-primary{border:0;border-radius:999px;padding:9px 14px;font-weight:800;min-height:38px}
      .work12-secondary{background:#eee4f7;color:#674e7b}.work12-primary{background:#d98daf;color:white}
      @media(max-width:520px){.work12-dialog{width:92vw;max-height:68vh}.work12-form{max-height:68vh}.work12-form input,.work12-form select,.work12-form textarea{font-size:16px}}
    `;
    document.head.appendChild(s);
  }

  function normalizeTask(x, cfg){
    const title=x.title || x.name || 'Tarefa';
    const date=x.date || x.due || '';
    let duration=x.duration || (x.minutes ? `${x.minutes} min` : '30 min');
    if(duration==='60 min') duration='1h';
    if(duration==='90 min') duration='1h30';
    if(duration==='120 min') duration='2h';
    return {
      ...x,
      id:x.id || uid(),
      title,
      date,
      time:x.time || '',
      duration,
      frequency:x.frequency || x.freq || 'Única',
      priority:x.priority || 'Normal',
      status:x.status || (x.done ? 'Concluído':'A fazer'),
      note:x.note || '',
      area:x.area || x.kind || '',
      source:x.source || cfg.name
    };
  }

  function tasks(cfg){ return read(cfg.key).map(x=>normalizeTask(x,cfg)); }
  function persist(cfg,arr){ save(cfg.key,arr); }

  function renderHome(){
    injectStyles();
    const a=APP(); if(!a) return;
    a.innerHTML=`
      <section class="hero work12-hero">
        <div class="eyebrow">💼 TRABALHO</div>
        <h2>Trabalho</h2>
        <p>Organizar o que precisa ser feito e quanto tempo isso ocupa — sem virar CRM.</p>
      </section>
      <div class="section-title">MINHAS FRENTES</div>
      <section class="work12-fronts">
        <button type="button" class="work12-front" data-work12-go="crefito">
          <span class="work12-icon">🏛️</span><span><strong>CREFITO-11</strong><small>Trabalho oficial · 08:00–14:00</small></span><span class="work12-arrow">›</span>
        </button>
        <button type="button" class="work12-front" data-work12-go="bec">
          <span class="work12-icon">✦</span><span><strong>BEC</strong><small>Empresa, projetos e operações</small></span><span class="work12-arrow">›</span>
        </button>
        <button type="button" class="work12-front" data-work12-go="tiktok">
          <span class="work12-icon">🎬</span><span><strong>TikTok</strong><small>Conteúdo, produção e presença digital</small></span><span class="work12-arrow">›</span>
        </button>
      </section>
      <section class="card work12-note"><strong>Menos decisões · mais clareza</strong><p>Cada frente tem seu próprio espaço. Depois, as tarefas realmente importantes poderão alimentar o Meu Dia.</p></section>`;
    a.querySelectorAll('[data-work12-go]').forEach(b=>{
      b.onclick=()=>{ location.hash = '#trabalho-'+b.dataset.work12Go; };
    });
  }

  function groupDesc(name){
    const map={
      'Matrizia':'Campanhas, matches e resultados.',
      'Instagram':'Conteúdo e divulgação.',
      'Bling':'Operações e rotinas do sistema.',
      'Desenvolvimento de produtos':'Próximos passos de formulação, produção e lançamento.',
      'Novo projeto':'Ideias que já viraram ação.',
      'Ideias':'Guardar antes de decidir quando produzir.',
      'Produção':'Roteirizar, gravar e editar.',
      'Publicação':'Publicar e reaproveitar conteúdo.',
      'Comunidade':'Responder e manter presença.',
      'Análise':'Ver o que funcionou e definir a próxima ação.',
      'Outra tarefa':'Ações que não cabem nas opções acima.',
      'Demandas':'O que precisa ser resolvido no trabalho oficial.',
      'Projetos':'Entregas maiores com próximos passos claros.',
      'Reuniões':'Preparação, participação e encaminhamentos.',
      'Documentos & processos':'SEI, processos, respostas e documentos.',
      'Acompanhamentos':'Retornos e verificações que não podem se perder.'
    };
    return map[name] || '';
  }

  function taskCard(x,cfg){
    const when=[x.date ? new Date(x.date+'T12:00:00').toLocaleDateString('pt-BR'):'Sem data',x.time,x.duration,x.frequency,x.priority].filter(Boolean).join(' · ');
    return `<article class="card work12-task">
      <div><strong>${esc(x.title)}</strong><small>${esc(when)}</small>${x.area?`<small>${esc(x.area)}</small>`:''}${x.note?`<small>${esc(x.note)}</small>`:''}</div>
      <div class="work12-task-actions"><span class="work12-badge">${esc(x.status)}</span><button class="work12-edit" data-work12-edit="${esc(x.id)}" aria-label="Editar">✎</button></div>
    </article>`;
  }

  function renderWorkspace(kind){
    injectStyles();
    const cfg=WORK[kind], a=APP(); if(!cfg||!a) return;
    const all=tasks(cfg), open=all.filter(x=>x.status!=='Concluído');
    const totalMin=open.reduce((sum,x)=>{
      const v=String(x.duration||'30 min');
      const m=v==='1h'?60:v==='1h30'?90:v==='2h'?120:parseInt(v)||30;
      return sum+m;
    },0);
    a.innerHTML=`
      <div class="work12-subhead"><button class="work12-back" id="work12Back">← Trabalho</button><span class="eyebrow">${esc(cfg.tag)}</span></div>
      <section class="work12-subhero"><span class="work12-icon">${cfg.icon}</span><div><h2>${esc(cfg.name)}</h2><p>${esc(cfg.desc)}</p></div></section>
      <section class="work12-summary"><div class="work12-stat"><b>${open.length}</b><span>tarefas em aberto</span></div><div class="work12-stat"><b>${totalMin<60?totalMin+' min':(totalMin/60).toFixed(totalMin%60?1:0).replace('.',',')+' h'}</b><span>tempo conhecido</span></div></section>
      <section class="work12-section"><div class="work12-section-head"><h3>O que preciso fazer</h3><button class="work12-add" id="work12Add">+ adicionar</button></div>
        <div class="work12-list">${open.length?open.sort((x,y)=>(x.date||'9999').localeCompare(y.date||'9999')).slice(0,20).map(x=>taskCard(x,cfg)).join(''):`<div class="work12-empty">Nenhuma tarefa em aberto.</div>`}</div>
      </section>
      <section class="work12-section"><div class="work12-section-head"><h3>Áreas</h3></div><div class="work12-actions">
        ${cfg.groups.map(([g,acts])=>`<section class="card work12-group"><h3>${esc(g)}</h3><p>${esc(groupDesc(g))}</p><div class="work12-chips">${acts.map(act=>`<button class="work12-chip" data-work12-action="${esc(act)}" data-work12-group="${esc(g)}">${esc(act)}</button>`).join('')}</div></section>`).join('')}
      </div></section>
      <div class="work12-rule">O foco aqui é <strong>o que precisa ser feito + quanto tempo ocupa</strong>. Registrar não transforma tudo em urgência.</div>`;
    document.getElementById('work12Back').onclick=()=>location.hash='#trabalho';
    document.getElementById('work12Add').onclick=()=>openModal(cfg,null);
    a.querySelectorAll('[data-work12-action]').forEach(b=>b.onclick=()=>{
      const g=b.dataset.work12Group, act=b.dataset.work12Action;
      const title=(act==='Nova tarefa'||act==='Outra tarefa'||act==='Outro')?`${g} · `:`${g} · ${act}`;
      openModal(cfg,{title,area:g,date:TODAY(),duration:'30 min',frequency:'Única',priority:'Normal',status:'A fazer'});
    });
    a.querySelectorAll('[data-work12-edit]').forEach(b=>b.onclick=()=>{
      const item=all.find(x=>String(x.id)===String(b.dataset.work12Edit));
      if(item) openModal(cfg,item);
    });
  }

  function openModal(cfg,preset){
    const dlg=document.createElement('dialog'); dlg.className='work12-dialog';
    const p=preset?normalizeTask(preset,cfg):{title:'',area:'',date:TODAY(),time:'',duration:'30 min',frequency:'Única',priority:'Normal',status:'A fazer',note:''};
    const opts=(arr,sel)=>arr.map(v=>`<option ${v===sel?'selected':''}>${esc(v)}</option>`).join('');
    const areaOptions=cfg.groups.map(([g])=>g);
    if(p.area && !areaOptions.includes(p.area)) areaOptions.unshift(p.area);
    dlg.innerHTML=`<form class="work12-form" id="work12Form">
      <div class="work12-form-head"><div><div class="eyebrow">${cfg.icon} ${esc(cfg.name.toUpperCase())}</div><h2>${preset?'Editar tarefa':'Nova tarefa'}</h2></div><button type="button" class="work12-x" id="work12Close">×</button></div>
      <label>O que precisa ser feito?<input id="w12Title" required maxlength="150" value="${esc(p.title)}" placeholder="Ex.: revisar campanha"></label>
      <div class="work12-grid2"><label>Área<select id="w12Area"><option value="">Selecionar</option>${opts(areaOptions,p.area)}</select></label><label>Quando<input id="w12Date" type="date" value="${esc(p.date)}"></label></div>
      <div class="work12-grid2"><label>Duração<select id="w12Duration">${opts(['15 min','30 min','45 min','1h','1h30','2h'],p.duration)}</select></label><label>Prioridade<select id="w12Priority">${opts(['Baixa','Normal','Alta','Urgente'],p.priority)}</select></label></div>
      <details class="work12-more" ${p.time || p.frequency!=='Única' || p.status!=='A fazer' || p.note ? 'open' : ''}>
        <summary>Mais opções</summary>
        <div class="work12-more-body">
          <div class="work12-grid2"><label>Horário / janela<input id="w12Time" type="time" value="${esc(p.time)}"></label><label>Frequência<select id="w12Frequency">${opts(['Única','Diária','Semanal','Quinzenal','Mensal','Conforme necessário'],p.frequency)}</select></label></div>
          <label>Status<select id="w12Status">${opts(['A fazer','Em andamento','Aguardando','Concluído','Pausado'],p.status)}</select></label>
          <label>Observação<textarea id="w12Note" rows="2" maxlength="600" placeholder="Contexto ou próximo passo">${esc(p.note)}</textarea></label>
        </div>
      </details>
      <div class="work12-form-actions"><button type="button" class="work12-secondary" id="work12Cancel">Cancelar</button><button class="work12-primary" type="submit">Salvar</button></div>
    </form>`;
    document.body.appendChild(dlg); dlg.showModal();
    const close=()=>{try{dlg.close()}catch{} dlg.remove()};
    dlg.querySelector('#work12Close').onclick=close;
    dlg.querySelector('#work12Cancel').onclick=close;
    dlg.addEventListener('cancel',e=>{e.preventDefault();close()});
    dlg.addEventListener('click',e=>{if(e.target===dlg) close()});
    dlg.querySelector('#work12Form').onsubmit=e=>{
      e.preventDefault();
      const arr=tasks(cfg);
      const data={
        ...p,
        id:p.id||uid(),
        title:dlg.querySelector('#w12Title').value.trim(),
        area:dlg.querySelector('#w12Area').value.trim(),
        date:dlg.querySelector('#w12Date').value,
        time:dlg.querySelector('#w12Time').value,
        duration:dlg.querySelector('#w12Duration').value,
        frequency:dlg.querySelector('#w12Frequency').value,
        priority:dlg.querySelector('#w12Priority').value,
        status:dlg.querySelector('#w12Status').value,
        note:dlg.querySelector('#w12Note').value.trim(),
        source:cfg.name,
        updatedAt:Date.now(),
        createdAt:p.createdAt||Date.now()
      };
      const i=arr.findIndex(x=>String(x.id)===String(data.id));
      if(i>=0) arr[i]=data; else arr.push(data);
      persist(cfg,arr); close(); renderWorkspace(Object.keys(WORK).find(k=>WORK[k]===cfg));
    };
  }

  function route(){
    const h=(location.hash||'').replace('#','');
    if(h==='trabalho') renderHome();
    else if(h==='trabalho-crefito') renderWorkspace('crefito');
    else if(h==='trabalho-bec') renderWorkspace('bec');
    else if(h==='trabalho-tiktok') renderWorkspace('tiktok');
  }

  // Trabalho é o único responsável pelas rotas #trabalho*.
  // Render imediato evita a tela-placeholder antiga durante a navegação.
  window.addEventListener('hashchange',route);
  window.addEventListener('DOMContentLoaded',route);
  route();
})();
