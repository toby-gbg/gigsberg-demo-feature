'use client';

import { PromotionItem } from '@/interfaces/trackers/GoogleAnalystic';
import GoogleAnalyticsTracker from '@/lib/seo/GoogleAnalyticsTracker';
import SpotifyAdTracker from '@/lib/seo/SpotifyAdTracker';

import useCookie from '@/hooks/useCookie';

import { useCheckoutData } from '../_providers/CheckoutDataProvider';

const useAnalyticsTracker = () => {
    const { data: checkoutData, quantity } = useCheckoutData();
    const {
        listing: { event_id, currency_code },
        totalPrice,
    } = checkoutData;

    const { getEncryptedCookie } = useCookie<PromotionItem>('CHECKOUT_ITEM');

    const triggerGoogleAnalytics = async () => {
        const item = await getEncryptedCookie();
        if (item) {
            GoogleAnalyticsTracker.triggerGA4PromotionEvent('begin_checkout', {
                items: [item],
            });
        }
    };

    const sendDataToTrackers = async () => {
        //Google Analytics
        await triggerGoogleAnalytics();

        //Spotify
        SpotifyAdTracker.trackCheckoutStarted({
            event_id: event_id || 0,
            currency: currency_code,
            quantity,
            value: totalPrice,
        });
    };

    return {
        sendDataToTrackers,
    };
};

export default useAnalyticsTracker;
