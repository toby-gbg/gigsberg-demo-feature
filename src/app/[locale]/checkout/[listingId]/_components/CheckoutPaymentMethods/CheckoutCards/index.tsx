'use client';

import { useState } from 'react';
import Image from 'next/image';

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/Accordion/Accordion';

import { useCheckoutPayment } from '../../../_providers/CheckoutPaymentProvider';
import CheckoutFibonatix from './CheckoutFibonatix';
import CheckoutNomupay from './CheckoutNomupay';
import CheckoutPaycom from './CheckoutPaycom';
import CheckoutSecureTrading from './CheckoutSecureTrading';
import CheckoutSpreedly from './CheckoutSpreedly';
import CheckoutStripe from './CheckoutStripe';

const paymentComponents = {
    nomupay: CheckoutNomupay,
    stripe: CheckoutStripe,
    fibonatix: CheckoutFibonatix,
    paycom: CheckoutPaycom,
    secure: CheckoutSecureTrading,
    zero_pay: null,
    spreedly: CheckoutSpreedly,
} as const;

const PAYMENT_CARD_VALUE = {
    CREDIT_DEBIT_CARD: 'CREDIT_DEBIT_CARD',
    AMERICAN_EXPRESS: 'AMERICAN_EXPRESS',
} as const;

const Checkbox = ({ checked }: { checked: boolean }) => {
    return (
        <div
            data-check={checked}
            className="size-5 rounded-full border p-1 transition-colors data-[check=true]:bg-black"
        >
            <div className="size-full rounded-full bg-white" />
        </div>
    );
};

export default function CheckoutCards() {
    const { paymentProvider, currentMethod } = useCheckoutPayment();
    const [selectedValues, setSelectedValues] = useState<string[]>([]);

    const Component = paymentComponents[paymentProvider];

    const checked = (key: string) => selectedValues.includes(key);

    const checkDisable = (method: 'card' | 'stripe' | 'nomupay' | 'klarna') =>
        currentMethod && currentMethod !== method;

    if (paymentProvider === 'spreedly') {
        return (
            <Accordion className="spreedly" defaultValue={[PAYMENT_CARD_VALUE.CREDIT_DEBIT_CARD]}>
                <AccordionItem
                    value={PAYMENT_CARD_VALUE.CREDIT_DEBIT_CARD}
                    disabled={checkDisable('card')}
                >
                    <AccordionTrigger aria-label="Credit/Debit Card" className="[&>svg]:hidden">
                        <Checkbox checked />

                        <div className="flex w-full items-center justify-between">
                            <p className="font-medium">Credit/Debit Card</p>

                            <div className="grid h-6 w-12 place-items-center overflow-hidden rounded-full border">
                                <Image
                                    src="/checkout/visa-mastercard.png"
                                    alt="visa"
                                    width={40}
                                    height={10}
                                    className="object-fill"
                                />
                            </div>
                        </div>
                    </AccordionTrigger>

                    <AccordionContent>
                        <CheckoutSpreedly />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        );
    }

    return (
        <Accordion value={selectedValues} onValueChange={setSelectedValues}>
            {Component && (
                <AccordionItem
                    value={PAYMENT_CARD_VALUE.CREDIT_DEBIT_CARD}
                    disabled={checkDisable('card')}
                >
                    <AccordionTrigger aria-label="Visa & Mastercard" className="[&>svg]:hidden">
                        <Checkbox checked={checked(PAYMENT_CARD_VALUE.CREDIT_DEBIT_CARD)} />

                        <div className="flex w-full items-center justify-between">
                            <p className="font-medium">Credit/Debit Card</p>

                            <div className="grid h-6 w-12 place-items-center overflow-hidden rounded-full border">
                                <Image
                                    src="/checkout/visa-mastercard.png"
                                    alt="visa"
                                    width={40}
                                    height={10}
                                    className="object-fill"
                                />
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <Component />
                    </AccordionContent>
                </AccordionItem>
            )}

            <AccordionItem
                value={PAYMENT_CARD_VALUE.AMERICAN_EXPRESS}
                disabled={checkDisable('stripe')}
            >
                <AccordionTrigger aria-label="American Express" className="[&>svg]:hidden">
                    <Checkbox checked={checked(PAYMENT_CARD_VALUE.AMERICAN_EXPRESS)} />

                    <div className="flex w-full items-center justify-between">
                        <p className="font-medium">American Express</p>

                        <div className="grid h-6 w-12 place-items-center overflow-hidden rounded-full border">
                            <Image
                                src="/checkout/american-express.png"
                                alt="visa"
                                width={40}
                                height={20}
                                className="object-contain"
                            />
                        </div>
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                    <CheckoutStripe />
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}
