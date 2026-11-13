import { Check, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { CheckoutStep } from '@/interfaces/Checkout';

import { useCheckoutAttendeeInfo } from '../../_providers/CheckoutAttendeeInfoProvider';
import { useCheckoutPayment } from '../../_providers/CheckoutPaymentProvider';

function getSteps(hasAttendeeStep: boolean) {
    if (hasAttendeeStep) {
        return [
            { id: CheckoutStep.YOUR_INFORMATION, label: 'your_information' },
            { id: CheckoutStep.ATTENDEE_DETAILS, label: 'attendee_details' },
            { id: CheckoutStep.CONFIRM_AND_PAY, label: 'confirm_and_pay' },
        ];
    }
    return [
        { id: CheckoutStep.YOUR_INFORMATION, label: 'your_information' },
        { id: CheckoutStep.CONFIRM_AND_PAY, label: 'confirm_and_pay' },
    ];
}

export default function CheckoutStepper() {
    const t = useTranslations();
    const { currentStep, setCurrentStep } = useCheckoutPayment();

    const { hasAttendeeStep } = useCheckoutAttendeeInfo();

    const STEPS = getSteps(hasAttendeeStep);
    const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);

    return (
        <div className="flex w-full items-center gap-1 py-1 md:w-auto">
            {STEPS.map((step, _index) => {
                let state: 'active' | 'completed' | 'inactive' = 'inactive';
                if (_index === currentStepIndex) state = 'active';
                if (_index < currentStepIndex) state = 'completed';

                const isLast = _index === STEPS.length - 1;

                return (
                    <button
                        key={step.label}
                        aria-label={t(step.label)}
                        className="flex min-w-0 flex-1 items-center md:flex-none"
                        disabled={currentStepIndex < _index}
                        onClick={() => setCurrentStep(step.id)}
                    >
                        <div className="flex min-w-0 flex-1 items-center gap-2 px-1 py-1 focus:outline-none md:flex-none">
                            <span
                                data-state={state}
                                className="data-[state=active]:bg-main-end data-[state=completed]:bg-main-end grid size-6 shrink-0 place-items-center rounded-full bg-[#F4F4F5] text-xs font-bold text-[#52525B] transition-colors data-[state=active]:text-white data-[state=completed]:text-white"
                            >
                                {state === 'completed' ? (
                                    <Check strokeWidth={2} size={16} />
                                ) : (
                                    _index + 1
                                )}
                            </span>

                            <span
                                data-state={state}
                                className="min-w-0 text-left text-sm leading-tight wrap-anywhere capitalize transition-all md:whitespace-nowrap data-[state=active]:font-semibold"
                            >
                                {t(step.label)}
                            </span>
                        </div>

                        {!isLast && <ChevronRight className="size-4 shrink-0 md:size-5" />}
                    </button>
                );
            })}
        </div>
    );
}
