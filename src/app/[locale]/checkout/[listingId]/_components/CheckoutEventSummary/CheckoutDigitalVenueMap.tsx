'use client';

import React, { useEffect, useMemo } from 'react';

import { getDigitalVenueConfigRuleKey, normalizeKey } from '@/utils/digital-venue';
import { getDDVMapStyles } from '@/constants/digital-venue-config';

import { useConfigRules } from '@/hooks/digital-venue/useConfigRules';
import { useMapViewerLoaded } from '@/hooks/digital-venue/useMapViewerLoad';
import { useNormalizeMetadata } from '@/hooks/digital-venue/useNormalizeMetadata';

import { useCheckoutData } from '../../_providers/CheckoutDataProvider';

const formatKey = (value: string): string => {
    if (!value) return '';
    // This below expression find white space and delete, after convert to uppercase
    return value.replace(/\s+/g, '').toUpperCase();
};

export default function CheckoutDigitalVenueMap({
    external_3ddv_id,
    mapContainerId,
}: {
    external_3ddv_id: string;
    mapContainerId: string;
}) {
    const { data, metadata, external_3ddv_blocks, website } = useCheckoutData();
    const { listing } = data || {};
    const { main_gradient_start, text_on_main = '' } = website ?? {};

    const { configRules } = useConfigRules({ external_3ddv_blocks });

    // Hook for load map_viewer
    const { mapViewer } = useMapViewerLoaded({
        containerId: mapContainerId ?? '',
        venueId: external_3ddv_id ?? '',
        mapId: 'blockmap2d',
    });

    const { allBlocksMetadata, availableBlocks, keyMatching } = useNormalizeMetadata({
        metadata: metadata ?? undefined,
        mapViewer,
        configRules,
    });

    const activeSectionIds = useMemo(() => {
        if (!allBlocksMetadata.length) return [];

        if (!listing.block && !listing.category_id) {
            return availableBlocks;
        }

        const blockFilterSet = listing.block ? new Set([listing.block].map(String)) : null;

        const categoryFilterSet =
            listing.category_id != null ? new Set([String(listing.category_id)]) : null;

        // Handle case value of block's field is the same with category's field name
        const shouldFilterByCategoryOnly = formatKey(listing.block).includes(
            formatKey(listing.category?.name ?? '')
        );

        const availableBlocksFilter = allBlocksMetadata.filter((item) => {
            const matchesBlock =
                shouldFilterByCategoryOnly || !blockFilterSet || blockFilterSet.has(item.key);
            const matchesCategory =
                !categoryFilterSet || categoryFilterSet.has(String(item.categoryId));
            return matchesBlock && matchesCategory;
        });

        return availableBlocksFilter.flatMap((item) => {
            /**
             * Example: '2729:Grandstand Schongerg'
             */
            const sourceKey = getDigitalVenueConfigRuleKey(item.key, item.categoryId);
            /**
             * Example: ['S_SCHONBERGA', 'S_SCHONBERGB']
             */
            const matchedTargets = keyMatching?.find((key) => key.sourceKey === sourceKey)?.targets;

            if (matchedTargets) {
                return matchedTargets;
            }

            return [`S_${normalizeKey(item.key)}`];
        });
    }, [
        allBlocksMetadata,
        availableBlocks,
        keyMatching,
        listing.block,
        listing.category_id,
        listing.category?.name,
    ]);

    useEffect(() => {
        if (!mapViewer) return;
        mapViewer.setStyles(getDDVMapStyles(main_gradient_start, text_on_main), true);
    }, [mapViewer]);

    useEffect(() => {
        if (!mapViewer) return;
        mapViewer.setAvailability('section', activeSectionIds);
    }, [activeSectionIds, mapViewer]);

    if (!external_3ddv_id) return null;

    return (
        <React.Fragment>
            <div id={mapContainerId} className="h-full w-full overflow-hidden" />
            {!mapViewer && <div className="">Loading DDV Map...</div>}
        </React.Fragment>
    );
}
