'use client';

import { useEffect, useRef } from 'react';
import parse from 'html-react-parser';
import { isEqual, sortBy } from 'lodash-es';
import { useLocale } from 'next-intl';
import { useEffectOnce, useLatest } from 'react-use';
import { ReactZoomPanPinchRef, TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';

import { VenueViewer } from '@/lib/venue-viewer';
import { updateArrayFilter } from '@/utils/venue';

import { useListing } from '@/providers/ListingProvider';

import VenueMapZoom from '@/components/venues/VenueMap/VenueMapZoom';

import ListingMapTooltip from './ListingMapTooltip';

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

interface Props {
    svgContent: string;
    type: string;
    subtype: string;
}

const getCategories = (
    prevBlocks: string[] | undefined,
    keys: string[],
    prevCategories: string[] | undefined,
    categoryIds: string[],
    price: number
) => {
    if (!prevCategories) return categoryIds;
    if (prevBlocks) {
        return isEqual(sortBy(prevBlocks), sortBy(keys)) ? undefined : categoryIds;
    }
    if (isEqual(sortBy(prevCategories), sortBy(categoryIds))) {
        return price > 0 ? categoryIds : undefined;
    }
    return categoryIds;
};

export default function ListingMap({ svgContent, type, subtype }: Props) {
    const locale = useLocale();
    const { filters, setFilters, mapUrls } = useListing();

    const venueMapViewerRef = useRef<VenueViewer | undefined>(undefined);
    const currencyCodeRef = useLatest(filters.currency_code);
    const localeRef = useLatest(locale);

    // Initialize map viewer SVG
    useEffectOnce(() => {
        if (!svgContent) return;

        const svg = document.getElementById('venue-map-container');
        const tooltipElement = document.getElementById('venue-map-tooltip');

        if (!(svg instanceof SVGSVGElement) || !tooltipElement) return;

        // Instance SVG
        const viewer = new VenueViewer(
            svg,
            {
                eventTarget: window,
                tooltip: {
                    element: tooltipElement,
                    getCurrencyCode: () => currencyCodeRef.current,
                    getLocale: () => localeRef.current,
                },
                type,
                subtype,
            },
            mapUrls
        );

        // Initialize SVG
        viewer.initialize();

        // Subscribe interaction events (click, hover, pointermove) from SVG
        viewer.subscribeInteractions({
            onBlockClick: ({ categoryIds, blockKeys, price }) => {
                setFilters((prev) => ({
                    ...prev,
                    page: 1,
                    skip: false,
                    blocks:
                        blockKeys && price > 0
                            ? updateArrayFilter(prev.blocks, blockKeys)
                            : undefined,
                    categories: getCategories(
                        prev.blocks,
                        blockKeys,
                        prev.categories,
                        categoryIds,
                        price
                    ),
                }));
            },
        });

        venueMapViewerRef.current = viewer;

        // Destroy instance SVG
        return () => {
            viewer.destroy();
            venueMapViewerRef.current = undefined;
        };
    });

    // Handle filter action
    useEffect(() => {
        venueMapViewerRef.current?.applyFilters({
            categories: filters.categories,
            blocks: filters.blocks,
        });
    }, [filters.blocks, filters.categories]);

    return (
        <>
            <TransformWrapper
                minScale={0.85}
                maxScale={5}
                centerOnInit
                onPanningStop={handlePanningStop}
                doubleClick={{ disabled: true }}
                velocityAnimation={{ disabled: true }}
            >
                <VenueMapZoom />
                <TransformComponent
                    wrapperClass="h-[250px]! min-h-[250px]! lg:h-[calc(100dvh-440px)]! w-full!"
                    contentClass="size-full! justify-center relative"
                >
                    {parse(svgContent)}
                </TransformComponent>
            </TransformWrapper>
            <ListingMapTooltip />
        </>
    );
}
