/* BERTH.A v2.8.33 — recuperação cirúrgica do acesso ao Financeiro.
   Não altera dados, render financeiro, navegação global nem outros módulos. */
(() => {
  'use strict';

  const financeHref = '#financeiro';
  const walletIcon = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7.5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-11a2 2 0 0 1 2-2h11"/><path d="M16 12h4v4h-4a2 2 0 0 1 0-4Z"/></svg>`;

  function ensureFinanceLink(root = document) {
    // Menu BERTH.A atual (criado pelo bertha-time)
    const currentMenu = root.querySelector?.('#berthaMore .module-links.bertha-module-cards');
    if (currentMenu && !currentMenu.querySelector(`a[href="${financeHref}"]`)) {
      const a = document.createElement('a');
      a.href = financeHref;
      a.innerHTML = `<span class="bertha-menu-icon">${walletIcon}</span><span>Financeiro</span>`;
      currentMenu.appendChild(a);
    }

    // Menu legado fica apenas como fallback; não muda se o link já existir.
    const legacyMenu = root.querySelector?.('#moduleMenu .module-links');
    if (legacyMenu && !legacyMenu.querySelector(`a[href="${financeHref}"]`)) {
      const a = document.createElement('a');
      a.href = financeHref;
      a.textContent = '💰 Financeiro';
      const casa = legacyMenu.querySelector('a[href="#casa"]');
      if (casa) legacyMenu.insertBefore(a, casa); else legacyMenu.appendChild(a);
    }
  }

  function openFinance(e) {
    const link = e.target.closest?.(`a[href="${financeHref}"]`);
    if (!link) return;

    const dlg = link.closest('dialog');
    if (dlg?.open) {
      try { dlg.close(); } catch (_) {}
      if (dlg.id === 'berthaMore') setTimeout(() => dlg.remove(), 0);
    }

    // Mantém o fluxo normal por hash e reforça apenas o render da rota.
    if (location.hash === financeHref) {
      setTimeout(() => { if (typeof window.render === 'function') window.render(); }, 0);
    }
  }

  ensureFinanceLink();
  document.addEventListener('click', openFinance, true);

  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const n of m.addedNodes) {
        if (n.nodeType !== 1) continue;
        if (n.id === 'berthaMore' || n.querySelector?.('#berthaMore')) {
          ensureFinanceLink(document);
          return;
        }
      }
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
