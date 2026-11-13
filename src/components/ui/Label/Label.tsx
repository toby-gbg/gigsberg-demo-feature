'use client';

import { ComponentProps } from 'react';

import { cn } from '@/lib/cn';

export const Label = ({ className, ...props }: ComponentProps<'label'>) => (
    <label
        data-slot="label"
        className={cn(
            'text-sm group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
            className
        )}
        {...props}
    />
);
