'use client';

import { useEffect } from 'react';
import Pay from '@pay-com/js';
import Cookie from 'js-cookie';

import { PaymentProviderEnum } from '@/interfaces/Checkout';
import { markPurchaseRedirect } from '@/utils/purchaseRedirect';

import useIntlRouter from '@/hooks/useIntlRouter';

import { toast } from '@/components/ui/Toast';

import { useCheckoutPayment } from '../../../_providers/CheckoutPaymentProvider';

export default function CheckoutPaycom() {
    const { paymentIntent, setMethod, resetMethod } = useCheckoutPayment();

    const router = useIntlRouter();

    useEffect(() => {
        if (!paymentIntent) return;

        (async () => {
            const pay = await Pay.com({
                identifier: process.env.NEXT_PUBLIC_PAYCOM_IDENTIFIER,
                live: process.env.NEXT_PUBLIC_ISLIVE == 'true',
            });

            const checkout = pay.checkout({
                clientSecret: paymentIntent.clientSecret,
                onSuccess: (payment) => {
                    console.log('Checkout Completed!', payment);

                    Cookie.set('payment_provider', PaymentProviderEnum.PAYCOM);
                    markPurchaseRedirect(String(payment.transaction));

                    router.replace(`/thank-you?payment_intent=${payment.transaction}`);
                },
                onFailure: (error) => {
                    console.error('Checkout Failed!', error);
                    resetMethod();
                    toast.add({ title: error.message, type: 'error' });
                },
            });

            checkout.on(checkout.EVENT_TYPES.PAYMENT_PROCESSING, () => {
                setMethod('card');
            });

            await checkout.universal({
                container: '#paycom_checkout',
            });
        })();
    }, [paymentIntent]);

    if (!paymentIntent) return null;

    return <div id="paycom_checkout"></div>;
}
