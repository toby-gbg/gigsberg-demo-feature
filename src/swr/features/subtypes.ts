'use client';

import useSWRInfinite from 'swr/infinite';

import { EventTicket, EventTicketsResponse } from '@/interfaces/Event';
import { frontApiEventTicketsResponseMapper } from '@/utils/mapper';

import { fetcher } from '../fetcher';
import { ErrorResponse } from '../types';
import {
    GetSubtypeEventsArgs,
    GetSubtypeEventsKey,
    GetSubtypeEventsResponse,
} from '../types/subtypes';
import { createInfiniteResult } from '../utils';

export function useGetSubtypeEvents(args: GetSubtypeEventsArgs) {
    const perPage = args.perPage ?? 32;
    const skip = args.skip ?? false;

    const _getInfiniteKey = (pageIndex: number): GetSubtypeEventsKey => {
        // no arguments, no fetch
        if (!args) return null;
        if (skip) return null;
        const page = pageIndex + 1;
        return ['/subtypes/events', { ...args, page, perPage }];
    };

    const swr = useSWRInfinite<EventTicketsResponse, ErrorResponse, typeof _getInfiniteKey>(
        _getInfiniteKey,
        async ([url, params]) => {
            const response = await fetcher<GetSubtypeEventsResponse>(url, {
                params: {
                    typeId: params.typeId,
                    subtypeId: params.subtypeId,
                    page: params.page,

                    nameUrl: params.nameUrl,
                    eventGroup: params.eventGroup,
                    fromDate: params.fromDate,
                    toDate: params.toDate,
                    countryName: params.country ?? undefined,
                    countryId: params.countryId ?? undefined,
                    cityName: params.city ?? undefined,
                    cityId: params.cityId,
                    tourId: params.tourId,
                    currencyCode: params.currencyCode,

                    exclude_event_ids: params.excludeEventIds.join(','),
                    per_page: params.perPage,
                },
            });

            return frontApiEventTicketsResponseMapper(response);
        },
        {
            keepPreviousData: true,
            revalidateFirstPage: false,
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
        }
    );

    return createInfiniteResult<EventTicket, EventTicketsResponse>(
        swr,
        null,
        (page) => page?.items ?? [],
        (page) => (page?.items?.length ?? 0) === perPage, // isReachingEnd logic
        (page) => page?.totalCount ?? 0
    );
}
