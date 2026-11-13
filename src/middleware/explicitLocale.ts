import { NextResponse } from 'next/server';

import { ProxyContext } from '@/interfaces/Middleware';
import { prefixOf } from '@/lib/locale';
import { findInLocales } from '@/utils/middleware';
import { LOCALE_EXCEPTION_PATHS } from '@/constants/locales';

// First URL segment → locale if it's a prefix ("en"), otherwise null ("entradas-deportivas")
const localeFromSegment = (segment: string | undefined, locales: string[]) =>
    segment ? (locales.find((l) => prefixOf(l) === `/${segment}`) ?? null) : null;

// Makes the URL's language prefix match the user's chosen language (cookie).
// Only the prefix; next-intl fixes the slug afterwards.
export async function explicitLocaleMiddleware(ctx: ProxyContext) {
    const { request } = ctx;
    const { nextUrl } = request;
    const { locales, defaultLocale } = ctx.i18n; // single source of truth
    const pathname = nextUrl.pathname;

    // 1. No cookie, or a language this domain doesn't offer → do nothing
    const cookieLocale = request.cookies.get('x-explicit-locale')?.value;
    if (!cookieLocale) return;

    const matchedLocale = findInLocales(locales, cookieLocale);
    if (!matchedLocale) return;

    // 2. Split URL into prefix and the rest: /en/tickets → "en-GB" + "/tickets"
    const segments = pathname.split('/').filter(Boolean);
    const urlLocale = localeFromSegment(segments[0], locales);
    const bare = urlLocale ? '/' + segments.slice(1).join('/') : pathname;

    // 3. Skip pages that manage their own language
    if (LOCALE_EXCEPTION_PATHS.some((p) => bare === p || bare.startsWith(`${p}/`))) return;

    // 4. Wanted URL: default language has no prefix, others do
    const prefix = matchedLocale === defaultLocale ? '' : prefixOf(matchedLocale);

    const newPathname = prefix + (bare === '/' ? '' : bare) || '/';

    // Already correct → stop (this is what prevents loops)
    if (newPathname === pathname) return;

    // 5. Redirect once, keeping the query string
    const url = nextUrl.clone();
    url.pathname = newPathname;

    const res = NextResponse.redirect(url, 307); // temporary: depends on the cookie
    res.headers.set('Cache-Control', 'no-store'); // never cache a cookie-dependent redirect
    return res;
}
