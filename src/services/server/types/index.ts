/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiError } from './errors';

interface RetryOptions {
    enabled?: boolean;
    maxRetries?: number;
    delay?: number;
}

export interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    headers?: Record<string, string>;
    body?: any;
    params?: Record<string, string | number | boolean | undefined>;
    timeout?: number;
    baseUrl?: string;
    cache?: RequestCache;
    next?: NextFetchRequestConfig;
    retry?: RetryOptions;
    responseType?: 'json' | 'text';
    // Optional debug object that can carry metadata for dev-mode tracking
    debug?: RequestDebugOptions;
}

export interface RequestDebugOptions {
    callPoint?: string;
    errorRule?: ((error: ApiError) => string) | string;
    successRule?: ((response: any) => string) | string;
}
