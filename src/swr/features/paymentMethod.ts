import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

import PaymentMethod, { PaymentMethodFormSubmit } from '@/interfaces/PaymentMethod';

import { fetcher } from '../fetcher';
import { ErrorResponse } from '../types';

export function useGetPaymentMethodQuery(userId?: number) {
    return useSWR<PaymentMethod[], ErrorResponse, [string, number | undefined]>(
        ['/payment-method', userId],
        ([url]) =>
            fetcher<PaymentMethod[]>(url, {
                method: 'GET',
            }),
        {
            revalidateOnMount: true,
        }
    );
}

export function useStorePaymentMethodMutation({
    userId,
    onSuccess,
    onError,
}: {
    userId?: number;
    onSuccess?: (data: PaymentMethod) => void;
    onError?: (error: ErrorResponse) => void;
} = {}) {
    return useSWRMutation<
        PaymentMethod,
        ErrorResponse,
        [string, number | undefined],
        PaymentMethodFormSubmit
    >(
        ['/payment-method', userId],
        ([url], { arg }) =>
            fetcher<PaymentMethod>(url, {
                method: 'POST',
                body: arg,
            }),
        {
            onSuccess: async (data) => {
                onSuccess?.(data);
            },
            onError: (error) => onError?.(error),
        }
    );
}

export function useUpdatePaymentMethodMutation({
    userId,
    onSuccess,
    onError,
}: {
    userId?: number;
    onSuccess?: (data: PaymentMethod) => void;
    onError?: (error: ErrorResponse) => void;
} = {}) {
    return useSWRMutation<
        PaymentMethod,
        ErrorResponse,
        [string, number | undefined],
        { id: number; body: PaymentMethodFormSubmit }
    >(
        ['/payment-method', userId],
        ([url], { arg }) =>
            fetcher<PaymentMethod>(`${url}/${arg.id}`, {
                method: 'PUT',
                body: arg.body,
            }),
        {
            onSuccess: async (data) => {
                onSuccess?.(data);
            },
            onError: (error) => onError?.(error),
        }
    );
}

export function useDeletePaymentMethodMutation({
    userId,
    onSuccess,
    onError,
}: {
    userId?: number;
    onSuccess?: () => void;
    onError?: (error: ErrorResponse) => void;
} = {}) {
    return useSWRMutation<void, ErrorResponse, [string, number | undefined], number>(
        ['/payment-method', userId],
        ([url], { arg: id }) =>
            fetcher(`${url}/${id}`, {
                method: 'DELETE',
                body: {},
            }),
        {
            onSuccess: async () => {
                onSuccess?.();
            },
            onError: (error) => onError?.(error),
        }
    );
}
