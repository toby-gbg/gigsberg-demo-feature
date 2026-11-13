'use client';

import Cookies from 'js-cookie';

import Country from '@/interfaces/Country';
import { EXPIRES_IN, generateToken, verifyToken } from '@/lib/jsonwebtoken';

export const storeIpCountryInCookies = async (country: Country) => {
    const data = Cookies.get('x-user-country');

    if (data && (await verifyToken<Country>(data))?.id === country.id) return;

    const token = await generateToken({ ...country });

    const expiresInDays = EXPIRES_IN / 86400;

    Cookies.set('x-user-country', token, {
        expires: expiresInDays,
        secure: true,
        sameSite: 'strict',
    });
};

export const storeIpInCookies = async (ip: string) => {
    const expiresInDays = EXPIRES_IN / 86400;

    Cookies.set('x-user-ip', ip, {
        expires: expiresInDays,
        secure: true,
        sameSite: 'strict',
    });
};

export const storeCurrencyInCookies = async (currency: string) => {
    Cookies.set('x-user-currency-code', currency, {
        expires: 365,
        secure: true,
        sameSite: 'strict',
    });
};

export const storeWebsiteDomainInCookies = async (domain: string) => {
    const expiresInDays = EXPIRES_IN / 86400;

    Cookies.set('x-website-domain', domain, {
        expires: expiresInDays,
        secure: true,
        sameSite: 'strict',
    });
};
