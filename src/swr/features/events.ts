'use client';

import { useRef } from 'react';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import useSWRMutation from 'swr/mutation';

import {
    EventSearchFilters as EntityEventSearchFilters,
    EventDetail,
    EventTicket,
} from '@/interfaces/Event';
import HomePageEvent, { HomePageFilters } from '@/interfaces/events/HomePageEvent';
import { FastifyPagination, LastMinuteEventsResponse } from '@/interfaces/Fetch';
import EventSearchResponse from '@/interfaces/Search';
import {
    FrontAPIEntityEventsResponse,
    frontApiEntityEventsResponseMapper,
    homePageMapper,
} from '@/utils/mapper';

import { fetcher } from '../fetcher';
import { ErrorResponse } from '../types';
import { EventSearchFilters, EventSearchKey, LastMinuteKey, UseEventsData } from '../types/events';
import { createInfiniteResult } from '../utils';

export function useEventSearch(keyword: string) {
    const trimmedKeyword = keyword.trim();
    const swrKey: EventSearchKey = trimmedKeyword
        ? ['/searchbar', { keyword: trimmedKeyword }]
        : null;

    const { data, error, isLoading, isValidating } = useSWR<
        EventSearchResponse,
        ErrorResponse,
        EventSearchKey
    >(swrKey, ([url, params]) => fetcher<EventSearchResponse>(url, { params }));

    return {
        data: data ?? null,
        isLoading: !!swrKey && isLoading,
        error: error ?? null,
        isValidating,
        isError: !!error,
    };
}

export function useEvents(filters: EventSearchFilters = {}, initialData?: UseEventsData) {
    // keep track of whether initialData is still valid, if yes then bypass
    const isInitialDataValid = useRef(Boolean(initialData));

    const _getInfiniteKey = (pageIndex: number, previousPageData: UseEventsData | null) => {
        if (filters.skip === true) return null;
        if (previousPageData && !previousPageData.hasMore) return null;

        // leave out pageNumber and skip from filters
        const { pageNumber: _, skip: __, ...searchCriteria } = filters;
        return [
            '/events/search',
            {
                ...searchCriteria,
                pageNumber: pageIndex + 1,
                pageSize: filters.pageSize || 32,
            },
        ] as const;
    };

    const swr = useSWRInfinite<UseEventsData, ErrorResponse, typeof _getInfiniteKey>(
        _getInfiniteKey,
        async ([url, params]) => {
            // if SWR tries to fetch Page 1 on initial load,
            // return initialData directly without hitting the network
            if (params.pageNumber === 1 && initialData && isInitialDataValid.current) {
                return initialData;
            }

            // otherwise, make normal network request
            return fetcher(url, { params });
        },
        {
            fallbackData: initialData ? [initialData] : undefined,
            revalidateIfStale: false,
            // important
            revalidateFirstPage: false,
        }
    );

    return createInfiniteResult<EventTicket, UseEventsData>(
        swr,
        initialData,
        (page) => page.rows ?? [],
        (page) => page.hasMore ?? false,
        (page) => page?.totalCount ?? 0
    );
}

export function useLazyGetEventDetailQuery() {
    return useSWRMutation<EventDetail, ErrorResponse, string, { eventId: string; action?: string }>(
        'getEventDetail',
        async (_, { arg }) => {
            const { eventId, action } = arg;
            return fetcher<EventDetail>('/events/details', {
                params: { eventId, ...(action && { action }) },
            });
        }
    );
}

export function useLazyGetEntityEventsQuery() {
    return useSWRMutation<
        FastifyPagination<EventTicket>,
        ErrorResponse,
        string,
        EntityEventSearchFilters | undefined
    >('getEntityEvents', async (_, { arg }) => {
        const {
            pageNumber,
            pageSize,
            fromDate,
            toDate,
            countryId,
            cityId,
            country,
            city,
            venueId,
            tourId,
            name,
            performerId,
            currencyCode,
        } = arg || {};

        const response = await fetcher<FrontAPIEntityEventsResponse>('/events/entity', {
            params: {
                pageNumber,
                pageSize,
                fromDate,
                toDate,
                countryId: country?.id ?? countryId,
                cityId: city?.id ?? cityId,
                venueId,
                tourId,
                name,
                performerId,
                currencyCode,
            },
        });

        return frontApiEntityEventsResponseMapper(response);
    });
}

export function useHomepageEvents(filters: HomePageFilters = {}, initialData?: EventTicket[]) {
    const { countryId, fromDate, toDate, skip = false } = filters;
    const swrKey = !skip ? (['/homepage-events', filters] as const) : null;

    const { data, error, isLoading, isValidating, mutate } = useSWR<EventTicket[], ErrorResponse>(
        swrKey,
        async ([url]) => {
            const response = await fetcher<HomePageEvent[]>(url, {
                params: {
                    ...(countryId && { countryId }),
                    ...(fromDate && { fromDate }),
                    ...(toDate && { toDate }),
                    locationMode: 'manual',
                },
            });
            return homePageMapper(response);
        },
        {
            revalidateOnFocus: false,
            fallbackData: initialData,
            keepPreviousData: true,
        }
    );

    return {
        data: data ?? [],
        isLoading,
        isValidating,
        isError: !!error,
        error: error ?? null,
        mutate,
    };
}

export function useHomepageLastMinuteEvents(
    filters: { countryId?: number; skip?: boolean },
    initialData?: LastMinuteEventsResponse<EventTicket> | null
) {
    const { countryId, skip = false } = filters;

    const swrKey: LastMinuteKey = !skip ? ['/homepage-last-minute-events', { countryId }] : null;

    const { data, error, isLoading, isValidating, mutate } = useSWR<
        LastMinuteEventsResponse<EventTicket>,
        ErrorResponse,
        LastMinuteKey
    >(
        swrKey,
        async ([url, params]: [string, { countryId?: number }]) => {
            const response = await fetcher<LastMinuteEventsResponse<EventTicket>>(url, {
                params: {
                    locationMode: 'manual',
                    countryId: params.countryId,
                },
            });

            if (!response) {
                return {
                    events: [],
                    seeAllFromDate: '',
                    seeAllToDate: '',
                };
            }

            return {
                ...response,
                events: response.events ?? [],
            };
        },
        {
            revalidateOnFocus: false,
            fallbackData: initialData ? initialData : undefined,
            keepPreviousData: true,
        }
    );

    return {
        data: data ?? { events: [], seeAllFromDate: '', seeAllToDate: '' },
        isLoading,
        isValidating,
        isError: !!error,
        error: error ?? null,
        mutate,
    };
}
