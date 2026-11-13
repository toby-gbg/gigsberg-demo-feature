'use client';

import { useEffect, useRef } from 'react';

import { CheckoutStep } from '@/interfaces/Checkout';

import { useCheckoutAttendeeInfo } from '../../_providers/CheckoutAttendeeInfoProvider';
import { useCheckoutPayment } from '../../_providers/CheckoutPaymentProvider';

export default function CheckoutProgress() {
    const { currentStep } = useCheckoutPayment();
    const { hasAttendeeStep } = useCheckoutAttendeeInfo();
    const progressRef = useRef<HTMLDivElement>(null);

    const STEPS = hasAttendeeStep
        ? [
              CheckoutStep.YOUR_INFORMATION,
              CheckoutStep.ATTENDEE_DETAILS,
              CheckoutStep.CONFIRM_AND_PAY,
          ]
        : [CheckoutStep.YOUR_INFORMATION, CheckoutStep.CONFIRM_AND_PAY];
    const currentIndex = STEPS.indexOf(currentStep);
    const progress = ((currentIndex + 1) / (STEPS.length + 1)) * 100;

    useEffect(() => {
        const el = progressRef.current;
        if (!el) return;

        el.style.width = '0%';

        requestAnimationFrame(() => {
            el.style.width = `${progress}%`;
        });
    }, [progress]);

    return (
        <div className="h-1 w-full bg-[#FAFAFA]">
            <div
                ref={progressRef}
                className="bg-main-end h-full w-0 transition-all duration-600 ease-out"
                style={{
                    transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
            />
        </div>
    );
}
