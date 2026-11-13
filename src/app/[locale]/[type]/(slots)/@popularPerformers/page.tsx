import { removeTicketsSuffix } from '@/utils/common';
import { subtypeApi } from '@/services/server/subtype';

import SubtypePopularPerformers from '@/components/SubtypePopularPerformers';

export default async function Page({ params }: PageProps<'/[locale]/[type]'>) {
    const { type } = await params;
    const performers = await subtypeApi.getSubtypePerformers({ type });

    return (
        <SubtypePopularPerformers performers={performers || []} type={removeTicketsSuffix(type)} />
    );
}
