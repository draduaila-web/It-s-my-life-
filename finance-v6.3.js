/* =========================================================
   MINHA VIDA · FINANCEIRO v7
   Camada incremental carregada DEPOIS de app.js.
   Preserva localStorage v3 e não altera outros módulos.
========================================================= */
(function(){
  'use strict';

  const V6_CATEGORIES=["Moradia","Alimentação","Mercado","Saúde","Farmácia","Henrique","Pets","Transporte","Combustível","Autocuidado","Assinaturas","Lazer","Compras pessoais","Casa","Educação","Trabalho","Dívidas","Outros"];
  const V6_PAYMENT=["Cartão de crédito","Pix","Débito","Dinheiro","Boleto","Débito automático","Transferência","Outro"];
  const V6_TYPES=[
    ["expense","Compra / despesa"],
    ["commitment_payment","Pagamento de compromisso já previsto"],
    ["invoice_payment","Pagamento de fatura"],
    ["refund","Estorno / devolução"],
    ["fee","Juros / encargo"],
    ["income","Receita"],
    ["goal_contribution","Aporte em meta"],
    ["transfer","Transferência entre contas"]
  ];
  const V6_BEHAVIOR=["Essencial","Planejado","Variável","Impulso"];
  const V6_CARD_ACCOUNTS=["Itaú 4590","Itaú 5298","BB","CEF"];
  const V6_BANK_ACCOUNTS=["Conta Itaú","Conta BB","Conta CEF","Outra conta"];
  const TYPE_LABEL=Object.fromEntries(V6_TYPES);

  // Privacidade v6.1: mascara qualquer valor renderizado pelo Financeiro.
  function finDisplayMoney(value){
    return finPrivacy() ? finMoney(value) : 'R$ ••••••';
  }

  function finV6Normalize(d){
    const x=(typeof finNormalize==='function'?finNormalize(d):d)||{};
    x.transactions=(x.transactions||[]).map(t=>({
      type:'expense',
      budgetImpact:t.type==='invoice_payment'?false:(t.budgetImpact!==false),
      installmentCurrent:t.installmentCurrent||1,
      installmentValue:t.installmentValue||null,
      ...t
    }));
    x.rules=Array.isArray(x.rules)?x.rules:[];
    x.goalMeta=x.goalMeta||{name:'Troca do carro',minimum:8000,ideal:12000,deadline:'2026-12-31',plannedMonthly:2500};
    x.loan={status:'Ativo',institution:'',interest:null,...(x.loan||{})};
    x.plannedBills=Array.isArray(x.plannedBills)?x.plannedBills:[];
    return x;
  }

  const originalLoadFin=window.loadFin;
  window.loadFin=function(){return finV6Normalize(originalLoadFin());};

  // BERTH.A é pessoal. Registros explicitamente identificados como BEC continuam
  // armazenados, mas não participam da visão nem dos cálculos pessoais.
  function isBecRecord(x){
    if(!x) return false;
    const bag=[x.name,x.category,x.source,x.scope,x.note,x.payer].filter(Boolean).join(' ').toLowerCase();
    return /(^|[^a-z])bec([^a-z]|$)|bem[- ]estar consciente/.test(bag);
  }
  function personalOnly(list){return (list||[]).filter(x=>!isBecRecord(x));}

  // Shell local para modais do Financeiro. Não toca no roteador/global.
  function finDialogShell(title,body,saveLabel='Salvar'){
    const dlg=document.createElement('dialog');
    dlg.className='study-v10-dialog fin-v41-dialog';
    dlg.innerHTML=`<form class="study-v10-modal fin-v41-modal" id="finForm">
      <div class="study-v10-head"><div><div class="eyebrow">💰 FINANCEIRO</div><h2>${escapeHtml(title)}</h2></div><button type="button" class="study-v10-x" data-fin-close>×</button></div>
      ${body}
      <div class="study-v10-actions"><button type="button" class="secondary" data-fin-close>Cancelar</button><button class="primary" type="submit">${escapeHtml(saveLabel)}</button></div>
    </form>`;
    document.body.appendChild(dlg);
    const close=()=>{if(dlg.open)dlg.close();};
    dlg.querySelectorAll('[data-fin-close]').forEach(b=>b.onclick=close);
    dlg.addEventListener('click',e=>{if(e.target===dlg)close();});
    dlg.addEventListener('close',()=>dlg.remove(),{once:true});
    dlg.showModal();
    return {dlg,close};
  }

  function txBudgetEffect(d,t){
    if(typeof finTxInBudget==='function' && !finTxInBudget(d,t)) return 0;
    const v=Number(t.value||0),type=t.type||'expense';
    if(type==='invoice_payment'||type==='transfer'||type==='goal_contribution'||type==='commitment_payment') return 0;
    if(type==='refund') return -v;
    if(type==='income') return -v;
    return v;
  }
  function txExpenseEffect(d,t){
    if(typeof finTxInBudget==='function' && !finTxInBudget(d,t)) return 0;
    const v=Number(t.value||0),type=t.type||'expense';
    if(type==='expense'||type==='fee'||type==='commitment_payment') return v;
    if(type==='refund') return -v;
    return 0;
  }
  function monthTx(d,month){return personalOnly(d.transactions).filter(t=>(t.date||'').slice(0,7)===month);}
  function fixedCommitments(d){return personalOnly(d.fixed).filter(x=>x.kind!=='teto').reduce((s,x)=>s+Number(x.value||0),0)+Number(d.loan?.inBudget!==false?d.loan?.monthlyPayment||0:0);}
  function budgetCaps(d){return personalOnly(d.fixed).filter(x=>x.kind==='teto').reduce((s,x)=>s+Number(x.value||0),0);}
  function realizedExpenses(d,month){return monthTx(d,month).reduce((s,t)=>s+txExpenseEffect(d,t),0);}
  function newBudgetImpact(d,month){return monthTx(d,month).reduce((s,t)=>s+txBudgetEffect(d,t),0);}
  function monthIncome(d,month){return monthTx(d,month).filter(t=>t.type==='income'&&finTxInBudget(d,t)).reduce((s,t)=>s+Number(t.value||0),0);}
  function goalContrib(d){return (d.transactions||[]).filter(t=>t.type==='goal_contribution').reduce((s,t)=>s+Number(t.value||0),0);}

  function categoryTotalsV6(d,month){
    const out={};
    monthTx(d,month).forEach(t=>{
      const v=txExpenseEffect(d,t); if(!v) return;
      const k=t.category||'Outros'; out[k]=(out[k]||0)+v;
    });
    return out;
  }
  function txTypeBadge(t){const label=TYPE_LABEL[t.type||'expense']||'Despesa';return `<span class="fin-type-pill">${escapeHtml(label)}</span>`;}
  function finTransactionHtmlV6(d,x){
    const meta=[x.date?formatDate(x.date):'',x.category||'Outros',x.payment||'',x.account||'',x.behavior||''].filter(Boolean).join(' · ');
    const outside=!finTxInBudget(d,x), noDouble=['invoice_payment','commitment_payment','transfer','goal_contribution'].includes(x.type);
    return `<article class="card finance-row ${outside?'outside-budget':''}"><div><strong>${escapeHtml(x.name||'Movimentação')}</strong><span>${escapeHtml(meta)}${outside?' · fora do orçamento':''}</span><div class="fin-row-tags">${txTypeBadge(x)}${noDouble?'<span class="fin-no-double">não reduz disponível novamente</span>':''}${x.installments>1?`<span class="fin-type-pill">${Number(x.installmentCurrent||1)}/${Number(x.installments)}</span>`:''}</div></div><b>${finDisplayMoney(x.value)}</b><button class="mini-delete" data-fin-delete="${x.id}" aria-label="Excluir">×</button></article>`;
  }


  const FIN_REMINDERS=[0,1,3,5,7];
  function isoLocal(d){const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`;}
  function monthDate(month,day){
    const [y,m]=month.split('-').map(Number),last=new Date(y,m,0).getDate();
    return `${y}-${String(m).padStart(2,'0')}-${String(Math.min(Math.max(1,Number(day)||1),last)).padStart(2,'0')}`;
  }
  function plannedOccurrence(b,month){
    if(!b||b.active===false||isBecRecord(b)) return null;
    let due='';
    if((b.recurrence||'once')==='monthly'){
      const start=b.startMonth||(b.dueDate||'').slice(0,7)||month;
      if(month<start)return null;
      due=monthDate(month,b.dueDay||Number((b.dueDate||'').slice(8,10))||1);
    }else{
      if(!(b.dueDate||'').startsWith(month))return null;
      due=b.dueDate;
    }
    const p=(b.payments||{})[month]||null;
    return {bill:b,month,due,paid:!!p?.paid,payment:p,expected:Number(b.value||0),actual:p?.value!=null?Number(p.value):null};
  }
  function plannedMonth(d,month){return personalOnly(d.plannedBills).map(b=>plannedOccurrence(b,month)).filter(Boolean).sort((a,b)=>a.due.localeCompare(b.due));}
  function plannedOpenTotal(d,month){return plannedMonth(d,month).filter(o=>!o.paid).reduce((s,o)=>s+o.expected,0);}
  function plannedPaidTotal(d,month){return plannedMonth(d,month).filter(o=>o.paid).reduce((s,o)=>s+Number(o.actual??o.expected),0);}
  function daysTo(dateIso){const a=new Date(todayISO()+'T12:00:00'),b=new Date(dateIso+'T12:00:00');return Math.round((b-a)/86400000);}
  function plannedStatus(o){
    if(o.paid)return {label:'Pago',cls:'paid'};
    const n=daysTo(o.due);
    if(n<0)return {label:`Atrasada ${Math.abs(n)}d`,cls:'late'};
    if(n===0)return {label:'Vence hoje',cls:'today'};
    if(n===1)return {label:'Vence amanhã',cls:'soon'};
    return {label:`Vence em ${n}d`,cls:n<=Number(o.bill.reminderDays??3)?'soon':'future'};
  }
  function plannedAlerts(d,month){
    return plannedMonth(d,month).filter(o=>{if(o.paid)return false;const n=daysTo(o.due),r=Number(o.bill.reminderDays??3);return n<=r;});
  }
  function plannedBillHtml(o){
    const st=plannedStatus(o),b=o.bill;
    return `<article class="card planned-bill-row ${st.cls}"><div class="planned-bill-copy"><div class="planned-bill-top"><strong>${escapeHtml(b.name||'Conta prevista')}</strong><span class="fin-status ${st.cls}">${escapeHtml(st.label)}</span></div><span>${escapeHtml(b.category||'Outros')} · vence ${formatDate(o.due)}${(b.recurrence||'once')==='monthly'?' · mensal':''}${b.reminderDays!=null?` · lembrete ${Number(b.reminderDays)===0?'no dia':Number(b.reminderDays)+'d antes'}`:''}</span>${b.note?`<small>${escapeHtml(b.note)}</small>`:''}</div><div class="planned-bill-side"><b>${finDisplayMoney(o.paid?(o.actual??o.expected):o.expected)}</b><div class="planned-bill-actions">${o.paid?`<button type="button" class="secondary tiny" data-bill-unpay="${b.id}" data-month="${o.month}">Desfazer</button>`:`<button type="button" class="primary tiny" data-bill-pay="${b.id}" data-month="${o.month}">Marcar paga</button>`}<button type="button" class="secondary tiny" data-bill-edit="${b.id}">Editar</button></div></div></article>`;
  }
  function openPlannedBillModal(id){
    const d=loadFin(),existing=(d.plannedBills||[]).find(x=>x.id===id),b=existing||{id:uid(),name:'',value:'',category:'Moradia',dueDate:todayISO(),recurrence:'monthly',reminderDays:3,note:'',active:true,payments:{}};
    const body=`<label>Conta / compromisso<input id="pbName" required maxlength="100" value="${escapeHtml(b.name||'')}" placeholder="Ex.: Energia elétrica"></label><div class="form-grid"><label>Valor previsto<input id="pbValue" required type="number" min="0" step="0.01" value="${b.value||''}"></label><label>Categoria<select id="pbCategory">${optionsHtml(V6_CATEGORIES,b.category||'Moradia')}</select></label></div><div class="form-grid"><label>Próximo vencimento<input id="pbDue" required type="date" value="${b.dueDate||todayISO()}"></label><label>Recorrência<select id="pbRecurrence"><option value="monthly" ${(b.recurrence||'monthly')==='monthly'?'selected':''}>Todo mês</option><option value="once" ${b.recurrence==='once'?'selected':''}>Somente esta vez</option></select></label></div><div class="form-grid"><label>Lembrar<select id="pbReminder">${FIN_REMINDERS.map(n=>`<option value="${n}" ${Number(b.reminderDays??3)===n?'selected':''}>${n===0?'No vencimento':n+' dia'+(n===1?'':'s')+' antes'}</option>`).join('')}</select></label><label>Status<select id="pbActive"><option value="1" ${b.active!==false?'selected':''}>Ativa</option><option value="0" ${b.active===false?'selected':''}>Pausada</option></select></label></div><label>Observação <span class="muted">(opcional)</span><input id="pbNote" maxlength="180" value="${escapeHtml(b.note||'')}"></label>${existing?`<button type="button" class="danger fin-delete-bill" id="deletePlannedBill">Excluir conta prevista</button>`:''}<div class="capture-help"><b>Lembrete:</b> nesta fase a BERTH.A avisa dentro do app. Notificação garantida com o app fechado exigirá Web Push depois.</div>`;
    const {dlg,close}=finDialogShell(existing?'Editar conta prevista':'Nova conta prevista',body);
    dlg.querySelector('#deletePlannedBill')?.addEventListener('click',()=>{if(!confirm(`Excluir “${b.name||'esta conta'}”?`))return;d.plannedBills=(d.plannedBills||[]).filter(x=>x.id!==b.id);saveFin(d);close();renderFinanceiroV6();});
    dlg.querySelector('#finForm').addEventListener('submit',e=>{e.preventDefault();const due=dlg.querySelector('#pbDue').value,rec=dlg.querySelector('#pbRecurrence').value,obj={...b,name:dlg.querySelector('#pbName').value.trim(),value:+dlg.querySelector('#pbValue').value||0,category:dlg.querySelector('#pbCategory').value,dueDate:due,recurrence:rec,startMonth:rec==='monthly'?(b.startMonth||due.slice(0,7)):due.slice(0,7),dueDay:Number(due.slice(8,10))||1,reminderDays:+dlg.querySelector('#pbReminder').value||0,note:dlg.querySelector('#pbNote').value.trim(),active:dlg.querySelector('#pbActive').value==='1',payments:b.payments||{},updatedAt:Date.now()};d.plannedBills=existing?(d.plannedBills||[]).map(x=>x.id===obj.id?obj:x):[...(d.plannedBills||[]),obj];saveFin(d);close();renderFinanceiroV6();});
  }
  function openPayPlannedBill(id,month){
    const d=loadFin(),b=(d.plannedBills||[]).find(x=>x.id===id),o=b&&plannedOccurrence(b,month);if(!b||!o)return;
    const body=`<div class="capture-help"><b>${escapeHtml(b.name)}</b><br>Previsto: ${finDisplayMoney(o.expected)} · vencimento ${formatDate(o.due)}.</div><div class="form-grid"><label>Valor pago<input id="pbActual" required type="number" min="0" step="0.01" value="${o.expected}"></label><label>Data do pagamento<input id="pbPaidDate" required type="date" value="${todayISO()}"></label></div><label>Como pagou<select id="pbPayment">${optionsHtml(V6_PAYMENT,'Pix')}</select></label><label>De onde saiu<select id="pbAccount"></select></label>`;
    const {dlg,close}=finDialogShell('Marcar conta como paga',body,'Confirmar pagamento');const payment=dlg.querySelector('#pbPayment'),account=dlg.querySelector('#pbAccount');const upd=()=>account.innerHTML=accountOptions(payment.value,'');payment.onchange=upd;upd();
    dlg.querySelector('#finForm').addEventListener('submit',e=>{e.preventDefault();const val=+dlg.querySelector('#pbActual').value||0,date=dlg.querySelector('#pbPaidDate').value;b.payments=b.payments||{};b.payments[month]={paid:true,value:val,date,payment:payment.value,account:account.value,at:Date.now()};const exists=(d.transactions||[]).find(t=>t.plannedBillId===b.id&&t.plannedBillMonth===month);const tx={id:exists?.id||uid(),name:b.name,value:val,date,type:'expense',category:b.category||'Outros',payment:payment.value,account:account.value,behavior:'Planejado',installments:1,installmentCurrent:1,note:'Conta prevista · paga',plannedBillId:b.id,plannedBillMonth:month,budgetImpact:true,updatedAt:Date.now()};d.transactions=exists?(d.transactions||[]).map(t=>t.id===exists.id?tx:t):[...(d.transactions||[]),tx];saveFin(d);close();renderFinanceiroV6();});
  }
  function undoPlannedPayment(id,month){const d=loadFin(),b=(d.plannedBills||[]).find(x=>x.id===id);if(!b)return;if(b.payments)delete b.payments[month];d.transactions=(d.transactions||[]).filter(t=>!(t.plannedBillId===id&&t.plannedBillMonth===month));saveFin(d);renderFinanceiroV6();}
  function renderFinanceiroV6(){
    const d=loadFin(),month=finCurrentMonth(),committed=fixedCommitments(d),caps=budgetCaps(d),realized=realizedExpenses(d,month),impact=newBudgetImpact(d,month),extraIncome=monthIncome(d,month),available=Number(d.income||0)+extraIncome-committed-impact,cats=categoryTotalsV6(d,month),visible=finPrivacy();
    const bills=plannedMonth(d,month),openBills=plannedOpenTotal(d,month),paidBills=plannedPaidTotal(d,month),alerts=plannedAlerts(d,month);
    const catHtml=Object.entries(cats).filter(([,v])=>v!==0).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([k,v])=>`<div class="finance-cat"><span>${escapeHtml(k)}</span><strong>${finDisplayMoney(v)}</strong></div>`).join('')||`<div class="empty compact"><strong>Nenhum gasto classificado neste mês.</strong><span>Quando você registrar ou importar movimentações, elas aparecem aqui.</span></div>`;
    const legacyGoal=(d.goals||[]).reduce((s,g)=>s+Number(g.saved||0),0),contrib=goalContrib(d),goalTotal=Math.max(legacyGoal,contrib),goal=d.goalMeta||{},progress=goal.ideal?Math.min(100,Math.round(goalTotal/goal.ideal*100)):0;
    const alertHtml=alerts.length?`<section class="fin-due-alert"><strong>🔔 ${alerts.length===1?'1 conta pede atenção':alerts.length+' contas pedem atenção'}</strong><span>${alerts.slice(0,3).map(o=>`${escapeHtml(o.bill.name)} · ${escapeHtml(plannedStatus(o).label)}`).join('<br>')}</span></section>`:'';
    const billsHtml=bills.map(plannedBillHtml).join('')||`<div class="empty compact"><strong>Nenhuma conta prevista neste mês.</strong><span>Cadastre vencimentos para a BERTH.A lembrar você e construir o histórico mensal.</span></div>`;
    app.innerHTML=`<section class="hero"><h2>💰 Financeiro</h2><p>Seu dinheiro pessoal: previsto, realizado e compromissos do mês. BEC fica fora desta visão.</p></section>
    <section class="finance-summary card"><div class="finance-main"><span class="eyebrow">RENDA MENSAL</span><strong>${finDisplayMoney(d.income)}</strong><div class="finance-actions"><button class="text-btn" id="toggleFinPrivacy">${visible?'🙈 Ocultar valores':'👁️ Mostrar valores'}</button><button class="text-btn" id="editIncome">editar</button></div></div><div class="finance-metrics v6"><div><span>Comprometido</span><b>${finDisplayMoney(committed)}</b><small>orçamento base + empréstimo</small></div><div><span>Realizado no mês</span><b>${finDisplayMoney(realized)}</b><small>saídas pessoais efetivas</small></div><div><span>Previstos em aberto</span><b>${finDisplayMoney(openBills)}</b><small>contas com vencimento</small></div><div><span>Disponível estimado</span><b>${finDisplayMoney(available)}</b><small>sem BEC</small></div></div></section>
    ${alertHtml}
    <div class="section-title">CONTAS PREVISTAS · ${escapeHtml(finMonthLabel(month))}</div><section class="card planned-bills-panel"><div class="panel-head"><div><span class="eyebrow">VENCIMENTOS</span><h3>O que ainda vem pela frente</h3><p class="note">Pago via previstos neste mês: <b>${finDisplayMoney(paidBills)}</b></p></div><button class="primary compact-btn" id="addPlannedBill">＋ Nova conta</button></div><div class="planned-bills-list">${billsHtml}</div></section>
    <div class="fin-quick v6"><button class="primary" id="addTransaction">＋ Registrar</button><button class="secondary" id="quickCapture">⚡ Captura rápida</button><button class="secondary" id="addPlan">🗓️ Planejar</button></div>
    <div class="section-title">CAPTURA & IMPORTAÇÃO</div><section class="card import-card v6"><div><span class="eyebrow">RÁPIDO NO IPHONE</span><h3>Digite, cole ou fotografe</h3><p class="note">Ex.: “42 farmácia pix BB”. O sistema interpreta, sugere e só salva depois da sua confirmação.</p></div><div class="import-actions"><button class="primary compact-btn" id="quickCapture2">Interpretar texto</button><button class="secondary compact-btn" id="photoCapture">📷 Fotografar</button><input id="receiptCamera" type="file" accept="image/*" capture="environment" hidden></div></section>
    <div class="section-title">IMPORTAR EXTRATO / FATURA</div><section class="import-file-grid"><button class="card import-file-card" id="importCsvCard" type="button"><span class="import-file-icon">📊</span><span><strong>Importar CSV / Excel</strong><small>CSV já pode ser lido. Excel entra pelo mesmo fluxo e será ativado na próxima etapa.</small></span><b>›</b></button><button class="card import-file-card" id="importPdfCard" type="button"><span class="import-file-icon">📄</span><span><strong>Importar PDF / imagem</strong><small>Imagem abre a prévia; PDF fica preparado para o leitor avançado.</small></span><b>›</b></button><input id="financeCsvFile" type="file" accept=".csv,.txt,.xlsx,.xls,text/csv" hidden><input id="financePdfFile" type="file" accept="application/pdf,image/*" hidden></section><section class="fin-security-note"><span>🔒</span><div><strong>Regra de segurança</strong><small>Pagamento de fatura nunca entra novamente como uma nova despesa.</small></div></section>
    <div class="section-title">CARTÕES & FATURAS</div><section class="fin-card-grid">${d.cards.map(finCardHtml).join('')}</section><p class="fin-helper">Compra = despesa. Pagamento da fatura = liquidação e não entra novamente como gasto.</p>
    <div class="section-title">EMPRÉSTIMO</div><section class="card loan-card"><div class="panel-head"><div><span class="eyebrow">COMPROMISSO MENSAL</span><h3>${escapeHtml(d.loan.name||'Empréstimo')}</h3></div><button class="secondary compact-btn" id="editLoan">Editar</button></div><strong class="loan-value">${finDisplayMoney(d.loan.monthlyPayment||0)}</strong><span>${[d.loan.institution,d.loan.dueDay?`vence dia ${d.loan.dueDay}`:'',d.loan.totalInstallments?`${Math.max(0,Number(d.loan.totalInstallments)-Number(d.loan.paidInstallments||0))} parcelas restantes`:'',d.loan.status].filter(Boolean).map(escapeHtml).join(' · ')}</span></section>
    <div class="section-title">ORÇAMENTO BASE</div><div class="list">${personalOnly(d.fixed).map(finFixedHtml).join('')}</div><button class="add-full secondary" id="addFixed">＋ Adicionar item ao orçamento</button>
    <div class="section-title">MOVIMENTAÇÕES DO MÊS</div><section class="card"><div class="panel-head"><div><span class="eyebrow">${escapeHtml(finMonthLabel(month))}</span><h3>O que aconteceu de verdade</h3></div><button class="primary compact-btn" id="addTransaction2">＋ Registrar</button></div><div class="list inner-list">${personalOnly(d.transactions).slice().reverse().filter(x=>(x.date||'').slice(0,7)===month).slice(0,40).map(x=>finTransactionHtmlV6(d,x)).join('')||`<div class="empty compact"><strong>Nenhuma movimentação registrada.</strong><span>Use Registrar ou Captura rápida.</span></div>`}</div></section>
    <div class="section-title">POR CATEGORIA</div><section class="card finance-cats">${catHtml}</section>
    <div class="section-title">META · ${escapeHtml(goal.name||'Troca do carro')}</div><section class="card goal-card"><div class="panel-head"><div><span class="eyebrow">ATÉ DEZEMBRO</span><h3>${escapeHtml(goal.name||'Troca do carro')}</h3></div><span class="pill today">${progress}%</span></div><div class="fin-progress"><i style="width:${progress}%"></i></div><p class="note">Acumulado: <b>${finDisplayMoney(goalTotal)}</b> · mínimo ${finDisplayMoney(goal.minimum||8000)} · ideal ${finDisplayMoney(goal.ideal||12000)}.</p><button class="secondary compact-btn" id="addGoalContribution">＋ Registrar aporte</button></section>
    <div class="section-title">PRÓXIMAS AÇÕES FINANCEIRAS</div><section class="card"><div class="panel-head"><div><span class="eyebrow">O QUÊ · COMO · ONDE · QUANDO</span><h3>Planejamento</h3></div><button class="secondary compact-btn" id="addPlan2">＋ Nova</button></div><div class="list inner-list">${d.plans.map(finPlanHtml).join('')||`<div class="empty compact"><strong>Nenhuma ação pendente.</strong><span>Ex.: revisar fatura, pagar boleto, conferir extrato ou fazer aporte.</span></div>`}</div></section>`;
    ensureFinanceStylesV6();
    document.getElementById('toggleFinPrivacy').onclick=()=>{setFinPrivacy(!finPrivacy());renderFinanceiroV6();};
    document.getElementById('editIncome').onclick=()=>openFinModalV6('income');
    document.getElementById('addPlannedBill').onclick=()=>openPlannedBillModal();
    document.querySelectorAll('[data-bill-edit]').forEach(b=>b.onclick=()=>openPlannedBillModal(b.dataset.billEdit));
    document.querySelectorAll('[data-bill-pay]').forEach(b=>b.onclick=()=>openPayPlannedBill(b.dataset.billPay,b.dataset.month));
    document.querySelectorAll('[data-bill-unpay]').forEach(b=>b.onclick=()=>undoPlannedPayment(b.dataset.billUnpay,b.dataset.month));
    document.getElementById('addFixed').onclick=()=>openFinModalV6('fixed');
    document.getElementById('addTransaction').onclick=document.getElementById('addTransaction2').onclick=()=>openFinModalV6('transaction');
    document.getElementById('quickCapture').onclick=document.getElementById('quickCapture2').onclick=()=>openQuickCapture();
    document.getElementById('addPlan').onclick=()=>openSmartPlanner();
    document.getElementById('addPlan2').onclick=()=>openFinPlanModal();
    document.getElementById('editLoan').onclick=()=>openFinLoanModalV6();
    document.getElementById('addGoalContribution').onclick=()=>openFinModalV6('goal');
    document.getElementById('photoCapture').onclick=()=>document.getElementById('receiptCamera').click();
    document.getElementById('receiptCamera').onchange=e=>openReceiptPreview(e.target.files?.[0]);
    document.getElementById('importCsvCard').onclick=()=>document.getElementById('financeCsvFile').click();
    document.getElementById('importPdfCard').onclick=()=>document.getElementById('financePdfFile').click();
    document.getElementById('financeCsvFile').onchange=e=>handleFinanceCsvFile(e.target.files?.[0]);
    document.getElementById('financePdfFile').onchange=e=>handleFinancePdfFile(e.target.files?.[0]);
    document.querySelectorAll('[data-fin-delete]').forEach(b=>b.onclick=()=>{const x=loadFin();x.transactions=x.transactions.filter(t=>t.id!==b.dataset.finDelete);saveFin(x);renderFinanceiroV6();});
    document.querySelectorAll('[data-fin-plan]').forEach(b=>b.onclick=()=>{const x=loadFin(),p=x.plans.find(q=>q.id===b.dataset.finPlan);if(p){p.done=!p.done;saveFin(x);renderFinanceiroV6();}});
  }
  window.renderFinanceiro=renderFinanceiroV6;
  // v7.3: v2.8.40 roteia Financeiro pela referência estável abaixo.
  // Atualizamos somente o renderer do módulo; o roteador permanece congelado.
  window.__berthaCoreRenderFinanceiro=renderFinanceiroV6;

  function ensureFinanceStylesV6(){
    ensureFinanceStyles();
    if(document.getElementById('finance-v7-addon')) return;
    const s=document.createElement('style');s.id='finance-v7-addon';s.textContent=`
      .finance-metrics.v6{grid-template-columns:repeat(2,1fr)!important}.finance-metrics.v6 small{display:block;color:#9a909a;font-size:10px;margin-top:3px}.fin-quick.v6{grid-template-columns:1fr 1fr 1fr}.import-card.v6{align-items:center}.import-actions{display:flex;gap:8px;flex-wrap:wrap}.fin-row-tags{display:flex;gap:6px;flex-wrap:wrap;margin-top:7px}.fin-type-pill,.fin-no-double{display:inline-flex!important;width:auto!important;padding:4px 7px;border-radius:999px;background:#f1e9f5;color:#745487!important;font-size:10px!important;font-weight:800}.fin-no-double{background:#e8f2ec;color:#527060!important}.fin-progress{height:10px;border-radius:999px;background:#eee7f0;overflow:hidden;margin:12px 0}.fin-progress i{display:block;height:100%;background:linear-gradient(90deg,#d8bfdc,#c9dfd5);border-radius:inherit}.quick-capture textarea{min-height:150px;resize:vertical}.capture-help{background:#f8f3ee;border-radius:16px;padding:12px 14px;color:#766d77;font-size:12px;margin-bottom:14px}.capture-review{display:grid;gap:10px}.capture-item{border:1px solid rgba(92,72,104,.11);border-radius:18px;padding:13px;background:#fff}.capture-item-compact{padding:14px 15px}.capture-summary{min-width:0;flex:1}.capture-summary strong{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.capture-summary .note{margin-top:4px;line-height:1.35}.capture-edit-btn{margin-top:10px;border:0;background:#f1e8f7;color:#75528a;border-radius:999px;padding:8px 13px;font-weight:800;font-size:12px}.capture-details{margin-top:8px}.capture-details[hidden]{display:none!important}.capture-top{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.capture-top strong{font-size:15px}.capture-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.capture-grid label{margin:0!important}.dup-warning{padding:8px 10px;border-radius:12px;background:#fff1dc;color:#8a641e;font-size:11px;font-weight:700;margin-top:8px}.receipt-preview{width:100%;max-height:42vh;object-fit:contain;border-radius:18px;background:#f5f1ed}.capture-toggle{display:flex!important;align-items:center;gap:8px!important;margin:8px 0 0!important}.capture-toggle input{width:auto!important}.import-file-grid{display:grid;gap:10px}.import-file-card{width:100%;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:12px;text-align:left;border:none;cursor:pointer}.import-file-card span:nth-child(2){display:grid;gap:4px}.import-file-card strong{font-size:15px}.import-file-card small{font-size:11px;color:#8d838f;line-height:1.35}.import-file-card>b{font-size:28px;color:#845ca0;font-weight:400}.import-file-icon{font-size:24px}.fin-security-note{display:flex;gap:10px;align-items:flex-start;padding:14px 16px;border-radius:18px;background:#f1e8f7;color:#6d4f81;margin-top:10px}.fin-security-note div{display:grid;gap:3px}.fin-security-note small{color:#7f6f86;line-height:1.35}.planner-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}.planner-metric{padding:12px;border-radius:16px;background:#faf7fb}.planner-metric span{display:block;color:#8b7f8f;font-size:11px}.planner-metric b{display:block;margin-top:4px;font-size:16px}.planner-section{margin-top:15px}.planner-section h4{margin:0 0 8px;font-size:13px;color:#5f5265}.planner-suggestions{display:grid;gap:8px}.planner-suggestion{padding:11px 12px;border-radius:15px;background:#f8f3ee;font-size:12px;line-height:1.4;color:#6f6570}.planner-sim-result{padding:13px;border-radius:16px;background:#edf5f1;margin-top:10px}.planner-sim-result strong{display:block;font-size:17px;margin-top:3px}.planner-action-row{display:flex;gap:8px;flex-wrap:wrap}.planner-action-row button{flex:1;min-width:130px}
      .fin-v41-dialog{padding:0;border:0;background:transparent;max-width:none}.fin-v41-dialog::backdrop{background:rgba(50,43,53,.30);backdrop-filter:blur(3px)}.fin-v41-modal{box-sizing:border-box;width:min(92vw,520px);max-height:88vh;overflow:auto;margin:auto}.planned-bills-panel{padding:16px}.planned-bills-list{display:grid;gap:9px;margin-top:12px}.planned-bill-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center;padding:13px 14px!important}.planned-bill-copy{min-width:0}.planned-bill-top{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.planned-bill-copy>span,.planned-bill-copy>small{display:block;color:#857b87;font-size:11px;margin-top:4px}.planned-bill-side{text-align:right}.planned-bill-side>b{display:block}.planned-bill-actions{display:flex;gap:5px;justify-content:flex-end;flex-wrap:wrap;margin-top:7px}.planned-bill-actions .tiny{padding:6px 8px!important;font-size:10px!important;border-radius:10px!important}.fin-status{display:inline-flex;padding:4px 7px;border-radius:999px;font-size:10px;font-weight:800;background:#f3eef5;color:#775b87}.fin-status.paid{background:#e5f1e9;color:#52705d}.fin-status.late{background:#fbe8e8;color:#99595d}.fin-status.today,.fin-status.soon{background:#fff0d7;color:#8c6721}.fin-due-alert{margin:10px 0 18px;padding:13px 15px;border-radius:18px;background:linear-gradient(135deg,#fff0d8,#f9e9ef);border:1px solid rgba(155,111,91,.10)}.fin-due-alert strong,.fin-due-alert span{display:block}.fin-due-alert span{font-size:11px;color:#776c72;line-height:1.45;margin-top:4px}.fin-delete-bill{width:100%;border:0;border-radius:14px;padding:10px;background:#fff0f1;color:#a45d65;font-weight:800;margin-top:4px}
      @media(max-width:560px){.fin-quick.v6{grid-template-columns:1fr 1fr}.fin-quick.v6 #addPlan{grid-column:1/-1}.import-actions{width:100%}.import-actions button{flex:1}.capture-grid{grid-template-columns:1fr}.finance-metrics.v6{grid-template-columns:1fr 1fr!important}}
      @media(max-width:390px){.finance-metrics.v6{grid-template-columns:1fr!important}.fin-quick.v6{grid-template-columns:1fr}.planner-grid{grid-template-columns:1fr}.planned-bill-row{grid-template-columns:1fr}.planned-bill-side{text-align:left}.planned-bill-actions{justify-content:flex-start}}
    `;document.head.appendChild(s);
  }

  function optionsHtml(arr,sel){return arr.map(x=>`<option value="${escapeHtml(x)}" ${x===sel?'selected':''}>${escapeHtml(x)}</option>`).join('');}
  function typeOptions(sel){return V6_TYPES.map(([v,l])=>`<option value="${v}" ${v===sel?'selected':''}>${l}</option>`).join('');}
  function accountOptions(payment,selected=''){
    const arr=payment==='Cartão de crédito'?V6_CARD_ACCOUNTS:payment==='Dinheiro'?['Dinheiro']:V6_BANK_ACCOUNTS;
    return optionsHtml(arr,selected||arr[0]);
  }

  function openFinModalV6(type,preset={}){
    const d=loadFin();
    if(type==='income'){
      const {dlg,close}=finDialogShell('Ajustar renda mensal',`<label>Renda mensal<input id="fValue" required type="number" min="0" step="0.01" value="${d.income}"></label>`);
      dlg.querySelector('#finForm').addEventListener('submit',e=>{e.preventDefault();d.income=+dlg.querySelector('#fValue').value||0;saveFin(d);close();renderFinanceiroV6();});return;
    }
    if(type==='fixed'){
      const {dlg,close}=finDialogShell('Adicionar ao orçamento',`<label>O quê<input id="fName" required maxlength="100" placeholder="Ex.: internet, condomínio…"></label><div class="form-grid"><label>Valor mensal<input id="fValue" required type="number" min="0" step="0.01"></label><label>Categoria<select id="fCategory">${optionsHtml(V6_CATEGORIES,'Moradia')}</select></label></div><label>Tipo<select id="fKind"><option value="fixo">Compromisso fixo</option><option value="teto">Limite / teto planejado</option></select></label>`);
      dlg.querySelector('#finForm').addEventListener('submit',e=>{e.preventDefault();d.fixed.push({id:uid(),name:dlg.querySelector('#fName').value.trim(),value:+dlg.querySelector('#fValue').value||0,category:dlg.querySelector('#fCategory').value,kind:dlg.querySelector('#fKind').value,payer:'Usuária'});saveFin(d);close();renderFinanceiroV6();});return;
    }
    const isGoal=type==='goal';
    const title=isGoal?'Registrar aporte na meta':'Registrar movimentação';
    const defaultType=isGoal?'goal_contribution':(preset.type||'expense');
    const body=`<label>O quê<input id="fName" required maxlength="100" value="${escapeHtml(preset.name||'')}" placeholder="Ex.: mercado, gasolina, farmácia…"></label><div class="form-grid"><label>Valor<input id="fValue" required type="number" min="0" step="0.01" value="${preset.value||''}"></label><label>Quando<input id="fDate" type="date" value="${preset.date||todayISO()}"></label></div><label>Tipo de movimentação<select id="fType" ${isGoal?'disabled':''}>${typeOptions(defaultType)}</select></label><div class="form-grid"><label>Categoria<select id="fCategory">${optionsHtml(V6_CATEGORIES,preset.category||'Outros')}</select></label><label>Como pagou<select id="fPayment">${optionsHtml(V6_PAYMENT,preset.payment||'Pix')}</select></label></div><label>De onde saiu<select id="fAccount"></select></label><div class="form-grid"><label>Comportamento<select id="fBehavior">${optionsHtml(V6_BEHAVIOR,preset.behavior||'Variável')}</select></label><label>Parcelas<input id="fInstallments" type="number" min="1" step="1" value="${preset.installments||1}"></label></div><div class="form-grid"><label>Parcela atual<input id="fInstallmentCurrent" type="number" min="1" step="1" value="${preset.installmentCurrent||1}"></label><label>Valor da parcela <span class="muted">(opcional)</span><input id="fInstallmentValue" type="number" min="0" step="0.01" value="${preset.installmentValue||''}"></label></div><label>Observação<input id="fNote" maxlength="180" value="${escapeHtml(preset.note||'')}" placeholder="Opcional"></label><div class="capture-help"><b>Sem dupla contagem:</b> “Pagamento de fatura”, “transferência”, “aporte” e “pagamento de compromisso já previsto” não reduzem o disponível novamente.</div>`;
    const {dlg,close}=finDialogShell(title,body);
    const payment=dlg.querySelector('#fPayment'),account=dlg.querySelector('#fAccount');
    const update=()=>{account.innerHTML=accountOptions(payment.value,preset.account||'');};payment.addEventListener('change',update);update();
    dlg.querySelector('#finForm').addEventListener('submit',e=>{e.preventDefault();const obj={id:uid(),name:dlg.querySelector('#fName').value.trim(),value:+dlg.querySelector('#fValue').value||0,date:dlg.querySelector('#fDate').value,type:isGoal?'goal_contribution':dlg.querySelector('#fType').value,category:dlg.querySelector('#fCategory').value,payment:payment.value,account:account.value,behavior:dlg.querySelector('#fBehavior').value,installments:+dlg.querySelector('#fInstallments').value||1,installmentCurrent:+dlg.querySelector('#fInstallmentCurrent').value||1,installmentValue:+dlg.querySelector('#fInstallmentValue').value||null,note:dlg.querySelector('#fNote').value.trim(),updatedAt:Date.now()};const card=finCardByName(d,obj.account);obj.inBudget=card?card.inBudget!==false:true;obj.budgetImpact=!['invoice_payment','transfer','goal_contribution','commitment_payment'].includes(obj.type);d.transactions.push(obj);saveFin(d);close();renderFinanceiroV6();});
  }

  function openFinLoanModalV6(){
    const d=loadFin(),l=d.loan||{},remaining=l.totalInstallments?Math.max(0,Number(l.totalInstallments)-Number(l.paidInstallments||0)):'';
    const {dlg,close}=finDialogShell('Editar empréstimo',`<div class="form-grid"><label>Instituição<input id="lInstitution" value="${escapeHtml(l.institution||'')}" placeholder="Ex.: Banco do Brasil"></label><label>Status<select id="lStatus">${optionsHtml(['Ativo','Quitado','Pausado'],l.status||'Ativo')}</select></label></div><label>Nome<input id="lName" value="${escapeHtml(l.name||'Empréstimo')}"></label><div class="form-grid"><label>Parcela mensal<input id="lValue" type="number" min="0" step="0.01" value="${Number(l.monthlyPayment||0)}"></label><label>Vencimento · dia<input id="lDue" type="number" min="1" max="31" value="${l.dueDay||''}"></label></div><div class="form-grid"><label>Total de parcelas<input id="lTotal" type="number" min="1" value="${l.totalInstallments||''}"></label><label>Parcelas pagas<input id="lPaid" type="number" min="0" value="${l.paidInstallments||''}"></label></div>${remaining!==''?`<div class="capture-help">Hoje: <b>${remaining} parcelas restantes</b>.</div>`:''}<div class="form-grid"><label>Saldo devedor <span class="muted">(opcional)</span><input id="lBalance" type="number" min="0" step="0.01" value="${l.balance||''}"></label><label>Juros / taxa % <span class="muted">(opcional)</span><input id="lInterest" type="number" min="0" step="0.01" value="${l.interest||''}"></label></div><label>Observação<input id="lNote" value="${escapeHtml(l.note||'')}"></label>`);
    dlg.querySelector('#finForm').addEventListener('submit',e=>{e.preventDefault();d.loan={...l,institution:dlg.querySelector('#lInstitution').value.trim(),status:dlg.querySelector('#lStatus').value,name:dlg.querySelector('#lName').value.trim()||'Empréstimo',monthlyPayment:+dlg.querySelector('#lValue').value||0,dueDay:+dlg.querySelector('#lDue').value||null,totalInstallments:+dlg.querySelector('#lTotal').value||null,paidInstallments:+dlg.querySelector('#lPaid').value||0,balance:+dlg.querySelector('#lBalance').value||null,interest:+dlg.querySelector('#lInterest').value||null,note:dlg.querySelector('#lNote').value.trim(),inBudget:true};saveFin(d);close();renderFinanceiroV6();});
  }

  function normText(s=''){return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();}
  function parseMoneyToken(raw){if(!raw)return null;let s=raw.replace(/r\$\s*/i,'').trim();if(s.includes(',')&&s.includes('.'))s=s.replace(/\./g,'').replace(',','.');else if(s.includes(','))s=s.replace(',','.');return Number(s);}
  function merchantKey(name=''){return normText(name).split(' ').filter(w=>w.length>2&&!['compra','pagamento','parcela'].includes(w)).slice(0,3).join(' ');}
  function ruleFor(d,name){const n=normText(name);return (d.rules||[]).find(r=>n.includes(normText(r.match||r.keyword||'')));}
  function builtinCategory(name){
    const n=normText(name), tests=[
      [['petz','cobasi','pet shop','veterin'], 'Pets'],[['drogasil','droga raia','farmacia','pague menos'], 'Farmácia'],[['posto','gasolina','combustivel','shell','ipiranga'], 'Combustível'],[['mercado','supermercado','carrefour','assai','atacadao','pao de acucar'], 'Mercado'],[['uber','99app','taxi'], 'Transporte'],[['netflix','spotify','icloud','youtube premium','prime video'], 'Assinaturas'],[['shein','temu','renner','riachuelo'], 'Compras pessoais'],[['escola','colegio','material escolar'], 'Henrique'],[['aluguel','condominio','caesb','neoenergia'], 'Moradia']
    ];
    for(const [keys,cat] of tests) if(keys.some(k=>n.includes(normText(k)))) return cat;
    return 'Outros';
  }
  function parseQuickLine(line,d){
    let text=line.trim();if(!text)return null;
    const monetary=[...text.matchAll(/(?:R\$\s*)?(\d{1,3}(?:\.\d{3})*,\d{2}|\d+[\.,]\d{2}|\d+)/gi)];
    if(!monetary.length)return null;
    const m=monetary[0],value=parseMoneyToken(m[0]); if(!Number.isFinite(value))return null;
    let name=(text.slice(0,m.index)+' '+text.slice(m.index+m[0].length)).trim();
    const n=normText(text);
    let payment=n.includes('pix')?'Pix':n.includes('debito')?'Débito':n.includes('boleto')?'Boleto':n.includes('dinheiro')?'Dinheiro':(n.includes('cartao')||n.includes('itau')||n.includes('cef')||n.includes('caixa')||/\bbb\b/.test(n))?'Cartão de crédito':'Pix';
    let account='';
    if(n.includes('4590')) account='Itaú 4590'; else if(n.includes('5298')) account='Itaú 5298'; else if(/\bbb\b/.test(n)) account=payment==='Cartão de crédito'?'BB':'Conta BB'; else if(n.includes('cef')||n.includes('caixa')) account=payment==='Cartão de crédito'?'CEF':'Conta CEF'; else if(n.includes('itau')) account=payment==='Cartão de crédito'?'Itaú 5298':'Conta Itaú';
    const removable=['pix','debito','débito','boleto','dinheiro','cartao','cartão','bb','cef','caixa','itau','itaú','4590','5298'];
    name=name.split(/\s+/).filter(w=>!removable.includes(normText(w))).join(' ').replace(/^[-–—]+|[-–—]+$/g,'').trim()||'Movimentação';
    const rule=ruleFor(d,name),category=rule?.category||builtinCategory(name);
    let type=n.includes('estorno')||n.includes('devolucao')?'refund':n.includes('pagamento fatura')||n.includes('pagar fatura')?'invoice_payment':n.includes('juros')||n.includes('encargo')?'fee':n.includes('aporte')?'goal_contribution':'expense';
    return {tempId:uid(),name,value,date:todayISO(),category,payment,account,behavior:rule?.behavior||'Variável',type,suggestedCategory:category,include:true};
  }
  function isDuplicate(d,t){
    const nk=merchantKey(t.name);return (d.transactions||[]).some(x=>Math.abs(Number(x.value||0)-Number(t.value||0))<0.01&&(x.date||'')===(t.date||'')&&(!t.account||!x.account||x.account===t.account)&&(merchantKey(x.name)===nk||normText(x.name).includes(nk)||normText(t.name).includes(merchantKey(x.name))));
  }

  function openQuickCapture(){
    const {dlg,close}=finDialogShell('Captura rápida',`<div class="quick-capture"><div class="capture-help">Uma movimentação por linha. Você pode escrever do seu jeito.<br><b>Exemplos:</b><br>42 farmácia pix BB<br>189,90 mercado Itaú 5298<br>220 gasolina CEF</div><label>Escreva ou cole<textarea id="quickText" placeholder="42 farmácia pix BB\n189 mercado Itaú 5298\n220 gasolina CEF"></textarea></label></div>`,'Interpretar');
    dlg.querySelector('#finForm').addEventListener('submit',e=>{e.preventDefault();const d=loadFin(),items=dlg.querySelector('#quickText').value.split(/\n+/).map(l=>parseQuickLine(l,d)).filter(Boolean);if(!items.length){alert('Não encontrei valores para interpretar. Use uma movimentação por linha.');return;}close();openCaptureReview(items);});
  }

  function openCaptureReview(items){
    const d=loadFin();items.forEach(x=>x.duplicate=isDuplicate(d,x));
    const cards=items.map((x,i)=>`<div class="capture-item capture-item-compact" data-ci="${i}">
      <div class="capture-top">
        <div class="capture-summary"><strong>${escapeHtml(x.name)}</strong><div class="note">${finDisplayMoney(x.value)} · ${escapeHtml(x.category)} · ${escapeHtml(x.payment)}${x.account?' · '+escapeHtml(x.account):''}</div></div>
        <label class="capture-toggle"><input type="checkbox" data-field="include" ${x.include?'checked':''}> incluir</label>
      </div>
      ${x.duplicate?'<div class="dup-warning">⚠️ Possível duplicidade encontrada. Confira antes de incluir.</div>':''}
      <button class="capture-edit-btn" type="button" data-edit>Editar</button>
      <div class="capture-details" hidden>
        <div class="capture-grid"><label>Categoria<select data-field="category">${optionsHtml(V6_CATEGORIES,x.category)}</select></label><label>Tipo<select data-field="type">${typeOptions(x.type)}</select></label><label>Como pagou<select data-field="payment">${optionsHtml(V6_PAYMENT,x.payment)}</select></label><label>Origem<select data-field="account">${accountOptions(x.payment,x.account)}</select></label><label>Comportamento<select data-field="behavior">${optionsHtml(V6_BEHAVIOR,x.behavior)}</select></label><label>Data<input data-field="date" type="date" value="${x.date}"></label></div>
      </div>
    </div>`).join('');
    const {dlg,close}=finDialogShell('Conferir antes de salvar',`<div class="capture-help">Nada foi salvo ainda. Confira o resumo. Abra <b>Editar</b> somente se quiser corrigir algum item.</div><div class="capture-review">${cards}</div>`,'Salvar confirmados');
    dlg.querySelectorAll('[data-ci]').forEach(card=>{
      const pay=card.querySelector('[data-field="payment"]'),acc=card.querySelector('[data-field="account"]'),details=card.querySelector('.capture-details'),edit=card.querySelector('[data-edit]'),summary=card.querySelector('.capture-summary .note');
      const refreshSummary=()=>{const cat=card.querySelector('[data-field="category"]').value;summary.textContent=`${finDisplayMoney(items[+card.dataset.ci].value)} · ${cat} · ${pay.value}${acc.value?' · '+acc.value:''}`;};
      edit.addEventListener('click',()=>{details.hidden=!details.hidden;edit.textContent=details.hidden?'Editar':'Fechar edição';});
      pay.addEventListener('change',()=>{acc.innerHTML=accountOptions(pay.value,'');refreshSummary();});
      ['category','account'].forEach(f=>card.querySelector(`[data-field="${f}"]`).addEventListener('change',refreshSummary));
    });
    dlg.querySelector('#finForm').addEventListener('submit',e=>{e.preventDefault();const data=loadFin();dlg.querySelectorAll('[data-ci]').forEach(card=>{const i=+card.dataset.ci,item=items[i],v=f=>card.querySelector(`[data-field="${f}"]`),include=v('include').checked;if(!include)return;const obj={id:uid(),name:item.name,value:item.value,date:v('date').value,category:v('category').value,type:v('type').value,payment:v('payment').value,account:v('account').value,behavior:v('behavior').value,installments:1,installmentCurrent:1,note:'Captura rápida',createdAt:Date.now()};const c=finCardByName(data,obj.account);obj.inBudget=c?c.inBudget!==false:true;obj.budgetImpact=!['invoice_payment','transfer','goal_contribution','commitment_payment'].includes(obj.type);data.transactions.push(obj);if(obj.category!==item.suggestedCategory){const key=merchantKey(item.name);if(key&&!data.rules.some(r=>normText(r.match||'')===key))data.rules.push({id:uid(),match:key,category:obj.category,behavior:obj.behavior,createdAt:Date.now()});}});saveFin(data);close();renderFinanceiroV6();});
  }

  function monthsUntil(deadline){
    const now=new Date(), end=deadline?new Date(deadline+'T12:00:00'):new Date(now.getFullYear(),11,31);
    if(end<now)return 1;
    return Math.max(1,(end.getFullYear()-now.getFullYear())*12+(end.getMonth()-now.getMonth())+1);
  }
  function futureInstallmentCommitment(d){
    return (d.transactions||[]).reduce((sum,t)=>{
      const total=Number(t.installments||1), current=Number(t.installmentCurrent||1), v=Number(t.installmentValue||t.value||0);
      return sum+(total>current?Math.max(0,total-current)*v:0);
    },0);
  }
  function behaviorSpend(d,month,behavior){
    return monthTx(d,month).filter(t=>t.behavior===behavior).reduce((s,t)=>s+Math.max(0,txExpenseEffect(d,t)),0);
  }
  function plannerSuggestions(d,month,available,goalTotal){
    const out=[], goal=d.goalMeta||{}, months=monthsUntil(goal.deadline), gapMin=Math.max(0,Number(goal.minimum||8000)-goalTotal), needed=gapMin/months;
    const impulse=behaviorSpend(d,month,'Impulso'), future=futureInstallmentCommitment(d);
    if(gapMin>0) out.push(`🎯 Para alcançar o mínimo da meta até o prazo, o aporte médio necessário é ${finDisplayMoney(needed)} por mês pelos próximos ${months} ${months===1?'mês':'meses'}.`);
    else out.push('🎯 A meta mínima já foi alcançada. Agora o sistema pode priorizar o valor ideal sem pressionar o caixa.');
    if(future>0) out.push(`💳 Há ${finDisplayMoney(future)} em parcelas futuras já conhecidas. Esse valor não é gasto novo hoje, mas representa compromisso dos próximos meses.`);
    if(impulse>0) out.push(`🛍️ Gastos marcados como impulso neste mês somam ${finDisplayMoney(impulse)}. Vale revisar antes de assumir uma nova compra parcelada.`);
    if(available>0) out.push(`✨ O disponível estimado atual é ${finDisplayMoney(available)}. Ele ainda não deve ser tratado automaticamente como dinheiro livre.`);
    else out.push('⚠️ O disponível estimado está zerado ou negativo com os dados conhecidos. Novos compromissos merecem revisão antes de serem assumidos.');
    return out;
  }
  function openSmartPlanner(){
    const d=loadFin(), month=finCurrentMonth(), committed=fixedCommitments(d), realized=realizedExpenses(d,month), impact=newBudgetImpact(d,month), extraIncome=monthIncome(d,month), available=Number(d.income||0)+extraIncome-committed-impact;
    const goal=d.goalMeta||{}, legacyGoal=(d.goals||[]).reduce((s,g)=>s+Number(g.saved||0),0), contrib=goalContrib(d), goalTotal=Math.max(legacyGoal,contrib), suggestions=plannerSuggestions(d,month,available,goalTotal);
    const body=`<div class="capture-help"><b>Planejar não altera seus lançamentos.</b><br>Esta área usa apenas os dados já registrados para ajudar a decidir antes de gastar.</div><div class="planner-grid"><div class="planner-metric"><span>Comprometido</span><b>${finDisplayMoney(committed)}</b></div><div class="planner-metric"><span>Realizado no mês</span><b>${finDisplayMoney(realized)}</b></div><div class="planner-metric"><span>Disponível estimado</span><b>${finDisplayMoney(available)}</b></div><div class="planner-metric"><span>Meta acumulada</span><b>${finDisplayMoney(goalTotal)}</b></div></div><div class="planner-section"><h4>✨ SUGESTÕES PARA ESTE MÊS</h4><div class="planner-suggestions">${suggestions.map(x=>`<div class="planner-suggestion">${x}</div>`).join('')}</div></div><div class="planner-section"><h4>🧮 E SE?</h4><div class="form-grid"><label>Nova compra<input id="simPurchase" type="number" min="0" step="0.01" placeholder="0,00"></label><label>Parcelas<input id="simInstallments" type="number" min="1" step="1" value="1"></label></div><label>Aporte para a meta<input id="simGoal" type="number" min="0" step="0.01" placeholder="0,00"></label><div class="planner-sim-result"><span>Caixa estimado após essas decisões</span><strong id="simResult">${finDisplayMoney(available)}</strong><small id="simDetail">Nenhuma simulação aplicada.</small></div></div><div class="planner-section"><h4>📝 AÇÕES FINANCEIRAS</h4><div class="planner-action-row"><button class="secondary" type="button" id="plannerNewAction">＋ Criar ação</button><button class="secondary" type="button" id="plannerGoalAction">🎯 Registrar aporte</button></div></div>`;
    const {dlg,close}=finDialogShell('Planejar meu dinheiro',body,'Fechar');
    const purchase=dlg.querySelector('#simPurchase'), installments=dlg.querySelector('#simInstallments'), goalInput=dlg.querySelector('#simGoal'), result=dlg.querySelector('#simResult'), detail=dlg.querySelector('#simDetail');
    const update=()=>{const p=Number(purchase.value||0),n=Math.max(1,Number(installments.value||1)),g=Number(goalInput.value||0),monthly=p/n,after=available-monthly-g;result.textContent=finDisplayMoney(after);detail.textContent=p||g?`Impacto deste mês: ${finDisplayMoney(monthly+g)} (${p?`${finDisplayMoney(monthly)} da compra${n>1?` em ${n}x`:''}`:''}${p&&g?' + ':''}${g?`${finDisplayMoney(g)} de aporte`:''}).`:'Nenhuma simulação aplicada.';};
    [purchase,installments,goalInput].forEach(el=>el.addEventListener('input',update));
    dlg.querySelector('#plannerNewAction').onclick=()=>{close();openFinPlanModal();};
    dlg.querySelector('#plannerGoalAction').onclick=()=>{close();openFinModalV6('goal');};
    dlg.querySelector('#finForm').addEventListener('submit',e=>{e.preventDefault();close();});
  }

  function splitCsvLine(line,delimiter){
    const out=[];let cur='',q=false;for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'){if(q&&line[i+1]==='"'){cur+='"';i++;}else q=!q;}else if(c===delimiter&&!q){out.push(cur.trim());cur='';}else cur+=c;}out.push(cur.trim());return out;
  }
  function detectDelimiter(line){const counts={';':(line.match(/;/g)||[]).length,',':(line.match(/,/g)||[]).length,'\t':(line.match(/\t/g)||[]).length};return Object.entries(counts).sort((a,b)=>b[1]-a[1])[0][0]==='\\t'?'\t':Object.entries(counts).sort((a,b)=>b[1]-a[1])[0][0];}
  function normalizeHeader(h){return normText(h).replace(/ /g,'');}
  function parseCsvTransactions(text,d){
    const lines=text.split(/\r?\n/).filter(x=>x.trim()).slice(0,250);if(lines.length<2)return [];
    const delim=detectDelimiter(lines[0]), head=splitCsvLine(lines[0],delim).map(normalizeHeader);
    const idx=(names)=>head.findIndex(h=>names.some(n=>h.includes(n)));
    const di=idx(['data','date']), ni=idx(['descricao','descrição','historico','estabelecimento','nome']), vi=idx(['valor','amount','total']);
    if(vi<0)return [];
    return lines.slice(1).map(line=>{const cols=splitCsvLine(line,delim),value=parseMoneyToken(cols[vi]||'');if(!Number.isFinite(value)||value===0)return null;let date=todayISO();const raw=cols[di]||'';const m=raw.match(/(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})/);if(m){const y=m[3].length===2?'20'+m[3]:m[3];date=`${y}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;}const name=(cols[ni]||'Movimentação').trim(),rule=ruleFor(d,name),category=rule?.category||builtinCategory(name);return {tempId:uid(),name,value:Math.abs(value),date,category,payment:'Outro',account:'Outra conta',behavior:rule?.behavior||'Variável',type:value<0?'refund':'expense',suggestedCategory:category,include:true};}).filter(Boolean);
  }
  function handleFinanceCsvFile(file){
    if(!file)return;const ext=(file.name.split('.').pop()||'').toLowerCase();if(ext==='xlsx'||ext==='xls'){const {dlg,close}=finDialogShell('Excel selecionado',`<div class="capture-help"><b>${escapeHtml(file.name)}</b><br>O arquivo foi reconhecido. A leitura binária de Excel será ativada na próxima etapa do importador; nesta versão, exporte a planilha como CSV para importar agora.</div>`,'Entendi');dlg.querySelector('#finForm').addEventListener('submit',e=>{e.preventDefault();close();});return;}const reader=new FileReader();reader.onload=()=>{const d=loadFin(),items=parseCsvTransactions(String(reader.result||''),d);if(!items.length){alert('Não consegui identificar uma coluna de valor neste CSV. Se puder, use colunas como Data, Descrição e Valor.');return;}openCaptureReview(items);};reader.readAsText(file,'UTF-8');
  }
  function handleFinancePdfFile(file){
    if(!file)return;if(file.type.startsWith('image/')){openReceiptPreview(file);return;}const {dlg,close}=finDialogShell('PDF selecionado',`<div class="capture-help"><b>${escapeHtml(file.name)}</b><br>O PDF entrou no fluxo de importação. A extração automática de compras, parcelas, estornos e pagamentos será ativada na etapa do leitor avançado. Nenhum lançamento foi criado.</div>`,'Entendi');dlg.querySelector('#finForm').addEventListener('submit',e=>{e.preventDefault();close();});
  }

  function openReceiptPreview(file){
    if(!file)return;const url=URL.createObjectURL(file);const {dlg,close}=finDialogShell('Fotografar nota / comprovante',`<img class="receipt-preview" src="${url}" alt="Prévia da nota"><div class="capture-help" style="margin-top:12px"><b>Foto capturada.</b><br>A câmera já está preparada no fluxo. Nesta versão a imagem ainda não é lida automaticamente; OCR/visão entra na próxima etapa. Você pode registrar os valores pela Captura rápida sem perder a foto.</div><button type="button" class="secondary add-full" id="goQuickFromPhoto">✍️ Digitar valores desta nota</button>`,'Fechar');
    dlg.querySelector('#goQuickFromPhoto').onclick=()=>{URL.revokeObjectURL(url);close();openQuickCapture();};dlg.querySelector('#finForm').addEventListener('submit',e=>{e.preventDefault();URL.revokeObjectURL(url);close();});
  }

  window.MINHA_VIDA_FINANCE_VERSION='7.3-previstos-pessoal';

  // Se o Financeiro já estiver aberto quando a camada carregar, redesenha apenas ele.
  window.addEventListener('hashchange',()=>{if((location.hash||'').replace('#','')==='financeiro') setTimeout(renderFinanceiroV6,0);});
  if((location.hash||'').replace('#','')==='financeiro') setTimeout(renderFinanceiroV6,0);
})();
