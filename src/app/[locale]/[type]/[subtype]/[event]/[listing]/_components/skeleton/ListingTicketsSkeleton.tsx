'use client';

import { cn } from '@/lib/cn';

import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

const cards = Array.from({ length: 4 }, (_, i) => i + 1);

interface Props {
    isLoaded?: boolean;
}

interface SkeletonBoxProps {
    className: string;
    isLoaded?: boolean;
}

const SKELETONS_CLASSES = [
    'rounded w-24 max-w-full h-3',
    'rounded w-32 max-w-full h-3',
    'rounded w-48 max-w-full h-3',
    'rounded w-20 max-w-full h-3',
] as const;

const SkeletonBox = ({ className, isLoaded }: SkeletonBoxProps) =>
    isLoaded ? (
        <div className={`bg-default-200 ${className}`} />
    ) : (
        <Skeleton className={className} />
    );

export const LoadingCard = ({ index, isLoaded }: { index: number; isLoaded?: boolean }) => {
    return (
        <Card
            className={cn(
                'w-full min-w-0 border border-neutral-400 shadow-none ltr:lg:rounded-r-xl rtl:lg:rounded-l-xl',
                {
                    'hidden lg:block': index > 2,
                }
            )}
        >
            <div className="flex items-center justify-between p-4">
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <SkeletonBox className="h-4 w-72 max-w-full rounded" isLoaded={isLoaded} />

                    <div className="flex items-center gap-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <SkeletonBox
                                key={i}
                                className="size-5 rounded-full"
                                isLoaded={isLoaded}
                            />
                        ))}
                    </div>

                    {SKELETONS_CLASSES.map((classes) => (
                        <SkeletonBox key={classes} className={classes} isLoaded={isLoaded} />
                    ))}
                </div>

                <div className="flex w-30 shrink-0 flex-col items-end gap-2">
                    <SkeletonBox className="h-7 w-full rounded" isLoaded={isLoaded} />
                    <SkeletonBox className="h-10 w-25 rounded xl:w-28.75" isLoaded={isLoaded} />
                </div>
            </div>
        </Card>
    );
};

const ListingTicketsSkeleton = ({ isLoaded }: Props) => {
    return (
        <div className="flex size-full flex-col gap-2">
            {/* <Card className="hidden h-24 flex-col gap-2 ltr:lg:rounded-r-xl rtl:lg:rounded-l-xl border p-2 shadow-none lg:flex lg:items-center lg:justify-center"> */}
            {/*     <Skeleton className="h-8 w-72 rounded" /> */}
            {/*     <Skeleton className="h-7 w-[75%] rounded" /> */}
            {/* </Card> */}

            {cards.map((key, index) => (
                <LoadingCard key={key} index={index} isLoaded={isLoaded} />
            ))}
        </div>
    );
};

export default ListingTicketsSkeleton;
