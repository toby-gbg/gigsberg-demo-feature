import { NextRequest, NextResponse } from 'next/server';

import Affiliate from '@/lib/affiliate';

export async function POST(request: NextRequest) {
    const body = await request.json();

    if (!body.url) {
        return NextResponse.json({ error: 'URL field is missing in the body' }, { status: 422 });
    }

    const response = NextResponse.json(
        {
            ok: true,
        },
        { status: 200 }
    );

    try {
        await Affiliate.startTracking(request, response, body);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('Affiliate tracking failed:', error);

        return NextResponse.json(
            {
                error: 'Affiliate tracking failed',
                details: message,
            },
            { status: 500 }
        );
    }

    return response;
}
