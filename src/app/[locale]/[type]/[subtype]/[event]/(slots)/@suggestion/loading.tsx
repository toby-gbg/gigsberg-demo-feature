'use client';

import EventCardSkeleton from '@/components/event-card/EventCardSkeleton';
import { Skeleton } from '@/components/ui/Skeleton';

export default function EventSuggestionLoading() {
    return (
        <div className="col-span-full mt-8">
            <Skeleton className="h-[1.5em] w-80 text-[24px] md:text-[28px] xl:text-heading" />
            <EventCardSkeleton showSubtitle className="mt-8" />
        </div>
    );
}
