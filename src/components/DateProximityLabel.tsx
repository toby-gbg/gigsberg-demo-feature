'use client';

import { FC } from 'react';
import { AlarmClock, Calendar, CalendarDays, LucideIcon, PartyPopper } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';
import type { ProximityLabel } from '@/utils/dateProximityLabel';
import { PROXIMITY_LABEL_FALLBACKS } from '@/utils/dateProximityLabel';

interface DateProximityLabelProps {
    label: ProximityLabel;
    className?: string;
    variant?: 'badge' | 'tag';
}

const colorMap: Record<ProximityLabel, string> = {
    today: 'bg-red-600',
    tomorrow: 'bg-orange-500',
    this_weekend: 'bg-blue-700',
    next_week: 'bg-teal-600',
};

const tagColorMap: Record<ProximityLabel, { border: string; bg: string; text: string }> = {
    today: { border: 'border-red-600', bg: 'bg-red-50', text: 'text-red-700' },
    tomorrow: { border: 'border-orange-500', bg: 'bg-orange-50', text: 'text-orange-700' },
    this_weekend: { border: 'border-blue-700', bg: 'bg-blue-50', text: 'text-blue-700' },
    next_week: { border: 'border-teal-600', bg: 'bg-teal-50', text: 'text-teal-700' },
};

const tagIconMap: Record<ProximityLabel, LucideIcon> = {
    today: AlarmClock,
    tomorrow: Calendar,
    this_weekend: PartyPopper,
    next_week: CalendarDays,
};

const DateProximityLabel: FC<DateProximityLabelProps> = ({
    label,
    className = '',
    variant = 'badge',
}) => {
    const t = useTranslations();
    const displayText = t.has(label) ? t(label) : PROXIMITY_LABEL_FALLBACKS[label];

    if (variant === 'tag') {
        const tagColors = tagColorMap[label];
        const Icon = tagIconMap[label];
        return (
            <span
                className={cn(
                    `flex w-max items-center gap-1 rounded-[80px] border ${tagColors.border} ${tagColors.bg} ${tagColors.text} px-2 py-1`,
                    className
                )}
            >
                <Icon className="size-3 shrink-0" aria-hidden />
                <span className={`text-[10px] leading-3.5 ${tagColors.text}`}>{displayText}</span>
            </span>
        );
    }

    return (
        <span
            className={cn(
                `absolute top-2 right-2 z-10 rounded-full px-2.5 py-0.5 text-[11px] leading-tight font-bold text-white uppercase shadow-md ${colorMap[label]}`,
                className
            )}
        >
            {displayText}
        </span>
    );
};

export default DateProximityLabel;
