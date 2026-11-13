'use client';

import { ClassValue } from 'clsx';
import { Funnel } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';
import { fallbackTranslation } from '@/utils/common';

import { Button } from '@/components/ui/Button';

export interface EventFiltersHeaderProps {
    hasActiveFilters: boolean;
    classNames?: {
        header?: ClassValue;
        summary?: ClassValue;
    };
    resetFilters: () => void;
}

export default function EventFiltersHeader({
    classNames,
    hasActiveFilters,
    resetFilters,
}: EventFiltersHeaderProps) {
    const t = useTranslations();

    return (
        <div className={cn('flex flex-col gap-2 md:flex-row md:items-center', classNames?.header)}>
            <div className="flex items-center gap-2">
                <Funnel size={20} className="text-primary" />
                <p className="text-lg font-medium text-[#616161] md:text-xl">
                    {fallbackTranslation(t('filters_label'), 'filters_label', 'Filters')}
                </p>
            </div>
            <div
                className={cn(
                    'flex w-full flex-row items-center justify-between gap-2',
                    classNames?.summary
                )}
            >
                <p className="text-xs font-normal text-[#616161]">
                    {fallbackTranslation(
                        t('filter_tickets_description'),
                        'filter_tickets_description',
                        'Refine results to find the perfect tickets'
                    )}
                </p>
                {hasActiveFilters && (
                    <Button
                        type="button"
                        variant="link"
                        className="h-auto p-0 text-primary text-xs"
                        onClick={resetFilters}
                    >
                        {fallbackTranslation(t('reset'), 'reset', 'Reset')}
                    </Button>
                )}
            </div>
        </div>
    );
}
