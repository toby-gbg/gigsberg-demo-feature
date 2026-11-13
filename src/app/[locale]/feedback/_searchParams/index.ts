import { parseAsInteger, parseAsString } from 'nuqs/server';

export const feedbackSearchParamsParsers = {
    t: parseAsString.withDefault(''),
    rate: parseAsInteger.withDefault(0),
};
