'use client';

import { FC, MouseEventHandler, useCallback, useRef } from 'react';
import { useRouter } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';

import { FansAlsoLikePerformer } from '@/interfaces/Performer';
import GoogleAnalyticsTracker from '@/lib/seo/GoogleAnalyticsTracker';
import { formatDateRange, isUrl } from '@/utils/common';
import { usePostPerformerInteractionMutation } from '@/swr/features/performers';

import { CarouselItem } from '@/components/carousel/CarouselItem';
import { CarouselSection } from '@/components/carousel/CarouselSection';
import EventCard from '@/components/event-card/EventCard';
import Link from '@/components/Link';

import { MAX_PERFORMER_CARDS } from '../../../_constants';
import { useEntityContext } from '../../../_providers/EntityProvider';

interface PerformerCardsViewProps {
    performers: FansAlsoLikePerformer[];
    onCardClick: (index: number) => void;
}

const PerformerCardsView: FC<PerformerCardsViewProps> = ({ performers = [], onCardClick }) => {
    const t = useTranslations();
    const locale = useLocale();
    const router = useRouter();
    const displayPerformers = performers.slice(0, MAX_PERFORMER_CARDS);

    const { entityMetadata } = useEntityContext();

    // Performer of the current page (source for co-click tracking)
    const sourcePerformerId = entityMetadata?.entity?.id?.toString() || '';

    // Last recommended performer we already POSTed an interaction
    const lastInteractedRecommendationIdRef = useRef<number | null>(null);

    const { trigger: postPerformerInteraction } = usePostPerformerInteractionMutation();

    const handleClickArrow = useCallback((arrow: 'prev' | 'next') => {
        GoogleAnalyticsTracker.triggerCarouselArrowClick({
            arrow,
            list_type: 'performer_list',
        });
    }, []);

    const handleCardClick = (index: number) => {
        const recommendedPerformer = performers[index];
        const recommendedPerformerId = recommendedPerformer?.performer_id;

        if (
            !sourcePerformerId ||
            !recommendedPerformer ||
            !recommendedPerformerId ||
            recommendedPerformerId === lastInteractedRecommendationIdRef.current
        ) {
            return;
        }

        lastInteractedRecommendationIdRef.current = recommendedPerformerId;
        postPerformerInteraction({
            performerId: sourcePerformerId,
            clicked_performer_id: recommendedPerformerId,
        });

        onCardClick(index);
    };

    return (
        <CarouselSection
            onArrowClick={handleClickArrow}
            initSnapCount={displayPerformers?.length <= 5 ? 0 : 4}
        >
            {displayPerformers.map((performer, index) => {
                const {
                    performer_id,
                    name,
                    image_url,
                    type_name_url,
                    subtype_name_url,
                    name_url,
                    eventCount: performerEventCount,
                    earliestEventDate,
                    latestEventDate,
                    earliestEventIanaZone,
                } = performer;
                const href = `/${type_name_url}-tickets/${subtype_name_url}/${name_url}-tickets`;
                const eventCount = performerEventCount ?? 0;
                const dateRange =
                    eventCount > 0
                        ? formatDateRange({
                              startDate: earliestEventDate,
                              endDate: latestEventDate,
                              locale,
                              ianaTimezone: earliestEventIanaZone,
                          })
                        : null;
                const eventCountLabel = t('performer_event_count', { count: eventCount });

                const onClick: MouseEventHandler<HTMLAnchorElement> = (e) => {
                    e.preventDefault();
                    handleCardClick(index);
                    return router.push(href, { scroll: true });
                };

                return (
                    <CarouselItem key={performer_id}>
                        <Link
                            prefetch={false}
                            href={href}
                            onClickCapture={onClick}
                            scroll
                            className="flex flex-col flex-1 w-full h-full"
                        >
                            <EventCard
                                title={name}
                                imageSrc={
                                    image_url
                                        ? isUrl(image_url)
                                            ? image_url
                                            : `${process.env.NEXT_PUBLIC_IMAGE_URL}/performers/${image_url}`
                                        : undefined
                                }
                                imageAlt={name}
                                fallbackType={type_name_url}
                                subtitle={
                                    dateRange ? (
                                        <>
                                            <p className="text-primary">{dateRange}</p>
                                            <p>{eventCountLabel}</p>
                                        </>
                                    ) : undefined
                                }
                                classNames={{ subtitle: 'font-normal text-gray-600' }}
                            />
                        </Link>
                    </CarouselItem>
                );
            })}
        </CarouselSection>
    );
};

export default PerformerCardsView;
