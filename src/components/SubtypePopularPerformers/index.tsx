import { getLocale } from 'next-intl/server';

import PopularPerformer from '@/interfaces/Performer';

import SubtypePopularPerformers from './SubtypePopularPerformers';

// Server layer: fetches its own locale so the client UI
// (and the EventCard/FallbackImage inside it, via hook) needs no provider.
export default async function SubtypePopularPerformersWithSite({
    performers,
    type,
    tourId,
}: {
    performers: PopularPerformer[];
    type: string;
    tourId?: number;
}) {
    const locale = await getLocale();

    return (
        <SubtypePopularPerformers
            performers={performers}
            type={type}
            tourId={tourId}
            locale={locale}
        />
    );
}
