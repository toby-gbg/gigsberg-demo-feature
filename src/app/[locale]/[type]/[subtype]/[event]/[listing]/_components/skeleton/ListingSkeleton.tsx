'use client';

import { useTranslations } from 'next-intl';
import { useEffectOnce } from 'react-use';

import VenueMapSkeleton from '@/components/venues/VenueMap/VenueMapSkeleton';

import ListingTicketsSkeleton from './ListingTicketsSkeleton';

interface Props {
    isLoaded?: boolean;
}

export default function ListingSkeleton({ isLoaded }: Props) {
    const t = useTranslations();

    // Auto scroll to top on mount
    useEffectOnce(() => {
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'auto' });
        }, 500);
    });

    return (
        <section className="bg-gray-100 p-2 min-h-200">
            <div className="grid grid-cols-1 lg:grid-cols-12 w-full">
                {/* listing tickets skeletion on the left */}
                <div className="order-1 lg:order-0 col-span-1 lg:col-span-5 bg-inherit">
                    <ListingTicketsSkeleton isLoaded={isLoaded} />
                </div>

                <div className="col-span-1 lg:col-span-7">
                    <VenueMapSkeleton isLoaded={isLoaded} />
                </div>
            </div>

            {isLoaded && (
                <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                    <div className="text-center">
                        <h2 className="font-semibold text-lg">{t('no_found_anything')}</h2>
                    </div>
                </div>
            )}
        </section>
    );
}
