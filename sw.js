const CACHE = "minha-vida-v28";

const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.webmanifest",
  "./icon-192.svg",
  "./icon-512.svg"
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
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key.startsWith("minha-vida-") && key !== CACHE)
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Sempre busca HTML e JavaScript na rede primeiro,
  // evitando que versões antigas da interface fiquem presas no cache.
  if (
    url.pathname.endsWith("/") ||
    url.pathname.endsWith("/index.html") ||
    url.pathname.endsWith("/app.js") ||
    url.pathname.endsWith("/style.css") ||
    url.pathname.endsWith("/sw.js")
  ) {
    event.respondWith(
      fetch(event.request)
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
