(function (root, document) {
  'use strict';
  if (root.BerthaOwnerIntroduction) return;

  // Only the four Owner introduction steps. No Helper/Kids guides or backend.
  var steps = [
    {title:'Sua vida, um passo de cada vez',body:'Na barra inferior, toque em B•A para ver o resumo do seu dia. Abra os módulos para consultar os detalhes, no seu ritmo.'},
    {title:'Planos para o que vem',body:'Na barra inferior, abra Planos. Em Tarefas, organize o que precisa fazer; em Compromissos, o que tem data e horário.'},
    {title:'Rituais e os outros módulos',body:'Rituais reúne seus cuidados. Em Mais você encontra Casa, Estudos, Financeiro, Satélites e os outros módulos. Em Casa, use Como fazer na atividade para consultar suas instruções.'},
    // Proposed local scope correction; this sentence still requires approval.
    {title:'A ajuda fica por perto',body:'Em Mais, abra Ajuda e tutoriais. Use Rever apresentação para começar estes quatro passos novamente.'}
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
      '<footer class="bertha-introduction-actions"><button type="button" data-introduction-back>Voltar</button>' +
      '<button type="button" class="bertha-introduction-primary" data-introduction-next>Próximo</button></footer></section>';
    var current = {dialog:dialog,origin:origin || document.activeElement,index:0};
    var title = dialog.querySelector('#berthaIntroductionTitle');
    var body = dialog.querySelector('#berthaIntroductionBody');
    var count = dialog.querySelector('[data-introduction-count]');
    var back = dialog.querySelector('[data-introduction-back]');
    var next = dialog.querySelector('[data-introduction-next]');
    function paint() {
      title.textContent = steps[current.index].title;
      body.textContent = steps[current.index].body;
      count.textContent = (current.index + 1) + ' de ' + steps.length;
      back.disabled = current.index === 0;
      next.textContent = current.index === steps.length - 1 ? 'Concluir' : 'Próximo';
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
