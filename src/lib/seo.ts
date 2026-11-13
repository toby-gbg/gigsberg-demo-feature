import 'server-only';

import { getLocale } from 'next-intl/server';

import { DomainInfo } from '@/interfaces/Header';
import { generateHrefLinks } from '@/utils/seo';
import { prefixes } from '@/constants/locales';
import { GIGS_US_ALTERNATE_LINK } from '@/constants/seo';

import Headers from './headers';

export default class Seo {
    private static joinUrl(...parts: Array<string | undefined | null>) {
        return parts
            .filter(Boolean)
            .join('')
            .replace(/([^:]\/)\/+/g, '$1') // avoid double slashes (except after protocol)
            .replace(/\/+?(?=\?|#|$)/g, '') // remove slash(es) before query/hash/end
            .replace(/\/+$/g, '') // remove trailing slash(es)
            .replace(/(www\.)+/, 'www.'); // remove duplicated-www
    }

    static async getCanonicalUrl() {
        const locale = await getLocale();
        const pathname = await Headers.getPathName();

        const { hostname, config } = await Headers.getDomainInfo();

        // Check if the current locale has a specific canonical domain override configured
        // (e.g. mapping Gigsberg's Spanish locale to use 'entradas.marca.com' as the canonical base URL)
        const domainOverrides = config?.seo?.canonical?.domainOverrides || {};
        const overrideLocale = Object.keys(domainOverrides).find((lang) => locale.includes(lang));
        const base = overrideLocale ? domainOverrides[overrideLocale] : `https://${hostname}`;

        const canonical = Seo.joinUrl(base, pathname);

        return canonical;
    }

    static async getHreflangTags({ config }: DomainInfo, locale: string) {
        const pathname = await Headers.getPathName();
        const path = pathname?.replace(`/${locale}`, '') || '';
        const hreflangs = config.seo?.hreflangs || GIGS_US_ALTERNATE_LINK;

        const prefix = prefixes[locale];
        const customizedPath = path.startsWith(prefix) ? path.slice(prefix.length) : path;
        return generateHrefLinks(hreflangs, customizedPath);
    }
}
