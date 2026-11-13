import { useEffect, useRef, type Dispatch, type SetStateAction } from 'react';
import type { MapViewer, MapViewerEventObject } from '@3ddv/dvm';
import { useLocale } from 'next-intl';

import type { ListingSearchFilters } from '@/interfaces/Listing';
import type { DigitalVenueAvailableBlockInfo } from '@/types/digital-venue';
import { formatPrice } from '@/utils/currency.util';
import {
    CategoryFilterValue,
    getCategories,
    getCategoryFilterValues,
    getHoverKey,
    getListingHoverSectionEntry,
    getPointerPosition,
    getTooltipPosition,
    hideTooltipElement,
    ListingHoverSectionEventDetail,
    setElementDisplay,
    setElementText,
} from '@/utils/digital-venue-interaction';
import { updateArrayFilter } from '@/utils/venue';

export const DDV_LISTING_HOVER_SECTION_EVENT = 'ddv:listing-hover-section';
export const DDV_LISTING_UNHOVER_SECTION_EVENT = 'ddv:listing-unhover-section';

interface UseDDVMapInteractionsParams {
    activeSectionIds: string[];
    availableBlockInfoById: Record<string, DigitalVenueAvailableBlockInfo>;
    boundaryElementId: string;
    mapViewer: MapViewer | null;
    onChangeSection?: (payload: { blockKeyId: string | null; categoryId: string | null }) => void;
    setFilters?: Dispatch<SetStateAction<ListingSearchFilters>>;
    tooltipElementId: string;
    currencyCode?: string;
}

interface DOMTooltipPayload {
    blockName: string;
    categoryName: string;
    left: number;
    minPrice?: number;
    price?: number;
    sectionId: string;
    top: number;
}

const HIDE_TOOLTIP_DEBOUNCE_MS = 100;

export const useDDVMapInteractions = ({
    activeSectionIds,
    availableBlockInfoById,
    boundaryElementId,
    mapViewer,
    onChangeSection,
    setFilters,
    tooltipElementId,
    currencyCode = 'USD',
}: UseDDVMapInteractionsParams) => {
    const locale = useLocale();

    // Store and track current active section
    const activeSectionIdsRef = useRef(activeSectionIds);
    const availableBlockInfoByIdRef = useRef(availableBlockInfoById);
    const frameIdRef = useRef<number | null>(null);
    // Debounce the leave reset so quick pointer transitions do not flicker the map/tooltip.
    const hideTooltipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastHoverKeyRef = useRef('');
    const onChangeSectionRef = useRef(onChangeSection);
    const pendingTooltipRef = useRef<DOMTooltipPayload | null>(null);
    const setFiltersRef = useRef(setFilters);
    // Listing hover events also need to cancel any pending map reset.
    const cancelResetHoverRef = useRef<() => void>(null);
    const resetHoverRef = useRef<() => void>(null);
    const currentKeyHover = useRef<string>('');

    useEffect(() => {
        activeSectionIdsRef.current = activeSectionIds;
        availableBlockInfoByIdRef.current = availableBlockInfoById;
        onChangeSectionRef.current = onChangeSection;
        setFiltersRef.current = setFilters;
        lastHoverKeyRef.current = '';
    }, [activeSectionIds, availableBlockInfoById, onChangeSection, setFilters]);

    useEffect(() => {
        const handleHighlightSection = (event: Event) => {
            const customEvent = event as CustomEvent<ListingHoverSectionEventDetail>;
            const eventDetail = customEvent.detail;
            if ((!eventDetail?.blockKey && !eventDetail?.categoryName) || !mapViewer) return;

            const currentBlockInfoById = availableBlockInfoByIdRef.current;
            const matchedEntry = getListingHoverSectionEntry(eventDetail, currentBlockInfoById);
            if (!matchedEntry) return;

            const [sectionId, blockInfo] = matchedEntry;
            const relatedHoverSectionIds =
                Number(blockInfo.price) > 0
                    ? [sectionId]
                    : mapViewer.getNodesByGroups('section', String(blockInfo.categoryId));

            // A listing hover is a new active hover target, so do not let a pending leave reset win.
            cancelResetHoverRef.current?.();
            mapViewer.hover(null);
            mapViewer.setAvailability('section', relatedHoverSectionIds);
            mapViewer.hover(relatedHoverSectionIds);
        };

        const handleUnHighlightSection = () => resetHoverRef.current && resetHoverRef.current();

        window.addEventListener(DDV_LISTING_HOVER_SECTION_EVENT, handleHighlightSection);
        window.addEventListener(DDV_LISTING_UNHOVER_SECTION_EVENT, handleUnHighlightSection);

        return () => {
            window.removeEventListener(DDV_LISTING_HOVER_SECTION_EVENT, handleHighlightSection);
            window.removeEventListener(DDV_LISTING_UNHOVER_SECTION_EVENT, handleUnHighlightSection);
        };
    }, [mapViewer]);

    useEffect(() => {
        if (!mapViewer) return;

        const updateTooltipElement = (tooltip: DOMTooltipPayload | null) => {
            if (!tooltip) return;

            const tooltipElement = document.getElementById(tooltipElementId);
            if (!tooltipElement) return;

            const price = Number(tooltip.price);
            const minPrice = Number(tooltip.minPrice);
            const tooltipPosition = getTooltipPosition(
                { left: tooltip.left, top: tooltip.top },
                boundaryElementId
            );

            tooltipElement.style.left = `${tooltipPosition.left}px`;
            tooltipElement.style.top = `${tooltipPosition.top}px`;
            tooltipElement.style.transform = tooltipPosition.transform;
            tooltipElement.classList.remove('hidden');

            // Set text's element for tooltip block and category
            setElementText(tooltipElement, '[data-ddv-tooltip-block]', tooltip.blockName);
            setElementText(tooltipElement, '[data-ddv-tooltip-category]', tooltip.categoryName);

            // Set text's element for tooltip min price
            setElementDisplay(tooltipElement, '[data-ddv-tooltip-min-price-block]', '');
            setElementText(
                tooltipElement,
                '[data-ddv-tooltip-min-price]',
                formatPrice(minPrice, locale, currencyCode)
            );

            // Set tooltip price text based on condition: if the price > 0, display the detail block; otherwise, hide it.
            if (price > 0) {
                setElementDisplay(tooltipElement, '[data-ddv-tooltip-price-block]', '');
                setElementText(
                    tooltipElement,
                    '[data-ddv-tooltip-price]',
                    formatPrice(price, locale, currencyCode)
                );
            } else {
                setElementDisplay(tooltipElement, '[data-ddv-tooltip-price-block]', 'none');
            }

            const tooltipCard =
                tooltipElement.querySelector<HTMLElement>('[data-ddv-tooltip-card]');
            // If the section ID is different, close the old tooltip and open the new one.
            if (tooltipCard && tooltipElement.dataset.sectionId !== tooltip.sectionId) {
                tooltipCard.style.animation = 'none';
                void tooltipCard.offsetHeight;
                tooltipCard.style.animation = '';
            }

            tooltipElement.dataset.sectionId = tooltip.sectionId;
        };

        const scheduleTooltip = (tooltip: DOMTooltipPayload) => {
            pendingTooltipRef.current = tooltip;

            if (frameIdRef.current !== null) return;

            frameIdRef.current = requestAnimationFrame(() => {
                frameIdRef.current = null;
                updateTooltipElement(pendingTooltipRef.current);
            });
        };

        const cancelHideTooltip = () => {
            if (hideTooltipTimeoutRef.current === null) return;

            clearTimeout(hideTooltipTimeoutRef.current);
            hideTooltipTimeoutRef.current = null;
        };

        const showTooltip = (event: MapViewerEventObject) => {
            const node = event.nodes.find((item) => item.type === 'section') || event.nodes[0];
            if (!node || node.state === 'disabled') return;

            // Cancel the delayed reset only after confirming the event still points at a real section.
            // Some empty move/hover events can fire after leaving the map.
            cancelHideTooltip();

            const currentBlockInfoById = availableBlockInfoByIdRef.current;
            const blockInfo = currentBlockInfoById[node.id];
            if (!blockInfo) return;
            const position = getPointerPosition(event);
            const relatedHoverSectionIds =
                Number(blockInfo.price) > 0
                    ? [node.id]
                    : mapViewer
                          .getNodesByGroups('section', String(blockInfo.categoryId))
                          .map((item) => item.id);

            // Convert to string with "|" to get a hover key
            const hoverKey = getHoverKey(relatedHoverSectionIds);

            if (currentKeyHover.current !== node.id && lastHoverKeyRef.current !== hoverKey) {
                // During hover, only the related hover sections stay available; filtered sections are hidden.
                mapViewer.hover(null);
                /**
                 * setAvailability filters which sections remain active/visible.
                 * While hover applies the visual hover highlight.
                 * So we need both: one controls availability, the other controls the hover effect.
                 */
                // Only these sections remain active/available while hovering.
                mapViewer.setAvailability('section', relatedHoverSectionIds);
                // Mark the hover visual state for these sections.
                mapViewer.hover(relatedHoverSectionIds);
                lastHoverKeyRef.current = hoverKey;
            }

            scheduleTooltip({
                blockName: blockInfo.key || node.label || node.original_id || node.id,
                categoryName: blockInfo.categoryName,
                minPrice: blockInfo.minPrice,
                price: blockInfo.price,
                sectionId: node.id,
                left: position.left,
                top: position.top,
            });
            currentKeyHover.current = node.id;
        };

        const hideTooltip = () => {
            hideTooltipTimeoutRef.current = null;
            lastHoverKeyRef.current = '';
            pendingTooltipRef.current = null;
            currentKeyHover.current = '';

            if (frameIdRef.current !== null) {
                cancelAnimationFrame(frameIdRef.current);
                frameIdRef.current = null;
            }

            mapViewer.hover(null);
            // On leave, restore the sections that are currently active from the filters.
            mapViewer.setAvailability('section', activeSectionIdsRef.current);
            hideTooltipElement(tooltipElementId);
        };

        const scheduleHideTooltip = () => {
            // Give enter/hover a short window to cancel this reset during fast pointer movement.
            cancelHideTooltip();
            hideTooltipTimeoutRef.current = setTimeout(hideTooltip, HIDE_TOOLTIP_DEBOUNCE_MS);
        };

        const handleClick = (event: MapViewerEventObject) => {
            const node = event.nodes.find((item) => item.type === 'section') || event.nodes[0];
            if (!node || node.state === 'disabled') return;

            const blockInfo = availableBlockInfoByIdRef.current[node.id];
            if (!blockInfo) return;

            const keys = [blockInfo.key];
            // Convert string[] to number[]
            const categoryIds = getCategoryFilterValues(blockInfo.categoryId);
            const priceNum = Number(blockInfo.price);
            // mapViewer.goTo(node.id, 3.0);
            setFiltersRef.current?.((prev) => ({
                ...prev,
                page: 1,
                skip: false,
                // If price > 0, filter by block and category
                // If price = 0, filter by category only
                blocks: priceNum > 0 ? updateArrayFilter(prev.blocks, keys) : undefined,
                categories: getCategories(
                    prev.blocks,
                    keys,
                    prev.categories as CategoryFilterValue[] | undefined,
                    categoryIds,
                    priceNum
                ) as ListingSearchFilters['categories'],
            }));

            onChangeSectionRef.current?.({
                blockKeyId: blockInfo.target ?? '',
                categoryId: String(blockInfo.categoryId),
            });
        };

        resetHoverRef.current = scheduleHideTooltip;
        cancelResetHoverRef.current = cancelHideTooltip;
        const enterSubscription = mapViewer.subscribe('enter', showTooltip);
        const hoverSubscription = mapViewer.subscribe('hover', showTooltip);
        const moveSubscription = mapViewer.subscribe('move', showTooltip);
        const leaveSubscription = mapViewer.subscribe('leave', scheduleHideTooltip);
        const clickSubscription = mapViewer.subscribe('click', handleClick);

        return () => {
            enterSubscription.unsubscribe();
            hoverSubscription.unsubscribe();
            moveSubscription.unsubscribe();
            leaveSubscription.unsubscribe();
            clickSubscription.unsubscribe();

            // Prevent the delayed leave reset from running after this viewer subscription is gone.
            cancelHideTooltip();

            if (frameIdRef.current !== null) {
                cancelAnimationFrame(frameIdRef.current);
                frameIdRef.current = null;
            }

            lastHoverKeyRef.current = '';
            pendingTooltipRef.current = null;
            cancelResetHoverRef.current = null;
            resetHoverRef.current = null;
            mapViewer.hover(null);
            hideTooltipElement(tooltipElementId);
        };
    }, [boundaryElementId, currencyCode, locale, mapViewer, tooltipElementId]);
};
