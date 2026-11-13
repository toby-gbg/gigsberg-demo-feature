import { FAQCategory } from '@/app/[locale]/faqs/_types/faq';

import { EventDetail, EventTicket } from '@/interfaces/Event';
import { DomainInfo } from '@/interfaces/Header';
import type {
    ComedyEvent,
    Festival,
    GenericEvent,
    MusicEvent,
    SportsEvent,
    TheatreEvent,
} from '@/interfaces/json-ld/ListingJsonLd';
import Listing, { ListingMetadata } from '@/interfaces/Listing';
import { JsonLdConfigs, SocialHandles } from '@/interfaces/WhiteLabel';
import { formatEventDateTime, removeTicketsSuffix } from '@/utils/common';
import { generateSiteName } from '@/utils/metaTitle';
import { GIGSBERG_SOCIAL } from '@/constants/seo';

import {
    formatEventDateTimeForEventList,
    getOpenSaleISOString,
    getTeamNames,
    getTranslatedMetadata,
    getTypeTranslation,
    type EventJsonLd,
} from './utils';

const SOCIAL_DEFAULT: SocialHandles = {
    facebook: GIGSBERG_SOCIAL.facebook,
    x: GIGSBERG_SOCIAL.x,
    instagram: GIGSBERG_SOCIAL.instagram,
    tiktok: GIGSBERG_SOCIAL.tiktok,
    linkedin: GIGSBERG_SOCIAL.linkedin,
    youtube: GIGSBERG_SOCIAL.youtube,
};

export class JsonLdFactory {
    // ----------------------------------------------------
    // 1. HOMEPAGE: Organization Schema
    // ----------------------------------------------------
    static buildOrganization(
        strategy: JsonLdConfigs['schemaStrategy'],
        social: SocialHandles = SOCIAL_DEFAULT
    ) {
        const sameAs = [
            social.facebook,
            social.x,
            social.instagram,
            social.tiktok,
            social.linkedin,
            social.youtube,
        ].filter(Boolean);

        return {
            '@context': 'http://schema.org',
            '@type': 'Organization',
            '@id':
                strategy['@id'] || `${strategy.orgUrl || 'https://www.gigsberg.com'}/#Organization`,
            name: strategy.name,
            url: strategy.orgUrl || 'https://www.gigsberg.com',
            logo: strategy.logo || 'https://www.gigsberg.com/files/images/logos/logo3.png',
            description:
                strategy.description ||
                'Gigsberg is the secured and trusted marketplace to buy and sells concert, theatre, sport tickets online.',
            address: {
                '@type': 'PostalAddress',
                streetAddress: 'Gewerbestrasse 5',
                addressLocality: 'Cham',
                addressRegion: 'Zug',
                postalCode: '6330',
                addressCountry: 'CH',
            },
            sameAs,
            contactPoint: [
                {
                    '@type': 'ContactPoint',
                    email: 'support@gigsberg.com',
                    contactType: 'For support and information',
                },
                {
                    '@type': 'ContactPoint',
                    email: 'selling@gigsberg.com',
                    contactType: 'For ticket selling or reselling',
                },
            ],
        };
    }

    // ----------------------------------------------------
    // 2. BREADCRUMBS: BreadcrumbList Schema
    // ----------------------------------------------------
    static buildBreadcrumbs(
        breadcrumbs: Array<{ name: string; href: string }>,
        baseUrl: string,
        localePath: string
    ) {
        return {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: breadcrumbs.map((item, idx) => ({
                '@type': 'ListItem',
                position: idx + 1,
                name: item.name,
                item: baseUrl + localePath + item.href,
            })),
        };
    }

    // ----------------------------------------------------
    // 3. PERFORMERS PAGE: Event List Schema
    // ----------------------------------------------------
    static buildEventList(events: EventTicket[], performerName: string, baseUrl: string) {
        return events.map((event) => ({
            '@context': 'http://schema.org',
            '@type': 'MusicEvent',
            name: performerName,
            startDate: formatEventDateTimeForEventList(event.eventDate, event.eventTime), // Parsed & formatted externally
            endDate: null,
            url: baseUrl,
            description: null,
            location: {
                '@type': 'Place',
                name: event.venueName,
                address: {
                    '@type': 'PostalAddress',
                    addressLocality: event.cityName,
                    addressCountry: event.countryName,
                },
            },
            image: `${process.env.NEXT_PUBLIC_IMAGE_URL}/performers/${event.performerImage}`,
            offers: {
                '@type': 'Offer',
                category: 'Secondary',
                priceCurrency: 'USD',
                price: '85.00',
                url: `${baseUrl}/show-${event.id}`,
                availability: 'http://schema.org/InStock',
                validFrom: getOpenSaleISOString(
                    event.openSaleDate,
                    event.openSaleTime,
                    event.openSaleTimezone,
                    event.openSaleTimestamp
                ),
            },
            performer: null,
        }));
    }

    // ----------------------------------------------------
    // 4. LISTINGS: Detailed Event & Offers Schema
    // ----------------------------------------------------
    static buildDetailedEvent(
        data: {
            eventDetail: EventDetail;
            listings: Listing[];
            metadata: ListingMetadata;
            url: string;
            logo: string;
            eventType: string; // resolved via getEventType('concert' | 'sport')
            subtype?: string; // for translation keys (e.g. 'football', 'rock')
            domainInfo?: DomainInfo;
        },
        t: (key: string, args?: Record<string, string>) => string
    ): EventJsonLd {
        const { metadata } = data?.domainInfo?.config?.seo || {};

        const startDate = formatEventDateTime(
            data.eventDetail.date,
            data.eventDetail.time,
            data.eventDetail.timezone || '0'
        );

        const brandName = generateSiteName(t, data.domainInfo);

        const {
            titleListing,
            titleListingConcert,
            titleListingTheatre,
            titleListingComedy,
            titleListingFestival,
            description,
        } = getTranslatedMetadata({
            t,
            brandName,
            eventDetail: data.eventDetail,
            metadata,
        });

        const baseEventData = {
            '@context': 'https://schema.org' as const,
            name: titleListing,
            startDate,
            eventStatus: 'https://schema.org/EventScheduled' as const,
            eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode' as const,
            location: {
                '@type': 'Place' as const,
                name: data.eventDetail.venueName,
                address: {
                    '@type': 'PostalAddress' as const,
                    addressLocality: data.eventDetail.cityName,
                    addressCountry: data.eventDetail.countryCode?.toUpperCase(),
                },
            },
            image: data.eventDetail.performerImage
                ? [
                      `${process.env.NEXT_PUBLIC_IMAGE_URL}/performers/${data.eventDetail.performerImage}` ||
                          data.logo,
                  ]
                : [data.logo],
            description,

            organizer: {
                '@type': 'Organization' as const,
                name: brandName,
                url: data.url,
            },
            offers: {
                '@type': 'Offer' as const,
                url: data.url,
                lowPrice: data.metadata.min_price || 0,
                highPrice: data.metadata.max_price || 0,
                priceCurrency: data.listings[0]?.currency_code || 'USD',
                availability: 'https://schema.org/InStock' as const,
                offerCount: data.metadata.total_tickets || data.listings.length,
            },
        };

        const builders: Record<string, () => EventJsonLd> = {
            SportsEvent: () => {
                const event: SportsEvent = {
                    ...baseEventData,
                    '@type': 'SportsEvent',
                };
                const translatedSport = getTypeTranslation(
                    t,
                    removeTicketsSuffix(data.subtype || data.eventType),
                    data.subtype
                );
                const teamNames = getTeamNames(data.eventDetail.name);
                if (teamNames.length > 0) {
                    event.performer = teamNames.map((name) => ({
                        '@type': 'SportsTeam',
                        name,
                        sport: translatedSport,
                    }));
                }
                return event;
            },

            MusicEvent: () => {
                const event: MusicEvent = {
                    ...baseEventData,
                    '@type': 'MusicEvent',
                };
                if (data.eventDetail.name) {
                    event.performer = {
                        '@type': 'MusicGroup',
                        name: data.eventDetail.name,
                    };
                    event.description = titleListingConcert;
                }
                return event;
            },

            TheatreEvent: () => {
                const event: TheatreEvent = {
                    ...baseEventData,
                    '@type': 'TheatreEvent',
                };
                if (data.eventDetail.name) {
                    event.performer = {
                        '@type': 'Performers',
                        name: data.eventDetail.name,
                    };
                }
                event.description = titleListingTheatre;
                return event;
            },

            ComedyEvent: () => {
                const event: ComedyEvent = {
                    ...baseEventData,
                    '@type': 'ComedyEvent',
                };
                if (data.eventDetail.name) {
                    event.performer = {
                        '@type': 'Performers',
                        name: data.eventDetail.name,
                    };
                }
                event.description = titleListingComedy;
                return event;
            },

            Festival: () => {
                const event: Festival = {
                    ...baseEventData,
                    '@type': 'Festival',
                };
                event.description = titleListingFestival;
                return event;
            },
        };

        return (
            builders[data.eventType] ??
            (() =>
                ({
                    ...baseEventData,
                    '@type': 'Event',
                }) as GenericEvent)
        )();
    }

    // ----------------------------------------------------
    // 5. FAQ PAGE: FAQPage Schema
    // ----------------------------------------------------
    static buildFaqPage(helps: FAQCategory[]) {
        return {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: helps.flatMap((section) =>
                section.elements.map(({ question, answer }) => ({
                    '@type': 'Question',
                    name: question?.toString(),
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: answer?.toString(),
                    },
                }))
            ),
        };
    }
}
