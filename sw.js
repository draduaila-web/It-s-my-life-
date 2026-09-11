const CACHE = "minha-vida-v34-work-v12";
const CORE = ["./","./style.css","./manifest.webmanifest","./icon-192.svg","./icon-512.svg"];
const FRESH = ["./index.html","./app.js","./finance-v6.js","./work-v12.js"];

self.addEventListener("install", e => e.waitUntil((async()=>{
  const c=await caches.open(CACHE);
  await c.addAll(CORE);
  for (const url of FRESH) {
    const r=await fetch(url,{cache:"reload"});
    if(r.ok) await c.put(url,r.clone());
  }
  await self.skipWaiting();
})()));
self.addEventListener("activate", e => e.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
  await self.clients.claim();
})()));
self.addEventListener("fetch", e => {
  const u=new URL(e.request.url);
  const isFresh = FRESH.some(x => u.pathname.endsWith(x.replace('./','')));
  if(isFresh){
    e.respondWith(fetch(e.request,{cache:"no-store"}).then(r=>{
      const copy=r.clone(); caches.open(CACHE).then(c=>c.put(e.request,copy)); return r;
    }).catch(()=>caches.match(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request).then(r=>{
    const copy=r.clone(); caches.open(CACHE).then(c=>c.put(e.request,copy)); return r;
  })));
});
