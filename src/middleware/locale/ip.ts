import { MiddlewareResult, ProxyContext } from '@/interfaces/Middleware';
import { findInLocales, redirectToPath } from '@/utils/middleware';
import { ipApi } from '@/services/server/ip';
import { LOCALE_EXCEPTION_PATHS, prefixes } from '@/constants/locales';

/**
 * Redirect to user's locale based on IP address
 */
export async function ipMiddleware(ctx: ProxyContext): Promise<MiddlewareResult> {
    const {
        request,
        i18n: { locales, defaultLocale },
    } = ctx;

    const pathname = request.nextUrl.pathname;
    const urlLocale = pathname.split('/').filter(Boolean)[0];
    const localeCookie = request.cookies.get('x-explicit-locale')?.value;

    if (LOCALE_EXCEPTION_PATHS.some((path) => pathname.startsWith(path))) {
        return;
    }

    if (localeCookie || findInLocales(locales, urlLocale)) {
        return;
    }

    //only do this when it's the first time user logs on
    const { language_code } = (await ipApi.getCountryIp()) || {};

    if (!language_code) return;

    //if current language matches default locale, don't do anything
    if (language_code.split('-')[0] === defaultLocale.split('-')[0]) return;

    const matched = findInLocales(locales, language_code);

    if (!matched) return;

    //the code returned from BE could be en-GB so we need to match into en instead
    const localePrefix = prefixes[matched] || `/${matched}`;
    const targetPath = `${localePrefix}${pathname === '/' ? '' : pathname}`;
    return redirectToPath(request, targetPath);
}
