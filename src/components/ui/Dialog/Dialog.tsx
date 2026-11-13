'use client';

import * as React from 'react';
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { XIcon } from 'lucide-react';

import { cn } from '@/lib/cn';

function Dialog({ ...props }: DialogPrimitive.Root.Props) {
    return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
    return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
    return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
    return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({ className, ...props }: DialogPrimitive.Backdrop.Props) {
    return (
        <DialogPrimitive.Backdrop
            data-slot="dialog-overlay"
            className={cn(
                'fixed inset-0 isolate z-1000 bg-black/10 duration-300 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0',
                className
            )}
            {...props}
        />
    );
}

type DialogContentProps = {
    children?: React.ReactNode;
    showCloseButton?: boolean;
    iconCloseButton?: React.ReactNode;
    classNames?: {
        portal?: string;
        overlay?: string;
        popup?: string;
        closeButton?: string;
    };
    portalProps?: Omit<DialogPrimitive.Portal.Props, 'className'>;
    overlayProps?: Omit<DialogPrimitive.Backdrop.Props, 'className'>;
    popupProps?: Omit<DialogPrimitive.Popup.Props, 'className'>;
    closeButtonProps?: Omit<DialogPrimitive.Close.Props, 'className'>;
};

function DialogContent({
    children,
    classNames,
    closeButtonProps,
    iconCloseButton,
    overlayProps,
    popupProps,
    portalProps,
    showCloseButton = true,
}: DialogContentProps) {
    return (
        <DialogPortal {...portalProps} className={classNames?.portal}>
            <DialogOverlay {...overlayProps} className={classNames?.overlay} />
            <DialogPrimitive.Popup
                {...popupProps}
                initialFocus={false}
                data-slot="dialog-content"
                className={cn(
                    'fixed top-1/2 left-1/2 z-1000 w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-y-visible rounded-lg bg-white p-4 text-sm text-neutral-900 shadow outline-none duration-300 sm:w-[calc(100%-3rem)] md:w-[calc(100%-4rem)] data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0',
                    classNames?.popup
                )}
            >
                {children}
                {showCloseButton && (
                    <DialogPrimitive.Close
                        {...closeButtonProps}
                        data-slot="dialog-close"
                        className={cn(
                            'bg-gradient text-on-main absolute top-4 right-4 z-10 inline-flex size-8 items-center justify-center rounded-full outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 [&_svg]:size-5',
                            classNames?.closeButton
                        )}
                    >
                        {iconCloseButton ?? <XIcon />}
                        <span className="sr-only">Close</span>
                    </DialogPrimitive.Close>
                )}
            </DialogPrimitive.Popup>
        </DialogPortal>
    );
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="dialog-header"
            className={cn('flex flex-col gap-2', className)}
            {...props}
        />
    );
}

function DialogBody({ className, ...props }: React.ComponentProps<'div'>) {
    return <div data-slot="dialog-body" className={cn('pt-2', className)} {...props} />;
}

function DialogFooter({ className, children, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="dialog-footer"
            className={cn('mt-4 flex items-center justify-end gap-2', className)}
            {...props}
        >
            {children}
        </div>
    );
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
    return (
        <DialogPrimitive.Title
            data-slot="dialog-title"
            className={cn('pr-8 text-xl font-semibold text-black', className)}
            {...props}
        />
    );
}

function DialogDescription({ className, ...props }: DialogPrimitive.Description.Props) {
    return (
        <DialogPrimitive.Description
            data-slot="dialog-description"
            className={cn('text-[#636367]', className)}
            {...props}
        />
    );
}

export {
    Dialog,
    DialogBody,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogOverlay,
    DialogPortal,
    DialogTitle,
    DialogTrigger,
};
