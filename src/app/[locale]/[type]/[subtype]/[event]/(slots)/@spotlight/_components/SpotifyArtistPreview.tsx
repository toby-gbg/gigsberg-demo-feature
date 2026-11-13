'use client';

import { FC, ReactNode, useEffect, useState } from 'react';

import { cn } from '@/lib/cn';
import { windowIdleCallback } from '@/utils/common';

import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

import { Skeleton } from '@/components/ui/Skeleton';

interface SpotifyArtistPreviewProps {
    spotifyId: string | null;
    className?: string;
    shouldUseTheme?: boolean;
    height?: number | string;
    containerClassName?: string;
    skeletonComponent?: ReactNode;
}

const SpotifyArtistPreview: FC<SpotifyArtistPreviewProps> = ({
    spotifyId,
    height,
    containerClassName,
    className,
    shouldUseTheme = true,
    skeletonComponent,
}) => {
    const [loaded, setLoaded] = useState(false);
    const [isError, setIsError] = useState(false);
    const [canLoad, setCanLoad] = useState(false);

    const { ref, hasBeenVisible } = useIntersectionObserver({
        threshold: 0.1,
        rootMargin: '200px', // start fetching slightly before it's on-screen
        root: null,
    });

    const heightValue = height || '580';
    const iframeClassName = cn('border-none rounded-xl w-full h-[580px]', className);
    const previewSkeletonComponent = skeletonComponent || <Skeleton className={iframeClassName} />;

    useEffect(() => {
        if (!hasBeenVisible || canLoad) return;
        const handle = windowIdleCallback(() => setCanLoad(true));
        return handle;
    }, [hasBeenVisible, canLoad]);

    if (!spotifyId?.trim()) return null;

    return (
        <div
            ref={ref}
            className={cn('relative shadow-md rounded-xl overflow-hidden', containerClassName)}
        >
            {(!loaded || isError || !canLoad) && (
                <div className="top-0 left-0 -z-1 absolute w-full h-full">
                    {previewSkeletonComponent}
                </div>
            )}
            {canLoad && (
                <div className="w-full h-full">
                    <iframe
                        aria-label="Spotify"
                        src={`https://open.spotify.com/embed/artist/${spotifyId}?utm_source=generator${!shouldUseTheme ? '&theme=0' : ''}`}
                        title="Spotify"
                        width="100%"
                        height={heightValue}
                        key="spotify-artist-preview"
                        onLoad={() => setLoaded(true)}
                        onError={() => setIsError(true)}
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        className={iframeClassName}
                    />
                </div>
            )}
        </div>
    );
};

export default SpotifyArtistPreview;
