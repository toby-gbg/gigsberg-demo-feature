import { redirect } from 'next/navigation';

import { SpreedlyTransactionResponse } from '@/interfaces/Spreedly';
import CheckoutUtil from '@/lib/checkout';
import { safeStringify } from '@/lib/safeStringify';
import { apiService } from '@/services/server/base';
import locales, { prefixes } from '@/constants/locales';

/**
 * POST /api/spreedly
 * Called after Spreedly payment completes (direct callback).
 * Delegates verification to Fastify POST /spreedly/transaction/token.
 */
export async function POST(request: Request) {
    const prefix = '[Payments][Webhook][Spreedly]';
    const body = await request.json();
    const url = new URL(request.url);
    const locale = url.searchParams.get('locale');
    const localePrefix =
        locale && locales.includes(locale) ? (prefixes[locale] ?? `/${locale}`) : '';
    console.log(`${prefix} Received body: ${safeStringify(body)}`);

    let transactionToken = (body.transaction_token as string) || '';
    const listingId = body.listing_id as string;
    const quantity = body.quantity as string;
    const orderId = body.order_id as string;

    // Call Fastify to verify transaction and update order
    const result = await apiService.get<SpreedlyTransactionResponse>(
        '/spreedly/transaction/' + transactionToken + `?order_id=${orderId}`,
        { headers: { 'Content-Type': 'application/json' } }
    );

    if (result.state === 'succeeded') {
        transactionToken = result.transactionToken; // Use token from Fastify response for consistency
        console.log(
            `${prefix} Transaction verified via Fastify. Redirecting to thank-you: ${transactionToken}`
        );
        return redirect(
            `${localePrefix}/redirection?url=${encodeURIComponent(`${localePrefix}/thank-you?payment_intent=${transactionToken}&enquiry=true`)}`
        );
    }

    // Payment failed — redirect back to checkout with error
    const failureMessage = result.message || 'Payment failed';
    console.warn(`${prefix} Transaction failed: ${failureMessage}`);

    if (listingId && quantity) {
        const redirectUrl = await CheckoutUtil.signUrl(
            `${localePrefix}/checkout/${listingId}?quantity=${quantity}&error_message=${failureMessage}`
        );
        return redirect(`${localePrefix}/redirection?url=${encodeURIComponent(redirectUrl)}`);
    }

    return Response.json({ error: failureMessage }, { status: 400 });
}

/**
 * GET /api/spreedly
 * Called for 3DS redirect-back. Delegates 3DS completion and verification to Fastify.
 */
export async function GET(request: Request) {
    const prefix = '[Payments][Webhook][Spreedly][3DS-Redirect]';

    const url = new URL(request.url);
    const listingId = url.searchParams.get('listing_id');
    const quantity = url.searchParams.get('quantity');
    const orderId = url.searchParams.get('order_id') || '';
    const enquiry = url.searchParams.get('enquiry') === 'true';
    const locale = url.searchParams.get('locale');
    const localePrefix =
        locale && locales.includes(locale) ? (prefixes[locale] ?? `/${locale}`) : '';
    let transactionToken = url.searchParams.get('transaction_token') || '';

    console.log(`${prefix} 3DS redirect received. Transaction: ${transactionToken}`);

    // Call Fastify to verify transaction and update order (use transaction query)
    const result = await apiService.get<SpreedlyTransactionResponse>(
        '/spreedly/transaction/' + transactionToken + `?order_id=${orderId}`,
        { headers: { 'Content-Type': 'application/json' } }
    );

    console.log(`${prefix} Fastify transaction result: ${safeStringify(result)}`);

    if (result.state === 'succeeded') {
        transactionToken = result.transactionToken; // Use token from Fastify response for consistency
        console.log(
            `${prefix} 3DS transaction verified via Fastify. Redirecting to thank-you: ${transactionToken}`
        );
        if (enquiry && result.callbackUrl) {
            try {
                await apiService.post(
                    result.callbackUrl,
                    {},
                    { headers: { 'Content-Type': 'application/json' } }
                );
            } catch {
                // Ignore any error
            }
            return redirect(
                `${localePrefix}/redirection?url=${encodeURIComponent(`${localePrefix}/thank-you?payment_intent=${transactionToken}&enquiry=true`)}`
            );
        } else {
            return redirect(
                `${localePrefix}/redirection?url=${encodeURIComponent(`${localePrefix}/thank-you?payment_intent=${transactionToken}`)}`
            );
        }
    }

    // Payment failed
    const failureMessage = result.message || 'Payment failed';
    console.warn(`${prefix} 3DS transaction failed: ${failureMessage}`);

    if (listingId && quantity) {
        const redirectUrl = await CheckoutUtil.signUrl(
            `${localePrefix}/checkout/${listingId}?quantity=${quantity}&error_message=${failureMessage}`
        );
        return redirect(`${localePrefix}/redirection?url=${encodeURIComponent(redirectUrl)}`);
    }

    return Response.json({ error: failureMessage }, { status: 400 });
}
