import { C } from '@/interfaces/Currency';
import { FastifyPagination, PaginationFilters } from '@/interfaces/Fetch';
import { AccountSettingListing, ListingSearch, ListingSearchFilters } from '@/interfaces/Listing';
import { SellForm } from '@/interfaces/Sell';

export type ExternalListingsFilters = ListingSearchFilters & {
    per_page?: number;
};
export type ExternalListingsKey = [string, ExternalListingsFilters & { page: number }] | null;
export type ExternalListingsPage = ListingSearch;

// Normalized snapshot of the filters the server rendered a payload with.
// Compared against live client filters to reuse the server page with zero
// client fetch (e.g. filtered currency switches).
export type ListingServerFilters = {
    event_id: number;
    currency_code: string;
    number_of_tickets: number | null;
    categories: string[];
    ticket_type_ids: number[];
    blocks: string[];
    min_price?: number | null;
    max_price?: number | null;
};

export type AccountListingsFilters = Omit<PaginationFilters, 'pageNumber'>;
export type AccountListingsKey =
    [string, AccountListingsFilters & { pageNumber: number }, number] | null;
export type AccountListingsPage = FastifyPagination<AccountSettingListing>;

export type CreateListingArgs = {
    form: SellForm;
    eventId: number;
    currencies: C;
};

export type ListingMetadataFilters = {
    skip?: boolean;
    event_id: number;
    number_of_tickets?: [string | number | undefined, string];
    categories?: string[];
    ticket_type?: [number, string][];
    max_price?: number;
    min_price?: number;
    blocks?: string[];
    currency_code: string;
};

export type ListingMetadataBody = Omit<ListingMetadataFilters, 'skip'>;
