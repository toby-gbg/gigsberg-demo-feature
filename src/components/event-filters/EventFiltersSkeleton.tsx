import { ClassValue } from 'clsx';

import { cn } from '@/lib/cn';

import { Skeleton } from '../ui/Skeleton';

const EventFiltersSkeleton = ({
    className,
    filterCount = 4,
}: {
    className?: ClassValue;
    filterCount?: number;
}) => (
    <div className="space-y-2 mb-4">
        <Skeleton className="rounded w-60 h-7" />
        <div
            className={cn(
                'grid w-full grid-cols-1 items-start gap-2 pb-1',
                filterCount > 3 ? 'md:grid-cols-2 2xl:grid-cols-4' : 'lg:grid-cols-3'
            )}
        >
            {Array.from({ length: filterCount }).map((_, index) => (
                <Skeleton key={index} className={cn('h-10 w-full rounded-lg', className)} />
            ))}
        </div>
    </div>
);

export default EventFiltersSkeleton;
