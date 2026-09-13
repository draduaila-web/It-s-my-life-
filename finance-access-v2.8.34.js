/* BERTH.A v2.8.34 — correção cirúrgica do acesso ao Financeiro + privacidade.
   Carregar DEPOIS de bertha-time-v2.8.29.js.
   Não altera dados financeiros, outros módulos, barra inferior ou motor de tempo. */
(() => {
  'use strict';

  const FINANCE_HASH = '#financeiro';
  const PRIVACY_KEY = 'minha-vida.financeiro.privacy.v1';
  const MASK = 'R$ ••••••';
  const walletIcon = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7.5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-11a2 2 0 0 1 2-2h11"/><path d="M16 12h4v4h-4a2 2 0 0 1 0-4Z"/></svg>`;

  function valuesVisible() {
    return localStorage.getItem(PRIVACY_KEY) !== 'hidden';
  }

  function setValuesVisible(visible) {
    localStorage.setItem(PRIVACY_KEY, visible ? 'visible' : 'hidden');
  }

  function ensureFinanceLink(root = document) {
    const currentMenu = root.querySelector?.('#berthaMore .module-links.bertha-module-cards');
    if (currentMenu && !currentMenu.querySelector(`a[href="${FINANCE_HASH}"]`)) {
      const a = document.createElement('a');
      a.href = FINANCE_HASH;
      a.innerHTML = `<span class="bertha-menu-icon">${walletIcon}</span><span>Financeiro</span>`;
      currentMenu.appendChild(a);
    }

    const legacyMenu = root.querySelector?.('#moduleMenu .module-links');
    if (legacyMenu && !legacyMenu.querySelector(`a[href="${FINANCE_HASH}"]`)) {
      const a = document.createElement('a');
      a.href = FINANCE_HASH;
      a.textContent = '💰 Financeiro';
      const casa = legacyMenu.querySelector('a[href="#casa"]');
      if (casa) legacyMenu.insertBefore(a, casa); else legacyMenu.appendChild(a);
    }
  }

  function closeContainingDialog(link) {
    const dlg = link?.closest?.('dialog');
    if (!dlg) return;
    try { if (dlg.open) dlg.close(); } catch (_) {}
    // Remover depois da navegação; no Safari remover o <a> durante o clique
    // pode impedir/atrasar a troca de rota.
    setTimeout(() => {
      try { if (dlg.id === 'berthaMore' && dlg.isConnected) dlg.remove(); } catch (_) {}
    }, 60);
  }

  function goFinance(link) {
    closeContainingDialog(link);
    // Evita a corrida entre dois listeners de hashchange (app + camada BERTH.A).
    // Atualiza a URL sem disparar hashchange e chama o render global uma vez.
    if (location.hash !== FINANCE_HASH) {
      history.pushState(null, '', FINANCE_HASH);
    }
    if (typeof window.render === 'function') {
      window.render();
    }
    setTimeout(() => {
      if (location.hash === FINANCE_HASH && typeof window.render === 'function') window.render();
      applyFinancePrivacy();
    }, 0);
  }

  // Captura apenas Financeiro. Os outros links continuam 100% no fluxo atual.
  document.addEventListener('click', (e) => {
    const link = e.target.closest?.(`a[href="${FINANCE_HASH}"]`);
    if (!link) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    goFinance(link);
  }, true);

  function leafMoneyElements(root) {
    if (!root) return [];
    return [...root.querySelectorAll('*')].filter(el => {
      if (el.children.length) return false;
      return /R\$\s*(?:[\d.]+(?:,\d{2})?|•{3,})/.test(el.textContent || '');
    });
  }

  function maskElement(el) {
    if (!el.dataset.berthaFinanceOriginal) {
      el.dataset.berthaFinanceOriginal = el.textContent;
    }
    el.textContent = (el.dataset.berthaFinanceOriginal || el.textContent)
      .replace(/R\$\s*(?:[\d.]+(?:,\d{2})?|•{3,})/g, MASK);
  }

  function unmaskElement(el) {
    if (el.dataset.berthaFinanceOriginal) {
      el.textContent = el.dataset.berthaFinanceOriginal;
      delete el.dataset.berthaFinanceOriginal;
    }
  }

  function applyFinancePrivacy() {
    if (location.hash !== FINANCE_HASH) return;
    const app = document.getElementById('app');
    if (!app) return;

    const summary = app.querySelector('.finance-summary');
    if (!summary) return;

    let btn = app.querySelector('#toggleFinPrivacy');
    if (!btn) {
      const edit = app.querySelector('#editIncome');
      btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'toggleFinPrivacy';
      btn.className = 'text-btn';
      if (edit?.parentNode) edit.parentNode.insertBefore(btn, edit);
      else app.querySelector('.finance-main')?.appendChild(btn);
    }

    const visible = valuesVisible();
    btn.textContent = visible ? '🙈 Ocultar valores' : '👁️ Mostrar valores';
    btn.onclick = (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      setValuesVisible(!valuesVisible());
      applyFinancePrivacy();
    };

    const moneyEls = leafMoneyElements(app);
    moneyEls.forEach(visible ? unmaskElement : maskElement);
  }

  // Reaplica a privacidade depois de qualquer rerender do Financeiro
  // sem interferir nos demais módulos.
  const observer = new MutationObserver((mutations) => {
    let menuAdded = false;
    let appChanged = false;
    for (const m of mutations) {
      for (const n of m.addedNodes) {
        if (n.nodeType !== 1) continue;
        if (n.id === 'berthaMore' || n.querySelector?.('#berthaMore')) menuAdded = true;
        if (n.id === 'app' || n.closest?.('#app') || n.querySelector?.('.finance-summary')) appChanged = true;
      }
      if (m.target?.id === 'app' || m.target?.closest?.('#app')) appChanged = true;
    }
    if (menuAdded) ensureFinanceLink(document);
    if (appChanged && location.hash === FINANCE_HASH) setTimeout(applyFinancePrivacy, 0);
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener('popstate', () => {
    if (location.hash === FINANCE_HASH && typeof window.render === 'function') {
      window.render();
      setTimeout(applyFinancePrivacy, 0);
    }
  });

  ensureFinanceLink();
  if (location.hash === FINANCE_HASH) setTimeout(applyFinancePrivacy, 0);
})();
