import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverOptions {
    threshold?: number;
    rootMargin?: string;
    root?: Element | null;
}

interface UseIntersectionObserverReturn {
    ref: React.RefObject<HTMLDivElement | null>;
    isVisible: boolean;
    hasBeenVisible: boolean;
}

export const useIntersectionObserver = (
    options: UseIntersectionObserverOptions = {}
): UseIntersectionObserverReturn => {
    const { threshold = 0.1, rootMargin = '0px', root = null } = options;
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [hasBeenVisible, setHasBeenVisible] = useState(false);
    const hasBeenVisibleRef = useRef(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                const visible = entry.isIntersecting;
                setIsVisible(visible);

                if (visible && !hasBeenVisibleRef.current) {
                    hasBeenVisibleRef.current = true;
                    setHasBeenVisible(true);
                }
            },
            {
                threshold,
                rootMargin,
                root,
            }
        );

        observer.observe(element);

        return () => {
            observer.unobserve(element);
        };
    }, [threshold, rootMargin, root]);

    return { ref, isVisible, hasBeenVisible };
};
