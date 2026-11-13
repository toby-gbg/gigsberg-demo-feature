'use client';

import { FC, memo, MouseEventHandler, useCallback, useEffect } from 'react';
import {
    $eventNotifiyMe,
    $eventNotifyMeModal,
} from '@/app/[locale]/[type]/[subtype]/[event]/_stores';

import { EventTicket } from '@/interfaces/Event';
import { PerformerEventClickData } from '@/interfaces/trackers/GoogleAnalystic';
import { $internationalEventModal, $internationalEventUrl } from '@/stores/modal';
import GoogleAnalyticsTracker from '@/lib/seo/GoogleAnalyticsTracker';
import { checkEventHasValidMinPrice } from '@/utils/event';
import { GOOGLE_ANALYTICS_EVENT_KEYS } from '@/constants/trackers';

import { useSite } from '@/providers/SiteProvider';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import useIntlRouter from '@/hooks/useIntlRouter';

import EventDetailsCard from './EventDetailsCard/EventDetailsCard';

interface EventSearchCardProps {
    event: EventTicket;
    shouldShowMinPrice?: boolean;
    onVisible?: () => void;
    currencyCode?: string;
}

const EventSearchCard: FC<EventSearchCardProps> = ({
    onVisible,
    event,
    shouldShowMinPrice = false,
    currencyCode = 'USD',
}) => {
    const { url, lowestPrice, lowestPriceCurrency, countryCode, performerId } = event;
    const router = useIntlRouter();

    // Nano stores
    const { domain, config } = useSite().domainInfo || {};
    const { onlySupportedCountryCodes = false } = config?.features || {};

    const eventHasValidMinPrice = checkEventHasValidMinPrice({
        lowestPrice: lowestPrice ?? null,
        lowestPriceCurrency: lowestPriceCurrency ?? null,
    });

    const eventId = String(event.eventId ?? event.id);
    const resolvedCurrency = currencyCode || lowestPriceCurrency || 'USD';

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

    const onClickInternationalEvent = (url: string) => {
        if (!url) return;
        $internationalEventUrl.set(url);
        $internationalEventModal.set(true);
    };

    const handleNotifyMeClick = () => {
        if (!event) return;
        $eventNotifiyMe.set(event);
        $eventNotifyMeModal.set(true);
    };

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

    // Stabilized with useCallback so this memoized card only re-renders when
    // its own props actually change, not on every parent list re-render.
    const handleCardClick: MouseEventHandler<HTMLAnchorElement> = useCallback(
        (e) => {
            e.preventDefault();
            trackPerformerEventClick();

            // Redirect to international site if the event country is not supported by this brand/domain
            if (onlySupportedCountryCodes && !onlySupportedCountryCodes.includes(countryCode)) {
                return onClickInternationalEvent?.(url);
            }

            return router.push(url, { scroll: true });
        },

        [event, url, onlySupportedCountryCodes, countryCode, onClickInternationalEvent, router]
    );

    return (
        <div className="relative" ref={ref}>
            <EventDetailsCard
                event={event}
                handleCardClick={handleCardClick}
                handleNotifyMeClick={handleNotifyMeClick}
                shouldShowMinPrice={shouldShowMinPrice}
            />
        </div>
    );
};

export default memo(EventSearchCard);
