'use client';

import useSWRMutation, { SWRMutationConfiguration } from 'swr/mutation';

import OpenStreetMap, { SuggestedLocationSearchRequest } from '@/interfaces/OpenStreetMap';

import { fetcher } from '../fetcher';
import { ErrorResponse } from '../types';

const SIZE_LIMIT = 10;

export function useLazyGetOpenStreetMapLocationQuery() {
    return useSWRMutation<
        OpenStreetMap,
        ErrorResponse,
        string,
        { latitude: number; longitude: number }
    >('/reverse', async (url, { arg }) => {
        const searchParams = new URLSearchParams({
            format: 'jsonv2',
            lat: String(arg.latitude),
            lon: String(arg.longitude),
        });

        return fetcher<OpenStreetMap>(`${url}?${searchParams.toString()}`, {
            baseUrl: 'https://nominatim.openstreetmap.org',
        });
    });
}

export function useLazyGetSuggestedLocationsQuery(
    options?: SWRMutationConfiguration<
        OpenStreetMap[],
        ErrorResponse,
        string,
        SuggestedLocationSearchRequest
    >
) {
    return useSWRMutation<OpenStreetMap[], ErrorResponse, string, SuggestedLocationSearchRequest>(
        '/search',
        async (url, { arg }) => {
            const searchValue = arg.search?.trim()?.replace(/\s+/g, ' ');
            const searchParams = new URLSearchParams({
                q: searchValue ?? '',
                format: 'jsonv2',
                addressdetails: '1',
                limit: String(SIZE_LIMIT),
            });

            if (arg.locale) {
                searchParams.set('accept-language', arg.locale);
            }

            if (arg.countryCode) {
                searchParams.set('countrycodes', arg.countryCode.toLowerCase());
            }

            return fetcher<OpenStreetMap[]>(`${url}?${searchParams.toString()}`, {
                baseUrl: 'https://nominatim.openstreetmap.org',
            });
        },
        options
    );
}
