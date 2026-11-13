'use client';

import { FC, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useUpdateEffect } from 'react-use';

import { EventSearchFilters, EventTicket } from '@/interfaces/Event';
import { FastifyPagination } from '@/interfaces/Fetch';
import GoogleAnalyticsTracker from '@/lib/seo/GoogleAnalyticsTracker';
import GoogleEventMapper, { CreativeNameEnum, CreativeSlotEnum } from '@/utils/GoogleEventMapper';
import { useLazyGetEntityEventsQuery } from '@/swr/features/events';
import { EMPTY_EVENTS } from '@/constants/events';

import { useUser } from '@/providers/UserProvider';
import useFooterImages from '@/hooks/useFooterImages';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

import { COMMON_OBSERVER_OPTIONS } from '../../../_constants';
import { useEntityContext } from '../../../_providers/EntityProvider';
import { eventSearchParamsParsers } from '../../../_searchParams';
import EntityEventSection from './EntityEventSection';

const EVENT_FILTER_KEYS = Object.keys(
    eventSearchParamsParsers
) as (keyof typeof eventSearchParamsParsers)[];

export interface EventListProps {
    events: FastifyPagination<EventTicket> | undefined;
    currencyCode?: string;
}

const EventList: FC<EventListProps> = ({
    events: initialDataProp = EMPTY_EVENTS,
    currencyCode = 'USD',
}) => {
    const { entityMetadata, filtersValue } = useEntityContext();
    const userId = useUser()?.id ?? -1;

    useFooterImages({
        entities: entityMetadata?.entity ? [entityMetadata.entity] : [],
        clearOnUnmount: true,
    });

    const params = useParams<{ type?: string; subtype?: string }>();

    const [data, setData] = useState<FastifyPagination<EventTicket>>(initialDataProp);
    const [filters, setFilters] = useState<EventSearchFilters>({ ...filtersValue, currencyCode });

    const { trigger: fetchNewEvents, isMutating: isFetching } = useLazyGetEntityEventsQuery();

    const fetchInitialEvents = async () => {
        try {
            const newFilters = { ...filtersValue, currencyCode, pageNumber: 1 };
            setFilters(newFilters);
            const data = await fetchNewEvents(newFilters);
            setData(data ?? EMPTY_EVENTS);
        } catch (e) {
            console.error('Error fetching initial events:', e);
        }
    };

    // Refresh prices when the currency or signed-in user's VAT context changes.
    useUpdateEffect(() => {
        fetchInitialEvents();
    }, [currencyCode, userId]);

    const { ref: nearbyRef, hasBeenVisible: nearbyVisible } =
        useIntersectionObserver(COMMON_OBSERVER_OPTIONS);
    const { ref: internationalRef, hasBeenVisible: internationalVisible } =
        useIntersectionObserver(COMMON_OBSERVER_OPTIONS);

    const dataRows = data?.rows ?? [];
    const nearbyEvents = useMemo(
        () => dataRows.filter((item) => item?.eventType === 'nearby'),
        [dataRows]
    );
    const internationalEvents = useMemo(
        () => dataRows.filter((item) => item?.eventType === 'international'),
        [dataRows]
    );
    const isAwaitingFilterResults = EVENT_FILTER_KEYS.some(
        (key) => (filters[key] ?? null) !== (filtersValue[key] ?? null)
    );
    const isEventsLoading =
        (isFetching && (filters.pageNumber ?? 1) === 1) || isAwaitingFilterResults;
    const isLoadingMore = isFetching && (filters.pageNumber ?? 1) !== 1;
    const isEmpty = !isAwaitingFilterResults && data?.rows?.length === 0;

    // Reset client data when search params are changed
    useUpdateEffect(() => {
        setFilters({ ...filtersValue, currencyCode, pageNumber: 1 });
        setData(initialDataProp);
    }, [initialDataProp]);

    // GA Promotion tracking
    useEffect(() => {
        if (nearbyVisible && data.rows.length > 0) {
            const promotionItems = data.rows.map((event) =>
                GoogleEventMapper.mapEventToPromotionItem(event)
            );
            GoogleAnalyticsTracker.triggerGA4PromotionEvent('view_promotion', {
                creative_name: CreativeNameEnum.NEARBY_EVENTS,
                creative_slot: CreativeSlotEnum.ARTIST_PAGE,
                items: [promotionItems[0]],
            });
        }

        if (internationalVisible && data.rows.length > 0) {
            const promotionItems = data.rows.map((event) =>
                GoogleEventMapper.mapEventToPromotionItem(event)
            );
            GoogleAnalyticsTracker.triggerGA4PromotionEvent('view_promotion', {
                creative_name: CreativeNameEnum.INTERNATIONAL_EVENTS,
                creative_slot: CreativeSlotEnum.ARTIST_PAGE,
                items: [promotionItems[0]],
            });
        }
    }, [internationalVisible, nearbyVisible, data.rows, params.type, params.subtype]);

    const handleLoadMore = async () => {
        try {
            const newFilters = {
                ...filters,
                currencyCode,
                pageNumber: filters.pageNumber! + 1,
            };
            setFilters(newFilters);
            const data = await fetchNewEvents(newFilters);
            const responseData = data ?? EMPTY_EVENTS;
            setData((prev) => ({
                ...responseData,
                rows: [...(prev?.rows ?? []), ...(responseData?.rows ?? [])],
            }));
        } catch (error) {
            console.error('Error fetching more events:', error);
        }
    };

    return (
        <EntityEventSection
            totalCount={data?.totalCount ?? 0}
            nearbyEvents={nearbyEvents}
            internationalEvents={internationalEvents}
            isLoading={isEventsLoading}
            nearbyRef={nearbyRef}
            internationalRef={internationalRef}
            isEmpty={isEmpty}
            hasMore={data?.hasMore}
            isLoadingMore={isLoadingMore}
            isLoadMoreLoading={isFetching}
            onLoadMore={handleLoadMore}
            subTitleClassName="text-xl! text-[#4D4D4D]"
            currencyCode={currencyCode ?? 'USD'}
        />
    );
};

export default EventList;
