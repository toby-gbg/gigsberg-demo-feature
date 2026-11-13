'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useQueryStates } from '@/nuqs/hooks/useQueryStates';

import { EventSearchFilters } from '@/interfaces/Event';

import { venueSearchParamsParsers } from '../_searchParams';
import { buildVenueFiltersValue, checkVenueHasFilters } from '../_utils';

interface VenueContextParams {
    venueName: string;
}

interface VenueContextValue extends VenueContextParams {
    filtersValue: EventSearchFilters;
    hasActiveFilters: boolean;
}

const VenueContext = createContext<VenueContextValue | null>(null);

interface VenueProviderProps extends VenueContextParams {
    children: ReactNode;
}

export function VenueProvider({ venueName, children }: VenueProviderProps) {
    const [searchParams] = useQueryStates(venueSearchParamsParsers);
    const filtersValue = buildVenueFiltersValue(searchParams);
    const hasActiveFilters = checkVenueHasFilters(filtersValue);
    return (
        <VenueContext.Provider value={{ filtersValue, hasActiveFilters, venueName }}>
            {children}
        </VenueContext.Provider>
    );
}

export function useVenueContext(): VenueContextValue {
    const ctx = useContext(VenueContext);
    if (!ctx) throw new Error('useVenueContext must be used within an VenueProvider');
    return ctx;
}
