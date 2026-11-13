import useSWR, { type SWRConfiguration } from 'swr';

import { PaginationFilters } from '@/interfaces/Fetch';
import State from '@/interfaces/State';

import { fetcher } from '../fetcher';
import { ErrorResponse } from '../types';
import { GetStatesKey } from '../types/states';

type UseGetStatesQueryOptions = SWRConfiguration<State[], ErrorResponse> & {
    skip?: boolean;
};

export function useGetStatesQuery(args?: PaginationFilters, options?: UseGetStatesQueryOptions) {
    const { skip, ...swrOptions } = options ?? {};

    const swrKey: GetStatesKey = !skip
        ? [
              '/states',
              {
                  pageNumber: args?.pageNumber ?? 1,
                  pageSize: args?.pageSize,
                  query: args?.query,
              },
          ]
        : null;

    const { data, error, isLoading, isValidating, mutate } = useSWR<
        State[],
        ErrorResponse,
        GetStatesKey
    >(
        swrKey,
        ([url]) =>
            fetcher<State[]>(url, {
                method: 'GET',
            }),
        swrOptions
    );

    return {
        data: data ?? [],
        error: error ?? null,
        isError: !!error,
        isLoading,
        isValidating,
        mutate,
    };
}
