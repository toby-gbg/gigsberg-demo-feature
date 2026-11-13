'use client';

import useSWRMutation from 'swr/mutation';

import type { Login, LoginResponse, LostPassword, RegisterBody, SendOtp } from '@/interfaces/Auth';
import EmailOTP from '@/interfaces/EmailOTP';

import { fetcher } from '../fetcher';
import { ErrorResponse } from '../types';

export function useLoginMutation({
    onSuccess,
    onError,
}: {
    onSuccess: (data: LoginResponse) => void;
    onError: (error: ErrorResponse) => void;
}) {
    return useSWRMutation<LoginResponse, ErrorResponse, string, Login>(
        '/login',
        (url, { arg }) => fetcher(url, { method: 'POST', body: arg }),
        { onSuccess: (data) => onSuccess(data), onError: (error) => onError(error) }
    );
}

export function useRegisterMutation({
    onSuccess,
    onError,
}: {
    onSuccess?: (data: LoginResponse) => void;
    onError?: (error: ErrorResponse) => void;
}) {
    return useSWRMutation<LoginResponse, ErrorResponse, string, RegisterBody>(
        '/register',
        (url, { arg }) => fetcher(url, { method: 'POST', body: arg }),
        {
            onSuccess: (data) => onSuccess?.(data),
            onError: (error) => onError?.(error),
        }
    );
}

export function useResetPasswordMutation({
    onSuccess,
    onError,
}: {
    onSuccess?: () => void;
    onError?: (error: ErrorResponse) => void;
}) {
    return useSWRMutation<void, ErrorResponse, string, LostPassword>(
        '/reset-password',
        (url, { arg }) => fetcher(url, { method: 'POST', body: arg }),
        { onSuccess: () => onSuccess?.(), onError: (error) => onError?.(error) }
    );
}

export function useSendOtpMutation({
    onSuccess,
    onError,
}: {
    onSuccess?: () => void;
    onError?: (error: ErrorResponse) => void;
}) {
    return useSWRMutation<EmailOTP, ErrorResponse, string, SendOtp>(
        '/send-otp',
        (url, { arg }) => fetcher(url, { method: 'POST', body: arg }),
        {
            onSuccess: () => onSuccess?.(),
            onError: (error) => onError?.(error),
        }
    );
}

export function useLazyCheckEmailQuery({
    onSuccess,
    onError,
}: {
    onSuccess?: () => void;
    onError?: (error: ErrorResponse) => void;
}) {
    return useSWRMutation<void, ErrorResponse, string | null, string>(
        'checkEmail', // trigger key layout
        (_, { arg: email }) => fetcher(`/check/${email}`, { method: 'GET' }),
        {
            onSuccess: () => onSuccess?.(),
            onError: (error) => onError?.(error),
        }
    );
}
