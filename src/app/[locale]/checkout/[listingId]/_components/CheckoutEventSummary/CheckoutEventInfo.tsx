import { DateTime } from 'luxon';
import { useLocale, useTranslations } from 'next-intl';

import { getTranslation } from '@/utils/common';
import { CITY_KEY_PREFIX, COUNTRY_KEY_PREFIX } from '@/constants/translation';

import { useCheckoutData } from '../../_providers/CheckoutDataProvider';

interface Props {
    hideDetails?: boolean;
}

export default function CheckoutEventInfo({ hideDetails = false }: Props) {
    const locale = useLocale();
    const t = useTranslations();

    const { data } = useCheckoutData();

    // Extract data
    const {
        eventName,
        venueName,
        eventDate,
        eventTime,
        eventCountry,
        eventCity,
        category,
        block,
        row,
    } = data;

    const translatedCity = getTranslation(t, eventCity, CITY_KEY_PREFIX);
    const translatedCountry = getTranslation(t, eventCountry, COUNTRY_KEY_PREFIX);
    const displayLocation = `${venueName}, ${translatedCity}, ${translatedCountry}`;
    const eventDateTime = DateTime.fromSQL(`${eventDate} ${eventTime}`).setLocale(locale);

    const parts = [category && category, block && `Block ${block}`, row && `Row ${row}`].filter(
        Boolean
    );

    return (
        <div className="space-y-1 md:space-y-2 text-black">
            <p className="font-semibold text-xl">{eventName}</p>

            <div>
                {/* Date time */}
                <p className="font-medium md:font-semibold text-sm md:text-base capitalize">
                    <span className="capitalize">{eventDateTime.toFormat('ccc LLL dd, yyyy')}</span>
                    {' • '}
                    <span className="uppercase">{eventDateTime.toFormat('h:mm a')}</span>
                </p>

                <p className="font-medium text-sm md:text-base">{displayLocation}</p>
            </div>

            {!hideDetails && (
                <p className="md:hidden font-medium text-sm md:text-base">{parts.join(' · ')}</p>
            )}
        </div>
    );
}
