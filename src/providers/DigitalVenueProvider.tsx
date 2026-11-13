'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from 'react';
import type { MapViewer, MapViewerInputNode, Viewer3d } from '@3ddv/dvm';

import type { ExternalDigitalVenueBlocks, ListingMetadata } from '@/interfaces/Listing';
import type { DigitalVenueAvailableBlockInfo } from '@/types/digital-venue';
import {
    getDigitalVenueConfigRuleKey,
    normalizeKey,
    type ConfigRulesMap,
} from '@/utils/digital-venue';
import { getDigitalVenueTooltipElementId } from '@/utils/digital-venue-interaction';
import {
    DDV_MAP_ZOOM_ANIMATION_TIME,
    DigitalVenueStatus,
    getDDVMapStyles,
} from '@/constants/digital-venue-config';

import { use3DViewerLoad } from '@/hooks/digital-venue/use3dViewerLoad';
import { useDDVMapInteractions } from '@/hooks/digital-venue/useDigitalVenueMapInteractions';
import {
    DigitalVenueMapViewerMapId,
    useMapViewerLoaded,
} from '@/hooks/digital-venue/useMapViewerLoad';
import { useNormalizeMetadata } from '@/hooks/digital-venue/useNormalizeMetadata';

import { useListing } from './ListingProvider';

interface DigitalVenueContextValue {
    activeSectionIds: string[];
    availableBlockInfoById: Record<string, DigitalVenueAvailableBlockInfo>;
    availableBlocks: string[];
    error: Error | null;
    errorMessage: string | null;
    isLoading: boolean;
    mapContainerId: string;
    mapId: string;
    mapViewer: MapViewer | null;
    status: DigitalVenueStatus;
    venueId: string;
    viewId?: string;
    viewer3d: Viewer3d | null;
    viewer3dContainerId: string;
    external_3ddv_blocks?: ExternalDigitalVenueBlocks[];
}

interface DigitalVenueProviderProps {
    children: ReactNode;
    metadata?: ListingMetadata;
    mapId?: DigitalVenueMapViewerMapId;
    viewId?: string | null;
    mapContainerId: string;
    viewer3dContainerId: string;
    onChangeSection?: (payload: { blockKeyId: string | null; categoryId: string | null }) => void;
    configRules: ConfigRulesMap;
    isDebug?: boolean;
}

const DigitalVenueContext = createContext<DigitalVenueContextValue | null>(null);

export const DigitalVenueProvider = ({
    children,
    mapId = 'blockmap2d',
    metadata,
    onChangeSection,
    viewId,
    mapContainerId = 'map_viewer_container',
    viewer3dContainerId = '3d_viewer_container',
    configRules = {},
}: DigitalVenueProviderProps) => {
    const {
        filters,
        setFilters,
        external_3ddv_blocks,
        external_3ddv_id,
        mainGradientStart,
        textOnMain,
    } = useListing();
    const venueId = external_3ddv_id ?? '';
    // Hook for load 2D of model map_viewer
    const { error, isLoading, mapViewer } = useMapViewerLoaded({
        containerId: mapContainerId,
        venueId,
        mapId,
    });

    // Hook for load 3D of model 3d_viewer
    const { errorMessage, status, viewer3d } = use3DViewerLoad({
        containerId: viewer3dContainerId,
        venueId,
        viewId: viewId ?? '',
    });

    // Build lookup sets once per filter change instead of mapping arrays for every metadata row.
    const blockFilterSet = useMemo(
        () => (filters.blocks ? new Set(filters.blocks.map(String)) : null),
        [filters.blocks]
    );
    const categoryFilterSet = useMemo(
        () => (filters.categories ? new Set(filters.categories.map(String)) : null),
        [filters.categories]
    );

    const { allBlocksMetadata, availableBlockInfoById, availableBlocks, keyMatching } =
        useNormalizeMetadata({
            metadata,
            mapViewer,
            configRules,
        });

    const activeSectionIds = useMemo(() => {
        if (!allBlocksMetadata.length) return [];

        if (!filters.blocks && !filters.categories) {
            return availableBlocks;
        }

        const availableBlocksFilter = allBlocksMetadata.filter((item) => {
            const matchesBlock = !blockFilterSet || blockFilterSet.has(item.key);
            const matchesCategory =
                !categoryFilterSet || categoryFilterSet.has(String(item.categoryId));
            return matchesBlock && matchesCategory;
        });

        return availableBlocksFilter.flatMap((item) => {
            const sourceKey = getDigitalVenueConfigRuleKey(item.key, item.categoryId);
            const matchedTargets = keyMatching?.find((key) => key.sourceKey === sourceKey)?.targets;

            if (matchedTargets) {
                return matchedTargets;
            }

            // Fallback to ID S_xxx eventhough it do not match. For example: S_REAR STADNGIND BACK
            return [`S_${normalizeKey(item.key)}`];
        });
    }, [
        allBlocksMetadata,
        availableBlocks,
        blockFilterSet,
        categoryFilterSet,
        filters.blocks,
        filters.categories,
        keyMatching,
    ]);

    useEffect(() => {
        if (!allBlocksMetadata.length || !availableBlocks) return;
        if (filters.blocks || filters.categories) return;

        onChangeSection?.({ blockKeyId: null, categoryId: null });

        if (mapViewer) {
            if (availableBlocks.length > 0)
                mapViewer.goTo(availableBlocks, undefined, DDV_MAP_ZOOM_ANIMATION_TIME);
        }
    }, [
        allBlocksMetadata.length,
        availableBlocks,
        filters.blocks,
        filters.categories,
        mapViewer,
        onChangeSection,
    ]);

    useEffect(() => {
        if (!mapViewer) return;
        mapViewer.setStyles(getDDVMapStyles(mainGradientStart, textOnMain || ''), true);
    }, [mapViewer, mainGradientStart, textOnMain]);

    useEffect(() => {
        if (!mapViewer || !allBlocksMetadata.length) return;
        mapViewer.setAvailability('section', activeSectionIds);
        // Hide sections that exist on the 3DDV map but are not included in Gigsberg's available metadata list, so users can only see/select valid sections.
        const ddvSectionNodes = mapViewer.getNodesByType('section');
        if (!ddvSectionNodes.length) return;
        const ddvSectionsNodesFormated = ddvSectionNodes.map((item) => item.id);
        const sectionGigsberg = new Set(availableBlocks);
        const onlyIn3DDV: MapViewerInputNode[] = ddvSectionsNodesFormated.filter(
            (item) => !sectionGigsberg.has(item)
        );
        mapViewer.disable('section', onlyIn3DDV);
    }, [activeSectionIds, allBlocksMetadata.length, mapViewer, availableBlocks]);

    const handleChangeSection = useCallback(
        (payload: { blockKeyId: string | null; categoryId: string | null }) => {
            onChangeSection?.(payload);
        },
        [onChangeSection]
    );

    useDDVMapInteractions({
        activeSectionIds,
        availableBlockInfoById,
        boundaryElementId: mapContainerId,
        mapViewer,
        onChangeSection: handleChangeSection,
        setFilters,
        tooltipElementId: getDigitalVenueTooltipElementId(mapContainerId, venueId),
    });

    const value = useMemo<DigitalVenueContextValue>(
        () => ({
            activeSectionIds,
            availableBlockInfoById,
            availableBlocks,
            error,
            errorMessage,
            isLoading,
            mapContainerId,
            mapId,
            mapViewer,
            status,
            venueId,
            viewId: viewId ?? '',
            viewer3d,
            viewer3dContainerId,
            external_3ddv_blocks,
        }),
        [
            activeSectionIds,
            availableBlockInfoById,
            availableBlocks,
            error,
            errorMessage,
            isLoading,
            mapContainerId,
            mapId,
            mapViewer,
            status,
            venueId,
            viewId,
            viewer3d,
            viewer3dContainerId,
            external_3ddv_blocks,
        ]
    );

    return <DigitalVenueContext.Provider value={value}>{children}</DigitalVenueContext.Provider>;
};

export const useDigitalVenue = () => {
    const context = useContext(DigitalVenueContext);

    if (!context) {
        throw new Error('useDigitalVenue must be used within DigitalVenueProvider.');
    }

    return context;
};
