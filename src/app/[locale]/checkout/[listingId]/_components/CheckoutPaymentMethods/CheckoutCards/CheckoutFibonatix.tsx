'use client';

import { useEffect, useRef } from 'react';

import { useCheckoutData } from '../../../_providers/CheckoutDataProvider';
import { useCheckoutPayment } from '../../../_providers/CheckoutPaymentProvider';

export default function CheckoutFibonatix() {
    const { paymentIntent, setMethod, resetMethod } = useCheckoutPayment();
    const { website } = useCheckoutData();
    const { main_gradient_start, main_gradient_end } = website ?? {};

    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        const iframe = iframeRef.current;

        if (iframe) {
            const handleLoad = () => {
                if (iframe.contentWindow) {
                    iframe.contentWindow.postMessage(
                        {
                            messageType: 'initialColors',
                            primaryColor: main_gradient_start,
                            secondaryColor: main_gradient_end,
                        },
                        '*'
                    );
                }
            };

            iframe.addEventListener('load', handleLoad);

            return () => {
                iframe.removeEventListener('load', handleLoad);
            };
        }
    }, [paymentIntent]);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.messageType === 'formSubmissionStart') {
                setMethod('card');
            }

            if (event.data?.messageType === 'validationError') {
                resetMethod();
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    if (!paymentIntent) return null;

    return (
        <iframe
            ref={iframeRef}
            src={`${paymentIntent.clientSecret}?enforceProvider=card`}
            className="w-full h-[550px] border-0 overflow-hidden"
            title="Fibonatix Checkout"
            allow="payment"
        />
    );
}
