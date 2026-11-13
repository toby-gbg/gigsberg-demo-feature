'use client';

import * as React from 'react';
import { Popover as PopoverPrimitive } from '@base-ui/react/popover';
import { X } from 'lucide-react';

import { cn } from '@/lib/cn';

function Popover({ children, ...props }: PopoverPrimitive.Root.Props) {
    return (
        <PopoverPrimitive.Root data-slot="popover" {...props}>
            {typeof children === 'function' ? (
                (args) => <div className="group/popover relative">{children(args)}</div>
            ) : (
                <div className="group/popover relative">{children}</div>
            )}
        </PopoverPrimitive.Root>
    );
}

function PopoverTrigger({ className, ...props }: PopoverPrimitive.Trigger.Props) {
    return (
        <PopoverPrimitive.Trigger
            data-slot="popover-trigger"
            className={cn(
                'min-h-9 h-10 group-has-data-[slot=popover-label]/popover:h-13.5 transition-all text-start text-sm text-black bg-white px-3 w-full cursor-pointer rounded-lg hover:bg-zinc-50 shadow-field',
                /* === FOCUS === */
                'focus-visible:ring-2 focus-visible:border-none focus-visible:ring-ring/50 focus-visible:outline-none',
                className
            )}
            {...props}
        />
    );
}

function PopoverLabel({
    className,
    children,
    error,
    hasValue,
    isRequired,
    ...props
}: React.ComponentProps<'label'> & {
    error?: unknown;
    hasValue?: boolean;
    isRequired?: boolean;
}) {
    return (
        <label
            aria-invalid={Boolean(error)}
            data-has-value={Boolean(hasValue)}
            data-slot="popover-label"
            className={cn(
                'pointer-events-none absolute inset-s-3 z-10 text-default-600',
                'aria-invalid:text-danger',
                'data-[has-value=true]:top-1 data-[has-value=true]:text-xs',
                'data-[has-value=false]:top-1/2 data-[has-value=false]:text-sm data-[has-value=false]:-translate-y-1/2',
                className
            )}
            {...props}
        >
            {children}
            {isRequired && <span className="ms-0.5 text-danger">*</span>}
        </label>
    );
}

function PopoverValue({
    className,
    children,
    hasValue,
    hasClearTrigger,
    placeholder,
    ...props
}: React.ComponentProps<'div'> & {
    hasValue?: boolean;
    hasClearTrigger?: boolean;
    placeholder?: string;
}) {
    return (
        <div
            data-slot="popover-value"
            className={cn(
                'flex items-center',
                hasValue || placeholder ? 'pt-5 pb-1' : 'h-full',
                className
            )}
            {...props}
        >
            {hasValue ? (
                <span
                    className={cn(
                        'min-w-0 flex-1 truncate text-left',
                        hasClearTrigger ? 'mr-12' : 'mr-6'
                    )}
                >
                    {children}
                </span>
            ) : (
                placeholder && (
                    <span className="min-w-0 flex-1 truncate text-left text-default-400 mr-6">
                        {placeholder}
                    </span>
                )
            )}
        </div>
    );
}

function PopoverGroupIcon({
    className,
    hasValue,
    ...props
}: React.ComponentProps<'div'> & {
    hasValue?: boolean;
}) {
    return (
        <div
            data-slot="popover-group-icon"
            className={cn(
                'pointer-events-none absolute inset-0 flex items-center justify-end gap-2 px-3 transition-all',
                hasValue && 'pt-5 pb-1',
                className
            )}
            {...props}
        />
    );
}

function PopoverClearTrigger({ className, children, ...props }: React.ComponentProps<'button'>) {
    return (
        <button
            type="button"
            className={cn(
                'absolute right-8 top-1/2 z-10 flex size-4 [&_svg:not([class*=size-])]:size-4 -translate-y-1/2 items-center justify-center rounded-full text-neutral-400 transition-colors outline-none hover:text-neutral-700 focus-visible:text-neutral-700 disabled:pointer-events-none disabled:opacity-50',
                className
            )}
            aria-label="Clear date"
            {...props}
        >
            {children ?? <X />}
        </button>
    );
}

function PopoverContent({
    className,
    align = 'start',
    alignOffset = 0,
    side = 'bottom',
    sideOffset = 12,
    ...props
}: PopoverPrimitive.Popup.Props &
    Pick<PopoverPrimitive.Positioner.Props, 'align' | 'alignOffset' | 'side' | 'sideOffset'>) {
    return (
        <PopoverPrimitive.Portal>
            <PopoverPrimitive.Positioner
                align={align}
                alignOffset={alignOffset}
                side={side}
                sideOffset={sideOffset}
                className="isolate z-100000"
            >
                <PopoverPrimitive.Popup
                    data-slot="popover-content"
                    className={cn(
                        'z-10000 flex w-72 origin-(--transform-origin) flex-col gap-4 rounded-lg bg-popover p-4 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
                        className
                    )}
                    {...props}
                />
            </PopoverPrimitive.Positioner>
        </PopoverPrimitive.Portal>
    );
}

function PopoverHeader({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="popover-header"
            className={cn('flex flex-col gap-1 text-sm', className)}
            {...props}
        />
    );
}

function PopoverTitle({ className, ...props }: PopoverPrimitive.Title.Props) {
    return (
        <PopoverPrimitive.Title
            data-slot="popover-title"
            className={cn('font-medium', className)}
            {...props}
        />
    );
}

function PopoverDescription({ className, ...props }: PopoverPrimitive.Description.Props) {
    return (
        <PopoverPrimitive.Description
            data-slot="popover-description"
            className={cn('text-muted-foreground', className)}
            {...props}
        />
    );
}

export {
    Popover,
    PopoverClearTrigger,
    PopoverContent,
    PopoverDescription,
    PopoverGroupIcon,
    PopoverHeader,
    PopoverLabel,
    PopoverTitle,
    PopoverTrigger,
    PopoverValue,
};
