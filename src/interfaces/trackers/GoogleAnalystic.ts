import { CountryCode } from 'libphonenumber-js';

export interface PromotionItem {
    item_id: string;
    item_name: string;
    item_brand: string;
    item_category: string;
    item_category2: string;
    item_category3: string;
    item_category4: string;
    item_category5: string;
    event_day: string;
    event_hour: string;
    event_date: string;
    event_id: string;
    event_proximity_label?: string;
    price: string | number;
    quantity: number;
    item_list_id?: string;
    item_list_name?: string;
    item_variant?: string;
    currency?: string;
    payment_type?: string;
}

export interface PromotionEventData {
    creative_name?: string;
    creative_slot?: string;
    promotion_id?: string;
    promotion_name?: string;
    items: PromotionItem[];
}

export interface PromotionCheckoutData {
    currency: string;
    value: string | number;
    tax: string | number;
    shipping: string | number;
    transaction_id: string;
    coupon?: string;
    payment_type?: string;
    items: PromotionItem[];
    totalEuroPrice: number;
}

export interface PromotionUserData {
    email: string;
    phone_number: string;
    address: {
        country: string;
    };
}

export interface UserProvidedData {
    hashed_email: string;
    hashed_phone?: string;
}

export interface PodscribeOrderData {
    value: number;
    order_number: number;
    discount_code?: string;
    hashed_email: string;
}

export interface StudentDiscountPageViewData {
    country_code: CountryCode;
}

export interface FansAlsoLikeShownData {
    performer_id: string;
    recommended_ids: string[];
    result_count: number;
    geo: string;
    domain: string;
}

export interface FansAlsoLikeClickData {
    source_performer_id: string;
    clicked_performer_id: string;
    position: number;
    geo: string;
    domain: string;
}

export interface FansAlsoLikeEmptyData {
    performer_id: string;
    geo: string;
    domain: string;
    reason: string;
}

export interface PerformerEventClickData {
    performer_id: string;
    event_id: string;
    price_shown: boolean;
    currency: string;
    domain: string;
}

export interface PerformerPriceDisplayedData {
    performer_id: string;
    event_id: string;
    price: number;
    currency: string;
    domain: string;
}

export type NotifyMeTriggerState = 'sale_not_started' | 'no_inventory';

export interface NotifyMeClickData {
    performer_id: string | null;
    event_id: string;
    trigger_state: NotifyMeTriggerState;
    domain: string;
    user_logged_in: boolean;
}

export interface NotifyMeRegisteredData {
    performer_id: string;
    event_id: string;
    trigger_state: NotifyMeTriggerState;
    domain: string;
}

export interface CarouselArrowClickData {
    arrow: 'prev' | 'next';
    list_type:
        'event_list' | 'city_list' | 'performer_list' | 'fan_also_like_list' | 'subtype_list';
    subtype?: string; // only have subtype if subtype_list is city_page
}
