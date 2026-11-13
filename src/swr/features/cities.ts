import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';

import City, { CityParams, EventCityParams } from '@/interfaces/City';
import { EventTicketByCity } from '@/interfaces/Event';
import { FastifyPagination, Pagination } from '@/interfaces/Fetch';

import { fetcher } from '../fetcher';
import { getCitiesKeyForSWR } from '../helpers/cities.helper';
import { ErrorResponse } from '../types';
import { createInfiniteResult } from '../utils';

export function useGetCitiesQuery(params?: CityParams, options?: { skip?: boolean }) {
    const swrKey = getCitiesKeyForSWR(params, options);

    const { data, error, isLoading, isValidating, mutate } = useSWR(swrKey, ([url, query]) =>
        fetcher<FastifyPagination<City>>(url, {
            params: query,
        })
    );

    return {
        data,
        error,
        isLoading,
        isFetching: isValidating,
        mutate,
    };
}

export function useGetCityEventsBySubtypeQuery(args?: EventCityParams) {
    const perPage = args?.perPage || 32;

    const _getInfiniteKey = (
        pageIndex: number,
        previousPageData: Pagination<EventTicketByCity> | null
    ): readonly [string, Record<string, string | number>] | null => {
        if (!args) return null;

        // stop when there is no next page
        if (pageIndex > 0 && !previousPageData?.nextPage) return null;

        const page = pageIndex + 1;

        return [`/cities/event/${args.cityName}/${args.typeId}`, { page, perPage }] as const;
    };

    const swr = useSWRInfinite<
        Pagination<EventTicketByCity>,
        ErrorResponse,
        typeof _getInfiniteKey
    >(
        _getInfiniteKey,
        ([url, params]) =>
            fetcher<Pagination<EventTicketByCity>>(url, {
                params,
            }),
        { keepPreviousData: true }
    );

    return createInfiniteResult<EventTicketByCity, Pagination<EventTicketByCity>>(
        swr,
        null,
        (page) => page?.items ?? [],
        (page) => !!page?.nextPage
    );
}
