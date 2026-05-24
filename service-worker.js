// Guild War Manager - Service Worker
// Strategy: Network-first (always check for updates)
// Version: bump this when deploying new version

const CACHE_VERSION = 'gwm-v1.46';
const STATIC_CACHE = `static-${CACHE_VERSION}`;

// Files to precache (essential for offline)
const PRECACHE_URLS = [
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png'
];

// Install: cache essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('static-') && name !== STATIC_CACHE)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: network-first strategy
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip API and auth routes (always fresh)
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/auth/')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses for static assets
        if (response.ok && (url.pathname.startsWith('/icons/') || url.pathname === '/manifest.json')) {
          const responseClone = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(event.request, responseClone));
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache if network fails
        return caches.match(event.request);
      })
  );
});