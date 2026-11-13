import { cache } from 'react';
import { cookies } from 'next/headers';
import { all } from 'better-all';

import Currency, { C } from '@/interfaces/Currency';
import { Domain } from '@/interfaces/WhiteLabel';
import { WHITE_LABEL_CONFIG } from '@/config/wlb';
import Headers from '@/lib/headers';
import Cache from '@/constants/cache';

import { apiService } from './base';
import { apiEndpoints } from './config';
import { ipApi } from './ip';

export const getCurrencyFromCookies = cache(async (): Promise<string> => {
    const { cookieStore, domainInfo } = await all({
        async cookieStore() {
            return cookies();
        },
        async domainInfo() {
            return Headers.getDomainInfo();
        },
    });

    const domain = domainInfo.hostname as Domain;

    const domainDefaultCurrency = domain
        ? WHITE_LABEL_CONFIG[domain]?.features?.defaultCurrencyCode
        : undefined;

    const rs =
        cookieStore.get('x-user-currency-code')?.value ??
        domainDefaultCurrency ??
        (await ipApi.getCountryIp())?.currency_code ??
        'USD';

    return rs;
});

export const currencyApi = {
    getCurrencies: cache(async (): Promise<C> => {
        const result = await apiService.get<Currency[]>(apiEndpoints.currencies, {
            next: {
                revalidate: Cache.MAX,
                tags: ['currencies:all'],
            },
            cache: 'force-cache',
        });

        if (!result) return {};

        const currencies: C = result.reduce((acc, city) => {
            acc[city.code] = city;
            return acc;
        }, {} as C);

        return currencies;
    }),
};
