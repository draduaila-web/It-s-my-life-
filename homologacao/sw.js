const CACHE = "hml-bertha-v221-rc43-work-init-exercise-spacing-hml";
self.addEventListener("install", event => event.waitUntil(self.skipWaiting()));
self.addEventListener("activate", event => event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>k.startsWith("hml-bertha-")&&k!==CACHE).map(k=>caches.delete(k)));
  await self.clients.claim();
})()));
self.addEventListener("fetch", event=>{
  if(event.request.method!=="GET")return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;
  const fresh = event.request.mode==="navigate" || /\.(?:js|html|css)$/i.test(url.pathname);
  if(fresh){
    event.respondWith((async()=>{
      try{
        const r=await fetch(event.request,{cache:"no-store"});
        if(r&&r.ok){const c=await caches.open(CACHE);await c.put(event.request,r.clone());}
        return r;
      }catch(_){return (await caches.match(event.request))||Response.error();}
    })());
    return;
  }
  event.respondWith((async()=>{
    const c=await caches.match(event.request);if(c)return c;
    try{const r=await fetch(event.request,{cache:"no-cache"});if(r&&r.ok){const cache=await caches.open(CACHE);await cache.put(event.request,r.clone());}return r;}catch(_){return Response.error();}
  })());
});
