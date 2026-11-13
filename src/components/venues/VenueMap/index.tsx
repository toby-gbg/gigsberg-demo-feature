'use client';

import { Dispatch, MouseEvent, SetStateAction, useCallback, useMemo, useRef } from 'react';
import Image from 'next/image';
import parse from 'html-react-parser';
import { isEqual, sortBy } from 'lodash-es';
import { useEffectOnce, useUpdateEffect } from 'react-use';
import { ReactZoomPanPinchRef, TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';

import DefaultVenue from '@/assets/svg/DefaultVenue.svg';
import { EventDetail } from '@/interfaces/Event';
import { ListingMetadata, ListingSearchFilters } from '@/interfaces/Listing';
import { cn } from '@/lib/cn';
import {
    mergeUniqueAttr,
    searchSvgBlock,
    setLowestNumbericAttr,
    updateArrayFilter,
} from '@/utils/venue';
import { useGetVenueSvgMap } from '@/swr/features/venues';

import { useSvgMap } from '@/hooks/useSvgMap';

import MapTooltip, { MapTooltipMethod } from '@/components/venues/VenueMap/MapTooltip';

import VenueMapSkeleton from './VenueMapSkeleton';
import VenueMapZoom from './VenueMapZoom';

export interface VenueMapProps {
    metadata: ListingMetadata;
    eventDetail: EventDetail;
    filters: ListingSearchFilters;
    setFilters: Dispatch<SetStateAction<ListingSearchFilters>>;
    isMetadataFetching?: boolean;
    mapUrls?: Record<string, string[]>;
    isDebug?: boolean;
    currencyCode?: string;
}

interface MapProps extends VenueMapProps {
    svgContent: string;
}

// 200px = website header + breadcrumbs, 96px = listing header, 94px = ticket list filters
// min-h-62.5 floors the map when a short desktop viewport makes the calc smaller than 250px
const VENUE_MAP_SIZE_CLASS_NAME = 'min-h-62.5! h-62.5! lg:h-[calc(100vh-200px-96px-94px)]! w-full!';

const Map = ({
    svgContent,
    metadata,
    eventDetail,
    filters,
    setFilters,
    mapUrls,
    isDebug,
    currencyCode,
}: MapProps) => {
    const tooltipRef = useRef<MapTooltipMethod>(null);
    const lastHoveredRef = useRef<SVGElement | null>(null);

    /* =========================================
     * SVG MAP HOOK
     * ========================================= */
    const { highlight, extractData, buildElements } = useSvgMap();

    /* =========================================
     * Compute available blocks from metadata
     * ========================================= */
    const availableBlocks = useMemo(() => {
        if (!metadata.blocks || !Array.isArray(metadata.blocks)) return [];

        const missingBlocks = [];
        if (metadata.missing_blocks) {
            for (const missing of metadata.missing_blocks) {
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
        const allBlocks = [...missingBlocks, ...metadata.blocks];

        return allBlocks;
    }, [metadata]);

    /*==========================================
     * Update toolip data and position
     * ========================================*/
    const updateTooltipPosition = (e: MouseEvent) => {
        const tooltip = tooltipRef.current;
        if (!tooltip) return;

        tooltip.updatePosition(e.clientX, e.clientY);

        tooltip.setVisible(true);
    };

    const updateTooltipData = (element: SVGElement) => {
        const tooltip = tooltipRef.current;
        if (!tooltip) return;

        const data = extractData(element);
        tooltip.updateData(data);
    };

    /* =========================================
     * HIGHLIGHTING
     * ========================================= */
    // Restore highlight based on current filters
    const onUpdateHighlight = useCallback(() => {
        const keys = filters.blocks || [];
        const categoryIds = filters.categories || [];

        highlight({
            keys: keys.length ? keys : undefined,
            categoryIds: categoryIds.length ? categoryIds : undefined,
        });
    }, [highlight, filters.blocks, filters.categories]);

    // Highlight
    const handleHighlight = useCallback((element: SVGElement) => {
        // Check if the block has a specific block key (available for sale)
        const { blockKey, categoryId, price } = extractData(element);

        const keys = blockKey?.trim().split(',') || [];
        const categoryIds = categoryId?.trim().split(',') || [];
        const priceNum = Number(price);

        // If price > 0, highlight by block and category
        // If price = 0, highlight by category only
        highlight(
            priceNum > 0
                ? {
                      keys,
                      categoryIds,
                  }
                : {
                      categoryIds,
                  }
        );
    }, []);

    /* =========================================
     * EVENT HANDLERS
     * ========================================= */
    // Mouse leave handler
    const onMouseLeave = useCallback(() => {
        lastHoveredRef.current = null;

        // Hide the price badge
        if (tooltipRef.current) {
            tooltipRef.current.setVisible(false);
        }

        onUpdateHighlight();
    }, [onUpdateHighlight]);

    // Mouse move handler
    const onMouseMove = useCallback(
        (e: MouseEvent<HTMLDivElement>) => {
            const element = (e.target as SVGElement).closest<SVGElement>('[data-block-key]');

            if (!element) {
                onMouseLeave();
                return;
            }

            // Same element as last hover → do nothing
            if (lastHoveredRef.current === element) {
                updateTooltipPosition(e);
                return;
            }

            lastHoveredRef.current = element;

            // Highlight the block/category
            handleHighlight(element);

            // Update tooltip
            updateTooltipPosition(e);
            updateTooltipData(element);
        },
        [handleHighlight, onMouseLeave]
    );

    const getCategories = (
        prevBlocks: string[] | undefined,
        keys: string[],
        prevCategories: string[] | undefined,
        categoryIds: string[],
        priceNum: number
    ) => {
        if (!prevCategories) return categoryIds;
        if (prevBlocks) {
            if (isEqual(sortBy(prevBlocks), sortBy(keys))) {
                return undefined;
            }
            return categoryIds;
        }
        if (isEqual(sortBy(prevCategories), sortBy(categoryIds))) {
            if (priceNum > 0) {
                return categoryIds;
            }
            return undefined;
        }
        return categoryIds;
    };

    // Click handler
    const onMapClick = useCallback((e: MouseEvent<HTMLDivElement>) => {
        const element = (e.target as SVGElement).closest<SVGElement>('[data-block-key]');
        if (!element) return;

        const { blockKey, price, categoryId } = extractData(element);
        const priceNum = Number(price);

        // Filter by block and category
        // Split by whitespace
        const keys = blockKey?.trim().split(',') || [];
        const categoryIds = categoryId?.trim().split(',') || [];

        setFilters((prev) => ({
            ...prev,
            page: 1,
            skip: false, // If price > 0, filter by block and category
            // If price = 0, filter by category only
            blocks: priceNum > 0 ? updateArrayFilter(prev.blocks, keys) : undefined,
            categories: getCategories(prev.blocks, keys, prev.categories, categoryIds, priceNum),
        }));
    }, []);

    /* =========================================
     * EFFECTS
     * ========================================= */
    // Update highlight when filters change
    useUpdateEffect(() => {
        onUpdateHighlight();
    }, [onUpdateHighlight]);

    // Initialize available blocks on SVG load
    useEffectOnce(() => {
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
                const { element, matchedSelector } = result;
                mergeUniqueAttr(element, 'data-category-name', categoryName);

                // Add more key attributes. Ex: data-block-key="SU6,B45"
                mergeUniqueAttr(element, 'data-block-key', key);

                // Add more category ID attributes. Ex: data-category-id="12,15"
                mergeUniqueAttr(element, 'data-category-id', categoryId.toString());

                // Set the lowest price if not set or higher than current
                // Ex: data-price="50" -> data-price="30"
                setLowestNumbericAttr(element, 'data-price', price);

                // Set the lowest min price if not set or higher than current
                // Ex: data-min-price="20" -> data-min-price="15"
                setLowestNumbericAttr(element, 'data-min-price', minPrice);

                if (isDebug) {
                    // Store the selector for debug mode
                    mergeUniqueAttr(element, 'data-selector', matchedSelector);
                }

                element.classList.add('cursor-pointer');

                element.classList.add('available');
            }
        }

        // Prebuild elements index
        buildElements();
    });

    /* =========================================
     * RENDER
     * ========================================= */
    // Memoized parsed SVG content with modified SVG attributes
    const parsedSvg = useMemo(() => {
        // Remove <title> and <desc> tags to prevent showing default tooltips
        const cleanedSvgContent = svgContent
            .replace(/<title>[\s\S]*?<\/title>/g, '')
            .replace(/<desc>[\s\S]*?<\/desc>/g, '');

        return parse(cleanedSvgContent, {
            replace: (domNode) => {
                if (
                    domNode.type === 'tag' &&
                    (domNode.name === 'title' || domNode.name === 'desc')
                ) {
                    return null;
                }

                if (domNode.type === 'tag' && domNode.name === 'svg') {
                    domNode.attribs = {
                        ...domNode.attribs,
                        id: 'venue-container',
                        style: 'direction: ltr;',
                        class: 'size-full!',
                        'aria-hidden': 'true',
                    };
                }

                return domNode;
            },
        });
    }, [svgContent]);

    return (
        <div
            className="relative svg-container"
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            onClick={onMapClick}
        >
            <TransformComponent
                wrapperClass={VENUE_MAP_SIZE_CLASS_NAME}
                contentClass="size-full! justify-center relative"
            >
                <div className={cn('size-full')}>{parsedSvg}</div>
            </TransformComponent>

            <MapTooltip
                ref={tooltipRef}
                mapUrls={mapUrls}
                isDebug={isDebug}
                currencyCode={currencyCode}
            />
        </div>
    );
};

const VALID_THRESHOLD = 80;

const clampPosition = (position: number, min: number, max: number) => {
    if (position < min) return min;
    if (position > max) return max;

    return position;
};

const handlePanningStop = (ref: ReactZoomPanPinchRef) => {
    const { scale, positionX, positionY } = ref.state;

    const bounds = ref.instance.bounds;
    if (!bounds) return;

    const x = clampPosition(
        positionX,
        bounds.minPositionX - VALID_THRESHOLD,
        bounds.maxPositionX + VALID_THRESHOLD
    );

    const y = clampPosition(
        positionY,
        bounds.minPositionY - VALID_THRESHOLD,
        bounds.maxPositionY + VALID_THRESHOLD
    );

    if (x !== positionX || y !== positionY) {
        ref.setTransform(x, y, scale, 200);
    }
};

export default function VenueMap({
    metadata,
    eventDetail,
    filters,
    setFilters,
    isMetadataFetching,
    mapUrls,
    isDebug = false,
    currencyCode,
}: VenueMapProps) {
    const filePath = eventDetail?.svgFilePath;
    const { data, isLoading } = useGetVenueSvgMap(filePath!, {
        skip: !filePath && isDebug,
    });

    if (isLoading || isMetadataFetching)
        return (
            <div className={cn(!isMetadataFetching && 'pt-4')}>
                <VenueMapSkeleton />
            </div>
        );

    return data ? (
        <TransformWrapper
            minScale={0.85}
            maxScale={5}
            initialScale={0.95}
            centerOnInit
            onPanningStop={handlePanningStop}
            doubleClick={{ disabled: true }}
            velocityAnimation={{ disabled: true }}
        >
            <VenueMapZoom />
            <Map
                svgContent={data}
                metadata={metadata}
                eventDetail={eventDetail}
                filters={filters}
                setFilters={setFilters}
                mapUrls={mapUrls}
                isDebug={isDebug}
                currencyCode={currencyCode}
            />
        </TransformWrapper>
    ) : (
        <Image
            src={DefaultVenue}
            alt="Default Venue Map"
            className={cn('mx-auto py-4', VENUE_MAP_SIZE_CLASS_NAME)}
        />
    );
}
