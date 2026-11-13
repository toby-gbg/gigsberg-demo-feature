'use client';

import { useLayoutEffect, useState } from 'react';

export function useWrappedLabel() {
    const [labelElement, labelRef] = useState<HTMLLabelElement | null>(null);
    const [isWrapped, setIsWrapped] = useState(false);

    useLayoutEffect(() => {
        if (!labelElement) return;

        const measure = () => {
            const lineHeight = Number.parseFloat(getComputedStyle(labelElement).lineHeight);
            setIsWrapped(labelElement.getBoundingClientRect().height > lineHeight * 1.5);
        };

        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(labelElement);

        return () => observer.disconnect();
    }, [labelElement]);

    return { labelRef, isWrapped };
}
