import { DateTime } from 'luxon';
import { useTranslations } from 'next-intl';

import { EventDetail } from '@/interfaces/Event';
import { EventSaleTime } from '@/interfaces/Listing';

import {
    fallbackTranslation,
    formatEventDateTime,
    getDateTimeWithTimezone,
    getTimezoneValue,
} from './common';

export const getTranslatedEventName = (
    t: ReturnType<typeof useTranslations>,
    {
        eventNameTranslationKey: translationKey,
        eventName,
    }: {
        eventNameTranslationKey?: string | null;
        eventName: string;
    }
): string => {
    return translationKey
        ? fallbackTranslation(t(translationKey), translationKey, eventName)
        : eventName;
};

export const getEventDiffDaysFromNow = (event: EventDetail) => {
    const isoString = formatEventDateTime(event.date, event.time, event.timezone || '0');

    const eventDate = new Date(isoString).getTime();
    const now = Date.now();
    const diffMs = eventDate - now;
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays;
};

export const isEventAvailableForSale = ({
    open_sale_timestamp: openSaleTimestamp,
    open_sale_date: openSaleDate,
    open_sale_time: openSaleTime,
    ianaZone: openSaleTimezone,
}: EventSaleTime) => {
    const dateTime = getOpenSaleDateTime({
        openSaleTimestamp,
        openSaleDate,
        openSaleTime,
        openSaleTimezone,
    });
    if (!dateTime) return true;
    const now = DateTime.now();

    return dateTime <= now;
};

export const getOpenSaleDateTime = ({
    openSaleTimestamp,
    openSaleDate,
    openSaleTime,
    openSaleTimezone,
}: {
    openSaleTimestamp?: string | null;
    openSaleDate?: string | null;
    openSaleTime?: string | null;
    openSaleTimezone?: string | null;
}) => {
    if (openSaleTimestamp !== undefined) {
        return openSaleTimestamp
            ? DateTime.fromISO(openSaleTimestamp, { zone: 'utc' }).toLocal()
            : null;
    }
    // Compatibility with API versions that do not yet return the UTC column.
    return getDateTimeWithTimezone(openSaleDate, openSaleTime, getTimezoneValue(openSaleTimezone));
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isEventDetail(obj: any): obj is EventDetail {
    return obj && typeof obj === 'object' && !('isRestricted' in obj);
}

export const getEventImage = ({
    performerImage,
    image,
}: {
    performerImage?: string | null;
    image?: string | null;
}): string | undefined => {
    if (image) {
        return `${process.env.NEXT_PUBLIC_IMAGE_URL}/events/${image}`;
    }
    return performerImage
        ? `${process.env.NEXT_PUBLIC_IMAGE_URL}/performers/${performerImage}`
        : undefined;
};

export const getEventParam = (
    searchParams: Record<string, string | string[] | undefined>,
    key: string
) => {
    const v = searchParams?.[key];
    return typeof v === 'string' ? v : undefined;
};

export const getNumEventParam = (
    searchParams: Record<string, string | string[] | undefined>,
    key: string
) => {
    const v = getEventParam(searchParams, key);
    return v ? Number(v) : undefined;
};

export const checkEventHasValidMinPrice = ({
    lowestPrice,
    lowestPriceCurrency,
}: {
    lowestPrice: number | null;
    lowestPriceCurrency: string | null;
}): boolean => {
    return lowestPrice !== null && Number(lowestPrice) > 0 && lowestPriceCurrency !== null;
};
