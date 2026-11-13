'use client';

import { Fragment } from 'react';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { DateTime } from 'luxon';
import { useLocale, useTranslations } from 'next-intl';

import { EventDetail } from '@/interfaces/Event';
import {
    artistUrlBuilder,
    capitalizeWords,
    getTranslation,
    REGEXP_PREPOSITIONS_MATCH,
    removeTicketsSuffix,
} from '@/utils/common';
import { findAndApplyStringRule } from '@/utils/seo';
import { getTypeSubtypeTranslations } from '@/utils/translation/getTypeSubtypeTranslations';
import { CITY_KEY_PREFIX } from '@/constants/translation';

import { useSite } from '@/providers/SiteProvider';
import useFont from '@/hooks/useFont';

import Guarentee from '@/components/Guarentee';
import Link from '@/components/Link';
import ShareTo from '@/components/ShareTo';

import { getEventTitleSegments } from '../_utils/listing-event-title.util';

interface Props {
    eventDetails: EventDetail;
    type: string;
    subtype: string;
    event: string;
    h1?: string | null;
}

export default function EventBasicInformation({ eventDetails, type, subtype, event, h1 }: Props) {
    const t = useTranslations();
    const { config } = useSite().domainInfo || {};
    const { sectionTitleFont } = useFont();
    const locale = useLocale();

    const { name, venueName, cityName, date, time, flag, countryCode, tour } = eventDetails;

    const pageTitle =
        h1 ||
        t('listing_page_h1', {
            name: name ?? '',
            venue: venueName,
            city: getTranslation(t, cityName, CITY_KEY_PREFIX) ?? '',
            subtype: getTypeSubtypeTranslations(t, subtype, '', '', false),
            type: removeTicketsSuffix(type),
        });
    const resolvedPageTitle = findAndApplyStringRule(
        pageTitle,
        config?.seo?.subtypeDisplayRules || []
    );

    // WLB-2439: map title into text/link segments via event→performer URLs
    const renderTitle = () => {
        const title = capitalizeWords(resolvedPageTitle, REGEXP_PREPOSITIONS_MATCH);
        const segments = getEventTitleSegments(title, eventDetails);

        return segments.map((segment, index) => {
            if (segment.type === 'link') {
                return (
                    <Link
                        key={`${segment.href}-${index}`}
                        href={segment.href}
                        className="underline inline-block"
                    >
                        {segment.value}
                    </Link>
                );
            }

            return <Fragment key={`text-${index}`}>{segment.value}</Fragment>;
        });
    };

    return (
        <section className="flex justify-center md:justify-between items-center gap-4 px-5 py-1 lg:py-5 bg-gray-100">
            <Link
                prefetch={false}
                href={artistUrlBuilder(eventDetails, type, subtype, event)}
                className="lg:hidden block"
            >
                <ArrowLeft size={20} />
            </Link>
            <div className="flex flex-col flex-1 items-start">
                <h1
                    className={`font-bold text-secondary text-base lg:text-2xl ${sectionTitleFont.className}`}
                >
                    {renderTitle()}
                </h1>
                <div className="flex items-center gap-x-2">
                    <p className="text-sm lg:text-base">
                        {DateTime.fromFormat(`${date} ${time}`, 'yyyy-MM-dd HH:mm:ss')
                            .setLocale(locale)
                            .toLocaleString({
                                weekday: 'long',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })
                            ?.replace(/^(\w)/, (match) => match.toUpperCase())}{' '}
                        {!locale.includes('es') ? t('at') : ''} {venueName}
                    </p>
                    {flag && (
                        <div className="relative rounded-full size-5.75 overflow-hidden shrink-0">
                            <Image
                                src={`https://flagcdn.com/w40/${countryCode?.toLowerCase()}.webp`}
                                alt={countryCode}
                                fill
                                sizes="23px"
                                className="object-fill"
                            />
                        </div>
                    )}
                </div>
            </div>
            <div className="hidden md:flex md:justify-end md:items-center md:gap-x-10">
                <ShareTo />
                {tour.nameUrl !== 'soccer-world-cup' && <Guarentee />}
            </div>
        </section>
    );
}
