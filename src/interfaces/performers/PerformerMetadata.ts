import City from '../City';
import Country from '../Country';
import Tour from '../Tour';

export default interface PerformerMetadata {
    performerType: string;
    performerName: string;
    performerImage: string | null;
    performerImageCredits?: string | null;
    performerImageSource?: string | null;
    cities: City[];
    countries: Country[];
    tours: Tour[];
    performerId: number;
    performerSpotifyId: string | null;
    subtypeImage: string | null;
    url: string;
    urlEs: string;
    performerImagesMetadata?: {
        licenseId: number;
        credits: string | null;
        source: string | null;
    }[];
}
