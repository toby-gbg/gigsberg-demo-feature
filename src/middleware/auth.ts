import { NextResponse } from 'next/server';

import { MiddlewareResult, ProxyContext } from '@/interfaces/Middleware';
import Session from '@/lib/session';
import { returnPathFromNavigation } from '@/utils/authNavigation';

export async function authMiddleware(ctx: ProxyContext): Promise<MiddlewareResult> {
    const session = new Session(ctx.request);

    if (!(await session.shouldProtect())) return;

    const currentPath = ctx.request.nextUrl.pathname + ctx.request.nextUrl.search;
    const locale = ctx.locale || 'en';

    const loginUrl = new URL(`/${locale}/login`, ctx.request.nextUrl);
    // Followed only after a successful sign-in.
    loginUrl.searchParams.set('redirectUrl', currentPath);

    // Page the user was on before the protected route. Closing login returns here
    // instead of following redirectUrl, which would bounce them back to login.
    const returnPath = returnPathFromNavigation(
        ctx.request.headers.get('referer'),
        ctx.request.headers.get('next-url'),
        ctx.request.nextUrl.origin
    );
    if (returnPath) loginUrl.searchParams.set('returnUrl', returnPath);

    return NextResponse.redirect(loginUrl, 302);
}
