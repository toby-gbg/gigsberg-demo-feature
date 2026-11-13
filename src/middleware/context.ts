import { NextRequest } from 'next/server';
import { routing } from '@/i18n/routing';

import { ProxyContext } from '@/interfaces/Middleware';
import Headers from '@/lib/headers';
import Path from '@/lib/path';
import { TRACKING_SOURCES } from '@/constants/affiliates';
import { defaultLocales } from '@/constants/locales';

const checkAffParam = (searchParams: URLSearchParams): boolean =>
    searchParams.has('aff') ||
    searchParams.has('utm_source') ||
    TRACKING_SOURCES.some(({ param }) => searchParams.has(param));

export async function createProxyContext(request: NextRequest): Promise<ProxyContext> {
    const headers = new Headers(request);

    const { config, hostname } = headers;

    const path = new Path(request);

    // Check affiliate params
    const hasParam = checkAffParam(request.nextUrl.searchParams);
    const hasCookie = request.cookies.has('x-aff-session');

    // Default locales by domain
    const locales = defaultLocales[hostname || request.nextUrl.hostname] || routing.locales;
    const defaultLocale =
        defaultLocales[hostname || request.nextUrl.hostname]?.[0] || routing.defaultLocale;

    return {
        request,
        headers,
        path,
        config,
        affiliate: {
            hasParam,
            hasCookie,
        },
        i18n: {
            defaultLocale,
            locales,
        },
    };
}
