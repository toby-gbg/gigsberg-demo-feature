import React from 'react';
import { useTranslations } from 'next-intl';

import { useDigitalVenue } from '@/providers/DigitalVenueProvider';

export const DigitalVenueLoad2D = () => {
    const t = useTranslations();
    const { mapContainerId, mapViewer } = useDigitalVenue();
    return (
        <React.Fragment>
            <div id={mapContainerId} className="w-full h-full overflow-hidden" />
            {!mapViewer && (
                <div className="absolute inset-0 flex justify-center items-center text-default-500 text-sm">
                    {t('loading_ddv_map')}
                </div>
            )}
        </React.Fragment>
    );
};
