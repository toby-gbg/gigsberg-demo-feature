'use client';

import EventFiltersSkeleton from '@/components/event-filters/EventFiltersSkeleton';
import EventDetailsCardSkeleton from '@/components/EventDetailsCardSkeleton';
import EventSectionError from '@/components/EventSectionError';
import { Skeleton } from '@/components/ui/Skeleton';

export default function Error() {
    return (
        <EventSectionError shouldShowErrorMessage>
            <div className="mb-14">
                <Skeleton className="mb-8 h-[1.5em] w-80 text-[24px] md:text-[28px] xl:text-heading" />
                <EventFiltersSkeleton />
                <div className="relative z-10 space-y-4 opacity-80">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <EventDetailsCardSkeleton key={index} />
                    ))}
                </div>
            </div>
        </EventSectionError>
    );
}
