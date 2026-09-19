importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");

const CACHE = "bertha-v160";

self.addEventListener("install", event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(key => (key.startsWith("minha-vida-") || key.startsWith("bertha-")) && key !== CACHE)
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // Navegação sempre tenta a versão publicada primeiro. Isso evita o PWA
  // ficar preso indefinidamente em um index.html antigo no iPhone.
  if (event.request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(event.request, { cache: "no-store" });
        if (response && response.ok) {
          const cache = await caches.open(CACHE);
          await cache.put("./index.html", response.clone());
        }
        return response;
      } catch (_) {
        return (await caches.match("./index.html")) || Response.error();
      }
    })());
    return;
  }

  // Arquivos funcionais: network-first para receber correções imediatamente.
  if (/\.(?:js|html)$/i.test(url.pathname)) {
    event.respondWith((async () => {
      try {
        const response = await fetch(event.request, { cache: "no-store" });
        if (response && response.ok) {
          const cache = await caches.open(CACHE);
          await cache.put(event.request, response.clone());
        }
        return response;
      } catch (_) {
        return (await caches.match(event.request)) || Response.error();
      }
    })());
    return;
  }

  // Demais recursos: cache com atualização normal pela rede quando necessário.
  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;
    try {
      const response = await fetch(event.request);
      if (response && response.ok) {
        const cache = await caches.open(CACHE);
        await cache.put(event.request, response.clone());
      }
      return response;
    } catch (_) {
      return Response.error();
    }
  })());
});
