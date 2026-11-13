'use client';

import { FC, ReactNode } from 'react';

import { cn } from '@/lib/cn';

import MainContainer from '@/components/MainContainer';

import EventDetailsCardSkeleton from '../EventDetailsCardSkeleton';

interface ListingsSkeletonProps {
    className?: string;
    messageError?: ReactNode;
}

const ListingsSkeleton: FC<ListingsSkeletonProps> = ({ className, messageError }) => {
    return (
        <div
            className={cn(
                'relative mb-10 flex h-fit w-full items-center justify-between overflow-hidden',
                className
            )}
        >
            {/* Content section */}
            <MainContainer className="relative z-10 space-y-4 opacity-80">
                {Array.from({ length: 5 }).map((_, index) => (
                    <EventDetailsCardSkeleton key={index} />
                ))}
            </MainContainer>
            {messageError && (
                <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
                    <p className="text-md text-gray-500">{messageError}</p>
                </div>
            )}
        </div>
    );
};

export default ListingsSkeleton;
