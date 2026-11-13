'use client';

import { ChangeEvent, FC } from 'react';
import { usePathname } from 'next/navigation';
import { useQueryStates } from '@/nuqs/hooks/useQueryStates';
import { searchParamsParsers, SearchParamsType } from '@/nuqs/params/search';
import { useTranslations } from 'next-intl';
import { debounce, useQueryState } from 'nuqs';
import type { DateRange } from 'react-day-picker';

import City from '@/interfaces/City';
import Country from '@/interfaces/Country';
import { EventSearchFilters } from '@/interfaces/Event';
import { convertSearchToLabel } from '@/utils/common';
import { formatDateToISODate, isoDateToDate } from '@/utils/date';
import { checkFiltersValueEmpty, convertFiltersValueToSearchParams } from '@/utils/search';

import { useSearchContext, useStableSearchContext } from '@/providers/SearchProvider';

import CitySelect from '@/components/CitySelect';
import CountrySelect from '@/components/CountrySelect';
import DateRangePickerSelect from '@/components/DateRangePickerSelect';

import SearchInput from './SearchInput';

const DEBOUNCE_DELAY = 300;

const SearchFilterSection: FC = () => {
    const t = useTranslations();

    const pathname = usePathname();
    const isSellTicketPage = pathname.includes('sell-ticket');

    const [{ type, id }, setSearchParams] = useQueryStates(searchParamsParsers, {
        shallow: isSellTicketPage,
    });
    // Keep q in a single-key subscriber to avoid stale multi-key state during RSC updates:
    // https://github.com/47ng/nuqs/issues/1498
    const [currentSearchValue, setSearchInputParam] = useQueryState(
        'q',
        searchParamsParsers.q.withDefault('').withOptions({ shallow: isSellTicketPage })
    );

    const { filtersValue, setFiltersValue } = useSearchContext();

    const { fromDate, toDate, countryId, cityId } = filtersValue ?? {};

    const dateValue: DateRange | undefined = fromDate
        ? {
              from: isoDateToDate(fromDate),
              to: toDate ? isoDateToDate(toDate) : undefined,
          }
        : undefined;

    const {
        intlKey: { placeholder: placeholderIntlKey },
    } = useStableSearchContext();

    const handleSetData = ({
        newFiltersValue,
        newSearchParams,
    }: {
        newFiltersValue: EventSearchFilters;
        newSearchParams: Partial<SearchParamsType>;
    }) => {
        if (checkFiltersValueEmpty(newFiltersValue)) {
            setFiltersValue(newFiltersValue);
            return;
        }

        setSearchParams({
            ...(type === 'countries' && id && { countryId: id }),
            ...(type === 'cities' && id && { cityId: id }),
            ...convertFiltersValueToSearchParams(newFiltersValue),
            ...newSearchParams,
        });
    };

    // handlers
    const handleClearSearchInput = () => {
        setSearchInputParam(null);
    };

    const handleChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
        const value = convertSearchToLabel(e.target.value);
        setSearchInputParam(value || null, {
            limitUrlUpdates: debounce(DEBOUNCE_DELAY),
        });
    };

    const handleDateChanges = (dateRange: DateRange | undefined) => {
        const fromDate = formatDateToISODate(dateRange?.from);
        const toDate = formatDateToISODate(dateRange?.to);
        const newFiltersValue = {
            ...filtersValue,
            fromDate,
            toDate,
        };
        handleSetData({
            newFiltersValue,
            newSearchParams: { fromDate: fromDate ?? null, toDate: toDate ?? null },
        });
    };

    const handleCountryChange = (country: Country | undefined) => {
        const newFiltersValue = {
            ...filtersValue,
            countryId: country?.id ?? undefined,
            cityId: undefined,
        };
        handleSetData({
            newFiltersValue,
            newSearchParams: { countryId: country?.id ?? null, cityId: null },
        });
    };

    const handleCityChange = (city: City | undefined) => {
        const newFiltersValue = {
            ...filtersValue,
            cityId: city?.id ?? undefined,
        };
        handleSetData({ newFiltersValue, newSearchParams: { cityId: city?.id ?? null } });
    };

    return (
        <>
            <SearchInput
                placeholder={t(placeholderIntlKey || 'search')}
                classNames={{
                    input: 'h-10 rounded-lg bg-white',
                    suffixIcon: 'pointer-events-auto max-sm:inset-e-3',
                }}
                value={convertSearchToLabel(currentSearchValue)}
                onChange={handleChangeInput}
                onClear={handleClearSearchInput}
            />

            {/* Filter row */}
            <div className="items-start gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                    {t('dates')}
                    <DateRangePickerSelect
                        onChange={handleDateChanges}
                        value={dateValue}
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
                        value={countryId ?? undefined}
                        onChange={handleCountryChange}
                    />
                </div>
                <div>
                    {t('city')}:
                    <CitySelect
                        classNames={{ trigger: 'bg-white' }}
                        countryId={countryId ?? undefined}
                        value={cityId ?? undefined}
                        onChange={handleCityChange}
                    />
                </div>
            </div>
        </>
    );
};

export default SearchFilterSection;
