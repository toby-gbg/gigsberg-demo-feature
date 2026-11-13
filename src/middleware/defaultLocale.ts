// middleware/defaultLocale.ts
import { NextResponse } from 'next/server';

import { ProxyContext } from '@/interfaces/Middleware';
import { prefixOf } from '@/lib/locale';

/**
 * The default locale is served without a prefix (localePrefix: 'as-needed').
 * If someone requests the default locale WITH its prefix, redirect to the
 * prefix-less URL, which is the canonical one for SEO.
 *
 * ctx.i18n.defaultLocale is the single source of truth. It must be the same
 * value explicitLocaleMiddleware and i18nMiddleware read; proxy.ts overrides
 * it from `defaultLocales` for known domains.
 */
export async function defaultLocaleMiddleware(ctx: ProxyContext) {
    const {
        request: { nextUrl },
        i18n: { defaultLocale },
    } = ctx;

    const defaultPrefix = prefixOf(defaultLocale); // e.g. "/es" on marca, "/en" on gigsberg

    const pathname = nextUrl.pathname;

    // Match the whole first segment only, so "/espana" is never treated as "/es"
    const isDefaultPrefixed =
        pathname === defaultPrefix || pathname.startsWith(`${defaultPrefix}/`);
    if (!isDefaultPrefixed) return;

    const url = nextUrl.clone(); // keeps the query string
    url.pathname = pathname.slice(defaultPrefix.length) || '/';

    const res = NextResponse.redirect(url, 308);

    // Still "permanent" for search engines, but never stored by the browser.
    res.headers.set('Cache-Control', 'no-store');

    return res;
}
