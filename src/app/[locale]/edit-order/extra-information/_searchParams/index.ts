import { createSearchParamsCache, parseAsInteger, parseAsString } from 'nuqs/server';

export const editExtraInfoSearchParamsParsers = {
    token: parseAsString.withDefault(''),
    order_id: parseAsInteger.withDefault(0),
};

export const editExtraInfoSearchParamsCache = createSearchParamsCache(
    editExtraInfoSearchParamsParsers
);
