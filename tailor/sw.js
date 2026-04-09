const CACHE_NAME = "tailor-cache-v3";

const urlsToCache = [
  "./",
  "./index.html",
  "./daily.html",
  "./customers.html",
  "./summary.html",
  "./style.css",
  "./script.js"
];

// Install
self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Activate
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(names =>
      Promise.all(names.map(name => {
        if (name !== CACHE_NAME) return caches.delete(name);
      }))
    )
  );
});

// Fetch
self.addEventListener("fetch", e => {
  const url = e.request.url;

  // ✅ Skip Firebase (IMPORTANT)
  if (
    url.includes("firebasejs") ||
    url.includes("googleapis.com") ||
    url.includes("firebaseapp.com")
  ) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});