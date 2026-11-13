import { getTranslations } from 'next-intl/server';

import Headers from '@/lib/headers';
import { fallbackTranslation } from '@/utils/common';
import { generateSiteName } from '@/utils/metaTitle';
import { defaultLocales, prefixes } from '@/constants/locales';
import getWebsiteMenu from '@/constants/menus';

const createResponse = (content: string) => {
    return new Response(content, {
        headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
        },
    });
};

const plain = (value: string) => value.replace(/<[^>]+>/g, '');

const link = (origin: string, path: string, title: string, note?: string) => {
    const url = path ? `${origin}${path}` : origin;
    const item = `- [${title}](${url})`;
    return note ? `${item}: ${note}` : item;
};

export async function GET() {
    const domainInfo = await Headers.getDomainInfo();
    const t = await getTranslations({ locale: domainInfo.defaultLocale });
    const siteName = generateSiteName(t, domainInfo);

    let baseUrl = process.env.NEXT_PUBLIC_FRONT_URL ?? ((await Headers.get('host')) as string);
    baseUrl = baseUrl.replace(/\/+$/, '');
    const origin = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;

    const text = (key: string, fallback: string) => fallbackTranslation(t(key), key, fallback);
    const filled = (key: string, values: Record<string, string>, fallback: string) =>
        plain(fallbackTranslation(t(key, values), key, fallback));

    const menu = getWebsiteMenu(domainInfo.websiteName);
    const showStudentDiscount = domainInfo.config?.features?.showStudentDiscount;

    const categoryLinks = menu.map((item) => link(origin, item.href, text(item.name, item.name)));
    const supportedLocales = domainInfo.config?.features?.onlySupportOneLocale
        ? [domainInfo.defaultLocale]
        : defaultLocales[domainInfo.hostname] || [domainInfo.defaultLocale];
    const homeLabel = text('home', 'Home');
    const otherHomeLinks = supportedLocales
        .filter((locale) => locale !== domainInfo.defaultLocale)
        .map((locale) => {
            const prefix = prefixes[locale] ?? `/${locale}`;
            const language =
                new Intl.DisplayNames(['en'], { type: 'language' }).of(locale) || locale;
            return link(origin, prefix, `${homeLabel} (${language})`);
        });

    const guaranteeTitle = filled(
        'ticket_guarantee',
        { company: siteName },
        `${siteName} ticket guarantee`
    );
    const resellNote = filled(
        'not_sure_make_to_event',
        { name: siteName },
        `Not sure if you can make it to this event? No worries! You can resell your ticket on ${siteName} at any time.`
    );

    const lines = [
        `# ${siteName}`,
        '',
        `> ${siteName} is your secure and trusted marketplace to buy and sell concert, theatre, sport tickets online.`,
        '',
        '## About',
        '',
        text(
            'about-description',
            'We are a global secondary marketplace that provides people with the opportunity to buy and sell tickets to the biggest live events in sport, live music, theatre and festival. Gigsberg services are available 24/7 on any platform. We provide high quality customer support by an experienced team available 16 hours a day, 7 days via email, web or chat.'
        ),
        '',
        text('pledge-title', 'Our Pledge'),
        '',
        text(
            'pledge-description1',
            'We invest time and effort to make sure you get the best customer experience possible.'
        ),
        text(
            'pledge-description2',
            'Gigsberg is safe – all our sellers are vetted and your tickets are fully guaranteed.'
        ),
        '',
        '## Key Benefits',
        '',
        `- **${plain(text('every_ticket_protected', '<strong>150%</strong> Buyer Protection'))}**: ${text('get_your_money_back', 'Get your money back if the event is canceled and not rescheduled.')}`,
        `- **${text('guarantee-text', 'Gigsberg Ticket Guarantee – get your money back if the event is canceled.')}**`,
        `- **${text('guarantee_ticket_on_time', 'We guarantee you’ll get the tickets you ordered just on time')}**`,
        `- **${text('delivery-text', 'You will always receive your tickets just as ordered and always on time.')}**`,
        `- **${text('support-text', 'You will always be able to talk to a customer service representative who will answer any questions you have.')}**`,
        `- **${text('resell_anytime', 'Resell anytime')}**: ${resellNote}`,
        '',
        '## Business Model',
        '',
        text(
            'main_description',
            'Gigsberg is a secondary ticket marketplace. All tickets are guaranteed and secure. Prices are set by sellers and may be above or below face value.'
        ),
        '',
        filled(
            'affiliate_intro',
            { brandName: siteName },
            `${siteName} is one of the largest secondary ticket marketplaces in the EU. Our affiliate programme gives you all the tools to monetise your audience simply and reliably.`
        ),
        '',
        '## Navigation Links',
        '',
        link(origin, '', homeLabel),
        ...otherHomeLinks,
        ...categoryLinks,
        link(origin, '/search', text('search', 'Search')),
        link(
            origin,
            '/sell-ticket',
            text('sell_tickets', 'Sell Tickets'),
            text('sell_ticket_title', 'Looking to resell your ticket?')
        ),
        link(origin, '/faqs', text('help_center', 'Help center')),
        link(origin, '/contact-us', text('contact_us', 'Contact us')),
        link(origin, '/guarantee-conditions', guaranteeTitle),
        link(origin, '/about-us', text('about_us', 'About Us')),
        link(origin, '/affiliate-program', text('affiliate_program', 'Affiliate Program')),
        ...(showStudentDiscount
            ? [link(origin, '/student-discount', text('student_discount', 'Student Discount'))]
            : []),
        link(origin, '/terms-and-conditions', text('terms', 'Term and Conditions')),
        link(origin, '/privacy-policy', text('privacy_policy', 'Privacy Policy')),
        link(origin, '/imprint', text('imprint', 'Imprint')),
        '',
    ];

    return createResponse(lines.join('\n'));
}
