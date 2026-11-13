import { all } from 'better-all';

import { currencyApi, getCurrencyFromCookies } from '@/services/server/currencies';

import MainCurrencyClient from './MainCurrencyClient';

interface HeaderCurrencySelectProps {
    mode?: 'burger' | 'normal';
    onClick?: () => void;
    mobileOnly?: boolean;
}

export default async function MainCurrency(props: HeaderCurrencySelectProps) {
    const { currencyCode, currencies } = await all({
        async currencyCode() {
            return getCurrencyFromCookies();
        },
        async currencies() {
            return currencyApi.getCurrencies();
        },
    });

    return (
        <MainCurrencyClient
            {...props}
            currencies={currencies ?? {}}
            currencyCode={currencyCode ?? 'USD'}
        />
    );
}
