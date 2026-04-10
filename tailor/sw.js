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
  // ✅ FIX: Explicitly bypass cache for Firebase/Google APIs
  if (url.includes("firebasejs") || url.includes("googleapis.com") || url.includes("firebaseapp.com")) {
    return fetch(e.request); 
  }
  e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});
