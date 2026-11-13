'use client';

import { FC, useCallback } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import PopularPerformer from '@/interfaces/Performer';
import GoogleAnalyticsTracker from '@/lib/seo/GoogleAnalyticsTracker';
import { formatDateRange, isUrl } from '@/utils/common';

import useFooterImages from '@/hooks/useFooterImages';

import { CarouselItem } from '@/components/carousel/CarouselItem';
import { CarouselSection } from '@/components/carousel/CarouselSection';
import EventCard from '@/components/event-card/EventCard';
import Link from '@/components/Link';
import SubTitle from '@/components/SubTitle';

interface HomePopularPerformersProps {
    performers: PopularPerformer[];
}

const HomePopularPerformersView: FC<HomePopularPerformersProps> = ({ performers }) => {
    const t = useTranslations();
    const locale = useLocale();

    const handleClickArrow = useCallback((arrow: 'prev' | 'next') => {
        GoogleAnalyticsTracker.triggerCarouselArrowClick({
            arrow,
            list_type: 'city_list',
        });
    }, []);

    useFooterImages({ performers });

    return (
        <>
            <SubTitle title={t('popular_performers')} className="mb-5" />
            <CarouselSection
                onArrowClick={handleClickArrow}
                initSnapCount={performers?.length <= 5 ? 0 : 4}
            >
                {performers.map((performer) => {
                    const {
                        id,
                        name,
                        image,
                        typeNameUrl,
                        subtypeNameUrl,
                        nameUrl,
                        url,
                        eventCount: performerEventCount,
                        earliestEventDate,
                        latestEventDate,
                        earliestEventIanaZone,
                    } = performer;
                    const href =
                        url || `/${typeNameUrl}-tickets/${subtypeNameUrl}/${nameUrl}-tickets`;

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

                    return (
                        <CarouselItem key={id}>
                            <Link
                                prefetch={false}
                                href={href}
                                scroll
                                className="flex flex-col flex-1 w-full"
                            >
                                <EventCard
                                    title={name}
                                    imageSrc={
                                        image
                                            ? isUrl(image)
                                                ? image
                                                : `${process.env.NEXT_PUBLIC_IMAGE_URL}/performers/${image}`
                                            : undefined
                                    }
                                    imageAlt={name}
                                    fallbackType={typeNameUrl}
                                    subtitle={dateRange ? <bdi>{dateRange}</bdi> : undefined}
                                    description={
                                        dateRange ? <bdi>{eventCountLabel}</bdi> : undefined
                                    }
                                    classNames={{
                                        title: 'line-clamp-2',
                                        subtitle: 'font-normal text-primary',
                                        description: 'mt-0 text-gray-600',
                                    }}
                                />
                            </Link>
                        </CarouselItem>
                    );
                })}
            </CarouselSection>
        </>
    );
};

export default HomePopularPerformersView;
