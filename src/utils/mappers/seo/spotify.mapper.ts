import Order from '@/interfaces/Order';
import { SpotifyCheckoutSuccessfulPayload } from '@/interfaces/spotify/SpotifyAd';

export const mapSpotifyPurchaseData = (
    data: Order,
    isNewUser: boolean
): SpotifyCheckoutSuccessfulPayload => {
    return {
        event_id: data.eventId,
        value: data.totalPrice,
        currency: data.orderCurrencyCode,
        quantity: data.quantity,
        order_id: data.id,
        is_new_customer: isNewUser,
        line_items: [
            {
                quantity: data.quantity,
                value: data.totalPrice,
            },
        ],
    };
};
