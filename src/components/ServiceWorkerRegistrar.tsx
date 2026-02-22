'use client';

import { useEffect } from 'react';

/**
 * Registers the service worker for PWA support.
 * Must be a client component — rendered inside the root layout body.
 * Silent in production if SW registration fails (e.g. unsupported browser).
 */
export function ServiceWorkerRegistrar() {
    useEffect(() => {
        if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

        navigator.serviceWorker
            .register('/sw.js', { scope: '/' })
            .then((reg) => {
                if (process.env.NODE_ENV === 'development') {
                    console.log('[SW] Registered, scope:', reg.scope);
                }
            })
            .catch((err) => {
                if (process.env.NODE_ENV === 'development') {
                    console.warn('[SW] Registration failed:', err);
                }
            });
    }, []);

    return null;
}
