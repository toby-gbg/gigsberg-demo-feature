import { SubmitCondition } from '@/interfaces/AttendeeDetails';
import { EventTicket } from '@/interfaces/Event';
import { FastifyPagination } from '@/interfaces/Fetch';

export type EventSearchKey = [string, { keyword: string }] | null;

export type EventSearchFilters = {
    pageNumber?: number;
    pageSize?: number;
    nameUrl?: string;
    fromDate?: string;
    toDate?: string;
    countryId?: string | number;
    cityId?: string | number;
    countryName?: string;
    cityName?: string;
    venueId?: string | number;
    tourId?: string | number;
    name?: string;
    isProOnly?: number;
    action?: string;
    subtype?: string | null;
    skip?: boolean; // internal flag
};

export type GuestDataArgs = {
    eventId: number;
    affiliateId: number;
    condition: SubmitCondition;
};

export type UseEventsData = FastifyPagination<EventTicket>;

export type LastMinuteKey = [string, { countryId?: number }] | null;
