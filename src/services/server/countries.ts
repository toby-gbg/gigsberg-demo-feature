import Country from '@/interfaces/Country';
import { FastifyPagination } from '@/interfaces/Fetch';
import { DEFAULT_LARGE_SIZE } from '@/constants/pagination';

import { apiService } from './base';
import { apiEndpoints } from './config';

export const countryApi = {
    async getCountries(): Promise<Country[]> {
        const result = await apiService.get<FastifyPagination<Country>>(apiEndpoints.countries, {
            params: {
                pageSize: DEFAULT_LARGE_SIZE,
            },
        });

        if (!result) return [];

        return result.rows;
    },
};
