import { getCategoryVariants } from '@/utils/venue-map/variants';

export type ElementClickHandler = (element: SVGGElement) => void;

export type VenueElementHover = {
    element: SVGGElement;
    clientX: number;
    clientY: number;
};

export type ElementHoverHandler = (element: VenueElementHover | null) => void;
export type PointerMoveHandler = (clientX: number, clientY: number) => void;

export class VenueSvgController {
    private readonly abortController = new AbortController();

    constructor(private readonly svgElement: SVGSVGElement) {}

    // Get available elements by using variant configuration
    getElementsByCategoryVariant = (categoryName: string): SVGGElement[] => {
        if (!categoryName) return [];

        let elements: SVGGElement[] = [];

        const categoryVariants = getCategoryVariants(categoryName);

        for (const catVariant of categoryVariants) {
            // Find category variant
            const categoryFound = this.svgElement.getElementById(catVariant);

            // If category variant exists, get out of loop right away
            if (categoryFound && categoryFound instanceof SVGGElement) {
                elements = [categoryFound];
                break;
            }
        }

        return elements;
    };

    // Get available <g>
    getAvailableElements(): SVGGElement[] {
        return Array.from(this.svgElement.querySelectorAll<SVGGElement>('g.available'));
    }

    // Get elements by data-category-id
    // Note: category id might have many values
    getElementsByCategoryId(categoryId: string): SVGGElement[] {
        return Array.from(
            this.svgElement.querySelectorAll<SVGGElement>('g[data-category-id]')
        ).filter((element) =>
            this.getAttributeValues(element, 'data-category-id').includes(categoryId)
        );
    }

    // Get elements by data-block-key
    // Note: block key is a unique value
    getElementsByBlock(block: string): SVGGElement[] {
        return Array.from(
            this.svgElement.querySelectorAll<SVGGElement>('g[data-block-key]')
        ).filter((element) => element.getAttribute('data-block-key') === block);
    }

    // Get elements by data-category-id and data-block-key
    getElementsByCategoriesOrBlocks(categories: string[], keys?: string[]): SVGGElement[] {
        const categoryElements = Array.from(
            this.svgElement.querySelectorAll<SVGGElement>('g[data-category-id]')
        ).filter((element) => {
            const { categoryIds } = this.getAvailableAttributes(element);

            if (!categoryIds) return [];

            return categoryIds.some((categoryId) => categories.includes(categoryId));
        });

        if (!keys?.length) return categoryElements;

        return categoryElements.filter((element) => {
            const { blockKeys } = this.getAvailableAttributes(element);

            return keys.some((key) => blockKeys.includes(key));
        });
    }

    // Set class available into elements
    setAvailableElements(elements: SVGGElement[]): void {
        const availableElements = this.svgElement.querySelectorAll<SVGGElement>('.available');

        for (const element of availableElements) {
            element.classList.remove('available');
        }

        for (const element of elements) {
            element.classList.add('available');
        }
    }

    // Registers an SVG click handler for the normalized SVG group.
    onElementClick(handler: ElementClickHandler): void {
        const handleClick = (event: Event) => {
            const interactiveElement = this.findClosestElement(event.target);

            if (!interactiveElement) return;

            handler(interactiveElement);
        };

        this.svgElement.addEventListener('click', handleClick, {
            signal: this.abortController.signal,
        });
    }

    // Registers SVG hover handlers to handle the hovered element and cursor position
    // Ignoring movement within the same block
    onElementHover(handler: ElementHoverHandler): void {
        let hoveredElement: SVGGElement | null = null;

        const handleMouseOver = (event: MouseEvent) => {
            const interactiveElement = this.findClosestElement(event.target);

            if (!interactiveElement || interactiveElement === hoveredElement) return;

            hoveredElement = interactiveElement;
            handler({
                element: interactiveElement,
                clientX: event.clientX,
                clientY: event.clientY,
            });
        };

        const handleMouseOut = (event: MouseEvent) => {
            if (!hoveredElement) return;

            const relatedTarget = event.relatedTarget;

            // Ignores mouse movement between elements inside the same block.
            if (relatedTarget instanceof Node && hoveredElement.contains(relatedTarget)) return;

            hoveredElement = null;
            handler(null);
        };

        this.svgElement.addEventListener('mouseover', handleMouseOver, {
            signal: this.abortController.signal,
        });

        this.svgElement.addEventListener('mouseout', handleMouseOut, {
            signal: this.abortController.signal,
        });
    }

    // Registers an SVG mouse-move handler to track cursor position.
    onPointerMove(handler: PointerMoveHandler): void {
        const handleMouseMove = (event: MouseEvent) => {
            handler(event.clientX, event.clientY);
        };

        this.svgElement.addEventListener('mousemove', handleMouseMove, {
            signal: this.abortController.signal,
        });
    }

    // Removes every listener registered by this controller and clears all SVG state classes
    destroy(): void {
        this.abortController.abort();
    }

    getAvailableAttributes(element: SVGGElement) {
        const blockKey = element.getAttribute('data-block-key') ?? null;
        const categoryId = element.getAttribute('data-category-id') ?? null;
        const categoryName = element.getAttribute('data-category-name') ?? null;
        const price = element.getAttribute('data-price') ?? null;
        const minPrice = element.getAttribute('data-min-price') ?? null;
        const dataTypeMatch = element.getAttribute('data-type-match') ?? null;

        return {
            blockKeys: blockKey
                ? blockKey
                      .split(',')
                      .map((block) => block.trim())
                      .filter(Boolean)
                : [],
            categoryIds: categoryId
                ? categoryId
                      .split(',')
                      .map((categoryId) => categoryId.trim())
                      .filter(Boolean)
                : [],
            categoryNames: categoryName
                ? categoryName
                      .split(',')
                      .map((block) => block.trim())
                      .filter(Boolean)
                : [],
            price: Number(price) ?? 0,
            minPrice: Number(minPrice) ?? 0,
            dataTypeMatch,
        };
    }

    // Find the closest <g> element with data-category-id
    private findClosestElement(target: EventTarget | null): SVGGElement | null {
        if (!(target instanceof Element)) return null;

        return target.closest<SVGGElement>('g[data-category-id]');
    }

    private getAttributeValues(element: SVGGElement, attribute: string): string[] {
        return (element.getAttribute(attribute) ?? '')
            .split(',')
            .map((value) => value.trim())
            .filter(Boolean);
    }
}
