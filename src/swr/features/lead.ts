import useSWRMutation from 'swr/mutation';

import { AttendeeDetailsSubmitRequest } from '@/interfaces/AttendeeDetails';
import IStoreLead, { Lead } from '@/interfaces/Lead';
import { SubmitXS2Condition } from '@/constants/attendee';

import { fetcher } from '../fetcher';
import { ErrorResponse } from '../types';

export function useStoreLeadMutation({
    onSuccess,
    onError,
}: {
    onSuccess?: (data: Lead) => void;
    onError?: (error: ErrorResponse) => void;
} = {}) {
    return useSWRMutation<Lead, ErrorResponse, string, IStoreLead>(
        '/leads',
        async (url, { arg }) => {
            const { quantity, affiliateId, ...body } = arg;

            return fetcher<Lead>(url, {
                method: 'POST',
                body: {
                    ...body,
                    quantity: parseInt(quantity),
                    ...(affiliateId && {
                        affiliateId: parseInt(affiliateId),
                    }),
                },
            });
        },
        {
            onSuccess: (data) => onSuccess?.(data),
            onError: (error) => onError?.(error),
        }
    );
}

export function useSubmitAttendeeDetailsByLeadIdMutation({
    onSuccess,
    onError,
}: {
    onSuccess?: () => void;
    onError?: (error: ErrorResponse) => void;
} = {}) {
    return useSWRMutation<
        void,
        ErrorResponse,
        string,
        {
            leadId: number;
            body: Partial<AttendeeDetailsSubmitRequest>;
        }
    >(
        '/leads/guest-data',
        async (_, { arg }) => {
            return fetcher<void>(`/leads/${arg.leadId}/guest-data`, {
                method: 'POST',
                body: {
                    condition: SubmitXS2Condition.PRE_CHECKOUT,
                    ...arg.body,
                },
            });
        },
        {
            onSuccess: () => onSuccess?.(),
            onError: (error) => onError?.(error),
        }
    );
}
