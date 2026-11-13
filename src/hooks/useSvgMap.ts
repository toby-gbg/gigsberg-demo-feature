import { useCallback, useRef } from 'react';

interface HighlightFilter {
    keys?: string[];
    categoryIds?: string[];
}

// Split a comma-separated string into trimmed tokens
const getCommaTokens = (v?: string | null) =>
    v
        ?.split(',')
        .map((t) => t.trim())
        .filter(Boolean) || [];

const getContainer = () => document.querySelector('#venue-container') as SVGElement | null;

export const useSvgMap = () => {
    const elementsRef = useRef<SVGElement[] | null>(null);

    const buildElements = () => {
        const container = getContainer();
        if (!container) return [];

        elementsRef.current = Array.from(
            container.querySelectorAll<SVGElement>('g[data-block-key]')
        );

        return elementsRef.current;
    };

    // Ensure the SVG index is built
    const ensureElements = () => {
        if (elementsRef.current) return elementsRef.current;
        return buildElements();
    };

    // Remove all highlights
    const clearHighlight = useCallback(() => {
        const container = getContainer();
        if (container) {
            const availableElements = container.querySelectorAll('.available');
            availableElements.forEach((el) => {
                el.classList.remove('available');
            });
            container.classList.remove('available');
        }

        for (const el of ensureElements()) {
            el.classList.remove('available');
        }
    }, []);

    const highlight = useCallback(
        (filter: HighlightFilter = {}) => {
            clearHighlight();

            const { keys, categoryIds } = filter;

            const elements = ensureElements();

            for (const el of elements) {
                const blockKeys = getCommaTokens(el.getAttribute('data-block-key'));
                const categoryIdsAttr = getCommaTokens(el.getAttribute('data-category-id'));

                // Key filtering
                if (keys && !keys.some((k) => blockKeys.includes(k))) continue;

                // Category ID filtering
                if (categoryIds && !categoryIds.some((id) => categoryIdsAttr.includes(id)))
                    continue;

                el.classList.add('available');
            }
        },
        [clearHighlight]
    );

    // Extract data from SVG elements if needed
    const extractData = useCallback((element: SVGElement) => {
        const blockKey = element.getAttribute('data-block-key');
        const categoryId = element.getAttribute('data-category-id');
        const categoryName = element.getAttribute('data-category-name');
        const price = element.getAttribute('data-price');
        const minPrice = element.getAttribute('data-min-price');
        const available = element.getAttribute('data-available');
        const maps3dUrls = element.getAttribute('data-maps-3d-urls');
        const selector = element.getAttribute('data-selector');

        return {
            blockKey,
            categoryId,
            categoryName,
            price,
            minPrice,
            available,
            maps3dUrls,
            selector,
        };
    }, []);

    return {
        buildElements,
        extractData,
        highlight,
        clearHighlight,
    };
};
