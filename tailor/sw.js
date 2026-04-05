const CACHE_NAME = "tailor-app-v1";

const urlsToCache = [
  "/tailor/",
  "/tailor/index.html",
  "/tailor/home.html",
  "/tailor/daily.html",
  "/tailor/customers.html",
  "/tailor/summary.html",
  "/tailor/manifest.json"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});