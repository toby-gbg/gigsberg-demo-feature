'use server';

import { getLocale } from 'next-intl/server';

import Headers from '@/lib/headers';
import { capitalizeWords, removeDashes, removeTicketsSuffix } from '@/utils/common';
import { JsonLdFactory } from '@/utils/mappers/jsonLd/jsonLd.mapper';

import JsonLdScript from './JsonLdScript';

export interface BreadcrumbItem {
    name: string;
    href: string;
}

interface SchemaOrgProps {
    breadcrumbs?: BreadcrumbItem[];
    origin?: string;
}

export async function generateBreadcrumbs(
    type?: string,
    subtype?: string,
    event?: string
): Promise<BreadcrumbItem[]> {
    return [
        { name: 'Home', href: '/' },
        type && { name: capitalizeWords(removeTicketsSuffix(type)), href: `/${type}` },
        subtype && { name: capitalizeWords(removeDashes(subtype)), href: `/${type}/${subtype}` },
        event && {
            name: capitalizeWords(removeDashes(removeTicketsSuffix(event))),
            href: `/${type}/${subtype}/${event}`,
        },
    ].filter(Boolean) as BreadcrumbItem[];
}

const BreadcrumbJsonLd = async ({ breadcrumbs }: SchemaOrgProps) => {
    if (!breadcrumbs || breadcrumbs.length === 0) return null;
    const currentUrl = await Headers.getCurrentUrl();
    if (!currentUrl) return null;
    const url = new URL(currentUrl);
    const locale = await getLocale();

    const baseUrl = url.origin;

    const { config, defaultLocale } = await Headers.getDomainInfo();
    const isActive = config?.seo?.jsonLd?.activeSchemas?.includes('Breadcrumbs');

    if (!isActive) return null;

    const localePath = locale === defaultLocale ? '' : `/${locale}`;

    const schema = JsonLdFactory.buildBreadcrumbs(breadcrumbs, baseUrl, localePath);

    return <JsonLdScript id="breadcrumb-jsonld" jsonLd={schema} />;
};

export default BreadcrumbJsonLd;
