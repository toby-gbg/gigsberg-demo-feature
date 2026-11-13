'use client';

import { useQueryStates } from '@/nuqs/hooks/useQueryStates';
import { type UseQueryStatesOptions } from 'nuqs';

import { eventFilterParsers } from './event-filter.schema';

export type EventFilterOptions = Partial<UseQueryStatesOptions<typeof eventFilterParsers>>;

export function useEventFilters(options?: EventFilterOptions) {
    const [filters, setFilters] = useQueryStates(eventFilterParsers, options);
    const hasActiveFilters = Object.values(filters).some((value) => value != null);

    return {
        filters,
        hasActiveFilters,
        setFilters,
        resetFilters: () => setFilters(null),
    };
}
