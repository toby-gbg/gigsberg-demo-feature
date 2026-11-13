import HpSlide from './HpSlide';
import Tour, { SubtypeImageTile } from './Tour';

export interface SubtypeDataResponse<P, E> {
    subtypes?: SubtypeImageTile[];
    tours?: Tour[];
    slides?: HpSlide[];
    performers: P;
    entity: Type | Subtype;
    events: E;
}

export default interface Subtype {
    type_id: number;
    type_name: string;
    type_name_url: string;
    type_name_es: string | null;
    id: number;
    name: string;
    name_url: string;
    name_es: string | null;
    url: string;
    url_es: string | null;
    type: 'subtype';
}

export interface Type {
    id: number;
    type: 'type';
    name: string;
    name_url: string;
    name_es: string | null;
    url: string;
    url_es: string;
}
