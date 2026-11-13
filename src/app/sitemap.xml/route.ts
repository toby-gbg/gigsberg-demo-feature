import { NextRequest } from 'next/server';

import Headers from '@/lib/headers';
import { mergeTypeToExtraPaths } from '@/utils/sitemap';
import { sitemapApi } from '@/services/server/sitemap';
import { CATEGORY_PAGE, CITIES, DEFAULT, STATIC_PAGE } from '@/constants/seo';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const domainInfo = await Headers.getDomainInfo();
    const { hostname, config } = domainInfo;
    const { rootStrategy, extraLocales = [], excludedLocales = [] } = config?.seo?.sitemap || {};

    const baseUrl = !hostname.startsWith('https://') ? 'https://' + hostname : hostname;

    const sitemapData = await sitemapApi.getSitemapData(!!searchParams.get('refresh'));
    const filteredLanguages = sitemapData.activeLanguageCodes.filter(
        (code) => !excludedLocales?.includes(code)
    );

    const activeLocales = new Set([...filteredLanguages, ...extraLocales, DEFAULT]);

    let sitemapEntries = '';

    switch (rootStrategy) {
        case 'show-types': {
            const allTypes = mergeTypeToExtraPaths({
                typesData: sitemapData.types,
                subTypePath: 'concert',
                extraSitemapPaths: [CATEGORY_PAGE, STATIC_PAGE, CITIES],
            });

            allTypes.forEach((type) => {
                sitemapEntries += `
            <sitemap>
                <loc>${baseUrl}/sitemaps/${DEFAULT}/${type.nameUrl}.xml</loc>
                <lastmod>${new Date().toISOString()}</lastmod>
            </sitemap>`;
            });
            break;
        }
        case 'show-locales':
        default: {
            activeLocales.forEach((locale) => {
                sitemapEntries += `
                    <sitemap>
                        <loc>${baseUrl}/sitemaps/${locale}.xml</loc>
                        <lastmod>${new Date().toISOString()}</lastmod>
                    </sitemap>`;
            });
        }
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
        <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
            ${sitemapEntries}
        </sitemapindex>
        `;

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml',
        },
    });
}
