'use client';

import useSWRMutation from 'swr/mutation';

import { MetaEventData } from '@/interfaces/tracking';

import { fetcher } from '../fetcher';
import { ErrorResponse } from '../types';

export function useMetaTracking(props?: {
    onSuccess?: () => void;
    onError?: (error: ErrorResponse) => void;
}) {
    const { onSuccess, onError } = props || {};

    return useSWRMutation<void, ErrorResponse, string, MetaEventData>(
        '/meta/track-event',
        (url, { arg }) =>
            fetcher(url, {
                method: 'POST',
                body: arg,
            }),
        { onSuccess: () => onSuccess?.(), onError: (error) => onError?.(error) }
    );
}
