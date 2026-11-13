'use client';

import { FC, ReactNode } from 'react';
import { DateTime } from 'luxon';
import { useLocale } from 'next-intl';
import Balancer from 'react-wrap-balancer';

import { cn } from '@/lib/cn';

import { useSite } from '@/providers/SiteProvider';
import useFont from '@/hooks/useFont';

import FallbackImage from '../FallbackImage';

export type EventCardSize = 'sm' | 'xl';

export type EventCardClassNames = {
    wrapper?: string;
    imageWrapper?: string;
    image?: string;
    body?: string;
    title?: string;
    subtitle?: string;
    date?: string;
    description?: string;
};

export interface EventCardProps {
    /** Main heading. */
    title?: string;
    /** Secondary line (e.g. "3 upcoming matches"). */
    subtitle?: ReactNode;
    // Expecting format: YYYY-MM-DD
    date?: string;
    // Expecting format: HH:MM:SS
    time?: string;
    /** Description / location line (string gets MapPin; node is rendered as-is). */
    description?: ReactNode;
    /** Resolved image URL (parent maps domain → URL). */
    imageSrc?: string;
    imageAlt?: string;
    fallbackImage?: string;
    fallbackType?: string;
    /** Tenant logo fallbacks; optional override, otherwise from useSite().website hook. */
    logo?: string | null;
    logoDark?: string | null;
    /** Overlay on image (e.g. proximity badge). */
    topLeftBadge?: ReactNode;
    topRightBadge?: ReactNode;
    size?: EventCardSize;
    classNames?: EventCardClassNames;
    /* Others */
    header?: ReactNode;
    footer?: ReactNode;
}

/**
 * Pure presentational card shell.
 * Parent owns Link, navigation, GA, image/url resolution, and formatting.
 *
 * @example
 * items.map((item) => (
 *   <Link key={item.id} href={item.href} onClick={...}>
 *     <EventCard title={...} imageSrc={...} date={...} description={...} />
 *   </Link>
 * ))
 */
const EventCard: FC<EventCardProps> = ({
    title,
    subtitle,
    date,
    time,
    description,
    imageSrc,
    imageAlt = '',
    fallbackImage,
    fallbackType,
    logo: logoProp,
    logoDark: logoDarkProp,
    topLeftBadge,
    topRightBadge,
    size = 'sm',
    classNames,
    header,
    footer,
}) => {
    const { sectionTitleFont } = useFont();
    const locale = useLocale();
    const website = useSite().website;
    const logo = logoProp ?? website?.logo ?? null;
    const logoDark = logoDarkProp ?? website?.logo_dark ?? null;
    return (
        <div
            className={cn(
                'mb-2 flex w-full flex-1 flex-col md:hover:shadow-sm lg:p-2 pr-3 rounded-lg md:hover:bg-gray-400/10',
                classNames?.wrapper
            )}
        >
            {header ? (
                header
            ) : (
                <div
                    className={cn(
                        'relative w-full shrink-0',
                        {
                            'aspect-video': size === 'xl',
                            'aspect-4/3': size === 'sm',
                        },
                        classNames?.imageWrapper
                    )}
                >
                    <FallbackImage
                        src={imageSrc}
                        fallbackImage={fallbackImage}
                        fallbackType={fallbackType}
                        logo={logo}
                        logoDark={logoDark}
                        alt={imageAlt || title || ''}
                        fill
                        className={cn('rounded-lg', classNames?.image)}
                        sizes="(min-width: 1024px) 264px, 208px"
                    />

                    {topLeftBadge && (
                        <div className="absolute top-0 left-0 z-10">{topLeftBadge}</div>
                    )}
                    {topRightBadge && (
                        <div className="absolute top-0 right-0 z-10">{topRightBadge}</div>
                    )}
                </div>
            )}

            <div className={cn('flex flex-col space-y-1 py-2', classNames?.body)}>
                {title && (
                    <h3
                        className={cn(
                            'font-heading text-gray-800 line-clamp-2 text-md md:text-base leading-5 md:leading-6',
                            sectionTitleFont.className,
                            classNames?.title
                        )}
                    >
                        <Balancer>{title}</Balancer>
                    </h3>
                )}

                {subtitle && (
                    <div
                        className={cn(
                            'text-primary font-semibold text-xs md:text-sm',
                            classNames?.subtitle
                        )}
                    >
                        {subtitle}
                    </div>
                )}

                {date && time && (
                    <div className={cn('text-primary text-xs md:text-sm', classNames?.date)}>
                        {DateTime.fromFormat(`${date} ${time}`, 'dd/MM/yyyy HH:mm:ss')
                            .setLocale(locale)
                            .toLocaleString({
                                weekday: 'short',
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })
                            ?.replace(/^(\w)/, (match) => match.toUpperCase())}
                    </div>
                )}

                {description && (
                    <div
                        className={cn(
                            'mt-auto flex text-gray-600 text-xs md:text-sm',
                            classNames?.description
                        )}
                    >
                        <Balancer>
                            <span className="line-clamp-2">{description}</span>
                        </Balancer>
                    </div>
                )}
            </div>

            {footer && footer}
        </div>
    );
};

export default EventCard;
