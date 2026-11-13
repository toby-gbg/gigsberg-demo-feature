import { SEARCH_FILTER_KEYS } from '@/constants/search';

import { first } from './array';

export const buildSearchParams = (
    params: Record<string, string | string[] | undefined>,
    q?: string
): URLSearchParams => {
    const sp = new URLSearchParams();
    if (q) sp.set('q', q);
    for (const key of SEARCH_FILTER_KEYS) {
        if (key === 'q') continue;
        const v = first(params[key]);
        if (v) sp.set(key, v);
    }
    return sp;
};
