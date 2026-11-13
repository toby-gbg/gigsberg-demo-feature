export interface UploadOrderTicketForm {
    files: FileList;
}

export default interface Order {
    id: number;
    quantity: number;
    purchaseDate: number;
    orderStatusId: number;
    totalPrice: number;
    listingId: number;
    listingQuantity: number;
    listingPrice: number;
    listingRow: string | null;
    listingBlock: string | null;
    listingCategory: string | null;
    listingFaceValue: number;
    ticketType: string;
    eventName: string;
    eventDate: string;
    eventTime: string;
    performerImageUrl: string | null;
    venueName: string;
    venueNameTranslationKey: string | null;
    eventCity: string;
    eventCountry: string;
    eventId: number;
    originalCurrencyTotalPrice: number;
    listingCurrencyCode: string;
    eventCountryFlag: string;
    eventCountryCode?: string;
    orderUserEmail: string;
    orderUserFullname: string;
    orderUserPhone: string;
    orderUserCountry?: string;
    orderCurrencyCode: string;
    tax?: number;
    shipping: number;
    couponCode?: string;
    affiliateId?: number;
    totalPrices?: {
        currencyId: number;
        currencyCode: string;
        amount: number;
    }[];
    orderUserPhonePrefix: string;
}

export enum OrderTicketStatus {
    EMPTY = '',
    WAITING = 'WAITING',
    TRANSFERRED = 'TRANSFERRED',
    RECEIVED = 'RECEIVED',
    ON_HOLD = 'ON_HOLD',
    DENY_ENTRY_TO_EVENT = 'DENY_ENTRY_TO_EVENT',
    WAITING_FOR_COURIER_PICKUP = 'WAITING_FOR_COURIER_PICKUP',
}

export interface OrderShipment {
    carrier: string;
    trackingNumber: string;
    pickupDate: string;
    pickupFrom: string;
    pickupTo: string;
    status: OrderTicketStatus;
    labelAvailable: boolean;
}

export interface MobileAppOptionsResponse {
    id: number;
    name: string;
}
