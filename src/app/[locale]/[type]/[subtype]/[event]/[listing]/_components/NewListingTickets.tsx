'use client';

import { useTranslations } from 'next-intl';

import Listing, { ListingSearch } from '@/interfaces/Listing';
import { cn } from '@/lib/cn';
import { useExternalListings } from '@/swr/features/listings';

import { useListing } from '@/providers/ListingProvider';
import { useSite } from '@/providers/SiteProvider';
import { useSvgMap } from '@/hooks/useSvgMap';

import { Button } from '@/components/ui/Button';

import { useHandleListingCardThumbnailDigitalVenue } from '../_hooks/useHandleListingCardThumbnailDigitalVenue';
import { useListingGA } from '../_hooks/useListingGA';
import { $ticketDetailModal, $ticketListing } from '../_stores';
import ListingCard from './ListingCard';
// import ListingHeadline from './ListingHeadline';
import ListingCardSkeleton from './skeleton/ListingCardSkeleton';
import TicketDetailsModal from './TicketDetailsModal';

export default function NewListingTickets() {
    const t = useTranslations();
    const { config } = useSite().domainInfo || {};
    const useThemeBackground = config?.features?.useThemeBackground || false;

    const {
        listings: { listings, allInclusive, totalTickets, scarcityBanner },
        eventDetails,
        filters,
        setFilters,
        currencyCode,
        dataVersion,
        isCurrencySwitching,
        isUserSwitching,
        serverFilters,
    } = useListing();

    const { highlight } = useSvgMap();
    const { keyMatching, mapViewer } = useHandleListingCardThumbnailDigitalVenue();
    const { onTicketSelected, handleTicketVisible } = useListingGA({ eventDetails });

    const initialListingData: ListingSearch = {
        listings,
        allInclusive,
        totalTickets,
        scarcityBanner,
    };

    const { data, isFetching: isDataFetching } = useExternalListings(
        filters,
        initialListingData,
        dataVersion,
        serverFilters
    );

    const isFetching = isCurrencySwitching || isUserSwitching || isDataFetching || false;

    const onSelect = (listing: Listing) => {
        $ticketListing.set(listing);
        $ticketDetailModal.set(true);
        onTicketSelected(listing);
    };

    const handleClick = () => {
        setFilters((prev) => ({ ...prev, page: prev.page! + 1, skip: false }));
    };

    return (
        <>
            <TicketDetailsModal currencyCode={currencyCode} />

            <div className="gap-y-2 grid grid-cols-1 mb-4">
                <div
                    className="@container space-y-2"
                    onMouseLeave={() =>
                        highlight({
                            keys: filters.blocks,
                            categoryIds: filters.categories,
                        })
                    }
                >
                    {(isFetching && filters.page === 1) || data.items.length === 0 ? (
                        <ListingCardSkeleton
                            isLoaded={!isFetching && data.items.length === 0}
                            filters={filters}
                        />
                    ) : (
                        data.items.map((listing, index) => (
                            <ListingCard
                                key={index}
                                listing={listing}
                                onSelected={() => onSelect(listing)}
                                onVisible={() => handleTicketVisible(listing)}
                                mapViewer={mapViewer}
                                keyMatching={keyMatching}
                            />
                        ))
                    )}
                </div>

                {isFetching && filters.page !== 1 && <ListingCardSkeleton />}

                {data.hasMore && (
                    <Button
                        className={cn('mx-auto mt-6', useThemeBackground && 'text-on-header')}
                        onClick={handleClick}
                        disabled={isFetching}
                    >
                        {t('load_more')}
                    </Button>
                )}
            </div>
        </>
    );
}
