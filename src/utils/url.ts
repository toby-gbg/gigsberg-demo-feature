import { permanentRedirect, redirect } from 'next/navigation';

import { DomainInfo } from '@/interfaces/Header';
import { WhiteLabelConfig } from '@/interfaces/WhiteLabel';
import { prefixes } from '@/constants/locales';
import { INCORRECT_TOUR_NAME_URLS, THEATRE_SUBTYPE_NAME_URLS } from '@/constants/seo';
import { fifaTourNameUrls } from '@/constants/url';

import { removeTicketsSuffix } from './common';

export const isFifaTour = (url: string) => fifaTourNameUrls.some((key) => url.includes(key));

const buildUrl = (type?: string, subtype?: string, event?: string, listing?: string) => {
    const url = [type, subtype, event, listing].filter((v) => Boolean(v)).join('/');
    return url;
};

export function buildLocalizedUrl(url: string, locale: string, config?: WhiteLabelConfig): string {
    const shouldUseRawUrl =
        !!config?.features?.onlySupportOneLocale ||
        !!config?.features?.redirectUnsupportedLocalesToHome;
    if (shouldUseRawUrl) return url;
    if (config?.features?.useLocalePrefixMap) {
        const localePrefix = prefixes[locale] || '';
        return localePrefix ? `${localePrefix}${url}` : url;
    }
    return locale ? `/${locale}${url}` : url;
}

const PERMANENT_REDIRECTS: Record<string, { subtype: string; redirectTo: string }> = {
    //GM-217: Redirect nba europe to global
    'nba-europe': {
        subtype: 'basketball',
        redirectTo: 'nba-global-tickets',
    },
    //GM-220: Redirect pdc-darts to world-darts-championship
    'pdc-darts': {
        subtype: 'darts',
        redirectTo: 'world-darts-championship-tickets',
    },
    //GM-194: Redirect Milano Premier to Premier Padel
    'milano-premier': {
        subtype: 'padel-tennis',
        redirectTo: 'premier-padel-tickets',
    },
};

export const redirectNewUrl = async (data: {
    locale: string;
    type?: string;
    subtype?: string;
    event?: string;
    listing?: string;
    domainInfo: DomainInfo;
    searchParams?: Record<string, string | string[] | undefined>;
}) => {
    const { locale, domainInfo, searchParams } = data;
    const eventUrlDisplayRule = domainInfo.config?.seo?.eventUrlDisplayRule;
    const localeRoute = locale.split('-')[0];
    let type = data.type;
    let subtype = data.subtype;
    let event = data.event;
    let listing = data.listing;
    let modified = false;
    let permanent = false;

    //GM-159: If theatre subtype is accessed with a comedy type, redirect to theatre type.
    if (
        ['comedy', 'comedia'].some((keyword) => type?.includes(keyword)) &&
        subtype &&
        THEATRE_SUBTYPE_NAME_URLS.has(subtype)
    ) {
        type = 'theatre-tickets';
        modified = true;
        permanent = true;
    }

    //GM-152: If event page doesn't have -tickets, redirect to a version with it
    const { missing = '', suffix = '' } = eventUrlDisplayRule || {};
    if (event && missing && !event.includes(missing)) {
        event = `${event}${suffix}`;
        modified = true;
    }

    //GM-226: redirect /sport-tickets/nba-tickets to /sport-tickets/basketball/nba-tickets
    if (subtype === 'nba-tickets' && removeTicketsSuffix(type) === 'sport') {
        listing = removeTicketsSuffix(event);
        event = 'nba-tickets';
        subtype = 'basketball';
        type = 'sport-tickets';
        modified = true;
        permanent = true;
    }

    //GM-231: international-basketball is folded into basketball
    const legacySubtype = subtype;
    if (subtype === 'international-basketball') {
        subtype = 'basketball';
        modified = true;
        permanent = true;
    }

    //GM-160: Redirect old events to new correct events
    const matchedIncorrectItem = INCORRECT_TOUR_NAME_URLS.find(
        (item) =>
            item.oldNameUrl === removeTicketsSuffix(event) &&
            (item.subtype === subtype || item.subtype === legacySubtype)
    );
    if (matchedIncorrectItem) {
        event = `${matchedIncorrectItem.nameUrl}${suffix}`;
        modified = true;
        permanent = true;
    }

    //Handle permanent redirects for SEO
    const eventKey = removeTicketsSuffix(event);
    const permanentRedirectDestination = PERMANENT_REDIRECTS[eventKey];
    if (permanentRedirectDestination?.subtype === subtype) {
        event = permanentRedirectDestination.redirectTo;
        modified = true;
        permanent = true;
    }

    if (!modified) return;

    const newUrl = buildUrl(type, subtype, event, listing);

    const queryStr = searchParams ? convertSearchParamsToUrlQuery(searchParams) : '';

    if (permanent) {
        return permanentRedirect(`/${localeRoute}/${newUrl}?${queryStr}`);
    }
    return redirect(`/${localeRoute}/${newUrl}?${queryStr}`);
};

export const convertSearchParamsToUrlQuery = (
    searchParams: Record<string, string | string[] | undefined>
) => {
    const query = new URLSearchParams();
    if (searchParams) {
        Object.entries(searchParams).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach((v) => query.append(key, v));
            } else if (value !== undefined) {
                query.set(key, value);
            }
        });
    }
    return query.toString();
};
