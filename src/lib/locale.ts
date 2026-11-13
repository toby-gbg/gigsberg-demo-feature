import { getPathname } from '@/i18n/routing';

import { prefixes } from '@/constants/locales';

type ChangeLocaleOptions = {
    targetLocale: string; // "en-GB"
    pathname: string; // "/entradas-deportivas/futbol" (no locale prefix)
    searchParams?: URLSearchParams | string; // "page=2"
    origin?: string; // undefined on localhost
};

export async function changeLocale({
    targetLocale,
    pathname,
    searchParams,
    origin,
}: ChangeLocaleOptions): Promise<void> {
    if (typeof window === 'undefined') return;

    // Step A – path for the new language
    // → "/entradas-deportivas/futbol" (en-GB is routing.defaultLocale, so no "/en";
    //   the server adds it with one redirect)
    const localizedPath = getPathname({ locale: targetLocale, href: pathname || '/' });

    // Step B – absolute URL
    // → "http://[domain]/entradas-deportivas/futbol"
    const base = (origin ?? window.location.origin).replace(/\/$/, '');
    const url = new URL(localizedPath, base);

    // Step C – keep the query string
    // → "http://[domain]/entradas-deportivas/futbol?page=2"
    if (searchParams) {
        const params =
            typeof searchParams === 'string' ? new URLSearchParams(searchParams) : searchParams;
        params.forEach((value, key) => url.searchParams.set(key, value));
    }

    // Step D – remember the choice
    // → cookie x-explicit-locale=en-GB (read by explicitLocaleMiddleware)
    await window.cookieStore.set({
        name: 'x-explicit-locale',
        value: targetLocale.split('-').length > 1 ? targetLocale.split('-')[0] : targetLocale,
        path: '/',
        expires: Date.now() + 365 * 24 * 60 * 60 * 1000,
    });

    // Step E – navigate, replacing the history entry
    // → server redirects to "/en/entradas-deportivas/futbol", then next-intl fixes the slug
    window.location.replace(url.toString());
}

export const prefixOf = (l: string) => prefixes[l] ?? `/${l}`;
