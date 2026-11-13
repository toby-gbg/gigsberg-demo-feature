import { notFound } from 'next/navigation';
import { all } from 'better-all';

import { isEventDetail } from '@/utils/event';
import { currencyApi, getCurrencyFromCookies } from '@/services/server/currencies';
import { eventApi } from '@/services/server/events';
import { listingApi } from '@/services/server/listing';

import SellTicketEventView from './_components/SellTicketEventView';

export default async function SellEventPage({
    params,
}: PageProps<'/[locale]/sell-ticket/[eventId]'>) {
    const { eventId } = await params;

    const { listing, event, currencies, currencyCode } = await all({
        async listing() {
            return listingApi.getUserListing({ pageSize: 1 });
        },
        async event() {
            return eventApi.getEventDetails({ eventId, action: 'sell_ticket' });
        },
        async currencies() {
            return currencyApi.getCurrencies();
        },
        async currencyCode() {
            return getCurrencyFromCookies();
        },
    });

    if (!isEventDetail(event)) notFound();

    // Check if user have any listing, if not show tutorial section
    const hasListing = (listing?.totalCount || 0) > 0;

    return (
        <SellTicketEventView
            event={event}
            hasListing={hasListing}
            currencies={currencies ?? {}}
            currencyCode={currencyCode ?? 'USD'}
        />
    );
}
