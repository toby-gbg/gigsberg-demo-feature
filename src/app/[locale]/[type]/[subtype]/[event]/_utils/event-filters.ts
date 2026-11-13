import { convertSearchParams } from '@/nuqs/utils';

import EntityMetadata from '@/interfaces/entity/EntityMetadata';
import { EventSearchFilters } from '@/interfaces/Event';

export function buildEventFiltersValue(
    entityMetadata: EntityMetadata | null,
    searchParams: {
        countryId: number | null;
        cityId: number | null;
        tourId: number | null;
        fromDate: string | null;
        toDate: string | null;
    },
    currencyCode?: string
): EventSearchFilters {
    return {
        ...convertSearchParams(searchParams),
        shouldMergeWithAvailableData: false,
        performerId: entityMetadata?.type === 'performer' ? entityMetadata.entity.id : undefined,
        tourId:
            entityMetadata?.type === 'tour'
                ? entityMetadata.entity.id
                : (searchParams?.tourId ?? undefined),
        pageSize: 32,
        pageNumber: 1,
        currencyCode,
    };
}
