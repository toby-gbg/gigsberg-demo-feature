import { redirect } from 'next/navigation';

import { PaymentProviderEnum } from '@/interfaces/Checkout';
import { SecureTradingFormData, SecureTradingWebhook } from '@/interfaces/SecureTrading';
import CheckoutUtil from '@/lib/checkout';
import { verifyToken } from '@/lib/jsonwebtoken';
import { safeStringify } from '@/lib/safeStringify';
import locales, { prefixes } from '@/constants/locales';

export async function POST(request: Request) {
    const url = new URL(request.url);
    const locale = url.searchParams.get('locale');
    const localePrefix =
        locale && locales.includes(locale) ? (prefixes[locale] ?? `/${locale}`) : '';
    const formData = await request.formData();
    const prefix = '[Payments][Webhook][SecureTrading]';
    const data = Object.fromEntries(formData) as Record<string, string>;

    console.log(`${prefix} Received form data: ${safeStringify(data)}`);

    const body: SecureTradingFormData = {
        errorcode: data.errorcode ?? '',
        transactionreference: data.transactionreference ?? '',
        baseamount: data.baseamount ?? '',
        currencyiso3a: data.currencyiso3a ?? '',
        errormessage: data.errormessage ?? '',
        enrolled: data.enrolled ?? '',
        settlestatus: data.settlestatus ?? '',
        jwt: data.jwt ?? '',
    };

    console.log('SecureTrading webhook received:', JSON.stringify(body));

    const isSuccess = body.errorcode === '0';

    const payload = (await verifyToken(body.jwt, 'secure')) as SecureTradingWebhook;
    console.log(`${prefix} Verified token: ${safeStringify(payload)}`);
    const {
        payload: { response },
    } = payload;

    if (isSuccess) {
        await CheckoutUtil.setSuccessPaymentProvider(PaymentProviderEnum.SECURE);

        return redirect(
            `${localePrefix}/redirection?url=${encodeURIComponent(`${localePrefix}/thank-you?payment_intent=${body.transactionreference}`)}`
        );
    }

    const metadataString = `${response[0].customfield1 ?? ''}${response[0].customfield2 ?? ''}${response[0].customfield3 ?? ''}${response[0].customfield4 ?? ''}`;
    let listingId: number | undefined;
    let quantity: number | undefined;
    try {
        console.log(`${prefix} Metadata string: ${metadataString}`);
        const metadata = JSON.parse(metadataString);
        listingId = Number(metadata.l);
        quantity = Number(metadata.q);
        if (!listingId || isNaN(quantity) || quantity <= 0) {
            throw new Error('Invalid listing ID or quantity');
        }
    } catch (error) {
        console.error(`${prefix} Error parsing metadata: ${error}`);

        const redirectUrl = await CheckoutUtil.signUrl(
            `${localePrefix}/checkout/${listingId}?quantity=${quantity}&error_message=${error instanceof Error ? error.message : 'Invalid metadata'}`
        );

        return redirect(redirectUrl);
    }

    const redirectUrl = await CheckoutUtil.signUrl(
        `${localePrefix}/checkout/${listingId}?quantity=${quantity}&error_message=${body.errormessage}`
    );

    return redirect(redirectUrl);
}
