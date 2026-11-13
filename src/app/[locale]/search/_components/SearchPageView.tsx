'use client';

import { FC, Fragment, useEffect, useState } from 'react';
import isEqual from 'lodash-es/isEqual';
import { useUpdateEffect } from 'react-use';

import { EventSearchFilters, EventTicket } from '@/interfaces/Event';
import { FastifyPagination } from '@/interfaces/Fetch';
import { useEvents } from '@/swr/features/events';

import { useSearchContext } from '@/providers/SearchProvider';
import { useScrollToTopOnSearch } from '@/hooks/search/useScrollToTopOnSearch';
import useFooterImages from '@/hooks/useFooterImages';

import EmptyEventList from '@/components/EmptyEventList';
import { ListEventDetailsCardSkeleton } from '@/components/EventDetailsCardSkeleton';
import EventDetailsCardsView from '@/components/EventDetailsCardsView';
import ViewMoreButton from '@/components/ViewMoreButton';

interface SearchViewProps {
    initialData?: FastifyPagination<EventTicket> | undefined;
    initialFilters: EventSearchFilters;
    currencyCode: string;
}

const SearchView: FC<SearchViewProps> = ({ initialData, initialFilters, currencyCode }) => {
    const { filtersValue, filtersValueEmpty } = useSearchContext();

    const [filters, setFilters] = useState(filtersValue);

    useScrollToTopOnSearch();

    // WLB-3153: Server results and local filters can belong to different searches
    // during navigation. Only reuse server data for its matching SWR filters.
    const { data, isLoading, isLoadingMore, hasMore, isValidating, loadMore, setSize, mutate } =
        useEvents(filters, isEqual(filters, initialFilters) ? initialData : undefined);

    const isFetching = isLoading || isValidating;
    const isEmptyData = data.length === 0;

    useFooterImages({ events: data });

    const handleLoadMore = () => {
        setFilters((old) => ({ ...old, pageNumber: (old.pageNumber ?? 1) + 1 }));
        loadMore();
    };

    const showNoResults = (isEmptyData && !isFetching) || filtersValueEmpty;

    const resetFilters = () => {
        setFilters({
            ...filtersValue,
            pageNumber: 1,
        });
    };

    useEffect(() => {
        resetFilters();
    }, [filtersValue]);

    // WLB-3153: resetFilters() does not update the SWR key synchronously. Running
    // setSize()/mutate() before filters match can put new results in the old cache.
    // Revisiting that key then reads the wrong cached data instead of initialData
    // (useEvents disables stale revalidation). Retry when filters match so server
    // results update the correct key, even if initialData has not changed again.
    useUpdateEffect(() => {
        if (!initialData || !isEqual(filters, initialFilters)) return;
        resetFilters();
        setSize(1);
        mutate([initialData], { revalidate: false });
    }, [initialData, isEqual(filters, initialFilters)]);

    if (isEmptyData && isFetching) return <ListEventDetailsCardSkeleton />;

    return (
        <div className="flex flex-col gap-y-5">
            {showNoResults && <EmptyEventList hasActiveFilters={!filtersValueEmpty} backUrl="/" />}
            {!showNoResults && (
                <Fragment>
                    <EventDetailsCardsView events={data} currencyCode={currencyCode} />

                    {/* skeleton shown below existing list while page 2+ is loading */}
                    {isValidating && <ListEventDetailsCardSkeleton />}

                    {hasMore && (
                        <ViewMoreButton
                            onClick={handleLoadMore}
                            disabled={isFetching || isLoadingMore}
                        />
                    )}
                </Fragment>
            )}
        </div>
    );
};

export default SearchView;
