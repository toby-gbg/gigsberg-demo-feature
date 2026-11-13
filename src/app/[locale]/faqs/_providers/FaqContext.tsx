'use client';

import {
    createContext,
    useContext,
    useEffect,
    useState,
    type Dispatch,
    type ReactNode,
    type SetStateAction,
} from 'react';

import GoogleAnalyticsTracker from '@/lib/seo/GoogleAnalyticsTracker';

import { useDebounce } from '@/hooks/useDebounce';

type FaqContextValue = {
    searchValue: string;
    setSearchValue: Dispatch<SetStateAction<string>>;

    selectedTab: number;
    setSelectedTab: Dispatch<SetStateAction<number>>;
};

const FaqContext = createContext<FaqContextValue | null>(null);

export function FaqProvider({ children }: { children: ReactNode }) {
    const [searchValue, setSearchValue] = useState('');
    const [selectedTab, setSelectedTab] = useState(0);

    const debouncedTrackSearch = useDebounce((value: string) => {
        GoogleAnalyticsTracker.triggerGA4Event({
            event: 'faq_search',
            data: { search_term: value },
        });
    }, 200);

    useEffect(() => {
        const normalizedSearchValue = searchValue.trim();

        if (normalizedSearchValue) {
            debouncedTrackSearch(normalizedSearchValue);
        }
    }, [debouncedTrackSearch, searchValue]);

    return (
        <FaqContext.Provider
            value={{
                searchValue,
                setSearchValue,
                selectedTab,
                setSelectedTab,
            }}
        >
            {children}
        </FaqContext.Provider>
    );
}

export function useFaqContext() {
    const context = useContext(FaqContext);

    if (!context) {
        throw new Error('useFaqContext must be used within a FaqProvider');
    }

    return context;
}
