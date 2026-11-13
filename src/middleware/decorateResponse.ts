import { NextResponse } from 'next/server';

import { ProxyContext } from '@/interfaces/Middleware';
import { currencyApi } from '@/services/server/currencies';
import { AFFILIATE_COOKIE_DAYS } from '@/constants/affiliates';
import {
    CJ_EVENT_COOKIE_MAX_AGE,
    CJ_EVENT_PARAM,
    CLICK_TRANSACTION_PARAMS,
    TRACKING_COOKIE_MAX_AGE,
    TRACKING_PARAMS,
} from '@/constants/checkout';

export async function decorateResponse(response: NextResponse, ctx: ProxyContext) {
    decorateHeaders(response, ctx);
    decorateAffiliate(response, ctx);
    decorateSeo(response, ctx);
    await decorateCurrency(response, ctx);
}

export function decorateTrackingParams(response: NextResponse, ctx: ProxyContext) {
    //cje cookie
    const cjEventId = ctx.request.nextUrl.searchParams.get(CJ_EVENT_PARAM);
    if (cjEventId) {
        response.cookies.set('cje', cjEventId, {
            maxAge: CJ_EVENT_COOKIE_MAX_AGE,
            path: '/',
            sameSite: 'none',
            secure: true,
        });
    }

    //Other tracking cookies
    const clickTransactionId = CLICK_TRANSACTION_PARAMS.map((param) =>
        ctx.request.nextUrl.searchParams.get(param)
    ).find(Boolean);

    if (clickTransactionId) {
        response.cookies.set('clickTransactionId', clickTransactionId, {
            maxAge: TRACKING_COOKIE_MAX_AGE,
            path: '/',
            sameSite: 'lax',
            secure: true,
        });
    }

    TRACKING_PARAMS.forEach((param) => {
        const value =
            ctx.request.nextUrl.searchParams.get(param) ||
            (param === 'utm_source' && cjEventId ? 'cj' : null);
        if (!value) return;

        response.cookies.set(param, value, {
            maxAge: TRACKING_COOKIE_MAX_AGE,
            path: '/',
            sameSite: 'lax',
            secure: true,
        });
    });
}

function decorateHeaders(response: NextResponse, ctx: ProxyContext) {
    const { pathname, currentUrl, hostname } = ctx.headers;

    response.headers.set('x-pathname', pathname);
    response.headers.set('x-url', currentUrl);
    response.headers.set('x-website-domain', hostname);
}

function decorateAffiliate(response: NextResponse, ctx: ProxyContext) {
    if (!ctx.affiliate.hasParam) return;

    response.cookies.set('x-aff-session', '1', {
        maxAge: 60 * 60 * 24 * AFFILIATE_COOKIE_DAYS,
        path: '/',
        sameSite: 'lax',
        secure: true,
    });
}

function decorateSeo(response: NextResponse, ctx: ProxyContext) {
    if (!ctx.config?.seo?.robots?.noindexHeader) return;

    response.headers.set('x-robots-tag', 'noindex, nofollow');
}

async function decorateCurrency(response: NextResponse, ctx: ProxyContext) {
    const currency = ctx.request.nextUrl.searchParams.get('currency')?.toUpperCase();
    if (!currency) return;

    const currencies = await currencyApi.getCurrencies();
    const findCurrency = (currencies ?? {})[currency]?.code ?? undefined;

    if (!findCurrency) return;

    response.cookies.set('x-user-currency-code', findCurrency, {
        maxAge: 60 * 60 * 24 * 365,
        path: '/',
        sameSite: 'strict',
        secure: true,
    });
}
