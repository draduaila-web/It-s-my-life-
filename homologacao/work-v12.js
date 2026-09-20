
(function(){
  const APP = () => document.querySelector('#app');
  const TODAY = () => {
    const d = new Date();
    const local = new Date(d.getTime() - d.getTimezoneOffset()*60000);
    return local.toISOString().slice(0,10);
  };
  const uid = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const esc = (s='') => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const read = (key) => { try { return JSON.parse(window.berthaHmlStorage.getItem(key)||'[]'); } catch { return []; } };
  const save = (key,items) => window.berthaHmlStorage.setItem(key, JSON.stringify(items));

  const KEYS = {
    crefito:'minha-vida.trabalho.crefito.v1',
    bec:'minha-vida.trabalho.bec.v1',
    tiktok:'minha-vida.trabalho.tiktok.v1'
  };

  const NOTE_KEYS = {
    crefito:'bertha.work.notes.crefito.v1',
    bec:'bertha.work.notes.bec.v1',
    tiktok:'bertha.work.notes.tiktok.v1'
  };
  const notes = (kind) => read(NOTE_KEYS[kind]);
  const persistNotes = (kind,arr) => save(NOTE_KEYS[kind],arr);

  const WORK = {
    crefito:{
      name:'CREFITO-11', icon:'crefito', tag:'TRABALHO OFICIAL · 08:00–14:00',
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
      name:'BEC', icon:'bec', tag:'EMPRESA',
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
      name:'TikTok', icon:'tiktok', tag:'CONTEÚDO',
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

  function workSvg(kind='work'){
    const icons={
      work:`<svg viewBox="0 0 64 48" aria-hidden="true"><path d="M9 13h18c7 0 7 9 14 9h14"/><path d="M9 24h13c7 0 7 11 15 11h18"/><path d="M9 35h18"/></svg>`,
      crefito:`<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M12 13h24M12 24h24M12 35h24"/><path d="M18 9v30M30 9v30"/></svg>`,
      bec:`<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 8c2.8 8.5 7.5 13.2 16 16-8.5 2.8-13.2 7.5-16 16-2.8-8.5-7.5-13.2-16-16 8.5-2.8 13.2-7.5 16-16Z"/><path d="M24 15v18M15 24h18"/></svg>`,
      tiktok:`<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M9 29c5-9 10-9 15 0s10 9 15 0"/><path d="M9 19c5-9 10-9 15 0s10 9 15 0"/></svg>`
    };
    return icons[kind]||icons.work;
  }
  function workKindForCfg(cfg){return Object.keys(WORK).find(k=>WORK[k]===cfg)||'crefito';}
  function workEngineId(kind,id){return kind==='crefito'?`crefito:${id}`:`minha-vida.trabalho.${kind}.v1:${id}`;}
  function taskMinutes(x){
    if(+x.minutes>0)return +x.minutes;
    const v=String(x.duration||'30 min').toLowerCase();
    const hm=v.match(/(\d+)h(?:(\d+))?/); if(hm)return Number(hm[1])*60+Number(hm[2]||0);
    return Math.max(1,parseInt(v)||30);
  }
  function startWorkTask(kind,cfg,id){
    const arr=tasks(cfg),i=arr.findIndex(x=>String(x.id)===String(id));if(i<0)return;
    const x=arr[i],minutes=taskMinutes(x),engineId=workEngineId(kind,x.id);
    if(window.BerthaTimeEngine?.start){
      window.BerthaTimeEngine.start({id:engineId,learningKey:engineId,source:`Trabalho · ${cfg.name}`,title:x.title||'Trabalho',minutes,configuredMinutes:minutes,date:x.date||'',time:x.time||'',period:String(x.period||'Flexível').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace('manha','morning').replace('tarde','afternoon').replace('noite','night').replace('flexivel','flex'),priority:x.priority||'Normal',kind:'work',workKind:kind,workTaskId:x.id});
      setTimeout(()=>{const active=window.BerthaTimeEngine?.active?.();if(active&&String(active.id)===engineId){const a=tasks(cfg),j=a.findIndex(t=>String(t.id)===String(id));if(j>=0){a[j]={...a[j],status:'Em andamento',startedAt:active.startedAt||Date.now(),updatedAt:Date.now()};persist(cfg,a);renderWorkspace(kind)}}},120);
    }else{
      arr[i]={...x,status:'Em andamento',startedAt:Date.now(),updatedAt:Date.now()};persist(cfg,arr);renderWorkspace(kind);
    }
  }
  function recordWorkCompletion(engineId,x,cfg,end,real){
    try{const key='bertha.time-engine.v1',e=JSON.parse(window.berthaHmlStorage.getItem(key)||'{"active":null,"history":[],"snoozed":{}}');e.history=Array.isArray(e.history)?e.history:[];if(!e.history.some(h=>String(h.itemId)===String(engineId)&&h.status==='done'&&Math.abs((+h.endedAt||0)-end)<2000)){e.history.unshift({itemId:engineId,learningKey:engineId,title:x.title||'Trabalho',source:`Trabalho · ${cfg.name}`,day:TODAY(),startedAt:end-real*60000,endedAt:end,configuredMinutes:taskMinutes(x),plannedMinutes:taskMinutes(x),realMinutes:real,status:'done',category:x.area||cfg.name});window.berthaHmlStorage.setItem(key,JSON.stringify(e));}}catch{}
  }
  function completeWorkTask(kind,cfg,id){
    const arr=tasks(cfg),i=arr.findIndex(x=>String(x.id)===String(id));if(i<0)return;const x=arr[i],engineId=workEngineId(kind,x.id),active=window.BerthaTimeEngine?.active?.();
    if(active&&String(active.id)===engineId){window.BerthaTimeEngine.finish();setTimeout(()=>renderWorkspace(kind),120);return;}
    const end=Date.now(),st=x.startedAt||end,real=Math.max(1,Math.round((end-st)/60000));arr[i]={...x,status:'Concluído',completedAt:end,actualMinutes:real,updatedAt:end};persist(cfg,arr);recordWorkCompletion(engineId,x,cfg,end,real);renderWorkspace(kind);
  }

  function injectStyles(){
    if(document.getElementById('work-v12-styles')) return;
    const s=document.createElement('style');
    s.id='work-v12-styles';
    s.textContent=`
      .work12-hero{margin-bottom:24px}
      .work12-fronts{display:grid;gap:14px}
      .work12-front{width:100%;border:1px solid rgba(112,104,122,.10);background:linear-gradient(135deg,rgba(255,252,246,.96),rgba(253,249,242,.92));border-radius:28px;padding:20px;display:grid;grid-template-columns:32px 1fr 22px;gap:16px;align-items:center;text-align:left;color:#40384a;box-shadow:0 8px 24px rgba(76,58,82,.035);cursor:pointer;font:inherit}
      .work12-front:active{transform:scale(.988)}
      .work12-icon{width:32px;height:32px;border-radius:0;display:flex;align-items:center;justify-content:center;font-size:0;background:transparent;border:0}
      .work12-front:nth-child(1) .work12-icon{color:#7d68b2}
      .work12-front:nth-child(2) .work12-icon{color:#70a087}
      .work12-front:nth-child(3) .work12-icon{color:#c29a3a}
      .work12-front strong{display:block;font-size:21px;margin-bottom:4px}
      .work12-front small{display:block;color:#817783;font-size:15px;line-height:1.3}
      .work12-arrow{font-size:24px;color:#b3a7b4}
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
      .work12-notequick{padding:15px 17px!important;display:grid;grid-template-columns:1fr auto;gap:10px;align-items:start}
      .work12-notequick p{margin:4px 0 0;color:#817783;white-space:pre-wrap}
      .work12-note-actions,.work12-history-actions,.work12-run-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:9px}
      .work12-mini{border:0;border-radius:999px;padding:7px 10px;background:#f1e8f6;color:#6d4d82;font-weight:800;font-size:12px}
      .work12-mini.danger{background:#f7ecef;color:#9a536c}.work12-mini.start{background:#edf5f1;color:#567565}.work12-mini.done{background:#f4e7ef;color:#8a5670}
      .work12-history{margin-top:24px}.work12-history details{border:1px solid rgba(92,72,104,.10);border-radius:20px;background:#fffdfb;padding:0 15px}
      .work12-history summary{padding:14px 0;font-weight:800;cursor:pointer}.work12-history-list{display:grid;gap:9px;padding:0 0 14px}
      .work12-history-item{border-top:1px solid #eee5e8;padding-top:11px}.work12-history-item:first-child{border-top:0}
      .work12-check{display:flex!important;gap:9px;align-items:center;font-weight:700}.work12-check input{width:auto!important;min-height:auto!important;margin:0!important}
      .work12-duration{display:grid;grid-template-columns:88px minmax(0,1fr);gap:8px}.work12-duration input,.work12-duration select{margin-top:3px}
      @media(max-width:520px){.work12-dialog{width:92vw;max-height:68vh}.work12-form{max-height:68vh}.work12-form input,.work12-form select,.work12-form textarea{font-size:16px}}
    `;
    document.head.appendChild(s);
    if(!document.getElementById('work-v13-visual')){
      const v=document.createElement('style');v.id='work-v13-visual';v.textContent=`
      .work13-hero{position:relative;overflow:hidden;display:grid;grid-template-columns:minmax(0,1fr) 86px;gap:18px;align-items:start;margin:0 0 26px;padding:28px 25px 26px;border:1px solid rgba(125,120,127,.10);border-radius:30px;background:radial-gradient(circle at 86% 78%,rgba(248,231,182,.26),transparent 33%),linear-gradient(135deg,rgba(251,247,236,.98) 0%,rgba(244,239,251,.92) 50%,rgba(239,247,240,.92) 100%);box-shadow:0 12px 34px rgba(76,58,82,.04)}
      .work13-hero:after{content:'';position:absolute;width:190px;height:190px;border-radius:50%;right:-70px;bottom:-105px;background:rgba(255,255,255,.28);filter:blur(2px)}
      .work13-kicker,.work13-subkicker,.work13-section-label,.work13-subtag{font-size:10px;letter-spacing:.17em;font-weight:800;color:#7e69aa;text-transform:uppercase}
      .work13-hero h2{margin:8px 0 10px;font-size:34px;line-height:1.03;letter-spacing:-.035em;font-weight:560;color:#30354d}
      .work13-hero p{margin:0;max-width:310px;color:#716f7d;font-size:14px;line-height:1.45;font-weight:400}
      .work13-hero-mark{position:relative;z-index:1;width:76px;height:64px;display:grid;place-items:center;color:#8f79bf;opacity:.78}
      .work13-hero-mark svg{width:72px;height:54px;fill:none;stroke:currentColor;stroke-width:1.35;stroke-linecap:round;stroke-linejoin:round}
      .work13-section-label{margin:0 2px 11px;color:#8a7d8f}
      .work12-fronts{gap:12px!important}.work12-front{border-color:rgba(125,120,127,.09)!important;background:linear-gradient(135deg,rgba(255,252,246,.96),rgba(252,249,243,.93))!important;border-radius:25px!important;padding:18px 18px!important;grid-template-columns:32px 1fr 20px!important;box-shadow:0 8px 24px rgba(75,66,65,.03)!important}
      .work12-front:nth-child(2),.work12-front:nth-child(3){background:linear-gradient(135deg,rgba(255,252,246,.96),rgba(252,249,243,.93))!important}
      .work12-icon{width:32px!important;height:32px!important;border-radius:0!important;background:transparent!important;color:#7d68b2!important;border:0!important;font-size:0!important}
      .work12-front:nth-child(2) .work12-icon{color:#70a087!important}.work12-front:nth-child(3) .work12-icon{color:#c29a3a!important}
      .work12-icon svg{width:28px;height:28px;fill:none;stroke:currentColor;stroke-width:1.55;stroke-linecap:round;stroke-linejoin:round}
      .work12-front strong{font-size:18px!important;font-weight:600!important;color:#30354d!important}.work12-front small{font-size:13px!important;color:#7d7f8f!important}.work12-arrow{color:#b3a7b4!important;font-weight:300!important}
      .work13-bridge{margin:18px 0 0;padding:16px 18px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center;border:1px solid rgba(125,120,127,.09);border-radius:21px;background:linear-gradient(135deg,rgba(251,248,242,.92),rgba(244,240,251,.72));color:#5d615c}.work13-bridge strong,.work13-bridge small{display:block}.work13-bridge strong{font-size:13px;font-weight:650;color:#30354d}.work13-bridge small{margin-top:2px;font-size:11px;line-height:1.35;color:#7d7f8f}.work13-bridge a{font-size:11px;font-weight:800;color:#7e69aa;text-decoration:none;white-space:nowrap}
      .work12-back{background:rgba(242,237,251,.82)!important;color:#7b67a6!important;font-weight:700!important}.work13-subtag{margin-left:auto;color:#9a91a2}.work12-subhero{padding:20px 19px!important;border-radius:25px;background:radial-gradient(circle at 86% 78%,rgba(248,231,182,.18),transparent 34%),linear-gradient(135deg,rgba(251,248,242,.92),rgba(244,240,251,.72));border:1px solid rgba(125,120,127,.09);align-items:flex-start!important}.work12-subhero .work12-icon{flex:0 0 32px!important}.work13-subkicker{display:block;margin:1px 0 6px}.work12-subhero h2{font-size:28px!important;font-weight:580!important;letter-spacing:-.025em;color:#30354d}.work12-subhero p{font-size:13px!important;line-height:1.4!important;color:#7d7f8f!important}
      .work12-summary{gap:9px!important}.work12-stat{background:linear-gradient(135deg,rgba(255,252,246,.92),rgba(249,245,251,.74))!important;border-color:rgba(125,120,127,.08)!important;border-radius:18px!important}.work12-stat b{font-size:21px!important;font-weight:600!important;color:#30354d}.work12-stat span{color:#8a8392!important}
      .work12-group,.work12-task,.work12-notequick,.work12-history details{background:rgba(255,252,247,.88)!important;border-color:rgba(125,120,127,.09)!important;box-shadow:none!important}.work12-group{border-radius:23px!important}.work12-chip{background:linear-gradient(120deg,rgba(245,241,250,.82),rgba(252,248,240,.76))!important;border-color:rgba(126,117,140,.08)!important;color:#716a7d!important;font-weight:650!important}.work12-add{background:linear-gradient(120deg,#ece3fa,#f8edd8)!important;color:#695e80!important}.work12-badge{background:#f1ecf7!important;color:#7a6a98!important}.work12-edit{background:#f6f2ed!important;color:#837871!important}.work12-rule{background:linear-gradient(135deg,#faf5e8,#f4effb)!important;color:#77716c!important}
      .work12-dialog{background:#fbf7ef!important;border-radius:26px!important}.work12-form{background:#fbf7ef!important;padding:17px!important}.work12-form-head{background:#fbf7ef!important;border-bottom-color:rgba(126,117,140,.10)!important}.work12-x{background:rgba(117,113,105,.07)!important;color:#817b75!important}.work12-form label{color:#77726c!important}.work12-form input,.work12-form select,.work12-form textarea{font-size:16px!important;background:#fffdf9!important;border-color:rgba(126,117,140,.14)!important;color:#4d504d!important}.work12-more{background:#f4f1e9!important;border-color:rgba(126,117,140,.10)!important}.work12-more summary{color:#7b67a6!important}.work12-form-actions{background:linear-gradient(to bottom,rgba(251,247,239,0),#fbf7ef 13px)!important}.work12-secondary{background:#ede8f7!important;color:#6f6590!important}.work12-primary{background:linear-gradient(120deg,#e8def8,#f4e8cf)!important;color:#5e5378!important}.work12-mini{background:#f1edf8!important;color:#6f6590!important}.work12-mini.start{background:linear-gradient(120deg,#ebe4fa,#f5ead6)!important;color:#5f5578!important}.work12-mini.done{background:#f5eadf!important;color:#8d6758!important}.work12-mini.danger{background:#f4e9e5!important;color:#956c62!important}.work12-check input{accent-color:#8f79bf!important}
      @media(max-width:520px){.work13-hero{grid-template-columns:minmax(0,1fr) 64px;padding:24px 20px 23px}.work13-hero h2{font-size:31px}.work13-hero-mark{width:62px}.work13-bridge{grid-template-columns:minmax(0,1fr)}.work13-bridge a{grid-column:auto;margin-top:3px}.work12-subhead{gap:8px}.work13-subtag{font-size:9px;letter-spacing:.11em}.work12-grid2{grid-template-columns:1fr!important}}
      `;document.head.appendChild(v);
    }
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
      source:x.source || cfg.name,
      period:x.period || 'Flexível',
      notify:Boolean(x.notify),
      notifyWhen:x.notifyWhen || 'No horário da tarefa',
      startedAt:x.startedAt || null,
      completedAt:x.completedAt || null,
      actualMinutes:x.actualMinutes || null
    };
  }

  function tasks(cfg){ return read(cfg.key).map(x=>normalizeTask(x,cfg)); }
  function persist(cfg,arr){ save(cfg.key,arr); }

  function renderHome(){
    injectStyles();
    const a=APP(); if(!a) return;
    a.innerHTML=`
      <section class="work13-hero">
        <div><div class="work13-kicker">TRABALHO</div><h2>Know what’s next.<br>Live what’s now.</h2><p>A BERTH.A organiza. Você age.</p></div>
        <span class="work13-hero-mark">${workSvg('work')}</span>
      </section>
      <div class="work13-section-label">MINHAS FRENTES</div>
      <section class="work12-fronts">
        <button type="button" class="work12-front" data-work12-go="crefito">
          <span class="work12-icon">${workSvg('crefito')}</span><span><strong>CREFITO-11</strong><small>Trabalho oficial · 08:00–14:00</small></span><span class="work12-arrow">›</span>
        </button>
        <button type="button" class="work12-front" data-work12-go="bec">
          <span class="work12-icon">${workSvg('bec')}</span><span><strong>BEC</strong><small>Empresa, projetos e operações</small></span><span class="work12-arrow">›</span>
        </button>
        <button type="button" class="work12-front" data-work12-go="tiktok">
          <span class="work12-icon">${workSvg('tiktok')}</span><span><strong>TikTok</strong><small>Conteúdo, produção e presença digital</small></span><span class="work12-arrow">›</span>
        </button>
      </section>
      <section class="work13-bridge"><div><strong>Menos decisões · mais foco</strong><small>Cada frente tem seu próprio espaço. Depois, as tarefas importantes podem entrar no Meu Dia.</small></div><a href="#meu-dia">Meu Dia →</a></section>`;
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
      <div class="work12-run-actions">${x.startedAt && x.status==='Em andamento'?`<button class="work12-mini done" data-work12-complete="${esc(x.id)}">Concluir</button>`:`<button class="work12-mini start" data-work12-start="${esc(x.id)}">Começar</button>`}</div>
    </article>`;
  }

  function renderWorkspace(kind){
    injectStyles();
    const cfg=WORK[kind], a=APP(); if(!cfg||!a) return;
    const all=tasks(cfg), open=all.filter(x=>x.status!=='Concluído'), done=all.filter(x=>x.status==='Concluído');
    const ns=notes(kind);
    const mins=x=>{ const v=String(x.duration||'30 min'); if(v.includes('h')){const m=v.match(/(\d+)h(?:(\d+))?/);return m?Number(m[1])*60+Number(m[2]||0):60;} return parseInt(v)||30; };
    const totalMin=open.reduce((sum,x)=>sum+mins(x),0);
    a.innerHTML=`
      <div class="work12-subhead"><button class="work12-back" id="work12Back">← Trabalho</button><span class="work13-subtag">${esc(cfg.tag)}</span></div>
      <section class="work12-subhero"><span class="work12-icon">${workSvg(kind)}</span><div><span class="work13-subkicker">TRABALHO · ${esc(cfg.name.toUpperCase())}</span><h2>${esc(cfg.name)}</h2><p>${esc(cfg.desc)}</p></div></section>
      <section class="work12-summary"><div class="work12-stat"><b>${open.length}</b><span>tarefas em aberto</span></div><div class="work12-stat"><b>${totalMin<60?totalMin+' min':(totalMin/60).toFixed(totalMin%60?1:0).replace('.',',')+' h'}</b><span>tempo conhecido</span></div></section>
      <section class="work12-section"><div class="work12-section-head"><h3>Notas rápidas</h3><button class="work12-add" id="work12AddNote">+ nota</button></div>
        <div class="work12-list">${ns.length?ns.map(n=>`<article class="card work12-notequick"><div><strong>${esc(n.title||'Nota')}</strong>${n.text?`<p>${esc(n.text)}</p>`:''}<div class="work12-note-actions"><button class="work12-mini" data-note-task="${esc(n.id)}">Transformar em tarefa</button><button class="work12-mini danger" data-note-del="${esc(n.id)}">Excluir</button></div></div></article>`).join(''):`<div class="work12-empty">Nada para carregar na cabeça agora.</div>`}</div>
      </section>
      <section class="work12-section"><div class="work12-section-head"><h3>O que preciso fazer</h3><button class="work12-add" id="work12Add">+ adicionar</button></div>
        <div class="work12-list">${open.length?open.sort((x,y)=>(x.date||'9999').localeCompare(y.date||'9999')).slice(0,30).map(x=>taskCard(x,cfg)).join(''):`<div class="work12-empty">Nenhuma tarefa em aberto.</div>`}</div>
      </section>
      ${done.length?`<section class="work12-history"><details><summary>Concluídas · ${done.length}</summary><div class="work12-history-list">${done.slice().sort((a,b)=>(b.completedAt||b.updatedAt||0)-(a.completedAt||a.updatedAt||0)).map(x=>`<div class="work12-history-item"><strong>${esc(x.title)}</strong><small>${x.actualMinutes?` · ${x.actualMinutes} min reais`:''}</small><div class="work12-history-actions"><button class="work12-mini" data-work12-repeat="${esc(x.id)}">Repetir</button><button class="work12-mini danger" data-work12-delete="${esc(x.id)}">Excluir</button></div></div>`).join('')}</div></details></section>`:''}
      <section class="work12-section"><div class="work12-section-head"><h3>Áreas</h3></div><div class="work12-actions">
        ${cfg.groups.map(([g,acts])=>`<section class="card work12-group"><h3>${esc(g)}</h3><p>${esc(groupDesc(g))}</p><div class="work12-chips">${acts.map(act=>`<button class="work12-chip" data-work12-action="${esc(act)}" data-work12-group="${esc(g)}">${esc(act)}</button>`).join('')}</div></section>`).join('')}
      </div></section>
      <div class="work12-rule">Nota é para não esquecer. Tarefa é o que precisa ser executado. Ao concluir, a tarefa sai da lista ativa e permanece no histórico.</div>`;
    document.getElementById('work12Back').onclick=()=>location.hash='#trabalho';
    document.getElementById('work12Add').onclick=()=>openModal(cfg,null);
    document.getElementById('work12AddNote').onclick=()=>openNoteModal(kind,cfg);
    a.querySelectorAll('[data-work12-action]').forEach(b=>b.onclick=()=>{ const g=b.dataset.work12Group,act=b.dataset.work12Action; const title=(act==='Nova tarefa'||act==='Outra tarefa'||act==='Outro')?`${g} · `:`${g} · ${act}`; openModal(cfg,{title,area:g,date:TODAY(),duration:'30 min',frequency:'Única',priority:'Normal',status:'A fazer'}); });
    a.querySelectorAll('[data-work12-edit]').forEach(b=>b.onclick=()=>{const item=all.find(x=>String(x.id)===String(b.dataset.work12Edit));if(item)openModal(cfg,item)});
    a.querySelectorAll('[data-work12-start]').forEach(b=>b.onclick=()=>startWorkTask(kind,cfg,b.dataset.work12Start));
    a.querySelectorAll('[data-work12-complete]').forEach(b=>b.onclick=()=>completeWorkTask(kind,cfg,b.dataset.work12Complete));
    a.querySelectorAll('[data-work12-repeat]').forEach(b=>b.onclick=()=>{const arr=tasks(cfg),x=arr.find(x=>String(x.id)===String(b.dataset.work12Repeat));if(!x)return;arr.push({...x,id:uid(),status:'A fazer',date:TODAY(),startedAt:null,completedAt:null,actualMinutes:null,createdAt:Date.now(),updatedAt:Date.now()});persist(cfg,arr);renderWorkspace(kind)});
    a.querySelectorAll('[data-work12-delete]').forEach(b=>b.onclick=()=>{if(!confirm('Excluir este registro concluído?'))return;persist(cfg,tasks(cfg).filter(x=>String(x.id)!==String(b.dataset.work12Delete)));renderWorkspace(kind)});
    a.querySelectorAll('[data-note-del]').forEach(b=>b.onclick=()=>{persistNotes(kind,notes(kind).filter(n=>String(n.id)!==String(b.dataset.noteDel)));renderWorkspace(kind)});
    a.querySelectorAll('[data-note-task]').forEach(b=>b.onclick=()=>{const n=notes(kind).find(n=>String(n.id)===String(b.dataset.noteTask));if(n)openModal(cfg,{title:n.title||n.text||'',note:n.text||'',date:TODAY(),duration:'30 min',frequency:'Única',priority:'Normal',status:'A fazer',_noteId:n.id,_noteKind:kind})});
  }

  function openNoteModal(kind,cfg){
    const dlg=document.createElement('dialog');dlg.className='work12-dialog';
    dlg.innerHTML=`<form class="work12-form"><div class="work12-form-head"><div><div class="eyebrow">TRABALHO · ${esc(cfg.name.toUpperCase())}</div><h2>Nota rápida</h2></div><button type="button" class="work12-x">×</button></div><label>Título<input id="w12NoteTitle" maxlength="100" placeholder="Ex.: perguntar ao jurídico"></label><label>Anotação<textarea id="w12NoteText" rows="4" maxlength="800" placeholder="Escreva sem precisar transformar isso em tarefa agora."></textarea></label><div class="work12-form-actions"><button type="button" class="work12-secondary" data-cancel>Cancelar</button><button class="work12-primary" type="submit">Salvar nota</button></div></form>`;
    document.body.appendChild(dlg);dlg.showModal();const close=()=>{try{dlg.close()}catch{}dlg.remove()};dlg.querySelector('.work12-x').onclick=close;dlg.querySelector('[data-cancel]').onclick=close;dlg.addEventListener('cancel',e=>{e.preventDefault();close()});dlg.querySelector('form').onsubmit=e=>{e.preventDefault();const title=dlg.querySelector('#w12NoteTitle').value.trim(),text=dlg.querySelector('#w12NoteText').value.trim();if(!title&&!text)return;const arr=notes(kind);arr.unshift({id:uid(),title,text,createdAt:Date.now()});persistNotes(kind,arr);close();renderWorkspace(kind)};
  }

  function openModal(cfg,preset){
    const dlg=document.createElement('dialog'); dlg.className='work12-dialog';
    const p=preset?normalizeTask(preset,cfg):{title:'',area:'',date:TODAY(),time:'',duration:'30 min',period:'Flexível',frequency:'Única',priority:'Normal',status:'A fazer',note:'',notify:false,notifyWhen:'No horário da tarefa'};
    const durationMinutes=(()=>{const v=String(p.duration||'30 min');if(v==='1h')return 60;if(v==='1h30')return 90;if(v==='2h')return 120;return parseInt(v)||30})();
    const durationUnit=durationMinutes%60===0 && durationMinutes>=60?'horas':'minutos';
    const durationValue=durationUnit==='horas'?durationMinutes/60:durationMinutes;
    const opts=(arr,sel)=>arr.map(v=>`<option ${v===sel?'selected':''}>${esc(v)}</option>`).join('');
    const areaOptions=cfg.groups.map(([g])=>g); if(p.area&&!areaOptions.includes(p.area))areaOptions.unshift(p.area);
    dlg.innerHTML=`<form class="work12-form" id="work12Form">
      <div class="work12-form-head"><div><div class="eyebrow">TRABALHO · ${esc(cfg.name.toUpperCase())}</div><h2>${preset?'Editar tarefa':'Nova tarefa'}</h2></div><button type="button" class="work12-x" id="work12Close">×</button></div>
      <label>O que precisa ser feito?<input id="w12Title" required maxlength="150" value="${esc(p.title)}" placeholder="Ex.: revisar campanha"></label>
      <div class="work12-grid2"><label>Área<select id="w12Area"><option value="">Selecionar</option>${opts(areaOptions,p.area)}</select></label><label>Data / prazo<input id="w12Date" type="date" value="${esc(p.date)}"></label></div>
      <div class="work12-grid2"><label>Duração<div class="work12-duration"><input id="w12DurationValue" type="number" min="1" step="1" value="${durationValue}"><select id="w12DurationUnit">${opts(['minutos','horas'],durationUnit)}</select></div></label><label>Prioridade<select id="w12Priority">${opts(['Baixa','Normal','Alta','Urgente'],p.priority)}</select></label></div>
      <details class="work12-more" ${p.time||p.period!=='Flexível'||p.frequency!=='Única'||p.status!=='A fazer'||p.note||p.notify?'open':''}><summary>Mais opções</summary><div class="work12-more-body">
        <div class="work12-grid2"><label>Quando pode acontecer?<select id="w12Period">${opts(['Flexível','Manhã','Tarde','Noite'],p.period)}</select></label><label>Horário opcional<input id="w12Time" type="time" value="${esc(p.time)}"></label></div>
        <label>Frequência<select id="w12Frequency">${opts(['Única','Diária','Semanal','Quinzenal','Mensal','Conforme necessário'],p.frequency)}</select></label>
        <label>Status<select id="w12Status">${opts(['A fazer','Em andamento','Aguardando','Concluído','Pausado'],p.status)}</select></label>
        <label class="work12-check"><input id="w12Notify" type="checkbox" ${p.notify?'checked':''}> Me avisar?</label>
        <label id="w12NotifyWrap" ${p.notify?'':'hidden'}>Quando avisar?<select id="w12NotifyWhen">${opts(['No horário da tarefa','10 min antes','30 min antes','1 hora antes','No início do período','Em um horário escolhido'],p.notifyWhen)}</select></label>
        <label>Observação<textarea id="w12Note" rows="2" maxlength="600" placeholder="Contexto ou próximo passo">${esc(p.note)}</textarea></label>
      </div></details>
      <div class="work12-form-actions"><button type="button" class="work12-secondary" id="work12Cancel">Cancelar</button><button class="work12-primary" type="submit">Salvar</button></div>
    </form>`;
    document.body.appendChild(dlg);dlg.showModal();const close=()=>{try{dlg.close()}catch{}dlg.remove()};
    dlg.querySelector('#work12Close').onclick=close;dlg.querySelector('#work12Cancel').onclick=close;dlg.addEventListener('cancel',e=>{e.preventDefault();close()});dlg.addEventListener('click',e=>{if(e.target===dlg)close()});
    const notify=dlg.querySelector('#w12Notify'),nw=dlg.querySelector('#w12NotifyWrap');notify.onchange=()=>nw.hidden=!notify.checked;
    dlg.querySelector('#work12Form').onsubmit=e=>{e.preventDefault();const arr=tasks(cfg);const val=Math.max(1,Number(dlg.querySelector('#w12DurationValue').value)||30),unit=dlg.querySelector('#w12DurationUnit').value;const minutes=unit==='horas'?Math.round(val*60):Math.round(val);const duration=minutes%60===0&&minutes>=60?`${minutes/60}h`:`${minutes} min`;
      const data={...p,id:p.id||uid(),title:dlg.querySelector('#w12Title').value.trim(),area:dlg.querySelector('#w12Area').value.trim(),date:dlg.querySelector('#w12Date').value,time:dlg.querySelector('#w12Time').value,period:dlg.querySelector('#w12Period').value,duration,minutes,frequency:dlg.querySelector('#w12Frequency').value,priority:dlg.querySelector('#w12Priority').value,status:dlg.querySelector('#w12Status').value,notify:notify.checked,notifyWhen:dlg.querySelector('#w12NotifyWhen').value,note:dlg.querySelector('#w12Note').value.trim(),source:cfg.name,updatedAt:Date.now(),createdAt:p.createdAt||Date.now()};
      if(data.status==='Concluído'&&!data.completedAt)data.completedAt=Date.now();const i=arr.findIndex(x=>String(x.id)===String(data.id));if(i>=0)arr[i]=data;else arr.push(data);persist(cfg,arr);
      if(p._noteId&&p._noteKind)persistNotes(p._noteKind,notes(p._noteKind).filter(n=>String(n.id)!==String(p._noteId)));
      close();renderWorkspace(Object.keys(WORK).find(k=>WORK[k]===cfg));};
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

/* BERTH.A v2.8.208 — Trabalho: acabamento visual homologação */
(function(){
  const s=document.createElement('style'); s.id='work-v208-polish'; s.textContent=`
    .work13-hero-mark{width:52px!important;height:48px!important;color:#a29ca3!important;opacity:.58!important}
    .work13-hero-mark svg{width:48px!important;height:38px!important;stroke-width:1.25!important}
    @media(max-width:520px){.work13-hero{grid-template-columns:minmax(0,1fr) 52px!important}.work13-hero-mark{width:48px!important;height:44px!important}.work13-hero-mark svg{width:44px!important;height:35px!important}}
    .work12-check{gap:10px!important;color:#6f696f!important}
    .work12-check input[type=checkbox]{appearance:none!important;-webkit-appearance:none!important;width:20px!important;height:20px!important;min-width:20px!important;min-height:20px!important;border:1.5px solid #b9b0bb!important;border-radius:7px!important;background:#fffdfa!important;display:grid!important;place-items:center!important;box-shadow:none!important;accent-color:transparent!important}
    .work12-check input[type=checkbox]:checked{background:linear-gradient(135deg,#d9c9ea 0%,#efd9c8 100%)!important;border-color:#b9a6c4!important}
    .work12-check input[type=checkbox]:checked:after{content:'✓';font-size:12px;line-height:1;color:#675a72;font-weight:800}
  `; document.head.appendChild(s);
})();
