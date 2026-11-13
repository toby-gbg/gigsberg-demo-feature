'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { ScarcityBanner } from '@/interfaces/Listing';
import { cn } from '@/lib/cn';
import { fallbackTranslation } from '@/utils/common';

import useFont from '@/hooks/useFont';

import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

interface CheckoutButtonProps {
    totalTickets: number;
    scarcityBanner?: ScarcityBanner;
    isFetching?: boolean;
    isInitialEntry?: boolean;
}

export default function ListingHeadline({
    totalTickets,
    scarcityBanner,
    isFetching,
    isInitialEntry,
}: CheckoutButtonProps) {
    const t = useTranslations();
    const { sectionTitleFont } = useFont();

    // Note: Do not show simultaneously with 'Selling Fast' banner — if both conditions are true, % Scarcity wins
    // Show scarcity banner only on initial entry (page 1, no filters applied)
    const showScarcity = isInitialEntry && scarcityBanner?.enabled;

    const titleClassNames = 'font-medium text-primary text-xl lg:text-3xl';

    let BannerTitle = null;
    if (showScarcity) {
        const scarcityValue = (scarcityBanner?.value || 0) >= 1 ? scarcityBanner?.value : '< 1';

        BannerTitle = (
            <h2
                className={cn(
                    'normal-case flex space-x-3 items-start justify-center',
                    titleClassNames,
                    sectionTitleFont.className
                )}
            >
                <span>
                    {fallbackTranslation(
                        t('scarcity_banner_message', { value: scarcityValue }),
                        'scarcity_banner_message',
                        `Only ${scarcityValue}% of tickets left`
                    )}
                </span>
                <Image
                    src="/fire.png"
                    alt="scarcity_banner"
                    priority
                    width={28}
                    height={30}
                    className="animate-fire-breathe"
                />
            </h2>
        );
    } else {
        const translatedTicket = fallbackTranslation(
            t('ticket', { count: totalTickets }),
            'ticket',
            totalTickets > 1 ? 'Tickets' : 'Ticket'
        );

        BannerTitle = (
            <h2 className={cn('capitalize', titleClassNames, sectionTitleFont.className)}>
                {totalTickets} {translatedTicket} {t('remaining')}
            </h2>
        );
    }

    return (
        <div className="hidden lg:block bg-white px-5 py-3 lg:py-5 ltr:lg:rounded-r-xl rtl:lg:rounded-l-xl text-center">
            {isFetching ? (
                <Card className="hidden flex-col items-center lg:flex gap-2 shadow-none p-2 ltr:lg:rounded-r-xl rtl:lg:rounded-l-xl h-17.5">
                    <Skeleton className="rounded w-72 h-8" />
                    <Skeleton className="rounded w-[75%] h-7" />
                </Card>
            ) : (
                <>
                    {BannerTitle}
                    <p className="mt-2 text-primary text-sm lg:text-base">{t('event_matching')}</p>
                </>
            )}
        </div>
    );
}
