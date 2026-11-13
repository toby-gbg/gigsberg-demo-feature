import { FastifyPagination } from './Fetch';

export interface UpcomingBigMatchItem {
    id: number;
    homeTeam: string;
    awayTeam: string;
    date: string;
    time: string;
    venue: string;
    price: number;
    name: string;
    eventNameTranslationKey: string;
    url: string;
    weekday: string;
    day: string;
    month: string;
    dateRaw: string;
    performer1Image: string;
    performer2Image: string;
}

export interface UpcomingBigMatchApiItem {
    eventId: number;
    name: string;
    eventNameTranslationKey: null;
    date: string;
    time: string;
    image: string;
    imagesMetadata: [];
    performer1: Performer;
    performer2: Performer;
    venueName: string;
    cityName: string;
    countryCode: string;
    countryName: string;
    subtypeNameUrl: string;
    typeNameUrl: string;
    tourNameUrl: string;
    tourSubtypeId: number;
    sellingFast: boolean;
    hasTickets: boolean;
    lowestPrice: number;
    lowestPriceCurrency: string;
    url: string;
    pinSlot: null;
    tourId: number;
    tourName: string;
    tourImage: string;
}

export interface Performer {
    id: number;
    name: string;
    nameUrl: string;
    image: string;
    imagesMetadata: null;
}

export interface UpcomingBigMatchesResponse {
    items: UpcomingBigMatchApiItem[];
    page: number;
    perPage: number;
    total: number;
    lastPage: number;
}

export type UpcomingBigMatchesPagination = FastifyPagination<UpcomingBigMatchApiItem>;
