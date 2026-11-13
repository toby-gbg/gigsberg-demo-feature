import {
    ParseError,
    parsePhoneNumberFromString,
    parsePhoneNumberWithError,
} from 'libphonenumber-js';

import { countriesByPrefix } from '@/constants/countries';

export const parsePhoneNumber = (rawPhone: string) => {
    try {
        const phone = parsePhoneNumberWithError(normalizedPhone(rawPhone)).formatInternational();
        return phone;
    } catch (error) {
        if (error instanceof ParseError) {
            console.error(error?.message);
        } else {
            console.error(error);
        }
        return rawPhone;
    }
};

export const normalizedPhone = (rawPhone: string) => {
    return rawPhone.startsWith('+') ? rawPhone : `+${rawPhone}`;
};

export const getInternationalNumber = (phone: string, prefix: string | null): string => {
    if (!phone) return '---';
    if (!prefix) return parsePhoneNumber(phone);

    const countryCode = countriesByPrefix.get(prefix)?.code;
    const parsedPhone = parsePhoneNumberFromString(phone, countryCode);

    return parsedPhone?.formatInternational() ?? phone;
};
