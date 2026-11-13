// src/hooks/useDebounce.ts
import { useEffect, useState } from 'react';

export function useDebounceValue<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    // stringify guarantees the timeout only resets when the actual data changes
    // protect from infinite render loops interrupting the timer
    const valueStr = JSON.stringify(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [valueStr, delay]);

    return debouncedValue;
}
