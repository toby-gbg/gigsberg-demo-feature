import { FansAlsoLikeRequest } from '@/interfaces/Performer';

import { PerformerSuggestionKey } from '../types/performers';

export function getPerformerEventSuggestionKeyForSWR({
    args,
    userId,
}: {
    args?: FansAlsoLikeRequest;
    userId?: string;
}): PerformerSuggestionKey {
    const performerId = args?.performerId;

    if (!performerId) {
        return null;
    }

    const defaultLimit = Number(args?.limit) > 20 ? 20 : (args?.limit ?? 4);

    const searchParams = new URLSearchParams({
        limit: defaultLimit.toString(),
    });

    if (args?.countryId) {
        searchParams.set('countryId', args.countryId.toString());
    }

    const key = [`/performers/${performerId}/fans-also-like?${searchParams.toString()}`];
    if (userId) {
        key.push(userId);
    }
    return key;
}
