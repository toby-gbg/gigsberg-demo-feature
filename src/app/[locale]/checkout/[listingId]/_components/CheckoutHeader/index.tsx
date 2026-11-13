'use client';

import { Fragment } from 'react/jsx-runtime';

import { CheckoutStep } from '@/interfaces/Checkout';
import { C } from '@/interfaces/Currency';
import { L } from '@/interfaces/Language';

import { useCheckoutPayment } from '../../_providers/CheckoutPaymentProvider';
import CheckoutLogo from './CheckoutLogo';
import CheckoutPriceLocked from './CheckoutPriceLocked';
import CheckoutProgress from './CheckoutProgress';
import CheckoutStepper from './CheckoutStepper';
import LanguageCurrencySelector from './LanguageCurrencySelector';

interface Props {
    currencies: C;
    languages: L;
}

export default function CheckoutHeader({ currencies, languages }: Props) {
    const { currentStep } = useCheckoutPayment();

    return (
        <Fragment>
            <header>
                <div className="flex justify-between items-center gap-5 mx-auto px-4 py-2 max-w-6xl min-h-16">
                    <CheckoutLogo />

                    <div className="hidden md:block">
                        <CheckoutStepper />
                    </div>

                    <LanguageCurrencySelector
                        currentStep={currentStep}
                        currencies={currencies ?? {}}
                        languages={languages}
                    />
                </div>

                <div className="md:hidden px-4">
                    <CheckoutStepper />
                </div>
            </header>

            <CheckoutProgress />
            {currentStep === CheckoutStep.CONFIRM_AND_PAY && <CheckoutPriceLocked />}
        </Fragment>
    );
}
