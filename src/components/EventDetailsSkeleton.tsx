'use client';

import { FC } from 'react';
import { useTranslations } from 'next-intl';

import EventDetailsCardSkeleton from './EventDetailsCardSkeleton';

interface EventDetailsSkeletonProps {
    isLoaded?: boolean;
    cardCount?: number;
    shouldShowMinPrice?: boolean;
    ctaLabel?: string;
}

const DEFAULT_CARD_COUNT = 5;

const EventDetailsSkeleton: FC<EventDetailsSkeletonProps> = ({
    isLoaded,
    cardCount = DEFAULT_CARD_COUNT,
    shouldShowMinPrice = false,
    ctaLabel,
}) => {
    const t = useTranslations();

    return (
        <div className="relative flex flex-col gap-4 min-h-100">
            {Array.from({ length: cardCount }, (_, i) => i + 1).map((key) => (
                <EventDetailsCardSkeleton
                    key={key}
                    shouldShowMinPrice={shouldShowMinPrice}
                    ctaLabel={ctaLabel}
                />
            ))}
            {isLoaded && (
                <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                    <div className="text-center">
                        <h2 className="font-semibold text-lg">{t('no_found_anything')}</h2>
                        <p className="text-gray-500 text-sm">{t('try_date_location')}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventDetailsSkeleton;
