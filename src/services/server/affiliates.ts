import Affiliate, { AffiliateTrackVisit } from '@/interfaces/Affiliate';
import Cache from '@/constants/cache';

import { apiService } from './base';
import { apiEndpoints } from './config';
import { NotFoundError } from './types/errors';

export const affiliateApi = {
    async getAffiliate(name: string): Promise<Affiliate | null> {
        try {
            return await apiService.get(apiEndpoints.affiliates.index, {
                params: {
                    name: encodeURIComponent(name),
                },
                next: {
                    revalidate: Cache.MAX,
                    tags: [`affiliates:${name}`],
                },
                cache: 'force-cache',
            });
        } catch (error) {
            if (error instanceof NotFoundError) return null;
            throw error;
        }
    },

    postAffiliateTrackVisit(body: AffiliateTrackVisit): Promise<void> {
        return apiService.post(apiEndpoints.affiliates.track, body, {
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });
    },
};
