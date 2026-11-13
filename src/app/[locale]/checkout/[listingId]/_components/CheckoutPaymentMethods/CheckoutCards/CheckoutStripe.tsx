'use client';

import { FormEventHandler } from 'react';
import { PaymentElement } from '@stripe/react-stripe-js';
import { useTranslations } from 'next-intl';

import { useGA4CheckoutWithPaymentMethod } from '@/hooks/useGA4CheckoutWithPaymentMethod';

import { Button } from '@/components/ui/Button';

import useStripe from '../../../_hooks/useStripe';
import { useCheckoutPayment } from '../../../_providers/CheckoutPaymentProvider';

export default function CheckoutStripe() {
    const t = useTranslations();
    const { createAndConfirmPaymentIntent } = useStripe();

    const { setMethod, isLoading } = useCheckoutPayment();

    const { triggerGA4CheckoutWithPaymentMethod } = useGA4CheckoutWithPaymentMethod();

    const _onConfirm: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();

        setMethod('stripe');

        triggerGA4CheckoutWithPaymentMethod('credit_card');

        createAndConfirmPaymentIntent();
    };

    return (
        <form onSubmit={_onConfirm} className="flex flex-col gap-y-4">
            <PaymentElement
                options={{
                    layout: {
                        defaultCollapsed: false,
                        type: 'tabs',
                    },
                    fields: {
                        billingDetails: {
                            address: {
                                country: 'never',
                            },
                        },
                    },
                }}
            />
            <Button
                type="submit"
                className="col-span-12"
                disabled={isLoading}
                isLoading={isLoading}
            >
                {t('continue')}
            </Button>
        </form>
    );
}
