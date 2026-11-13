export async function GET() {
    return Response.json(
        { status: 'ok' },
        {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        }
    );
}
export const dynamic = 'force-static';
