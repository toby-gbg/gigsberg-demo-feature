import { eventApi } from '@/services/server/events';

import HomeLastMinuteEventsView from './_components/HomeLastMinuteEventsView';

export default async function HomeTrendingSection() {
    const baseEvents = await eventApi.getHomePageLastMinuteEvents();

    return <HomeLastMinuteEventsView baseEvents={baseEvents} />;
}
