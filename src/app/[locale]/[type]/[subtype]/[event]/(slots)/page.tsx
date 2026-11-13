import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { all } from 'better-all';
import { getTranslations } from 'next-intl/server';

import Headers from '@/lib/headers';
import Seo from '@/lib/seo';
import { seoMapper } from '@/utils/mappers/seo/seo.mapper';
import { generateMetaTitle } from '@/utils/metaTitle';
import { findAndApplyStringRule, generateIndexMetaTag } from '@/utils/seo';
import { redirectNewUrl } from '@/utils/url';
import { entityApi } from '@/services/server/entity';
import { seoApi } from '@/services/server/seo';
import { subtypeApi } from '@/services/server/subtype';

export async function generateMetadata({
    params,
    searchParams,
}: PageProps<'/[locale]/[type]/[subtype]/[event]'>): Promise<Metadata> {
    const {
        params: { type, subtype, event },
        t,
        domainInfo,
        canonical,
        metadata,
        seoData,
        hrefLangs,
        sData,
    } = await all({
        async params() {
            return params;
        },
        async t() {
            return getTranslations();
        },
        async domainInfo() {
            return Headers.getDomainInfo();
        },
        async canonical() {
            return Seo.getCanonicalUrl();
        },
        async metadata() {
            const { type, subtype, event } = await this.$.params;
            return entityApi.getEntityMetadata({
                url: event,
                type,
                subtype,
            });
        },
        async seoData() {
            const { type, subtype, event } = await this.$.params;
            return seoApi.getSeoMetadata({ params: { type, subtype, event } });
        },
        async hrefLangs() {
            const { locale } = await this.$.params;
            return Seo.getHreflangTags(await this.$.domainInfo, locale);
        },
        async sData() {
            const { type, subtype } = await this.$.params;
            return subtypeApi.getSubtypeData({ type, subtype });
        },
    });

    const seoMetadata = seoData ? seoMapper(seoData) : null;
    const { subtypeDisplayRules = [] } = domainInfo.config.seo || {};

    const title = generateMetaTitle(t, {
        level: 'event',
        type: sData?.entity.type === 'type' ? sData.entity.name_url : sData?.entity.type_name_url,
        subtype: sData?.entity.name,
        prefix: sData?.entity.name_url,
        eventName: metadata?.entity.name,
        domainInfo,
    });

    const seoImage = {
        url: `/api/og/${type}/${subtype}/${event}.png`,
        width: 1200,
        height: 628,
    };

    const { openGraph, twitter } = seoMetadata || {};

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
            ...seoMetadata?.alternates,
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

export default async function Page({
    params,
    searchParams,
}: PageProps<'/[locale]/[type]/[subtype]/[event]'>) {
    const { locale, type, subtype, event } = await params;
    const domainInfo = await Headers.getDomainInfo();
    await redirectNewUrl({
        locale,
        type,
        subtype,
        event,
        domainInfo,
        searchParams: await searchParams,
    });

    const entityMetadata = await entityApi.getEntityMetadata({
        url: event,
        type,
        subtype,
        debug: {
            callPoint: `[event] page.tsx`,
            errorRule: 'Redirect to not found',
        },
    });
    if (!entityMetadata) {
        notFound();
    }

    return null;
}
