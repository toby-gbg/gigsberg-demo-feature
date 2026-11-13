'use client';

import { useStore } from '@nanostores/react';
import { useTranslations } from 'next-intl';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { useUpdateEffect } from 'react-use';

import { CheckoutStep, CheckoutStep1Form } from '@/interfaces/Checkout';
import { $isApplyingCoupon } from '@/stores/checkout';
import GoogleAnalyticsTracker from '@/lib/seo/GoogleAnalyticsTracker';
import { fallbackTranslation } from '@/utils/common';
import CheckoutUtil from '@/utils/customs/checkout.util';
import GoogleEventMapper from '@/utils/GoogleEventMapper';
import UserMapper from '@/utils/mappers/user/user.mapper';
import { useRegisterMutation as useSWRRegisterMutation } from '@/swr/features/auth';
import { useUpdateUserMutation } from '@/swr/features/user';

import { useUser, useUserActions } from '@/providers/UserProvider';
import useIntlRouter from '@/hooks/useIntlRouter';

import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';

import useAnalyticsTracker from '../../_hooks/useAnalyticsTracker';
import { useCheckoutAttendeeInfo } from '../../_providers/CheckoutAttendeeInfoProvider';
import { useCheckoutData } from '../../_providers/CheckoutDataProvider';
import { useCheckoutLead } from '../../_providers/CheckoutLeadProvider';
import { useCheckoutPayment } from '../../_providers/CheckoutPaymentProvider';
import CheckoutTerm from '../CheckoutTerm';
import CheckoutBillingAddress from './CheckoutBillingAddress';
import CheckoutContactInformations from './CheckoutContactInformations';
import CheckoutFifaTermsAndConditionsInput from './CheckoutFifaTermsAndConditionInput';
import CheckoutReceiveUpdateInput from './CheckoutReceiveUpdateInput';

export default function CheckoutContactForm() {
    const t = useTranslations();
    const { push } = useIntlRouter();

    const user = useUser();
    const { setCredentials } = useUserActions();
    const isApplyingCoupon = useStore($isApplyingCoupon);

    // Lead provider
    const { createLead } = useCheckoutLead();

    // Data provider
    const { data: checkoutData, isFetching, refresh, ipCountry } = useCheckoutData();

    // Payment provider
    const {
        currentStep,
        setCurrentStep,
        preparePayment,
        finalPrice,
        handleZeroPayment,
        setIsSubmittingInformation,
        createPaymentIntent,
    } = useCheckoutPayment();

    const { hasAttendeeStep } = useCheckoutAttendeeInfo();

    const { sendDataToTrackers } = useAnalyticsTracker();

    // Mutation API
    const { trigger: triggerRegister } = useSWRRegisterMutation({
        onSuccess: (data) => {
            setCredentials(data);

            const userProvidedData = GoogleEventMapper.mapUserProvidedData(data.user);
            GoogleAnalyticsTracker.triggerUPDSubmit(userProvidedData);
            localStorage.setItem('newUser', 'true');
        },
        onError: (error) => toast.add({ title: t(error.data.errorKey), type: 'error' }),
    });

    const { trigger: triggerUpdateUser } = useUpdateUserMutation();

    /*===============================
     * FORM
     * ============================*/
    const methods = useForm<CheckoutStep1Form>({
        defaultValues: {
            ...(ipCountry && { country: ipCountry }),
            ...(user && UserMapper.toCheckoutForm(user, ipCountry)),
        },
    });

    const {
        handleSubmit,
        reset,
        formState: { isSubmitting },
    } = methods;

    const onSubmit: SubmitHandler<CheckoutStep1Form> = async (data) => {
        if (isApplyingCoupon || isFetching) return;

        // Check if user is blocked
        if (user?.is_blocked) {
            toast.add({ title: t('user_is_blocked'), type: 'error' });
            return;
        }

        setIsSubmittingInformation(true);
        try {
            // Register new user
            if (!user) {
                await triggerRegister(CheckoutUtil.step1ToRegister(data));
            } else {
                // Update user info
                await triggerUpdateUser(CheckoutUtil.step1ToUpdateUser(data));
            }

            //Send data to various analytics tracker
            await sendDataToTrackers();
            if (user && checkoutData.listing.seller_id === user.id) {
                toast.add({
                    title: fallbackTranslation(
                        t('cannot_purchase_own_listing'),
                        'cannot_purchase_own_listing',
                        'You cannot purchase tickets from your own listing.'
                    ),
                    type: 'error',
                });
                return;
            }

            // If finalPrice = 0, handle free order and go to thankyou page
            if (finalPrice === 0) {
                if (hasAttendeeStep) {
                    setCurrentStep(CheckoutStep.ATTENDEE_DETAILS);
                    return;
                }

                // Create lead for payment intent
                const { id: leadId } = await createLead();

                const { paymentIntentId } = await createPaymentIntent({
                    leadId,
                    paymentProvider: 'zero_pay',
                });

                await handleZeroPayment(paymentIntentId);

                push(`/thank-you?payment_intent=${paymentIntentId}`);

                return;
            }

            // If paymentProvider is stripe, don't need create paymentIntent
            // Stripe will create it's own paymentIntent after click "Continue"
            if (hasAttendeeStep) {
                setCurrentStep(CheckoutStep.ATTENDEE_DETAILS);
            } else {
                // Create lead for payment intent
                const { id: leadId } = await createLead();

                await preparePayment(leadId);

                setCurrentStep(CheckoutStep.CONFIRM_AND_PAY);

                // WLB-1804: Refresh checkout data to get newest exchange rate
                refresh();
            }
        } finally {
            setIsSubmittingInformation(false);
        }
    };

    // Update user information when log in or created new account
    useUpdateEffect(() => {
        if (user) reset(UserMapper.toCheckoutForm(user, ipCountry));
    }, [user?.id]);

    return (
        <FormProvider {...methods}>
            <form
                className={`grid-cols-12 gap-4 ${currentStep === CheckoutStep.YOUR_INFORMATION ? 'grid' : 'hidden'}`}
                noValidate
                onSubmit={handleSubmit(onSubmit)}
            >
                {/* User's basic information */}
                <CheckoutContactInformations />

                {/* User's billing address */}
                <CheckoutBillingAddress />

                <div className="space-y-2 col-span-12 mt-2">
                    {/* Only for FIFA event */}
                    <CheckoutFifaTermsAndConditionsInput />

                    {/* Receive update email */}
                    <CheckoutReceiveUpdateInput />
                </div>

                <div className="space-y-2 col-span-12 mt-2">
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmitting || isApplyingCoupon || isFetching}
                        isLoading={isSubmitting}
                    >
                        {t('continue')}
                    </Button>

                    <CheckoutTerm content={t('by_pressing_button')} />
                </div>
            </form>
        </FormProvider>
    );
}
