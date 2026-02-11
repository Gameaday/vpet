// Service Worker for VPet - Provides offline functionality
const CACHE_NAME = 'vpet-v1.0.0';
const RUNTIME_CACHE = 'vpet-runtime';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/pet.js',
  '/battle.js',
  '/server.js',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('🔧 Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('✅ Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map(name => {
            console.log('🗑️ Service Worker: Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests and WebSocket connections
  if (url.origin !== location.origin || request.url.includes('ws://') || request.url.includes('wss://')) {
    return;
  }

  // Network-first strategy for API calls
  if (url.pathname.startsWith('/api/') || url.pathname.includes('/health')) {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match(request))
    );
    return;
  }

  // Cache-first strategy for static assets
  event.respondWith(
    caches.match(request)
      .then(cached => {
        if (cached) {
          // Return cached version and update cache in background
          event.waitUntil(
            fetch(request)
              .then(response => {
                if (response.ok) {
                  return caches.open(RUNTIME_CACHE)
                    .then(cache => {
                      cache.put(request, response.clone());
                      return response;
                    });
                }
                return response;
              })
              .catch(() => {})
          );
          return cached;
        }

        // Not in cache, fetch from network
        return fetch(request)
          .then(response => {
            // Cache successful responses
            if (response.ok && request.method === 'GET') {
              const responseClone = response.clone();
              caches.open(RUNTIME_CACHE)
                .then(cache => cache.put(request, responseClone));
            }
            return response;
          })
          .catch(() => {
            // Offline fallback
            if (request.destination === 'document') {
              return caches.match('/index.html');
            }
          });
      })
  );
});

// Handle messages from the app
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(name => caches.delete(name))
        );
      })
    );
  }
});

// Background sync for offline actions (future enhancement)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-pet-data') {
    event.waitUntil(
      // Sync pet data when back online
      Promise.resolve()
    );
  }
});

// Push notifications (future enhancement)
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'Your pet needs attention!',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [200, 100, 200],
      tag: 'vpet-notification',
      requireInteraction: false,
      data: data
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'VPet Alert', options)
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});

console.log('🐾 VPet Service Worker loaded');
