'use client';

import EventFiltersSkeleton from '@/components/event-filters/EventFiltersSkeleton';
import EventDetailsLayoutSkeleton from '@/components/EventDetailsLayoutSkeleton';

export default function EventListLoading() {
    return (
        <>
            <div className="hidden md:block">
                <EventFiltersSkeleton filterCount={3} />
            </div>
            <EventDetailsLayoutSkeleton />
        </>
    );
}
