'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

import { markPurchaseRedirect } from '@/utils/purchaseRedirect';

export default function RedirectionPage() {
    const t = useTranslations();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        let redirectToUrl = urlParams.get('url') || '/';

        const destination = new URL(redirectToUrl, window.location.origin);
        const paymentIntent =
            destination.searchParams.get('payment_intent') || urlParams.get('payment_intent');

        if (paymentIntent) {
            markPurchaseRedirect(paymentIntent);
            // Stripe appends payment_intent after the encoded `url` value, making it a separate
            // query parameter of /redirection instead of part of the nested thank-you URL.
            // urlParams.get('url') therefore returns only /thank-you, so copy payment_intent into
            // the destination before redirecting: https://docs.stripe.com/js/payment_intents/confirm_payment
            destination.searchParams.set('payment_intent', paymentIntent);
            redirectToUrl = destination.toString();
        }

        if (window.parent && window.parent !== window) {
            window.parent.location.replace(redirectToUrl);
        } else {
            window.location.replace(redirectToUrl);
        }
    }, []);

    return (
        <div className="flex flex-col justify-center items-center h-screen bg-gray-100 font-sans text-center">
            <h1 className="text-3xl text-gray-800">{t('redirecting')}.</h1>
            <p className="mt-2 text-gray-600">{t('please_wait')}</p>
        </div>
    );
}
