import { useEffect, useRef } from 'react';

import useCookie from './useCookie';

type Options = {
    toggleCallback: () => void;
    storageKey: string;
    delay?: number;
    ignore?: boolean;
    proceed?: boolean;
};

export function useOpenDialogOnce({
    toggleCallback,
    storageKey,
    delay = 8000,
    ignore = false,
    proceed = false,
}: Options) {
    const hasShownRef = useRef(false);
    const { getCookie } = useCookie('gc');

    useEffect(() => {
        if (ignore) {
            toggleCallback();
            return;
        }

        if (!proceed) return;

        // Check if user has already seen the modal
        const hasSeenModal = localStorage.getItem(storageKey);
        if (hasSeenModal || hasShownRef.current) return;

        // Set timeout to show modal after 8 seconds
        const timer = setTimeout(() => {
            // Check if gc cookie exists after delay (it might take time to be set)
            const gcCookie = getCookie();

            // Don't show modal if gc cookie exists
            if (gcCookie) return;

            if (!hasShownRef.current) {
                toggleCallback();

                hasShownRef.current = true;

                // Mark as seen in localStorage
                localStorage.setItem(storageKey, 'true');
            }
        }, delay);

        // Cleanup timeout on unmount
        return () => clearTimeout(timer);
    }, []);
}
