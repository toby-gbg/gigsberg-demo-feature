import { NextRequest } from 'next/server';

import { ChangeFreqType } from '@/interfaces/Sitemap';
import Headers from '@/lib/headers';
import { checkRouteAccessible, getUrl } from '@/utils/sitemap';

const STATIC_PAGES: { path: string; changeFreq: ChangeFreqType; priority: number }[] = [
    {
        path: '',
        changeFreq: 'daily',
        priority: 1.0,
    },
    {
        path: '/about-us',
        changeFreq: 'monthly',
        priority: 0.6,
    },
    {
        path: '/contact-us',
        changeFreq: 'weekly',
        priority: 0.8,
    },
    {
        path: '/faqs',
        changeFreq: 'weekly',
        priority: 0.7,
    },
    {
        path: '/terms-and-conditions',
        changeFreq: 'yearly',
        priority: 0.3,
    },
    {
        path: '/guarantee-conditions',
        changeFreq: 'yearly',
        priority: 0.3,
    },
    {
        path: '/privacy-policy',
        changeFreq: 'yearly',
        priority: 0.3,
    },
    {
        path: '/affiliate-program',
        changeFreq: 'yearly',
        priority: 0.3,
    },
    {
        path: '/student-discount',
        changeFreq: 'yearly',
        priority: 0.3,
    },
    {
        path: '/event-organizers',
        changeFreq: 'yearly',
        priority: 0.3,
    },
    {
        path: '/imprint',
        changeFreq: 'yearly',
        priority: 0.3,
    },
];

export async function GET(
    request: NextRequest,
    ctx: RouteContext<'/sitemaps/[locale]/static-page.xml'>
) {
    const { locale = '' } = await ctx.params;

    const domainInfo = await Headers.getDomainInfo();

    const shouldNotAccess = checkRouteAccessible(locale, domainInfo.defaultLocale);
    if (!shouldNotAccess) {
        return new Response(null, { status: 404 });
    }

    let sitemapEntries = '';
    STATIC_PAGES.forEach(({ path, changeFreq, priority }) => {
        const url = getUrl({
            path,
            domainInfo,
            locale,
            changeFrequency: changeFreq || 'daily',
            priority: priority || 0.9,
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
