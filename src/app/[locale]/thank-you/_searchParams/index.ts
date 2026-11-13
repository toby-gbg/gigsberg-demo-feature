import { createSearchParamsCache, parseAsString } from 'nuqs/server';

export const thankYouSearchParamsParsers = {
    payment_intent: parseAsString,
};

export const thankYouSearchParamsCache = createSearchParamsCache(thankYouSearchParamsParsers);
