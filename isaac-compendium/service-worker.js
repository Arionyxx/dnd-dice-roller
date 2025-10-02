// Service Worker for Isaac Compendium
// Version 1.0.0

const CACHE_VERSION = 'isaac-compendium-v1.0.0';
const ASSETS_CACHE = `${CACHE_VERSION}-assets`;
const PAGES_CACHE = `${CACHE_VERSION}-pages`;
const DATA_CACHE = `${CACHE_VERSION}-data`;

// Assets to cache immediately on install
const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/items.html',
  '/characters.html',
  '/bosses.html',
  '/synergies.html',
  '/guides.html',
  '/about.html',
  '/search.html',
  '/assets/css/normalize.css',
  '/assets/css/style.css',
  '/assets/css/theme.css',
  '/assets/js/utils.js',
  '/assets/js/theme-toggle.js',
  '/assets/js/register-sw.js',
  '/assets/js/analytics.js',
  '/assets/img/logo.svg',
  '/assets/img/placeholders/item.svg',
  '/assets/img/placeholders/character.svg',
  '/assets/img/placeholders/boss.svg',
  '/assets/img/placeholders/room.svg',
  '/assets/img/placeholders/dice.svg',
  '/assets/img/placeholders/heart.svg',
  '/data/items.json',
  '/data/characters.json',
  '/data/bosses.json',
  '/data/synergies.json',
  '/data/guides.json',
  '/manifest.webmanifest'
];

// Install event - cache critical assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');

  event.waitUntil(
    caches.open(ASSETS_CACHE)
      .then((cache) => {
        console.log('[SW] Caching critical assets');
        return cache.addAll(CRITICAL_ASSETS);
      })
      .then(() => {
        console.log('[SW] Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Installation failed:', error);
      })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName.startsWith('isaac-compendium-') &&
                     cacheName !== ASSETS_CACHE &&
                     cacheName !== PAGES_CACHE &&
                     cacheName !== DATA_CACHE;
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[SW] Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle requests from same origin
  if (url.origin !== location.origin) {
    return;
  }

  // Determine caching strategy based on request type
  if (isAssetRequest(url)) {
    event.respondWith(cacheFirstStrategy(request, ASSETS_CACHE));
  } else if (isDataRequest(url)) {
    event.respondWith(networkFirstStrategy(request, DATA_CACHE));
  } else if (isPageRequest(url)) {
    event.respondWith(networkFirstStrategy(request, PAGES_CACHE));
  } else {
    event.respondWith(fetch(request));
  }
});

// Helper functions

function isAssetRequest(url) {
  return url.pathname.startsWith('/assets/') ||
         url.pathname.includes('.svg') ||
         url.pathname.includes('.png') ||
         url.pathname.includes('.jpg') ||
         url.pathname.includes('.webp') ||
         url.pathname.includes('.woff') ||
         url.pathname.includes('.woff2');
}

function isDataRequest(url) {
  return url.pathname.startsWith('/data/') || url.pathname.includes('.json');
}

function isPageRequest(url) {
  return url.pathname.endsWith('.html') || url.pathname === '/';
}

// Cache-first strategy - for static assets
async function cacheFirstStrategy(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache-first strategy failed:', error);

    // Return offline fallback if available
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return 404 page for page requests
    if (request.mode === 'navigate') {
      return caches.match('/404.html');
    }

    return new Response('Network error', {
      status: 408,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Network-first strategy - for dynamic content
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('[SW] Network-first strategy failed:', error);

    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Return 404 page for page requests
    if (request.mode === 'navigate') {
      return caches.match('/404.html');
    }

    return new Response('Offline - cached version not available', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

console.log('[SW] Service worker loaded');
