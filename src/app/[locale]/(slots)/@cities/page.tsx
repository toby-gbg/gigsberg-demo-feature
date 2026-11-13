import { cityApi } from '@/services/server/cities';
import { DEFAULT_HOME_LIMIT } from '@/constants/pagination';

import HomePopularCitiesView from './_components/HomePopularCitiesView';

export default async function HomeCitiesSection() {
    const popularCities = await cityApi.getCitiesExploreLocations({
        limit: DEFAULT_HOME_LIMIT,
    });

    return <HomePopularCitiesView popularCities={popularCities} />;
}
