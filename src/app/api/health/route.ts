export const dynamic = 'force-static';

// Check health
export function GET() {
    return new Response('ok', {
        status: 200,
        headers: {
            'Content-Type': 'text/plain',
            'Content-Length': '2',
        },
    });
}
