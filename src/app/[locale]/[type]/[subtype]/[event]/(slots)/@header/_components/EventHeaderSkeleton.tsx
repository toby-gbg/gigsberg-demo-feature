'use client';

import { useParams } from 'next/navigation';

import { removeTicketsSuffix } from '@/utils/common';

import EventCardSkeleton from '@/components/event-card/EventCardSkeleton';
import { Skeleton } from '@/components/ui/Skeleton';

export default function EventHeaderSkeleton() {
    const { type } = useParams();
    const hasTeamsSection = removeTicketsSuffix(type?.toString()) === 'sport';

    return (
        <div className="flex flex-col">
            <div className="flex justify-between items-center gap-4">
                <div className="overflow-hidden">
                    <Skeleton className="rounded-2xl w-54 h-8 md:my-2 md:h-14" />
                    <Skeleton className="w-100 h-10" />

                    {hasTeamsSection ? (
                        <>
                            <Skeleton className="mt-7 h-[1.5em] w-20 text-[24px] md:text-[28px] xl:text-heading" />
                            <EventCardSkeleton className="mt-8" />{' '}
                            <Skeleton className="h-2 w-2 rounded-full mt-8" />
                        </>
                    ) : null}
                </div>
                {/* event share button skeleton */}
                <div className="hidden xl:block">
                    <Skeleton className="rounded-lg w-22.5 h-9.5" />
                </div>
            </div>
        </div>
    );
}
