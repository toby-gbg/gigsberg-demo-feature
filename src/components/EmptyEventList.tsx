'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { fallbackTranslation } from '@/utils/common';

import Link from '@/components/Link';

import { Button } from './ui/Button';

export default function EmptyEventList({
    hasActiveFilters,
    backUrl,
    handleResetAction,
}: {
    hasActiveFilters: boolean;
    backUrl?: string;
    handleResetAction?: () => void;
}) {
    const t = useTranslations();

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
                    {t(hasActiveFilters ? 'no_events_found_message' : 'no_result_message')}
                </p>
            </div>
            <div className="flex justify-center items-center gap-2 w-full">
                {hasActiveFilters && handleResetAction && (
                    <Button
                        type="button"
                        className="border border-gray-300 font-bold text-base"
                        onClick={handleResetAction}
                    >
                        {fallbackTranslation(t('reset_search'), 'reset_search', 'Reset search')}
                    </Button>
                )}
                {backUrl && (
                    <Link href={backUrl} prefetch={false}>
                        <Button variant="ghost" className="border border-gray-300 rounded-lg">
                            <span className="text-gray-800 text-base">
                                {fallbackTranslation(t('back'), 'back', 'Back')}
                            </span>
                        </Button>
                    </Link>
                )}
            </div>
        </div>
    );
}
