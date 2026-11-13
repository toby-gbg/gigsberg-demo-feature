'use server';

import dynamic from 'next/dynamic';
import { searchParamsCache } from '@/nuqs/params/search';

import { EventSearchFilters } from '@/interfaces/Event';
import { buildSearchFiltersValue, checkFiltersValueEmpty } from '@/utils/search';
import { getCurrencyFromCookies } from '@/services/server/currencies';
import { eventApi } from '@/services/server/events';
import { EMPTY_EVENTS } from '@/constants/events';

import { ListEventDetailsCardSkeleton } from '@/components/EventDetailsCardSkeleton';

const SearchView = dynamic(() => import('./SearchPageView'), {
    loading: () => <ListEventDetailsCardSkeleton />,
});

export default async function SearchFetcher() {
    const searchParams = searchParamsCache.all();

    const filtersValue: EventSearchFilters = buildSearchFiltersValue(searchParams);

    const results = checkFiltersValueEmpty(filtersValue)
        ? null
        : await eventApi.searchEvents(filtersValue);

    const resolvedEvents = results ?? EMPTY_EVENTS;

    const currencyCode = await getCurrencyFromCookies();

    return (
        <SearchView
            initialData={resolvedEvents}
            initialFilters={filtersValue}
            currencyCode={currencyCode ?? 'USD'}
        />
    );
}
