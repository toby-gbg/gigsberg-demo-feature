'use client';

import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import useSWRMutation from 'swr/mutation';

import AccountSettingOrder, {
    AccountSettingOrderFilters,
} from '@/interfaces/account-settings/AccountSettingOrder';
import { AdditionalInformationResponse } from '@/interfaces/AdditionalInformation';
import { AttendeeDetailsSubmitRequest } from '@/interfaces/AttendeeDetails';
import { FastifyPagination } from '@/interfaces/Fetch';
import { MobileAppOptionsResponse } from '@/interfaces/Order';
import { SubmitXS2Condition } from '@/constants/attendee';

import { baseApi, fetcher } from '../fetcher';
import { ErrorResponse, SWRParams } from '../types';
import { createInfiniteResult } from '../utils';

export type AccountOrdersKey =
    readonly [string, AccountSettingOrderFilters, number | undefined] | null;

export function useAccountOrders(filters: AccountSettingOrderFilters = {}, userId?: number) {
    const getKey = (
        pageIndex: number,
        prev: FastifyPagination<AccountSettingOrder> | null
    ): AccountOrdersKey => {
        if (prev && !prev.hasMore) return null;
        return [
            '/orders',
            {
                ...filters,
                pageNumber: pageIndex + 1,
            },
            userId,
        ];
    };

    const swr = useSWRInfinite<
        FastifyPagination<AccountSettingOrder>,
        ErrorResponse,
        typeof getKey
    >(getKey, ([url, params]) => fetcher(url, { params: params as SWRParams }), {
        revalidateIfStale: false,
        revalidateFirstPage: false,
    });

    return createInfiniteResult(
        swr,
        null,
        (page) => page.rows,
        (page) => page.hasMore
    );
}

export function useExtraInfoSchema(orderId: number | null) {
    const { data, error, isLoading, isValidating, mutate } = useSWR<
        AdditionalInformationResponse,
        ErrorResponse
    >(orderId ? [`/orders/${orderId}/extra-info-schema`, orderId] : null, ([url]) => fetcher(url));

    return {
        data: data ?? null,
        isLoading,
        isValidating,
        isError: !!error,
        error: error ?? null,
        mutate,
    };
}

export function useMobileAppOptions(countryId?: number) {
    const { data, error, isLoading, isValidating, mutate } = useSWR<
        FastifyPagination<MobileAppOptionsResponse>,
        ErrorResponse,
        [string, { countryId?: number }]
    >(['/mobile-ticket-apps', { countryId }], ([url, params]) =>
        fetcher(url, {
            params: {
                pageSize: 9999,
                active: 1,
                ...(params.countryId ? { country_id: params.countryId } : {}),
            } as SWRParams,
        })
    );

    return {
        data: data ?? null,
        isLoading,
        isValidating,
        isError: !!error,
        error: error ?? null,
        mutate,
    };
}

export function useUploadOrderTicketMutation({
    onSuccess,
    onError,
}: {
    onSuccess?: () => void;
    onError?: (error: ErrorResponse) => void;
} = {}) {
    return useSWRMutation<void, ErrorResponse, string, { orderId: number; files: FileList }>(
        'uploadOrderTicket',
        async (_, { arg: { orderId, files } }) => {
            const body = new FormData();
            Array.from(files).forEach((file, index) => {
                body.append(`tickets[${index}]`, file);
            });
            await baseApi(`/orders/${orderId}/upload-tickets`, {
                method: 'PUT',
                body,
                retry: 0,
            });
        },
        {
            onSuccess: () => onSuccess?.(),
            onError: (error) => onError?.(error),
        }
    );
}

export function useLazyExtraInfoSchema({
    onSuccess,
    onError,
}: {
    onSuccess?: (data: AdditionalInformationResponse) => void;
    onError?: (error: ErrorResponse) => void;
} = {}) {
    return useSWRMutation<
        AdditionalInformationResponse,
        ErrorResponse,
        string,
        number // orderId
    >(
        'extraInfoSchema',
        async (_, { arg: orderId }) => {
            return fetcher<AdditionalInformationResponse>(`/orders/${orderId}/extra-info-schema`);
        },
        {
            onSuccess: (data) => onSuccess?.(data),
            onError: (error) => onError?.(error),
        }
    );
}

export function useSubmitExtraInfoMutation({
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
        { orderId: number; extraInformation: Record<string, string>[] }
    >(
        'submitExtraInfo',
        (_, { arg: { orderId, extraInformation } }) =>
            fetcher(`/orders/${orderId}/extra-info`, {
                method: 'POST',
                body: { extraInformation },
            }),
        {
            onSuccess: () => onSuccess?.(),
            onError: (error) => onError?.(error),
        }
    );
}

export function useSubmitExtraInfoWithTokenMutation({
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
            token: string;
            orderId: number;
            extraInformation: Record<string, string>[];
        }
    >(
        'submitExtraInfoWithToken',
        async (_, { arg: { token, orderId, extraInformation } }) => {
            await baseApi(`/orders/${orderId}/extra-info-with-token`, {
                method: 'POST',
                json: { extraInformation },
                headers: { 'x-extra-info-token': token },
            });
        },
        {
            onSuccess: () => onSuccess?.(),
            onError: (error) => onError?.(error),
        }
    );
}

export function useSubmitAttendeeDetailsByOrderIdMutation({
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
        { orderId: number; body: Partial<AttendeeDetailsSubmitRequest> }
    >(
        'submitAttendeeDetailsByOrderId',
        async (_, { arg: { orderId, body } }) => {
            await fetcher(`/orders/${orderId}/guest-data`, {
                method: 'POST',
                body: {
                    condition: SubmitXS2Condition.PRE_DOWNLOAD,
                    ...body,
                },
            });
        },
        {
            onSuccess: () => onSuccess?.(),
            onError: (error) => onError?.(error),
        }
    );
}

export async function downloadOrderTicket(orderId: number): Promise<void> {
    const response = await baseApi(`/orders/${orderId}/download-tickets`, {
        method: 'GET',
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Download failed: ${response.status} - ${errorText}`);
    }

    const blob = await response.blob();
    const contentDisposition = response.headers.get('Content-Disposition');
    const filenameMatch = contentDisposition?.match(/filename="?([^"]+)"?/);
    const filename = filenameMatch?.[1] || `${orderId}.pdf`;

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
}

export function useDownloadOrderTicketMutation({
    onSuccess,
    onError,
}: {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
} = {}) {
    return useSWRMutation<void, Error, string, number>(
        'downloadOrderTicket',
        async (_, { arg: orderId }) => {
            await downloadOrderTicket(orderId);
        },
        {
            onSuccess: () => onSuccess?.(),
            onError: (error) => onError?.(error),
        }
    );
}
