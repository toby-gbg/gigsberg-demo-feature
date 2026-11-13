'use client';

import useSWRMutation from 'swr/mutation';

import { FeedbackForm, FeedbackSubmitResponse } from '@/interfaces/Feedback';
import { getClientWebsiteDomain } from '@/utils/domain';

import { fetcher } from '../fetcher';
import { ErrorResponse } from '../types';

export function useSubmitFeedbackMutation({
    onSuccess,
    onError,
}: {
    onSuccess?: (data: FeedbackSubmitResponse) => void;
    onError?: (error: ErrorResponse) => void;
} = {}) {
    return useSWRMutation<FeedbackSubmitResponse, ErrorResponse, string, FeedbackForm>(
        '/feedback',
        async (url, { arg: formData }) => {
            const hostname = getClientWebsiteDomain(window.location.host);

            return fetcher<FeedbackSubmitResponse>(url, {
                method: 'POST',
                headers: {
                    'x-website-domain': hostname,
                    'Content-Type': 'application/json',
                },
                body: formData,
            });
        },
        {
            onSuccess: (data) => onSuccess?.(data),
            onError: (error) => onError?.(error),
        }
    );
}
