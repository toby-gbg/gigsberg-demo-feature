'use client';

import { Skeleton } from '@/components/ui/Skeleton';

import EventDetailsSkeleton from './EventDetailsSkeleton';

const EventDetailsLayoutSkeleton = () => {
    return (
        <div className="flex flex-col gap-y-4">
            <Skeleton className="w-full h-7 rounded-lg max-w-60" />
            <EventDetailsSkeleton shouldShowMinPrice />
        </div>
    );
};

export default EventDetailsLayoutSkeleton;
