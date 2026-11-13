'use client';

import type { ReactNode } from 'react';
import {
    Toast as ToastPrimitive,
    type ToastManager,
    type ToastManagerAddOptions,
} from '@base-ui/react/toast';
import {
    CircleCheckIcon,
    InfoIcon,
    Loader2Icon,
    OctagonXIcon,
    TriangleAlertIcon,
    XIcon,
} from 'lucide-react';

import { cn } from '@/lib/cn';

import { Button } from '../Button';

type ToastType = 'success' | 'info' | 'warning' | 'error' | 'loading';
type ToastPosition =
    'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
type ToastOptions<Data extends object = Record<string, never>> = Omit<
    ToastManagerAddOptions<Data>,
    'type'
> & {
    type?: ToastType;
};
type TypedToastManager = Omit<ToastManager, 'add'> & {
    add: <Data extends object = Record<string, never>>(options: ToastOptions<Data>) => string;
};

const toastIconColorClasses: Record<ToastType, string> = {
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-error',
    loading: 'text-solid',
    info: 'text-info',
};

const toastManager = ToastPrimitive.createToastManager();
const toast = toastManager as TypedToastManager;

const ToastProvider = (props: ToastPrimitive.Provider.Props) => (
    <ToastPrimitive.Provider {...props} />
);

const ToastPortal = (props: ToastPrimitive.Portal.Props) => (
    <ToastPrimitive.Portal data-slot="toast-portal" {...props} />
);

const viewportPositionClasses: Record<ToastPosition, string> = {
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'right-4 bottom-4',
};

type ToastViewportProps = ToastPrimitive.Viewport.Props & { position?: ToastPosition };

const ToastViewport = ({ className, position = 'top-center', ...props }: ToastViewportProps) => (
    <ToastPrimitive.Viewport
        data-slot="toast-viewport"
        className={cn(
            'group/toast-viewport pointer-events-none fixed z-1000001 w-[calc(100%-2rem)] max-w-sm outline-none',
            viewportPositionClasses[position],
            className
        )}
        {...props}
    />
);

type ToastProps = ToastPrimitive.Root.Props & { position?: ToastPosition };

const Toast = ({ className, position = 'top-center', ...props }: ToastProps) => {
    const isTop = position.startsWith('top');

    return (
        <ToastPrimitive.Root
            data-slot="toast"
            swipeDirection={['up', 'right']}
            data-position={position}
            className={cn(
                'group/toast pointer-events-auto absolute inset-x-0 z-[calc(1000-var(--toast-index))] w-full rounded-md border border-gray-300 bg-white text-popover-foreground shadow-lg will-change-transform outline-none select-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
                '[--gap:0.75rem] [--height:var(--toast-frontmost-height,var(--toast-height))] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))]',
                'h-(--height) [transition:transform_500ms_cubic-bezier(0.22,1,0.36,1),opacity_500ms,height_150ms]',
                'data-expanded:h-(--toast-height) data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]',
                'data-limited:opacity-0',
                'data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]',
                'data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]',
                'data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+100vw))_translateY(var(--offset-y))]',
                'data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]',
                'data-expanded:data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]',
                'data-expanded:data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]',
                'data-expanded:data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+100vw))_translateY(var(--offset-y))]',
                'data-expanded:data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]',
                isTop
                    ? "top-0 origin-top [--offset-y:calc(var(--toast-offset-y)+calc(var(--toast-index)*var(--gap))+var(--toast-swipe-movement-y))] [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)+(var(--toast-index)*var(--peek))+(var(--shrink)*var(--height))))_scale(var(--scale))] after:absolute after:bottom-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-[''] data-starting-style:[transform:translateY(-150%)] [&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(-150%)]"
                    : "bottom-0 origin-bottom [--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))] [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))] after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-[''] data-starting-style:[transform:translateY(150%)] [&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(150%)]",
                className
            )}
            {...props}
        />
    );
};
const ToastContent = ({ className, ...props }: ToastPrimitive.Content.Props) => (
    <ToastPrimitive.Content
        data-slot="toast-content"
        className={cn('flex h-full min-h-14 items-center gap-3 overflow-hidden p-4', className)}
        {...props}
    />
);

const ToastTitle = ({ className, ...props }: ToastPrimitive.Title.Props) => (
    <ToastPrimitive.Title
        data-slot="toast-title"
        className={cn('text-sm font-medium', className)}
        {...props}
    />
);

const ToastDescription = ({ className, ...props }: ToastPrimitive.Description.Props) => (
    <ToastPrimitive.Description
        data-slot="toast-description"
        className={cn('text-sm text-muted-foreground', className)}
        {...props}
    />
);

const ToastAction = ({
    className,
    render = <Button variant="outline" />,
    ...props
}: ToastPrimitive.Action.Props) => (
    <ToastPrimitive.Action
        data-slot="toast-action"
        render={render}
        className={cn('shrink-0', className)}
        {...props}
    />
);

const ToastClose = ({ className, children, ...props }: ToastPrimitive.Close.Props) => {
    const icon = children ?? <XIcon aria-hidden="true" className="size-4" />;

    return (
        <ToastPrimitive.Close
            data-slot="toast-close"
            aria-label="Close toast"
            className={cn(
                "relative shrink-0 text-muted-foreground after:absolute after:-inset-2 after:content-[''] hover:text-foreground",
                className
            )}
            {...props}
        >
            {icon}
        </ToastPrimitive.Close>
    );
};

const ToastIcon = ({ type }: { type: ToastType | undefined }) => {
    let icon: ReactNode = null;

    if (type === 'success') {
        icon = <CircleCheckIcon aria-hidden="true" />;
    }

    if (type === 'info') {
        icon = <InfoIcon aria-hidden="true" />;
    }

    if (type === 'warning') {
        icon = <TriangleAlertIcon aria-hidden="true" />;
    }

    if (type === 'error') {
        icon = <OctagonXIcon aria-hidden="true" />;
    }

    if (type === 'loading') {
        icon = <Loader2Icon className="animate-spin" aria-hidden="true" />;
    }

    if (!type || !icon) {
        return null;
    }

    return (
        <span
            data-slot="toast-icon"
            className={cn(
                "shrink-0 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
                toastIconColorClasses[type]
            )}
        >
            {icon}
        </span>
    );
};

const ToastList = ({ className, position }: { className?: string; position: ToastPosition }) => {
    const { toasts } = ToastPrimitive.useToastManager();

    return toasts.map((toastItem) => (
        <Toast key={toastItem.id} toast={toastItem} className={className} position={position}>
            <ToastContent>
                <ToastIcon type={toastItem.type as ToastType | undefined} />
                <div className="flex min-w-0 flex-1 flex-col wrap-anywhere pe-1">
                    <ToastTitle />
                    <ToastDescription />
                </div>
                <ToastAction />
                <ToastClose />
            </ToastContent>
        </Toast>
    ));
};

type ToasterProps = ToastPrimitive.Provider.Props & {
    className?: string;
    position?: ToastPosition;
};

const Toaster = ({
    className,
    children,
    position = 'top-center',
    toastManager: manager = toastManager,
    timeout = 5000,
    ...props
}: ToasterProps) => {
    return (
        <ToastProvider toastManager={manager} timeout={timeout} {...props}>
            {children}
            <ToastPortal>
                <ToastViewport position={position}>
                    <ToastList className={className} position={position} />
                </ToastViewport>
            </ToastPortal>
        </ToastProvider>
    );
};

const createToastManager = ToastPrimitive.createToastManager;
const useToastManager = ToastPrimitive.useToastManager;

export {
    Toaster,
    Toast,
    ToastAction,
    ToastClose,
    ToastContent,
    ToastDescription,
    ToastPortal,
    ToastProvider,
    ToastTitle,
    ToastViewport,
    createToastManager,
    toast,
    useToastManager,
};
export type { ToastOptions, ToastPosition, ToastType };
