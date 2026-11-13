'use client';

import { Fragment, useState } from 'react';
import { ExpressCheckoutElement, ExpressCheckoutElementProps } from '@stripe/react-stripe-js';
import classNames from 'classnames';

import { CheckoutStep } from '@/interfaces/Checkout';

import { useSite } from '@/providers/SiteProvider';
import { useGA4CheckoutWithPaymentMethod } from '@/hooks/useGA4CheckoutWithPaymentMethod';

import { Skeleton } from '@/components/ui/Skeleton';

import useStripe from '../../../_hooks/useStripe';
import { useCheckoutPayment } from '../../../_providers/CheckoutPaymentProvider';

export default function CheckoutStripeElements() {
    const { currentStep } = useCheckoutPayment();
    const { config } = useSite().domainInfo || {};

    const { createAndConfirmPaymentIntent } = useStripe();
    const [isReady, setIsReady] = useState<boolean>(false);
    const { triggerGA4CheckoutWithPaymentMethod } = useGA4CheckoutWithPaymentMethod();

    const onClick: ExpressCheckoutElementProps['onClick'] = async ({
        expressPaymentType,
        resolve,
    }) => {
        triggerGA4CheckoutWithPaymentMethod(expressPaymentType);

        return resolve();
    };

    const onReady: ExpressCheckoutElementProps['onReady'] = () => {
        setIsReady(true);
    };

    return (
        <Fragment>
            {!isReady && currentStep === CheckoutStep.CONFIRM_AND_PAY && (
                <Skeleton className="mb-1 h-12 w-full rounded-md" />
            )}
            <ExpressCheckoutElement
                onConfirm={createAndConfirmPaymentIntent}
                onClick={onClick}
                onReady={onReady}
                options={{
                    paymentMethods: {
                        googlePay: config?.payment?.stripeExpressMethods?.googlePay || 'never',
                        applePay: config?.payment?.stripeExpressMethods?.applePay || 'never',
                        paypal: config?.payment?.useNomupayElements
                            ? 'never'
                            : process.env.NEXT_PUBLIC_PAYPAL_ENABLED === 'true'
                              ? 'auto'
                              : 'never',
                    },
                    buttonType: { googlePay: 'pay' },
                    emailRequired: true,
                    buttonHeight: 50,
                    layout: { maxColumns: 3 },
                }}
                className={classNames('mb-1', {
                    hidden: currentStep !== CheckoutStep.CONFIRM_AND_PAY,
                })}
            />
        </Fragment>
    );
}
