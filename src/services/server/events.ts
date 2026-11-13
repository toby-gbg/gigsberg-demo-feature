import { cache } from 'react';

import { EventGuestDataResponse, SubmitCondition } from '@/interfaces/AttendeeDetails';
import Country from '@/interfaces/Country';
import {
    EventDetail,
    EventFilterOptionsResponse,
    EventRestriction,
    EventSearchFilters,
    EventTicket,
    EventTicketByCity,
    FooterEventsData,
} from '@/interfaces/Event';
import HomePageEvent from '@/interfaces/events/HomePageEvent';
import {
    EventsByCityResponse,
    FastifyPagination,
    LastMinuteEventsResponse,
} from '@/interfaces/Fetch';
import { EventMetadata } from '@/interfaces/Metadata';
import { UpcomingBigMatchesResponse } from '@/interfaces/UpcomingBigMatches';
import Cookie from '@/lib/cookie';
import Headers from '@/lib/headers';
import { verifyToken } from '@/lib/jsonwebtoken';
import { extractShowId, removeTicketsSuffix } from '@/utils/common';
import {
    FrontAPIEntityEventsResponse,
    frontApiEntityEventsResponseMapper,
    homePageMapper,
} from '@/utils/mapper';
import Cache from '@/constants/cache';
import { EMPTY_EVENTS } from '@/constants/events';

import { apiService } from './base';
import { apiEndpoints } from './config';
import { getCurrencyFromCookies } from './currencies';
import { getClientIp, ipApi } from './ip';
import { RequestDebugOptions } from './types';
import { getUserToken } from './users';

const getEventMetadataApi = async (
    id: number,
    type: string,
    subtype: string,
    event: string,
    debug?: RequestDebugOptions
): Promise<EventMetadata | null> => {
    const hostname = await Headers.getHostname();
    const locale = await Headers.getExplicitLocale();

    return apiService
        .get<EventMetadata>(apiEndpoints.events.metadata, {
            params: {
                id,
                typeNameUrl: removeTicketsSuffix(type),
                subtypeNameUrl: subtype,
                performerNameUrl: removeTicketsSuffix(event),
            },
            headers: {
                'x-website-domain': hostname,
                ...(locale && { 'x-explicit-locale': locale }),
            },
            debug,
        })
        .then((res) => res)
        .catch(() => null);
};

const getEventMetadataApiCached = cache(
    async (
        id: number,
        type: string,
        subtype: string,
        event: string
    ): Promise<EventMetadata | null> => getEventMetadataApi(id, type, subtype, event)
);

export const eventApi = {
    getFilterOptions: ({
        type,
        subtype,
    }: {
        type: string;
        subtype?: string;
    }): Promise<EventFilterOptionsResponse | null> =>
        apiService
            .get<EventFilterOptionsResponse>(apiEndpoints.events.filterOptions, {
                params: { type: removeTicketsSuffix(type), subtype },
            })
            .catch(() => null),

    async getHomePageEvents({ limit }: { limit: number }): Promise<EventTicket[]> {
        const ip = await getClientIp();
        const country = await ipApi.getCountryIp();
        const hostname = await Headers.getHostname();
        const locale = await Headers.getExplicitLocale();

        console.log('test', { ip, country });

        const response = await apiService.get<HomePageEvent[]>(apiEndpoints.events.homePage, {
            params: { countryId: country?.id, limit },
            headers: {
                'x-website-domain': hostname,
                'x-forwarded-for': ip,
                ...(locale && { 'x-explicit-locale': locale }),
            },
        });

        if (!response) return [];

        return homePageMapper(response);
    },

    searchEvents: cache(
        async (params: EventSearchFilters): Promise<FastifyPagination<EventTicket> | null> => {
            const query = params.query?.trim();
            const nameUrl = params.nameUrl?.trim();
            if (query && query.length > 120) return null;
            if (nameUrl && nameUrl.length > 120) return null;

            const pageSize = params.pageSize ?? 32;
            const pageNumber = Math.min(Math.max(params.pageNumber ?? 1, 1), 20);

            const {
                cityId,
                countryId,
                fromDate,
                toDate,
                subtype,
                cityName,
                countryName,
                venueId,
                performerId,
            } = params;

            const baseParams = {
                ...(cityId && { cityId }),
                ...(countryId && { countryId }),
                ...(venueId && { venueId }),
                ...(performerId && { performerId }),
                ...(cityName && { cityName }),
                ...(countryName && { countryName }),
                ...(fromDate && { fromDate }),
                ...(toDate && { toDate }),
                ...(subtype && { subtype }),
                pageNumber,
                pageSize,
            };

            const fetchSearch = (extra: Record<string, string | number>) =>
                apiService
                    .get<FrontAPIEntityEventsResponse>(apiEndpoints.events.search, {
                        params: { ...baseParams, ...extra },
                    })
                    .then((res) => frontApiEntityEventsResponseMapper(res))
                    .catch(() => null);

            if (nameUrl) return fetchSearch({ nameUrl: removeTicketsSuffix(nameUrl) });

            if (!query) return fetchSearch({});

            return fetchSearch({ name: query });
        }
    ),

    async getNearbyEvents(
        _nameUrl: string,
        subtype: string,
        type?: string
    ): Promise<FastifyPagination<EventTicket> | null> {
        if (_nameUrl.length > 120) return null;

        const ip = await getClientIp();
        const country = await ipApi.getCountryIp();
        const hostname = await Headers.getHostname();
        const locale = await Headers.getExplicitLocale();
        const countryId = country.id;
        const nameUrl = removeTicketsSuffix(_nameUrl);
        const isSport = type === 'sport';

        return apiService
            .get<FastifyPagination<EventTicket>>(apiEndpoints.events.search, {
                params: {
                    nameUrl,
                    pageSize: 50,
                    countryId,
                    ...(isSport && { subtype }),
                },
                headers: {
                    'x-website-domain': hostname,
                    'x-forwarded-for': ip,
                    ...(locale && { 'x-explicit-locale': locale }),
                },
                next: {
                    revalidate: Cache.HOUR,
                    tags: [
                        `nearby-events:${nameUrl}:${hostname}:${
                            isSport ? subtype : 'all'
                        }:${countryId}`,
                        `performer-events:${nameUrl}:${hostname}`,
                        `performer-events:all:${hostname}`,
                    ],
                },
            })
            .then((res) => res)
            .catch(() => null);
    },

    async getInternationalEvents(
        _nameUrl: string,
        subtype: string,
        type?: string
    ): Promise<FastifyPagination<EventTicket> | null> {
        if (_nameUrl.length > 120) return null;

        const ip = await getClientIp();
        const country = await ipApi.getCountryIp();
        const hostname = await Headers.getHostname();
        const locale = await Headers.getExplicitLocale();
        const countryId = country.id;
        const nameUrl = removeTicketsSuffix(_nameUrl);
        const isSport = type === 'sport';

        return apiService
            .get<FastifyPagination<EventTicket>>(apiEndpoints.events.search, {
                params: {
                    nameUrl,
                    pageSize: 32,
                    excludeCountryId: countryId,
                    ...(isSport && { subtype }),
                },
                headers: {
                    'x-website-domain': hostname,
                    'x-forwarded-for': ip,
                    ...(locale && { 'x-explicit-locale': locale }),
                },
                next: {
                    revalidate: Cache.HOUR,
                    tags: [
                        `international-events:${nameUrl}:${hostname}:${
                            isSport ? subtype : 'all'
                        }:${countryId}`,
                        `performer-events:${nameUrl}:${hostname}`,
                        `performer-events:all:${hostname}`,
                    ],
                },
            })
            .then((res) => res)
            .catch(() => null);
    },

    async getEventDetails({
        eventId,
        action,
        debug,
    }: {
        eventId: string;
        action?: string;
        debug?: RequestDebugOptions;
    }): Promise<EventDetail | null | { isRestricted: true }> {
        const ip = await getClientIp();
        const id = action !== 'sell_ticket' ? extractShowId(eventId) : eventId;
        const hostname = await Headers.getHostname();
        const locale = await Headers.getExplicitLocale();

        const response = await apiService
            .get<Omit<EventDetail, 'id'>>(apiEndpoints.events.details, {
                params: {
                    eventId: String(id),
                    action,
                },
                headers: {
                    'x-website-domain': hostname,
                    'x-forwarded-for': ip,
                    ...(locale && { 'x-explicit-locale': locale }),
                },
                debug,
            })
            .then((res) => res)
            .catch((err) => {
                if (
                    //Restricted event
                    err.statusCode === 403 ||
                    //Expired event
                    (err.statusCode === 409 && err.response.statusCode === 'event_expired')
                ) {
                    return { isRestricted: true };
                }
                return null;
            });

        if (!response) return null;
        if ('isRestricted' in response) return { isRestricted: true };

        return {
            ...response,
            id: Number(id),
        };
    },

    async getEventRestrictions(
        eventId: number,
        countryCode: string,
        isRestrictionInCom?: number
    ): Promise<EventRestriction[]> {
        const { config } = await Headers.getDomainInfo();

        const onlySupportedCountryCodes = config?.features?.onlySupportedCountryCodes;
        const isRestricted =
            onlySupportedCountryCodes?.includes(countryCode) || isRestrictionInCom === 1;

        if (isRestricted) {
            return apiService.get(apiEndpoints.events.restrictions(eventId), {
                params: { isCoUk: onlySupportedCountryCodes?.includes('GB') ? '1' : '0' },
            });
        }

        return [];
    },

    getEventMetadata: async ({
        query,
        type,
        subtype,
        event,
        debug,
    }: {
        query: string;
        type: string;
        subtype: string;
        event: string;
        debug?: RequestDebugOptions;
    }): Promise<EventMetadata | null> => {
        const id = extractShowId(query);

        if (!id) return null;

        if (process.env.NODE_ENV === 'development') {
            return getEventMetadataApi(id, type, subtype, event, debug);
        }

        return getEventMetadataApiCached(id, type, subtype, event);
    },

    async getEntityEvents(
        params: EventSearchFilters
    ): Promise<FastifyPagination<EventTicket> | null> {
        const {
            performerId,
            tourId,
            isFestival,
            pageSize = 32,
            pageNumber,
            countryId,
            cityId,
            fromDate,
            toDate,
        } = params;

        if (!performerId && !tourId) return null;

        const [ip, hostname, locale, token, currencyCode] = await Promise.all([
            getClientIp(),
            Headers.getHostname(),
            Headers.getExplicitLocale(),
            getUserToken(),
            getCurrencyFromCookies(),
        ]);

        return apiService
            .get<FrontAPIEntityEventsResponse>(apiEndpoints.events.entity, {
                params: {
                    ...(typeof performerId === 'number' ? { performerId } : {}),
                    ...(typeof tourId === 'number' ? { tourId } : {}),
                    ...(typeof isFestival === 'boolean' ? { isFestival } : {}),
                    pageSize,
                    ...(typeof pageNumber === 'number' ? { pageNumber } : {}),
                    ...(typeof countryId === 'number' ? { countryId } : {}),
                    ...(typeof cityId === 'number' ? { cityId } : {}),
                    ...(fromDate ? { fromDate } : {}),
                    ...(toDate ? { toDate } : {}),
                    ...(currencyCode && typeof currencyCode === 'string' ? { currencyCode } : {}),
                },
                headers: {
                    'x-website-domain': hostname,
                    'x-forwarded-for': ip,
                    ...(locale && { 'x-explicit-locale': locale }),
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
            })
            .then((res) => {
                if (!res) return EMPTY_EVENTS;
                return frontApiEntityEventsResponseMapper(res);
            })
            .catch(() => null);
    },

    async getEventsByCity(params: {
        cityName?: string;
    }): Promise<EventsByCityResponse<EventTicketByCity>[] | null> {
        const { cityName } = params;

        if (!cityName) return null;

        const hostname = await Headers.getHostname();
        const locale = await Headers.getExplicitLocale();

        return apiService
            .get<EventsByCityResponse<EventTicketByCity>[]>(apiEndpoints.events.city(cityName), {
                headers: {
                    'x-website-domain': hostname,
                    ...(locale && { 'x-explicit-locale': locale }),
                },
            })
            .then((res) => res)
            .catch(() => null);
    },

    async getEventsByVenue(params: {
        venueNameUrl?: string;
        pageSize?: number;
        pageNumber?: number;
        fromDate?: string;
        toDate?: string;
    }): Promise<FastifyPagination<EventTicket> | null> {
        const { venueNameUrl } = params;

        if (!venueNameUrl) return null;

        return apiService
            .get<FastifyPagination<EventTicket>>(apiEndpoints.events.search, {
                params,
            })
            .then((res) => res)
            .catch(() => null);
    },

    async getEventGuestData(params: {
        eventId: number;
        affiliateId: number;
        condition: SubmitCondition;
    }): Promise<EventGuestDataResponse | null> {
        const token = await getUserToken();

        if (!token) return null;

        const { eventId, condition, affiliateId } = params;
        try {
            return await apiService.get(apiEndpoints.events.guestData(eventId), {
                headers: { Authorization: `Bearer ${token}` },
                params: { condition, affiliateId },
                // retry: { enabled: true },
            });
        } catch {
            return null;
        }
    },

    async getHomePageLastMinuteEvents(): Promise<LastMinuteEventsResponse<EventTicket> | null> {
        const ip = await getClientIp();
        const country = await ipApi.getCountryIp();
        const hostname = await Headers.getHostname();
        const locale = await Headers.getExplicitLocale();

        const cookieData = await Cookie.get('x-user-country');
        const storedCountry = cookieData ? await verifyToken<Country>(cookieData) : null;
        const isCountryMatch = storedCountry?.code === country?.code;

        const countryId = isCountryMatch ? country?.id : storedCountry?.id;
        const countryCode = isCountryMatch ? country?.code : storedCountry?.code;

        const response = await apiService.get<LastMinuteEventsResponse<EventTicket>>(
            apiEndpoints.events.homePageLastMinute,
            {
                params: { countryId },
                headers: {
                    'x-website-domain': hostname,
                    'x-forwarded-for': ip,
                    ...(locale && { 'x-explicit-locale': locale }),
                },
            }
        );

        const emptyEvents = {
            events: [],
            seeAllFromDate: '',
            seeAllToDate: '',
        };
        const events = response?.events || [];

        const hasAllWrongCountryForAllEvents =
            !!events.length && events.every((e) => e.countryCode !== countryCode);

        if (!response || hasAllWrongCountryForAllEvents) return emptyEvents;

        return {
            ...response,
            events: response?.events || [],
        };
    },

    getFooterEvents: cache(async (): Promise<FooterEventsData> => {
        const hostname = await Headers.getHostname();
        return apiService.get<FooterEventsData>(apiEndpoints.events.footer, {
            headers: {
                'x-website-domain': hostname,
            },
        });
    }),

    async getUpcomingBigMatches(): Promise<UpcomingBigMatchesResponse | null> {
        const hostname = await Headers.getHostname();
        const locale = await Headers.getExplicitLocale();
        const token = await getUserToken();
        const currencyCode = await getCurrencyFromCookies();

        const response = await apiService
            .get<UpcomingBigMatchesResponse>(apiEndpoints.events.upcomingBigMatches, {
                params: {
                    page: 1,
                    per_page: 8,
                    currencyCode,
                },
                headers: {
                    'x-website-domain': hostname,
                    ...(token && { Authorization: `Bearer ${token}` }),
                    ...(locale && { 'x-explicit-locale': locale }),
                },
            })
            .then((res) => res)
            .catch(() => null);

        if (!response) return null;

        return response;
    },
};
