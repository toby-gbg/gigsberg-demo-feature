'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { convertNameUrlToLabel, fallbackTranslation } from '@/utils/common';
import { convertUrlToKeyTranslate } from '@/utils/translation/getTypeSubtypeTranslations';
import { CITY_KEY_PREFIX } from '@/constants/translation';

import { useSite } from '@/providers/SiteProvider';

import PageHeader from '@/components/PageHeader';

const CityHeader = () => {
    const websiteName = useSite().website?.name ?? '';
    const { cityName = '' } = useParams<{ cityName?: string }>();
    const t = useTranslations();
    const cityKeyTranslate = convertUrlToKeyTranslate(cityName, CITY_KEY_PREFIX);

    const translatedCityName = fallbackTranslation(
        t(cityKeyTranslate),
        cityKeyTranslate,
        convertNameUrlToLabel(cityName)
    );

    const translatedTitle = fallbackTranslation(
        t('city_page_title', {
            city: translatedCityName,
        }),
        'city_page_title',
        `Concerts & events in ${translatedCityName}`
    );

    const translatedDescription = fallbackTranslation(
        t('city_page_description', {
            city: translatedCityName,
            domain: websiteName,
        }),
        'city_page_description',
        `Find tickets for concerts, comedy and theatre in ${translatedCityName}. Rock & pop shows, live events tickets with fast and reliable booking on ${websiteName}.`
    );

    return <PageHeader title={translatedTitle} subtitle={translatedDescription} />;
};

export default CityHeader;
