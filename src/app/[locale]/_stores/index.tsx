import { atom } from 'nanostores';

import Country from '@/interfaces/Country';

export const $userCountryFilter = atom<Country | null>(null);

export const setUserCountryFilter = (userCountryFilter?: Country | null) => {
    if (userCountryFilter) {
        $userCountryFilter.set(userCountryFilter);
    }
};
