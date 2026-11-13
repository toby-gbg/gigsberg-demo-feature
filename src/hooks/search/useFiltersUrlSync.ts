'use client';

import { useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePathname } from '@/i18n/routing';

import { EventSearchFilters } from '@/interfaces/Event';

import { useDebounce } from '../useDebounce';
import useIntlRouter from '../useIntlRouter';

/**
 * Returns a callback that pushes the current filter state into the URL.
 *
 * Rules:
 * - When `type=countries` is set, the new `countryId` maps to the `id` param,
 *   and the redundant `countryId` is dropped. Same for `type=cities` ↔ cityId.
 * - When the user clears country/city while `type` is set, both `type` and
 *   `id` are removed too (otherwise we'd leave a dangling URL like
 *   `?type=countries`).
 * - When type is not set, `countryId`/`cityId` are written as regular params.
 * - Stale `country`/`city`/`query` keys are always cleaned up.
 */
export const useFiltersUrlSync = (delay: number = 300) => {
    const search = useSearchParams();
    const pathname = usePathname();
    const router = useIntlRouter();
    const searchKey = search.toString();

    const syncFiltersToUrl = useCallback(
        (filters: EventSearchFilters) => {
            const hasFilters = Boolean(
                (filters.name && filters.name.trim()) ||
                (filters.nameUrl && filters.nameUrl.trim()) ||
                filters.venueId ||
                filters.performerId ||
                filters.cityId ||
                filters.countryId ||
                filters.fromDate ||
                filters.toDate ||
                filters.subtype
            );

            if (!hasFilters) return;

            const params = new URLSearchParams(searchKey);
            const isTypedSearch = params.has('type');
            const type = params.get('type');

            // Handle special typed search (countries/cities)
            if (type === 'countries') {
                if (filters.countryId) {
                    params.set('id', String(filters.countryId));
                } else {
                    params.delete('type');
                    params.delete('id');
                }
                params.delete('countryId');
            }

            if (type === 'cities') {
                if (filters.cityId) {
                    params.set('id', String(filters.cityId));
                } else {
                    params.delete('type');
                    params.delete('id');
                }
                params.delete('cityId');
            }

            // Sync main filters
            const synced: Record<string, string | number | null | undefined> = {
                q: filters.name,
                countryId: type === 'countries' ? undefined : filters.countryId,
                cityId: type === 'cities' ? undefined : filters.cityId,
                fromDate: filters.fromDate,
                toDate: filters.toDate,
                subtype: filters.subtype,
            };

            Object.entries(synced).forEach(([key, value]) => {
                if (value === undefined || value === null || value === '') {
                    params.delete(key);
                } else {
                    params.set(key, String(value));
                }
            });

            // Cleanup legacy params
            ['country', 'city', ...(!isTypedSearch ? ['query'] : [])].forEach((key) =>
                params.delete(key)
            );

            const queryString = params.toString();
            const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
            const currentUrl = searchKey ? `${pathname}?${searchKey}` : pathname;
            if (newUrl !== currentUrl) {
                router.replace(newUrl, { scroll: false });
            }
        },
        [pathname, router, searchKey]
    );

    // return debounced version
    return useDebounce(syncFiltersToUrl, delay);
};
