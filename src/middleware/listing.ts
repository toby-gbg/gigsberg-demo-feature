import { NextResponse } from 'next/server';

import { MiddlewareResult, ProxyContext } from '@/interfaces/Middleware';
import { eventApi } from '@/services/server/events';
import { ipApi } from '@/services/server/ip';

export async function listingMiddleware(ctx: ProxyContext) {
    const response = await redirectToCom(ctx);

    if (response) return response;

    return redirectToCoUk(ctx);
}

// Redirect to international site (.com) if the event country is not supported,
// or if the event is a UK football match (which is restricted under UK resale laws)
export async function redirectToCom(ctx: ProxyContext): Promise<MiddlewareResult> {
    const { listing, type, subtype, event } = ctx.path;

    if (!listing || !type || !subtype || !event) return;

    const onlySupportedCountryCodes = ctx.config?.features?.onlySupportedCountryCodes;

    if (!onlySupportedCountryCodes?.length) return;

    const metadata = await eventApi.getEventMetadata({
        query: listing,
        type,
        subtype,
        event,
    });

    if (!metadata) return;

    const isFootball = metadata.subtype_name_url === 'football';

    const isSupportedCountry = onlySupportedCountryCodes.includes(metadata.event_country_code);

    if (!isSupportedCountry || (metadata.event_country_code === 'GB' && isFootball)) {
        return NextResponse.redirect(ctx.headers.comUrl, 301);
    }
}

// Redirects GB users browsing GB events to the co.uk domain
// Bypasses if:
//    - Already on co.uk
//    - Has affiliate params on url
//    - Feature flag is disabled
export async function redirectToCoUk(ctx: ProxyContext): Promise<MiddlewareResult> {
    const {
        headers: { coUkUrl, publicSuffix },
        affiliate: { hasParam, hasCookie },
        path: { type, subtype, event, listing },
        config,
    } = ctx;

    if (!config?.features?.redirectUkUserAndEventToCoUk) return;

    if (publicSuffix === 'co.uk') return;

    if (hasParam || hasCookie) return;

    if (!listing || !type || !subtype || !event) return;

    const country = await ipApi.getCountryIp();
    if (country?.code !== 'GB') return;

    const metadata = await eventApi.getEventMetadata({ query: listing, type, subtype, event });
    if (metadata?.event_country_code !== 'GB') return;
    if (metadata.subtype_name_url === 'football') return;

    return NextResponse.redirect(coUkUrl, 301);
}
