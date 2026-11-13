'use client';

import { useElements, useStripe as useReactStripe } from '@stripe/react-stripe-js';
import Cookie from 'js-cookie';
import { useLocale, useTranslations } from 'next-intl';

import { PaymentProviderEnum } from '@/interfaces/Checkout';
import { markPurchaseRedirect } from '@/utils/purchaseRedirect';

import { useUser } from '@/providers/UserProvider';
import useIntlRouter from '@/hooks/useIntlRouter';

import { toast } from '@/components/ui/Toast';

import { useCheckoutAttendeeInfo } from '../_providers/CheckoutAttendeeInfoProvider';
import { useCheckoutData } from '../_providers/CheckoutDataProvider';
import { useCheckoutLead } from '../_providers/CheckoutLeadProvider';
import { useCheckoutPayment } from '../_providers/CheckoutPaymentProvider';

const useStripe = () => {
    const t = useTranslations();
    const stripe = useReactStripe();
    const elements = useElements();
    const rawLocale = useLocale();
    const locale = rawLocale.split('-')[0];
    const router = useIntlRouter();

    // Data
    const { country } = useCheckoutData();
    const { lead } = useCheckoutLead();
    const { submitAttendeeInfo, attendeeFormData } = useCheckoutAttendeeInfo();
    // Payment
    const { createPaymentIntent, resetMethod, setIsLoading } = useCheckoutPayment();

    const user = useUser();

    const createAndConfirmPaymentIntent = () => {
        return toast.promise(
            (async () => {
                try {
                    setIsLoading(true);

                    if (!stripe || !elements) return;

                    const { error } = await elements.submit();

                    if (error) {
                        resetMethod();
                        throw new Error(error.message);
                    }

                    const { clientSecret } = await createPaymentIntent({
                        paymentProvider: 'stripe',
                    });
                    if (attendeeFormData && lead?.id) {
                        await submitAttendeeInfo(lead?.id, attendeeFormData);
                    }

                    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
                        elements,
                        clientSecret,
                        redirect: 'if_required',
                        confirmParams: {
                            return_url: `${window.location.origin}/${locale}/redirection?url=${encodeURIComponent(`/${locale}/thank-you`)}`,
                            payment_method_data: {
                                billing_details: {
                                    name: user?.fullname,
                                    email: user?.email,
                                    address: {
                                        country: country?.code,
                                    },
                                },
                            },
                        },
                    });

                    if (paymentIntent?.status === 'succeeded') {
                        Cookie.set('payment_provider', PaymentProviderEnum.STRIPE);
                        markPurchaseRedirect(paymentIntent.id);

                        router.replace(`/${locale}/thank-you?payment_intent=${paymentIntent.id}`);
                    }

                    if (stripeError) {
                        resetMethod();
                        throw new Error(stripeError.message);
                    }
                } finally {
                    setIsLoading(false);
                }
            })(),
            {
                loading: { title: t('loading'), type: 'loading' },
                success: { title: t('success'), type: 'success', timeout: 5555 },
                error: (error: unknown) => ({
                    title: error instanceof Error ? error.message : t('validation_error'),
                    type: 'error',
                    timeout: 5555,
                }),
            }
        );
    };

    return { createAndConfirmPaymentIntent };
};

export default useStripe;
