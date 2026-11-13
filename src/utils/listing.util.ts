import { compact, snakeCase } from 'lodash-es';

import { ListingRestriction } from '@/interfaces/Listing';

export const restrictionHasGroup1 = (restrictions: ListingRestriction[]): boolean => {
    return restrictions.some((restriction) => restriction.groupRestrictionsId === 1);
};

export const getRestrictionsByGroup = (
    restrictions: ListingRestriction[],
    groupRestrictionsId: number
): ListingRestriction[] => {
    return restrictions.filter(
        (restriction) => restriction.groupRestrictionsId === groupRestrictionsId
    );
};

export const getImgsFromMap = (
    mapUrls?: Record<string, string[]>,
    category?: string | null,
    block?: string | null
) => {
    // Only removes '_' between a lowercase letter and followed by a number
    const normalizeBlockKey = block ? snakeCase(block).replace(/([a-z])_(\d+)/i, '$1$2') : null;

    const keys = [
        compact([category ? snakeCase(category) : null, normalizeBlockKey]).join('_'),
        category ? snakeCase(category) : null,
        normalizeBlockKey,
    ].filter(Boolean) as string[];

    for (const key of keys) {
        const imgs = mapUrls?.[key];
        if (imgs?.length) return imgs;
    }

    return [];
};
