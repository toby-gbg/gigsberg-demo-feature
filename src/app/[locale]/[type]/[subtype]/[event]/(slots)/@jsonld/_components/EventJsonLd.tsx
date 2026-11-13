import { Fragment } from 'react';

import EntityMetadata from '@/interfaces/entity/EntityMetadata';
import { EventSearchFilters, EventTicket } from '@/interfaces/Event';
import Headers from '@/lib/headers';
import { removeTicketsSuffix } from '@/utils/common';
import { JsonLdFactory } from '@/utils/mappers/jsonLd/jsonLd.mapper';
import { eventApi } from '@/services/server/events';

import JsonLdScript from '@/components/JsonLD/JsonLdScript';

interface EventJsonLdProps {
    entityMetadata: EntityMetadata | null;
    type: string;
    filtersValue: EventSearchFilters;
}

const EventJsonLd = async ({ entityMetadata, type, filtersValue }: EventJsonLdProps) => {
    const concertTypes = ['concert', 'concertio'];
    if (!concertTypes.includes(removeTicketsSuffix(type))) return null;

    const [currentUrl, domainInfo] = await Promise.all([
        Headers.getCurrentUrl(),
        Headers.getDomainInfo(),
    ]);
    const isActive = domainInfo.config?.seo?.jsonLd?.activeSchemas?.includes('Event');

    if (!currentUrl || !isActive) return null;

    const events = await eventApi.getEntityEvents(filtersValue);

    const eventsList: EventTicket[] = events?.rows || [];

    const performerName = entityMetadata?.entity?.name || '';

    const jsonLdList = JsonLdFactory.buildEventList(eventsList, performerName, currentUrl);

    return (
        <Fragment>
            {jsonLdList.map((jsonLd, index) => (
                <JsonLdScript key={index} id={`event-jsonld-${index}`} jsonLd={jsonLd} />
            ))}
        </Fragment>
    );
};

export default EventJsonLd;
