'use client';

import { FC, HTMLAttributes } from 'react';
import { CircleCheck, Headphones, Lock, ShieldCheck, type LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';
import { fallbackTranslation } from '@/utils/common';

const TRUST_BENEFITS: {
    Icon: LucideIcon;
    titleKey: string;
    titleFallback: string;
    descriptionKey: string;
    descriptionFallback: string;
}[] = [
    {
        Icon: ShieldCheck,
        titleKey: 'sport_buyer_guarantee_title',
        titleFallback: 'Buyer Guarantee',
        descriptionKey: 'sport_buyer_guarantee_description',
        descriptionFallback: 'Get 100% of your money back if your event is cancelled',
    },
    {
        Icon: CircleCheck,
        titleKey: 'sport_verified_tickets_title',
        titleFallback: 'Verified Tickets',
        descriptionKey: 'sport_verified_tickets_description',
        descriptionFallback: 'All tickets are verified by our team',
    },
    {
        Icon: Lock,
        titleKey: 'sport_secure_payments_title',
        titleFallback: 'Secure Payments',
        descriptionKey: 'sport_secure_payments_description',
        descriptionFallback: 'Your payment information is always protected',
    },
    {
        Icon: Headphones,
        titleKey: 'sport_customer_support_title',
        titleFallback: '24/7 Customer Support',
        descriptionKey: 'sport_customer_support_description',
        descriptionFallback: "We're here to help you anytime, anywhere",
    },
];

const TrustBenefitStrip: FC<HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
    const t = useTranslations();

    return (
        <section className={cn('mx-auto', className)} {...props}>
            <div className="rounded-2xl bg-header px-6 py-8 sm:px-8 lg:px-10 lg:py-10 [border:var(--trust-benefit-border)]">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 xl:grid-cols-4 lg:gap-6 xl:gap-8">
                    {TRUST_BENEFITS.map(
                        ({
                            Icon,
                            titleKey,
                            titleFallback,
                            descriptionKey,
                            descriptionFallback,
                        }) => (
                            <div key={titleKey} className="flex items-start gap-3">
                                <Icon
                                    className="mt-0.5 shrink-0 text-on-header"
                                    size={24}
                                    strokeWidth={1.75}
                                    aria-hidden
                                />
                                <div className="min-w-0">
                                    <h3 className="text-base leading-6 font-bold text-on-header">
                                        {fallbackTranslation(t(titleKey), titleKey, titleFallback)}
                                    </h3>
                                    <p className="mt-0.5 text-sm leading-5 text-on-header">
                                        {fallbackTranslation(
                                            t(descriptionKey),
                                            descriptionKey,
                                            descriptionFallback
                                        )}
                                    </p>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>
        </section>
    );
};

export default TrustBenefitStrip;
