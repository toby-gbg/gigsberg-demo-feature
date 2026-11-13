import { NextRequest } from 'next/server';

import Headers from '@/lib/headers';
import { buildUrl, checkRouteAccessible, getUrl } from '@/utils/sitemap';
import { sitemapApi } from '@/services/server/sitemap';

export async function GET(
    request: NextRequest,
    ctx: RouteContext<'/sitemaps/[locale]/[type]/[subtype]'>
) {
    const params = await ctx.params;
    const { searchParams } = new URL(request.url);
    const locale = params.locale || '';
    const type = params.type || '';
    let subtype = params.subtype || '';
    subtype = subtype.replace('.xml', '');

    const domainInfo = await Headers.getDomainInfo();

    const shouldNotAccess = checkRouteAccessible(locale, domainInfo.defaultLocale);
    if (!shouldNotAccess) {
        return new Response(null, { status: 404 });
    }

    const typeData = await sitemapApi.getTypeData(type, subtype);
    const events = await sitemapApi.getSubtypeEvents({
        type: subtype,
        subtypeId: typeData?.entity.id || 1,
        refresh: !!searchParams.get('refresh'),
    });

    let sitemapEntries = '';
    events.forEach((e) => {
        const path = buildUrl({
            type: e.type_name_url,
            subtype: e.subtype_name_url,
            item: e.tour_name_url || e.performer_name_url,
            listing: e.id,
            locale,
            domain: domainInfo.hostname,
        });
        const url = getUrl({
            path,
            domainInfo,
            locale,
            changeFrequency: 'daily',
            priority: 1.0,
        });
        sitemapEntries += `
                <url>
                    <loc>${url.url}</loc>
                    <lastmod>${url.lastModified}</lastmod>
                    <changefreq>${url.changeFrequency}</changefreq>
                    <priority>${url.priority?.toFixed(1)}</priority>
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
