import { PaginationFilters, SortingFilters } from '../Fetch';
import { AccountSettingsEvent } from '../Listing';

export interface AccountSettingOrderFilters extends PaginationFilters, SortingFilters {
    type?: 'sales' | 'purchases';
    searchId?: string;
    eventName?: string;
    fromDate?: string;
    toDate?: string;
}

export default interface AccountSettingOrder extends AccountSettingsEvent {
    id: number;
    orderNumber: number;
    email: string;
    purchaseDate: number;
    statusId: string;
    totalPrice: number;
    currencyCode: string;
    trackingNumber: number | null;
    listingId: number;
    quantity: number;
    block: string | null;
    seatStart: number | null;
    seatEnd: number | null;
    row: string | null;
    category: string;
    payoutAmount?: number;
    mobileLinks?: Array<{ id: number; value: string; ticketNumber: number }>;
}

export interface AccountSettingListingError {
    data: { error: string };
}
