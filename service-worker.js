// BELAI Service Worker — v1.0
// Caches app shell for offline use. AI features (Groq/MongoDB) require network.

const CACHE_NAME = 'belai-v1';
const OFFLINE_URL = '/index.html';

// Files to cache on install (app shell)
const PRECACHE_ASSETS = [
    '/index.html',
    '/manifest.json',
    'https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap',
    'https://cdn.jsdelivr.net/npm/@zxing/library@0.19.1/umd/index.min.js',
];

// ── Install: precache app shell ───────────────────────────
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('[SW] Precaching app shell');
            // Cache index.html and manifest; remote assets may fail — that's OK
            return cache.addAll(['/index.html', '/manifest.json']).catch(() => { });
        })
    );
    self.skipWaiting();
});

// ── Activate: clean old caches ────────────────────────────
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// ── Fetch: network-first for API, cache-first for assets ──
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // API calls (Groq / backend) — always network, no cache
    if (
        url.hostname.includes('groq.com') ||
        url.hostname.includes('api.') ||
        url.port === '4000' ||
        url.pathname.startsWith('/api/')
    ) {
        return; // Let browser handle normally
    }

    // Unsplash images — cache after first load
    if (url.hostname.includes('unsplash.com')) {
        event.respondWith(
            caches.open(CACHE_NAME).then(cache =>
                cache.match(event.request).then(cached => {
                    if (cached) return cached;
                    return fetch(event.request)
                        .then(res => { cache.put(event.request, res.clone()); return res; })
                        .catch(() => cached);
                })
            )
        );
        return;
    }

    // Google Fonts & ZXing — cache after first load
    if (url.hostname.includes('fonts.googleapis.com') ||
        url.hostname.includes('fonts.gstatic.com') ||
        url.hostname.includes('jsdelivr.net')) {
        event.respondWith(
            caches.open(CACHE_NAME).then(cache =>
                cache.match(event.request).then(cached => {
                    if (cached) return cached;
                    return fetch(event.request).then(res => {
                        cache.put(event.request, res.clone());
                        return res;
                    });
                })
            )
        );
        return;
    }

    // App shell (index.html, manifest) — network-first, fall back to cache
    event.respondWith(
        fetch(event.request)
            .then(res => {
                // Update cache with fresh response
                const clone = res.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                return res;
            })
            .catch(() =>
                caches.match(event.request).then(cached => cached || caches.match(OFFLINE_URL))
            )
    );
});

// ── Push Notifications ────────────────────────────────────
self.addEventListener('push', event => {
    const data = event.data?.json() || {};
    const title = data.title || '🌾 BELAI Alert';
    const options = {
        body: data.body || 'New update from BELAI',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-72.png',
        vibrate: [200, 100, 200],
        data: { url: data.url || '/' },
        actions: [
            { action: 'open', title: 'Open App' },
            { action: 'dismiss', title: 'Dismiss' }
        ]
    };
    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    if (event.action !== 'dismiss') {
        event.waitUntil(clients.openWindow(event.notification.data?.url || '/'));
    }
});


