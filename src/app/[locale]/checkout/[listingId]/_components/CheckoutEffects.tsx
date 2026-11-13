'use client';

import { useEffect } from 'react';
import { useQueryStates } from '@/nuqs/hooks/useQueryStates';
import { useTranslations } from 'next-intl';
import { useMount } from 'react-use';

import { createTranslationKey, fallbackTranslation } from '@/utils/common';

import useIntlRouter from '@/hooks/useIntlRouter';

import { toast } from '@/components/ui/Toast';

import { useCheckoutPayment } from '../_providers/CheckoutPaymentProvider';
import { checkoutSearchParamsParsers } from '../_searchParams';

export default function CheckoutEffects() {
    const t = useTranslations();
    const { refresh } = useIntlRouter();
    const [searchParams, setSearchParams] = useQueryStates(checkoutSearchParamsParsers);
    const { error_message: errorMessage } = searchParams || {};
    const { releaseTicket } = useCheckoutPayment();

    // Clean error_message
    useMount(() => {
        if (!errorMessage) return;

        const msgKey = createTranslationKey(errorMessage, '', { sanitize: true });
        toast.add({
            title: fallbackTranslation(t(msgKey), msgKey, errorMessage),
            type: 'error',
        });

        // delete error_message
        setSearchParams({ error_message: null });

        // Release ticket then delete lead ID
        releaseTicket();
    });

    // Refresh when page load from bfcache (browser's history) to prevent double order
    useEffect(() => {
        const handlePageShow = (event: PageTransitionEvent) => {
            if (event.persisted) refresh();
        };

        window.addEventListener('pageshow', handlePageShow);
        return () => window.removeEventListener('pageshow', handlePageShow);
    }, []);

    return null;
}
