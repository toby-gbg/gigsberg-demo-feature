import { useCallback, useEffect, useState } from 'react';
import { EmblaCarouselType } from 'embla-carousel';

// Official Embla pattern: https://www.embla-carousel.com/docs/guides/previous-and-next-buttons
export const usePrevNextButtons = (emblaApi?: EmblaCarouselType, slideCount?: number) => {
    const [prevDisabled, setPrevDisabled] = useState(true);
    const [nextDisabled, setNextDisabled] = useState(true);

    const onPrevClick = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
    const onNextClick = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

    const updateButtons = useCallback((api: EmblaCarouselType) => {
        setPrevDisabled(!api.canScrollPrev());
        setNextDisabled(!api.canScrollNext());
    }, []);

    useEffect(() => {
        if (!emblaApi) return;

        if (slideCount !== undefined) {
            emblaApi.reInit();
        }

        updateButtons(emblaApi);
        emblaApi.on('reInit', updateButtons);
        emblaApi.on('select', updateButtons);

        return () => {
            emblaApi.off('reInit', updateButtons);
            emblaApi.off('select', updateButtons);
        };
    }, [emblaApi, updateButtons, slideCount]);

    return { prevDisabled, nextDisabled, onPrevClick, onNextClick };
};
