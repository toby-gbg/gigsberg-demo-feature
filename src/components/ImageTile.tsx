'use client';

import { FC, ReactNode } from 'react';
import Balancer from 'react-wrap-balancer';

import { cn } from '@/lib/cn';

import { useSite } from '@/providers/SiteProvider';

import FallbackImage from './FallbackImage';

export type ImageTileSize = 'sm' | 'xl';

export type ImageTileClassNames = {
    wrapper?: string;
    imageWrapper?: string;
    image?: string;
    content?: string;
};

export interface ImageTileProps {
    /** Resolved image URL (parent maps domain → URL). */
    imageSrc?: string;
    imageAlt?: string;
    fallbackImage?: string;
    fallbackType?: string;
    /** Tenant logo fallbacks; optional override, otherwise from useSite().website hook. */
    logo?: string | null;
    logoDark?: string | null;
    content?: ReactNode;
    classNames?: ImageTileClassNames;
}

/**
 * Pure bubble card shell.
 * Parent owns Link, navigation, GA, image/url resolution, and formatting.
 *
 * @example
 * items.map((item) => (
 *   <Link key={item.id} href={item.href} onClick={...}>
 *     <ImageTile content={...} imageSrc={...} />
 *   </Link>
 * ))
 */
const ImageTile: FC<ImageTileProps> = ({
    imageSrc,
    imageAlt = '',
    fallbackImage,
    fallbackType,
    logo: logoProp,
    logoDark: logoDarkProp,
    content,
    classNames,
}) => {
    const website = useSite().website;
    const logo = logoProp ?? website?.logo ?? null;
    const logoDark = logoDarkProp ?? website?.logo_dark ?? null;
    return (
        <div
            className={cn(
                'relative flex flex-col w-full md:hover:shadow-sm lg:p-2 pr-3 rounded-lg md:hover:bg-gray-400/10 items-center justify-center',
                classNames?.wrapper
            )}
        >
            <div className={cn('relative w-full h-20', classNames?.imageWrapper)}>
                <FallbackImage
                    src={imageSrc}
                    fallbackImage={fallbackImage}
                    fallbackType={fallbackType}
                    logo={logo}
                    logoDark={logoDark}
                    alt={imageAlt || ''}
                    fill
                    className={cn('rounded-lg', classNames?.image)}
                    sizes="(min-width: 1024px) 264px, 208px"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div
                        className={cn(
                            'relative z-10 text-title-s text-center font-medium text-white px-2',
                            '[text-shadow:0_0_4px_rgba(0,0,0,0.9),0_0_8px_rgba(0,0,0,0.7),0_0_14px_rgba(0,0,0,0.5)]',
                            classNames?.content
                        )}
                    >
                        <Balancer>{content}</Balancer>
                    </div>
                </div>
                <div className="absolute inset-0 rounded-lg bg-black/20" />
            </div>
        </div>
    );
};

export default ImageTile;
