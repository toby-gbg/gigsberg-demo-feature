'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * Parsed view of the current URL search params relevant to the search page.
 *
 * Note: `countryId`/`cityId` honor the type+id priority rule — when
 * `type=countries` or `type=cities`, the value of `id` is used (a redundant
 * `countryId`/`cityId` param in the URL is ignored). This is the single
 * source of truth for country/city across SSR and client; see
 * `useFiltersUrlSync` for the write-side counterpart.
 */
export interface StoredSearchParams {
    type: string | null;
    id: string | null;
    countryId: string | null;
    cityId: string | null;
    query: string | null;
    fromDate: string | null;
    toDate: string | null;
    /** Convenience flag for "this is a city slug page". */
    isCitySearch: boolean;
}

/**
 * Reads the URL and returns a memoized object of the params the search view
 * cares about. Recomputes only when the underlying `URLSearchParams` object
 * changes (i.e. on navigation).
 */
export const useStoredSearchParams = (): StoredSearchParams => {
    const search = useSearchParams();

    return useMemo<StoredSearchParams>(() => {
        const type = search.get('type');
        const id = search.get('id');

        // Type+id wins over countryId/cityId when both are present in the URL
        const countryId = type === 'countries' ? id : search.get('countryId');
        const cityId = type === 'cities' ? id : search.get('cityId');

        return {
            type,
            id,
            countryId,
            cityId,
            query: search.get('query'),
            fromDate: search.get('fromDate'),
            toDate: search.get('toDate'),
            isCitySearch: type === 'cities',
        };
    }, [search]);
};
