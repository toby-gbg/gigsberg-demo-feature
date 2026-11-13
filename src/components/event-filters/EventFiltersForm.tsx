'use client';

import { ClassValue } from 'clsx';
import type { DateRange } from 'react-day-picker';

import City from '@/interfaces/City';
import Country from '@/interfaces/Country';
import Tour from '@/interfaces/Tour';
import { selectWrapperClassName } from '@/config/classname';
import { cn } from '@/lib/cn';
import { formatDateToISODate, isoDateToDate } from '@/utils/date';

import DateRangePickerSelect from '@/components/DateRangePickerSelect';

import EventCitySelector from './EventCitySelector';
import EventCountrySelector from './EventCountrySelector';
import EventFiltersHeader from './EventFiltersHeader';
import EventFiltersSkeleton from './EventFiltersSkeleton';
import EventTourSelector from './EventTourSelector';
import { useEventFilters, type EventFilterOptions } from './useEventFilters';

export type EventFiltersFormProps = {
    countries: Country[];
    cities?: City[];
    tours?: Tour[];
    options?: EventFilterOptions;
    isLoading?: {
        countries?: boolean;
        cities?: boolean;
        tours?: boolean;
    };
    classNames?: {
        wrapper?: ClassValue;
        header?: ClassValue;
        summary?: ClassValue;
        filters?: ClassValue;
        date?: ClassValue;
        country?: ClassValue;
        city?: ClassValue;
        tour?: ClassValue;
    };
};

export const EventFiltersForm = ({
    countries,
    cities = [],
    tours = [],
    options,
    isLoading,
    classNames,
}: EventFiltersFormProps) => {
    const { filters, hasActiveFilters, setFilters, resetFilters } = useEventFilters(options);
    const hasTours = tours.length > 0 || !!isLoading?.tours;

    const dateValue: DateRange | undefined = filters.fromDate
        ? {
              from: isoDateToDate(filters.fromDate),
              to: filters.toDate ? isoDateToDate(filters.toDate) : undefined,
          }
        : undefined;

    return (
        <div className={cn('h-fit w-full overflow-hidden', classNames?.wrapper)}>
            <div className="flex flex-col gap-2">
                <EventFiltersHeader
                    classNames={classNames}
                    hasActiveFilters={hasActiveFilters}
                    resetFilters={resetFilters}
                />

                <div
                    className={cn(
                        'grid w-full grid-cols-1 items-start gap-2 pb-1',
                        hasTours ? 'md:grid-cols-2 2xl:grid-cols-4' : 'lg:grid-cols-3',
                        classNames?.filters
                    )}
                >
                    <DateRangePickerSelect
                        value={dateValue}
                        classNames={{ trigger: cn('h-10', classNames?.date) }}
                        onChange={(range) => {
                            if (!range) {
                                setFilters({ fromDate: null, toDate: null });
                                return;
                            }

                            if (!range.from) return;

                            setFilters({
                                fromDate: formatDateToISODate(range.from) ?? null,
                                toDate: formatDateToISODate(range.to) ?? null,
                            });
                        }}
                    />
                    {isLoading?.countries ? (
                        <EventFiltersSkeleton
                            className={cn(selectWrapperClassName, classNames?.country)}
                        />
                    ) : (
                        <EventCountrySelector
                            countries={countries}
                            value={filters.countryId}
                            onChange={(countryId) => setFilters({ countryId, cityId: null })}
                        />
                    )}
                    {isLoading?.cities ? (
                        <EventFiltersSkeleton
                            className={cn(selectWrapperClassName, classNames?.city)}
                        />
                    ) : (
                        <EventCitySelector
                            cities={cities}
                            countryId={filters.countryId}
                            value={filters.cityId}
                            onChange={(cityId) => setFilters({ cityId })}
                        />
                    )}
                    {hasTours &&
                        (isLoading?.tours ? (
                            <EventFiltersSkeleton
                                className={cn(selectWrapperClassName, classNames?.tour)}
                            />
                        ) : (
                            <EventTourSelector
                                tours={tours}
                                value={filters.tourId}
                                onChange={(tourId) => setFilters({ tourId })}
                            />
                        ))}
                </div>
            </div>
        </div>
    );
};
