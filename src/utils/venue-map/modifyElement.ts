import type { Element as XmlElement } from '@xmldom/xmldom';

import { ListingMetadataBlock } from '@/interfaces/Listing';

import {
    findElementByBlock,
    findElementByCategory,
    findElementByCategoryBlock,
    findElementByText,
} from './matching';
import { mergeAttributeValues, setLowestNumbericAttributeValues } from './utils';

export const modifyElementByBlock = (
    svg: XmlElement,
    availableBlocks: ListingMetadataBlock[],
    venueName?: string
) => {
    // // Used for debugging
    // const unMatchedBlock: ListingMetadataBlock[] = [];

    for (const block of availableBlocks) {
        // Matched by CATEGORY + BLOCK
        const matchedByCategoryBlock = findElementByCategoryBlock(
            svg,
            block.categoryName,
            block.key
        );

        if (matchedByCategoryBlock) {
            mergeAttributeValues(matchedByCategoryBlock, 'data-category-name', block.categoryName);
            mergeAttributeValues(matchedByCategoryBlock, 'data-block-key', block.key, venueName);
            mergeAttributeValues(
                matchedByCategoryBlock,
                'data-category-id',
                block.categoryId.toString()
            );
            setLowestNumbericAttributeValues(matchedByCategoryBlock, 'data-price', block.price);
            setLowestNumbericAttributeValues(
                matchedByCategoryBlock,
                'data-min-price',
                block.minPrice
            );
            mergeAttributeValues(matchedByCategoryBlock, 'class', 'available cursor-pointer');
            mergeAttributeValues(
                matchedByCategoryBlock,
                'data-type-match',
                'MATCHED_BY_CATEGORY_BLOCK'
            );
            continue;
        }

        // MATCHED BY BLOCK ONLY
        const matchedByBlock = findElementByBlock(svg, block.key);

        if (matchedByBlock) {
            const isMatchedByCategoyBlock = matchedByBlock
                .getAttribute('data-type-match')
                ?.split(',')
                .includes('MATCHED_BY_CATEGORY_BLOCK');
            if (isMatchedByCategoyBlock) continue;
            mergeAttributeValues(matchedByBlock, 'data-category-name', block.categoryName);
            mergeAttributeValues(matchedByBlock, 'data-block-key', block.key, venueName);
            mergeAttributeValues(matchedByBlock, 'data-category-id', block.categoryId.toString());
            setLowestNumbericAttributeValues(matchedByBlock, 'data-price', block.price);
            setLowestNumbericAttributeValues(matchedByBlock, 'data-min-price', block.minPrice);
            mergeAttributeValues(matchedByBlock, 'class', 'available cursor-pointer');
            mergeAttributeValues(matchedByBlock, 'data-type-match', 'MATCHED_BY_BLOCK');
            continue;
        }

        // MATCHED BY TEXT ONLY
        const matchedByText = findElementByText(svg, block.key);

        if (matchedByText) {
            const isMatchedByCategoyBlock = matchedByText
                .getAttribute('data-type-match')
                ?.split(',')
                .includes('MATCHED_BY_CATEGORY_BLOCK');
            if (isMatchedByCategoyBlock) continue;
            mergeAttributeValues(matchedByText, 'data-category-name', block.categoryName);
            mergeAttributeValues(matchedByText, 'data-block-key', block.key, venueName);
            mergeAttributeValues(matchedByText, 'data-category-id', block.categoryId.toString());
            setLowestNumbericAttributeValues(matchedByText, 'data-price', block.price);
            setLowestNumbericAttributeValues(matchedByText, 'data-min-price', block.minPrice);
            mergeAttributeValues(matchedByText, 'class', 'available cursor-pointer');
            mergeAttributeValues(matchedByText, 'data-type-match', 'MATCHED_BY_TEXT');
            continue;
        }

        // MATCHED BY CATEGORY ONLY
        const matchedByCategory = findElementByCategory(svg, block.categoryName);

        if (matchedByCategory) {
            mergeAttributeValues(matchedByCategory, 'data-category-name', block.categoryName);
            mergeAttributeValues(matchedByCategory, 'data-block-key', block.key, venueName);
            mergeAttributeValues(
                matchedByCategory,
                'data-category-id',
                block.categoryId.toString()
            );
            setLowestNumbericAttributeValues(matchedByCategory, 'data-price', block.price);
            setLowestNumbericAttributeValues(matchedByCategory, 'data-min-price', block.minPrice);
            mergeAttributeValues(matchedByCategory, 'class', 'available cursor-pointer');
            mergeAttributeValues(matchedByCategory, 'data-type-match', 'MATCHED_BY_CATEGORY');
            continue;
        }

        // unMatchedBlock.push(block);
    }

    // return { unMatchedBlock };
};
