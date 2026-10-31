/* Offline-Speicher für die Web-App */
const CACHE='muskelatlas-v2';
const CORE=['./','index.html','manifest.webmanifest','icon-180.png','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET') return;
  const url=new URL(req.url);
  const put=(r)=>{ if(r && (r.ok || r.type==='opaque')){ const copy=r.clone(); caches.open(CACHE).then(c=>c.put(req,copy)); } return r; };
  if(url.origin===location.origin){
    /* App-Dateien: zuerst aus dem Netz (damit Updates ankommen), ohne Internet aus dem Speicher */
    e.respondWith(fetch(req).then(put).catch(()=>caches.match(req).then(r=>r||caches.match('index.html'))));
  } else if(/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)){
    e.respondWith(caches.match(req).then(hit=>{ const net=fetch(req).then(put).catch(()=>hit); return hit||net; }));
  }
});
