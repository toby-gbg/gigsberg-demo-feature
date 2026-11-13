import { Metadata } from 'next';
import { all } from 'better-all';
import { getTranslations } from 'next-intl/server';

import Headers from '@/lib/headers';
import Seo from '@/lib/seo';
import { convertNameUrlToLabel, fallbackTranslation } from '@/utils/common';
import { generateIndexMetaTag } from '@/utils/seo';
import { convertUrlToKeyTranslate } from '@/utils/translation/getTypeSubtypeTranslations';
import { websiteApi } from '@/services/server/website';
import { CAT_KEY_PREFIX } from '@/constants/translation';

type TranslationFunction = (key: string, values?: Record<string, string>) => string;

const translateMetaContent = (t: TranslationFunction, venueName: string, domain: string) => {
    const venueKeyTranslate = convertUrlToKeyTranslate(venueName, CAT_KEY_PREFIX);
    const translatedVenueName = fallbackTranslation(
        t(venueKeyTranslate),
        venueKeyTranslate,
        convertNameUrlToLabel(venueName)
    );

    const translatedTitle = fallbackTranslation(
        t('city_page_title', {
            city: translatedVenueName,
        }),
        'city_page_title',
        `Concerts & events in ${translatedVenueName}`
    );

    const translatedDescription = fallbackTranslation(
        t('city_page_description', {
            city: translatedVenueName,
            domain,
        }),
        'city_page_description',
        `Find tickets for concerts, comedy and theatre in ${translatedVenueName}. Rock & pop shows, live events tickets with fast and reliable booking on ${domain}.`
    );

    return { translatedTitle, translatedDescription };
};

export async function generateMetadata({
    params,
    searchParams,
}: PageProps<'/[locale]/venues/[venueName]'>): Promise<Metadata> {
    const {
        params: { venueName: rawVenueName, locale },
        canonical,
        domainInfo,
        website,
        t,
    } = await all({
        async params() {
            return params;
        },
        async canonical() {
            return Seo.getCanonicalUrl();
        },
        async domainInfo() {
            return Headers.getDomainInfo();
        },
        async website() {
            return websiteApi.getWebsite();
        },
        async t() {
            return getTranslations();
        },
    });

    const venueName = decodeURIComponent(rawVenueName);
    const hrefLangs = await Seo.getHreflangTags(domainInfo, locale);
    const { translatedTitle, translatedDescription } = translateMetaContent(
        t,
        venueName,
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

export default function VenuePage() {
    return null;
}
