'use client';

import useSWR from 'swr';

import { fetcher } from '../fetcher';
import { ErrorResponse } from '../types';

const INTERNAL_API_BASE_URL =
    process.env.NODE_ENV === 'development'
        ? (process.env.NEXT_PUBLIC_IMAGE_URL ?? '')
        : (process.env.NEXT_PUBLIC_FRONT_URL ?? '/files/images');

export function useGetVenueSvgMap(filePath?: string, options?: { skip?: boolean }) {
    const shouldFetch = Boolean(filePath) && !options?.skip;
    const swrKey = shouldFetch ? `venues/svg/${encodeURIComponent(filePath!)}` : null;

    const { data, error, isLoading, isValidating } = useSWR<string, ErrorResponse, string | null>(
        swrKey,
        (url) =>
            fetcher<string>(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'text/plain',
                },
                baseUrl: INTERNAL_API_BASE_URL + '/',
                responseType: 'text',
            })
    );

    return {
        data: data ?? null,
        isLoading,
        error: error ?? null,
        isValidating,
        isError: !!error,
    };
}
