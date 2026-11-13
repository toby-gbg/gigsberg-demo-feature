import { NextRequest } from 'next/server';

import Headers from '@/lib/headers';
import { checkRouteAccessible, mergeTypeToExtraPaths } from '@/utils/sitemap';
import { sitemapApi } from '@/services/server/sitemap';
import {
    CATEGORY_CONCERT,
    CATEGORY_PAGE,
    CITIES,
    DEFAULT,
    STATIC_PAGE,
    VENUES,
} from '@/constants/seo';

export async function GET(request: NextRequest, ctx: RouteContext<'/sitemaps/[locale]'>) {
    const { searchParams } = new URL(request.url);
    let { locale = '' } = await ctx.params;
    locale = locale.replace('.xml', '');

    const { hostname, config, defaultLocale } = await Headers.getDomainInfo();

    const baseUrl = !hostname.startsWith('https://') ? 'https://' + hostname : hostname;

    const sitemapData = await sitemapApi.getSitemapData(!!searchParams.get('refresh'));

    // Ensure 'en' is included in the language codes
    const extraLocales = config.seo?.sitemap?.extraLocales || [];
    const activeLocales = new Set([...sitemapData.activeLanguageCodes, ...extraLocales, DEFAULT]);

    locale = activeLocales.has(locale) ? locale : sitemapData.activeLanguageCodes[0];

    const shouldNotAccess = checkRouteAccessible(locale, defaultLocale);
    if (!shouldNotAccess) {
        return new Response(null, { status: 404 });
    }

    const allTypes = mergeTypeToExtraPaths({
        typesData: sitemapData.types,
        subTypePath: 'concert',
        extraSitemapPaths: [CATEGORY_PAGE, CATEGORY_CONCERT, STATIC_PAGE, CITIES, VENUES],
    });

    let sitemapEntries = '';

    allTypes.forEach((item) => {
        const subtypeURI =
            'subtypeNameUrl' in item && item.subtypeNameUrl ? `/${item.subtypeNameUrl}` : '';
        sitemapEntries += `
            <sitemap>
                <loc>${baseUrl}/sitemaps/${locale}/${item.nameUrl}${subtypeURI}.xml</loc>
                <lastmod>${new Date().toISOString()}</lastmod>
            </sitemap>`;
    });

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
