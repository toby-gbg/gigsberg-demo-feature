'use client';

import { FC, ReactNode } from 'react';

import { cn } from '@/lib/cn';

import MainContainer from '@/components/MainContainer';

import { Skeleton } from '../ui/Skeleton';

interface SlideSkeletonProps {
    isLoaded?: boolean;
    className?: string;
    messageError?: ReactNode;
}

const SlideSkeleton: FC<SlideSkeletonProps> = ({ isLoaded, className, messageError }) => {
    return (
        <div
            className={cn(
                'relative mb-10 flex h-120 md:h-150 w-full items-center justify-between overflow-hidden bg-black',
                className
            )}
        >
            {/* Image skeleton background */}
            {isLoaded ? (
                <div className="absolute inset-0 h-full w-full bg-linear-to-r from-gray-400 via-gray-800 to-black" />
            ) : (
                <Skeleton className="absolute inset-0 rounded-none" />
            )}

            {/* Content section */}
            <MainContainer className="relative z-10 space-y-10">
                <div className="flex flex-col gap-2">
                    {isLoaded ? (
                        <div className="h-15 w-60 rounded-md bg-gray-300" />
                    ) : (
                        <Skeleton className="h-15 w-60 rounded-md" />
                    )}

                    {isLoaded ? (
                        <div className="h-6.25 w-60 rounded-md bg-gray-300" />
                    ) : (
                        <Skeleton className="h-6.25 w-60 rounded-md" />
                    )}
                </div>

                <div className="flex gap-4 md:gap-8 w-full flex-row flex-wrap">
                    {isLoaded ? (
                        <div className="h-18.5 w-40 rounded-md bg-gray-300" />
                    ) : (
                        <Skeleton className="h-18.5 w-40 rounded-md" />
                    )}
                    {isLoaded ? (
                        <div className="h-18.5 w-40 rounded-md bg-gray-300" />
                    ) : (
                        <Skeleton className="h-18.5 w-40 rounded-md" />
                    )}
                </div>
            </MainContainer>
            {messageError && (
                <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
                    <p className="text-lg text-white">{messageError}</p>
                </div>
            )}
        </div>
    );
};

export default SlideSkeleton;
