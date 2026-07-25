const CACHE = "nexora-v1";
const ASSETS = ["/", "/dashboard", "/savings", "/login", "/offline"];

self.addEventListener("install", e=>{
  e.waitUntil(
    caches.open(CACHE).then(c=>c.addAll(ASSETS)).catch(()=>{})
  );
  self.skipWaiting();
});

self.addEventListener("activate", e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(
      keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener("fetch", e=>{
  if(e.request.method!=="GET") return;
  e.respondWith(
    fetch(e.request)
      .then(res=>{ const clone=res.clone(); caches.open(CACHE).then(c=>c.put(e.request,clone)); return res; })
      .catch(()=>caches.match(e.request).then(cached=>cached||caches.match("/offline")))
  );
});

// Push notification handler
self.addEventListener("push", e=>{
  const data = e.data?.json() || {};
  e.waitUntil(
    self.registration.showNotification(data.title||"NEXORA", {
      body:    data.body||"You have a new notification",
      icon:    "/icon-192.png",
      badge:   "/icon-192.png",
      tag:     data.tag||"nexora",
      data:    { url: data.url||"/dashboard" },
      actions: [
        { action:"open",    title:"Open App" },
        { action:"dismiss", title:"Dismiss"  },
      ],
      vibrate: [200,100,200],
    })
  );
});

// Notification click handler
self.addEventListener("notificationclick", e=>{
  e.notification.close();
  const url = e.notification.data?.url || "/dashboard";
  if(e.action==="dismiss") return;
  e.waitUntil(
    clients.matchAll({type:"window"}).then(clientList=>{
      const existing = clientList.find(c=>c.url.includes("nexora")||c.url.includes("vercel"));
      if(existing){ existing.focus(); existing.navigate(url); }
      else clients.openWindow(url);
    })
  );
});
