import { EventTicket, EventTicketsResponse, FrontAPIEvent } from '@/interfaces/Event';
import HomePageEvent from '@/interfaces/events/HomePageEvent';
import { FastifyPagination, Pagination } from '@/interfaces/Fetch';
import PopularPerformer, { FrontAPIPerformer } from '@/interfaces/Performer';

export const frontApiPerformersMapper = (performers: FrontAPIPerformer[]): PopularPerformer[] => {
    return performers.map(
        ({
            id,
            name,
            image,
            image_source,
            image_credits,
            name_url,
            type_name_url,
            type_name_es,
            subtype_name_url,
            subtype_name_es,
            subtype_image,
            url,
            url_es: urlEs,
            images_metadata: imagesMetadata,
            ...rest
        }) => ({
            id,
            name,
            image,
            imageSource: image_source,
            imageCredits: image_credits,
            nameUrl: name_url,
            typeNameUrl: type_name_url,
            typeNameEs: type_name_es,
            subtypeNameUrl: subtype_name_url,
            subtypeNameEs: subtype_name_es,
            subtypeImage: subtype_image ?? undefined,
            url,
            urlEs,
            imagesMetadata,
            ...rest,
        })
    );
};

type FrontAPIEventTicketsResponse = Omit<EventTicketsResponse, 'items'> & {
    items: FrontAPIEvent[];
};

type FrontAPIEntityEvent = Omit<
    EventTicket,
    'hasTickets' | 'lowestPrice' | 'lowestPriceCurrency'
> & {
    has_tickets: boolean;
    lowest_price: number | null;
    lowest_price_currency: string | null;
};

export type FrontAPIEntityEventsResponse = Omit<FastifyPagination<EventTicket>, 'rows'> & {
    rows: FrontAPIEntityEvent[];
};

const frontApiEntityEventMapper = ({
    has_tickets: hasTickets,
    lowest_price: lowestPrice,
    lowest_price_currency: lowestPriceCurrency,
    ...rest
}: FrontAPIEntityEvent): EventTicket => ({
    ...rest,
    hasTickets,
    lowestPrice,
    lowestPriceCurrency,
});

export const frontApiEventMapper = ({
    id,
    performer_image: performerImage,
    name: eventName,
    date: eventDate,
    time: eventTime,
    venue_name: venueName,
    venue_name_translation_key: venueNameTranslationKey,
    city_name: cityName,
    country_code: countryCode,
    country_name: countryName,
    performer_id: performerId,
    subtype_image: subtypeImage,
    image,
    subtype_name_url: subtypeNameUrl,
    type_name_url: typeNameUrl,
    open_sale_date: openSaleDate,
    open_sale_timestamp: openSaleTimestamp,
    open_sale_time: openSaleTime,
    open_sale_timezone: openSaleTimezone,
    url,
    url_es: urlEs,
    performer_image_source: performerImageSource,
    performer_image_credits: performerImageCredits,
    eventNameTranslationKey,
    images_metadata: imagesMetadata,
    performer_images_metadata: performerImagesMetadata,
    lowest_price: lowestPrice,
    lowest_price_currency: lowestPriceCurrency,
    has_tickets: hasTickets,
    tour,
    tourImage,
    tour_images_metadata: tourImagesMetadata,
}: FrontAPIEvent): EventTicket => ({
    id,
    eventId: id,
    eventName,
    eventDate,
    eventTime,
    venueName,
    venueNameTranslationKey,
    cityName,
    countryCode,
    countryName,
    image: image ?? undefined,
    typeNameUrl,
    subtypeNameUrl,
    openSaleDate,
    openSaleTimestamp,
    openSaleTime,
    openSaleTimezone,
    performerId: performerId ?? 0,
    performerImage: performerImage ?? '',
    subtypeImage: subtypeImage ?? '',
    url,
    urlEs,
    performerImageSource: performerImageSource ?? '',
    imagesMetadata: imagesMetadata?.map(({ license_id, ...items }) => ({
        licenseId: license_id,
        ...items,
    })),
    performerImagesMetadata: performerImagesMetadata?.map(({ license_id, ...items }) => ({
        licenseId: license_id,
        ...items,
    })),
    performerImageCredits,
    eventNameTranslationKey,
    lowestPrice,
    lowestPriceCurrency,
    hasTickets,
    tour,
    tourImage,
    tourImagesMetadata: tourImagesMetadata?.map(({ license_id, ...items }) => ({
        licenseId: license_id,
        ...items,
    })),
});

export const frontApiPaginationEventsMapper = (
    events: Pagination<FrontAPIEvent>
): Pagination<EventTicket> => {
    return {
        ...events,
        items: events.items.map(frontApiEventMapper),
    };
};

export const frontApiEventTicketsResponseMapper = (
    events: FrontAPIEventTicketsResponse
): EventTicketsResponse => {
    return {
        ...events,
        items: events.items.map(frontApiEventMapper),
        nextPage: events.nextPage ?? null,
        prevPage: events.prevPage ?? null,
    };
};

export const frontApiEntityEventsResponseMapper = (
    events: FrontAPIEntityEventsResponse
): FastifyPagination<EventTicket> => {
    return {
        ...events,
        rows: events.rows.map(frontApiEntityEventMapper),
    };
};

export const homePageMapper = (events: HomePageEvent[]): EventTicket[] => {
    return events.map(
        ({
            eventId,
            name: eventName,
            date: eventDate,
            time: eventTime,
            venueName,
            venueNameTranslationKey,
            city: cityName,
            countryCode,
            countryName,
            typeNameUrl,
            subtypeNameUrl,
            entityNameUrl,
            performer1Id: performerId,
            performerImage,
            subtypeImage,
            url,
            urlEs,
            performerImageCredits,
            performerImageSource,
            performerImagesMetadata,
            imagesMetadata,
            tourImage,
            tourImagesMetadata,
        }) => ({
            id: eventId,
            eventId,
            eventName,
            eventDate,
            eventTime,
            venueName,
            venueNameTranslationKey,
            cityName,
            countryCode,
            countryName,
            typeNameUrl,
            subtypeNameUrl,
            entityNameUrl,
            performerId,
            performerImage,
            subtypeImage,
            url,
            urlEs,
            performerImageCredits,
            performerImageSource,
            performerImagesMetadata,
            imagesMetadata,
            tourImage,
            tourImagesMetadata,
        })
    );
};
