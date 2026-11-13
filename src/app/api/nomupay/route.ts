import { redirect } from 'next/navigation';

import { PaymentProviderEnum } from '@/interfaces/Checkout';
import { NomupayParams } from '@/interfaces/nomupay/Nomupay';
import Nomupay from '@/lib/api/nomupay';
import CheckoutUtil from '@/lib/checkout';
import { safeStringify } from '@/lib/safeStringify';
import { orderApi } from '@/services/server/orders';
import locales, { prefixes } from '@/constants/locales';

export async function GET(request: Request) {
    const prefix = '[Payments][Webhook][NomuPay]';
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams) as unknown as NomupayParams;
    const localeParam = url.searchParams.get('locale');
    const locale = localeParam && locales.includes(localeParam) ? localeParam : undefined;
    const localePrefix = locale ? (prefixes[locale] ?? `/${locale}`) : '';

    const body = await Nomupay.getPaymentBody(params.resourcePath);

    console.log(`${prefix} Received body: ${safeStringify(body)}`);
    const isSuccess = /^(000\.000\.|000\.100\.1|000\.[36]|000\.400\.1[12]0)/.test(body.result.code);

    const paymentIntentId = body.merchantTransactionId;

    if (isSuccess) {
        await CheckoutUtil.setSuccessPaymentProvider(PaymentProviderEnum.NOMUPAY);

        return redirect(
            `${localePrefix}/redirection?url=${encodeURIComponent(`${localePrefix}/thank-you?payment_intent=${paymentIntentId}`)}`
        );
    }

    if (!body.merchantMemo) return Response.json(body);

    const [listingId, quantity] = body.merchantMemo.split('-');

    // Tracking failed payment
    await orderApi.getOrderDetails(paymentIntentId, PaymentProviderEnum.NOMUPAY);

    const redirectUrl = await CheckoutUtil.signUrl(
        `${localePrefix}/checkout/${listingId}?quantity=${quantity}&error_message=${body.result.description}`
    );

    return redirect(redirectUrl);
}
