const C = "lifeos-v10";
const PRE = ["./","index.html","manifest.json","icon.svg","icon-192.png","icon-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(C).then(c =>
    Promise.allSettled(PRE.map(u => c.add(u)))   // resilient: one bad file can't break the install
  ));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || !e.request.url.startsWith(self.location.origin)) return;
  if (e.request.mode === "navigate") {
    e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); return r; })
      .catch(() => caches.match("index.html")));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit =>
    hit || fetch(e.request).then(r => { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); return r; })
      .catch(() => caches.match("index.html"))));
});
