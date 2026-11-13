'use client';

import useSWR from 'swr';
import useSWRMutation, { SWRMutationConfiguration } from 'swr/mutation';

import Address, { type AddressBody } from '@/interfaces/Address';
import type { FastifyPagination, PaginationFilters } from '@/interfaces/Fetch';
import {
    $addresses,
    removeAddress,
    setAddressFavorite,
    setDefaultAddress,
} from '@/stores/addresses';

import { fetcher } from '../fetcher';
import {
    ADDRESSES_BASE,
    addressesListKey,
    addressKey,
    type AddressesListKey,
} from '../keys/address.key';
import type { ErrorResponse, SWRParams } from '../types';

const fetchAddressesPage = ([url, params]: AddressesListKey) =>
    fetcher<FastifyPagination<Address>>(url, {
        params: params as SWRParams,
    });

/**
 * Fetch a single page of addresses.
 */
export function useGetAddresses(filters: PaginationFilters = {}, userId?: number) {
    const key = addressesListKey(
        {
            ...filters,
            pageNumber: filters.pageNumber ?? 1,
        },
        userId
    );

    const { data, error, isLoading, isValidating, mutate } = useSWR<
        FastifyPagination<Address>,
        ErrorResponse,
        AddressesListKey
    >(key, fetchAddressesPage);

    return {
        data: data ?? null,
        error: error ?? null,
        isLoading,
        isValidating,
        isFetching: isValidating,
        isSuccess: !!data && !error,
        isError: !!error,
        mutate,
    };
}

/**
 * Imperative / lazy fetch.
 */
export function useLazyGetAddresses() {
    return useSWRMutation<FastifyPagination<Address>, ErrorResponse, string, PaginationFilters>(
        ADDRESSES_BASE,
        (_key, { arg }) =>
            fetcher<FastifyPagination<Address>>(ADDRESSES_BASE, {
                params: {
                    ...arg,
                    pageNumber: arg.pageNumber ?? 1,
                },
            })
    );
}

export function useStoreAddressMutation(
    options: SWRMutationConfiguration<Address, ErrorResponse, string, AddressBody>
) {
    return useSWRMutation<Address, ErrorResponse, string, AddressBody>(
        ADDRESSES_BASE,
        (url, { arg }) =>
            fetcher<Address>(url, {
                method: 'POST',
                body: arg,
            }),
        options
    );
}

export function useUpdateAddressMutation(
    options: SWRMutationConfiguration<
        Address,
        ErrorResponse,
        string,
        { id: number; body: AddressBody }
    >
) {
    return useSWRMutation<Address, ErrorResponse, string, { id: number; body: AddressBody }>(
        ADDRESSES_BASE,
        (_key, { arg }) =>
            fetcher<Address>(addressKey(arg.id), {
                method: 'PUT',
                body: arg.body,
            }),
        options
    );
}

export function useDeleteAddressMutation(
    options: SWRMutationConfiguration<
        {
            success: boolean;
        },
        ErrorResponse,
        string,
        number
    >
) {
    return useSWRMutation<{ success: boolean }, ErrorResponse, string, number>(
        ADDRESSES_BASE,
        async (_key, { arg: id }) => {
            const result = await fetcher<{ success: boolean }>(addressKey(id), {
                method: 'DELETE',
                body: {},
            });
            removeAddress(id);
            return result;
        },
        options
    );
}

/**
 * Toggle favorite with an optimistic cache update (no list revalidation).
 * Rolls back the Nanostore when the request fails.
 */
export function useAddFavoriteAddressMutation(
    options: SWRMutationConfiguration<
        Address,
        ErrorResponse,
        string,
        {
            id: number;
            isFavorite: boolean;
        }
    >
) {
    return useSWRMutation<Address, ErrorResponse, string, { id: number; isFavorite: boolean }>(
        ADDRESSES_BASE,
        async (_key, { arg }) => {
            const { id, isFavorite } = arg;
            const previous = $addresses.get().find((address) => address.id === id)?.is_favorite;
            setAddressFavorite(id, isFavorite);

            try {
                return await fetcher<Address>(addressKey(id), {
                    method: 'PUT',
                    body: {
                        isFavorite,
                    },
                });
            } catch (error) {
                if (previous !== undefined) setAddressFavorite(id, previous);
                throw error;
            }
        },
        options
    );
}

/**
 * Set default address with an optimistic cache update (no list revalidation).
 * Clears `isDefault` on other rows and rolls back the Nanostore on failure.
 */
export function useSetDefaultAddressMutation(
    options: SWRMutationConfiguration<Address, ErrorResponse, string, number>
) {
    return useSWRMutation<Address, ErrorResponse, string, number>(
        ADDRESSES_BASE,
        async (_key, { arg: id }) => {
            const previous = $addresses.get().find((address) => address.isDefault)?.id;
            setDefaultAddress(id);

            try {
                return await fetcher<Address>(addressKey(id), {
                    method: 'PUT',
                    body: {
                        isDefault: true,
                    },
                });
            } catch (error) {
                setDefaultAddress(previous);
                throw error;
            }
        },
        options
    );
}
