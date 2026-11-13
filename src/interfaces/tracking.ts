export const META_CAPI_STANDARD_EVENTS = {
    PageView: 'PageView',
    ViewContent: 'ViewContent',
    Search: 'Search',
    AddToCart: 'AddToCart',
    AddToWishlist: 'AddToWishlist',
    InitiateCheckout: 'InitiateCheckout',
    AddPaymentInfo: 'AddPaymentInfo',
    Purchase: 'Purchase',
    Lead: 'Lead',
    CompleteRegistration: 'CompleteRegistration',
    Contact: 'Contact',
    Subscribe: 'Subscribe',
};

export type MetaCapiStandardEvent =
    (typeof META_CAPI_STANDARD_EVENTS)[keyof typeof META_CAPI_STANDARD_EVENTS];

export const META_CAPI_ACTION_SOURCES = ['website', 'app', 'phone_call', 'chat', 'email', 'other'];

export type MetaCapiActionSource = (typeof META_CAPI_ACTION_SOURCES)[number];

export interface MetaUserData {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    externalId?: string;
    clientIpAddress?: string;
    clientUserAgent?: string;
    fbp?: string;
    fbc?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
}

export interface MetaEventData {
    eventName: string;
    eventId?: string;
    eventSourceUrl?: string;
    actionSource?: MetaCapiActionSource;
    eventTime?: number;
    userData?: MetaUserData;
    customData?: Record<string, unknown>;
}
