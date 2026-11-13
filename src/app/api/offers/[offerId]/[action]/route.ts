import { NextRequest, NextResponse } from 'next/server';

type RouteParams = {
    params: Promise<{
        offerId: string;
        action: string;
    }>;
};

const ALLOWED_ACTIONS = new Set(['accept', 'reject']);

/**
 * Cluster DNS values are often set without a scheme
 * (e.g. "fastify.gigsberg.svc.cluster.local"). Node's URL() requires one.
 */
function normalizeBaseUrl(raw: string): string {
    const trimmed = raw.replace(/\/$/, '');
    if (!trimmed) return '';
    // Only treat real http(s) URLs as already schemed. A host:port value like
    // "fastify:3000" must still get http:// prepended.
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `http://${trimmed}`;
}

function fastifyBaseUrl(): string {
    const internal = process.env.API_BASE_URL?.trim();
    if (internal) return normalizeBaseUrl(internal);

    return normalizeBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL || '');
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    const { offerId, action } = await params;
    const token = request.nextUrl.searchParams.get('token') || '';

    if (!ALLOWED_ACTIONS.has(action)) {
        return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }

    if (!offerId || !token) {
        return NextResponse.json({ message: 'Missing offer details' }, { status: 400 });
    }

    const baseUrl = fastifyBaseUrl();
    if (!baseUrl) {
        return NextResponse.json({ message: 'API base URL is not configured' }, { status: 500 });
    }

    try {
        const upstream = new URL(`${baseUrl}/offers/${encodeURIComponent(offerId)}/${action}`);
        upstream.searchParams.set('token', token);

        const response = await fetch(upstream, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                ...(process.env.API_KEY ? { 'x-api-key': process.env.API_KEY } : {}),
            },
            body: '{}',
            cache: 'no-store',
        });

        const payload = await response.json().catch(() => ({
            message: 'Unexpected upstream response',
        }));

        return NextResponse.json(payload, { status: response.status });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Offer action failed';
        console.error('[offers proxy]', { baseUrl, offerId, action, message });
        return NextResponse.json({ message }, { status: 502 });
    }
}
