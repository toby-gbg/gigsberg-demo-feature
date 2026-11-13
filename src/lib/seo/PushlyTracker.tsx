'use client';

import Order from '@/interfaces/Order';
import { PushlyViewItemPayload } from '@/interfaces/trackers/Pushly';

/**
 * This class use for handle action for any Analytics Services
 */
export default class PushlyTracker {
    static trackViewItem(payload: PushlyViewItemPayload) {
        if (!window.pushly) return;

        window.pushly('view_item', {
            products: [payload],
        });
    }

    static trackCheckoutStarted(payload: PushlyViewItemPayload) {
        if (!window.pushly) return;

        //We track add_to_cart when checkout start for Pushly
        window.pushly('add_to_cart', {
            products: [payload],
        });
    }

    static trackCheckoutSuccess(payload: Order) {
        if (!window.pushly) return;

        window.pushly('purchase', {
            products: [
                {
                    //pushly's id only accepts string
                    id: payload.id.toString(),
                    eventName: payload.eventName,
                    eventDate: payload.eventDate,
                    price: payload.totalPrice,
                    currency: payload.orderCurrencyCode,
                    venue: payload.venueName,
                    city: payload.eventCity,
                    country: payload.eventCountry,
                },
            ],
        });
    }
}
