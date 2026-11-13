'use client';

import EventSectionError from '@/components/EventSectionError';
import UpcomingBigMatchesSkeleton from '@/components/skeleton/UpcomingBigMatchesSkeleton';

export default function Error() {
    return (
        <EventSectionError shouldShowErrorMessage>
            <div className="opacity-100">
                <UpcomingBigMatchesSkeleton />
            </div>
        </EventSectionError>
    );
}
