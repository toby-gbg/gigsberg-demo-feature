import { ComponentProps } from 'react';

import { cn } from '@/lib/cn';

export const CarouselItem = ({ className, ...props }: ComponentProps<'div'>) => {
    return (
        <div
            className={cn(
                // Need this for ensure all cards have same height
                '*:flex *:flex-1',
                'flex shrink-0 flex-col',
                'lg:w-70 w-55',
                className
            )}
            {...props}
        />
    );
};
