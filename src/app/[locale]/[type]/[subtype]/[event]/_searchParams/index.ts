import { createSearchParamsCache, parseAsInteger, parseAsString } from 'nuqs/server';

export const eventSearchParamsParsers = {
    countryId: parseAsInteger,
    cityId: parseAsInteger,
    tourId: parseAsInteger,
    fromDate: parseAsString,
    toDate: parseAsString,
};

export const eventSearchParamsCache = createSearchParamsCache(eventSearchParamsParsers);
