import {
    EventGroup,
    EventSearchFilters,
    EventTicketsResponse,
    FrontAPIEvent,
} from '@/interfaces/Event';
import { OptionalNonNullable } from '@/interfaces/OptionalNonNullable';

import { EventFilterSearchParams } from '@/components/event-filters/event-filter.schema';

// omitted 'page' from the inputs since useSWRInfinite handles it internally
export type GetSubtypeEventsArgs = {
    typeId?: number;
    subtypeId?: number;
    excludeEventIds: number[];
    nameUrl: string;
    eventGroup?: EventGroup;
    perPage?: number;
    skip?: boolean;
} & Pick<
    EventSearchFilters,
    'fromDate' | 'toDate' | 'countryId' | 'cityId' | 'tourId' | 'currencyCode'
> &
    OptionalNonNullable<EventFilterSearchParams>;

export type GetSubtypeEventsKey =
    [string, GetSubtypeEventsArgs & { page: number; perPage: number }] | null;

export type GetSubtypeEventsResponse = Omit<EventTicketsResponse, 'items'> & {
    items: FrontAPIEvent[];
};
