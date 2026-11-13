import { createSearchParamsCache, parseAsString } from 'nuqs/server';

export const venueSearchParamsParsers = {
    fromDate: parseAsString,
    toDate: parseAsString,
};

export const venueSearchParamsCache = createSearchParamsCache(venueSearchParamsParsers);
