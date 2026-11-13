import { FC } from 'react';
import Image from 'next/image';

import { cn } from '@/lib/cn';

import { Skeleton } from '@/components/ui/Skeleton';

interface SpotifySkeletonProps {
    overlayClassName?: string;
}

const SkeletonFooter = () => {
    return (
        <div className="flex justify-between gap-2">
            <div className="flex flex-1 flex-col gap-1">
                <Skeleton className="hidden h-4.5 w-full max-w-39 overflow-hidden rounded-md" />
                <Skeleton className="h-4 w-full max-w-11.25 overflow-hidden rounded-md" />
            </div>
            <div className="flex-1">
                <Skeleton className="h-full w-full overflow-hidden rounded-md" />
            </div>
        </div>
    );
};

const SpotifySkeleton: FC<SpotifySkeletonProps> = ({ overlayClassName }) => {
    return (
        <div className="relative h-fit w-full rounded-xl border-none p-2">
            <Skeleton className="absolute top-0 left-0 h-full w-full" />
            <div
                className={cn(
                    'absolute top-0 left-0 h-full w-full bg-black opacity-10',
                    overlayClassName
                )}
            />
            <div className="flex flex-col">
                <div className="relative flex h-full w-full gap-2 overflow-hidden">
                    {/* skeleton of performer image */}
                    <div className="h-16 w-16 overflow-hidden rounded-xl">
                        <Skeleton className="h-full w-full" />
                    </div>
                    <div className="flex flex-1 flex-col justify-between gap-2">
                        <div className="flex w-full gap-2">
                            <div className="flex flex-1 flex-col gap-1">
                                {Array.from({ length: 2 }).map((_, index) => (
                                    <Skeleton
                                        key={index}
                                        className="h-4.5 w-full overflow-hidden rounded-md"
                                    />
                                ))}
                            </div>
                            <div>
                                <Image
                                    src="/images/spotify_white.avif"
                                    alt="Spotify"
                                    width={24}
                                    height={24}
                                    className="pointer-events-none h-4 w-4 select-none"
                                />
                            </div>
                        </div>
                        <SkeletonFooter />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpotifySkeleton;
