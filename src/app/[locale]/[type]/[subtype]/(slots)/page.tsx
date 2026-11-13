'use server';

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import Headers from '@/lib/headers';
import Seo from '@/lib/seo';
import { headingMapper } from '@/utils/mappers/seo/heading.mapper';
import { seoMapper } from '@/utils/mappers/seo/seo.mapper';
import { generateMetaTitle } from '@/utils/metaTitle';
import { generateIndexMetaTag } from '@/utils/seo';
import { redirectNewUrl } from '@/utils/url';
import { seoApi } from '@/services/server/seo';

import BreadcrumbJsonLd, { generateBreadcrumbs } from '@/components/JsonLD/BreadcrumbJsonLd';

export async function generateMetadata({
    params,
    searchParams,
}: PageProps<'/[locale]/[type]/[subtype]'>): Promise<Metadata> {
    const { type, subtype, locale } = await params;

    const [domainInfo, seoData, hrefLangs, canonical, t] = await Promise.all([
        Headers.getDomainInfo(),
        seoApi.getSeoMetadata({ params: { type, subtype } }),
        Headers.getDomainInfo().then((domainInfo) => Seo.getHreflangTags(domainInfo, locale)),
        Seo.getCanonicalUrl(),
        getTranslations(),
    ]);

    const headingData = seoData ? headingMapper(seoData) : null;
    const seoMetadata = seoData ? seoMapper(seoData) : null;
    const entity = headingData?.entity;
    const entityType = entity?.type;
    const typeName = entityType === 'subtype' ? entity?.type_name_url : entity?.name_url;

    const title = generateMetaTitle(t, {
        level: entity ? 'subtype' : 'locale',
        match_type: 'subtype',
        type: typeName,
        subtype: entity?.name_url,
        prefix: typeName,
        domainInfo,
    });

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

const SubtypePage = async ({ params }: PageProps<'/[locale]/[type]/[subtype]'>) => {
    const { locale, type, subtype } = await params;

    const [breadcrumbs, domainInfo] = await Promise.all([
        generateBreadcrumbs(type, subtype),
        Headers.getDomainInfo(),
    ]);

    await redirectNewUrl({ locale, type, subtype, domainInfo });

    const sData = await seoApi.getSeoMetadata({
        params: {
            type,
            subtype,
        },
        debug: {
            callPoint: `/${type}/${subtype} page`,
            errorRule: `Redirected /${type}/${subtype} to Not Found`,
        },
    });

    if (!sData?.entity) return notFound();

    return <BreadcrumbJsonLd breadcrumbs={breadcrumbs} />;
};

export default SubtypePage;
