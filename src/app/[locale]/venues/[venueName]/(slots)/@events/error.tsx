'use client';

import SectionError from '@/components/SectionError';

import VenueEventsSkeleton from './_components/VenueEventsSkeleton';

export default function VenueEventsError({ error }: { error: Error }) {
    console.error('[VenueEventsError] An unexpected error occurred:', error);

    return (
        <SectionError>
            <VenueEventsSkeleton />
        </SectionError>
    );
}
