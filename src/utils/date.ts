import { format, isValid, parse } from 'date-fns';
import type { DateRange } from 'react-day-picker';

import { EventSearchFilters } from '@/interfaces/Event';

// Convert 'Thu Sep 03 2026 19:53:23 GMT+0700 (GMT+07:00)' to '2026-09-03'
export const formatDateToISODate = (date: Date | undefined) =>
    date ? format(date, 'yyyy-MM-dd') : undefined;

// Convert '2026-09-03' to 'Thu Sep 03 2026 19:53:23 GMT+0700 (GMT+07:00)'
export const isoDateToDate = (date: string | undefined) =>
    date ? parse(date, 'yyyy-MM-dd', new Date()) : undefined;

const ACCEPTED_DATE_FORMATS = ['yyyy-MM-dd', 'dd/MM/yyyy'] as const;

// Accepts 1990-05-12 and 12/05/1990. Rejects impossible dates such as 32/13/1990.
export const parseAcceptedDate = (value: string | undefined): Date | undefined => {
    const trimmed = value?.trim();
    if (!trimmed) return undefined;

    for (const pattern of ACCEPTED_DATE_FORMATS) {
        const parsed = parse(trimmed, pattern, new Date());
        if (isValid(parsed) && format(parsed, pattern) === trimmed) return parsed;
    }

    return undefined;
};

export const toIsoDateString = (value: string) => {
    const parsed = parseAcceptedDate(value);
    return parsed ? format(parsed, 'yyyy-MM-dd') : value;
};

export const getDateRangeFromFilters = (filters: EventSearchFilters): DateRange | undefined => {
    const from = isoDateToDate(filters.fromDate);
    const to = isoDateToDate(filters.toDate);

    return from && to ? { from, to } : undefined;
};

export const formatDate = ({ date, locale }: { date: Date; locale: string }) =>
    new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(date);
