// Domain utilities for retrieving domain-related information
import Cookies from 'js-cookie';
import { parse } from 'tldts';

import { DomainInfo } from '@/interfaces/Header';
import { Domain } from '@/interfaces/WhiteLabel';
import { WHITE_LABEL_CONFIG } from '@/config/wlb';
import { getDefaultLocaleForDomain } from '@/constants/locales';

export const getClientWebsiteDomain = (host: string): string =>
    Cookies.get('x-website-domain') ?? getDomainInformations(host).hostname;

export const isProductionDomain = (domain: string): boolean => {
    const productionDomains = process.env.PRODUCTION_DOMAINS || '';
    const domainList = productionDomains
        .split(',')
        .map((d) => d.trim())
        .filter(Boolean);
    return domainList.includes(domain);
};

export const isDomainPasswordProtected = (domain: string): boolean => !isProductionDomain(domain);

export const getDomainInformations = (rawHost: string): DomainInfo => {
    let host = rawHost;
    //Use dev ENV for local
    if (parse(host).hostname === 'localhost') {
        host = process.env.NEXT_PUBLIC_FRONT_URL || 'marketplace.dev.gigsberg.com';
    }
    const { domain, hostname, publicSuffix, domainWithoutSuffix, subdomain } = parse(host);

    const websiteName = domainWithoutSuffix || 'gigsberg';
    const fullDomain = domain || 'gigsberg.com';
    const defaultLocale = getDefaultLocaleForDomain(hostname || 'gigsberg.com');
    const isProtectedDomain = isDomainPasswordProtected(hostname || '');
    const isStage = process.env.NEXT_PUBLIC_ISLIVE !== 'true';

    // Get config for each domain
    const config =
        WHITE_LABEL_CONFIG[(hostname || 'www.gigsberg.com') as Domain] ??
        WHITE_LABEL_CONFIG['www.gigsberg.com'];

    return {
        domain: fullDomain,
        hostname: hostname || 'gigsberg.com',
        subdomain,
        publicSuffix: publicSuffix || 'com',
        domainWithoutSuffix: domainWithoutSuffix || 'gigsberg',
        websiteName,
        defaultLocale,
        isStage,
        isProtectedDomain,
        config,
    };
};
