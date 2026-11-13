import { all } from 'better-all';
import { getTranslations } from 'next-intl/server';

import { convertNameUrlToLabel, fallbackTranslation } from '@/utils/common';
import { convertUrlToKeyTranslate } from '@/utils/translation/getTypeSubtypeTranslations';
import { websiteApi } from '@/services/server/website';
import { CAT_KEY_PREFIX } from '@/constants/translation';

import PageHeader from '@/components/PageHeader';

export default async function VenueHeaderSlot({
    params,
}: PageProps<'/[locale]/venues/[venueName]'>) {
    const {
        params: { venueName: rawVenueName },
        t,
        website,
    } = await all({
        async params() {
            return params;
        },
        async t() {
            return getTranslations();
        },
        async website() {
            return websiteApi.getWebsite();
        },
    });

    const venueName = decodeURIComponent(rawVenueName);
    const venueKeyTranslate = convertUrlToKeyTranslate(venueName, CAT_KEY_PREFIX);

    const translatedVenueName = fallbackTranslation(
        t(venueKeyTranslate),
        venueKeyTranslate,
        convertNameUrlToLabel(venueName)
    );

    const title = fallbackTranslation(
        t('city_page_title', {
            city: translatedVenueName,
        }),
        'city_page_title',
        `Concerts & events in ${translatedVenueName}`
    );

    const websiteName = website?.name || 'Gigsberg';

    const tagline = fallbackTranslation(
        t('city_page_description', {
            city: translatedVenueName,
            domain: websiteName,
        }),
        'city_page_description',
        `Find tickets for concerts, comedy and theatre in ${translatedVenueName}. Rock & pop shows, live events tickets with fast and reliable booking on ${websiteName}.`
    );

    return <PageHeader title={title} subtitle={tagline} />;
}
