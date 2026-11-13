import Subtype, { Type } from './Subtype';

export interface SEOFilters {
    type_id?: number | string;
    subtype_id?: number | string;
    tour_id?: number | string;
    performer_id?: number | string;
    event_id?: number | string;
}

export interface SEO {
    id: number;
    website_id: number;
    website_domain: string;
    language_id: number;
    language: string;
    page_url: string | null;
    type_id: number;
    subtype_id: number | null;
    tour_id: number | null;
    event_id: number | null;
    performer_id: number | null;
    seo_item: {
        // Basic
        metatitle?: string;
        metadescription?: string;

        // Open Graph
        ogTitle?: string;
        ogDescription?: string;
        ogUrl?: string;

        // Twitter
        twitterTitle?: string;
        twitterDescription?: string;
        twitterUrl?: string;
        twitterDomain?: string;
        twitterCreator?: string;

        // Extras
        organization?: string;
        mrfTags?: string;
        canonicalUrl?: string;
        headings?: string;
        intro_text?: string | null;
    };
    entity: Subtype | Type;
}

export interface SeoHeadings {
    h1?: string;
    entity: Subtype | Type;
}
