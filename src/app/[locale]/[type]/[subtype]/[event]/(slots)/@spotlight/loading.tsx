'use client';

import ArtistSpotlightCardSkeleton from './_components/ArtistSpotlightCardSkeleton';

export default function EventSpotlightLoading() {
    return (
        <div className="lg:col-span-1 w-auto shrink">
            <ArtistSpotlightCardSkeleton />
        </div>
    );
}
