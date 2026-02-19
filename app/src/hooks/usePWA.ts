import { useEffect, useState, useCallback } from 'react';

// ── Global event capture ─────────────────────────────────
// The browser may fire `beforeinstallprompt` before React mounts.
// We capture it globally so the hook can pick it up later.
let _deferredPrompt: any = null;
let _promptCaptured = false;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    _deferredPrompt = e;
    _promptCaptured = true;
    console.log('[PWA] beforeinstallprompt captured globally');
});

// Detect if already installed (display-mode: standalone)
function isAppInstalled(): boolean {
    return (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true
    );
}

export function usePWA() {
    const [isInstallable, setIsInstallable] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
    const [swRegistered, setSwRegistered] = useState(false);
    const [isInstalled, setIsInstalled] = useState(isAppInstalled());

    // Register service worker
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/sw.js')
                .then((reg) => {
                    console.log('[PWA] SW registered:', reg.scope);
                    setSwRegistered(true);

                    // Tell SW to schedule the nightly notification
                    if (reg.active) {
                        reg.active.postMessage({ type: 'SCHEDULE_NOTIFICATION' });
                    }
                    reg.addEventListener('updatefound', () => {
                        const newWorker = reg.installing;
                        newWorker?.addEventListener('statechange', () => {
                            if (newWorker.state === 'activated') {
                                newWorker.postMessage({ type: 'SCHEDULE_NOTIFICATION' });
                            }
                        });
                    });
                })
                .catch((err) => console.error('[PWA] SW registration failed:', err));
        }
    }, []);

    // Pick up globally captured prompt OR listen for future ones
    useEffect(() => {
        // If already installed, no install prompt needed
        if (isInstalled) return;

        // If the event was already captured before React mounted
        if (_promptCaptured && _deferredPrompt) {
            console.log('[PWA] Using previously captured install prompt');
            setDeferredPrompt(_deferredPrompt);
            setIsInstallable(true);
        }

        // Also listen for future events (e.g. after user dismisses and revisits)
        const handler = (e: Event) => {
            e.preventDefault();
            _deferredPrompt = e;
            setDeferredPrompt(e);
            setIsInstallable(true);
            console.log('[PWA] beforeinstallprompt received in hook');
        };
        window.addEventListener('beforeinstallprompt', handler);

        // Listen for successful install
        const installedHandler = () => {
            console.log('[PWA] App installed');
            setIsInstalled(true);
            setIsInstallable(false);
            setDeferredPrompt(null);
            _deferredPrompt = null;
        };
        window.addEventListener('appinstalled', installedHandler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
            window.removeEventListener('appinstalled', installedHandler);
        };
    }, [isInstalled]);

    // Check notification permission
    useEffect(() => {
        if ('Notification' in window) {
            setNotificationPermission(Notification.permission);
        }
    }, []);

    // Request notification permission and schedule
    const requestNotificationPermission = useCallback(async () => {
        if (!('Notification' in window)) {
            alert('This browser does not support notifications.');
            return false;
        }

        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);

        if (permission === 'granted') {
            // Tell SW to schedule
            const reg = await navigator.serviceWorker.ready;
            reg.active?.postMessage({ type: 'SCHEDULE_NOTIFICATION' });

            // Show a test notification immediately
            reg.showNotification('✅ Notifications Enabled!', {
                body: 'Jemish, you will get a reminder every night at 10:00 PM to add daily entries.',
                icon: '/icon-192.png',
                badge: '/icon-192.png',
                tag: 'setup-confirm',
            } as NotificationOptions);
        }

        return permission === 'granted';
    }, []);

    // Trigger install prompt
    const installApp = useCallback(async () => {
        const prompt = deferredPrompt || _deferredPrompt;
        if (!prompt) {
            console.warn('[PWA] No install prompt available');
            return;
        }
        prompt.prompt();
        const { outcome } = await prompt.userChoice;
        console.log('[PWA] Install outcome:', outcome);
        if (outcome === 'accepted') {
            setIsInstallable(false);
            setDeferredPrompt(null);
            _deferredPrompt = null;
        }
    }, [deferredPrompt]);

    return {
        isInstallable,
        isInstalled,
        installApp,
        notificationPermission,
        requestNotificationPermission,
        swRegistered,
    };
}
