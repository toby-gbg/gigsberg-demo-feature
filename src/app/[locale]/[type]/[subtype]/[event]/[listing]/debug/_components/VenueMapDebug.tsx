'use client';

import { EventDetail } from '@/interfaces/Event';
import { ListingMetadata } from '@/interfaces/Listing';

import VenueMapDebugProvider from '../_providers/VenueMapDebugProvider';
import DebugHeader from './DebugHeader';
import DebugPanels from './DebugPanels';
import VenueMap from './Map';

interface Props {
    metadata: ListingMetadata;
    eventDetail: EventDetail;
}

export default function VenuaMapDebug({ metadata, eventDetail }: Props) {
    return (
        <VenueMapDebugProvider metadata={metadata} eventDetail={eventDetail}>
            <section className="bg-white fixed w-screen h-screen top-0 left-0 z-1000 flex flex-col">
                <DebugHeader eventDetail={eventDetail} />

                <DebugPanels metadata={metadata} />

                <VenueMap eventDetail={eventDetail} metadata={metadata} />
            </section>
        </VenueMapDebugProvider>
    );
}
