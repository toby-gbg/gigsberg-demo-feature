'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';

import GoogleAnalyticsTracker from '@/lib/seo/GoogleAnalyticsTracker';

import Link from '@/components/Link';

import { FAQCategory } from '../_types/faq';

const LINK_MAP = {
    termsAndConditions: {
        url: '/terms-and-conditions',
        event: 'faq_guarantee_link_click',
        method: undefined,
        viewEvent: undefined,
    },

    whatsapp: {
        url: 'https://wa.me/16316869478',
        event: 'faq_contact_click',
        method: 'whatsapp',
        viewEvent: 'faq_contact_impression',
    },

    liveChat: {
        url: 'https://direct.lc.chat/14198268/',
        event: 'faq_contact_click',
        method: 'livechat',
        viewEvent: 'faq_contact_impression',
    },

    supportEmail: {
        url: 'mailto:support@gigsberg.com',
        event: 'faq_contact_click',
        method: 'email',
        viewEvent: 'faq_contact_impression',
    },
    sellingEmail: {
        url: 'mailto:selling@gigsberg.com',
        event: 'faq_contact_click',
        method: 'email',
        viewEvent: 'faq_contact_impression',
    },
} as const;

function FaqTrackedLink({
    children,
    event,
    href,
    method,
    viewEvent,
}: {
    children: ReactNode;
    event: string;
    href: string;
    method?: string;
    viewEvent?: string;
}) {
    const linkRef = useRef<HTMLAnchorElement>(null);

    useEffect(() => {
        if (!viewEvent) return;

        const link = linkRef.current;
        if (!link) return;

        const observer = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) return;

            GoogleAnalyticsTracker.triggerGA4Event({
                event: viewEvent,
                data: { method },
            });
            observer.disconnect();
        });

        observer.observe(link);

        return () => observer.disconnect();
    }, [method, viewEvent]);

    const onClick = () => {
        GoogleAnalyticsTracker.triggerGA4Event({
            event,
            data: { method },
        });
    };

    return (
        <Link
            ref={linkRef}
            href={href}
            onClick={onClick}
            className="text-primary-active hover:underline"
        >
            {children}
        </Link>
    );
}

const useTranslationHelp = (): FAQCategory[] => {
    const t = useTranslations();

    const links = Object.entries(LINK_MAP).reduce<Record<string, (chunks: ReactNode) => ReactNode>>(
        (acc, [key, item]) => {
            acc[key] = (chunks) => (
                <FaqTrackedLink
                    event={item.event}
                    href={item.url}
                    method={item.method}
                    viewEvent={item.viewEvent}
                >
                    {chunks}
                </FaqTrackedLink>
            );
            return acc;
        },
        {}
    );

    return [
        {
            title: t.rich('aboutGigsberg_title', links),
            elements: [
                {
                    question: t.rich('aboutGigsberg_1_name', links),
                    answer: t.rich('aboutGigsberg_1_response', links),
                },
                {
                    question: t.rich('aboutGigsberg_2_name', links),
                    answer: t.rich('aboutGigsberg_2_response', links),
                },
                {
                    question: t.rich('aboutGigsberg_3_name', links),
                    answer: t.rich('aboutGigsberg_3_response', links),
                },
            ],
        },
        {
            title: t.rich('gettingYourTickets_title', links),
            elements: [
                {
                    question: t.rich('gettingYourTickets_1_name', links),
                    answer: t.rich('gettingYourTickets_1_response', links),
                },
                {
                    question: t.rich('gettingYourTickets_2_name', links),
                    answer: t.rich('gettingYourTickets_2_response', links),
                },
                {
                    question: t.rich('gettingYourTickets_3_name', links),
                    answer: t.rich('gettingYourTickets_3_response', links),
                },
                {
                    question: t.rich('gettingYourTickets_4_name', links),
                    answer: t.rich('gettingYourTickets_4_response', links),
                },
                {
                    question: t.rich('gettingYourTickets_5_name', links),
                    answer: t.rich('gettingYourTickets_5_response', links),
                },
                {
                    question: t.rich('gettingYourTickets_6_name', links),
                    answer: t.rich('gettingYourTickets_6_response', links),
                },
                {
                    question: t.rich('gettingYourTickets_7_name', links),
                    answer: t.rich('gettingYourTickets_7_response', links),
                },
                {
                    question: t.rich('gettingYourTickets_8_name', links),
                    answer: t.rich('gettingYourTickets_8_response', links),
                },
                {
                    question: t.rich('gettingYourTickets_9_name', links),
                    answer: t.rich('gettingYourTickets_9_response', links),
                },
            ],
        },
        {
            title: t.rich('choosingYourTickets_title', links),
            elements: [
                {
                    question: t.rich('choosingYourTickets_1_name', links),
                    answer: t.rich('choosingYourTickets_1_response', links),
                },
                {
                    question: t.rich('choosingYourTickets_2_name', links),
                    answer: t.rich('choosingYourTickets_2_response', links),
                },
                {
                    question: t.rich('choosingYourTickets_3_name', links),
                    answer: t.rich('choosingYourTickets_3_response', links),
                },
                {
                    question: t.rich('choosingYourTickets_4_name', links),
                    answer: t.rich('choosingYourTickets_4_response', links),
                },
            ],
        },
        {
            title: t.rich('pricesAndPayment_title', links),
            elements: [
                {
                    question: t.rich('pricesAndPayment_1_name', links),
                    answer: t.rich('pricesAndPayment_1_response', links),
                },
                {
                    question: t.rich('pricesAndPayment_2_name', links),
                    answer: t.rich('pricesAndPayment_2_response', links),
                },
                {
                    question: t.rich('pricesAndPayment_3_name', links),
                    answer: t.rich('pricesAndPayment_3_response', links),
                },
                {
                    question: t.rich('pricesAndPayment_4_name', links),
                    answer: t.rich('pricesAndPayment_4_response', links),
                },
            ],
        },
        {
            title: t.rich('changesCancellationsRefunds_title', links),
            elements: [
                {
                    question: t.rich('changesCancellationsRefunds_1_name', links),
                    answer: t.rich('changesCancellationsRefunds_1_response', links),
                },
                {
                    question: t.rich('changesCancellationsRefunds_2_name', links),
                    answer: t.rich('changesCancellationsRefunds_2_response', links),
                },
                {
                    question: t.rich('changesCancellationsRefunds_3_name', links),
                    answer: t.rich('changesCancellationsRefunds_3_response', links),
                },
                {
                    question: t.rich('changesCancellationsRefunds_4_name', links),
                    answer: t.rich('changesCancellationsRefunds_4_response', links),
                },
                {
                    question: t.rich('changesCancellationsRefunds_5_name', links),
                    answer: t.rich('changesCancellationsRefunds_5_response', links),
                },
            ],
        },
        {
            title: t.rich('sellingTickets_title', links),
            elements: [
                {
                    question: t.rich('sellingTickets_1_name', links),
                    answer: t.rich('sellingTickets_1_response', links),
                },
                {
                    question: t.rich('sellingTickets_2_name', links),
                    answer: t.rich('sellingTickets_2_response', links),
                },
                {
                    question: t.rich('sellingTickets_3_name', links),
                    answer: t.rich('sellingTickets_3_response', links),
                },
                {
                    question: t.rich('sellingTickets_4_name', links),
                    answer: t.rich('sellingTickets_4_response', links),
                },
            ],
        },
        {
            title: t.rich('yourAccount_title', links),
            elements: [
                {
                    question: t.rich('yourAccount_1_name', links),
                    answer: t.rich('yourAccount_1_response', links),
                },
                {
                    question: t.rich('yourAccount_2_name', links),
                    answer: t.rich('yourAccount_2_response', links),
                },
                {
                    question: t.rich('yourAccount_3_name', links),
                    answer: t.rich('yourAccount_3_response', links),
                },
                {
                    question: t.rich('yourAccount_4_name', links),
                    answer: t.rich('yourAccount_4_response', links),
                },
            ],
        },
        {
            title: t.rich('contactUs_title', links),
            elements: [
                {
                    question: t.rich('contactUs_1_name', links),
                    answer: t.rich('contactUs_1_response', links),
                },
            ],
        },
    ];
};

export default useTranslationHelp;
