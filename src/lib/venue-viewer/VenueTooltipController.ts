import { updateTooltipPosition, updateVenueTooltip } from '@/utils/venueTooltip';

import type { VenueTooltipInteraction, VenueTooltipOptions } from './types';

// Manages the venue tooltip content, position, and visibility.
export class VenueTooltipController {
    constructor(private readonly options: VenueTooltipOptions) {}

    show({
        blockKey,
        categoryName,
        minPrice,
        price,
        clientX,
        clientY,
        imageMapUrl,
    }: VenueTooltipInteraction): void {
        const { element, getCurrencyCode, getLocale } = this.options;

        updateTooltipPosition(element, clientX, clientY);

        updateVenueTooltip(element, {
            blockName: blockKey ?? '',
            categoryName,
            currencyCode: getCurrencyCode(),
            locale: getLocale(),
            minPrice,
            price: price ?? 0,
            variant: price && price > 0 ? 'block-price' : 'category',
            imageMapUrl,
        });

        element.classList.remove('hidden');
    }

    move(clientX: number, clientY: number): void {
        if (this.options.element.classList.contains('hidden')) return;

        updateTooltipPosition(this.options.element, clientX, clientY);
    }

    hide(): void {
        this.options.element.classList.add('hidden');
    }
}
