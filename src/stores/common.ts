import { atom } from 'nanostores';

import Country from '@/interfaces/Country';
import { DomainInfo } from '@/interfaces/Header';
import { storeIpCountryInCookies } from '@/utils/cookies';

export const $domainInfo = atom<DomainInfo | null>(null);
export const $userCountry = atom<Country | null>(null);

export const setUserCountry = (userCountry?: Country | null) => {
    if (userCountry) {
        storeIpCountryInCookies(userCountry);
        $userCountry.set(userCountry);
    }
};

export const $requestedCurrency = atom<string | null>(null);

export const setRequestedCurrency = (code: string | null) => {
    $requestedCurrency.set(code);
};
