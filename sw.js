const CACHE = "minha-vida-v30";
const ASSETS = ["./","./index.html","./app.js","./style.css","./manifest.webmanifest","./icon-192.svg","./icon-512.svg","./crefito11-logo.png","./bec-logo.png","./tiktok-logo.png"];
self.addEventListener("install", event => { event.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener("activate", event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith("minha-vida-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", event => {
 if (event.request.method !== "GET") return;
 const url = new URL(event.request.url);
 if (url.pathname.endsWith("/app.js") || url.pathname.endsWith("/index.html") || url.pathname.endsWith("/style.css") || url.pathname.endsWith("/sw.js")) {
   event.respondWith(fetch(event.request).then(r => { if (r.ok && !url.pathname.endsWith("/sw.js")) caches.open(CACHE).then(c => c.put(event.request, r.clone())); return r; }).catch(() => caches.match(event.request).then(r => r || caches.match("./index.html"))));
 } else {
   event.respondWith(caches.match(event.request).then(r => r || fetch(event.request).then(resp => { caches.open(CACHE).then(c => c.put(event.request, resp.clone())); return resp; }).catch(() => caches.match("./index.html"))));
 }
});
