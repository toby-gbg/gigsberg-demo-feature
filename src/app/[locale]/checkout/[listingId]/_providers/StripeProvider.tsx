'use client';

import { ReactNode } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { StripeElementLocale } from '@stripe/stripe-js';
import { useLocale } from 'next-intl';

import { ListingCheckout } from '@/interfaces/Listing';
import { stripePromise } from '@/lib/stripe';

import { useSite } from '@/providers/SiteProvider';

interface Props {
    listing: ListingCheckout;
    children: ReactNode;
}

export default function StripeProvider({ listing, children }: Props) {
    const locale = useLocale();
    const primaryColor = useSite().website?.main_gradient_start;

    return (
        <Elements
            stripe={stripePromise}
            options={{
                appearance: {
                    theme: 'flat',
                    variables: { colorPrimaryText: primaryColor },
                    labels: 'above',
                },
                locale: locale as StripeElementLocale,
                amount: Math.round(listing.originalCurrencyTotalPrice * 100),
                currency: listing.listingCurrencyCode.toLowerCase(),
                mode: 'payment',
                paymentMethodOptions: {
                    card: {
                        require_cvc_recollection: true,
                    },
                },
            }}
        >
            {children}
        </Elements>
    );
}
