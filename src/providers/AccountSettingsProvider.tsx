'use client';

import { createContext, useContext, type ReactNode } from 'react';

import Website from '@/interfaces/Website';

import { useSite } from '@/providers/SiteProvider';

export interface AccountSettingsContextValue {
    website: Website | null;
    logo: string | null;
    logoDark: string | null;
}

const AccountSettingsContext = createContext<AccountSettingsContextValue | null>(null);

interface AccountSettingsProviderProps {
    children: ReactNode;
}

export function AccountSettingsProvider({ children }: AccountSettingsProviderProps) {
    const website = useSite().website;
    const value: AccountSettingsContextValue = {
        website,
        logo: website?.logo ?? null,
        logoDark: website?.logo_dark ?? null,
    };

    return (
        <AccountSettingsContext.Provider value={value}>{children}</AccountSettingsContext.Provider>
    );
}

export function useAccountSettings(): AccountSettingsContextValue {
    const ctx = useContext(AccountSettingsContext);
    if (!ctx) throw new Error('useAccountSettings must be used within an AccountSettingsProvider');
    return ctx;
}
