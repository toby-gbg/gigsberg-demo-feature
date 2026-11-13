'use client';

import { useEffect } from 'react';
import Cookies from 'js-cookie';

import Order from '@/interfaces/Order';
import { PromotionItem } from '@/interfaces/trackers/GoogleAnalystic';
import GoogleAnalyticsTracker from '@/lib/seo/GoogleAnalyticsTracker';
import PushlyTracker from '@/lib/seo/PushlyTracker';
import SpotifyAdTracker from '@/lib/seo/SpotifyAdTracker';
import GoogleEventMapper from '@/utils/GoogleEventMapper';
import { mapSpotifyPurchaseData } from '@/utils/mappers/seo/spotify.mapper';
import { PURCHASE_REDIRECT_KEY } from '@/constants/checkout';

import { useUser } from '@/providers/UserProvider';
import useCookie from '@/hooks/useCookie';

interface Props {
    order: Order;
    paymentIntent: string;
}

export default function ThankYouDataLayer({ order, paymentIntent }: Props) {
    const { getEncryptedCookie: getCheckoutItem, setEncryptedCookie: setCheckoutItem } =
        useCookie<PromotionItem>('CHECKOUT_ITEM');
    const { getCookie: getPurchaseFlag, setCookie: setPurchaseFlag } = useCookie<string>(
        `FIRED_PURCHASE_${order?.id}`
    );

    const user = useUser();

    useEffect(() => {
        Cookies.remove('USER_LEAD');
        Cookies.remove('payment_provider');
    }, []);

    useEffect(() => {
        const triggerPurchaseEvent = async () => {
            if (!order || sessionStorage.getItem(PURCHASE_REDIRECT_KEY) !== paymentIntent) return;
            sessionStorage.removeItem(PURCHASE_REDIRECT_KEY);
            const item = await getCheckoutItem();
            const hasFired = getPurchaseFlag();

            if (!hasFired && item) {
                const purchaseData = GoogleEventMapper.mapOrderToPurchaseEventData(
                    order,
                    item,
                    'en-GB'
                );

                //Google analytics
                GoogleAnalyticsTracker.triggerGA4PromotionEvent('purchase', purchaseData);

                const isNewUser = localStorage.getItem('newUser');
                SpotifyAdTracker.trackCheckoutSuccessful(
                    mapSpotifyPurchaseData(order, isNewUser === 'true')
                );
                localStorage.removeItem('newUser');

                // Trigger ec_formsubmit
                GoogleAnalyticsTracker.triggerGA4EcFormSubmit('ec_formsubmit', {
                    email: order.orderUserEmail,
                    phone_number: order.orderUserPhone,
                    address: {
                        country: order.orderUserCountry || '',
                    },
                });

                //Pushly
                PushlyTracker.trackCheckoutSuccess(order);

                if (user) {
                    //Trigger UPD after purchase
                    const userProvidedData = GoogleEventMapper.mapUserProvidedData(user);
                    GoogleAnalyticsTracker.triggerUPDSubmit(userProvidedData);

                    //Trigger Podscribe event after purchase
                    GoogleAnalyticsTracker.triggerPodscribeEvent({
                        hashed_email: userProvidedData.hashed_email,
                        order_number: order.id,
                        value: order.totalPrice,
                        discount_code: order.couponCode,
                    });
                }

                const newItem = { ...item, payment_type: '' };
                setCheckoutItem(newItem, { expires: 1 / 12 }); // 5 min
                setPurchaseFlag('true', { expires: 1 / 24 }); // 1 hour
            }
        };
        triggerPurchaseEvent();
    }, [order]);
    return null;
}
