import { useCallback, useEffect, useRef } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDebounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
    const fnRef = useRef(fn);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // keep latest fn reference
    useEffect(() => {
        fnRef.current = fn;
    }, [fn]);

    const debouncedFn = useCallback(
        (...args: Parameters<T>) => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            timerRef.current = setTimeout(() => {
                fnRef.current(...args);
            }, delay);
        },
        [delay]
    );

    // cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    return debouncedFn;
}
