'use client';

import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group';

import { cn } from '@/lib/cn';

export type RadioGroupProps = RadioGroupPrimitive.Props;

export const RadioGroup = ({ className, ...props }: RadioGroupProps) => {
    return (
        <RadioGroupPrimitive
            data-slot="radio-group"
            className={cn('grid w-full gap-3', className)}
            {...props}
        />
    );
};
