import '@/assets/css/globals.css';

import { Metadata, Viewport } from 'next';
import DataFetcher from '@/app/[locale]/_components/DataFetcher';
import { all } from 'better-all';
import { getTranslations } from 'next-intl/server';

import Headers from '@/lib/headers';
import Seo from '@/lib/seo';
import { fallbackTranslation } from '@/utils/common';
import { seoMapper } from '@/utils/mappers/seo/seo.mapper';
import { generateMetaTitle, generateSiteName } from '@/utils/metaTitle';
import { seoApi } from '@/services/server/seo';
import locales from '@/constants/locales';
import { getMetadataForDomain } from '@/constants/metadata';
import { GIGSBERG_SOCIAL } from '@/constants/seo';

export interface LocaleParams {
    locale: string;
}

export async function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<'/[locale]'>): Promise<Metadata> {
    const { locale } = await params;
    const { domainInfo, canonical, seoData, t, hrefLangs } = await all({
        async domainInfo() {
            return Headers.getDomainInfo();
        },
        async canonical() {
            return Seo.getCanonicalUrl();
        },
        async seoData() {
            return seoApi.getSeoMetadata({ params: { type: 'homepage' } });
        },
        async t() {
            return getTranslations({ locale });
        },
        async hrefLangs() {
            return Seo.getHreflangTags(await this.$.domainInfo, locale);
        },
    });

    const currentDate = new Date().toISOString();
    const siteName = generateSiteName(t, domainInfo);
    const metadataConfig = getMetadataForDomain(domainInfo.hostname);
    const seoMetadata = seoData ? seoMapper(seoData) : null;
    const { openGraph, twitter, other } = seoMetadata || {};
    const title = generateMetaTitle(t, { level: 'locale', domainInfo });

    const descriptionKey = metadataConfig.metadata?.description?.translationKey || '';
    const description = fallbackTranslation(
        t(descriptionKey),
        descriptionKey,
        `${siteName} is a secondary ticket marketplace. All tickets are guaranteed and secure. Prices are set by sellers and may be above or below face value.`
    );

    const ogDescriptionKey = metadataConfig.openGraph?.ogDescription?.translationKey || '';
    const ogDescription = fallbackTranslation(t(ogDescriptionKey), ogDescriptionKey, description);

    return {
        ...seoMetadata,
        title: seoMetadata?.title || title,
        description: seoMetadata?.description || description,
        metadataBase: new URL(`https://${domainInfo.hostname}`),
        alternates: {
            canonical,
            languages: hrefLangs,
        },
        other: {
            organization: other?.organization || siteName,
            'article:section': 'Pages',
            'article:modified_time': currentDate,
            'DC.date.issued': currentDate,
            'mrf:sections': 'Tickets',
            'mrf:tags': other?.mrfTags || 'contentType:Pages',
        },
        openGraph: {
            ...openGraph,
            ...metadataConfig.openGraph,
            title: openGraph?.title || title,
            description: openGraph?.description || ogDescription,
            url: openGraph?.url || canonical,
            siteName,
            locale,
        },
        twitter: {
            card: 'summary_large_image',
            site: twitter?.site || metadataConfig?.social?.twitter || GIGSBERG_SOCIAL.twitter,
            creator: twitter?.creator || metadataConfig?.social?.twitter || GIGSBERG_SOCIAL.twitter,
            title: twitter?.title || title,
            description: twitter?.description || description,
        },
        facebook: metadataConfig?.social?.appIdFacebook
            ? {
                  appId: metadataConfig?.social?.appIdFacebook,
              }
            : undefined,
    };
}

export const viewport: Viewport = {
    userScalable: true,
    maximumScale: 5,
    initialScale: 1,
    width: 'device-width',
};

const LocaleLayout = async ({
    children,
    authModal,
}: LayoutProps<'/[locale]'> & { authModal: React.ReactNode }) => {
    return <DataFetcher authModal={authModal}>{children}</DataFetcher>;
};

export default LocaleLayout;
