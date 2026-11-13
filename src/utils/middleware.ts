import { NextResponse } from 'next/server';

import { MiddlewareResult, ProxyContext } from '@/interfaces/Middleware';
import locales from '@/constants/locales';

export function redirectToPath(
    request: ProxyContext['request'],
    pathname: string
): MiddlewareResult {
    const url = request.nextUrl.clone();
    url.pathname = pathname;

    return NextResponse.redirect(url, 301);
}

export const findInLocales = (locales: string[], target: string) => {
    if (!target?.length) return false;

    return locales.find(
        (locale) => locale.split('-')[0].toLowerCase() === target.split('-')[0].toLowerCase()
    );
};

export function getLocaleFromPath(pathname: string) {
    const segment = pathname.split('/')[1];
    return findInLocales(
        locales.map((l) => l.split('-')[0]),
        segment
    )
        ? segment
        : null;
}
