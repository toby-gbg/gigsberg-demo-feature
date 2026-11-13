'use client';

import { useEffect, useMemo, useState } from 'react';
import { Fragment } from 'react/jsx-runtime';

import { cn } from '@/lib/cn';

import { DigitalVenueProvider } from '@/providers/DigitalVenueProvider';
import { useListing } from '@/providers/ListingProvider';
import { useConfigRules } from '@/hooks/digital-venue/useConfigRules';

import DigitalVenue from '@/components/venues/DigitalVenue';
import VenueMap from '@/components/venues/VenueMap';
import VenueMapSkeleton from '@/components/venues/VenueMap/VenueMapSkeleton';

import ListingFilterSkeleton from './skeleton/ListingFilterSkeleton';
import TicketListFilters from './TicketListFilters';
import VenueMobile from './VenueMobile';

export default function ListingSeatMapPanel() {
    const [selectedOurSectionId, setSelectedOurSectionId] = useState<string | null>('');

    // Listing provider
    const {
        eventDetails,
        metadata,
        mapUrls,
        filters,
        external_3ddv_id,
        external_3ddv_blocks,
        setFilters,
        currencyCode,
        isCurrencySwitching,
        isUserSwitching,
    } = useListing();

    const { configRules } = useConfigRules({ external_3ddv_blocks: external_3ddv_blocks ?? [] });

    const isMetadataFetching = isCurrencySwitching || isUserSwitching || false;

    const onChangeSectionId = ({ blockKeyId }: { blockKeyId: string | null }) => {
        setSelectedOurSectionId(blockKeyId);
    };

    // Reset must visibly clear the map too: drop the selected section once its
    // filters are gone. No-op otherwise (empty string bails out of setState).
    useEffect(() => {
        if (!filters.blocks?.length && !filters.categories?.length) {
            setSelectedOurSectionId('');
        }
    }, [filters.blocks, filters.categories]);

    const isDigitalVenueEnabled = useMemo(() => !!external_3ddv_id, [external_3ddv_id]);

    return (
        <Fragment>
            <div className="top-0 z-20 lg:z-0 sticky self-start order-0 lg:order-0 col-span-1 lg:col-span-7 md:min-h-[clamp(360px,50dvh,760px)]">
                <div className="relative space-y-2 bg-gray-100 cursor-grab">
                    {isMetadataFetching || !metadata ? (
                        <ListingFilterSkeleton />
                    ) : (
                        <TicketListFilters
                            metadata={metadata}
                            isMetadataFetching={isMetadataFetching}
                            eventTicketTypes={eventDetails?.ticketTypes}
                            currencyCode={currencyCode ?? 'USD'}
                        />
                    )}

                    {isMetadataFetching || !metadata ? (
                        <div className={cn(!isMetadataFetching && 'pt-4')}>
                            <VenueMapSkeleton />
                        </div>
                    ) : isDigitalVenueEnabled ? (
                        <DigitalVenueProvider
                            metadata={metadata}
                            onChangeSection={onChangeSectionId}
                            viewId={selectedOurSectionId}
                            mapContainerId={`map_viewer_${eventDetails.id}`}
                            viewer3dContainerId={`3d_viewer_${eventDetails.id}`}
                            configRules={configRules}
                        >
                            <div className="md:px-5 md:pb-5">
                                <DigitalVenue className="relative flex flex-col" />
                            </div>
                        </DigitalVenueProvider>
                    ) : (
                        <VenueMap
                            metadata={metadata}
                            eventDetail={eventDetails}
                            filters={filters}
                            setFilters={setFilters}
                            isMetadataFetching={isMetadataFetching}
                            mapUrls={mapUrls}
                            currencyCode={currencyCode ?? 'USD'}
                        />
                    )}
                </div>
            </div>

            {metadata && (
                <VenueMobile
                    metadata={metadata}
                    isMetadataFetching={isMetadataFetching}
                    eventTicketTypes={eventDetails?.ticketTypes}
                    currencyCode={currencyCode ?? 'USD'}
                />
            )}
        </Fragment>
    );
}
