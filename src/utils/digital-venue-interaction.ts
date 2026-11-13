import type { MapViewerEventObject } from '@3ddv/dvm';
import { isEqual, sortBy } from 'lodash-es';

import type { DigitalVenueAvailableBlockInfo } from '@/types/digital-venue';

export type CategoryFilterValue = string | number;

const TOOLTIP_OFFSET = 12;

export interface ListingHoverSectionEventDetail {
    blockKey?: string | null;
    categoryName?: string | null;
}

// DDV interaction helpers expect normalized metadata: one block key and one category id per section.
// Legacy comma-separated SVG data is handled only by the SVG map path.
const normalizeInteractionValue = (value?: string | number | null) =>
    String(value ?? '')
        .trim()
        .toLowerCase();

export const getDigitalVenueTooltipElementId = (mapContainerId: string, venueId: string) =>
    `${mapContainerId}-tooltip-${venueId}`;

// Calculate the tooltip position so that the tooltip is close to the cursor but does not overflow the map area.
export const getTooltipPosition = (
    position: { left: number; top: number }, // cursor coordinates
    boundaryElementId?: string // The ID of the map container. If this ID is present, the tooltip will be limited to the map area. If not, it will fallback to the entire viewport.
) => {
    // Get the size and position of the container map on the screen.
    const boundaryRect =
        typeof document !== 'undefined' && boundaryElementId
            ? document.getElementById(boundaryElementId)?.getBoundingClientRect()
            : null;

    // Create a boundary area. If the container map is not found, use window.innerWidth/innerHeight.
    const boundary = {
        bottom: boundaryRect?.bottom || window.innerHeight,
        left: boundaryRect?.left || 0,
        right: boundaryRect?.right || window.innerWidth,
        top: boundaryRect?.top || 0,
    };

    // Calculate the midpoint of the map area.
    const boundaryMiddleX = boundary.left + (boundary.right - boundary.left) / 2;
    const boundaryMiddleY = boundary.top + (boundary.bottom - boundary.top) / 2;

    // If the cursor is on the right side of the map, the tooltip will open to the left.
    // If the cursor is in the bottom half of the map, the tooltip will open upwards.
    // The purpose is to prevent the tooltip from overflowing the right or bottom edge.
    const opensLeft = position.left > boundaryMiddleX;
    const opensUp = position.top > boundaryMiddleY;

    // Position the tooltip slightly off-center (offset) from the cursor, for example, 12px.
    const left = position.left + (opensLeft ? -TOOLTIP_OFFSET : TOOLTIP_OFFSET);
    const top = position.top + (opensUp ? -TOOLTIP_OFFSET : TOOLTIP_OFFSET);

    return {
        left,
        top,
        // If opened to the left, the tooltip moves back 100% of its width.
        // If opened to the top, it moves back 100% of its height.
        // This ensures that the left/top anchor points remain near the cursor, and the tooltip automatically expands in the correct direction.
        transform: `${opensLeft ? 'translateX(-100%)' : ''} ${opensUp ? 'translateY(-100%)' : ''}`,
    };
};

export const getPointerPosition = (event: MapViewerEventObject) => {
    // 3D Digital Venue passes through the browser mouse event for pointer-driven interactions.
    // Use its viewport coordinates so the tooltip can follow the cursor exactly.
    const originalEvent = event.original_event;

    if (originalEvent instanceof MouseEvent) {
        return {
            left: originalEvent.clientX,
            top: originalEvent.clientY,
        };
    }

    // Some viewer events do not expose a MouseEvent. Fall back to the first target node
    // position so the tooltip still appears near the interacted map element.
    const node = event.nodes[0];
    const rect = node?.getBoundingClientRect();

    return {
        left: rect?.left || 0,
        top: rect?.top || 0,
    };
};

export const getRelatedHoverSectionIds = (
    hoveredSectionId: string,
    hoveredBlockInfo: DigitalVenueAvailableBlockInfo | undefined,
    availableBlockInfoById: Record<string, DigitalVenueAvailableBlockInfo>
) => {
    if (!hoveredBlockInfo) return [];

    // Price > 0: hover exactly the current DDV section only.
    if (Number(hoveredBlockInfo.price) > 0) {
        return [hoveredSectionId];
    }

    // Category-only blocks still highlight every section in the same category.
    const hoveredCategoryId = normalizeInteractionValue(hoveredBlockInfo.categoryId);

    return Object.entries(availableBlockInfoById)
        .filter(([, blockInfo]) => {
            return normalizeInteractionValue(blockInfo.categoryId) === hoveredCategoryId;
        })
        .map(([sectionId]) => sectionId);
};

export const getHoverKey = (sectionIds: string[] | string | null) => {
    if (!sectionIds) return '';
    return Array.isArray(sectionIds) ? sectionIds.join('|') : sectionIds;
};

export const isSameFilterValues = (
    left: CategoryFilterValue[] | undefined,
    right: CategoryFilterValue[] | undefined
) => isEqual(sortBy(left?.map(String) || []), sortBy(right?.map(String) || []));

export const getCategories = (
    prevBlocks: string[] | undefined,
    keys: string[],
    prevCategories: CategoryFilterValue[] | undefined,
    categoryIds: CategoryFilterValue[],
    priceNum: number
) => {
    if (!prevCategories) return categoryIds;
    if (prevBlocks) {
        if (isEqual(sortBy(prevBlocks), sortBy(keys))) {
            return undefined;
        }
        return categoryIds;
    }
    if (isSameFilterValues(prevCategories, categoryIds)) {
        if (priceNum > 0) {
            return categoryIds;
        }
        return undefined;
    }
    return categoryIds;
};

export const getCategoryFilterValues = (value: string | number): CategoryFilterValue[] => {
    if (!value) return [];
    return [value].map((token) => {
        const numberValue = Number(token);

        return Number.isNaN(numberValue) ? token : numberValue;
    });
};

export const getListingHoverSectionEntry = (
    { blockKey, categoryName }: ListingHoverSectionEventDetail,
    availableBlockInfoById: Record<string, DigitalVenueAvailableBlockInfo>
) => {
    const normalizedCategoryName = categoryName?.toLowerCase().trim();
    const normalizedBlockKey = normalizeInteractionValue(blockKey);
    const entries = Object.entries(availableBlockInfoById);

    // Prefer block and category matching
    const blockAndCategoryMatch =
        normalizedBlockKey && normalizedCategoryName
            ? entries.find(
                  ([, blockInfo]) =>
                      normalizeInteractionValue(blockInfo.key) === normalizedBlockKey &&
                      blockInfo.categoryName?.toLowerCase().trim() === normalizedCategoryName
              )
            : undefined;

    if (blockAndCategoryMatch) return blockAndCategoryMatch;

    // Prefer block matching because it represents a more specific listing section.
    const blockMatch = normalizedBlockKey
        ? entries.find(
              ([, blockInfo]) => normalizeInteractionValue(blockInfo.key) === normalizedBlockKey
          )
        : undefined;

    if (blockMatch) return blockMatch;

    // Category is only a fallback for listings without a usable block key.
    return entries.find(
        ([, blockInfo]) =>
            normalizedCategoryName &&
            blockInfo.categoryName?.toLowerCase().trim() === normalizedCategoryName
    );
};

export const setElementText = (parentElement: HTMLElement, selector: string, value: string) => {
    const element = parentElement.querySelector<HTMLElement>(selector);
    if (!element) return;

    element.textContent = value;
};

export const setElementDisplay = (
    parentElement: HTMLElement,
    selector: string,
    display: string
) => {
    const element = parentElement.querySelector<HTMLElement>(selector);
    if (!element) return;

    element.style.display = display;
};

export const hideTooltipElement = (tooltipElementId: string) => {
    const tooltipElement = document.getElementById(tooltipElementId);
    if (!tooltipElement) return;

    tooltipElement.classList.add('hidden');
};
