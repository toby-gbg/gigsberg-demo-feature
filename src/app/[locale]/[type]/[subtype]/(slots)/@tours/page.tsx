import { all } from 'better-all';

import { subtypeApi } from '@/services/server/subtype';

import DiscoverySection from '@/components/DiscoverySection';

export default async function Page({ params }: PageProps<'/[locale]/[type]/[subtype]'>) {
    const { tours } = await all({
        async params() {
            return params;
        },
        async tours() {
            const { type, subtype } = await this.$.params;
            return subtypeApi.getSubtypeTours({ type, subtype });
        },
    });

    return <DiscoverySection items={tours ?? undefined} />;
}
