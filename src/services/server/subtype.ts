import { EventTicket, EventTicketsResponse, FrontAPIEvent } from '@/interfaces/Event';
import { Pagination } from '@/interfaces/Fetch';
import PopularPerformer, { FrontAPIPerformer } from '@/interfaces/Performer';
import { SubtypeDataResponse } from '@/interfaces/Subtype';
import Tour from '@/interfaces/Tour';
import Headers from '@/lib/headers';
import { removeTicketsSuffix } from '@/utils/common';
import {
    frontApiEventMapper,
    frontApiEventTicketsResponseMapper,
    frontApiPaginationEventsMapper,
    frontApiPerformersMapper,
} from '@/utils/mapper';
import { GetSubtypeEventsResponse } from '@/swr/types/subtypes';

import { EventFilterSearchParams } from '@/components/event-filters/event-filter.schema';

import { apiService } from './base';
import { apiEndpoints } from './config';
import { getCurrencyFromCookies } from './currencies';
import { getClientIp } from './ip';
import { RequestDebugOptions } from './types';

export type FrontSubtypeData = SubtypeDataResponse<
    PopularPerformer[],
    Pagination<EventTicket>
> | null;

export const subtypeApi = {
    getSubtypeData: async ({
        type,
        subtype,
        debug,
    }: {
        type: string;
        subtype?: string;
        debug?: RequestDebugOptions;
    }): Promise<FrontSubtypeData> => {
        if (subtype && subtype.length > 150) return null;

        const ip = await getClientIp();
        const hostname = await Headers.getHostname();
        const locale = await Headers.getExplicitLocale();
        const currencyCode = await getCurrencyFromCookies();

        const response = await apiService
            .get<SubtypeDataResponse<FrontAPIPerformer[], Pagination<FrontAPIEvent>>>(
                apiEndpoints.subtypeData({
                    type: removeTicketsSuffix(type),
                    subtype,
                    currencyCode,
                }),
                {
                    params: {
                        per_page: 32,
                    },
                    headers: {
                        'x-forwarded-for': ip,
                        'x-website-domain': hostname,
                        'x-api-key': process.env.API_KEY,
                        ...(locale && { 'x-explicit-locale': locale }),
                    },
                    debug,
                }
            )
            .then((res) => res)
            .catch(() => null);

        if (!response) return null;

        return {
            ...response,
            performers: frontApiPerformersMapper(response.performers),
            events: frontApiPaginationEventsMapper(response.events),
        };
    },
    getFirstPageSubtypeEvents: async ({
        typeId,
        subtypeId,
        nameUrl,
        searchParams,
    }: {
        typeId?: number;
        subtypeId?: number;
        nameUrl: string;
        searchParams?: EventFilterSearchParams;
    }) => {
        const ip = await getClientIp();
        const hostname = await Headers.getHostname();
        const locale = await Headers.getExplicitLocale();

        const response = await apiService
            .get<Pagination<FrontAPIEvent>>(
                apiEndpoints.subtypeEvents({ typeId, subtypeId, nameUrl }),
                {
                    params: {
                        per_page: 1,
                        page: 1,
                        cityName: searchParams?.city ?? undefined,
                        cityId: searchParams?.cityId ?? undefined,
                        countryName: searchParams?.country ?? undefined,
                        countryId: searchParams?.countryId ?? undefined,
                        fromDate: searchParams?.fromDate ?? undefined,
                        toDate: searchParams?.toDate ?? undefined,
                        tourId: searchParams?.tourId ?? undefined,
                    },
                    headers: {
                        'x-forwarded-for': ip,
                        'x-website-domain': hostname,
                        'x-api-key': process.env.API_KEY,
                        ...(locale && { 'x-explicit-locale': locale }),
                    },
                }
            )
            .then((res) => res)
            .catch(() => null);

        return response ? frontApiPaginationEventsMapper(response) : null;
    },
    getSubtypeTours: async ({
        type,
        subtype,
    }: {
        type: string;
        subtype?: string;
    }): Promise<Tour[] | null> => {
        if (subtype && subtype.length > 150) return null;

        const ip = await getClientIp();
        const hostname = await Headers.getHostname();
        const locale = await Headers.getExplicitLocale();
        const currencyCode = await getCurrencyFromCookies();

        const response = await apiService
            .get<{ tours: Tour[] }>(
                apiEndpoints.subtypeData({
                    route: 'tours',
                    type: removeTicketsSuffix(type),
                    subtype,
                    currencyCode,
                }),
                {
                    params: {
                        per_page: 32,
                    },
                    headers: {
                        'x-forwarded-for': ip,
                        'x-website-domain': hostname,
                        'x-api-key': process.env.API_KEY,
                        ...(locale && { 'x-explicit-locale': locale }),
                    },
                }
            )
            .then((res) => res)
            .catch(() => null);

        if (!response) return null;

        return response.tours;
    },
    getSubtypePerformers: async ({
        type,
        subtype,
    }: {
        type: string;
        subtype?: string;
    }): Promise<PopularPerformer[] | null> => {
        if (subtype && subtype.length > 150) return null;

        const ip = await getClientIp();
        const currencyCode = await getCurrencyFromCookies();
        const hostname = await Headers.getHostname();
        const locale = await Headers.getExplicitLocale();

        const response = await apiService
            .get<{ performers: PopularPerformer[] }>(
                apiEndpoints.subtypeData({
                    route: 'performers',
                    type: removeTicketsSuffix(type),
                    subtype,
                    currencyCode,
                }),
                {
                    params: {
                        per_page: 32,
                    },
                    headers: {
                        'x-forwarded-for': ip,
                        'x-website-domain': hostname,
                        'x-api-key': process.env.API_KEY,
                        ...(locale && { 'x-explicit-locale': locale }),
                    },
                }
            )
            .then((res) => res)
            .catch(() => null);

        if (!response) return null;

        return response.performers;
    },
    getSubtypeEvents: async ({
        typeId,
        subtypeId,
        nameUrl,
    }: {
        typeId: number;
        subtypeId?: number;
        nameUrl: string;
    }): Promise<EventTicketsResponse | null> => {
        const ip = await getClientIp();
        const hostname = await Headers.getHostname();
        const locale = await Headers.getExplicitLocale();

        const response = await apiService
            .get<GetSubtypeEventsResponse>(
                apiEndpoints.subtypeEvents({
                    typeId,
                    subtypeId,
                    nameUrl: removeTicketsSuffix(nameUrl),
                }),
                {
                    params: {
                        per_page: 32,
                    },
                    headers: {
                        'x-forwarded-for': ip,
                        'x-website-domain': hostname,
                        'x-api-key': process.env.API_KEY,
                        ...(locale && { 'x-explicit-locale': locale }),
                    },
                }
            )
            .then((res) => frontApiEventTicketsResponseMapper(res))
            .catch(() => null);

        if (!response) return null;

        return response;
    },
    getSubtypeFeaturedEvents: async ({
        type,
        subtype,
    }: {
        type: string;
        subtype?: string;
    }): Promise<Pagination<EventTicket> | null> => {
        const ip = await getClientIp();
        const hostname = await Headers.getHostname();
        const locale = await Headers.getExplicitLocale();

        const response = await apiService
            .get<{ events: Pagination<FrontAPIEvent> }>(
                apiEndpoints.subtypeFeaturedEvents({
                    type: removeTicketsSuffix(type),
                    subtype,
                }),
                {
                    params: {
                        per_page: 32,
                    },
                    headers: {
                        'x-forwarded-for': ip,
                        'x-website-domain': hostname,
                        'x-api-key': process.env.API_KEY,
                        ...(locale && { 'x-explicit-locale': locale }),
                    },
                }
            )
            .then((res) => res)
            .catch(() => null);

        if (!response) return null;

        return {
            ...response.events,
            items: response.events.items.map(frontApiEventMapper),
        };
    },
};
