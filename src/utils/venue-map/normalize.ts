import { decode } from 'html-entities';

import { ListingMetadataBlock } from '@/interfaces/Listing';

import { VENUE_BLOCK_ALIASES, VENUE_CATEGORY_ALIASES } from './constants';

/**
 * Explanation for normalizeKeyData:
 * .trim(): remove leading/trailing whitespace.
 * .toLowerCase(): convert all characters to lowercase.
 * .replace(/blk/g, ''): remove all occurrences of "BLK" (case-insensitive after lowercasing).
 * .replace(/[\s_]+/g, ''): remove whitespace and underscores; hyphens are preserved.
 * .replace(/^0+(?=[a-z0-9])/, ''): remove leading zeros when followed by a letter or digit.
 * For example:
 * " Level_200 " becomes "level200",
 * "_000317" becomes "317",
 * "Level-200" remains "level-200",
 * "BLK N" becomes "n".
 */
export const normalizeKeyData = (value: string): string => {
    if (!value) return '';

    return decode(value)
        .trim()
        .toLowerCase()
        .replace(/blk/g, '')
        .replace(/[\s_]+/g, '')
        .replace(/['"’‘]/g, '')
        .replace(/^0+(?=[a-z0-9])/, '');
};

// Resolve category's name by alias configuration
export const buildResolvedCategories = (
    blocks: ListingMetadataBlock[] = [],
    venueName: string = ''
) =>
    blocks?.map((block) => {
        const normalizedVenueName = venueName.toLowerCase();

        if (!normalizedVenueName) return { ...block };

        const venueCategoryAliases = VENUE_CATEGORY_ALIASES[normalizedVenueName];
        const venueBlockAliases = VENUE_BLOCK_ALIASES[normalizedVenueName];

        return {
            ...block,
            categoryName:
                venueCategoryAliases?.[block.categoryName.toLowerCase()] ?? block.categoryName,
            key: venueBlockAliases?.[block.key.toLowerCase()] ?? block.key,
        };
    }) ?? [];
