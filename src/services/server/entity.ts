import { cache } from 'react';

import EntityMetadata from '@/interfaces/entity/EntityMetadata';
import Headers from '@/lib/headers';
import { removeTicketsSuffix } from '@/utils/common';

import { apiService } from './base';
import { apiEndpoints } from './config';
import { getClientIp } from './ip';
import { RequestDebugOptions } from './types';

type EntityMetadataParams = {
    url: string;
    type: string;
    subtype: string;
    debug?: RequestDebugOptions;
};

const getEntityMetadataApi = async ({
    url,
    type,
    subtype,
    debug,
}: EntityMetadataParams): Promise<EntityMetadata | null> => {
    if (url.length > 120) return null;

    const hostname = await Headers.getHostname();
    const locale = await Headers.getExplicitLocale();
    const ip = await getClientIp();

    const nameUrl = removeTicketsSuffix(url);

    return apiService
        .get<EntityMetadata>(apiEndpoints.entity.metadata, {
            params: {
                nameUrl,
                typeNameUrl: removeTicketsSuffix(type),
                subtypeNameUrl: subtype,
            },
            headers: {
                'x-website-domain': hostname,
                'x-forwarded-for': ip,
                ...(locale && { 'x-explicit-locale': locale }),
            },
            debug,
        })
        .then((res) => res)
        .catch(() => null);
};

const getEntityMetadataApiCached = cache(
    async (url: string, type: string, subtype: string): Promise<EntityMetadata | null> =>
        getEntityMetadataApi({ url, type, subtype })
);

export const entityApi = {
    getEntityMetadata: async (params: EntityMetadataParams): Promise<EntityMetadata | null> => {
        if (process.env.NODE_ENV === 'development') {
            return getEntityMetadataApi(params);
        }

        const { url, type, subtype } = params;
        return getEntityMetadataApiCached(url, type, subtype);
    },
};
