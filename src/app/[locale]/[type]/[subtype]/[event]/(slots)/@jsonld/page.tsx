import { entityApi } from '@/services/server/entity';
import { seoApi } from '@/services/server/seo';

import JsonLdScript from '@/components/JsonLD/JsonLdScript';

import { eventSearchParamsCache } from '../../_searchParams';
import { buildEventFiltersValue } from '../../_utils/event-filters';
import EventJsonLdScript from './_components/EventJsonLdScript';

export default async function EventJsonLdSlot({
    params,
    searchParams,
}: PageProps<'/[locale]/[type]/[subtype]/[event]'>) {
    const { type, subtype, event } = await params;
    const [parsedSearchParams, entityMetadata, schema] = await Promise.all([
        eventSearchParamsCache.parse(searchParams),
        entityApi.getEntityMetadata({
            url: event,
            type,
            subtype,

            debug: { callPoint: '@jsonld slot' },
        }),
        seoApi.getSchemaMarkup({
            params: { type, subtype, event },
            debug: { callPoint: '@jsonld slot' },
        }),
    ]);
    const filtersValue = buildEventFiltersValue(entityMetadata, parsedSearchParams);

    if (schema?.['@context']) {
        return <JsonLdScript id={schema?.url} key={schema?.url} jsonLd={schema} />;
    }

    return (
        <EventJsonLdScript
            type={type}
            entityMetadata={entityMetadata}
            filtersValue={filtersValue}
        />
    );
}
