'use client';

import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';

import { EventDetail } from '@/interfaces/Event';
import { ListingMetadata, ListingMetadataBlock } from '@/interfaces/Listing';
import { mergeUniqueAttr, searchSvgBlock, setLowestNumbericAttr } from '@/utils/venue';

import { useDebounce } from '@/hooks/useDebounce';

interface SvgElementInfo {
    id: string;
    dataName: string;
    text: string;
    hasBlockKey: boolean;
    categoryName: string;
    element: SVGElement;
}

interface VenueMapDebugContextType {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    blockCategoryFilter: string;
    setBlockCategoryFilter: (category: string) => void;
    blockStatusFilter: string;
    setBlockStatusFilter: (status: string) => void;
    svgCategoryFilter: string;
    setSvgCategoryFilter: (category: string) => void;
    svgStatusFilter: string;
    setSvgStatusFilter: (status: string) => void;
    debouncedSearchTerm: string;
    showMetadataBlocks: boolean;
    setShowMetadataBlocks: (val: boolean) => void;
    showSvgElements: boolean;
    setShowSvgElements: (val: boolean) => void;
    showApiMetadata: boolean;
    setShowApiMetadata: (val: boolean) => void;
    svgElements: SvgElementInfo[];
    availableBlocks: ListingMetadataBlock[];
    mappedBlockKeys: Set<string>;
    scanSvg: () => void;
    resetFilters: () => void;
    highlightElement: (el: SVGElement | null) => void;
    clearHighlight: (el: SVGElement | null) => void;
}

const VenueMapDebugContext = createContext<VenueMapDebugContextType | undefined>(undefined);

export default function VenueMapDebugProvider({
    children,
    metadata,
    eventDetail,
}: {
    children: ReactNode;
    metadata: ListingMetadata;
    eventDetail: EventDetail;
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    // Independent filters for Blocks
    const [blockCategoryFilter, setBlockCategoryFilter] = useState('');
    const [blockStatusFilter, setBlockStatusFilter] = useState('all');

    // Independent filters for SVG Elements
    const [svgCategoryFilter, setSvgCategoryFilter] = useState('');
    const [svgStatusFilter, setSvgStatusFilter] = useState('all');

    const updateDebouncedSearch = useDebounce((val: string) => {
        setDebouncedSearchTerm(val);
    }, 300);

    const handleSearchChange = useCallback(
        (val: string) => {
            setSearchTerm(val);
            updateDebouncedSearch(val);
        },
        [updateDebouncedSearch]
    );

    const [showMetadataBlocks, setShowMetadataBlocks] = useState(true);
    const [showSvgElements, setShowSvgElements] = useState(true);
    const [showApiMetadata, setShowApiMetadata] = useState(false);
    const [svgElements, setSvgElements] = useState<SvgElementInfo[]>([]);

    const availableBlocks = useMemo(() => {
        const blocks = [...(metadata.blocks || [])];
        if (metadata.missing_blocks) {
            for (const missing of metadata.missing_blocks) {
                for (const blockName of missing.blocks) {
                    blocks.push({
                        key: blockName,
                        price: 0,
                        categoryId: missing.category_id,
                        categoryName: missing.category_name,
                        minPrice: missing.min_price || 0,
                    });
                }
            }
        }
        return blocks;
    }, [metadata]);

    const runMapping = useCallback(() => {
        const container = document.querySelector('#venue-container') as SVGElement;
        if (!container) return;

        const textNodes = container.querySelectorAll<SVGTextElement>('tspan, text');

        for (const block of availableBlocks) {
            const { key, categoryName, categoryId, price, minPrice } = block;

            const result = searchSvgBlock({
                container,
                textNodes,
                rawKey: key,
                rawCategory: categoryName,
                venueName: eventDetail?.venueName,
            });

            if (result) {
                const element = result;
                mergeUniqueAttr(element, 'data-category-name', categoryName);
                mergeUniqueAttr(element, 'data-block-key', key);
                mergeUniqueAttr(element, 'data-category-id', categoryId.toString());
                setLowestNumbericAttr(element, 'data-price', price);
                setLowestNumbericAttr(element, 'data-min-price', minPrice);
                mergeUniqueAttr(element, 'data-selector', result.matchedSelector);
                element.classList.add('cursor-pointer');
                element.classList.add('available');
            }
        }
    }, [availableBlocks, eventDetail?.venueName]);

    const scanSvg = useCallback(() => {
        runMapping();

        const container = document.querySelector('#venue-container');
        if (!container) return;

        const elements = Array.from(container.querySelectorAll('g[id], g[data-name]'));
        const mapped = elements
            .map((el) => {
                let parentCategory = '';
                let parent = el.parentElement;
                while (parent && parent !== container) {
                    if (parent.tagName.toLowerCase() === 'g') {
                        const pid = parent.id;
                        const pName = parent.getAttribute('data-name');
                        if (pid || pName) {
                            parentCategory = pid || pName || '';
                            if (!parentCategory.toLowerCase().includes('layer')) {
                                break;
                            }
                        }
                    }
                    parent = parent.parentElement;
                }

                return {
                    id: el.id || '',
                    dataName: el.getAttribute('data-name') || '',
                    text: el.textContent?.trim().substring(0, 20) || '',
                    hasBlockKey: el.hasAttribute('data-block-key'),
                    categoryName: parentCategory,
                    element: el as SVGElement,
                };
            })
            .filter((el) => {
                const isTextInId = el.id.toLowerCase().includes('text');
                const isTextInName = el.dataName.toLowerCase().includes('text');
                return !isTextInId && !isTextInName;
            });
        setSvgElements(mapped);
    }, [runMapping]);

    const resetFilters = useCallback(() => {
        setSearchTerm('');
        setDebouncedSearchTerm('');
        setBlockCategoryFilter('');
        setBlockStatusFilter('all');
        setSvgCategoryFilter('');
        setSvgStatusFilter('all');
    }, []);

    useEffect(() => {
        let attempts = 0;
        const maxAttempts = 50;
        const retryDelay = 100;

        const tryScan = () => {
            const container = document.querySelector('#venue-container');
            if (!container && attempts < maxAttempts) {
                attempts++;
                setTimeout(tryScan, retryDelay);
                return;
            }
            if (container) scanSvg();
        };

        tryScan();
    }, [scanSvg]);

    const mappedBlockKeys = useMemo(() => {
        const keys = new Set<string>();
        svgElements.forEach((el) => {
            const blockKey = el.element.getAttribute('data-block-key');
            if (blockKey) {
                blockKey.split(',').forEach((k) => keys.add(k.trim()));
            }
        });
        return keys;
    }, [svgElements]);

    const highlightElement = (el: SVGElement | null) => {
        if (!el) return;
        const svg = el.closest('svg');
        let current: Element | null = el;
        while (current && current !== svg) {
            const parent: HTMLElement | null = current.parentElement;
            if (parent && current !== parent.lastElementChild) {
                parent.appendChild(current);
            }
            current = parent;
        }
        el.style.outline = '8px solid #ef4444';
        el.style.outlineOffset = '-2px';
    };

    const clearHighlight = (el: SVGElement | null) => {
        if (!el) return;
        el.style.outline = '';
        el.style.outlineOffset = '';
        el.style.filter = '';
    };

    return (
        <VenueMapDebugContext.Provider
            value={{
                searchTerm,
                setSearchTerm: handleSearchChange,
                blockCategoryFilter,
                setBlockCategoryFilter,
                blockStatusFilter,
                setBlockStatusFilter,
                svgCategoryFilter,
                setSvgCategoryFilter,
                svgStatusFilter,
                setSvgStatusFilter,
                debouncedSearchTerm,
                showMetadataBlocks,
                setShowMetadataBlocks,
                showSvgElements,
                setShowSvgElements,
                showApiMetadata,
                setShowApiMetadata,
                svgElements,
                availableBlocks,
                mappedBlockKeys,
                scanSvg,
                resetFilters,
                highlightElement,
                clearHighlight,
            }}
        >
            {children}
        </VenueMapDebugContext.Provider>
    );
}

export const useVenueMapDebug = () => {
    const context = useContext(VenueMapDebugContext);
    if (!context) {
        throw new Error('useVenueMapDebug must be used within a VenueMapDebugProvider');
    }
    return context;
};
