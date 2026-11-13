'use client';

import EventFiltersSkeleton from '@/components/event-filters/EventFiltersSkeleton';
import EventDetailsLayoutSkeleton from '@/components/EventDetailsLayoutSkeleton';
import EventSectionError from '@/components/EventSectionError';

export default function EventListError({ error }: { error: Error }) {
    console.error('[EventListError] An unexpected error occurred:', error);

    return (
        <EventSectionError shouldShowErrorMessage>
            <EventFiltersSkeleton filterCount={3} />
            <EventDetailsLayoutSkeleton />
        </EventSectionError>
    );
}
