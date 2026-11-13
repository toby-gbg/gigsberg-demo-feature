import ky from 'ky';

import { FetcherOptions } from './types';
import { normalizeError, prepareHeaders, toKySearchParams } from './utils';

// base API using ky
export const baseApi = ky.create({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? '',
    timeout: 30000,
    hooks: {
        beforeRequest: [({ request }) => prepareHeaders(request)],
        beforeError: [({ error }) => normalizeError(error)],
    },
});

// main fetcher
export async function fetcher<T = unknown>(
    resource: string,
    options: FetcherOptions = {}
): Promise<T> {
    const { params, body, responseType = 'json', headers = {}, timeout, ...rest } = options;

    const isFormData = body instanceof FormData;
    const hasBody = body !== undefined && body !== null;

    const rs = await baseApi(resource, {
        ...rest,
        searchParams: toKySearchParams(params),
        ...(hasBody && {
            // FormData → use body, JSON → use json
            ...(isFormData ? { body } : { json: body }),
        }),
        headers: {
            Accept: 'application/json',
            ...(!isFormData && hasBody && { 'Content-Type': 'application/json' }),
            ...headers,
        },
        ...(timeout !== undefined ? { timeout } : {}),
    });

    if (rs.status === 204) return rs as T;

    if (responseType === 'text') {
        return (await rs.text()) as T;
    }

    return rs.json<T>();
}
