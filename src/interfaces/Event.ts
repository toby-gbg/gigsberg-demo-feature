import type { DateSelectOption } from '@/interfaces/DateSelect';
import { EVENT_GROUP } from '@/constants/events';

import City from './City';
import Country from './Country';
import { PaginationFilters } from './Fetch';
import SeatingPlanSet from './SeatingPlanSet';
import Tour from './Tour';

export interface LicenseMetadata {
    licenseId: number;
    credits: string | null;
    source: string | null;
}

export interface SubtypeEvent {
    eventId: number;
    image: string;
    name: string;
    date: string;
    time: string;
    url: string;
    venueName: string;
    city: string;
    countryCode: string;
    countryName: string;
    performer1Id: number;
    performerImage: string | null;
    subtypeImage: string | null;
    subtypeNameUrl: string;
    typeNameUrl: string;
}

export interface TrendingEventFilters {
    countryId: number;
    fromDate?: string;
}

export interface FrontAPIEvent {
    id: number;
    image: string;
    name: string;
    date: string;
    time: string;
    url: string;
    url_es: string;
    type_id: number;
    type_name_url: string;
    subtype_id: number;
    subtype_name_url: string;
    subtype_image: string;
    open_sale_date: string;
    open_sale_timestamp?: string | null;
    open_sale_time: string;
    open_sale_timezone: string;
    venue_name: string;
    venue_name_translation_key: string | null;
    city_name: string;
    country_code: string;
    country_name: string;
    performer_id: number;
    performer_name: string;
    performer_image: string;
    performer_image_source: string;
    performer_name_url: string;
    tour_name_url: string | null;
    eventNameTranslationKey?: string | null;
    performer_image_credits?: string | null;
    performer_images_metadata?: {
        license_id: number;
        credits: string | null;
        source: string | null;
    }[];
    images_metadata?: {
        license_id: number;
        credits: string | null;
        source: string | null;
    }[];
    has_tickets?: boolean;
    lowest_price?: number | null;
    lowest_price_currency?: string | null;
    tour?: Tour | null;
    tourImage: string | null;
    tour_images_metadata?: {
        license_id: number;
        credits: string | null;
        source: string | null;
    }[];
}

export interface EventTicket {
    id: number;
    eventId: number;
    image?: string;
    eventName: string;
    eventNameTranslationKey?: string | null;
    tour?: Tour | null;
    tourName?: string;
    eventDate: string;
    eventTime: string;
    venueName: string;
    venueNameTranslationKey: string | null;
    cityName: string;
    countryCode: string;
    countryName: string;
    typeNameUrl: string;
    subtypeNameUrl: string;
    entityNameUrl?: string;
    openSaleDate?: string | null;
    openSaleTimestamp?: string | null;
    openSaleTime?: string | null;
    ianaZone?: string | null;
    openSaleTimezone?: string | null;
    performerId: number;
    performerImage: string;
    tourImage: string | null;
    tourImagesMetadata?: LicenseMetadata[] | null;
    subtypeImage: string;
    url: string;
    urlEs: string;
    performerImageCredits?: string | null;
    performerImageSource: string;
    eventType?: string;
    lowestPrice?: number | null;
    lowestPriceCurrency?: string | null;
    hasTickets?: boolean;
    performerImagesMetadata?: LicenseMetadata[];
    imagesMetadata?: LicenseMetadata[];
    availableTickets?: number;
    isSubscribed?: boolean;
    sellingFast?: boolean;
    cityId?: number;
    countryId?: number;
}

export interface FooterEvent {
    id: number;
    name: string;
    url: string;
    urlEs: string;
}

export interface FooterEventsData {
    featureEvents: FooterEvent[];
    popularEvents: FooterEvent[];
    imagesMetadata?: LicenseMetadata[];
}

export type EventTicketByCity = EventTicket & {
    date: string;
    time: string;
    subtypeName: string;
    name: string;
    city: string;
};
export interface FooterEvent {
    id: number;
    name: string;
    url: string;
    urlEs: string;
}

export interface FooterEventsData {
    featureEvents: FooterEvent[];
    popularEvents: FooterEvent[];
}

export interface EventSearchFilterRequest extends DateSelectOption {
    countryId?: number | string;
    tourId?: number;
    cityId?: number | string;
}

export interface EventSearchFilters extends EventSearchFilterRequest, PaginationFilters {
    type?: string | undefined | null;
    subtype?: string | undefined | null;
    skip?: boolean;
    venueId?: string | number;
    nameUrl?: string;
    performerId?: string | number;
    name?: string;
    cityName?: string;
    countryName?: string;
    country?: Country;
    city?: City | null;
    tour?: Tour | null;
    action?: string;
    isProOnly?: number;
    isFestival?: boolean;
    currencyCode?: string;
    shouldMergeWithAvailableData?: boolean;
    from?: string;
}

export interface EventFilterOptionsResponse {
    countries: Country[];
    cities: City[];
    tours: Tour[];
}

export interface EventRestriction {
    id: number;
    text: string;
    priority: number;
}

export interface EventDetailsTour {
    nameUrl?: string;
    nameEs?: string;
    subtype: {
        nameUrl?: string;
        nameEs?: string;
    };
    type: {
        nameUrl?: string;
        nameEs?: string;
    };
}

export interface EventOrganizerContactForm {
    issue: string;
    fullname: string;
    email: string;
    reason: string;
}

/** Performer entry from event details (event→performer relationship). */
export interface EventDetailPerformer {
    name: string;
    nameUrl?: string | null;
    nameEs?: string | null;
    /** Canonical performer page path; omit/null when no performer page exists. */
    url?: string | null;
    urlEs?: string | null;
}

export interface EventDetail {
    id: number;
    name: string;
    nameTranslationKey?: string;
    date: string;
    time: string;
    timezone?: string;
    ianaZone?: string;
    flag: string;
    countryId?: number;
    countryCode: string;
    venueId: number;
    venueName: string;
    venueNameTranslationKey: string | null;
    cityName: string;
    isRestrictionInCom?: number;
    type_name_url?: string;
    subtype_name_url?: string;
    svgFilePath: string | null;

    type: Urls;
    subType: Urls;
    tour: EventDetailsTour;
    venue: Urls;

    seatingPlanName: string;
    seatingPlanCategories: SeatingPlanSet[] | null;
    performerImage: string | null;
    performer1_name?: string | null;
    performer2_name?: string | null;
    /** All linked performers with page URLs from the event→performer relationship. */
    performers?: EventDetailPerformer[];
    performer1?: EventDetailPerformer | null;
    performer2?: EventDetailPerformer | null;

    typeNameEs?: string;
    subtypeNameEs?: string;
    tourNameEs?: string;
    tourTypeNameEs?: string;
    tourSubtypeNameEs?: string;

    typeNameUrl?: string;
    subtypeNameUrl?: string;
    tourTypeNameUrl?: string;
    tourSubtypeNameUrl?: string;
    tourNameUrl?: string;

    url?: string;
    listing?: string;
    entityNameUrl?: string;
    entityNameEsUrl?: string;
    eventImage?: string | null;

    performerImagesMetadata?: LicenseMetadata[];
    imagesMetadata?: LicenseMetadata[];

    isProOnly?: number;
    ticketTypes: {
        id: number;
        name: string;
    }[];
    isSubscribed?: boolean;
}

export interface Urls {
    nameEs?: string | null;
    nameUrl?: string | null;
}

export interface EventRestrictionMessage {
    id: number;
    text: string;
    key: string;
}

export default interface Event {
    title: string;
    date: string;
    location: string;
    city: string;
    image: string;
    link: string;
}

export type EventGroup = (typeof EVENT_GROUP)[keyof typeof EVENT_GROUP];

export type EventTicketsResponse = {
    hasMore: boolean;
    items: EventTicket[];
    nextPage: number | boolean | null;
    prevPage: number | boolean | null;
    totalCount: number;
    totalPages: number;
};
