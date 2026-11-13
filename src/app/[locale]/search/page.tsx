import { Suspense } from 'react';
import { Metadata } from 'next';
import SearchFetcher from '@/app/[locale]/search/_components/SearchFetcher';
import SearchViewTitle from '@/app/[locale]/search/_components/SearchPageViewTitle';
import SearchResultsJsonLd from '@/app/[locale]/search/_components/SearchResultsJsonLd';
import { searchParamsCache } from '@/nuqs/params/search';
import { all } from 'better-all';
import { getTranslations } from 'next-intl/server';

import Headers from '@/lib/headers';
import { fallbackTranslation } from '@/utils/common';
import { generateSiteName } from '@/utils/metaTitle';
import { generateIndexMetaTag } from '@/utils/seo';

import { SearchProvider } from '@/providers/SearchProvider';

import ErrorBoundary from '@/components/ErrorBoundary';
import { ListEventDetailsCardSkeleton } from '@/components/EventDetailsCardSkeleton';
import MainContainer from '@/components/MainContainer';
import SearchFilterSection from '@/components/search/SearchFilterSection';
import SectionError from '@/components/SectionError';
import TrustBenefitStrip from '@/components/TrustBenefitStrip';

export async function generateMetadata({
    params: pageParams,
    searchParams: searchParamsProp,
}: PageProps<'/[locale]/search'>): Promise<Metadata> {
    const {
        pageParams: { locale },
        rawSearchParams, // search params for Index Meta Tag
        searchParams, // search params nuqs schema
        fullUrl,
        domainInfo,
        t,
    } = await all({
        async pageParams() {
            return pageParams;
        },
        async rawSearchParams() {
            return searchParamsProp;
        },
        async searchParams() {
            return searchParamsCache.parse(searchParamsProp);
        },
        async fullUrl() {
            return Headers.getCurrentUrl();
        },
        async domainInfo() {
            return Headers.getDomainInfo();
        },
        async t() {
            return getTranslations({ locale: (await this.$.pageParams).locale });
        },
    });

    const brandName = generateSiteName(t, domainInfo);

    const { fromDate, toDate, city, country, cityId, countryId, q, subtype } = searchParams;

    const base = generateIndexMetaTag(rawSearchParams);
    const where = city || country;
    const formatDate = (date: string) =>
        new Intl.DateTimeFormat(locale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }).format(new Date(`${date}T00:00:00`));
    const date = (() => {
        if (fromDate && toDate) {
            const key = 'search_meta_date_range';
            return fallbackTranslation(
                t(key, { fromDate, toDate }),
                key,
                `${formatDate(fromDate)} - ${formatDate(toDate)}`
            );
        }
        if (fromDate) {
            const key = 'search_meta_date_from';
            return fallbackTranslation(t(key, { date: fromDate }), key, formatDate(fromDate));
        }
        if (toDate) {
            const key = 'search_meta_date_until';
            return fallbackTranslation(t(key, { date: toDate }), key, formatDate(toDate));
        }
        return undefined;
    })();
    const hasLocationFilter = Boolean(where || cityId || countryId);
    const ticketsLabel = fallbackTranslation(t('tickets'), 'tickets', 'tickets').toLowerCase();
    const locationLabel = fallbackTranslation(t('location'), 'location', 'selected location')
        .replace(/:$/, '')
        .toLowerCase();
    const searchEventsLabel = fallbackTranslation(
        t('search_events'),
        'search_events',
        'Search events'
    );
    const fallbackSubject = q
        ? `${q} ${ticketsLabel}`
        : subtype
          ? `${subtype} ${ticketsLabel}`
          : fallbackTranslation(t('event_ticket_result'), 'event_ticket_result', 'Event tickets');
    const fallbackScope = [where ?? (hasLocationFilter ? locationLabel : undefined), date]
        .filter(Boolean)
        .join(' ');
    const fallbackTitle = `${fallbackSubject}${fallbackScope ? ` ${fallbackScope}` : ''} | ${brandName}`;
    const fallbackDescription = `${searchEventsLabel}: ${fallbackSubject.toLowerCase()}${
        fallbackScope ? ` ${fallbackScope}` : ''
    } - ${brandName}.`;
    const translationValues = {
        query: q ?? '',
        location: where ?? '',
        date: date ?? '',
        subtype: subtype ?? '',
    };
    const titleKey = q
        ? where
            ? 'search_meta_title_with_location'
            : 'search_meta_title'
        : 'search_meta_filter_title';
    const descriptionKey = q
        ? where
            ? 'search_meta_description_with_location'
            : 'search_meta_description'
        : 'search_meta_filter_description';
    const title = fallbackTranslation(t(titleKey, translationValues), titleKey, fallbackTitle);
    const description = fallbackTranslation(
        t(descriptionKey, translationValues),
        descriptionKey,
        fallbackDescription
    );

    return {
        ...base,
        title,
        description,
        alternates: { canonical: fullUrl },
    };
}

const SearchPage = async ({ searchParams: searchParamsProp }: PageProps<'/[locale]/search'>) => {
    await searchParamsCache.parse(searchParamsProp); // search params nuqs schema

    return (
        <>
            <Suspense>
                <SearchResultsJsonLd />
            </Suspense>
            <SearchProvider
                intlKey={{
                    title: 'event_ticket_result',
                }}
            >
                <MainContainer className="gap-y-5 grid grid-cols-1 py-10">
                    {/* Header section */}
                    <SearchViewTitle />

                    {/* Search filter section */}
                    <SearchFilterSection />

                    {/* event list section */}
                    <Suspense fallback={<ListEventDetailsCardSkeleton />}>
                        <ErrorBoundary
                            fallback={
                                <SectionError>
                                    <ListEventDetailsCardSkeleton />
                                </SectionError>
                            }
                        >
                            <SearchFetcher />
                        </ErrorBoundary>
                    </Suspense>

                    {/* benefit strip */}
                    <TrustBenefitStrip />
                </MainContainer>
            </SearchProvider>
        </>
    );
};

export default SearchPage;
