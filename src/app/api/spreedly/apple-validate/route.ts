import { safeStringify } from '@/lib/safeStringify';
import { apiService } from '@/services/server/base';

interface AppleValidateBody {
    validationURL?: string;
    paymentIntentId?: string;
}

/**
 * POST /api/spreedly/apple-validate
 * Proxies Apple Pay merchant validation to Fastify /spreedly/apple-validate.
 */
export async function POST(request: Request) {
    const prefix = '[Payments][ApplePay][Spreedly][Validate]';

    try {
        const body = (await request.json()) as AppleValidateBody;
        const { validationURL } = body;

        if (!validationURL) {
            return Response.json(
                { error: 'Missing required field: validationURL' },
                { status: 400 }
            );
        }

        console.log(
            `${prefix} Request payload: ${safeStringify({
                validationURL,
            })}`
        );

        const merchantSession = await apiService.post<Record<string, unknown>>(
            '/spreedly/apple-validate',
            {
                validationURL,
            },
            { headers: { 'Content-Type': 'application/json' } }
        );

        return Response.json(merchantSession);
    } catch (error) {
        console.error(`${prefix} Validation failed:`, error);
        return Response.json({ error: 'Apple Pay merchant validation failed' }, { status: 500 });
    }
}
