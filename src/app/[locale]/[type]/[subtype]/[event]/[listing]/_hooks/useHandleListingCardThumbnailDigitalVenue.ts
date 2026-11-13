import { MapViewer } from '@3ddv/dvm';

import { MatchResult } from '@/utils/digital-venue';

import { useListing } from '@/providers/ListingProvider';
import { useConfigRules } from '@/hooks/digital-venue/useConfigRules';
import { useMapViewerLoaded } from '@/hooks/digital-venue/useMapViewerLoad';
import { useNormalizeMetadata } from '@/hooks/digital-venue/useNormalizeMetadata';

interface UseHandleListingCardThumbnailDigitalVenue {
    mapViewer: MapViewer | null;
    keyMatching: MatchResult[];
}

export const useHandleListingCardThumbnailDigitalVenue =
    (): UseHandleListingCardThumbnailDigitalVenue => {
        const containerId = 'MAP_CONTAINER_THUMBNAIL_PREVIEW';

        const { external_3ddv_id, external_3ddv_blocks, metadata } = useListing();

        const { mapViewer } = useMapViewerLoaded({
            containerId,
            venueId: external_3ddv_id ?? '',
            mapId: 'blockmap2d',
        });

        const { configRules } = useConfigRules({
            external_3ddv_blocks: external_3ddv_blocks ?? [],
        });

        const { keyMatching } = useNormalizeMetadata({
            metadata,
            mapViewer,
            configRules,
        });

        return { mapViewer, keyMatching };
    };
