'use client';

import { useEffect, useRef } from 'react';
import useSWR from 'swr';

import { UpcomingBigMatchesResponse } from '@/interfaces/UpcomingBigMatches';

import { useUser } from '@/providers/UserProvider';

import { fetcher } from '../fetcher';
import { ErrorResponse } from '../types';

type UpcomingBigMatchesKey =
    | [
          string,
          {
              page: number;
              per_page: number;
              currencyCode: string;
              tourId: number | null;
          },
          number | undefined,
      ]
    | null;

export function useGetUpcomingBigMatches(currencyCode: string, tourId: number | null) {
    const user = useUser();

    const previousUserKeyRef = useRef(0);

    useEffect(() => {
        previousUserKeyRef.current += 1;
    }, [user]);

    const shouldFetch = previousUserKeyRef.current > 0;

    const swrKey: UpcomingBigMatchesKey = shouldFetch
        ? ['/events/sports-hero', { page: 1, per_page: 8, currencyCode, tourId }, user?.id]
        : null;

    const { data, error, isLoading, isValidating } = useSWR<
        UpcomingBigMatchesResponse,
        ErrorResponse,
        UpcomingBigMatchesKey
    >(swrKey, ([url, params]) => fetcher<UpcomingBigMatchesResponse>(url, { params }), {
        keepPreviousData: true,
    });

    return {
        data,
        isLoading: isLoading,
        error: error ?? null,
        isValidating,
        isError: !!error,
    };
}
