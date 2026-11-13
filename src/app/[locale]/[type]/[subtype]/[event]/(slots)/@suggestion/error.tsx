'use client';

import EventCardSkeleton from '@/components/event-card/EventCardSkeleton';
import EventSectionError from '@/components/EventSectionError';
import { Skeleton } from '@/components/ui/Skeleton';

export default function EventSuggestionError({ error }: { error: Error }) {
    console.error('[EventSuggestionError] An unexpected error occurred:', error);

    return (
        <EventSectionError className="col-span-full mt-8">
            <Skeleton className="h-[1.5em] w-80 text-[24px] md:text-[28px] xl:text-heading" />
            <EventCardSkeleton showSubtitle className="mt-8" />
        </EventSectionError>
    );
}
