import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export const SESSION_COOKIE = 'sid';

export function initBrowserSession(request: NextRequest) {
    const sid = request.cookies.get(SESSION_COOKIE)?.value ?? crypto.randomUUID();

    // Make sid available during this request
    request.headers.set('x-session-id', sid);

    return sid;
}

export function persistBrowserSession(request: NextRequest, response: NextResponse, sid: string) {
    if (!request.cookies.get(SESSION_COOKIE)) {
        response.cookies.set(SESSION_COOKIE, sid, {
            httpOnly: false,
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 1,
        });
    }

    return response;
}
