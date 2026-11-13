import { performerApi } from '@/services/server/performers';

import HomePopularPerformersView from './_components/HomePopularPerformersView';

export default async function HomePopularSection() {
    const performers = await performerApi.getPopularPerformers();

    return <HomePopularPerformersView performers={performers} />;
}
