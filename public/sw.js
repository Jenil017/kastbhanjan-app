const CACHE_NAME = 'kastbhanjan-v1';
const ASSETS = ['/', '/index.html'];

// Install: cache core assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
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

// ── Notification Scheduling ──────────────────────────────
// Listen for messages from the app
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
        scheduleNightlyNotification();
    }
});

function scheduleNightlyNotification() {
    // Calculate ms until next 10:00 PM
    const now = new Date();
    const next10pm = new Date();
    next10pm.setHours(22, 0, 0, 0);

    // If already past 10pm today, schedule for tomorrow
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

// Auto-start scheduling when SW activates
self.addEventListener('activate', () => {
    scheduleNightlyNotification();
});
