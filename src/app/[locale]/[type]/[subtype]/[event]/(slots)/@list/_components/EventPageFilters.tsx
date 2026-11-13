'use client';

import EventFilters from '@/components/event-filters/EventFilters';
import { EventFiltersMobile } from '@/components/event-filters/EventFiltersMobile';

import { useEntityContext } from '../../../_providers/EntityProvider';

export default function EventFiltersComponent() {
    const { entityMetadata } = useEntityContext();

    const { countries = [], cities = [], tours = [] } = entityMetadata || {};

    return (
        <>
            <div className="hidden md:block">
                <EventFilters countries={countries} cities={cities} tours={tours} />
            </div>
            <div className="block md:hidden">
                <EventFiltersMobile countries={countries} cities={cities} tours={tours} />
            </div>
        </>
    );
}
