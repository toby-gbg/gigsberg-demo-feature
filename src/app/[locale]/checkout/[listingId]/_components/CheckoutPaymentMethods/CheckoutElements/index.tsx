'use client';

import { useSite } from '@/providers/SiteProvider';

import { useCheckoutPayment } from '../../../_providers/CheckoutPaymentProvider';
import CheckoutNomupayElements from './CheckoutNomupayElements';
import CheckoutSpreedlyElements from './CheckoutSpreedlyElements';
import CheckoutStripeElements from './CheckoutStripeElements';

export default function CheckoutElements() {
    const { config } = useSite().domainInfo || {};
    const { paymentProvider, currentMethod } = useCheckoutPayment();

    if (paymentProvider === 'spreedly') {
        return (
            <div className="relative flex flex-col spreedly">
                <CheckoutSpreedlyElements />
                {currentMethod && <div className="z-10 absolute inset-0" />}
            </div>
        );
    }

    return (
        <div className="relative flex flex-col gap-1">
            {config?.payment?.useNomupayElements && <CheckoutNomupayElements />}
            <CheckoutStripeElements />
            {currentMethod && <div className="absolute size-full" />}
        </div>
    );
}
