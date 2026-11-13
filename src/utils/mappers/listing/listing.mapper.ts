'use client';

import { AccountSettingListing, ListingUpdate } from '@/interfaces/Listing';

export default class ListingMapper {
    static toTable({
        id,
        eventId,
        pricePerTicket,
        proceedsPerTicket,
        faceValuePerTicket,
        numberOfTickets,
        ticketsRemaining,
        category,
        block,
        row,
        seatStart,
        seatEnd,
        currencyCode,
        faceValueCurrencyCode,
        presentedQuantity,
    }: AccountSettingListing): Partial<AccountSettingListing> {
        return {
            id,
            eventId,
            pricePerTicket,
            currencyCode,
            proceedsPerTicket,
            faceValuePerTicket,
            faceValueCurrencyCode,
            numberOfTickets,
            ticketsRemaining,
            category,
            block,
            row,
            seatStart,
            seatEnd,
            presentedQuantity,
        };
    }

    static toEditForm(listing: AccountSettingListing): ListingUpdate {
        return {
            block: listing.block ?? '',
            row: listing.row ?? '',
            seat_start: listing.seatStart ?? '',
            seat_end: listing.seatEnd ?? '',
            mobile_ticket_app_id: listing.mobileTicketAppId?.toString(),
            ticket_type: listing.ticketType,
            quantity: listing.numberOfTickets.toString(),
            split_type: listing.splitType,
            currency_id: listing.id,
            currency: listing.currencyCode,
            price: listing.pricePerTicket.toString(),
            ticketsRemaining: listing.ticketsRemaining?.toString() ?? '',
            presentedQuantity: listing.presentedQuantity ?? undefined,
            category_id: listing.categoryId?.toString(),
        };
    }
}
