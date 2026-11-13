'use client';

import { useEffect } from 'react';
import { useQueryStates } from '@/nuqs/hooks/useQueryStates';
import { searchParamsParsers } from '@/nuqs/params/search';

/**
 * Resets the page scroll position to the top whenever the URL search params
 * change. Smooth-scrolls to avoid jarring jumps on filter change.
 *
 * Dependency on the `search` object (not the stringified key) so the effect
 * fires exactly once per navigation, regardless of what changed inside the
 * params.
 */
export const useScrollToTopOnSearch = () => {
    const [search] = useQueryStates(searchParamsParsers);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [search]);
};
