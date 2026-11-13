'use client';

import { useCallback, useEffect, useState } from 'react';

import { getDigitalVenueTooltipElementId } from '@/utils/digital-venue-interaction';

import { useDigitalVenue } from '@/providers/DigitalVenueProvider';

import { DigitalVenueLoad2D } from './DigitalVenueLoad2d';
import { DigitalVenueLoad3D } from './DigitalVenueLoad3d';
import { DigitalVenueMapTooltip } from './DigitalVenueMapTooltip';
import { DigitalVenueMapZoom } from './DigitalVenueMapZoom';
import { DigitalVenueViewThumbnail3D } from './DigitalVenueViewThumbnail3d';

interface VenueLoaderProps {
    className?: string;
}

const DigitalVenueTooltipLayer = () => {
    const { mapContainerId, venueId } = useDigitalVenue();

    return (
        <DigitalVenueMapTooltip
            tooltipElementId={getDigitalVenueTooltipElementId(mapContainerId, venueId)}
        />
    );
};

export default function DigitalVenue({ className }: VenueLoaderProps) {
    const [isViewer3dOpen, setIsViewer3dOpen] = useState(false);
    const [isViewer3dFullscreen, setIsViewer3dFullscreen] = useState(false);

    const { status, viewer3d } = useDigitalVenue();

    useEffect(() => {
        if (!viewer3d) return;

        // iOS Safari does not support the same element fullscreen behavior as desktop
        // browsers. The 3DDV viewer emits these events for its iOS "fake fullscreen"
        // mode, so we promote our own modal wrapper to a fixed viewport layer as well.
        // Without this, the viewer can stay clipped inside the small 2D map container.
        const fullscreenEnabledSubscription = viewer3d.subscribe('fullscreen_enabled', () => {
            setIsViewer3dOpen(true);
            setIsViewer3dFullscreen(true);
        });
        const fullscreenDisabledSubscription = viewer3d.subscribe('fullscreen_disabled', () => {
            setIsViewer3dFullscreen(false);
        });

        return () => {
            fullscreenEnabledSubscription.unsubscribe();
            fullscreenDisabledSubscription.unsubscribe();
        };
    }, [viewer3d]);

    useEffect(() => {
        const previousBodyOverflow = document.body.style.overflow;
        const previousFullscreenState = document.body.dataset.ddvViewerFullscreen;

        document.body.style.overflow = isViewer3dFullscreen ? 'hidden' : '';

        if (isViewer3dFullscreen) {
            document.body.dataset.ddvViewerFullscreen = 'true';
        } else {
            delete document.body.dataset.ddvViewerFullscreen;
        }

        return () => {
            document.body.style.overflow = previousBodyOverflow;

            if (previousFullscreenState) {
                document.body.dataset.ddvViewerFullscreen = previousFullscreenState;
            } else {
                delete document.body.dataset.ddvViewerFullscreen;
            }
        };
    }, [isViewer3dFullscreen]);

    const openViewer3dModal = useCallback(() => {
        setIsViewer3dOpen(true);
    }, []);

    const closeViewer3dModal = useCallback(() => {
        setIsViewer3dFullscreen(false);
        setIsViewer3dOpen(false);
    }, []);

    // Subscribe event CLOSE_MODAL_3D_MAP for closing modal 3D Map
    useEffect(() => {
        const handleCloseModal3DMap = () => closeViewer3dModal();
        window.addEventListener('CLOSE_MODAL_3D_MAP', handleCloseModal3DMap);
        return () => {
            window.removeEventListener('CLOSE_MODAL_3D_MAP', handleCloseModal3DMap);
        };
    }, [closeViewer3dModal]);

    const isViewer3dLoaded = status === 'loaded';

    return (
        <div className={className || 'h-full w-full'}>
            <div className="relative w-full h-[250px] md:h-[clamp(320px,40dvh,560px)] lg:h-[700px] min-h-[250px] md:min-h-[320px] lg:min-h-[700px] overflow-hidden">
                {/* Component for loading 2D Map */}
                <DigitalVenueLoad2D />

                {/* Component for loading Thumbnail for previewing 3D Map */}
                <DigitalVenueViewThumbnail3D openViewer3dModal={openViewer3dModal} />

                {/* Component for loading 3D Map */}
                <DigitalVenueLoad3D
                    isViewer3dLoaded={isViewer3dLoaded}
                    isViewer3dOpen={isViewer3dOpen}
                    isViewer3dFullscreen={isViewer3dFullscreen}
                    closeViewer3dModal={closeViewer3dModal}
                />
            </div>

            <div className="hidden md:block">
                <DigitalVenueMapZoom />
            </div>
            <DigitalVenueTooltipLayer />
        </div>
    );
}
