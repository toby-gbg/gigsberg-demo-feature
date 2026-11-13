'use client';

import { isEqual, sortBy } from 'lodash-es';

import { VENUE_CATEGORY_ALIASES } from '@/utils/venue-map/constants';

import {
    formatCapitalize,
    formatPascalCase,
    formatWithUnderscores,
    normalizeString,
} from './common';

type SearchSvgBlockResult = SVGGElement & {
    element: SVGGElement;
    matchedSelector: string;
};

const withMatchedSelector = (
    element: SVGGElement,
    matchedSelector: string
): SearchSvgBlockResult => {
    return Object.assign(element, { element, matchedSelector });
};

export const searchSvgBlock = ({
    container,
    textNodes,
    rawKey,
    rawCategory,
    venueName,
}: {
    container: SVGElement;
    textNodes: NodeListOf<SVGTextElement>;
    rawKey: string | null;
    rawCategory?: string | null;
    venueName?: string | null;
}) => {
    if (!rawKey) return;
    // Ex: key: "Some key" | category: "CATEGORY-NAME"

    /* ================================
     * Venue-specific adjustments
     * ================================ */
    const { key, category } = normalizeData({
        key: rawKey,
        category: rawCategory,
        venueName: venueName,
    });

    // Normalize key to PascalCase ( Some key > SomeKey )
    const pascalKey = formatPascalCase(key);

    // Escaped keys (CSS.escape for special characters)
    const pascalKeyEsc = CSS.escape(pascalKey); // SomeKey
    const pascalKey0Esc = CSS.escape(`0${pascalKey}`); // 0SomeKey
    const keyEsc = CSS.escape(key); // Some key
    const key0Esc = CSS.escape(`0${key}`); // 0Some key

    // Category prefix ( CATEGORY-NAME => 'g#Category_Name > ' )
    const categoryId = category ? formatWithUnderscores(formatCapitalize(category.trim())) : null;
    const prefix = categoryId ? `g#${CSS.escape(categoryId)} > ` : '';
    const rawPrefix = rawCategory ? `g#${CSS.escape(rawCategory)} > ` : '';

    // Preserve original casing from BE
    const rawCategoryId = rawCategory ? rawCategory.trim().replace(/\s+/g, '_') : null;

    const rawCompactKey = rawKey.trim().replace(/\s+/g, '');

    const rawCategoryIdPrefix = rawCategoryId ? `g#${CSS.escape(rawCategoryId)} > ` : '';

    // Selectors
    const selectors = [
        // With category prefix
        `${prefix}g[id="${keyEsc}"]`,
        `${prefix}g[id="${key0Esc}"]`,
        `${prefix}g[data-name="${keyEsc}"]`,
        `${prefix}g[data-name="${key0Esc}"]`,

        // Raw category prefix
        `${rawPrefix}g[data-name="${pascalKey0Esc}"]`, // #gCATEGORY-NAME > g[data-name="0SomeKey"]
        `${rawPrefix}g[data-name="${pascalKeyEsc}"]`, // #gCATEGORY-NAME > g[data-name="SomeKey"]
        `${rawPrefix}g[id="_${pascalKeyEsc}"]`, // g#CATEGORY-NAME > g[id="_SomeKey"]
        `${rawPrefix}g[id="_${pascalKey0Esc}"]`, // g#CATEGORY-NAME > g[id="_0SomeKey"]
        `${rawPrefix}g[id="${pascalKey0Esc}"]`, // #gCATEGORY-NAME > g[id="0SomeKey"]
        `${rawPrefix}g[id="${pascalKeyEsc}"]`, // #gCATEGORY-NAME > g[id="SomeKey"]

        // New case:
        // Convert CATEGORY NAME to CATEGORY_NAME
        // Convert KEY NAME to KEYNAME
        `${rawCategoryIdPrefix}g#${CSS.escape(`_0${rawCompactKey}`)}`, // Example: Front Of Stage VIP ==> Front_Of_Stage_VIP ==> g#Front_Of_Stage_VIP > g#_0FrontOfStageVIP3
        `${rawCategoryIdPrefix}g[data-name="${CSS.escape(`0${rawCompactKey}`)}"]`, // Example: Front Of Stage VIP ==> Front_Of_Stage_VIP ==> g#Front_Of_Stage_VIP > g[data-name="0FrontOfStageVIP3"]

        `${prefix}g[data-name="${pascalKey0Esc}"]`, // #gCategory_Name > g[data-name="0SomeKey"]
        `${prefix}g[data-name="${pascalKeyEsc}"]`, // #gCategory_Name > g[data-name="SomeKey"]
        `${prefix}g[id="_${pascalKeyEsc}"]`, // g#Category_Name > g[id="_SomeKey"]
        `${prefix}g[id="_${pascalKey0Esc}"]`, // g#Category_Name > g[id="_0SomeKey"]
        `${prefix}g[id="${pascalKey0Esc}"]`, // #gCategory_Name > g[id="0SomeKey"]
        `${prefix}g[id="${pascalKeyEsc}"]`, // #gCategory_Name > g[id="SomeKey"]

        // Without category prefix
        `g[id="_${pascalKey0Esc}"]`, // g[id="_0SomeKey"]
        `g[id="${pascalKey0Esc}"]`, // g[id="0SomeKey"]
        `g[id="${pascalKeyEsc}"]`, // g[id="SomeKey"]
        `g[id="_${pascalKeyEsc}"]`, // g[id="_SomeKey"]
        `g[data-name="${pascalKey0Esc}"]`, // g[data-name="0SomeKey"]
        `g[data-name="${pascalKeyEsc}"]`, // g[data-name="SomeKey"]

        // Original key
        `g[id="_${keyEsc}"]`, // g[id="_Some key"]
        `g[id="_${key0Esc}"]`, // g[id="_0Some key"]

        // Only category
        `g[id="${categoryId}"]`, // g[id="Category_Name"]
    ];

    // Step 1: Search by id/data-name
    for (const selector of selectors) {
        const el = container.querySelector<SVGGElement>(selector);
        if (el) return withMatchedSelector(el, selector);
    }

    // Step 2: Search by text content (tspan/text)
    for (const node of textNodes) {
        // Normalize text content
        const text = normalizeString(node.textContent || '');
        const normKey = normalizeString(key);
        const textId = node.id;

        if (text === normKey || textId === `_${`0${pascalKey}`}_text`) {
            // Climb up to the nearest <g> with path/polygon/rect/circle/ellipse inside
            let g: SVGGElement | null = node.closest('g');

            while (g) {
                if (g.querySelector('path, polygon, rect, circle, ellipse')) {
                    return withMatchedSelector(g, 'text-content-search');
                }
                g = g.parentElement as SVGGElement | null;
            }
        }
    }

    return null;
};

export const searchSvgBlockByCategory = ({
    container,
    rawCategory,
    venueName,
}: {
    container: SVGElement;
    rawCategory: string | null;
    venueName?: string | null;
}) => {
    if (!rawCategory) return [];

    const { category } = normalizeData({
        key: '',
        category: rawCategory,
        venueName: venueName,
    });

    let catBlock: SVGGElement | null = null;

    // Get <g> elements within the container with id or data-name matching the category
    const categoryId = formatWithUnderscores(formatCapitalize(category?.trim() || ''));
    const categoryIdEsc = CSS.escape(categoryId);

    // Selectors
    const selectors = [
        `g[id="${categoryIdEsc}"]`, // g[id="Category_Name"]
        `g[data-name="${categoryIdEsc}"]`, // g[data-name="Category_Name"]
    ];

    for (const selector of selectors) {
        const el = container.querySelector<SVGGElement>(selector);
        if (el) {
            catBlock = el;
            break;
        }
    }

    // Get all the <g> elements within this category block
    if (catBlock) {
        const blocks = Array.from(catBlock.querySelectorAll<SVGGElement>('g'));
        return blocks;
    }

    return [];
};

const normalizeData = ({
    key,
    category,
    venueName,
}: {
    key: string;
    category?: string | null;
    venueName?: string | null;
}) => {
    const res = { key, category };
    /* ================================
     * Venue-specific adjustments
     * ================================ */
    const venue = venueName?.toLowerCase() || '';

    /* ================================
     * Selhurst Park
     * Logic: Remove compass prefixes (west_block -> Block)
     * ================================ */
    if (venue?.includes('selhurst park')) {
        res.key = key.replace(/^(West|East|North|South)_/i, '');
    }

    /* ================================
     * BE category -> SVG category renames (see VENUE_CATEGORY_ALIASES)
     * ================================ */
    const aliases = Object.entries(VENUE_CATEGORY_ALIASES).find(([name]) =>
        venue.includes(name)
    )?.[1];

    const cat = category?.trim().toLowerCase() ?? '';
    const aliasKey = aliases && Object.keys(aliases).find((k) => cat.includes(k));
    if (aliases && aliasKey) res.category = aliases[aliasKey];

    return res;
};

// Update array filter only if changed
export const updateArrayFilter = (prevArr?: string[], nextArr?: string[]): string[] | undefined => {
    if (!nextArr?.length) return;

    const prev = prevArr || [];

    const isSame = isEqual(sortBy(prev), sortBy(nextArr));

    return isSame ? undefined : nextArr;
};

// Merge unique values into a comma-separated attribute
export const mergeUniqueAttr = (element: Element, attr: string, value?: string) => {
    if (!value) return;
    const existing = element.getAttribute(attr) ?? '';

    const tokens = new Set([...existing.split(','), value].map((v) => v.trim()).filter(Boolean));

    element.setAttribute(attr, Array.from(tokens).join(','));
};

// Set the lowest numeric attribute value
export const setLowestNumbericAttr = (
    element: Element,
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
