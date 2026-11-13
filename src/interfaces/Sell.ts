import type { PhoneValue } from '@/components/PhoneSelectInput';

import Country from './Country';
import State from './State';

export interface SellForm {
    ticket_type: string;
    quantity: number;
    presented_quantity: number;
    category: string;
    block: string;
    row: string;
    seat_from?: number;
    seat_to?: number | null;
    split_type: string;
    face_value: number;
    face_value_currency: string;
    ticket_price_currency: string;
    ticket_price: number;
    additional_relevant_information: { label: string; value: number }[];
    is_seller_confirmed_ticket_price: boolean;
    is_seller_connected_to_event: string;
    bought_tickets: string;
    address_id?: number;
    cardholder_fullname: string;
    credit_card_number: string;
    card_expiry_date: string;
    postal_address: string;
    postal_code: string;
    postal_city: string;
    postal_country: string;
    postal_zipcode: string;
    phone: PhoneValue;
    country: Country;
    state?: State;
    fullname: string;
    city: string;
    postcode: string;
    address_line1: string;
    address_line2?: string;
    mobile_ticket_app_id?: string;
    identify_document?: File[];
    purchase_document?: File[];
}

export interface ListingDTO {
    eventId: number;
    categoryId?: number;
    row?: string;
    block?: string;
    seatStart?: number;
    seatEnd?: number;
    faceValue: number;
    price: number;
    currencyId: number;
    faceValueCurrencyId: number;
    ticketTypeId: number;
    listingSplitTypeCode: string;
    listingRestrictionIds?: number[];
    quantity: number;
    addressId: number;
    isSellerConnectedToEvent?: number;
    presentedQuantity?: number;
    mobileTicketAppId?: number;
    presentAddressId: number;
    links?: string[];
    active?: number;
    ukCompliant: string;
}
