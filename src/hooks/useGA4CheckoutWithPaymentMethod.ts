'use client';

import { PromotionItem } from '@/interfaces/trackers/GoogleAnalystic';
import GoogleAnalyticsTracker from '@/lib/seo/GoogleAnalyticsTracker';

import useCookie from '@/hooks/useCookie';

export function useGA4CheckoutWithPaymentMethod() {
    const { getEncryptedCookie, setEncryptedCookie } = useCookie<PromotionItem>('CHECKOUT_ITEM');

    const triggerGA4CheckoutWithPaymentMethod = async (payment_type: string) => {
        const item = await getEncryptedCookie();
        if (item) {
            GoogleAnalyticsTracker.triggerGA4PromotionEvent('add_payment_info', {
                payment_type,
                items: [item],
            });

            const newItem = { ...item, payment_type };
            setEncryptedCookie(newItem, { expires: 1 / 12 });
        }
    };

    return { triggerGA4CheckoutWithPaymentMethod };
}
