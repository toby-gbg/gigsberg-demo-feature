import { useTranslations } from 'next-intl';
import { Controller, useFormContext } from 'react-hook-form';

import { CheckoutStep, CheckoutStep1Form } from '@/interfaces/Checkout';
import { isFifaTour } from '@/utils/url';

import { useCheckoutData } from '../../_providers/CheckoutDataProvider';
import { useCheckoutPayment } from '../../_providers/CheckoutPaymentProvider';

export default function CheckoutFifaTermsAndConditionsInput() {
    const t = useTranslations();

    const { data } = useCheckoutData();

    const isFifaTicket = isFifaTour(data.tourNameUrl || '');

    // Payment provider
    const { currentStep } = useCheckoutPayment();

    // Form
    const {
        control,
        formState: { isSubmitting },
    } = useFormContext<CheckoutStep1Form>();

    if (!isFifaTicket) return;

    return (
        <Controller
            control={control}
            name="is_fifa_accept"
            rules={{ required: t('field_not_accepted') }}
            render={({ field: { value, onChange }, fieldState: { error } }) => {
                console.log(error);
                return (
                    <div>
                        <div className="flex gap-x-2 items-start">
                            <input
                                id="fifa-terms"
                                type="checkbox"
                                className="mt-[3px] h-4 w-4 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 shrink-0"
                                disabled={
                                    isSubmitting || currentStep !== CheckoutStep.YOUR_INFORMATION
                                }
                                checked={!!value}
                                onChange={(e) => onChange(e.target.checked)}
                            />
                            <label
                                htmlFor="fifa-terms"
                                className="text-sm flex flex-wrap items-center"
                            >
                                <span>
                                    {t.rich('fifa_terms_and_conditions', {
                                        term: (chunks) => (
                                            <a
                                                href="https://digitalhub.fifa.com/m/c3856874964e176/original/FIFA-World-Cup-2026-Ticketing-Terms-of-Use.pdf"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 underline ltr:ml-1 rtl:mr-1"
                                            >
                                                {chunks}
                                            </a>
                                        ),
                                    })}
                                    <span className="text-red-600 font-bold ltr:ml-1 rtl:mr-1 whitespace-nowrap">
                                        *
                                    </span>
                                </span>
                            </label>
                        </div>

                        {error && <p className="mt-2 text-pink-600 text-sm">{error.message}</p>}
                    </div>
                );
            }}
        />
    );
}
