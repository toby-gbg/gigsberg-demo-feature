import type { ReactNode } from 'react';
import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/cn';

import { Spinner } from '@/components/ui/Spinner';

export const buttonVariants = cva(
    [
        'inline-flex h-10 shrink-0 items-center justify-center gap-2 overflow-hidden rounded-md p-3 text-base font-medium whitespace-nowrap transition-colors outline-none',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-2',
        'disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50',
        '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
        'has-[>[data-icon=inline-start]]:ps-3 has-[>[data-icon=inline-end]]:pe-3',
    ],
    {
        variants: {
            variant: {
                default: 'bg-gradient text-white bringhtness-110 transition-all *:text-white',
                outline:
                    'border border-border bg-transparent text-text-primary hover:bg-bg-subtle hover:text-solid',
                secondary: 'bg-surface-muted text-solid hover:bg-neutral-300',
                ghost: 'text-text-primary hover:bg-transparent hover:text-solid',
                destructive:
                    'bg-red-800 text-white hover:bg-red-800/90 focus-visible:ring-red-800/20',
                link: 'text-primary underline-offset-4 hover:underline',
            },
            isIconOnly: {
                true: 'size-10 ps-0! pe-0!',
            },
        },
        defaultVariants: {
            variant: 'default',
            isIconOnly: false,
        },
    }
);

type ButtonProps = ButtonPrimitive.Props &
    VariantProps<typeof buttonVariants> & {
        prefixIcon?: ReactNode;
        suffixIcon?: ReactNode;
        isLoading?: boolean;
    };

export const Button = ({
    children,
    className,
    suffixIcon,
    isIconOnly,
    prefixIcon,
    variant = 'default',
    isLoading = false,
    ...props
}: ButtonProps) => {
    return (
        <ButtonPrimitive
            data-slot="button"
            className={cn(buttonVariants({ isIconOnly, variant, className }))}
            {...props}
        >
            {isLoading && (
                <span data-icon="inline-start" className="contents">
                    <Spinner className="text-white size-5" />
                </span>
            )}
            {prefixIcon && (
                <span data-icon="inline-start" className="contents">
                    {prefixIcon}
                </span>
            )}
            {!isIconOnly && children ? children : null}
            {!isIconOnly && suffixIcon && (
                <span data-icon="inline-end" className="contents">
                    {suffixIcon}
                </span>
            )}
        </ButtonPrimitive>
    );
};

Button.displayName = 'Button';
