self.addEventListener("install", (event) => {
  event.waitUntil(caches.open("toppick-shell-v2").then((cache) => cache.addAll(["/offline.html"])));
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== "toppick-shell-v2").map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/go/") || url.pathname.startsWith("/admin")) return;
  event.respondWith(
    fetch(req).then((res) => {
      if (url.pathname === "/offline.html" && res.ok) {
        const copy = res.clone();
        caches.open("toppick-shell-v2").then((cache) => cache.put(req, copy));
      }
      return res;
    }).catch(async () => {
      return (await caches.match("/offline.html")) || new Response("TopPick is offline.", { status: 503, headers: { "content-type": "text/plain" } });
    })
  );
});
