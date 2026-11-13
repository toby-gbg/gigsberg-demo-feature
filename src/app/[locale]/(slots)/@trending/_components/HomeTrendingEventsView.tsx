'use client';

import { FC, useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';

import Country from '@/interfaces/Country';
import { EventTicket } from '@/interfaces/Event';
import { HomePageFilters } from '@/interfaces/events/HomePageEvent';
import { SearchSource } from '@/interfaces/Search';
import GoogleAnalyticsTracker from '@/lib/seo/GoogleAnalyticsTracker';
import { CreativeNameEnum, CreativeSlotEnum } from '@/utils/GoogleEventMapper';
import { useHomepageEvents } from '@/swr/features/events';
import { useIpCountry } from '@/swr/features/ip';

import useFooterImages from '@/hooks/useFooterImages';
import useIntlRouter from '@/hooks/useIntlRouter';

import CountrySelect from '@/components/CountrySelect';
import DateSelect, { DateSelectOption } from '@/components/DateSelect';
import EventCardSkeleton from '@/components/event-card/EventCardSkeleton';
import EventCardsView from '@/components/event-card/EventCardsView';
import SubTitle from '@/components/SubTitle';
import { Button } from '@/components/ui/Button';

import { setUserCountryFilter } from '../../../_stores';

interface HomeTrendingEventsViewProps {
    events: EventTicket[];
    ipCountry: Country | null;
}

const HomeTrendingEventsView: FC<HomeTrendingEventsViewProps> = ({ events, ipCountry }) => {
    const t = useTranslations();
    const router = useIntlRouter();
    const { data: currentIpCountry, mutate: refreshIpCountry } = useIpCountry(ipCountry);

    const [filters, setFilters] = useState<HomePageFilters>({
        skip: true,
    });
    const [lastMinuteActive, setLastMinuteActive] = useState(false);
    const [proximityDate, setProximityDate] = useState('');

    const selectedCountry = filters.country ?? currentIpCountry ?? ipCountry;

    const { fromDate, toDate, skip: filtersSkip } = filters;
    const countryChanged =
        !filters.country &&
        currentIpCountry !== undefined &&
        currentIpCountry?.id !== ipCountry?.id;

    const { data, isValidating, isLoading } = useHomepageEvents(
        {
            countryId: selectedCountry?.id,
            fromDate,
            toDate,
            skip: filtersSkip && !countryChanged,
        },
        events
    );

    const isFetching = isValidating || isLoading;

    useFooterImages({ events: data, clearOnUnmount: false });

    const effectiveCreativeName = lastMinuteActive
        ? CreativeNameEnum.TRENDING_EVENTS_LAST_MINUTE
        : CreativeNameEnum.TRENDING_EVENTS;

    const triggerGA4 = (searchStr: string) => {
        GoogleAnalyticsTracker.triggerEvent('home_trending_all', { search: searchStr });
    };

    const onClickSeeAll = async () => {
        const latestIpCountry = filters.country ? undefined : await refreshIpCountry();
        const country = filters.country ?? latestIpCountry ?? currentIpCountry ?? ipCountry;
        const { fromDate, toDate } = filters || {};
        const searchStr = `/search?from=${SearchSource.TRENDING}&${new URLSearchParams({
            ...(country?.id && { countryId: String(country.id) }),
            ...(fromDate && { fromDate }),
            ...(toDate && { toDate }),
            ...(proximityDate && { proximityDate }),
        })}`;

        triggerGA4(searchStr);
        router.push(searchStr);
    };

    const handleDateChange = useCallback(
        (
            date: DateSelectOption | undefined,
            error?: {
                message: string;
            }
        ) => {
            setLastMinuteActive(false);
            setFilters((old) => ({
                ...old,
                ...date,
                skip: Boolean(error),
            }));
            setProximityDate(date?.proximity || '');
        },
        []
    );

    const handleChangeCountry = (country: Country | undefined) => {
        if (!country) return;

        setUserCountryFilter(country);
        setFilters((old) => ({
            ...old,
            country,
            skip: false,
        }));
    };

    return (
        <>
            <div className="flex xl:flex-row flex-col xl:items-center gap-5 mb-7">
                <SubTitle title={t('trending_events')} className="xl:text-left text-center" />
                <div className="flex xl:flex-row flex-col flex-1 justify-center xl:justify-end items-center gap-2">
                    <CountrySelect
                        classNames={{
                            wrapper: 'xl:max-w-71',
                            skeleton: 'xl:max-w-71',
                            trigger: 'bg-white',
                        }}
                        value={selectedCountry?.id}
                        onChange={handleChangeCountry}
                    />
                    <DateSelect
                        classNames={{ wrapper: 'xl:max-w-90', trigger: 'bg-white min-h-10 h-10' }}
                        onChange={handleDateChange}
                    />
                    <Button
                        className="bg-gradient px-3 py-1.5 rounded-md w-full xl:w-auto min-w-9.5 min-h-9.5 font-medium text-on-main text-base"
                        onClick={onClickSeeAll}
                    >
                        {t('see_all')}
                    </Button>
                </div>
            </div>

            {isFetching || data.length === 0 ? (
                <EventCardSkeleton
                    showSubtitle
                    showDate
                    showDescription
                    showBadges
                    isLoaded={!isFetching && data.length === 0}
                    initSnapCount={4}
                    cardClassName="h-[300px]! md:h-[330px]! lg:h-[375px]!"
                />
            ) : (
                <EventCardsView
                    events={data}
                    creativeName={effectiveCreativeName}
                    creativeSlot={CreativeSlotEnum.HOME_PAGE}
                    initSnapCount={data?.length <= 5 ? 0 : 4}
                    itemClassName="h-[300px]! md:h-[330px]! lg:h-[375px]!"
                />
            )}
        </>
    );
};

export default HomeTrendingEventsView;
