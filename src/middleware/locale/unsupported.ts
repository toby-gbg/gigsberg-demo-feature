import { MiddlewareResult, ProxyContext } from '@/interfaces/Middleware';
import { findInLocales, redirectToPath } from '@/utils/middleware';
import locales from '@/constants/locales';

/**
 * Redirect to homepage for unsupported locales (for example .co.uk)
 */
export async function unsupportedLocalesMiddleware(ctx: ProxyContext): Promise<MiddlewareResult> {
    const {
        request,
        config,
        i18n: { locales: domainLocales },
    } = ctx;

    const pathname = request.nextUrl.pathname;
    const urlLocale = pathname.split('/').filter(Boolean)[0];

    //If the page is not a using locale => return
    const usingLocaleInUrl = findInLocales(locales, urlLocale);
    if (!usingLocaleInUrl) return;

    //If doesn't need to redirect => return
    const redirectUnsupportedLocalesToHome = config?.features?.redirectUnsupportedLocalesToHome;
    if (!redirectUnsupportedLocalesToHome) return;

    const isSupportedOnDomain = Boolean(
        urlLocale && domainLocales.some((locale) => locale.includes(urlLocale))
    );
    if (!isSupportedOnDomain) {
        return redirectToPath(request, '/');
    }
}
