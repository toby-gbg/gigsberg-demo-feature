'use client';

import { useEffect, useMemo } from 'react';
import useSWRInfinite from 'swr/infinite';
import useSWRMutation from 'swr/mutation';

import { ListingSearch, ListingSearchFilters, ListingUpdate } from '@/interfaces/Listing';
import SellTicketUtil from '@/utils/customs/sellTicket.util';

import { useUser } from '@/providers/UserProvider';

import { baseApi, fetcher } from '../fetcher';
import { ErrorResponse } from '../types';
import {
    AccountListingsFilters,
    AccountListingsKey,
    AccountListingsPage,
    CreateListingArgs,
    ListingServerFilters,
} from '../types/listings';
import {
    buildExternalSearchBody,
    buildExternalSearchFallbackData,
    createInfiniteResult,
    listingFiltersMatchServer,
} from '../utils';

export function useExternalListings(
    filters: ListingSearchFilters,
    initialData: ListingSearch,
    dataVersion: string,
    serverFilters?: ListingServerFilters | null
) {
    const userId = useUser()?.id ?? -1;
    const perPage = filters.per_page ?? 32;

    const isUnfiltered =
        !filters.categories?.length &&
        !filters.currency_id &&
        !filters.min_price &&
        !filters.max_price &&
        !filters.ticket_type?.length &&
        !filters.number_of_tickets &&
        !filters.blocks?.length;

    // Server page is reusable when nothing is filtered, or when live filters
    // still match what the server rendered. Anything else is SWR-fetched.
    const serverMatches =
        serverFilters != null ? listingFiltersMatchServer(filters, serverFilters) : isUnfiltered;
    const serverPage = serverMatches ? initialData : null;
    const firstSwrPage = serverPage ? 2 : 1;
    const pagesToLoad = (filters.page ?? 1) - (firstSwrPage - 1);

    const getKey = (pageIndex: number, previousPage: ListingSearch | null) => {
        if (pageIndex >= pagesToLoad) return null;

        // the page before this one (for SWR's first page that is the server page)
        const prev = pageIndex === 0 ? serverPage : previousPage;
        if (prev && prev.listings.items.length < perPage) return null; // no more

        const body = buildExternalSearchBody(filters, pageIndex + firstSwrPage);
        return ['/listings/external-search', body, userId, dataVersion];
    };

    const { data, error, isLoading, isValidating, size, setSize, mutate } = useSWRInfinite<
        ListingSearch,
        ErrorResponse
    >(getKey, ([url, body]) => fetcher(url, { method: 'POST', body }), {
        revalidateFirstPage: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    });

    useEffect(() => {
        if (size !== Math.max(pagesToLoad, 1)) setSize(Math.max(pagesToLoad, 1));
    }, [size, pagesToLoad, setSize]);

    const renderData = useMemo(() => {
        const pages = [...(serverPage ? [serverPage] : []), ...(data ?? [])];
        if (!pages.length) return buildExternalSearchFallbackData(initialData, false, perPage);

        const lastPage = pages[pages.length - 1];

        return {
            items: pages.flatMap((page) => page?.listings?.items ?? []),
            hasMore: (lastPage?.listings?.items?.length ?? 0) >= perPage,
            totalTickets: pages[0]?.totalTickets,
            scarcityBanner: pages[0]?.scarcityBanner,
            allInclusive: pages[0]?.allInclusive,
        };
    }, [data, serverPage, initialData, perPage]);

    return {
        data: renderData,
        isFetching: isLoading || isValidating,
        isInitialEntry: isUnfiltered && filters.page === 1,
        error,
        mutate,
    };
}

export function useAccountListings(filters: AccountListingsFilters = {}) {
    const userId = useUser()?.id ?? -1;

    const getKey = (pageIndex: number, prev: AccountListingsPage | null): AccountListingsKey => {
        if (prev && !prev.hasMore) return null;

        return ['/listings', { ...filters, pageNumber: pageIndex + 1 }, userId];
    };

    const swr = useSWRInfinite<AccountListingsPage, ErrorResponse, typeof getKey>(
        getKey,
        ([url, params]) => fetcher(url, { params }),
        {
            revalidateIfStale: false,
            revalidateOnMount: true,
            revalidateFirstPage: false,
        }
    );

    return createInfiniteResult(
        swr,
        null,
        (page) => page.rows,
        (page) => page.hasMore
    );
}

export function useUpdateListingMutation({
    onSuccess,
    onError,
}: {
    onSuccess: () => void;
    onError?: (error: ErrorResponse) => void;
}) {
    return useSWRMutation<void, ErrorResponse, string, ListingUpdate>(
        'updateListing',
        (_, { arg }) => fetcher(`/listings/${arg.id}`, { method: 'PUT', body: arg }),
        {
            onSuccess: () => onSuccess(),
            onError: (error) => onError?.(error),
        }
    );
}

export function useDeleteListingMutation({
    onSuccess,
    onError,
}: {
    onSuccess: () => void;
    onError?: (error: ErrorResponse) => void;
}) {
    return useSWRMutation<void, ErrorResponse, string, { id: number }>(
        'deleteListing',
        (_, { arg }) => fetcher(`/listings/${arg.id}`, { method: 'DELETE' }),
        {
            onSuccess: () => onSuccess(),
            onError: (error) => onError?.(error),
        }
    );
}

export function useReleaseTicketMutation({
    onSuccess,
    onError,
}: {
    onSuccess?: () => void;
    onError?: (error: ErrorResponse) => void;
} = {}) {
    return useSWRMutation<void, ErrorResponse, string, { leadId: number }>(
        'deleteListingLock',
        (_, { arg }) => fetcher(`/listing-locks/${arg.leadId}`, { method: 'DELETE' }),
        {
            onSuccess: () => onSuccess?.(),
            onError: (error) => onError?.(error),
        }
    );
}

export function useCreateListingMutation({
    onSuccess,
    onError,
}: {
    onSuccess?: () => void;
    onError?: (error: ErrorResponse) => void;
} = {}) {
    return useSWRMutation<void, ErrorResponse, string, CreateListingArgs>(
        'createListing',
        async (_, { arg }) => {
            const formData = SellTicketUtil.buildFormData(arg.form, arg.eventId, arg.currencies);
            await baseApi('listings', { method: 'POST', body: formData });
        },
        {
            onSuccess: () => onSuccess?.(),
            onError: (error) => onError?.(error),
        }
    );
}
