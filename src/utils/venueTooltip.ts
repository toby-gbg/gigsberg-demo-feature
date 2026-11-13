import { type ListingSearchFilters } from '@/interfaces/Listing';
import { formatPrice } from '@/utils/currency.util';
import {
    getTooltipPosition,
    setElementDisplay,
    setElementText,
} from '@/utils/digital-venue-interaction';

export type VenueTooltipVariant = 'block-price' | 'category' | 'full';

export const VENUE_TOOLTIP_PREVIEW_EVENT = 'venue-map-tooltip-preview';

interface VenueTooltipPayload {
    blockName: string;
    categoryName: string;
    currencyCode: ListingSearchFilters['currency_code'];
    locale: string;
    minPrice: number;
    price: number;
    variant: VenueTooltipVariant;
    imageMapUrl: string[];
}

export const updateTooltipPosition = (
    tooltipElement: HTMLElement,
    clientX: number,
    clientY: number
) => {
    const position = getTooltipPosition({ left: clientX, top: clientY });

    tooltipElement.style.left = `${position.left}px`;
    tooltipElement.style.top = `${position.top}px`;
    tooltipElement.style.transform = position.transform;
};

export const updateVenueTooltip = (
    tooltipElement: HTMLElement,
    {
        blockName,
        categoryName,
        currencyCode,
        locale,
        minPrice,
        price,
        variant,
        imageMapUrl,
    }: VenueTooltipPayload
) => {
    const showBlockPrice = variant !== 'category';
    const showCategory = variant !== 'block-price';

    window.dispatchEvent(
        new CustomEvent<{
            imageMapUrl: string | null;
        }>(VENUE_TOOLTIP_PREVIEW_EVENT, {
            detail: { imageMapUrl: imageMapUrl[0] ?? null },
        })
    );

    setElementText(tooltipElement, '[data-venue-tooltip-block]', blockName);
    setElementText(
        tooltipElement,
        '[data-venue-tooltip-price]',
        formatPrice(price, locale, currencyCode)
    );
    setElementText(tooltipElement, '[data-venue-tooltip-category]', categoryName);
    setElementText(
        tooltipElement,
        '[data-venue-tooltip-min-price]',
        formatPrice(minPrice, locale, currencyCode)
    );

    setElementDisplay(
        tooltipElement,
        '[data-venue-tooltip-block-price-section]',
        showBlockPrice ? '' : 'none'
    );
    setElementDisplay(
        tooltipElement,
        '[data-venue-tooltip-divider]',
        variant === 'full' ? '' : 'none'
    );
    setElementDisplay(
        tooltipElement,
        '[data-venue-tooltip-category-block]',
        showCategory ? '' : 'none'
    );
    setElementDisplay(
        tooltipElement,
        '[data-venue-tooltip-min-price-block]',
        showCategory ? '' : 'none'
    );
};
