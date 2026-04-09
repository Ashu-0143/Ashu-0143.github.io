const CACHE_NAME = "tailor-cache-v4";

const urlsToCache = [
  "./",
  "./index.html",
  "./daily.html",
  "./customers.html",
  "./summary.html",
  "./style.css",
  "./script.js",
  "./manifest.json",

  // ✅ IMPORTANT: icons
  "./images/tailor.png",

  // optional but useful
  "../global.css"
];

// INSTALL
self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// ACTIVATE (clean old cache)
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(names =>
      Promise.all(
        names.map(name => {
          if (name !== CACHE_NAME) return caches.delete(name);
        })
      )
    )
  );
});

// FETCH
self.addEventListener("fetch", e => {
  const url = e.request.url;

  // ✅ SAFELY skip Firebase (without breaking fetch)
  if (
    url.includes("firebasejs") ||
    url.includes("googleapis.com") ||
    url.includes("firebaseapp.com")
  ) {
    return; // browser handles it
  }

  e.respondWith(
    caches.match(e.request).then(res => {
      return res || fetch(e.request);
    })
  );
});