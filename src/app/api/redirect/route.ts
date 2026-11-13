import { NextRequest, NextResponse } from 'next/server';

function getRequestOrigin(request: NextRequest): string {
    const host = (request.headers.get('host') ?? request.nextUrl.host).split(',')[0]?.trim();
    const forwardedProto = request.headers.get('x-forwarded-proto');
    const protocol = (
        forwardedProto?.split(',')[0]?.trim() || request.nextUrl.protocol.replace(':', '')
    ).replace(':', '');

    if (host) return `${protocol}://${host}`;

    return request.nextUrl.origin;
}

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const token = searchParams.get('token');
    const redirect = searchParams.get('redirectUrl') || '/';
    const safeRedirect = redirect.startsWith('/') ? redirect : '/';
    const targetUrl = new URL(safeRedirect, getRequestOrigin(request));
    const response = NextResponse.redirect(targetUrl, 301);

    if (token) {
        response.cookies.set({
            name: 'te_co',
            value: token,
            httpOnly: false,
            path: '/',
            secure: process.env.NODE_ENV === 'production',
        });
    }

    return response;
}
