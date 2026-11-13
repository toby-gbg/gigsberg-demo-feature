import { all } from 'better-all';
import { getTranslations } from 'next-intl/server';

import { getCurrencyFromCookies } from '@/services/server/currencies';
import { eventApi } from '@/services/server/events';
import { EMPTY_EVENTS } from '@/constants/events';

import SubTitle from '@/components/SubTitle';

import VenueEvents from './_components/VenueEvents';
import VenueFilters from './_components/VenueFilters';
import { VenueProvider } from './_providers/VenueProvider';
import { venueSearchParamsCache } from './_searchParams';
import { buildVenueFiltersValue } from './_utils';

export default async function VenueEventsSlot({
    params: paramsProp,
    searchParams: searchParamsProp,
}: PageProps<'/[locale]/venues/[venueName]'>) {
    const {
        params: { venueName: rawVenueName },
        searchParams,
        t,
        currencyCode,
    } = await all({
        async params() {
            return paramsProp;
        },
        async searchParams() {
            return venueSearchParamsCache.parse(searchParamsProp);
        },
        async t() {
            return getTranslations();
        },
        async currencyCode() {
            return getCurrencyFromCookies();
        },
    });

    const venueName = decodeURIComponent(rawVenueName);
    const filtersValue = buildVenueFiltersValue(searchParams);
    const events =
        (await eventApi.getEventsByVenue({
            ...filtersValue,
            venueNameUrl: venueName,
        })) ?? EMPTY_EVENTS;

    const { totalCount } = events ?? {};

    return (
        <VenueProvider venueName={venueName}>
            <div className="flex md:flex-row flex-col md:justify-between md:items-center gap-4">
                {/* Subtitle */}
                <SubTitle title={`${t('most_wanted_events')} (${totalCount})`} />

                {/* Filters */}
                <div className="w-full md:max-w-74">
                    <VenueFilters />
                </div>
            </div>

            {/* Event list */}
            <div className="space-y-4">
                <VenueEvents events={events} currencyCode={currencyCode ?? 'USD'} />
            </div>
        </VenueProvider>
    );
}
