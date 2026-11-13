'use client';

import { useCallback } from 'react';

import useIntlRouter from '@/hooks/useIntlRouter';

/**
 * Returns a navigation function that calls `router.back()` only when the
 * referrer is from the same origin (i.e. the user arrived from our own site).
 * Otherwise it falls back to `router.replace('/')` so we never navigate to
 * an external domain.
 */
const useSafeBack = () => {
    const router = useIntlRouter();

    const safeBack = useCallback(() => {
        const referrer = document.referrer;
        const isSameOrigin = referrer && new URL(referrer).origin === window.location.origin;

        if (isSameOrigin) {
            router.back();
        } else {
            router.replace('/');
        }
    }, [router]);

    return safeBack;
};

export default useSafeBack;
