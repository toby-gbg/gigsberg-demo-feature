import { all } from 'better-all';

import { Type } from '@/interfaces/Subtype';
import { getCurrencyFromCookies } from '@/services/server/currencies';
import { eventApi } from '@/services/server/events';
import { seoApi } from '@/services/server/seo';
import { subtypeApi } from '@/services/server/subtype';

import TypeMostWantedEvents from './_components/TypeMostWantedEvents';

export default async function Page({ params }: PageProps<'/[locale]/[type]'>) {
    const { entity, currencyCode, events, filterOptions } = await all({
        async params() {
            return params;
        },
        async entity() {
            const { type } = await this.$.params;
            const seoData = await seoApi.getSeoMetadata({ params: { type } });
            return seoData?.entity;
        },
        async currencyCode() {
            return getCurrencyFromCookies();
        },
        async events() {
            const { type } = await this.$.params;
            return subtypeApi.getSubtypeFeaturedEvents({ type });
        },
        async filterOptions() {
            const { type } = await this.$.params;
            return eventApi.getFilterOptions({ type });
        },
    });
    return (
        <TypeMostWantedEvents
            events={events ?? undefined}
            type={entity as Type}
            filterOptions={filterOptions}
            currencyCode={currencyCode ?? 'USD'}
        />
    );
}
