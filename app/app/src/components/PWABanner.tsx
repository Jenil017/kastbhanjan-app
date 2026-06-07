import { useState } from 'react';
import { usePWA } from '@/hooks/usePWA';
import { Bell, BellOff, Download, X, Smartphone } from 'lucide-react';

export function PWABanner() {
    const {
        isInstallable,
        isInstalled,
        installApp,
        notificationPermission,
        requestNotificationPermission,
    } = usePWA();

    const [dismissed, setDismissed] = useState(() => {
        // Only persist dismissal for 24 hours
        const dismissedAt = localStorage.getItem('pwa-install-dismissed');
        if (dismissedAt) {
            const elapsed = Date.now() - parseInt(dismissedAt, 10);
            if (elapsed < 24 * 60 * 60 * 1000) return true;
            localStorage.removeItem('pwa-install-dismissed');
        }
        return false;
    });

    const [notifDismissed, setNotifDismissed] = useState(() => {
        return localStorage.getItem('pwa-notif-dismissed') === 'true';
    });



    // Detect iOS (no beforeinstallprompt on Safari)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isInStandaloneMode = isInstalled;

    const handleDismissInstall = () => {
        setDismissed(true);
        localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    };

    const handleDismissNotif = () => {
        setNotifDismissed(true);
        localStorage.setItem('pwa-notif-dismissed', 'true');
    };

    // Don't show anything if already installed as standalone
    if (isInStandaloneMode) return null;
    if (dismissed && notifDismissed) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 flex flex-col gap-2 md:left-auto md:right-4 md:w-96">
            {/* Install Banner - for browsers that support beforeinstallprompt */}
            {isInstallable && !dismissed && (
                <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-sm animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
                        <Download className="h-5 w-5 text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white">Install App</p>
                        <p className="text-xs text-slate-400">Add to home screen for quick access</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={installApp}
                            className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-amber-400 transition-colors"
                        >
                            Install
                        </button>
                        <button
                            onClick={handleDismissInstall}
                            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* iOS Safari Install Guide */}
            {isIOS && !isInStandaloneMode && !dismissed && !isInstallable && (
                <div className="rounded-xl border border-amber-500/30 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-sm animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
                            <Smartphone className="h-5 w-5 text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white">Install App</p>
                            <p className="text-xs text-slate-400">
                                Tap the <span className="inline-block mx-0.5">
                                    <svg className="inline h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                </span> Share button, then <strong>"Add to Home Screen"</strong>
                            </p>
                        </div>
                        <button
                            onClick={handleDismissInstall}
                            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Notification Banner */}
            {notificationPermission === 'default' && !notifDismissed && (
                <div className="flex items-center gap-3 rounded-xl border border-blue-500/30 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-sm animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/20">
                        <Bell className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white">Daily Reminders</p>
                        <p className="text-xs text-slate-400">Get notified at 10 PM to add daily entries</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={async () => {
                                const granted = await requestNotificationPermission();
                                if (granted) handleDismissNotif();
                            }}
                            className="rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-400 transition-colors"
                        >
                            Enable
                        </button>
                        <button
                            onClick={handleDismissNotif}
                            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Notification blocked warning */}
            {notificationPermission === 'denied' && !notifDismissed && (
                <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-sm animate-in slide-in-from-bottom-4 duration-500">
                    <BellOff className="h-5 w-5 shrink-0 text-red-400" />
                    <p className="flex-1 text-xs text-slate-400">
                        Notifications blocked. Enable in browser settings to get 10 PM reminders.
                    </p>
                    <button
                        onClick={handleDismissNotif}
                        className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
