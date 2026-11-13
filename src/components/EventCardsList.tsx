'use client';

import { FC, Fragment, useCallback, useRef } from 'react';
import debounce from 'lodash-es/debounce';

import { EventTicket } from '@/interfaces/Event';
import GoogleAnalyticsTracker from '@/lib/seo/GoogleAnalyticsTracker';
import GoogleEventMapper, { CreativeNameEnum, CreativeSlotEnum } from '@/utils/GoogleEventMapper';

import EventDetailsCard from '@/components/EventSearchCard';

interface EventCardsListProps {
    events: EventTicket[];
    creativeName?: CreativeNameEnum;
    creativeSlot?: CreativeSlotEnum;
    currencyCode: string;
}

const EventCardsList: FC<EventCardsListProps> = ({
    events,
    creativeName,
    creativeSlot,
    currencyCode,
}) => {
    const trackedEventIds = useRef<Set<string>>(new Set());

    // Debounced GA4 trigger (1 item per time)
    const debouncedGA4 = useRef(
        debounce((promotionEventData) => {
            GoogleAnalyticsTracker.triggerGA4PromotionEvent('view_promotion', {
                ...promotionEventData,
                items: [promotionEventData.items[0]],
            });
        }, 200)
    ).current;

    const handleCardVisible = useCallback(
        (event: EventTicket) => {
            if (trackedEventIds.current.has(String(event.id))) return;
            trackedEventIds.current.add(String(event.id));
            const item = GoogleEventMapper.mapEventToPromotionEventData(
                event,
                creativeName ?? CreativeNameEnum.MOST_WANTED_EVENTS,
                creativeSlot ?? CreativeSlotEnum.HOME_PAGE
            );
            debouncedGA4(item);
        },
        [debouncedGA4]
    );

    return (
        <Fragment>
            {events.map((event, index) => (
                <EventDetailsCard
                    key={index}
                    event={event}
                    onVisible={() => handleCardVisible(event)}
                    currencyCode={currencyCode}
                />
            ))}
        </Fragment>
    );
};

export default EventCardsList;
