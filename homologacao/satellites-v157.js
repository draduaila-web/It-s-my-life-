
/* ============================================================
   BERTH.A — SATÉLITES v157
   Reconstruído do zero como uma única camada autoritativa.
   ============================================================ */
(function(){
  const STYLE_ID='bertha-satellites-v157';
  const ACTIVE_KEY='bertha.satellite.preview.v1';
  let lastNav=0;

  function esc(v){return typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
  function data(){return typeof loadSatellites==='function'?loadSatellites():{members:[],invites:[]}}
  function member(id){return (data().members||[]).find(m=>String(m.id)===String(id))}
  function events(){return typeof loadSatelliteOwnerEvents==='function'?loadSatelliteOwnerEvents():[]}
  function avatar(m){try{return satelliteAvatarIcon(m?.avatarKey|| (m?.role==='kids'?'son':'family'))}catch{return '<span style="font-size:22px">○</span>'}}

  function styles(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
      .s156-page{display:grid;gap:14px;padding-bottom:18px}
      .s156-hero{position:relative;overflow:hidden;padding:22px;border-radius:28px;background:linear-gradient(135deg,#fbf1eb 0%,#edf4f3 52%,#f1edf7 100%);border:1px solid rgba(113,96,130,.08);box-shadow:0 12px 28px rgba(74,57,69,.04)}
      .s156-hero .eyebrow{font-size:10px;letter-spacing:.18em;color:#84778b}.s156-hero h2{margin:8px 0 10px;font-size:28px;line-height:1.08;font-weight:420;letter-spacing:-.025em;color:#3e3844}.s156-hero p{margin:0;max-width:510px;color:#756d78;font-size:13px;line-height:1.45}
      .s156-network{position:absolute;right:22px;bottom:20px;width:106px;height:82px;opacity:.66}.s156-network svg{width:100%;height:100%;stroke:#88788e;fill:none;stroke-width:1.7;stroke-linecap:round}
      .s156-actions{display:flex;gap:9px;flex-wrap:wrap}.s156-main{flex:1;min-width:180px;min-height:50px;border:0;border-radius:22px;background:linear-gradient(100deg,#edb1ca,#e4d4ed 48%,#c9e2e2);color:#514754;font-size:13px}
      .s156-note{padding:12px 14px;border-radius:18px;background:rgba(255,252,247,.78);border:1px solid rgba(113,96,130,.07);color:#7f7681;font-size:10.5px;line-height:1.45}
      .s156-card{padding:15px;border-radius:24px;background:rgba(255,253,249,.92);border:1px solid rgba(113,96,130,.08);box-shadow:0 9px 24px rgba(73,59,72,.035)}
      .s156-head{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:12px}.s156-head h3{margin:0;font-size:19px;font-weight:430;letter-spacing:-.02em}.s156-head p{margin:4px 0 0;font-size:10.5px;line-height:1.4;color:#847b86}.s156-count{min-width:31px;height:31px;padding:0 9px;border-radius:999px;display:grid;place-items:center;background:#f5eadf;color:#766a70;font-size:10px}
      .s156-member{display:grid;grid-template-columns:54px minmax(0,1fr) auto;gap:11px;align-items:center;padding:11px 0;border-bottom:1px solid rgba(113,96,130,.065)}.s156-member:last-child{border-bottom:0}.s156-avatar{width:54px;height:54px;border-radius:19px;background:linear-gradient(145deg,#fffaf5,#edf4f7);border:1px solid rgba(113,96,130,.07);display:grid;place-items:center;overflow:hidden}.s156-avatar svg{width:34px;height:34px}
      .s156-member strong{display:block;font-size:13px;font-weight:430;color:#48414b}.s156-member small{display:block;margin-top:3px;font-size:9.5px;color:#8a818b;line-height:1.35}.s156-role{display:inline-flex;margin-top:6px;padding:4px 7px;border-radius:999px;background:#f4eef2;color:#8d7481;font-size:7.5px;letter-spacing:.08em}
      .s156-row-actions{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}.s156-btn{min-height:34px;padding:0 10px;border-radius:999px;border:1px solid rgba(113,96,130,.10);background:#fffaf6;color:#756b77;font-size:9.5px}.s156-btn.rec{background:linear-gradient(110deg,#fff1f5,#fff7ed);color:#9b5c79}
      .s156-events{display:grid;gap:7px}.s156-event{display:grid;grid-template-columns:29px minmax(0,1fr) auto;gap:9px;align-items:center;padding:9px;border-radius:15px;background:#fffaf7;border:1px solid rgba(113,96,130,.06)}.s156-event.unread{background:linear-gradient(135deg,#fff4f6,#f5f4fb)}.s156-check{width:29px;height:29px;border-radius:10px;display:grid;place-items:center;background:#edf3ed;color:#708977;font-size:12px}.s156-event strong{display:block;font-size:10.8px;font-weight:430}.s156-event small{display:block;margin-top:2px;font-size:8.8px;color:#8a818b}
      .s156-empty{padding:18px 8px;text-align:center;color:#8a818b;font-size:11px}
      .s156-profile-head{display:grid;grid-template-columns:74px minmax(0,1fr);gap:13px;align-items:center}.s156-profile-head .s156-avatar{width:74px;height:74px;border-radius:24px}.s156-profile-head h2{margin:0;font-size:22px;font-weight:430}.s156-profile-head p{margin:4px 0 0;font-size:10.5px;color:#827984}.s156-perms{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.s156-perms span{padding:5px 8px;border-radius:999px;background:#f6f0f2;color:#7d7079;font-size:8px}
      .s156-task{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;padding:11px 0;border-bottom:1px solid rgba(113,96,130,.065)}.s156-task:last-child{border-bottom:0}.s156-task strong{display:block;font-size:11.5px;font-weight:430}.s156-task small{display:block;margin-top:3px;font-size:9px;color:#8a818b}.s156-task-actions{display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end}
      @media(max-width:560px){.s156-member{grid-template-columns:48px minmax(0,1fr)}.s156-member>.s156-row-actions{grid-column:2;justify-content:flex-start}.s156-avatar{width:48px;height:48px}.s156-event{grid-template-columns:29px minmax(0,1fr)}.s156-event>.s156-btn{grid-column:2;justify-self:start}}
    `;document.head.appendChild(s)
  }

  function go(route,id){
    if(id) window.berthaHmlStorage?.setItem(ACTIVE_KEY,String(id));
    state.route=route;document.body.dataset.berthaRoute=route;
    try{history.replaceState({berthaRoute:route},'',location.pathname+location.search+'#'+route)}catch{}
    if(route==='satelites') renderSatellitesV157();
    else renderSatelliteProfileV157();
  }

  function renderSatellitesV157(){
    styles();
    const d=data(),members=(d.members||[]).filter(m=>m.status!=='removed'),ev=events(),unread=ev.filter(x=>!x.read).length;
    const network=`<svg viewBox="0 0 120 90" aria-hidden="true"><circle cx="24" cy="34" r="9"/><circle cx="94" cy="34" r="9"/><circle cx="59" cy="53" r="10"/><path d="M15 72c1-16 8-24 20-24M105 72c-1-16-8-24-20-24M39 82c2-15 9-23 20-23s18 8 20 23"/><path d="M59 16c4-6 12-2 12 4 0 7-12 15-12 15S47 27 47 20c0-6 8-10 12-4z"/></svg>`;
    app.innerHTML=`<div class="s156-page">
      <section class="s156-hero"><div class="eyebrow">REDE BERTH.A</div><h2>Everything handled.<br>Nothing carried.</h2><p>Você conta com a BERTH.A. A BERTH.A conta com os seus.</p><div class="s156-network">${network}</div></section>
      <div class="s156-actions"><button type="button" class="s156-main" id="s156Add">＋ Adicionar satélite</button></div>
      <div class="s156-note">Compartilhe apenas o que faz sentido. Cada satélite recebe somente os recortes que você autorizar.</div>
      ${ev.length?`<section class="s156-card"><div class="s156-head"><div><h3>Atividade da rede</h3><p>${unread?`${unread} nova${unread===1?'':'s'} para você.`:'Tudo visto.'}</p></div><button class="s156-btn" id="s156Read">Marcar como visto</button></div><div class="s156-events">${ev.slice(0,8).map(e=>{const m=member(e.memberId);return `<div class="s156-event ${e.read?'':'unread'}"><span class="s156-check">✓</span><div><strong>${esc(e.memberName)} concluiu “${esc(e.taskName)}”</strong><small>${new Date(e.at).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}</small></div>${m&&m.role!=='kids'?`<button class="s156-btn rec" data-rec="${esc(m.id)}" data-event="${esc(e.id)}">Reconhecer agora</button>`:''}</div>`}).join('')}</div></section>`:''}
      <section class="s156-card"><div class="s156-head"><div><h3>Minha rede</h3><p>Pessoas que participam apenas dos recortes que você compartilha.</p></div><span class="s156-count">${members.length}</span></div>
      ${members.length?members.map(m=>{const ps=[m.permissions?.casa!==false?'Casa':'',m.permissions?.compras?'Compras':'',m.permissions?.planos?'Planos':'',m.permissions?.convites?'Convites':''].filter(Boolean);return `<div class="s156-member"><span class="s156-avatar">${avatar(m)}</span><span><strong>${esc(m.name)}</strong><small>${ps.join(' · ')||'Sem áreas compartilhadas'}</small><span class="s156-role">${m.role==='kids'?'KIDS':'ADULTO'}</span></span><div class="s156-row-actions"><button class="s156-btn" data-profile="${esc(m.id)}">Ver perfil</button><button class="s156-btn" data-edit="${esc(m.id)}">Editar</button>${m.role!=='kids'?`<button class="s156-btn rec" data-rec="${esc(m.id)}">Reconhecer</button>`:''}</div></div>`}).join(''):`<div class="s156-empty">Adicione o primeiro satélite para começar sua rede.</div>`}
      </section></div>`;

    document.querySelector('#s156Add')?.addEventListener('click',()=>openSatelliteEditor());
    document.querySelector('#s156Read')?.addEventListener('click',()=>{const x=events();x.forEach(e=>e.read=true);saveSatelliteOwnerEvents(x);renderSatellitesV157()});
    document.querySelectorAll('[data-edit]').forEach(b=>b.addEventListener('click',()=>openSatelliteEditor(b.dataset.edit)));
    document.querySelectorAll('[data-profile]').forEach(b=>b.addEventListener('click',()=>go('satelite',b.dataset.profile)));
    document.querySelectorAll('[data-rec]').forEach(b=>b.addEventListener('click',()=>{
      if(b.dataset.event) window.berthaHmlStorage?.setItem('bertha.recognition.event',b.dataset.event);
      window.berthaHmlStorage?.setItem('bertha.recognition.target.v1',b.dataset.rec);
      if(typeof r147OpenRecognition==='function') r147OpenRecognition(b.dataset.rec,b.dataset.event||'');
      else if(typeof openRecognitionModal==='function') openRecognitionModal(b.dataset.rec);
    }));
  }

  function renderSatelliteProfileV157(){
    styles();
    const id=window.berthaHmlStorage?.getItem(ACTIVE_KEY),m=member(id);
    if(!m){return go('satelites')}
    const tasks=typeof satelliteTaskList==='function'?satelliteTaskList(m.id):[];
    const prog=typeof loadKidsProgress==='function'?(loadKidsProgress()[m.id]||{lifetime:0,season:0,awards:[],log:[]}):{lifetime:0,season:0,awards:[],log:[]};
    const perms=[m.permissions?.casa!==false?'Casa':'',m.permissions?.compras?'Compras':'',m.permissions?.planos?'Planos':'',m.permissions?.convites?'Convites':''].filter(Boolean);
    app.innerHTML=`<div class="s156-page">
      <section class="s156-card"><button type="button" class="s156-btn" id="s156Back">‹ Rede BERTH.A</button><div class="s156-profile-head" style="margin-top:12px"><span class="s156-avatar">${avatar(m)}</span><div><h2>${esc(m.name)}</h2><p>${m.role==='kids'?'Perfil Kids':'Satélite adulto'}</p><div class="s156-perms">${perms.map(x=>`<span>${esc(x)}</span>`).join('')}</div></div></div></section>
      ${m.role==='kids'?`<section class="s156-card"><div class="s156-head"><div><h3>Progresso Kids</h3><p>Resumo do ciclo; a trilha completa será construída neste perfil.</p></div></div><div class="s156-events"><div class="s156-event"><span class="s156-check">★</span><div><strong>${+prog.lifetime||0} pontos acumulados</strong><small>${(prog.awards||[]).length} conquista(s) registrada(s)</small></div></div></div></section>`:''}
      <section class="s156-card"><div class="s156-head"><div><h3>${m.role==='kids'?'Missões disponíveis':'Atividades compartilhadas'}</h3><p>${tasks.length?'Ações da Casa compartilhadas com este satélite.':'Nenhuma atividade disponível agora.'}</p></div></div>
      ${tasks.length?tasks.map(({task,area})=>{const done=!!task.done,claimed=String(task.claimedById||task.assigneeId||'')===String(m.id);return `<div class="s156-task"><div><strong>${esc(task.name)}</strong><small>${esc(area?.title||'Casa')} · ${esc(task.freq||'')}</small></div><div class="s156-task-actions">${done?`<span class="s156-role">CONCLUÍDA</span>`:claimed?`<button class="s156-btn" data-start="${esc(task.id)}">Começar</button><button class="s156-btn" data-finish="${esc(task.id)}">Concluir</button>`:`<button class="s156-btn" data-accept="${esc(task.id)}">Aceitar</button>`}</div></div>`}).join(''):`<div class="s156-empty">Nada pendente por aqui.</div>`}
      </section>
      <section class="s156-card"><div class="s156-row-actions"><button class="s156-btn" id="s156Edit">Editar satélite</button>${m.role!=='kids'?`<button class="s156-btn rec" id="s156Recognize">Reconhecer</button>`:''}</div></section>
    </div>`;
    document.querySelector('#s156Back')?.addEventListener('click',()=>go('satelites'));
    document.querySelector('#s156Edit')?.addEventListener('click',()=>openSatelliteEditor(m.id));
    document.querySelector('#s156Recognize')?.addEventListener('click',()=>typeof openRecognitionModal==='function'&&openRecognitionModal(m.id));
    document.querySelectorAll('[data-accept]').forEach(b=>b.addEventListener('click',()=>setSatelliteTaskState(b.dataset.accept,m.id,'accepted')));
    document.querySelectorAll('[data-start]').forEach(b=>b.addEventListener('click',()=>setSatelliteTaskState(b.dataset.start,m.id,'in_progress')));
    document.querySelectorAll('[data-finish]').forEach(b=>b.addEventListener('click',()=>setSatelliteTaskState(b.dataset.finish,m.id,'completed')));
  }

  // This module is the only authority for Satélites.
  window.renderSatellitesV157=renderSatellitesV157;
  window.renderSatelliteProfileV157=renderSatelliteProfileV157;
  try{renderSatellites=renderSatellitesV157;window.renderSatellites=renderSatellitesV157}catch{}
  try{renderSatelliteDay=renderSatelliteProfileV157;window.renderSatelliteDay=renderSatelliteProfileV157}catch{}

  // Capture only Satélites navigation, before old listeners.
  function navHandler(e){
    const a=e.target.closest?.('#moduleMenu [data-module-route="satelites"],a[href="#satelites"]');
    if(!a)return;
    const now=Date.now(); if(now-lastNav<250){e.preventDefault();e.stopImmediatePropagation?.();return}
    lastNav=now;
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation?.();
    state.route='satelites';document.body.dataset.berthaRoute='satelites';
    try{history.replaceState({berthaRoute:'satelites'},'',location.pathname+location.search+'#satelites')}catch{}
    renderSatellitesV157();
    const dlg=document.getElementById('moduleMenu');
    requestAnimationFrame(()=>{if(dlg?.open)dlg.close()});
  }
  document.addEventListener('pointerup',navHandler,true);
  document.addEventListener('click',navHandler,true);

  // Direct-load support.
  setTimeout(()=>{
    const route=(location.hash||'').replace('#','');
    if(route==='satelites')renderSatellitesV157();
    if(route==='satelite')renderSatelliteProfileV157();
  },120);
})();
