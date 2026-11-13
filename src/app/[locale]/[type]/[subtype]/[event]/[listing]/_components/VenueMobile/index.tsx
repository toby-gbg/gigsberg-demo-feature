'use client';

import { FC } from 'react';

import { TicketListFiltersProps } from '../TicketListFilters';
import VenueMobileMapFilters from './VenueMobileMapFilters';

const VenueMobile: FC<Omit<TicketListFiltersProps, 'mode'>> = (props) => {
    return (
        <div
            data-ddv-hide-during-fullscreen // When fullscreen in 3D Map of Digita Venue is enable ==> Css will take this dataset to set display: none
            data-mobile-bottom-control
            className="flex flex-col gap-y-2 fixed md:hidden bottom-4 left-4 z-300"
        >
            <VenueMobileMapFilters {...props} />
        </div>
    );
};

export default VenueMobile;
