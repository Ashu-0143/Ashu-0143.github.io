const CACHE_NAME = "tailor-cache-v5";
const urlsToCache = [
  "./",
  "./index.html",
  "./daily.html",
  "./customers.html",
  "./summary.html",
  "./manifest.json",
  "./images/tailor.png"
];

self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(names => Promise.all(
      names.map(name => { if (name !== CACHE_NAME) return caches.delete(name); })
    ))
  );
});

self.addEventListener("fetch", e => {
  const url = e.request.url;

  // ✅ IMPROVED: If it's Firebase or Google, just let the browser handle it
  if (url.includes("firebase") || url.includes("gstatic") || url.includes("googleapis")) {
    return; // Don't call e.respondWith, let it fall through to the browser
  }

  e.respondWith(
    caches.match(e.request).then(res => {
      return res || fetch(e.request);
    }).catch(() => fetch(e.request)) // Fallback to network if cache fails
  );
});

