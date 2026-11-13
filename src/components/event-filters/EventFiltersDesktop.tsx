import { ClassValue } from 'clsx';

import { cn } from '@/lib/cn';

import { EventFiltersForm, type EventFiltersFormProps } from './EventFiltersForm';

type EventFiltersDesktopProps = EventFiltersFormProps & {
    className?: ClassValue;
};

export const EventFiltersDesktop = ({ className, ...props }: EventFiltersDesktopProps) => (
    <div className={cn('hidden md:block', className)}>
        <EventFiltersForm {...props} />
    </div>
);
