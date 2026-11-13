import type { Document as XmlDocument, Element as XmlElement } from '@xmldom/xmldom';

import { ListingMetadataBlock, MissingMetadataBlock } from '@/interfaces/Listing';

import { VENUE_BLOCK_ALIASES } from './constants';

// Removes every element with the provided tag name from the parsed SVG document
export const removeElements = (document: XmlDocument, tagName: string): void => {
    const elements = Array.from(document.getElementsByTagName(tagName));

    for (const element of elements) {
        element.parentNode?.removeChild(element);
    }
};

// Add needed attributes
export const mergeAttributeValues = (
    element: XmlElement,
    attr: string,
    value?: string,
    venueName?: string
) => {
    if (!value) return;

    const existing = element.getAttribute(attr) ?? '';

    const configBlockName = venueName
        ? VENUE_BLOCK_ALIASES?.[venueName.toLowerCase()]?.[value.toLowerCase()]
        : undefined;

    const tokens = new Set(
        [...existing.split(','), configBlockName ?? value].map((v) => v.trim()).filter(Boolean)
    );

    element.setAttribute(attr, Array.from(tokens).join(','));
};

// Set the lowest numeric attribute value
export const setLowestNumbericAttributeValues = (
    element: XmlElement,
    attrName: string,
    value?: number | null
) => {
    if (!value && value !== 0) return;

    const existing = element.getAttribute(attrName);

    // Attribute not set yet → allow 0
    if (existing === null) {
        element.setAttribute(attrName, value.toString());
        return;
    }

    const current = Number(existing);

    // Existing is 0 → replace with first real price
    if (current === 0 && value > 0) {
        element.setAttribute(attrName, value.toString());
        return;
    }

    // Attribute exists → ignore incoming 0
    if (value <= 0) return;

    // Keep the lowest real price
    const lowest = Math.min(current, value);
    element.setAttribute(attrName, lowest.toString());
};

// Get available blocks
export const getAvailableBlocks = (
    blocks: ListingMetadataBlock[],
    missing_blocks: MissingMetadataBlock[]
) => {
    if (!blocks || !Array.isArray(blocks)) return [];

    const missingBlocks = [];
    if (missing_blocks) {
        for (const missing of missing_blocks) {
            for (const blockName of missing.blocks) {
                missingBlocks.push({
                    key: blockName,
                    price: 0,
                    categoryId: missing.category_id,
                    categoryName: missing.category_name,
                    minPrice: missing.min_price || 0,
                });
            }
        }
    }

    // Concat missing blocks with metadata.blocks
    const allBlocks = [...missingBlocks, ...blocks];

    return allBlocks;
};

// Get available missing_blocks
export const getMissingBlocksAvailable = (missing_blocks: MissingMetadataBlock[]) => {
    if (!missing_blocks || !Array.isArray(missing_blocks)) return [];

    const missingBlocks = [];

    if (missing_blocks) {
        for (const missing of missing_blocks) {
            for (const blockName of missing.blocks) {
                missingBlocks.push({
                    key: blockName,
                    price: 0,
                    categoryId: missing.category_id,
                    categoryName: missing.category_name,
                    minPrice: missing.min_price || 0,
                });
            }
        }
    }

    return [...missingBlocks];
};
