import type { ComponentProps } from 'react';

import { cn } from '@/lib/cn';

export const Card = ({ className, ...props }: ComponentProps<'div'>) => {
    return (
        <div
            data-slot="card"
            className={cn(
                'relative flex flex-col gap-3 overflow-visible rounded-[min(32px,var(--radius-3xl))] bg-surface p-4 text-sm shadow-lg',
                className
            )}
            {...props}
        />
    );
};

export const CardHeader = ({ className, ...props }: ComponentProps<'div'>) => {
    return (
        <div
            data-slot="card-header"
            className={cn(
                'grid auto-rows-min items-start gap-1 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto]',
                className
            )}
            {...props}
        />
    );
};

export const CardTitle = ({ className, ...props }: ComponentProps<'h3'>) => {
    return (
        <h3
            data-slot="card-title"
            className={cn('text-sm leading-6 font-medium', className)}
            {...props}
        />
    );
};

export const CardDescription = ({ className, ...props }: ComponentProps<'p'>) => {
    return (
        <p data-slot="card-description" className={cn('text-sm leading-5', className)} {...props} />
    );
};

export const CardAction = ({ className, ...props }: ComponentProps<'div'>) => {
    return (
        <div
            data-slot="card-action"
            className={cn(
                'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
                className
            )}
            {...props}
        />
    );
};

export const CardContent = ({ className, ...props }: ComponentProps<'div'>) => {
    return (
        <div
            data-slot="card-content"
            className={cn('flex flex-1 flex-col gap-1', className)}
            {...props}
        />
    );
};

export const CardFooter = ({ className, ...props }: ComponentProps<'div'>) => {
    return (
        <div
            data-slot="card-footer"
            className={cn('flex flex-row items-center', className)}
            {...props}
        />
    );
};
