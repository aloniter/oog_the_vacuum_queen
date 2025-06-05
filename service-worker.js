/*  Simple cache-first Service-Worker for the game  */
const CACHE_NAME = "oog-vacuum-cache-v1";

 const ASSETS = [
   "./",
   "./index.html",
   "./manifest.json",
   "./service-worker.js",
+  "./icon.png",
   "./bg.png",
   "./oog.png",
   "./cookie.png",
   "./arnold.png",
   "./vacuum.wav",
   "./lose.m4a"
 ];

/* install – pre-cache everything */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();          // activate SW immediately
});

/* activate – clean old caches */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();        // start controlling open pages
});

/* fetch – cache-first strategy */
self.addEventListener("fetch", event => {
  const { request } = event;
  if (request.method !== "GET") return;            // ignore POST / etc.
  event.respondWith(
    caches.match(request).then(cached =>
      cached || fetch(request).then(r => {
        // put fresh copy in cache (optional)
        if (r.ok) {
          const clone = r.clone();
          caches.open(CACHE_NAME).then(c => c.put(request, clone));
        }
        return r;
      })
    )
  );
});
