'use client';

import EventSectionError from '@/components/EventSectionError';

import EventHeaderSkeleton from './_components/EventHeaderSkeleton';

export default function EventHeaderError({ error }: { error: Error }) {
    console.error('[EventHeaderError] An unexpected error occurred:', error);

    return (
        <EventSectionError shouldShowErrorMessage>
            <EventHeaderSkeleton />
        </EventSectionError>
    );
}
