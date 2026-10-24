(function (root, document) {
  'use strict';
  if (root.BerthaOwnerIntroduction) return;

  // Static, fictional Owner illustrations only. No account data or app controls.
  // SVG geometry is reused verbatim from the existing BERTH.A icon sets:
  // bertha-time-rc380.js: idealZoneIcon, icon and homeUtilityIcon;
  // app-v2.8.221-rc196.js: renderPlanos (calendar).
  var introductionIcons = {
    idea:'<path d="M9 18h6M10 22h4"/><path d="M8.2 14.5A7 7 0 1 1 15.8 14.5c-1.2.8-1.8 1.7-1.8 3h-4c0-1.3-.6-2.2-1.8-3z"/>',
    ritual:'<path d="M12 3v3M12 18v3M3 12h3M18 12h3"/><path d="M16.2 7.8l2.1-2.1M5.7 18.3l2.1-2.1M16.2 16.2l2.1 2.1M5.7 5.7l2.1 2.1"/><circle cx="12" cy="12" r="3.2"/>',
    tasks:'<path d="M8 6h10M8 12h10M8 18h10"/><path d="M4 6h.01M4 12h.01M4 18h.01"/>',
    evening:'<path d="M20 15.5A8 8 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5z"/>',
    study:'<path d="M3 5.5A3.5 3.5 0 0 1 6.5 2H11v17H6.5A3.5 3.5 0 0 0 3 22V5.5zM21 5.5A3.5 3.5 0 0 0 17.5 2H13v17h4.5A3.5 3.5 0 0 1 21 22V5.5z"/>',
    calendar:'<rect x="4" y="5.5" width="16" height="14" rx="2.5"/><path d="M8 3.5v4M16 3.5v4M4 9.5h16"/>',
    network:'<circle cx="8" cy="9" r="2.4"/><circle cx="16" cy="9" r="2.4"/><path d="M3.8 19c.6-3.4 2.1-5 4.2-5s3.6 1.6 4.2 5M11.8 19c.6-3.4 2.1-5 4.2-5s3.6 1.6 4.2 5"/>',
    invite:'<path d="M4 8.5h16v10H4z"/><path d="m4 9 8 5 8-5"/><path d="M8 5.5h8"/>',
    home:'<path d="M3 11.5L12 4l9 7.5"/><path d="M5.5 10v10h13V10M9.5 20v-6h5v6"/>',
    trend:'<path d="M4 17l5-5 4 4 7-8"/><path d="M15 8h5v5"/>'
  };

  function introductionIcon(name) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + introductionIcons[name] + '</svg>';
  }

  function introductionScene(kind, description, content) {
    return '<figure class="bertha-introduction-illustration"><div class="bertha-introduction-scene bertha-introduction-scene-' + kind + '" role="img" aria-label="' + description + '">' + content + '</div><figcaption>Exemplo fictício · somente leitura</figcaption></figure>';
  }

  // Only the six Owner introduction steps. No Helper/Kids guides or backend.
  var steps = [
    {
      title:'O que é a BERTH.A?',
      body:'A BERTH.A foi criada para tirar as obrigações da cabeça e abrir espaço para viver. Ela reúne sua rotina para trazer mais clareza e previsibilidade, sem transformar seu dia em uma agenda rígida.',
      visual:introductionScene('overview', 'Preferências: o que você quer viver. Rotina: o que precisa fazer. Registros: o que aconteceu.',
        '<div class="bertha-introduction-overview-orbit" aria-hidden="true"></div>' +
        '<div class="bertha-introduction-overview-note bertha-introduction-preferences"><span class="bertha-introduction-icon">' + introductionIcon('idea') + '</span><div><strong>Preferências</strong><span>O que você quer viver</span></div></div>' +
        '<div class="bertha-introduction-overview-note bertha-introduction-routine"><span class="bertha-introduction-icon">' + introductionIcon('ritual') + '</span><div><strong>Rotina</strong><span>O que precisa fazer</span></div></div>' +
        '<div class="bertha-introduction-overview-note bertha-introduction-records"><span class="bertha-introduction-icon">' + introductionIcon('tasks') + '</span><div><strong>Registros</strong><span>O que aconteceu</span></div></div>')
    },
    {
      title:'Comece pelo seu dia ideal',
      body:'Em Mais → Meu Dia Ideal, registre o que gostaria de incluir no seu dia, com período e duração. É uma referência flexível, não uma agenda obrigatória; depois você cadastra as atividades nos módulos.',
      visual:introductionScene('ideal', 'Meu Dia Ideal: Noite, Ler um livro, 20 minutos. Uma referência flexível, não uma agenda obrigatória.',
        '<div class="bertha-introduction-night"><div><span class="bertha-introduction-scene-kicker">Meu Dia Ideal</span><strong>Noite</strong></div><span class="bertha-introduction-moon">' + introductionIcon('evening') + '</span></div>' +
        '<div class="bertha-introduction-reading-card"><span class="bertha-introduction-book">' + introductionIcon('study') + '</span><div><strong>Ler um livro</strong><span>20 minutos</span></div></div>' +
        '<p class="bertha-introduction-scene-note">Referência flexível</p>')
    },
    {
      title:'Transforme a intenção em rotina',
      body:'Em Planos, use Tarefas para o que precisa fazer e Compromissos para o que tem data e horário. Complete sua rotina em Rituais e nos módulos que fizerem sentido para você.',
      visual:introductionScene('plans', 'Planos: a tarefa Separar documentos e o compromisso Reunião às 15h.',
        '<div class="bertha-introduction-agenda"><span class="bertha-introduction-scene-kicker">Planos</span><div class="bertha-introduction-agenda-line" aria-hidden="true"></div>' +
        '<div class="bertha-introduction-plan-card bertha-introduction-task-card"><span class="bertha-introduction-icon">' + introductionIcon('tasks') + '</span><div><span class="bertha-introduction-small-label">Tarefas</span><strong>Separar documentos</strong></div></div>' +
        '<div class="bertha-introduction-plan-card bertha-introduction-appointment-card"><span class="bertha-introduction-icon">' + introductionIcon('calendar') + '</span><div><span class="bertha-introduction-small-label">Compromissos</span><strong>Reunião às 15h</strong></div></div></div>')
    },
    {
      title:'Registre o que aconteceu',
      body:'Em Meu Dia, acessado por B•A, use Começar quando houver uma atividade disponível. Ao terminar a atividade em andamento, toque em Concluir e confira o tempo real.',
      visual:introductionScene('record', 'Registro de leitura: tempo previsto de 20 minutos e tempo real de 25 minutos. Ilustração estática, sem cronômetro.',
        '<div class="bertha-introduction-record-heading"><span class="bertha-introduction-book">' + introductionIcon('study') + '</span><div><span class="bertha-introduction-scene-kicker">Meu Dia</span><strong>Leitura</strong></div></div>' +
        '<div class="bertha-introduction-time-cards"><div class="bertha-introduction-time-card"><span class="bertha-introduction-small-label">Previsto</span><strong>20 <span>min</span></strong><div class="bertha-introduction-time-line bertha-introduction-time-planned" aria-hidden="true"></div></div>' +
        '<div class="bertha-introduction-time-card bertha-introduction-time-actual"><span class="bertha-introduction-small-label">Tempo real</span><strong>25 <span>min</span></strong><div class="bertha-introduction-time-line" aria-hidden="true"></div></div></div>' +
        '<p class="bertha-introduction-scene-note">Um registro do que aconteceu</p>')
    },
    {
      title:'Conte com sua rede',
      body:'Em Mais → Satélites, toque em Adicionar satélite, cadastre a pessoa e confira as permissões. Quando o convite estiver disponível, compartilhe-o para a pessoa se conectar e participar da sua rotina.',
      visual:introductionScene('network', 'Satélite de exemplo: Alex, Adulto, permissão Casa. Convite para compartilhar quando disponível, ainda não enviado. Emitir o convite exige conexão. Copiar não envia o convite.',
        '<div class="bertha-introduction-person-card"><span class="bertha-introduction-person-icon">' + introductionIcon('network') + '</span><div><strong>Alex</strong><span>Adulto</span></div><div class="bertha-introduction-permission">' + introductionIcon('home') + '<span>Permissão<strong>Casa</strong></span></div></div>' +
        '<div class="bertha-introduction-invitation"><span class="bertha-introduction-icon">' + introductionIcon('invite') + '</span><div><span class="bertha-introduction-small-label">Quando disponível</span><strong>Convite para compartilhar</strong><span>Ainda não enviado</span></div></div>' +
        '<p class="bertha-introduction-scene-note">Emitir o convite exige conexão.<br>Copiar não envia o convite.</p>')
    },
    {
      title:'Acompanhe e ajuste',
      body:'Abra Meu Progresso em Meu Dia para consultar os indicadores e totais disponíveis. Use esse retrato para ajustar suas preferências no Meu Dia Ideal e sua rotina nos módulos, sem precisar acertar tudo de uma vez.',
      visual:introductionScene('progress', 'Meu Progresso: 3 conclusões registradas. Separadamente, você pode ajustar suas preferências em Meu Dia Ideal. Nenhum ajuste é automático.',
        '<div class="bertha-introduction-progress-sheet"><div><span class="bertha-introduction-scene-kicker">Meu Progresso</span><span class="bertha-introduction-small-label">Conclusões registradas</span><strong class="bertha-introduction-total">3</strong></div><span class="bertha-introduction-progress-icon">' + introductionIcon('trend') + '</span></div>' +
        '<div class="bertha-introduction-adjust"><span class="bertha-introduction-icon">' + introductionIcon('idea') + '</span><div><strong>Meu Dia Ideal</strong><span>Você ajusta suas preferências</span></div></div>')
    }
  ];
  var FLAG = 'bertha.owner.introduction.rc397.seen';
  var active = null;
  var memorySeen = false;
  var autoOpened = false;
  var autoTimer = null;

  function hasSeen() {
    if (memorySeen) return true;
    try { return root.berthaHmlStorage && root.berthaHmlStorage.getItem(FLAG) === '1'; }
    catch (_) { return false; }
  }

  function markSeen() {
    memorySeen = true;
    try {
      // The existing wrapper adds bertha-hml::. Never use raw/global storage.
      if (root.berthaHmlStorage) root.berthaHmlStorage.setItem(FLAG, '1');
    } catch (_) { /* Session-only fallback: no repeated automatic prompt here. */ }
  }

  function focus(node) {
    if (!node || typeof node.focus !== 'function') return;
    try { node.focus({preventScroll:true}); } catch (_) { node.focus(); }
  }

  function restoreFocus(origin) {
    if (document.querySelector('dialog[open]')) return;
    if (origin && origin.isConnected && !origin.disabled && origin !== document.body) {
      focus(origin);
    } else {
      focus(document.querySelector('[data-bertha-more]') || document.querySelector('.bottom-nav a[href="#meu-dia"]'));
    }
  }

  function dismiss() {
    if (!active) return;
    var current = active;
    active = null;
    markSeen();
    if (current.dialog.open) current.dialog.close();
    current.dialog.remove();
    restoreFocus(current.origin);
  }

  function open(origin) {
    if (active || document.querySelector('dialog[open]')) return false;
    var dialog = document.createElement('dialog');
    dialog.id = 'berthaOwnerIntroduction';
    dialog.className = 'bertha-owner-introduction';
    dialog.setAttribute('aria-labelledby', 'berthaIntroductionTitle');
    dialog.setAttribute('aria-describedby', 'berthaIntroductionBody');
    dialog.innerHTML = '<section class="bertha-introduction-card">' +
      '<header class="bertha-introduction-head"><div><p class="bertha-introduction-eyebrow">BERTH.A</p><h2 id="berthaIntroductionTitle" tabindex="-1"></h2></div>' +
      '<button type="button" class="bertha-introduction-close" data-introduction-close aria-label="Fechar apresentação">×</button></header>' +
      '<p class="bertha-introduction-count" data-introduction-count aria-live="polite" aria-atomic="true"></p>' +
      '<p id="berthaIntroductionBody"></p>' +
      '<div data-introduction-visual></div>' +
      '<footer class="bertha-introduction-actions"><button type="button" data-introduction-back>Voltar</button>' +
      '<button type="button" class="bertha-introduction-primary" data-introduction-next>Próximo</button></footer></section>';
    var current = {dialog:dialog,origin:origin || document.activeElement,index:0};
    var title = dialog.querySelector('#berthaIntroductionTitle');
    var body = dialog.querySelector('#berthaIntroductionBody');
    var visual = dialog.querySelector('[data-introduction-visual]');
    var count = dialog.querySelector('[data-introduction-count]');
    var back = dialog.querySelector('[data-introduction-back]');
    var next = dialog.querySelector('[data-introduction-next]');
    function paint() {
      title.textContent = steps[current.index].title;
      body.textContent = steps[current.index].body;
      visual.innerHTML = steps[current.index].visual;
      count.textContent = (current.index + 1) + ' de ' + steps.length;
      back.disabled = current.index === 0;
      next.textContent = current.index === steps.length - 1 ? 'Concluir' : 'Próximo';
      dialog.querySelector('.bertha-introduction-card').scrollTop = 0;
      focus(title);
    }
    dialog.querySelector('[data-introduction-close]').addEventListener('click', dismiss);
    back.addEventListener('click', function () { if (current.index > 0) { current.index--; paint(); } });
    next.addEventListener('click', function () {
      if (current.index === steps.length - 1) dismiss();
      else { current.index++; paint(); }
    });
    dialog.addEventListener('cancel', function (event) { event.preventDefault(); dismiss(); });
    dialog.addEventListener('close', function () { if (active === current) dismiss(); });
    dialog.addEventListener('click', function (event) { if (event.target === dialog) dismiss(); });
    dialog.addEventListener('keydown', function (event) {
      if (event.key !== 'Tab') return;
      var buttons = Array.prototype.filter.call(dialog.querySelectorAll('button'), function (button) { return !button.disabled; });
      var first = buttons[0], last = buttons[buttons.length - 1], focused = document.activeElement;
      if (event.shiftKey && (focused === first || focused === title)) { event.preventDefault(); focus(last); }
      else if (!event.shiftKey && focused === last) { event.preventDefault(); focus(first); }
    });
    document.body.appendChild(dialog);
    active = current;
    try {
      if (typeof dialog.showModal !== 'function') throw new Error('Native dialog unavailable');
      dialog.showModal();
      paint();
      return true;
    } catch (_) {
      active = null;
      dialog.remove();
      restoreFocus(current.origin);
      return false;
    }
  }

  function addMenuEntry() {
    var menu = document.getElementById('berthaMore');
    if (!menu || menu.querySelector('[data-owner-introduction-help]')) return;
    var host = menu.querySelector('.bertha-more-modal');
    if (!host) return;
    var section = document.createElement('section');
    section.className = 'bertha-introduction-help';
    section.setAttribute('data-owner-introduction-help', '');
    section.setAttribute('aria-label', 'Ajuda e tutoriais');
    section.innerHTML = '<h3>Ajuda e tutoriais</h3><button type="button" data-owner-introduction-replay>Rever apresentação</button>';
    section.querySelector('[data-owner-introduction-replay]').addEventListener('click', function () {
      var origin = document.querySelector('[data-bertha-more]');
      // Do not open two dialogs. The existing module links and handlers are untouched.
      autoOpened = true;
      if (autoTimer !== null) { root.clearTimeout(autoTimer); autoTimer = null; }
      if (menu.open) menu.close();
      menu.remove();
      root.setTimeout(function () { open(origin); }, 0);
    });
    host.appendChild(section);
  }

  function tryAutomatic() {
    if (active || autoOpened || hasSeen() || document.visibilityState === 'hidden') return;
    if (document.querySelector('dialog[open]')) return;
    var focused = document.activeElement;
    if (focused && (/^(INPUT|SELECT|TEXTAREA)$/.test(focused.tagName) || focused.isContentEditable)) return;
    // A failed native dialog must not create a retry loop that interrupts the app.
    autoOpened = true;
    open(focused);
  }

  function scheduleAutomatic() {
    if (autoTimer !== null || active || autoOpened || hasSeen()) return;
    autoTimer = root.setTimeout(function () { autoTimer = null; tryAutomatic(); }, 350);
  }

  function start() {
    addMenuEntry();
    var observer = new MutationObserver(function () { addMenuEntry(); scheduleAutomatic(); });
    observer.observe(document.body, {childList:true,subtree:true,attributes:true,attributeFilter:['open']});
    document.addEventListener('visibilitychange', scheduleAutomatic);
    document.addEventListener('focusout', scheduleAutomatic);
    scheduleAutomatic();
  }

  root.BerthaOwnerIntroduction = {open:open};
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true});
  else start();
})(window, document);
