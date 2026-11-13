'use client';

import { useCallback, useEffect } from 'react';

import { CheckoutStep } from '@/interfaces/Checkout';
import { AttendeeXS2Scope } from '@/constants/attendee';

import useIntlRouter from '@/hooks/useIntlRouter';

import AttendeeFormFields from '@/components/AttendeeFormFields';

import { useCheckoutAttendeeInfo } from '../_providers/CheckoutAttendeeInfoProvider';
import { useCheckoutData } from '../_providers/CheckoutDataProvider';
import { useCheckoutLead } from '../_providers/CheckoutLeadProvider';
import { useCheckoutPayment } from '../_providers/CheckoutPaymentProvider';

export default function CheckoutAttendeeDetails() {
    const { push } = useIntlRouter();

    const { quantity, refresh } = useCheckoutData();

    const {
        preparePayment,
        setCurrentStep,
        currentStep,
        paymentProvider,
        finalPrice,
        handleZeroPayment,
        createPaymentIntent,
    } = useCheckoutPayment();

    const {
        attendeeSchema: schema,
        setAttendeeFormData,
        hasAttendeeStep,
        submitAttendeeInfo,
        fieldErrors,
        setFieldErrors,
        isSubmitting,
        setIsSubmitting,
    } = useCheckoutAttendeeInfo();

    const { createLead } = useCheckoutLead();

    const activeGuestCount = schema?.scope === AttendeeXS2Scope.ALL_PERSONS ? Number(quantity) : 1;

    useEffect(() => {
        setFieldErrors({});
    }, [currentStep]);

    const handleBack = useCallback(() => {
        setCurrentStep(CheckoutStep.YOUR_INFORMATION);
    }, [setCurrentStep]);

    const submitAttendeeInformation = async (leadId: number, guests: Record<string, string>[]) => {
        if (!leadId || guests.length === 0) return;

        // Prepare payment by Lead first to create new order, allows data save attendeeDetails to order table
        setAttendeeFormData(guests);

        // Do not submit attendee info in this step
        if (leadId && paymentProvider !== 'stripe') {
            await submitAttendeeInfo(leadId, guests);
        }
    };

    const onSubmit = async (guests: Record<string, string>[]) => {
        setIsSubmitting(true);
        setFieldErrors({});

        try {
            const { id: leadId } = await createLead();

            if (finalPrice === 0) {
                const { paymentIntentId } = await createPaymentIntent({
                    leadId,
                    paymentProvider: 'zero_pay',
                });

                await submitAttendeeInformation(leadId, guests);

                await handleZeroPayment(paymentIntentId);

                push(`/thank-you?payment_intent=${paymentIntentId}`);

                return;
            }

            await preparePayment(leadId);

            await submitAttendeeInformation(leadId, guests);

            setCurrentStep(CheckoutStep.CONFIRM_AND_PAY);

            // WLB-1804: Refresh checkout data to get newest exchange rate
            refresh();
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!hasAttendeeStep || !schema || !schema.attendersData.length) return null;

    return (
        <div className={`${currentStep === CheckoutStep.ATTENDEE_DETAILS ? 'block' : 'hidden'}`}>
            <AttendeeFormFields
                schema={schema}
                activeGuestCount={activeGuestCount}
                isSubmitting={isSubmitting}
                fieldErrors={fieldErrors}
                onSubmit={onSubmit}
                showBackButton
                onBack={handleBack}
            />
        </div>
    );
}
