'use client';

import type { ReactNode } from 'react';
import { Switch as SwitchPrimitive } from '@base-ui/react/switch';

import { cn } from '@/lib/cn';

export interface SwitchProps extends SwitchPrimitive.Root.Props {
    children?: ReactNode;
    classNames?: {
        base?: string;
        control?: string;
        thumb?: string;
        content?: string;
    };
}

export const Switch = ({ children, classNames, disabled, ...props }: SwitchProps) => {
    return (
        <label
            className={cn(
                'text-body-s inline-flex items-center gap-2',
                disabled ? 'cursor-not-allowed' : 'cursor-pointer',
                classNames?.base
            )}
        >
            <SwitchPrimitive.Root
                {...props}
                disabled={disabled}
                className={cn(
                    'group/switch inline-flex h-7 w-12 shrink-0 items-center rounded-full p-1',
                    'bg-foreground-200',
                    'transition-colors outline-none',

                    // checked
                    'data-checked:bg-main-end',

                    // disabled
                    'data-disabled:cursor-not-allowed',
                    'data-disabled:opacity-50',

                    classNames?.control
                )}
            >
                <SwitchPrimitive.Thumb
                    className={cn(
                        'block size-5 shrink-0 rounded-full bg-white',
                        'translate-x-0',
                        'transition-transform duration-100',

                        // 48px track - 8px padding - 20px thumb = 20px
                        'ltr:group-data-checked/switch:translate-x-5',
                        'rtl:group-data-checked/switch:-translate-x-5',

                        classNames?.thumb
                    )}
                />
            </SwitchPrimitive.Root>

            {children && <span className={cn('leading-5', classNames?.content)}>{children}</span>}
        </label>
    );
};
