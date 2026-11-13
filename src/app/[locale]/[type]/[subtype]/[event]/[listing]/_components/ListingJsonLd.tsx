import { getTranslations } from 'next-intl/server';

import { EventDetail } from '@/interfaces/Event';
import Headers from '@/lib/headers';
import { JsonLdFactory } from '@/utils/mappers/jsonLd/jsonLd.mapper';
import { getEventType } from '@/utils/mappers/jsonLd/utils';
import { listingApi } from '@/services/server/listing';
import { seoApi } from '@/services/server/seo';
import { websiteApi } from '@/services/server/website';

import JsonLdScript from '@/components/JsonLD/JsonLdScript';

type ListingJsonLdProps = {
    query: string;
    eventDetails: EventDetail;
    type: string;
    subtype: string;
    event: string;
};

const ListingJsonLd = async ({ query, eventDetails, type, subtype, event }: ListingJsonLdProps) => {
    //First we check and render backend schema if available
    const backendSchema = await seoApi.getSchemaMarkup({
        params: { type, subtype, event, listing: query },
    });
    if (backendSchema?.['@context']) {
        return (
            <JsonLdScript id={backendSchema?.url} key={backendSchema?.url} jsonLd={backendSchema} />
        );
    }

    const [listings, metadata, website, currentUrl, domainInfo, t] = await Promise.all([
        listingApi.getListings(query),
        listingApi.getListingMetadata(query),
        websiteApi.getWebsite(),
        Headers.getCurrentUrl(),
        Headers.getDomainInfo(),
        getTranslations(),
    ]);

    if (!listings || !metadata || !currentUrl) return null;

    const isActive = domainInfo.config?.seo?.jsonLd?.activeSchemas?.includes('Listing');

    if (!isActive) return null;

    const eventType = getEventType(type);

    const jsonLd = JsonLdFactory.buildDetailedEvent(
        {
            eventDetail: eventDetails,
            listings: listings.listings.items,
            metadata,
            url: currentUrl,
            logo: website?.logo || '',
            eventType,
            subtype,
            domainInfo,
        },
        t
    );

    return <JsonLdScript id="listing-jsonld" jsonLd={jsonLd} />;
};

export default ListingJsonLd;
