'use client';

import '@/assets/css/nomupay.css';

import { Fragment, useEffect, useRef } from 'react';
import Script from 'next/script';
import { useLocale } from 'next-intl';

import { useCheckoutPayment } from '../../../_providers/CheckoutPaymentProvider';

declare global {
    interface Window {
        wpwlOptions?: object;
    }
}

const hideSpinner = () => {
    const spinner = document.querySelector('div.spinner[role="progressbar"]');
    if (spinner) {
        (spinner as HTMLElement).style.display = 'none';
        return true;
    }
    return false;
};

export default function CheckoutNomupay() {
    const locale = useLocale();
    const { paymentIntent, setMethod, resetMethod } = useCheckoutPayment();

    const observerRef = useRef<MutationObserver | null>(null);

    const startSpinnerObserver = () => {
        // prevent creating multiple observers
        if (observerRef.current) return;

        observerRef.current = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                // if new elements were added
                if (mutation.addedNodes.length) hideSpinner();
            }
        });

        observerRef.current.observe(document.body, {
            childList: true, // watch for added/removed child elements
            subtree: true, // watch inside all nested elements (need this for sure)
        });

        // try immediately in case it already exists
        hideSpinner();
    };

    useEffect(() => {
        // Define NomuPay widget options BEFORE script loads
        window.wpwlOptions = {
            style: 'card',
            onBeforeSubmitCard: () => {
                setMethod('card');
                return true;
            },
            onError: (error: unknown) => {
                resetMethod();
                console.error('Nomupay error: ', error);
            },
        };

        return () => {
            window.wpwlOptions = undefined;
            observerRef.current?.disconnect(); // clean up observer
        };
    }, []);

    if (!paymentIntent) return null;

    return (
        <Fragment>
            <form
                action={`/api/nomupay?locale=${locale}`}
                method="POST"
                className="paymentWidgets"
                data-brands="VISA MASTER AMEX"
            />
            <Script
                src={`${process.env.NEXT_PUBLIC_NOMUPAY_BASE_URL}/v1/paymentWidgets.js?checkoutId=${paymentIntent.paymentIntentId}`}
                strategy="afterInteractive"
                integrity={paymentIntent.clientSecret}
                crossOrigin="anonymous"
                onLoad={() => startSpinnerObserver()}
            />
        </Fragment>
    );
}
