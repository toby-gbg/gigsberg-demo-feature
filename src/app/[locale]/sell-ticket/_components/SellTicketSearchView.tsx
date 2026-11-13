'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { DateRange } from 'react-day-picker';

import City from '@/interfaces/City';
import Country from '@/interfaces/Country';
import { EventSearchFilters } from '@/interfaces/Event';
import { convertNameUrlToLabel, fallbackTranslation } from '@/utils/common';
import { formatDateToISODate, getDateRangeFromFilters } from '@/utils/date';
import { useEvents } from '@/swr/features/events';

import { useUser } from '@/providers/UserProvider';
import { useScrollToTopOnSearch } from '@/hooks/search/useScrollToTopOnSearch';
import { useDebounce } from '@/hooks/useDebounce';
import { useDebounceValue } from '@/hooks/useDebounceValue';
import useFooterImages from '@/hooks/useFooterImages';

import CitySelect from '@/components/CitySelect';
import CountrySelect from '@/components/CountrySelect';
import DateRangePickerSelect from '@/components/DateRangePickerSelect';
import EmptyEventList from '@/components/EmptyEventList';
import EventDetailsSkeleton from '@/components/EventDetailsSkeleton';
import EventPageNoResult from '@/components/EventPageNoResult';
import MainContainer from '@/components/MainContainer';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from '@/components/ui/InputGroup';
import ViewMoreButton from '@/components/ViewMoreButton';

import SellTicketsEventCardsView from './SellTicketsEventCardsView';

const SEARCH_CRITERIA_FIELDS = [
    'type',
    'subtype',
    'venueId',
    'performerId',
    'cityId',
    'countryId',
    'name',
    'nameUrl',
    'fromDate',
    'toDate',
] as const;

const SellTicketSearchView = () => {
    const t = useTranslations();
    const user = useUser();
    const [filters, setFilters] = useState<EventSearchFilters>(() => ({
        action: 'sell_ticket',
        isProOnly: !user?.is_pro ? 0 : undefined,
        pageNumber: 1,
        pageSize: 32,
    }));

    const [date, setDate] = useState<DateRange | undefined>(() => getDateRangeFromFilters(filters));

    useScrollToTopOnSearch();

    // clean debouncing
    const debouncedFilters = useDebounceValue<EventSearchFilters>(filters, 500);
    const [searchValue, setSearchValue] = useState<string>(() => filters.name ?? '');

    // debounced setter for the actual filter, triggers the search
    const debouncedSetName = useDebounce((value: string) => {
        setFilters((prev) => ({
            ...prev,
            name: value.trim() || undefined,
            pageNumber: 1,
        }));
    }, 250);

    // Keep the input aligned with filter changes made by the view.
    useEffect(() => {
        const newValue = filters.name ?? '';
        if (newValue !== searchValue) setSearchValue(newValue);
    }, [filters.name]);

    useEffect(() => {
        setDate(getDateRangeFromFilters(filters));
    }, [filters.fromDate, filters.toDate]);

    const handleClear = () => {
        setSearchValue('');
        setFilters((prev) => ({
            ...prev,
            name: undefined,
            pageNumber: 1,
        }));
    };

    // memoize complex evaluations
    const hasSearchCriteria = useMemo(() => {
        return SEARCH_CRITERIA_FIELDS.some((field) => Boolean(debouncedFilters[field]));
    }, [debouncedFilters]);

    const shouldSkipFetch = !hasSearchCriteria;

    const fetchFilters = { ...debouncedFilters, skip: shouldSkipFetch };

    // data fetching
    const { data, isLoading, isLoadingMore, hasMore, loadMore, isValidating } =
        useEvents(fetchFilters);

    const isFetching = isLoading || isValidating;
    const isEmptyData = data.length === 0;

    useFooterImages({ events: data });

    // handlers
    const handleCountryChange = (country: Country | undefined) => {
        setFilters((prev) => ({
            ...prev,
            countryId: (country as Country)?.id,
            cityId: undefined,
            countryName: undefined,
            cityName: undefined,
            city: null,
            country: country as Country,
            pageNumber: 1,
        }));
    };

    const handleCityChange = (city: City | undefined) => {
        setFilters((prev) => ({
            ...prev,
            cityId: city?.id,
            cityName: undefined,
            city,
            pageNumber: 1,
        }));
    };

    const handleLoadMore = () => {
        setFilters((old) => ({ ...old, pageNumber: (old.pageNumber ?? 1) + 1 }));
        loadMore();
    };

    const showNoResults = isEmptyData && !isFetching;

    const handleSelectDateRangeChange = (payload: DateRange | undefined) => {
        setDate(payload);

        if (!payload) {
            setFilters((prev) => ({
                ...prev,
                fromDate: undefined,
                toDate: undefined,
                pageNumber: 1,
                skip: false,
            }));
            return;
        }

        if (payload.from && payload.to) {
            setFilters((prev) => ({
                ...prev,
                fromDate: formatDateToISODate(payload.from),
                toDate: formatDateToISODate(payload.to),
                pageNumber: 1,
                skip: !payload.from || !payload.to,
            }));
            return;
        }
    };

    return (
        <MainContainer className="gap-y-5 grid grid-cols-1 py-10">
            {/* Header section */}
            <div className="flex flex-col gap-y-4">
                <h1 className="w-full font-medium text-3xl wrap-break-word">
                    {t('event_ticket_result_only')}
                </h1>
                <InputGroup className="bg-white">
                    <InputGroupInput
                        placeholder={t('sell_ticket_search_placeholder')}
                        value={convertNameUrlToLabel(searchValue)}
                        onChange={(e) => {
                            const val = e.target.value;
                            setSearchValue(val); // instant UI update
                            debouncedSetName(val); // debounced filter update
                        }}
                    />
                    {searchValue ? (
                        <InputGroupAddon
                            align="inline-end"
                            className="pe-4 max-sm:pe-3 max-sm:me-0!"
                        >
                            <InputGroupButton onClick={handleClear} aria-label="Clear input">
                                <X aria-hidden="true" />
                            </InputGroupButton>
                        </InputGroupAddon>
                    ) : null}
                </InputGroup>

                {/* Filter row */}
                <div className="items-start gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                        {t('dates')}
                        <DateRangePickerSelect
                            value={date}
                            onChange={handleSelectDateRangeChange}
                            classNames={{
                                clearBtn:
                                    'inset-e-8! border border-transparent text-gray-500 hover:text-black focus-visible:text-black',
                            }}
                        />
                    </div>
                    <div>
                        {t('country')}:
                        <CountrySelect
                            classNames={{ trigger: 'bg-white' }}
                            isClearable
                            value={filters.countryId}
                            onChange={handleCountryChange}
                        />
                    </div>
                    <div>
                        {t('city')}:
                        <CitySelect
                            classNames={{ trigger: 'bg-white' }}
                            countryId={filters.countryId}
                            value={filters.cityId}
                            onChange={handleCityChange}
                        />
                    </div>
                </div>
            </div>

            {/* Results section */}
            <div className="flex flex-col gap-y-5">
                {showNoResults ? (
                    hasSearchCriteria ? (
                        <EmptyEventList hasActiveFilters backUrl="/" />
                    ) : (
                        <EventPageNoResult />
                    )
                ) : (
                    <Fragment>
                        <SellTicketsEventCardsView events={data} isLoading={isValidating} />

                        {/* skeleton shown below existing list while page 2+ is loading */}
                        {isValidating && (
                            <EventDetailsSkeleton
                                ctaLabel={fallbackTranslation(
                                    t('start_selling'),
                                    'start_selling',
                                    'Start Selling'
                                )}
                            />
                        )}

                        {hasMore && (
                            <ViewMoreButton
                                onClick={handleLoadMore}
                                disabled={isFetching || isLoadingMore}
                            />
                        )}
                    </Fragment>
                )}
            </div>
        </MainContainer>
    );
};

export default SellTicketSearchView;
