'use client';

import { useTranslations } from 'next-intl';

import { CheckoutStep } from '@/interfaces/Checkout';

import TextSeparator from '@/components/TextSeparator';

import { useCheckoutPayment } from '../../_providers/CheckoutPaymentProvider';
import CheckoutTerm from '../CheckoutTerm';
import CheckoutCards from './CheckoutCards';
import CheckoutStripe from './CheckoutCards/CheckoutStripe';
import CheckoutElements from './CheckoutElements';

export default function CheckoutPaymentMethod() {
    const t = useTranslations();

    // Checkout provider
    const { paymentProvider, currentStep } = useCheckoutPayment();

    const isSpreedly = paymentProvider === 'spreedly';
    const isStripe = paymentProvider === 'stripe';

    return (
        <section
            data-step={currentStep}
            className={`space-y-4 ${currentStep === CheckoutStep.CONFIRM_AND_PAY ? 'block' : 'hidden'}`}
        >
            <div className={isSpreedly ? 'spreedly' : ''}>
                <p className="font-bold text-xl capitalize">{t('select_payment_method')}</p>
                <p className="text-foreground-600 text-sm md:text-base">
                    {t('choose_method_works_best')}
                </p>
            </div>

            {/* GooglePay,ApplePay,Paypal,Klarna,... */}
            <CheckoutElements />

            <TextSeparator title={t('or_pay_by_cb')} />

            {/* Debit/Credit cards */}
            {isStripe ? <CheckoutStripe /> : <CheckoutCards />}

            <CheckoutTerm content={t('by_complete_payment')} />
        </section>
    );
}
