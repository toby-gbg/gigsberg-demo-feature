'use client';

import { ReactNode } from 'react';
import Image from 'next/image';
import { useQueryStates } from '@/nuqs/hooks/useQueryStates';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';
import { convertNameUrlToLabel, fallbackTranslation } from '@/utils/common';

import { useSite } from '@/providers/SiteProvider';
import useIntlRouter from '@/hooks/useIntlRouter';

import { Button } from '@/components/ui/Button';

import { useVenueContext } from '../_providers/VenueProvider';
import { venueSearchParamsParsers } from '../_searchParams';

export default function VenueEmptyState() {
    const t = useTranslations();
    const router = useIntlRouter();
    const { hasActiveFilters, venueName } = useVenueContext();
    const [_, setSearchParams] = useQueryStates(venueSearchParamsParsers);
    const { config } = useSite().domainInfo || {};
    const useBrandStyling = config?.features?.useBrandStyling || false;

    const handleResetUrl = () => {
        // remove search params
        setSearchParams(null);
    };

    const noFilterTitleKey = hasActiveFilters ? 'no_events_found_title' : 'no_events_now_title';

    return (
        <div className="flex flex-col justify-center items-center gap-6 mx-auto py-4 w-full max-w-132 min-h-75">
            <div className="flex justify-center items-center p-4 border rounded-full w-14.5 h-14.5 text-gray-500">
                <Image alt="icon" src="/icons/filter_ticket_icon.svg" width={24} height={24} />
            </div>
            <div className="flex flex-col gap-2">
                <p className="font-bold text-black text-2xl text-center">
                    {fallbackTranslation(
                        t(noFilterTitleKey),
                        noFilterTitleKey,
                        hasActiveFilters
                            ? 'No events found for this search'
                            : 'No upcoming events right now'
                    )}
                </p>
                <p className="text-[#A0A0A0] text-xl text-center">
                    {t.rich(hasActiveFilters ? 'no_events_found_message' : 'no_result_message', {
                        name: convertNameUrlToLabel(venueName),
                        highlight: (chunks: ReactNode) => (
                            <span
                                className={cn(
                                    'font-bold text-primary',
                                    useBrandStyling && 'text-[#1565C0]'
                                )}
                            >
                                {chunks}
                            </span>
                        ),
                    })}
                </p>
            </div>

            <div className="flex justify-center items-center gap-2 w-full">
                {hasActiveFilters && (
                    <Button
                        type="button"
                        className={cn(
                            'h-auto min-h-[38px] px-3 py-1.5 font-bold text-base border border-gray-300',
                            useBrandStyling && 'bg-[#1565C0] text-white'
                        )}
                        onClick={handleResetUrl}
                    >
                        {fallbackTranslation(t('reset_search'), 'reset_search', 'Reset search')}
                    </Button>
                )}

                <Button
                    onClick={() => router.back()}
                    variant="ghost"
                    className="border border-gray-300 rounded-lg"
                >
                    <span className="text-gray-800 text-base">
                        {fallbackTranslation(t('back'), 'back', 'Back')}
                    </span>
                </Button>
            </div>
        </div>
    );
}
