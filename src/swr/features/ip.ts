import useSWR from 'swr';

import Country from '@/interfaces/Country';
import { storeIpCountryInCookies } from '@/utils/cookies';
import { apiEndpoints } from '@/services/server/config';

import { fetcher } from '../fetcher';
import { ErrorResponse } from '../types';

export function useIpCountry(fallbackData?: Country | null) {
    return useSWR<Country, ErrorResponse, string>(
        apiEndpoints.ip,
        async (url) => {
            const country = await fetcher<Country>(url, { method: 'GET' });

            await storeIpCountryInCookies(country);

            return country;
        },
        {
            fallbackData: fallbackData ?? undefined,
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
        }
    );
}
