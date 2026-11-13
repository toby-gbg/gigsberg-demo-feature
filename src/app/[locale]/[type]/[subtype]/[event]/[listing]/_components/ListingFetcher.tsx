import { Suspense } from 'react';
import { all } from 'better-all';

import { EventDetail } from '@/interfaces/Event';
import { EventSaleTime } from '@/interfaces/Listing';
import { isEventAvailableForSale } from '@/utils/event';
import { getCurrencyFromCookies } from '@/services/server/currencies';
import { eventApi } from '@/services/server/events';
import { ipApi } from '@/services/server/ip';
import { listingApi } from '@/services/server/listing';
import { subtypeApi } from '@/services/server/subtype';
import { userApi } from '@/services/server/users';
import { websiteApi } from '@/services/server/website';
import { ListingServerFilters } from '@/swr/types/listings';

import { ListingProvider } from '@/providers/ListingProvider';

import Footer from '@/components/footer';

import { listingParamsCache } from '../_searchParams';
import EventInformationModal from './EventInformationModal';
import ListingMapFetcher from './ListingMapFetcher';
import NewListingTickets from './NewListingTickets';
import NoListingsFoundFallback from './NoListingsFoundFallback';
import SelectQuantityModal from './SelectQuantityModal';
import TicketListFilters from './TicketListFilters';
import VenueMobile from './VenueMobile';

interface Props {
    query: string;
    type: string;
    subtype: string;
    eventDetails: EventDetail;
}

export default async function ListingFetcher({ query, type, subtype, eventDetails }: Props) {
    const numberOfTickets = listingParamsCache.get('quantity');
    const urlCategories = listingParamsCache.get('categories') ?? [];
    const urlTicketTypes = listingParamsCache.get('ticket_type') ?? [];
    const urlBlocks = listingParamsCache.get('blocks') ?? [];
    const urlMinPrice = listingParamsCache.get('min_price') ?? null;
    const urlMaxPrice = listingParamsCache.get('max_price') ?? null;

    const {
        metadata,
        listings,
        restrictions,
        currencyCode,
        venueFrom3DDV,
        currentUser,
        mapUrls,
        ipCountry,
        website,
        rawSvg,
    } = await all({
        async metadata() {
            return listingApi.getListingMetadata(query);
        },
        async listings() {
            return listingApi.getListings(query, numberOfTickets ?? null, {
                categories: urlCategories,
                ticketTypeIds: urlTicketTypes,
                blocks: urlBlocks,
                minPrice: urlMinPrice,
                maxPrice: urlMaxPrice,
            });
        },
        async restrictions() {
            return eventApi.getEventRestrictions(
                eventDetails.id,
                eventDetails.countryCode,
                eventDetails.isRestrictionInCom
            );
        },
        async currencyCode() {
            return getCurrencyFromCookies();
        },
        async venueFrom3DDV() {
            return listingApi.getVenueFrom3DDV(Number(eventDetails.id));
        },
        async currentUser() {
            return userApi.getCurrentUser();
        },
        async mapUrls() {
            return listingApi.getExternal3dMetadata(eventDetails.id);
        },
        async ipCountry() {
            return ipApi.getCountryIp();
        },
        async website() {
            return websiteApi.getWebsite();
        },
        async rawSvg() {
            return eventDetails.svgFilePath
                ? listingApi.getMapSvg(eventDetails.svgFilePath)
                : undefined;
        },
    });

    if (!metadata || !listings) return null;

    // Snapshot of the filters this payload was rendered with. The client
    // reuses the server page with zero fetch while live filters match it —
    // the URL below carries them across currency switches.
    const serverFilters: ListingServerFilters = {
        event_id: eventDetails.id,
        currency_code: currencyCode ?? 'USD',
        number_of_tickets: numberOfTickets ?? null,
        categories: urlCategories,
        ticket_type_ids: urlTicketTypes,
        blocks: urlBlocks,
        min_price: urlMinPrice,
        max_price: urlMaxPrice,
    };

    const openSaleDateTime: EventSaleTime = {
        open_sale_timestamp: metadata.event?.open_sale_timestamp,
        open_sale_date: metadata.event?.open_sale_date,
        open_sale_time: metadata.event?.open_sale_time,
        ianaZone: eventDetails.ianaZone,
    };

    // Check ticket available
    const isAvailableForSale = isEventAvailableForSale(openSaleDateTime);

    const hasTickets = (metadata?.total_tickets ?? 0) > 0;

    const hasListing = isAvailableForSale && hasTickets;

    const { external_3ddv_id, external_3ddv_blocks } = venueFrom3DDV ?? {};

    if (!hasListing) {
        const subtypeData = await subtypeApi.getSubtypeData({ type, subtype });
        return (
            <>
                <NoListingsFoundFallback
                    subtype={subtype}
                    eventId={eventDetails.id || 0}
                    eventDetail={eventDetails}
                    availableForSale={isAvailableForSale}
                    openSaleDateTime={openSaleDateTime}
                    subTypeData={subtypeData}
                />
                <Suspense>
                    <Footer website={website} />
                </Suspense>
            </>
        );
    }

    return (
        <ListingProvider
            eventDetails={eventDetails}
            metadata={metadata}
            listings={listings}
            restrictions={restrictions}
            currencyCode={currencyCode ?? 'USD'}
            currentUser={currentUser}
            mapUrls={mapUrls}
            external_3ddv_id={external_3ddv_id}
            external_3ddv_blocks={external_3ddv_blocks}
            queryNumberOfTickets={numberOfTickets}
            ipCountry={ipCountry}
            serverFilters={serverFilters}
            rawSvgContent={rawSvg}
        >
            <section className="grid grid-cols-1 lg:grid-cols-12 bg-gray-100">
                <div className="order-1 lg:order-0 col-span-1 lg:col-span-5">
                    <NewListingTickets />
                </div>

                <div className="sticky top-0 z-20 order-0 col-span-1 self-start md:min-h-[clamp(360px,50dvh,760px)] lg:order-0 lg:col-span-7 lg:z-0">
                    <div className="relative space-y-2 bg-gray-100 cursor-grab">
                        <TicketListFilters
                            metadata={metadata}
                            currencyCode={currencyCode ?? 'USD'}
                            isMetadataFetching={false}
                        />
                        <div className="p-3">
                            <ListingMapFetcher
                                currencyCode={currencyCode}
                                metadata={metadata}
                                rawSvg={rawSvg}
                                type={type}
                                subtype={subtype}
                            />
                        </div>
                        {metadata && (
                            <VenueMobile
                                metadata={metadata}
                                eventTicketTypes={eventDetails?.ticketTypes}
                                currencyCode={currencyCode ?? 'USD'}
                                isMetadataFetching={false}
                            />
                        )}
                    </div>
                </div>
            </section>

            <SelectQuantityModal />
            <EventInformationModal />
        </ListingProvider>
    );
}
