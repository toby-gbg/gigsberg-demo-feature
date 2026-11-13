'use client';

import { FC } from 'react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';
import { removeTicketsSuffix } from '@/utils/common';

/** Canonical event type keys (from typeNameUrl / typeImages). */
export type EventTypeKey = 'concert' | 'sport' | 'comedy' | 'theatre' | 'festival';

interface TypeLabelProps {
    /** Event type slug, e.g. `concert`, `sport`, or `concert-tickets`. */
    type: string;
    className?: string;
    variant?: 'badge' | 'tag';
}

const TYPE_FALLBACKS: Record<EventTypeKey, string> = {
    concert: 'Concert',
    sport: 'Sport',
    comedy: 'Comedy',
    theatre: 'Theatre',
    festival: 'Festival',
};

/** Translation keys used in menus / nav when available. */
const TYPE_TRANSLATION_KEYS: Record<EventTypeKey, string> = {
    concert: 'concerts',
    sport: 'sports',
    comedy: 'comedy',
    theatre: 'theatre',
    festival: 'festival',
};

const colorMap: Record<EventTypeKey, string> = {
    concert: 'bg-blue-600',
    sport: 'bg-green-600',
    comedy: 'bg-purple-600',
    theatre: 'bg-rose-600',
    festival: 'bg-orange-500',
};

const tagColorMap: Record<EventTypeKey, { border: string; bg: string; text: string }> = {
    concert: { border: 'border-blue-600', bg: 'bg-blue-50', text: 'text-blue-700' },
    sport: { border: 'border-green-600', bg: 'bg-green-50', text: 'text-green-700' },
    comedy: { border: 'border-purple-600', bg: 'bg-purple-50', text: 'text-purple-700' },
    theatre: { border: 'border-rose-600', bg: 'bg-rose-50', text: 'text-rose-700' },
    festival: { border: 'border-orange-500', bg: 'bg-orange-50', text: 'text-orange-700' },
};

const DEFAULT_COLOR = 'bg-slate-600';
const DEFAULT_TAG_COLORS = {
    border: 'border-slate-600',
    bg: 'bg-slate-50',
    text: 'text-slate-700',
};

function normalizeType(type: string): string {
    return removeTicketsSuffix(type.trim().toLowerCase());
}

function toEventTypeKey(type: string): EventTypeKey | null {
    const key = normalizeType(type);
    if (key in TYPE_FALLBACKS) return key as EventTypeKey;
    // plural / alias forms
    if (key === 'concerts') return 'concert';
    if (key === 'sports') return 'sport';
    if (key === 'theater') return 'theatre';
    if (key === 'festivals') return 'festival';
    return null;
}

function formatUnknownType(type: string): string {
    const key = normalizeType(type);
    if (!key) return '';
    return key
        .split(/[-_]/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

const TypeLabel: FC<TypeLabelProps> = ({ type, className = '', variant = 'badge' }) => {
    const t = useTranslations();
    const eventType = toEventTypeKey(type);

    if (!type?.trim()) return null;

    const displayText = (() => {
        if (!eventType) return formatUnknownType(type);
        const translationKey = TYPE_TRANSLATION_KEYS[eventType];
        if (t.has(translationKey)) return t(translationKey);
        return TYPE_FALLBACKS[eventType];
    })();

    if (!displayText) return null;

    if (variant === 'tag') {
        const tagColors = eventType ? tagColorMap[eventType] : DEFAULT_TAG_COLORS;
        return (
            <span
                className={cn(
                    `flex w-max items-center gap-1 rounded-[80px] border ${tagColors.border} ${tagColors.bg} ${tagColors.text} px-2 py-1`,
                    className
                )}
            >
                <span className={`text-[10px] leading-3.5 font-bold uppercase ${tagColors.text}`}>
                    {displayText}
                </span>
            </span>
        );
    }

    const bgColor = eventType ? colorMap[eventType] : DEFAULT_COLOR;

    return (
        <span
            className={cn(
                `absolute top-2 left-2 z-10 rounded-full px-2.5 py-0.5 text-[11px] leading-tight font-bold text-white uppercase shadow-md ${bgColor}`,
                className
            )}
        >
            {displayText}
        </span>
    );
};

export default TypeLabel;
