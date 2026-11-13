'use client';

import { RefObject, useEffect } from 'react';

/**
 * Calls `onOutsideClick` when the user pointerdowns outside the given ref(s).
 * Pure refs-only check — caller decides what counts as "inside" by passing
 * the relevant element refs.
 */
export const useOutsideClick = (
    isActive: boolean,
    onOutsideClick: () => void,
    refs: RefObject<HTMLElement | null>[]
) => {
    useEffect(() => {
        if (!isActive) return;

        const handlePointerDown = (event: PointerEvent) => {
            const target = event.target as Node | null;
            if (!target) return;

            for (const ref of refs) {
                if (ref.current?.contains(target)) return;
            }

            onOutsideClick();
        };

        document.addEventListener('pointerdown', handlePointerDown);
        return () => document.removeEventListener('pointerdown', handlePointerDown);
    }, [isActive, onOutsideClick, refs]);
};
