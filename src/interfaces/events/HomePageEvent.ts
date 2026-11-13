import type { DateSelectOption } from '@/interfaces/DateSelect';

import Country from '../Country';
import { LicenseMetadata } from '../Event';

export interface HomePageFilters extends DateSelectOption {
    countryId?: number;
    country?: Country | null;
    locationMode?: 'manual' | 'auto';
    skip?: boolean;
}

export default interface HomePageEvent {
    eventId: number;
    typeNameUrl: string;
    subtypeNameUrl: string;
    tourNameUrl: string;
    entityNameUrl: string;
    countryCode: string;
    countryName: string;
    image: string;
    name: string;
    date: string;
    time: string;
    url: string;
    urlEs: string;
    performerImage: string;
    performerImageCredits: string;
    performerImageSource: string;
    subtypeImage: string;
    performer1Id: number;
    city: string;
    venueName: string;
    venueNameTranslationKey: string | null;
    performerIsProOnly: number;
    performerImagesMetadata?: LicenseMetadata[];
    imagesMetadata?: LicenseMetadata[];
    tourImage: string | null;
    tourImagesMetadata?: LicenseMetadata[] | null;
}
