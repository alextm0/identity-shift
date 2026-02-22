// Identity Shifter — Minimal Service Worker
// Strategy: network-first for API calls, cache-first for static assets

const CACHE_NAME = 'identity-shifter-v1';
const APP_SHELL = ['/dashboard'];

// Install: pre-cache the app shell
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
    );
});

// Activate: clean up old cache versions
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys
                        .filter((key) => key !== CACHE_NAME)
                        .map((key) => caches.delete(key))
                )
            )
            .then(() => self.clients.claim())
    );
});

// Fetch: network-first for API/auth, cache-first for everything else
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Always go network-first for API routes, auth, and non-GET requests
    if (
        request.method !== 'GET' ||
        url.pathname.startsWith('/api/') ||
        url.pathname.startsWith('/auth/')
    ) {
        return; // Let the browser handle it normally
    }

    event.respondWith(
        caches.match(request).then((cached) => {
            const fetchAndCache = fetch(request)
                .then((response) => {
                    if (response.ok && response.type !== 'opaque') {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                    }
                    return response;
                })
                .catch(() => cached); // Offline fallback to cache

            // Return cache immediately if available, update in background
            return cached || fetchAndCache;
        })
    );
});
