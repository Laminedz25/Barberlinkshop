// BarberLink PWA – Auto-Update Service Worker
// VERSION: injected at build time via deployment pipeline
const CACHE_NAME = 'barberlink-v1.0.' + Date.now(); // unique per deploy
const STATIC_ASSETS = ['/', '/manifest.json', '/logo.png'];

// Install – pre-cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting(); // Activate immediately without waiting for old SW to die
});

// Activate – delete OLD caches so users always get the latest
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => {
            console.log('[BarberLink SW] Wiping old cache:', key);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim()) // Take control of all open tabs
  );
});

// Fetch – network-first strategy (always serves fresh content)
self.addEventListener('fetch', (event) => {
  // Skip non-GET & Chrome extension requests
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone and cache successful responses
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => {
        // Fallback to cache when offline
        return caches.match(event.request);
      })
  );
});

// Message handler – allows app to trigger update check
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
