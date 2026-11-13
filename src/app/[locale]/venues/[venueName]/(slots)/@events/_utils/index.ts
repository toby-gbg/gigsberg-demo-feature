import { convertSearchParams } from '@/nuqs/utils';

import { EventSearchFilters } from '@/interfaces/Event';
import { DEFAULT_SIZE } from '@/constants/pagination';

export const buildVenueFiltersValue = (searchParams: {
    fromDate: string | null;
    toDate: string | null;
}): EventSearchFilters => {
    return {
        ...convertSearchParams(searchParams),
        pageNumber: 1,
        pageSize: DEFAULT_SIZE,
    };
};

export const checkVenueHasFilters = (filters: EventSearchFilters): boolean => {
    return !!filters.fromDate || !!filters.toDate;
};
