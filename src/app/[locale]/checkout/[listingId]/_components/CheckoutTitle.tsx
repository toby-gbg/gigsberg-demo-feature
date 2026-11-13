'use client';

import { useTranslations } from 'next-intl';

import { CheckoutStep } from '@/interfaces/Checkout';

import { useCheckoutAttendeeInfo } from '../_providers/CheckoutAttendeeInfoProvider';
import { useCheckoutPayment } from '../_providers/CheckoutPaymentProvider';

export default function CheckoutTitle() {
    const { currentStep } = useCheckoutPayment();
    const { hasAttendeeStep } = useCheckoutAttendeeInfo();
    const t = useTranslations();

    return (
        <p className="font-semibold capitalize text-[28px] md:text-4xl">
            {currentStep === CheckoutStep.YOUR_INFORMATION
                ? t('let_get_you_started')
                : currentStep === CheckoutStep.ATTENDEE_DETAILS && hasAttendeeStep
                  ? t('attendee_details')
                  : t('complete_your_payment')}
        </p>
    );
}
