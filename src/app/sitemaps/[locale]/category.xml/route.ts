import { NextRequest } from 'next/server';

import Headers from '@/lib/headers';
import { checkRouteAccessible, getUrlsFromTypes } from '@/utils/sitemap';
import { sitemapApi } from '@/services/server/sitemap';

export async function GET(
    request: NextRequest,
    ctx: RouteContext<'/sitemaps/[locale]/category.xml'>
) {
    const { locale = '' } = await ctx.params;
    const { searchParams } = new URL(request.url);

    const domainInfo = await Headers.getDomainInfo();

    const shouldNotAccess = checkRouteAccessible(locale, domainInfo.defaultLocale);
    if (!shouldNotAccess) {
        return new Response(null, { status: 404 });
    }

    const sitemapData = await sitemapApi.getSitemapData(!!searchParams.get('refresh'));

    // filter out concert category, we place it in a separate file
    const allTypes = sitemapData.types.filter((item) => !item.nameUrl.includes('concert'));

    const urls = getUrlsFromTypes(allTypes, locale, domainInfo);

    let sitemapEntries = '';
    urls.forEach((item) => {
        sitemapEntries += `
                <url>
                    <loc>${item.url}</loc>
                    <lastmod>${item.lastModified}</lastmod>
                    <changefreq>daily</changefreq>
                    <priority>0.8</priority>
                </url>`;
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
            ${sitemapEntries}
        </urlset>
        `;
    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml',
        },
    });
}
