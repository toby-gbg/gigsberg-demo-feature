'use server';

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import Headers from '@/lib/headers';
import Seo from '@/lib/seo';
import { convertNameUrlToLabel, fallbackTranslation } from '@/utils/common';
import { generateIndexMetaTag } from '@/utils/seo';
import { convertUrlToKeyTranslate } from '@/utils/translation/getTypeSubtypeTranslations';
import { eventApi } from '@/services/server/events';
import { websiteApi } from '@/services/server/website';
import { CITY_KEY_PREFIX } from '@/constants/translation';

import CityMain from './_components/CityMain';

// Translation for metatitle
type TranslationFunction = (key: string, values?: Record<string, string>) => string;
const translateMetaContent = (t: TranslationFunction, cityName: string, domain: string) => {
    const cityKeyTranslate = convertUrlToKeyTranslate(cityName, CITY_KEY_PREFIX);
    const translatedCityName = fallbackTranslation(
        t(cityKeyTranslate),
        cityKeyTranslate,
        convertNameUrlToLabel(cityName)
    );

    const translatedTitle = fallbackTranslation(
        t('city_page_title', {
            city: translatedCityName,
        }),
        'city_page_title',
        `Concerts & events in ${translatedCityName}`
    );

    const translatedDescription = fallbackTranslation(
        t('city_page_description', {
            city: translatedCityName,
            domain,
        }),
        'city_page_description',
        `Find tickets for concerts, comedy and theatre in ${translatedCityName}. Rock & pop shows, live events tickets with fast and reliable booking on ${domain}.`
    );
    return { translatedCityName, translatedTitle, translatedDescription };
};

export async function generateMetadata({
    params,
    searchParams,
}: PageProps<'/[locale]/cities/[cityName]'>): Promise<Metadata> {
    const { cityName, locale } = await params;
    // Query data
    const [canonical, domainInfo, website] = await Promise.all([
        Seo.getCanonicalUrl(),
        Headers.getDomainInfo(),
        await websiteApi.getWebsite(),
    ]);

    const hrefLangs = await Seo.getHreflangTags(domainInfo, locale);
    const t = await getTranslations();
    const { translatedTitle, translatedDescription } = translateMetaContent(
        t,
        cityName,
        website.name
    );

    return {
        title: translatedTitle,
        description: translatedDescription,
        alternates: {
            canonical,
            languages: hrefLangs,
        },
        ...generateIndexMetaTag(await searchParams),
    };
}

const CityPage = async ({ params }: PageProps<'/[locale]/cities/[cityName]'>) => {
    const { cityName } = await params;

    const data = await eventApi.getEventsByCity({ cityName });
    if (!data) notFound();

    return <CityMain data={data} />;
};

export default CityPage;
