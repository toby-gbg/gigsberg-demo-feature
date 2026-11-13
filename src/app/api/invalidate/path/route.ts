import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const path = request.nextUrl.searchParams.get('path');

        if (!path) {
            return NextResponse.json({ error: 'Missing path' }, { status: 400 });
        }

        revalidatePath(path);

        return NextResponse.json({
            success: true,
            invalidated: path,
        });
    } catch (error) {
        console.error('Revalidation error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
