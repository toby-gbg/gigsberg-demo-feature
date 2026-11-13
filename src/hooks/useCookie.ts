'use client';

import Cookies from 'js-cookie';

import { generateToken, TokenPayload, verifyToken } from '@/lib/jsonwebtoken';

type CookieOptions = Cookies.CookieAttributes;

export default function useCookie<T>(name: string) {
    const setEncryptedCookie = async (newValue: T, options?: CookieOptions) => {
        const token = await generateToken({ ...newValue } as TokenPayload<T>);
        Cookies.set(name, token, options);
    };

    const deleteCookie: () => void = () => Cookies.remove(name);

    const getCookie = () => Cookies.get(name);

    const setCookie = (value: T, options?: CookieOptions) =>
        Cookies.set(name, JSON.stringify(value), options);

    const existsCookie = () => Boolean(Cookies.get(name));

    const getEncryptedCookie = async (): Promise<T | null> => {
        const token = getCookie();
        if (!token) return null;

        try {
            const decoded = await verifyToken<T>(token);
            return decoded ?? null;
        } catch (error) {
            console.error('Invalid cookie token', error);
            return null;
        }
    };

    return {
        getEncryptedCookie,
        setEncryptedCookie,
        deleteCookie,
        getCookie,
        setCookie,
        existsCookie,
    };
}
