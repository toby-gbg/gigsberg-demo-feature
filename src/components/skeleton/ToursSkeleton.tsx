'use client';

import { FC, ReactNode } from 'react';

import { cn } from '@/lib/cn';

import { CarouselItem } from '@/components/carousel/CarouselItem';
import { Skeleton } from '@/components/ui/Skeleton';

interface ToursSkeletonProps {
    className?: string;
    messageError?: ReactNode;
}

const ToursSkeleton: FC<ToursSkeletonProps> = ({ className, messageError }) => {
    return (
        <div className="mb-10">
            <div
                className={cn(
                    'relative flex h-fit w-full items-center justify-between overflow-hidden',
                    className
                )}
            >
                {/* Content section */}
                <div className="relative z-10 flex w-full items-stretch opacity-80">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <CarouselItem key={index}>
                            <div className="flex w-full flex-col items-center justify-center rounded-lg pr-3 lg:p-2">
                                <Skeleton className="h-20 w-full rounded-lg" />
                            </div>
                        </CarouselItem>
                    ))}
                </div>
                {messageError && (
                    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
                        <p className="text-md text-gray-500">{messageError}</p>
                    </div>
                )}
            </div>

            <div className="flex justify-center items-center gap-2 mt-4 py-1">
                <Skeleton className="rounded-full h-2 w-6" />
                {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton key={index} className="rounded-full h-2 aspect-square" />
                ))}
            </div>
        </div>
    );
};

export default ToursSkeleton;
