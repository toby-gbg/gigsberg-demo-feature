import { all } from 'better-all';

import Subtype from '@/interfaces/Subtype';
import { getCurrencyFromCookies } from '@/services/server/currencies';
import { eventApi } from '@/services/server/events';
import { seoApi } from '@/services/server/seo';
import { subtypeApi } from '@/services/server/subtype';

import SubtypeMostWantedEvents from './_components/SubtypeMostWantedEvents';

export default async function Page({ params }: PageProps<'/[locale]/[type]/[subtype]'>) {
    const { currencyCode, seoData, filterOptions, events } = await all({
        async params() {
            return params;
        },
        async currencyCode() {
            return getCurrencyFromCookies();
        },
        async seoData() {
            const { type, subtype } = await this.$.params;
            return seoApi.getSeoMetadata({
                params: { type, subtype },
                debug: { callPoint: `${type}/${subtype} events section` },
            });
        },
        async filterOptions() {
            const { type, subtype } = await this.$.params;
            return eventApi.getFilterOptions({ type, subtype });
        },
        async events() {
            const { type, subtype } = await this.$.params;
            return subtypeApi.getSubtypeFeaturedEvents({ type, subtype });
        },
    });

    if (!seoData?.entity) return null;

    return (
        <SubtypeMostWantedEvents
            subtype={seoData.entity as Subtype}
            events={events}
            filterOptions={filterOptions}
            currencyCode={currencyCode ?? 'USD'}
        />
    );
}
