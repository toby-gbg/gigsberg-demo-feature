'use client';

import { MouseEvent, useMemo, useState } from 'react';
import { Flame } from 'lucide-react';
import { DateTime } from 'luxon';
import { useLocale, useTranslations } from 'next-intl';

import {
    Performer,
    UpcomingBigMatchApiItem,
    UpcomingBigMatchesResponse,
} from '@/interfaces/UpcomingBigMatches';
import { $internationalEventModal, $internationalEventUrl } from '@/stores/modal';
import { cn } from '@/lib/cn';
import { fallbackTranslation } from '@/utils/common';
import { formatPrice } from '@/utils/currency.util';
import { checkEventHasValidMinPrice } from '@/utils/event';
import { getTeamAbbreviation } from '@/utils/team-abbreviation';
import { useGetUpcomingBigMatches } from '@/swr/features/upcomingBigMatches';

import { useSite } from '@/providers/SiteProvider';

import { CarouselItem } from '@/components/carousel/CarouselItem';
import { CarouselSection } from '@/components/carousel/CarouselSection';
import EventCard from '@/components/event-card/EventCard';
import FallbackImage from '@/components/FallbackImage';
import Link from '@/components/Link';
import { SectionNotFoundTemplate } from '@/components/SectionNotFoundTemplate';
import { UpcomingBigMatchesCardSkeleton } from '@/components/skeleton/UpcomingBigMatchesSkeleton';
import SubTitle from '@/components/SubTitle';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface UpcomingBigMatchesProps {
    initialUpcomingBigMatches: UpcomingBigMatchesResponse | null;
    currencyCode: string;
    ipCountryCode: string;
}

const UpcomingBigMatchPerformer = ({
    performer,
    align,
}: {
    performer?: Performer | null;
    align: 'left' | 'right';
}) => {
    const t = useTranslations();
    const name = performer?.name;
    const containerClassName =
        align === 'left'
            ? 'flex flex-col justify-start items-start pl-4 text-left pt-2'
            : 'flex flex-col justify-start items-end pr-4 text-right pt-2';

    return (
        <div className={containerClassName}>
            <p className="font-semibold text-white text-3xl">{getTeamAbbreviation(name ?? '')}</p>
            <p className="max-w-15 lg:max-w-20 font-semibold text-micro text-white">
                {name ?? fallbackTranslation(t('Unknown'), 'Unknown', 'Unknown')}
            </p>
        </div>
    );
};

export default function UpcomingBigMatches({
    initialUpcomingBigMatches,
    currencyCode = 'USD',
    ipCountryCode,
}: UpcomingBigMatchesProps) {
    const t = useTranslations();
    const locale = useLocale();
    const onlySupportedCountryCodes =
        useSite().domainInfo?.config?.features?.onlySupportedCountryCodes;

    const [selectedTourId, setSelectedTourId] = useState<number | null>(null);

    const onMatchClick = (event: MouseEvent<HTMLAnchorElement>, item: UpcomingBigMatchApiItem) => {
        if (!item.url) return;

        if (onlySupportedCountryCodes && !onlySupportedCountryCodes.includes(item.countryCode)) {
            event.preventDefault();
            $internationalEventUrl.set(item.url);
            $internationalEventModal.set(true);
        }
    };

    const {
        data: updatedUpcomingBigMatches,
        isLoading: loading,
        isError,
    } = useGetUpcomingBigMatches(currencyCode, selectedTourId);

    const upcomingBigMatches = updatedUpcomingBigMatches ?? initialUpcomingBigMatches;

    const { items } = upcomingBigMatches || {};

    const isDataExist = useMemo(() => items && items.length > 0, [items]);

    const TOURS = useMemo(() => {
        return [
            {
                tourId: null,
                tourName: fallbackTranslation(t('all_matches'), 'all_matches', 'All matches'),
            },
            {
                tourId: 9357,
                tourName: fallbackTranslation(
                    t('premier_league'),
                    'premier_league',
                    'Premier League'
                ),
            },
            ...(ipCountryCode === 'CH' || ipCountryCode === 'FR'
                ? []
                : [
                      {
                          tourId: 9443,
                          tourName: fallbackTranslation(
                              t('champions_league'),
                              'champions_league',
                              'Champions League'
                          ),
                      },
                  ]),
            {
                tourId: 9360,
                tourName: fallbackTranslation(t('la_liga'), 'la_liga', 'La Liga'),
            },
        ];
    }, [ipCountryCode, t]);

    return (
        <section className="mb-10 w-full">
            <div className="flex flex-col justify-start gap-4 mb-2">
                <SubTitle
                    level="h2"
                    title={fallbackTranslation(
                        t('upcoming_big_matches'),
                        'upcoming_big_matches',
                        'Upcoming Big Matches'
                    )}
                    className="font-semibold text-text-primary text-title-s md:text-heading-s"
                />
                <div className="flex flex-wrap justify-start gap-2">
                    {TOURS.map((tour, index) => {
                        return (
                            <Button
                                key={`${tour.tourId ?? index}-${tour.tourName}`}
                                className={cn('bg-transparent rounded-lg', {
                                    'border-primary text-solid!': selectedTourId === tour.tourId,
                                    'hover:text-black!': selectedTourId !== tour.tourId,
                                })}
                                variant="outline"
                                onClick={() => setSelectedTourId(tour.tourId)}
                            >
                                {tour.tourName}
                            </Button>
                        );
                    })}
                </div>
            </div>

            <CarouselSection>
                {loading ? (
                    <>
                        {Array.from({ length: 5 }).map((_, index) => (
                            <div
                                key={index}
                                className="flex *:flex flex-col *:flex-1 w-55 lg:w-70 h-62 shrink-0"
                            >
                                <UpcomingBigMatchesCardSkeleton />
                            </div>
                        ))}
                    </>
                ) : isDataExist ? (
                    items?.map((item, index) => (
                        <CarouselItem key={item.eventId} className="h-62">
                            <Link
                                href={item.url}
                                aria-label={item.name}
                                onClick={(event) => onMatchClick(event, item)}
                            >
                                <EventCard
                                    classNames={{ wrapper: 'mb-0 transition-all pt-8!' }}
                                    title={
                                        item.performer1 || item.performer2
                                            ? item.tourName
                                            : item.name
                                    }
                                    description={`${item.venueName}, ${item.cityName}, ${item.countryName}`}
                                    date={DateTime.fromISO(item.date).toFormat('dd/MM/yyyy')}
                                    time={item.time}
                                    header={
                                        <div className="relative w-full h-20">
                                            {index === 0 && (
                                                <div className="-top-5.5 left-2 absolute">
                                                    <Badge
                                                        classNames={{
                                                            base: 'bg-transparent border-none bg-orange-600 text-white rounded-none rounded-t-sm',
                                                            content: 'text-xs font-semibold',
                                                        }}
                                                        icon={<Flame />}
                                                    >
                                                        {fallbackTranslation(
                                                            t('high_demand'),
                                                            'high_demand',
                                                            'High demand'
                                                        )}
                                                    </Badge>
                                                </div>
                                            )}
                                            <FallbackImage
                                                src={
                                                    item.tourImage
                                                        ? `${process.env.NEXT_PUBLIC_IMAGE_URL}/tours/${item.tourImage}`
                                                        : 'https://www.gigsberg.com/files/images/tours/champions_league_1787055913.webp'
                                                }
                                                alt="Fallback image"
                                                fill
                                                className="z-10 relative rounded-lg aspect-video"
                                                sizes="(min-width: 1024px) 264px, 208px"
                                            />
                                            <div className="z-20 absolute inset-0 bg-black/50 rounded-lg" />
                                            <div
                                                className="z-50 absolute inset-0 grid grid-cols-2"
                                                dir="ltr"
                                            >
                                                <UpcomingBigMatchPerformer
                                                    performer={item?.performer1}
                                                    align="left"
                                                />
                                                <UpcomingBigMatchPerformer
                                                    performer={item?.performer2}
                                                    align="right"
                                                />
                                                <span className="top-1/2 left-1/2 absolute bg-white shadow-xs p-2 rounded-full font-bold text-accent text-micro uppercase -translate-x-1/2 -translate-y-1/2 shrink-0">
                                                    vs
                                                </span>
                                            </div>
                                        </div>
                                    }
                                    footer={
                                        checkEventHasValidMinPrice(item) && (
                                            <div className="flex justify-end items-end gap-2 mt-auto">
                                                <span className="font-bold text-gray-600 text-xs md:text-sm capitalize shrink-0">
                                                    {fallbackTranslation(t('from'), 'from', 'From')}
                                                </span>
                                                <span className="font-bold text-accent text-xs md:text-sm">
                                                    {formatPrice(
                                                        item.lowestPrice,
                                                        locale,
                                                        item.lowestPriceCurrency ||
                                                            currencyCode ||
                                                            'USD'
                                                    )}
                                                </span>
                                            </div>
                                        )
                                    }
                                />
                            </Link>
                        </CarouselItem>
                    ))
                ) : (
                    <SectionNotFoundTemplate
                        title={
                            isError
                                ? fallbackTranslation(
                                      t('something_went_wrong'),
                                      'something_went_wrong',
                                      'Something went wrong'
                                  )
                                : fallbackTranslation(
                                      t('upcoming_big_matches_are_empty'),
                                      'upcoming_big_matches_are_empty',
                                      'Upcoming big matches are empty'
                                  )
                        }
                        description={
                            isError
                                ? fallbackTranslation(
                                      t('we_could_not_load_this_section_try_again_later'),
                                      'we_could_not_load_this_section_try_again_later',
                                      'We could not load this section. Please try again later.'
                                  )
                                : fallbackTranslation(
                                      t('no_events_now_title'),
                                      'no_events_now_title',
                                      'No upcoming events right now'
                                  )
                        }
                        alt={fallbackTranslation(
                            t('upcoming_big_matches_are_empty'),
                            'upcoming_big_matches_are_empty',
                            'Upcoming big matches are empty'
                        )}
                    />
                )}
            </CarouselSection>
        </section>
    );
}
