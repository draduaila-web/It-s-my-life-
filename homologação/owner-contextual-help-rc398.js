(function (root, document) {
  'use strict';
  if (root.BerthaOwnerContextualHelp) return;

  // Static, opt-in Owner guidance. No module actions or persistence are used.
  var active = null;
  var markers = [];
  // A shared header selector must not relabel a stale screen during async navigation.
  var anchorRoutes = new WeakMap();
  var observedApp = null;
  var observedShell = null;
  var observedMenu = null;
  var menuEntry = null;
  var syncTimer = null;
  var transitionTimer = null;
  var generation = 0;
  var started = false;
  var appObserver, menuObserver, bodyObserver, shellObserver;

  function guides() {
    var content = root.BerthaOwnerGuideContent;
    return content && Array.isArray(content.guides) ? content.guides : [];
  }
  function route() { return root.location.hash || '#meu-dia'; }
  function normalized(value) { return typeof value === 'string' && value ? (value.charAt(0) === '#' ? value : '#' + value) : ''; }
  function matches(placement, currentRoute) {
    if (!placement) return false;
    if (placement.route) return normalized(placement.route) === currentRoute;
    var prefix = normalized(placement.routePrefix);
    return !!prefix && currentRoute.indexOf(prefix) === 0 && currentRoute.length > prefix.length;
  }
  function ownerRoute(currentRoute) {
    return guides().some(function (guide) {
      return (guide.placements || []).some(function (placement) { return matches(placement, currentRoute); });
    });
  }
  function findGuide(id) {
    return guides().filter(function (guide) { return guide.id === id; })[0] || null;
  }
  function enclosing(node, tag) {
    while (node && node !== document.body) {
      if (node.tagName === tag) return node;
      node = node.parentNode;
    }
    return null;
  }
  function inside(node, ancestor) {
    while (node) { if (node === ancestor) return true; node = node.parentNode; }
    return false;
  }
  function safeAnchor(node, app) {
    return !!node && node !== app && node.isConnected && inside(node, app) && !enclosing(node, 'DIALOG') && !enclosing(node, 'BUTTON') && !enclosing(node, 'A');
  }
  function anchorFor(placement, app) {
    if (!app || !placement || typeof placement.anchor !== 'string') return null;
    try {
      var nodes = app.querySelectorAll(placement.anchor);
      for (var i = 0; i < nodes.length; i++) if (safeAnchor(nodes[i], app) && (!anchorRoutes.has(nodes[i]) || anchorRoutes.get(nodes[i]) === route())) return nodes[i];
    } catch (_) { /* An invalid or absent anchor never falls back to the app. */ }
    return null;
  }
  function otherDialog(except) {
    var dialogs = document.querySelectorAll('dialog[open]');
    for (var i = 0; i < dialogs.length; i++) if (dialogs[i] !== except) return true;
    return false;
  }
  function focus(node) {
    if (!node || !node.isConnected || node.disabled || typeof node.focus !== 'function') return false;
    try { node.focus({preventScroll:true}); } catch (_) { node.focus(); }
    return true;
  }
  function navigationFor(currentRoute) {
    var links = document.querySelectorAll('.bottom-nav a[href]');
    for (var i = 0; i < links.length; i++) if (links[i].getAttribute('href') === currentRoute) return links[i];
    return document.querySelector('[data-bertha-more]') || document.querySelector('.bottom-nav a[href="#meu-dia"]');
  }
  function validMarker(record, app, currentRoute) {
    return record.route === currentRoute && record.node.isConnected && record.node.parentNode === record.anchor &&
      matches(record.placement, currentRoute) && anchorFor(record.placement, app) === record.anchor;
  }
  function restoreFocus(origin) {
    if (otherDialog()) return;
    var currentRoute = route(), app = document.getElementById('app');
    if (origin && origin.route === currentRoute) {
      if (origin.guideId) {
        var same = markers.filter(function (item) { return item.guide.id === origin.guideId && validMarker(item, app, currentRoute); })[0];
        if (same && focus(same.node)) return;
      } else if (origin.element && origin.element !== document.body && !enclosing(origin.element, 'DIALOG') && focus(origin.element)) return;
    }
    focus(navigationFor(currentRoute));
  }
  function originInfo(element, guideId) {
    return {element:element || document.activeElement, guideId:guideId || null, route:route()};
  }
  function cancelTransition() {
    generation++;
    if (transitionTimer !== null) { root.clearTimeout(transitionTimer); transitionTimer = null; }
  }
  function dismiss(restore) {
    if (!active) return;
    var current = active;
    active = null;
    if (current.dialog.open) current.dialog.close();
    current.dialog.remove();
    if (restore !== false) restoreFocus(current.origin);
  }
  function node(tag, className, text) {
    var element = document.createElement(tag);
    if (className) element.className = className;
    if (typeof text === 'string') element.textContent = text;
    return element;
  }
  function button(text, attribute, callback) {
    var element = node('button', '', text);
    element.type = 'button';
    element.setAttribute('type', 'button');
    if (attribute) element.setAttribute(attribute, '');
    element.addEventListener('click', callback);
    return element;
  }
  function delayedTransition(currentRoute, origin, callback) {
    var token = generation;
    transitionTimer = root.setTimeout(function () {
      transitionTimer = null;
      if (token !== generation || route() !== currentRoute || !ownerRoute(currentRoute) || !document.getElementById('app') || otherDialog()) return;
      if (callback() === false) restoreFocus(origin);
    }, 0);
  }
  function replayIntroduction(current) {
    if (active !== current) return;
    cancelTransition();
    var currentRoute = route(), origin = current.origin;
    dismiss(false);
    delayedTransition(currentRoute, origin, function () {
      var introduction = root.BerthaOwnerIntroduction;
      if (!introduction || typeof introduction.open !== 'function') return false;
      var target = origin.route === route() && origin.element && origin.element.isConnected ? origin.element : navigationFor(route());
      return introduction.open(target);
    });
  }
  function paint(current, guide, placement, fromCatalog) {
    current.content.textContent = '';
    current.actions.textContent = '';
    current.title.textContent = guide ? 'Como usar ' + guide.title : 'Guias por módulo';
    current.description.textContent = guide ? 'Um guia curto para consultar no seu ritmo.' : 'Escolha um módulo para consultar os passos e um exemplo fictício.';
    if (guide) {
      var list = node('ol', 'bertha-owner-guide-steps');
      (guide.steps || []).slice(0, 4).forEach(function (step) { if (typeof step === 'string') list.appendChild(node('li', '', step)); });
      current.content.appendChild(list);
      if (typeof guide.example === 'string' && guide.example) {
        var example = node('section', 'bertha-owner-guide-example');
        example.appendChild(node('h3', '', 'Exemplo fictício'));
        example.appendChild(node('p', '', guide.example));
        current.content.appendChild(example);
      }
      var note = placement && typeof placement.note === 'string' ? placement.note : guide.note;
      if (typeof note === 'string' && note) current.content.appendChild(node('p', 'bertha-owner-guide-note', note));
      current.actions.appendChild(button(fromCatalog ? 'Voltar aos guias' : 'Guias por módulo', 'data-owner-guide-back', function () { if (active === current) paint(current, null, null, false); }));
    } else {
      var catalog = node('ul', 'bertha-owner-guide-catalog');
      guides().forEach(function (item) {
        var row = node('li');
        var entry = button(item.title, 'data-owner-guide-select', function () { if (active === current) paint(current, item, null, true); });
        entry.setAttribute('data-owner-guide-select', item.id);
        row.appendChild(entry);
        catalog.appendChild(row);
      });
      current.content.appendChild(catalog);
      if (root.BerthaOwnerIntroduction && typeof root.BerthaOwnerIntroduction.open === 'function') {
        current.actions.appendChild(button('Rever apresentação', 'data-owner-guide-replay', function () { replayIntroduction(current); }));
      }
    }
    current.actions.appendChild(button('Fechar', 'data-owner-guide-close', function () { if (active === current) dismiss(); }));
    current.card.scrollTop = 0;
    focus(current.title);
  }
  function open(guide, placement, origin) {
    if (active || otherDialog() || !ownerRoute(route()) || !document.getElementById('app')) return false;
    if (placement && (!matches(placement, route()) || !anchorFor(placement, document.getElementById('app')))) return false;
    cancelTransition();
    var dialog = node('dialog', 'bertha-owner-contextual-help');
    dialog.id = 'berthaOwnerContextualHelp';
    dialog.setAttribute('aria-labelledby', 'berthaOwnerGuideTitle');
    dialog.setAttribute('aria-describedby', 'berthaOwnerGuideDescription');
    var card = node('section', 'bertha-owner-guide-card');
    var header = node('header', 'bertha-owner-guide-head');
    var heading = node('div');
    heading.appendChild(node('p', 'bertha-owner-guide-eyebrow', 'BERTH.A · AJUDA'));
    var title = node('h2');
    title.id = 'berthaOwnerGuideTitle';
    title.setAttribute('tabindex', '-1');
    heading.appendChild(title);
    header.appendChild(heading);
    var closeButton = button('×', 'data-owner-guide-x', function () { if (active === current) dismiss(); });
    closeButton.className = 'bertha-owner-guide-x';
    closeButton.setAttribute('aria-label', 'Fechar guia');
    header.appendChild(closeButton);
    card.appendChild(header);
    var description = node('p', 'bertha-owner-guide-description');
    description.id = 'berthaOwnerGuideDescription';
    card.appendChild(description);
    var content = node('div', 'bertha-owner-guide-content');
    card.appendChild(content);
    var actions = node('footer', 'bertha-owner-guide-actions');
    card.appendChild(actions);
    dialog.appendChild(card);
    var current = {dialog:dialog, card:card, title:title, description:description, content:content, actions:actions, origin:origin, route:route(), placement:placement};
    dialog.addEventListener('cancel', function (event) { if (active === current) { event.preventDefault(); dismiss(); } });
    dialog.addEventListener('close', function () { if (active === current) dismiss(); });
    dialog.addEventListener('click', function (event) { if (active === current && event.target === dialog) dismiss(); });
    dialog.addEventListener('keydown', function (event) {
      if (event.key !== 'Tab' || active !== current) return;
      var controls = Array.prototype.filter.call(dialog.querySelectorAll('button'), function (control) { return !control.disabled; });
      var first = controls[0], last = controls[controls.length - 1], focused = document.activeElement;
      if (event.shiftKey && (focused === first || focused === title)) { event.preventDefault(); focus(last); }
      else if (!event.shiftKey && focused === last) { event.preventDefault(); focus(first); }
    });
    document.body.appendChild(dialog);
    active = current;
    try {
      if (typeof dialog.showModal !== 'function') throw new Error('Native dialog unavailable');
      dialog.showModal();
      paint(current, guide, placement, false);
      return true;
    } catch (_) {
      dismiss();
      return false;
    }
  }
  function reconcileMarkers(app, currentRoute) {
    markers = markers.filter(function (record) {
      if (validMarker(record, app, currentRoute)) return true;
      record.node.remove();
      return false;
    });
    // Drop copied/stale owned markers instead of retaining a button without its listener.
    Array.prototype.forEach.call(document.querySelectorAll('[data-owner-contextual-guide]'), function (element) {
      if (!markers.some(function (record) { return record.node === element; })) element.remove();
    });
    if (!app || !ownerRoute(currentRoute)) return;
    guides().forEach(function (guide) {
      if (markers.some(function (record) { return record.guide.id === guide.id; })) return;
      var placements = guide.placements || [];
      for (var i = 0; i < placements.length; i++) {
        var placement = placements[i];
        if (!matches(placement, currentRoute)) continue;
        var anchor = anchorFor(placement, app);
        if (!anchor) continue;
        var record = {guide:guide, placement:placement, anchor:anchor, route:currentRoute, node:null};
        var label = guide.id === 'saude' ? 'Como usar Saúde' : 'Como usar';
        var trigger = button(label, 'data-owner-contextual-guide', function () {
          if (!validMarker(record, document.getElementById('app'), route())) return;
          open(record.guide, record.placement, originInfo(record.node, record.guide.id));
        });
        trigger.setAttribute('data-owner-contextual-guide', guide.id);
        trigger.setAttribute('data-owner-contextual-route', currentRoute);
        trigger.setAttribute('aria-label', 'Como usar ' + guide.title);
        trigger.setAttribute('aria-haspopup', 'dialog');
        record.node = trigger;
        anchorRoutes.set(anchor, currentRoute);
        markers.push(record);
        anchor.appendChild(trigger);
        break;
      }
    });
  }
  function reconcileMenu(menu, currentRoute) {
    var section = menu && menu.querySelector('[data-owner-introduction-help]');
    if (menuEntry && (!menuEntry.isConnected || !section || menuEntry.parentNode !== section || !ownerRoute(currentRoute) || !document.getElementById('app'))) {
      menuEntry.remove();
      menuEntry = null;
    }
    if (!menu || !section || !ownerRoute(currentRoute) || !document.getElementById('app') || menuEntry) return;
    menuEntry = button('Guias por módulo', 'data-owner-guide-catalog-open', function () {
      if (!menu.isConnected || menu !== document.getElementById('berthaMore') || !ownerRoute(route()) || active || otherDialog(menu)) return;
      cancelTransition();
      var capturedRoute = route(), origin = originInfo(document.querySelector('[data-bertha-more]'));
      if (menu.open) menu.close();
      menu.remove();
      delayedTransition(capturedRoute, origin, function () { return open(null, null, origin); });
    });
    menuEntry.setAttribute('aria-haspopup', 'dialog');
    section.appendChild(menuEntry);
  }
  function reconcile() {
    syncTimer = null;
    var app = document.getElementById('app'), menu = document.getElementById('berthaMore'), currentRoute = route();
    // #app is nested in .app-shell, so body childList alone cannot see its replacement.
    var shell = app ? app.parentNode : document.querySelector('.app-shell');
    if (shell === document.body) shell = null;
    if (shell !== observedShell) {
      shellObserver.disconnect(); observedShell = shell;
      if (shell) shellObserver.observe(shell, {childList:true});
    }
    if (app !== observedApp) {
      appObserver.disconnect(); observedApp = app;
      if (app) appObserver.observe(app, {childList:true, subtree:true, attributes:true, attributeFilter:['class','id']});
    }
    if (menu !== observedMenu) {
      menuObserver.disconnect(); observedMenu = menu;
      if (menu) menuObserver.observe(menu, {childList:true, subtree:true});
    }
    reconcileMarkers(app, currentRoute);
    reconcileMenu(menu, currentRoute);
    if (active && (active.route !== currentRoute || !active.dialog.isConnected || !app || (active.placement && !anchorFor(active.placement, app)) || otherDialog(active.dialog))) dismiss();
  }
  function scheduleSync() {
    if (syncTimer === null) syncTimer = root.setTimeout(reconcile, 0);
  }
  function routeChanged() {
    cancelTransition();
    if (syncTimer !== null) { root.clearTimeout(syncTimer); syncTimer = null; }
    reconcile();
  }
  function start() {
    if (started) return;
    started = true;
    appObserver = new root.MutationObserver(scheduleSync);
    shellObserver = new root.MutationObserver(scheduleSync);
    menuObserver = new root.MutationObserver(scheduleSync);
    bodyObserver = new root.MutationObserver(scheduleSync);
    bodyObserver.observe(document.body, {childList:true});
    root.addEventListener('hashchange', routeChanged);
    reconcile();
  }
  root.BerthaOwnerContextualHelp = {
    openGuide:function (id, origin) { var guide = findGuide(id); return guide ? open(guide, null, originInfo(origin)) : false; },
    openCatalog:function (origin) { return open(null, null, originInfo(origin)); },
    close:function () { cancelTransition(); dismiss(); }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true});
  else start();
})(window, document);
