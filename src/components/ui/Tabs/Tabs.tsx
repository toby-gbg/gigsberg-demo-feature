'use client';

import { Tabs as TabsPrimitive } from '@base-ui/react/tabs';

import { cn } from '@/lib/cn';

const Tabs = ({ className, orientation = 'horizontal', ...props }: TabsPrimitive.Root.Props) => (
    <TabsPrimitive.Root
        data-slot="tabs"
        data-orientation={orientation}
        orientation={orientation}
        className={cn(
            'group/tabs flex gap-2 data-[orientation=horizontal]:flex-col data-[orientation=vertical]:flex-row',
            className
        )}
        {...props}
    />
);

const TabsList = ({ className, ...props }: TabsPrimitive.List.Props) => (
    <TabsPrimitive.List
        data-slot="tabs-list"
        className={cn(
            'mx-auto flex w-full max-w-6xl overflow-auto border border-gray-200 shadow-sm rounded-full bg-default min-h-10',
            'text-center text-sm font-medium text-gray-500',
            'group-data-[orientation=horizontal]/tabs:flex-row group-data-[orientation=horizontal]/tabs:divide-x group-data-[orientation=horizontal]/tabs:divide-gray-200',
            'group-data-[orientation=vertical]/tabs:flex-col group-data-[orientation=vertical]/tabs:divide-y group-data-[orientation=vertical]/tabs:divide-gray-200',
            className
        )}
        {...props}
    />
);

const TabsTrigger = ({ className, ...props }: TabsPrimitive.Tab.Props) => (
    <TabsPrimitive.Tab
        data-slot="tabs-trigger"
        className={cn(
            'group/trigger inline-flex w-full flex-1 items-center justify-center whitespace-nowrap px-4 py-2.5 bg-transparent! p-1',
            'text-gray-700 not-data-active:hover:bg-gray-50',
            'data-active:bg-solid data-active:text-on-solid',
            'focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
            'disabled:pointer-events-none disabled:opacity-50',
            className
        )}
        render={(tabListProps) => {
            const { children, className, ...restProps } = tabListProps;

            return (
                <button {...restProps} className={className}>
                    <span
                        {...restProps}
                        className="w-full h-full rounded-full flex flex-col justify-center items-center text-sm font-medium text-muted group-aria-selected/trigger:bg-white group-aria-selected/trigger:text-black"
                    >
                        {children}
                    </span>
                </button>
            );
        }}
        {...props}
    />
);

const TabsContent = ({ className, ...props }: TabsPrimitive.Panel.Props) => (
    <TabsPrimitive.Panel
        data-slot="tabs-content"
        className={cn('p-2 flex-1 text-sm outline-none', className)}
        {...props}
    />
);

export { Tabs, TabsContent, TabsList, TabsTrigger };
