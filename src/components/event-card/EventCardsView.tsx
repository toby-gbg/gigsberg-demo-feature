'use client';

import { useCallback, useRef } from 'react';
import debounce from 'lodash-es/debounce';

import { EventTicket } from '@/interfaces/Event';
import { $internationalEventModal, $internationalEventUrl } from '@/stores/modal';
import GoogleAnalyticsTracker from '@/lib/seo/GoogleAnalyticsTracker';
import GoogleEventMapper, { CreativeNameEnum, CreativeSlotEnum } from '@/utils/GoogleEventMapper';

import { CarouselSection } from '@/components/carousel/CarouselSection';

import { CarouselItem } from '../carousel/CarouselItem';
import { EventCardsViewItem } from './EventCardsViewItem';

interface Props {
    events: EventTicket[];
    creativeName?: CreativeNameEnum;
    creativeSlot?: CreativeSlotEnum;
    showBadge?: boolean;
    badgeText?: string;
    initSnapCount?: number;
    itemClassName?: string;
}

export default function EventCardsView({
    events,
    creativeName,
    creativeSlot,
    showBadge,
    badgeText,
    initSnapCount,
    itemClassName,
}: Props) {
    const trackedEventIds = useRef<Set<string>>(new Set());
    const onClickInternationalEvent = (url: string) => {
        if (!url) return;
        $internationalEventUrl.set(url);
        $internationalEventModal.set(true);
    };

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
        [debouncedGA4, creativeName, creativeSlot]
    );
    const handleClickArrow = useCallback((arrow: 'prev' | 'next') => {
        GoogleAnalyticsTracker.triggerCarouselArrowClick({
            arrow,
            list_type: 'event_list',
        });
    }, []);

    return (
        <CarouselSection onArrowClick={handleClickArrow} initSnapCount={initSnapCount}>
            {events.map((event, index) => (
                <CarouselItem key={index} className={itemClassName}>
                    <EventCardsViewItem
                        event={event}
                        creativeName={creativeName}
                        creativeSlot={creativeSlot}
                        showBadge={showBadge}
                        badgeText={badgeText}
                        onClickInternationalEvent={onClickInternationalEvent}
                        onVisible={() => handleCardVisible(event)}
                    />
                </CarouselItem>
            ))}
        </CarouselSection>
    );
}
