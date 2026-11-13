import { useEffect, useRef } from 'react';

type Options = {
    storageKey: string;
    toggleCallback?: () => void;
    delay?: number;
    manual?: boolean;
};

export function useStorageOnce({
    toggleCallback,
    storageKey,
    delay = 300,
    manual = false,
}: Options) {
    const hasShownRef = useRef(false);

    const trigger = () => {
        if (!manual) return;

        const existed = localStorage.getItem(storageKey);
        if (existed) return;

        localStorage.setItem(storageKey, 'true');
    };

    useEffect(() => {
        const existed = localStorage.getItem(storageKey);
        if (existed || hasShownRef.current) return;

        const timer = setTimeout(() => {
            if (!hasShownRef.current) {
                toggleCallback?.();

                hasShownRef.current = true;

                // mark as seen in localStorage
                if (!manual) localStorage.setItem(storageKey, 'true');
            }
        }, delay);

        return () => clearTimeout(timer);
    }, [manual]);

    return { trigger };
}
