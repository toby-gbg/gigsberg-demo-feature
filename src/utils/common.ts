import { DateTime } from 'luxon';
import { useTranslations } from 'next-intl';

import { EventDetail } from '@/interfaces/Event';
import Select, { TranslatableOption } from '@/interfaces/Select';
import { RTL_LOCALES } from '@/constants/locales';

export const REGEXP_PREPOSITIONS_MATCH = /\b(?:vs|for|at|in|by|of|a|an)\b/i;

/**
 *
 * @param input
 * @param exceptions a string or regexp to give exceptions for words that dont need to be capitalized
 * @returns
 */
export const capitalizeWords = (input: string, exceptions?: RegExp | string): string => {
    if (!input) return input;

    const exceptionsRegex = exceptions
        ? typeof exceptions === 'string'
            ? new RegExp(exceptions, 'i')
            : new RegExp(exceptions.source, exceptions.flags.replace(/g/g, ''))
        : undefined;

    return input.replace(/\b\w+/g, (word) => {
        if (exceptionsRegex && exceptionsRegex.test(word)) {
            return word;
        }
        return word.charAt(0).toUpperCase() + word.slice(1);
    });
};

export const formatString = (input: string): string => {
    if (input.length <= 3) {
        return input.toUpperCase();
    }

    return capitalizeWords(input);
};

export function splitText(text: string, maxLength: number = 35): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trimEnd() + '...';
}

export const capitalizeFirst = (str: string | null): string =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

export const removeTicketsSuffix = (url?: string): string =>
    url ? url.replace(/-(tickets|entradas)$/, '') : '';

export const removeShowPrefix = (url?: string): string => (url ? url.replace(/^show-/, '') : '');

export const getQueryParam = (key: string): string | null => {
    const params = new URLSearchParams();
    return params.get(key);
};

export const getRoundUpDifference = (price: number): number =>
    price % 1 === 0 ? 0 : +(1 - (price % 1)).toFixed(2);

export const formatDate = (date: DateTime) => date.toFormat('yyyy-MM-dd');

export const formatDateRange = ({
    startDate,
    endDate,
    locale,
    ianaTimezone,
    currentYear = DateTime.now().setZone(ianaTimezone || undefined).year,
}: {
    startDate: string | null | undefined;
    endDate: string | null | undefined;
    locale: string;
    ianaTimezone?: string | null;
    currentYear?: number;
}): string | null => {
    if (!startDate || !endDate) return null;

    const options = ianaTimezone ? { zone: ianaTimezone } : { setZone: true };
    const start = DateTime.fromISO(startDate, options).setLocale(locale);
    const end = DateTime.fromISO(endDate, options).setLocale(locale);
    if (!start.isValid || !end.isValid) return null;

    const format = (date: DateTime) =>
        date.toFormat(date.year === currentYear ? 'dd LLL' : 'dd LLL yyyy');

    return start.hasSame(end, 'day') ? format(start) : `${format(start)} – ${format(end)}`;
};

export const formatLocaleDateTime = (date: string, time: string, locale: string) =>
    DateTime.fromFormat(`${date} ${time}`, 'yyyy-MM-dd HH:mm:ss').setLocale(locale).toLocaleString({
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

export const getTimezoneValue = (timezone: string | null | undefined) => {
    if (timezone !== null && String(timezone)?.trim()?.toLowerCase() !== 'unknown') {
        return timezone;
    }
    return null;
};

export const getDateTimeWithTimezone = (
    dateStr: string | null | undefined,
    timeStr: string | null | undefined,
    ianaZone: string | null | undefined
) => {
    if (!dateStr || !timeStr || !ianaZone) return null;

    return DateTime.fromISO(`${dateStr}T${timeStr}`, {
        zone: ianaZone,
    });
};

// Keep the configured sale timezone on both the server and the browser.
export const formatSaleDateTime = (
    dateTime: DateTime | null,
    locale: string,
    { showTimezone = false }: { showTimezone?: boolean } = {}
): string => {
    if (!dateTime?.isValid) return '';

    const formatted = dateTime.setLocale(locale).toLocaleString({
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
    });

    return showTimezone ? `${formatted} (${dateTime.zoneName})` : formatted;
};

export const getPageParameter = (url: string) => {
    const urlParams = new URL(url).searchParams;
    return urlParams.get('page');
};

export const extractShowId = (url: string): number | null => {
    const match = url.match(/(?:show|event)-(\d+)/);
    return match ? parseInt(match[1], 10) : null;
};

export const pluralize = (word: string, count: number): string => {
    return count > 1 ? `${word}s` : word;
};

export const formatSplitAlphaNum = (input: string): string => {
    if (!input) return '';

    const letters = input.replace(/[0-9]/g, '');
    const numbers = input.replace(/[^0-9]/g, '');

    return `${letters}_${numbers}`;
};

export const formatPascalCase = (str: string) =>
    str
        .toLowerCase()
        .split(/[_\s-]+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');

export const formatWithUnderscores = (input: string): string => input.replace(/\s+/g, '_');

export const formatRemoveSpace = (input: string): string => input.replace(/\s+/g, '');

export const formatCapitalize = (input: string): string =>
    input
        .toLowerCase()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

export const normalizeString = (str: string) =>
    str
        .toLowerCase()
        .replace(/^0+/, '') // remove only leading zeros
        .replace(/[\s_'-]+/g, '') // remove spaces/underscores/apostrophes/dashes
        .trim();

export const removeDashes = (input: string): string => input.replace(/-/g, ' ');

export const isShortKey = (key: string) => key.length <= 3;

export const convertNameUrlToLabel = (name_url: string): string => {
    return name_url
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

export const convertSearchToLabel = (name_url: string): string => {
    return name_url
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

export function isUrl(str: string): boolean {
    try {
        const url = new URL(str.trim());
        return (
            (url.protocol === 'http:' || url.protocol === 'https:') && url.hostname.includes('.') // au moins un point dans le hostname
        );
    } catch {
        return false;
    }
}

export const parseOrNull = <T = unknown>(input?: string | null): T | null => {
    if (!input) return null;
    try {
        return JSON.parse(input) as T;
    } catch {
        return null;
    }
};

export const getRoundingAmount = (price: number): number => {
    const nextWhole = Math.ceil(price);
    const difference = parseFloat((nextWhole - price).toFixed(2));
    return difference === 1 ? 0 : difference;
};

export const formatLabel = (key: string): string => {
    return key
        .replace(/_/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const fallbackTranslation = (translated: string, key: string, fallback: string) => {
    if (translated.includes(key) || !translated) {
        return fallback;
    }
    return translated;
};

export const createTranslationKey = (
    name?: string,
    prefix = '',
    { sanitize = false }: { sanitize?: boolean } = {}
) => {
    if (!name) {
        return '';
    }
    const key = prefix + name.trim().toLowerCase().replace(/ /g, '_').replace(/\./g, '');
    return sanitize ? key.replace(/[^a-z0-9_-]/g, '') : key;
};

export const getTranslation = (
    t: ReturnType<typeof useTranslations>,
    name?: string,
    prefix = ''
) => {
    const key = createTranslationKey(name, prefix);
    return fallbackTranslation(t(key), key, name ?? '');
};

export const translateOptions = <V>(
    t: ReturnType<typeof useTranslations>,
    options: TranslatableOption<V>[]
): Select<V>[] =>
    options.map(({ key, label, value }) => ({
        label: fallbackTranslation(t(key), key, label),
        value,
    }));

export const formatTimezone = (tz: string): string => {
    if (!tz) return '';
    // Convert '1.0' to '+01:00', '-3.5' to '-03:30', '0' to '+00:00'
    const num = parseFloat(tz);
    if (isNaN(num)) return '';
    const sign = num >= 0 ? '+' : '-';
    const abs = Math.abs(num);
    const hours = Math.floor(abs).toString().padStart(2, '0');
    const minutes = Math.round((abs - Math.floor(abs)) * 60)
        .toString()
        .padStart(2, '0');
    return `${sign}${hours}:${minutes}`;
};

export const formatEventDateTime = (dateStr: string, timeStr: string, timezone: string): string => {
    // Expecting format: YYYY-MM-DD HH:MM:SS
    const tz = formatTimezone(timezone);
    return `${dateStr}T${timeStr}${tz}`;
};

export const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(Math.max(0, totalSeconds) / 60);
    const secs = Math.max(0, totalSeconds) % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const toUrlSlug = (str: string): string => {
    return str
        .normalize('NFD') // split accented characters into base + diacritic
        .replace(/[\u0300-\u036f]/g, '') // remove diacritics
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumeric chars with hyphen
        .replace(/^-+|-+$/g, ''); // trim leading/trailing hyphens
};

export const getFileExtension = (file: File): string => {
    const name = file.name;
    const lastDot = name.lastIndexOf('.');
    if (lastDot === -1) return ''; // no extension
    return name.slice(lastDot); // includes the dot, e.g. ".png"
};

export const viewInNewTab = (file: File) => {
    // Create a temporary URL for the file
    const fileURL = URL.createObjectURL(file);

    // Open it in a new tab
    window.open(fileURL, '_blank');

    // (Optional) Revoke the object URL later to free memory
    setTimeout(() => URL.revokeObjectURL(fileURL), 10000);
};

export const generateBreadcrumbs = (
    t: (key: string, values?: Record<string, string>) => string,
    { type, subtype, event }: { type: string; subtype?: string; event?: string }
) => {
    const typeKey = removeTicketsSuffix(type);
    const typeName = fallbackTranslation(
        t(typeKey),
        typeKey,
        formatString(removeTicketsSuffix(type))
    );

    const subtypeKey = `${typeKey}_${subtype}`;
    const subtypeName = fallbackTranslation(
        t(subtypeKey),
        subtypeKey,
        subtype ? formatString(removeDashes(subtype)) : ''
    );

    return [
        {
            name: fallbackTranslation(t('home'), 'home', 'Home'),
            href: '/',
        },
        { name: typeName, href: `/${type}` },
        ...(subtype ? [{ name: subtypeName, href: `/${type}/${subtype}` }] : []),
        ...(event
            ? [
                  {
                      name: formatString(removeDashes(removeTicketsSuffix(event))),
                      href: `/${type}/${subtype}/${event}`,
                  },
              ]
            : []),
    ];
};

export const artistUrlBuilder = (
    eventDetail: EventDetail,
    type: string,
    subtype: string,
    event: string
) => {
    // Always prefer the canonical `entityNameUrl` (do not use Spanish variant)
    return eventDetail.entityNameUrl
        ? `/${type}/${subtype}/${eventDetail.entityNameUrl}`
        : `/${type}/${subtype}/${event}`;
};

export const windowIdleCallback = (callback: () => void, timeout: number = 1000) => {
    if (typeof window === 'undefined') return () => {};
    if (window.requestIdleCallback) {
        const handle = window.requestIdleCallback(() => callback(), { timeout });
        return () => window.cancelIdleCallback(handle);
    }
    const handle = window.setTimeout(callback, timeout);
    return () => window.clearTimeout(handle);
};

export const isRTL = (locale: string) => RTL_LOCALES.includes(locale.split('-')[0]);

export const createCacheKey = (value: string): string => {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
};
