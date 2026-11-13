import { redirect } from 'next/navigation';

import { PaymentProviderEnum } from '@/interfaces/Checkout';
import { FibonatixBody } from '@/interfaces/Fibonatix';
import FibonatixUtils from '@/lib/api/fibonatix';
import CheckoutUtil from '@/lib/checkout';
import { safeStringify } from '@/lib/safeStringify';

export async function POST(request: Request) {
    const prefix = '[Payments][Webhook][Fibonatix]';
    const text = await request.text();
    const body = Object.fromEntries(new URLSearchParams(text)) as unknown as FibonatixBody;

    console.log(`${prefix} Received body: ${safeStringify(body)}`);

    if (FibonatixUtils.getStatusGroup(body['status-code']) === 'Approved') {
        console.log(`${prefix} Redirecting to thank you page: ${body['orderid']}`);

        await CheckoutUtil.setSuccessPaymentProvider(PaymentProviderEnum.FIBONATIX);

        return redirect(
            `/redirection?url=${encodeURIComponent(`/thank-you?payment_intent=${body['orderid']}`)}`
        );
    }

    const [listingId, quantity] = body.client_orderid.split('-');

    const redirectUrl = await CheckoutUtil.signUrl(
        `/checkout/${listingId}?quantity=${quantity}&error_message=${body['error_message']}`
    );

    return redirect(`/redirection?url=${encodeURIComponent(redirectUrl)}`);
}
