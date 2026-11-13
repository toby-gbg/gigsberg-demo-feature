import { ComponentProps } from 'react';
import { Loader2Icon } from 'lucide-react';

import { cn } from '@/lib/cn';

export const Spinner = ({ className, ...props }: ComponentProps<'svg'>) => {
    return (
        <Loader2Icon
            data-slot="spinner"
            role="status"
            aria-label="Loading"
            className={cn('size-9 animate-spin', className)}
            {...props}
        />
    );
};
