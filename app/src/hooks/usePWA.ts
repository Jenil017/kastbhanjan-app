import { useEffect, useState } from 'react';

export function usePWA() {
    const [isInstallable, setIsInstallable] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
    const [swRegistered, setSwRegistered] = useState(false);

    // Register service worker
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/sw.js')
                .then((reg) => {
                    console.log('SW registered:', reg.scope);
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
                .catch((err) => console.error('SW registration failed:', err));
        }
    }, []);

    // Listen for install prompt
    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsInstallable(true);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    // Check notification permission
    useEffect(() => {
        if ('Notification' in window) {
            setNotificationPermission(Notification.permission);
        }
    }, []);

    // Request notification permission and schedule
    const requestNotificationPermission = async () => {
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
    };

    // Trigger install prompt
    const installApp = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setIsInstallable(false);
            setDeferredPrompt(null);
        }
    };

    return {
        isInstallable,
        installApp,
        notificationPermission,
        requestNotificationPermission,
        swRegistered,
    };
}
