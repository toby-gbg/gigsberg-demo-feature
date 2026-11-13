/** Contains only the listing filters that affect the visual state of the venue map. */
export type VenueViewerFilters = {
    categories?: string[];
    blocks?: string[];
};

/** Describes tooltip data read from a normalized SVG group. */
export type VenueTooltipInteraction = {
    blockKey: string | null;
    categoryName: string;
    minPrice: number;
    price: number | null;
    clientX: number;
    clientY: number;
    imageMapUrl: string[];
};

export const LISTING_CARD_HOVERED = 'listing-card:hovered';
export const LISTING_CARD_UNHOVERED = 'listing-card:unhovered';

/** Defines the ListingCard data shared through the venue-map hover event. */
export type ListingCardHoveredDetail = {
    block?: string | null;
    categoryName?: string | null;
    categoryId?: string | number | null;
};

export type VenueTooltipOptions = {
    element: HTMLElement;
    getCurrencyCode: () => string;
    getLocale: () => string;
};

export type VenueViewerOptions = {
    eventTarget: EventTarget;
    tooltip: VenueTooltipOptions;
    type?: string;
    subtype?: string;
};
