'use client';

import { FC, memo, MouseEventHandler, useCallback, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { DateTime } from 'luxon';
import { useLocale, useTranslations } from 'next-intl';

import { EventTicket } from '@/interfaces/Event';
import { EventSaleTime } from '@/interfaces/Listing';
import { PerformerEventClickData } from '@/interfaces/trackers/GoogleAnalystic';
import { cn } from '@/lib/cn';
import GoogleAnalyticsTracker from '@/lib/seo/GoogleAnalyticsTracker';
import { fallbackTranslation, getTimezoneValue, getTranslation } from '@/utils/common';
import { getDateProximityLabel } from '@/utils/dateProximityLabel';
import {
    checkEventHasValidMinPrice,
    isEventAvailableForSale as checkIsEventOpenForSale,
} from '@/utils/event';
import { GOOGLE_ANALYTICS_EVENT_KEYS } from '@/constants/trackers';
import { CITY_KEY_PREFIX, COUNTRY_KEY_PREFIX } from '@/constants/translation';

import { useSite } from '@/providers/SiteProvider';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import useIntlRouter from '@/hooks/useIntlRouter';

import DateProximityLabel from '../DateProximityLabel';
import Link from '../Link';
import { Button } from '../ui/Button';
import EventMinPrice from './EventMinPrice';
import EventNotifyMeButton from './EventNotifyMeButton';
import EventOpenSaleCountdown from './EventOpenSaleCountdown';

interface EventDetailsCardProps {
    event: EventTicket;
    shouldShowMinPrice?: boolean;
    onClickInternationalEvent?: (url: string) => void;
    onClick?: (event: EventTicket) => void;
    onNotifyMe?: (event: EventTicket) => void;
    onVisible?: () => void;
    currencyCode: string;
}

const SellingFastTag: FC = () => {
    const t = useTranslations();
    const translatedSellingFast = fallbackTranslation(
        t('selling_fast_tag'),
        'selling_fast_tag',
        'Selling Fast'
    );

    return (
        <div className="md:right-6 flex items-center gap-1 bg-[#FCF0E6] px-2 py-1 border border-[#DC6803] rounded-[80px] w-max text-[#7A2E0E]">
            <span className="text-sm leading-none">🔥</span>
            <span className="text-[#7A2E0E] text-[10px] leading-4">{translatedSellingFast}</span>
        </div>
    );
};

const EventDetailsCard: FC<EventDetailsCardProps> = ({
    onClickInternationalEvent,
    onClick,
    onVisible,
    onNotifyMe,
    event,
    shouldShowMinPrice = false,
    currencyCode = 'USD',
}) => {
    const t = useTranslations();
    const {
        eventDate,
        eventName,
        eventTime,
        url,
        lowestPrice,
        lowestPriceCurrency,
        countryName,
        cityName,
        venueName,
        countryCode,
        openSaleDate,
        openSaleTime,
        openSaleTimezone,
        typeNameUrl,
        tour,
        performerId,
        sellingFast,
    } = event;
    const locale = useLocale();
    const router = useIntlRouter();

    const timezoneValue = getTimezoneValue(openSaleTimezone);

    // Nano stores
    const { domain, config } = useSite().domainInfo || {};
    const { useBrandStyling = false, onlySupportedCountryCodes = false } = config?.features || {};

    // Combined into one memo instead of three separate DateTime.toFormat()
    // calls per render — this component renders up to 32+ times per page,
    // so tripling that with unmemoized Luxon/Intl formatting adds up.
    const dateParts = useMemo(() => {
        if (!eventDate) return null;
        const parsed = DateTime.fromFormat(eventDate, 'dd/MM/yyyy');
        if (!parsed.isValid) return null;

        return {
            year: parsed.toFormat('yyyy', { locale }),
            monthDay: parsed.toFormat('LLL dd', { locale }),
            weekday: parsed.toFormat('ccc', { locale })?.toUpperCase(),
        };
    }, [eventDate, locale]);

    // translate city and country
    const translatedCity = getTranslation(t, cityName, CITY_KEY_PREFIX);
    const translatedCountry = getTranslation(t, countryName, COUNTRY_KEY_PREFIX);

    const eventHasValidMinPrice = checkEventHasValidMinPrice({
        lowestPrice: lowestPrice ?? null,
        lowestPriceCurrency: lowestPriceCurrency ?? null,
    });

    const openSaleDateTime: EventSaleTime = {
        open_sale_timestamp: event?.openSaleTimestamp,
        open_sale_date: event?.openSaleDate,
        open_sale_time: event?.openSaleTime,
        ianaZone: event?.ianaZone,
    };
    const isEventOpenForSale = checkIsEventOpenForSale(openSaleDateTime);

    // WLB-1959: Only the entity event API returns a reliable min price, so shouldShowMinPrice is only enabled in performer page. A valid min price guarantees that tickets are available; elsewhere, still show "Tickets" button. (Jira comment: https://gigsberg.atlassian.net/browse/WLB-1959?focusedCommentId=38060)

    const isEventAvailableForSale = isEventOpenForSale;
    // const isEventAvailableForSale =
    //     (eventHasValidMinPrice || !shouldShowMinPrice) && isEventOpenForSale;
    const eventId = String(event.eventId ?? event.id);
    const resolvedCurrency = currencyCode || lowestPriceCurrency || 'USD';

    const eventTimeFormatted = useMemo(() => {
        return eventTime ? eventTime.split(':')[0] + ':' + eventTime.split(':')[1] : '';
    }, [eventTime]);
    // Intersection Observer for tracking visibility
    const { ref, hasBeenVisible } = useIntersectionObserver({
        threshold: 0.5,
        rootMargin: '0px',
        root: null,
    });

    // Trigger GA4 event when element first saw
    useEffect(() => {
        if (hasBeenVisible && onVisible) {
            onVisible();
        }
    }, [hasBeenVisible, onVisible]);

    const trackPerformerEventClick = () => {
        if (!performerId) return;

        GoogleAnalyticsTracker.triggerGA4Event<PerformerEventClickData>({
            event: GOOGLE_ANALYTICS_EVENT_KEYS.PERFORMER_EVENT_CLICK,
            key: GOOGLE_ANALYTICS_EVENT_KEYS.PERFORMER_EVENT_CLICK,
            data: {
                performer_id: performerId?.toString(),
                event_id: eventId,
                price_shown: eventHasValidMinPrice,
                currency: resolvedCurrency,
                domain: domain ?? '',
            },
        });
    };

    const handleNotifyMeClick = () => {
        if (onNotifyMe) {
            onNotifyMe(event);
        }
    };

    // Stabilized with useCallback so this memoized card only re-renders when
    // its own props actually change, not on every parent list re-render.
    const handleCardClick: MouseEventHandler<HTMLAnchorElement> = useCallback(
        (e) => {
            e.preventDefault();
            if (onClick) return onClick(event);
            trackPerformerEventClick();

            // Redirect to international site if the event country is not supported by this brand/domain
            if (onlySupportedCountryCodes && !onlySupportedCountryCodes.includes(countryCode)) {
                return onClickInternationalEvent?.(url);
            }

            return router.push(url, { scroll: true });
        },

        [
            onClick,
            event,
            url,
            onlySupportedCountryCodes,
            countryCode,
            onClickInternationalEvent,
            router,
        ]
    );

    // date-proximity label
    const proximityLabel = useMemo(
        () => getDateProximityLabel(eventDate, eventTime),
        [eventDate, eventTime]
    );

    return (
        <div className="relative" ref={ref}>
            <div
                className={cn(
                    'group block relative bg-white border border-[#E0E0E0] rounded-3xl w-full overflow-hidden transition-[border-color,box-shadow]',
                    'hover:border-primary hover:shadow-[0px_4px_20px_-8px_#00000017,0px_0px_32px_0px_#52410314]',
                    useBrandStyling && 'hover:border-[#6D9FD6]' // TODO: will refactor when we have color tokens
                )}
            >
                {isEventAvailableForSale ? (
                    <Link
                        prefetch={false}
                        href={url}
                        onClick={handleCardClick}
                        className="absolute inset-0 w-full h-full"
                        scroll
                    />
                ) : (
                    <div
                        className="absolute inset-0 w-full h-full cursor-pointer"
                        onClick={handleNotifyMeClick}
                    />
                )}
                <article className={'flex items-center gap-3 px-2 py-4 md:px-6 '}>
                    <div className="flex md:flex-1 justify-between items-center gap-2 md:gap-10 w-full">
                        <section className="flex flex-col items-center gap-0.5 min-w-15.5 text-center">
                            {/* Event year */}
                            <p className="font-normal text-[#616161] text-xs">{dateParts?.year}</p>

                            {/* Event month and day */}
                            <p
                                className={cn(
                                    'font-bold text-primary text-sm md:text-base capitalize',
                                    useBrandStyling && 'text-[#1565C0]'
                                )}
                            >
                                {dateParts?.monthDay}
                            </p>

                            {/* Event day of the week */}
                            <p className="font-normal text-[#616161] text-xs">
                                {dateParts?.weekday}
                            </p>

                            {/* Event hour */}
                            <p className="font-normal text-[#616161] text-xs">
                                {eventTimeFormatted}
                            </p>
                        </section>

                        <section className="flex flex-col gap-1 text-gray-600 ltr:text-left rtl:text-right grow">
                            {typeNameUrl === 'sport' && tour && (
                                <h6 className="text-black text-md md:text-base">{tour.name}</h6>
                            )}

                            {/* Event name */}
                            <h3
                                className={cn(
                                    'font-medium text-primary text-sm md:text-lg text-ellipsis line-clamp-2',
                                    useBrandStyling && 'text-[#0F53A1]'
                                )}
                            >
                                {eventName}
                            </h3>

                            {/* Event location */}
                            <p className="font-normal text-[#737373] text-xs md:text-sm">
                                <span>
                                    {venueName}, {translatedCity}, {translatedCountry}
                                </span>

                                {countryCode !== '000' && (
                                    <Image
                                        className="inline-block ml-1 w-2 md:w-4 h-1.5 md:h-3 -translate-y-px pointer-events-none"
                                        src={`https://flagcdn.com/16x12/${countryCode.toLowerCase()}.png`}
                                        alt={`${countryCode} Flag`}
                                        width={16}
                                        height={12}
                                    />
                                )}
                            </p>

                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                {/* Selling fast tag */}
                                {sellingFast && <SellingFastTag />}
                                {proximityLabel && (
                                    <DateProximityLabel variant="tag" label={proximityLabel} />
                                )}
                            </div>
                        </section>
                    </div>
                    <section className="flex shrink-0 flex-col justify-center md:justify-end items-end gap-1 w-25 min-w-22.75 md:w-30 text-center">
                        <div className="flex flex-col items-center gap-1 w-full">
                            {/* CTA button section */}
                            {!isEventAvailableForSale && (
                                <div className="z-0 flex justify-end w-full">
                                    <EventNotifyMeButton
                                        event={event}
                                        onClick={handleNotifyMeClick}
                                    />
                                </div>
                            )}
                            {isEventAvailableForSale && (
                                <Link
                                    prefetch={false}
                                    href={url}
                                    onClick={handleCardClick}
                                    className="z-0 flex justify-end w-full"
                                >
                                    <Button
                                        className={cn(
                                            'hover:opacity-90 shadow px-2 md:px-3 py-2 border rounded-lg w-full h-auto min-h-10 whitespace-normal wrap-anywhere text-sm md:text-lg transition-opacity max-md:min-h-0',
                                            useBrandStyling &&
                                                'bg-[#1565C0] group-hover:bg-[#4282C4] hover:bg-[#4282C4] hover:opacity-100'
                                        )}
                                    >
                                        <span className="font-bold text-xs md:text-sm">
                                            {fallbackTranslation(
                                                t('tickets'),
                                                'tickets',
                                                'Tickets'
                                            )}
                                        </span>
                                    </Button>
                                </Link>
                            )}

                            {/* event min price */}
                            {isEventAvailableForSale && shouldShowMinPrice && (
                                <EventMinPrice event={event} currencyCode={currencyCode ?? 'USD'} />
                            )}
                        </div>

                        {/* Open sale countdown text */}
                        <div className="w-full text-center">
                            <EventOpenSaleCountdown
                                openSaleTimestamp={event.openSaleTimestamp}
                                openSaleDate={openSaleDate}
                                openSaleTime={openSaleTime}
                                openSaleTimezone={timezoneValue}
                            />
                        </div>
                    </section>
                </article>
            </div>
        </div>
    );
};

export default memo(EventDetailsCard);
