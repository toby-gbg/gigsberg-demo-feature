'use client';

import { Logs } from 'lucide-react';
import { useTranslations } from 'next-intl';

import Country from '@/interfaces/Country';
import { useHomepageEvents } from '@/swr/features/events';

import EventCardSkeleton from '@/components/event-card/EventCardSkeleton';
import EventCardsView from '@/components/event-card/EventCardsView';
import Link from '@/components/Link';
import MainContainer from '@/components/MainContainer';
import { Button } from '@/components/ui/Button';

const NoPurchasesFoundFallback = ({ ipCountry }: { ipCountry: Country }) => {
    const t = useTranslations();

    const {
        data: events,
        isValidating,
        isLoading,
    } = useHomepageEvents({
        skip: false,
        countryId: ipCountry?.id,
    });
    const isFetching = isLoading || isValidating;

    const browseEventsUrl = `/search?${new URLSearchParams({
        ...(ipCountry?.id && { type: 'countries', id: String(ipCountry.id) }),
    })}`;

    return (
        <div className="flex flex-col justify-center items-center gap-3 col-span-12 py-4 w-full min-h-[50vh]">
            <div className="p-3 border border-primary rounded-full text-primary">
                <Logs />
            </div>
            <h1 className="font-semibold">{t('no_purchases_found_title')}</h1>

            <h3 className="text-center">{t('no_purchases_found_description')}</h3>

            <Link href={browseEventsUrl}>
                <Button>{t('no_purchases_found_cta')}</Button>
            </Link>

            <div className="mt-4 border-divider border-t w-full" />

            <h2 className="flex items-center w-full font-semibold text-lg text-left">
                {t('popular_events')}
            </h2>

            <MainContainer>
                {isFetching ? (
                    <EventCardSkeleton
                        showSubtitle
                        showDate
                        showDescription
                        showBadges
                        isLoaded={!isFetching && events.length === 0}
                        initSnapCount={4}
                        cardClassName="h-[275px]! md:h-[310px]! lg:h-[355px]!"
                    />
                ) : (
                    <EventCardsView events={events || []} />
                )}
            </MainContainer>
        </div>
    );
};

export default NoPurchasesFoundFallback;
