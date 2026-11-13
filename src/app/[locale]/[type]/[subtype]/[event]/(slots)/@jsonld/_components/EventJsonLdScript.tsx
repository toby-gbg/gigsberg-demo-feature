import { Fragment } from 'react/jsx-runtime';

import EntityMetadata from '@/interfaces/entity/EntityMetadata';
import { EventSearchFilters } from '@/interfaces/Event';

import EventJsonLd from './EventJsonLd';

interface EventJsonLdScriptProps {
    type: string;
    entityMetadata: EntityMetadata | null;
    filtersValue: EventSearchFilters;
}

export default async function EventJsonLdScript({
    type,
    entityMetadata,
    filtersValue,
}: EventJsonLdScriptProps) {
    return (
        <Fragment>
            <EventJsonLd entityMetadata={entityMetadata} type={type} filtersValue={filtersValue} />
        </Fragment>
    );
}
