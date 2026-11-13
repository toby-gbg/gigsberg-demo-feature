'use client';

import useSWR, { type SWRConfiguration } from 'swr';

import Country from '@/interfaces/Country';
import { FastifyPagination, PaginationFilters } from '@/interfaces/Fetch';

import { fetcher } from '../fetcher';
import { ErrorResponse } from '../types';
import { GetCountriesKey } from '../types/countries';

type UseGetCountriesQueryOptions = SWRConfiguration<FastifyPagination<Country>, ErrorResponse>;

export function useGetCountriesQuery(
    args?: PaginationFilters,
    options?: UseGetCountriesQueryOptions
) {
    const swrKey: GetCountriesKey = [
        '/countries',
        {
            pageNumber: args?.pageNumber ?? 1,
            pageSize: args?.pageSize,
            query: args?.query,
        },
    ];

    const { data, error, isLoading, isValidating, mutate } = useSWR<
        FastifyPagination<Country>,
        ErrorResponse,
        GetCountriesKey
    >(swrKey, ([url, params]) => fetcher<FastifyPagination<Country>>(url, { params }), options);

    return {
        data: data ?? null,
        error: error ?? null,
        isError: !!error,
        isLoading,
        isValidating,
        mutate,
    };
}
