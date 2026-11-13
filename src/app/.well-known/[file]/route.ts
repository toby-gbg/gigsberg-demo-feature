import { notFound } from 'next/navigation';
import { readFile } from 'fs/promises';
import path from 'path';

import Headers from '@/lib/headers';

export const dynamic = 'force-dynamic';

const BASE_DIR = path.resolve(process.cwd(), '.well-known');

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
    const { file } = await params;

    const host = await Headers.getHostname();

    const filePath = path.join(BASE_DIR, host, file);

    try {
        const content = await readFile(filePath, 'utf8');

        return new Response(content, {
            headers: {
                'Content-Type': 'text/plain',
            },
        });
    } catch {
        notFound();
    }
}
