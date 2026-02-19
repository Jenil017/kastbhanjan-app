import { useState } from 'react';
import { usePWA } from '@/hooks/usePWA';
import { Bell, BellOff, Download, X } from 'lucide-react';

export function PWABanner() {
    const { isInstallable, installApp, notificationPermission, requestNotificationPermission } = usePWA();
    const [dismissed, setDismissed] = useState(false);
    const [notifDismissed, setNotifDismissed] = useState(false);

    if (dismissed && notifDismissed) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 flex flex-col gap-2 md:left-auto md:right-4 md:w-96">
            {/* Install Banner */}
            {isInstallable && !dismissed && (
                <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-sm">
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
                            onClick={() => setDismissed(true)}
                            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Notification Banner */}
            {notificationPermission === 'default' && !notifDismissed && (
                <div className="flex items-center gap-3 rounded-xl border border-blue-500/30 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-sm">
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
                                if (granted) setNotifDismissed(true);
                            }}
                            className="rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-400 transition-colors"
                        >
                            Enable
                        </button>
                        <button
                            onClick={() => setNotifDismissed(true)}
                            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Notification blocked warning */}
            {notificationPermission === 'denied' && !notifDismissed && (
                <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-sm">
                    <BellOff className="h-5 w-5 shrink-0 text-red-400" />
                    <p className="flex-1 text-xs text-slate-400">
                        Notifications blocked. Enable in browser settings to get 10 PM reminders.
                    </p>
                    <button
                        onClick={() => setNotifDismissed(true)}
                        className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
