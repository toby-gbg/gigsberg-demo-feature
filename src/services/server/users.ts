import { cache } from 'react';
import { cookies } from 'next/headers';

import Address from '@/interfaces/Address';
import { FastifyPagination } from '@/interfaces/Fetch';
import User from '@/interfaces/User';
import { DEFAULT_LARGE_SIZE } from '@/constants/pagination';

import { apiService } from './base';
import { apiEndpoints } from './config';

export const getUserToken = async (): Promise<string | undefined> => {
    const cookieStore = await cookies();
    return cookieStore.get('te_co')?.value;
};

export const userApi = {
    getCurrentUser: cache(async (): Promise<User | null> => {
        const token = await getUserToken();

        if (!token) return null;

        return apiService
            .get<User>(apiEndpoints.users.current, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => res)
            .catch(() => null);
    }),
    getUserAddresses: cache(async (): Promise<Address[]> => {
        const token = await getUserToken();

        if (!token) return [];

        return apiService
            .get<FastifyPagination<Address>>(apiEndpoints.users.addresses, {
                params: { pageSize: DEFAULT_LARGE_SIZE },
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => res?.rows || [])
            .catch(() => []);
    }),
};
