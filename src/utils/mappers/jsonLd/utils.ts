import { EventDetail } from '@/interfaces/Event';
import {
    ComedyEvent,
    Festival,
    GenericEvent,
    MusicEvent,
    SportsEvent,
    TheatreEvent,
} from '@/interfaces/json-ld/ListingJsonLd';
import { JsonLdConfigs, MetadataConfig } from '@/interfaces/WhiteLabel';
import {
    capitalizeWords,
    getDateTimeWithTimezone,
    getTimezoneValue,
    removeTicketsSuffix,
} from '@/utils/common';
import { translateMetadata } from '@/utils/metaTitle';
import { getTypeTranslationKey } from '@/utils/translation/getTypeTranslationKey';

export type EventJsonLd =
    SportsEvent | MusicEvent | TheatreEvent | ComedyEvent | Festival | GenericEvent;

type TranslationFunction = (key: string, values?: Record<string, string>) => string;

export const createJsonLdConfig = (
    configs?: Partial<JsonLdConfigs['schemaStrategy']>
): JsonLdConfigs => {
    return {
        activeSchemas: ['Organization', 'Breadcrumbs', 'Event', 'Listing', 'FAQ'],
        schemaStrategy: {
            orgSchemaId: configs?.orgSchemaId || 'organization-jsonld',
            '@id': configs?.['@id'] || 'https://www.gigsberg.com/#Organization',
            name: configs?.name || 'Gigsberg GmbH',
            orgUrl: configs?.orgUrl || 'https://www.gigsberg.com',
            logo: configs?.logo || 'https://www.gigsberg.com/files/images/logos/logo3.png',
            description:
                configs?.description ||
                'Gigsberg is the secured and trusted marketplace to buy and sells concert, theatre, sport tickets online.',
            ...configs,
        },
    };
};

export const getTeamNames = (eventName: string) => {
    let teamNames: string[] = [];

    if (eventName.includes(' vs ')) {
        teamNames = eventName.split(' vs ').map((team) => team.trim());
    } else if (eventName.includes(' at ')) {
        const parts = eventName.split(' at ');
        teamNames = [parts[0].trim()];
    } else {
        teamNames = [eventName.trim()];
    }
    return teamNames;
};

export const getTranslatedMetadata = (params: {
    t: TranslationFunction;
    eventDetail: EventDetail;
    brandName: string;
    metadata?: MetadataConfig;
}) => {
    const { t, metadata, eventDetail, brandName } = params;
    return {
        titleListing: translateMetadata({
            t,
            config: metadata?.titleListing,
            variables: {
                name: eventDetail?.name ?? '',
                venue: eventDetail?.venueName ?? '',
                city: eventDetail?.cityName ?? '',
            },
            fallback: t('listing_title', {
                name: eventDetail?.name ?? '',
                venue: eventDetail?.venueName ?? '',
                city: eventDetail?.cityName ?? '',
            }),
        }),
        titleListingConcert: translateMetadata({
            t,
            config: metadata?.titleListingConcert,
            variables: {
                eventName: eventDetail?.name ?? '',
                eventVenue: eventDetail?.venueName ?? '',
                eventCity: eventDetail?.cityName ?? '',
                brandName,
            },
            fallback: `${eventDetail?.name} at the ${eventDetail?.venueName}, ${eventDetail?.cityName} - ${brandName}`,
        }),
        titleListingTheatre: translateMetadata({
            t,
            config: metadata?.titleListingTheatre,
            variables: {
                eventName: eventDetail?.name ?? '',
                eventVenue: eventDetail?.venueName ?? '',
                brandName,
            },
        }),
        titleListingComedy: translateMetadata({
            t,
            config: metadata?.titleListingComedy,
            variables: {
                eventName: eventDetail?.name ?? '',
                eventVenue: eventDetail?.venueName ?? '',
                brandName,
            },
        }),
        titleListingFestival: translateMetadata({
            t,
            config: metadata?.titleListingFestival,
            variables: {
                eventName: eventDetail?.name ?? '',
                eventVenue: eventDetail?.venueName ?? '',
                brandName,
            },
        }),
        description: translateMetadata({
            t,
            config: metadata?.description,
            fallback: `Official tickets for ${eventDetail?.name} at ${eventDetail?.venueName}. Best prices and guaranteed seats - ${brandName}`,
        }),
    };
};
export const getEventType = (type: string): string => {
    const cleanType = removeTicketsSuffix(type);

    switch (cleanType) {
        case 'concert':
            return 'MusicEvent';
        case 'sport':
            return 'SportsEvent';
        case 'festival':
            return 'Festival';
        case 'comedy':
            return 'ComedyEvent';
        case 'theatre':
            return 'TheatreEvent';
        default:
            return 'Event';
    }
};

export const formatEventDateTimeForEventList = (dateStr: string, timeStr?: string): string => {
    const [day, month, year] = dateStr.split('/');
    const time = timeStr || '20:00';
    const formattedTime = time.includes(':') ? `${time}:00` : time;
    return `${year}-${month}-${day}T${formattedTime}`;
};

export const getOpenSaleISOString = (
    date?: string | null,
    time?: string | null,
    timezone?: string | null,
    openSaleTimestamp?: string | null
): string => {
    if (openSaleTimestamp !== undefined) return openSaleTimestamp || new Date().toISOString();
    if (!date || !time || !getTimezoneValue(timezone)) return new Date().toISOString();
    const dateTime = getDateTimeWithTimezone(date, time, timezone);
    return dateTime?.toUTC?.()?.toISO?.() ?? new Date().toISOString();
};

export const getTypeTranslation = (
    t: TranslationFunction,
    cleanType: string,
    eventSubtype?: string
): string => {
    const translationKey = getTypeTranslationKey(eventSubtype || cleanType, cleanType);
    return capitalizeWords(t(translationKey)) || capitalizeWords(eventSubtype || cleanType);
};
