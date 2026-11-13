'use client';

import {
    createContext,
    MouseEventHandler,
    PointerEventHandler,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';
import { ClassValue } from 'clsx';
import { EmblaCarouselType } from 'embla-carousel';
import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';
import { useLocale, useTranslations } from 'next-intl';

import { ArrowRightIcon as ArrowIcon } from '@/assets/svg';
import {
    getCarouselActiveIndicatorIndex,
    getCarouselIndicatorIndexes,
    getCarouselPageTarget,
} from '@/lib/carousel';
import { cn } from '@/lib/cn';
import { isRTL as checkIsRTL, fallbackTranslation, isRTL } from '@/utils/common';

interface CarouselState {
    canScrollPrev: boolean;
    canScrollNext: boolean;
    selectedIndex: number;
    snapCount: number;
    emblaApi?: EmblaCarouselType;
    initSnapCount?: number;
}
const DRAG_THRESHOLD = 10;

const CarouselContext = createContext<CarouselState | null>(null);

export const useCarouselState = () => {
    const context = useContext(CarouselContext);
    if (!context) throw new Error('useCarouselState must be used within CarouselSection');
    return context;
};

interface CarouselArrowButtonProps {
    direction: 'prev' | 'next';
    onClick: () => void;
}

export const CarouselIndicator = () => {
    const { selectedIndex, snapCount, emblaApi, initSnapCount } = useCarouselState();

    if (snapCount <= 1) {
        return (
            <div className="flex justify-center items-center gap-2 h-full">
                {[...Array(initSnapCount).keys()].map((index) => {
                    const active = index === 0;

                    return (
                        <button
                            key={'init' + index}
                            type="button"
                            aria-label={`Go to slide ${index + 1}`}
                            className={cn(
                                'bg-[#D1D5DB]/80 rounded-full transition-all duration-200 pointer-events-none select-none shrink-0',
                                active ? 'h-2 w-6 bg-[#9CA3AF]' : 'size-2'
                            )}
                        />
                    );
                })}
            </div>
        );
    }

    const activeIndicatorIndex = getCarouselActiveIndicatorIndex(snapCount, selectedIndex);
    return (
        <div className="flex justify-center items-center gap-2">
            {getCarouselIndicatorIndexes(snapCount).map((index, indicatorIndex) => {
                const active = indicatorIndex === activeIndicatorIndex;

                return (
                    <button
                        key={index}
                        type="button"
                        aria-label={`Go to slide ${index + 1}`}
                        onClick={() => emblaApi?.scrollTo(index)}
                        className={cn(
                            'rounded-full transition-all duration-200 shrink-0',
                            active
                                ? 'h-2 w-6 bg-[rgb(var(--bg-solid))]'
                                : 'size-2 bg-[#D1D5DB] hover:bg-[#9CA3AF]'
                        )}
                    />
                );
            })}
        </div>
    );
};

export const CarouselArrowButton = ({ direction, onClick }: CarouselArrowButtonProps) => {
    const t = useTranslations();
    const locale = useLocale();
    const isRTL = checkIsRTL(locale);
    const isPrev = direction === 'prev';
    const labelKey = isPrev ? 'popular_tournaments_previous' : 'popular_tournaments_next';
    const fallbackLabel = isPrev ? 'Previous tournaments' : 'Next tournaments';
    const { canScrollPrev, canScrollNext } = useCarouselState();
    const canScroll = isPrev ? canScrollPrev : canScrollNext;
    const shouldPlaceLeft = isRTL ? !isPrev : isPrev;
    const shouldRotateIcon = isRTL ? !isPrev : isPrev;

    return (
        <button
            type="button"
            aria-label={fallbackTranslation(t(labelKey), labelKey, fallbackLabel)}
            className={cn(
                'hidden top-1/2 z-10 absolute place-items-center md:grid bg-white border border-surface rounded-full size-11 -translate-y-2/3 cursor-pointer shadow-select-hover',
                shouldPlaceLeft ? '-left-5.5' : '-right-5.5',
                !canScroll && 'invisible pointer-events-none'
            )}
            onClick={onClick}
        >
            <ArrowIcon className={cn(shouldRotateIcon && 'rotate-180', '**:fill-solid')} />
        </button>
    );
};

export const CarouselSection = ({
    children,
    classNames,
    isAutoPlay = false,
    onArrowClick,
    initSnapCount = 0,
}: {
    children: React.ReactNode;
    classNames?: { actions?: ClassValue; layout?: ClassValue };
    isAutoPlay?: boolean;
    onArrowClick?: (arrow: 'prev' | 'next') => void;
    initSnapCount?: number;
}) => {
    const locale = useLocale();
    const plugins = [...(isAutoPlay ? [Autoplay({ delay: 5000, stopOnInteraction: false })] : [])];

    // Disable drag on desktop so card hover (e.g. shadow) works — same pattern as Fans also like.
    // Embla pointer capture otherwise steals hover when the cursor moves slightly.
    const [emblaRef, emblaApi] = useEmblaCarousel(
        {
            align: 'start',
            containScroll: 'trimSnaps',
            dragFree: false,
            skipSnaps: true,
            direction: isRTL(locale) ? 'rtl' : 'ltr',
        },
        plugins
    );
    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [snapCount, setSnapCount] = useState(0);

    const scrollPage = useCallback(
        (direction: 'prev' | 'next') => {
            if (!emblaApi) return;

            const slideWidth = emblaApi.slideNodes()[0]?.clientWidth;
            if (!slideWidth) return;

            emblaApi.scrollTo(
                getCarouselPageTarget(
                    emblaApi.selectedScrollSnap(),
                    emblaApi.rootNode().clientWidth,
                    slideWidth,
                    direction
                )
            );
        },
        [emblaApi]
    );

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setCanScrollPrev(emblaApi.canScrollPrev());
        setCanScrollNext(emblaApi.canScrollNext());
        setSelectedIndex(emblaApi.selectedScrollSnap());
        setSnapCount(emblaApi.scrollSnapList().length);
    }, [emblaApi]);

    const handlePointerDownCapture: PointerEventHandler<HTMLDivElement> = (event) => {
        event.currentTarget.dataset.pointerDownX = String(event.clientX);
    };

    const handleClickCapture: MouseEventHandler<HTMLDivElement> = (event) => {
        // Skip click event by keyboard
        if (event.detail === 0) return;

        // Get the position of the pointer down event
        const startX = Number(event.currentTarget.dataset.pointerDownX);
        // Clear the pointer down event position for the next click
        delete event.currentTarget.dataset.pointerDownX;

        if (Number.isNaN(startX)) return;

        const draggedDistance = Math.abs(event.clientX - startX);

        if (draggedDistance <= DRAG_THRESHOLD) return;

        event.preventDefault();
        event.stopPropagation();
    };
    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on('select', onSelect);
        emblaApi.on('reInit', onSelect);
        return () => {
            emblaApi.off('select', onSelect);
            emblaApi.off('reInit', onSelect);
        };
    }, [emblaApi, onSelect]);

    return (
        <CarouselContext.Provider
            value={{
                canScrollPrev,
                canScrollNext,
                selectedIndex,
                snapCount,
                emblaApi,
                initSnapCount,
            }}
        >
            <div className="relative">
                <div
                    className={cn('overflow-hidden', classNames?.layout)}
                    ref={emblaRef}
                    onPointerDownCapture={handlePointerDownCapture}
                    onClickCapture={handleClickCapture}
                >
                    <div className="flex items-stretch w-full">{children}</div>
                </div>
                <div className={cn(classNames?.actions)}>
                    <CarouselArrowButton
                        direction="prev"
                        onClick={() => {
                            scrollPage('prev');
                            onArrowClick?.('prev');
                        }}
                    />
                    <CarouselArrowButton
                        direction="next"
                        onClick={() => {
                            scrollPage('next');
                            onArrowClick?.('next');
                        }}
                    />
                </div>

                <div className="flex justify-center items-center mt-2 h-2 shrink-0">
                    <CarouselIndicator />
                </div>
            </div>
        </CarouselContext.Provider>
    );
};
