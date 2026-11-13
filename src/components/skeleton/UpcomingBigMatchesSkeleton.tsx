'use client';

import { cn } from '@/lib/cn';

import { Skeleton } from '@/components/ui/Skeleton';

const SKELETON_CARDS = 5;
const SKELETON_INDICATORS = 4;

const UpcomingBigMatchesPerformerSkeleton = ({ align }: { align: 'left' | 'right' }) => {
    const containerClassName =
        align === 'left'
            ? 'flex flex-col justify-center items-start gap-1 pl-4 text-left'
            : 'flex flex-col justify-center items-end gap-1 pr-4 text-right';

    return (
        <div className={containerClassName}>
            <Skeleton className="h-9 w-13 rounded" />
            <Skeleton className="h-3 w-20 rounded" />
        </div>
    );
};

export const UpcomingBigMatchesCardSkeleton = () => {
    return (
        <div className="mb-0 flex min-h-51 w-full flex-1 flex-col rounded-lg pr-3 md:p-2 pt-8!">
            <div className="relative h-20 w-full shrink-0 overflow-hidden rounded-lg">
                <Skeleton className="absolute inset-0 rounded-lg" />
                <div className="absolute inset-0 z-10 grid grid-cols-2" dir="ltr">
                    <UpcomingBigMatchesPerformerSkeleton align="left" />
                    <UpcomingBigMatchesPerformerSkeleton align="right" />
                    <Skeleton className="absolute top-1/2 left-1/2 size-8 -translate-x-1/2 -translate-y-1/2 rounded-full" />
                </div>
            </div>

            <div className="py-2">
                <div className="space-y-1">
                    <Skeleton className="h-5 w-full rounded" />
                    <Skeleton className="h-5 w-4/5 rounded" />
                </div>
            </div>

            <div className="mt-auto flex h-7 items-end justify-end gap-2">
                <Skeleton className="h-5 w-8 shrink-0 rounded" />
                <Skeleton className="h-5 w-16 rounded md:w-20" />
            </div>
        </div>
    );
};

const UpcomingBigMatchesSkeleton = () => {
    return (
        <section className="w-full mb-10" aria-hidden="true">
            <div className="flex flex-col justify-start gap-4 mb-2">
                <Skeleton className="h-lh w-64 max-w-full rounded text-title-s md:text-heading-s xl:text-heading" />
                <div className="flex justify-start gap-2 flex-wrap">
                    {Array.from({ length: 4 }).map((_, index) => {
                        return <Skeleton key={index} className="h-10 rounded-full w-20 md:w-30" />;
                    })}
                </div>
            </div>

            <div className="relative overflow-hidden">
                <div className="flex w-full items-stretch">
                    {Array.from({ length: SKELETON_CARDS }).map((_, index) => (
                        <div
                            key={index}
                            className="flex w-55 shrink-0 flex-col *:flex *:flex-1 lg:w-70"
                        >
                            <UpcomingBigMatchesCardSkeleton />
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2">
                {Array.from({ length: SKELETON_INDICATORS }).map((_, index) => (
                    <div
                        key={index}
                        className={cn(
                            'rounded-full bg-[#D1D5DB]',
                            index === 0 ? 'h-2 w-6' : 'size-2'
                        )}
                    />
                ))}
            </div>
        </section>
    );
};

export default UpcomingBigMatchesSkeleton;
