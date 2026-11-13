export interface SuggestedLocationSearchRequest {
    search: string;
    locale?: string;
    countryCode?: string;
}

export default interface OpenStreetMap {
    address: {
        road: string;
        house_number?: string;
        suburb: string;
        city: string;
        town?: string;
        village?: string;
        county?: string;
        municipality?: string;
        country: string;
        country_code: string;
        state_district: string;
        state: string;
        postcode?: string;
    };
    addresstype: string;
    boundingbox: [string, string, string, string];
    category: string;
    display_name: string;
    importance: number;
    lat: string;
    licence: string;
    lon: string;
    name: string;
    osm_id: number;
    osm_type: string;
    place_id: number;
    place_rank: number;
    type: string;
}
