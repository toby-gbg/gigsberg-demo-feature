import { useState } from 'react';
import { useUpdateEffect } from 'react-use';

import { EventDetail } from '@/interfaces/Event';
import { ListingMetadata, ListingSearchFilters } from '@/interfaces/Listing';
import { formatWithUnderscores } from '@/utils/common';

import VenueMap from '@/components/venues/VenueMap';

import { useVenueMapDebug } from '../_providers/VenueMapDebugProvider';

interface Props {
    eventDetail: EventDetail;
    metadata: ListingMetadata;
    currencyCode?: string;
}
export default function DebugMap({ eventDetail, metadata, currencyCode = 'USD' }: Props) {
    const { setBlockCategoryFilter, setSearchTerm, setSvgCategoryFilter } = useVenueMapDebug();

    const [filters, setFilters] = useState<ListingSearchFilters>({
        event_id: eventDetail?.id ?? 0,
        currency_code: currencyCode,
    });

    useUpdateEffect(() => {
        const { categories, blocks } = filters;
        const catId = categories?.[0];

        if (!catId) {
            setSvgCategoryFilter('');
            setBlockCategoryFilter('');
            setSearchTerm('');

            return;
        } else {
            const categoryName =
                metadata.categories?.find((c) => c.category_id.toString() === catId)?.name || 'all';

            setSearchTerm(blocks?.[0] || categoryName);
            setBlockCategoryFilter(categoryName);
            setSvgCategoryFilter(formatWithUnderscores(categoryName));
        }
    }, [filters]);

    return (
        <div className="flex justify-end">
            <VenueMap
                metadata={metadata}
                eventDetail={eventDetail}
                filters={filters}
                setFilters={setFilters}
                isDebug={true}
            />
        </div>
    );
}
