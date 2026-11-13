import { TicketType } from '@/utils/ticketType.util';
import type { FallbackType } from '@/constants/checkout';

import { LicenseMetadata } from './Event';
import { FrontAPIPaginationFilters } from './Fetch';
import { OrderShipment } from './Order';
import SeatingPlanSet, { POSSeatingPlanSet } from './SeatingPlanSet';

export interface ListingPOS {
    items: Listing[];
    hasMore?: boolean;
}

export interface ScarcityBanner {
    enabled: boolean;
    type: string;
    value: number;
}

export interface ListingSearch {
    listings: ListingPOS;
    allInclusive: boolean;
    totalTickets: number;
    hasMore?: boolean;
    scarcityBanner?: ScarcityBanner;
}

export interface ListingSearchFilters extends FrontAPIPaginationFilters {
    event_id: number;
    categories?: string[];
    number_of_tickets?: [number | undefined, string];
    currency_id?: [string | number | undefined, string];
    min_price?: number;
    max_price?: number;
    ticket_type?: [number, string][];
    blocks?: string[];
    skip?: boolean;
    currency_code: string;
    userId?: number;
}

export interface ListingMetadataEvent extends EventSaleTime {
    id: number;
    name: string;
    country_code: string;
    date: string;
    time: string;
    flag: string;
    venue_name: string;
    city_name: string;
    is_restriction_in_com?: number;
    type_name_url?: string;
    subtype_name_url?: string;
    svg_file_path: string | null;
    subtype?: string;
}

export interface EventSaleTime {
    open_sale_timestamp?: string | null;
    open_sale_date?: string | null;
    open_sale_time?: string | null;
    ianaZone?: string | null;
}

export type ListingMetadataBlockItem = {
    blockName: string;
    price: number;
    min_price?: number;
    category?: string;
    category_info?: {
        category_id: string;
        category_name: string;
        min_price: number;
    };
};

export type ListingMetadataBlock = {
    key: string;
    categoryId: number;
    categoryName: string;
    price: number;
    minPrice: number;
    maps_3d_urls?: string[];
};

export type MissingMetadataBlock = {
    category_id: number;
    category_name: string;
    blocks: string[];
    min_price: number | null | undefined;
};

export interface ListingMetadata {
    id?: number;
    min_price?: number;
    max_price?: number;
    blocks?: ListingMetadataBlock[];
    categories?: POSSeatingPlanSet[];
    missing_blocks: MissingMetadataBlock[];
    total_tickets?: number;
    event?: ListingMetadataEvent;
    shouldCache: boolean;
}

export interface ListingRestriction {
    id: number;
    name: string;
    groupRestrictionsId: number;
    name_translation_key: string | null;
}

export interface ListingCheckoutParams {
    quantity: string;
    currencyCode: string;
    countryId?: string | undefined;
    couponCode?: string | undefined;
}

export interface ListingCheckout {
    totalPrice: number;
    vat: number;
    bookingFees: number;
    buyerFees?: number;
    shippingFees: number | null;
    handlingFees: number;
    sellerFees: number;
    sellerTax: number;
    category: string;
    block: string;
    row: string;
    faceValue: number;
    ticketType: string;
    faceValueCurrencyId: number;
    price: number;
    proceedPrice: number;
    performerImage: string | null;
    performerImageCredits?: string | null;
    performerImageSource?: string | null;
    performerName: string;
    listingCurrencyCode: string;
    originalCurrencyTotalPrice: number;
    eventName: string;
    eventTime: string;
    eventDate: string;
    // null when the event is closed (not open for sale)
    eventUrl: string | null;
    fallbackUrl?: string;
    type?: FallbackType | null;
    venueName: string;
    venueNameTranslationKey: string | null;
    eventCity: string;
    eventCountry: string;
    eventCountryCode: string;
    svgFilePath: string;
    specialOlympicsPrice: number;
    originalCurrencySpecialOlympicsPrice: number;
    listing: Listing;
    jwt: string;
    performerFallbackImage?: string;
    couponAmount: number;
    tourNameUrl?: string;
    tourNameEs?: string;
    affiliateId?: number;
    performerImagesMetadata?: {
        license_id: number;
        credits: string | null;
        source: string | null;
    }[];
    availableBalance?: number;
    balanceUsed?: number;
    originalCurrency?: {
        totalPrice?: number;
        price?: number;
        donation?: number;
        currencyId?: number;
        currencyCode?: string;
        couponAmount?: number;
        availableBalance?: number;
        balanceUsed?: number;
        handlingFees?: number;
        shippingFees?: number;
        sellerFees?: number;
        sellerTax?: number;
        vat?: number;
        bookingFees?: number;
        buyerFees?: number;
    };
}

export type ListingCheckoutResponse = Omit<ListingCheckout, 'specialOlympicsPrice'>;

export interface AccountSettingsEvent {
    eventName: string;
    eventNameTranslationKey?: string | null;
    eventDate: string;
    eventTime: string;
    venueName: string;
    cityName: string;
    countryName: string;
    active: boolean;
    soldOut: boolean;
    ticketType: TicketType;
    email?: string;
    mobileLinks?: Array<{ id: number; value: string; ticketNumber: number }>;
    eventImage?: string | null;
    performerImage?: string | null;
    image: string | null;
    performerImagesMetadata?: LicenseMetadata[];
    imagesMetadata?: LicenseMetadata[];
    buyerName?: string;
    transferEmail?: string;
    mobileApp?: {
        id: number;
        name: string;
    };
    shipment?: OrderShipment;
    refetch: () => void;
    allow_downloaded?: boolean;
}

export interface AccountSettingListing extends AccountSettingsEvent {
    id: number;
    eventId: number;
    ticketTypeId: number;
    pricePerTicket: number;
    proceedsPerTicket: number;
    faceValuePerTicket: number;
    numberOfTickets: number;
    ticketsRemaining: number | null;
    presentedQuantity?: number | null;
    category: string | null;
    block: string | null;
    row: string | null;
    seats: string | null;
    seatStart: string | null;
    seatEnd: string | null;
    splitType: string;
    mobileTicketAppId: string | null;
    categoryId: number | null;
    currencyId: number;
    currencyCode: string;
    faceValueCurrencyCode: string;
    seatingPlanCategories: SeatingPlanSet[];
}

export interface ListingUpdate {
    active?: 0 | 1;
    quantity?: string;
    presentedQuantity?: number | null;
    split_type?: string;
    ticket_type?: string;
    mobile_ticket_app_id?: string | null;
    block?: string;
    row?: string;
    seat_start?: string;
    seat_end?: string;
    price?: string;
    currency_id?: number;
    currency?: string;
    category_id?: string | null;
    ticketsRemaining?: string;
    id?: number;
}

export default interface Listing {
    id: number;
    resell_of_listing_id: number | null;
    block: string;
    row: string | null;
    quantity: number;
    country_id: number;
    company_number: string | null;
    ticket_type_label: string;
    ticket_type_id: number;
    has_seat: number;
    uploaded: number;
    listing_split_type: 'none' | 'pairs' | 'any' | 'dont_leave_one';
    is_instant_download?: boolean;
    seat_start: number | null;
    seat_end: number | null;
    currency: number;
    currency_symbol: string;
    currency_code: string;
    face_value: number;
    face_value_currency_code: string;
    face_value_currency_symbol: string;
    category_name: string | null;
    restrictions: ListingRestriction[];
    seat_info: string | null;
    seller_id?: number | null;
    seller_name: string;
    seller_address: string;
    is_trader: boolean;
    price: number;
    proceeds: number;
    fees: number;
    ext_listing_id?: number;
    affiliate_id?: number;
    category_id?: number | string | null;
    category?: SeatingPlanSet;
    event_id?: number;
    tickets_sold?: number;
    sold_on_other_platform?: number;
    is_primary_seller: boolean;
    fans_side: string;
    mobile_ticket_app_name?: string | null;
    quantity_options?: number[];
    quantity_no_presented?: number;
    max_seated_together?: number | null;
}

export interface ExternalDigitalVenueBlocks {
    block: string;
    category_id: number;
    external_3ddv_block: string;
}
