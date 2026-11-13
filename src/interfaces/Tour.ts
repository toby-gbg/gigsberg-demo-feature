export default interface Tour {
    id: number;
    image?: string;
    name: string;
    name_url: string | null;
    name_es: string | null;
    subtype_id?: number;
    subtype_name?: string;
    subtype_name_url?: string;
    type_id?: number;
    type_name?: string;
    type_name_url?: string;
    translation_key?: string;
    url: string | null;
    url_es: string | null;
}

export interface SubtypeImageTile {
    id: number;
    image?: string;
    name: string;
    name_url: string | null;
    name_es: string | null;
    url: string | null;
    url_es: string | null;
    type_name?: string;
    type_name_url?: string;
}
