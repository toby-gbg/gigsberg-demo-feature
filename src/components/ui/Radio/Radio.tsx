'use client';

import { Radio as RadioPrimitive } from '@base-ui/react/radio';

import { cn } from '@/lib/cn';

export type RadioProps = RadioPrimitive.Root.Props;

export const Radio = ({ className, ...props }: RadioProps) => {
    return (
        <RadioPrimitive.Root
            data-slot="radio"
            className={cn(
                // Base
                'peer relative flex aspect-square size-4 shrink-0 rounded-full border border-foreground-200 outline-none',
                'after:absolute after:-inset-x-3 after:-inset-y-2',

                // Checked
                'data-checked:border-solid data-checked:bg-solid data-checked:text-on-main',

                // Focus
                'focus-visible:border-solid focus-visible:ring-0.5 focus-visible:ring-solid/50',

                // Disabled
                'disabled:cursor-not-allowed! disabled:opacity-50 group-has-disabled/field:opacity-50',

                // Invalid
                'aria-invalid:border-danger aria-invalid:ring-0.5 aria-invalid:ring-danger aria-invalid:aria-checked:border-main-end',

                className
            )}
            {...props}
        >
            <RadioPrimitive.Indicator
                data-slot="radio-indicator"
                className="absolute inset-0 flex items-center justify-center"
            >
                <span className="size-2 rounded-full bg-white" />
            </RadioPrimitive.Indicator>
        </RadioPrimitive.Root>
    );
};
