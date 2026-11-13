import useSWRMutation from 'swr/mutation';

import { NewsletterForm } from '@/interfaces/Newsletter';

import { fetcher } from '../fetcher';
import { ErrorResponse } from '../types';

export function useRegisterNewsletterMutation({
    onSuccess,
    onError,
}: {
    onSuccess?: () => void;
    onError?: (error: ErrorResponse) => void;
} = {}) {
    return useSWRMutation<void, ErrorResponse, string, NewsletterForm>(
        '/newsletter/register',
        async (url, { arg }) =>
            fetcher(url, {
                method: 'POST',
                body: arg,
            }),
        {
            onSuccess: () => onSuccess?.(),
            onError: (error) => onError?.(error),
        }
    );
}

export function useRegisterListingNotifyMutation({
    onSuccess,
    onError,
}: {
    onSuccess?: () => void;
    onError?: (error: ErrorResponse) => void;
} = {}) {
    return useSWRMutation<void, ErrorResponse, string, NewsletterForm & { eventId: number }>(
        '/newsletter/event-register',
        async (url, { arg }) =>
            fetcher(url, {
                method: 'POST',
                body: arg,
            }),
        {
            onSuccess: () => onSuccess?.(),
            onError: (error) => onError?.(error),
        }
    );
}

export function useRegisterPerformerNotifyMutation({
    onSuccess,
    onError,
}: {
    onSuccess?: () => void;
    onError?: (error: ErrorResponse) => void;
} = {}) {
    return useSWRMutation<void, ErrorResponse, string, NewsletterForm & { performerId: number }>(
        '/newsletter/performer-register',
        async (url, { arg }) =>
            fetcher(url, {
                method: 'POST',
                body: arg,
            }),
        {
            onSuccess: () => onSuccess?.(),
            onError: (error) => onError?.(error),
        }
    );
}
