import { Fragment, memo, Ref } from 'react';
import classNames from 'classnames';

import { EventTicket } from '@/interfaces/Event';

import EventDetailsCardsView from '@/components/EventDetailsCardsView';
import SubTitle from '@/components/SubTitle';

interface EventGroupSectionProps {
    events: EventTicket[];
    title: string;
    sectionRef?: Ref<HTMLDivElement>;
    subTitleClassName?: string;
    currencyCode: string;
}

const EventGroupSection = memo(function EventGroupSection({
    events,
    subTitleClassName,
    title,
    sectionRef,
    currencyCode,
}: EventGroupSectionProps) {
    if (!events || events.length <= 0) return null;

    return (
        <Fragment>
            <SubTitle
                className={classNames('mb-4 font-semibold text-gray-800', subTitleClassName)}
                title={title}
            />
            <div ref={sectionRef} className="flex flex-col gap-y-4">
                <EventDetailsCardsView
                    events={events}
                    shouldShowMinPrice
                    currencyCode={currencyCode}
                />
            </div>
        </Fragment>
    );
});

export default EventGroupSection;
