import { FastifyPagination } from '@/interfaces/Fetch';
import MobileTicketApp from '@/interfaces/MobileTicketApp';
import Cache from '@/constants/cache';
import { DEFAULT_LARGE_SIZE } from '@/constants/pagination';

import { apiService } from './base';
import { apiEndpoints } from './config';

export const mobileAppTicketApi = {
    async getMobileAppTickets(): Promise<MobileTicketApp[]> {
        const result = await apiService.get<FastifyPagination<MobileTicketApp>>(
            apiEndpoints.mobileAppTickets,
            {
                params: {
                    pageSize: DEFAULT_LARGE_SIZE,
                },
                next: {
                    revalidate: Cache.MAX,
                    tags: [`mobile-app-tickets:all`],
                },
                cache: 'force-cache',
            }
        );

        if (!result) return [];

        return result.rows;
    },
};
