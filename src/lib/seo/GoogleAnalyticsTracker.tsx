'use client';

import {
    CarouselArrowClickData,
    PodscribeOrderData,
    PromotionCheckoutData,
    PromotionEventData,
    PromotionUserData,
    StudentDiscountPageViewData,
    UserProvidedData,
} from '@/interfaces/trackers/GoogleAnalystic';

/**
 * This class use for handle action for any Analytics Services
 */
export default class GoogleAnalyticsTracker {
    /**
     *
     * @param event (GTM event)
     * @param ecommerce (GTM event items)
     * @returns
     */
    static triggerGA4PromotionEvent(
        event: string,
        ecommerce: PromotionEventData | PromotionCheckoutData
    ) {
        if (!window.dataLayer) return;

        // Clear previous ecommerce object
        window.dataLayer.push({ ecommerce: null });

        // Push new event
        window.dataLayer.push({
            event,
            ecommerce,
        });
    }

    /**
     *
     * @param event (GTM event)
     * @param userData (GTM userData)
     * @returns
     */
    static triggerGA4EcFormSubmit(event: string, userData: PromotionUserData) {
        if (!window.dataLayer) return;

        // Clear previous userData object
        window.dataLayer.push({ userData: null });

        // Push new event
        window.dataLayer.push({
            event,
            userData,
        });
    }

    static triggerUPDSubmit(userData: UserProvidedData) {
        if (!window.dataLayer) return;

        window.dataLayer.push({
            event: 'ec_submit',
            ...userData,
        });
    }

    static triggerPodscribeEvent(data: PodscribeOrderData) {
        if (!window.dataLayer) return;

        // Clear previous podscribe object
        window.dataLayer.push({ podscribe: null });

        window.dataLayer.push({
            event: 'podscribe_purchase',
            podscribe: data,
        });
    }

    /**
     *
     * @param event (GTM event)
     * @param data (GTM StudentDiscountPageViewData)
     * @returns
     */
    static triggerStudentDiscountPageView(
        event: string,
        studentDiscount: StudentDiscountPageViewData
    ) {
        if (!window?.dataLayer) return;

        // Clear previous studentDiscount object
        window.dataLayer.push({ studentDiscount: null });

        window.dataLayer.push({
            event,
            studentDiscount,
        });
    }

    static triggerLocaleChange(targetLocale: string) {
        if (!window.dataLayer) return;

        window.dataLayer.push({
            event: 'locale_change',
            locale: targetLocale,
        });
    }

    static triggerEvent(event: string, data?: Record<string, unknown>) {
        if (!window.dataLayer) return;
        window.dataLayer.push({ event, ...data });
    }

    static triggerCarouselArrowClick(data: CarouselArrowClickData) {
        if (!window.dataLayer) return;

        window.dataLayer.push({ notifyMe: null });

        window.dataLayer.push({
            event: 'click_arrow_in_list_card',
            ...data,
        });
    }

    static triggerGA4Event<T>({ event, key, data }: { event: string; key?: string; data?: T }) {
        if (!window.dataLayer) return;

        if (!key) {
            window.dataLayer.push({ event, ...data });
            return;
        }

        // Clear previous data object
        window.dataLayer.push({ [key]: null });

        window.dataLayer.push({ event, [key]: data });
    }
}
