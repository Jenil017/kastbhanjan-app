const CACHE_NAME = 'kastbhanjan-v2';
const ASSETS = ['/', '/index.html', '/manifest.json', '/icon-192.png', '/icon-512.png'];

// Install: cache core assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

// Activate: clean old caches + start notification scheduler
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
    // Auto-start nightly notification scheduling
    scheduleNightlyNotification();
});

// Fetch: network first, fallback to cache
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    event.respondWith(
        fetch(event.request)
            .then((res) => {
                const clone = res.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                return res;
            })
            .catch(() => caches.match(event.request))
    );
});

// ── Push Notification Handler ────────────────────────────
// When server sends a push, show the notification
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {
        title: '📋 Kastbhanjan - Daily Reminder',
        body: 'Please add today\'s entries!'
    };
    const options = {
        body: data.body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        vibrate: [200, 100, 200, 100, 200],
        requireInteraction: true,
        tag: data.tag || 'daily-reminder',
        actions: [
            { action: 'open', title: '📂 Open App' },
            { action: 'dismiss', title: '✓ Done' }
        ],
        data: { url: data.url || '/' }
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
});

// ── Client-side Notification Scheduling (fallback) ───────
// This is a fallback for when server-side push isn't set up.
// Note: setTimeout in SW is unreliable (browser may kill SW),
// but works as a best-effort approach for now.
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
        scheduleNightlyNotification();
    }
});

function scheduleNightlyNotification() {
    const now = new Date();
    const next10pm = new Date();
    next10pm.setHours(22, 0, 0, 0);

    if (now >= next10pm) {
        next10pm.setDate(next10pm.getDate() + 1);
    }

    const msUntil10pm = next10pm.getTime() - now.getTime();

    setTimeout(() => {
        self.registration.showNotification('📋 Kastbhanjan - Daily Entry Reminder', {
            body: 'Jemish, please add today\'s purchases, sales and expenses before sleeping! 🌙',
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            vibrate: [200, 100, 200, 100, 200],
            requireInteraction: true,
            tag: 'daily-reminder',
            actions: [
                { action: 'open', title: '📂 Open App' },
                { action: 'dismiss', title: '✓ Already Done' }
            ],
            data: { url: '/' }
        });

        // Schedule again for next day
        scheduleNightlyNotification();
    }, msUntil10pm);
}

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'dismiss') return;

    // Open or focus the app
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    return client.focus();
                }
            }
            return clients.openWindow('/');
        })
    );
});
