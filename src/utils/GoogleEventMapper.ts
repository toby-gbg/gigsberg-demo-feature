import Cookies from 'js-cookie';
import { sha256 } from 'js-sha256';
import { DateTime } from 'luxon';

import { EventDetail, EventTicket } from '@/interfaces/Event';
import Listing from '@/interfaces/Listing';
import Order from '@/interfaces/Order';
import {
    PromotionCheckoutData,
    PromotionEventData,
    PromotionItem,
} from '@/interfaces/trackers/GoogleAnalystic';
import User from '@/interfaces/User';

import { capitalizeWords } from './common';
import { formatPrice } from './currency.util';
import { getDateProximityLabel } from './dateProximityLabel';

export enum CreativeNameEnum {
    TRENDING_EVENTS = 'Trending Events',
    TRENDING_EVENTS_LAST_MINUTE = 'Trending Events - Last Minute',
    MOST_WANTED_EVENTS = 'Most Wanted Events',
    NEARBY_EVENTS = 'Nearby Events',
    INTERNATIONAL_EVENTS = 'International Events',
    POPULAR_PERFORMERS = 'Popular Performers',
    FESTIVAL_EVENTS = 'Festival Events',
}

export enum CreativeSlotEnum {
    HOME_PAGE = 'Home Page',
    ARTIST_PAGE = 'Artist Page',
    CATEGORY_PAGE = 'Category Page',
}

function parseEventDate(date: string, time: string): DateTime {
    let dateFormat = '';
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
        dateFormat = 'dd/MM/yyyy HH:mm:ss';
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        dateFormat = 'yyyy-MM-dd HH:mm:ss';
    } else {
        dateFormat = 'yyyy-MM-dd HH:mm:ss'; // fallback
    }
    return DateTime.fromFormat(`${date} ${time}`, dateFormat);
}

function normalizeEmail(email?: string): string {
    if (!email) return '';

    const trimmed = email.trim().toLowerCase();
    const match = trimmed.match(/^([^@]+)@(.+)$/);
    if (!match) return trimmed;

    let [, local, domain] = match;

    if (domain === 'gmail.com' || domain === 'googlemail.com') {
        // remove +suffix
        local = local.replace(/\+.*$/, '');
        // remove dots
        local = local.replace(/\./g, '');
    }

    return `${local}@${domain}`;
}

export default class GoogleEventMapper {
    /**
     * Map a SubtypeEvent to PromotionEventData with dynamic creativeName and creativeSlot
     * @param event The event to map
     * @param creativeName The creative name (e.g., "popular performers", "most wanted events", "International Events")
     * @param creativeSlot The creative slot (e.g., "home page", "artist page", "category page")
     */
    static mapEventToPromotionEventData(
        event: EventTicket,
        creativeName: CreativeNameEnum,
        creativeSlot: CreativeSlotEnum
    ): PromotionEventData {
        return {
            creative_name: capitalizeWords(creativeName),
            creative_slot: capitalizeWords(creativeSlot),
            promotion_id: String(event.id),
            promotion_name: `${event.eventName} | ${event.eventDate}`,
            items: [this.mapEventToPromotionItem(event)], // Only 1 items
        };
    }

    static mapEventToPromotionItem(event: EventTicket): PromotionItem {
        const eventDate = parseEventDate(event.eventDate, event.eventTime);
        const eventDay = eventDate.isValid ? eventDate.toFormat('EEEE') : '';
        const eventHour = eventDate.isValid ? eventDate.toFormat('HH:mm') : '';
        const proximityLabel = getDateProximityLabel(event.eventDate, event.eventTime);
        return {
            item_id: String(event.id),
            item_name: `${event.eventName}, ${event.venueName}, ${event.cityName}, ${event.eventDate}`,
            item_brand: event.eventName,
            item_category: event.typeNameUrl
                ? capitalizeWords(event.typeNameUrl.replace(/-/g, ' '))
                : '',
            item_category2: event.subtypeNameUrl
                ? capitalizeWords(event.subtypeNameUrl.replace(/-/g, ' '))
                : '',
            item_category3: event.venueName,
            item_category4: event.cityName,
            item_category5: event.countryName,
            event_day: eventDay,
            event_hour: eventHour,
            event_date: event.eventDate,
            event_id: String(event.id),
            event_proximity_label: proximityLabel ?? '',
            price: 0,
            quantity: 0,
        };
    }

    static mapListingToPromotionItem(
        listing: Listing,
        event: EventDetail,
        locale: string,
        useGrossPrice: boolean
    ): PromotionItem {
        const eventDate = parseEventDate(event.date, event.time);

        const eventDay = eventDate.isValid ? eventDate.toFormat('EEEE') : '';
        const eventHour = eventDate.isValid ? eventDate.toFormat('HH:mm') : '';
        const currencyCode = Cookies.get('USER_CURRENCY_CODE') || 'USD';
        const proximityLabel = getDateProximityLabel(event.date, event.time);
        return {
            item_id: `${event.id} - ${listing.id === 0 ? listing.ext_listing_id : listing.id}`,
            item_name: `${event.name}, ${event.venueName}, ${event.cityName}, ${event.date}`,
            item_brand: event.name,
            item_category: event.type_name_url
                ? capitalizeWords(event.type_name_url.replace(/-/g, ' '))
                : '',
            item_category2:
                event.subType && event.subType.nameUrl
                    ? capitalizeWords(event.subType.nameUrl.replace(/-/g, ' '))
                    : event.subtype_name_url
                      ? capitalizeWords(event.subtype_name_url.replace(/-/g, ' '))
                      : '',
            item_category3: event.venueName,
            item_category4: event.cityName,
            item_category5: event.countryCode,
            item_variant: [
                listing.category_name || listing.category?.name || '',
                listing.block,
                listing.row || 'Seating Together',
            ]
                .filter(Boolean)
                .join('-'),
            event_day: eventDay,
            event_hour: eventHour,
            event_date: event.date,
            event_id: String(event.id),
            event_proximity_label: proximityLabel ?? '',
            price: Number(
                formatPrice(
                    useGrossPrice ? listing.price : listing.proceeds,
                    locale,
                    currencyCode
                ).replace(/[^0-9.]/g, '')
            ),
            currency: currencyCode,
            quantity: listing.quantity,
            item_list_id: event.venueName,
            item_list_name: listing.category_name || listing.category?.name || '',
        };
    }

    static mapOrderToPurchaseEventData(
        order: Order,
        item: PromotionItem,
        locale: string
    ): PromotionCheckoutData {
        const { payment_type, ...itemData } = item;
        const totalPrice = Number(order.totalPrice || 0);
        const currencyCode = order.orderCurrencyCode || order.listingCurrencyCode || '';
        const itemPrice = order.listingPrice || Number(item.price);
        const itemQuantity = item.quantity;
        const tax = Number(order.tax || 0);

        // If totalPrice < tax then shipping = 0 (to avoid negative numbers)
        const shipping = Math.max(totalPrice - Number(order.tax) - itemPrice * itemQuantity, 0);

        const cleanCurrency = (value: number) =>
            Number(formatPrice(value, locale, currencyCode).replace(/[^0-9.]/g, ''));
        const formattedPrice = cleanCurrency(itemPrice);
        itemData.price = formattedPrice;
        itemData.currency = currencyCode;
        return {
            currency: currencyCode, //real transaction currency not manipulated
            value: cleanCurrency(totalPrice), //final total transaction value
            tax: cleanCurrency(tax),
            shipping: cleanCurrency(shipping), // fee & handling
            transaction_id: String(order.id), // order id
            coupon: '',
            payment_type: payment_type || 'credit_card',
            items: [itemData],
            totalEuroPrice:
                order.totalPrices?.find((item) => item.currencyCode === 'EUR')?.amount || 0,
        };
    }

    static mapUserProvidedData(user: User) {
        const { email, phone } = user;
        //remove all dots and remove all part after plus
        const cleanedEmail = normalizeEmail(email);
        const cleanedPhone = (phone || '').trim();

        return {
            hashed_email: sha256(cleanedEmail),
            hashed_phone: sha256(cleanedPhone),
        };
    }
}
