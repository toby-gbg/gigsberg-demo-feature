'use client';

import { Fragment } from 'react/jsx-runtime';
import { DateTime } from 'luxon';
import { useTranslations } from 'next-intl';

import Order from '@/interfaces/Order';
import { getTranslation } from '@/utils/common';
import { CAT_KEY_PREFIX, CITY_KEY_PREFIX, COUNTRY_KEY_PREFIX } from '@/constants/translation';

import FallbackImage from '@/components/FallbackImage';

const InfoRow = ({ label, value }: { label: string; value: string | null }) => (
    <Fragment>
        <p className="text-gray-600 capitalize">{label}</p>
        <p className="font-medium text-gray-800 ltr:text-right rtl:text-left capitalize">{value}</p>
    </Fragment>
);

interface Props {
    locale: string;
    order: Order;
}

export default function ThankYouListingDetails({ order, locale }: Props) {
    const t = useTranslations();
    const {
        eventDate,
        eventTime,
        eventCity,
        eventCountry,
        venueName,
        listingCategory,
        listingBlock,
        listingRow,
        performerImageUrl,
        ticketType,
    } = order;

    const translatedCity = getTranslation(t, eventCity, CITY_KEY_PREFIX);
    const translatedCountry = getTranslation(t, eventCountry, COUNTRY_KEY_PREFIX);
    const displayLocation = `${venueName}, ${translatedCity}, ${translatedCountry}`;

    const details = [
        {
            label: t('type'),
            value: t(ticketType.toLowerCase()),
            show: true,
        },
        {
            label: t('category'),
            value: getTranslation(t, listingCategory || '', CAT_KEY_PREFIX),
            show: true,
        },
        {
            label: t('block'),
            value: listingBlock,
            show: !!listingBlock,
        },
        {
            label: t('row'),
            value: listingRow,
            show: !!listingRow,
        },
    ];

    return (
        <div className="rounded-xl shadow-xs border overflow-hidden border-border">
            <div className="h-40 w-full shrink-0 relative">
                <FallbackImage
                    src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/performers/${performerImageUrl}`}
                    alt="Artist"
                    fill
                    sizes="(min-width: 1024px) 420px, calc(100vw - 32px)"
                    className="object-cover"
                />
            </div>

            <div className="space-y-1 md:space-y-2 p-4">
                <p className="font-semibold md:text-xl">{order.eventName}</p>

                <div>
                    {/* Date time */}
                    <p className="text-main-end font-medium text-sm md:text-base md:font-semibold capitalize">
                        {DateTime.fromSQL(`${eventDate} ${eventTime}`)
                            .setLocale(locale)
                            .toFormat('ccc LLL dd, yyyy • h:mm a')}
                    </p>

                    <p className="font-medium text-sm md:text-base">{displayLocation}</p>
                </div>

                <hr className="border-dashed border-gray-200 px-4" />

                <div className="grid grid-cols-2 gap-2 text-sm md:text-base">
                    {details
                        .filter((d) => d.show)
                        .map((detail, index) => (
                            <InfoRow key={index} label={detail.label} value={detail.value} />
                        ))}
                </div>
            </div>
        </div>
    );
}
