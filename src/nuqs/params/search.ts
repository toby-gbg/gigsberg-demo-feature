import {
    createLoader,
    createSearchParamsCache,
    createSerializer,
    parseAsInteger,
    parseAsString,
    parseAsStringEnum,
} from 'nuqs/server';

import { SearchSource } from '@/interfaces/Search';

export const searchParamsParsers = {
    q: parseAsString,
    city: parseAsString,
    country: parseAsString,
    cityId: parseAsInteger,
    countryId: parseAsInteger,
    id: parseAsInteger,
    fromDate: parseAsString,
    toDate: parseAsString,
    subtype: parseAsString,
    type: parseAsString,
    proximityDate: parseAsString,
    from: parseAsStringEnum<SearchSource>(Object.values(SearchSource)),
};

export const searchParamsCache = createSearchParamsCache(searchParamsParsers);

export const searchParamsLoader = createLoader(searchParamsParsers);

export const searchParamsSerializer = createSerializer(searchParamsParsers);

export type SearchParamsType = ReturnType<typeof searchParamsCache.all>;
