'use client';

import { useTranslations } from 'next-intl';

import { EventTicketByCity } from '@/interfaces/Event';
import { EventsByCityResponse } from '@/interfaces/Fetch';
import { fallbackTranslation } from '@/utils/common';
import { getTypeSubtypeTranslations } from '@/utils/translation/getTypeSubtypeTranslations';

import useFooterImages from '@/hooks/useFooterImages';

import EventCardsView from '@/components/event-card/EventCardsView';
import Link from '@/components/Link';
import SubTitle from '@/components/SubTitle';

interface Props {
    typeData: EventsByCityResponse<EventTicketByCity>;
}

const CityBody: React.FC<Props> = ({ typeData }) => {
    const t = useTranslations();
    const translatedType = getTypeSubtypeTranslations(t, typeData.name);
    const events = typeData.events.map((event) => ({
        ...event,
        id: event.id ?? event.eventId,
        eventName: event.eventName ?? event.name,
        eventDate: event.eventDate ?? event.date,
        eventTime: event.eventTime ?? event.time,
        cityName: event.cityName ?? event.city,
    }));

    useFooterImages({ events, clearOnUnmount: false, appendToExisting: true });
    const translatedViewMore = `${fallbackTranslation(t('view_more'), 'view_more', 'View more')} >>`;
    const { cityId, countryId } = events[0];

    return (
        <div className="mb-6">
            <div className="flex justify-between items-center mb-3 capitalize">
                <SubTitle title={translatedType} className="mb-5" />
                <Link
                    href={{
                        pathname: `/${typeData.nameUrl}-tickets`,
                        query: {
                            cityId,
                            countryId,
                        },
                    }}
                    className="px-4 py-2 font-medium text-black hover:underline"
                >
                    {translatedViewMore}
                </Link>
            </div>

            <EventCardsView events={events} />
        </div>
    );
};

export default CityBody;
