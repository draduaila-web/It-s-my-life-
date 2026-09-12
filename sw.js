const     CACHE = "bertha-v54-rituais-ciclo-exclusao";

const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./finance-v6.js",
  "./work-v12.js",
  "./bertha-time-v1.js",
  "./manifest.webmanifest",
  "./bertha-icon-192.png",
"./bertha-icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => (key.startsWith("minha-vida-") || key.startsWith("bertha-")) && key !== CACHE)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  const networkFirst =
    url.pathname.endsWith("/") ||
    url.pathname.endsWith("/index.html") ||
    url.pathname.endsWith("/app.js") ||
    url.pathname.endsWith("/finance-v6.js") ||
    url.pathname.endsWith("/work-v12.js") ||
    url.pathname.endsWith("/style.css") ||
    url.pathname.endsWith("/sw.js");

  if (networkFirst) {
    event.respondWith(
      fetch(event.request, { cache: "no-store" })
        .then(response => {
          if (response.ok && !url.pathname.endsWith("/sw.js")) {
            const copy = response.clone();
            caches.open(CACHE).then(cache => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, copy));
        }
        return response;
      });
    })
  );
});
