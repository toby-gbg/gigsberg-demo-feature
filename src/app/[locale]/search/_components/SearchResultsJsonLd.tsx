import { searchParamsCache } from '@/nuqs/params/search';
import { all } from 'better-all';

import Headers from '@/lib/headers';
import { buildSearchFiltersValue } from '@/utils/search';
import { eventApi } from '@/services/server/events';

import JsonLdScript from '@/components/JsonLD/JsonLdScript';

export default async function SearchResultsJsonLd() {
    const searchParams = searchParamsCache.all();
    const { q } = searchParams ?? {};
    const filtersValue = buildSearchFiltersValue(searchParams);

    const { origin, eventsData } = await all({
        async origin() {
            return Headers.getBaseUrl(); // Absolutasync e origin (e.g. https://www.gigsberg.com) to build canonical item URLs.
        },
        async eventsData() {
            if (!q) return null;
            return eventApi.searchEvents(filtersValue);
        },
    });
    const events = eventsData?.rows ?? [];

    if (!events?.length) return null;

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        numberOfItems: events.length,
        itemListElement: events.map((event, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: `${origin}${event.url ?? ''}`,
            name: event.eventName,
        })),
    };

    return <JsonLdScript id="search-results-jsonld" jsonLd={jsonLd} />;
}
