'use client';

import { FC, memo, Ref } from 'react';
import { useTranslations } from 'next-intl';

import { EventTicket } from '@/interfaces/Event';
import { cn } from '@/lib/cn';
import { removeTicketsSuffix } from '@/utils/common';
import { DEFAULT_SIZE } from '@/constants/pagination';

import EventDetailsLayoutSkeleton from '@/components/EventDetailsLayoutSkeleton';
import EventDetailsSkeleton from '@/components/EventDetailsSkeleton';
import ViewMoreButton from '@/components/ViewMoreButton';

import { useStableEntityContext } from '../../../_providers/EntityProvider';
import EventEmptyState from './EventEmptyState';
import EventGroupSection from './EventGroupSection';

export interface EntityEventSectionProps {
    totalCount: number;
    nearbyEvents: EventTicket[];
    internationalEvents: EventTicket[];
    isLoading: boolean;

    nearbyRef?: Ref<HTMLDivElement>;
    internationalRef?: Ref<HTMLDivElement>;
    subTitleClassName?: string;

    isEmpty?: boolean;

    hasMore?: boolean;
    onLoadMore?: () => void;
    isLoadMoreLoading?: boolean;
    isLoadingMore?: boolean;

    currencyCode: string;
}

const EntityEventSection: FC<EntityEventSectionProps> = ({
    totalCount,
    nearbyEvents,
    internationalEvents,
    isLoading,
    nearbyRef,
    internationalRef,
    subTitleClassName,
    isEmpty = false,
    hasMore = false,
    onLoadMore,
    isLoadMoreLoading = false,
    isLoadingMore = false,
    currencyCode,
}) => {
    const t = useTranslations();

    const { type, entityMetadata } = useStableEntityContext();

    const nearbyEventsCount = Math.max(0, totalCount - internationalEvents.length);
    const internationalEventsCount = Math.max(0, totalCount - nearbyEvents.length);

    // Skeleton count for load more = how many cards the next request will return.
    const skeletonCardCount = Math.min(
        DEFAULT_SIZE,
        totalCount - nearbyEvents.length - internationalEvents.length
    );

    if (isLoading) {
        return <EventDetailsLayoutSkeleton />;
    }

    if (isEmpty) {
        return <EventEmptyState />;
    }

    const shouldAddInternationalTopMargin = nearbyEvents.length > 0;
    const showLoadMore = Boolean(hasMore && onLoadMore);

    return (
        <div>
            <EventGroupSection
                events={nearbyEvents}
                title={`${t('nearby_events')} (${nearbyEventsCount})`}
                sectionRef={nearbyRef}
                subTitleClassName={subTitleClassName}
                currencyCode={currencyCode}
            />

            <EventGroupSection
                events={internationalEvents}
                title={`${t('event_page_h2', {
                    type: removeTicketsSuffix(type),
                    sportType: entityMetadata?.type || '',
                    team: entityMetadata?.entity.name || '',
                })} (${internationalEventsCount})`}
                subTitleClassName={cn(
                    subTitleClassName,
                    (internationalEvents || []).length <= 0 && 'mb-6',
                    shouldAddInternationalTopMargin && 'mt-10'
                )}
                sectionRef={internationalRef}
                currencyCode={currencyCode}
            />

            {(isLoadingMore || showLoadMore) && (
                <div className="flex flex-col gap-y-4 mt-4">
                    {isLoadingMore && (
                        <div>
                            <EventDetailsSkeleton
                                cardCount={skeletonCardCount}
                                shouldShowMinPrice
                            />
                        </div>
                    )}
                    {showLoadMore && (
                        <ViewMoreButton onClick={onLoadMore} disabled={isLoadMoreLoading} />
                    )}
                </div>
            )}
        </div>
    );
};

export default memo(EntityEventSection);
