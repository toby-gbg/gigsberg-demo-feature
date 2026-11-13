import { cache } from 'react';

import { SEO } from '@/interfaces/SEO';
import Headers from '@/lib/headers';

import { apiService } from './base';
import { apiEndpoints } from './config';
import { getCurrencyFromCookies } from './currencies';
import { RequestDebugOptions } from './types';
import { getUserToken } from './users';

type SEOParams = { type: string; subtype?: string; event?: string; listing?: string };
type SEOParamsWithDebug = { params: SEOParams; debug?: RequestDebugOptions };

const getSeoMetadataApiCached = cache(
    async (
        type: string,
        subtype?: string,
        event?: string,
        listing?: string
    ): Promise<SEO | null> => {
        const [hostname, locale, currency, token] = await Promise.all([
            Headers.getHostname(),
            Headers.getExplicitLocale(),
            getCurrencyFromCookies(),
            getUserToken(),
        ]);

        const response = await apiService
            .get<SEO>(
                apiEndpoints.seo.metadata({
                    //ensure type is available
                    type,
                    subtype,
                    event,
                    listing,
                }),
                {
                    headers: {
                        'x-website-domain': hostname,
                        ...(locale && { 'x-explicit-locale': locale }),
                        ...(currency && { 'x-user-currency': currency }),
                        ...(token && { Authorization: `Bearer ${token}` }),
                    },
                }
            )
            .then((res) => res)
            .catch(() => null);

        if (!response) return null;

        return response;
    }
);

const getSeoMetadataApi = async ({ debug, params }: SEOParamsWithDebug): Promise<SEO | null> => {
    const [hostname, locale, currency, token] = await Promise.all([
        Headers.getHostname(),
        Headers.getExplicitLocale(),
        getCurrencyFromCookies(),
        getUserToken(),
    ]);

    const response = await apiService
        .get<SEO>(apiEndpoints.seo.metadata(params), {
            headers: {
                'x-website-domain': hostname,
                ...(locale && { 'x-explicit-locale': locale }),
                ...(currency && { 'x-user-currency': currency }),
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            debug,
        })
        .then((res) => res)
        .catch(() => null);

    if (!response) return null;

    return response;
};

export const seoApi = {
    getSeoMetadata: async (params: SEOParamsWithDebug): Promise<SEO | null> => {
        if (process.env.NODE_ENV === 'development') {
            return getSeoMetadataApi(params);
        }

        const { type, subtype, event, listing } = params.params;
        return getSeoMetadataApiCached(type, subtype, event, listing);
    },
    getSchemaMarkup: async ({
        params,
        debug,
    }: SEOParamsWithDebug): Promise<Record<string, string> | null> => {
        const hostname = await Headers.getHostname();
        const locale = await Headers.getExplicitLocale();

        const response = await apiService
            .get<Record<string, string>>(apiEndpoints.seo.schema(params), {
                headers: {
                    'x-website-domain': hostname,
                    ...(locale && { 'x-explicit-locale': locale }),
                },
                debug,
            })
            .then((res) => res)
            .catch(() => null);

        if (!response) return null;

        return response;
    },
};
