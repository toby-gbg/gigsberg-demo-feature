'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { useLocale } from 'next-intl';

import '@/assets/css/secure-trading.css';

import { Loader } from 'lucide-react';

import { useCheckoutPayment } from '../../../_providers/CheckoutPaymentProvider';

declare global {
    interface Window {
        SecureTrading?: (opts: {
            jwt: string;
            styles?: Record<string, string>;
            components: {
                callbacks: {
                    onPaymentFormRendered: () => void;
                };
            };
        }) => {
            Components: () => void;
            on: (event: string, callback: (data: unknown) => void) => void;
        };
    }
}

export default function CheckoutSecureTrading() {
    const locale = useLocale();
    const { paymentIntent, setMethod, resetMethod } = useCheckoutPayment();
    const initializedRef = useRef<boolean>(false);
    const [sdkReady, setSdkReady] = useState<boolean>(false);

    useEffect(() => {
        if (!paymentIntent?.clientSecret || !sdkReady) return;
        if (initializedRef.current) return;

        const ST = window.SecureTrading;
        if (!ST) return;

        try {
            const st = ST({
                jwt: paymentIntent?.clientSecret,
                styles: {
                    /* Labels */
                    'color-label': '#374151',
                    'font-family-label': 'Poppins, Arial, sans-serif',
                    'font-size-label': '14px',
                    'font-weight-label': '500',
                    'line-height-label': '1.4',
                    'text-transform-label': 'capitalize',
                    'color-asterisk': '#ef4444',
                    /* Input */
                    'background-color-input': '#f9fafb',
                    'border-color-input': '#d1d5db',
                    'border-radius-input': '10px',
                    'border-size-input': '1px',
                    'box-shadow-input': '0 2px 5px rgba(0,0,0,0.05)',
                    'color-input': '#111',
                    'color-input-placeholder': '#9ca3af',
                    'font-family-input': 'Poppins, Arial, sans-serif',
                    'font-size-input': '15px',
                    'line-height-input': '1.4',
                    'space-inset-input': '12px 14px',

                    /* Input error */
                    'background-color-input-error': '#fff5f5',
                    'border-color-input-error': '#e11d48',
                    'border-radius-input-error': '10px',
                    'border-size-input-error': '1px',
                    'color-input-error': '#b91c1c',

                    /* Messages */
                    'background-color-message': 'transparent',
                    'font-family-message': 'Poppins, Arial, sans-serif',
                    'font-size-message': '13px',
                    'line-height-message': '1.4',
                    'color-error': '#e11d48',
                },
                components: {
                    callbacks: {
                        onPaymentFormRendered() {
                            console.log('render secure');
                        },
                    },
                },
            });
            st.Components();
            st.on('paymentStarted', (data: unknown) => {
                setMethod('card');
                console.log('Secure payment started ', data);
            });
            st.on('paymentFailed', (data: unknown) => {
                resetMethod();
                console.log('Secure payment failed ', data);
            });

            st.on('paymentCanceled', (data: unknown) => {
                resetMethod();
                console.log('Secure payment cancel ', data);
            });
            initializedRef.current = true;
        } catch (err) {
            console.error('SecureTrading init failed:', err);
        }
    }, [sdkReady, paymentIntent]);

    if (!paymentIntent) return null;

    return (
        <Fragment>
            <div id="st-notification-frame"></div>
            <form id="st-form" action={`/api/secure?locale=${locale}`} method="POST">
                <div id="st-card-number" className="st-card-number st-col"></div>
                <div className="st-row">
                    <div id="st-expiration-date" className="st-expiration-date st-col"></div>
                    <div id="st-security-code" className="st-security-code st-col"></div>
                </div>
                <button type="submit" id="st-form__submit" className="st-form__submit">
                    <Loader className="animate-spin" />
                </button>
            </form>
            <Script
                src="https://cdn.eu.trustpayments.com/js/latest/st.js"
                strategy="afterInteractive"
                onLoad={() => setSdkReady(true)}
                onError={(e) => console.error('Failed to load SecureTrading SDK', e)}
            />
        </Fragment>
    );
}
