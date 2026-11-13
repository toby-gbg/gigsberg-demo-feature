'use client';

import { FC, MouseEventHandler, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { EventTicket } from '@/interfaces/Event';
import GoogleAnalyticsTracker from '@/lib/seo/GoogleAnalyticsTracker';
import { getTranslation, isUrl } from '@/utils/common';
import { getDateProximityLabel } from '@/utils/dateProximityLabel';
import { getEventImage, getTranslatedEventName } from '@/utils/event';
import GoogleEventMapper, { CreativeNameEnum, CreativeSlotEnum } from '@/utils/GoogleEventMapper';
import { CITY_KEY_PREFIX, COUNTRY_KEY_PREFIX } from '@/constants/translation';

import { useSite } from '@/providers/SiteProvider';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import useIntlRouter from '@/hooks/useIntlRouter';

import DateProximityLabel from '@/components/DateProximityLabel';
import EventCard from '@/components/event-card/EventCard';
import Link from '@/components/Link';

interface EventCardsViewItemProps {
    event: EventTicket;
    className?: string;
    creativeName?: CreativeNameEnum;
    creativeSlot?: CreativeSlotEnum;
    showBadge?: boolean;
    badgeText?: string;
    onClickInternationalEvent: (url: string) => void;
    onVisible?: () => void;
}

export const EventCardsViewItem: FC<EventCardsViewItemProps> = ({
    event,
    className,
    creativeName,
    creativeSlot,
    showBadge = false,
    badgeText = '',
    onClickInternationalEvent,
    onVisible,
}) => {
    const {
        url,
        performerImage,
        image,
        subtypeImage,
        eventName,
        eventDate,
        eventTime,
        venueName,
        venueNameTranslationKey,
        cityName,
        countryName,
        countryCode,
        typeNameUrl,
        tourImage,
    } = event;

    const t = useTranslations();
    const router = useIntlRouter();
    const params = useParams<{ type?: string; subtype?: string }>();
    const domainInfo = useSite().domainInfo;
    const { config } = domainInfo || {};

    const { ref, hasBeenVisible } = useIntersectionObserver({
        threshold: 0.5,
        rootMargin: '0px',
        root: null,
    });

    useEffect(() => {
        if (hasBeenVisible && onVisible) {
            onVisible();
        }
    }, [hasBeenVisible, onVisible]);

    const onClick: MouseEventHandler<HTMLAnchorElement> = (e) => {
        e.preventDefault();

        const promotionEventData = GoogleEventMapper.mapEventToPromotionEventData(
            {
                ...event,
                typeNameUrl: event.typeNameUrl ?? params.type,
                subtypeNameUrl: event.subtypeNameUrl ?? params.subtype,
            },
            creativeName ?? CreativeNameEnum.TRENDING_EVENTS,
            creativeSlot ?? CreativeSlotEnum.HOME_PAGE
        );

        if (promotionEventData.items && promotionEventData.items.length > 0) {
            GoogleAnalyticsTracker.triggerGA4PromotionEvent('select_promotion', {
                ...promotionEventData,
                items: [promotionEventData.items[0]],
            });
        }

        const onlySupportedCountryCodes = config?.features?.onlySupportedCountryCodes;

        if (onlySupportedCountryCodes && !onlySupportedCountryCodes.includes(countryCode)) {
            return onClickInternationalEvent(url);
        }

        return router.push(url, { scroll: true });
    };

    const imageSrc = getEventImage({ image, performerImage });
    //Fallback hierarchy: performer -> tour -> subtype -> type
    const fallbackImage =
        image && performerImage
            ? `${process.env.NEXT_PUBLIC_IMAGE_URL}/performers/${performerImage}`
            : tourImage
              ? `${process.env.NEXT_PUBLIC_IMAGE_URL}/tours/${tourImage}`
              : subtypeImage
                ? isUrl(subtypeImage)
                    ? subtypeImage
                    : `${process.env.NEXT_PUBLIC_IMAGE_URL}/subtypes/${subtypeImage}`
                : undefined;
    const title = getTranslatedEventName(t, event);

    const translatedCity = getTranslation(t, cityName, CITY_KEY_PREFIX);
    const translatedCountry = getTranslation(t, countryName, COUNTRY_KEY_PREFIX);
    const description = `${venueNameTranslationKey ? t(venueNameTranslationKey) : venueName}, ${translatedCity}, ${translatedCountry}`;
    const proximityLabel = getDateProximityLabel(eventDate, eventTime);

    return (
        <div ref={ref} className={className}>
            <Link
                prefetch={false}
                href={url}
                onClickCapture={onClick}
                scroll
                className="flex w-full flex-1 flex-col"
            >
                <EventCard
                    title={title}
                    imageSrc={imageSrc}
                    imageAlt={eventName}
                    fallbackImage={fallbackImage}
                    fallbackType={typeNameUrl}
                    date={eventDate}
                    time={eventTime}
                    description={description}
                    topRightBadge={
                        proximityLabel ? (
                            <div className="pt-2 mr-2 flex gap-2 flex-wrap justify-end">
                                {proximityLabel && (
                                    <DateProximityLabel label={proximityLabel} className="static" />
                                )}
                            </div>
                        ) : undefined
                    }
                />
                {showBadge && badgeText && (
                    <div className="bg-festival-badge bg-cover bg-repeat-x bg-center px-4 py-1">
                        <p className="font-bold text-[18px] text-white text-center uppercase tracking-wide">
                            {badgeText}
                        </p>
                    </div>
                )}
            </Link>
        </div>
    );
};
