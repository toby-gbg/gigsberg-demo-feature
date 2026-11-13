import { DomainInfo } from '@/interfaces/Header';
import {
    MetadataTranslationItem,
    MetadataVariableKey,
    WhiteLabelConfig,
} from '@/interfaces/WhiteLabel';
import { getMetadataForDomain } from '@/constants/metadata';

import { capitalizeWords, fallbackTranslation, REGEXP_PREPOSITIONS_MATCH } from './common';
import { getTypeTranslationKey } from './translation/getTypeTranslationKey';

type MetaLevel = 'locale' | 'type' | 'subtype' | 'listing' | 'event';

const buildTranslationVariables = (
    variableKeys: string[] = [],
    variables: Record<string, string>
) => {
    return Object.fromEntries(variableKeys.map((key) => [key, variables[key]]));
};

export const translateMetadata = ({
    t,
    config,
    variables,
    fallback = '',
}: {
    config?: MetadataTranslationItem;
    variables?: Partial<Record<MetadataVariableKey, string>>;
    fallback?: string;
    t: TranslationFunction;
}) => {
    if (!config || !config?.translationKey) return fallback;

    const translatedVariables = variables
        ? buildTranslationVariables(config.variableKeys, variables)
        : {};

    const translation = fallbackTranslation(
        t(config.translationKey, translatedVariables),
        config.translationKey,
        fallback
    );

    return capitalizeWords(translation, REGEXP_PREPOSITIONS_MATCH);
};

export interface MetaLevelData {
    level?: MetaLevel;
    match_type?: string;
    type?: string;
    subtype?: string;
    fallbackType?: string;
    prefix?: string;
    typeName?: string;
    eventName?: string;
    eventVenue?: string;
    eventCity?: string;
    tourName?: string;
    domainInfo: DomainInfo | null | undefined;
}

type TranslationFunction = (key: string, values?: Record<string, string>) => string;

export const generateMetaTitle = (t: TranslationFunction, data: MetaLevelData): string => {
    // Get dynamic type translation key
    const getTypeTranslation = (type?: string, prefix?: string, fallbackType?: string): string => {
        if (!type) return '';

        //In the future, modify so that also accept Comedy
        const needLowercase = !/festival/.test(type || '');

        const translationKey = getTypeTranslationKey(type, prefix);
        const typeTranslation =
            fallbackTranslation(t(translationKey), translationKey, fallbackType ?? '') || type;
        return needLowercase ? typeTranslation.toLowerCase() : typeTranslation;
    };
    const { metadata } = getMetadataForDomain(data.domainInfo?.hostname);

    const brandName = generateSiteName(t, data.domainInfo);
    const typeTranslation = getTypeTranslation(data.type, data.prefix);
    const currentYear = new Date().getFullYear().toString();
    const subtypeTranslation = getTypeTranslation(data.subtype, data.prefix, data.fallbackType);

    switch (data.level) {
        case 'locale':
            return translateMetadata({
                t,
                config: metadata?.title,
                fallback: `Buy concert, sport, theatre tickets online at ${brandName} with confidence`,
            });

        case 'type':
            return translateMetadata({
                t,
                config: metadata?.titleType,
                variables: {
                    type: typeTranslation,
                    currentYear,
                    brandName,
                },
                fallback: `Buy ${typeTranslation || data?.type} Tickets Online - ${brandName}`,
            });

        case 'subtype':
            return translateMetadata({
                t,
                config: metadata?.titleSubtype,
                variables: {
                    type: data.type || typeTranslation,
                    subtype: subtypeTranslation,
                    currentYear,
                    brandName,
                },
                fallback: `Buy ${subtypeTranslation || data?.subtype} Tickets Online - ${brandName}`,
            });

        case 'event':
            return translateMetadata({
                t,
                config: metadata?.titleEvent,
                variables: {
                    type: data.type || typeTranslation,
                    subtype: subtypeTranslation,
                    event: data.eventName || '',
                    brandName,
                },
                fallback: `Buy ${data?.type} Tickets Online - ${brandName}`,
            });

        case 'listing':
            const shareTranslateConfig = (
                data: MetaLevelData,
                config?: MetadataTranslationItem | undefined
            ) => {
                return translateMetadata({
                    t,
                    config,
                    variables: {
                        type: data.type || '',
                        subtype: data.subtype || '',
                        eventName: data.eventName ?? '',
                        eventVenue: data.eventVenue ?? '',
                        eventCity: data.eventCity ?? '',
                        brandName,
                    },
                    fallback: `${data.eventName} ${
                        data.typeName ? `${capitalizeWords(data.typeName)} ` : ''
                    }Tickets - ${brandName}`,
                });
            };

            // Dynamic listing meta title based on type
            if (data.prefix === 'sport' || data.prefix === 'sports') {
                //Remove duplicated tour name in event name - specific to "other sport" listings
                const eventName = data.eventName || '';
                const tourName = data.tourName || '';
                const duplicatedType = eventName.includes(tourName);
                return translateMetadata({
                    t,
                    config: metadata?.titleListingSport,
                    variables: {
                        eventName,
                        subtype: subtypeTranslation,
                        tourName: duplicatedType ? '' : tourName,
                        brandName,
                    },
                    fallback: `${data.eventName} Tickets - ${brandName}`,
                });
            }
            if (data.prefix === 'concert' || data.prefix === 'concerts') {
                return translateMetadata({
                    t,
                    config: metadata?.titleListingConcert,
                    variables: {
                        eventName: data.eventName ?? '',
                        eventVenue: data.eventVenue ?? '',
                        eventCity: data.eventCity ?? '',
                        brandName,
                    },
                    fallback: `${data.eventName} at the ${data.eventVenue}, ${data.eventCity} - ${brandName}`,
                });
            }
            if (data.prefix === 'festival') {
                return shareTranslateConfig(
                    { ...data, type: typeTranslation, subtype: subtypeTranslation },
                    metadata?.titleListingFestival
                );
            }
            if (data.prefix === 'comedy') {
                return shareTranslateConfig(
                    { ...data, type: typeTranslation, subtype: subtypeTranslation },
                    metadata?.titleListingComedy
                );
            }
            if (data.prefix === 'theatre') {
                return shareTranslateConfig(
                    { ...data, type: typeTranslation, subtype: subtypeTranslation },
                    metadata?.titleListingTheatre
                );
            }

        default:
            return translateMetadata({
                t,
                config: metadata?.title,
                fallback: `Live Event Tickets Marketplace - ${brandName}`,
            });
    }
};

export const generateSiteName = (
    t: TranslationFunction,
    domainInfo: { config: WhiteLabelConfig } | null | undefined
): string => {
    const { translationKey = '', fallback = 'Gigsberg' } = domainInfo?.config.seo?.brandName || {};
    return fallbackTranslation(t(translationKey), translationKey, fallback);
};
