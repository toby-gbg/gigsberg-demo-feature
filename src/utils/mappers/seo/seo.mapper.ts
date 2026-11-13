import { Metadata } from 'next';

import { SEO } from '@/interfaces/SEO';
import { GIGSBERG_SOCIAL } from '@/constants/seo';

/**
 * This function will map the SEO metadata response from API to an object
 * and fill in default values for the site
 * @param response
 * @returns
 */
export function seoMapper(seo: SEO): Metadata {
    const { seo_item: seoItems = {} } = seo;
    const defaultImage = {
        url: 'og/types-all.jpg',
        width: 1200,
        height: 630,
    };

    return {
        title: seoItems.metatitle,
        description: seoItems.metadescription,

        openGraph: {
            title: seoItems.ogTitle,
            description: seoItems.ogDescription,
            url: seoItems.ogUrl,
            type: 'website',
            images: defaultImage,
        },

        twitter: {
            card: 'summary_large_image',
            title: seoItems.twitterTitle,
            description: seoItems.twitterDescription,
            creator: seoItems.twitterCreator,
            site: seoItems.twitterDomain || GIGSBERG_SOCIAL.twitter,
            images: defaultImage,
        },

        alternates: {
            canonical: seoItems.canonicalUrl,
        },

        other: {
            ...(seoItems.mrfTags ? { mrfTags: seoItems.mrfTags } : {}),
            ...(seoItems.organization ? { organization: seoItems.organization } : {}),
            ...(seoItems.twitterUrl ? { 'twitter:url': seoItems.twitterUrl } : {}),
        },
    };
}
