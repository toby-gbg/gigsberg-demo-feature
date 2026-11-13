import { createSearchParamsCache, parseAsString } from 'nuqs/server';

export const ticketFeedbackSearchParamsParsers = {
    ticket_accepted: parseAsString,
};

export const ticketFeedbackSearchParamsCache = createSearchParamsCache(
    ticketFeedbackSearchParamsParsers
);
