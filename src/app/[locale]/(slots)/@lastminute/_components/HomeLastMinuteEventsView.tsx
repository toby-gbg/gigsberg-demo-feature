'use client';

import { FC } from 'react';
import { useStore } from '@nanostores/react';
import { addDays, formatISO } from 'date-fns';
import { useTranslations } from 'next-intl';

import { EventTicket } from '@/interfaces/Event';
import { LastMinuteEventsResponse } from '@/interfaces/Fetch';
import GoogleAnalyticsTracker from '@/lib/seo/GoogleAnalyticsTracker';
import { CreativeNameEnum, CreativeSlotEnum } from '@/utils/GoogleEventMapper';
import { useHomepageLastMinuteEvents } from '@/swr/features/events';

import useFont from '@/hooks/useFont';
import useFooterImages from '@/hooks/useFooterImages';
import useIntlRouter from '@/hooks/useIntlRouter';

import EventCardSkeleton from '@/components/event-card/EventCardSkeleton';
import EventCardsView from '@/components/event-card/EventCardsView';
import SubTitle from '@/components/SubTitle';
import { Button } from '@/components/ui/Button';

import { $userCountryFilter } from '../../../_stores';

interface HomeLastMinuteEventsViewProps {
    baseEvents?: LastMinuteEventsResponse<EventTicket> | null;
}

const HomeLastMinuteEventsView: FC<HomeLastMinuteEventsViewProps> = ({ baseEvents }) => {
    const t = useTranslations();
    const { sectionTitleFont } = useFont();
    const userCountryFilter = useStore($userCountryFilter);
    const router = useIntlRouter();
    const countryId = userCountryFilter ? userCountryFilter.id : undefined;

    const { data, isValidating, isLoading } = useHomepageLastMinuteEvents(
        { countryId, skip: !(userCountryFilter && userCountryFilter.id) },
        baseEvents
    );

    const isFetching = isLoading || isValidating;

    useFooterImages({ events: data?.events, clearOnUnmount: false });

    const triggerGA4 = (searchStr: string) => {
        GoogleAnalyticsTracker.triggerEvent('last_min_all', { search: searchStr });
    };

    const onClickSeeAll = () => {
        const computedToDate = data?.seeAllFromDate
            ? formatISO(addDays(new Date(data.seeAllFromDate), 7), { representation: 'date' }) // need representation for 'YYYY-MM-DD'
            : data?.seeAllToDate;

        const searchStr = `/search?from=lastminute&${new URLSearchParams({
            ...(userCountryFilter?.id && {
                countryId: String(userCountryFilter?.id),
            }),
            ...(data?.seeAllFromDate && { fromDate: data?.seeAllFromDate }),
            ...(computedToDate && { toDate: computedToDate }),
        })}`;

        triggerGA4(searchStr);
        router.push(searchStr);
    };

    if (data?.events.length === 0) return null;

    return (
        <>
            <div className="flex xl:flex-row flex-col xl:items-center gap-5 mb-7">
                <SubTitle
                    title={t('last_minute_events')}
                    className="xl:text-left text-center"
                    fontClassName={sectionTitleFont.className}
                />
                <div className="flex xl:flex-row flex-col flex-1 justify-center xl:justify-end items-center gap-2">
                    <Button
                        className="bg-gradient px-3 py-1.5 rounded-md w-full xl:w-auto min-w-9.5 min-h-9.5 font-medium text-on-main text-base"
                        onClick={onClickSeeAll}
                    >
                        {t('see_all')}
                    </Button>
                </div>
            </div>

            {isFetching || data?.events.length === 0 ? (
                <EventCardSkeleton
                    showSubtitle
                    showDate
                    showDescription
                    showBadges
                    isLoaded={!isFetching && data?.events.length === 0}
                    initSnapCount={4}
                    cardClassName="h-[300px]! md:h-[330px]! lg:h-[375px]!"
                />
            ) : (
                <EventCardsView
                    events={data?.events}
                    creativeName={CreativeNameEnum.TRENDING_EVENTS_LAST_MINUTE}
                    creativeSlot={CreativeSlotEnum.HOME_PAGE}
                    initSnapCount={data?.events.length <= 5 ? 0 : 4}
                    itemClassName="h-[300px]! md:h-[330px]! lg:h-[375px]!"
                />
            )}
        </>
    );
};

export default HomeLastMinuteEventsView;
