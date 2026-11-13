'use client';

import { FC, memo } from 'react';
import { useTranslations } from 'next-intl';

import { EventTicket } from '@/interfaces/Event';
import { fallbackTranslation } from '@/utils/common';

import EventDetailsCard from '@/components/EventDetailsCard/EventDetailsCard';

const EventSellTicketsCard: FC<{
    event: EventTicket;
    shouldShowMinPrice?: boolean;
}> = ({ event, shouldShowMinPrice = false }) => {
    const t = useTranslations();

    const eventId = String(event.eventId ?? event.id);

    return (
        <EventDetailsCard
            event={event}
            ctaProps={{
                url: `/sell-ticket/${eventId}`,
                label: fallbackTranslation(t('start_selling'), 'start_selling', 'Start Selling'),
            }}
            shouldShowMinPrice={shouldShowMinPrice}
            canSell
        />
    );
};

interface SellTicketsEventCardsViewProps {
    events?: EventTicket[];
    isLoading?: boolean;
}

const SellTicketsEventCardsView: FC<SellTicketsEventCardsViewProps> = ({ events, isLoading }) => {
    const t = useTranslations();

    if ((events || []).length <= 0 && !isLoading) {
        return (
            <div className="mx-auto">
                <p className="font-normal text-[#616161] text-lg">
                    {fallbackTranslation(
                        t('no_upcoming_events_message'),
                        'no_upcoming_events_message',
                        'No upcoming events available right now. Explore popular events or check back later for new ticket listings.'
                    )}
                </p>
            </div>
        );
    }

    return (
        <>
            {events?.map((event) => (
                <EventSellTicketsCard key={event.eventId ?? event.id} event={event} />
            ))}
        </>
    );
};

export default memo(SellTicketsEventCardsView);
