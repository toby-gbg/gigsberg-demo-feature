import { notFound } from 'next/navigation';

import { isEventDetail } from '@/utils/event';
import { eventApi } from '@/services/server/events';
import { listingApi } from '@/services/server/listing';

import VenueMapDebug from './_components/VenueMapDebug';

export default async function SvgMapDebug({
    params,
}: PageProps<'/[locale]/[type]/[subtype]/[event]/[listing]'>) {
    const isDebug = process.env.NEXT_PUBLIC_DEBUG_MODE === '1';
    if (!isDebug) return notFound();

    const { listing } = await params;
    const [metadata, eventDetails] = await Promise.all([
        listingApi.getListingMetadata(listing),
        eventApi.getEventDetails({ eventId: listing }),
    ]);

    if (!metadata || !eventDetails) return notFound();
    if (!isEventDetail(eventDetails)) return notFound();

    return <VenueMapDebug metadata={metadata} eventDetail={eventDetails} />;
}
