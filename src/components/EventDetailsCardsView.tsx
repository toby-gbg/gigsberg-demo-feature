'use client';

import { FC, memo } from 'react';

import { EventTicket } from '@/interfaces/Event';

import EventSearchCard from '@/components/EventSearchCard';

interface EventDetailsCardsViewProps {
    events?: EventTicket[];
    shouldShowMinPrice?: boolean;
    currencyCode: string;
}

const EventDetailsCardsView: FC<EventDetailsCardsViewProps> = ({
    events,
    shouldShowMinPrice,
    currencyCode,
}) => {
    return (
        <>
            {events?.map((event) => (
                <EventSearchCard
                    key={event.eventId ?? event.id}
                    event={event}
                    shouldShowMinPrice={shouldShowMinPrice}
                    currencyCode={currencyCode}
                />
            ))}
        </>
    );
};

export default memo(EventDetailsCardsView);
