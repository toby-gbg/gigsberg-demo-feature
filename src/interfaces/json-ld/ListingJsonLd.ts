// JSON-LD Schema Types
export interface JsonLdContext {
    '@context': string;
}

export interface JsonLdType {
    '@type': string;
}

export interface PostalAddress extends JsonLdType {
    '@type': 'PostalAddress';
    addressLocality: string;
    postalCode?: string;
    addressCountry: string;
}

export interface Place extends JsonLdType {
    '@type': 'Place';
    name: string;
    address: PostalAddress;
}

export interface Organization extends JsonLdType {
    '@type': 'Organization';
    name: string;
    url: string;
}

export interface Offer extends JsonLdType {
    '@type': 'Offer';
    url: string;
    lowPrice: number;
    highPrice: number;
    priceCurrency: string;
    availability: string;
    offerCount: number;
}

export interface SportsTeam extends JsonLdType {
    '@type': 'SportsTeam';
    name: string;
    sport: string;
}

export interface MusicGroup extends JsonLdType {
    '@type': 'MusicGroup';
    name: string;
}

export interface PerformerJsonLd extends JsonLdType {
    '@type': 'Performers';
    name: string;
}

export interface BaseEvent extends JsonLdContext, JsonLdType {
    name: string;
    startDate: string;
    eventStatus: string;
    eventAttendanceMode: string;
    location: Place;
    image?: string[];
    description: string;
    organizer: Organization;
    offers: Offer;
}

export interface SportsEvent extends BaseEvent {
    '@type': 'SportsEvent';
    performer?: SportsTeam[];
}

export interface MusicEvent extends BaseEvent {
    '@type': 'MusicEvent';
    performer?: MusicGroup;
}

export interface TheatreEvent extends BaseEvent {
    '@type': 'TheatreEvent';
    performer?: PerformerJsonLd;
}

export interface ComedyEvent extends BaseEvent {
    '@type': 'ComedyEvent';
    performer?: PerformerJsonLd;
}

export interface Festival extends BaseEvent {
    '@type': 'Festival';
}

export interface GenericEvent extends BaseEvent {
    '@type': 'Event';
}
