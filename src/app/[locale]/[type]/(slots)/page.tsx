import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { all } from 'better-all';
import { getTranslations } from 'next-intl/server';

import Headers from '@/lib/headers';
import Seo from '@/lib/seo';
import { headingMapper } from '@/utils/mappers/seo/heading.mapper';
import { seoMapper } from '@/utils/mappers/seo/seo.mapper';
import { generateMetaTitle, MetaLevelData } from '@/utils/metaTitle';
import { generateIndexMetaTag } from '@/utils/seo';
import { seoApi } from '@/services/server/seo';

import BreadcrumbJsonLd, { generateBreadcrumbs } from '@/components/JsonLD/BreadcrumbJsonLd';

export async function generateMetadata({
    params,
    searchParams,
}: PageProps<'/[locale]/[type]'>): Promise<Metadata> {
    const { type, locale } = await params;
    const { domainInfo, seoData, t, hrefLangs, canonical } = await all({
        async domainInfo() {
            return Headers.getDomainInfo();
        },
        async seoData() {
            return seoApi.getSeoMetadata({ params: { type } });
        },
        async t() {
            return getTranslations();
        },
        async hrefLangs() {
            return Seo.getHreflangTags(await this.$.domainInfo, locale);
        },
        async canonical() {
            return Seo.getCanonicalUrl();
        },
    });

    const seoMetadata = seoData ? seoMapper(seoData) : null;
    const headingData = seoData ? headingMapper(seoData) : null;

    // config mapping for title generation
    const titleMap: MetaLevelData = {
        domainInfo,
        level: 'type',
        type: headingData?.entity.name_url,
    };

    const title = generateMetaTitle(t, titleMap);

    const { openGraph, twitter } = seoMetadata || {};

    return {
        ...seoMetadata,
        title: seoMetadata?.title || title,
        openGraph: {
            ...openGraph,
            url: openGraph?.url || canonical,
            title: openGraph?.title || seoMetadata?.title || title,
            description: openGraph?.description || seoMetadata?.description || undefined,
        },
        twitter: {
            ...twitter,
            title: twitter?.title || seoMetadata?.title || title,
            description: twitter?.description || seoMetadata?.description || undefined,
        },
        alternates: {
            canonical,
            languages: hrefLangs,
        },
        other: {
            ...seoMetadata?.other,
            'twitter:url': seoMetadata?.other?.['twitter:url'] || canonical,
        },
        ...generateIndexMetaTag(await searchParams),
    };
}

export default async function Page({ params }: PageProps<'/[locale]/[type]'>) {
    const { type } = await params;

    const [breadcrumbs, seoData] = await Promise.all([
        generateBreadcrumbs(type),
        seoApi.getSeoMetadata({
            params: { type },
            debug: {
                callPoint: `/${type} page`,
                errorRule: 'Redirect to /not-found',
                successRule: (res) => (!res?.entity ? 'No entity, redirect to /not-found' : ''),
            },
        }),
    ]);

    if (!seoData?.entity) return notFound();

    return <BreadcrumbJsonLd breadcrumbs={breadcrumbs} />;
}
