import Cookies from 'js-cookie';

import { EventDetail } from '@/interfaces/Event';
import Listing from '@/interfaces/Listing';
import { META_CAPI_STANDARD_EVENTS, MetaEventData, MetaUserData } from '@/interfaces/tracking';
import User from '@/interfaces/User';

import { formatPrice } from './currency.util';

export default class MetaPixelEventMapper {
    static mapUserData(user: User): MetaUserData {
        const fbc = Cookies.get('_fbc');
        const fbp = Cookies.get('_fbp');

        return {
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            phone: user.phone ?? undefined,
            city: user.default_address?.city,
            country: user.default_address?.country.code,
            state: user.default_address?.state?.name,
            zip: user.default_address?.postcode,
            fbc,
            fbp,
        };
    }

    static mapAddToCartData({
        sourceUrl,
        userData,
        checkoutData,
    }: {
        sourceUrl: string;
        userData: MetaUserData | undefined;
        checkoutData: {
            event: EventDetail;
            listing: Listing;
            locale: string;
            useGrossPrice: boolean;
        };
    }): MetaEventData {
        const currencyCode = Cookies.get('USER_CURRENCY_CODE') || 'USD';
        const { event, listing, locale, useGrossPrice } = checkoutData;
        return {
            eventId: `AddToCart_${listing.id}`,
            eventName: META_CAPI_STANDARD_EVENTS.AddToCart,
            userData,
            actionSource: 'website',
            eventTime: new Date().getTime(),
            eventSourceUrl: sourceUrl,
            customData: {
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
            },
        };
    }
}
