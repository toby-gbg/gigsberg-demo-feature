const MAX_INDICATORS = 10;

export const getCarouselIndicatorIndexes = (snapCount: number) => {
    const count = Math.min(snapCount, MAX_INDICATORS);

    if (count <= 1) return Array.from({ length: count }, () => 0);

    return Array.from({ length: count }, (_, index) =>
        Math.round((index * (snapCount - 1)) / (count - 1))
    );
};

export const getCarouselActiveIndicatorIndex = (snapCount: number, selectedIndex: number) =>
    snapCount <= 1
        ? 0
        : Math.round((selectedIndex * (Math.min(snapCount, MAX_INDICATORS) - 1)) / (snapCount - 1));

export const getCarouselPageTarget = (
    selectedIndex: number,
    viewportWidth: number,
    slideWidth: number,
    direction: 'prev' | 'next'
) => {
    const pageSize = Math.max(1, Math.round(viewportWidth / slideWidth));

    return direction === 'next' ? selectedIndex + pageSize : Math.max(0, selectedIndex - pageSize);
};
