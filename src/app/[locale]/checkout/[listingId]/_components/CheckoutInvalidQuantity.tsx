'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

import { FallbackType, getCheckoutRedirectKeys } from '@/constants/checkout';

import useIntlRouter from '@/hooks/useIntlRouter';

import { Card } from '@/components/ui/Card';

interface Props {
    error: string;
    // null when the event is closed (not open for sale)
    eventUrl?: string | null;
    fallbackUrl?: string;
    type?: FallbackType | null;
}

export default function CheckoutInvalidQuantity({ error, eventUrl, fallbackUrl, type }: Props) {
    const t = useTranslations();
    const { push } = useIntlRouter();

    const { title, message, redirecting, href } = getCheckoutRedirectKeys(
        error,
        eventUrl,
        fallbackUrl,
        type
    );

    useEffect(() => {
        const timer = setTimeout(() => push(href), 3000);
        return () => clearTimeout(timer);
    }, [href, push]);

    const text = `${t(message)} ${t(redirecting)}`;

    return (
        <div className="py-10 px-4 grid place-items-center">
            <Card className="bg-white shadow-lg rounded-2xl max-w-2xl w-full overflow-hidden text-center flex items-center p-8 space-y-6">
                <p className="text-3xl font-semibold text-main-end">{t(title)}</p>
                <p>{text}</p>
            </Card>
        </div>
    );
}
