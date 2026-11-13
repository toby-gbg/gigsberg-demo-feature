import { readFile } from 'node:fs/promises';
import path from 'node:path';

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ filename: string }> }
) {
    const { filename } = await params;
    if (!/^[a-f0-9]{16}\.avif$/.test(filename)) {
        return new Response(null, { status: 404, headers: { 'Cache-Control': 'no-store' } });
    }

    try {
        const content = await readFile(path.join(process.cwd(), 'temp', filename));

        return new Response(new Uint8Array(content), {
            headers: {
                'Content-Type': 'image/avif',
            },
        });
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            return new Response(null, { status: 404, headers: { 'Cache-Control': 'no-store' } });
        }
        console.error('Failed to serve mobile LCP image', error);
        return new Response(null, { status: 503, headers: { 'Cache-Control': 'no-store' } });
    }
}
