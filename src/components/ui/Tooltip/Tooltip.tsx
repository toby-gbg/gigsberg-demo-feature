'use client';

import { createContext, useContext, useState } from 'react';
import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip';
import { useMedia } from 'react-use';

import { cn } from '@/lib/cn';

type TooltipContentProps = TooltipPrimitive.Popup.Props &
    Pick<TooltipPrimitive.Positioner.Props, 'align' | 'alignOffset' | 'side' | 'sideOffset'> & {
        showArrow?: boolean;
    };

const TooltipContext = createContext<{ openOnClick: boolean; toggle: () => void } | null>(null);

const TooltipProvider = ({ delay = 0, ...props }: TooltipPrimitive.Provider.Props) => (
    <TooltipPrimitive.Provider delay={delay} {...props} />
);

const Tooltip = ({
    ...props
}: Omit<TooltipPrimitive.Root.Props, 'defaultOpen' | 'onOpenChange' | 'open'>) => {
    const [open, setOpen] = useState(false);
    // CSS media query checking input device capabilities
    const canHover = useMedia('(hover: hover) and (pointer: fine)', false);

    const handleOpenChange: TooltipPrimitive.Root.Props['onOpenChange'] = (
        nextOpen,
        { reason }
    ) => {
        if (!canHover && (reason === 'trigger-hover' || reason === 'trigger-focus')) {
            return;
        }

        setOpen(nextOpen);
    };

    return (
        <TooltipContext.Provider
            value={{
                openOnClick: !canHover,
                toggle: () => setOpen((currentOpen) => !currentOpen),
            }}
        >
            <TooltipPrimitive.Root open={open} onOpenChange={handleOpenChange} {...props} />
        </TooltipContext.Provider>
    );
};

const TooltipTrigger = ({ className, ...props }: TooltipPrimitive.Trigger.Props) => {
    const context = useContext(TooltipContext);

    return (
        <TooltipPrimitive.Trigger
            {...props}
            data-slot="tooltip-trigger"
            className={cn(
                'inline-block',
                'transition-[color,background-color,box-shadow] duration-150 ease-smooth motion-reduce:transition-none',
                className
            )}
            onClick={context?.openOnClick ? () => context.toggle() : undefined}
            delay={300}
        />
    );
};

const TooltipContent = ({
    align = 'center',
    alignOffset = 0,
    children,
    className,
    showArrow = false,
    side = 'top',
    sideOffset = showArrow ? 7 : 3,
    ...props
}: TooltipContentProps) => (
    <TooltipPrimitive.Portal>
        <TooltipPrimitive.Positioner
            align={align}
            alignOffset={alignOffset}
            side={side}
            sideOffset={sideOffset}
            className="isolate z-50"
        >
            <TooltipPrimitive.Popup
                data-slot="tooltip-content"
                className={cn(
                    'z-50 w-fit max-w-xs break-all',
                    'rounded-[min(32px,var(--radius-xl))] p-2 text-xs bg-popover text-popover-foreground shadow-field font-medium',
                    'origin-(--transform-origin) transition-[opacity,transform] will-change-[opacity,transform]',
                    'data-open:animate-in data-open:fade-in-0 data-open:zoom-in-90',
                    'data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
                    'data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1',
                    'data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1',
                    className
                )}
                {...props}
            >
                {children}
                {showArrow && (
                    <TooltipPrimitive.Arrow
                        className={cn(
                            'z-50 size-2.5 translate-y-[calc(-50%-2px)] rotate-45 rounded-[2px] bg-overlay fill-overlay',
                            'data-[side=bottom]:top-1 data-[side=top]:-bottom-2.5',
                            'data-[side=left]:top-1/2! data-[side=left]:-right-1 data-[side=left]:-translate-y-1/2',
                            'data-[side=right]:top-1/2! data-[side=right]:-left-1 data-[side=right]:-translate-y-1/2'
                        )}
                    />
                )}
            </TooltipPrimitive.Popup>
        </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
);

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
export type { TooltipContentProps };
