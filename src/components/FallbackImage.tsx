'use client';

import { FC, useMemo, useState } from 'react';
import Image, { ImageProps } from 'next/image';

import { cn } from '@/lib/cn';

import { useSite } from '@/providers/SiteProvider';
import useTypeImage from '@/hooks/useTypeImage';

import { Skeleton } from './ui/Skeleton';

interface FallbackImageProps extends Omit<ImageProps, 'src'> {
    src?: ImageProps['src'];
    fallbackImage?: ImageProps['src'];
    fallbackType?: string;
    fallbackLogo?: boolean; // include logo for fallback image

    // optional override; otherwise resolved from useSite().website hook
    logo?: string | null;
    logoDark?: string | null;
}

const FallbackImage: FC<FallbackImageProps> = ({
    src,
    fallbackImage,
    preload,
    alt = 'Gigsberg image',
    className,
    fallbackType,
    fallbackLogo = true,
    logo: logoProp,
    logoDark: logoDarkProp,
    ...props
}) => {
    const website = useSite().website;
    const logo = logoProp ?? website?.logo ?? null;
    const logoDark = logoDarkProp ?? website?.logo_dark ?? null;
    const typeImage = useTypeImage(fallbackType);
    const [attempt, setAttempt] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(false);

    const sources = useMemo(() => {
        let allSrc: (string | null | undefined | ImageProps['src'])[] = [
            src,
            fallbackImage,
            typeImage,
        ];
        if (fallbackLogo) {
            allSrc = allSrc.concat([logoDark, logo]);
        }
        return allSrc.filter(Boolean);
    }, [src, fallbackImage, typeImage, logo, logoDark]);

    const currentSrc = sources[attempt];

    const isDarkLogo = currentSrc == logoDark;

    const handleError = () => {
        console.log('Image load error, trying next source if available.', { currentSrc, attempt });
        if (attempt < sources.length - 1) {
            setAttempt((prev) => prev + 1);
        } else {
            setError(true);
        }
    };

    const handleLoad = () => {
        setIsLoaded(true);
    };

    return (
        <div className="relative flex h-full w-full items-center justify-center">
            {!preload && !isLoaded && <Skeleton className="absolute inset-0" />}

            {currentSrc && !error && (
                <Image
                    src={currentSrc}
                    alt={alt}
                    onError={handleError}
                    onLoad={handleLoad}
                    preload={preload}
                    className={cn(
                        !preload && 'transition-opacity duration-300',
                        {
                            'opacity-0': !preload && !isLoaded,
                            'object-cover': attempt !== sources.length - 1 && !isDarkLogo,
                            'h-auto w-auto object-contain':
                                attempt === sources.length - 1 || isDarkLogo,
                        },
                        className
                    )}
                    {...props}
                />
            )}
        </div>
    );
};

export default FallbackImage;
