import { useState } from 'react';
import { loadModule, type Viewer3d } from '@3ddv/dvm';
import { useEffectOnce, useUpdateEffect } from 'react-use';

import { DigitalVenueStatus } from '@/constants/digital-venue-config';

const VIEW_UNAVAILABLE_MESSAGE =
    '3D view is not available for this section.\nPlease try another section.';

interface Use3DViewerLoadParams {
    containerId: string;
    venueId?: string;
    viewId?: string;
}

interface Use3DViewerLoadResult {
    errorMessage: string | null;
    status: DigitalVenueStatus;
    viewer3d: Viewer3d | null;
}

const config3DViewerRendering = (module: Viewer3d) => {
    module.flags.fixed_aspect_ratio = false;
};

export const use3DViewerLoad = ({
    containerId,
    venueId,
    viewId,
}: Use3DViewerLoadParams): Use3DViewerLoadResult => {
    const [viewer3d, setViewer3d] = useState<Viewer3d | null>(null);
    const [status, setStatus] = useState<DigitalVenueStatus>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // containerId and venueId are stable for the mounted DigitalVenueProvider.
    // Initialize the 3D module once
    useEffectOnce(() => {
        let isActive = true;

        setStatus('initializing');
        setErrorMessage(null);

        loadModule('3d_viewer', { container: containerId })
            .then((module) => {
                if (!isActive) {
                    module.close();
                    return;
                }

                config3DViewerRendering(module);
                setViewer3d(module);
                setStatus('ready');
            })
            .catch((error) => {
                if (!isActive) return;

                setStatus('error');
                setErrorMessage(
                    error instanceof Error ? error.message : 'Unable to initialize 3D venue viewer.'
                );
                console.log('DIGITAL_VENUE_3D_VIEWER_LOADED_ERROR', error);
            });

        return () => {
            isActive = false;
            setViewer3d((currentViewer) => {
                currentViewer?.close();
                return null;
            });
        };
    });

    // Load a new 3D view only after the viewer is ready or the selected section changes.
    useUpdateEffect(() => {
        if (!viewer3d) return;

        if (!venueId || !viewId) {
            setStatus('ready');
            setErrorMessage(null);
            return;
        }

        let isActive = true;

        setStatus('loading-view');
        setErrorMessage(null);
        viewer3d.reset();

        const viewOptions = {
            venue_id: venueId,
            view_id: viewId,
        };

        viewer3d
            .has3dView(viewOptions)
            .then((has3dView) => {
                if (!isActive) return;

                if (!has3dView) {
                    setStatus('unavailable');
                    setErrorMessage(VIEW_UNAVAILABLE_MESSAGE);
                    return;
                }

                return viewer3d.loadView3d(viewOptions);
            })
            .then((loadResult) => {
                if (!isActive || !loadResult) return;

                // console.log('DIGITAL_VENUE_3D_VIEWER_LOADED_loadView3d', venueId);
                setStatus('loaded');
            })
            .catch((error) => {
                if (!isActive) return;

                setStatus('error');
                setErrorMessage(
                    error instanceof Error ? error.message : 'Unable to load 3D venue view.'
                );
                console.error('DIGITAL_VENUE_3D_VIEWER_ERROR___loadView3d', venueId, error);
            });

        return () => {
            isActive = false;
        };
    }, [viewId, viewer3d]);

    return {
        errorMessage,
        status,
        viewer3d,
    };
};
