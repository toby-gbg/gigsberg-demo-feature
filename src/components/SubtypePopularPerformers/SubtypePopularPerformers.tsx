'use client';

import { FC, useCallback } from 'react';
import { useTranslations } from 'next-intl';

import PopularPerformer from '@/interfaces/Performer';
import GoogleAnalyticsTracker from '@/lib/seo/GoogleAnalyticsTracker';
import { formatDateRange, isUrl } from '@/utils/common';

import useFooterImages from '@/hooks/useFooterImages';

import { CarouselItem } from '@/components/carousel/CarouselItem';
import { CarouselSection } from '@/components/carousel/CarouselSection';
import EventCard from '@/components/event-card/EventCard';
import Link from '@/components/Link';
import SubTitle from '@/components/SubTitle';

interface SubtypePopularPerformersProps {
    performers: PopularPerformer[];
    type: string;
    tourId?: number;

    // fetched in the server layer, so date formatting needs no provider
    locale: string;
}

const SubtypePopularPerformers: FC<SubtypePopularPerformersProps> = ({
    performers,
    type,
    tourId,
    locale,
}) => {
    const t = useTranslations();

    const handleClickArrow = useCallback((arrow: 'prev' | 'next') => {
        GoogleAnalyticsTracker.triggerCarouselArrowClick({
            arrow,
            list_type: 'city_list',
        });
    }, []);

    useFooterImages({ performers, clearOnUnmount: false });

    if (performers.length === 0) return null;

    return (
        <section className="mb-10">
            <SubTitle title={t('type_page_h2', { type })} className="mb-5" />
            <CarouselSection onArrowClick={handleClickArrow}>
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
                    let href =
                        url || `/${typeNameUrl}-tickets/${subtypeNameUrl}/${nameUrl}-tickets`;
                    tourId && (href += `?tourId=${tourId}`);

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
                                className="flex w-full flex-1 flex-col"
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
        </section>
    );
};

export default SubtypePopularPerformers;
