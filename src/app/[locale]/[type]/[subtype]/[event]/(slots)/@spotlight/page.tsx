import { entityApi } from '@/services/server/entity';

import ArtistSpotlightCard from './_components/ArtistSpotlightCard';

export default async function EventSpotlightSlot({
    params,
}: PageProps<'/[locale]/[type]/[subtype]/[event]'>) {
    const { type, subtype, event } = await params;
    const entityMetadata = await entityApi.getEntityMetadata({
        url: event,
        type,
        subtype,

        debug: { callPoint: '@spotlight slot' },
    });

    return <ArtistSpotlightCard entityMetadata={entityMetadata} />;
}
