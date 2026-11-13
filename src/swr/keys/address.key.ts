import type { PaginationFilters } from '@/interfaces/Fetch';

export const ADDRESSES_BASE = '/addresses';

export type AddressesListKey = readonly [
    typeof ADDRESSES_BASE,
    PaginationFilters,
    number | undefined,
];

export function addressesListKey(params: PaginationFilters, userId?: number): AddressesListKey {
    return [ADDRESSES_BASE, params, userId];
}

export function addressKey(id: number) {
    return `${ADDRESSES_BASE}/${id}` as const;
}
