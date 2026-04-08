const CACHE_NAME = "tailor-cache-v1";
const urlsToCache = [
  "./index.html",
  "./daily.html",
  "./customers.html",
  "./summary.html",
  "./style.css",
  "./script.js",
  "../global.css",
  "./images/blouse.jpg",
  "./images/frock.jpeg",
  "./images/modelBlouse.jpeg",
  "./images/nighty.jpeg",
  "./images/saree.jpg"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(urlsToCache)));
});

self.addEventListener("fetch", e => {
  // 🛑 IGNORE FIREBASE REQUESTS - Let them go directly to the network
  if (e.request.url.includes("://googleapis.com") || 
      e.request.url.includes("firebase")) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});
