const CACHE_NAME = "tailor-cache-v1";
const urlsToCache = [
  "./",
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

// Install Event
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Fetch Event
self.addEventListener("fetch", e => {
  const url = e.request.url;

  // ✅ BYPASS CACHE for Firebase & Google APIs
  if (url.includes("firebasejs") || url.includes("googleapis.com") || url.includes("firebaseapp.com")) {
    return; // Let the browser handle these normally via the network
  }

  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});
