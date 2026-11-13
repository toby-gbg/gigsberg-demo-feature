'use client';

import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox';
import { CheckIcon, MinusIcon } from 'lucide-react';

import { cn } from '@/lib/cn';

export type CheckboxProps = CheckboxPrimitive.Root.Props;

export const Checkbox = ({ className, ...props }: CheckboxProps) => {
    return (
        <CheckboxPrimitive.Root
            data-slot="checkbox"
            className={cn(
                // Base
                'peer relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-foreground-200 shadow-xs transition-shadow outline-none',
                'after:absolute after:-inset-x-3 after:-inset-y-2',

                // Checked
                'data-checked:border-main-end data-checked:bg-main-end data-checked:text-on-main',

                // Focus
                'focus-visible:border-main-end focus-visible:ring-0.5 focus-visible:ring-main-end/50',

                // Disabled
                'disabled:cursor-not-allowed! disabled:opacity-50 group-has-disabled/field:opacity-50',

                // Invalid
                'aria-invalid:border-danger aria-invalid:ring-0.5 aria-invalid:ring-danger aria-invalid:aria-checked:border-main-end',

                className
            )}
            {...props}
        >
            <CheckboxPrimitive.Indicator
                data-slot="checkbox-indicator"
                className="grid place-content-center text-current transition-none [&>svg]:size-3.5"
                render={(indicatorProps, { indeterminate }) => (
                    <span {...indicatorProps}>{indeterminate ? <MinusIcon /> : <CheckIcon />}</span>
                )}
            />
        </CheckboxPrimitive.Root>
    );
};
