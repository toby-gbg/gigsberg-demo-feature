import { all } from 'better-all';

import { getCurrencyFromCookies } from '@/services/server/currencies';
import { eventApi } from '@/services/server/events';
import { ipApi } from '@/services/server/ip';
import { seoApi } from '@/services/server/seo';
import { UPCOMING_BIG_MATCHES_ALLOW_IDS } from '@/constants/upcomingBigMatches';

import UpcomingBigMatches from './_components/UpcomingBigMatches';

export default async function Page({ params }: PageProps<'/[locale]/[type]/[subtype]'>) {
    const { seoData, upcomingBigMatches, currencyCode, ipCountry } = await all({
        async params() {
            return params;
        },
        async seoData() {
            const { type, subtype } = await this.$.params;
            return seoApi.getSeoMetadata({ params: { type, subtype } });
        },
        async upcomingBigMatches() {
            const seoData = await this.$.seoData;
            if (!seoData?.entity) return null;
            if (!UPCOMING_BIG_MATCHES_ALLOW_IDS.includes(seoData.entity.id)) return null;
            return eventApi.getUpcomingBigMatches();
        },
        async currencyCode() {
            // only needed when we actually render the section
            const matches = await this.$.upcomingBigMatches;
            if (!matches) return null;
            return getCurrencyFromCookies();
        },
        async ipCountry() {
            return ipApi.getCountryIp();
        },
    });

    if (!upcomingBigMatches || !seoData?.entity) return null;

    return (
        <UpcomingBigMatches
            initialUpcomingBigMatches={upcomingBigMatches}
            currencyCode={currencyCode ?? 'USD'}
            ipCountryCode={ipCountry.code}
        />
    );
}
