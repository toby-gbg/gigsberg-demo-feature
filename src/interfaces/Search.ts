import { searchParamsParsers } from '@/nuqs/params/search';

export interface SearchItem {
    id: number;
    name_url: string;
    name: string;
    label: string;
    category: string;
    tableName: string;
    url: string;
    urlEs: string;
    labelTranslationKey?: string | null;
    categoryTranslationKey?: string | null;
    city?: string;
    country?: string;
    timestamp?: string | null;
    ianaZone?: string | null;
}

export enum SearchSource {
    LAST_MINUTE = 'lastminute',
    TRENDING = 'trending',
}

export type SearchParamKey = keyof typeof searchParamsParsers;

export default interface SearchResponse {
    performers: SearchItem[];
    tours: SearchItem[];
    cities: SearchItem[];
    venues: SearchItem[];
    events: SearchItem[];
}
