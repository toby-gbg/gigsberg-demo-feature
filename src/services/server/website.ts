import { cache } from 'react';

import Website, { PrimaryAffiliate } from '@/interfaces/Website';
import Headers from '@/lib/headers';
import Cache from '@/constants/cache';

import { apiService } from './base';
import { apiEndpoints } from './config';

export const websiteApi = {
    getWebsite: cache(async (): Promise<Website> => {
        const hostname = await Headers.getHostname();

        const result = await apiService.get<Website>(apiEndpoints.website.detail(hostname), {
            next: {
                revalidate: Cache.MAX,
                tags: [`website:${hostname}`],
            },
        });

        return result;
    }),

    async getPrimaryAffiliates(): Promise<PrimaryAffiliate[]> {
        const hostname = await Headers.getHostname();
        const locale = await Headers.getExplicitLocale();

        return apiService.get(apiEndpoints.website.primaryAffiliates, {
            headers: {
                'x-website-domain': hostname,
                ...(locale && { 'x-explicit-locale': locale }),
            },
        });
    },
};
