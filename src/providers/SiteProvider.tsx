'use client';

import { createContext, useContext, useEffect, type PropsWithChildren } from 'react';

import { DomainInfo } from '@/interfaces/Header';
import type Website from '@/interfaces/Website';
import { storeWebsiteDomainInCookies } from '@/utils/cookies';

interface SiteContextValue {
    domainInfo: DomainInfo | null;
    website: Website | null;
}

const SiteContext = createContext<SiteContextValue>({ domainInfo: null, website: null });

interface SiteProviderProps extends PropsWithChildren {
    domainInfo: DomainInfo;
    website: Website | null | undefined;
}

export function SiteProvider({ domainInfo, website, children }: SiteProviderProps) {
    useEffect(() => {
        if (domainInfo?.hostname) {
            storeWebsiteDomainInCookies(domainInfo.hostname);
        }
    }, [domainInfo]);

    return (
        <SiteContext.Provider value={{ domainInfo, website: website ?? null }}>
            {children}
        </SiteContext.Provider>
    );
}

export function useSite() {
    return useContext(SiteContext);
}
