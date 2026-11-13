import { EventTicket } from '@/interfaces/Event';
import { FastifyPagination } from '@/interfaces/Fetch';

export const EMPTY_EVENTS: FastifyPagination<EventTicket> = {
    totalPages: 0,
    totalCount: 0,
    hasMore: false,
    rows: [],
};

export const EVENT_GROUP = {
    NEAR_ME: 'near_me',
    RECOMMENDED: 'recommended',
} as const;
