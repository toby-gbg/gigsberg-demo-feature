import Cookies from 'js-cookie';

import { EventDetail } from '@/interfaces/Event';
import Listing from '@/interfaces/Listing';
import { PushlyViewItemPayload } from '@/interfaces/trackers/Pushly';

import { formatPrice } from './currency.util';

export default class PushlyEventMapper {
    static mapAddToCartData(
        event: EventDetail,
        listing: Listing,
        locale: string,
        useGrossPrice: boolean
    ): PushlyViewItemPayload {
        const currencyCode = Cookies.get('USER_CURRENCY_CODE') || 'USD';
        return {
            id: event.id,
            eventName: event.name,
            eventDate: event.date,
            currency: currencyCode,
            price: Number(
                formatPrice(
                    useGrossPrice ? listing.price : listing.proceeds,
                    locale,
                    currencyCode
                ).replace(/[^0-9.]/g, '')
            ),
            venue: event.venueName,
            city: event.cityName,
            country: event.countryCode,
        };
    }
}
