'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useQueryStates } from '@/nuqs/hooks/useQueryStates';

import EntityMetadata from '@/interfaces/entity/EntityMetadata';
import { EventSearchFilters } from '@/interfaces/Event';

import { eventSearchParamsParsers } from '../_searchParams';
import { buildEventFiltersValue } from '../_utils/event-filters';

export interface StableEntityContextValue {
    entityMetadata: EntityMetadata | null;
    type: string;
    subtype: string;
    event: string;
}

interface FiltersContextValue {
    filtersValue: EventSearchFilters;
    hasNoFilters: boolean;
}

export interface EntityContextValue extends StableEntityContextValue, FiltersContextValue {}

const EntityContext = createContext<StableEntityContextValue | null>(null);
const FiltersContext = createContext<FiltersContextValue | null>(null);

interface EntityProviderProps extends StableEntityContextValue {
    children: ReactNode;
}

export function EntityProvider({
    entityMetadata,
    type,
    subtype,
    event,
    children,
}: EntityProviderProps) {
    const [searchParams] = useQueryStates(eventSearchParamsParsers);

    const filtersValue = useMemo(
        () => buildEventFiltersValue(entityMetadata, searchParams),
        [entityMetadata, searchParams]
    );

    const hasNoFilters =
        !filtersValue.countryId &&
        !filtersValue.cityId &&
        !filtersValue.fromDate &&
        !filtersValue.toDate &&
        (entityMetadata?.type === 'tour' || !filtersValue.tourId);

    const stableValue = { entityMetadata, type, subtype, event };
    const filtersContextValue = { filtersValue, hasNoFilters };

    return (
        <EntityContext.Provider value={stableValue}>
            <FiltersContext.Provider value={filtersContextValue}>
                {children}
            </FiltersContext.Provider>
        </EntityContext.Provider>
    );
}

/** Combined accessor — re-renders when EITHER stable or volatile values change. */
export function useEntityContext(): EntityContextValue {
    const stable = useContext(EntityContext);
    const filters = useContext(FiltersContext);
    if (!stable || !filters)
        throw new Error('useEntityContext must be used within an EntityProvider');
    return { ...stable, ...filters };
}

/** Selective accessor — only re-renders when stable values change (entityMetadata, type, subtype, event). */
export function useStableEntityContext(): StableEntityContextValue {
    const ctx = useContext(EntityContext);
    if (!ctx) throw new Error('useStableEntityContext must be used within an EntityProvider');
    return ctx;
}
