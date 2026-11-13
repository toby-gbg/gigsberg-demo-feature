import type { Element as XmlElement } from '@xmldom/xmldom';

import { getBlockVariants, getCategoryVariants } from './variants';

// Finds a block only when both its category parent and data-name match.
export const findElementByCategoryBlock = (
    svg: XmlElement,
    categoryName: string,
    key: string
): XmlElement | undefined => {
    const groups = Array.from(svg.getElementsByTagName('g'));

    for (const categoryValue of getCategoryVariants(categoryName)) {
        for (const keyValue of getBlockVariants(key)) {
            const matchedElement = groups.find((element) => {
                const parent = element.parentNode as XmlElement | null;

                return (
                    parent?.tagName === 'g' &&
                    parent.getAttribute('id') === categoryValue &&
                    element.getAttribute('data-name') === keyValue
                );
            });

            if (matchedElement) return matchedElement;
        }
    }
};

// Finds the group representing a category by its SVG ID variants.
export const findElementByCategory = (
    svg: XmlElement,
    categoryName: string
): XmlElement | undefined => {
    const groups = Array.from(svg.getElementsByTagName('g'));

    for (const categoryValue of getCategoryVariants(categoryName)) {
        const matchedElement = groups.find(
            (element) => element.getAttribute('id') === categoryValue
        );

        if (matchedElement) return matchedElement;
    }
};

// Finds the first block by data-name when no category match is available.
export const findElementByBlock = (svg: XmlElement, key: string): XmlElement | undefined => {
    const groups = Array.from(svg.getElementsByTagName('g'));

    for (const keyValue of getBlockVariants(key)) {
        const matchedElement = groups.find(
            (element) => element.getAttribute('data-name') === keyValue
        );

        if (matchedElement) return matchedElement;
    }
};

// Returns whether a group contains a venue shape rather than only labels/wrappers.
const hasShape = (element: XmlElement): boolean => {
    const shapeTags = ['path', 'polygon', 'rect', 'circle', 'ellipse'];

    return shapeTags.some((tagName) => element.getElementsByTagName(tagName).length > 0);
};

// Finds the shaped parent group of a text label matching the block key variants.
export const findElementByText = (svg: XmlElement, key: string): XmlElement | undefined => {
    const blockVariants = getBlockVariants(key);
    const textNodes = [
        ...Array.from(svg.getElementsByTagName('text')),
        ...Array.from(svg.getElementsByTagName('tspan')),
    ];

    for (const textNode of textNodes) {
        // Extract the text content from the SVG and clean up the whitespace.
        const textValue = (textNode.textContent ?? '').replace(/\s+/g, ' ').trim();

        // E.x: key = 'WU3' -> <tspan>WU3</tspan>
        // ['WU3', '0WU3', '_WU3', '_0WU3', 'wu3', '0wu3', ...]
        if (!blockVariants.includes(textValue)) continue;

        // Traverse upwards from the text element through its parent tags to locate the <g> element that contains the actual SVG region.
        // E.g:
        // tspan
        // → text
        // → g id="_0WU3"
        let parent = textNode.parentNode as XmlElement | null;

        while (parent) {
            // Returns only <g> elements that contain shapes such as polygon, path, rect, etc.
            if (parent.tagName === 'g' && hasShape(parent)) return parent;

            // If the current parent is not a valid SVG block, continue moving up to its parent.
            parent = parent.parentNode as XmlElement | null;
        }
    }
};
