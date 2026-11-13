import { SearchParamKey } from '@/interfaces/Search';

/** Supported URL filters for the no-JS search fallback, in canonical order. */
export const SEARCH_FILTER_KEYS: SearchParamKey[] = [
    'q',
    'city',
    'cityId',
    'country',
    'countryId',
    'fromDate',
    'toDate',
    'subtype',
    // new for cannonical url
    'from',
    'proximityDate',
    'id',
    'type',
] as const;

export const RESET_SEARCH_FILTER_KEYS: SearchParamKey[] = [
    'city',
    'country',
    'id',
    'type',
    'subtype',
    'from',
    'proximityDate',
] as const;
