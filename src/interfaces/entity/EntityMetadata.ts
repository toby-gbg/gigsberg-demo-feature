import City from '../City';
import Country from '../Country';
import Tour from '../Tour';

export interface EntityInfo {
    type: string;
    id: number;
    name: string;
    nameUrl: string;
    spotifyId: string | null;
    image: string | null;
    imageSource: string | null;
    imageCredits: string | null;
    subtypeImage: string | null;
    url: string;
    urlEs: string;
    imagesMetadata: {
        license_id: number;
        credits: string | null;
        source: string | null;
    }[];
    imageOfficialAgency: string | null;
}

export interface EntityMetadataPerformer {
    id: number;
    name: string;
    image: string;
    image_source: string | null;
    image_credits: string | null;
    name_url: string;
    type_name_url: string;
    type_name_es?: string;
    subtype_name_url: string;
    subtype_name_es?: string;
    subtype_image?: string | null;
    type_id: number;
    url?: string;
    url_es?: string;
    eventCount?: number | null;
    earliestEventDate?: string | null;
    latestEventDate?: string | null;
    earliestEventIanaZone?: string | null;
    images_metadata?: {
        license_id: number;
        credits: string | null;
        source: string | null;
    }[];
}

export default interface EntityMetadata {
    type: 'performer' | 'tour' | string;
    entity: EntityInfo;
    cities?: City[];
    countries?: Country[];
    tours?: Tour[];
    performers?: EntityMetadataPerformer[];
}
