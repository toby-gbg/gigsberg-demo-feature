import { all } from 'better-all';

import { removeTicketsSuffix } from '@/utils/common';
import { subtypeApi } from '@/services/server/subtype';

import SubtypePopularPerformers from '@/components/SubtypePopularPerformers';

export default async function Page({ params }: PageProps<'/[locale]/[type]/[subtype]'>) {
    const {
        params: { type },
        performers,
    } = await all({
        async params() {
            return params;
        },

        async performers() {
            const { type, subtype } = await this.$.params;
            return subtypeApi.getSubtypePerformers({ type, subtype });
        },
    });

    return (
        <SubtypePopularPerformers type={removeTicketsSuffix(type)} performers={performers || []} />
    );
}
