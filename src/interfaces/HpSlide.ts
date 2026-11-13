export default interface HpSlide {
    id: number;
    image: string;
    text: string;
    translationKey?: string | null;
    eventId: number | null;
    performerId: number | null;
    link: string;
    link_es: string | null;
    buttonText: string | null;
    slidePage: number;
    subtypeNameUrl: string;
    typeNameUrl: string;
    performerNameUrl: string;
    imageCredits: string | null;
    imageSource: string | null;
    imagesMetadata?: {
        license_id: number;
        credits: string | null;
        source: string | null;
    }[];
    city_name: string;
    event_date: string;
    events_count: number;
    has_tickets: boolean;
    lowest_price: number;
    lowest_price_currency: string;
    venue_name: string;
    event_url: string;
}
