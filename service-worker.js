// Service Worker for GW Pharmacy Portal
// Enables offline functionality and caching

const CACHE_NAME = 'gwpharmacy-v1';
const OFFLINE_URL = '/offline.html';

// Files to cache for offline use
const CACHE_URLS = [
    '/',
    '/index.html',
    '/pages/dashboard.html',
    '/pages/prescriptions.html',
    '/pages/cart.html',
    '/pages/profile.html',
    '/assets/css/main.css',
    '/assets/css/components.css',
    '/assets/css/accessibility.css',
    '/assets/css/dark-mode.css',
    '/assets/js/utils.js',
    '/assets/js/api.js',
    '/assets/js/app.js',
    '/assets/js/auth.js',
    '/assets/js/cart.js',
    '/assets/js/prescriptions.js',
    '/assets/js/profile.js',
    '/assets/js/theme-manager.js',
    '/assets/data/mock-data.js',
    '/manifest.json',
    OFFLINE_URL
];

// Install event - cache files
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching app shell');
                return cache.addAll(CACHE_URLS);
            })
            .then(() => {
                console.log('[Service Worker] Skip waiting');
                return self.skipWaiting();
            })
    );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('[Service Worker] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[Service Worker] Claiming clients');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    // Handle navigation requests (HTML pages)
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    return caches.match(event.request)
                        .then((response) => {
                            return response || caches.match(OFFLINE_URL);
                        });
                })
        );
        return;
    }

    // Handle other requests with cache-first strategy
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }

                return fetch(event.request)
                    .then((response) => {
                        // Don't cache non-successful responses
                        if (!response || response.status !== 200 || response.type === 'error') {
                            return response;
                        }

                        // Clone the response
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    });
            })
    );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    console.log('[Service Worker] Background sync:', event.tag);
    
    if (event.tag === 'sync-cart') {
        event.waitUntil(syncCart());
    } else if (event.tag === 'sync-profile') {
        event.waitUntil(syncProfile());
    }
});

/**
 * Sync cart data when online
 */
async function syncCart() {
    try {
        const cache = await caches.open(CACHE_NAME);
        const pendingCart = await cache.match('/api/cart/pending');
        
        if (pendingCart) {
            const cartData = await pendingCart.json();
            // In production, send to backend
            console.log('[Service Worker] Syncing cart:', cartData);
            await cache.delete('/api/cart/pending');
        }
    } catch (error) {
        console.error('[Service Worker] Cart sync failed:', error);
    }
}

/**
 * Sync profile data when online
 */
async function syncProfile() {
    try {
        const cache = await caches.open(CACHE_NAME);
        const pendingProfile = await cache.match('/api/profile/pending');
        
        if (pendingProfile) {
            const profileData = await pendingProfile.json();
            // In production, send to backend
            console.log('[Service Worker] Syncing profile:', profileData);
            await cache.delete('/api/profile/pending');
        }
    } catch (error) {
        console.error('[Service Worker] Profile sync failed:', error);
    }
}

// Push notification event
self.addEventListener('push', (event) => {
    console.log('[Service Worker] Push received:', event);
    
    const options = {
        body: event.data ? event.data.text() : 'New notification from GW Pharmacy',
        icon: '/assets/images/icon-192x192.png',
        badge: '/assets/images/badge-icon.png',
        vibrate: [200, 100, 200],
        tag: 'gwpharmacy-notification',
        requireInteraction: false
    };

    event.waitUntil(
        self.registration.showNotification('GW Pharmacy Portal', options)
    );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    console.log('[Service Worker] Notification clicked:', event);
    
    event.notification.close();

    event.waitUntil(
        clients.openWindow('/pages/dashboard.html')
    );
});

// Message event - communicate with main app
self.addEventListener('message', (event) => {
    console.log('[Service Worker] Message received:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.delete(CACHE_NAME).then(() => {
            console.log('[Service Worker] Cache cleared');
        });
    }
});

console.log('[Service Worker] Loaded successfully');
