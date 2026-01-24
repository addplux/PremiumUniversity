const CACHE_NAME = 'afriedu-hub-v1.0.0';
const OFFLINE_URL = '/offline.html';

// Critical assets to cache immediately on install
const PRECACHE_ASSETS = [
    '/',
    '/offline.html',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
    /\/api\/courses/,
    /\/api\/grades/,
    /\/api\/enrollments/,
    /\/api\/dashboard/,
    /\/api\/organizations\/current/
];

// Install event - cache critical assets
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Precaching assets');
                return cache.addAll(PRECACHE_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => name !== CACHE_NAME)
                        .map((name) => {
                            console.log('[Service Worker] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip chrome-extension and other non-http(s) requests
    if (!url.protocol.startsWith('http')) {
        return;
    }

    event.respondWith(handleFetch(request));
});

async function handleFetch(request) {
    const url = new URL(request.url);

    // Strategy 1: Network-first for API calls (with fallback to cache)
    if (url.pathname.startsWith('/api/')) {
        return networkFirstStrategy(request);
    }

    // Strategy 2: Cache-first for static assets
    if (isStaticAsset(url.pathname)) {
        return cacheFirstStrategy(request);
    }

    // Strategy 3: Stale-while-revalidate for HTML pages
    return staleWhileRevalidateStrategy(request);
}

// Network-first strategy (for API calls)
async function networkFirstStrategy(request) {
    try {
        const networkResponse = await fetch(request);

        // Cache successful API responses
        if (networkResponse.ok && shouldCacheAPI(request.url)) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.log('[Service Worker] Network failed, trying cache:', request.url);
        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
            return cachedResponse;
        }

        // Return offline response for navigation requests
        if (request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
        }

        throw error;
    }
}

// Cache-first strategy (for static assets)
async function cacheFirstStrategy(request) {
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
        return cachedResponse;
    }

    try {
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.error('[Service Worker] Fetch failed:', error);
        throw error;
    }
}

// Stale-while-revalidate strategy (for HTML pages)
async function staleWhileRevalidateStrategy(request) {
    const cachedResponse = await caches.match(request);

    const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse.ok) {
            const cache = caches.open(CACHE_NAME);
            cache.then((c) => c.put(request, networkResponse.clone()));
        }
        return networkResponse;
    }).catch(() => {
        // If fetch fails and we have no cache, return offline page
        if (!cachedResponse && request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
        }
    });

    return cachedResponse || fetchPromise;
}

// Helper: Check if URL is a static asset
function isStaticAsset(pathname) {
    const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.svg', '.woff', '.woff2', '.ttf'];
    return staticExtensions.some(ext => pathname.endsWith(ext));
}

// Helper: Check if API response should be cached
function shouldCacheAPI(url) {
    return API_CACHE_PATTERNS.some(pattern => pattern.test(url));
}

// Background Sync - for offline submissions
self.addEventListener('sync', (event) => {
    console.log('[Service Worker] Background sync:', event.tag);

    if (event.tag === 'sync-submissions') {
        event.waitUntil(syncSubmissions());
    }

    if (event.tag === 'sync-attendance') {
        event.waitUntil(syncAttendance());
    }
});

async function syncSubmissions() {
    console.log('[Service Worker] Syncing submissions...');

    try {
        // Get pending submissions from IndexedDB
        const db = await openIndexedDB();
        const submissions = await getAllFromStore(db, 'pending-submissions');

        for (const submission of submissions) {
            try {
                const response = await fetch('/api/assignments/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': submission.token
                    },
                    body: JSON.stringify(submission.data)
                });

                if (response.ok) {
                    // Remove from pending after successful sync
                    await deleteFromStore(db, 'pending-submissions', submission.id);
                    console.log('[Service Worker] Synced submission:', submission.id);
                }
            } catch (error) {
                console.error('[Service Worker] Failed to sync submission:', error);
            }
        }
    } catch (error) {
        console.error('[Service Worker] Sync submissions failed:', error);
    }
}

async function syncAttendance() {
    console.log('[Service Worker] Syncing attendance...');
    // Similar to syncSubmissions but for attendance records
}

// IndexedDB helpers
function openIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('afriedu-offline', 1);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function getAllFromStore(db, storeName) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function deleteFromStore(db, storeName, key) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// Push notifications (for future use)
self.addEventListener('push', (event) => {
    console.log('[Service Worker] Push received:', event);

    const data = event.data ? event.data.json() : {};
    const title = data.title || 'AfriEdu Hub';
    const options = {
        body: data.body || 'You have a new notification',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        data: data.url || '/'
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    console.log('[Service Worker] Notification clicked');

    event.notification.close();

    event.waitUntil(
        clients.openWindow(event.notification.data || '/')
    );
});

console.log('[Service Worker] Loaded');
