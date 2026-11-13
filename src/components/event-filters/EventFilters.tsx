'use client';

import { ClassValue } from 'clsx';

import { EventFiltersDesktop } from './EventFiltersDesktop';
import type { EventFiltersFormProps } from './EventFiltersForm';
import { EventFiltersMobile } from './EventFiltersMobile';

export type EventFiltersProps = EventFiltersFormProps & {
    desktopClassName?: ClassValue;
    mobileClassName?: ClassValue;
};

export const EventFilters = ({
    desktopClassName,
    mobileClassName,
    ...props
}: EventFiltersProps) => {
    return (
        <>
            <EventFiltersDesktop {...props} className={desktopClassName} />
            <EventFiltersMobile {...props} className={mobileClassName} />
        </>
    );
};

export default EventFilters;
