import { NextRequest } from 'next/server';

import { authMiddleware } from './middleware/auth';
import { basicAuthMiddleware } from './middleware/basicAuth';
import { createProxyContext } from './middleware/context';
import { initBrowserSession, persistBrowserSession } from './middleware/debugSession';
import { decorateResponse, decorateTrackingParams } from './middleware/decorateResponse';
import { defaultLocaleMiddleware } from './middleware/defaultLocale';
import { explicitLocaleMiddleware } from './middleware/explicitLocale';
import { i18nMiddleware } from './middleware/i18n';
import { listingMiddleware } from './middleware/listing';
import { ipMiddleware } from './middleware/locale/ip';
import { unsupportedLocalesMiddleware } from './middleware/locale/unsupported';
import { executePipeline } from './middleware/pipeline';

export default async function proxy(request: NextRequest) {
    // Initialize once, before any API calls
    const sid = initBrowserSession(request);

    const ctx = await createProxyContext(request);

    const redirect = await executePipeline(ctx, [
        basicAuthMiddleware, // Basic auth for protected domain
        listingMiddleware, // Redirection logic for listing page
        authMiddleware, // Login modal
        unsupportedLocalesMiddleware, //Handle unsupported locales
        ipMiddleware, //Handle ip detection for first-time users
        explicitLocaleMiddleware, // Handle explicit language change and keep it persist
        defaultLocaleMiddleware, //Interject a permanent redirect to default locale paths
    ]);

    if (redirect) {
        decorateTrackingParams(redirect, ctx);
        return persistBrowserSession(request, redirect, sid);
    }

    // next-intl routing
    const response = i18nMiddleware(ctx);

    // Set params to headers and cookies
    await decorateResponse(response, ctx);
    decorateTrackingParams(response, ctx);

    return persistBrowserSession(request, response, sid);
}

export const config = {
    matcher: [
        '/((?!api|healthcheck|files|_next|.well-known|.*\\..*).*)',
        '/:path*/com.chrome.devtools.json',
        '/files/images/:path*',
        '/gigs_ad_sys_911/:path*',
    ],
};
