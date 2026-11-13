import { createSearchParamsCache, parseAsString } from 'nuqs/server';

export const checkoutSearchParamsParsers = {
    quantity: parseAsString.withDefault('1'),
    affiliate_id: parseAsString,
    event_id: parseAsString,
    error_message: parseAsString,
};

export const checkoutSearchParamsCache = createSearchParamsCache(checkoutSearchParamsParsers);
