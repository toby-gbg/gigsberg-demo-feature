import { createSearchParamsCache, parseAsInteger, parseAsString } from 'nuqs/server';

export const offerActionSearchParamsParsers = {
    token: parseAsString.withDefault(''),
    offer_id: parseAsInteger.withDefault(0),
};

export const offerActionSearchParamsCache = createSearchParamsCache(offerActionSearchParamsParsers);
