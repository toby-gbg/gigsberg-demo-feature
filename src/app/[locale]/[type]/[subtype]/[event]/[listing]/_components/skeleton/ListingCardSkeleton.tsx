'use client';

import { FC, useRef } from 'react';
import { useTranslations } from 'next-intl';

import { ListingSearchFilters } from '@/interfaces/Listing';

import { LoadingCard } from './ListingTicketsSkeleton';

interface ListingCardSkeletonProps {
    isLoaded?: boolean;
    filters?: ListingSearchFilters;
}

const ListingCardSkeleton: FC<ListingCardSkeletonProps> = ({ isLoaded, filters }) => {
    const t = useTranslations();
    const cards = useRef(Array.from({ length: 4 }, (_, i) => i + 1)).current;

    const hasFilters =
        Boolean(filters?.categories?.length) ||
        Boolean(filters?.ticket_type?.length) ||
        Boolean(filters?.number_of_tickets?.length) ||
        Boolean(filters?.min_price) ||
        Boolean(filters?.max_price);

    return (
        <div className="relative flex flex-col gap-2 min-h-100">
            {cards.map((key, index) => (
                <LoadingCard key={key} index={index} isLoaded={isLoaded} />
            ))}
            {isLoaded && (
                <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                    <div className="text-center">
                        <h2 className="font-semibold text-lg">{t('no_found_anything')}</h2>
                        <p className="text-gray-500 text-sm">
                            {t(
                                hasFilters
                                    ? 'try_adjusting_your_filters_or_resetting_them'
                                    : 'try_date_location'
                            )}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListingCardSkeleton;
