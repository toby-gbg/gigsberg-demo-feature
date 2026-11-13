import { useState } from 'react';
import { loadModule, type MapViewer } from '@3ddv/dvm';
import { useEffectOnce } from 'react-use';

export type DigitalVenueMapViewerMapId = 'main' | 'blockmap2d';

interface UseMapViewerLoadedParams {
    containerId: string;
    venueId?: string;
    mapId?: DigitalVenueMapViewerMapId;
}

interface UseMapViewerLoadedResult {
    error: Error | null;
    isLoading: boolean;
    mapViewer: MapViewer | null;
}

const configureMapViewerRendering = (module: MapViewer) => {
    module.flags.fixed_aspect_ratio = false;
    module.flags.automatic_pixel_ratio = false;
    module.flags.automatic_hover = false;
    module.pixel_ratio = 2;
};

const syncMapViewerContainerSize = (module: MapViewer, containerId: string) => {
    const container = document.getElementById(containerId);

    if (!(container instanceof HTMLDivElement)) return;

    const { clientHeight, clientWidth } = container;

    if (clientHeight > 0 && clientWidth > 0) {
        module.aspect_ratio = clientHeight / clientWidth;
    }

    configureMapViewerRendering(module);
    module.setContainer(container);
};

const fitMapViewerToSections = (module: MapViewer) => {
    const sectionNodes = module.getNodesByType('section');

    if (!sectionNodes) return;

    requestAnimationFrame(() => {
        void module.goTo(sectionNodes, undefined, 0);
    });
};

export const useMapViewerLoaded = ({
    containerId,
    venueId,
    mapId = 'blockmap2d', // "blockmap2d" for display 2D MAP without number on section and "main" for display 2D MAP with number on section
}: UseMapViewerLoadedParams): UseMapViewerLoadedResult => {
    const [mapViewer, setMapViewer] = useState<MapViewer | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    // This effect only run once with venueId passed in ListingSeatmapPanel component
    useEffectOnce(() => {
        if (!venueId) {
            setMapViewer(null);
            setIsLoading(false);
            setError(null);
            return;
        }

        let isMounted = true;
        let resizeObserver: ResizeObserver | null = null;

        setIsLoading(true);
        setError(null);
        setMapViewer(null);

        loadModule('map_viewer', {
            container: containerId,
        })
            .then((module) => {
                if (!isMounted) {
                    module.close();
                    return null;
                }

                configureMapViewerRendering(module);

                return module
                    .loadMap({
                        venue_id: venueId,
                        map_id: mapId,
                    })
                    .then(() => {
                        syncMapViewerContainerSize(module, containerId);
                        fitMapViewerToSections(module);

                        const container = document.getElementById(containerId);
                        if (container) {
                            resizeObserver = new ResizeObserver(() => {
                                syncMapViewerContainerSize(module, containerId);
                                fitMapViewerToSections(module);
                            });
                            resizeObserver.observe(container);
                        }
                        setMapViewer(module);

                        return module;
                    });
            })
            .then((module) => {
                if (!isMounted || !module) return;
                setIsLoading(false);
            })
            .catch((caughtError) => {
                if (!isMounted) return;

                setMapViewer(null);
                setIsLoading(false);
                setError(
                    caughtError instanceof Error
                        ? caughtError
                        : new Error('Unable to load 3DDV map viewer nodes.')
                );
                console.error('DDV_MAP_VIEWER_LOADED_ERROR', caughtError);
            });

        return () => {
            isMounted = false;
            resizeObserver?.disconnect();
            setMapViewer((currentViewer) => {
                currentViewer?.close();
                return null;
            });
        };
    });

    return {
        error,
        isLoading,
        mapViewer,
    };
};
