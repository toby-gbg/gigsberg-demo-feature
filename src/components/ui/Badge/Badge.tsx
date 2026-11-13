'use client';

import type { CSSProperties, ReactNode } from 'react';
import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/cn';

export type BadgeSize = number | string;

const badgeVariants = cva(
    [
        'group/badge inline-flex w-fit shrink-0 items-center justify-start',
        'overflow-hidden rounded-full border px-2 py-1',
        'text-micro font-normal whitespace-nowrap',
        'transition-all',
        '[&>svg]:pointer-events-none',
        '[&>svg]:size-(--badge-icon-size)!',
        '[&>svg]:shrink-0',
        '[&>svg]:stroke-[1.5]',
    ],
    {
        variants: {
            variant: {
                default: 'border-primary-600 bg-primary-600 text-neutral-50',
                secondary: 'border-neutral-200 bg-neutral-200 text-neutral-900',
                destructive: 'border-error-state-default bg-error-state-default text-neutral-50',
                outline: 'border-neutral-400 text-neutral-900',
                ghost: 'border-transparent text-neutral-900 hover:bg-neutral-100-surf',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

export interface BadgeProps
    extends
        Omit<useRender.ComponentProps<'span'>, 'children' | 'className' | 'style'>,
        VariantProps<typeof badgeVariants> {
    children: ReactNode;
    size?: BadgeSize;
    classNames?: {
        base?: string;
        content?: string;
    };
    icon?: ReactNode;
    iconSize?: BadgeSize;
    showIcon?: boolean;
    style?: CSSProperties;
}

const toCssSize = (size: BadgeSize) => (typeof size === 'number' ? `${size}px` : size);

export const Badge = ({
    children,
    classNames,
    icon,
    iconSize = 14,
    showIcon = true,
    size = 22,
    style,
    variant = 'default',
    render,
    ...props
}: BadgeProps) => {
    const badgeStyle = {
        ...style,
        '--badge-height': toCssSize(size),
        '--badge-icon-size': toCssSize(iconSize),
    } as CSSProperties;

    return useRender({
        defaultTagName: 'span',
        props: mergeProps<'span'>(
            {
                className: cn(
                    badgeVariants({ variant }),
                    'h-(--badge-height) min-h-(--badge-height) min-w-0 gap-1',
                    classNames?.base
                ),
                style: badgeStyle,
                children: (
                    <>
                        {showIcon && icon}

                        <span className={cn('text-micro block min-w-0 px-0', classNames?.content)}>
                            {children}
                        </span>
                    </>
                ),
            },
            props
        ),
        render,
        state: {
            slot: 'badge',
            variant,
        },
    });
};

Badge.displayName = 'Badge';

export { badgeVariants };
