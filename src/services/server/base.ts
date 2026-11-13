import { cookies } from 'next/headers';

import {
    apiTracker,
    CacheStatus,
    generateCallId,
    getCurl,
    type ApiCallInfo,
} from '@/lib/debug/api-tracker';
import Headers from '@/lib/headers';

import { apiConfig } from './config';
import { getClientIp } from './ip';
import { RequestOptions } from './types';
import {
    ApiError,
    ForbiddenError,
    NetworkError,
    NotFoundError,
    UnauthorizedError,
    ValidationError,
} from './types/errors';

/**
 * Base API Service
 * Handles all HTTP requests to the external API
 */
class ApiService {
    private baseUrl: string;
    private defaultTimeout: number;

    constructor() {
        this.baseUrl = apiConfig.baseUrl;
        this.defaultTimeout = apiConfig.timeout;
    }

    /**
     * Build URL with query parameters
     */
    private buildUrl(
        endpoint: string,
        baseUrl: string = this.baseUrl,
        params?: Record<string, string | number | boolean | undefined>
    ): string {
        const url = new URL(endpoint, baseUrl);

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    url.searchParams.append(key, String(value));
                }
            });
        }

        return url.toString();
    }

    /**
     * Handle API response
     */
    private async handleResponse<T>(
        response: Response,
        endpoint: string,
        responseType: RequestOptions['responseType']
    ): Promise<T> {
        // Handle different status codes
        if (!response.ok) {
            const currentUrl = await Headers.getCurrentUrl();
            const errorData = await response.json().catch(() => ({}));

            switch (response.status) {
                case 401:
                    throw new UnauthorizedError(errorData.message || 'Unauthorized');
                case 403:
                    throw new ForbiddenError(errorData.message || 'Forbidden', errorData);
                case 404:
                    throw new NotFoundError(errorData.message || 'Resource not found', endpoint);
                case 422:
                    throw new ValidationError(
                        `${currentUrl + ' - ' + errorData.message || 'Validation error'}`,
                        errorData.errors
                    );
                default:
                    throw new ApiError(
                        errorData.message ||
                            `HTTP ${response.status} - ${errorData.statusCode} error`,
                        response.status,
                        endpoint,
                        errorData
                    );
            }
        }

        // Parse TEXT response
        if (responseType === 'text') {
            try {
                const data = (await response.text()) as T;
                return data;
            } catch {
                throw new ApiError('Failed to parse response', response.status, endpoint);
            }
        }

        // Parse JSON response
        try {
            const data = await response.json();
            return data;
        } catch {
            throw new ApiError('Failed to parse response', response.status, endpoint);
        }
    }

    /**
     * Make HTTP request
     */
    private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        const hostname = await Headers.getHostname();
        const locale = await Headers.getExplicitLocale();
        const pageUrl = await Headers.getCurrentUrl();
        const pathname = await Headers.getPathName();
        const ip = await getClientIp();

        const {
            method = 'GET',
            headers = {},
            body,
            params,
            timeout = this.defaultTimeout,
            baseUrl = this.baseUrl,
            next,
            cache,
            retry = {},
            debug,
            responseType = 'json',
        } = options as RequestOptions;

        const { enabled = false, maxRetries = 14, delay = 4500 } = retry;
        const url = this.buildUrl(endpoint, baseUrl, params);
        const controller = new AbortController();

        const isDebug = process.env.NEXT_PUBLIC_DEBUG_MODE === '1';
        const callId = isDebug ? generateCallId() : '';
        const startTime = isDebug ? Date.now() : 0;

        const sid = (await cookies()).get('sid')?.value;

        let attempt = 0;

        while (true) {
            try {
                const response = await fetch(url, {
                    method,
                    headers: {
                        'x-forwarded-for': ip,
                        ...(hostname && { 'x-website-domain': hostname }),
                        ...(locale && { 'x-explicit-locale': locale }),
                        ...headers,
                    },
                    body: body ? JSON.stringify(body) : undefined,
                    signal: controller.signal,
                    next,
                    cache,
                });

                const duration = Date.now() - startTime;
                const result = await this.handleResponse<T>(response, endpoint, responseType);

                // ===== Debug tracking =====
                if (isDebug) {
                    const cacheHeader =
                        response.headers.get('x-nextjs-cache') ||
                        response.headers.get('x-vercel-cache');

                    let cacheStatus: CacheStatus = 'MISS';
                    let cached = false;

                    if (cacheHeader) {
                        const headerValue = cacheHeader.toUpperCase();
                        if (headerValue.includes('HIT')) {
                            cacheStatus = 'HIT';
                            cached = true;
                        } else if (headerValue.includes('STALE')) {
                            cacheStatus = 'STALE';
                            cached = true;
                        } else if (headerValue.includes('BYPASS')) {
                            cacheStatus = 'BYPASS';
                        }
                    } else {
                        const meanMissDuration = 300;
                        const stdDevMissDuration = 100;
                        const likelyHitThreshold = Math.max(
                            meanMissDuration - 2 * stdDevMissDuration,
                            50
                        );

                        if (duration < likelyHitThreshold) {
                            cached = true;
                            cacheStatus = 'LIKELY_HIT';
                        }
                    }

                    const curlParts = [
                        'curl',
                        `-X ${method}`,
                        `'${url}'`,
                        ...Object.entries(headers).map(([key, value]) => `-H '${key}: ${value}'`),
                    ];

                    if (body) {
                        curlParts.push(`-d '${JSON.stringify(body)}'`);
                    }

                    const successRuleText =
                        typeof debug?.successRule === 'function'
                            ? debug.successRule(result)
                            : debug?.successRule;

                    const curlCommand = getCurl(method, url, headers, body);
                    const callInfo: ApiCallInfo = {
                        id: callId,
                        timestamp: startTime,
                        method,
                        endpoint,
                        url,
                        status: response.status,
                        duration,
                        headers,
                        requestBody: body,
                        responseBody: result,
                        responseHeaders: Object.fromEntries(response.headers.entries()),
                        cached,
                        cacheStatus,
                        cacheTags: next?.tags,
                        curlCommand,
                        pageUrl,
                        pathname,
                        debug: {
                            ...debug,
                            errorRule: undefined,
                            successRule: successRuleText,
                        },
                        sessionId: sid,
                    };
                    apiTracker.track(callInfo);
                }

                return result;
            } catch (error) {
                const shouldRetry = enabled && attempt < maxRetries;
                // && (error instanceof NetworkError ||
                //     (error as Error).name === 'AbortError' ||
                //     (error as Error).message.includes('fetch failed'));

                if (shouldRetry) {
                    console.warn('Retrying', attempt, maxRetries);
                    console.warn('Fetching Error :', error);
                    attempt++;
                    if (isDebug) {
                        console.warn(
                            `Retrying request (${attempt}/${maxRetries}) after ${delay}ms: ${endpoint}`
                        );
                    }
                    await new Promise((r) => setTimeout(r, delay));
                    continue;
                }

                if (isDebug) {
                    const duration = Date.now() - startTime;

                    const curlCommand = getCurl(method, url, headers, body);

                    const errorRuleText =
                        typeof debug?.errorRule === 'function'
                            ? debug.errorRule(error as ApiError)
                            : debug?.errorRule;

                    const callInfo: ApiCallInfo = {
                        id: callId,
                        timestamp: startTime,
                        method,
                        endpoint,
                        url,
                        duration,
                        headers,
                        requestBody: body,
                        error: error instanceof Error ? error.message : 'Unknown error',
                        cacheTags: next?.tags,
                        curlCommand,
                        pageUrl,
                        pathname,
                        debug: {
                            ...debug,
                            successRule: undefined,
                            errorRule: errorRuleText,
                        },
                        sessionId: sid,
                    };
                    apiTracker.track(callInfo);
                }

                if (error instanceof ApiError) {
                    throw error;
                }

                if ((error as Error).name === 'AbortError') {
                    throw new NetworkError(`Request timeout after ${timeout}ms`, endpoint);
                }

                throw new NetworkError(
                    error instanceof Error ? error.message : 'Network request failed',
                    endpoint
                );
            }
        }
    }

    /**
     * GET request
     */
    async get<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: 'GET' });
    }

    /**
     * POST request
     */
    async post<T>(
        endpoint: string,
        body?: unknown,
        options?: Omit<RequestOptions, 'method' | 'body'>
    ): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: 'POST', body });
    }

    /**
     * PUT request
     */
    async put<T>(
        endpoint: string,
        body?: unknown,
        options?: Omit<RequestOptions, 'method' | 'body'>
    ): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: 'PUT', body });
    }

    /**
     * PATCH request
     */
    async patch<T>(
        endpoint: string,
        body?: unknown,
        options?: Omit<RequestOptions, 'method' | 'body'>
    ): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
    }

    /**
     * DELETE request
     */
    async delete<T>(
        endpoint: string,
        options?: Omit<RequestOptions, 'method' | 'body'>
    ): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: 'DELETE' });
    }
}

// Export singleton instance
export const apiService = new ApiService();
