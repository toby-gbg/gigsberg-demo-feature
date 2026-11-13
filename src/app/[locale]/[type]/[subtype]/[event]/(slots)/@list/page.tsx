import { all } from 'better-all';

import { getCurrencyFromCookies } from '@/services/server/currencies';
import { entityApi } from '@/services/server/entity';
import { eventApi } from '@/services/server/events';
import { EMPTY_EVENTS } from '@/constants/events';

import { eventFilterSearchParamsCache } from '@/components/event-filters/event-filter.schema';

import { buildEventFiltersValue } from '../../_utils/event-filters';
import EventList from './_components/EventList';
import EventFiltersComponent from './_components/EventPageFilters';

export default async function EventListSlot({
    params,
    searchParams,
}: PageProps<'/[locale]/[type]/[subtype]/[event]'>) {
    const { currencyCode, events } = await all({
        async params() {
            return params;
        },
        async parsedSearchParams() {
            return eventFilterSearchParamsCache.parse(searchParams);
        },
        async entityMetadata() {
            const { type, subtype, event } = await this.$.params;
            return entityApi.getEntityMetadata({
                url: event,
                type,
                subtype,
                debug: { callPoint: '@list slot' },
            });
        },
        async currencyCode() {
            return getCurrencyFromCookies();
        },
        async events() {
            const entityMetadata = await this.$.entityMetadata;
            const parsedSearchParams = await this.$.parsedSearchParams;
            const currencyCode = await this.$.currencyCode;
            const filtersValue = buildEventFiltersValue(
                entityMetadata,
                parsedSearchParams,
                currencyCode
            );
            return eventApi.getEntityEvents(filtersValue);
        },
    });

    const resolvedEvents = events ?? EMPTY_EVENTS;

    return (
        <>
            <EventFiltersComponent />
            <EventList events={resolvedEvents} currencyCode={currencyCode ?? 'USD'} />
        </>
    );
}
