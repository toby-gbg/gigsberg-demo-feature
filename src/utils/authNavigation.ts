import locales, { prefixes } from '@/constants/locales';
import { isProtectedPath } from '@/constants/routes/auth';

/**
 * Where to send someone who closes login, register, or reset-password.
 *
 * Do not use the browser Back button. Back can open YouTube, and JavaScript
 * cannot see that. Only open a URL we have already checked.
 *
 * 1. returnUrl   — page they were on before we sent them to login
 * 2. redirectUrl — page they wanted, unless logged-out users cannot open it
 * 3. referrer    — previous page, if it is our site and not an auth page
 * 4. home        — /en, never the internal code /en-GB
 *
 * Logged-out users cannot open /login, /register, /reset-password,
 * /otp-password, /sell-ticket, or /account-settings. Sending them there
 * opens login again.
 */

const AUTH_PAGES = ['/login', '/register', '/reset-password', '/otp-password'];

/** `en-GB` and `en` both become `/en`. Unknown values become `/<value>`. */
function publicPrefix(localeOrSegment: string): string {
    const key = localeOrSegment.replace(/^\//, '').toLowerCase();

    const byCode = locales.find((locale) => locale.toLowerCase() === key);
    if (byCode) return prefixes[byCode] ?? `/${byCode}`;

    const byPrefix = locales.find(
        (locale) => (prefixes[locale] ?? `/${locale}`).toLowerCase() === `/${key}`
    );
    if (byPrefix) return prefixes[byPrefix] ?? `/${byPrefix}`;

    return prefixes[localeOrSegment] ?? `/${localeOrSegment}`;
}

function isKnownLocaleSegment(segment: string): boolean {
    const key = segment.toLowerCase();
    return locales.some(
        (locale) =>
            locale.toLowerCase() === key ||
            (prefixes[locale] ?? `/${locale}`).toLowerCase() === `/${key}`
    );
}

/** Homepage. `en-GB` → `/en`. */
export function publicLocaleHome(locale: string): string {
    return publicPrefix(locale);
}

/** `/en-GB/sell-ticket` → `/en/sell-ticket`. Other paths stay as they are. */
export function toPublicLocalePath(path: string): string {
    let url: URL;
    try {
        url = new URL(path, 'https://internal.local');
    } catch {
        return path;
    }

    const [first, ...rest] = url.pathname.split('/').filter(Boolean);
    if (!first || !isKnownLocaleSegment(first)) return `${url.pathname}${url.search}`;

    const pathname = [publicPrefix(first), ...rest].join('/');
    return `${pathname}${url.search}`;
}

function isBlockedWhileLoggedOut(pathname: string): boolean {
    return isProtectedPath(pathname) || AUTH_PAGES.some((route) => pathname.includes(route));
}

/**
 * A path on our site that a logged-out user can open.
 * Rejects full URLs (`https://evil.com`) and auth pages (`/sell-ticket`).
 */
function safePath(raw: string | null | undefined): string | null {
    if (!raw) return null;

    let decoded = raw;
    try {
        decoded = decodeURIComponent(raw);
    } catch {
        return null;
    }

    if (!decoded.startsWith('/') || decoded.startsWith('//') || decoded.includes('\\')) return null;
    if (decoded.includes('://')) return null;

    let url: URL;
    try {
        url = new URL(decoded, 'https://internal.local');
    } catch {
        return null;
    }

    if (url.origin !== 'https://internal.local') return null;
    if (isBlockedWhileLoggedOut(url.pathname)) return null;

    return toPublicLocalePath(`${url.pathname}${url.search}`);
}

/** Referrer path, only when it is our site and safe to reopen. */
function referrerPath(referrer: string | null, origin: string): string | null {
    if (!referrer) return null;

    try {
        const url = new URL(referrer);
        if (url.origin !== origin) return null;
        return safePath(`${url.pathname}${url.search}`);
    } catch {
        return null;
    }
}

/** Page to return to after closing login. null means "go home". */
function exitPath(
    searchParams: { get(name: string): string | null } | null | undefined,
    referrer: string,
    origin: string
): string | null {
    // Extra-info login: closing the popup must go home, not back into the form.
    if (searchParams?.get('closeTo') === 'home') return null;

    const returnUrl = safePath(searchParams?.get('returnUrl'));
    if (returnUrl) return returnUrl;

    const redirectUrl = searchParams?.get('redirectUrl');
    const redirectPath = safePath(redirectUrl);
    if (redirectPath) return redirectPath;

    // redirectUrl was /sell-ticket or another blocked page. Do not fall through
    // to the referrer — that is often the blocked page, or YouTube.
    if (redirectUrl) return null;

    return referrerPath(referrer, origin);
}

/** Middleware: remember the page the user was on before login. */
export function returnPathFromNavigation(
    referer: string | null,
    nextUrl: string | null,
    origin: string
): string | null {
    return referrerPath(referer, origin) ?? safePath(nextUrl);
}

let exitStarted = false;

/** Stop the close handler from navigating again after a successful sign-in. */
export function markAuthExitStarted(): void {
    exitStarted = true;
}

/** Close an auth screen. Never calls history.back(). */
export function navigateAuthExit(
    locale: string,
    searchParams?: { get(name: string): string | null } | null,
    options?: { force?: boolean }
): void {
    if (exitStarted && !options?.force) return;
    exitStarted = true;

    const path =
        exitPath(searchParams, document.referrer, window.location.origin) ??
        publicLocaleHome(locale);

    window.location.replace(path);
}
