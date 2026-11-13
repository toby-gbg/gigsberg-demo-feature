'use client';

import { ReactNode, useState } from 'react';
import { ChevronDown, LucideIcon } from 'lucide-react';
import { useLocale } from 'next-intl';

import { cn } from '@/lib/cn';
import { isRTL } from '@/utils/common';
import { getIsGradient } from '@/utils/website';

import { useSite } from '@/providers/SiteProvider';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover/Popover';

export interface FilterDropdownProps {
    title: string;
    active: boolean;
    activeLabel?: string;
    activeCount?: number;
    icon?: LucideIcon;
    iconClassName?: string;
    className?: string;
    contentClassName?: string;
    onOpenChange?: (open: boolean) => void;
    children: ReactNode;
}

export default function FilterDropdown({
    title,
    active,
    activeLabel,
    activeCount,
    icon: Icon,
    iconClassName,
    className,
    contentClassName,
    onOpenChange,
    children,
}: FilterDropdownProps) {
    const isGradient = getIsGradient(useSite().website);
    const locale = useLocale();
    const [open, setOpen] = useState(false);

    const label = activeLabel ?? (activeCount ? `${title} (${activeCount})` : title);

    return (
        <Popover
            open={open}
            onOpenChange={(nextOpen) => {
                setOpen(nextOpen);
                onOpenChange?.(nextOpen);
            }}
        >
            <PopoverTrigger
                openOnHover
                delay={0}
                closeDelay={100}
                className={cn(
                    'flex justify-between items-center gap-x-2 px-5 py-2 border border-zinc-300 rounded-lg outline-none w-full max-[1475px]:text-xs text-sm transition-all cursor-pointer',
                    active
                        ? isGradient
                            ? 'bg-gradient text-on-main'
                            : 'bg-solid text-on-solid'
                        : 'bg-zinc-200 text-zinc-500',
                    className
                )}
            >
                <span className="flex items-center gap-x-2 capitalize">
                    {Icon && <Icon className={iconClassName} size={16} />}
                    {label}
                </span>
                <ChevronDown
                    aria-hidden
                    className={cn('size-4 transition-transform duration-300', open && 'rotate-180')}
                />
            </PopoverTrigger>
            <PopoverContent
                align={isRTL(locale) ? 'end' : 'start'}
                className={cn(
                    'max-h-120 w-(--anchor-width) gap-2 overflow-y-auto p-2',
                    contentClassName
                )}
            >
                {children}
            </PopoverContent>
        </Popover>
    );
}
