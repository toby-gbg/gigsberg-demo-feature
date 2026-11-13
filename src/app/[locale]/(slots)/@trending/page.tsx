import { eventApi } from '@/services/server/events';
import { ipApi } from '@/services/server/ip';
import { DEFAULT_HOME_LIMIT } from '@/constants/pagination';

import HomeTrendingEventsView from './_components/HomeTrendingEventsView';

export default async function HomeTrendingSection() {
    const [events, ipCountry] = await Promise.all([
        eventApi.getHomePageEvents({ limit: DEFAULT_HOME_LIMIT }),
        ipApi.getCountryIp(),
    ]);
    return <HomeTrendingEventsView events={events} ipCountry={ipCountry} />;
}
