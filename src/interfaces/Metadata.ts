export interface TypeMetadata {
    id: number;
    name: string;
    name_url: string;
    name_es: string;
}

export interface SubtypeMetadata {
    id: number;
    name: string;
    name_url: string;
    name_es: string;
    type_url: string;
    type_url_es: string;
    model_type: string;
    prefix: string;
}

export interface EventMetadata {
    id: number;
    type_name_url: string;
    subtype_name_url: string;
    event_name: string;
    event_venue: string;
    event_city: string;
    event_country: string;
    event_country_code: string;
    performer_image_url: string | null;
    tour_name: string;
}
