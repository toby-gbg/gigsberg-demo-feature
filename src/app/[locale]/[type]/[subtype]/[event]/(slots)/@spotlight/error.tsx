'use client';

import EventSectionError from '@/components/EventSectionError';

import ArtistSpotlightCardSkeleton from './_components/ArtistSpotlightCardSkeleton';

export default function EventSpotlightError({ error }: { error: Error }) {
    console.error('[EventSpotlightError] An unexpected error occurred:', error);

    return (
        <EventSectionError>
            <ArtistSpotlightCardSkeleton />
        </EventSectionError>
    );
}
