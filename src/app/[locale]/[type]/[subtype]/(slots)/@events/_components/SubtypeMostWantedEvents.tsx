'use client';

import { useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { EventFilterOptionsResponse, EventTicket } from '@/interfaces/Event';
import { Pagination } from '@/interfaces/Fetch';
import Subtype from '@/interfaces/Subtype';
import GoogleAnalyticsTracker from '@/lib/seo/GoogleAnalyticsTracker';
import { generateBreadcrumbs } from '@/utils/common';
import GoogleEventMapper, { CreativeNameEnum, CreativeSlotEnum } from '@/utils/GoogleEventMapper';
import { useGetSubtypeEvents } from '@/swr/features/subtypes';

import useFooterImages from '@/hooks/useFooterImages';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

import EmptyEventList from '@/components/EmptyEventList';
import EventFilters from '@/components/event-filters/EventFilters';
import { useEventFilters } from '@/components/event-filters/useEventFilters';
import EventCardsList from '@/components/EventCardsList';
import { ListEventDetailsCardSkeleton } from '@/components/EventDetailsCardSkeleton';
import SubTitle from '@/components/SubTitle';
import ViewMoreButton from '@/components/ViewMoreButton';

type SubtypeMostWantedEventsProps = {
    events: Pagination<EventTicket> | null;
    subtype: Subtype;
    filterOptions: EventFilterOptionsResponse | null;
    currencyCode: string;
};

const SubtypeMostWantedEvents = ({
    events,
    subtype,
    filterOptions,
    currencyCode,
}: SubtypeMostWantedEventsProps) => {
    const t = useTranslations();
    const params = useParams<{ type: string; subtype?: string }>();
    const trackedEventIds = useRef<Set<string>>(new Set());
    const { ref, hasBeenVisible } = useIntersectionObserver({
        threshold: 0.3,
        rootMargin: '0px',
        root: null,
    });
    const { filters, hasActiveFilters, resetFilters } = useEventFilters();

    const {
        data: allItems,
        isLoading,
        isLoadingMore,
        isValidating: isFetching,
        hasMore,
        isEmpty,
        loadMore,
        totalCount,
    } = useGetSubtypeEvents({
        nameUrl: subtype.name_url,
        subtypeId: subtype.id,
        excludeEventIds: (events?.items ?? []).map((event) => event?.id),
        countryId: filters.countryId ?? undefined,
        cityId: filters.cityId ?? undefined,
        tourId: filters.tourId ?? undefined,
        fromDate: filters.fromDate ?? undefined,
        toDate: filters.toDate ?? undefined,
        currencyCode,
    });

    const breadcrumbs = generateBreadcrumbs(t, {
        type: params.type ?? '',
    });

    // Track footer images
    useFooterImages({
        events: allItems,
        useUpdateEffectHook: true,
        clearOnUnmount: false,
    });

    // GA4 view_promotion tracking
    useEffect(() => {
        if (!allItems.length || !hasBeenVisible) return;

        const newEvents = allItems.filter(
            (event) => !trackedEventIds.current.has(String(event.id))
        );

        if (newEvents.length === 0) return;

        newEvents.forEach((event) => trackedEventIds.current.add(String(event.id)));

        const promotionItems = newEvents.map((event) =>
            GoogleEventMapper.mapEventToPromotionItem({
                ...event,
                typeNameUrl: params.type ?? '',
                subtypeNameUrl: params.subtype ?? '',
            })
        );

        GoogleAnalyticsTracker.triggerGA4PromotionEvent('view_promotion', {
            creative_name: CreativeNameEnum.MOST_WANTED_EVENTS,
            creative_slot: CreativeSlotEnum.CATEGORY_PAGE,
            items: [promotionItems[0]],
        });
    }, [allItems, params.subtype, params.type, hasBeenVisible]);

    return (
        <section className="mb-10" ref={ref}>
            <SubTitle title={t('most_wanted_events') + ` (${totalCount})`} className="mb-5" />

            <EventFilters
                countries={filterOptions?.countries ?? []}
                cities={filterOptions?.cities ?? []}
                tours={filterOptions?.tours}
                desktopClassName="mb-4"
            />

            {/* <p className="mb-4 font-heading font-semibold text-[#4D4D4D] text-[28px] text-xl! xl:text-heading poppins_518c1836-module__MaFHrW__className"> */}
            {/*     {t('most_wanted_events')} ({totalCount}) */}
            {/* </p> */}

            {isLoading ? (
                <ListEventDetailsCardSkeleton />
            ) : (
                <>
                    {isEmpty ? (
                        <EmptyEventList
                            hasActiveFilters={hasActiveFilters}
                            backUrl={breadcrumbs[breadcrumbs.length - 1].href}
                            handleResetAction={resetFilters}
                        />
                    ) : (
                        <div className="gap-4 grid grid-cols-1">
                            <EventCardsList
                                events={allItems}
                                creativeName={CreativeNameEnum.MOST_WANTED_EVENTS}
                                creativeSlot={CreativeSlotEnum.CATEGORY_PAGE}
                                currencyCode={currencyCode}
                            />
                        </div>
                    )}

                    {(isLoadingMore || isFetching) && (
                        <div className="mt-4">
                            <ListEventDetailsCardSkeleton />
                        </div>
                    )}

                    {hasMore && <ViewMoreButton onClick={loadMore} disabled={isFetching} />}
                </>
            )}
        </section>
    );
};

export default SubtypeMostWantedEvents;
