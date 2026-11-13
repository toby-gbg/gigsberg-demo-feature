'use client';

import { useState } from 'react';
import { useUpdateEffect } from 'react-use';

import { EventSearchFilters, EventTicket } from '@/interfaces/Event';
import { FastifyPagination } from '@/interfaces/Fetch';
import { useEvents } from '@/swr/features/events';
import { EMPTY_EVENTS } from '@/constants/events';
import { DEFAULT_SIZE } from '@/constants/pagination';

import { ListEventDetailsCardSkeleton } from '@/components/EventDetailsCardSkeleton';
import EventDetailsCardsView from '@/components/EventDetailsCardsView';
import ViewMoreButton from '@/components/ViewMoreButton';

import { useVenueContext } from '../_providers/VenueProvider';
import VenueEmptyState from './VenueEmptyState';

interface VenueEventsProps {
    events: FastifyPagination<EventTicket> | undefined;
    currencyCode: string;
}

const VenueEvents = ({ events: initialEvents = EMPTY_EVENTS, currencyCode }: VenueEventsProps) => {
    const { totalCount } = initialEvents ?? {};
    const { filtersValue, venueName } = useVenueContext();

    const [filters, setFilters] = useState<EventSearchFilters & { venueNameUrl?: string }>({
        ...filtersValue,
        venueNameUrl: venueName,
    });

    // data fetching
    const { data, isLoading, isLoadingMore, hasMore, isValidating, loadMore, setSize, mutate } =
        useEvents(filters, initialEvents);

    const isFetching = isLoading || isValidating;
    const isEmptyData = !isFetching && data.length === 0;

    const skeletonCardCount = Math.min(DEFAULT_SIZE, totalCount - data.length);

    const handleLoadMore = () => {
        setFilters((old) => ({
            ...old,
            pageNumber: (old.pageNumber ?? 1) + 1,
        }));
        loadMore();
    };

    // Reset client data when search params are changed
    useUpdateEffect(() => {
        setFilters((prev) => ({
            ...prev,
            ...filtersValue,
            pageNumber: 1,
        }));

        setSize(1);
        mutate([initialEvents], { revalidate: false });
    }, [initialEvents, filtersValue]);

    return (
        <>
            {!isEmptyData && (
                <div className="space-y-4">
                    <EventDetailsCardsView events={data} currencyCode={currencyCode} />
                </div>
            )}
            {isEmptyData && <VenueEmptyState />}
            {isFetching && filters.pageNumber !== 1 && (
                <ListEventDetailsCardSkeleton cardCount={skeletonCardCount} />
            )}

            {!isFetching && hasMore && (
                <ViewMoreButton onClick={handleLoadMore} disabled={isFetching || isLoadingMore} />
            )}
        </>
    );
};

export default VenueEvents;
