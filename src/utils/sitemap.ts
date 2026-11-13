import { MetadataRoute } from 'next';
import { readFileSync } from 'fs';
import { join } from 'path';

import { DomainInfo } from '@/interfaces/Header';
import { ChangeFreqType, SitemapDataType } from '@/interfaces/Sitemap';
import rawPathnames from '@/constants/menus/pathname.json';
import { DEFAULT } from '@/constants/seo';

type Pathnames = Record<string, Partial<Record<string, string>>>;

const pathnames = rawPathnames as Pathnames;

export const getUrl = ({
    path,
    domainInfo,
    locale,
    changeFrequency,
    priority,
}: {
    path: string;
    domainInfo: DomainInfo;
    locale: string;
    changeFrequency?: ChangeFreqType;
    priority?: number;
}) => {
    const { config, hostname } = domainInfo;
    const hideLocale = config.seo?.sitemap?.onlySupportOneLocale || locale === DEFAULT;
    const baseUrl = !hostname.startsWith('https://') ? 'https://' + hostname : hostname;

    return {
        url: hideLocale ? `${baseUrl}${path}` : `${baseUrl}/${locale.split('-')[0]}${path}`,
        lastModified: new Date().toISOString(),
        ...(changeFrequency ? { changeFrequency } : {}),
        ...(priority ? { priority } : {}),
    };
};

export function buildUrl(params: {
    type: string;
    locale: string;
    subtype?: string;
    listing?: number;
    item?: string;
    domain: string;
}) {
    const { type, subtype, item, locale, listing, domain } = params;
    const typeURI = type ? `/${type}-tickets` : '';
    const subtypeURI = subtype ? `/${subtype}` : '';
    const itemURI = item ? `/${item}-tickets` : '';
    const listingURI = listing ? `/show-${listing}` : '';
    const path = getLocalizedPathname(typeURI + subtypeURI + itemURI + listingURI, locale, domain);

    return path;
}

export function getUrlsFromTypes(
    types: SitemapDataType['types'],
    locale: string,
    domainInfo: DomainInfo
) {
    const urls: MetadataRoute.Sitemap = [];

    for (const type of types) {
        const typeUrl = type.nameUrl;
        urls.push(
            getUrl({
                path: buildUrl({ type: typeUrl, locale, domain: domainInfo.hostname }),
                domainInfo,
                locale,
            })
        );

        for (const subtype of type.subTypes ?? []) {
            const subtypeUrl = subtype.nameUrl;
            urls.push(
                getUrl({
                    path: buildUrl({
                        type: typeUrl,
                        locale,
                        subtype: subtypeUrl,
                        domain: domainInfo.hostname,
                    }),
                    domainInfo,
                    locale,
                })
            );

            for (const tour of subtype.tours ?? []) {
                const tourUrl = tour.nameUrl;
                urls.push(
                    getUrl({
                        path: buildUrl({
                            type: typeUrl,
                            locale,
                            subtype: subtypeUrl,
                            item: tourUrl,
                            domain: domainInfo.hostname,
                        }),
                        domainInfo,
                        locale,
                    })
                );
            }

            for (const performer of subtype.performers ?? []) {
                const performerUrl = performer.nameUrl;
                urls.push(
                    getUrl({
                        path: buildUrl({
                            type: typeUrl,
                            locale,
                            subtype: subtypeUrl,
                            item: performerUrl,
                            domain: domainInfo.hostname,
                        }),
                        domainInfo,
                        locale,
                    })
                );
            }
        }
    }

    return urls;
}

export function mergeTypeToExtraPaths(params: {
    typesData: SitemapDataType['types'];
    subTypePath: string;
    extraSitemapPaths: string[];
}) {
    const { typesData, subTypePath, extraSitemapPaths } = params;
    const localTypes = [...typesData];
    // split heavy concert category into smaller subtype
    const concertIdx = localTypes.findIndex((item) => item.nameUrl.includes(subTypePath));
    const concertSubtypes = localTypes[concertIdx].subTypes ?? [];
    if (concertIdx > -1) {
        localTypes.splice(
            concertIdx,
            1,
            ...concertSubtypes.map((s) => ({ ...s, subtypeNameUrl: s.nameUrl, nameUrl: 'concert' }))
        );
    }

    const extraTypes = extraSitemapPaths.map((path) => ({ nameUrl: path, nameEs: path }));
    return [...localTypes, ...extraTypes];
}

const normalizeDomain = (domain: string) => domain.replace(/^www\./i, '');

const cache = new Map<string, Pathnames>();

export const getPathnamesForDomain = (domain: string) => {
    const key = normalizeDomain(process.env.NEXT_PUBLIC_FRONT_URL || domain);
    const hit = cache.get(key);
    if (hit) return hit;

    const filePath = join(
        process.cwd(),
        'src',
        'constants',
        'pathnames',
        'generated',
        `${normalizeDomain(domain)}.json`
    );

    try {
        const content = readFileSync(filePath, 'utf8');
        return JSON.parse(content) as Pathnames;
    } catch {
        return pathnames;
    }
};

const slugPattern = /\[\[?\.\.\.slug\]?\]/;

function getLocalizedPathname(ogPath: string, locale: string, domain: string): string {
    const domainPathnames = getPathnamesForDomain(domain);

    const sortedEntries = Object.entries(domainPathnames).sort(([a], [b]) => b.length - a.length);

    for (const [sourcePath, localizedMap] of sortedEntries) {
        const localizedPath = localizedMap?.[locale];
        if (!localizedPath) {
            continue;
        }

        if (ogPath === sourcePath) {
            return localizedPath;
        }

        const sourceSlugMatch = sourcePath.match(slugPattern);
        if (!sourceSlugMatch) {
            continue;
        }

        const placeholderIndex = sourceSlugMatch.index!;
        const prefix = sourcePath.slice(0, placeholderIndex);

        if (!ogPath.startsWith(prefix)) {
            continue;
        }

        const remainder = ogPath.slice(prefix.length);
        if (sourceSlugMatch[0] === '[...slug]' && remainder === '') {
            continue;
        }

        const localizedSlugMatch = localizedPath.match(slugPattern);
        const localizedPrefix = localizedSlugMatch
            ? localizedPath.slice(0, localizedSlugMatch.index)
            : localizedPath;

        return localizedPrefix + remainder;
    }

    return ogPath;
}

export const checkRouteAccessible = (locale: string, defaultLocale: string) => {
    return locale !== defaultLocale && locale !== defaultLocale.split('-')[0];
};
