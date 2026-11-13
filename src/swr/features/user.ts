'use client';

import useSWRMutation from 'swr/mutation';

import User, { UpdateUser, UpdateUserPassword } from '@/interfaces/User';

import { useUserActions } from '@/providers/UserProvider';

import { fetcher } from '../fetcher';
import { ErrorResponse } from '../types';

export function useUpdateUserMutation({
    onSuccess,
    onError,
}: {
    onSuccess?: (data: User) => void;
    onError?: (error: ErrorResponse) => void;
} = {}) {
    const { setCredentials } = useUserActions();

    return useSWRMutation<User, ErrorResponse, string, UpdateUser>(
        '/users',
        async (url, { arg: { phone, ...rest } }) => {
            const body = {
                ...rest,
                ...(phone?.nationalNumber && {
                    phone: phone.nationalNumber,
                }),
                ...(phone?.prefix && {
                    phone_prefix: phone.prefix,
                }),
            };

            const user = await fetcher<User>(url, { method: 'PUT', body });
            setCredentials({ user });

            return user;
        },
        {
            onSuccess: (data) => onSuccess?.(data),
            onError: (error) => onError?.(error),
        }
    );
}

export function useUpdatePasswordMutation({
    onSuccess,
    onError,
}: {
    onSuccess?: () => void;
    onError?: (error: ErrorResponse) => void;
} = {}) {
    return useSWRMutation<User, ErrorResponse, string, UpdateUserPassword>(
        '/users/update-password',
        (url, { arg }) => fetcher<User>(url, { method: 'POST', body: arg }),
        {
            onSuccess: () => onSuccess?.(),
            onError: (error) => onError?.(error),
        }
    );
}

export function useDeleteUserMutation({
    onSuccess,
    onError,
}: {
    onSuccess?: () => void;
    onError?: (error: ErrorResponse) => void;
} = {}) {
    return useSWRMutation<void, ErrorResponse, string, void>(
        '/users',
        async (url) => {
            await fetcher<void>(url, { method: 'DELETE', body: {} });
        },
        {
            onSuccess: () => onSuccess?.(),
            onError: (error) => onError?.(error),
        }
    );
}
