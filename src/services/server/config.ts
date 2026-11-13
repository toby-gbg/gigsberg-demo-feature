import { FansAlsoLikeRequest } from '@/interfaces/Performer';
/**
 * API Configuration
 * Centralized configuration for external API calls
 */

import { removeShowPrefix, removeTicketsSuffix } from '@/utils/common';

export const apiConfig = {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    apiKey: process.env.API_KEY || '',
    timeout: parseInt(process.env.API_TIMEOUT || '30000', 10),
} as const;

/**
 * API endpoints
 * Define your API endpoints here
 */
export const apiEndpoints = {
    affiliates: {
        index: '/affiliates',
        track: '/redirect/track-visit',
        tracking: '/api/affiliates',
    },
    checkout: {
        summary: (listingId: string) => `/checkout/${listingId}`,
        signUrl: '/checkout/sign-url',
        validateUrl: '/checkout/validate-url',
        paymentIntent: (listingId: number) => `/checkout/${listingId}/paymentIntent`,
        lead: '/leads',
    },
    users: {
        current: '/users',
        addresses: '/addresses',
    },
    carousel: '/carousel',
    countries: '/countries',
    states: '/states',
    cities: {
        base: '/cities',
        exploreLocations: '/cities/explore-locations',
    },
    currencies: '/currencies',
    languages: '/languages',
    ip: '/ip',
    mobileAppTickets: '/mobile-ticket-apps',
    subtype: (subtype: string) => `/subtypes/${removeTicketsSuffix(subtype)}/data`,
    typeCheck: (subtype: string) => `/types/check?name_url=${removeTicketsSuffix(subtype)}`,
    subtypeData: ({
        route = 'data',
        type,
        subtype,
        currencyCode,
    }: {
        route?: 'tours' | 'performers' | 'data' | 'slides';
        type: string;
        subtype?: string;
        currencyCode?: string;
    }) =>
        `/subtypes/${route}?type=${removeTicketsSuffix(type)}${subtype ? `&subtype=${subtype}` : ``}${currencyCode ? `&currencyCode=${currencyCode}` : ``}`,
    subtypeFeaturedEvents: ({ type, subtype }: { type: string; subtype?: string }) =>
        `/subtypes/events/featured?type=${removeTicketsSuffix(type)}${subtype ? `&subtype=${subtype}` : ``}`,
    subtypeEvents: ({
        typeId,
        subtypeId,
        nameUrl,
    }: {
        typeId?: number;
        subtypeId?: number;
        nameUrl?: string;
    }) =>
        `/subtypes/events${typeId ? `?typeId=${typeId}` : ''}${subtypeId ? `?subtypeId=${subtypeId}` : ''}${nameUrl ? `&nameUrl=${nameUrl}` : ''}`,
    order: (paymentIntent: string, provider?: string) =>
        `/order-details/${paymentIntent}?provider=${provider}`,
    additionalInformation: (orderId: number) => `/orders/${orderId}/extra-info-schema`,
    subtypes: {
        list: (type?: string) => `/subtypes${type ? `?type=${type}` : ''}`,
        register: '/subtypes/register',
    },
    events: {
        homePage: '/homepage-events',
        search: '/events/search',
        filterOptions: '/events/filter-options',
        details: '/events/details',
        restrictions: (id: number) => `/restrictions/${id}`,
        metadata: '/metadata/event',
        entity: '/events/entity',
        city: (cityName: string) => `/cities/event/${cityName}`,
        guestData: (eventId: number) => `/events/${eventId}/guest-data`,
        upcomingBigMatches: '/events/sports-hero',
        homePageLastMinute: '/homepage-last-minute-events',
        footer: '/events/footer',
    },
    listings: {
        search: '/listings/external-search',
        metadata: '/listings/external-metadata',
        map: '/listings/external-maps-3d-metadata',
        getVenue3DDV: (eventId: number) =>
            `/listings/external-maps-3d-metadata?event_id=${eventId}`,
        userListing: '/listings',
    },
    performers: {
        popular: '/popular-performers',
        metadata: '/performer-metadata',
        fansAlsoLike: (params: FansAlsoLikeRequest) => {
            const { performerId, limit, countryId } = params || {};
            let url = `/performers/${performerId}/fans-also-like`;
            if (limit) {
                url += `?limit=${limit}`;
            }
            if (countryId) {
                url += `&countryId=${countryId}`;
            }
            return url;
        },
    },
    website: {
        all: '/websites',
        detail: (domain: string) => `/websites/${domain}`,
        primaryAffiliates: '/websites/primary-affiliates',
    },
    entity: {
        metadata: '/metadata/entity',
    },
    seo: {
        base: '/seo',
        metadata: ({
            type,
            subtype,
            event,
            listing,
        }: {
            type: string;
            subtype?: string;
            event?: string;
            listing?: string;
        }) => {
            const subtypeURI = subtype ? `/${subtype}` : '';
            const eventURI = event ? `/${removeTicketsSuffix(event)}` : '';
            const listingURI = listing ? `/${removeShowPrefix(listing)}` : '';

            return `seo/metadata/${removeTicketsSuffix(type)}${subtypeURI}${eventURI}${listingURI}`;
        },
        schema: ({
            type,
            subtype,
            event,
            listing,
        }: {
            type: string;
            subtype?: string;
            event?: string;
            listing?: string;
        }) => {
            const subtypeURI = subtype ? `/${subtype}` : '';
            const eventURI = event ? `/${removeTicketsSuffix(event)}` : '';
            const listingURI = listing ? `/${removeShowPrefix(listing)}` : '';

            return `seo/schema/${removeTicketsSuffix(type)}${subtypeURI}${eventURI}${listingURI}`;
        },
    },
    feedback: '/feedback',
} as const;
