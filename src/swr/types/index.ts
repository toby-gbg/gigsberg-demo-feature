import { KeyedMutator } from 'swr';
import { SWRInfiniteResponse } from 'swr/infinite';

import { TAppErrorKey } from '@/utils/api/api-error-codes';

export type SWRParams = Record<string, string | number | boolean | null | undefined>;

export interface FetcherOptions {
    baseUrl?: string;
    headers?: Record<string, string>;
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: unknown;
    params?: SWRParams;
    signal?: AbortSignal;
    skipGlobalErrorHandler?: boolean;
    responseType?: 'json' | 'text';
    timeout?: number | false;
}

export interface PaginatedResponse<T> {
    rows: T[];
    hasMore: boolean;
    pageNumber: number;
    totalPages?: number;
    totalCount?: number;
}

export interface ErrorValidation {
    keyword: string;
    instancePath: string;
    schemaPath: string;
    params: Record<string, unknown>;
    message: string;
}

export interface ErrorResponseWithValidation {
    errorKey: TAppErrorKey;
    statusCode: TAppErrorKey;
    error: string;
    message: string;
    validation: ErrorValidation[];
    stack?: string;
}

export interface ErrorResponse extends Error {
    data: ErrorResponseWithValidation;
    message: string;
    response: {
        status: number;
        ok: boolean;
    };
    raw: string;
}

export type InfiniteSWRResult<TData, TPage> = {
    data: TData[];
    pagination: TPage | null;
    isLoading: boolean;
    isLoadingMore: boolean;
    isValidating: boolean;
    isError: boolean;
    error: unknown;
    hasMore: boolean;
    isEmpty: boolean;
    loadMore: () => void;
    mutate: KeyedMutator<TPage[]>;
    size: number;
    setSize: SWRInfiniteResponse<TPage, unknown>['setSize'];
    totalCount: number;
};

export type GetItemsFn<TData, TPage> = (page: TPage) => TData[];
export type GetHasMoreFn<TPage> = (page: TPage) => boolean;
export type GetTotalCountFn<TPage> = (page: TPage) => number;
