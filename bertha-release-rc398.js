(function (root) {
  'use strict';
  // Release routing only. Storage/auth verification belongs to BerthaPersonalRuntime.
  var BASE = 'https://draduaila-web.github.io/It-s-my-life-/';
  var VERSION = '398-personal-prep';
  var PAGES = ['', 'index.html', 'helper.html', 'helper-owner.html', 'kids.html'];
  var LEGACY = ['sw.js', 'sw-v28.js', 'sw_clean.js', 'sw_v29.js'];
  function atProduction(href) {
    try { var u = new URL(href || root.location.href), b = new URL(BASE); return !u.username && !u.password && u.origin === b.origin && PAGES.some(function (p) { return u.pathname === b.pathname + p; }); }
    catch (_) { return false; }
  }
  function pageURL(page) {
    if (!PAGES.includes(page)) throw Error('Página da BERTH.A não autorizada.');
    var url = new URL(page, BASE); url.searchParams.set('v', VERSION); return url;
  }
  function role() { var file = root.location.pathname.split('/').pop(); return file === 'kids.html' ? 'kids' : file === 'helper.html' ? 'adult' : 'owner'; }
  function assertLocation() { if (!atProduction()) throw Error('Abra a versão pessoal no endereço de produção para ativar os avisos.'); }
  async function refreshLegacyWorkers() {
    if (!atProduction() || !root.navigator.serviceWorker?.getRegistrations) return [];
    var registrations = await root.navigator.serviceWorker.getRegistrations(), updated = [];
    for (var registration of registrations) {
      // Never register a new worker, unregister a subscription, or update OneSignal.
      if (registration.scope !== BASE || !registration.active) continue;
      if ([registration.installing, registration.waiting].some(function (worker) { return worker && worker.scriptURL !== registration.active.scriptURL; })) continue;
      var url = new URL(registration.active.scriptURL);
      if (url.origin !== new URL(BASE).origin || !LEGACY.some(function (p) { return url.pathname === new URL(p, BASE).pathname; })) continue;
      await registration.update(); updated.push(url.pathname);
    }
    return updated;
  }
  root.BerthaRelease = Object.freeze({version: VERSION, productionBase: BASE, atProduction: atProduction, pageURL: pageURL, role: role, assertLocation: assertLocation,
    push: Object.freeze({appId: '18d49ac6-cdad-4780-8437-cbdcd025a680', workerPath: new URL('OneSignalSDKWorker.js', BASE).pathname, scope: new URL(BASE).pathname}),
    refreshLegacyWorkers: refreshLegacyWorkers});
  // This presentation switch does not migrate data or claim the personal copy is ready.
  root.BerthaHelpConfig = Object.assign({}, root.BerthaHelpConfig || {}, {environment: 'personal', stateEnvironment: 'homologacao', showHomologationTools: false});
  refreshLegacyWorkers().catch(function (error) { root.console?.warn('Não foi possível conferir o cache legado agora.', error); });
})(window);
