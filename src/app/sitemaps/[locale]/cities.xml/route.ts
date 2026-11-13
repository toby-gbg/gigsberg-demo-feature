import { NextRequest } from 'next/server';

import Headers from '@/lib/headers';
import { checkRouteAccessible, getUrl } from '@/utils/sitemap';
import { sitemapApi } from '@/services/server/sitemap';

export async function GET(
    request: NextRequest,
    ctx: RouteContext<'/sitemaps/[locale]/cities.xml'>
) {
    const { locale = '' } = await ctx.params;
    const { searchParams } = new URL(request.url);

    const domainInfo = await Headers.getDomainInfo();

    const shouldNotAccess = checkRouteAccessible(locale, domainInfo.defaultLocale);
    if (!shouldNotAccess) {
        return new Response(null, { status: 404 });
    }

    const cities = await sitemapApi.getCities(!!searchParams.get('refresh'));

    let sitemapEntries = '';

    cities.forEach(({ nameUrl }) => {
        const url = getUrl({
            path: `/cities/${nameUrl}`,
            domainInfo,
            locale,
        });

        return (sitemapEntries += `
                <url>
                    <loc>${url.url}</loc>
                    <lastmod>${url.lastModified}</lastmod>
                    <changefreq>daily</changefreq>
                    <priority>0.8</priority>
                </url>`);
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
