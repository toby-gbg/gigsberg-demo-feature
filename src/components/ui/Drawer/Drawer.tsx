'use client';

import {
    createContext,
    useContext,
    useMemo,
    useSyncExternalStore,
    type ComponentProps,
} from 'react';
import { Drawer as DrawerPrimitive } from '@base-ui/react/drawer';
import type { ClassValue } from 'clsx';

import { cn } from '@/lib/cn';

type DrawerContentClassNames = {
    viewport?: ClassValue;
    popup?: ClassValue;
    content?: ClassValue;
};

type DrawerContextProps = {
    hasSnapPoints: boolean;
    modal: DrawerPrimitive.Root.Props['modal'];
    showSwipeHandle: boolean;
    swipeDirection: NonNullable<DrawerPrimitive.Root.Props['swipeDirection']>;
};

const DrawerContext = createContext<DrawerContextProps | null>(null);

const subscribeToDocumentDirection = (callback: () => void) => {
    const observer = new MutationObserver(callback);
    observer.observe(document.documentElement, { attributeFilter: ['dir'], attributes: true });
    return () => observer.disconnect();
};

const getDocumentDirection = () => document.documentElement.dir;

const useDrawer = () => {
    const context = useContext(DrawerContext);

    if (!context) {
        throw new Error('useDrawer must be used within a Drawer.');
    }

    return context;
};

const Drawer = ({
    modal = true,
    showSwipeHandle = false,
    snapPoints,
    swipeDirection,
    ...props
}: DrawerPrimitive.Root.Props & {
    showSwipeHandle?: boolean;
}) => {
    const hasSnapPoints = snapPoints != null && snapPoints.length > 0;
    const direction = useSyncExternalStore(
        subscribeToDocumentDirection,
        getDocumentDirection,
        () => 'ltr'
    );
    const resolvedSwipeDirection = swipeDirection ?? (direction === 'rtl' ? 'right' : 'left');
    const contextValue = useMemo(
        () => ({ hasSnapPoints, modal, showSwipeHandle, swipeDirection: resolvedSwipeDirection }),
        [hasSnapPoints, modal, resolvedSwipeDirection, showSwipeHandle]
    );

    return (
        <DrawerContext.Provider value={contextValue}>
            <DrawerPrimitive.Root
                data-slot="drawer"
                modal={modal}
                snapPoints={snapPoints}
                swipeDirection={resolvedSwipeDirection}
                {...props}
            />
        </DrawerContext.Provider>
    );
};

const DrawerTrigger = ({ ...props }: DrawerPrimitive.Trigger.Props) => (
    <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />
);

const DrawerPortal = ({ ...props }: DrawerPrimitive.Portal.Props) => (
    <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />
);

const DrawerClose = ({ className, ...props }: DrawerPrimitive.Close.Props) => (
    <DrawerPrimitive.Close
        data-slot="drawer-close"
        className={cn(
            'bg-gradient text-on-main absolute top-4 right-4 z-10 inline-flex size-8 items-center justify-center rounded-full outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 [&_svg]:size-5',
            className
        )}
        {...props}
    />
);

const DrawerOverlay = ({ className, ...props }: DrawerPrimitive.Backdrop.Props) => {
    return (
        <DrawerPrimitive.Backdrop
            data-slot="drawer-overlay"
            className={cn(
                'fixed inset-0 z-50 min-h-dvh bg-black/50 opacity-[max(var(--drawer-overlay-min-opacity,0),calc(1-var(--drawer-swipe-progress)))] transition-opacity duration-250 ease-[cubic-bezier(0.32,0.72,0,1)] select-none data-ending-style:pointer-events-none data-ending-style:opacity-0 data-ending-style:duration-200 data-snap-points:[--drawer-overlay-min-opacity:0.5] data-starting-style:opacity-0 data-swiping:duration-0 supports-[-webkit-touch-callout:none]:absolute',
                className
            )}
            {...props}
        />
    );
};

const DrawerSwipeHandle = ({ className, ...props }: ComponentProps<'div'>) => {
    return (
        <div
            data-slot="drawer-swipe-handle"
            aria-hidden="true"
            className={cn(
                'relative z-10 flex shrink-0 cursor-grab transition-opacity duration-200 group-data-nested-drawer-open/drawer-popup:opacity-0 group-data-nested-drawer-swiping/drawer-popup:opacity-100 group-data-[swipe-axis=x]/drawer-popup:h-full group-data-[swipe-axis=x]/drawer-popup:w-3 group-data-[swipe-axis=x]/drawer-popup:items-center group-data-[swipe-axis=y]/drawer-popup:h-3 group-data-[swipe-axis=y]/drawer-popup:w-full group-data-[swipe-axis=y]/drawer-popup:justify-center group-data-[swipe-direction=down]/drawer-popup:items-end group-data-[swipe-direction=left]/drawer-popup:order-last group-data-[swipe-direction=left]/drawer-popup:justify-start group-data-[swipe-direction=right]/drawer-popup:justify-end group-data-[swipe-direction=up]/drawer-popup:order-last group-data-[swipe-direction=up]/drawer-popup:items-start after:block after:shrink-0 after:rounded-full after:bg-neutral-300 group-data-[swipe-axis=x]/drawer-popup:after:h-[100px] group-data-[swipe-axis=x]/drawer-popup:after:w-1.5 group-data-[swipe-axis=y]/drawer-popup:after:h-1.5 group-data-[swipe-axis=y]/drawer-popup:after:w-9 active:cursor-grabbing',
                className
            )}
            {...props}
        />
    );
};

const DrawerContent = ({
    classNames,
    children,
    ...props
}: Omit<DrawerPrimitive.Popup.Props, 'className'> & {
    classNames?: DrawerContentClassNames;
}) => {
    const { hasSnapPoints, modal, showSwipeHandle, swipeDirection } = useDrawer();
    const swipeAxis = swipeDirection === 'down' || swipeDirection === 'up' ? 'y' : 'x';

    return (
        <DrawerPortal data-slot="drawer-portal">
            {modal === true && <DrawerOverlay data-snap-points={hasSnapPoints ? '' : undefined} />}
            <DrawerPrimitive.Viewport
                data-slot="drawer-viewport"
                data-modal={modal}
                className={cn(
                    'pointer-events-none fixed inset-0 z-50 select-none data-[modal=true]:pointer-events-auto',
                    classNames?.viewport
                )}
            >
                <DrawerPrimitive.Popup
                    data-slot="drawer-popup"
                    data-swipe-axis={swipeAxis}
                    data-snap-points={hasSnapPoints ? '' : undefined}
                    className={cn(
                        // Base.
                        'group/drawer-popup pointer-events-auto fixed z-50 m-(--drawer-inset,0px) flex h-(--drawer-content-height) max-h-(--drawer-content-max-height,none) min-h-0 w-(--drawer-content-width,auto) transform-[translate3d(var(--translate-x,0px),var(--translate-y,0px),0)_scale(var(--stack-scale))] flex-col bg-popover p-6 text-sm text-popover-foreground shadow-lg transition-[transform,height,opacity,filter] duration-250 ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform outline-none select-none [interpolate-size:allow-keywords] data-[swipe-direction=down]:rounded-t-2xl data-[swipe-direction=down]:border-t data-[swipe-direction=left]:rounded-r-none data-[swipe-direction=left]:border-r data-[swipe-direction=right]:rounded-l-none data-[swipe-direction=right]:border-l data-[swipe-direction=up]:rounded-b-2xl data-[swipe-direction=up]:border-b',
                        // Nested.
                        'data-nested-drawer-open:overflow-hidden data-nested-drawer-open:brightness-95',
                        // Bleed.
                        'after:pointer-events-none after:absolute after:bg-(--drawer-bleed-background,var(--color-popover)) data-[swipe-axis=x]:after:inset-y-0 data-[swipe-axis=x]:after:w-(--bleed) data-[swipe-axis=y]:after:inset-x-0 data-[swipe-axis=y]:after:h-(--bleed) data-[swipe-direction=down]:after:top-full data-[swipe-direction=left]:after:right-full data-[swipe-direction=right]:after:left-full data-[swipe-direction=up]:after:bottom-full',
                        // Sizing.
                        '[--drawer-content-height:var(--drawer-height,auto)] data-[swipe-axis=x]:[--drawer-content-width:75%] data-[swipe-axis=y]:[--drawer-content-max-height:85dvh] data-[swipe-axis=y]:data-snap-points:[--drawer-content-height:100dvh] data-[swipe-axis=x]:sm:[--drawer-content-width:24rem]',
                        // Stack.
                        '[--bleed:3rem] [--peek:1rem] [--stack-height:var(--drawer-frontmost-height,var(--drawer-height,0px))] [--stack-peek-offset:max(0px,calc((var(--nested-drawers)-var(--stack-progress))*var(--peek)))] [--stack-progress:clamp(0,var(--drawer-swipe-progress),1)] [--stack-scale-base:max(0,calc(1-(var(--nested-drawers)*var(--stack-step))))] [--stack-scale:clamp(0,calc(var(--stack-scale-base)+(var(--stack-step)*var(--stack-progress))),1)] [--stack-shrink:calc(1-var(--stack-scale))] [--stack-step:0.05]',
                        // Transitions.
                        'data-ending-style:transform-(--closed-transform) data-ending-style:opacity-[0.9999] data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)] data-nested-drawer-swiping:duration-0 data-ending-style:data-nested-drawer-swiping:duration-[calc(var(--drawer-swipe-strength)*400ms)] data-starting-style:transform-(--closed-transform) data-swiping:duration-0 data-ending-style:data-swiping:duration-[calc(var(--drawer-swipe-strength)*400ms)]',
                        // Axis: y.
                        'data-[swipe-axis=y]:inset-x-0 data-[swipe-axis=y]:data-nested-drawer-open:h-(--stack-height)',
                        // Axis: x.
                        'data-[swipe-axis=x]:inset-y-0 data-[swipe-axis=x]:flex-row',
                        // Direction: down.
                        'data-[swipe-direction=down]:bottom-0 data-[swipe-direction=down]:origin-bottom data-[swipe-direction=down]:[--closed-transform:translate3d(0,calc(100%+var(--drawer-inset,0px)+2px),0)] data-[swipe-direction=down]:[--translate-y:calc(var(--drawer-snap-point-offset,0px)+var(--drawer-swipe-movement-y)-var(--stack-peek-offset)-(var(--stack-shrink)*var(--stack-height)))]',
                        // Direction: up.
                        'data-[swipe-direction=up]:top-0 data-[swipe-direction=up]:origin-top data-[swipe-direction=up]:[--closed-transform:translate3d(0,calc(-100%-var(--drawer-inset,0px)-2px),0)] data-[swipe-direction=up]:[--translate-y:calc(var(--drawer-snap-point-offset,0px)+var(--drawer-swipe-movement-y)+var(--stack-peek-offset)+(var(--stack-shrink)*var(--stack-height)))]',
                        // Direction: left.
                        'data-[swipe-direction=left]:left-0 data-[swipe-direction=left]:origin-left data-[swipe-direction=left]:[--closed-transform:translate3d(calc(-100%-var(--drawer-inset,0px)-2px),0,0)] data-[swipe-direction=left]:[--translate-x:calc(var(--drawer-swipe-movement-x)+var(--stack-peek-offset)+(var(--stack-shrink)*100%))]',
                        // Direction: right.
                        'data-[swipe-direction=right]:right-0 data-[swipe-direction=right]:origin-right data-[swipe-direction=right]:[--closed-transform:translate3d(calc(100%+var(--drawer-inset,0px)+2px),0,0)] data-[swipe-direction=right]:[--translate-x:calc(var(--drawer-swipe-movement-x)-var(--stack-peek-offset)-(var(--stack-shrink)*100%))]',
                        classNames?.popup
                    )}
                    {...props}
                >
                    {showSwipeHandle && <DrawerSwipeHandle />}
                    <DrawerPrimitive.Content
                        data-slot="drawer-content"
                        className={cn(
                            'flex min-h-0 flex-1 flex-col overflow-hidden overscroll-contain rounded-[inherit] transition-opacity duration-300 ease-[cubic-bezier(0.45,1.005,0,1.005)] select-text group-data-nested-drawer-open/drawer-popup:opacity-0 group-data-nested-drawer-swiping/drawer-popup:opacity-100 group-data-swiping/drawer-popup:select-none',
                            classNames?.content
                        )}
                    >
                        {children}
                    </DrawerPrimitive.Content>
                </DrawerPrimitive.Popup>
            </DrawerPrimitive.Viewport>
        </DrawerPortal>
    );
};

const DrawerHeader = ({ className, ...props }: ComponentProps<'div'>) => {
    return (
        <div
            data-slot="drawer-header"
            className={cn('flex shrink-0 flex-col gap-3', className)}
            {...props}
        />
    );
};

const DrawerBody = ({ className, ...props }: ComponentProps<'div'>) => (
    <div
        data-slot="drawer-body"
        className={cn(
            'min-h-0 flex-1 overflow-y-auto overscroll-contain text-sm leading-[1.43] text-muted-foreground',
            className
        )}
        {...props}
    />
);

const DrawerFooter = ({ className, ...props }: ComponentProps<'div'>) => {
    return (
        <div
            data-slot="drawer-footer"
            className={cn('mt-5 flex shrink-0 flex-row items-center justify-end gap-2', className)}
            {...props}
        />
    );
};

const DrawerTitle = ({ className, ...props }: DrawerPrimitive.Title.Props) => {
    return (
        <DrawerPrimitive.Title
            data-slot="drawer-title"
            className={cn('text-base font-medium text-foreground', className)}
            {...props}
        />
    );
};

const DrawerDescription = ({ className, ...props }: DrawerPrimitive.Description.Props) => {
    return (
        <DrawerPrimitive.Description
            data-slot="drawer-description"
            className={cn('text-sm text-balance text-muted-foreground', className)}
            {...props}
        />
    );
};

export {
    Drawer,
    DrawerPortal,
    DrawerOverlay,
    DrawerSwipeHandle,
    DrawerTrigger,
    DrawerClose,
    DrawerContent,
    DrawerBody,
    DrawerHeader,
    DrawerFooter,
    DrawerTitle,
    DrawerDescription,
};
