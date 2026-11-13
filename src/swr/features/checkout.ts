import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

import { CheckoutPaymentIntent, CheckoutPaymentIntentForm } from '@/interfaces/Checkout';
import { CouponForm, CouponInfo } from '@/interfaces/Coupon';
import {
    ListingCheckout,
    ListingCheckoutParams,
    ListingCheckoutResponse,
} from '@/interfaces/Listing';
import {
    SpreedlyApmPurchaseRequest,
    SpreedlyPurchaseRequest,
    SpreedlyPurchaseResponse,
    SpreedlyTransactionResponse,
} from '@/interfaces/Spreedly';
import { getRoundUpDifference } from '@/utils/common';

import { fetcher } from '../fetcher';
import { ErrorResponse } from '../types';

export function useGetCheckoutListingQuery(
    listingId?: number,
    params?: ListingCheckoutParams,
    fallbackData?: ListingCheckout,
    userId?: number | string
) {
    return useSWR<ListingCheckout, ErrorResponse>(
        listingId
            ? [
                  '/checkout',
                  listingId,
                  params?.quantity,
                  params?.countryId,
                  params?.couponCode,
                  userId ?? null,
              ]
            : null,
        async ([url, id]) => {
            const data = await fetcher<ListingCheckoutResponse>(`${url}/${id}`, {
                params: { ...(params ?? {}) },
            });
            return { ...data, specialOlympicsPrice: getRoundUpDifference(data.totalPrice) };
        },
        {
            keepPreviousData: true,
            fallbackData,
            revalidateOnMount: false, // trust the server data on first mount
        }
    );
}

export function useGetCouponQuery({
    onSuccess,
    onError,
}: {
    onSuccess?: (data: CouponInfo) => void;
    onError?: (error: ErrorResponse) => void;
} = {}) {
    return useSWRMutation<CouponInfo, ErrorResponse, string, CouponForm>(
        '/coupons',
        async (url, { arg }) => {
            const { couponCode, currencyCode, totalAmount, vat } = arg;

            return fetcher<CouponInfo>(url + '/' + couponCode, {
                params: {
                    currencyCode,
                    totalAmount,
                    vat,
                },
            });
        },
        {
            onSuccess: (data) => onSuccess?.(data),
            onError: (error) => onError?.(error),
        }
    );
}

export function useLoadPaymentIntentMutation({
    onSuccess,
    onError,
}: {
    onSuccess?: (data: CheckoutPaymentIntent) => void;
    onError?: (error: ErrorResponse) => void;
} = {}) {
    return useSWRMutation<
        CheckoutPaymentIntent,
        ErrorResponse,
        string,
        [number, CheckoutPaymentIntentForm]
    >(
        '/checkout/paymentIntent',
        async (_, { arg: [listingId, body] }) =>
            fetcher<CheckoutPaymentIntent>('/checkout/' + listingId + '/paymentIntent', {
                method: 'POST',
                body,
                timeout: 30000,
            }),
        { onSuccess: (data) => onSuccess?.(data), onError: (error) => onError?.(error) }
    );
}

export function useSignUrlMutation({
    onSuccess,
    onError,
}: {
    onSuccess?: (data: { url: string }) => void;
    onError?: (error: ErrorResponse) => void;
} = {}) {
    return useSWRMutation<{ url: string }, ErrorResponse, string, { url: string }>(
        '/checkout/sign-url',
        (url, { arg }) =>
            fetcher<{ url: string }>(url, {
                method: 'POST',
                body: arg,
            }),
        { onSuccess: (data) => onSuccess?.(data), onError: (error) => onError?.(error) }
    );
}

export function useSpreedlyPurchaseMutation({
    onSuccess,
    onError,
}: {
    onSuccess?: (data: SpreedlyPurchaseResponse) => void;
    onError?: (error: ErrorResponse) => void;
} = {}) {
    return useSWRMutation<SpreedlyPurchaseResponse, ErrorResponse, string, SpreedlyPurchaseRequest>(
        '/spreedly/purchase',
        (url, { arg }) =>
            fetcher<SpreedlyPurchaseResponse>(url, {
                method: 'POST',
                body: arg,
                timeout: 60000,
            }),
        { onSuccess: (data) => onSuccess?.(data), onError: (error) => onError?.(error) }
    );
}

export function useSpreedlyPurchaseApmMutation({
    onSuccess,
    onError,
}: {
    onSuccess?: (data: SpreedlyPurchaseResponse) => void;
    onError?: (error: ErrorResponse) => void;
} = {}) {
    return useSWRMutation<
        SpreedlyPurchaseResponse,
        ErrorResponse,
        string,
        SpreedlyApmPurchaseRequest
    >(
        '/spreedly/purchase-apm',
        (url, { arg }) =>
            fetcher<SpreedlyPurchaseResponse>(url, {
                method: 'POST',
                body: arg,
                timeout: 60000,
            }),
        { onSuccess: (data) => onSuccess?.(data), onError: (error) => onError?.(error) }
    );
}

export function useSpreedlyEnquiryTransactionMutation({
    onSuccess,
    onError,
}: {
    onSuccess?: (data: SpreedlyTransactionResponse) => void;
    onError?: (error: ErrorResponse) => void;
} = {}) {
    return useSWRMutation<SpreedlyTransactionResponse, ErrorResponse, string, { token: string }>(
        '/spreedly/transaction',
        (_, { arg }) =>
            fetcher<SpreedlyTransactionResponse>('/spreedly/transaction/' + arg.token, {
                method: 'GET',
                timeout: 30000,
            }),
        { onSuccess: (data) => onSuccess?.(data), onError: (error) => onError?.(error) }
    );
}

export function useCompleteZeroPayOrderMutation({
    onSuccess,
    onError,
}: {
    onSuccess?: (data: CheckoutPaymentIntent) => void;
    onError?: (error: ErrorResponse) => void;
} = {}) {
    return useSWRMutation<
        CheckoutPaymentIntent,
        ErrorResponse,
        string,
        [number, { paymentIntentId: string }]
    >(
        '/checkout/completeZeroPayOrder',
        async (_, { arg: [listingId, body] }) =>
            fetcher<CheckoutPaymentIntent>('/checkout/' + listingId + '/completeZeroPayOrder', {
                method: 'POST',
                body,
                timeout: 30000,
            }),
        { onSuccess: (data) => onSuccess?.(data), onError: (error) => onError?.(error) }
    );
}
