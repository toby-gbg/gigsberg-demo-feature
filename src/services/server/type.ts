import { EventTicket } from '@/interfaces/Event';
import { Pagination } from '@/interfaces/Fetch';
import HpSlide from '@/interfaces/HpSlide';
import PopularPerformer from '@/interfaces/Performer';
import { SubtypeDataResponse } from '@/interfaces/Subtype';
import { SubtypeImageTile } from '@/interfaces/Tour';
import Headers from '@/lib/headers';
import { removeTicketsSuffix } from '@/utils/common';

import { apiService } from './base';
import { apiEndpoints } from './config';
import { getCurrencyFromCookies } from './currencies';
import { getClientIp } from './ip';
import { RequestDebugOptions } from './types';
import { getUserToken } from './users';

export type FrontSubtypeData = SubtypeDataResponse<
    PopularPerformer[],
    Pagination<EventTicket>
> | null;

export const typeApi = {
    getSlides: async ({ type }: { type: string }): Promise<HpSlide[]> => {
        const ip = await getClientIp();
        const hostname = await Headers.getHostname();
        const locale = await Headers.getExplicitLocale();
        const currencyCode = await getCurrencyFromCookies();
        const token = await getUserToken();

        const response = await apiService
            .get<{ slides: HpSlide[] }>(
                apiEndpoints.subtypeData({
                    route: 'slides',
                    type: removeTicketsSuffix(type),
                    currencyCode,
                }),
                {
                    headers: {
                        'x-forwarded-for': ip,
                        'x-website-domain': hostname,
                        'x-api-key': process.env.API_KEY,
                        ...(locale && { 'x-explicit-locale': locale }),
                        ...(token && { Authorization: `Bearer ${token}` }),
                    },
                }
            )
            .then((res) => res)
            .catch(() => null);

        if (!response) return [];

        return response.slides;
    },
    getSubtypes: async ({
        type,
        debug,
    }: {
        type: string;
        debug?: RequestDebugOptions;
    }): Promise<SubtypeImageTile[] | null> => {
        const ip = await getClientIp();
        const hostname = await Headers.getHostname();
        const locale = await Headers.getExplicitLocale();

        const response = await apiService
            .get<{ subtypes: SubtypeImageTile[] }>(
                apiEndpoints.subtypes.list(removeTicketsSuffix(type)),
                {
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

        return response.subtypes;
    },
};
