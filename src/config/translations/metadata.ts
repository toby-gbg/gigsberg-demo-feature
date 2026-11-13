import { MetadataConfig, OpenGraphConfig } from '@/interfaces/WhiteLabel';

export const createMetadataConfig = (prefix?: string): MetadataConfig => {
    const getKey = (value: string) => (prefix ? `${prefix}_${value}` : value);

    return {
        title: {
            translationKey: getKey('meta_title'),
            variableKeys: [],
        },

        description: {
            translationKey: getKey('meta_description'),
            variableKeys: [],
        },

        titleType: {
            translationKey: getKey('meta_title_type'),
            variableKeys: ['type', 'brandName', 'currentYear'],
        },

        titleSubtype: {
            translationKey: getKey('meta_title_subtype'),
            variableKeys: ['type', 'subtype', 'brandName', 'currentYear'],
        },

        titleEvent: {
            translationKey: getKey('meta_title_event'),
            variableKeys: ['type', 'subtype', 'event', 'brandName'],
        },

        titleListing: {
            translationKey: getKey('listing_title'),
            variableKeys: ['name', 'venue', 'city'],
        },

        titleListingSport: {
            translationKey: getKey('meta_title_listing_sport'),
            variableKeys: ['eventName', 'subtype', 'tourName', 'brandName'],
        },

        titleListingConcert: {
            translationKey: getKey('meta_title_listing_concert'),
            variableKeys: ['eventName', 'eventVenue', 'eventCity'],
        },

        titleListingFestival: {
            translationKey: getKey('meta_title_listing_festival'),
            variableKeys: ['eventName'],
        },

        titleListingComedy: {
            translationKey: getKey('meta_title_listing_comedy'),
            variableKeys: ['eventName', 'eventVenue'],
        },

        titleListingTheatre: {
            translationKey: getKey('meta_title_listing_theatre'),
            variableKeys: ['eventName', 'eventVenue', 'subtype'],
        },
    };
};

export const createOpenGraphConfig = (prefix?: string): OpenGraphConfig => {
    const getKey = (value: string) => (prefix ? `${prefix}_${value}` : value);

    return {
        ogTitle: {
            translationKey: getKey('meta_title'),
            variableKeys: [],
        },

        ogDescription: {
            translationKey: getKey('meta_description'),
            variableKeys: [],
        },
    };
};

export const createMarcaOGConfig = (): OpenGraphConfig => {
    return {
        ogTitle: {
            translationKey: 'marca_og_title',
            variableKeys: [],
        },
        ogDescription: {
            translationKey: 'marca_og_description',
            variableKeys: [],
        },
    };
};
