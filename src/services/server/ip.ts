import { cache } from 'react';
import { cookies, headers } from 'next/headers';

import Country from '@/interfaces/Country';

import { apiService } from './base';
import { apiEndpoints } from './config';

export const getClientIp = async (): Promise<string> => {
    const headersList = await headers();
    const forwardedIp = headersList.get('x-forwarded-for')?.split(',')[0]?.trim();

    return (
        process.env.NEXT_PUBLIC_DEBUG_IP || forwardedIp || headersList.get('x-real-ip') || 'unknown'
    );
};

export const getLocaleFromCookies = async (): Promise<string | undefined> => {
    const cookieStore = await cookies();

    return cookieStore.get('USER_LOCALE')?.value;
};

export const ipApi = {
    getCountryIp: cache(async (): Promise<Country> => {
        const ip = await getClientIp();

        return apiService.get<Country>(apiEndpoints.ip, {
            ...(ip && {
                headers: {
                    'x-forwarded-for': ip,
                },
            }),
        });
    }),
};
