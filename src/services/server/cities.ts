import City from '@/interfaces/City';
import { FastifyPagination } from '@/interfaces/Fetch';
import Cache from '@/constants/cache';

import { apiService } from './base';
import { apiEndpoints } from './config';
import { getClientIp } from './ip';

export const cityApi = {
    async getCities(): Promise<City[]> {
        const response = await apiService.get<FastifyPagination<City>>(apiEndpoints.cities.base, {
            next: {
                revalidate: Cache.MAX,
                tags: ['states:all'],
            },
            cache: 'force-cache',
        });

        if (!response) return [];

        return response.rows;
    },

    async getCitiesExploreLocations({ limit }: { limit: number }): Promise<City[]> {
        const ip = await getClientIp();
        try {
            const response = await apiService.get<City[]>(apiEndpoints.cities.exploreLocations, {
                headers: {
                    'x-forwarded-for': ip,
                },
                params: { limit },
            });
            return response || [];
        } catch (error) {
            console.error('Explore Locations API failed:', error);
            return [];
        }
    },
};
