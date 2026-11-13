import { useEffect, useState, type ComponentProps } from 'react';
import { MapViewer } from '@3ddv/dvm';

interface Props {
    mapViewer: MapViewer | null;
    viewId: string | undefined;
    venueId: string;
    enabled?: boolean;
}

export const useGetThumbnail = ({ mapViewer, viewId, venueId, enabled = true }: Props) => {
    const [thumbnailImg, setThumbnailImg] = useState<HTMLImageElement | undefined>();

    const thumbnailCrossOrigin = thumbnailImg?.crossOrigin;
    const thumbnailInfo: ComponentProps<'img'>['crossOrigin'] =
        thumbnailCrossOrigin === 'anonymous' || thumbnailCrossOrigin === 'use-credentials'
            ? thumbnailCrossOrigin
            : undefined;

    useEffect(() => {
        let cancelled = false;

        if (!enabled || !mapViewer) {
            setThumbnailImg(undefined);
            return;
        }

        const loadThumbnail = async () => {
            if (!viewId || !mapViewer) {
                setThumbnailImg(undefined);
                return;
            }

            // Clear the previous image while the next thumbnail is loading.
            setThumbnailImg(undefined);

            try {
                const thumbnail = await mapViewer.getThumbnail({
                    venue_id: venueId,
                    view_id: viewId,
                });

                if (!cancelled) {
                    setThumbnailImg(thumbnail);
                }
            } catch {
                if (!cancelled) {
                    setThumbnailImg(undefined);
                }
            }
        };

        loadThumbnail();

        return () => {
            cancelled = true;
        };
    }, [enabled, mapViewer, venueId, viewId]);

    return {
        thumbnailImg,
        thumbnailInfo,
    };
};
