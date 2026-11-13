import { PaginationFilters } from './Fetch';

export interface CityParams extends PaginationFilters {
    countryId?: number | string;
}

export interface EventCityParams {
    cityName: string;
    typeId: number;
    page?: number;
    perPage?: number;
}
export default interface City {
    id: number;
    name: string;
    image: string;
    country_id: number;
    name_url: string;
}
