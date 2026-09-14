/* BERTH.A v2.8.36 — Financeiro pessoal: rota persistente + privacidade + modal alinhado.
   Carregar DEPOIS de finance-v6.js, work-v12.js e bertha-time-v2.8.29.js.
   Não altera outros módulos. Preserva localStorage financeiro existente.
*/
(() => {
  'use strict';

  const FIN_HASH = '#financeiro';
  const MIGRATION_KEY = 'bertha.financeiro.personal-separation.v1';
  const BEC_BACKUP_KEY = 'minha-vida.financeiro.bec.separated.v1';
  const NOTICE_KEY = 'bertha.financeiro.notice.v1';
  const PRIVACY_KEY = 'minha-vida.financeiro.privacy.v1';
  const MASK = 'R$ ••••••';

  const esc = (s='') => String(s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const uidLocal = () => (typeof window.uid === 'function' ? window.uid() : `fin_${Date.now()}_${Math.random().toString(36).slice(2,8)}`);
  const monthKey = (d=new Date()) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  const today = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  };
  const money = n => Number(n||0).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
  const norm = s => String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const isBEC = x => /\bbec\b|bem[ -]?estar consciente/.test(norm(`${x?.name||''} ${x?.category||''} ${x?.note||''} ${x?.reason||''}`));

  function getData(){
    try { return typeof window.loadFin === 'function' ? window.loadFin() : null; }
    catch (_) { return null; }
  }
  function putData(d){
    if (!d) return;
    try { if (typeof window.saveFin === 'function') window.saveFin(d); }
    catch (_) {}
  }

  // Separa SOMENTE registros explicitamente identificados como BEC.
  // Nada é apagado: o que sai do financeiro pessoal é copiado para uma chave própria.
  function separateBECOnce(){
    if (localStorage.getItem(MIGRATION_KEY) === 'done') return;
    const d = getData();
    if (!d) return;
    const backup = {fixed:[], transactions:[], excluded:[], separatedAt:new Date().toISOString()};
    let changed = false;

    if (Array.isArray(d.fixed)) {
      const keep=[];
      d.fixed.forEach(x => { if (isBEC(x)) { backup.fixed.push(x); changed=true; } else keep.push(x); });
      d.fixed = keep;
    }
    if (Array.isArray(d.transactions)) {
      d.transactions = d.transactions.map(x => {
        if (!isBEC(x)) return x;
        backup.transactions.push(x);
        changed = true;
        return {...x, inBudget:false, personalScope:false, separatedScope:'BEC'};
      });
    }
    if (Array.isArray(d.excluded)) {
      const keep=[];
      d.excluded.forEach(x => { if (isBEC(x)) { backup.excluded.push(x); changed=true; } else keep.push(x); });
      d.excluded = keep;
    }
    if (changed) {
      try {
        const old = JSON.parse(localStorage.getItem(BEC_BACKUP_KEY) || '{"fixed":[],"transactions":[],"excluded":[]}');
        localStorage.setItem(BEC_BACKUP_KEY, JSON.stringify({
          fixed:[...(old.fixed||[]),...backup.fixed],
          transactions:[...(old.transactions||[]),...backup.transactions],
          excluded:[...(old.excluded||[]),...backup.excluded],
          separatedAt:backup.separatedAt
        }));
      } catch (_) { localStorage.setItem(BEC_BACKUP_KEY, JSON.stringify(backup)); }
      putData(d);
    }
    localStorage.setItem(MIGRATION_KEY,'done');
  }

  function currentRouteFinance(){ return location.hash === FIN_HASH; }

  function closeMenu(link){
    const dlg = link?.closest?.('dialog');
    if (dlg?.open) { try { dlg.close(); } catch (_) {} }
  }

  function valuesVisible(){ return localStorage.getItem(PRIVACY_KEY) !== 'hidden'; }
  function setValuesVisible(v){ localStorage.setItem(PRIVACY_KEY, v ? 'visible' : 'hidden'); }
  function leafMoneyElements(root){
    if(!root) return [];
    return [...root.querySelectorAll('*')].filter(el => !el.children.length && /R\$\s*(?:[\d.]+(?:,\d{2})?|•{3,})/.test(el.textContent||''));
  }
  function applyFinancePrivacy(){
    if(!currentRouteFinance()) return;
    const app=document.getElementById('app');
    const summary=app?.querySelector('.finance-summary');
    if(!app || !summary) return;
    let btn=app.querySelector('#toggleFinPrivacy');
    if(!btn){
      btn=document.createElement('button'); btn.type='button'; btn.id='toggleFinPrivacy'; btn.className='text-btn';
      const edit=app.querySelector('#editIncome');
      if(edit?.parentNode) edit.parentNode.insertBefore(btn,edit); else app.querySelector('.finance-main')?.appendChild(btn);
    }
    const visible=valuesVisible();
    btn.textContent=visible?'🙈 Ocultar valores':'👁️ Mostrar valores';
    btn.onclick=e=>{e.preventDefault();e.stopPropagation();setValuesVisible(!valuesVisible());applyFinancePrivacy();};
    leafMoneyElements(app).forEach(el=>{
      if(visible){ if(el.dataset.berthaFinanceOriginal){el.textContent=el.dataset.berthaFinanceOriginal;delete el.dataset.berthaFinanceOriginal;} }
      else { if(!el.dataset.berthaFinanceOriginal) el.dataset.berthaFinanceOriginal=el.textContent; el.textContent=(el.dataset.berthaFinanceOriginal||el.textContent).replace(/R\$\s*(?:[\d.]+(?:,\d{2})?|•{3,})/g,MASK); }
    });
  }

  function forceFinanceRender(){
    if(!currentRouteFinance()) return;
    const app=document.getElementById('app');
    const alreadyFinance=!!app?.querySelector('.finance-summary');
    if(!alreadyFinance){
      if(typeof window.renderFinanceiro==='function') window.renderFinanceiro();
      else if(typeof window.render==='function') window.render();
    }
    const title=document.getElementById('pageTitle'); if(title) title.textContent='💰 Financeiro';
    enhanceFinance();
    applyFinancePrivacy();
  }

  function openFinance(link){
    closeMenu(link);
    if(location.hash!==FIN_HASH) history.pushState(null,'',FIN_HASH);
    // Faz o render imediatamente e também depois da camada BERTH.A terminar o próprio rerender.
    [0,40,120,260,520,900].forEach(ms=>setTimeout(forceFinanceRender,ms));
  }

  document.addEventListener('click', e=>{
    const link=e.target.closest?.('a[href="#financeiro"]');
    if(!link) return;
    e.preventDefault(); e.stopImmediatePropagation();
    openFinance(link);
  }, true);

  window.addEventListener('popstate',()=>{if(currentRouteFinance()) openFinance(null);});
  window.addEventListener('hashchange',()=>{if(currentRouteFinance()) openFinance(null);});

  // Se qualquer camada global substituir a tela enquanto a URL ainda é #financeiro,
  // restaura somente o Financeiro; não interfere em nenhuma outra rota.
  let repairQueued=false;
  const routeGuard=new MutationObserver(()=>{
    if(!currentRouteFinance() || repairQueued) return;
    const app=document.getElementById('app');
    if(app?.querySelector('.finance-summary')) { applyFinancePrivacy(); return; }
    repairQueued=true;
    setTimeout(()=>{repairQueued=false;forceFinanceRender();},30);
  });
  routeGuard.observe(document.documentElement,{childList:true,subtree:true});

  function dueDateFor(bill){
    if (bill.recurrence === 'once' && bill.dueDate) return bill.dueDate;
    const [y,m] = monthKey().split('-').map(Number);
    const last = new Date(y,m,0).getDate();
    const day = Math.max(1,Math.min(last,Number(bill.dueDay||1)));
    return `${y}-${String(m).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  }
  function daysUntil(iso){
    if (!iso) return 9999;
    const a = new Date(`${today()}T12:00:00`), b = new Date(`${iso}T12:00:00`);
    return Math.round((b-a)/86400000);
  }
  function billPaidThisMonth(b){ return !!b?.paidMonths?.[monthKey()]; }
  function billStatus(b){
    if (billPaidThisMonth(b)) return {key:'paid',label:'Pago'};
    const n = daysUntil(dueDateFor(b));
    if (n < 0) return {key:'late',label:`Atrasada ${Math.abs(n)}d`};
    if (n === 0) return {key:'today',label:'Vence hoje'};
    if (n === 1) return {key:'soon',label:'Vence amanhã'};
    return {key:'future',label:`Vence em ${n}d`};
  }

  function scheduledBills(d){ return (d?.fixed||[]).filter(x => x.scheduled === true && x.personalScope !== false && !isBEC(x)); }

  function ensureStyles(){
    if (document.getElementById('finance-v2835-styles')) return;
    const s=document.createElement('style'); s.id='finance-v2835-styles'; s.textContent=`
      .fin-planned-card{display:grid;gap:10px}.fin-planned-row{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;padding:12px 0;border-top:1px solid rgba(80,60,90,.08)}.fin-planned-row:first-child{border-top:0}.fin-planned-main{min-width:0}.fin-planned-main strong{display:block}.fin-planned-main small{display:block;margin-top:4px;color:#887e89;line-height:1.35}.fin-planned-side{text-align:right;display:grid;gap:6px;justify-items:end}.fin-planned-actions{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}.fin-planned-actions button{border:0;border-radius:999px;padding:7px 10px;font-size:11px;font-weight:800}.fin-paid{background:#e6f2eb;color:#557361}.fin-edit{background:#f2eaf5;color:#765e82}.fin-status{font-size:10px;font-weight:800;border-radius:999px;padding:5px 8px;background:#f4f0f4;color:#766d77}.fin-status.late{background:#fde8e8;color:#9a5151}.fin-status.today,.fin-status.soon{background:#fff0d9;color:#8b692b}.fin-status.paid{background:#e6f2eb;color:#557361}.fin-reminder-box{padding:12px 14px;border-radius:16px;background:#fff3df;color:#775f32;margin-bottom:10px}.fin-reminder-box strong{display:block}.fin-reminder-box small{display:block;margin-top:3px;line-height:1.35}.fin-personal-note{padding:12px 14px;border-radius:16px;background:#eef5f1;color:#5e7067;margin:10px 0;font-size:12px;line-height:1.4}.fin-dlg-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}.fin-check{display:flex!important;align-items:center!important;gap:8px!important}.fin-check input{width:auto!important}.fin-dlg-actions{display:flex;gap:8px;align-items:center}.fin-dlg-actions .grow{flex:1}@media(max-width:440px){.fin-planned-row{grid-template-columns:1fr}.fin-planned-side{justify-items:start;text-align:left}.fin-planned-actions{justify-content:flex-start}.fin-dlg-grid{grid-template-columns:1fr}}
    `; document.head.appendChild(s);
  }

  function plannedSectionHtml(d){
    const bills = scheduledBills(d);
    const reminderBills = bills.filter(b => {
      if (!b.reminder || billPaidThisMonth(b)) return false;
      const n = daysUntil(dueDateFor(b));
      return n >= 0 && n <= Number(b.reminderDays ?? 3);
    });
    const rows = bills.map(b => {
      const st=billStatus(b), due=dueDateFor(b), paid=billPaidThisMonth(b);
      const repeat=b.recurrence==='once'?'avulsa':'mensal';
      return `<div class="fin-planned-row" data-bill-id="${esc(b.id)}"><div class="fin-planned-main"><strong>${esc(b.name)}</strong><small>${esc(b.category||'Outros')} · previsão R$ ${money(b.value)} · vence ${due.split('-').reverse().join('/')} · ${repeat}${b.reminder?` · lembrete ${Number(b.reminderDays||0)}d antes`:''}</small></div><div class="fin-planned-side"><span class="fin-status ${st.key}">${esc(st.label)}</span><div class="fin-planned-actions">${paid?'':`<button class="fin-paid" data-fin-bill-pay="${esc(b.id)}">✓ Marcar paga</button>`}<button class="fin-edit" data-fin-bill-edit="${esc(b.id)}">Editar</button></div></div></div>`;
    }).join('');
    return `<div class="section-title" id="finPlannedTitle">CONTAS PREVISTAS</div><section class="card fin-planned-card" id="finPlannedCard">${reminderBills.length?`<div class="fin-reminder-box"><strong>${reminderBills.length===1?'1 conta pede atenção':'Contas pedem atenção'}</strong><small>${reminderBills.map(b=>`${esc(b.name)} · ${billStatus(b).label}`).join(' • ')}</small></div>`:''}<div class="panel-head"><div><span class="eyebrow">PREVISÃO DO MÊS</span><h3>Vencimentos e lembretes</h3></div><button class="primary compact-btn" id="addScheduledBill">＋ Nova conta</button></div><div class="fin-personal-note">Financeiro pessoal. Registros identificados como BEC ficam separados e não entram aqui.</div>${rows||`<div class="empty compact"><strong>Nenhuma conta prevista.</strong><span>Cadastre aluguel, luz, água, internet, assinaturas e outros vencimentos.</span></div>`}</section>`;
  }

  function insertPlannedSection(){
    if (!currentRouteFinance()) return;
    const app=document.getElementById('app'); if(!app || app.querySelector('#finPlannedCard')) return;
    const d=getData(); if(!d) return;
    const wrap=document.createElement('div'); wrap.innerHTML=plannedSectionHtml(d);
    const title=wrap.firstElementChild, card=wrap.lastElementChild;
    const anchor=app.querySelector('.fin-quick') || app.querySelector('.finance-summary');
    if(anchor?.after){ anchor.after(card); anchor.after(title); } else { app.prepend(card); app.prepend(title); }
    bindPlannedEvents();
  }

  function refreshFinance(){
    if (typeof window.renderFinanceiro==='function') window.renderFinanceiro();
    setTimeout(enhanceFinance,0);
  }

  function openBillDialog(existing=null){
    const d=getData(); if(!d) return;
    const b=existing||{};
    const dlg=document.createElement('dialog');
    dlg.className='fin-personal-dialog';
    dlg.innerHTML=`<form method="dialog" class="modal-card fin-personal-modal" id="scheduledBillForm"><div class="modal-head"><div><div class="eyebrow">💰 PREVISTOS</div><h2>${existing?'Editar conta prevista':'Nova conta prevista'}</h2></div><button class="icon-btn" value="cancel">×</button></div><label>Conta<input id="sbName" required maxlength="100" value="${esc(b.name||'')}" placeholder="Ex.: Energia elétrica"></label><div class="fin-dlg-grid"><label>Valor previsto<input id="sbValue" type="number" min="0" step="0.01" required value="${b.value??''}"></label><label>Categoria<select id="sbCategory">${['Moradia','Alimentação','Mercado','Saúde','Farmácia','Henrique','Pets','Transporte','Combustível','Autocuidado','Assinaturas','Lazer','Compras pessoais','Casa','Educação','Dívidas','Outros'].map(x=>`<option ${x===(b.category||'Moradia')?'selected':''}>${x}</option>`).join('')}</select></label></div><div class="fin-dlg-grid"><label>Recorrência<select id="sbRec"><option value="monthly" ${b.recurrence!=='once'?'selected':''}>Mensal</option><option value="once" ${b.recurrence==='once'?'selected':''}>Somente uma vez</option></select></label><label id="sbDueDayLabel">Dia do vencimento<input id="sbDueDay" type="number" min="1" max="31" value="${b.dueDay||''}"></label></div><label id="sbDueDateLabel" hidden>Data do vencimento<input id="sbDueDate" type="date" value="${b.dueDate||today()}"></label><label class="fin-check"><input id="sbReminder" type="checkbox" ${b.reminder!==false?'checked':''}> Me lembrar desta conta</label><label id="sbReminderDaysLabel">Avisar quantos dias antes?<select id="sbReminderDays">${[0,1,3,5,7].map(n=>`<option value="${n}" ${Number(b.reminderDays??3)===n?'selected':''}>${n===0?'No vencimento':`${n} dia${n>1?'s':''} antes`}</option>`).join('')}</select></label><label>Observação <span class="muted">(opcional)</span><input id="sbNote" maxlength="180" value="${esc(b.note||'')}"></label><div class="modal-actions fin-dlg-actions">${existing?'<button type="button" class="secondary" id="sbDelete">Excluir</button>':''}<div class="grow"></div><button class="primary" value="default">Salvar</button></div><p class="note">O lembrete fica salvo na BERTH.A e aparece quando você abrir o app. Notificação garantida com o app fechado exigirá Web Push, que podemos ativar numa etapa posterior.</p></form>`;
    document.body.appendChild(dlg);
    const rec=dlg.querySelector('#sbRec'), dueDayL=dlg.querySelector('#sbDueDayLabel'), dueDateL=dlg.querySelector('#sbDueDateLabel');
    const update=()=>{const once=rec.value==='once';dueDayL.hidden=once;dueDateL.hidden=!once;}; rec.onchange=update; update();
    const reminder=dlg.querySelector('#sbReminder'), reminderL=dlg.querySelector('#sbReminderDaysLabel');
    const updRem=()=>reminderL.hidden=!reminder.checked; reminder.onchange=updRem; updRem();
    if(existing) dlg.querySelector('#sbDelete').onclick=()=>{ if(!confirm(`Excluir “${existing.name}” dos previstos?`))return; d.fixed=(d.fixed||[]).filter(x=>x.id!==existing.id); putData(d); dlg.close(); dlg.remove(); refreshFinance(); };
    dlg.querySelector('#scheduledBillForm').onsubmit=e=>{
      e.preventDefault();
      const obj={...b,id:b.id||uidLocal(),name:dlg.querySelector('#sbName').value.trim(),value:+dlg.querySelector('#sbValue').value||0,category:dlg.querySelector('#sbCategory').value,kind:'fixo',payer:'Usuária',scheduled:true,personalScope:true,recurrence:rec.value,dueDay:rec.value==='monthly'?(+dlg.querySelector('#sbDueDay').value||1):null,dueDate:rec.value==='once'?dlg.querySelector('#sbDueDate').value:null,reminder:reminder.checked,reminderDays:+dlg.querySelector('#sbReminderDays').value||0,note:dlg.querySelector('#sbNote').value.trim(),paidMonths:b.paidMonths||{}};
      const i=(d.fixed||[]).findIndex(x=>x.id===obj.id); if(i>=0)d.fixed[i]=obj; else d.fixed.push(obj);
      putData(d); dlg.close(); dlg.remove(); refreshFinance();
    };
    dlg.addEventListener('close',()=>setTimeout(()=>dlg.remove(),0),{once:true});
    dlg.showModal();
  }

  function openPayDialog(bill){
    const d=getData(); if(!d) return;
    const dlg=document.createElement('dialog');
    dlg.className='fin-personal-dialog';
    dlg.innerHTML=`<form method="dialog" class="modal-card fin-personal-modal" id="payBillForm"><div class="modal-head"><div><div class="eyebrow">💰 CONTA PREVISTA</div><h2>Marcar como paga</h2></div><button class="icon-btn" value="cancel">×</button></div><div class="capture-help"><b>${esc(bill.name)}</b><br>Previsto: R$ ${money(bill.value)} · vencimento ${dueDateFor(bill).split('-').reverse().join('/')}</div><div class="fin-dlg-grid"><label>Valor pago<input id="pbValue" type="number" min="0" step="0.01" required value="${Number(bill.value||0)}"></label><label>Data do pagamento<input id="pbDate" type="date" value="${today()}"></label></div><div class="fin-dlg-grid"><label>Como pagou<select id="pbPayment"><option>Pix</option><option>Débito automático</option><option>Boleto</option><option>Débito</option><option>Cartão de crédito</option><option>Transferência</option><option>Dinheiro</option><option>Outro</option></select></label><label>De onde saiu<select id="pbAccount"><option>Conta Itaú</option><option>Conta BB</option><option>Conta CEF</option><option>Outra conta</option></select></label></div><label class="fin-check"><input id="pbUpdateForecast" type="checkbox"> Usar o valor pago como nova previsão dos próximos meses</label><div class="modal-actions"><div class="grow"></div><button class="primary" value="default">Confirmar pagamento</button></div></form>`;
    document.body.appendChild(dlg);
    dlg.querySelector('#payBillForm').onsubmit=e=>{
      e.preventDefault(); const val=+dlg.querySelector('#pbValue').value||0, date=dlg.querySelector('#pbDate').value||today(), mk=date.slice(0,7);
      bill.paidMonths=bill.paidMonths||{}; bill.paidMonths[mk]={value:val,date};
      if(dlg.querySelector('#pbUpdateForecast').checked) bill.value=val;
      d.transactions=d.transactions||[];
      d.transactions.push({id:uidLocal(),name:bill.name,value:val,date,type:'commitment_payment',category:bill.category||'Outros',payment:dlg.querySelector('#pbPayment').value,account:dlg.querySelector('#pbAccount').value,behavior:'Planejado',installments:1,installmentCurrent:1,budgetImpact:false,inBudget:true,commitmentId:bill.id,note:'Pagamento de conta prevista'});
      putData(d); dlg.close(); dlg.remove(); refreshFinance();
    };
    dlg.addEventListener('close',()=>setTimeout(()=>dlg.remove(),0),{once:true}); dlg.showModal();
  }

  function bindPlannedEvents(){
    const app=document.getElementById('app'); if(!app)return;
    app.querySelector('#addScheduledBill')?.addEventListener('click',()=>openBillDialog());
    app.querySelectorAll('[data-fin-bill-edit]').forEach(btn=>btn.onclick=()=>{const d=getData(),b=scheduledBills(d).find(x=>x.id===btn.dataset.finBillEdit);if(b)openBillDialog(b);});
    app.querySelectorAll('[data-fin-bill-pay]').forEach(btn=>btn.onclick=()=>{const d=getData(),b=scheduledBills(d).find(x=>x.id===btn.dataset.finBillPay);if(b)openPayDialog(b);});
  }

  function ensureFinPersonalStyles(){
    if(document.getElementById('fin-personal-v2836-styles')) return;
    const s=document.createElement('style'); s.id='fin-personal-v2836-styles';
    s.textContent=`
      dialog.fin-personal-dialog{position:fixed;inset:0;margin:auto;width:min(560px,calc(100vw - 24px));max-width:calc(100vw - 24px);max-height:calc(100dvh - 24px);padding:0;border:0;background:transparent;overflow:visible}
      dialog.fin-personal-dialog::backdrop{background:rgba(30,24,32,.28);backdrop-filter:blur(2px)}
      .fin-personal-modal{box-sizing:border-box;width:100%;max-height:calc(100dvh - 24px);overflow:auto;margin:0!important;border-radius:26px;padding:20px}
      .fin-personal-modal .fin-dlg-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
      .fin-personal-modal label{min-width:0}
      .fin-personal-modal input,.fin-personal-modal select,.fin-personal-modal textarea{box-sizing:border-box;width:100%;max-width:100%}
      @media(max-width:480px){dialog.fin-personal-dialog{width:calc(100vw - 20px);max-width:calc(100vw - 20px);max-height:calc(100dvh - 20px)}.fin-personal-modal{max-height:calc(100dvh - 20px);padding:18px;border-radius:24px}.fin-personal-modal .fin-dlg-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(s);
  }

  function enhanceFinance(){
    ensureFinPersonalStyles();
    if(!currentRouteFinance())return;
    ensureStyles();
    // Remove da visualização qualquer card explicitamente BEC que uma versão antiga tenha renderizado.
    document.querySelectorAll('#app .finance-row,#app .excluded-card,#app .card').forEach(el=>{if(isBEC({name:el.textContent}) && !el.closest('#finPlannedCard')) el.remove();});
    insertPlannedSection();
  }

  const mo=new MutationObserver(()=>{if(currentRouteFinance())setTimeout(enhanceFinance,0);});
  mo.observe(document.documentElement,{subtree:true,childList:true});

  separateBECOnce();
  ensureFinPersonalStyles();
  ensureStyles();
  if(currentRouteFinance()) setTimeout(()=>openFinance(null),50);
  if(currentRouteFinance()) setTimeout(forceFinanceRender,0);
})();
