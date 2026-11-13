'use client';

import { useEffect, useState } from 'react';
import { useUpdateEffect } from 'react-use';

import { EventSearchFilters, EventTicket } from '@/interfaces/Event';
import { removeTicketsSuffix } from '@/utils/common';

import { useFiltersUrlSync } from './useFiltersUrlSync';
import { useStoredSearchParams } from './useStoredSearchParams';

interface UseSearchFiltersOptions {
    /** SSR-precomputed initial filters (from the server component). */
    initialFilters?: EventSearchFilters;
    /**
     * If provided, the view is used as an inline event list (e.g. embedded in
     * another page) and must NOT touch the URL — both directions of sync are
     * skipped. Generic so any `onClick` shape (EventTicket, etc.) passes
     * through without contravariance errors.
     */
    onClick?: (event: EventTicket) => void;
    /** Toggles "sell ticket" mode, which adds extra filter keys. */
    isSellTicketPage: boolean;
    /** Pro user flag (only consulted on sell-ticket pages). number per User interface. */
    isProOnly?: number;
}

/**
 * Owns the EventSearchFilters state and the two-way sync with the URL.
 *
 * - URL → state: when `type`/`id`/`query`/`countryId` change (back/forward
 *   navigation, external link), re-derive the filter object from the URL.
 * - state → URL: when a user-editable field changes, push it via
 *   `useFiltersUrlSync`. We never sync `pageNumber` to the URL.
 * - Mount-time sync: if SSR supplied cityName+cityId in initialFilters,
 *   normalize them into the URL once.
 *
 * Also returns `handleSearchChange` for the free-text input — preserves
 * caret position across React's controlled-input re-renders.
 */
export const useSearchFilters = ({
    initialFilters,
    onClick,
    isSellTicketPage,
    isProOnly,
}: UseSearchFiltersOptions) => {
    const storedParams = useStoredSearchParams();
    const { type, id, query, countryId } = storedParams;

    const syncFiltersToUrl = useFiltersUrlSync();

    // Initial state derived from URL (or from SSR initialFilters if provided)
    const [filters, setFilters] = useState<EventSearchFilters>(
        initialFilters ?? buildFiltersFromParams(storedParams, { isSellTicketPage, isProOnly })
    );

    // Re-derive filters when the URL changes (back/forward navigation, external update)
    useUpdateEffect(() => {
        if (!type && !id && !query) return;

        setFilters((prev) => ({
            ...(type === 'venues' && id && { venueId: id }),
            ...(type === 'performers' && id && { performerId: id }),
            ...(type === 'cities' && id && { cityId: id }),
            ...(countryId && { countryId }),
            ...(type === 'countries' && id && { countryId: id }),
            ...(prev.fromDate && prev.toDate && { fromDate: prev.fromDate, toDate: prev.toDate }),
            ...(query &&
                !storedParams.isCitySearch &&
                (type ? { nameUrl: removeTicketsSuffix(query) } : { name: query })),
            pageNumber: 1,
            pageSize: prev.pageSize,
        }));
    }, [type, id, query, countryId]);

    // Push filter changes to the URL whenever a user-editable field changes
    useUpdateEffect(() => {
        if (!onClick) syncFiltersToUrl(filters);
    }, [
        filters.name,
        filters.countryId,
        filters.cityId,
        filters.fromDate,
        filters.toDate,
        filters.subtype,
    ]);

    // Post-mount one-shot sync — SSR initialFilters may carry cityName+cityId from the first result that the URL doesn't have
    useEffect(() => {
        if (!onClick && initialFilters?.cityName && initialFilters?.cityId) {
            syncFiltersToUrl(initialFilters);
        }
    }, []);

    return { filters, setFilters };
};

/**
 * Build the initial `EventSearchFilters` from URL params.
 * Mirrors the server-side derivation in `app/[locale]/search/page.tsx`.
 */
const buildFiltersFromParams = (
    storedParams: ReturnType<typeof useStoredSearchParams>,
    options: { isSellTicketPage: boolean; isProOnly?: number }
): EventSearchFilters => {
    const { type, id, query, fromDate, toDate, countryId, isCitySearch } = storedParams;
    const { isSellTicketPage, isProOnly } = options;

    return {
        ...(type === 'venues' && id && { venueId: id }),
        ...(type === 'performers' && id && { performerId: id }),
        ...(type === 'cities' && id && { cityId: id }),
        ...(countryId && { countryId }),
        ...(type === 'countries' && id && { countryId: id }),
        ...(fromDate && toDate && { fromDate, toDate }),
        ...(query &&
            !isCitySearch &&
            (type ? { nameUrl: removeTicketsSuffix(query) } : { name: query })),
        ...(isSellTicketPage && { action: 'sell_ticket' }),
        ...(isSellTicketPage && { isProOnly: !isProOnly ? 0 : undefined }),
        pageNumber: 1,
        pageSize: 32,
    };
};
