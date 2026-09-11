/* =========================================================
   MINHA VIDA · FINANCEIRO v6
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
    return x;
  }

  const originalLoadFin=window.loadFin;
  window.loadFin=function(){return finV6Normalize(originalLoadFin());};

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
  function monthTx(d,month){return (d.transactions||[]).filter(t=>(t.date||'').slice(0,7)===month);}
  function fixedCommitments(d){return (d.fixed||[]).filter(x=>x.kind!=='teto').reduce((s,x)=>s+Number(x.value||0),0)+Number(d.loan?.inBudget!==false?d.loan?.monthlyPayment||0:0);}
  function budgetCaps(d){return (d.fixed||[]).filter(x=>x.kind==='teto').reduce((s,x)=>s+Number(x.value||0),0);}
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
    return `<article class="card finance-row ${outside?'outside-budget':''}"><div><strong>${escapeHtml(x.name||'Movimentação')}</strong><span>${escapeHtml(meta)}${outside?' · fora do orçamento':''}</span><div class="fin-row-tags">${txTypeBadge(x)}${noDouble?'<span class="fin-no-double">não reduz disponível novamente</span>':''}${x.installments>1?`<span class="fin-type-pill">${Number(x.installmentCurrent||1)}/${Number(x.installments)}</span>`:''}</div></div><b>${finMoney(x.value)}</b><button class="mini-delete" data-fin-delete="${x.id}" aria-label="Excluir">×</button></article>`;
  }

  function renderFinanceiroV6(){
    const d=loadFin(),month=finCurrentMonth(),committed=fixedCommitments(d),caps=budgetCaps(d),realized=realizedExpenses(d,month),impact=newBudgetImpact(d,month),extraIncome=monthIncome(d,month),available=Number(d.income||0)+extraIncome-committed-impact,cats=categoryTotalsV6(d,month),visible=finPrivacy();
    const catHtml=Object.entries(cats).filter(([,v])=>v!==0).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([k,v])=>`<div class="finance-cat"><span>${escapeHtml(k)}</span><strong>${finMoney(v)}</strong></div>`).join('')||`<div class="empty compact"><strong>Nenhum gasto classificado neste mês.</strong><span>Quando você registrar ou importar movimentações, elas aparecem aqui.</span></div>`;
    const legacyGoal=(d.goals||[]).reduce((s,g)=>s+Number(g.saved||0),0),contrib=goalContrib(d),goalTotal=Math.max(legacyGoal,contrib),goal=d.goalMeta||{},progress=goal.ideal?Math.min(100,Math.round(goalTotal/goal.ideal*100)):0;
    app.innerHTML=`<section class="hero"><h2>💰 Financeiro</h2><p>O que foi planejado, o que saiu de verdade e o que ainda está comprometido — sem contar a mesma despesa duas vezes.</p></section>
    <section class="finance-summary card"><div class="finance-main"><span class="eyebrow">RENDA MENSAL</span><strong>${finMoney(d.income)}</strong><div class="finance-actions"><button class="text-btn" id="toggleFinPrivacy">${visible?'🙈 Ocultar valores':'👁️ Mostrar valores'}</button><button class="text-btn" id="editIncome">editar</button></div></div><div class="finance-metrics v6"><div><span>Comprometido</span><b>${finMoney(committed)}</b><small>fixos + empréstimo</small></div><div><span>Realizado no mês</span><b>${finMoney(realized)}</b><small>saídas efetivas</small></div><div><span>Disponível estimado</span><b>${finMoney(available)}</b><small>sem dupla contagem</small></div><div><span>Limites planejados</span><b>${finMoney(caps)}</b><small>tetos, não despesas</small></div></div></section>
    <div class="fin-quick v6"><button class="primary" id="addTransaction">＋ Registrar</button><button class="secondary" id="quickCapture">⚡ Captura rápida</button><button class="secondary" id="addPlan">🗓️ Planejar</button></div>
    <div class="section-title">CAPTURA & IMPORTAÇÃO</div><section class="card import-card v6"><div><span class="eyebrow">RÁPIDO NO IPHONE</span><h3>Digite, cole ou fotografe</h3><p class="note">Ex.: “42 farmácia pix BB”. O sistema interpreta, sugere e só salva depois da sua confirmação.</p></div><div class="import-actions"><button class="primary compact-btn" id="quickCapture2">Interpretar texto</button><button class="secondary compact-btn" id="photoCapture">📷 Fotografar</button><input id="receiptCamera" type="file" accept="image/*" capture="environment" hidden></div></section>
    <div class="section-title">CARTÕES & FATURAS</div><section class="fin-card-grid">${d.cards.map(finCardHtml).join('')}</section><p class="fin-helper">Compra = despesa. Pagamento da fatura = liquidação e não entra novamente como gasto.</p>
    <div class="section-title">EMPRÉSTIMO</div><section class="card loan-card"><div class="panel-head"><div><span class="eyebrow">COMPROMISSO MENSAL</span><h3>${escapeHtml(d.loan.name||'Empréstimo')}</h3></div><button class="secondary compact-btn" id="editLoan">Editar</button></div><strong class="loan-value">${finMoney(d.loan.monthlyPayment||0)}</strong><span>${[d.loan.institution,d.loan.dueDay?`vence dia ${d.loan.dueDay}`:'',d.loan.totalInstallments?`${Math.max(0,Number(d.loan.totalInstallments)-Number(d.loan.paidInstallments||0))} parcelas restantes`:'',d.loan.status].filter(Boolean).map(escapeHtml).join(' · ')}</span></section>
    <div class="section-title">ORÇAMENTO BASE</div><div class="list">${d.fixed.map(finFixedHtml).join('')}</div><button class="add-full secondary" id="addFixed">＋ Adicionar item ao orçamento</button>
    <div class="section-title">MOVIMENTAÇÕES DO MÊS</div><section class="card"><div class="panel-head"><div><span class="eyebrow">${escapeHtml(finMonthLabel(month))}</span><h3>O que aconteceu de verdade</h3></div><button class="primary compact-btn" id="addTransaction2">＋ Registrar</button></div><div class="list inner-list">${d.transactions.slice().reverse().slice(0,40).map(x=>finTransactionHtmlV6(d,x)).join('')||`<div class="empty compact"><strong>Nenhuma movimentação registrada.</strong><span>Use Registrar ou Captura rápida.</span></div>`}</div></section>
    <div class="section-title">POR CATEGORIA</div><section class="card finance-cats">${catHtml}</section>
    <div class="section-title">META · ${escapeHtml(goal.name||'Troca do carro')}</div><section class="card goal-card"><div class="panel-head"><div><span class="eyebrow">ATÉ DEZEMBRO</span><h3>${escapeHtml(goal.name||'Troca do carro')}</h3></div><span class="pill today">${progress}%</span></div><div class="fin-progress"><i style="width:${progress}%"></i></div><p class="note">Acumulado: <b>${finMoney(goalTotal)}</b> · mínimo ${finMoney(goal.minimum||8000)} · ideal ${finMoney(goal.ideal||12000)}.</p><button class="secondary compact-btn" id="addGoalContribution">＋ Registrar aporte</button></section>
    <div class="section-title">PRÓXIMAS AÇÕES FINANCEIRAS</div><section class="card"><div class="panel-head"><div><span class="eyebrow">O QUÊ · COMO · ONDE · QUANDO</span><h3>Planejamento</h3></div><button class="secondary compact-btn" id="addPlan2">＋ Nova</button></div><div class="list inner-list">${d.plans.map(finPlanHtml).join('')||`<div class="empty compact"><strong>Nenhuma ação pendente.</strong><span>Ex.: revisar fatura, pagar boleto, conferir extrato ou fazer aporte.</span></div>`}</div></section>`;
    ensureFinanceStylesV6();
    document.getElementById('toggleFinPrivacy').onclick=()=>{setFinPrivacy(finPrivacy());renderFinanceiroV6();};
    document.getElementById('editIncome').onclick=()=>openFinModalV6('income');
    document.getElementById('addFixed').onclick=()=>openFinModalV6('fixed');
    document.getElementById('addTransaction').onclick=document.getElementById('addTransaction2').onclick=()=>openFinModalV6('transaction');
    document.getElementById('quickCapture').onclick=document.getElementById('quickCapture2').onclick=()=>openQuickCapture();
    document.getElementById('addPlan').onclick=document.getElementById('addPlan2').onclick=()=>openFinPlanModal();
    document.getElementById('editLoan').onclick=()=>openFinLoanModalV6();
    document.getElementById('addGoalContribution').onclick=()=>openFinModalV6('goal');
    document.getElementById('photoCapture').onclick=()=>document.getElementById('receiptCamera').click();
    document.getElementById('receiptCamera').onchange=e=>openReceiptPreview(e.target.files?.[0]);
    document.querySelectorAll('[data-fin-delete]').forEach(b=>b.onclick=()=>{const x=loadFin();x.transactions=x.transactions.filter(t=>t.id!==b.dataset.finDelete);saveFin(x);renderFinanceiroV6();});
    document.querySelectorAll('[data-fin-plan]').forEach(b=>b.onclick=()=>{const x=loadFin(),p=x.plans.find(q=>q.id===b.dataset.finPlan);if(p){p.done=!p.done;saveFin(x);renderFinanceiroV6();}});
  }
  window.renderFinanceiro=renderFinanceiroV6;

  function ensureFinanceStylesV6(){
    ensureFinanceStyles();
    if(document.getElementById('finance-v6-addon')) return;
    const s=document.createElement('style');s.id='finance-v6-addon';s.textContent=`
      .finance-metrics.v6{grid-template-columns:repeat(2,1fr)!important}.finance-metrics.v6 small{display:block;color:#9a909a;font-size:10px;margin-top:3px}.fin-quick.v6{grid-template-columns:1fr 1fr 1fr}.import-card.v6{align-items:center}.import-actions{display:flex;gap:8px;flex-wrap:wrap}.fin-row-tags{display:flex;gap:6px;flex-wrap:wrap;margin-top:7px}.fin-type-pill,.fin-no-double{display:inline-flex!important;width:auto!important;padding:4px 7px;border-radius:999px;background:#f1e9f5;color:#745487!important;font-size:10px!important;font-weight:800}.fin-no-double{background:#e8f2ec;color:#527060!important}.fin-progress{height:10px;border-radius:999px;background:#eee7f0;overflow:hidden;margin:12px 0}.fin-progress i{display:block;height:100%;background:linear-gradient(90deg,#d8bfdc,#c9dfd5);border-radius:inherit}.quick-capture textarea{min-height:150px;resize:vertical}.capture-help{background:#f8f3ee;border-radius:16px;padding:12px 14px;color:#766d77;font-size:12px;margin-bottom:14px}.capture-review{display:grid;gap:10px}.capture-item{border:1px solid rgba(92,72,104,.11);border-radius:18px;padding:13px;background:#fff}.capture-top{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.capture-top strong{font-size:15px}.capture-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.capture-grid label{margin:0!important}.dup-warning{padding:8px 10px;border-radius:12px;background:#fff1dc;color:#8a641e;font-size:11px;font-weight:700;margin-top:8px}.receipt-preview{width:100%;max-height:42vh;object-fit:contain;border-radius:18px;background:#f5f1ed}.capture-toggle{display:flex!important;align-items:center;gap:8px!important;margin:8px 0 0!important}.capture-toggle input{width:auto!important}
      @media(max-width:560px){.fin-quick.v6{grid-template-columns:1fr 1fr}.fin-quick.v6 #addPlan{grid-column:1/-1}.import-actions{width:100%}.import-actions button{flex:1}.capture-grid{grid-template-columns:1fr}.finance-metrics.v6{grid-template-columns:1fr 1fr!important}}
      @media(max-width:390px){.finance-metrics.v6{grid-template-columns:1fr!important}.fin-quick.v6{grid-template-columns:1fr}}
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
    const m=monetary[monetary.length-1],value=parseMoneyToken(m[0]); if(!Number.isFinite(value))return null;
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
    const cards=items.map((x,i)=>`<div class="capture-item" data-ci="${i}"><div class="capture-top"><div><strong>${escapeHtml(x.name)}</strong><div class="note">${finMoney(x.value)} · ${formatDate(x.date)}</div></div><label class="capture-toggle"><input type="checkbox" data-field="include" ${x.include?'checked':''}> incluir</label></div>${x.duplicate?'<div class="dup-warning">⚠️ Possível duplicidade encontrada. Deixei para você decidir.</div>':''}<div class="capture-grid"><label>Categoria<select data-field="category">${optionsHtml(V6_CATEGORIES,x.category)}</select></label><label>Tipo<select data-field="type">${typeOptions(x.type)}</select></label><label>Como pagou<select data-field="payment">${optionsHtml(V6_PAYMENT,x.payment)}</select></label><label>Origem<select data-field="account">${accountOptions(x.payment,x.account)}</select></label><label>Comportamento<select data-field="behavior">${optionsHtml(V6_BEHAVIOR,x.behavior)}</select></label><label>Data<input data-field="date" type="date" value="${x.date}"></label></div></div>`).join('');
    const {dlg,close}=finDialogShell('Conferir antes de salvar',`<div class="capture-help">Nada foi salvo ainda. Corrija o que quiser e desmarque qualquer item que não deva entrar.</div><div class="capture-review">${cards}</div>`,'Salvar confirmados');
    dlg.querySelectorAll('[data-ci]').forEach(card=>{
      const pay=card.querySelector('[data-field="payment"]'),acc=card.querySelector('[data-field="account"]');
      pay.addEventListener('change',()=>{acc.innerHTML=accountOptions(pay.value,'');});
    });
    dlg.querySelector('#finForm').addEventListener('submit',e=>{e.preventDefault();const data=loadFin();dlg.querySelectorAll('[data-ci]').forEach(card=>{const i=+card.dataset.ci,item=items[i],v=f=>card.querySelector(`[data-field="${f}"]`),include=v('include').checked;if(!include)return;const obj={id:uid(),name:item.name,value:item.value,date:v('date').value,category:v('category').value,type:v('type').value,payment:v('payment').value,account:v('account').value,behavior:v('behavior').value,installments:1,installmentCurrent:1,note:'Captura rápida',createdAt:Date.now()};const c=finCardByName(data,obj.account);obj.inBudget=c?c.inBudget!==false:true;obj.budgetImpact=!['invoice_payment','transfer','goal_contribution','commitment_payment'].includes(obj.type);data.transactions.push(obj);if(obj.category!==item.suggestedCategory){const key=merchantKey(item.name);if(key&&!data.rules.some(r=>normText(r.match||'')===key))data.rules.push({id:uid(),match:key,category:obj.category,behavior:obj.behavior,createdAt:Date.now()});}});saveFin(data);close();renderFinanceiroV6();});
  }

  function openReceiptPreview(file){
    if(!file)return;const url=URL.createObjectURL(file);const {dlg,close}=finDialogShell('Fotografar nota / comprovante',`<img class="receipt-preview" src="${url}" alt="Prévia da nota"><div class="capture-help" style="margin-top:12px"><b>Foto capturada.</b><br>A câmera já está preparada no fluxo. Nesta versão a imagem ainda não é lida automaticamente; OCR/visão entra na próxima etapa. Você pode registrar os valores pela Captura rápida sem perder a foto.</div><button type="button" class="secondary add-full" id="goQuickFromPhoto">✍️ Digitar valores desta nota</button>`,'Fechar');
    dlg.querySelector('#goQuickFromPhoto').onclick=()=>{URL.revokeObjectURL(url);close();openQuickCapture();};dlg.querySelector('#finForm').addEventListener('submit',e=>{e.preventDefault();URL.revokeObjectURL(url);close();});
  }

  // Se o Financeiro já estiver aberto quando a camada carregar, redesenha apenas ele.
  if((location.hash||'').replace('#','')==='financeiro') setTimeout(renderFinanceiroV6,0);
})();
