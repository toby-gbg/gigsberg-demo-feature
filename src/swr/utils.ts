import Cookies from 'js-cookie';
import { isHTTPError, KyRequest, SearchParamsOption } from 'ky';
import { KeyedMutator } from 'swr';
import { SWRInfiniteResponse } from 'swr/infinite';

import { ListingSearch, ListingSearchFilters } from '@/interfaces/Listing';
import { AppErrorKey } from '@/utils/api/api-error-codes';
import { getClientWebsiteDomain } from '@/utils/domain';

import { toast } from '@/components/ui/Toast';

import { GetHasMoreFn, GetItemsFn, GetTotalCountFn, InfiniteSWRResult, SWRParams } from './types';
import { ListingServerFilters } from './types/listings';

export const prepareHeaders = (kyRequest: KyRequest) => {
    const token = Cookies.get('te_co');
    const locale = Cookies.get('x-explicit-locale');
    const clientIp = process.env.NEXT_PUBLIC_DEBUG_IP;
    const domain =
        typeof window !== 'undefined' ? getClientWebsiteDomain(window.location.host) : '';

    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    if (clientIp) headers['x-forwarded-for'] = clientIp;
    if (domain) headers['x-website-domain'] = domain;
    if (locale) headers['x-explicit-locale'] = locale;

    // attach headers to ky
    Object.entries(headers).forEach(([key, value]) => {
        kyRequest.headers.set(key, value);
    });
};

// blocked user handler
export async function handleBlockedUser() {
    let message = 'Your account is blocked. Please contact support.';

    try {
        const locale = window.location.pathname.split('/').filter(Boolean)[0] || 'en-GB';
        const { default: messages } = await import(`../messages/${locale}.json`);
        message =
            messages[AppErrorKey.USER_IS_BLOCKED] ??
            'Your account is blocked. Please contact the support.';
    } catch {
        message = 'Your account is blocked. Please contact the support.';
    }

    toast.add({ title: message, type: 'error' });
}

export const toKySearchParams = (params?: SWRParams): SearchParamsOption | undefined => {
    if (!params) return undefined;
    const cleaned: Record<string, string | number | boolean> = {};
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            cleaned[key] = value;
        }
    });
    return cleaned;
};

// standardized infinite SWR result
export function createInfiniteResult<TData, TPage>(
    swr: SWRInfiniteResponse<TPage, unknown>,
    initialData: TPage | null = null,
    getItems: GetItemsFn<TData, TPage>,
    getHasMore: GetHasMoreFn<TPage>,
    getTotalCount?: GetTotalCountFn<TPage>
): InfiniteSWRResult<TData, TPage> {
    const { data: pages, error, isLoading, isValidating, size, setSize, mutate } = swr;

    const items: TData[] = pages?.flatMap(getItems) ?? [];
    const latestPage = pages?.[pages.length - 1] ?? initialData;

    return {
        data: items,
        pagination: latestPage ?? null,
        isLoading: isLoading && size === 1,
        isLoadingMore: isValidating && size > 1,
        isValidating,
        isError: !!error,
        error,
        hasMore: latestPage ? getHasMore(latestPage) : false,
        isEmpty:
            (pages?.[0] ?? initialData)
                ? getItems(pages?.[0] ?? (initialData as TPage)).length === 0
                : true,
        loadMore: () => setSize((s) => s + 1),
        mutate: mutate as KeyedMutator<TPage[]>, // safe cast for SWRInfinite
        size,
        setSize,
        totalCount:
            isLoading || isValidating
                ? 0
                : (getTotalCount?.(pages?.[0] ?? (initialData as TPage)) ?? items.length),
    };
}

export const createKeyMatcher = (base: string) => (key: unknown) =>
    key === base || (Array.isArray(key) && key[0] === base);

const fallbackRaw = {
    error: 'Internal server error',
    message: 'Internal server error',
    validation: [],
    stack: '',
    statusCode: 'internal_server_error',
    errorKey: 'internal_server_error',
};

export const normalizeError = (error: Error) => {
    // Handling for case repsond with a non-2xx status.
    if (isHTTPError(error)) {
        const result = {
            data:
                'data' in error && typeof error.data === 'object'
                    ? {
                          ...error.data,
                          errorKey:
                              error.data !== null && 'statusCode' in error.data
                                  ? error.data.statusCode
                                  : 'generic_error',
                      }
                    : fallbackRaw,
            message:
                'data' in error &&
                typeof error.data === 'object' &&
                error.data !== null &&
                'message' in error.data &&
                typeof error.data.message === 'string'
                    ? error.data.message
                    : 'Something went wrong. Please try again.',
            response: {
                status: error.response.status,
                ok: error.response.ok,
            },
            raw:
                'data' in error && typeof error.data === 'object'
                    ? JSON.stringify(error.data)
                    : JSON.stringify(fallbackRaw),
        };

        if (result.data.errorKey === AppErrorKey.USER_IS_BLOCKED) handleBlockedUser();

        return Object.assign(error, result);
    }

    // For the rest case and some case API still success but BE respond error (For example: case 204)
    return Object.assign(error, {
        data: fallbackRaw,
        message: error.message || fallbackRaw.message || 'Internal server error',
        response: {
            status: 500,
            ok: false,
        },
        raw: JSON.stringify(fallbackRaw),
    });
};

// FEATURES BASED
export function listingFiltersMatchServer(
    filters: ListingSearchFilters,
    server: ListingServerFilters
) {
    // Only criteria the server renders with. Page, skip, userId and tuple
    // labels are client-only.
    return (
        filters.event_id === server.event_id &&
        filters.currency_code === server.currency_code &&
        (filters.number_of_tickets?.[0] ?? null) === server.number_of_tickets &&
        JSON.stringify(filters.categories ?? []) === JSON.stringify(server.categories) &&
        JSON.stringify((filters.ticket_type ?? []).map(([id]) => Number(id))) ===
            JSON.stringify(server.ticket_type_ids.map(Number)) &&
        JSON.stringify(filters.blocks ?? []) === JSON.stringify(server.blocks) &&
        (filters.min_price ?? null) === (server.min_price ?? null) &&
        (filters.max_price ?? null) === (server.max_price ?? null)
    );
}

export function buildExternalSearchBody(filters: ListingSearchFilters, page: number) {
    const {
        event_id,
        per_page,
        categories,
        ticket_type,
        number_of_tickets,
        max_price,
        min_price,
        blocks,
        currency_code,
        currency_id,
    } = filters;

    return {
        event_id,
        page,
        per_page: per_page || 32,
        currency_code,
        ...(categories?.length && { categories }),
        ...(ticket_type?.length && { ticket_type_ids: ticket_type.map((t) => Number(t[0])) }),
        ...(number_of_tickets && { number_of_tickets: number_of_tickets[0] }),
        ...(max_price !== undefined && min_price !== undefined && { max_price, min_price }),
        ...(blocks?.length && { blocks }),
        ...(currency_id && { currency_id }),
    };
}

export function buildExternalSearchFallbackData(
    initialData?: ListingSearch | null,
    useInitialData: boolean = false,
    perPage: number = 23
) {
    const initialItems = initialData?.listings?.items ?? [];
    return {
        items: useInitialData ? initialItems : [],
        hasMore: useInitialData ? initialItems.length >= perPage : false,
        totalTickets: initialData?.totalTickets ?? 0,
        scarcityBanner: initialData?.scarcityBanner,
        allInclusive: initialData?.allInclusive,
    };
}
