import { inferParserType } from 'nuqs';
import { createSearchParamsCache, parseAsInteger, parseAsString } from 'nuqs/server';

export const eventFilterParsers = {
    countryId: parseAsInteger,
    cityId: parseAsInteger,
    tourId: parseAsInteger,
    fromDate: parseAsString,
    toDate: parseAsString,
    city: parseAsString,
    country: parseAsString,
};
export type EventFilterSearchParams = inferParserType<typeof eventFilterParsers>;

export const eventFilterSearchParamsCache = createSearchParamsCache(eventFilterParsers);
