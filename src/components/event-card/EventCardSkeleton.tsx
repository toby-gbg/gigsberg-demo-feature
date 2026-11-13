'use client';

import { FC, ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';

import { CarouselItem } from '@/components/carousel/CarouselItem';
import type { EventCardSize } from '@/components/event-card/EventCard';

import { CarouselSection } from '../carousel/CarouselSection';
import { Skeleton } from '../ui/Skeleton';

type BoneProps = {
    isLoaded?: boolean;
    className?: string;
};

/** Solid block when empty-state (`isLoaded`), animated skeleton while loading. */
const Bone: FC<BoneProps> = ({ isLoaded, className }) =>
    isLoaded ? (
        <div className={cn('bg-default-200 rounded-lg', className)} />
    ) : (
        <Skeleton className={cn('rounded-lg', className)} />
    );

export interface EventCardSkeletonItemProps {
    size?: EventCardSize;
    isLoaded?: boolean;
    /** Outer slide width / flex classes (parent owns layout). */
    className?: string;
    /** Extra classes on the card shell (mirrors EventCard `classNames.wrapper`). */
    cardClassName?: string;
    showSubtitle?: boolean;
    showDate?: boolean;
    showDescription?: boolean;
    /** Placeholder pills for TypeLabel / DateProximityLabel. */
    showBadges?: boolean;
}

/**
 * Single skeleton card shaped like {@link EventCard}.
 * Parent owns carousel width / Link spacing — same split as the real card.
 */
export const EventCardSkeletonItem: FC<EventCardSkeletonItemProps> = ({
    size = 'sm',
    isLoaded,
    className,
    cardClassName,
    showSubtitle = false,
    showDate = true,
    showDescription = true,
    showBadges = true,
}) => {
    return (
        <CarouselItem className={cn(className, cardClassName)}>
            <div
                className={cn('flex flex-col flex-1 lg:p-2 pr-3 rounded-lg w-full', cardClassName)}
            >
                <div
                    className={cn('relative w-full shrink-0', {
                        'aspect-video': size === 'xl',
                        'aspect-4/3': size === 'sm',
                    })}
                >
                    {isLoaded ? (
                        <div className="absolute inset-0 bg-default-300 rounded-t-lg" />
                    ) : (
                        <Skeleton className="absolute inset-0 rounded-t-lg" />
                    )}

                    {showBadges && (
                        <>
                            <div className="top-0 left-0 z-10 absolute m-2">
                                <Bone isLoaded={isLoaded} className="rounded-full w-16 h-5" />
                            </div>
                            <div className="top-0 right-0 z-10 absolute m-2">
                                <Bone isLoaded={isLoaded} className="rounded-full w-14 h-5" />
                            </div>
                        </>
                    )}
                </div>

                <div className="flex flex-col space-y-1 mt-2">
                    {/* title */}
                    <Bone isLoaded={isLoaded} className="w-5/6 h-5 md:h-6" />
                    {/* subtitle (e.g. upcoming matches) */}
                    {showSubtitle && <Bone isLoaded={isLoaded} className="w-1/2 h-5" />}
                    {/* date */}
                    {showDate && <Bone isLoaded={isLoaded} className="w-3/4 h-5" />}
                    {/* description / venue */}
                    {showDescription && (
                        <div className="mt-auto pt-1">
                            <Bone isLoaded={isLoaded} className="w-full h-4" />
                        </div>
                    )}
                </div>
            </div>
        </CarouselItem>
    );
};

export interface EventCardSkeletonProps {
    isLoaded?: boolean;
    className?: string;
    islocation?: boolean;
    isContent?: boolean;
    /** Number of placeholder cards in the row. Default 5 (home carousel). */
    messageError?: ReactNode;
    count?: number;
    size?: EventCardSize;
    showSubtitle?: boolean;
    showDate?: boolean;
    showDescription?: boolean;
    showBadges?: boolean;
    /** Width class applied to each slide. */
    cardWidthClass?: string;
    cardClassName?: string;
    initSnapCount?: number;
    showPagination?: boolean;
}

/**
 * Horizontal row of {@link EventCardSkeletonItem}s — used as Suspense / loading
 * fallback for Event, City, and Performer carousels.
 */
const EventCardSkeleton: FC<EventCardSkeletonProps> = ({
    isLoaded,
    className,
    islocation = true,
    isContent = true,
    count = 5,
    size = 'sm',
    showSubtitle = false,
    showDate = false,
    showDescription = false,
    showBadges = false,
    cardWidthClass,
    cardClassName,
    initSnapCount,
    messageError,
}) => {
    const t = useTranslations();
    const keys = Array.from({ length: count }, (_, i) => i + 1);
    return (
        <CarouselSection
            classNames={{ layout: cn(className, cardClassName) }}
            initSnapCount={initSnapCount}
        >
            {keys.map((key) => (
                <EventCardSkeletonItem
                    key={key}
                    size={size}
                    isLoaded={isLoaded}
                    className={cardWidthClass}
                    cardClassName={cardClassName}
                    showSubtitle={showSubtitle}
                    showDate={showDate}
                    showDescription={showDescription}
                    showBadges={showBadges}
                />
            ))}

            {isLoaded && (messageError || isContent) && (
                <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                    {messageError ? (
                        <p className="text-gray-500 text-sm">{messageError}</p>
                    ) : (
                        isContent && (
                            <div className="text-center">
                                <h2 className="font-semibold text-lg">{t('no_found_anything')}</h2>
                                {islocation && (
                                    <p className="text-gray-500 text-sm">
                                        {t('try_date_location')}
                                    </p>
                                )}
                            </div>
                        )
                    )}
                </div>
            )}
        </CarouselSection>
    );
};

export default EventCardSkeleton;
