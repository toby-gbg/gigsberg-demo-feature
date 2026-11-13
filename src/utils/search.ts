import { SearchParamsType } from '@/nuqs/params/search';
import { convertSearchParams } from '@/nuqs/utils';

import { EventSearchFilters } from '@/interfaces/Event';
import { SearchItem } from '@/interfaces/Search';
import { getTimezoneValue } from '@/utils/common';
import { DEFAULT_SIZE } from '@/constants/pagination';

const CUSTOM_URL_CATEGORIES = new Set(['cities', 'venues']);

const FSI = '\u2068'; // First Strong Isolate: starts an isolated text-direction segment
const PDI = '\u2069'; // Pop Directional Isolate: ends the isolated text-direction segment

const isolateTextDirection = (text: string) =>
    // Prevent RTL text (e.g. Hebrew/Arabic dates) from reordering
    // surrounding LTR content when rendered by the browser.
    `${FSI}${text}${PDI}`;

export const processSearchOptionLabel = (
    option: SearchItem,
    groupName: string,
    locale?: string
): string => {
    if (groupName === 'venues') {
        return `${option.label} - ${option.city}, ${option.country}`;
    }

    const date = option.timestamp ? new Date(option.timestamp) : undefined;
    const timeZone = getTimezoneValue(option.ianaZone) ?? undefined;

    const dateLabel = date
        ? ` - ${new Intl.DateTimeFormat(locale, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              timeZone,
          }).format(date)}`
        : '';
    return `${option.label}${isolateTextDirection(dateLabel)}`;
};

export const getSearchItemUrl = ({ category, name_url, url }: SearchItem): string =>
    CUSTOM_URL_CATEGORIES.has(category) && name_url
        ? `/${category}/${name_url.toLowerCase()}`
        : url;

export const buildSearchFiltersValue = (searchParams: SearchParamsType): EventSearchFilters => {
    const {
        q,
        type,
        id,
        cityId: cityIdParam,
        countryId: countryIdParam,
        country: countryName,
        city: cityName,
        fromDate,
        toDate,
    } = searchParams ?? {};

    const queryValue = q ?? '';

    const basicProcessedFiltersValue = {
        name: queryValue,
        query: queryValue,
        countryId: type === 'countries' ? id : countryIdParam,
        cityId: type === 'cities' ? id : cityIdParam,
        ...(!cityIdParam && cityName && { cityName }),
        ...(!countryIdParam && countryName && { countryName }),
    };

    const filtersValue: EventSearchFilters = {
        ...convertSearchParams({ fromDate, toDate, ...basicProcessedFiltersValue }),
        pageNumber: 1,
        pageSize: DEFAULT_SIZE,
    };

    return filtersValue;
};

export const checkFiltersValueEmpty = (filtersValue: EventSearchFilters): boolean => {
    const {
        pageNumber: _pageNumber,
        pageSize: _pageSize,
        ...restFiltersValue
    } = filtersValue ?? {};
    return Object.values(restFiltersValue).every((value) => !Boolean(value));
};

export const convertFiltersValueToSearchParams = (
    filtersValue: EventSearchFilters
): SearchParamsType => {
    const { query, fromDate, toDate, name, cityId, countryId } = filtersValue ?? {};
    const data = {
        city: null,
        country: null,
        cityId: cityId ? Number(cityId) : null,
        countryId: countryId ? Number(countryId) : null,
        q: query ?? name ?? null,
        id: null,
        fromDate: fromDate ?? null,
        toDate: toDate ?? null,
        subtype: null,
        type: null,
        proximityDate: null,
        from: null,
    };
    return data;
};
