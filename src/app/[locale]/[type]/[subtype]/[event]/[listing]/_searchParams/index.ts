import {
    createSearchParamsCache,
    parseAsArrayOf,
    parseAsFloat,
    parseAsInteger,
    parseAsString,
} from 'nuqs/server';

// Currency-agnostic filters plus price bounds. Bounds are currency-denominated:
// they persist for reload/share/back-nav, but the provider clears them on
// currency switch (values can't survive conversion) — one wasted server round
// in that exact flow, then SWR converges. Page is paging state, never synced.
export const listingParamsParsers = {
    quantity: parseAsInteger,
    categories: parseAsArrayOf(parseAsString),
    ticket_type: parseAsArrayOf(parseAsInteger),
    blocks: parseAsArrayOf(parseAsString),
    min_price: parseAsFloat,
    max_price: parseAsFloat,
};

export const listingParamsCache = createSearchParamsCache(listingParamsParsers);
