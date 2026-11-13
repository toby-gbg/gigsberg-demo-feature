import { useCallback, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useLocale } from 'next-intl';

import { EventDetail } from '@/interfaces/Event';
import Listing from '@/interfaces/Listing';
import { PromotionItem } from '@/interfaces/trackers/GoogleAnalystic';
import GoogleAnalyticsTracker from '@/lib/seo/GoogleAnalyticsTracker';
import GoogleEventMapper from '@/utils/GoogleEventMapper';

import { useSite } from '@/providers/SiteProvider';

interface Props {
    eventDetails: EventDetail;
}

export function useListingGA({ eventDetails }: Props) {
    const locale = useLocale();
    const { type, subtype } = useParams<{ type: string; subtype: string; event: string }>();
    const { config } = useSite().domainInfo || {};

    const viewedTicketIds = useRef<Set<string>>(new Set());
    const batchItemsRef = useRef<PromotionItem[]>([]);
    const batchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Cleanup batch timer on unmount
    useEffect(() => {
        return () => {
            if (batchTimerRef.current) clearTimeout(batchTimerRef.current);
        };
    }, []);

    const buildPromotionItem = (listing: Listing) =>
        GoogleEventMapper.mapListingToPromotionItem(
            listing,
            {
                ...eventDetails,
                type_name_url: type,
                subType: locale === 'es' ? { nameEs: subtype } : { nameUrl: subtype },
            },
            'en',
            config?.features?.useGrossPrice || false
        );

    const onTicketSelected = (listing: Listing) => {
        const item = buildPromotionItem(listing);
        GoogleAnalyticsTracker.triggerGA4PromotionEvent('select_item', { items: [item] });
        GoogleAnalyticsTracker.triggerGA4PromotionEvent('view_item', { items: [item] });
    };

    const handleTicketVisible = useCallback(
        (listing: Listing) => {
            const ticketKey = `${eventDetails?.id} - ${
                listing.id === 0 ? listing.ext_listing_id : listing.id
            }`;
            if (viewedTicketIds.current.has(ticketKey)) return;

            viewedTicketIds.current.add(ticketKey);
            batchItemsRef.current.push(buildPromotionItem(listing));

            if (batchTimerRef.current) clearTimeout(batchTimerRef.current);

            batchTimerRef.current = setTimeout(() => {
                if (batchItemsRef.current.length > 0) {
                    GoogleAnalyticsTracker.triggerGA4PromotionEvent('view_item_list', {
                        items: [...batchItemsRef.current],
                    });
                    batchItemsRef.current = [];
                }
            }, 200);
        },
        [eventDetails]
    );

    return { onTicketSelected, handleTicketVisible };
}
