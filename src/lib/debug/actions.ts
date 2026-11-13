'use server';

import { revalidateTag } from 'next/cache';

import { apiTracker, type ApiCallInfo } from './api-tracker';

/**
 * Get current API call history (development only)
 */
export async function getApiCallHistory(sessionId?: string): Promise<ApiCallInfo[]> {
    if (process.env.NEXT_PUBLIC_DEBUG_MODE !== '1') {
        return [];
    }

    const allCalls = apiTracker.getCalls();
    return sessionId ? allCalls.filter((call) => call.sessionId === sessionId) : allCalls;
}

/**
 * Clear API call history (development only)
 */
export async function clearApiCallHistory() {
    if (process.env.NEXT_PUBLIC_DEBUG_MODE !== '1') {
        throw new Error('Not available in production');
    }

    apiTracker.clear();

    return { success: true };
}

/**
 * Invalidate cache tags (development only)
 */
export async function invalidateCache(tags: string[]) {
    if (process.env.NEXT_PUBLIC_DEBUG_MODE !== '1') {
        throw new Error('Not available in production');
    }

    for (const tag of tags) {
        revalidateTag(tag, { expire: 0 });
    }

    return { success: true };
}
