import { cache } from 'react';
import { isEmpty } from 'lodash-es';

import { FastifyPagination, PaginationFilters } from '@/interfaces/Fetch';
import {
    AccountSettingListing,
    ExternalDigitalVenueBlocks,
    ListingMetadata,
    ListingSearch,
} from '@/interfaces/Listing';
import Headers from '@/lib/headers';
import { createCacheKey, extractShowId } from '@/utils/common';
import Cache from '@/constants/cache';

import { apiService } from './base';
import { apiEndpoints } from './config';
import { getCurrencyFromCookies } from './currencies';
import { getClientIp } from './ip';
import { getUserToken } from './users';

export interface Venue3DDVConfig {
    maps_3d_urls: Record<string, string[]>;
    external_3ddv_id: string | null;
    external_3ddv_blocks: ExternalDigitalVenueBlocks[];
}

async function getOptions() {
    const currencyCode = await getCurrencyFromCookies();
    const { hostname } = await Headers.getDomainInfo();
    const locale = await Headers.getExplicitLocale();

    return { currencyCode, hostname, locale };
}

const VENUE_MAP_PRIMARY_BASE_URL = `${(process.env.NEXT_PUBLIC_FRONT_URL ?? '').replace(/\/$/, '')}/files/images/`;
const VENUE_MAP_FALLBACK_BASE_URL = 'https://gigsberg.com/files/images/';

export const listingApi = {
    getMapSvg: async (filePath: string) => {
        if (!filePath) return undefined;

        const fetchVenueMapSvg = (baseUrl: string) =>
            apiService.get<string>(`venues/svg/${encodeURIComponent(filePath)}`, {
                baseUrl,
                responseType: 'text',
                headers: {
                    Accept: 'image/svg+xml,text/plain',
                },
                next: {
                    revalidate: Cache.MINUTE,
                    tags: [createCacheKey(filePath)],
                },
                cache: 'force-cache',
            });

        try {
            return await fetchVenueMapSvg(VENUE_MAP_PRIMARY_BASE_URL);
        } catch {
            try {
                return await fetchVenueMapSvg(VENUE_MAP_FALLBACK_BASE_URL);
            } catch {
                return undefined;
            }
        }
    },
    getVenueFrom3DDV: async (event_id: number) => {
        const { hostname } = await getOptions();

        const response = await apiService.get<Venue3DDVConfig>(
            apiEndpoints.listings.getVenue3DDV(event_id),
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-website-domain': hostname,
                },
            }
        );
        // console.log('getVenueFrom3DDV___data', event_id, response);
        return response;
    },
    getListings: cache(
        async (
            eventId: string,
            numberOfTickets: number | null = null,
            searchFilters?: {
                categories?: string[] | null;
                ticketTypeIds?: number[] | null;
                blocks?: string[] | null;
                minPrice?: number | null;
                maxPrice?: number | null;
            } | null
        ): Promise<ListingSearch | null> => {
            const ip = await getClientIp();
            const id = extractShowId(eventId);

            const { currencyCode, hostname, locale } = await getOptions();

            const token = await getUserToken();

            return apiService.post(
                apiEndpoints.listings.search,
                {
                    event_id: id,
                    currency_code: currencyCode,
                    per_page: 32,
                    ...(numberOfTickets != null && { number_of_tickets: numberOfTickets }),
                    ...(searchFilters?.categories?.length && {
                        categories: searchFilters.categories,
                    }),
                    ...(searchFilters?.ticketTypeIds?.length && {
                        ticket_type_ids: searchFilters.ticketTypeIds,
                    }),
                    ...(searchFilters?.blocks?.length && { blocks: searchFilters.blocks }),
                    ...(searchFilters?.minPrice != null &&
                        searchFilters?.maxPrice != null && {
                            min_price: searchFilters.minPrice,
                            max_price: searchFilters.maxPrice,
                        }),
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-website-domain': hostname,
                        'x-forwarded-for': ip,
                        ...(locale && { 'x-explicit-locale': locale }),
                        ...(token && { Authorization: `Bearer ${token}` }),
                    },
                }
            );
        }
    ),

    getListingMetadata: cache(async (eventId: string): Promise<ListingMetadata | null> => {
        const ip = await getClientIp();

        const { currencyCode, hostname, locale } = await getOptions();

        const id = extractShowId(eventId);

        const token = await getUserToken();

        return apiService.post(
            apiEndpoints.listings.metadata,
            {
                event_id: id,
                currency_code: currencyCode,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-website-domain': hostname,
                    'x-forwarded-for': ip,
                    ...(locale && { 'x-explicit-locale': locale }),
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
            }
        );
    }),
    async getExternal3dMetadata(eventId: number) {
        const { hostname } = await Headers.getDomainInfo();

        try {
            const res = await apiService.get<{ maps_3d_urls: Record<string, string[]> }>(
                apiEndpoints.listings.map,
                {
                    params: { event_id: eventId },
                    headers: {
                        'Content-Type': 'application/json',
                        'x-website-domain': hostname,
                    },
                }
            );

            const maps = res.maps_3d_urls;
            return isEmpty(maps) ? undefined : maps;
        } catch (e) {
            console.error('Failed to get external 3d metadata', e);
            return;
        }
    },
    async getUserListing(filter: PaginationFilters) {
        const token = await getUserToken();
        try {
            const res = await apiService.get<FastifyPagination<AccountSettingListing>>(
                apiEndpoints.listings.userListing,
                {
                    params: {
                        ...filter,
                    },
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token && { Authorization: `Bearer ${token}` }),
                    },
                    next: {
                        revalidate: 5,
                    },
                }
            );

            return res;
        } catch (e) {
            console.error('Failed to get user listing', e);
            return;
        }
    },
};
