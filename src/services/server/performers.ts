import PopularPerformer, { FansAlsoLike, FansAlsoLikeRequest } from '@/interfaces/Performer';

import { apiService } from './base';
import { apiEndpoints } from './config';
import { getUserToken } from './users';

export const performerApi = {
    async getPopularPerformers(): Promise<PopularPerformer[]> {
        const response = await apiService.get<PopularPerformer[]>(apiEndpoints.performers.popular);

        if (!response) return [];

        return response;
    },

    async getFansAlsoLike(params: FansAlsoLikeRequest): Promise<FansAlsoLike> {
        if (!params.performerId) return {};

        const token = await getUserToken();

        const response = await apiService.get<FansAlsoLike>(
            apiEndpoints.performers.fansAlsoLike(params),
            {
                headers: {
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
            }
        );
        return response;
    },
};
