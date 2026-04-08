const CACHE_NAME = "ashu-site-v1";
const urlsToCache = [
  "./index.html",
  "./global.css",
  "./index.css",
  "./script.js",
  "./about.html",
  "./games.html",
  "./friends.html"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(urlsToCache)));
});

self.addEventListener("fetch", e => {
  e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});
