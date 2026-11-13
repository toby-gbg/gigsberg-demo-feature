import State from '@/interfaces/State';
import Cache from '@/constants/cache';

import { apiService } from './base';
import { apiEndpoints } from './config';

export const stateApi = {
    async getStates(): Promise<State[]> {
        const response = await apiService.get<State[]>(apiEndpoints.states, {
            next: {
                revalidate: Cache.MAX,
                tags: ['states:all'],
            },
            cache: 'force-cache',
        });

        if (!response) return [];

        return response;
    },
};
