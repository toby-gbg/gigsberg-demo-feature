'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';
import { fallbackTranslation } from '@/utils/common';

import { Skeleton } from '@/components/ui/Skeleton';

export const ListEventDetailsCardSkeleton = ({
    containerClassName,
    cardCount = 4,
    shouldShowMinPrice = false,
}: {
    containerClassName?: string;
    cardCount?: number;
    shouldShowMinPrice?: boolean;
}) => {
    return (
        <div className={cn('grid grid-cols-1 gap-4', containerClassName)}>
            {Array.from({ length: cardCount }, (_, i) => i + 1).map((key) => (
                <EventDetailsCardSkeleton key={key} shouldShowMinPrice={shouldShowMinPrice} />
            ))}
        </div>
    );
};

const EventDetailsCardSkeleton = ({
    shouldShowMinPrice = false,
    ctaLabel,
}: {
    shouldShowMinPrice?: boolean;
    ctaLabel?: string;
}) => {
    const t = useTranslations();
    const label = ctaLabel ?? fallbackTranslation(t('tickets'), 'tickets', 'Tickets');

    return (
        <div className="pointer-events-none relative">
            <div className="relative block w-full overflow-hidden rounded-3xl border border-[#E0E0E0] bg-white">
                <article className={'flex items-center gap-3 px-2 py-4 md:px-6'}>
                    <div className="flex min-w-0 flex-1 w-full items-center justify-between gap-2 md:gap-10">
                        <section className="flex min-w-15.5 flex-col items-center gap-0.5 text-center">
                            {/* Event year */}
                            <Skeleton className="h-4 w-7.5 rounded" />

                            {/* Event month and day */}
                            <Skeleton className="h-5 w-13.75 rounded md:h-6" />

                            {/* Event day of the week */}
                            <Skeleton className="h-4 w-7.5 rounded" />

                            {/* Event hour */}
                            <Skeleton className="h-4 w-11 rounded" />
                        </section>

                        <section className="flex min-w-0 grow flex-col gap-1 text-gray-600 ltr:text-left rtl:text-right">
                            {/* Event name */}
                            <Skeleton className="h-5 w-full max-w-90.25 rounded md:h-7" />

                            {/* Event location */}
                            <Skeleton className="h-4 w-full max-w-68 rounded md:h-5" />

                            <div className="mt-1" />
                        </section>
                    </div>
                    <section className="flex max-w-40 shrink-0 flex-col items-end justify-center gap-1 text-center md:justify-end">
                        <div className="flex w-full flex-col items-end gap-1">
                            {/* CTA button section */}
                            <Skeleton
                                aria-hidden="true"
                                className="inline-flex shrink-0 items-center justify-center px-2 md:px-3 py-2 border border-transparent rounded-lg w-25 min-w-22.75 max-w-full md:w-30 h-auto min-h-10 whitespace-normal text-sm md:text-lg max-md:min-h-0"
                            >
                                <span className="invisible font-bold text-xs md:text-sm">
                                    {label}
                                </span>
                            </Skeleton>

                            {/* "From $X" price text */}
                            {shouldShowMinPrice && (
                                <Skeleton className="mx-auto h-4 w-14.75 rounded" />
                            )}
                        </div>

                        <div className="w-full text-center" />
                    </section>
                </article>
            </div>
        </div>
    );
};

export default EventDetailsCardSkeleton;
