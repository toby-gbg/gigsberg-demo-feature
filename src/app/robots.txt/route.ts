import Headers from '@/lib/headers';
import { AI_CRAWLERS } from '@/constants/seo';

const normalizeValue = (value?: string | string[]) => {
    if (!value) return [];

    return Array.isArray(value) ? value : [value];
};

const buildRuleBlock = ({
    userAgent,
    crawlDelay,
    allow,
    disallow,
}: {
    userAgent: string;
    crawlDelay?: number;
    allow?: string | string[];
    disallow?: string | string[];
}) => {
    const lines: string[] = [`User-Agent: ${userAgent}`];

    if (crawlDelay !== undefined) {
        lines.push(`Crawl-delay: ${crawlDelay}`);
    }

    normalizeValue(allow).forEach((value) => {
        lines.push(`Allow: ${value}`);
    });

    normalizeValue(disallow).forEach((value) => {
        lines.push(`Disallow: ${value}`);
    });

    return lines.join('\n');
};

const createResponse = (content: string) => {
    return new Response(content, {
        headers: {
            'Content-Type': 'text/plain',
        },
    });
};

export async function GET() {
    const { isProtectedDomain, config } = await Headers.getDomainInfo();
    const defaultDisallowPaths = ['/admin/', '/api/', '/gigs_ad_sys_911/', '/search'];

    let BASE_URL = process.env.NEXT_PUBLIC_FRONT_URL ?? ((await Headers.get('host')) as string);

    BASE_URL = BASE_URL.replace(/\/+$/, '');

    const normalizedBaseUrl = BASE_URL.startsWith('https://') ? BASE_URL : `https://${BASE_URL}`;

    const siteMapUrl = `${normalizedBaseUrl}/sitemap.xml`;

    if (isProtectedDomain || !config?.seo?.robots?.allow) {
        const rules = buildRuleBlock({
            userAgent: '*',
            disallow: '/',
        });

        return createResponse(rules);
    }
    const allowAdsBots = config?.seo?.robots?.allowAdsBots;

    if (allowAdsBots) {
        const blocks = [
            buildRuleBlock({
                userAgent: '*',
                disallow: '/',
            }),
            buildRuleBlock({
                userAgent: 'AdsBot-Google',
                allow: '/',
            }),
            buildRuleBlock({
                userAgent: 'AdIdxBot',
                allow: '/',
            }),
            `Sitemap: ${siteMapUrl}`,
        ];
        return createResponse(blocks.join('\n\n'));
    }

    const blockPaths = config?.seo?.robots?.blockPaths ?? [];
    const disallowPaths = [...defaultDisallowPaths, ...blockPaths];
    const crawlDelay = config?.seo?.robots?.crawlDelay;

    // WLB-2179: the no-JS /search fallback exists for AI crawlers. Generic
    // crawlers (User-Agent: *) stay blocked from /search; the documented AI
    // crawlers are explicitly allowed to crawl it.
    const aiDisallowPaths = disallowPaths.filter((path) => path !== '/search');

    const blocks = [
        buildRuleBlock({
            userAgent: '*',
            allow: '/',
            disallow: disallowPaths,
            ...(crawlDelay !== undefined && crawlDelay > 0 ? { crawlDelay } : {}),
        }),
        ...AI_CRAWLERS.map((bot) =>
            buildRuleBlock({
                userAgent: bot,
                allow: ['/search', '/'],
                disallow: aiDisallowPaths,
            })
        ),
        `Sitemap: ${siteMapUrl}`,
    ];

    return createResponse(blocks.join('\n\n'));
}
