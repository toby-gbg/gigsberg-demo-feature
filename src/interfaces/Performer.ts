import { CountryCode } from 'libphonenumber-js';

export interface FrontAPIPerformer {
    id: number;
    name: string;
    image: string;
    image_source: string | null;
    image_credits: string | null;
    name_url: string;
    type_id: number;
    type_name_url: string;
    type_name_es: string;
    subtype_name_url: string;
    subtype_name_es: string;
    subtype_image: string | null;
    url: string;
    url_es: string;
    images_metadata?: {
        license_id: number;
        credits: string | null;
        source: string | null;
    }[];
    upcoming_events_count?: number;
    upcoming_event_date?: string;
    upcoming_event_time?: string;
    upcoming_event_venue_name?: string;
    upcoming_event_timezone?: string;
    eventCount?: number | null;
    earliestEventDate?: string | null;
    latestEventDate?: string | null;
    earliestEventIanaZone?: string | null;
}

export interface FansAlsoLikeRequest {
    performerId?: string | number;
    limit?: number;
    countryId?: string | number;
}

export interface PerformerInteractionRequest {
    performerId: string | number;
    clicked_performer_id: number;
}

export interface FansAlsoLikePerformerNextEvent {
    date: string;
    city: string;
    country: CountryCode;
}

export interface FansAlsoLikePerformer {
    performer_id: number;
    name: string;
    name_url: string;
    image_url: string;
    image_credits: string | null;
    image_source: string | null;
    type_name_url: string;
    subtype_name_url: string;
    next_event: FansAlsoLikePerformerNextEvent;
    eventCount?: number | null;
    earliestEventDate?: string | null;
    latestEventDate?: string | null;
    earliestEventIanaZone?: string | null;
}

export interface FansAlsoLike {
    recommendations?: FansAlsoLikePerformer[];
}

export default interface PopularPerformer {
    id: number;
    name: string;
    image: string;
    imageSource: string | null;
    imageCredits: string | null;
    nameUrl: string;
    typeNameUrl: string;
    typeNameEs: string;
    subtypeNameUrl: string;
    subtypeNameEs: string;
    subtypeImage?: string;
    url: string;
    urlEs: string;
    imagesMetadata?: {
        license_id: number;
        credits: string | null;
        source: string | null;
    }[];
    viewsCounterMonthly?: number;
    score?: number;
    upcomingEventsCount?: number;
    upcomingEventDate?: string;
    upcomingEventTime?: string;
    upcomingEventVenueName?: string;
    upcomingEventTimezone?: string;
    eventCount?: number | null;
    earliestEventDate?: string | null;
    latestEventDate?: string | null;
    earliestEventIanaZone?: string | null;
}
