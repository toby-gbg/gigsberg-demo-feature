import { Fragment, Suspense } from 'react';
import { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { all } from 'better-all';
import { getTranslations } from 'next-intl/server';

import { EventDetail } from '@/interfaces/Event';
import Headers from '@/lib/headers';
import Seo from '@/lib/seo';
import { removeShowPrefix, removeTicketsSuffix } from '@/utils/common';
import { isEventDetail } from '@/utils/event';
import { headingMapper } from '@/utils/mappers/seo/heading.mapper';
import { seoMapper } from '@/utils/mappers/seo/seo.mapper';
import { generateMetaTitle } from '@/utils/metaTitle';
import { findAndApplyStringRule, generateIndexMetaTag } from '@/utils/seo';
import { convertSearchParamsToUrlQuery, redirectNewUrl } from '@/utils/url';
import { eventApi } from '@/services/server/events';
import { seoApi } from '@/services/server/seo';
import { ApiError, hasResponseStatusCode } from '@/services/server/types/errors';

import BreadcrumbJsonLd, { generateBreadcrumbs } from '@/components/JsonLD/BreadcrumbJsonLd';

import EventBasicInformation from './_components/EventBasicInformation';
import ListingFetcher from './_components/ListingFetcher';
import ListingJsonLd from './_components/ListingJsonLd';
import ListingSkeleton from './_components/skeleton/ListingSkeleton';
import { listingParamsCache } from './_searchParams';

export async function generateMetadata({
    params,
    searchParams,
}: PageProps<'/[locale]/[type]/[subtype]/[event]/[listing]'>): Promise<Metadata> {
    const { type, subtype, event, listing, locale } = await params;

    const { t, domainInfo, sData, hrefLangs, canonical, seoData } = await all({
        async t() {
            return getTranslations();
        },
        async domainInfo() {
            return Headers.getDomainInfo();
        },
        async sData() {
            return eventApi.getEventMetadata({
                query: listing,
                type,
                subtype,
                event,
                debug: {
                    callPoint: `/${type}/${subtype}/${event}/${listing} page metadata`,
                },
            });
        },
        async hrefLangs() {
            return Seo.getHreflangTags(await this.$.domainInfo, locale);
        },
        async canonical() {
            return Seo.getCanonicalUrl();
        },
        async seoData() {
            return seoApi.getSeoMetadata({ params: { type, subtype, event, listing } });
        },
    });

    const { subtypeDisplayRules = [] } = domainInfo.config.seo || {};

    const title = generateMetaTitle(t, {
        level: 'listing',
        prefix: sData?.type_name_url,
        type: sData?.subtype_name_url,
        subtype: sData?.subtype_name_url,
        tourName: sData?.tour_name,
        typeName: sData?.subtype_name_url,
        eventName: sData?.event_name,
        eventVenue: sData?.event_venue,
        eventCity: sData?.event_city,
        domainInfo,
    });

    const enGbUrl = hrefLangs['en-GB'];

    const isUkDomain = enGbUrl?.includes('gigsberg.co.uk');

    // Remove hreflang en-GB if event is not in UK and being redirected to domain ".com"
    if (enGbUrl && isUkDomain && sData?.event_country_code !== 'GB') {
        delete hrefLangs['en-GB'];
    }

    const seoMetadata = seoData ? seoMapper(seoData) : null;
    const { openGraph, twitter } = seoMetadata || {};
    const seoImage = {
        url: `/api/og/${type}/${subtype}/${event}/${listing}.png`,
        width: 1200,
        height: 628,
    };

    return {
        ...seoMetadata,
        title: seoMetadata?.title || findAndApplyStringRule(title, subtypeDisplayRules),
        description: findAndApplyStringRule(seoMetadata?.description || '', subtypeDisplayRules),
        metadataBase: new URL(`https://${domainInfo.hostname}`),
        openGraph: {
            ...openGraph,
            siteName: domainInfo.websiteName.toUpperCase(),
            title: openGraph?.title || seoMetadata?.title || title,
            description: openGraph?.description || seoMetadata?.description || undefined,
            type: 'website',
            images: seoImage,
        },
        twitter: {
            ...twitter,
            card: 'summary_large_image',
            title: twitter?.title || seoMetadata?.title || title,
            description: twitter?.description || seoMetadata?.description || undefined,
            images: seoImage,
        },
        alternates: {
            canonical,
            languages: hrefLangs,
        },
        other: {
            ...seoMetadata?.other,
            'twitter:url': seoMetadata?.other?.['twitter:url'] || canonical || '',
        },
        ...generateIndexMetaTag(await searchParams),
    };
}

export default async function ListingPage({
    params,
    searchParams,
}: PageProps<'/[locale]/[type]/[subtype]/[event]/[listing]'>) {
    await listingParamsCache.parse(searchParams);
    const { locale, listing, type, subtype, event } = await params;
    const localeRoute = locale.split('-')[0];
    const searchQuery = convertSearchParamsToUrlQuery(await searchParams);

    const [breadcrumbs, domainInfo, seoData, eventMetadata, eventDetails] = await Promise.all([
        generateBreadcrumbs(type, subtype, event),
        Headers.getDomainInfo(),
        seoApi.getSeoMetadata({ params: { type, subtype, event, listing } }),
        eventApi.getEventMetadata({
            query: listing,
            type,
            subtype,
            event,
            debug: {
                callPoint: '[listing] Page',
                errorRule: `Redirect /${type}/${subtype}/${event}/${listing} to Not Found`,
            },
        }),
        eventApi.getEventDetails({
            eventId: listing,
            debug: {
                callPoint: `/${type}/${subtype}/${event}/${listing} page`,
                errorRule: (error: ApiError) => {
                    const statusCode = error.statusCode;
                    const response = error.response;

                    if (statusCode === 403)
                        return `Listing restricted: Redirect to /${type}/${subtype}/${event}`;

                    if (
                        statusCode === 409 &&
                        hasResponseStatusCode(response) &&
                        response.statusCode === 'event_expired'
                    ) {
                        return `Listing expired: Redirect to /${type}/${subtype}/${event}`;
                    }

                    return `Redirect /${type}/${subtype}/${event}/${listing} to Not Found`;
                },
                successRule: (data: EventDetail | { isRestricted: boolean }) => {
                    if ('url' in data && data.url !== `/${type}/${subtype}/${event}/${listing}`) {
                        return `Redirect to ${data.url}`;
                    }

                    if (!isEventDetail(data)) {
                        return `Redirect to /${type}/${subtype}/${event}`;
                    }

                    return '';
                },
            },
        }),
    ]);

    if (!eventDetails) return notFound();

    const headings = seoData ? headingMapper(seoData) : null;

    await redirectNewUrl({
        locale,
        type,
        subtype,
        event,
        listing,
        domainInfo,
        searchParams: await searchParams,
    });

    if ('url' in eventDetails) {
        //Redirect to the canon url stored in database
        const [_, canonType, canonSubtype, canonEvent, canonListing] = (
            eventDetails.url || ''
        ).split('/');
        if (
            eventDetails.url?.length &&
            (removeTicketsSuffix(canonType) !== removeTicketsSuffix(type) ||
                canonSubtype !== subtype ||
                removeTicketsSuffix(canonEvent) !== removeTicketsSuffix(event) ||
                removeShowPrefix(canonListing) !== removeShowPrefix(listing))
        ) {
            permanentRedirect(`/${localeRoute}${eventDetails.url}?${searchQuery}`);
        }
    }

    // Check event
    if (!isEventDetail(eventDetails)) {
        return permanentRedirect(`/${localeRoute}/${type}/${subtype}/${event}?${searchQuery}`);
    }

    //GM-227: Need to preserve the order we check data to redirect correctly
    if (!eventMetadata) return notFound();

    return (
        <Fragment>
            <EventBasicInformation
                type={type}
                subtype={subtype}
                eventDetails={eventDetails}
                event={event}
                h1={headings?.h1 || null}
            />

            <Suspense fallback={<ListingSkeleton />}>
                <ListingFetcher
                    query={listing}
                    type={type}
                    subtype={subtype}
                    eventDetails={eventDetails}
                />
            </Suspense>

            <Suspense>
                <ListingJsonLd
                    query={listing}
                    type={type}
                    subtype={subtype}
                    event={event}
                    eventDetails={eventDetails}
                />
            </Suspense>

            <BreadcrumbJsonLd breadcrumbs={breadcrumbs} />
        </Fragment>
    );
}
