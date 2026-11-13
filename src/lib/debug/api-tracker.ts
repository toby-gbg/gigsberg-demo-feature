/**
 * API Call Tracker for Development
 * Tracks all server-side API calls for debugging
 */

export type CacheStatus = 'HIT' | 'MISS' | 'STALE' | 'BYPASS' | 'LIKELY_HIT';

export interface ApiCallInfo {
    id: string;
    timestamp: number;
    method: string;
    endpoint: string;
    url: string;
    status?: number;
    duration?: number;
    error?: string;
    headers?: Record<string, string>;
    requestBody?: any;
    responseBody?: any;
    responseHeaders?: Record<string, string>;
    cached?: boolean; // Whether this response came from Next.js cache
    cacheStatus?: CacheStatus; // Cache status
    curlCommand?: string;
    cacheTags?: string[];
    pathname: string;
    pageUrl: string;
    debug?: RequestDebugResponseOptions;

    sessionId?: string;
}

export interface RequestDebugResponseOptions {
    callPoint?: string;
    errorRule?: string;
    successRule?: string;
}

/**
 * In-memory store for API calls (development only)
 * Uses simple array storage - Next.js server components provide request isolation
 */
class ApiCallTracker {
    private calls: ApiCallInfo[] = [];
    private maxCalls: number = 100;
    private ignoredPatterns = ['.well-known', 'com.chrome.devtools.json', 'appspecific'];

    /**
     * Track an API call
     * Updates existing call if same ID exists, otherwise adds new call
     */
    track(call: ApiCallInfo) {
        // Check if the API endpoint OR the Page URL contains ignored patterns
        const shouldIgnore = this.ignoredPatterns.some(
            (pattern) =>
                call.endpoint?.includes(pattern) ||
                call.url?.includes(pattern) ||
                call.pageUrl?.includes(pattern)
        );

        if (shouldIgnore) return;

        // Find existing call by ID and update it (for tracking progress: request -> response)
        const existingIndex = this.calls.findIndex((c) => c.id === call.id);

        if (existingIndex !== -1) {
            // Update existing call with new data (status, duration, response)
            this.calls[existingIndex] = {
                ...this.calls[existingIndex],
                ...call,
            };
        } else {
            // Add new call
            this.calls.push(call);

            // Keep only last maxCalls to prevent memory leaks
            if (this.calls.length > this.maxCalls) {
                this.calls.shift();
            }
        }
    }

    /**
     * Get all tracked calls
     */
    getCalls(): ApiCallInfo[] {
        return [...this.calls]; // Return copy to prevent external mutation
    }

    /**
     * Clear all calls
     */
    clear() {
        this.calls = [];
    }

    /**
     * Clear old calls (prevent memory leaks)
     */
    cleanup(maxAge: number = 60000) {
        const now = Date.now();
        this.calls = this.calls.filter((call) => now - call.timestamp <= maxAge);
    }
}

// Singleton instance
export const apiTracker = new ApiCallTracker();

/**
 * Generate unique call ID
 */
export function generateCallId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Format duration in ms
 */
export function formatDuration(ms: number): string {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Get status color
 */
export function getStatusColor(status?: number): string {
    if (!status) return 'gray';
    if (status >= 200 && status < 300) return 'green';
    if (status >= 300 && status < 400) return 'blue';
    if (status >= 400 && status < 500) return 'orange';
    return 'red';
}

/**
 * Get curl
 */
export function getCurl(
    method: string,
    url: string,
    headers: Record<string, string>,
    body: unknown
) {
    const curlParts = [
        'curl',
        `-X ${method}`,
        `'${url}'`,
        ...Object.entries(headers).map(([key, value]) => `-H '${key}: ${value}'`),
    ];

    if (body) {
        curlParts.push(`-d '${JSON.stringify(body)}'`);
    }

    const curlCommand = curlParts.join(' ');

    return curlCommand;
}
