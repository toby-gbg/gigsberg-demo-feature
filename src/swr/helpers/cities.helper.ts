import { CityParams, EventCityParams } from '@/interfaces/City';
import { EventTicketByCity } from '@/interfaces/Event';
import { Pagination } from '@/interfaces/Fetch';

import { GetCitiesKey } from '../types/citites';

export const getCitiesKeyForSWR = (
    params?: CityParams,
    options?: { skip?: boolean }
): GetCitiesKey => {
    if (options?.skip) return null;

    return [
        '/cities',
        {
            ...(params as Record<string, string | number | boolean | undefined>),
            pageNumber: params?.pageNumber ?? 1,
        },
    ];
};

export const getCityEventsBySubtypeKeyForSWR = (
    args?: EventCityParams,
    options?: { skip?: boolean }
) => {
    return (pageIndex: number, previousPageData: Pagination<EventTicketByCity> | null) => {
        if (options?.skip || !args) return null;

        // stop when there is no next page
        if (pageIndex > 0 && !previousPageData?.nextPage) return null;

        return [
            `/cities/event/${args.cityName}/${args.typeId}`,
            {
                page: pageIndex + 1,
                perPage: 32,
            },
        ] as const;
    };
};
