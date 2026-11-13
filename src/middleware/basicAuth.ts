import { NextResponse } from 'next/server';

import { MiddlewareResult, ProxyContext } from '@/interfaces/Middleware';

const ignorePathnames = ['/api/health', '/healthcheck'];

export async function basicAuthMiddleware(ctx: ProxyContext): Promise<MiddlewareResult> {
    const {
        request,
        headers: { isProtectedDomain },
    } = ctx;

    // Ignore unprotected domain
    if (!isProtectedDomain) return;

    // Bypass for health checks
    if (ignorePathnames.includes(request.nextUrl.pathname)) return;

    const auth = request.headers.get('authorization');

    if (!auth) {
        return new NextResponse('Authentication required', {
            status: 401,
            headers: {
                'WWW-Authenticate': 'Basic realm="Restricted Area"',
            },
        });
    }

    const [scheme, encoded] = auth.split(' ');

    if (scheme === 'Basic' && encoded) {
        const [user, pass] = Buffer.from(encoded, 'base64').toString().split(':');

        if (user === process.env.BASIC_AUTH_USER && pass === process.env.BASIC_AUTH_PASS) {
            return;
        }
    }

    return new NextResponse('Authentication required', {
        status: 401,
        headers: {
            'WWW-Authenticate': 'Basic realm="Restricted Area"',
        },
    });
}
