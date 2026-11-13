import { snakeCase } from 'lodash-es';

import { EXCLUDE_SUBTYPE, EXCLUDE_TYPE } from '@/constants/venue-map';

import type { ListingCardHoveredDetail, VenueViewerFilters, VenueViewerOptions } from './types';
import { LISTING_CARD_HOVERED, LISTING_CARD_UNHOVERED } from './types';
import { VenueSvgController } from './VenueSvgController';
import { VenueTooltipController } from './VenueTooltipController';

export { LISTING_CARD_HOVERED, LISTING_CARD_UNHOVERED } from './types';
export type {
    ListingCardHoveredDetail,
    VenueTooltipOptions,
    VenueTooltipInteraction,
    VenueViewerFilters,
    VenueViewerOptions,
} from './types';
export type { VenueElementHover } from './VenueSvgController';

export class VenueViewer {
    private readonly abortController = new AbortController();
    private readonly svgController: VenueSvgController;
    private readonly eventTarget: EventTarget;
    private readonly tooltipController: VenueTooltipController;
    private readonly mapUrls: Record<string, string[]> | undefined;
    private readonly type: string | undefined;
    private readonly subtype: string | undefined;
    private activeElements: SVGGElement[] = [];
    private initialAvailableElements: SVGGElement[] = [];

    constructor(
        svgElement: SVGSVGElement,
        { eventTarget, tooltip, type, subtype }: VenueViewerOptions,
        mapUrls: Record<string, string[]> | undefined
    ) {
        this.eventTarget = eventTarget;
        this.svgController = new VenueSvgController(svgElement);
        this.tooltipController = new VenueTooltipController(tooltip);
        this.mapUrls = mapUrls;
        this.type = type;
        this.subtype = subtype;
    }

    // Initializes and applies the venue map state.
    initialize(): void {
        this.initialAvailableElements = this.svgController.getAvailableElements();
        this.activeElements = this.initialAvailableElements;

        this.subscribeListingCardInteractions();
    }

    // Handles interactions from normalized SVG metadata.
    subscribeInteractions({
        onBlockClick,
    }: {
        onBlockClick: (element: {
            categoryIds: string[];
            blockKeys: string[];
            price: number;
        }) => void;
    }): void {
        this.svgController.onElementClick((element) => {
            if (!element) return;

            const { categoryIds, blockKeys, price } =
                this.svgController.getAvailableAttributes(element);

            onBlockClick({ categoryIds, blockKeys, price });
        });

        this.svgController.onElementHover((element) => {
            if (!element) {
                this.restoreState();
                this.tooltipController.hide();
                return;
            }

            const elementTarget = element.element;

            const { price, categoryIds, blockKeys, categoryNames, minPrice } =
                this.svgController.getAvailableAttributes(elementTarget);

            const hoveredElements =
                price > 0
                    ? [element.element]
                    : this.svgController.getElementsByCategoriesOrBlocks(categoryIds);

            this.svgController.setAvailableElements(hoveredElements);

            this.tooltipController.show({
                categoryName: categoryNames[0],
                blockKey: blockKeys[0],
                price,
                minPrice,
                clientX: element.clientX,
                clientY: element.clientY,
                imageMapUrl: this.getImageFromMapUrls(categoryNames, blockKeys),
            });
        });

        this.svgController.onPointerMove((clientX, clientY) => {
            this.tooltipController.move(clientX, clientY);
        });
    }

    // Applies filters and stores the SVG state for restoration.
    applyFilters(filters: VenueViewerFilters): void {
        if (!filters.categories?.length) {
            this.activeElements = this.initialAvailableElements;
            this.svgController.setAvailableElements(this.activeElements);
            return;
        }

        this.activeElements = this.svgController.getElementsByCategoriesOrBlocks(
            filters.categories,
            filters.blocks
        );
        this.svgController.setAvailableElements(this.activeElements);
    }

    // Restores the filtered SVG state after hovering.
    restoreState(): void {
        this.svgController.setAvailableElements(this.activeElements);
    }

    // Removes listeners and clears the venue map state.
    destroy(): void {
        this.abortController.abort();
        this.svgController.destroy();
        this.tooltipController.hide();

        this.activeElements = [];
        this.initialAvailableElements = [];
    }

    // Highlights SVG elements for ListingCard hover events: match the block first,
    // then fall back to its category, and restore the current filter state on leave.
    private subscribeListingCardInteractions(): void {
        const handleHovered = (event: Event) => {
            const { block, categoryId, categoryName } = (
                event as CustomEvent<ListingCardHoveredDetail>
            ).detail;

            let elementsHovered: SVGGElement[] = [];

            if (categoryId && block) {
                const parseBlocks = block
                    ?.split(',')
                    .map((block) => block.trim())
                    .filter(Boolean);

                elementsHovered = this.svgController
                    .getElementsByCategoriesOrBlocks([categoryId.toString()], parseBlocks)
                    .filter((element) => {
                        const { dataTypeMatch } =
                            this.svgController.getAvailableAttributes(element);
                        return dataTypeMatch !== 'MATCHED_BY_CATEGORY';
                    });

                if (!elementsHovered.length) {
                    // If type and subtpye is not belong to football event ==> Hightlight by query selector
                    // If do ==> hightlight by data-category-id and data-block-key
                    if (
                        this.type &&
                        this.subtype &&
                        EXCLUDE_TYPE.includes(this.type) &&
                        EXCLUDE_SUBTYPE.includes(this.subtype)
                    ) {
                        elementsHovered = this.svgController.getElementsByCategoryId(
                            categoryId.toString()
                        );
                    } else {
                        elementsHovered = categoryName
                            ? this.svgController.getElementsByCategoryVariant(categoryName)
                            : [];
                    }
                }

                this.svgController.setAvailableElements(elementsHovered);
                return;
            }

            if (categoryId) {
                // If type and subtpye is not belong to football event ==> Hightlight by query selector
                // If do ==> hightlight by data-category-id and data-block-key
                if (
                    this.type &&
                    this.subtype &&
                    EXCLUDE_TYPE.includes(this.type) &&
                    EXCLUDE_SUBTYPE.includes(this.subtype)
                ) {
                    elementsHovered = this.svgController.getElementsByCategoryId(
                        categoryId.toString()
                    );
                } else {
                    elementsHovered = categoryName
                        ? this.svgController.getElementsByCategoryVariant(categoryName)
                        : [];
                }
                this.svgController.setAvailableElements(elementsHovered);
                return;
            }

            this.svgController.setAvailableElements([]);
        };

        this.eventTarget.addEventListener(LISTING_CARD_HOVERED, handleHovered, {
            signal: this.abortController.signal,
        });

        this.eventTarget.addEventListener(LISTING_CARD_UNHOVERED, () => this.restoreState(), {
            signal: this.abortController.signal,
        });
    }

    // Get image preview from map urls
    private getImageFromMapUrls(categories?: string[], blocks?: string[]): string[] {
        const normalizedCategories = (categories ?? []).map(snakeCase);

        // Only removes '_' between a lowercase letter and followed by a number
        const normalizedBlocks = (blocks ?? []).map((block) =>
            snakeCase(block).replace(/([a-z])_(\d+)/i, '$1$2')
        );

        // Available matches
        // [
        //     // Priority 1
        //     'vip_block101',
        //     'vip_block102',
        //     'lower_tier_block101',
        //     'lower_tier_block102',

        //     // Priority 2
        //     'vip',
        //     'lower_tier',

        //     // Priority 3
        //     'block101',
        //     'block102',
        // ];
        const keys = [
            // Priority 1: category + block
            ...normalizedCategories.flatMap((category) =>
                normalizedBlocks.map((block) => `${category}_${block}`)
            ),

            // Priority 2: category
            ...normalizedCategories,

            // Priority 3: block
            ...normalizedBlocks,
        ].filter(Boolean);

        for (const key of keys) {
            const imgs = this.mapUrls?.[key];

            if (imgs?.length) return imgs;
        }

        return [];
    }
}
