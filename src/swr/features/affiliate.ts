import useSWRMutation from 'swr/mutation';

import { AffiliateProgram } from '@/interfaces/Affiliate';
import { apiEndpoints } from '@/services/server/config';

import { fetcher } from '../fetcher';
import { ErrorResponse } from '../types';

interface CheckAffiliatePayload {
    url: string;
    referer?: string;
}

export function useSendAffiliateProgramFormMutation({
    onSuccess,
    onError,
}: {
    onSuccess?: () => void;
    onError?: (error: ErrorResponse) => void;
} = {}) {
    return useSWRMutation<void, ErrorResponse, string, AffiliateProgram>(
        '/affiliate-program',
        (url, { arg }) =>
            fetcher<void>(url, {
                method: 'POST',
                body: arg,
            }),
        {
            onSuccess: () => onSuccess?.(),
            onError: (error) => onError?.(error),
        }
    );
}

export function useCheckAffiliateMutation() {
    return useSWRMutation<void, ErrorResponse, string, CheckAffiliatePayload>(
        apiEndpoints.affiliates.tracking,
        (url, { arg }) =>
            fetcher<void>(url, {
                method: 'POST',
                body: arg,
                baseUrl: '/',
            })
    );
}
