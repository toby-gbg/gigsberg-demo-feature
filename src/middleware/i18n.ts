import { routing } from '@/i18n/routing';
import createMiddleware from 'next-intl/middleware';

import { ProxyContext } from '@/interfaces/Middleware';
import { getPathnamesForDomain } from '@/utils/sitemap';

export function i18nMiddleware(ctx: ProxyContext) {
    const {
        request,
        headers: { hostname },
        i18n: { locales, defaultLocale },
    } = ctx;

    const host = (hostname || request.nextUrl.hostname).split(':')[0].replace(/^www\./, '');
    const domainBasedPathnames = getPathnamesForDomain(host);
    const handleI18nRouting = createMiddleware({
        ...routing,
        locales,
        defaultLocale, // domain default (es-ES on Marca)
        pathnames: domainBasedPathnames,
    });
    const response = handleI18nRouting(request);
    return response;
}
