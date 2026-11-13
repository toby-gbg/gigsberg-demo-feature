'use client';

import SectionError from '@/components/SectionError';

import VenueHeaderLoading from './loading';

export default function VenueHeaderError({ error }: { error: Error }) {
    console.error('[VenueHeaderError] An unexpected error occurred:', error);

    return (
        <SectionError>
            <VenueHeaderLoading />
        </SectionError>
    );
}
