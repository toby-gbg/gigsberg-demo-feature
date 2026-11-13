import { listingApi } from '@/services/server/listing';

import MainContainer from '@/components/MainContainer';

import SellTicketView from './_components/SellTicketView';

export default async function SellPage() {
    const listing = await listingApi.getUserListing({ pageSize: 1 });

    // Check if user has any listing, if not show tutorial section
    const hasListing = (listing?.totalCount || 0) > 0;

    return (
        <MainContainer className="space-y-5 py-10">
            <SellTicketView hasListing={hasListing} />
        </MainContainer>
    );
}
