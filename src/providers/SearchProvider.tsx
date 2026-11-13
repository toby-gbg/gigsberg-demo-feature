'use client';

import {
    createContext,
    Dispatch,
    SetStateAction,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from 'react';
import { searchParamsParsers } from '@/nuqs/params/search';
import { useQueryStates } from 'nuqs';

import { EventSearchFilters } from '@/interfaces/Event';
import { buildSearchFiltersValue, checkFiltersValueEmpty } from '@/utils/search';

export interface StableSearchContextValue {
    intlKey: {
        title: string;
        placeholder?: string;
    };
}

export interface SearchContextValue {
    filtersValue: EventSearchFilters;
    filtersValueEmpty: boolean;
    setFiltersValue: Dispatch<SetStateAction<EventSearchFilters>>;
}

const SearchContext = createContext<SearchContextValue | null>(null);
const StableSearchContext = createContext<StableSearchContextValue | null>(null);

interface SearchProviderProps extends StableSearchContextValue {
    children: ReactNode;
}

export function SearchProvider({ intlKey, children }: SearchProviderProps) {
    const [searchParams] = useQueryStates(searchParamsParsers);

    const [filtersValue, setFiltersValue] = useState<EventSearchFilters>(
        buildSearchFiltersValue(searchParams)
    );

    const filtersValueEmpty = checkFiltersValueEmpty(filtersValue);

    useEffect(() => {
        setFiltersValue(buildSearchFiltersValue(searchParams));
    }, [searchParams]);

    return (
        <StableSearchContext.Provider value={{ intlKey }}>
            <SearchContext.Provider value={{ filtersValue, filtersValueEmpty, setFiltersValue }}>
                {children}
            </SearchContext.Provider>
        </StableSearchContext.Provider>
    );
}

/** Combined accessor — re-renders when EITHER stable or volatile values change. */
export function useSearchContext(): SearchContextValue {
    const stableSearchData = useContext(StableSearchContext);
    const searchData = useContext(SearchContext);
    if (!stableSearchData || !searchData)
        throw new Error('useSearchContext must be used within an SearchProvider');
    return { ...stableSearchData, ...searchData };
}

/** Selective accessor — only re-renders when stable values change (title, placeholder in intlKey). */
export function useStableSearchContext(): StableSearchContextValue {
    const ctx = useContext(StableSearchContext);
    if (!ctx) throw new Error('useStableSearchContext must be used within an SearchProvider');
    return ctx;
}
